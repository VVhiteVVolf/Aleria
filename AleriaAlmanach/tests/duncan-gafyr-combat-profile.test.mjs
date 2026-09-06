import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/duncan-gafyr.json', import.meta.url);

async function loadDuncan() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

test('Duncan bleibt ein vollständig ausgebauter Stufe-20-Teulu', async () => {
  const duncan = await loadDuncan();
  const profile = resolveCombatProfile(duncan);
  const resources = new Map(profile.resources.map(resource => [resource.id, resource.maximum]));
  assert.equal(profile.progression.level, 20);
  assert.equal(profile.progression.specialLevels, 0);
  assert.equal(profile.maximumHitPoints, 255);
  assert.deepEqual(['action', 'bonus-action', 'reaction', 'special-action'].map(id => resources.get(id)), [2, 2, 2, 6]);
  assert.equal(resources.get('aura-focus'), 4);
  assert.equal(profile.weapon.id, 'duncan-gafyr-master-sword');
});

test('Duncan beherrscht Grundform, Duellantenform und alle fünf Expertenpfade über das Klassenmodell', async () => {
  const { combatProfile } = await loadDuncan();
  const paths = combatProfile.classTraining.selections.filter(selection => selection.kind === 'path');
  assert.equal(paths.length, 5);
  assert.equal(paths[0].spentTechniqueSlotId, '');
  assert.deepEqual(paths.slice(1).map(selection => selection.spentTechniqueSlotId), [
    'expert-02', 'expert-03', 'expert-04', 'expert-05'
  ]);
  assert.equal(combatProfile.abilities.some(ability => ability.id.startsWith('duncan-drachentanz-form-')), false);
});

test('Duncans 24 Slots ergeben wegen vier zusätzlicher Pfade zwanzig Klassentechniken', async () => {
  const { combatProfile } = await loadDuncan();
  assert.equal(combatProfile.classTraining.techniqueSelections.length, 20);
  assert.equal(combatProfile.techniques.length, 20);
  assert.deepEqual(combatProfile.techniques.slice(0, 12).map(technique => technique.name), [
    'Erster Hieb des Jungdrachens',
    'Biss des Jungdrachens',
    'Gekreuzte Klauen',
    'Schweifkreis des Jungdrachens',
    'Stürmende Drachenspur',
    'Sechsfacher Lehrhieb',
    'Schuppenschnitt', 'Geschlossene Schuppe', 'Flügelschritt des Jungdrachens', 'Ruhiger Drachenatem',
    'Kreisende Einladung',
    'Spiegelparade'
  ]);
  assert.equal(combatProfile.techniques.every(technique => technique.combatStyleId === 'drachentanz'), true);
  assert.equal(combatProfile.abilities.some(ability => ability.id.startsWith('duncan-aura-attack-')), false);
});

test('Duncans Expertenrepertoire deckt jeden gewählten Pfad mit regulären Katalogattacken ab', async () => {
  const { combatProfile } = await loadDuncan();
  const expertForms = new Set(combatProfile.techniques.filter(technique => technique.minimumLevel >= 9).map(technique => technique.combatStyleFormId));
  assert.equal(expertForms.size, 5);
  assert.ok(combatProfile.techniques.some(technique => technique.name === 'Vollendeter Waffenmeister'));
  assert.match(combatProfile.notes, /acht Expertentechniken/);
});

test('Duncans latente Waffenmeister-Präsenz bleibt unabhängig vom Angriffskatalog erhalten', async () => {
  const { combatProfile } = await loadDuncan();
  const latent = combatProfile.aura.latentPresence;
  assert.equal(combatProfile.aura.enabled, true);
  assert.equal(latent.allyMechanics.attack, 2);
  assert.equal(latent.allyMechanics.damage, 2);
  assert.equal(latent.allyMechanics.combatStartTemporaryHitPoints, 12);
  assert.equal(latent.enemyMechanics.attack, -2);
  assert.equal(latent.enemyMechanics.damage, -2);
});
