import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/gildas-gafyr.json', import.meta.url);

async function loadGildas() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

test('Gildas ist als robuster Stufe-6-Teulu mit biografisch passenden Attributen aufgebaut', async () => {
  const gildas = await loadGildas();
  const profile = resolveCombatProfile(gildas);
  const attributes = Object.fromEntries(profile.attributes.map(attribute => [attribute.key, attribute.score]));

  assert.equal(profile.progression.level, 6);
  assert.equal(profile.maximumHitPoints, 52);
  assert.equal(profile.armorClassTotal, 19);
  assert.equal(profile.weapon.id, 'gildas-gafyr-duty-sword');
  assert.deepEqual(attributes, {
    strength: 16,
    dexterity: 17,
    constitution: 14,
    intelligence: 12,
    wisdom: 14,
    charisma: 15
  });
});

test('Gildas beherrscht auf Stufe 6 alle sechs Techniken des Tanzes des Jungdrachens', async () => {
  const { combatProfile } = await loadGildas();

  assert.deepEqual(combatProfile.techniques.map(technique => technique.minimumLevel), [1, 2, 3, 4, 5, 6]);
  assert.equal(combatProfile.techniques.every(technique => technique.combatStyleId === 'drachentanz'), true);
  assert.equal(combatProfile.techniques.every(technique => (
    technique.cenyrTraining.classWeaponProfiles.teulu.length === 1
      && technique.cenyrTraining.classWeaponProfiles.teulu[0] === 'sword'
  )), true);
  assert.deepEqual(combatProfile.classTraining.techniqueSelections.map(selection => selection.slotId), [
    'foundation-01', 'foundation-02', 'foundation-03', 'foundation-04', 'foundation-05', 'foundation-06'
  ]);
  assert.equal(combatProfile.techniques.at(-1).name, 'Sechsfacher Lehrhieb');
});

test('Passiva, Marotten und Schutzreaktion bilden Gildas Biografie regeltechnisch ab', async () => {
  const { combatProfile } = await loadGildas();
  const quirks = new Map(combatProfile.quirks.map(entry => [entry.id, entry]));
  const abilities = new Map(combatProfile.abilities.map(entry => [entry.id, entry]));
  const preparation = abilities.get('gildas-gewissenhafte-vorbereitung')?.triggerRules[0];
  const protection = abilities.get('gildas-schutzpflicht')?.triggerRules[0];

  assert.equal(quirks.get('gildas-puenktlich-heisst-zu-frueh')?.mechanics.initiative, 1);
  assert.equal(quirks.get('gildas-erarbeitete-standfestigkeit')?.mechanics.savingThrow, 1);
  assert.equal(preparation.frequency, 'scene');
  assert.equal(preparation.effects.attackModifier, 1);
  assert.equal(protection.activation, 'reaction');
  assert.equal(protection.effects.damageReduction, 3);
  assert.match(combatProfile.notes, /Schutzpflicht geht für ihn vor zusätzlichem Schaden/);
});

test('Stammbaum-Biografie und Portrait sind direkt in den Charakterexport integriert', async () => {
  const gildas = await loadGildas();

  assert.equal(gildas.identity.worldPersonId, 'person--haus-gafyr--gildas-gafyr');
  assert.match(gildas.portrait, /haus-gafyr\/gildas-gafyr\.jpg$/);
  assert.equal(gildas.biography.stats[0][1], 'Gildas Gafyr');
  assert.match(gildas.biography.biography.biographyText, /Ein\s*höherer Rang bedeutet nicht weniger Pflichten/);
  assert.equal(gildas.biography.biography.abilities.length, 8);
  assert.equal(gildas.biography.biography.trivia.length, 9);
});
