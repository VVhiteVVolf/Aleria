import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createContentPublicationClient} from './content-publication-client.mjs';
import {decodeFirestoreFields} from '../backup/firestore-value-codec.mjs';
const {request}=await createContentPublicationClient();
const found=[];
const catalogs=[];
let token='';
do {
  const page=await request(`/module_store_entries?pageSize=100&mask.fieldPaths=entryId&mask.fieldPaths=entry&mask.fieldPaths=entryJson${token?`&pageToken=${encodeURIComponent(token)}`:''}`);
  for(const raw of page.documents || []) {
    const data=decodeFirestoreFields(raw.fields);
    const entry=data.entryJson?JSON.parse(data.entryJson):data.entry;
    if(/lachende nixe/i.test(entry?.title || '')) found.push({id:raw.name.split('/').at(-1),entry});
    if(/Weinlaub|Weissmann|Weißmann|Teyrngarch|Penderyn/i.test(entry?.title || '')) catalogs.push(entry);
  }
  token=page.nextPageToken || '';
} while(token);
if(found.length!==1) throw new Error(`Erwartet genau eine Lachende Nixe: ${found.length}`);
const directory=new URL('../../../AleriaAlmanach/modules/lachende-nixe/sources/',import.meta.url);
await mkdir(directory,{recursive:true});
const target=new URL('module-before-finalization.json',directory);
if(!await readFile(target,'utf8').catch(error=>{if(error.code!=='ENOENT') throw error;return null;})) {
  await writeFile(target,JSON.stringify({schemaVersion:1,capturedAt:new Date().toISOString(),...found[0]},null,2)+'\n');
}
await writeFile(new URL('drink-catalogs.json',directory),JSON.stringify(catalogs,null,2)+'\n');
const people=[];
token='';
do {
  const page=await request(`/characters?pageSize=1000&mask.fieldPaths=name&mask.fieldPaths=identity&mask.fieldPaths=genealogy&mask.fieldPaths=portrait&mask.fieldPaths=title&mask.fieldPaths=bio${token?`&pageToken=${encodeURIComponent(token)}`:''}`);
  for(const raw of page.documents || []) {
    const data=decodeFirestoreFields(raw.fields);
    if(/Sonnenfels|Johanna Falkenhayn|Lorcan Scáthaire/i.test(data.name || '')) people.push({id:raw.name.split('/').at(-1),...data});
  }
  token=page.nextPageToken || '';
} while(token);
await writeFile(new URL('existing-people.json',directory),JSON.stringify(people,null,2)+'\n');
console.log(JSON.stringify({people,catalogs:catalogs.map(c=>({id:c.id,title:c.title,products:c.pages?.flatMap(p=>p.tradeCatalog?.items || []).map(i=>({id:i.id,title:i.title,image:i.image,prices:i.priceOptions}))}))}));
console.log(JSON.stringify({id:found[0].id,title:found[0].entry.title,image:found[0].entry.image,symbol:found[0].entry.symbol,pages:found[0].entry.pages.map((page,index)=>({index,title:page.pageTitle,keys:Object.keys(page)}))}));
