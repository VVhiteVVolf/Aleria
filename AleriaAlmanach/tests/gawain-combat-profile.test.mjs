import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url);

async function loadGawain() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

test('Gawains Waffen und Rüstung bleiben mit dem Inventar verknüpft', async () => {
  const gawain = await loadGawain();
  const inventoryById = new Map(gawain.inventory.items.map(item => [item.id, item]));
  const sword = gawain.combatProfile.weapons.find(item => item.id === 'gawain-draig-knightly-sword');
  const dagger = gawain.combatProfile.weapons.find(item => item.id === 'gawain-draig-dagger');
  const armor = gawain.combatProfile.armorItems.find(item => item.id === 'gawain-draig-armor');

  assert.equal(inventoryById.get(sword.inventoryItemId).equipmentLink.combatEntryId, sword.id);
  assert.equal(inventoryById.get(dagger.inventoryItemId).equipmentLink.combatEntryId, dagger.id);
  assert.equal(inventoryById.get(armor.inventoryItemId).equipmentLink.combatEntryId, armor.id);
  assert.equal(sword.damageFormula, '1d8');
  assert.equal(sword.versatileDamageFormula, '1d10');
  assert.equal(armor.dexterityUnlockLevel, 6);
});

test('Gawain verwendet auf Stufe 5 ausschließlich die fünf Teulu-Jungdrachen-Attacken', async () => {
  const gawain = await loadGawain();
  const profile = gawain.combatProfile;
  assert.equal(profile.progression.level, 5);
  assert.equal(profile.templateSelections.classId, 'teulu');
  assert.deepEqual(profile.techniques.map(technique => technique.name), [
    'Erster Hieb des Jungdrachens',
    'Biss des Jungdrachens',
    'Gekreuzte Klauen',
    'Schweifkreis des Jungdrachens',
    'Stürmende Drachenspur'
  ]);
  assert.equal(profile.techniques.every(technique => technique.combatStyleId === 'drachentanz'), true);
  assert.equal(profile.techniques.every(technique => technique.combatStyleFormId === 'drachentanz-form-i-jungdrache'), true);
  assert.equal(profile.techniques.some(technique => String(technique.id).startsWith('gawain-')), false);
  assert.deepEqual(profile.classTraining.techniqueSelections.map(selection => selection.slotId), [
    'foundation-01', 'foundation-02', 'foundation-03', 'foundation-04', 'foundation-05'
  ]);
});

test('Gawains Teulu-Attacken werden mit Drachenzahn und ihrer Klassenökonomie aufgelöst', async () => {
  const gawain = await loadGawain();
  const bite = resolveCombatProfile(gawain, {
    actionId: 'technique:combat-style-drachentanz-jungdrache-02-drachenbiss',
    segmentKind: 'combataction'
  });
  assert.equal(bite.selectedAction.name, 'Biss des Jungdrachens');
  assert.equal(bite.weapon.inventoryItemId, 'item-mqu1vat1-0-w8ef');
  assert.equal(bite.weapon.weaponType, 'sword');
  assert.equal(bite.selectedAction.formula, '1d8+1d4');
  assert.deepEqual(bite.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [
    ['action', 1], ['reaction', 1]
  ]);
});

test('Gawains Eigenheiten bleiben der Regelauswertung und AleriaGPT erhalten', async () => {
  const gawain = await loadGawain();
  const condition = gawain.combatProfile.conditions.find(item => item.id === 'gawain-strenge-gerueche');
  const scentAbility = gawain.combatProfile.abilities.find(item => item.id === 'gawain-liebt-duefte');
  const socialAbility = gawain.combatProfile.abilities.find(item => item.id === 'gawain-muttersoehnchen');
  assert.deepEqual(condition.triggerRules[0].requiredTargetTags, ['stinkend']);
  assert.equal(condition.triggerRules[0].effects.attackModifier, -2);
  assert.equal(scentAbility.inventoryUseTrigger.restoreResources[0].resourceId, 'special-action');
  assert.ok(socialAbility.triggerRules[0].skillIds.includes('religion'));
  assert.match(JSON.stringify(buildCombatProfileAiSnapshot(gawain)), /gawain-strenge-gerueche|stinkend/i);
});

test('Gawains Ritterschwert behält die wählbare ein- und zweihändige Führung', async () => {
  const gawain = await loadGawain();
  const oneHanded = resolveCombatProfile(gawain, {
    actionId: 'weapon:gawain-draig-knightly-sword', segmentKind: 'combataction', weaponGrip: 'one-handed'
  });
  const twoHanded = resolveCombatProfile(gawain, {
    actionId: 'weapon:gawain-draig-knightly-sword', segmentKind: 'combataction', weaponGrip: 'two-handed'
  });
  assert.equal(oneHanded.weapon.damageFormula, '1d8');
  assert.equal(twoHanded.weapon.damageFormula, '1d10');
  assert.equal(twoHanded.totalDefense, 16);
});

test('die interaktive Kampfszene füllt ein altes Gawain-Profil automatisch aus der Teulu-Klasse', async () => {
  const databaseRecordUrl = new URL('../../CharakterDatenbank/records/familien/haus-draig/gawain-draig--q1QtSIug74FzzwUAqWrs/character.json', import.meta.url);
  const record = JSON.parse(await readFile(databaseRecordUrl, 'utf8'));
  const legacyGawain = record.sources.firestoreExports[0];
  const resolved = resolveCombatProfile(legacyGawain, { segmentKind: 'combataction' });
  const techniqueNames = resolved.actions
    .filter(action => action.kind === 'technique')
    .map(action => action.name);

  assert.deepEqual(techniqueNames, [
    'Erster Hieb des Jungdrachens',
    'Biss des Jungdrachens',
    'Gekreuzte Klauen',
    'Schweifkreis des Jungdrachens',
    'Stürmende Drachenspur'
  ]);
  assert.equal(techniqueNames.includes('Biss des Drachen'), false);
  assert.equal(resolved.classTraining.techniqueSelections.length, 5);
});
