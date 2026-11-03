import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyCharacterCreationDraft,
  createCharacterCreationDraft,
  getCreationFinalAttributes,
  getCreationFoundationOptions,
  previewCharacterCreationDraft,
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
import { getDevelopmentAttackCatalog } from '../modules/character-development/development-purchases.js';
import { acceptCreationSkillSuggestions, acceptCreationClassSuggestions } from '../modules/character-development/creation-training-model.js';

const actionResourceIds = ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'];

test('ein leerer Charakterbogen besitzt die vollständige Schema-11-Grundlage', () => {
  const profile = sanitizeCharacterCombatProfile({});
  assert.equal(profile.schemaVersion, 11);
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

test('der Vorlagenkatalog enthält alle gewünschten Völker, Hintergründe und Klassen', () => {
  assert.deepEqual(CHARACTER_ANCESTRY_TEMPLATES.slice(0, 4).map(template => template.id), ['cenyr', 'alben', 'aldrimarer', 'nordmann']);
  assert.equal(CHARACTER_ANCESTRY_TEMPLATES.length, 28);
  assert.deepEqual(CHARACTER_BACKGROUND_TEMPLATES.map(template => template.id), [
    'ritter', 'huskarl', 'bauer', 'gelehrter', 'kultist', 'soeldner', 'klerus', 'handwerker', 'gassenkind', 'musikerin'
  ]);
  assert.deepEqual(CHARACTER_CLASS_TEMPLATES.map(template => template.id), [
    'cenyr-milwr', 'teulu', 'cantref', 'helwyr', 'uchelwyr', 'arthwyr', 'barddwyr',
    'morwyr', 'rhyfelwyr', 'ceidwynr', 'rhiddwyrr', 'derwyn',
    'kern', 'cateran', 'mormaer', 'serf', 'airig', 'currach', 'ceolaire-piobaire', 'riada', 'silvaner', 'galloghlaigh', 'fathach',
    'hird-maid', 'skjoldr', 'thegnar', 'skeidr', 'skjaldr', 'skytte', 'skalde',
    'magier', 'kleriker', 'hexer', 'asket'
  ]);
  assert.deepEqual(getCharacterCreationTemplate('ancestry', 'cenyr').attributeBonuses, { strength: 2, charisma: 1 });
  assert.deepEqual(getCharacterCreationTemplate('class', 'teulu').proficiencies.armor, ['medium', 'heavy']);
});

test('alle neuen Alben- und Aldrimar-Klassen besitzen gültige Startausrüstung', () => {
  const newClassIds = [
    'kern', 'cateran', 'mormaer', 'serf', 'airig', 'currach', 'ceolaire-piobaire', 'riada', 'silvaner', 'galloghlaigh', 'fathach',
    'hird-maid', 'skjoldr', 'thegnar', 'skeidr', 'skjaldr', 'skytte', 'skalde'
  ];
  for (const id of newClassIds) {
    const template = getCharacterCreationTemplate('class', id);
    assert.ok(template, `Klasse ${id} fehlt`);
    assert.ok(['Alben', 'Aldrimar'].includes(template.group), `Klasse ${id} hat keine Alben/Aldrimar-Gruppe`);
    assert.ok(template.weapons.length >= 1, `Klasse ${id} hat keine Startwaffe`);
    assert.ok(template.armorItems.length >= 1, `Klasse ${id} hat keine Startrüstung`);
    const profile = sanitizeCharacterCombatProfile({
      magic: template.magic || {},
      weapons: template.weapons,
      armorItems: template.armorItems
    });
    assert.ok(profile.weapons.some(weapon => weapon.name === template.weapons[0].name));
  }
  assert.equal(getCharacterCreationTemplate('class', 'skalde').magic.enabled, true);
  assert.equal(getCharacterCreationTemplate('class', 'ceolaire-piobaire').magic.enabled, true);
});

test('die vier universellen Klassen sind korrekt an Mana, Fokus und Paktpunkte angebunden', () => {
  const magier = getCharacterCreationTemplate('class', 'magier');
  const kleriker = getCharacterCreationTemplate('class', 'kleriker');
  const hexer = getCharacterCreationTemplate('class', 'hexer');
  const asket = getCharacterCreationTemplate('class', 'asket');
  assert.ok(magier.weapons.length >= 1 && kleriker.weapons.length >= 1 && hexer.weapons.length >= 1 && asket.weapons.length >= 1);

  const magierProfile = sanitizeCharacterCombatProfile({ progression: { level: 5 }, magic: magier.magic, weapons: magier.weapons, armorItems: magier.armorItems });
  assert.equal(magierProfile.magic.manaResourceId, 'mana-focus');
  assert.ok(magierProfile.resources.find(resource => resource.id === 'mana-focus').maximum > 0);

  const klerikerProfile = sanitizeCharacterCombatProfile({ progression: { level: 10 }, magic: kleriker.magic, weapons: kleriker.weapons, armorItems: kleriker.armorItems });
  assert.equal(klerikerProfile.magic.bypassResourceId, 'celestial-points');
  assert.ok(klerikerProfile.resources.find(resource => resource.id === 'celestial-points').maximum > 0);
  assert.equal(klerikerProfile.resources.find(resource => resource.id === 'infernal-points').maximum, 0);

  const hexerProfile = sanitizeCharacterCombatProfile({ progression: { level: 10 }, magic: hexer.magic, weapons: hexer.weapons, armorItems: hexer.armorItems });
  assert.equal(hexerProfile.magic.manaResourceId, 'pact-points');
  assert.ok(hexerProfile.resources.find(resource => resource.id === 'pact-points').maximum > 0);
  assert.equal(hexerProfile.resources.find(resource => resource.id === 'mana-focus').maximum, 0, 'Hexer nutzt keine reguläre Mana-Ressource');

  const asketProfile = sanitizeCharacterCombatProfile({ progression: { level: 7 }, magic: asket.magic, weapons: asket.weapons, armorItems: asket.armorItems });
  assert.equal(asketProfile.magic.enabled, false);
  assert.equal(asketProfile.magic.focusEnabled, true);
  assert.equal(asketProfile.resources.find(resource => resource.id === 'focus').maximum, 7);
  assert.equal(asketProfile.resources.find(resource => resource.id === 'mana-focus').maximum, 0, 'Fokus bleibt strukturell von Mana getrennt');
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

  acceptCreationSkillSuggestions(draft);
  acceptCreationClassSuggestions(draft);
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
  assert.equal(result.profile.hitPoints.current, 13);
  assert.deepEqual(result.profile.weapons, profile.weapons, 'Keine klassenbasierten Standardwaffen');
  assert.deepEqual(result.profile.armorItems, profile.armorItems, 'Keine klassenbasierten Standardrüstungen');
  assert.equal(result.profile.techniques.length, 0, 'Keine automatischen Startattacken');
  assert.ok(result.profile.proficiencies.armor.includes('heavy'));
  assert.ok(result.profile.skills.find(skill => skill.name === 'Auftreten').proficiency === 'trained');
  assert.ok(result.profile.skills.find(skill => skill.name === 'Überreden').proficiency === 'trained');
  assert.equal(result.profile.resources.find(resource => resource.id === 'inspiration').maximum, 1);
  assert.equal(result.profile.resources.filter(resource => resource.category === 'spell-slot').length, 10);
});

test('AleriaGPT erhält Vorlagen, Ausbildungen und alle Zaubergrade ohne Boni doppelt anzuwenden', () => {
  const draft = createCharacterCreationDraft({});
  draft.selections = { ancestryId: 'cenyr', backgroundId: 'ritter', classId: 'teulu' };
  acceptCreationClassSuggestions(draft);
  const result = applyCharacterCreationDraft({}, draft, { now: '2026-08-03T12:00:00.000Z' });
  const snapshot = buildCombatProfileAiSnapshot({ id: 'gawain', name: 'Gawain Draig', combatProfile: result.profile });
  assert.equal(snapshot.character.templateSelections.classId, 'teulu');
  assert.ok(snapshot.proficiencies.weapons.includes('sword'));
  assert.equal(snapshot.magic.spellSlots.length, 10);
  assert.match(snapshot.instruction, /nicht doppelt addiert/);
});

test('Starthilfe verwendet denselben Stufenkauf mit negativem Saldo und reversiblen Traits', () => {
  const original = sanitizeCharacterCombatProfile({ weapons:[{id:'personal',name:'Mein Schwert',weaponType:'sword',damageFormula:'1d8',equipped:true}] });
  const before = structuredClone(original);
  const draft = createCharacterCreationDraft(original);
  draft.selections.classId = 'teulu';
  const own = getDevelopmentAttackCatalog().find(entry => entry.templateId === 'teulu' && entry.minimumLevel <= 5);
  draft.developmentPlan.targetLevel = 5;
  draft.developmentPlan.purchaseIds = [own.id];
  draft.developmentPlan.traitIds = ['development-trait-heilerhaende'];
  draft.developmentPlan.development.startingPoints = 0;
  draft.developmentPlan.development.pointsPerLevel = 0;
  draft.developmentPlan.resourceIncreases['mana-focus'] = {current:3,maximum:7};
  const preview = previewCharacterCreationDraft(original,draft);
  assert.equal(preview.ready,true,preview.errors.join(' '));
  assert.ok(preview.balance.remaining < 0);
  const result = applyCharacterCreationDraft(original,draft);
  assert.equal(result.profile.progression.level,5);
  assert.deepEqual(result.profile.techniques.map(entry => entry.id),[own.technique.id]);
  assert.ok(result.profile.quirks.some(entry => entry.id === 'development-trait-heilerhaende'));
  assert.deepEqual(result.profile.weapons,original.weapons);
  assert.equal(result.profile.resources.find(r=>r.id==='mana-focus').maximum,7);
  assert.deepEqual(original,before);
  draft.skippedSteps = ['development'];
  const skipped = applyCharacterCreationDraft(original,draft);
  assert.equal(skipped.profile.progression.level,1);
  assert.equal(skipped.profile.techniques.length,0);
  assert.ok(!skipped.profile.quirks.some(q=>q.id==='development-trait-heilerhaende'));
});

test('alle Klassen lassen individuellen Besitz und Ausrüstungszustand unverändert', () => {
  const original = sanitizeCharacterCombatProfile({
    weapons:[{id:'personal',name:'Persönliche Waffe',weaponType:'sword',damageFormula:'1d8',equipped:true}],
    armorItems:[{id:'personal-armor',name:'Meine Rüstung',kind:'armor',baseArmorClass:15,equipped:true}],
    techniques:[{id:'personal-technique',name:'Eigene Technik',minimumLevel:1}]
  });
  for (const template of CHARACTER_CLASS_TEMPLATES) {
    const draft = createCharacterCreationDraft(original);
    draft.selections.classId = template.id;
    draft.foundationFormId=getCreationFoundationOptions(draft)[0]?.formId||'';
    draft.skippedSteps = ['templates']; // Class training can be selected independently of ancestry.
    const result = applyCharacterCreationDraft(original,draft);
    assert.equal(result.ok,true,result.errors.join(' '));
    assert.deepEqual(result.profile.weapons,original.weapons,template.id);
    assert.deepEqual(result.profile.armorItems,original.armorItems,template.id);
    assert.deepEqual(result.profile.techniques,original.techniques,template.id);
  }
});
