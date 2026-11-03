// Makes lighter, responsive WebP copies of every photo/render for cards and galleries.
// Originals stay untouched (used for full-screen lightbox and as the largest srcset size).
// Output: assets/img/<group>/_w/<name>-800.webp and -1600.webp
// Usage: node tools/optimize-images.mjs   (skips files that already exist)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

export const WIDTHS = [800, 1600];
const IMG = 'assets/img';
let made = 0, skipped = 0, failed = 0;
for (const group of fs.readdirSync(IMG)) {
  if (group === 'brand') continue;
  const dir = path.join(IMG, group);
  if (!fs.statSync(dir).isDirectory()) continue;
  fs.mkdirSync(path.join(dir, '_w'), { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const base = f.replace(/\.\w+$/, '');
    for (const w of WIDTHS) {
      const out = path.join(dir, '_w', `${base}-${w}.webp`);
      if (fs.existsSync(out)) { skipped++; continue; }
      const r = spawnSync(ffmpeg, ['-y', '-i', path.join(dir, f), '-vf', `scale='min(${w},iw)':-2:flags=lanczos`, '-c:v', 'libwebp', '-quality', '74', '-compression_level', '6', out], { stdio: ['ignore', 'ignore', 'pipe'] });
      if (r.status === 0) made++; else { failed++; console.log('FAILED', out, r.stderr.toString().slice(-300)); }
    }
  }
}
console.log(`responsive images: ${made} made, ${skipped} already there, ${failed} failed`);
