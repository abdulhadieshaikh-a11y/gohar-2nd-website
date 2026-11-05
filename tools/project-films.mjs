// Cuts the project films, the Projects/About page header films and gallery stills from Gohar's own videos in _incoming-videos/.
// Output: assets/video/projects/<name>.mp4 (wide 1600x900), <name>-card.mp4 (card), <name>-m.mp4 (phone, upright), <name>.jpg / <name>-m.jpg posters
//         assets/img/<slug>/film-NN.jpg stills (run `npm run images` afterwards for the resized WebP copies)
// Usage: node tools/project-films.mjs [name]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, '_incoming-videos');
const OUT = path.join(ROOT, 'assets/video/projects');
fs.mkdirSync(OUT, { recursive: true });
const SRC = {
  C: 'Gohar Complex - Video.mp4', G: 'Gohar Golf Vista - Video (22 Aug).mp4', N: 'Gohar Green City - Video (27 Aug).mp4',
  R: 'Gohar Residencia - Video (28 Aug).mp4', V: 'Gohar Villas - Video New (18 Aug).mp4', T: 'Gohar Tower.mp4',
};
// [source, start, seconds]. Times chosen by reviewing every video second by second (no captions, dissolves, end cards or talking).
const PLAN = {
  'gohar-complex-shopping-mall': { shots: [['C', 3.2, 4.8], ['C', 27, 5.5], ['C', 36, 6], ['C', 62.2, 2.6], ['C', 69, 3.5], ['C', 74.5, 4.5]], stills: [['C', 4.5], ['C', 29.5], ['C', 38.5], ['C', 70], ['C', 76]] },
  'gohar-golf-vista': { shots: [['G', 1.5, 5.5], ['G', 8.5, 5], ['G', 15.5, 4], ['G', 33, 4], ['G', 45, 4.5], ['G', 55, 4.5]], stills: [['G', 4], ['G', 33], ['G', 47], ['G', 57], ['G', 64], ['G', 16.5]] },
  'kn-gohar-green-city': { shots: [['N', 1, 6], ['N', 8.5, 6], ['N', 33.5, 5], ['N', 54, 6], ['N', 72, 5], ['N', 124, 5]], stills: [['N', 1], ['N', 11], ['N', 36], ['N', 48], ['N', 74], ['N', 100]] },
  'gohar-villas': { shots: [['V', 0.8, 3.5], ['V', 10, 6], ['V', 19, 7], ['V', 35, 5], ['V', 47.5, 6], ['V', 56.2, 2.6], ['V', 60.5, 5]], stills: [['V', 1.5], ['V', 12], ['V', 37], ['V', 49], ['V', 57], ['V', 62], ['V', 68]] },
  // the half-built structure first, then the finished sample apartment, then the model of the completed towers
  'gohar-residencia-shopping-mall': { shots: [['R', 78, 6], ['R', 46.4, 6], ['R', 99, 3], ['R', 103.3, 2.2], ['R', 106.3, 2.7], ['R', 130.2, 5]], stills: [['R', 80], ['R', 49], ['R', 131], ['R', 100.5], ['R', 104.3]] },
  // filmed upright: kept upright everywhere (no stretching or blur)
  'gohar-towers': { tall: true, fade: 0.5, shots: [['T', 40, 2.8], ['T', 70.1, 2.2], ['T', 26.3, 2.6], ['T', 30.2, 1.8]], stills: [['T', 40.5], ['T', 71], ['T', 30.5], ['T', 29]] },
  // page header films (different shots on each page)
  '_projects-hero': { shots: [['N', 1, 5.5], ['G', 8.5, 5], ['V', 47.5, 5.5], ['C', 27, 5.5], ['R', 78, 5.5], ['V', 19, 5.5]] },
  // home page video band ("Built with clarity") and the site footer ("Let’s find your next address")
  '_band': { shots: [['N', 53.5, 9]] },
  '_footer': { shots: [['C', 42.6, 7.2]] },
  '_about-hero': { shots: [['N', 124, 5], ['G', 15.5, 4], ['C', 74.5, 4.5], ['N', 54, 5.5], ['G', 55, 4.5], ['V', 35, 5], ['R', 46.4, 5]] },
};
const GRADE = 'eq=contrast=1.07:brightness=-0.02:saturation=1.1:gamma=0.96,colorbalance=rs=0.025:gs=0.005:bs=-0.03:rh=0.02:bh=-0.02';
const LOGO = 'crop=1632:918:288:81'; // removes the project logo printed in the top-left corner of the landscape videos

const run = (args) => { const r = spawnSync(ffmpeg, ['-nostdin', '-v', 'error', '-y', ...args], { encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); };

function geo(src, W, H) {
  if (src === 'T') { // upright footage (1080x1920)
    if (H > W) return `scale=${W}:${H}:flags=lanczos`;
    return `crop=1080:${Math.round(1080 * H / W)}:0:(ih-oh)/2,scale=${W}:${H}:flags=lanczos`; // landscape card: centre band, no upscaling
  }
  if (W > H) return `${LOGO},scale=${W}:${H}:flags=lanczos`;
  return `crop=608:1080:(iw-608)/2:0,scale=${W}:${H}:flags=lanczos`;
}

function film(shots, W, H, file, crf, maxrate, F = 0.6) {
  const args = [];
  shots.forEach(([s, ss, d]) => args.push('-ss', String(ss), '-t', String(d), '-i', path.join(IN, SRC[s])));
  const parts = shots.map(([s, , d], i) => `[${i}:v]fps=30,${geo(s, W, H)},setsar=1,format=yuv420p,${GRADE},unsharp=5:5:0.4,trim=duration=${d},setpts=PTS-STARTPTS[v${i}]`);
  let prev = 'v0', t = shots[0][2]; const chain = [];
  for (let i = 1; i < shots.length; i++) { const off = +(t - F).toFixed(2); chain.push(`[${prev}][v${i}]xfade=transition=fade:duration=${F}:offset=${off}[x${i}]`); prev = `x${i}`; t = off + shots[i][2]; }
  run([...args, '-filter_complex', [...parts, ...chain].join(';'), '-map', `[${prev}]`, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-maxrate', maxrate, '-bufsize', String(parseInt(maxrate) * 2) + 'k', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, file)]);
  return t;
}
const poster = (file, out) => run(['-ss', '0.8', '-i', path.join(OUT, file), '-frames:v', '1', '-q:v', '3', path.join(OUT, out)]);

/* Upright footage on wide screens: three upright shots side by side (a split screen), each at full sharpness,
   filling the whole frame. rounds = [[panel, panel, panel], ...]; panel = [source, start, seconds]; every panel is
   stretched or trimmed to `len` seconds, and rounds cross-fade into each other. */
function triptych(rounds, W, H, file, crf, maxrate, len = 3, F = 0.6) {
  const pw = Math.ceil(W / 6) * 2, gap = Math.max(2, Math.round(W / 480));
  const args = [], parts = [];
  let n = 0;
  rounds.forEach((panels, r) => {
    const ins = panels.map(([s, ss, d]) => {
      args.push('-ss', String(ss), '-t', String(d), '-i', path.join(IN, SRC[s]));
      const i = n++, slow = (len / d).toFixed(4);
      parts.push(`[${i}:v]fps=30,scale=${pw}:-2:flags=lanczos,crop=${pw}:${H}:0:(ih-${H})/2,setpts=${slow}*(PTS-STARTPTS),fps=30,trim=duration=${len},setpts=PTS-STARTPTS,setsar=1[p${i}]`);
      return `[p${i}]`;
    });
    parts.push(`${ins.join('')}hstack=inputs=3,crop=${W}:${H}:0:0,drawbox=x=${pw - gap / 2}:y=0:w=${gap}:h=${H}:color=0x0e0d0a:t=fill,drawbox=x=${2 * pw - gap / 2}:y=0:w=${gap}:h=${H}:color=0x0e0d0a:t=fill,format=yuv420p,${GRADE},unsharp=5:5:0.35[r${r}]`);
  });
  let prev = 'r0', t = len;
  for (let r = 1; r < rounds.length; r++) { const off = +(t - F).toFixed(2); parts.push(`[${prev}][r${r}]xfade=transition=fade:duration=${F}:offset=${off}[y${r}]`); prev = `y${r}`; t = off + len; }
  run([...args, '-filter_complex', parts.join(';'), '-map', `[${prev}]`, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-maxrate', maxrate, '-bufsize', String(parseInt(maxrate) * 2) + 'k', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, file)]);
  return t;
}
// Gohar Towers, wide screens: two rounds of three upright shots
const TOWERS_TRI = [
  [['T', 40, 2.8], ['T', 70.1, 2.2], ['T', 26.3, 2.6]],   // expressway drone · tower · balcony
  [['T', 26.3, 2.6], ['T', 40, 2.8], ['T', 30.2, 1.8]],   // balcony · expressway drone · lounge
];

const only = process.argv[2];
for (const [name, { shots, stills = [], tall, fade }] of Object.entries(PLAN)) {
  if (only && only !== name) continue;
  let len;
  if (tall) { // upright film: split-screen wide versions, upright phone version
    len = triptych(TOWERS_TRI, 1600, 900, `${name}.mp4`, 22, '3200k', 3.2);
    triptych(TOWERS_TRI, 960, 540, `${name}-card.mp4`, 25, '1300k', 3.2);
    film(shots, 540, 960, `${name}-m.mp4`, 25, '1300k', fade);
    // short split-screen piece used in the home page film
    triptych([TOWERS_TRI[0]], 1920, 1080, `_towers-tri-hero.mp4`, 16, '9000k', 2.8);
  } else {
    len = film(shots, 1600, 900, `${name}.mp4`, 25, '2600k', fade);
    if (!name.startsWith('_')) film(shots, 960, 540, `${name}-card.mp4`, 27, '1000k', fade);
    film(shots, 540, 960, `${name}-m.mp4`, 26, '1100k', fade);
  }
  poster(`${name}.mp4`, `${name}.jpg`); poster(`${name}-m.mp4`, `${name}-m.jpg`);
  const dir = path.join(ROOT, 'assets/img', name);
  stills.forEach(([s, t], i) => {
    const vf = s === 'T' ? `${GRADE},unsharp=5:5:0.3` : `${LOGO},scale=1920:1080:flags=lanczos,${GRADE},unsharp=5:5:0.35`;
    run(['-ss', String(t), '-i', path.join(IN, SRC[s]), '-frames:v', '1', '-vf', vf, '-q:v', '2', path.join(dir, `film-${String(i + 1).padStart(2, '0')}.jpg`)]);
  });
  const mb = (f) => fs.existsSync(path.join(OUT, f)) ? (fs.statSync(path.join(OUT, f)).size / 1e6).toFixed(1) : '-';
  console.log(`${name}: ${len.toFixed(1)} s · ${mb(name + '.mp4')} / ${mb(name + '-card.mp4')} / ${mb(name + '-m.mp4')} MB · ${stills.length} stills`);
}
