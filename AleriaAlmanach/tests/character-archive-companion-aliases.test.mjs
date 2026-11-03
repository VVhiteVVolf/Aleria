import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_CLASS_TEMPLATES } from '../modules/combat/character-creation-templates.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { normalizeCharacterArchiveEntry as normalize, mergeCharacterArchiveEntries as merge } from '../modules/character-archive/character-archive-model.js';
import { projectCharacterArchiveCompanionAliases as project, SHARED_ANIMAL_COMPANION_ID,
  SHARED_ANIMAL_COMPANION_DESCRIPTION } from '../modules/character-archive/character-archive-companion-aliases.js';

const source = id => CHARACTER_CLASS_TEMPLATES.find(template => template.id === id).abilities[0];
const entry = (classId, changes = {}, extra = {}) => normalize({ kind: 'ability', name: source(classId).name,
  description: source(classId).description, builtin: true, data: { ...structuredClone(source(classId)), ...changes },
  sources: [{ kind: 'class', id: classId, name: classId === 'serf' ? 'Serf' : 'Skytte' }], ...extra });

test('the two exact authored animal companion packages share neutral presentation and retain both class sources', () => {
  const originals = [entry('serf'), entry('skytte')], before = structuredClone(originals);
  const projected = project(originals);
  for (const value of projected) {
    assert.equal(value.data.catalogAbilityId, SHARED_ANIMAL_COMPANION_ID);
    assert.equal(value.description, SHARED_ANIMAL_COMPANION_DESCRIPTION);
    assert.equal(value.data.description, SHARED_ANIMAL_COMPANION_DESCRIPTION);
  }
  const result = merge(projected);
  assert.equal(result.length, 1);
  assert.deepEqual(new Set(result[0].sources.map(value => value.id)), new Set(['serf', 'skytte']));
  assert.deepEqual(originals, before);
});

test('sanitized legacy copies retain live instance state and manual illustrations through the shared presentation', () => {
  const original = source('serf');
  const sanitized = sanitizeCharacterCombatProfile({ abilities: [original] }).abilities[0];
  const value = entry('serf', { ...sanitized, id: 'legacy-copy', catalogAbilityId: original.id,
    active: false, usesCurrent: 0, usesUsed: 1 }, { iconOverride: '/custom-companion.png' });
  const before = structuredClone(value), projected = project([value])[0];
  assert.equal(projected.data.catalogAbilityId, SHARED_ANIMAL_COMPANION_ID);
  assert.equal(projected.data.id, 'legacy-copy');
  assert.equal(projected.data.active, false);
  assert.equal(projected.data.usesUsed, 1);
  assert.equal(projected.iconOverride, value.iconOverride);
  assert.deepEqual(value, before);
});

test('changed rules, unknown additional rules, personal owners and unlinked names never acquire the shared alias', () => {
  const examples = [
    entry('serf', { usesMaximum: 1 }),
    entry('serf', { combatUsable: true }),
    entry('skytte', { mechanics: { attack: 1 } }),
    entry('skytte', { specialCompanionRule: 'individuell' }),
    entry('serf', {}, { description: 'Ein persönlich verzaubertes Tier.' }),
    entry('serf', { personal: true, ownerCharacterId: 'public-owner' }),
    entry('serf', { id: 'another-companion' }),
    entry('serf', {}, { kind: 'trait' })
  ];
  for (const value of examples) assert.equal(project([value])[0], value);
});
