import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CombatResolutionService as BrowserService } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { CombatResolutionService as ServerService } from '../src/generated/combat/combat-resolution-service.js';
import { resolveCombatProfile as resolveServer } from '../src/generated/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../src/generated/combat/combat-equipment-state.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { receipts } from '../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';
import { deriveCombatStateFromComments } from '../src/generated/combat/combat-state-model.js';
import { deriveSceneItems } from '../src/generated/scene-items/scene-items-model.js';
import { database } from './fixtures/combat-transaction-database.js';
import { prepareTestAction } from './integration/combat-test-actions.mjs';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { normalizeCombatEncounterEvent } from '../src/generated/combat/combat-encounter-model.js';
const {characters}=JSON.parse(await readFile(new URL('../../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const ylva=withEquippedCombatWeapon(characters.find(c=>c.name==='Ylva Wolfshorn'),'ylva-speer','');
const gais=withEquippedCombatWeapon(characters.find(c=>c.name==='Gais Wyrm'),'starter-uchelwyr-lance','');
for(const id of ['ylva-schafthebel','ylva-aus-der-angriffslinie']) test(`${id}: authoritative server damage, disarm and replay`,async()=>{
  const actor=resolveServer(ylva,{actionId:'technique:'+id,includeAiSnapshot:false});
  const target=id.includes('schaft')?resolveServer(gais,{includeAiSnapshot:false}):actor;
  const browser=await new BrowserService(receipts()).resolveAttack({actor,target});
  const server=await new ServerService(new ProvidedDiceAdapter(browser)).resolveAttack({actor,target});
  assert.equal(!!server.damage,id.includes('schaft')); assert.equal(!!server.nonDamaging,!id.includes('schaft'));
  assert.deepEqual(server.actorResourceSnapshot,browser.actorResourceSnapshot);
  assert.equal(server.targetSnapshot.hitPointsAfter <= target.currentHitPoints,true);
  const history=[{id:'control',characterId:actor.characterId,commentSegments:[{combatResolution:server}]}];
  const state=deriveCombatStateFromComments(history);
  if(id.includes('schaft')){assert.equal(deriveSceneItems(history).size,1);assert.equal(state.get(target.characterId).droppedWeapons.length,1);}
  else assert.ok(state.get(actor.characterId).temporaryConditions.some(c=>c.name==='Aus der Angriffslinie'));
  if(id.includes('schaft')){const invalid=structuredClone(browser);invalid.attack.diceResults=[];await assert.rejects(new ServerService(new ProvidedDiceAdapter(invalid)).resolveAttack({actor,target}));}
});

for(const id of ['ylva-schafthebel','ylva-aus-der-angriffslinie']) test(`${id}: complete server commit consumes exact pools and preserves prior history`,async()=>{
  const entryId='personal-duel-test';
  const start={id:'start',entryId,orderKey:0,serverValidatedMechanics:true,combatEncounter:normalizeCombatEncounterEvent({operation:'start',encounterId:entryId,criticalEffectsVersion:1,combatType:'duel',awardExperience:false,participants:[ylva,gais].map((c,i)=>({actorId:c.id,name:c.name,partyId:String(i),persistence:{kind:'character',recordId:c.id}}))})};
  const db=database({'comments/start':start,['characters/'+ylva.id]:ylva,['characters/'+gais.id]:gais});
  const before=structuredClone(start);
  const prepared=await prepareTestAction({entryId,actorRecord:ylva,targetRecords:[id.includes('schaft')?gais:ylva],comments:[start],actionId:'technique:'+id,dice:receipts([15],1)});
  const result=await commitCombatCommentOperation({auth:{uid:'local-test',token:{aleriaRole:'admin'}},data:prepared.payload},{database:db,nowClient:100});
  const saved=db.data.get('characters/'+ylva.id), resolution=result.mechanics.commentSegments[0].combatResolution;
  assert.equal(!!resolution.damage,id.includes('schaft'));
  assert.equal(saved.combatProfile.hitPoints.current,ylva.combatProfile.hitPoints.current);
  assert.equal(db.data.get('characters/'+gais.id).combatProfile.hitPoints.current < gais.combatProfile.hitPoints.current,id.includes('schaft'));
  assert.deepEqual(db.data.get('comments/start'),before);
  const history=[start,{id:result.id,...db.data.get('comments/'+result.id)}];
  const state=deriveCombatStateFromComments(history).get(ylva.id);
  assert.equal(state.resources.find(r=>r.id==='reaction').current,0);
  if(id.includes('schaft')) { assert.equal(state.resources.find(r=>r.id==='action').current,0); assert.equal(deriveSceneItems(history).size,1); }
  else { assert.equal(saved.combatProfile.resources.find(r=>r.id==='special-action').current,ylva.combatProfile.resources.find(r=>r.id==='special-action').current); assert.equal(state.resources.find(r=>r.id==='special-action').current,ylva.combatProfile.resources.find(r=>r.id==='special-action').current); assert.ok(state.temporaryConditions.some(c=>c.sourceConditionId===id)); }
});
