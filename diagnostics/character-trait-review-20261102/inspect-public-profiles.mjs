import { mkdir, writeFile } from 'node:fs/promises';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
const directory = new URL('./', import.meta.url);
await mkdir(directory, { recursive: true });
const documents = [];
let pageToken = '';
do {
  const url = new URL('https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents/characters');
  url.searchParams.set('pageSize', '1000');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error(`Öffentlicher Profilabgleich: HTTP ${response.status}`);
  const page = await response.json();
  documents.push(...(page.documents || []));
  pageToken = page.nextPageToken || '';
} while (pageToken);
const profiles = documents.filter(document => Object.keys(decodeFirestoreFields(document.fields).combatProfile || {}).length)
  .map(document => ({ id: document.name.split('/').at(-1), updateTime: document.updateTime, character: decodeFirestoreFields(document.fields) }));
await writeFile(new URL('online-before.json', directory), JSON.stringify({ capturedAt: new Date().toISOString(), publicCharacters: documents.length, profiles }, null, 2) + '\n');
console.log(JSON.stringify({ publicCharacters: documents.length, profiles: profiles.map(({ id, character }) => ({ id, name: character.name,
  revision: character.combatProfile.revision, level: character.combatProfile.progression?.level,
  quirks: character.combatProfile.quirks?.map(entry => entry.name), keys: Object.keys(character) })) }));
