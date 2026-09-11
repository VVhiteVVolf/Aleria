import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveCombatProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { applyManualCharacterLevel } from '../modules/combat/combat-level-up-model.js';
import { getSpellManaCost } from '../modules/combat/combat-resource-progression.js';
import { combineDamageFormulas, parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { reconcileClassDamageRevisions } from '../modules/classes/class-damage-revisions.js';
import { getActionCostPresentation } from '../modules/combat/ui/combat-action-picker.js';

const load = async () => JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;

test('alle 23 Zauber verwenden differenzierte Pakete, genau ein Zauber das seltene Spitzenpaket', async () => {
  const character = await load();
  const spells = resolveCombatProfile(character).magic.spells;
  assert.equal(spells.length, 23);
  const packages = new Set();
  const peakSpells = [];
  for (const spell of spells) {
    const actions = spell.costs.filter(cost => ['action', 'reaction', 'bonus-action', 'special-action'].includes(cost.resourceId));
    assert.equal(new Set(actions.map(cost => cost.resourceId)).size, actions.length, spell.name);
    assert.ok(actions.every(cost => cost.amount === 1), spell.name);
    assert.equal(spell.activationType, actions[0].resourceId, spell.name);
    assert.equal(spell.costs.find(cost => cost.resourceId === 'mana-focus').amount, getSpellManaCost(spell.level));
    packages.add(actions.map(cost => cost.resourceId).sort().join(','));
    if (actions.length >= 3 && actions.some(cost => cost.resourceId === 'special-action')) peakSpells.push(spell.name);
  }
  assert.equal(packages.size, 9);
  assert.deepEqual(peakSpells, ['Hundert Klingen Sturm']);
});

test('Zauberkosten werden vollständig angezeigt, tatsächlich verbraucht und bei jeder fehlenden Teilressource gesperrt', async () => {
  const character = await load();
  const target = resolveCombatProfile({ id: 'target', name: 'Ziel', combatProfile: { hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: 10 } } });
  const dice = {
    async rollAttack({ modifier = 0 }) { return { natural: 10, dice: [10], keptDice: [10], total: 10 + modifier }; },
    async rollDamage({ bonus = 0, damageFormula }) { return { notation: damageFormula, dice: [1], keptDice: [1], total: 1 + bonus, modifier: bonus }; }
  };
  for (const [id, actionIds] of [
    ['schild', ['reaction']], ['druckstoss', ['reaction', 'bonus-action']],
    ['magierruestung', ['action', 'reaction']], ['magisches-geschoss', ['action', 'bonus-action']],
    ['windklinge', ['action']], ['person-festhalten', ['action', 'special-action']],
    ['berstende-boe', ['action', 'reaction', 'bonus-action']],
    ['hundert-klingen-sturm', ['action', 'special-action', 'reaction']], ['blitzfunken', ['action', 'special-action']]
  ]) {
    const actor = resolveCombatProfile(character, { actionId: `spell:rhiannon-${id}` });
    assert.deepEqual(actor.resourceCosts.filter(cost => cost.resourceId !== 'mana-focus').map(cost => cost.resourceId), actionIds, id);
    const presentation = getActionCostPresentation(actor, actor.selectedAction);
    assert.equal(presentation.length, actor.resourceCosts.length, id);
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
    for (const cost of actor.resourceCosts) {
      const before = result.actorResourceSnapshot.before.find(resource => resource.id === cost.resourceId);
      const after = result.actorResourceSnapshot.after.find(resource => resource.id === cost.resourceId);
      assert.equal(before.current - after.current, cost.amount, `${id}: ${cost.resourceId}`);
      const blocked = { ...actor, resources: actor.resources.map(resource => resource.id === cost.resourceId ? { ...resource, current: 0 } : resource) };
      await assert.rejects(new CombatResolutionService(dice).resolveAttack({ actor: blocked, target }), undefined, `${id}: ${cost.resourceId}`);
    }
    for (const resourceId of ['action', 'reaction', 'bonus-action', 'special-action'].filter(resourceId => !actionIds.includes(resourceId))) {
      const before = result.actorResourceSnapshot.before.find(resource => resource.id === resourceId);
      const after = result.actorResourceSnapshot.after.find(resource => resource.id === resourceId);
      assert.equal(after.current, before.current, `${id}: ungenutzte ${resourceId}`);
    }
  }
});

test('der Kostenabgleich erreicht auch reine Nutzzauber und erhält Mana sowie besondere Nutzungsgrenzen', () => {
  const mana = { resourceId: 'mana-focus', amount: 1 };
  const limit = { resourceId: 'daily-limit', amount: 1 };
  const original = { magic: { spells: [{ id: 'rhiannon-licht', activationType: 'action', costs: [{ resourceId: 'action', amount: 1 }, mana, limit], effects: [] }] } };
  const revised = reconcileClassDamageRevisions(original);
  const light = revised.magic.spells[0];
  assert.equal(light.activationType, 'bonus-action');
  assert.deepEqual(light.costs.map(cost => cost.resourceId), ['bonus-action', 'mana-focus', 'daily-limit']);
  assert.deepEqual(light.costs.slice(1), [mana, limit]);
  assert.equal(original.magic.spells[0].activationType, 'action');
  assert.deepEqual(reconcileClassDamageRevisions(revised), revised);
});

test('Rhiannons früher verbrauchter Grad-I-Zähler sperrt weder Schild noch Magisches Geschoss', async () => {
  const character = await load();
  character.combatProfile.resources.find(resource => resource.id === 'spell-slot-1').current = 0;
  for (const id of ['rhiannon-schild', 'rhiannon-magisches-geschoss']) {
    const actor = resolveCombatProfile(character, { actionId: `spell:${id}`, segmentKind: 'spell' });
    assert.equal(validateCombatActorProfile(actor).ready, true);
    assert.ok(!actor.resourceCosts.some(cost => cost.resourceId.startsWith('spell-slot-')));
    assert.equal(actor.resourceCosts.find(cost => cost.resourceId === 'mana-focus').amount, 2);
  }
});

test('Hochwirken berechnet die Manakosten des gewählten Grades und sperrt nicht freigeschaltete Grade', async () => {
  const character = await load();
  for (const castLevel of [1, 2, 3]) {
    const actor = resolveCombatProfile(character, { actionId: 'spell:rhiannon-magisches-geschoss', castLevel });
    assert.equal(actor.selectedAction.compatible, true);
    assert.equal(actor.resourceCosts.find(cost => cost.resourceId === 'mana-focus').amount, getSpellManaCost(castLevel));
    assert.equal(actor.selectedAction.effects[0].formula, `${castLevel}d4+1`);
  }
  const locked = resolveCombatProfile(character, { actionId: 'spell:rhiannon-magisches-geschoss', castLevel: 4 });
  assert.equal(validateCombatActorProfile(locked).ready, false);
});

test('manuelles Herabstufen entfernt die höheren Gradfreigaben wieder', async () => {
  const character = await load();
  character.combatProfile = applyManualCharacterLevel(character.combatProfile, 8).profile;
  assert.equal(resolveCombatProfile(character, { actionId: 'spell:rhiannon-magisches-geschoss', castLevel: 4 }).selectedAction.compatible, true);
  character.combatProfile = applyManualCharacterLevel(character.combatProfile, 6).profile;
  assert.equal(resolveCombatProfile(character, { actionId: 'spell:rhiannon-magisches-geschoss', castLevel: 4 }).selectedAction.compatible, false);
});

test('Hochwirken verbindet unterschiedliche Würfel und feste Zuschläge zu einer ausführbaren Formel', () => {
  const formula = combineDamageFormulas(['1w8+2', '1d4-1', '1d4-1']);
  assert.equal(formula, '1d8+2d4');
  assert.equal(parseDamageFormula(formula).fixedModifier, 0);
  assert.equal(combineDamageFormulas(['1d4+1', '1d4+2', '1d4+2']), '3d4+5');
});

test('Fortsetzung einer Flächenaktion hebt nur die Handlungsunfähigkeit derselben begonnenen Handlung auf', async () => {
  const actor = resolveCombatProfile(await load(), { actionId: 'spell:rhiannon-magisches-geschoss' });
  actor.currentHitPoints = 0;
  const startedAction = { resolutionId: 'already-resolved', actorId: actor.characterId, profileActionId: actor.profileActionId, actionType: 'spell' };
  assert.equal(validateCombatActorProfile(actor).ready, false);
  assert.equal(validateCombatActorProfile(actor, { startedAction }).ready, true);
  for (const change of [{ actorId: 'someone-else' }, { profileActionId: 'another-action' }, { actionType: 'channeling' }, { resolutionId: '' }]) {
    assert.equal(validateCombatActorProfile(actor, { startedAction: { ...startedAction, ...change } }).ready, false);
  }
  actor.selectedAction.compatible = false;
  assert.equal(validateCombatActorProfile(actor, { startedAction }).ready, false);
});
