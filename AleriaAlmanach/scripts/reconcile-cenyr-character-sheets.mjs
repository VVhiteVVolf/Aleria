import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  reconcileCenyrTrainingForLevel,
  selectCenyrTechniqueForSlot,
  synchronizeCenyrSelectedTechniques
} from '../modules/classes/cenyr/cenyr-technique-selection.js';
import { selectCenyrTrainingOption } from '../modules/classes/cenyr/cenyr-class-training.js';
import { DRACHENTANZ_FORM_IDS as FORM_IDS } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDirectory, '..', '..');
const exportRoot = resolve(workspaceRoot, 'Charakter Archiv Exporte');
const checkOnly = process.argv.includes('--check');

const CHARACTER_FILES = Object.freeze([
  'gawain-draig.json',
  'duncan-gafyr.json',
  'gildas-gafyr.json',
  'guinevere-neidr.json',
  'gethin.json',
  'kane-draig.json'
]);

const DUNCAN_TECHNIQUES = Object.freeze([
  ['foundation-01', 'combat-style-drachentanz-jungdrache-01-erster-hieb', 1],
  ['foundation-02', 'combat-style-drachentanz-jungdrache-02-drachenbiss', 2],
  ['foundation-03', 'combat-style-drachentanz-jungdrache-03-gekreuzte-klauen', 3],
  ['foundation-04', 'combat-style-drachentanz-jungdrache-04-schweifkreis', 4],
  ['foundation-05', 'combat-style-drachentanz-jungdrache-05-stuermende-spur', 5],
  ['foundation-06', 'combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb', 6],
  ['duelist-01', 'combat-style-drachentanz-schwertdrache-kreisende-einladung', 7],
  ['duelist-02', 'combat-style-drachentanz-schwertdrache-spiegelparade', 8],
  ['expert-01', 'combat-style-drachentanz-vierfacher-empfang', 9],
  ['expert-06', 'combat-style-drachentanz-atemlose-mauer', 14],
  ['expert-07', 'combat-style-drachentanz-himmelsschnitt', 15],
  ['expert-08', 'combat-style-drachentanz-erdbebenpranke', 16],
  ['expert-09', 'combat-style-drachentanz-meisterliche-gegenwaage', 17],
  ['expert-10', 'combat-style-drachentanz-entfesselter-drache', 18],
  ['expert-11', 'combat-style-drachentanz-letzte-oeffnung', 19],
  ['expert-12', 'combat-style-drachentanz-vollendeter-waffenmeister', 20]
]);

const DUNCAN_PATHS = Object.freeze([
  [FORM_IDS.ausgeglichener, 9],
  [FORM_IDS.abwartender, 10],
  [FORM_IDS.fliegender, 11],
  [FORM_IDS.bruellender, 12],
  [FORM_IDS.zorniger, 13]
]);

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function makeTeuluSword(character, id) {
  return {
    id,
    inventoryItemId: '',
    name: `${character.name} · Teulu-Ritterschwert`,
    weaponType: 'sword',
    weaponProfileId: 'sword',
    training: 'martial',
    damageFormula: '1d8',
    versatileDamageFormula: '1d10',
    damageType: 'Hieb',
    attackAttribute: 'strength',
    proficient: true,
    attackBonus: 0,
    damageBonus: 0,
    range: 'Nahkampf',
    rangeType: 'melee',
    properties: 'Vielseitig · Teulu-Ausbildung',
    notes: 'Standardwaffe für die Schwertfolge des Drachentanzes.',
    equipped: true
  };
}

function ensureTeuluSword(character) {
  const profile = character.combatProfile;
  if (profile.weapons.some(weapon => weapon.weaponType === 'sword')) return;
  profile.weapons = profile.weapons.map(weapon => ({ ...weapon, equipped: false }));
  profile.weapons.push(makeTeuluSword(character, `${character.id || character.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-teulu-sword`));
}

function resetClassAttacks(profile) {
  profile.techniques = [];
  profile.classTraining = {
    schemaVersion: 2,
    curriculumId: `cenyr-${profile.templateSelections.classId}`,
    selections: [],
    techniqueSelections: []
  };
}

function reconcileStandardCharacter(character) {
  const profile = character.combatProfile;
  ensureTeuluSword(character);
  if (profile.templateSelections.classId === 'helwyr') {
    const classWeapons = new Set([
      'guinevere-longbow', 'guinevere-shortbow', 'guinevere-sword', 'guinevere-hunting-daggers', 'default-unarmed-melee'
    ]);
    profile.weapons = profile.weapons.filter(weapon => classWeapons.has(weapon.id));
  }
  resetClassAttacks(profile);
  character.combatProfile = reconcileCenyrTrainingForLevel(profile, profile.progression.level, {
    autoFill: true,
    preserveExisting: false,
    replaceClassTechniques: true
  }).profile;
}

function reconcileDuncan(character) {
  let profile = character.combatProfile;
  resetClassAttacks(profile);
  profile.abilities = profile.abilities.filter(ability => (
    !String(ability.id || '').startsWith('duncan-drachentanz-form-')
    && !String(ability.id || '').startsWith('duncan-aura-attack-')
  ));
  for (const [selectionId, selectedAtLevel] of DUNCAN_PATHS) {
    const selected = selectCenyrTrainingOption(profile, { kind: 'path', selectionId, selectedAtLevel });
    if (!selected.ok) throw new Error(`Duncan: ${selected.errors.join(' ')}`);
    profile = selected.profile;
  }
  for (const [slotId, techniqueId, selectedAtLevel] of DUNCAN_TECHNIQUES) {
    const selected = selectCenyrTechniqueForSlot(profile, { slotId, techniqueId, selectedAtLevel }, {
      preserveExisting: false
    });
    if (!selected.ok) throw new Error(`Duncan ${slotId}: ${selected.errors.join(' ')}`);
    profile = selected.profile;
  }
  profile = synchronizeCenyrSelectedTechniques(profile, {
    targetLevel: 20,
    preserveExisting: false,
    replaceClassTechniques: true
  });
  profile.notes = [
    'ENDGAME-ANKERFIGUR · DUNCAN GAFYR',
    '',
    'Kampfstil: Drachentanz. Duncan beherrscht die Grund- und Duellantenform sowie alle fünf Teulu-Expertenpfade. Vier seiner zwölf Expertenslots sind für die zusätzlichen Pfade gebunden; acht Expertentechniken bilden sein persönliches Meisterrepertoire.',
    '',
    'Seine ausgewählten Attacken betonen Waffenmeisterschaft, Gegenwehr, Beweglichkeit und kontrollierte Kraft. Persönliche Aura-Angriffe und doppelte Form-Fähigkeiten wurden zugunsten des gemeinsamen Klassenkatalogs entfernt.',
    '',
    'Aktionsökonomie Stufe 20: 2 Aktionen / 2 Bonusaktionen / 2 Reaktionen / 6 Besondere Aktionen. Aura-Fokus: 4.'
  ].join('\n');
  character.combatProfile = profile;
}

async function processFile(name) {
  const path = resolve(exportRoot, name);
  const current = await readFile(path, 'utf8');
  const exported = JSON.parse(current);
  if (exported?.type !== 'aleria-character' || !exported.character?.combatProfile) {
    throw new Error(`${name} ist kein gültiger Charakterexport.`);
  }
  if (exported.character.combatProfile.templateSelections?.classId === 'teulu'
    || exported.character.combatProfile.templateSelections?.classId === 'helwyr') {
    if (name === 'duncan-gafyr.json') reconcileDuncan(exported.character);
    else reconcileStandardCharacter(exported.character);
    exported.character.combatProfile = sanitizeCharacterCombatProfile(exported.character.combatProfile);
  }
  const next = json(exported);
  if (checkOnly && current !== next) throw new Error(`${name} ist nicht mit der Cenyr-Ausbildung abgeglichen.`);
  if (!checkOnly) await writeFile(path, next, 'utf8');
  return exported.character;
}

const characters = [];
for (const name of CHARACTER_FILES) characters.push(await processFile(name));
console.log(`${characters.length} Cenyr-Charakterbögen ${checkOnly ? 'geprüft' : 'abgeglichen'}: ${characters.map(character => character.name).join(', ')}.`);
