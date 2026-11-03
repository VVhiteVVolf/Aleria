import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const publicBase = 'C:/Users/fhg_r/AppData/Local/Temp/aleria-archive-dedupe-20261103';
const slugs = ['grawn','marchog','morcanhuc','baedd','ciarog','sgwarnog','gwythiad','aroglyn','chiffyddlon','gwarchod','cruithenaech','warthog'];
const ids = new Set(slugs.map(slug => `haus-${slug}`));
const houseRoot = 'Familien Häuser und Clans/';
const familyRows = FAMILY_REGISTRY.filter(row => ids.has(row.id));
const registryScript = await readFile(resolve(root, houseRoot, 'haeuser.registry.js'), 'utf8');
const sandbox = { window: {} }; vm.runInNewContext(registryScript, sandbox);
const houseRows = sandbox.window.HAEUSER_REGISTRY.filter(row => ids.has(row.id));
const start = registryScript.indexOf('  const HOUSES = [');
const closing = '\n  ].map(Object.freeze);';
const end = registryScript.indexOf(closing, start);
if (familyRows.length !== 12 || houseRows.length !== 12 || start < 0 || end < 0) throw Error('Preview scope mismatch');
const scopedHouseRegistry = registryScript.slice(0, start) + '  const HOUSES = ' + JSON.stringify(houseRows) + '.map(Object.freeze);' + registryScript.slice(end + closing.length);
const scopedFamilies = `export const RETIRED_FAMILY_IDS = Object.freeze([]);
export const FAMILY_REGISTRY = Object.freeze(${JSON.stringify(familyRows)});
export function getRegisteredFamily(id) { return FAMILY_REGISTRY.find(row => row.id === id) || null; }
`;
const currentPrefixes = [houseRoot + 'Estryll/Cenyr/Aehrental/', houseRoot + 'assets/', houseRoot + 'modules/court/', houseRoot + 'modules/warrior-gallery/', houseRoot + 'modules/house-content/'];
const currentFiles = new Set([houseRoot + 'haus.html', houseRoot + 'kleinehaeuser.html']);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2' };

// Read-only QA overlay. The fallback is the verified public checkout; only the
// twelve current house records and their feature files come from authoring.
const server = http.createServer(async (request,response) => {
 try {
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  const file = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
  if (!file || file.includes('..') || file.includes('\\') || !shouldPublish(file)) { response.writeHead(404); response.end(); return; }
  let bytes;
  if (file === houseRoot + 'haeuser.registry.js') bytes = Buffer.from(scopedHouseRegistry);
  else if (file === 'Stammbäume/assets/js/data/families.registry.js') bytes = Buffer.from(scopedFamilies);
  else {
   const current = currentFiles.has(file) || currentPrefixes.some(prefix => file.startsWith(prefix));
   const base = current ? root : publicBase;
   const target = resolve(base, file);
   if (!target.startsWith(resolve(base) + '\\') && !target.startsWith(resolve(base) + '/')) throw Error('Invalid path');
   const info = await stat(target); if (!info.isFile()) throw Error('Not a file');
   bytes = await readFile(target);
  }
  response.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'Content-Length':bytes.length });
  response.end(request.method === 'HEAD' ? undefined : bytes);
 } catch { response.writeHead(404); response.end(); }
});
server.listen(5573, '127.0.0.1', () => console.log('Scoped local house preview http://127.0.0.1:5573'));
