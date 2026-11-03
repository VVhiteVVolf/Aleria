import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { createCaralynCompanion, CARALYN_CHARACTER_ID } from '../../../AleriaAlmanach/modules/gwynthor-seven/caralyn-companion.js';
import { attachCreatureToInventory } from '../../../AleriaAlmanach/modules/creatures/creature-companion-link.js';
const client = await createContentPublicationClient(), now = new Date().toISOString(), source = createCaralynCompanion(now);
assert.equal(source.bestiaryReference?.id, 'tiere/pferde/rhyfel');
const decode = document => ({ ...decodeFirestoreFields(document.fields), id: document.name.split('/').at(-1) });
const [rawCharacter, rawCreature] = await Promise.all([client.request(`/characters/${CARALYN_CHARACTER_ID}`), client.request(`/creatures/${source.id}`)]);
assert(rawCharacter && rawCreature);
const character = decode(rawCharacter), creature = decode(rawCreature);
assert.equal(creature.itemOrigin?.ownerCharacterId, character.id);
const creaturePatch = { species: source.species, bestiaryReference: source.bestiaryReference, notes: source.notes,
  biography: { ...creature.biography, summary: source.biography.summary, personality: source.biography.personality } };
const inventory = attachCreatureToInventory(character, { ...creature, ...creaturePatch }, now);
const connections = character.biography.biography.connections.map(connection => connection.name === 'Eure Hufigkeit'
  ? { ...connection, detail: 'Reitpferd · vermutlich Rhyfel' } : connection);
const changed = !isDeepStrictEqual(inventory, character.inventory) || !isDeepStrictEqual(connections, character.biography.biography.connections)
  || Object.entries(creaturePatch).some(([key, value]) => !isDeepStrictEqual(value, creature[key]));
if (!changed) console.log(JSON.stringify({ verified: true, changed: false, bestiaryId: source.bestiaryReference.id }));
else if (!process.argv.includes('--apply')) console.log(JSON.stringify({ ready: true, creatureId: creature.id, bestiaryId: source.bestiaryReference.id }));
else {
  const lockPaths = [`combat_profile_locks/characters/records/${character.id}`, `combat_profile_locks/creatures/records/${creature.id}`];
  const locks = await Promise.all(lockPaths.map(path => client.request('/' + path)));
  assert(locks.every(lock => !decodeFirestoreFields(lock?.fields || {}).activeEncounterKeys?.length));
  inventory.revision = Math.max(Date.parse(now), (character.inventory.revision || 0) + 1);
  const characterPatch = { inventory, biography: { biography: { connections } }, updatedAt: now };
  await backupContentPublication('caralyn-rhyfel-metadata', [rawCharacter, rawCreature, ...locks], [], now);
  const writes = locks.map((lock, index) => ({ verify: client.documentName(lockPaths[index]), currentDocument: lock ? { updateTime: lock.updateTime } : { exists: false } }));
  writes.push({ update: { name: rawCreature.name, fields: encodeFirestoreFields({ ...creaturePatch, updatedAt: now }) }, updateMask: { fieldPaths: [...Object.keys(creaturePatch), 'updatedAt'] }, currentDocument: { updateTime: rawCreature.updateTime } },
    { update: { name: rawCharacter.name, fields: encodeFirestoreFields(characterPatch) }, updateMask: { fieldPaths: ['inventory', 'biography.biography.connections', 'updatedAt'] }, currentDocument: { updateTime: rawCharacter.updateTime } });
  const result = await client.request(':commit', { writes });
  const [afterCharacter, afterCreature] = await Promise.all([client.request(`/characters/${character.id}`), client.request(`/creatures/${creature.id}`)]);
  assert.deepEqual(decode(afterCreature), { ...creature, ...creaturePatch, updatedAt: now });
  assert.deepEqual(decode(afterCharacter), { ...character, inventory, biography: { ...character.biography, biography: { ...character.biography.biography, connections } }, updatedAt: now });
  await writeFile(new URL('../../../diagnostics/caralyn-biography-20261102/breed-correction.json', import.meta.url), JSON.stringify({ verified: true, committedAt: result.commitTime, reviewedAt: now, creatureId: creature.id, bestiaryReference: source.bestiaryReference, tentative: true, combatResourcesPreserved: true }, null, 2) + '\n');
  console.log(JSON.stringify({ applied: true, bestiaryId: source.bestiaryReference.id, tentative: true }));
}
