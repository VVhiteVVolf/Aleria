import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EXPANSION_QUIRK_DEFINITIONS } from '../modules/character-development/development-expansion-quirks.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getCombatInitiative, getCombatMovement } from '../modules/combat/combat-profile-model.js';

const authored = EXPANSION_QUIRK_DEFINITIONS.map(([id, name, description, mechanics, cost, extra = {}]) => ({
  id: `development-trait-${id}`, name, description, mechanics, cost, active: true, triggerRules: extra.triggerRules || []
}));
const ids = new Set(authored.map(entry => entry.id));
const canonical = value => Array.isArray(value)
  ? value.map(canonical).filter(value => value != null).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([key, value]) => [key, key === 'name' ? getSkillIdentity(value) || value : canonical(value)])
      .filter(([, value]) => value !== false && value !== '' && value !== 'normal' && value !== 0 && value != null && (!Array.isArray(value) || value.length))
      .sort(([a], [b]) => a.localeCompare(b)))
    : value;
const signature = entry => JSON.stringify(canonical({ mechanics: entry.mechanics,
  triggerRules: (entry.triggerRules || []).map(({ id, name, description, ...rule }) => rule) }));

test('fifteen distinct habits add neither old names nor equivalent existing effects', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../diagnostics/talents-quirks-abilities-20261106/existing-catalog.json', import.meta.url), 'utf8'));
  const previous = snapshot.entries;
  const names = new Set(previous.map(entry => entry.name.toLocaleLowerCase('de')));
  const effects = new Set(previous.map(signature));
  assert.equal(authored.length, 15);
  assert.equal(ids.size, 15);
  for (const entry of authored) {
    assert.equal(names.has(entry.name.toLocaleLowerCase('de')), false, entry.name);
    assert.equal(effects.has(signature(entry)), false, `${entry.name}: existing equivalent effect`);
    assert.ok(entry.id.startsWith('development-trait-marotte-'));
    assert.ok(entry.cost >= -1 && entry.cost <= 0, entry.name);
    names.add(entry.name.toLocaleLowerCase('de')); effects.add(signature(entry));
  }
});

test('every habit applies only its declared small check, initiative and movement modifiers', () => {
  const base = sanitizeCharacterCombatProfile({ hitPoints: { current: 3 }, progression: { level: 1 } });
  for (const entry of authored) {
    const profile = sanitizeCharacterCombatProfile({ ...base, quirks: [entry] });
    for (const skill of base.skills) {
      const expected = (entry.mechanics.skillModifiers || []).filter(modifier => getSkillIdentity(modifier.name) === getSkillIdentity(skill.name))
        .reduce((sum, modifier) => sum + modifier.bonus, 0);
      assert.equal(getSkillTotal(profile, skill) - getSkillTotal(base, skill), expected, `${entry.name}/${skill.name}`);
    }
    assert.equal(getCombatInitiative(profile) - getCombatInitiative(base), entry.mechanics.initiative || 0, entry.name);
    assert.equal(getCombatMovement(profile) - getCombatMovement(base), entry.mechanics.movement || 0, entry.name);
    for (const key of ['skills', 'attributes', 'weapons', 'armorItems', 'resources', 'hitPoints', 'techniques', 'proficiencies']) assert.deepEqual(profile[key], base[key], `${entry.name}/${key}`);
  }
});
