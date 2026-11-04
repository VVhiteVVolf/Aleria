import { mkdir, writeFile } from 'node:fs/promises';
import { createPublicContentReadClient } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';

const client = createPublicContentReadClient();
const exactNames = ['Gwen Hamnett', 'Cadogan Sgrechiwr', 'Rhiannon Draenmelyn'];
const filter = (op, stringValue) => ({ fieldFilter: { field: { fieldPath: 'name' }, op, value: { stringValue } } });
const queries = [
  { fieldFilter: { field: { fieldPath: 'name' }, op: 'IN', value: { arrayValue: { values: exactNames.map(stringValue => ({ stringValue })) } } } },
  { compositeFilter: { op: 'AND', filters: [filter('GREATER_THAN_OR_EQUAL', 'Gethin'), filter('LESS_THAN', 'Gethio')] } },
  { compositeFilter: { op: 'AND', filters: [filter('GREATER_THAN_OR_EQUAL', 'Gwen'), filter('LESS_THAN', 'Gweo')] } },
  { compositeFilter: { op: 'AND', filters: [filter('GREATER_THAN_OR_EQUAL', 'Rhiannon'), filter('LESS_THAN', 'Rhianoo')] } },
];
const results = await Promise.all(queries.map(where => client.request(':runQuery', {
  structuredQuery: { from: [{ collectionId: 'characters' }], where },
})));
const documents = [...new Map(results.flat().map(row => row.document).filter(Boolean).map(document => [document.name, document])).values()];
const directory = new URL('../../.private-backups/patrick-bios-20261103/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('selected-characters.raw.json', directory), JSON.stringify(documents, null, 2) + '\n');
console.log(JSON.stringify(documents.map(document => {
  const character = decodeFirestoreFields(document.fields);
  return { id: document.name.split('/').at(-1), name: character.name,
    updatedAt: character.updatedAt, documentUpdateTime: document.updateTime,
    visibility: character.visibility, hidden: character.hidden,
    biography: Boolean(character.biography), worldPersonId: character.identity?.worldPersonId };
}), null, 2));
