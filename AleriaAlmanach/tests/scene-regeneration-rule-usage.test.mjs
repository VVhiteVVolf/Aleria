import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectApplicableCombatRules,
  deriveCombatRuleFrequencyKeys
} from '../modules/combat/combat-trigger-rules.js';
import { getSceneCombatDocumentation } from '../modules/combat-status/combat-scene-documentation.js';

const sceneId = 'training::session:court';
const periods = { scene: sceneId, day: `scene:${sceneId}:day-1`, comment: 'next' };
const key = (actorId, frequency = 'scene') => `${actorId}:quirk:blessed:lucky@${frequency}:${periods[frequency]}`;
const application = (actorId, frequency = 'scene') => ({ sourceActorId: actorId, usedKey: key(actorId, frequency) });
const receipt = (...ruleApplications) => ({ combatResolution: { actorId: 'attacker', targetId: 'target', ruleApplications } });
const regenerate = (...actorIds) => ({ commentKind: 'scene-regeneration-event', serverValidatedMechanics: true,
  sceneRegeneration: { participants: actorIds.map(actorId => ({ actorId, after: {} })) } });

test('regeneration rearms only the selected sources, including support and nested counter rules', () => {
  const first = receipt(application('gawain'), application('gawain', 'day'), application('gawain-copy'));
  first.combatResolution.counterAttacks = [{ resolution: {
    actorId: 'defender', targetId: 'attacker', ruleApplications: [application('rhiannon', 'day')]
  } }];
  const history = [first, regenerate('gawain', 'rhiannon')];
  const original = structuredClone(history);
  assert.deepEqual([...deriveCombatRuleFrequencyKeys(history)], [key('gawain-copy')]);
  assert.deepEqual(history, original);

  const spentAgain = [...history, receipt(application('gawain'), application('rhiannon', 'day'))];
  assert.deepEqual([...deriveCombatRuleFrequencyKeys(spentAgain)], [key('gawain-copy'), key('gawain'), key('rhiannon', 'day')]);
  assert.deepEqual([...deriveCombatRuleFrequencyKeys([...spentAgain, regenerate('gawain')])], [key('gawain-copy'), key('rhiannon', 'day')]);
});

test('legacy used-key receipts support colon-containing actor identities without resetting similar actors', () => {
  const actorId = 'scene-creature:wolf-1';
  const history = [receipt({ usedKey: key(actorId) }, { usedKey: key(`${actorId}-copy`) }), regenerate(actorId)];
  assert.deepEqual([...deriveCombatRuleFrequencyKeys(history)], [key(`${actorId}-copy`)]);
});

test('unvalidated and imported regeneration markers cannot rearm a limited rule', () => {
  const trusted = regenerate('gawain');
  for (const invalid of [
    { ...trusted, serverValidatedMechanics: false },
    { ...trusted, importedHistoricalMechanics: true },
    { ...trusted, commentKind: 'speech' }
  ]) {
    assert.deepEqual([...deriveCombatRuleFrequencyKeys([receipt(application('gawain')), invalid])], [key('gawain')]);
  }
});

test('the next action and the visible limited-rule readout agree after regeneration', () => {
  const profile = { characterId: 'gawain', quirks: [{ id: 'blessed', name: 'Gesegnet', active: true,
    triggerRules: [{ id: 'lucky', name: 'Glück', phase: 'pre-roll', frequency: 'scene', effects: { attackModifier: 1 } }] }] };
  const history = [receipt(application('gawain'))];
  const applicable = comments => collectApplicableCombatRules({ phase: 'pre-roll', actionKind: 'weapon', periods,
    state: { actorProfile: profile }, usedFrequencyKeys: deriveCombatRuleFrequencyKeys(comments),
    sources: [{ actorId: 'gawain', profile, relationToActor: 'self', relationToTarget: 'enemy' }] });
  assert.equal(applicable(history).length, 0);
  assert.equal(getSceneCombatDocumentation(profile, history, sceneId).limitedRules[0].spent, true);
  history.push(regenerate('gawain'));
  assert.equal(applicable(history).length, 1);
  assert.equal(getSceneCombatDocumentation(profile, history, sceneId).limitedRules[0].spent, false);
});
