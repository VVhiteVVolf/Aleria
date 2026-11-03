// Replace three obsolete placeholder images on this group's starter instances.
// Definitions, quantities, claims, other items and personal records stay intact.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { OWETA_QUARTET_STARTER_STOCK } from '../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-data.mjs';
import { OWETA_QUARTET_SOURCE_KEY } from '../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-publication.mjs';

const client = await createContentPublicationClient();
const path = '/group_quest_accounts/oweta-quartett';
const before = await client.request(path);
const account = decodeFirestoreFields(before.fields);
const next = structuredClone(account);
const changed = [];
for (const specification of OWETA_QUARTET_STARTER_STOCK.filter(item => item.image)) {
  const png = await readFile(new URL(`../../${specification.image.slice(1)}`, import.meta.url));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const item = next.inventory.items.find(row => row.id === `oweta-quartett-start-${specification.key}`);
  assert(item && item.acquisition?.sourceKey === OWETA_QUARTET_SOURCE_KEY, 'Der ursprüngliche Startgegenstand fehlt.');
  assert(['https://i.imgur.com/UbjFi5T.png', specification.image].includes(item.image), 'Spätere Bildbearbeitung bleibt erhalten.');
  if (item.image !== specification.image) {
    item.image = specification.image;
    changed.push(item.id);
  }
}
if (!changed.length) {
  console.log(JSON.stringify({ alreadyComplete: true, writes: 0 }));
} else {
  const now = new Date().toISOString();
  next.revision = Number(account.revision || 0) + 1;
  next.inventory.revision = Number(account.inventory.revision || 0) + 1;
  next.updatedAt = now;
  await backupContentPublication('oweta-quartett-stock-art-completion', [before], [], now);
  await client.request(':commit', { writes: [{
    update: { name: before.name, fields: encodeFirestoreFields({ inventory: { items: next.inventory.items, revision: next.inventory.revision },
      revision: next.revision, updatedAt: next.updatedAt }) },
    updateMask: { fieldPaths: ['inventory.items', 'inventory.revision', 'revision', 'updatedAt'] },
    currentDocument: { updateTime: before.updateTime }
  }] });
  const after = decodeFirestoreFields((await client.request(path)).fields);
  assert.deepEqual(after, next);
  const restored = structuredClone(after);
  restored.revision = account.revision;
  restored.inventory.revision = account.inventory.revision;
  restored.updatedAt = account.updatedAt;
  for (const id of changed) restored.inventory.items.find(item => item.id === id).image = account.inventory.items.find(item => item.id === id).image;
  assert.deepEqual(restored, account, 'Nur drei Bilder und die Revisionskennungen dürfen sich ändern.');
  const result = { verified: true, imageInstances: changed, quantitiesPreserved: true, definitionsPreserved: true, walletPreserved: true };
  await writeFile(new URL('stock-art-completion.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
}
