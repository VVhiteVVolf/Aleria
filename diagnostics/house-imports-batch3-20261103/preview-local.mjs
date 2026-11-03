// Read-only local QA overlay; no writes, no public deployment.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const publicBase = 'C:/Users/fhg_r/AppData/Local/Temp/aleria-archive-dedupe-20261103';
const ids = new Set(['pysgod','blaidd-tredegar','brithyll','gwialen','illygoden-tredegar','gwaedlyd-tredegar','coedwig','draenog','wivern','morfil','lyfant-caer-asgwrn','dornach','brathaireann','tonnmharra','tanwyn','wylan'].map(id => 'haus-' + id));
const feature = 'Familien Häuser und Clans/';
const families = FAMILY_REGISTRY.filter(row => ids.has(row.id));
const script = await readFile(resolve(root, feature, 'haeuser.registry.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(script, context);
const houses = context.window.HAEUSER_REGISTRY.filter(row => ids.has(row.id));
const start = script.indexOf('  const HOUSES = [');
const closing = '\n  ].map(Object.freeze);';
const end = script.indexOf(closing, start);
if (families.length !== ids.size || houses.length !== ids.size || start < 0 || end < 0) throw Error('Incomplete preview scope');
const houseRegistry = script.slice(0, start) + '  const HOUSES = ' + JSON.stringify(houses) + '.map(Object.freeze);' + script.slice(end + closing.length);
const familyRegistry = 'export const RETIRED_FAMILY_IDS = Object.freeze([]);\nexport const FAMILY_REGISTRY = Object.freeze(' + JSON.stringify(families) + ');\nexport function getRegisteredFamily(id) { return FAMILY_REGISTRY.find(row => row.id === id) || null; }\n';
const current = [feature + 'Estryll/Cenyr/Graue_Weite/', feature + 'Estryll/Cenyr/Weidebucht/', feature + 'assets/', feature + 'modules/court/', feature + 'modules/warrior-gallery/', feature + 'modules/house-content/'];
const currentFiles = new Set([feature + 'haus.html', feature + 'kleinehaeuser.html']);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2' };

http.createServer(async (request, response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const file = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
    if (!file || file.includes('..') || file.includes('\\') || !shouldPublish(file)) throw Error('Unpublished path');
    let bytes;
    if (file === feature + 'haeuser.registry.js') bytes = Buffer.from(houseRegistry);
    else if (file === 'Stammbäume/assets/js/data/families.registry.js') bytes = Buffer.from(familyRegistry);
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
}).listen(5575, '127.0.0.1', () => console.log('Scoped local Graue Weite QA http://127.0.0.1:5575'));
