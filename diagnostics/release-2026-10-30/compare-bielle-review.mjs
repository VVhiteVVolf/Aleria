import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
const root=new URL('../../',import.meta.url);
const gitAt=(revision,file)=>execFileSync('git',['show',`${revision}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const git=file=>gitAt('f712670c3^',file);
const dataURL=text=>'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
const people='AleriaAlmanach/modules/gestiefelte-muschi/muschi-people.mjs';
const family='Stammbäume/assets/js/data/brevanor-desele-bielle-records.js';
const registry='Stammbäume/assets/js/data/families.registry.js';
const overrides=new Map();
function absoluteImports(source,file){
 const base=new URL(file,root);
 return source.replace(/\bfrom\s+(['"])(\.[^'"]+)\1/g,(_,quote,relative)=>{
  const url=new URL(relative,base).href;return 'from '+JSON.stringify(overrides.get(url)||url);
 });
}
overrides.set(new URL(people,root).href,dataURL(absoluteImports(git(people),people)));
overrides.set(new URL(family,root).href,dataURL(absoluteImports(git(family),family)));
const beforeRegistry=(await import(dataURL(absoluteImports(await readFile(new URL(registry,root),'utf8'),registry)))).FAMILY_REGISTRY;
const policy='Kontinente/tests/support/albic-review-baseline.mjs';
const {protectedAlbicFamilies,reviewHash}=await import(dataURL(absoluteImports(gitAt('f712670c3',policy),policy)));
const ids=new Set(JSON.parse(await readFile(new URL('Kontinente/tests/support/family-baseline-20261023.json',root),'utf8')));
const before=protectedAlbicFamilies(beforeRegistry.filter(r=>ids.has(r.id)));
const after=protectedAlbicFamilies(FAMILY_REGISTRY.filter(r=>ids.has(r.id)));
const changes=[];
function compare(a,b,path){
 if(JSON.stringify(a)===JSON.stringify(b))return;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
  for(const key of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[key],b[key],[...path,key]);
 }else changes.push({path,before:a,after:b});
}
for(let i=0;i<before.length;i++)compare(before[i],after[i],[before[i].id]);
const report={beforeHash:reviewHash(before),afterHash:reviewHash(after),changes};
await writeFile(new URL('bielle-reviewed-diff.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
