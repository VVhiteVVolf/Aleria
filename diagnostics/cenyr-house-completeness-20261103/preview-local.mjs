// Read-only local QA overlay; no writes, no public deployment.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { resolveCanonicalFamilyId } from '../../Stammbäume/assets/js/modules/family-registry/family-id-aliases.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../Stammbäume/assets/js/data/house-biographies.registry.js';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const publicBase = 'C:/Users/fhg_r/AppData/Local/Temp/aleria-archive-dedupe-20261103';
const ids = new Set(['haus-grianlaoch','haus-arth','haus-carwyn','haus-uldyn','haus-twyllod','haus-cwningod','sept-cneacail','haus-jernigan','haus-swynol','haus-morforwyn-linie-elimue','haus-morforwyn-linie-marmue','haus-pysgod']);
const feature = 'Familien Häuser und Clans/';
const families = FAMILY_REGISTRY.filter(row => ids.has(resolveCanonicalFamilyId(row.id)));
const script = await readFile(resolve(root, feature, 'haeuser.registry.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(script, context);
const houses = context.window.HAEUSER_REGISTRY.filter(row => ids.has(resolveCanonicalFamilyId(row.id)));
const start = script.indexOf('  const HOUSES = [');
const closing = '\n  ].map(Object.freeze);';
const end = script.indexOf(closing, start);
if (families.length !== ids.size || [...ids].some(id => !houses.some(house => resolveCanonicalFamilyId(house.id) === id)) || start < 0 || end < 0) throw Error('Incomplete preview scope');
const houseRegistry = script.slice(0, start) + '  const HOUSES = ' + JSON.stringify(houses) + '.map(Object.freeze);' + script.slice(end + closing.length);
const familyRegistry = 'export const RETIRED_FAMILY_IDS = Object.freeze([]);\nexport const FAMILY_REGISTRY = Object.freeze(' + JSON.stringify(families) + ');\nexport function getRegisteredFamily(id) { return FAMILY_REGISTRY.find(row => row.id === id) || null; }\n';
const biographyRegistry = 'export const HOUSE_BIOGRAPHY_DEFAULTS = Object.freeze(' + JSON.stringify(Object.fromEntries(Object.entries(HOUSE_BIOGRAPHY_DEFAULTS).filter(([id]) => ids.has(resolveCanonicalFamilyId(id))))) + ');\n';
const current = [...houses.filter(house => house.data).map(house => feature + house.data.split('?')[0].slice(0, house.data.split('?')[0].lastIndexOf('/') + 1)), feature + 'assets/', feature + 'modules/court/', feature + 'modules/warrior-gallery/', feature + 'modules/house-content/'];
const currentFiles = new Set([feature + 'haus.html', feature + 'kleinehaeuser.html']);
for (const row of families) {
 for (const asset of [row.family.document?.emblem, ...Object.values(row.houseProfile?.regionEmblems || {})]) if (asset?.startsWith('assets/')) currentFiles.add('Stammbäume/' + asset);
}
currentFiles.add('Stammbäume/assets/js/modules/family-registry/family-id-aliases.js');
for (const name of ['house-biography-registry-default','house-biography-default-upgrade','house-biography-fingerprint']) currentFiles.add(`Stammbäume/assets/js/modules/house-biography/${name}.js`);
currentFiles.add('Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2' };

http.createServer(async (request, response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const file = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
    if (!file || file.includes('..') || file.includes('\\') || !shouldPublish(file)) throw Error('Unpublished path');
    let bytes;
    if (file === feature + 'haeuser.registry.js') bytes = Buffer.from(houseRegistry);
    else if (file === 'Stammbäume/assets/js/data/families.registry.js') bytes = Buffer.from(familyRegistry);
    else if (file === 'Stammbäume/assets/js/data/house-biographies.registry.js') bytes = Buffer.from(biographyRegistry);
    else {
      const base = currentFiles.has(file) || current.some(prefix => file.startsWith(prefix)) ? root : publicBase;
      const target = resolve(base, file);
      if (!target.startsWith(resolve(base) + '\\') && !target.startsWith(resolve(base) + '/')) throw Error('Invalid path');
      if (!(await stat(target)).isFile()) throw Error('Not a file');
      bytes = await readFile(target);
    }
    response.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'Content-Length':bytes.length });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch { response.writeHead(404); response.end(); }
}).listen(5576, '127.0.0.1', () => console.log('Scoped public Cenyr QA http://127.0.0.1:5576'));
