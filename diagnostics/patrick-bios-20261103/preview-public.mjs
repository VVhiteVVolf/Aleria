// Read-only QA of the sanitized release checkout. Never serves authoring files.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../.tmp/patrick-release-20261103/public-checkout/', import.meta.url));
const { shouldPublish } = await import(new URL('netlify/build/site-publish.mjs', 'file:///' + root.replaceAll('\\', '/')));
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer(async (request, response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const file = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
    const target = resolve(root, file);
    if (!file || !target.startsWith(resolve(root) + sep) || file.split(/[\\/]/).some(part => part.startsWith('.')) || !shouldPublish(file)) throw Error('Unpublished path');
    if (!(await stat(target)).isFile()) throw Error('Not a file');
    const bytes = await readFile(target);
    response.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch { response.writeHead(404); response.end(); }
}).listen(5578, '127.0.0.1', () => console.log('Sanitized public QA http://127.0.0.1:5578'));
