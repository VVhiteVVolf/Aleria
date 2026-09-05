import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {
  getCombatStyle,
  getCombatStyleTechniquesForGrants,
  getCombatStyleRegistry
} from '../modules/combat-styles/combat-style-registry.js';
import { getCharacterCreationTemplate } from '../modules/combat/character-creation-templates.js';
import { applyCharacterCreationDraft, createCharacterCreationDraft } from '../modules/combat/character-creation-model.js';
import { createCharacterLevelUpPlan, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';

const EXPECTED_COSTS = [
  ['bonus-action'],
  ['action', 'reaction'],
  ['reaction'],
  ['action', 'bonus-action', 'reaction'],
  ['action', 'bonus-action', 'reaction'],
  ['action', 'bonus-action', 'special-action']
];

test('das Kampfstilregister trennt Grundform, Duellantenform und Expertenpfade', () => {
  const registry = getCombatStyleRegistry();
  const style = getCombatStyle('drachentanz');
  assert.equal(registry.styles.length, 1);
  assert.equal(style.forms.length, 10);
  assert.deepEqual(style.forms.map(form => form.number), [1, 2, 3, 4, 5, 6, 7, null, null, null]);
  assert.deepEqual(style.forms.map(form => form.techniques.length), [50, 24, 24, 24, 21, 24, 20, 5, 4, 12]);
  assert.equal(style.forms[1].minimumLevel, 7);
  assert.equal(style.forms[1].techniqueLevelBand.maximum, 8);
  assert.ok(style.forms.slice(2, 7).every(form => form.kind === 'path' && form.minimumLevel === 9 && form.techniqueLevelBand.maximum === 20));
  assert.equal(style.forms.at(-3).shortName, 'Tanz des Drachlings');
  assert.equal(style.forms.at(-2).shortName, 'Tanz des trällernden Drachens');
  assert.equal(style.forms.at(-1).shortName, 'Tanz des kreischenden Drachens');
  const techniques = style.forms.flatMap(form => form.techniques);
  assert.equal(techniques.length, 208);
  assert.equal(new Set(techniques.map(technique => technique.id)).size, 208);
  assert.equal(techniques.filter(technique => technique.status === 'confirmed').length, 6);
  assert.equal(techniques.filter(technique => technique.status === 'draft').length, 202);
});

test('die Jungdrachenform schaltet je Stufe eine Technik mit eigener Aktionsökonomie frei', () => {
  const teulu = getCharacterCreationTemplate('class', 'teulu');
  assert.deepEqual(teulu.combatStyleGrants.map(grant => grant.formId), [
    'drachentanz-form-i-jungdrache'
  ]);
  for (let level = 1; level <= 6; level += 1) {
    const techniques = getCombatStyleTechniquesForGrants(teulu.combatStyleGrants, level);
    assert.equal(techniques.length, level);
    assert.deepEqual(techniques.at(-1).costs.map(cost => cost.resourceId), EXPECTED_COSTS[level - 1]);
  }
  assert.equal(getCombatStyleTechniquesForGrants(teulu.combatStyleGrants, 20).length, 6, 'Entwürfe werden vor ihrer Freigabe nicht automatisch vergeben');
});

test('Teulu beginnen mit einer Klassenattacke und wählen beim Stufenaufstieg den nächsten Slot', () => {
  const draft = createCharacterCreationDraft({});
  draft.selections = { ancestryId: 'cenyr', backgroundId: 'ritter', classId: 'teulu' };
  draft.attributeMethod = 'free';
  draft.baseAttributes = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
  const created = applyCharacterCreationDraft({}, draft, { now: '2026-08-08T00:00:00.000Z' });
  assert.equal(created.ok, true);
  assert.deepEqual(created.profile.techniques.map(technique => technique.minimumLevel), [1]);

  const plan = createCharacterLevelUpPlan(created.profile);
  let leveled = previewCharacterLevelUp(created.profile, plan);
  assert.equal(leveled.ready, false);
  assert.equal(leveled.classTechniqueChoiceGroups.length, 1);
  const [group] = leveled.classTechniqueChoiceGroups;
  plan.cenyrTechniqueChoices[group.slotId] = group.options[0].id;
  leveled = previewCharacterLevelUp(created.profile, plan);
  assert.equal(leveled.ready, true);
  assert.deepEqual(leveled.profile.techniques.map(technique => technique.minimumLevel), [1, 2]);
  assert.ok(leveled.changes.some(change => change.label === 'Neue Drachentanz-Attacke' && change.after === 'Biss des Jungdrachens'));
});

test('Duncans Export nutzt sechs Grund-, zwei Duellanten- und acht Expertenattacken aus dem Register', async () => {
  const payload = JSON.parse(await fs.readFile(new URL('../../Charakter Archiv Exporte/duncan-gafyr.json', import.meta.url), 'utf8'));
  const techniques = payload.character.combatProfile.techniques;
  assert.equal(techniques.length, 16);
  assert.deepEqual(techniques.slice(0, 6).map(technique => technique.costs.map(cost => cost.resourceId)), EXPECTED_COSTS);
  assert.ok(techniques.every(technique => technique.combatStyleId === 'drachentanz'));
  assert.equal(new Set(techniques.slice(8).map(technique => technique.combatStyleFormId)).size, 5);
});
