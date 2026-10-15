import test from 'node:test';
import assert from 'node:assert/strict';
import { gradedEvent, person, actorId, opponentId, encounterComment } from './fixtures/graded-challenge-fixtures.mjs';
import { normalizeHerausforderungEvent, getHerausforderungValidationIssues, collectHerausforderungApproaches } from '../modules/herausforderung/herausforderung-model.js';
import { selectChallengeOutcome, applyChallengeOutcome } from '../modules/herausforderung/herausforderung-outcomes.js';
import { benefitsForTier } from '../modules/herausforderung/herausforderung-rewards.js';
import { createHerausforderungExport, parseHerausforderungImport } from '../modules/herausforderung/herausforderung-exchange.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState, deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { getConditionUsageBenefits } from '../modules/combat/combat-condition-usage.js';
import { renderHerausforderungComment } from '../modules/herausforderung/herausforderung-ui.js';
import { collectHerausforderungProgress } from '../modules/herausforderung/herausforderung-progress.js';
import { getActiveCombatEncounter } from '../modules/combat/combat-encounter-model.js';
import { applyChallengeCombatBenefits } from '../modules/herausforderung/herausforderung-combat-effects.js';
import { getSkillsForCommentKind, resolveSkillModifier } from '../modules/skill-checks/skill-check-model.js';

const event = () => normalizeHerausforderungEvent(gradedEvent());
const approach = () => event().approaches[0];

test('every W20 face and total across all boundaries selects exactly the agreed single tier',()=>{
  const challenge=approach();
  for(let natural=1;natural<=20;natural++)for(let total=-100;total<=150;total++){
    const expected=natural===20?'critical-success':natural===1?'critical-failure':total>=18?'success':total>=15?'partial':total>=12?'neutral':total>=5?'failure':'major-failure';
    assert.equal(selectChallengeOutcome(challenge,{natural,total}).id,expected,`${natural}/${total}`);
  }
});
const attach = (profile, effects) => overlayCombatHitPointState(profile, { temporaryConditions: effects.map(effect => createManualCombatCondition(effect, { id: effect.effectId, encounterId: 'duel' })) });
const profiles = () => [resolveCombatProfile(person(actorId)), resolveCombatProfile(person(opponentId))];
const calls = [];
const dice = { async rollAttack({ modifier, rollMode }) { calls.push({ modifier, rollMode }); return { id: 'attack', natural: 10, total: 10 + modifier, dice: [10], keptDice: [10] }; }, async rollDamage({ bonus = 0 }) { return { id: 'damage', total: 2 + bonus, dice: [2], keptDice: [2], modifier: bonus, notation: '1d6' }; } };
function chain(actor) { return { ...actor, selectedAction: { ...actor.selectedAction, followUpAttack: { enabled: true, afterMiss: true, repeatCount: 1, inheritWeapon: true, inheritBonusDamage: false } } }; }

test('all boundaries select exactly one outcome, natural 1/20 override even extreme totals', () => {
  assert.deepEqual(getHerausforderungValidationIssues(gradedEvent()), []);
  for (const [total, id] of [[-9,'major-failure'],[4,'major-failure'],[5,'failure'],[11,'failure'],[12,'neutral'],[14,'neutral'],[15,'partial'],[17,'partial'],[18,'success'],[99,'success']]) assert.equal(selectChallengeOutcome(approach(), { natural: 10, total }).id, id);
  assert.equal(selectChallengeOutcome(approach(), { natural: 20, total: -100 }).id, 'critical-success');
  assert.equal(selectChallengeOutcome(approach(), { natural: 1, total: 100 }).id, 'critical-failure');
});

test('the seven tiers survive AI exchange; unknown usage actors and malformed/overlapping tiers are rejected', () => {
  const context = { participants: [{ actorId }, { actorId: opponentId }] };
  const output = createHerausforderungExport(event());
  assert.deepEqual(parseHerausforderungImport(JSON.stringify(output), {}, context).event, event());
  for (const change of [rows => rows.push({ ...rows[0] }), rows => rows[0].natural = 7, rows => rows.splice(0,1), rows => rows[2].minimumTotal = 18, rows => rows[4].benefits.copper = 1]) {
    const draft = gradedEvent(); change(draft.approaches[0].outcomeTable); assert.ok(getHerausforderungValidationIssues(draft).length);
  }
  const invalid = gradedEvent(); invalid.approaches[0].outcomeTable[1].benefits.effects[0].usage.actorId = 'missing';
  assert.throws(() => parseHerausforderungImport(JSON.stringify(invalid), {}, context), /Effektverbrauch/);
});

test('Wahrnehmung uses the real wisdom proficiency and remains an explicit thought skill choice', () => {
  const actor = person(actorId); actor.combatProfile.attributes[0].score = 16;
  actor.combatProfile.skills = [{ name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0 }];
  assert.equal(resolveSkillModifier(actor, 'perception').modifier, 5);
  assert.ok(getSkillsForCommentKind('thought').some(skill => skill.id === 'perception'));
});

for (const [tier, expectedModes, expectedBonus] of [ ['success',['advantage','advantage'],[0,0]], ['partial',['normal','normal'],[1,0]], ['major-failure',['disadvantage','normal'],[0,0]] ]) {
  test(`${tier}: real attack chain consumes only its configured scope, including misses`, async () => {
    calls.length = 0;
    let [actor, target] = profiles();
    const base = actor.attackModifier;
    actor = chain(attach(actor, benefitsForTier(approach(), tier).effects));
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
    assert.equal(calls.length,2);
    assert.deepEqual(calls.map(call => call.rollMode),expectedModes);
    assert.deepEqual(calls.map(call => call.modifier - base),expectedBonus);
    assert.equal(result.actorConditionSnapshot.after.length,0);
    const nextActor = overlayCombatHitPointState(profiles()[0], { temporaryConditions: result.actorConditionSnapshot.after });
    calls.length = 0;
    await new CombatResolutionService(dice).resolveAttack({ actor: nextActor, target });
    assert.equal(calls[0].rollMode,'normal'); assert.equal(calls[0].modifier,base);
  });
}

test('warned grants +1 defense for the full next action, only against the configured attacker', async () => {
  let [actor, target] = profiles(); const defense = target.totalDefense;
  target = attach(target, benefitsForTier(approach(), 'failure').effects);
  assert.equal(target.totalDefense,defense,'limited defense must not leak into global armor');
  assert.equal(getConditionUsageBenefits({ ...actor, characterId:'observer' },target).armorClass,0);
  const result = await new CombatResolutionService(dice).resolveAttack({ actor:chain(actor),target });
  assert.equal(result.attack.targetDefense,defense+1);
  assert.equal(result.followUpAttacks[0].attack.targetDefense,defense+1);
  assert.equal(result.targetConditionSnapshot.after.length,0);
});

test('an action benefit carries across targets of the same action, not to a later action', async () => {
  let [actor,target]=profiles();
  actor=attach(actor,benefitsForTier(approach(),'success').effects);
  const service=new CombatResolutionService(dice);
  const first=await service.resolveAttack({actor,target});
  const after=overlayCombatHitPointState(profiles()[0],{temporaryConditions:first.actorConditionSnapshot.after});
  const nextTarget={...target,characterId:'another'};
  const second=await service.resolveAttack({actor:after,target:nextTarget},{startedAction:first,skipResourceCosts:true,skipAmmunition:true,skipSelfEffects:true});
  assert.equal(second.attack.rollMode,'advantage');
  const later=await service.resolveAttack({actor:after,target});
  assert.equal(later.attack.rollMode,'normal');
});

test('automatic actions and saving throws do not consume an attack benefit', async () => {
  let [actor,target]=profiles();actor=attach(actor,benefitsForTier(approach(),'partial').effects);
  for(const mode of ['automatic','saving-throw']) {
    const prepared={...actor,actionResolutionMode:mode,actionSaveAttribute:'dexterity',actionSpellSaveDc:12,selectedAction:{...actor.selectedAction,nonDamaging:true,effects:[]}};
    const result=await new CombatResolutionService(dice).resolveAttack({actor:prepared,target});
    assert.ok(!result.conditionUsage);
  }
});

test('critical advantage survives the grant post and ends after the second following own contribution', async () => {
  const [actor,target] = profiles();
  const resolution = { natural:20,total:20,actorId,targetChallengeId:'herausforderung:c:read-move' }; applyChallengeOutcome(approach(),resolution);
  const grant = await applyChallengeCombatBenefits({ actorId, benefits:benefitsForTier(approach(),resolution.herausforderungTier), recipients:new Map([[actorId,{profile:actor,state:{}}],[opponentId,{profile:target,state:{}}]]),identity:'crit',encounterId:'duel' });
  Object.assign(resolution,{herausforderungCombatSnapshots:grant.snapshots,herausforderungCombatResults:grant.results});
  const history=[{...encounterComment(),id:'start'},{id:'grant',serverValidatedMechanics:true,characterId:actorId,commentSegments:[{skillResolution:resolution}]}];
  assert.equal(deriveCombatStateFromComments(history).get(actorId).temporaryConditions[0].durationModel.remainingActorComments,2);
  history.push({id:'other',characterId:opponentId,text:'Waits.'});
  assert.equal(deriveCombatStateFromComments(history).get(actorId).temporaryConditions[0].durationModel.remainingActorComments,2);
  history.push({id:'own-1',characterId:actorId,text:'Moves.'});
  assert.equal(deriveCombatStateFromComments(history).get(actorId).temporaryConditions[0].durationModel.remainingActorComments,1);
  history.push({id:'own-2',characterId:actorId,text:'Moves again.'});
  assert.equal(deriveCombatStateFromComments(history).get(actorId).temporaryConditions.length,0);
});

test('public card hides all seven result texts and closes the one-shot attempt after failure', () => {
  const challenge={id:'c',herausforderung:{...event(),combatContext:{encounterId:'duel'}}};
  const encounter=getActiveCombatEncounter([encounterComment()]);
  const before=renderHerausforderungComment(challenge,0,{encounter});
  for(const row of approach().outcomeTable) assert.ok(!before.includes(row.text));
  assert.ok(before.includes('Versuchen'));
  const progress=collectHerausforderungProgress([{commentSegments:[{skillResolution:{targetChallengeId:'herausforderung:c:read-move',outcome:'failure',herausforderungTier:'neutral',herausforderungLabel:'Keine Erkenntnis',revealedText:'Only this result'}}]}]);
  const after=renderHerausforderungComment(challenge,0,{encounter,progress});
  assert.ok(after.includes('Versuch abgeschlossen')); assert.ok(!after.includes('>Versuchen<')); assert.ok(after.includes('Keine Erkenntnis'));
});
