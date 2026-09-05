import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getCenyrClassDefinitionForProfile
} from '../modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import {
  buildCharacterDatabase,
  markCharacterDatabaseOverlay
} from '../../CharakterDatenbank/lib/character-database-model.mjs';

const exportRoot = new URL('../../Charakter%20Archiv%20Exporte/', import.meta.url);
const snapshotUrl = new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url);
const expectations = Object.freeze([
  { file: 'gawain-draig.json', name: 'Gawain Draig', classId: 'teulu', level: 5, techniques: 5, paths: 0 },
  { file: 'duncan-gafyr.json', name: 'Duncan Gafyr', classId: 'teulu', level: 20, techniques: 16, paths: 5 },
  { file: 'gildas-gafyr.json', name: 'Gildas Gafyr', classId: 'teulu', level: 6, techniques: 6, paths: 0 },
  { file: 'guinevere-neidr.json', name: 'Guinevere Neidr', classId: 'helwyr', level: 5, techniques: 3, paths: 0 },
  { file: 'gethin.json', name: 'Gethin', classId: 'teulu', level: 5, techniques: 5, paths: 0 },
  { file: 'kane-draig.json', name: 'Kane Draig', classId: 'teulu', level: 5, techniques: 5, paths: 0 }
]);

async function loadCharacter(file) {
  const exported = JSON.parse(await readFile(new URL(file, exportRoot), 'utf8'));
  return exported.character;
}

function assertCanonicalTraining(character, expected) {
  const profile = character.combatProfile;
  const definition = getCenyrClassDefinitionForProfile(profile);
  assert(definition, `${expected.name}: Cenyr-Klasse wurde nicht erkannt`);
  assert.equal(definition.classId, expected.classId);
  assert.equal(profile.progression.level, expected.level);
  assert.equal(profile.classTraining.schemaVersion, 2);
  assert.equal(profile.classTraining.curriculumId, definition.id);
  assert.equal(profile.techniques.length, expected.techniques);
  assert.equal(profile.classTraining.techniqueSelections.length, expected.techniques);
  assert.equal(profile.classTraining.selections.filter(selection => selection.kind === 'path').length, expected.paths);

  const progression = getCenyrClassProgression(definition.id, expected.level, {
    classTraining: profile.classTraining
  });
  const catalog = new Map(progression.attackCatalog.map(technique => [technique.id, technique]));
  const selections = new Map(profile.classTraining.techniqueSelections.map(selection => [selection.techniqueId, selection]));
  const earnedSlots = new Set(progression.earnedTechniqueSlots.map(slot => slot.id));
  assert.equal(selections.size, expected.techniques);

  for (const technique of profile.techniques) {
    const canonical = catalog.get(technique.id);
    const selection = selections.get(technique.id);
    assert(canonical, `${expected.name}: ${technique.id} fehlt im Klassenkatalog`);
    assert(selection, `${expected.name}: ${technique.id} besitzt keinen Slot`);
    assert(earnedSlots.has(selection.slotId), `${expected.name}: ${selection.slotId} ist auf der Stufe nicht verdient`);
    assert.equal(technique.status, 'confirmed');
    assert.equal(technique.cenyrTraining.assignedSlotId, selection.slotId);
    assert.equal(technique.cenyrTraining.selectedAtLevel, selection.selectedAtLevel);
    assert.equal(technique.cenyrTraining.sourceStatus, canonical.status);
    assert(technique.minimumLevel <= selection.selectedAtLevel);
  }

  if (expected.classId === 'teulu') {
    assert(profile.weapons.some(weapon => weapon.weaponType === 'sword'), `${expected.name}: kein Schwert für die Teulu-Folge`);
  }
}

test('alle vorhandenen Teulu- und Helwyr-Bögen verwenden ausschließlich ihren Cenyr-Klassenkatalog', async () => {
  for (const expected of expectations) {
    assertCanonicalTraining(await loadCharacter(expected.file), expected);
  }
});

test('der generierte Datenbank-Snapshot enthält dieselben aktiven Cenyr-Ausbildungen wie die Einzelbögen', async () => {
  const snapshot = JSON.parse(await readFile(snapshotUrl, 'utf8'));
  for (const expected of expectations) {
    const source = await loadCharacter(expected.file);
    const stored = snapshot.characters.find(character => character.name === expected.name);
    assert(stored, `${expected.name}: fehlt im Datenbank-Snapshot`);
    assert.deepEqual(stored.combatProfile.classTraining, source.combatProfile.classTraining);
    assert.deepEqual(stored.combatProfile.techniques, source.combatProfile.techniques);
    assertCanonicalTraining(stored, expected);
  }
});

test('Einzelbogen-Overlays ersetzen den Kampfbereich atomar und behalten andere Archivdetails', () => {
  const archived = {
    id: 'archive-character',
    name: 'Test Cenyr',
    bio: 'Ausführliche Archivbiografie',
    combatProfile: {
      progression: { level: 3 },
      techniques: [{ id: 'alter-persoenlicher-angriff' }]
    }
  };
  const overlay = markCharacterDatabaseOverlay({
    id: 'overlay-character',
    name: 'Test Cenyr',
    combatProfile: {
      progression: { level: 3 },
      techniques: [{ id: 'kanonische-klassenattacke' }]
    }
  });
  const { records } = buildCharacterDatabase({
    exportedAt: '2026-09-05T00:00:00.000Z',
    characters: [archived, overlay],
    charTabs: { map: {}, subtabMap: {} }
  }, [], { sourcePath: 'test.json' });
  assert.equal(records.length, 1);
  assert.equal(records[0].record.character.bio, archived.bio);
  assert.deepEqual(records[0].record.character.combatProfile.techniques, overlay.combatProfile.techniques);
});
