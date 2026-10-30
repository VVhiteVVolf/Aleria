import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { getPersonBiographyModule, sanitizeBiographyStatsForFirestore } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { createFamilyPersonCandidate, buildImportedCharacter } from '../modules/character-genealogy/genealogy-mapping.js';
import { SILBERWIND_CREATURE_SOURCE } from '../modules/creatures/catalog/balchder-companions.js';
import { sanitizeCreature, CREATURE_EXPORT_TYPE } from '../modules/creatures/creature-model.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';

// Reviewable character/creature imports only. No database, Firebase or release writes.
const root = new URL('../../', import.meta.url);
const directory = new URL('Charakter Archiv Exporte/balchder-vertragsstube-2026-10-29/', root);
const check = process.argv.includes('--check');
const authoredAt = '2026-10-29T00:00:00.000Z';
const record = getRegisteredFamily('haus-balchder');
const roles = new Map([
  ['kamber-balchder', 'Vertragsmeister der Grafschaft Celtigerns Wacht'],
  ['blodwen-balchder', 'Schreibergehilfin unter Kamber Balchder'],
  ['rice-balchder', 'Laufbursche unter Kamber Balchder']
]);

async function output(name, data) {
  const text = JSON.stringify(data, null, 2) + '\n', url = new URL(name, directory);
  if (check) {
    if (await readFile(url, 'utf8') !== text) throw Error(`Veralteter Balchder-Export: ${name}`);
  } else await writeFile(url, text);
}

if (!check) await mkdir(directory, { recursive: true });
const horse = sanitizeCreature(SILBERWIND_CREATURE_SOURCE);
for (const [personId, role] of roles) {
  const person = record.family.persons.find(p => p.id === personId);
  const candidate = createFamilyPersonCandidate(record, person);
  const biography = getPersonBiographyModule(person);
  biography.stats = sanitizeBiographyStatsForFirestore(biography.stats);
  const character = { id: candidate.worldPersonId, ...buildImportedCharacter(candidate, null, authoredAt),
    role, bio: person.notes, biography };
  // The companion payload contains exactly the new named animal. A separate
  // additive attachment plan avoids replacing a live character's whole inventory.
  delete character.inventory;
  await output(`${personId}.json`, { type: 'aleria-character', version: 3,
    mergeStrategy: 'replace-exported-fields', exportedAt: authoredAt, character });
}
await output(`${horse.id}.json`, { type: CREATURE_EXPORT_TYPE, creature: horse });
await output('silberwind-besitzzuordnung.json', {
  ownerCharacterId: horse.itemOrigin.ownerCharacterId, creatureId: horse.id,
  operation: 'attachCreatureToInventory',
  rule: 'Auf den aktuellen Besitzerstand anwenden; vorhandene Inventareinträge und Ressourcen erhalten.',
  inventoryAddition: attachCreatureToInventory({ id: horse.itemOrigin.ownerCharacterId, name: 'Kamber Balchder', inventory: {} }, horse, authoredAt)
});
console.log(`Drei Balchder-Biografien, Silberwind und additive Besitzzuordnung ${check ? 'geprüft' : 'vorbereitet'}.`);
