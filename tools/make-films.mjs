// Makes cinematic MP4 films from Gohar's own renders and photos.
// Slow camera moves (push-in, pull-out, pans) with soft crossfades.
// Usage: node tools/make-films.mjs            -> all films
//        node tools/make-films.mjs hero gohar-gateway  -> only these
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

const IMG = 'assets/img';
const OUT = 'assets/video';
fs.mkdirSync(OUT, { recursive: true });

const films = {
  hero: { size: [1920, 1080], clip: 4.6, imgs: [
    'gohar-gateway/exterior.webp', '141-broadway-heights/dusk.jpg', 'gohar-golf-vista/golf-course.webp',
    'gohar-residencia-shopping-mall/render-010.webp', 'gohar-gateway/aerial-courtyard.webp',
    '141-broadway-heights/rooftop-pool.jpg', 'kn-gohar-green-city/photo-lawn.jpg'] },
  about: { size: [1600, 900], clip: 5, imgs: [
    'gohar-towers/towers-sky.jpg', 'gohar-villas/gate.jpg', 'kn-gohar-green-city/photo-club-house.jpg', 'gohar-golf-vista/towers-aerial.webp'] },
  '141-broadway-heights': { imgs: ['141-broadway-heights/dusk.jpg', '141-broadway-heights/rooftop-pool.jpg', '141-broadway-heights/living.jpg', '141-broadway-heights/terrace.jpg'] },
  'gohar-gateway': { imgs: ['gohar-gateway/exterior.webp', 'gohar-gateway/aerial-courtyard.webp', 'gohar-gateway/hotel-tower.jpg', 'gohar-gateway/courtyard.jpg'] },
  'gohar-golf-vista': { imgs: ['gohar-golf-vista/exterior.webp', 'gohar-golf-vista/golf-course.webp', 'gohar-golf-vista/towers-aerial.webp', 'gohar-golf-vista/balconies.webp'] },
  'gohar-residencia-shopping-mall': { imgs: ['gohar-residencia-shopping-mall/render-010.webp', 'gohar-residencia-shopping-mall/street-view.jpg', 'gohar-residencia-shopping-mall/aerial.jpg', 'gohar-residencia-shopping-mall/render-005.webp'] },
  'gohar-towers': { imgs: ['gohar-towers/towers-sky.jpg', 'gohar-towers/exterior.jpg', 'gohar-towers/towers-sky.jpg'] },
  'gohar-complex-shopping-mall': { imgs: ['gohar-complex-shopping-mall/exterior.jpg', 'gohar-complex-shopping-mall/exterior.jpg', 'gohar-complex-shopping-mall/exterior.jpg'] },
  'gohar-green-corner-shopping-center': { imgs: ['gohar-green-corner-shopping-center/exterior.jpg', 'gohar-green-corner-shopping-center/street-view.jpg', 'gohar-green-corner-shopping-center/brochure-exterior.jpg'] },
  'gohar-rabi-center': { imgs: ['gohar-rabi-center/day-view.jpg', 'gohar-rabi-center/day-view.jpg', 'gohar-rabi-center/day-view.jpg'] },
  'gohar-villas': { imgs: ['gohar-villas/gate.jpg', 'gohar-villas/gate-approach.webp', 'gohar-villas/park.jpg', 'gohar-villas/commercial-area.webp'] },
  'kn-gohar-green-city': { imgs: ['kn-gohar-green-city/view-3.jpg', 'kn-gohar-green-city/photo-lawn.jpg', 'kn-gohar-green-city/photo-club-house.jpg', 'kn-gohar-green-city/photo-garden-walk.jpg'] },
};

const FPS = 30, FADE = 1;
// Camera moves. zoompan works on an up-scaled frame so motion stays smooth.
const moves = [
  (n) => `z='1+0.16*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,          // push in
  (n) => `z='1.14':x='(iw-iw/zoom)*on/${n}':y='ih/2-(ih/zoom/2)'`,                 // pan right
  (n) => `z='1.18-0.16*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,       // pull out
  (n) => `z='1.14':x='(iw-iw/zoom)*(1-on/${n})':y='(ih-ih/zoom)*0.4'`,             // pan left
  (n) => `z='1.08+0.1*on/${n}':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(1-on/${n})'`, // rise
];

function make(name, f) {
  const [W, H] = f.size || [1280, 720];
  const clip = f.clip || 4.4;
  const n = Math.round(clip * FPS);
  const S = 3; // up-scale factor
  const args = ['-y'];
  f.imgs.forEach((img) => args.push('-i', path.join(IMG, img)));
  const parts = [];
  f.imgs.forEach((_, i) => {
    const mv = moves[(i + name.length) % moves.length](n);
    parts.push(`[${i}:v]scale=${W * S}:${H * S}:force_original_aspect_ratio=increase,crop=${W * S}:${H * S},` +
      `zoompan=${mv}:d=${n}:s=${W}x${H}:fps=${FPS},eq=contrast=1.04:saturation=0.92,setsar=1,format=yuv420p[c${i}]`);
  });
  let last = 'c0', t = clip;
  for (let i = 1; i < f.imgs.length; i++) {
    const off = (t - FADE).toFixed(2);
    parts.push(`[${last}][c${i}]xfade=transition=fade:duration=${FADE}:offset=${off}[x${i}]`);
    last = `x${i}`; t = t + clip - FADE;
  }
  const out = path.join(OUT, `${name}.mp4`);
  args.push('-filter_complex', parts.join(';'), '-map', `[${last}]`, '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', W > 1280 ? '28' : '29', '-maxrate', W > 1280 ? '3.2M' : '2M', '-bufsize', '6M', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
  const start = Date.now();
  const r = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (r.status !== 0) { console.log('FAILED', name, r.stderr.toString().slice(-1500)); return; }
  // poster frame for fast first paint
  spawnSync(ffmpeg, ['-y', '-ss', '0.5', '-i', out, '-frames:v', '1', '-q:v', '4', path.join(OUT, `${name}.jpg`)]);
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`${name}: ${t.toFixed(1)}s, ${mb} MB, ${((Date.now() - start) / 1000).toFixed(0)}s to render`);
}

const only = process.argv.slice(2);
for (const [name, f] of Object.entries(films)) if (!only.length || only.includes(name)) make(name, f);
