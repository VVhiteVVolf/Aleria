import { readFile, writeFile } from 'node:fs/promises';
import { createPublicContentReadClient } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
const client = createPublicContentReadClient();
const rows = await client.request(':runQuery', { structuredQuery: {
  from: [{ collectionId: 'characters' }],
  select: { fields: ['name', 'hidden', 'visibility', 'private', 'identity.worldPersonId'].map(fieldPath => ({ fieldPath })) },
} });
const matches = rows.map(row => row.document).filter(Boolean).filter(document => {
  const character = decodeFirestoreFields(document.fields);
  return !character.hidden && !character.private && character.visibility !== 'private'
    && /hamn?et{1,2}|\bgwen\b/i.test(character.name || '');
});
const found = [];
for (const match of matches) {
  const id = match.name.split('/').at(-1);
  const document = await client.request('/characters/' + id);
  const character = decodeFirestoreFields(document.fields);
  found.push(document);
  console.log(JSON.stringify({ id, name: character.name, updatedAt: character.updatedAt, biography: Boolean(character.biography) }));
}
const source = new URL('../../.private-backups/patrick-bios-20261103/selected-characters.raw.json', import.meta.url);
const previous = JSON.parse(await readFile(source, 'utf8'));
await writeFile(source, JSON.stringify([...new Map([...previous, ...found].map(document => [document.name, document])).values()], null, 2) + '\n');
console.log(JSON.stringify({ candidateCount: found.length, checkedNames: rows.filter(row => row.document).length }));
