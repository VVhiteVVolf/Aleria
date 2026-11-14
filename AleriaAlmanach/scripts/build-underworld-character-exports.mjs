import fs from 'node:fs/promises';
import { buildUnderworldCharacterExports } from '../modules/gwynthor-underworld/underworld-characters.mjs';
const args=process.argv.slice(2),check=args.includes('--check');
if(args.length>1 || args.some(arg=>arg!=='--check')) throw Error('Use [--check].');
const root=new URL('../../',import.meta.url),exports=buildUnderworldCharacterExports();
for(const entry of exports) {
  const url=new URL(entry.sourcePath,root),text=JSON.stringify(entry,null,2)+'\n';
  if(check) {if(await fs.readFile(url,'utf8')!==text) throw Error(`Stale character export: ${entry.sourcePath}`);}
  else {await fs.mkdir(new URL('.',url),{recursive:true});await fs.writeFile(url,text);}
}
console.log(JSON.stringify({exported:exports.length,check,externalWrites:false}));
