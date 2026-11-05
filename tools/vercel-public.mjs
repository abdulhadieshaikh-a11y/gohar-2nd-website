// Vercel: gathers the finished website (pages + assets) into ./public, the folder Vercel publishes.
// Tools, server code and source files are not copied. Run after `node tools/build.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let files = 0;
const copy = (rel) => {
  const src = path.join(ROOT, rel), dst = path.join(OUT, rel);
  if (!fs.existsSync(src)) return;
  if (fs.statSync(src).isDirectory()) {
    for (const e of fs.readdirSync(src)) if (e !== 'stock') copy(path.join(rel, e));
  } else { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); files++; }
};
for (const f of fs.readdirSync(ROOT)) if (f.endsWith('.html')) copy(f);
['projects', 'stories', 'assets'].forEach(copy);
console.log(`public/: ${files} files ready for Vercel`);
