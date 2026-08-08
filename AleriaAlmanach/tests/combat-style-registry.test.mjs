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
  ['action', 'special-action'],
  ['action', 'bonus-action', 'special-action']
];

test('das Kampfstilregister dokumentiert den Drachentanz mit allen sieben Formen', () => {
  const registry = getCombatStyleRegistry();
  const style = getCombatStyle('drachentanz');
  assert.equal(registry.styles.length, 1);
  assert.equal(style.forms.length, 7);
  assert.deepEqual(style.forms.map(form => form.number), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(style.forms[0].techniques.length, 6);
  assert.equal(style.forms[1].minimumLevel, 7);
  assert.ok(style.forms.slice(1).every(form => form.techniques.length === 0));
});

test('die Jungdrachenform schaltet je Stufe eine Technik mit eigener Aktionsökonomie frei', () => {
  const teulu = getCharacterCreationTemplate('class', 'teulu');
  assert.deepEqual(teulu.combatStyleGrants.map(grant => grant.formId), [
    'drachentanz-form-i-jungdrache',
    'drachentanz-form-ii-schwertdrache'
  ]);
  for (let level = 1; level <= 6; level += 1) {
    const techniques = getCombatStyleTechniquesForGrants(teulu.combatStyleGrants, level);
    assert.equal(techniques.length, level);
    assert.deepEqual(techniques.at(-1).costs.map(cost => cost.resourceId), EXPECTED_COSTS[level - 1]);
  }
  assert.equal(getCombatStyleTechniquesForGrants(teulu.combatStyleGrants, 7).length, 6, 'Form II ist vorbereitet, enthält aber noch keine Techniken');
});

test('Teulu erhalten die Registertechniken bei Erstellung und Stufenaufstieg automatisch', () => {
  const draft = createCharacterCreationDraft({});
  draft.selections = { ancestryId: 'cenyr', backgroundId: 'ritter', classId: 'teulu' };
  draft.attributeMethod = 'free';
  draft.baseAttributes = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
  const created = applyCharacterCreationDraft({}, draft, { now: '2026-08-08T00:00:00.000Z' });
  assert.equal(created.ok, true);
  assert.deepEqual(created.profile.techniques.map(technique => technique.minimumLevel), [1]);

  const leveled = previewCharacterLevelUp(created.profile, createCharacterLevelUpPlan(created.profile));
  assert.equal(leveled.ready, true);
  assert.deepEqual(leveled.profile.techniques.map(technique => technique.minimumLevel), [1, 2]);
  assert.ok(leveled.changes.some(change => change.label === 'Neue Kampfstiltechnik' && change.after === 'Biss des Jungdrachens'));
});

test('Duncans Export nutzt dieselben sechs Registertechniken und Kostenpakete', async () => {
  const payload = JSON.parse(await fs.readFile(new URL('../../Charakter Archiv Exporte/duncan-gafyr.json', import.meta.url), 'utf8'));
  const techniques = payload.character.combatProfile.techniques;
  assert.equal(techniques.length, 6);
  assert.deepEqual(techniques.map(technique => technique.costs.map(cost => cost.resourceId)), EXPECTED_COSTS);
  assert.ok(techniques.every(technique => technique.id.startsWith('combat-style-drachentanz-jungdrache-')));
});
