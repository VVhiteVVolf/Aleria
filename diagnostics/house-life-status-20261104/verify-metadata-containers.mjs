import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {HOUSE_GWYVERN_FAMILY} from '../../Stammbäume/assets/js/data/house-gwyvern-family.js';
import {withHouseBiographyDefault} from '../../Stammbäume/assets/js/modules/house-biography/house-biography-registry-default.js';
import {HOUSE_BIOGRAPHY_DEFAULT_CATALOG} from '../../Stammbäume/assets/js/modules/house-biography/house-biography-default-catalog.js';
const base=new URL('./',import.meta.url),before=JSON.parse(await readFile(new URL('before.json',base),'utf8'));
function strip(value){return Array.isArray(value)?value.map(strip):!value||typeof value!=='object'?value:Object.fromEntries(Object.entries(value).filter(([key])=>!key.startsWith('registryManaged')&&!['sourceRevision','houseLifeStatusCorrectionInventory'].includes(key)).map(([key,value])=>[key,strip(value)]));}
function protect(family){const copy=structuredClone(family);for(const person of copy.persons)if(before.targets[`${copy.document.id}/${person.id}`]){delete person.status;delete person.death;}return strip(copy);}
const prior=protect(withHouseBiographyDefault(HOUSE_GWYVERN_FAMILY,HOUSE_BIOGRAPHY_DEFAULT_CATALOG));
const expected=before.records.find(row=>row.id==='haus-gwyvern').protectedHash;
if(createHash('sha256').update(JSON.stringify(prior)).digest('hex')!==expected)throw new Error('Reconstructed prior source does not match immutable before receipt');
const current=protect(FAMILY_REGISTRY.find(row=>row.id==='haus-gwyvern').family),paths=[];
function walk(old,value,path=[]){
  if(JSON.stringify(old)===JSON.stringify(value))return;
  if(path.at(-1)==='extensions'&&old===undefined&&JSON.stringify(value)==='{}'){paths.push(path);return;}
  if(old&&value&&typeof old==='object'&&typeof value==='object'){
    for(const key of new Set([...Object.keys(old),...Object.keys(value)]))walk(old[key],value[key],[...path,key]);
  }else throw new Error(`Unexpected nonmetadata difference ${path.join('/')}`);
}
walk(prior,current);
await writeFile(new URL('metadata-containers.json',base),JSON.stringify({schema:'aleria.life-status-metadata-containers',note:'New revision metadata needs extension containers. After stripping metadata only these previously absent empty containers remain. Reconstructed prior source matches the immutable before hash exactly.',families:{'haus-gwyvern':paths}},null,2)+'\n');
console.log(JSON.stringify({priorHashVerified:true,newMetadataContainers:paths.length}));
