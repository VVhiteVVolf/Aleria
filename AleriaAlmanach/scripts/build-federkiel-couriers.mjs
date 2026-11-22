import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../modules/characters/character-save-guard.js';
import { FEDERKIEL_BANNKREIS_COURIERS, federkielCourierAvatar } from '../modules/federkiel-gwynthor/federkiel-couriers.mjs';
import { FEDERKIEL_GUILD_EMBLEM, FEDERKIEL_SECTION, federkielModuleId } from '../modules/federkiel-gwynthor/federkiel-section.mjs';

const root = new URL('../../', import.meta.url);
const feature = 'federkiel-couriers-20261122';
const check = process.argv.includes('--check');
const exportFolder = 'Charakter Archiv Exporte/Federkiel Gwynthor/';
const catalogFile = new URL('../AvatarWerkstatt/Anleitungen/avatar-prompt-sets-28-20261121.json', import.meta.url);
const { sets } = JSON.parse(await readFile(catalogFile, 'utf8'));
const baseline = sets.find(set => set.number === 1);

function buildCharacterExport(person) {
  const { id, slug, name, age, gender, portrait, bio, appearance } = person;
  const title = gender === 'female' ? 'Postkurierin' : 'Postkurier';
  const emotes = baseline.panels.map((panel, index) => ({
    label: panel.emotion.split(' / ')[0], img: federkielCourierAvatar(slug, index + 1)
  }));
  const biography = sanitizeCharacterBiographyForFirestore({ biography: {
    schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: name,
    stats: [['Alter', `${age} Jahre`], ['Dienst', `${title} · Staffel II`], ['Einsatzgebiet', 'Bannkreis Gwynthor']],
    biography: {
      portrait, crestImage: FEDERKIEL_GUILD_EMBLEM, biographyTitle: `${name} · ${title} der Gilde Federkiel`,
      biographyText: `<p>${bio}</p>`, historyTitle: 'Erscheinung', historyText: `<p>${appearance}</p>`,
      documentsTitle: 'Dienststelle', documents: [{ title: 'Die Kurierstation (Gestüt)', text: 'Staffel II · Orte im Bannkreis',
        link: `/AleriaAlmanach/AleriaAlmanach.html?entry=${federkielModuleId('kurierstation')}` }]
    }
  } }).biography;
  return {
    type: 'aleria-character', version: 1, exportedAt: '2026-11-22T00:00:00+01:00', assignedTab: 'Gwynthor',
    character: {
      id, name, age, gender, title, role: `${title} · Bannkreisstaffel`, fraktion: 'Gilde Federkiel', race: 'Mensch',
      currentLocation: 'Bannkreis Gwynthor', taxonomyPath: FEDERKIEL_SECTION.path.join(' > '), status: 'active',
      portrait, emotes, bio, biography, archived: false
    }
  };
}

const exports = FEDERKIEL_BANNKREIS_COURIERS.map(buildCharacterExport);
const images = exports.flatMap(({ character }) => [character.portrait, ...character.emotes.map(emote => emote.img)]);
await Promise.all(images.map(path => access(new URL(path.slice(1), root))));
const sources = exports.map(({ character }) => `${exportFolder}${character.id}.json`);

for (const [index, payload] of exports.entries()) {
  const file = new URL(sources[index], root);
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  if (check) {
    if (await readFile(file, 'utf8') !== content) throw new Error(`Veraltete Figurenquelle: ${sources[index]}`);
  } else {
    await mkdir(new URL('.', file), { recursive: true });
    await writeFile(file, content);
  }
}

console.log(JSON.stringify(await importAuthoredCharacters({ sources, feature, check })));
