import { writeFile } from 'node:fs/promises';
import { createContentPublicationClient } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
const client = await createContentPublicationClient();
const paths = ['familyWorkspaces/haus-sgrechiwr', 'familyWorkspaces/haus-sgrechiwr/persons?pageSize=100', 'publishedFamilies/haus-sgrechiwr'];
for (const path of paths) {
  const result = await client.request('/' + path);
  const basename = path.split('?')[0].replaceAll('/', '--');
  await writeFile(new URL('../../.private-backups/patrick-bios-20261103/' + basename + '.raw.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  if (!result) { console.log(JSON.stringify({ path, exists: false })); continue; }
  if (path.includes('/persons')) {
    console.log(JSON.stringify({ path, persons: (result.documents || []).map(document => {
      const person = decodeFirestoreFields(document.fields);
      return { id: person.id, name: person.name, biography: Boolean(person.extensions?.biographyModule), updatedAt: person.updatedAt };
    }) }));
  } else {
    const value = decodeFirestoreFields(result.fields);
    console.log(JSON.stringify({ path, keys: Object.keys(value), activeReleaseId: value.activeReleaseId, revision: value.revision }));
  }
}
