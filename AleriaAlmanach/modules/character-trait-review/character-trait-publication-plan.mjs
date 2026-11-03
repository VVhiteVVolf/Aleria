import { isDeepStrictEqual } from 'node:util';
import assert from 'node:assert/strict';
import { projectReviewedCharacterTraits, reviewedCharacterTraits } from './character-trait-review-model.js';
import { reconcileClassDamageRevisions } from '../classes/class-damage-revisions.js';

export function correctExistingSignetAbility(character) {
  const ring = character.inventory?.items?.find(item => item.definitionRef?.id === 'house-signet:haus-gafyr');
  if (!ring || !['person--haus-gafyr--gildas-gafyr', 'gildas-gafyr'].includes(character.id)) return character;
  const abilities = character.combatProfile.abilities?.map(ability => {
    if (ability.id !== 'gildas-gafyr-draig-knight-signet') return ability;
    const text = value => typeof value === 'string' ? value.replaceAll('Draig', 'Gafyr') : value;
    return { ...ability, name: ring.name, icon: ring.image,
      description: text(ability.description), requirements: text(ability.requirements), tags: text(ability.tags),
      triggerRules: (ability.triggerRules || []).map(rule => ({ ...rule, name: text(rule.name), description: text(rule.description) })) };
  });
  return { ...character, combatProfile: { ...character.combatProfile, abilities } };
}

// An explicit, narrow editorial change. Existing training, weapons, currency,
// consumed uses and live resources are never normalized or regenerated here.
export function planCharacterTraitPublication({ character, assignment, baseline, now }) {
  const expected = reviewedCharacterTraits(assignment), current = character.combatProfile?.quirks || [];
  if (!isDeepStrictEqual(current, expected)) assert.deepEqual(current, baseline.combatProfile.quirks,
    `${character.name}: Die Auswahl wurde seit der redaktionellen Prüfung geändert.`);
  const next = correctExistingSignetAbility(projectReviewedCharacterTraits(character, assignment));
  next.combatProfile = reconcileClassDamageRevisions(next.combatProfile);
  const fields = ['quirks', 'abilities', 'conditions', 'techniques'].filter(key => !isDeepStrictEqual(next.combatProfile[key], character.combatProfile[key]));
  const spellsChanged = !isDeepStrictEqual(next.combatProfile.magic?.spells, character.combatProfile.magic?.spells);
  const biographyChanged = !isDeepStrictEqual(next.biography, character.biography);
  // An earlier editorial writer could publish the leaves without advancing the
  // revision. Confirm that already-correct selection once, so an old open editor
  // cannot restore the pre-review profile under its unchanged revision.
  const revisionUnconfirmed = isDeepStrictEqual(current, expected)
    && !isDeepStrictEqual(baseline.combatProfile.quirks, expected)
    && Number(character.combatProfile.revision || 0) <= Number(baseline.combatProfile.revision || 0);
  if (!fields.length && !biographyChanged && !spellsChanged && !revisionUnconfirmed) return { character: structuredClone(character), changed: false, fieldPaths: [] };
  assert(Number.isFinite(Date.parse(now)));
  next.combatProfile.revision = Math.max(Date.parse(now), Number(character.combatProfile.revision || 0) + 1);
  next.updatedAt = now;
  const fieldPaths = [...fields.map(key => `combatProfile.${key}`), 'combatProfile.revision', 'updatedAt'];
  if (spellsChanged) fieldPaths.push('combatProfile.magic.spells');
  if (biographyChanged) fieldPaths.push('biography.biography.abilities', 'biography.biography.abilitiesTitle');
  const protect = record => {
    const copy = structuredClone(record); delete copy.updatedAt; delete copy.combatProfile.revision;
    fields.forEach(key => { delete copy.combatProfile[key]; });
    if (spellsChanged) delete copy.combatProfile.magic.spells;
    if (biographyChanged) { delete copy.biography.biography.abilities; delete copy.biography.biography.abilitiesTitle; }
    return copy;
  };
  assert.deepEqual(protect(next), protect(character), 'Eine unbeauftragte Bogenänderung wurde erkannt.');
  return { character: next, changed: true, fieldPaths };
}

export function selectReviewedCombatWrite(plan) {
  const patch = {};
  for (const path of plan.fieldPaths) {
    const parts = path.split('.'), key = parts.pop();
    const value = parts.reduce((value, part) => value[part], plan.character)[key];
    const parent = parts.reduce((value, part) => value[part] ||= {}, patch);
    parent[key] = structuredClone(value);
  }
  return patch;
}
