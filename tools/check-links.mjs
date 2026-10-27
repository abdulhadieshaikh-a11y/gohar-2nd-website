// Checks every local link, image and video referenced by the built pages exists.
import fs from 'node:fs'; import path from 'node:path';
const pages = [...fs.readdirSync('.').filter(f => f.endsWith('.html')), ...fs.readdirSync('projects').map(f => 'projects/' + f)];
let bad = 0, n = 0;
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  for (const m of html.matchAll(/(?:href|src|data-src|poster|data-full|data-img)="([^"#?]+)/g)) {
    const u = m[1]; if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    n++; const f = path.normalize(path.join(path.dirname(p), u));
    if (!fs.existsSync(f)) { bad++; console.log('MISSING', p, '->', u); }
  }
  for (const m of html.matchAll(/data-story="([^"]+)"/g)) { const s = JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&')); const f = path.join(path.dirname(p), s.img); n++; if (!fs.existsSync(f)) { bad++; console.log('MISSING story img', p, s.img); } }
}
console.log(`${pages.length} pages, ${n} references, ${bad} missing`);
