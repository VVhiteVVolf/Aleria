// Only the reviewed house seals, Oweta's spear and Rianna's keepsake.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createContentPublicationClient } from './content-publication-client.mjs';
import { HOUSE_SIGNET_HOUSES } from '../../../AleriaAlmanach/modules/house-knight-rings/house-ring-houses.mjs';
import { HOUSE_RING_ARTWORK } from '../../../AleriaAlmanach/modules/house-knight-rings/house-ring-artwork.mjs';
import { GWYNTHOR_EQUIPMENT_ARTWORK } from '../../../AleriaAlmanach/modules/gwynthor-seven/equipment-artwork.mjs';
const apply=process.argv.includes('--apply');
const root=new URL('../../../',import.meta.url);
const sources=[...HOUSE_SIGNET_HOUSES.map(h=>({familyId:h.id,path:h.image,kind:'ring'})),
 {familyId:'haus-draig',path:'/AleriaAlmanach/assets/gwynthor-seven/items/oweta-draig-speer-v1.png',kind:'equipment'},
 {familyId:'haus-wyrm',path:'/AleriaAlmanach/assets/gwynthor-seven/items/rianna-silberhirsch-v1.png',kind:'equipment'}];
const rings={...HOUSE_RING_ARTWORK},equipment={...GWYNTHOR_EQUIPMENT_ARTWORK};
const client=apply?await createContentPublicationClient():null;
const report=[];
for(const source of sources){
 assert(source.path.startsWith('/AleriaAlmanach/assets/')&&!source.path.includes('..'));
 const bytes=await readFile(new URL(source.path.slice(1),root));
 assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG-Original erwartet.');
 const sha256=createHash('sha256').update(bytes).digest('hex');
 const receipt=client?await client.publishFamilyArtwork({familyId:source.familyId,
  assetId:`house-signets-${sha256.slice(0,16)}`,bytes,metadata:{sourceFeature:'house-signets-20261102',sourcePath:source.path}}):{};
 const entry={...receipt,sha256,size:bytes.length};
 (source.kind==='ring'?rings:equipment)[source.path]=entry;
 report.push({...source,...entry});
}
if(apply){
 await writeFile(new URL('AleriaAlmanach/modules/house-knight-rings/house-ring-artwork.mjs',root),
  '// Verified original public artwork; local originals are retained.\nexport const HOUSE_RING_ARTWORK = '+JSON.stringify(rings,null,2)+';\n');
 await writeFile(new URL('AleriaAlmanach/modules/gwynthor-seven/equipment-artwork.mjs',root),
  '// Verified original public artwork; local originals are retained.\nexport const GWYNTHOR_EQUIPMENT_ARTWORK = '+JSON.stringify(equipment,null,2)+';\n');
}
const directory=new URL('diagnostics/house-knight-rings-20261102/',root);await mkdir(directory,{recursive:true});
await writeFile(new URL(apply?'artwork-published.json':'artwork-prepared.json',directory),JSON.stringify({applied:apply,images:report},null,2)+'\n');
console.log(JSON.stringify({applied:apply,images:report.length,totalBytes:report.reduce((n,row)=>n+row.size,0)}));
