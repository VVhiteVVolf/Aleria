import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { buildUnderworldRegistrations,UNDERWORLD_PATH } from '../modules/gwynthor-underworld/underworld-modules.mjs';
import { RAT_PEOPLE } from '../modules/gwynthor-underworld/underworld-people.mjs';
import { buildUnderworldCharacterExports } from '../modules/gwynthor-underworld/underworld-characters.mjs';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
const root=new URL('../../',import.meta.url),json=async p=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'));
const registrations=buildUnderworldRegistrations();
test('archive registration is idempotent, retains an edited existing entry and places both sibling modules in the requested city category',()=>{
  const edited={...registrations[0].entry,subtitle:'Lokale Bearbeitung bleibt erhalten'};
  const neighbor={id:'neighbor',pages:[]};
  const context={SECTIONS:[{tab:'Völker & Kulturen',path:['Alt'],entries:[edited,neighbor]}]};
  const source=renderArchiveSectionRegistration('registerTestUnderworld',registrations,'test');
  vm.runInNewContext(source,context);vm.runInNewContext(source,context);
  const target=context.SECTIONS.find(s=>JSON.stringify(s.path)===JSON.stringify(UNDERWORLD_PATH));
  assert.equal(target.entries.length,2);assert.strictEqual(target.entries[0],edited);
  assert.equal(target.entries[0].subtitle,'Lokale Bearbeitung bleibt erhalten');
  assert.strictEqual(context.SECTIONS[0].entries[0],neighbor);
});
test('nine rooms have independent stable threads without generating additional destinations or a shared comment page',()=>{
  const entries=registrations.map(r=>r.entry);
  assert.deepEqual(entries.map(e=>e.pages.length),[9,4]);
  assert.deepEqual(entries.map(e=>e.pages.filter(p=>p.sessionPage).length),[5,4]);
  assert(entries.every(e=>e.appendCommentsPage===false));
  const keys=entries.flatMap(e=>e.pages.map(p=>p.commentThreadKey));
  assert.equal(new Set(keys).size,keys.length);
  assert(entries[1].pages.every(p=>p.sessionPage));
  assert(entries[1].pages.every(p=>!('accessCode'in p)&&!('password'in p)&&!('secret'in p)));
});
test('all requested staff resolve to unique adult world identities and stand-alone exports without fabricated family relationships',()=>{
  const exports=buildUnderworldCharacterExports();
  assert.equal(exports.length,13);assert.equal(new Set(exports.map(e=>e.character.id)).size,13);
  assert(RAT_PEOPLE.every(p=>p.age>=18));
  assert.deepEqual(RAT_PEOPLE.slice(1,7).map(p=>p.age).sort((a,b)=>a-b),[23,24,25,26,28,30]);
  assert(RAT_PEOPLE.slice(10).some(p=>p.origin==='Aldrimar'));
  assert(RAT_PEOPLE.slice(10).some(p=>p.origin.includes('Leitheach')));
  assert(RAT_PEOPLE.slice(10).some(p=>p.origin.includes('Ceitheach')));
  for(const {character} of exports) {assert.equal(character.identity.worldPersonId,character.id);assert.deepEqual(character.genealogy.sources,[]);assert(!character.genealogy.relationships);assert(!character.inventory);assert(!character.combatProfile);}
});
test('every public image matches its admitted source hash and the selected revisions are active',async()=>{
  const manifest=await json('AleriaAlmanach/assets/gwynthor-underworld/manifest.json');
  assert.equal(manifest.active.length,30);assert.equal(manifest.images.length,30);
  for(const image of manifest.images) {
    const active=await fs.readFile(new URL(image.path,root));
    assert.equal(createHash('sha256').update(active).digest('hex'),image.sha256);
    if(image.path.includes('/portraits/')||image.path.includes('/scenes/')) assert(Math.abs(image.width/image.height-2/3)<0.01,image.path);
  }
  const paths=new Set(manifest.active.map(i=>'./'+i.path.replace('AleriaAlmanach/','')));
  const walk=value=>{if(typeof value==='string'&&value.startsWith('./assets/gwynthor-underworld/'))assert(paths.has(value),value);else if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')Object.values(value).forEach(walk);};
  registrations.forEach(walk);buildUnderworldCharacterExports().forEach(walk);
  assert(RAT_PEOPLE[0].portrait.endsWith('cadwren-brithog-v5.png'));
  for(const person of RAT_PEOPLE.slice(10))assert(person.portrait.endsWith('-v2.png'));
  assert.equal(createHash('sha256').update(await fs.readFile(new URL("AleriaAlmanach/assets/gwynthor-underworld/portraits/cadwren-brithog-v5.png",root))).digest('hex'),"0d2ae091c5166e5574fc25f0327c0b35f3b2c6e4cac0ecbbca8f74bdeb7631f6",'User-selected owner bytes.');
  assert(registrations[1].entry.pages[1].image.endsWith('schlickmarkt-v2.png'));
});
test('bounded character projection is idempotent and preserves all unrelated snapshot profiles',async()=>{
  const [registry,snapshot,report]=await Promise.all(['registry.json','generated/characters.snapshot.json','generated/sync-report.json'].map(p=>json('CharakterDatenbank/'+p)));
  const exports=buildUnderworldCharacterExports(),ids=new Set(exports.map(e=>e.character.id));
  const existingRecords=await Promise.all(registry.records.filter(r=>ids.has(r.firestoreDocumentId)).map(r=>json('CharakterDatenbank/'+r.path)));
  const result=buildAuthoredCharacterImport({registry,snapshot,report,existingRecords},exports,'gwynthor-underworld-20261114',[]);
  assert.deepEqual(result.snapshot,snapshot);assert.deepEqual(result.registry,registry);
  for(const entry of exports) assert.equal(snapshot.characters.filter(c=>c.id===entry.character.id).length,1);
});
