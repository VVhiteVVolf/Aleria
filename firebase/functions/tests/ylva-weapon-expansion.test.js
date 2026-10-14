import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addYlvaDuelTechniques } from '../../../AleriaAlmanach/modules/characters/personal-techniques/ylva-duel-techniques.js';
import { CombatResolutionService as Browser } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { CombatResolutionService as Server } from '../src/generated/combat/combat-resolution-service.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../src/generated/combat/combat-equipment-state.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { receipts } from '../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';
import { database } from './fixtures/combat-transaction-database.js';
import { prepareTestAction } from './integration/combat-test-actions.mjs';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { normalizeCombatEncounterEvent } from '../src/generated/combat/combat-encounter-model.js';
import { deriveCombatStateFromComments } from '../src/generated/combat/combat-state-model.js';
const {characters}=JSON.parse(await readFile(new URL('../../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const ylva=withEquippedCombatWeapon(addYlvaDuelTechniques(characters.find(c=>c.name==='Ylva Wolfshorn')),'ylva-speer','');
const gais=withEquippedCombatWeapon(characters.find(c=>c.name==='Gais Wyrm'),'starter-uchelwyr-lance','');
const actionId='technique:ylva-drei-dornen-ein-sturz';
for(const rolls of [[15,15,15],[2,2,2],[2,15,2],[20,20,20]]) test(`authoritative triple ${rolls}: receipts and final save`,async()=>{
  const actor=resolveCombatProfile(ylva,{actionId,includeAiSnapshot:false}),target=resolveCombatProfile(gais,{includeAiSnapshot:false});
  const browser=await new Browser(receipts([...rolls])).resolveAttack({actor,target});
  const server=await new Server(new ProvidedDiceAdapter(browser)).resolveAttack({actor,target});
  assert.deepEqual(server.targetSnapshot,browser.targetSnapshot);
  assert.deepEqual(server.followUpAttacks.map(f=>f.damage?.total),browser.followUpAttacks.map(f=>f.damage?.total));
  assert.equal(server.secondarySaves.length,1); assert.equal(server.secondarySaves[0].dc,18);
  const missing=structuredClone(browser);missing.secondarySaves=[];
  await assert.rejects(new Server(new ProvidedDiceAdapter(missing)).resolveAttack({actor,target}));
});

test('new triple commits during an existing encounter; only own pools reset, history and live special pool survive',async()=>{
  const entryId='ylva-expansion';
  const start={id:'start',entryId,orderKey:0,serverValidatedMechanics:true,combatEncounter:normalizeCombatEncounterEvent({operation:'start',encounterId:entryId,combatType:'duel',awardExperience:false,
    participants:[ylva,gais].map((c,i)=>({actorId:c.id,name:c.name,partyId:String(i),persistence:{kind:'character',recordId:c.id}}))})};
  const spent={id:'spent',entryId,orderKey:1,characterId:gais.id,serverValidatedMechanics:true,combatResolution:{actorId:gais.id,targetId:ylva.id,
    targetSnapshot:{hitPointsAfter:ylva.combatProfile.hitPoints.current,maximumHitPoints:95},
    actorResourceSnapshot:{after:resolveCombatProfile(gais).resources.map(r=>({...r,current:r.scope==='comment'?0:r.current}))}}};
  const db=database({'comments/start':start,'comments/spent':spent,['characters/'+ylva.id]:ylva,['characters/'+gais.id]:gais});
  const prepared=await prepareTestAction({entryId,actorRecord:ylva,targetRecords:[gais],comments:[start,spent],actionId,dice:receipts([2,2,2],1),orderKey:2});
  const result=await commitCombatCommentOperation({auth:{uid:'test',token:{aleriaRole:'admin'}},data:prepared.payload},{database:db,nowClient:100});
  const saved=result.mechanics.commentSegments[0].combatResolution;
  assert.equal(saved.followUpAttacks.length,2); assert.equal(saved.secondarySaves.length,1);
  assert.deepEqual(db.data.get('comments/spent'),spent);
  const state=deriveCombatStateFromComments([start,spent,{id:result.id,characterId:ylva.id,commentSegments:result.mechanics.commentSegments}]);
  for(const id of [ylva.id,gais.id]) assert.equal(state.get(id).resources.find(r=>r.id==='reaction').current,0);
  assert.equal(state.get(ylva.id).resources.find(r=>r.id==='special-action').current,resolveCombatProfile(ylva).resources.find(r=>r.id==='special-action').current);
  assert.equal(state.get(ylva.id).temporaryConditions[0].durationModel.remainingActorComments,1);
  assert.equal(state.get(ylva.id).temporaryConditions[0].durationModel.expiresAt,undefined);
  assert.equal(state.get(gais.id).temporaryConditions[0].blockedResource,'reaction');
});
