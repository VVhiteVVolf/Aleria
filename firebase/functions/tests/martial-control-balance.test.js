import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CombatResolutionService as BrowserService } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { CombatResolutionService as ServerService } from '../src/generated/combat/combat-resolution-service.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../src/generated/combat/combat-equipment-state.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { prepareTestAction } from './integration/combat-test-actions.mjs';
import { database } from './fixtures/combat-transaction-database.js';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { normalizeCombatEncounterEvent } from '../src/generated/combat/combat-encounter-model.js';
import { receipts } from '../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';

const semantic=value=>JSON.parse(JSON.stringify(value),(key,value)=>['visualMode','notation'].includes(key)?undefined:value);
const {characters}=JSON.parse(await readFile(new URL('../../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const gais=withEquippedCombatWeapon(characters.find(c=>c.name==='Gais Wyrm'),'starter-uchelwyr-lance','');
const ylva=withEquippedCombatWeapon(characters.find(c=>c.name==='Ylva Wolfshorn'),'ylva-speer','');

for(const name of ['Wyrmsbrecher','Haken des Jungdrachens','Fallende Schwinge','Erstickte Antwort','Zügelhand'])
  for(const roll of [15,20]) test(`${name}, roll ${roll}: server verifies every damage die and secondary save`,async()=>{
    const base=resolveCombatProfile(gais,{includeAiSnapshot:false});
    const actionId=base.actions.find(a=>a.name===name).id;
    const actor=resolveCombatProfile(gais,{actionId,includeAiSnapshot:false});
    const target={...resolveCombatProfile(ylva,{includeAiSnapshot:false}),totalDefense:10};
    const client=await new BrowserService(receipts([roll],1)).resolveAttack({actor,target});
    const verified=await new ServerService(new ProvidedDiceAdapter(client)).resolveAttack({actor,target});
    assert.deepEqual(semantic(verified.damage),semantic(client.damage));
    assert.deepEqual(semantic(verified.secondarySaves),semantic(client.secondarySaves));
    assert.deepEqual(verified.actorResourceSnapshot,client.actorResourceSnapshot);
    const invalid=structuredClone(client);invalid.damage.diceResults.pop();
    await assert.rejects(new ServerService(new ProvidedDiceAdapter(invalid)).resolveAttack({actor,target}));
    if(name==='Wyrmsbrecher')assert.equal(verified.damage.diceResults.length,3);
    if(actor.selectedAction.secondarySave){const missing=structuredClone(client);missing.secondarySaves=[];
      await assert.rejects(new ServerService(new ProvidedDiceAdapter(missing)).resolveAttack({actor,target}));}
  });

test('Wyrmsbrecher full transaction spends all declared costs once and keeps prior duel history',async()=>{
  const entryId='martial-control-duel';
  const start={id:'start',entryId,orderKey:0,serverValidatedMechanics:true,combatEncounter:normalizeCombatEncounterEvent({operation:'start',encounterId:entryId,
    criticalEffectsVersion:1,combatType:'duel',awardExperience:false,participants:[gais,ylva].map((c,i)=>({actorId:c.id,name:c.name,partyId:String(i),persistence:{kind:'character',recordId:c.id}}))})};
  const prior={id:'prior',entryId,orderKey:1,characterId:ylva.id,text:'Unveränderter früherer Beitrag'};
  const db=database({'comments/start':start,'comments/prior':prior,['characters/'+gais.id]:gais,['characters/'+ylva.id]:ylva});
  const prepared=await prepareTestAction({entryId,actorRecord:gais,targetRecords:[ylva],comments:[start,prior],actionId:'technique:gais-wyrmsbrecher',dice:receipts([15],1)});
  const committed=await commitCombatCommentOperation({auth:{uid:'local-test',token:{aleriaRole:'admin'}},data:prepared.payload},{database:db,nowClient:100});
  const result=committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.damage.diceResults.length,3);
  assert.deepEqual(result.resourceCosts.map(c=>[c.resourceId,c.amount]),[['action',1],['bonus-action',1],['reaction',1],['special-action',1]]);
  assert.equal(result.actorResourceSnapshot.after.find(r=>r.id==='special-action').current,gais.combatProfile.resources.find(r=>r.id==='special-action').current-1);
  assert.deepEqual(db.data.get('comments/start'),start); assert.deepEqual(db.data.get('comments/prior'),prior);
  assert.equal(db.data.get('characters/'+gais.id).combatProfile.hitPoints.current,gais.combatProfile.hitPoints.current);
  assert.ok(db.data.get('characters/'+ylva.id).combatProfile.hitPoints.current<ylva.combatProfile.hitPoints.current);
});
