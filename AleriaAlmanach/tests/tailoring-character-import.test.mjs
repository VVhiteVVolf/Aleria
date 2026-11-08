import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildTailoringCharacterExports, TAILORING_EXISTING_RUNTIME_IDS } from '../modules/gwniwr-maerllys/characters.mjs';
import { REVIEWED_EXISTING_CHARACTERS } from '../modules/gwniwr-maerllys/reviewed-existing-characters.mjs';
import { projectTailoringCharacterDatabase } from '../modules/gwniwr-maerllys/character-database.mjs';
const exports=buildTailoringCharacterExports(FAMILY_REGISTRY,REVIEWED_EXISTING_CHARACTERS);
test('31 named figures keep distinct IDs; unknown ancestors and vacancies stay outside the archive',()=>{
 assert.equal(exports.length,31);assert.equal(new Set(exports.map(e=>e.character.id)).size,31);
 assert.ok(exports.every(e=>!e.character.name.includes('?')&&!e.character.name.startsWith('Unbekannt')));
 for(const[world,id]of Object.entries(TAILORING_EXISTING_RUNTIME_IDS))assert.equal(exports.find(e=>e.character.identity.worldPersonId===world).character.id,id);
});
test('all new people plus Nia and Hywel have individual structured three-paragraph bios',()=>{
 const reviewed=exports.filter(e=>e.character.bio);
 assert.equal(reviewed.length,28);assert.equal(new Set(reviewed.map(e=>e.character.bio)).size,28);
 for(const{character:c}of reviewed){assert.ok(c.bio.length>600,c.name);assert.equal(c.bio.split('\n\n').length,3);assert.equal(c.biography.schema,'aleria.biography-module');assert.doesNotMatch(c.bio,/Weltidentit|Repository|Gegenakte|JSON|Porträt.*erhalten|zweites Mal/);}
});
test('existing profiles receive metadata only while Hywel retains seven children and founders retain Raves children',()=>{
 for(const e of exports.filter(e=>Object.values(TAILORING_EXISTING_RUNTIME_IDS).includes(e.character.id))){for(const key of['portrait','imageSets','activeImageSetId','emotes','inventory','combatProfile','role','title','fraktion'])assert.equal(Object.hasOwn(e.character,key),false,`${e.character.name}/${key}`);}
 assert.equal(exports.find(e=>e.character.id==='XVeiNvgFfsmtomLuIjcA').character.genealogy.relationships.children.length,7);
 for(const id of['person--haus-maerllys--gwenora-maerllys','person--haus-veltrane--matteo-veltrane'])assert.ok(exports.find(e=>e.character.id===id).character.genealogy.relationships.children.length>0,id);
 assert.match(exports.find(e=>e.character.id==='qN5et9e7KaWlIPTSrsXt').character.bio,/persönliche Zofe/);
});
test('the imports create no inventories or combat values and assign no children to jobs',()=>{
 for(const{character:c}of exports){for(const key of['inventory','combatProfile','money','equipment','attributes','skills'])assert.ok(!Object.hasOwn(c,key));}
 for(const id of['person-178882ce','person-558acc56','person-38812666','person-d55e335a']){const c=exports.find(e=>e.sourcePath.endsWith(`/${id}.json`)).character;assert.equal(c.role,'');}
});
test('the bounded projector preserves all unrelated local characters and remains idempotent',async()=>{
 const root=new URL('../../',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
 const[registry,snapshot,report]=await Promise.all(['CharakterDatenbank/registry.json','CharakterDatenbank/generated/characters.snapshot.json','CharakterDatenbank/generated/sync-report.json'].map(read));
 const ids=new Set(exports.map(e=>e.character.id));
 const existingRecords=await Promise.all(registry.records.filter(r=>ids.has(r.firestoreDocumentId)).map(r=>read(`CharakterDatenbank/${r.path}`)));
 const result=projectTailoringCharacterDatabase({registry,snapshot,report,existingRecords},FAMILY_REGISTRY);
 assert.deepEqual(result.snapshot.characters.filter(c=>!ids.has(c.id)),snapshot.characters.filter(c=>!ids.has(c.id)));
 assert.deepEqual(result.registry.records.filter(r=>!ids.has(r.firestoreDocumentId)),registry.records.filter(r=>!ids.has(r.firestoreDocumentId)));
 assert.deepEqual(result.snapshot,snapshot);
});

test('a genuinely fresh bounded import is immediately idempotent without adding duplicate source IDs',async()=>{
 const root=new URL('../../',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
 const[registry,snapshot,report]=await Promise.all(['CharakterDatenbank/registry.json','CharakterDatenbank/generated/characters.snapshot.json','CharakterDatenbank/generated/sync-report.json'].map(read));
 const ids=new Set(exports.map(e=>e.character.id));
 const basis={registry:{...registry,records:registry.records.filter(r=>!ids.has(r.firestoreDocumentId))},snapshot:{...snapshot,characters:snapshot.characters.filter(c=>!ids.has(c.id))},report,existingRecords:[]};
 const first=projectTailoringCharacterDatabase(basis,FAMILY_REGISTRY);
 assert.equal(first.newCount,31);
 const next=projectTailoringCharacterDatabase({...first,existingRecords:first.records.map(item=>item.record)},FAMILY_REGISTRY);
 assert.deepEqual(next.snapshot,first.snapshot);
 assert.deepEqual(next.registry,first.registry);
 for(const projection of next.records){const previous=first.records.find(item=>item.record.character.id===projection.record.character.id);assert.deepEqual(projection.record.sync.sourceDocumentIds,previous.record.sync.sourceDocumentIds,projection.record.character.name);}
});
