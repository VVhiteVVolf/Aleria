import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyCharacterCreationDraft,
  createCharacterCreationDraft,
  getCreationFinalAttributes,
  getPointBuyRemaining,
  rollFourDropLowest,
  setCreationAttributeMethod,
  validateCharacterCreationDraft
} from '../modules/combat/character-creation-model.js';
import {
  CHARACTER_ANCESTRY_TEMPLATES,
  CHARACTER_BACKGROUND_TEMPLATES,
  CHARACTER_CLASS_TEMPLATES,
  getCharacterCreationTemplate
} from '../modules/combat/character-creation-templates.js';
import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const actionResourceIds = ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'];

test('ein leerer Charakterbogen besitzt die vollständige Schema-8-Grundlage', () => {
  const profile = sanitizeCharacterCombatProfile({});
  assert.equal(profile.schemaVersion, 8);
  assert.equal(profile.progression.level, 1);
  assert.equal(profile.skills.length, 20);
  assert.deepEqual(
    profile.skills.slice(-2).map(skill => [skill.name, skill.attributeKey]),
    [['Flirten', 'charisma'], ['Körperbeherrschung', 'constitution']]
  );
  assert.deepEqual(
    profile.resources.filter(resource => actionResourceIds.includes(resource.id)).map(resource => [resource.id, resource.current, resource.maximum]),
    [
      ['action', 1, 1],
      ['bonus-action', 1, 1],
      ['reaction', 1, 1],
      ['special-action', 2, 2],
      ['aura-focus', 0, 0]
    ]
  );
  assert.deepEqual(
    profile.resources.find(resource => resource.id === 'inspiration') && [
      profile.resources.find(resource => resource.id === 'inspiration').current,
      profile.resources.find(resource => resource.id === 'inspiration').maximum
    ],
    [0, 1]
  );
  assert.equal(profile.resources.filter(resource => resource.category === 'spell-slot').length, 10);
});

test('der Vorlagenkatalog enthält alle gewünschten Völker, den Ritter und elf Klassen', () => {
  assert.deepEqual(CHARACTER_ANCESTRY_TEMPLATES.map(template => template.id), ['cenyr', 'alben', 'aldrimarer', 'nordmann']);
  assert.deepEqual(CHARACTER_BACKGROUND_TEMPLATES.map(template => template.id), ['ritter']);
  assert.deepEqual(CHARACTER_CLASS_TEMPLATES.map(template => template.id), [
    'teulu', 'cantref', 'helwyr', 'uchelwyr', 'arthwyr', 'barddwyr',
    'morwyr', 'rhyfelwyr', 'ceidwynr', 'rhiddwyrr', 'derwyn'
  ]);
  assert.deepEqual(getCharacterCreationTemplate('ancestry', 'cenyr').attributeBonuses, { strength: 2, charisma: 1 });
  assert.deepEqual(getCharacterCreationTemplate('class', 'teulu').proficiencies.armor, ['medium', 'heavy']);
});

test('Punktekauf beginnt bei acht und blockiert Ausgaben über 27 Punkte', () => {
  let draft = createCharacterCreationDraft({});
  draft = setCreationAttributeMethod(draft, 'point-buy');
  assert.equal(getPointBuyRemaining(draft.baseAttributes), 27);
  draft.baseAttributes = { strength: 15, dexterity: 15, constitution: 15, intelligence: 15, wisdom: 15, charisma: 15 };
  assert.ok(getPointBuyRemaining(draft.baseAttributes) < 0);
  assert.match(validateCharacterCreationDraft(draft)[0], /27 Punkten/);
});

test('4W6 streicht exakt den niedrigsten Würfel', () => {
  const values = [0, 0.2, 0.5, 0.99];
  let index = 0;
  const roll = rollFourDropLowest(() => values[index++]);
  assert.deepEqual(roll.dice, [1, 2, 4, 6]);
  assert.equal(roll.droppedIndex, 0);
  assert.equal(roll.total, 12);
});

test('Gawains freie Basis erhält Cenyri-Boni erst nach der Verteilung', () => {
  const profile = sanitizeCharacterCombatProfile({});
  let draft = createCharacterCreationDraft(profile, { characterName: 'Gawain Draig' });
  draft = setCreationAttributeMethod(draft, 'free');
  draft.selections = { ancestryId: 'cenyr', backgroundId: 'ritter', classId: 'teulu' };
  draft.baseAttributes = {
    strength: 12,
    dexterity: 15,
    constitution: 10,
    intelligence: 9,
    wisdom: 8,
    charisma: 14
  };
  assert.deepEqual(getCreationFinalAttributes(draft), {
    strength: 14,
    dexterity: 15,
    constitution: 10,
    intelligence: 9,
    wisdom: 8,
    charisma: 15
  });

  const result = applyCharacterCreationDraft(profile, draft, { now: '2026-08-03T12:00:00.000Z' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.profile.identity, { ancestry: 'Cenyr', archetype: 'Teulu', background: 'Ritter' });
  assert.deepEqual(result.profile.templateSelections, {
    schemaVersion: 1,
    ancestryId: 'cenyr',
    backgroundId: 'ritter',
    classId: 'teulu',
    attributeMethod: 'free',
    appliedAt: '2026-08-03T12:00:00.000Z'
  });
  assert.equal(result.profile.progression.level, 1);
  assert.equal(result.profile.hitPoints.hitDie, 10);
  assert.equal(result.profile.hitPoints.current, 10);
  assert.equal(result.profile.weapons.find(weapon => weapon.equipped).name, 'Langschwert');
  assert.ok(result.profile.proficiencies.armor.includes('heavy'));
  assert.ok(result.profile.skills.find(skill => skill.name === 'Auftreten').proficiency === 'trained');
  assert.ok(result.profile.skills.find(skill => skill.name === 'Überreden').proficiency === 'trained');
  assert.equal(result.profile.resources.find(resource => resource.id === 'inspiration').maximum, 1);
  assert.equal(result.profile.resources.filter(resource => resource.category === 'spell-slot').length, 10);
});

test('AleriaGPT erhält Vorlagen, Ausbildungen und alle Zaubergrade ohne Boni doppelt anzuwenden', () => {
  const draft = createCharacterCreationDraft({});
  draft.selections = { ancestryId: 'cenyr', backgroundId: 'ritter', classId: 'teulu' };
  const result = applyCharacterCreationDraft({}, draft, { now: '2026-08-03T12:00:00.000Z' });
  const snapshot = buildCombatProfileAiSnapshot({ id: 'gawain', name: 'Gawain Draig', combatProfile: result.profile });
  assert.equal(snapshot.character.templateSelections.classId, 'teulu');
  assert.ok(snapshot.proficiencies.weapons.includes('sword'));
  assert.equal(snapshot.magic.spellSlots.length, 10);
  assert.match(snapshot.instruction, /nicht doppelt addiert/);
});
