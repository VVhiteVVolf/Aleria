import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { gradedEvent, person, actorId, opponentId, encounterComment } from '../../../AleriaAlmanach/tests/fixtures/graded-challenge-fixtures.mjs';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { deriveCombatStateFromComments } from '../src/generated/combat/combat-state-model.js';

const history = db => [...db.data].filter(([key])=>key.startsWith('comments/')).map(([key,data])=>({id:key.split('/').at(-1),...data}));
const auth={uid:'player',token:{aleriaRole:'player'}};
async function setup(){
  const db=database({'comments/start':encounterComment(),['characters/'+actorId]:person(actorId),['characters/'+opponentId]:person(opponentId)});
  const created=await commitHerausforderungOperation({auth:{uid:'gm',token:{aleriaRole:'admin'}},data:{entryId:'scene',text:'A challenge',metadata:{herausforderung:gradedEvent()}}},{database:db,now:100});
  const targetId=`herausforderung:${created.id}:read-move`;
  const attempt=natural=>({auth,data:{entryId:'scene',charName:actorId,text:'Studies the stance.',metadata:{characterId:actorId,commentSegments:[{
    commentKind:'thought',kind:'thought',mechanicMode:'skill',skillId:'perception',skillDifficulty:18,skillTargetChallengeId:targetId,text:'Studies the stance.',
    skillResolution:{resolutionId:'submitted',actorId,actorPersistence:{kind:'character',recordId:actorId},natural,diceResults:[natural],total:999,herausforderungTier:'critical-success',herausforderungCombatSnapshots:[{actorId,after:{current:999}}]}
  }]}}});
  return {db,attempt,created};
}

for(const [natural,tier,recipient,count] of [[20,'critical-success',actorId,1],[18,'success',actorId,1],[15,'partial',actorId,1],[12,'neutral',actorId,0],[7,'failure',opponentId,1],[2,'major-failure',actorId,1],[1,'critical-failure',opponentId,1]]) {
  test(`server validates ${tier}, ignores forged effects and atomically prevents any second attempt`,async()=>{
    const {db,attempt,created}=await setup();
    const originalChallenge=structuredClone(db.data.get('comments/'+created.id));
    const originalFigures=[actorId,opponentId].map(id=>structuredClone(db.data.get('characters/'+id)));
    const result=await commitSkillCommentOperation(attempt(natural),{database:db,now:200});
    const resolution=result.mechanics.commentSegments[0].skillResolution;
    assert.equal(resolution.herausforderungTier,tier);
    assert.equal(resolution.total,natural);
    assert.equal(resolution.revealedText,gradedEvent().approaches[0].outcomeTable.find(row=>row.id===tier).text);
    assert.equal(resolution.herausforderungCombatResults?.length || 0,count);
    if(count)assert.equal(resolution.herausforderungCombatResults[0].actorId,recipient);
    assert.deepEqual(db.data.get('comments/'+created.id),originalChallenge);
    for(const [index,id]of [actorId,opponentId].entries())assert.deepEqual(db.data.get('characters/'+id),originalFigures[index]);
    const beforeRetry=structuredClone([...db.data]);
    await assert.rejects(commitSkillCommentOperation(attempt(20),{database:db,now:201}),/bereits|nicht mehr/);
    assert.deepEqual([...db.data],beforeRetry,'rejected attempts must not write claims, profiles or posts');
  });
}

test('one-shot attack bonuses are consumed by the authoritative combat transaction and replay identically',async()=>{
  const {db,attempt}=await setup();
  await commitSkillCommentOperation(attempt(15),{database:db,now:200});
  const before=deriveCombatStateFromComments(history(db)).get(actorId).temporaryConditions;
  assert.equal(before.length,1);
  const segment={commentKind:'combataction',actorId,text:'Attacks.',combatAction:{encounterId:'duel',profileActionId:'weapon:sword'},combatResolution:{resolutionId:'untrusted',actorId,targetId:opponentId,
    actorPersistence:{kind:'character',recordId:actorId},targetPersistence:{kind:'character',recordId:opponentId},profileActionId:'weapon:sword',attack:{naturalRoll:10,diceResults:[10]},damage:{diceResults:[2]}}};
  const result=await commitCombatCommentOperation({auth,data:{entryId:'scene',text:'Attacks.',charName:actorId,metadata:{characterId:actorId,commentSegments:[segment]}}},{database:db,nowClient:300});
  const resolved=result.mechanics.commentSegments[0].combatResolution;
  assert.equal(resolved.actorConditionSnapshot.after.length,0);
  assert.equal(resolved.conditionUsage.actorConditionIds.length,1);
  assert.equal(deriveCombatStateFromComments(history(db)).get(actorId).temporaryConditions.length,0);
});

test('graded rewards cannot bypass author roles and duplicate attempt segments roll back atomically',async()=>{
  const {db,attempt}=await setup();
  await assert.rejects(commitHerausforderungOperation({auth,data:{entryId:'scene',text:'Unauthorized',metadata:{herausforderung:gradedEvent()}}},{database:db}),/Spielleitung|Redaktion/);
  const payload=attempt(15);payload.data.metadata.commentSegments.push(structuredClone(payload.data.metadata.commentSegments[0]));
  const before=structuredClone([...db.data]);
  await assert.rejects(commitSkillCommentOperation(payload,{database:db,now:200}),/bereits versucht/);
  assert.deepEqual([...db.data],before);
});
