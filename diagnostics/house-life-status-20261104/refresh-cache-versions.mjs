import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, relative } from 'node:path';
const root = fileURLToPath(new URL('../../',import.meta.url));
const version = '20261104-life-status-v1';
const canonical = ['gwyvern','wargh','silberblut','goldglanz','feuerherz','helgr','arth','sturmgeborene'].map(name=>resolve(root,`Stammbäume/assets/js/data/house-${name}-family.js`));
const feature = ['apply-reviewed-house-corrections','house-lore-corrections','house-life-status-corrections','house-life-status-correction-fields'].map(name=>resolve(root,`Stammbäume/assets/js/modules/house-lore-corrections/${name}.js`));
const targets = new Set([...canonical,...feature,resolve(root,'Stammbäume/assets/js/data/families.registry.js')]);
const files = [];
async function collect(directory) {
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    if(/private|fleischsammler|secret/i.test(entry.name)) continue;
    const path=resolve(directory,entry.name);
    if(entry.isDirectory()) await collect(path);
    else if(entry.name.endsWith('.js')) files.push(path);
  }
}
await collect(resolve(root,'Stammbäume/assets/js'));
const contents = new Map(await Promise.all(files.map(async path=>[path,await readFile(path,'utf8')])));
const originals = new Map(contents);
let progress=true;
while(progress) {
  progress=false;
  for(const [path,text] of contents) {
    let dependsOnChanged=false;
    const next=text.replace(/(['"])(\.{1,2}\/[^'"\r\n]+\.js)(?:\?[^'"\r\n]*)?\1/g,(match,q,url)=>{
      if(!targets.has(resolve(dirname(path),url)))return match;
      dependsOnChanged=true;
      return `${q}${url}?v=${version}${q}`;
    });
    if(next!==text)contents.set(path,next);
    if(dependsOnChanged&&!targets.has(path)){targets.add(path);progress=true;}
  }
}
for(const local of ['Stammbäume/Stammbaum.html','Stammbäume/index.html','Stammbäume/register.html','Familien Häuser und Clans/haus.html','Familien Häuser und Clans/kleinehaeuser.html']) {
  const path=resolve(root,local),text=await readFile(path,'utf8');
  originals.set(path,text);
  contents.set(path,text.replaceAll('20261104-lore-fixes-v1',version)
    .replace(/(src=['"])([^'"\r\n]+\.js)(?:\?[^'"\r\n]*)?(['"])/g,(match,prefix,url,q)=>
      targets.has(resolve(dirname(path),url))?`${prefix}${url}?v=${version}${q}`:match));
}
const changed=[];
for(const [path,text] of contents) if(text!==originals.get(path)) {await writeFile(path,text);changed.push(relative(root,path).replaceAll('\\','/'));}
const receipt=new URL('cache-version-changes.json',import.meta.url);
const previous=await readFile(receipt,'utf8').then(JSON.parse).catch(error=>{if(error.code==='ENOENT')return {files:[]};throw error;});
await writeFile(receipt,JSON.stringify({version,files:[...new Set([...previous.files,...changed])]},null,2)+'\n');
console.log(JSON.stringify({version,files:changed.length}));
