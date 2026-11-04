import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { relative,extname } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../../',import.meta.url);
const country = new URL('Vorschau/Venalys/',root);
const base = 'http://127.0.0.1:8897/';
const { shouldPublish } = await import(new URL('netlify/build/site-publish.mjs',root));
const { houses } = await import(new URL('house-data.mjs',country));
const { warriors } = await import(new URL('warrior-data.mjs',country));
const { ESTATES } = await import(new URL('estate-data.mjs',country));
const { context } = await import(new URL('realm-context.mjs',country));
const pending = [new URL('index.html',country)],closure = new Map(),issues = [];
const key = url => relative(fileURLToPath(root),fileURLToPath(url)).replaceAll('\\','/');
const sha256 = data => createHash('sha256').update(data).digest('hex');

while (pending.length) {
  const url = pending.shift();
  if (closure.has(url.href)) continue;
  const path = key(url),buffer = await readFile(url);
  closure.set(url.href,{ path,url,role:'runtime' });
  if (!shouldPublish(path)) issues.push({ path,issue:'Runtime dependency excluded from publication.' });
  const extension = extname(url.pathname),text = buffer.toString('utf8');
  let refs = [];
  if (extension === '.html') refs = [...text.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
  if (extension === '.mjs' || extension === '.js') refs = [...text.matchAll(/\b(?:import|export)\s+(?:[^;]*?\bfrom\s+)?["']([^"']+)["']/g)].map(match => match[1]);
  if (extension === '.css') refs = [
    ...[...text.matchAll(/@import\s+["']([^"']+)["']/g)].map(match => match[1]),
    ...[...text.matchAll(/url\(\s*["']?([^"'\s)]+)["']?\s*\)/g)].map(match => match[1]),
  ];
  for (const ref of refs) {
    if (/^(?:https?:|data:|#)/.test(ref)) continue;
    const dependency = new URL(ref,url);dependency.search = '';dependency.hash = '';
    pending.push(dependency);
  }
}

const all = new Map(closure);
function add(path,role) {
  if (!path) return;
  const url = new URL(path,country);
  if (!all.has(url.href)) all.set(url.href,{ path:key(url),url,role });
}
for (const item of [...houses,...warriors,...ESTATES]) {
  for (const field of ['crest','image','fullsize','original']) {
    if (typeof item[field] === 'string') add(item[field],item.kind === 'estate' ? 'estate-image' : 'artwork');
  }
}
for (const path of ['assets/map.webp','assets/map-full.webp','assets/map-districts.webp',
  'assets/map-districts-full.webp',context.emblem,context.emblemFull]) add(path,'map-or-realm-art');
for (const warrior of warriors) add(warrior.classHref,'class-link');

const resources = [],entries = [...all.values()];
let cursor = 0;
await Promise.all(Array.from({ length:6 },async () => {
  while (cursor < entries.length) {
    const entry = entries[cursor++];
    try {
      const disk = await readFile(entry.url);
      const href = new URL(entry.url.pathname.slice(root.pathname.length),base).href;
      const response = await fetch(href),served = Buffer.from(await response.arrayBuffer());
      const row = { path:entry.path,role:entry.role,status:response.status,mime:response.headers.get('content-type'),
        bytes:served.length,sha256:sha256(served),diskHashMatches:sha256(disk) === sha256(served),publishable:shouldPublish(entry.path) };
      resources.push(row);
      if (row.status !== 200 || !row.diskHashMatches || !row.publishable) issues.push(row);
    } catch (error) { issues.push({ path:entry.path,issue:error.message }); }
  }
}));
const page = await fetch(new URL('Vorschau/Venalys/',base));
if (page.status !== 200) issues.push({ path:'Vorschau/Venalys/',status:page.status });
const audit = { checkedAt:new Date().toISOString(),baseUrl:base,pageStatus:page.status,
  runtimeClosureCount:closure.size,resourceCount:resources.length,estateTypes:ESTATES.length,
  estateImageFiles:resources.filter(resource => resource.role === 'estate-image').length,
  issues,resources:resources.sort((a,b) => a.path.localeCompare(b.path)),
  browserStatus:'Not performed; HTTP, dependency and file-byte verification only.',
  notes:['The local preview server serves WebP as application/octet-stream; status and file hashes were independently checked.'] };
await mkdir(new URL('./',import.meta.url),{ recursive:true });
await writeFile(new URL('http-assets-audit.json',import.meta.url),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({ pageStatus:audit.pageStatus,runtimeClosureCount:audit.runtimeClosureCount,
  resourceCount:audit.resourceCount,estateTypes:audit.estateTypes,estateImageFiles:audit.estateImageFiles,issues }));
if (issues.length) process.exitCode = 1;
