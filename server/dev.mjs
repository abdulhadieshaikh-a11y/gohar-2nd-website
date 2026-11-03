// Local server: the website + the Gohar Assistant AI endpoint, on http://localhost:5173
// Usage: npm start        (put ANTHROPIC_API_KEY=... in a .env file next to package.json for AI answers)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

// read .env (KEY=VALUE lines) without extra packages; never printed
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

const { default: assistant } = await import('../api/assistant.js');
const PORT = +process.env.PORT || 5173;

// test only (GOHAR_MOCK_AI=1): streams a canned answer the way the real AI does, to check the chat display without an API key
async function mockAI(req, res) {
  for await (const _ of req) { /* drain body */ }
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  const text = [
    'Great question! **Gohar Towers** in Gulshan-e-Iqbal offers spacious homes:',
    '',
    '- **5 and 6-room apartments** across three towers',
    '- The project is **completed** and ready',
    '- Prices are shared by our sales team on request',
    '',
    'You can [see the project](projects/gohar-towers.html) or [book a site visit](site-visit.html?project=gohar-towers).',
    '',
    'Here is more detail so the answer is long enough to need scrolling. '.repeat(14),
  ].join('\n');
  for (const w of text.match(/\S+\s*/g)) { res.write(w); await new Promise((r) => setTimeout(r, 12)); }
  res.end();
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.xml': 'application/xml' };
const BLOCK = /^(\.env[^/]*|\.git|node_modules|server|tools|_originals|api)(\/|$)/;

function sendFile(req, res, file) {
  const stat = fs.statSync(file);
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;
  if (range && /^bytes=/.test(range)) { // videos need range requests
    const [s, e] = range.replace('bytes=', '').split('-');
    const start = +s || 0, end = e ? +e : stat.size - 1;
    if (start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-cache' });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/assistant') return process.env.GOHAR_MOCK_AI === '1' ? mockAI(req, res) : await assistant(req, res);
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (BLOCK.test(rel) || rel.includes('..')) { res.writeHead(404); return res.end('Not found'); }
    let file = path.join(ROOT, rel);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    else if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html'; // /about -> about.html
    if (!fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    sendFile(req, res, file);
  } catch (err) {
    console.error(err); if (!res.headersSent) res.writeHead(500); res.end();
  }
}).listen(PORT, () => {
  console.log(`Gohar website running at http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'Gohar Assistant: AI answers ON' : 'Gohar Assistant: AI answers OFF (add ANTHROPIC_API_KEY to .env); built-in answers are used');
});
