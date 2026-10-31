import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { getPersonBiographyModule, sanitizeBiographyStatsForFirestore } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { createFamilyPersonCandidate, buildImportedCharacter } from '../modules/character-genealogy/genealogy-mapping.js';
import { TROETZLI_PEOPLE } from '../modules/gwynthor-troetzli/troetzli-household.mjs';
import { TROETZLI_CREATURE_SOURCE } from '../modules/creatures/catalog/troetzli.js';
import { sanitizeCreature, CREATURE_EXPORT_TYPE } from '../modules/creatures/creature-model.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';

const root = new URL('../../', import.meta.url);
const directory = 'Charakter Archiv Exporte/gwynthor-troetzli-2026-10-31/';
const authoredAt = '2026-10-31T00:00:00.000Z';

export function buildTroetzliCharacterExports() {
  const records = ['haus-penrudd', 'haus-llythfor'].map(getRegisteredFamily);
  const horse = sanitizeCreature(TROETZLI_CREATURE_SOURCE);
  return Object.entries(TROETZLI_PEOPLE).map(([key, spec]) => {
    const candidates = records.flatMap(record => record.family.persons.filter(p => p.id === spec.id)
      .map(person => ({ person, candidate: createFamilyPersonCandidate(record, person) })));
    const primary = candidates.find(item => item.candidate.familyRole === 'core') || candidates[0];
    const character = { id: spec.worldPersonId, ...buildImportedCharacter(primary.candidate, null, authoredAt),
      bio: spec.bio, currentLocation: 'Gwynthor',
      biography: getPersonBiographyModule(primary.person),
      imageSets: spec.portrait ? [{ id: 'standard', name: 'Standard', portrait: spec.portrait, emotes: [] }] : [],
      activeImageSetId: spec.portrait ? 'standard' : '', imageSetSchemaVersion: 1,
    };
    character.biography.stats = sanitizeBiographyStatsForFirestore(character.biography.stats);
    character.genealogy.sources = candidates.flatMap(({ candidate }) => buildImportedCharacter(candidate, null, authoredAt).genealogy.sources);
    // A married-away person's parents and child live in different chart files.
    for (const kind of ['parents', 'partners', 'children']) {
      character.genealogy.relationships[kind] = [...new Map(candidates.flatMap(({ candidate }) => candidate.relationships[kind])
        .map(relation => [relation.worldPersonId, relation])).values()];
    }
    if (key === 'cynddelw') {
      character.inventory = attachCreatureToInventory(character, horse, authoredAt);
      character.inventory.companions[0].role = 'Pferd · derzeit nicht reitbar';
    }
    return { type: 'aleria-character', version: 3, exportedAt: authoredAt, assignedTab: 'Gwynthor', character };
  });
}

export async function buildTroetzli({ check = false } = {}) {
  const sources = [];
  const output = async (name, value) => {
    const relative = directory + name, url = new URL(relative, root);
    const text = JSON.stringify(value, null, 2) + '\n';
    if (check) { if (await readFile(url, 'utf8') !== text) throw Error(`Trötzli-Export veraltet: ${name}`); }
    else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, text); }
    return relative;
  };
  for (const entry of buildTroetzliCharacterExports()) sources.push(await output(`${entry.character.id}.json`, entry));
  const horse = sanitizeCreature(TROETZLI_CREATURE_SOURCE);
  await output(`${horse.id}.json`, { type: CREATURE_EXPORT_TYPE, creature: horse });
  return importAuthoredCharacters({ sources, feature: 'gwynthor-troetzli', check });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(await buildTroetzli({ check: process.argv.includes('--check') })));
}
