import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };

const isInside = (base, candidate) => candidate === base || candidate.startsWith(`${base}${path.sep}`);

export function createStaticServer(root, { host = '127.0.0.1', port = 0 } = {}) {
  const base = path.resolve(root);
  const resolvedBase = fs.realpath(base);
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD', 'X-Content-Type-Options': 'nosniff' });
        res.end('Method not allowed');
        return;
      }
      const pathname = decodeURIComponent(new URL(req.url, `http://${host}`).pathname);
      if (pathname.includes('\0')) throw new Error('Invalid path');
      const requested = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const file = path.resolve(base, `.${requested}`);
      if (!isInside(base, file)) { res.writeHead(403, { 'X-Content-Type-Options': 'nosniff' }); res.end('Forbidden'); return; }
      const info = await fs.stat(file).catch(() => null);
      if (!info || !info.isFile()) { res.writeHead(404); res.end('Not found'); return; }
      const [realBase, realFile] = await Promise.all([resolvedBase, fs.realpath(file)]);
      if (!isInside(realBase, realFile)) { res.writeHead(403, { 'X-Content-Type-Options': 'nosniff' }); res.end('Forbidden'); return; }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      if (req.method !== 'HEAD') res.end(await fs.readFile(file)); else res.end();
    } catch { res.writeHead(400); res.end('Bad request'); }
  });
  return {
    server,
    listen: () => new Promise((resolve) => server.listen(port, host, () => resolve(server.address()))),
    close: () => server.listening
      ? new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
      : Promise.resolve()
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || '.');
  const instance = createStaticServer(root);
  instance.listen().then((address) => console.log(`http://${address.address}:${address.port}`));
}
