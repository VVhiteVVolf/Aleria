import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { matchCharacterToFamily } from '../../CharakterDatenbank/lib/character-database-model.mjs';
const prior={registry:{records:[{recordId:'old',familyStatus:'pending',primary:{kind:'group'},path:'keep'}],sourceOverlays:[],sourceExportedAt:'2026-01-01'},
  snapshot:{characters:[{id:'old',inventory:{items:[{id:'live-item'}]},combatProfile:{hitPoints:{current:2}},custom:'keep'}],charTabs:{tabs:['Alle'],map:{}}},
  report:{summary:{sourceDocuments:1,total:1},pending:[],other:'keep'}};
const entries=[{type:'aleria-character',sourcePath:'test/new.json',exportedAt:'2026-10-21',assignedTab:'Schwarze Zitteraale',character:{id:'new',name:'Neu'}}];
test('explicit world identity links a single given name and prevents another namesakes assignment',()=>{
  const candidates=[{familyId:'family',personId:'mother',worldPersonId:'person--mother',displayName:'Gwenella',recordedName:'Gwenella'},
    {familyId:'other',personId:'namesake',worldPersonId:'person--other',displayName:'Gwenella',recordedName:'Gwenella'}];
  const linked=matchCharacterToFamily({name:'Gwenella',identity:{worldPersonId:'person--mother'}},candidates);
  assert.equal(linked.status,'linked');
  assert.equal(linked.primary.personId,'mother');
  assert.equal(matchCharacterToFamily({name:'Gwenella',identity:{worldPersonId:'person--absent'}},candidates).status,'pending');
  assert.equal(matchCharacterToFamily({name:'Gwenella'},candidates).status,'pending');
});
test('bounded import preserves every unrelated record and live field, and is idempotent',()=>{
  const result=buildAuthoredCharacterImport(prior,entries,'test');
  assert.deepEqual(result.snapshot.characters[0],prior.snapshot.characters[0]);
  assert.deepEqual(result.registry.records[0],prior.registry.records[0]);
  assert.equal(result.report.other,'keep');
  assert.deepEqual(buildAuthoredCharacterImport(result,entries,'test'),result);
  assert.equal(prior.snapshot.characters.length,1);
});
test('authored additions cannot overwrite a preexisting person or another feature',()=>{
  assert.throws(()=>buildAuthoredCharacterImport(prior,[{...entries[0],character:{id:'old',name:'Replacement'}}],'test'),/nicht überschrieben/);
});
test('bounded projection counts retained historical document IDs instead of carrying a stale report count',()=>{
  const existing=structuredClone(prior);
  existing.registry.records[0].firestoreDocumentIds=['legacy-one','legacy-two'];
  const result=buildAuthoredCharacterImport(existing,entries,'test');
  assert.equal(result.report.summary.sourceDocuments,3);
  assert.deepEqual(result.registry.records[0],existing.registry.records[0]);
});
test('independent bounded imports remain reproducible after another feature adds people',()=>{
  const first=buildAuthoredCharacterImport(prior,entries,'first');
  const secondEntry={...entries[0],sourcePath:'test/second.json',character:{id:'second',name:'Zweite Person'}};
  const second=buildAuthoredCharacterImport(first,[secondEntry],'second');
  const repeated=buildAuthoredCharacterImport(second,entries,'first');
  for(const projection of ['registry','snapshot','report'])assert.deepEqual(repeated[projection],second[projection],projection);
});

test('a historical authored import preserves a newer confirmed record and consumed resources',()=>{
  const first=buildAuthoredCharacterImport(prior,entries,'test');
  const record=structuredClone(first.records[0].record),person=structuredClone(first.snapshot.characters.find(character=>character.id==='new'));
  const sourcePath='Charakter Archiv Exporte/Bestätigte Prüfung/new.json';
  record.character.inventory={items:[{id:'later-owned-item'}],money:'7 Kupfer'};
  record.character.combatProfile={hitPoints:{current:2},resources:[{id:'used',current:0}]};
  record.sync.sourceArchive=sourcePath;record.sync.sourceExportedAt='2026-11-03T00:00:00Z';
  person.inventory=structuredClone(record.character.inventory);person.combatProfile=structuredClone(record.character.combatProfile);
  const registry={...first.registry,sourceOverlays:[...first.registry.sourceOverlays,sourcePath]};
  const snapshot={...first.snapshot,characters:first.snapshot.characters.map(character=>character.id==='new'?person:character),sourceOverlays:[...first.snapshot.sourceOverlays,sourcePath]};
  const result=buildAuthoredCharacterImport({registry,snapshot,report:first.report,existingRecords:[record]},entries,'test');
  assert.deepEqual(result.records[0].record,record);
  assert.deepEqual(result.snapshot.characters.find(character=>character.id==='new'),person);
});
