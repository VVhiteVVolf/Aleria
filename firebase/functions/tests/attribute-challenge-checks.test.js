import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { gradedEvent, person, actorId, opponentId, encounterComment } from '../../../AleriaAlmanach/tests/fixtures/graded-challenge-fixtures.mjs';
import { deriveCombatStateFromComments } from '../src/generated/combat/combat-state-model.js';
import { STANDARD_ITEMS } from '../src/generated/item-register/item-register-standard.js';
import { moneyTotal } from '../src/generated/item-register/item-register-money.js';

const gm={uid:'gm',token:{aleriaRole:'admin'}},player={uid:'player',token:{aleriaRole:'player'}};
const keys=['strength','dexterity','constitution','intelligence','wisdom','charisma'];
const history=db=>[...db.data].filter(([key])=>key.startsWith('comments/')).map(([key,value])=>({id:key.split('/')[1],...value}));
function attempt(id,skillId,natural=10,kind='interact') {return {auth:player,data:{entryId:'scene',charName:'Ylva',text:'Ich versuche es.',metadata:{characterId:actorId,commentSegments:[{
  kind,commentKind:kind,text:'Ich versuche es.',mechanicMode:'skill',skillId,skillTargetChallengeId:id,
  skillResolution:{resolutionId:'test',actorId,actorPersistence:{kind:'character',recordId:actorId},natural,diceResults:[natural],total:999,profileModifier:999,affinityModifier:999}
}]}}};}

for(const [index,key]of keys.entries())for(const type of ['attribute','save']){
  test(`server resolves ${type}:${key} from its own sheet and ignores fabricated totals`,async()=>{
    const figure=person(actorId);figure.combatProfile.progression={level:5};
    figure.combatProfile.attributes=keys.map(key=>({key,score:14}));
    figure.combatProfile.savingThrows=keys.map((attributeKey,i)=>({attributeKey,proficient:true,expertise:i%2===1,bonus:1}));
    const db=database({['characters/'+actorId]:figure});const skillId=type+':'+key;
    const event={title:'Eine Prüfung',publicDescription:'Eine Gefahr kündigt sich an.',approaches:[{approachId:'test',preferredSkills:[skillId],difficulty:40,insight:'Eine Erkenntnis.'}]};
    const created=await commitHerausforderungOperation({auth:gm,data:{entryId:'scene',text:'Prüfung',metadata:{herausforderung:event}}},{database:db,now:100});
    const original=structuredClone(db.data.get('characters/'+actorId));
    const result=await commitSkillCommentOperation(attempt(`herausforderung:${created.id}:test`,skillId),{database:db,now:200});
    const resolved=result.mechanics.commentSegments[0].skillResolution;
    assert.equal(resolved.profileModifier,type==='attribute'?2:index%2===1?9:6);
    assert.equal(resolved.total,10+resolved.profileModifier);assert.equal(resolved.affinityModifier,0);
    assert.equal(resolved.checkType,type==='attribute'?'attribute':'saving-throw');
    assert.deepEqual(db.data.get('characters/'+actorId),original);
  });
}

for(const natural of [15,20])test(`challenge remains editable after a completed attempt (${natural}), preserving all awarded effects and records`,async()=>{
  const db=database({'comments/start':encounterComment(),['characters/'+actorId]:person(actorId),['characters/'+opponentId]:person(opponentId)});
  const created=await commitHerausforderungOperation({auth:gm,data:{entryId:'scene',text:'Prüfung',metadata:{herausforderung:gradedEvent()}}},{database:db,now:100});
  const result=await commitSkillCommentOperation(attempt(`herausforderung:${created.id}:read-move`,'perception',natural,'thought'),{database:db,now:200});
  const old=new Map(structuredClone([...db.data]));const beforeState=deriveCombatStateFromComments(history(db));
  const event=gradedEvent();event.title='Bearbeitete Herausforderung';event.publicDescription='Die korrigierte Beschreibung.';
  event.approaches[0].preferredSkills.push('save:wisdom');event.approaches[0].outcomeTable[1].minimumTotal=19;
  const payload={auth:gm,data:{entryId:'scene',text:'Korrigierte Prüfung',metadata:{commentId:created.id,expectedRevision:0,operationId:'edit-operation-001',herausforderung:event}}};
  const edited=await commitHerausforderungOperation(payload,{database:db,now:300});assert.equal(edited.id,created.id);
  const saved=db.data.get('comments/'+created.id);assert.equal(saved.herausforderungRevision,1);assert.equal(saved.herausforderung.title,event.title);
  assert.deepEqual(saved.herausforderung.approaches[0].preferredSkills,event.approaches[0].preferredSkills);
  assert.equal(saved.orderKey,old.get('comments/'+created.id).orderKey);assert.equal(saved.createdBy,old.get('comments/'+created.id).createdBy);
  for(const [key,value]of old)if(key!=='comments/'+created.id)assert.deepEqual(db.data.get(key),value,key);
  assert.deepEqual(deriveCombatStateFromComments(history(db)),beforeState);
  const after=structuredClone([...db.data]);await commitHerausforderungOperation(payload,{database:db,now:301});assert.deepEqual([...db.data],after,'retry is idempotent');
  await assert.rejects(commitHerausforderungOperation({...payload,data:{...payload.data,metadata:{...payload.data.metadata,operationId:'another-operation'}}},{database:db,now:302}),/inzwischen geändert/);
  assert.deepEqual([...db.data],after,'stale edits do not overwrite another edit');
});

test('an ended encounter can still be edited without rebinding the challenge to a different fight',async()=>{
  const db=database({'comments/start':encounterComment(),['characters/'+actorId]:person(actorId),['characters/'+opponentId]:person(opponentId)});
  const created=await commitHerausforderungOperation({auth:gm,data:{entryId:'scene',text:'Prüfung',metadata:{herausforderung:gradedEvent()}}},{database:db,now:100});
  db.data.set('comments/end',{...encounterComment(),orderKey:200,combatEncounter:{operation:'end',encounterId:'duel',awardExperience:false}});
  const event=gradedEvent();event.title='Nachträglich präzisiert';
  await commitHerausforderungOperation({auth:gm,data:{entryId:'scene',text:event.title,metadata:{commentId:created.id,expectedRevision:0,operationId:'edit-ended-001',herausforderung:event}}},{database:db,now:300});
  assert.equal(db.data.get('comments/'+created.id).herausforderung.combatContext.encounterId,'duel');
});

test('saving throw advantage uses its two real dice and rejects an inconsistent kept die',async()=>{
  const figure=person(actorId);figure.combatProfile.conditions=[{id:'save-adv',name:'Standhaft',active:true,mechanics:{savingThrowAdvantageAttributes:['wisdom'],skillRollMode:'disadvantage'}}];
  const db=database({['characters/'+actorId]:figure});const event={publicDescription:'Eine geistige Prüfung.',approaches:[{approachId:'save',preferredSkills:['save:wisdom'],difficulty:15,insight:'Du bleibst standhaft.'}]};
  const created=await commitHerausforderungOperation({auth:gm,data:{entryId:'scene',text:'Prüfung',metadata:{herausforderung:event}}},{database:db,now:100});
  const payload=attempt(`herausforderung:${created.id}:save`,'save:wisdom',4);payload.data.metadata.commentSegments[0].skillResolution.diceResults=[4,18];
  const before=structuredClone([...db.data]);await assert.rejects(commitSkillCommentOperation(payload,{database:db,now:200}),/W20|Würfel/);assert.deepEqual([...db.data],before);
  payload.data.metadata.commentSegments[0].skillResolution.natural=18;
  const result=await commitSkillCommentOperation(payload,{database:db,now:201});const resolution=result.mechanics.commentSegments[0].skillResolution;
  assert.equal(resolution.rollMode,'advantage');assert.equal(resolution.natural,18);assert.equal(resolution.total,18);
});

test('a graded critical success grants register items and copper exactly once without doubling or changing live HP',async()=>{
  const figure=person(actorId),opponent=person(opponentId);
  const db=database({'comments/start':encounterComment(),['characters/'+actorId]:figure,['characters/'+opponentId]:opponent});
  const weapon=STANDARD_ITEMS.find(item=>item.category==='waffen'&&item.combatDefinition);
  const event=gradedEvent();event.approaches[0].outcomeTable[0].benefits.copper=2.5;
  event.approaches[0].outcomeTable[0].benefits.items=[{template:weapon.id,quantity:1}];
  const created=await commitHerausforderungOperation({auth:gm,data:{entryId:'scene',text:'Prüfung',metadata:{herausforderung:event}}},{database:db,now:100});
  const payload=attempt(`herausforderung:${created.id}:read-move`,'perception',20,'thought');
  await commitSkillCommentOperation(payload,{database:db,now:200});const saved=db.data.get('characters/'+actorId);
  assert.equal(moneyTotal(saved.inventory.moneyState),2.5);assert.equal(saved.inventory.items.length,1);
  assert.equal(saved.inventory.items[0].templateId,weapon.id);assert.equal(saved.inventory.items[0].equipped,false);
  assert.deepEqual(saved.combatProfile.hitPoints,figure.combatProfile.hitPoints);
  const before=structuredClone([...db.data]);await assert.rejects(commitSkillCommentOperation(payload,{database:db,now:201}),/bereits|nicht mehr/);assert.deepEqual([...db.data],before);
});
