// Stellt alle Zauber, Techniken und besonderen Fähigkeiten aus den Charakter-Archiv-Exporten
// als durchsuchbaren Fundus zusammen (nach Klasse, Zauberschule, Waffentyp).
// Neue Charaktere in CHARACTERS ergänzen und erneut ausführen:
//   node ./AleriaAlmanach/tools/build-spell-attack-library.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const almanachRoot = path.resolve(scriptDir, '..');
const projectRoot = path.resolve(almanachRoot, '..');
const exportsDir = path.join(projectRoot, 'Charakter Archiv Exporte');
const outputFile = path.join(almanachRoot, 'data', 'spell-attack-library.json');

const CHARACTERS = [
  { file: 'gawain-draig.json', classId: 'teulu', className: 'Teulu (Ritter)' },
  { file: 'gildas-gafyr.json', classId: 'teulu', className: 'Teulu (Ritter)' },
  { file: 'fenrir-varulv.json', classId: 'skjaldr', className: 'Skjaldr (Schildbeißer)' },
  { file: 'freya-skald.json', classId: 'skalde', className: 'Skalde/Skaldin' },
  { file: 'guinevere-neidr.json', classId: 'helwyr', className: 'Helwyr (Bogenschütze)' },
  { file: 'rhiannon-draig.json', classId: 'magier', className: 'Magier/Magierin' }
];

const byClass = {};
const bySpellSchool = {};
const byWeaponType = {};
const allSpells = [];
const allTechniques = [];

for (const { file, classId, className } of CHARACTERS) {
  const raw = JSON.parse(await readFile(path.join(exportsDir, file), 'utf8'));
  const character = raw.character;
  const profile = character.combatProfile;
  const sourceCharacterName = character.name;

  byClass[classId] ||= { className, spells: [], techniques: [] };

  (profile.magic?.spells || []).forEach(spell => {
    const entry = { ...spell, sourceCharacter: sourceCharacterName, sourceClassId: classId };
    allSpells.push(entry);
    byClass[classId].spells.push(entry);
    const school = spell.school || 'unbekannt';
    (bySpellSchool[school] ||= []).push(entry);
  });

  (profile.techniques || []).forEach(technique => {
    const entry = { ...technique, sourceCharacter: sourceCharacterName, sourceClassId: classId };
    allTechniques.push(entry);
    byClass[classId].techniques.push(entry);
    (technique.weaponTypes || []).forEach(weaponType => {
      (byWeaponType[weaponType] ||= []).push(entry);
    });
  });

  (profile.abilities || []).forEach(ability => {
    const entry = { ...ability, sourceCharacter: sourceCharacterName, sourceClassId: classId };
    allTechniques.push(entry);
    byClass[classId].techniques.push(entry);
  });
}

const library = {
  schemaVersion: 1,
  type: 'aleria-spell-attack-library',
  generatedAt: new Date().toISOString(),
  notes: 'Sammlung aller Zauber, Techniken und besonderen Fähigkeiten, die bislang für Spielercharaktere gebaut wurden - als Fundus für künftige Charaktere derselben Klasse/Waffe/Zauberschule. Direkt aus den Charakter-Archiv-Exporten zusammengestellt; jede Kopie trägt sourceCharacter/sourceClassId zur Herkunft. Änderungen hier wirken sich NICHT auf die lebenden Charaktere aus (keine Referenz, reine Ablage). Zum Aktualisieren: node ./AleriaAlmanach/tools/build-spell-attack-library.mjs (CHARACTERS-Liste im Skript um neue Charaktere ergänzen).',
  byClass,
  bySpellSchool,
  byWeaponType,
  allSpells,
  allTechniques
};

await writeFile(outputFile, JSON.stringify(library, null, 2) + '\n', 'utf8');
console.log(`Bibliothek aktualisiert: ${allSpells.length} Zauber, ${allTechniques.length} Techniken/Fähigkeiten (${outputFile})`);
