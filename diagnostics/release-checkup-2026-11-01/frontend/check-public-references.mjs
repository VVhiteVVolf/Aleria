import { readFile, readdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const folder=fileURLToPath(new URL('./',import.meta.url));
const directories=['AleriaAlmanach/modules/landing','AleriaAlmanach/modules/quests','AleriaAlmanach/modules/currency',
  'AleriaAlmanach/modules/gawain-duncan','AleriaAlmanach/modules/group-adventures',
  'AleriaAlmanach/modules/gwynthor-formlingssache','AleriaAlmanach/modules/gwynthor-cathedral',
  'AleriaAlmanach/modules/gwynthor-theater','AleriaAlmanach/modules/gwynthor-troetzli',
  'Anzeigetafeln/assets/js/archive','Anzeigetafeln/assets/js/timeline','Anzeigetafeln/assets/js/rewards'];
const explicit=['AleriaAlmanach/AleriaAlmanach.html','AleriaAlmanach/quests.html','Anzeigetafeln/tafel.html'];
const files=[];
async function collect(directory) {
  for(const entry of await readdir(path.join(root,directory),{withFileTypes:true})) {
    const file=`${directory}/${entry.name}`;
    if(entry.isDirectory()) { if(!['source','sources','.source','backups','node_modules'].includes(entry.name))await collect(file); }
    else if(/\.(?:m?js|json|css)$/.test(entry.name))files.push(file);
  }
}
for(const directory of directories)await collect(directory);
files.push(...explicit);
const errors=[],references=new Map(),caseCache=new Map();
async function exactCase(relative) {
  let directory=root;
  for(const part of relative.split('/')) {
    if(!caseCache.has(directory))caseCache.set(directory,await readdir(directory));
    const names=caseCache.get(directory);
    if(!names.includes(part))return names.find(name=>name.toLocaleLowerCase('en')===part.toLocaleLowerCase('en')) || part;
    directory=path.join(directory,part);
  }
  return '';
}
async function check(file,source,kind) {
  if(!source || source.includes('${') || source.startsWith('//') || /^(?:https?:|data:|node:)/i.test(source))return;
  source=source.replace(/\\x([0-9a-f]{2})|\\u([0-9a-f]{4})/gi,(_match,hex,unicode)=>String.fromCharCode(parseInt(hex||unicode,16)));
  let target;
  try {
    const clean=decodeURIComponent(source.split(/[?#]/)[0]);
    target=clean.startsWith('/')?path.resolve(root,clean.slice(1)):path.resolve(root,path.dirname(file),clean);
  } catch {return;}
  const relative=path.relative(root,target).split(path.sep).join('/');
  if(!relative || relative.startsWith('../'))return;
  const key=`${relative}:${kind}`;
  if(references.has(key))return;
  references.set(key,{target:relative,file,source,kind});
  try {
    await access(target);
    const wrong=await exactCase(relative);
    if(wrong)errors.push({kind:'case',file,source,target:relative,actualComponent:wrong});
    if(!shouldPublish(relative))errors.push({kind:'excluded-runtime-reference',file,source,target:relative});
  } catch { errors.push({kind:'missing',file,source,target:relative}); }
}
for(const file of files) {
  const text=await readFile(path.join(root,file),'utf8');
  // Root-absolute art paths are independent of the page's relative URL base.
  for(const match of text.matchAll(/["'`]((?:\/)[^"'`<>\n]+?\.(?:png|webp|jpe?g|gif|svg|woff2?|ttf|otf|html|json)(?:[?#][^"'`<>\n]*)?)["'`]/gi))await check(file,match[1],'absolute-asset');
  if(/\.(?:m?js)$/.test(file))for(const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']((?:\.\.?\/)[^"']+)["']/g))await check(file,match[1],'module');
  if(file.endsWith('.html'))for(const match of text.matchAll(/\b(?:src|href)=["']((?:\.\.?\/|\/)[^"']+)["']/g))await check(file,match[1],'html');
  if(file.endsWith('.css'))for(const match of text.matchAll(/url\(\s*["']?((?:\.\.?\/|\/)[^"')\s]+)["']?\s*\)/g))await check(file,match[1],'css');
}
const report={files:files.length,references:references.size,errors,checked:[...references.values()]};
await writeFile(path.join(folder,'public-references.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:report.files,references:report.references,errors:report.errors}));
if(errors.length)process.exitCode=1;
