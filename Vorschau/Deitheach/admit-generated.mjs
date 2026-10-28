import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const [kind,id,source,revision]=process.argv.slice(2);
if(!['warrior','heraldry'].includes(kind)||!/^[a-z-]+$/.test(id??''))throw Error('Expected kind, artwork ID and generator PNG');
if(revision&&!/^[a-z0-9-]+$/.test(revision))throw Error('Invalid revision label');
const root=path.dirname(fileURLToPath(import.meta.url));
const catalog=JSON.parse(await readFile(path.join(root,kind==='warrior'?'assets/warriors/prompts.json':'art-prompts.json'),'utf8'));
const job=catalog.jobs.find(j=>j.id===id);if(!job)throw Error('Unknown artwork ID');
const resolved=path.resolve(source),allowed=path.resolve(process.env.USERPROFILE,'.codex/generated_images');
if(!resolved.startsWith(allowed+path.sep)||path.extname(resolved)!=='.png')throw Error('Input must be a built-in generator PNG');
const target=path.join(root,kind==='warrior'?'assets/warriors/generated':'assets/generated',id+'.png');
const bytes=await readFile(resolved),sha256=createHash('sha256').update(bytes).digest('hex');
const receiptDirectory=path.join(root,'assets/generated/receipts');
await mkdir(receiptDirectory,{recursive:true});
let old;try{old=await readFile(target);}catch(error){if(error.code!=='ENOENT')throw error;}
if(old){
 if(!revision)throw Error('Target exists; use an explicit correction revision');
 const oldHash=createHash('sha256').update(old).digest('hex');
 const archive=path.join(root,'assets/generated-archive',`${kind}-${id}-${oldHash.slice(0,12)}.png`);
 await mkdir(path.dirname(archive),{recursive:true});await copyFile(target,archive);
 for(const file of (await readdir(receiptDirectory)).filter(f=>f.startsWith(`${kind}-${id}`))){
  const previous=JSON.parse(await readFile(path.join(receiptDirectory,file),'utf8'));
  if(previous.sha256!==oldHash)continue;
  previous.target=path.relative(root,archive).replaceAll('\\','/');previous.status='superseded';
  await writeFile(path.join(receiptDirectory,file),JSON.stringify(previous,null,2)+'\n');
 }
}
await mkdir(path.dirname(target),{recursive:true});await copyFile(resolved,target);
const record={id,kind,revision:revision??'v1',tool:'built-in image_gen',source:resolved,target:path.relative(root,target).replaceAll('\\','/'),sha256,createdAt:new Date().toISOString(),prompt:job.prompt,references:job.references};
await writeFile(path.join(receiptDirectory,`${kind}-${id}${revision?'-'+revision:''}.json`),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({id,kind,sha256}));
