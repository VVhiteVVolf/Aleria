import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getActorsWithCombatPosts } from '../modules/combat/combat-weapon-loadout.js';
import { getMountedHitScores } from '../modules/combat/combat-mounted-hit.js';
import { deriveCombatRuleFrequencyKeys } from '../modules/combat/combat-trigger-rules.js';
import { resolveChallengeWeaponManeuver } from '../modules/herausforderung/herausforderung-weapon-maneuver.js';
import { renderEvaluationSaveRecords } from '../modules/combat/ui/combat-evaluation-rolls.js';
import { getDroppedCombatWeapon, withCombatActionWeaponAvailability } from '../modules/combat/combat-weapon-availability.js';
import { resolvePreparedWeaponAttackProfile } from '../modules/combat/combat-weapon-response.js';
import { renderMiniCombatProfile } from '../modules/combat-status/combat-profile-summary-view.js';
import { deriveSceneItems, createWeaponDrop } from '../modules/scene-items/scene-items-model.js';
import { attachCriticalConsequences } from '../modules/combat-critical/combat-critical-resolution.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';

const weapon = (id, type = 'sword', equipped = false) => ({ id, name: id, weaponType: type, equipped,
  inventoryItemId: id, damageFormula: '1d6', damageType: 'Hieb' });
const handWeapons = [weapon('Schwert', 'sword', true), weapon('Dolch', 'dagger'), weapon('Reserve')];
const base = (id, extra = {}) => resolveCombatProfile({ id, name: id, inventory: { items: [
  { id: 'pony', name: 'Pony', category: 'horse', quantity: '1' },
  ...handWeapons.map(w => ({ id: w.id, name: w.name, category: 'weapon', quantity: '1' }))] },
  combatProfile: { hitPoints: { maximumOverride: 120, current: 90 }, armorClass: { override: 5 },
    weapons: handWeapons, ...extra } }, { includeAiSnapshot: false });
const rider = (extra = {}) => base('Reiterin', { combat: { mountId: 'pony', mounted: true, offHandWeaponId: 'Dolch' }, ...extra });
const damage = amount => ({ id: 'impact-' + amount, type: 'damage', target: 'target', on: 'hit', amount });
function strike(effects, technique = {}, source = base('Gegner')) {
  return { ...source, resourceCosts: [], selectedAction: { ...source.selectedAction, ...technique, effects } };
}
class Dice extends SeededCombatDice {
  constructor(save = 10, attack = 15) { super(1, attack); this.save = save; }
  async rollSavingThrow(options) { return new SeededCombatDice(1, this.save).rollAttack(options); }
}
const resolve = (actor, target, dice = new Dice()) => new CombatResolutionService(dice).resolveAttack({ actor, target });
const post = value => ({ characterId: value.actorId, combatResolution: value });
const secondary = (condition, dc = 15) => ({ secondarySave: { enabled: true, attributeKey: 'dexterity', dc, failureCondition: condition } });
const disarm = secondary({ id: 'grip', name: 'Entwaffnet', disarm: true });
const passive = (phase, condition, outcome, extra = {}) => ({ id: 'rettung', name: 'Sicherer Stand', active: true,
  activationType: 'passive', triggerRules: [{ id: 'abfangen', phase, condition, recipient: 'target',
    sourceRelation: 'self', actionScope: 'global', frequency: 'comment', effects: { outcome }, ...extra }] });

test('zwei Handwaffen fallen einzeln, eine Reserve bleibt im Inventar und der Ersatzmalus erreicht den Szenenzustand', async () => {
  const victim = base('Duellant', { combat: { offHandWeaponId: 'Dolch' } });
  const actor = strike([damage(1)], disarm), history = [];
  for (const expected of ['Schwert', 'Dolch', null]) {
    const state = deriveCombatStateFromComments(history).get(victim.characterId);
    const result = await resolve(actor, overlayCombatHitPointState(victim, state), new Dice(2));
    assert.equal(result.sceneItemEvents?.[0]?.weaponId ?? null, expected);
    if (expected) assert.equal(result.targetConditionSnapshot.applied, null);
    history.push(post(result));
  }
  const after = deriveCombatStateFromComments(history).get(victim.characterId);
  assert.deepEqual([...deriveSceneItems(history).values()].map(item => item.item.id), ['Schwert', 'Dolch']);
  assert.equal(after.temporaryConditions[0].name, 'Griff gestört');
  assert.equal(after.temporaryConditions[0].mechanics.attack, -1);
  assert.equal(getDroppedCombatWeapon(after, handWeapons[2]), null);
  assert.equal(victim.inventory.items.length, 4);
});

test('leere Hände, Körperwaffe und Schild lassen keinen aufnehmbaren Gegenstand entstehen', async () => {
  for (const type of ['unarmed', 'natural', 'shield']) {
    const victim = base('Ziel', { weapons: [weapon('Test', type, true), weapon('Reserve')] });
    const result = await resolve(strike([damage(1)], disarm), victim, new Dice(1));
    assert.equal(result.sceneItemEvents?.length || 0, 0);
    assert.equal(result.targetConditionSnapshot.after[0].name, 'Griff gestört');
  }
});

test('eine gebündelte Paarwaffe hat genau eine Inventarkennung', () => {
  const pair = { ...weapon('Dolchpaar', 'dagger', true), weaponProfileId: 'dual-daggers' };
  const target = base('Paar', { weapons: [pair], combat: { offHandWeaponId: pair.id } });
  const first = createWeaponDrop(target, { id: 'first', reason: 'hit' });
  assert.equal(first.weaponId, pair.id);
  assert.equal(createWeaponDrop({ ...target, droppedWeapons: [first] }, { id: 'second', reason: 'hit' }), null);
});

test('Szenenprofil und vorbereiteter Gegenangriff verwenden nach Entwaffnen die verbliebene Hand', async () => {
  const target = rider(), history = [post(await resolve(strike([damage(1)], disarm), target, new Dice(2)))];
  const working = overlayCombatHitPointState(target, deriveCombatStateFromComments(history).get(target.characterId));
  assert.equal(resolvePreparedWeaponAttackProfile(working).weapon.id, 'Dolch');
  assert.equal(resolvePreparedWeaponAttackProfile(working, { weaponId: 'Schwert' }), null);
  const view = renderMiniCombatProfile(working, working.name);
  assert.match(view, /Geführte Waffe<\/small>Dolch/);
  assert.match(view, /Nicht im Griff: Schwert/);
  const droppedBoth = { ...working, droppedWeapons: [...working.droppedWeapons, { weaponId: 'Dolch' }] };
  assert.equal(resolvePreparedWeaponAttackProfile(droppedBoth), null);
  assert.match(renderMiniCombatProfile(droppedBoth, target.name), /Geführte Waffe<\/small>Keine Waffe/);
});

test('Techniken behalten die echten Handkennungen auch bei eigener Aktionskennung ohne Inventarlink', () => {
  const axes = [weapon('Axt rechts', 'axe', true), weapon('Axt links', 'axe')].map(({ inventoryItemId, ...entry }) => entry);
  const actor = base('Axtritter', { weapons: axes, combat: { offHandWeaponId: 'Axt links' },
    techniques: [{ id: 'hieb', name: 'Einzelhieb', active: true, weaponTypes: ['axe'] },
      { id: 'folge', name: 'Wechselhieb', active: true, weaponTypes: ['axe'],
        followUpAttack: { enabled: true, alternateHands: true, damageFormula: '1d6' } }] });
  const single = actor.actions.find(action => action.sourceId === 'hieb');
  const pair = actor.actions.find(action => action.sourceId === 'folge');
  assert.deepEqual(single.weapon.heldWeaponIds, ['Axt rechts']);
  assert.deepEqual(pair.weapon.heldWeaponIds, ['Axt rechts', 'Axt links']);
  for (const weaponId of pair.weapon.heldWeaponIds) {
    const after = { ...actor, droppedWeapons: [{ weaponId }] };
    assert.equal(withCombatActionWeaponAvailability(after, pair).compatible, false);
    assert.equal(resolvePreparedWeaponAttackProfile(after, { weaponId }), null);
  }
});

for (const [phase, condition] of [['pre-secondary-save', 'always'], ['post-secondary-save', 'save-failed'], ['post-roll', 'save-failed']]) {
  test(`passiver Rettungserfolg bei ${phase} schützt vor Entwaffnen, Liegend und Blutend`, async () => {
    const target = base('Ziel', { abilities: [passive(phase, condition, 'force-save-success')] });
    for (const effect of [{ id: 'entwaffnen', name: 'Entwaffnet', disarm: true },
      { id: 'niederwerfen', name: 'Liegend', blockedResource: 'bonus-action' }, { id: 'wunde', name: 'Blutend', tags: 'bleeding' }]) {
      const result = await resolve(strike([damage(2)], secondary(effect)), target, new Dice(2));
      assert.equal(result.attack.hit, true);
      assert.equal(result.secondarySaves[0].succeeded, true);
      assert.equal(result.secondarySaves[0].total < result.secondarySaves[0].dc, true);
      assert.equal(result.ruleApplications.filter(rule => rule.ruleId === 'abfangen').length, 1);
      assert.equal(result.targetConditionSnapshot, null);
      assert.equal(result.sceneItemEvents?.length || 0, 0);
    }
  });
}

test('ein typisierter Blutungseffekt erkennt Bluterleiden auch bei eigenem Anzeigenamen', async () => {
  const source = { name: 'Besonderheit', id: 'blut', activationType: 'passive', mechanics: { saveModifiers: [{ kind: 'bleeding', bonus: -2 }] } };
  const actor = strike([damage(1)], secondary({ id: 'wunde', name: 'Offene Wunde', presetId: 'bleeding' }, 12));
  const baseline = await resolve(actor, base('Ziel'), new Dice(12));
  const affected = await resolve(actor, base('Ziel', { abilities: [source] }), new Dice(12));
  assert.equal(baseline.secondarySaves[0].succeeded, true);
  assert.equal(affected.secondarySaves[0].modifier, baseline.secondarySaves[0].modifier - 2);
  assert.equal(affected.secondarySaves[0].succeeded, false);
  assert.equal(affected.targetConditionSnapshot.after[0].presetId, 'bleeding');
});

test('Geschick, Akrobatik, Reitfertigkeit und Schutz gegen Niederwerfen verwenden die Werte des Bogens', () => {
  const target = rider({ skills: [{ name: 'Mit Tieren umgehen', attributeKey: 'wisdom', bonus: 5 },
    { name: 'Akrobatik', attributeKey: 'dexterity', bonus: 7 }], abilities: [{ id: 'stand', name: 'Standfest',
    activationType: 'passive', mechanics: { saveModifiers: [{ kind: 'prone', bonus: 2 }, { kind: 'forced-movement', bonus: 2 }] } }] });
  assert.deepEqual(getMountedHitScores(target), { seat: 15, landing: 9, landingBase: 'acrobatics' });
});

test('pro Treffer ein passiver Vergleich, Gleichstand genügt, zwei Schadensarten ergeben eine Sitzprüfung', async () => {
  const result = await resolve(strike([damage(8), damage(12)]), rider(), new Dice(2));
  assert.deepEqual(result.mountedHitChecks, [{ hitIndex: 0, damage: 20, dc: 10, passive: 10, outcome: 'seated' }]);
  assert.equal(result.secondarySaves.length, 0);
  assert.equal(result.targetSupportEquipmentSnapshot, undefined);
  assert.match(renderEvaluationSaveRecords(result), /bleibt im Sattel/);
});

for (const [save, outcome] of [[20, 'landed'], [2, 'prone']]) {
  test(`ein Sturz mit W20 ${save} löst den Sitz in der Szene und die richtige Landung aus`, async () => {
    const target = rider(), result = await resolve(strike([damage(24)]), target, new Dice(save));
    assert.equal(result.mountedHitChecks[0].outcome, outcome);
    assert.equal(result.secondarySaves[0].type, 'mount-landing');
    assert.equal(result.secondarySaves[0].dc, 12);
    assert.equal(result.secondarySaves[0].succeeded, outcome === 'landed');
    const stored = JSON.parse(JSON.stringify(post(result))), states = deriveCombatStateFromComments([stored]);
    const state = states.get(target.characterId);
    assert.deepEqual(state.supportEquipment, { mountId: '', shieldId: '' });
    assert.equal(overlayCombatHitPointState(target, state).combat.mounted, false);
    assert.ok(getActorsWithCombatPosts([stored]).has(target.characterId));
    assert.equal(state.temporaryConditions?.some(c => c.blockedResource === 'bonus-action') || false, outcome === 'prone');
    assert.match(renderEvaluationSaveRecords(result), outcome === 'landed' ? /landet auf den Füßen/ : /liegt am Boden/);
    assert.equal(deriveCombatStateFromComments([stored, { characterId: target.characterId, text: 'steht auf' }])
      .get(target.characterId).temporaryConditions?.length || 0, 0);
    assert.equal(target.combat.mountId, 'pony');
  });
}

test('je echter Folgetreffer bleibt einzeln, nach dem Abwurf endet die Prüfung', async () => {
  const sequence = { followUpAttack: { enabled: true, damageFormula: '1d6', damageBonus: 24, repeatCount: 2 } };
  const result = await resolve(strike([damage(4)], sequence), rider(), new Dice(2));
  assert.deepEqual(result.mountedHitChecks.map(c => [c.hitIndex, c.outcome]), [[0,'seated'], [1,'prone']]);
  assert.equal(result.followUpAttacks.length, 2);
  assert.equal(result.secondarySaves.length, 1);
});

test('Fehlschlag, Immunität, Selbsteffekt und reine Zustandswirkung prüfen den Sitz nicht', async () => {
  const target = rider();
  const immune = rider({ damageAffinities: [{ damageType: 'physisch', response: 'immune' }] });
  const results = [await resolve(strike([damage(24)]), target, new Dice(2, 1)),
    await resolve(strike([damage(24)]), immune), await resolve(strike([{ ...damage(24), target: 'self' }], {}, target), base('Gegner')),
    await resolve(strike([{ type: 'debuff', condition: { id: 'mark', name: 'Markiert' }, on: 'hit' }]), target)];
  for (const result of results) assert.equal(result.mountedHitChecks, undefined);
});

test('temporäre TP zählen als erlittene Trefferwirkung, bei Kampfunfähigkeit entfällt die Landungsrettung', async () => {
  const target = { ...rider(), temporaryHitPoints: 30 };
  const guarded = await resolve(strike([damage(24)]), target);
  assert.equal(guarded.targetSnapshot.hitPointsAfter, target.currentHitPoints);
  assert.equal(guarded.mountedHitChecks[0].damage, 24);
  const down = await resolve(strike([damage(99)]), { ...target, currentHitPoints: 2, temporaryHitPoints: 0 });
  assert.equal(down.mountedHitChecks[0].outcome, 'prone');
  assert.equal(down.secondarySaves.length, 0);
});

test('eine bestandene Zauberrettung mit halbem Schaden prüft den Sitz nur gegen den verbliebenen Schaden', async () => {
  const actor = { ...strike([damage(48)]), profileActionKind: 'spell', actionResolutionMode: 'saving-throw',
    actionSaveAttribute: 'dexterity', actionSpellSaveDc: 10, actionHalfDamageOnSave: true };
  const result = await resolve(actor, rider(), new Dice(17));
  assert.equal(result.attack.saveSucceeded, true);
  assert.deepEqual(result.mountedHitChecks, [{ hitIndex: 0, damage: 24, dc: 12, passive: 10, outcome: 'landed' }]);
});

test('Entwaffnen und Sturz im selben Treffer speichern die Waffe und Liegend unabhängig', async () => {
  const target = rider(), result = await resolve(strike([damage(28)], disarm), target, new Dice(2));
  const state = deriveCombatStateFromComments([post(result)]).get(target.characterId);
  assert.equal(state.droppedWeapons[0].weaponId, 'Schwert');
  assert.deepEqual(state.temporaryConditions.map(condition => condition.name), ['Liegend']);
  assert.equal(state.supportEquipment.mountId, '');
});

test('Niederwerfen wirft auch bei ausreichendem Reitsitz ab und löst genau eine Technikrettung aus', async () => {
  const target = rider(), prone = { id: 'wurf', name: 'Liegend', blockedResource: 'bonus-action' };
  const result = await resolve(strike([damage(3)], secondary(prone)), target, new Dice(2));
  assert.equal(result.mountedHitChecks[0].outcome, 'knocked-down');
  assert.equal(result.targetSupportEquipmentSnapshot.after.mountId, '');
  assert.equal(result.targetConditionSnapshot.after.length, 1);
  assert.equal(result.secondarySaves.length, 1);
  const success = await resolve(strike([damage(3)], secondary(prone)), target, new Dice(20));
  assert.equal(success.mountedHitChecks[0].outcome, 'seated');
});

test('kritisches Niederwerfen wirkt beim Beitragsende und ältere Kritbelege behalten ihren gespeicherten Inhalt', async () => {
  const target = rider(), actor = strike([damage(2)]);
  const hit = await resolve(actor, target, new Dice(12, 20));
  const encounter = { encounterId: 'kampf', criticalEffectsVersion: 1 };
  const [effect] = attachCriticalConsequences(hit, { encounter, actor, target, usedConsequenceKeys: new Set(),
    rollFor: () => 11, id: 'krit-test' });
  assert.equal(effect.condition.tags, 'liegend');
  assert.equal(effect.dismount.before.mountId, 'pony');
  const state = deriveCombatStateFromComments([post(hit)]).get(target.characterId);
  assert.equal(state.supportEquipment.mountId, '');
  const legacy = structuredClone(hit);
  delete legacy.criticalConsequence.dismount;
  assert.equal(deriveCombatStateFromComments([post(legacy)]).get(target.characterId).supportEquipment, undefined);
});

test('eine begrenzte passive Rettungsregel hilft der ersten passenden Rettung, derselbe Beitrag hat keinen zweiten Verbrauch', async () => {
  const target = rider({ abilities: [passive('post-roll', 'save-failed', 'force-save-success')] });
  const result = await resolve(strike([damage(30)], disarm), target, new Dice(2));
  assert.deepEqual(result.secondarySaves.map(save => save.succeeded), [true, false]);
  assert.equal(result.sceneItemEvents?.length || 0, 0);
  assert.equal(result.mountedHitChecks[0].outcome, 'prone');
  assert.equal(result.ruleApplications.filter(rule => rule.ruleId === 'abfangen').length, 1);
});

test('gleichrangige widersprüchliche Passiva erscheinen bei Haupt- und Zusatzrettungen im Beleg', async () => {
  for (const primary of [false, true]) {
    const first = passive(primary ? 'pre-roll' : 'pre-secondary-save', 'always', 'force-save-success');
    const second = { ...passive(primary ? 'post-roll' : 'post-secondary-save', 'save-succeeded', 'force-save-failure'), id: 'zweite-quelle' };
    const target = base('Ziel', { abilities: [first, second] });
    const actor = primary ? { ...strike([damage(2)]), profileActionKind: 'spell', actionResolutionMode: 'saving-throw',
      actionSaveAttribute: 'dexterity', actionSpellSaveDc: 15 } : strike([damage(2)], disarm);
    const result = await resolve(actor, target, new Dice(2, primary ? 2 : 15));
    assert.equal(primary ? result.attack.saveSucceeded : result.secondarySaves[0].succeeded, false);
    assert.equal(result.ruleConflicts.length, 1);
    assert.deepEqual(new Set(result.ruleConflicts[0].applications.map(rule => rule.outcome)), new Set(['force-save-success', 'force-save-failure']));
  }
});

test('eine passive Szenenrettung beim Waffenmanöver einer Herausforderung bleibt nach Neuladen verbraucht', async () => {
  const actor = base('Wache');
  const target = base('Ziel', { abilities: [passive('post-secondary-save', 'save-failed', 'force-save-success', { frequency: 'scene' })] });
  const participants = new Map([actor, target].map(profile => [profile.characterId, { actorId: profile.characterId, profile, state: {} }]));
  const args = { effect: { effectId: 'probe', targetActorId: target.characterId, maneuver: {
    actorId: actor.characterId, weaponId: 'Schwert', rollMode: 'normal', damageMultiplier: 1, save: { attribute: 'dexterity', difficulty: 15 } } },
    getContext: id => participants.get(id), dice: new Dice(2), sceneItems: new Map(), periods: { comment: 'zug1', scene: 'kampf' }, identity: 'probe' };
  const first = await resolveChallengeWeaponManeuver(args);
  assert.equal(first.save.succeeded, true);
  assert.equal(first.resolution, undefined);
  const keys = deriveCombatRuleFrequencyKeys([{ commentSegments: [{ skillResolution: { herausforderungCombatResults: [first] } }] }]);
  assert.ok(keys.has(first.save.ruleApplications[0].usedKey));
  const next = await resolveChallengeWeaponManeuver({ ...args, usedKeys: keys, periods: { comment: 'zug2', scene: 'kampf' } });
  assert.equal(next.save.succeeded, false);
  assert.equal(next.resolution.attack.hit, true);
});
