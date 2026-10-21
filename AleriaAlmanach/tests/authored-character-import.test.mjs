import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
const prior={registry:{records:[{recordId:'old',familyStatus:'pending',primary:{kind:'group'},path:'keep'}],sourceOverlays:[],sourceExportedAt:'2026-01-01'},
  snapshot:{characters:[{id:'old',inventory:{items:[{id:'live-item'}]},combatProfile:{hitPoints:{current:2}},custom:'keep'}],charTabs:{tabs:['Alle'],map:{}}},
  report:{summary:{sourceDocuments:1,total:1},pending:[],other:'keep'}};
const entries=[{type:'aleria-character',sourcePath:'test/new.json',exportedAt:'2026-10-21',assignedTab:'Schwarze Zitteraale',character:{id:'new',name:'Neu'}}];
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
