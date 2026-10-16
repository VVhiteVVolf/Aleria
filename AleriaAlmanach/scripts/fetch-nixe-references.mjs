import {readFile,writeFile,mkdir} from 'node:fs/promises';
const {entry}=JSON.parse(await readFile(new URL('../modules/lachende-nixe/sources/module-before-finalization.json',import.meta.url),'utf8'));
const nodes=entry.pages[2].hierarchy.trees.flatMap(tree=>tree.levels.flatMap(level=>level.nodes)).filter(node=>node.portrait);
const keys=['albrecht','johanna','lorcan','simon','david','kurtisane-1','kurtisane-2','kurtisane-3','kurtisane-4','musikantin-1','musikantin-2'];
const jobs=nodes.map((node,index)=>({key:keys[index],url:node.portrait}));
jobs.push({key:'schild',url:entry.pages[2].hierarchy.emblem},{key:'aussenansicht-vorher',url:entry.pages[0].image});
const root=new URL('../assets/lachende-nixe/references/',import.meta.url);
await mkdir(root,{recursive:true});
for(let start=0;start<jobs.length;start+=3) await Promise.all(jobs.slice(start,start+3).map(async job=>{
  const target=new URL(`${job.key}.png`,root);
  if(await readFile(target).catch(error=>{if(error.code!=='ENOENT') throw error;return null;})) return;
  const response=await fetch(job.url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw new Error(`${job.key}: HTTP ${response.status}`);
  await writeFile(target,Buffer.from(await response.arrayBuffer()));
}));
await writeFile(new URL('sources.json',root),JSON.stringify({module:entry.id,images:jobs},null,2)+'\n');
console.log(JSON.stringify({references:jobs.length}));
