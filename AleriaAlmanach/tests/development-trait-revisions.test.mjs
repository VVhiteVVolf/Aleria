import test from 'node:test';
import assert from 'node:assert/strict';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../modules/character-development/development-trait-revision-source.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { normalizeCombatTrait, sanitizeCharacterCombatProfile, getNaturalRollPolicy } from '../modules/combat/combat-profile-model.js';
import { compactCombatResolution } from '../modules/combat/combat-resolution-storage.js';

test('every exact original catalog copy receives current rules without rewriting its identity', () => {
  for (const previous of PREVIOUS_DEVELOPMENT_TRAITS) {
    const stored = { ...structuredClone(previous), id: `personal-${previous.id}`, developmentTraitId: previous.id, active: false, icon: '/personal.png' };
    const before = structuredClone(stored);
    const revised = normalizeCombatTrait(stored);
    const current = normalizeCombatTrait(DEVELOPMENT_TRAITS.find(entry => entry.id === previous.id));
    assert.deepEqual(revised.mechanics, current.mechanics, previous.name);
    assert.deepEqual(revised.triggerRules, current.triggerRules, previous.name);
    assert.equal(revised.description, current.description, previous.name);
    assert.equal(revised.id, stored.id);
    assert.equal(revised.developmentTraitId, stored.developmentTraitId);
    assert.equal(revised.active, false);
    assert.equal(revised.icon, '/personal.png');
    assert.deepEqual(normalizeCombatTrait(revised), revised);
    assert.deepEqual(stored, before);
  }
});
test('a personal mechanical variant, annotation or unrelated trait keeps its rules', () => {
  const previous = PREVIOUS_DEVELOPMENT_TRAITS.find(entry => entry.id === 'development-trait-glueckspilz');
  for (const change of [{ description: 'Persönliche Vereinbarung.' }, { mechanics: { savingThrow: 2 } }, { id: 'unrelated', tags: '' }]) {
    const stored = { ...structuredClone(previous), ...change };
    const revised = normalizeCombatTrait(stored);
    assert.equal(revised.mechanics.naturalOneReroll, undefined);
    assert.equal(revised.description, stored.description);
  }
});
test('catalog revision preserves live resources, inventory, wounds and historical receipts', () => {
  const oldLucky = PREVIOUS_DEVELOPMENT_TRAITS.find(entry => entry.id === 'development-trait-glueckspilz');
  const profile = sanitizeCharacterCombatProfile({ quirks: [oldLucky], hitPoints: { current: 7, temporary: 2, maximumOverride: 40 },
    resources: [{ id: 'mana', name: 'Mana', current: 3, maximum: 20, recovery: 'manual' }], inventory: { items: [] } });
  assert.equal(getNaturalRollPolicy(profile).naturalOneReroll, true);
  assert.equal(profile.hitPoints.current, 7);
  assert.equal(profile.hitPoints.temporary, 2);
  assert.equal(profile.hitPoints.maximumOverride, 40);
  assert.equal(profile.resources.find(entry => entry.id === 'mana').current, 3);
  const historical = { attack: { naturalRoll: 1, criticalFailure: true, diceResults: [1] }, rulesVersion: 'combat-evaluation-12' };
  assert.deepEqual(compactCombatResolution(historical).attack, historical.attack);
});
