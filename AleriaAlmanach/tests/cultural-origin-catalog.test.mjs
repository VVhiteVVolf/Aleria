import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { CHARACTER_CULTURAL_ORIGINS, getCulturalOriginTemplate } from '../modules/character-origins/cultural-origin-catalog.js';
import { CHARACTER_ANCESTRY_TEMPLATES, getCharacterCreationTemplate } from '../modules/combat/character-creation-templates.js';
import { createCharacterCreationDraft, getCreationFinalAttributes, applyCharacterCreationDraft } from '../modules/combat/character-creation-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { SKILL_DEFINITIONS, getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';

const root = new URL('../../', import.meta.url);
const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

test('all existing countries and albic origins use one equal cultural budget, not new biological species', async () => {
  assert.equal(CHARACTER_ANCESTRY_TEMPLATES, CHARACTER_CULTURAL_ORIGINS);
  assert.equal(CHARACTER_CULTURAL_ORIGINS.length, 28);
  assert.equal(new Set(CHARACTER_CULTURAL_ORIGINS.map(origin => origin.id)).size, 28);
  const skillIds = new Set(SKILL_DEFINITIONS.map(skill => skill.id));
  for (const origin of CHARACTER_CULTURAL_ORIGINS) {
    assert.equal(origin.originKind, 'culture');
    assert.deepEqual(Object.values(origin.attributeBonuses).sort(), [1, 2], origin.id);
    assert.ok(Object.keys(origin.attributeBonuses).every(key => attributes.includes(key)), origin.id);
    assert.equal(new Set(origin.skillProficiencies.map(getSkillIdentity)).size, 3, origin.id);
    assert.ok(origin.skillProficiencies.every(skill => skillIds.has(getSkillIdentity(skill))), origin.id);
    assert.equal(getCharacterCreationTemplate('ancestry', origin.id), origin);
    assert.ok(origin.rulesNote.includes('genau eine Herkunft'));
    for (const path of [origin.icon, origin.pagePath, ...origin.sourcePaths]) await access(new URL(path.replace(/^\//, '').split('#')[0], root));
  }
  for (const country of ['aeldrunmar', 'talyndor', 'brevanor', 'deitheach']) assert.equal(getCulturalOriginTemplate(country).continent, 'Aldervan');
  assert.equal(getCulturalOriginTemplate('venalys').continent, 'Tirnara');
  assert.equal(getCulturalOriginTemplate('triarchie'), null);
  assert.equal(getCulturalOriginTemplate('dunkelhain'), null);
});

test('legacy IDs and the four existing attribute and skill packages retain their values', () => {
  const expected = [
    ['cenyr', { strength: 2, charisma: 1 }, ['Überzeugen', 'Auftreten', 'Religion']],
    ['alben', { dexterity: 2, wisdom: 1 }, ['Mit Tieren umgehen', 'Naturkunde', 'Überleben']],
    ['aldrimarer', { strength: 2, constitution: 1 }, ['Athletik', 'Mit Tieren umgehen', 'Überleben']],
    ['nordmann', { constitution: 2, strength: 1 }, ['Überleben', 'Einschüchtern', 'Körperbeherrschung']]
  ];
  for (const [id, bonuses, skills] of expected) {
    assert.deepEqual(getCulturalOriginTemplate(id).attributeBonuses, bonuses);
    assert.deepEqual(getCulturalOriginTemplate(id).skillProficiencies, skills);
  }
  assert.equal(getCulturalOriginTemplate('Nordmänner').id, 'nordmann');
  assert.equal(getCulturalOriginTemplate('Norrnaigh').id, 'nordmann');
  assert.equal(getCulturalOriginTemplate('Cenyri').id, 'cenyr');
  assert.equal(getCulturalOriginTemplate('Goldmunder').id, 'alwener');
  assert.equal(getCulturalOriginTemplate('Briath'), null, 'Historical ancestors do not silently become a current nationality');
});

test('all origin selections supply exactly one bonus package and suggestions without automatic equipment or learned techniques', () => {
  const original = sanitizeCharacterCombatProfile({});
  const snapshot = structuredClone(original);
  for (const origin of CHARACTER_CULTURAL_ORIGINS) {
    const draft = createCharacterCreationDraft(original);
    draft.selections = { ancestryId: origin.id, backgroundId: 'ritter', classId: 'teulu' };
    draft.attributeMethod = 'free';
    draft.baseAttributes = Object.fromEntries(attributes.map(attribute => [attribute, 10]));
    const final = getCreationFinalAttributes(draft);
    assert.equal(Object.values(final).reduce((sum, value) => sum + value, 0), 63, origin.id);
    const result = applyCharacterCreationDraft(original, draft, { now: '2026-11-03T00:00:00.000Z' });
    assert.equal(result.ok, true, `${origin.id}: ${result.errors.join(', ')}`);
    assert.equal(result.profile.identity.ancestry, origin.label);
    assert.equal(result.profile.templateSelections.ancestryId, origin.id);
    assert.deepEqual(result.profile.weapons, original.weapons);
    assert.equal(result.profile.techniques.length, 0);
    assert.ok(result.profile.skills.every(skill => skill.proficiency === 'none'));
    assert.ok(result.profile.quirks.filter(quirk => quirk.id.startsWith(`starter-ancestry-${origin.id}-`)).every(quirk => quirk.icon === origin.icon));
    const reopened = createCharacterCreationDraft(result.profile);
    assert.deepEqual(getCreationFinalAttributes(reopened), final, origin.id);
  }
  assert.deepEqual(original, snapshot);
});

test('the archive receives every cultural package with its actual image and source metadata', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ byClass: {} }) });
  try {
    const { loadBuiltinCharacterArchiveEntries } = await import('../modules/character-archive/character-archive-catalog.js?cultural-origin-test');
    const entries = await loadBuiltinCharacterArchiveEntries();
    for (const origin of CHARACTER_CULTURAL_ORIGINS) {
      const archived = entries.find(entry => entry.kind === 'ancestry' && entry.data.id === origin.id);
      assert.ok(archived, origin.id);
      assert.equal(archived.icon, origin.icon);
      assert.equal(archived.data.originKind, 'culture');
      assert.deepEqual(archived.data.attributeBonuses, origin.attributeBonuses);
    }
    const receipt = JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/character-origins/manifest.json', root), 'utf8'));
    assert.equal(receipt.images.length, 2);
  } finally { globalThis.fetch = originalFetch; }
});
