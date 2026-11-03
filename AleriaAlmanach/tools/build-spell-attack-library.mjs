// Stellt alle Zauber, Techniken und besonderen Fähigkeiten der bestätigten öffentlichen Figuren
// als durchsuchbaren Fundus zusammen (nach Klasse, Zauberschule, Waffentyp).
// Neue bestätigte öffentliche Charakterquellen ergänzen und erneut ausführen:
//   node ./AleriaAlmanach/tools/build-spell-attack-library.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadPublicCharacterLibrarySources } from './character-library/public-character-library-source.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const almanachRoot = path.resolve(scriptDir, '..');
const outputFile = path.join(almanachRoot, 'data', 'spell-attack-library.json');
const checkOnly = process.argv.includes('--check');

const sources = await loadPublicCharacterLibrarySources();

const byClass = {};
const bySpellSchool = {};
const byWeaponType = {};
const allSpells = [];
const allTechniques = [];

function libraryEntry(item, sourceCharacter, sourceClassId, sourceCharacterId) {
  const copy = { ...item, sourceCharacter, sourceCharacterId, sourceClassId };
  if (/^(?:file:|[A-Za-z]:[\\/])/.test(String(copy.icon || ''))) {
    throw new Error(`Lokaler Dateipfad ist kein veröffentlichbares Icon: ${sourceCharacter} · ${item.name}`);
  }
  return copy;
}

for (const { character, classId, className } of sources) {
  const profile = character.combatProfile;
  const sourceCharacterName = character.name;

  byClass[classId] ||= { className, spells: [], techniques: [] };

  (profile.magic?.spells || []).forEach(spell => {
    const entry = libraryEntry(spell, sourceCharacterName, classId, character.id);
    allSpells.push(entry);
    byClass[classId].spells.push(entry);
    const school = spell.school || 'unbekannt';
    (bySpellSchool[school] ||= []).push(entry);
  });

  (profile.techniques || []).forEach(technique => {
    const entry = libraryEntry(technique, sourceCharacterName, classId, character.id);
    allTechniques.push(entry);
    byClass[classId].techniques.push(entry);
    (technique.weaponTypes || []).forEach(weaponType => {
      (byWeaponType[weaponType] ||= []).push(entry);
    });
  });

  (profile.abilities || []).forEach(ability => {
    const entry = libraryEntry(ability, sourceCharacterName, classId, character.id);
    allTechniques.push(entry);
    byClass[classId].techniques.push(entry);
  });
}

const previousOutput = checkOnly ? await readFile(outputFile, 'utf8') : '';
const previousLibrary = previousOutput ? JSON.parse(previousOutput) : {};
const sourceRecords = sources.map(source => ({ id: source.character.id, name: source.character.name, path: source.sourceRecord }));
const sourceRevision = createHash('sha256').update(JSON.stringify({ sourceRecords, allSpells, allTechniques })).digest('hex').slice(0, 24);
const library = {
  schemaVersion: 1,
  type: 'aleria-spell-attack-library',
  generatedAt: checkOnly ? previousLibrary.generatedAt : new Date().toISOString(),
  sourceRevision,
  notes: 'Fundus bestätigter öffentlicher Figuren aus ihren aktuellen lokalen Charakterdatensätzen. Jede Kopie trägt sourceCharacter/sourceCharacterId/sourceClassId zur Herkunft. Historische Exporte sind keine aktuelle Regelquelle. Die Bibliothek vergibt keine Fähigkeiten und verändert keine lebenden Figuren. Aktualisieren: node ./AleriaAlmanach/tools/build-spell-attack-library.mjs.',
  sourceRecords,
  byClass,
  bySpellSchool,
  byWeaponType,
  allSpells,
  allTechniques
};

const nextOutput = `${JSON.stringify(library, null, 2)}\n`;
if (checkOnly) {
  if (previousOutput !== nextOutput) throw new Error('Die Zauber- und Attackenbibliothek ist nicht mit den Charakterbögen abgeglichen.');
} else {
  await writeFile(outputFile, nextOutput, 'utf8');
}
console.log(`Bibliothek ${checkOnly ? 'geprüft' : 'aktualisiert'}: ${allSpells.length} Zauber, ${allTechniques.length} Techniken/Fähigkeiten (${outputFile})`);
