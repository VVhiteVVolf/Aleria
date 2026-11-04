import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';
import { getDevelopmentTraitId } from '../../AleriaAlmanach/modules/character-development/development-entry-reference.js';
import { normalizeCombatTrait } from '../../AleriaAlmanach/modules/combat/combat-profile-model.js';

const catalog = new Map(DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));

export function guideCatalogTraitAdvice(id, note = '') {
  const source = catalog.get(id);
  assert.ok(source, `Katalogmerkmal des Guides fehlt: ${id}`);
  const trait = normalizeCombatTrait(source);
  return [trait.name, 'Persönlichkeit', [trait.description, note].filter(Boolean).join(' ')];
}

// The shared normalizer revises only proven, unchanged old catalogue copies.
// Personal variants keep the same rules in the guide and the combat engine.
export function withCurrentGuideTraits(character) {
  const profile = character.combatProfile || {};
  const entries = profile.quirks || profile.traits || [];
  if (!entries.some(entry => catalog.has(getDevelopmentTraitId(entry)))) return character;
  const quirks = entries.map(entry => {
    return catalog.has(getDevelopmentTraitId(entry)) ? normalizeCombatTrait(entry) : entry;
  });
  return { ...character, combatProfile: { ...profile, quirks } };
}
