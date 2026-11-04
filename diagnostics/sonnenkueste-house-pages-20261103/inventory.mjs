// Einmaliger Bestandsbeleg; keine Laufzeit-Datenquelle.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const directory = new URL('./', import.meta.url);
mkdirSync(directory, { recursive: true });
const records = FAMILY_REGISTRY.filter(record => record.folderPath[0] === 'Cenyr' && record.folderPath[1] === 'Sonnenküste');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
export const inventory = records.map(record => ({
  id: record.id, title: record.title, folderPath: record.folderPath, profile: record.houseProfile,
  emblem: record.family.document.emblem, motto: record.family.document.motto,
  sourceRevision: record.family.extensions.sourceRevision || 0,
  sourceNote: record.family.extensions.sourceNote,
  graphFingerprint: createHash('sha256').update(JSON.stringify(Object.fromEntries(graphKeys.map(key => [key, record.family[key]])))).digest('hex'),
  people: record.family.persons.map(person => ({ id: person.id, name: person.name, title: person.title, notes: person.notes, portrait: person.portrait, status: person.status, lineageRole: person.lineageRole }))
}));
if (!existsSync(new URL('before.json', directory))) writeFileSync(new URL('before.json', directory), JSON.stringify(inventory, null, 2) + '\n');
console.log(JSON.stringify(inventory.map(({ people, sourceNote, ...record }) => ({ ...record, people: people.length })), null, 2));
