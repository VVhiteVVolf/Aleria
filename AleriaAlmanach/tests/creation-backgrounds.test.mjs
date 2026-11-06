import test from 'node:test';
import assert from 'node:assert/strict';
import { ORDINARY_BACKGROUND_TEMPLATES } from '../modules/character-development/creation-background-templates.js';
import { CHARACTER_BACKGROUND_TEMPLATES, getCharacterCreationTemplate } from '../modules/combat/character-creation-templates.js';
import { createCharacterCreationDraft, applyCharacterCreationDraft } from '../modules/combat/character-creation-model.js';
import { getCreationSkillSuggestions, acceptCreationSkillSuggestions } from '../modules/character-development/creation-training-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { SKILL_DEFINITIONS, getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';

test('24 herkömmliche Hintergründe ergänzen den bestehenden Katalog ohne doppelte Identitäten', () => {
  assert.equal(ORDINARY_BACKGROUND_TEMPLATES.length, 24);
  assert.equal(CHARACTER_BACKGROUND_TEMPLATES.length, 34);
  assert.equal(new Set(CHARACTER_BACKGROUND_TEMPLATES.map(entry => entry.id)).size, CHARACTER_BACKGROUND_TEMPLATES.length);
  assert.equal(new Set(CHARACTER_BACKGROUND_TEMPLATES.map(entry => entry.label)).size, CHARACTER_BACKGROUND_TEMPLATES.length);
  for (const id of ['buerger', 'jaeger', 'staatsmann']) assert.ok(getCharacterCreationTemplate('background', id));
  const skillIds = new Set(SKILL_DEFINITIONS.map(skill => skill.id));
  for (const background of ORDINARY_BACKGROUND_TEMPLATES) {
    assert.equal(getCharacterCreationTemplate('background', background.id), background);
    assert.equal(background.skillProficiencies.length, 2, background.id);
    assert.equal(new Set(background.skillProficiencies).size, 2, background.id);
    assert.ok(background.skillProficiencies.every(name => skillIds.has(getSkillIdentity(name))), background.id);
    assert.equal(background.proficiencies.tools.length, 1, background.id);
    assert.equal(background.traits.length, 1, background.id);
    assert.ok(!Object.hasOwn(background, 'mechanics'), background.id);
    assert.ok(!Object.hasOwn(background, 'attributeBonuses'), background.id);
  }
});

test('neue Hintergründe schlagen zwei Fertigkeiten vor und übernehmen sie erst auf ausdrücklichen Wunsch', () => {
  for (const background of ORDINARY_BACKGROUND_TEMPLATES) {
    const draft = createCharacterCreationDraft({});
    draft.selections.backgroundId = background.id;
    const initialChoices = structuredClone(draft.skillChoices);
    assert.deepEqual(getCreationSkillSuggestions(draft).map(skill => skill.key), background.skillProficiencies.map(getSkillIdentity), background.id);
    assert.deepEqual(draft.skillChoices, initialChoices, background.id);
    acceptCreationSkillSuggestions(draft);
    for (const name of background.skillProficiencies) assert.equal(draft.skillChoices[getSkillIdentity(name)], 'trained', background.id);
    acceptCreationSkillSuggestions(draft);
    assert.equal(Object.values(draft.skillChoices).filter(value => value === 'trained').length, 2, background.id);
    assert.deepEqual(draft.trainingChoices.proficiencies.tools, [], 'Werkzeuge bleiben manuelle Ausbildungswahl');
  }
});

test('Hintergrundwechsel erhalten persönliche Spielwerte, Besitz und manuelle Ausbildung', () => {
  const original = sanitizeCharacterCombatProfile({
    progression: { level: 6, development: { mode: 'purchase' } },
    hitPoints: { current: 7, maximumOverride: 30 },
    resources: [{ id: 'personal-resource', name: 'Persönlicher Vorrat', current: 1, maximum: 3 }],
    skills: [{ name: 'Wahrnehmung', proficiency: 'expertise' }],
    proficiencies: { tools: ['Mein Werkzeug'] },
    quirks: [{ id: 'personal-trait', name: 'Persönliches Merkmal', active: true }],
    weapons: [{ id: 'personal-weapon', name: 'Meine Waffe', weaponType: 'sword', damageFormula: '1d8', equipped: true }],
    armorItems: [{ id: 'personal-armor', name: 'Meine Rüstung', kind: 'armor', baseArmorClass: 14, equipped: true }]
  });
  const before = structuredClone(original);
  for (const background of ORDINARY_BACKGROUND_TEMPLATES) {
    const draft = createCharacterCreationDraft(original);
    draft.selections.backgroundId = background.id;
    draft.skippedSteps = ['attributes', 'skills', 'equipment', 'development', 'resources'];
    const result = applyCharacterCreationDraft(original, draft, { now: '2026-11-06T12:00:00.000Z' });
    assert.equal(result.ok, true, `${background.id}: ${result.errors.join(' ')}`);
    assert.equal(result.profile.identity.background, background.label);
    assert.equal(result.profile.templateSelections.backgroundId, background.id);
    const trait = result.profile.quirks.find(entry => entry.id === `starter-background-${background.id}-trait-1`);
    assert.ok(trait, background.id);
    assert.ok(result.profile.quirks.some(entry => entry.id === 'personal-trait'), background.id);
    for (const key of ['attributes', 'skills', 'weapons', 'armorItems', 'resources', 'hitPoints', 'proficiencies']) {
      assert.deepEqual(result.profile[key], original[key], `${background.id}: ${key}`);
    }
    assert.equal(createCharacterCreationDraft(result.profile).selections.backgroundId, background.id);
  }
  assert.deepEqual(original, before);
});
