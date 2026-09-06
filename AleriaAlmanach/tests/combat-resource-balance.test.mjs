import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { createCharacterLevelUpPlan, previewCharacterLevelUp, applyManualCharacterLevel } from '../modules/combat/combat-level-up-model.js';
import { fillActionPoolChoices, normalizeActionPoolChoices, getSpecialActionMaximum } from '../modules/combat/combat-action-progression.js';
import { getActionPaymentCosts, recoverDailyCombatResources, resetCommentScopedResources } from '../modules/combat/combat-action-economy.js';
import { applyCombatResourceCosts, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getCombatStyle } from '../modules/combat-styles/combat-style-registry.js';
import { getAutofilledCenyrCombatProfile } from '../modules/classes/cenyr/cenyr-combat-profile-autofill.js';

const resource = (profile, id) => profile.resources.find(entry => entry.id === id);
const attacks = getCombatStyle('drachentanz').forms.flatMap(form => form.techniques);
const loadCharacter = async name => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${name}.json`, import.meta.url), 'utf8')).character;

test('Besondere Aktionen wachsen genau auf 2/3/4/5/6; alle drei Wahlen sind verschieden', () => {
  assert.deepEqual([1, 7, 8, 9, 10, 14, 15, 19, 20].map(getSpecialActionMaximum), [2, 2, 3, 3, 4, 4, 5, 5, 6]);
  const invalid = [{ level: 10, resourceId: 'action' }, { level: 15, resourceId: 'action' }, { level: 20, resourceId: 'reaction' }, { level: 5, resourceId: 'bonus-action' }];
  assert.deepEqual(normalizeActionPoolChoices(invalid, 19), [{ level: 10, resourceId: 'action' }]);
  const full = fillActionPoolChoices(invalid, 20);
  assert.equal(new Set(full.map(choice => choice.resourceId)).size, 3);
  assert.equal(full.find(choice => choice.level === 20).resourceId, 'reaction');
});

test('Aufstiege 10/15/20 verlangen eine gültige Poolwahl und verhindern ein drittes Maximum', () => {
  for (const level of [9, 14, 19]) {
    const before = sanitizeCharacterCombatProfile({ progression: { level } });
    const plan = createCharacterLevelUpPlan(before);
    if (level === 19) plan.attributeIncreases.strength = 2;
    const missing = previewCharacterLevelUp(before, plan);
    assert.equal(missing.ready, false);
    assert.ok(missing.errors.some(error => error.includes('Poolsteigerung')));
    const group = missing.actionPoolChoiceGroups.find(entry => entry.level === level + 1);
    plan.actionPoolChoices[level + 1] = group.options[0].id;
    const ready = previewCharacterLevelUp(before, plan);
    assert.equal(ready.ready, true, ready.errors.join(' '));
    assert.equal(resource(ready.profile, group.options[0].id).maximum, 2);
    if (level === 19) assert.deepEqual(['action', 'bonus-action', 'reaction'].map(id => resource(ready.profile, id).maximum), [2, 2, 2]);
  }
  const before = sanitizeCharacterCombatProfile({ progression: { level: 14 } });
  const bad = createCharacterLevelUpPlan(before);
  bad.actionPoolChoices[15] = before.progression.actionPoolChoices[0].resourceId;
  assert.equal(previewCharacterLevelUp(before, bad).ready, false);
});

test('manuelle Stufenwechsel ergänzen und entfernen verdiente Poolwahlen ohne doppelte Steigerungen', () => {
  const start = sanitizeCharacterCombatProfile({ progression: { level: 1 } });
  const high = applyManualCharacterLevel(start, 20).profile;
  assert.equal(high.progression.actionPoolChoices.length, 3);
  assert.deepEqual(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'].map(id => resource(high, id).maximum), [2, 2, 2, 6, 4]);
  const low = applyManualCharacterLevel(high, 6).profile;
  assert.deepEqual(low.progression.actionPoolChoices, []);
  assert.deepEqual(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'].map(id => resource(low, id).maximum), [1, 1, 1, 2, 0]);
});

test('Gildas erhält keine veraltete zweite Reaktion oder Aura aus Profil und Szenenstand', async () => {
  const character = await loadCharacter('gildas-gafyr');
  character.combatProfile.resources.find(entry => entry.id === 'reaction').maximum = 2;
  character.combatProfile.resources.find(entry => entry.id === 'aura-focus').maximum = 1;
  const profile = resolveCombatProfile(character);
  const overlaid = overlayCombatHitPointState(profile, { resources: [
    { id: 'reaction', maximum: 2, current: 2 }, { id: 'aura-focus', maximum: 1, current: 1 },
    { id: 'special-action', maximum: 2, current: 1 }
  ] });
  assert.deepEqual(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'].map(id => resource(overlaid, id).current), [1, 1, 1, 1, 0]);
  const claws = profile.actions.find(action => /gekreuzte-klauen/.test(action.id));
  const first = applyCombatResourceCosts(overlaid.resources, getActionPaymentCosts(claws, 'standard', overlaid));
  assert.equal(first.sufficient, true);
  assert.equal(applyCombatResourceCosts(first.after, getActionPaymentCosts(claws, 'standard', overlaid)).sufficient, false);
});

test('alle 212 Attacken sind bei Freischaltung regulär bezahlbar, die Mehrheit ohne Tagesressourcen', () => {
  assert.equal(attacks.length, 212);
  let renewable = 0;
  for (const attack of attacks) {
    const profile = sanitizeCharacterCombatProfile({ progression: { level: attack.minimumLevel } });
    const payment = applyCombatResourceCosts(profile.resources, getActionPaymentCosts(attack, 'standard', profile));
    assert.equal(payment.sufficient, true, `${attack.name} ab ${attack.minimumLevel}: ${payment.missing?.name}`);
    if (attack.costs.every(cost => ['action', 'bonus-action', 'reaction'].includes(cost.resourceId))) renewable++;
    if (attack.costs.some(cost => cost.resourceId === 'special-action')) assert.ok(attack.costs.length > 1, attack.name);
    assert.ok(attack.costs.filter(cost => ['action', 'bonus-action', 'reaction'].includes(cost.resourceId)).every(cost => cost.amount <= 1), `${attack.name} hängt von keiner Poolwahl ab`);
  }
  assert.ok(renewable > attacks.length * 0.5, `${renewable}/212 ohne Tagesressourcen`);
});

test('Aura ersetzt auch bei Meisterattacken das gesamte Paket; Tagesressourcen bleiben über Beiträge verbraucht', () => {
  const profile = sanitizeCharacterCombatProfile({ progression: { level: 20 } });
  const master = attacks.find(attack => attack.minimumLevel === 20 && attack.costs.some(cost => cost.resourceId === 'special-action'));
  const costs = getActionPaymentCosts(master, 'aura', profile);
  assert.deepEqual(costs.map(cost => cost.resourceId), ['aura-focus']);
  assert.equal(costs[0].amount, 2);
  const paid = applyCombatResourceCosts(profile.resources, getActionPaymentCosts(master, 'standard', profile));
  const reset = resetCommentScopedResources(paid.after);
  assert.equal(reset.find(entry => entry.id === 'special-action').current, 4);
  assert.equal(reset.find(entry => entry.id === 'action').current, 2);
  const recovered = recoverDailyCombatResources(reset.map(entry => ({ ...entry, recoveryDayKey: 'day-1' })), 'day-2');
  assert.equal(recovered.find(entry => entry.id === 'special-action').current, 6);
});

test('Cenyr-Cache bewahrt aktuelle Charakterwerte und ersetzt alte Attackenkosten aus dem Katalog', async () => {
  const { combatProfile: profile } = await loadCharacter('gildas-gafyr');
  profile.techniques[0].costs = [{ resourceId: 'reaction', amount: 9 }];
  const first = getAutofilledCenyrCombatProfile(profile);
  assert.deepEqual(first.techniques[0].costs, attacks.find(attack => attack.id === first.techniques[0].id).costs);
  profile.resources = profile.resources.map(entry => ({ ...entry, current: 0 }));
  profile.notes = 'Aktuelle Notiz';
  const next = getAutofilledCenyrCombatProfile(profile);
  assert.equal(next.notes, 'Aktuelle Notiz');
  assert.equal(next.resources, profile.resources);
  assert.equal(next.techniques, first.techniques, 'Katalogprojektion wird wiederverwendet');
});
