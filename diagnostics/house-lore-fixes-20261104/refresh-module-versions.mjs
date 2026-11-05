import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, relative } from 'node:path';
const root = fileURLToPath(new URL('../../',import.meta.url));
const version='20261104-lore-fixes-v1', old='20261103-leitheach-v1';
const readJson=async name=>JSON.parse(await readFile(resolve(root,'diagnostics/house-lore-fixes-20261104',name),'utf8'));
const [lei,cen,ald]=await Promise.all(['leitheach-changes.json','cenyr-changes.json','aldrimar-changes.json'].map(readJson));
const paths=value=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(paths)
  :value&&typeof value==='object'?Object.entries(value).filter(([key])=>key==='path'||key==='file').flatMap(([,entry])=>paths(entry)):[];
const canonical=new Set([...paths(lei.modifiedCanonModules),...paths(cen.sourceFiles),...paths(ald.canonicalSourceModules)]
  .filter(path=>path.startsWith('Stammbäume/')&&path.endsWith('.js')).map(path=>resolve(root,path)));
const files=[];
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){
  if(/private|fleischsammler|secret/i.test(entry.name))continue;
  const path=resolve(directory,entry.name);
  if(entry.isDirectory())await collect(path);else if(entry.name.endsWith('.js')&&entry.name!=='house-biographies.registry.js')files.push(path);
}}
await collect(resolve(root,'Stammbäume/assets/js'));
const contents=new Map(await Promise.all(files.map(async path=>[path,await readFile(path,'utf8')])));
const originals=new Map(contents), changedTargets=new Set(canonical);
for(const path of canonical){const text=contents.get(path);if(text)contents.set(path,text.replace(/(['"])([^'"\r\n]+haus\.biography\.mjs)(?:\?[^'"\r\n]*)?\1/g,(_,q,url)=>`${q}${url}?v=${version}${q}`));}
let progress=true;
while(progress){progress=false;for(const[path,text]of contents){
  const next=text.replace(/(['"])(\.{1,2}\/[^'"\r\n]+\.js)(?:\?[^'"\r\n]*)?\1/g,(_,q,url)=>
    changedTargets.has(resolve(dirname(path),url))?`${q}${url}?v=${version}${q}`:_);
  if(next!==text){contents.set(path,next);if(!changedTargets.has(path)){changedTargets.add(path);progress=true;}}
}}
for(const[path,text]of contents)contents.set(path,text.replaceAll(old,version));
for(const local of ['Stammbäume/Stammbaum.html','Familien Häuser und Clans/haus.html','Familien Häuser und Clans/kleinehaeuser.html']){
  const path=resolve(root,local),text=await readFile(path,'utf8');originals.set(path,text);contents.set(path,text.replaceAll(old,version));
}
const changed=[];
for(const[path,text]of contents)if(text!==originals.get(path)){await writeFile(path,text);changed.push(relative(root,path).replaceAll('\\','/'));}
await writeFile(resolve(root,'diagnostics/house-lore-fixes-20261104/cache-version-changes.json'),JSON.stringify({version,canonicalModules:canonical.size,files:changed},null,2)+'\n');
console.log(JSON.stringify({canonicalModules:canonical.size,versionedFiles:changed.length}));
