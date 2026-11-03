import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const ids=['haus-diafol','haus-dianc','haus-arfordir','haus-dyfrgi','haus-walwrs','haus-blodyn'];
const keys=['persons','partnerships','parentages','houses','timeJumps','cadetBranches'];
const records=ids.map(id=>{
 const record=FAMILY_REGISTRY.find(record=>record.id===id);if(!record)throw new Error(id);
 return {id,title:record.title,folderPath:record.folderPath,graphFingerprint:createHash('sha256').update(JSON.stringify(Object.fromEntries(keys.map(key=>[key,record.family[key]])))).digest('hex')};
});
const destination=new URL('origin-before.json',import.meta.url);
if(!existsSync(destination))writeFileSync(destination,JSON.stringify(records,null,2)+'\n');
console.log(records.map(record=>`${record.id}: ${record.folderPath.join('/')}`).join('\n'));
