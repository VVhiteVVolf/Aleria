import { mkdir, writeFile } from 'node:fs/promises';
import { VARULV_NEW_COMPANIONS } from '../modules/creatures/catalog/varulv-companions.js';
import { sanitizeCreature, CREATURE_EXPORT_TYPE, CREATURE_ARCHIVE_EXPORT_TYPE } from '../modules/creatures/creature-model.js';

const directory = new URL('../../Charakter Archiv Exporte/gefaehrten/varulv-2026-10-17/', import.meta.url);
await mkdir(directory, { recursive: true });
const creatures = VARULV_NEW_COMPANIONS.map(sanitizeCreature);
for (const creature of creatures) {
  await writeFile(new URL(`${creature.id}.json`, directory), JSON.stringify({ type: CREATURE_EXPORT_TYPE, creature }, null, 2) + '\n');
}
await writeFile(new URL('varulv-haustiere.json', directory), JSON.stringify({ type: CREATURE_ARCHIVE_EXPORT_TYPE, creatures }, null, 2) + '\n');
console.log(`${creatures.length} Varulv-Kreaturen exportiert.`);
