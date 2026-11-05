import {readFile,writeFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,relative} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url)),version='20261104-content-lore-v1';
const owned=['Stammbäume/assets/js/modules/house-biography/house-biography-registry-default.js',
  'Stammbäume/assets/js/modules/house-lore-corrections/apply-reviewed-house-corrections.js'];
const targets=new Set([...owned,'Stammbäume/assets/js/data/house-biographies.registry.js','Familien Häuser und Clans/haeuser.registry.js'].map(path=>resolve(root,path)));
const files=[];
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){
  if(/private|fleischsammler|secret/i.test(entry.name))continue;
  const path=resolve(directory,entry.name);
  if(entry.isDirectory())await collect(path);else if(entry.name.endsWith('.js'))files.push(path);
}}
await collect(resolve(root,'Stammbäume/assets/js'));
const contents=new Map(await Promise.all(files.map(async path=>[path,await readFile(path,'utf8')]))),originals=new Map(contents);
for(const local of owned){const path=resolve(root,local);contents.set(path,contents.get(path).replace(/(['"])([^'"\r\n]*source-family-field-upgrade\.js)(?:\?[^'"\r\n]*)?\1/g,(_,q,url)=>`${q}${url}?v=${version}${q}`));}
let progress=true;
while(progress){progress=false;for(const[path,text]of contents){let dependency=false;
  const next=text.replace(/(['"])(\.{1,2}\/[^'"\r\n]+\.js)(?:\?[^'"\r\n]*)?\1/g,(match,q,url)=>{
    if(!targets.has(resolve(dirname(path),url)))return match;dependency=true;return `${q}${url}?v=${version}${q}`;
  });
  if(next!==text)contents.set(path,next);
  if(dependency&&!targets.has(path)){targets.add(path);progress=true;}
}}
for(const local of ['Stammbäume/Stammbaum.html','Stammbäume/index.html','Stammbäume/register.html','Familien Häuser und Clans/haus.html','Familien Häuser und Clans/kleinehaeuser.html']){
  const path=resolve(root,local),text=await readFile(path,'utf8');originals.set(path,text);
  contents.set(path,text.replace(/(src=['"])([^'"\r\n]+\.js)(?:\?[^'"\r\n]*)?(['"])/g,(match,prefix,url,q)=>targets.has(resolve(dirname(path),url))?`${prefix}${url}?v=${version}${q}`:match));
}
const changed=[];
for(const[path,text]of contents)if(text!==originals.get(path)){await writeFile(path,text);changed.push(relative(root,path).replaceAll('\\','/'));}
await writeFile(new URL('cache-version-changes.json',import.meta.url),JSON.stringify({version,files:changed,
  note:'Only the two owners using the new metadata-boundary export need the updated shared-helper URL; its existing exports remain unchanged for other consumers.'},null,2)+'\n');
console.log(JSON.stringify({version,files:changed.length}));
