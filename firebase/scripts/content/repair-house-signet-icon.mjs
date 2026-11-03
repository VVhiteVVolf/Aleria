// Complete Gildas's reviewed house correction without replaying any award.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';

const id = 'person--haus-gafyr--gildas-gafyr', itemId = 'gildas-gafyr-draig-knight-signet-item';
const file = new URL('../../../diagnostics/house-knight-rings-20261102/gildas-icon-correction.json', import.meta.url);
const client = await createContentPublicationClient();
const raw = await client.request(`/characters/${id}`);
const before = { ...decodeFirestoreFields(raw.fields), id };
const character = structuredClone(before);
const ring = character.inventory.items.find(item => item.id === itemId);
assert.equal(ring?.definitionRef?.id, 'house-signet:haus-gafyr');
assert.match(ring.image, /family-assets%2Fhaus-gafyr%2F/);
if (ring.icon === ring.image) {
  const receipt = JSON.parse(await readFile(file, 'utf8'));
  assert(receipt.verified); assert.equal(receipt.character.inventory.items.find(item => item.id === itemId).icon, ring.icon);
  console.log(JSON.stringify({ verified: true, idempotent: true, id }));
} else {
  assert.equal(ring.icon, 'https://i.imgur.com/mwP2vjq.png');
  const now = new Date().toISOString();
  ring.icon = ring.image;
  character.inventory.revision += 1; character.updatedAt = now;
  assert(Number.isSafeInteger(character.inventory.revision));
  const protect = value => {
    const copy = structuredClone(value); delete copy.updatedAt; delete copy.inventory.revision;
    delete copy.inventory.items.find(item => item.id === itemId).icon; return copy;
  };
  assert.deepEqual(protect(character), protect(before));
  const lockPath = `combat_profile_locks/characters/records/${id}`;
  const lock = await client.request(`/${lockPath}`);
  assert(!lock || !decodeFirestoreFields(lock.fields).activeEncounterKeys?.length, 'Gildas befindet sich in einem laufenden Kampf.');
  const writes = [
    { verify: client.documentName(lockPath), currentDocument: lock ? { updateTime: lock.updateTime } : { exists: false } },
    { update: { name: raw.name, fields: encodeFirestoreFields({ inventory: character.inventory, updatedAt: now }) },
      updateMask: { fieldPaths: ['inventory.items', 'inventory.revision', 'updatedAt'] }, currentDocument: { updateTime: raw.updateTime } }
  ];
  if (!process.argv.includes('--apply')) console.log(JSON.stringify({ dryRun: true, id, correctedItemId: itemId }));
  else {
    await backupContentPublication('house-signet-icon-20261102', [raw, lock], [], now);
    const result = await client.request(':commit', { writes });
    const afterRaw = await client.request(`/characters/${id}`);
    const after = { ...decodeFirestoreFields(afterRaw.fields), id };
    assert.deepEqual(after, character);
    await writeFile(file, JSON.stringify({ verified: true, id, itemId, committedAt: result.commitTime, before, character: after }, null, 2) + '\n');
    console.log(JSON.stringify({ applied: true, verified: true, id }));
  }
}
