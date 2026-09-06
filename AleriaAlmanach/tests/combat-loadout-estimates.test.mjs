import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getCombatWeaponLoadout, getActorsWithCombatPosts } from '../modules/combat/combat-weapon-loadout.js';
import { prepareCombatEquipment, reserveCombatEquipment } from '../modules/combat/combat-equipment-preparation.js';
import { withEquippedCombatWeapon } from '../modules/combat/combat-equipment-state.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { estimateCombatHitChance, averageDamageFormula, estimateCombatDamage } from '../modules/combat/combat-action-estimates.js';
import { renderWeaponLoadout } from '../modules/combat/ui/combat-weapon-loadout-view.js';
import { renderSelectedTargetPortraits, renderTargetOptions } from '../modules/combat/ui/combat-target-picker.js';

const guinevere = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/guinevere-neidr.json', import.meta.url), 'utf8')).character;
const gawain = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8')).character;
const daggers = guinevere.combatProfile.weapons.find(weapon => /Jagddolch/.test(weapon.name));
const sword = guinevere.combatProfile.weapons.find(weapon => /Schwert/.test(weapon.name));
const loadout = { rightWeaponId: daggers.id, leftWeaponId: daggers.id };
const resource = (profile, id) => profile.resources.find(item => item.id === id)?.current;
function preparedActor(requested = loadout, free = false, options = {}) {
  const prepared = prepareCombatEquipment(guinevere, requested, { free });
  return reserveCombatEquipment(resolveCombatProfile(prepared.character, options), prepared.preparation);
}
class FixedDice {
  constructor(natural = 10) { this.natural = natural; }
  async rollAttack({ modifier, rollMode }) { return { natural: this.natural, dice: rollMode === 'normal' ? [this.natural] : [this.natural, this.natural], keptDice: [this.natural], total: this.natural + modifier }; }
  async rollDamage() { return { total: 1, dice: [1], keptDice: [1], modifier: 0 }; }
}

test('Guineveres vorhandenes Paar belegt zwei Hände, ohne Formel oder Attackenpool zu verdoppeln', () => {
  const original = JSON.stringify(guinevere);
  const actor = preparedActor();
  assert.equal(actor.weaponLoadout.dualWield, true);
  assert.equal(actor.weaponLoadout.left.id, daggers.id);
  assert.equal(actor.weapon.damageFormula.toLowerCase(), '1d4');
  assert.equal(actor.techniques.length, resolveCombatProfile(guinevere).techniques.length);
  const markup = renderWeaponLoadout(actor, { requestedLoadout: loadout });
  assert.equal((markup.match(/data-state="active"/g) || []).length, 2);
  assert.match(markup, /Rechts · Aktiv geführt/);
  assert.match(markup, /Links · Aktiv geführt/);
  assert.equal(JSON.stringify(guinevere), original);
});

test('alte Paare werden automatisch erkannt, eine ausdrücklich leere linke Hand bleibt leer', () => {
  const old = withEquippedCombatWeapon(guinevere, daggers.id);
  assert.equal(getCombatWeaponLoadout(old.combatProfile).dualWield, true);
  assert.equal(getCombatWeaponLoadout(withEquippedCombatWeapon(old, daggers.id, '').combatProfile).dualWield, false);
});

test('zwei verschiedene Handwaffen behalten ihre jeweiligen Würfel, Zweihandgriff ist gesperrt', () => {
  const actor = preparedActor({ rightWeaponId: sword.id, leftWeaponId: daggers.id }, true, { actionId: `weapon:${daggers.id}`, weaponGrip: 'two-handed' });
  assert.equal(actor.actions.find(action => action.id === `weapon:${sword.id}`).compatible, true);
  assert.equal(actor.actions.find(action => action.id === `weapon:${daggers.id}`).compatible, true);
  assert.equal(actor.weapon.damageFormula.toLowerCase(), '1d4');
  assert.equal(actor.weaponGrip, 'one-handed');
});

test('einzelne Waffen werden nicht dupliziert und ein Bogen lässt keine zweite Handwaffe zu', () => {
  assert.match(preparedActor({ rightWeaponId: sword.id, leftWeaponId: sword.id }).equipmentPreparation.error, /einzelne Waffe/);
  const bow = guinevere.combatProfile.weapons.find(weapon => /Langbogen/.test(weapon.name));
  assert.match(preparedActor({ rightWeaponId: bow.id, leftWeaponId: daggers.id }).equipmentPreparation.error, /beide Hände/);
  assert.match(preparedActor({ rightWeaponId: 'fremde-waffe', leftWeaponId: '' }).equipmentPreparation.error, /gehört nicht/);
});

test('Startausrüstung ist frei; späterer Wechsel verbraucht sofort exakt eine Bonusaktion', () => {
  const baseline = resolveCombatProfile(guinevere);
  assert.equal(resource(preparedActor(loadout, true), 'bonus-action'), resource(baseline, 'bonus-action'));
  assert.equal(resource(preparedActor(), 'bonus-action'), resource(baseline, 'bonus-action') - 1);
  assert.equal(resource(preparedActor(), 'action'), resource(baseline, 'action'));
  assert.equal(prepareCombatEquipment(guinevere, null).character, guinevere);
});

test('Wechsel und Angriff werden gemeinsam ausgewertet, gespeichert und aus dem Verlauf wiederhergestellt', async () => {
  const actor = preparedActor();
  const resolution = await new CombatResolutionService(new FixedDice(15)).resolveAttack({ actor, target: resolveCombatProfile(gawain) });
  assert.equal(resource({ resources: resolution.actorResourceSnapshot.after }, 'bonus-action'), 0);
  assert.equal(resource({ resources: resolution.actorResourceSnapshot.after }, 'action'), 0);
  assert.equal(resource({ resources: resolution.actorResourceSnapshot.before }, 'bonus-action'), 1);
  assert.equal(resolution.actorEquippedWeaponSnapshot.offHandAfter, daggers.id);
  const states = deriveCombatStateFromComments([{ commentSegments: [{ combatResolution: resolution }] }]);
  assert.equal(states.get(guinevere.id).offHandWeaponId, daggers.id);
  const restored = withEquippedCombatWeapon(guinevere, states.get(guinevere.id).equippedWeaponId, states.get(guinevere.id).offHandWeaponId);
  assert.equal(resolveCombatProfile(restored).weaponLoadout.dualWield, true);
  assert.equal(deriveCombatStateFromComments([]).has(guinevere.id), false);
});

test('ein Waffenwechsel mit fehlender Bonusaktion ist auch bei Aura-Zahlung ungültig', async () => {
  const prepared = prepareCombatEquipment(guinevere, loadout);
  const base = resolveCombatProfile(prepared.character, { paymentMode: 'aura' });
  base.resources = base.resources.map(item => item.id === 'bonus-action' ? { ...item, current: 0 } : item);
  const actor = reserveCombatEquipment(base, prepared.preparation);
  await assert.rejects(new CombatResolutionService(new FixedDice()).resolveAttack({ actor, target: resolveCombatProfile(gawain) }), /Bonusaktion/);
});

test('zwei belegte Hände unterdrücken Schild-RK, Ablegen der Zweitwaffe stellt sie wieder her', () => {
  const profile = structuredClone(guinevere);
  profile.combatProfile.armorItems.push({ id: 'test-shield', name: 'Prüfschild', kind: 'shield', armorClassBonus: 2, equipped: true });
  const one = resolveCombatProfile(withEquippedCombatWeapon(profile, sword.id, ''));
  const two = resolveCombatProfile(withEquippedCombatWeapon(profile, sword.id, daggers.id));
  assert.equal(one.totalDefense - two.totalDefense, 2);
});

test('Startberechtigung zählt eigene Kampfposts und beginnt bei einer neuen Kampfankündigung neu', () => {
  const first = { commentSegments: [{ combatResolution: { actorId: 'a' } }] };
  assert.equal(getActorsWithCombatPosts([first]).has('b'), false);
  assert.equal(getActorsWithCombatPosts([first]).has('a'), true);
  assert.equal(getActorsWithCombatPosts([first, { combatEncounter: { operation: 'start' } }]).size, 0);
});

test('Trefferchance berücksichtigt natürliche 1/20, Krit ab 19 sowie Vor- und Nachteil', () => {
  const actor = { ...resolveCombatProfile(gawain), attackModifier: 5, conditions: [], abilities: [], quirks: [], techniques: [], forcedRollMode: 'normal' };
  const target = { ...resolveCombatProfile(guinevere), totalDefense: 16, conditions: [], abilities: [], quirks: [], techniques: [] };
  const chance = mode => estimateCombatHitChance({ ...actor, forcedRollMode: mode }, target).probability;
  assert.ok(Math.abs(chance('normal') - .5) < 1e-10);
  assert.ok(Math.abs(chance('advantage') - .75) < 1e-10);
  assert.ok(Math.abs(chance('disadvantage') - .25) < 1e-10);
  const rapier = { ...actor, selectedAction: { ...actor.selectedAction, criticalThreshold: 19 } };
  assert.ok(Math.abs(estimateCombatHitChance(rapier, { ...target, totalDefense: 99 }).probability - .1) < 1e-10);
  assert.ok(Math.abs(estimateCombatHitChance(actor, { ...target, totalDefense: 0 }).probability - .95) < 1e-10);
});

test('Vorschau stimmt für jeden W20-Wert mit der realen Auswertung einschließlich Zielregel überein', async () => {
  const actor = { ...resolveCombatProfile(gawain), conditions: [], abilities: [], quirks: [], techniques: [] };
  const target = { ...resolveCombatProfile(guinevere), conditions: [], abilities: [], techniques: [], quirks: [{ id: 'parry', name: 'Probeparade', active: true, triggerRules: [{ id: 'parry', enabled: true, phase: 'post-roll', activation: 'passive', recipient: 'target', sourceRelation: 'self', condition: 'always', effects: { defenseModifier: 3 } }] }] };
  let hits = 0;
  const before = JSON.stringify({ actor, target });
  for (let natural = 1; natural <= 20; natural += 1) {
    const resolution = await new CombatResolutionService(new FixedDice(natural)).resolveAttack({ actor, target });
    hits += Number(resolution.attack.hit);
  }
  assert.ok(Math.abs(estimateCombatHitChance(actor, target).probability - hits / 20) < 1e-10);
  assert.equal(JSON.stringify({ actor, target }), before);
});

test('Durchschnitt berücksichtigt Mischwürfel, feste Boni und die Schadensuntergrenze', () => {
  assert.equal(averageDamageFormula('1W10+1W4', 2), 10);
  assert.equal(averageDamageFormula('1W4', -3), .25);
  assert.equal(estimateCombatDamage({ selectedAction: { effects: [{ type: 'healing', formula: '1d8' }] }, weapon: { damageFormula: '1d8' } }), null);
  assert.equal(estimateCombatDamage({ selectedAction: { effects: [{ type: 'damage', amount: 4 }] }, damageModifier: 99 }), 4);
});

test('Rettungswurf-Chance meint das Misslingen des Zielwurfs, ohne automatische 1/20-Regel', () => {
  const actor = { ...resolveCombatProfile(gawain), actionResolutionMode: 'saving-throw', actionSpellSaveDc: 100,
    conditions: [], abilities: [], quirks: [], techniques: [] };
  const target = { ...resolveCombatProfile(guinevere), conditions: [], abilities: [], quirks: [], techniques: [] };
  assert.equal(estimateCombatHitChance(actor, target).probability, 1);
  assert.equal(estimateCombatHitChance({ ...actor, actionSpellSaveDc: 1 }, target).probability, 0);
  assert.equal(estimateCombatHitChance(actor, target).label, 'Wirkung');
});

test('jedes Ziel zeigt seine eigene Chance in Liste und Avatar-Chip', () => {
  const targets = [{ characterId: 'a', name: 'A', totalDefense: 16, hitChance: { probability: .5, label: 'Treffer' } }, { characterId: 'b', name: 'B', totalDefense: 18, hitChance: { probability: .4, label: 'Treffer' } }];
  for (const markup of [renderTargetOptions(targets), renderSelectedTargetPortraits(targets, new Set(['a','b']))]) {
    assert.match(markup, /50 % Treffer/);
    assert.match(markup, /40 % Treffer/);
  }
});
