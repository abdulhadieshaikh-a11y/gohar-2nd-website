// Checks every local link, image, video and srcset entry referenced by the built pages exists on disk.
import fs from 'node:fs'; import path from 'node:path';
const dirs = ['.', 'projects', 'stories'];
const pages = dirs.flatMap((d) => fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => path.join(d, f)) : []);
let bad = 0, n = 0;
const check = (p, u) => {
  if (!u || /^(https?:|mailto:|tel:|data:|#)/.test(u)) return;
  u = u.split('#')[0].split('?')[0]; if (!u) return;
  n++; const f = path.normalize(path.join(path.dirname(p), decodeURIComponent(u)));
  if (!fs.existsSync(f)) { bad++; console.log('MISSING', p, '->', u); }
};
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src|data-src|poster|data-full|data-img|data-preview)="([^"]*)"/g)) check(p, m[1]);
  for (const m of html.matchAll(/\s(?:srcset|imagesrcset)="([^"]*)"/g)) m[1].split(',').forEach((c) => check(p, c.trim().split(/\s+/)[0]));
  for (const m of html.matchAll(/data-chapters="([^"]+)"/g)) JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')).forEach((c) => check(p, c.href));
}
console.log(`${pages.length} pages, ${n} references, ${bad} missing`);
process.exitCode = bad ? 1 : 0;
