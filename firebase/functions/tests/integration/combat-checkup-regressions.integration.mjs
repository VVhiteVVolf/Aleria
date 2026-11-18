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

test('Entwaffnen verbraucht den einmaligen Schutz, bucht danach jede Hand einzeln und lässt die Reserve im Inventar', async () => {
  const attacker = sample('fechter');
  attacker.combatProfile.techniques = [{ id: 'entwaffnen', name: 'Entwaffnen', active: true, activationType: 'action',
    damageModel: { mode: 'none' }, secondarySave: { enabled: true, attributeKey: 'dexterity', fixedDc: 25,
      failureCondition: { id: 'griff', name: 'Entwaffnet', disarm: true } } }];
  const target = sample('duellant', [{ id: 'schutz', name: 'Sicherer Griff', active: true, activationType: 'passive',
    triggerRules: [{ id: 'halten', phase: 'post-secondary-save', recipient: 'target', sourceRelation: 'self',
      condition: 'save-failed', frequency: 'scene', actionScope: 'global', effects: { outcome: 'force-save-success' } }] }]);
  target.combatProfile.weapons = ['rechts', 'links', 'reserve'].map((id, index) => ({ id, inventoryItemId: id, name: id,
    weaponType: 'dagger', equipped: index === 0, damageFormula: '1d4' }));
  target.combatProfile.combat = { offHandWeaponId: 'links' };
  target.inventory = { items: target.combatProfile.weapons.map(({ id, name }) => ({ id, name, category: 'weapon', quantity: '1' })) };
  const party = await createCombatParty([{ key: 'a', team: 'a', actor: attacker }, { key: 'b', team: 'b', actor: target }]);
  const original = (await party.record('b')).inventory;
  const savedIds = [];
  for (const [index, expectedDrop] of [null, 'rechts', 'links', null].entries()) {
    const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'technique:entwaffnen' }));
    savedIds.push(saved.id);
    const resolution = saved.mechanics.commentSegments[0].combatResolution;
    assert.equal(resolution.secondarySaves[0].succeeded, index === 0);
    assert.equal(resolution.sceneItemEvents?.[0]?.weaponId ?? null, expectedDrop);
    const replay = (await party.snapshot()).profiles.get('b');
    assert.deepEqual(replay.droppedWeapons.map(drop => drop.weaponId).sort(), ['rechts', 'links'].slice(0, index).sort());
    assert.equal(replay.temporaryConditions.some(condition => condition.name === 'Griff gestört'), index === 3);
  }
  assert.deepEqual((await party.record('b')).inventory, original);
  for (const id of savedIds.reverse()) await undo(id);
  const restored = (await party.snapshot()).profiles.get('b');
  assert.equal(restored.droppedWeapons?.length || 0, 0);
  assert.deepEqual((await party.record('b')).inventory, original);
});

for (const [acrobatics, expected] of [[0, 'prone'], [8, 'landed']]) {
  test(`Reitsturz mit Landung ${expected} wird serverseitig berechnet, erneut gelesen und zurückgenommen`, async () => {
    const attacker = sample('angreifer', [ability('impuls', [{ type: 'damage', target: 'target', amount: 30, on: 'always' }])]);
    const rider = sample('reiter');
    rider.inventory = { items: [{ id: 'pony', name: 'Pony', category: 'horse', quantity: '1' }] };
    rider.combatProfile.combat = { mountId: 'pony', mounted: true };
    rider.combatProfile.skills = [{ name: 'Akrobatik', attributeKey: 'dexterity', bonus: acrobatics }];
    const party = await createCombatParty([{ key: 'a', team: 'a', actor: attacker }, { key: 'b', team: 'b', actor: rider }]);
    const before = await party.record('b');
    const prepare = () => party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:impuls' });
    const missing = await prepare();
    missing.segment.combatResolution.secondarySaves = [];
    await assert.rejects(party.commit(missing), /W20|Würfel/);
    assert.equal((await party.record('b')).combatProfile.hitPoints.current, before.combatProfile.hitPoints.current);
    const prepared = await prepare();
    const submitted = prepared.segment.combatResolution;
    assert.equal(submitted.mountedHitChecks[0].outcome, expected);
    submitted.mountedHitChecks[0].outcome = 'seated';
    submitted.targetSupportEquipmentSnapshot.after.mountId = 'unbekannt';
    submitted.secondarySaves[0].succeeded = !submitted.secondarySaves[0].succeeded;
    const saved = await party.commit(prepared);
    const result = saved.mechanics.commentSegments[0].combatResolution;
    assert.equal(result.mountedHitChecks[0].outcome, expected);
    assert.equal(result.targetSupportEquipmentSnapshot.after.mountId, '');
    assert.equal(result.secondarySaves[0].succeeded, expected === 'landed');
    const state = (await party.snapshot()).profiles.get('b');
    assert.equal(state.combat.mounted, false);
    assert.equal(state.resources.find(r => r.id === 'bonus-action').current === 0, expected === 'prone');
    assert.deepEqual((await party.record('b')).inventory, before.inventory);
    const remount = () => party.prepare({ actor: 'b', targets: ['b'], actionId: 'combat:wait',
      loadout: { rightWeaponId: 'blade', leftWeaponId: '', mountId: 'pony' } });
    if (expected === 'prone') await assert.rejects(remount(), /Bonusaktion|Ausrüstung|Ausr.stung/);
    else {
      const mounted = await party.commit(await remount());
      const equipment = mounted.mechanics.commentSegments[0].combatResolution.equipmentPreparation;
      assert.equal(equipment.free, false);
      assert.deepEqual(equipment.costs.map(cost => [cost.resourceId, cost.amount]), [['bonus-action', 1]]);
      assert.equal((await party.snapshot()).profiles.get('b').combat.mounted, true);
      await undo(mounted.id);
      assert.equal((await party.snapshot()).profiles.get('b').combat.mounted, false);
    }
    await undo(saved.id);
    const restored = (await party.snapshot()).profiles.get('b');
    assert.equal(restored.combat.mounted, true);
    assert.equal(restored.currentHitPoints, before.combatProfile.hitPoints.current);
    assert.deepEqual((await party.record('b')).inventory, before.inventory);
  });
}

test('der Server prüft zwei Reichweiten desselben Unterstützers getrennt und lässt offene Entfernungen offen', async () => {
  const supporter = sample('support', [ability('hilfe', [], { combatUsable: false, usesCurrent: 2, usesMaximum: 2,
    triggerRules: ['eins', 'zwei'].map(id => ({ id, name: id, phase: 'post-roll', recipient: 'actor', sourceRelation: 'ally',
      radiusMeters: 3, activation: 'reaction', frequency: 'comment', actionScope: 'global', effects: {} })) })]);
  const party = await createCombatParty([{ key: 'a', actor: sample('a'), team: 'a' }, { key: 'b', actor: sample('b'), team: 'b' },
    { key: 'support', actor: supporter, team: 'a' }]);
  const helper = (await party.snapshot()).profiles.get('support');
  for (const [one, two, expected] of [[4, 3, ['zwei']], [0, null, ['eins']], [null, null, []]]) {
    const prepared = await party.prepare({ actor: 'a', targets: ['b'] });
    prepared.segment.combatAction.ruleSelections = [{ ruleId: 'eins', distanceMeters: one }, { ruleId: 'zwei', distanceMeters: two }]
      .map(selection => ({ ...selection, sourceActorId: helper.characterId, sourcePersistence: helper.persistence }));
    const saved = await party.commit(prepared);
    const receipt = saved.mechanics.commentSegments[0].combatResolution;
    assert.deepEqual(receipt.ruleApplications.filter(entry => entry.sourceActorId === helper.characterId).map(entry => entry.ruleId), expected);
    const remaining = async () => (await party.record('support')).combatProfile.abilities.find(entry => entry.id === 'hilfe').usesCurrent;
    assert.equal(await remaining(), 2 - expected.length);
    await undo(saved.id);
    assert.equal(await remaining(), 2);
  }
});

test('bestätigte Mana-Ersatzzahlung bucht die gewählte Ressource und nimmt genau diese zurück', async () => {
  const caster = sample('cleric', [ability('segen', [{ type: 'healing', amount: 1, on: 'always' }],
    { delivery: 'spell', costs: [{ resourceId: 'mana-focus', amount: 2 }] })]);
  caster.combatProfile.progression.level = 10;
  caster.combatProfile.magic = { enabled: true, casterTier: 'full', bypassResourceId: 'celestial-points' };
  const party = await createCombatParty([{ key: 'a', actor: caster, team: 'a' }, { key: 'b', actor: sample('target'), team: 'b' }]);
  const funds = async () => {
    const resources = (await party.snapshot()).profiles.get('a').resources;
    return ['mana-focus', 'celestial-points'].map(id => resources.find(entry => entry.id === id).current);
  };
  const before = await funds();
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:segen', paymentMode: 'mana-substitute' }));
  const { combatAction, combatResolution } = saved.mechanics.commentSegments[0];
  assert.equal(combatAction.paymentMode, 'mana-substitute');
  assert.deepEqual(combatResolution.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['celestial-points', 2]]);
  assert.deepEqual(await funds(), [before[0], before[1] - 2]);
  await undo(saved.id);
  assert.deepEqual(await funds(), before);
});

test('begrenzte Hauptfähigkeit und eigene Reaktion bleiben nach Speichern, Neuladen und Rücknahme konsistent', async () => {
  const party = await partyWith([
    ability('haupt', [{ type: 'damage', target: 'target', amount: 4, on: 'always' }], { usesCurrent: 2, usesMaximum: 2 }),
    ability('antwort', [], { combatUsable: false, usesCurrent: 2, usesMaximum: 2, triggerRules: [{
      id: 'antwortregel', phase: 'post-roll', recipient: 'actor', sourceRelation: 'self', activation: 'reaction',
      frequency: 'comment', condition: 'always', effects: {}
    }] })
  ]);
  const prepared = await party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:haupt' });
  const actor = (await party.snapshot()).profiles.get('a');
  prepared.segment.combatAction.ruleSelections = [{ sourceActorId: actor.characterId, sourcePersistence: actor.persistence, ruleId: 'antwortregel' }];
  const uses = entries => entries.filter(entry => ['haupt', 'antwort'].includes(entry.id)).map(entry => [entry.id, entry.usesCurrent]).sort();
  const saved = await party.commit(prepared);
  const result = saved.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.ruleAbilitySnapshots.length, 1);
  const spent = [['antwort', 1], ['haupt', 1]];
  assert.deepEqual(uses(result.ruleAbilitySnapshots[0].after), spent);
  assert.deepEqual(uses((await party.record('a')).combatProfile.abilities), spent);
  assert.deepEqual(uses((await party.snapshot()).profiles.get('a').abilities), spent);
  await undo(saved.id);
  assert.deepEqual(uses((await party.record('a')).combatProfile.abilities), [['antwort', 2], ['haupt', 2]]);
});

for (const [mode, natural, expectedDamage] of [['saving-throw', 20, 2], ['saving-throw', 1, 5], ['spell-attack', 20, 15]]) {
  test(`Schadensvertrag mit Speicherung: ${mode}, W20=${natural}, Eigenschaden bleibt unabhängig`, async () => {
    const party = await partyWith([
      ability('mixed-damage', [
        { type: 'damage', target: 'self', formula: '1d6', on: 'always' },
        { type: 'damage', target: 'target', formula: '1d6', on: 'hit' }
      ], { delivery: 'spell', resolutionType: mode, halfDamageOnSave: true }),
      ability('extra-die', [], { combatUsable: false, mechanics: { bonusDamageFormula: '1d4' } })
    ]);
    const before = await party.snapshot();
    const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'ability:mixed-damage', natural }));
    const result = saved.mechanics.commentSegments[0].combatResolution;
    assert.equal(result.damage.total, expectedDamage);
    if (mode === 'spell-attack') {
      assert.equal(result.damage.criticalDamage.maximum, 10, 'Critical 1d6+1d4: maximum 6+4 plus the single rolled pool 3+2.');
      assert.equal(result.damage.diceResults.length, 2);
    }
    assert.equal(result.effectResults.find(entry => entry.recipient === 'actor').amount, 3);
    assert.equal((await party.record('a')).combatProfile.hitPoints.current, before.profiles.get('a').currentHitPoints - 3);
    assert.equal((await party.record('b')).combatProfile.hitPoints.current, before.profiles.get('b').currentHitPoints - expectedDamage);
    await undo(saved.id);
    assert.equal((await party.record('a')).combatProfile.hitPoints.current, before.profiles.get('a').currentHitPoints);
    assert.equal((await party.record('b')).combatProfile.hitPoints.current, before.profiles.get('b').currentHitPoints);
    await party.assertConsistent();
  });
}

test('Server erzwingt den vorgeschriebenen Zweihandgriff und protokolliert die geerbte Schadensart', async () => {
  const actor = sample('two-handed-actor');
  actor.combatProfile.templateSelections = { classId: 'skjaldr' };
  actor.combatProfile.progression.level = 7;
  actor.combatProfile.weapons = [{ id: 'versatile-axe', name: 'Streitaxt', weaponType: 'axe', damageType: 'Hieb',
    equipped: true, damageFormula: '1d8', versatileDamageFormula: '1d10', properties: 'Vielseitig' }];
  const party = await createCombatParty([{ key: 'a', actor, team: 'a' }, { key: 'b', actor: sample('target'), team: 'b' }]);
  const prepared = await party.prepare({ actor: 'a', targets: ['b'], actionId: 'technique:combat-style-huskarl-skjaldr-grund-3', weaponGrip: 'one-handed' });
  const saved = await party.commit(prepared);
  const result = saved.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.weaponGrip, 'two-handed');
  assert.equal(result.weapon.damageFormula, '1d10+1d4');
  assert.equal(result.damage.damageType, 'Hieb');
  assert.equal(result.effectResults.find(entry => entry.effect.type === 'damage').effect.damageType, 'Hieb');
  await undo(saved.id);
  await party.assertConsistent();
});

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
