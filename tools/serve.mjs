// Tiny static server for built output; no dependencies, so it also runs inside the Playwright container.
// Usage: node tools/serve.mjs <port> <urlPrefix>=<dir> [<urlPrefix>=<dir> ...]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };

const [port, ...mounts] = process.argv.slice(2);
const routes = mounts.map((m) => m.split('=')).sort((a, b) => b[0].length - a[0].length);

createServer(async (req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const route = routes.find(([prefix]) => path.startsWith(prefix));
  if (!route) return res.writeHead(404).end();
  let file = join(route[1], normalize(path.slice(route[0].length)).replace(/^(\.\.[/\\])+/, ''));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(port), () => console.log(`serving on ${port}: ${mounts.join(' ')}`));
