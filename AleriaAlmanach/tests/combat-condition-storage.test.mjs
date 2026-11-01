import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { compactCombatResolution } from '../modules/combat/combat-resolution-storage.js';
import { receipts } from './fixtures/jungdrache-fixtures.mjs';

const profile = id => resolveCombatProfile({ id, name: id, combatProfile: {
  hitPoints: { current: 20, maximumOverride: 20 }, weapons: [], armorClass: { override: 12 }
} });
const condition = { id: 'test-protection', name: 'Prüfschutz', mechanics: { armorClass: 1 },
  durationModel: { kind: 'actor-comments', remainingActorComments: 1 } };

for (const remove of [false, true]) test(`condition ${remove ? 'removal' : 'application'} without a technique save produces a Firestore-safe snapshot`, async () => {
  const actor = { ...profile('actor'), actionResolutionMode: 'automatic', resourceCosts: [],
    selectedAction: { effects: [remove
      ? { type: 'remove-condition', target: 'target', on: 'always', conditionId: condition.id }
      : { type: 'buff', target: 'target', on: 'always', condition }] } };
  const target = { ...profile('target'), temporaryConditions: remove ? [condition] : [] };
  const resolution = await new CombatResolutionService(receipts()).resolveAttack({ actor, target });
  assert.equal(resolution.targetConditionSnapshot.after.length, remove ? 0 : 1);
  assert.equal(resolution.targetConditionSnapshot.applied, null, 'No technique-save condition is an explicit null, not an undefined Firestore field.');
  const stored = compactCombatResolution(resolution).targetConditionSnapshot;
  assert.deepEqual(stored, JSON.parse(JSON.stringify(stored)), 'Persistence cannot silently drop condition snapshot fields.');
});
