// Cleans up and sharpens the project photos/renders so they read crisp on large screens.
// - removes JPEG/WebP compression noise (light denoise)
// - restores edge detail (two-pass unsharp: fine detail + local contrast)
// - gentle contrast / colour lift
// Floor plans, master plans and logos are left untouched.
// Originals are copied once to _originals/img/ so this can be re-run or undone.
// Usage: node tools/enhance-images.mjs [--force]   then: npm run images (rebuilds the _w web copies)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

const IMG = 'assets/img';
const BACKUP = '_originals/img'; // outside assets/, so it is never used by the site
const SKIP = /(^|\/)(plan-|masterplan|master-layout|brand\/|_w\/|_original\/)/;
const force = process.argv.includes('--force');

const FILTER = [
  'pp=hb/vb/dr',                        // remove JPEG block artefacts
  'nlmeans=s=1.6:p=5:r=9',              // gentle denoise (compression noise / grain)
  'unsharp=5:5:0.85:5:5:0',              // fine detail
  'unsharp=13:13:0.25:13:13:0',          // local contrast ("clarity")
  'eq=contrast=1.05:saturation=1.07:gamma=0.985',
].join(',');

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f).replace(/\\/g, '/');
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(jpe?g|webp)$/i.test(f) && !SKIP.test(p.slice(IMG.length + 1))) files.push(p);
  }
})(IMG);

let done = 0, skipped = 0, failed = 0;
// Windows can briefly lock a file that a local server is reading: retry a few times
function replace(tmp, f) {
  for (let i = 0; i < 20; i++) {
    try { fs.copyFileSync(tmp, f); fs.unlinkSync(tmp); return true; }
    catch { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); }
  }
  try { fs.unlinkSync(tmp); } catch {}
  return false;
}
for (const f of files) {
  const rel = f.slice(IMG.length + 1);
  const orig = path.join(BACKUP, rel);
  if (fs.existsSync(orig) && !force) { skipped++; continue; }
  if (!fs.existsSync(orig)) { fs.mkdirSync(path.dirname(orig), { recursive: true }); fs.copyFileSync(f, orig); }
  const tmp = f.replace(/(\.\w+)$/, '.tmp$1');
  const q = /\.webp$/i.test(f) ? ['-c:v', 'libwebp', '-quality', '90', '-compression_level', '6'] : ['-q:v', '2'];
  const r = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', orig, '-vf', FILTER, ...q, tmp]);
  if (r.status === 0 && fs.existsSync(tmp)) { if (replace(tmp, f)) done++; else { failed++; console.error('locked, try again later:', rel); } }
  else { failed++; console.error('failed:', rel, String(r.stderr).slice(0, 200)); try { fs.unlinkSync(tmp); } catch {} }
}
console.log(`enhanced ${done}, already done ${skipped}, failed ${failed}`);
