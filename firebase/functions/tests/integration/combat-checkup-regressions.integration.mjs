import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, threadId, history, undo, request, CheckupDice } from './combat-test-context.mjs';
import { commitNarrativeComment } from '../../src/comments/commit-narrative-comment.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { CombatResolutionService } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';

after(() => database.terminate());

const ability = (id, effects, extra = {}) => ({ id, name: id, active: true, combatUsable: true,
  activationType: 'action', resolutionType: 'automatic', effects, ...extra });
const sample = (id, abilities = []) => ({ id, name: id, combatProfile: {
  progression: { level: 3 }, attributes: [{ key: 'intelligence', score: 16 }],
  hitPoints: { current: 40, maximumOverride: 100 }, armorClass: { override: 5 },
  weapons: [{ id: 'blade', name: 'Klinge', equipped: true, damageFormula: '1d6' }], abilities,
  resources: [{ id: 'test-pool', name: 'Prüfvorrat', current: 10, maximum: 10, recovery: 'manual' }]
} });
const partyWith = (actorAbilities, targetAbilities = []) => createCombatParty([
  { key: 'a', team: 'a', actor: sample('audit-actor', actorAbilities) },
  { key: 'b', team: 'b', actor: sample('audit-target', targetAbilities) }
]);
const pool = record => record.combatProfile.resources.find(resource => resource.id === 'test-pool').current;

test('fester Schaden und nachfolgender Würfel werden gespeichert und vollständig zurückgenommen', async () => {
  const party = await partyWith([ability('mixed', [
    { type: 'damage', amount: 8, bonusAttribute: 'intelligence', on: 'always' },
    { type: 'damage', formula: '1d6', on: 'always' }
  ])]);
  const before = (await party.snapshot()).profiles.get('b').currentHitPoints;
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:mixed' }));
  assert.equal(saved.mechanics.commentSegments[0].combatResolution.damage.total, 14);
  assert.equal((await party.record('b')).combatProfile.hitPoints.current, before - 14);
  await undo(saved.id);
  assert.equal((await party.record('b')).combatProfile.hitPoints.current, before);
  await party.assertConsistent();
});

test('Ressourcenentzug plus bezahlte Zielreaktion stimmen in Datenbank und Replay überein', async () => {
  const party = await partyWith([ability('drain', [{ type: 'spend-resource', resourceId: 'test-pool', amount: 4, on: 'always' }])],
    [ability('defense', [], { triggerRules: [{ id: 'pay', phase: 'post-roll', recipient: 'target', sourceRelation: 'self',
      activation: 'reaction', actionScope: 'global', frequency: 'comment', costs: [{ resourceId: 'test-pool', amount: 3 }], effects: {} }] })]);
  const prepared = await party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:drain' });
  const state = await party.snapshot();
  const actorRecord = await party.record('a');
  const targetRecord = await party.record('b');
  const actor = overlayCombatHitPointState(resolveCombatProfile(actorRecord, { actionId: 'ability:drain' }), state.states.get(actorRecord.id));
  const target = state.profiles.get('b');
  prepared.segment.combatAction.ruleSelections = [{ sourceActorId: target.characterId,
    sourcePersistence: target.persistence, ruleId: 'pay', distanceMeters: 1 }];
  prepared.segment.combatResolution = await new CombatResolutionService(new CheckupDice()).resolveAttack({ actor, target }, {
    distanceMeters: 1, rulePeriods: { comment: 'pending', scene: threadId, day: `scene:${threadId}:day-1` },
    ruleSources: [{ actorId: target.characterId, selectedRuleIds: ['pay'] }]
  });
  assert.equal(prepared.segment.combatResolution.ruleResourceSnapshots.length, 1);
  const saved = await party.commit(prepared);
  assert.equal(pool(await party.record('b')), 3);
  assert.equal((await party.snapshot()).profiles.get('b').resources.find(resource => resource.id === 'test-pool').current, 3);
  await undo(saved.id);
  assert.equal(pool(await party.record('b')), pool(targetRecord));
});

test('ältere Zustandsdauer zählt Gesamtbeiträge und überlebt das erneute Laden korrekt', async () => {
  const party = await partyWith([ability('legacy-buff', [{ type: 'buff', target: 'self', on: 'always',
    condition: { id: 'legacy', name: 'Zwei Beiträge', remainingActorComments: 2, mechanics: { attack: 2 } } }])]);
  await party.commit(await party.prepare({ actor: 'a', targets: ['a'], actionId: 'ability:legacy-buff' }));
  for (const expected of [1, 0]) {
    await commitNarrativeComment.run(request({ entryId: threadId, text: 'Weiterer Beitrag', metadata: {
      characterId: 'audit-actor', commentSegments: [1, 2, 3].map(() => ({ characterId: 'audit-actor', kind: 'speech', text: 'Abschnitt' }))
    } }));
    const conditions = (await party.snapshot()).profiles.get('a').temporaryConditions;
    assert.equal(conditions[0]?.remainingActorComments || 0, expected);
    assert.equal(conditions.length, expected ? 1 : 0);
  }
});

test('Eigenschaden beendet Konzentration samt verknüpftem Zustand und Rücknahme stellt beides wieder her', async () => {
  const party = await partyWith([
    ability('concentrate', [{ type: 'buff', target: 'self', on: 'always', concentration: true,
      condition: { id: 'linked', name: 'Konzentrationsschutz', durationModel: { kind: 'concentration' } } }]),
    ability('self-damage', [{ type: 'damage', target: 'self', amount: 4, on: 'always' }])
  ]);
  await party.commit(await party.prepare({ actor: 'a', targets: ['a'], actionId: 'ability:concentrate' }));
  assert.ok((await party.snapshot()).profiles.get('a').concentration);
  const dice = new CheckupDice();
  dice.rollSavingThrow = ({ modifier = 0, rollMode = 'normal' }) => dice.rollD20(modifier, rollMode, 1);
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:self-damage', dice }));
  const afterDamage = (await party.snapshot()).profiles.get('a');
  assert.equal(afterDamage.concentration, null);
  assert.equal(afterDamage.temporaryConditions.length, 0);
  await undo(saved.id);
  const restored = (await party.snapshot()).profiles.get('a');
  assert.ok(restored.concentration);
  assert.equal(restored.temporaryConditions.length, 1);
  assert.ok((await history()).length > 0);
});
