import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveCombatProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { applyManualCharacterLevel } from '../modules/combat/combat-level-up-model.js';
import { getSpellManaCost } from '../modules/combat/combat-resource-progression.js';
import { combineDamageFormulas, parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';

const load = async () => JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;

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
