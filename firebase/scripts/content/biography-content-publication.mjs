import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { buildBiographyExportPayload } from '../../../js/biography/biography-transfer.mjs';

const save = (url, value) => writeFile(url, JSON.stringify(value, null, 2) + '\n');
const withoutId = ({ id, ...data }) => data;
const patchFields = plan => Object.keys(plan.patch).filter(key => key !== 'updatedAt');

export function assertBiographyPublicationSource(current, plan, allowedFields) {
  assert.deepEqual(Object.keys(plan.patch).sort(), [...allowedFields].sort(), 'Unerwarteter Feldumfang.');
  for (const key of patchFields(plan)) assert.deepEqual(current[key] ?? null, plan.source[key],
    `${current.name}: ${key} wurde inzwischen bearbeitet. Bitte den Plan neu erstellen.`);
}

async function preparePublication({ current, directory, exportsDirectory, exportName, buildPlan }) {
  const { assets } = JSON.parse(await readFile(new URL('asset-publication.json', directory), 'utf8'));
  const plan = buildPlan(current, assets);
  plan.source = Object.fromEntries(patchFields(plan).map(key => [key, current[key] ?? null]));
  await save(new URL('prepared.json', directory), plan);
  await mkdir(exportsDirectory, { recursive: true });
  await save(new URL(`${exportName}-biografie.json`, exportsDirectory), buildBiographyExportPayload({
    biographyModule: plan.patch.biography, personId: plan.id, personName: current.name }));
  await save(new URL(`${exportName}-charakter.json`, exportsDirectory), { type: 'aleria-character', version: 3,
    mergeStrategy: 'replace-exported-fields', exportedAt: plan.patch.updatedAt, character: { id: plan.id, name: current.name, ...plan.patch } });
  for (const creature of plan.creatures) await save(new URL(`${creature.id}.json`, exportsDirectory), { type: 'aleria-creature', creature });
  return { ready: true, character: current.name, fields: Object.keys(plan.patch), portraits: 5,
    icons: plan.patch.biography.biography.abilities.length, companions: plan.creatures.map(creature => [creature.name, creature.species]) };
}

async function applyPublication({ current, document, plan, directory, allowedFields, label, client }) {
  const { request, documentName } = client;
  assert.equal(plan.id, current.id);
  assert.deepEqual(Object.keys(plan.patch).sort(), [...allowedFields].sort(), 'Unerwarteter Feldumfang.');
  const previousCreatures = await Promise.all(plan.creatures.map(creature => request(`/creatures/${creature.id}`)));
  if (patchFields(plan).every(key => isDeepStrictEqual(current[key], plan.patch[key]))) {
    assert(previousCreatures.every(Boolean), 'Ein bereits verknüpfter Kreaturbogen fehlt.');
    return { alreadyPublished: true, characterId: plan.id, creatureIds: plan.creatures.map(creature => creature.id) };
  }
  assertBiographyPublicationSource(current, plan, allowedFields);
  assert(previousCreatures.every(creature => !creature), 'Ein neuer Begleiter besitzt bereits eine Online-Akte; keine Überschreibung.');
  const lockPath = `combat_profile_locks/characters/records/${current.id}`;
  const inventoryChanged = Object.hasOwn(plan.patch, 'inventory');
  const lock = inventoryChanged ? await request('/' + lockPath) : null;
  assert(!(lock && decodeFirestoreFields(lock.fields).activeEncounterKeys?.length), 'Inventaränderung während eines laufenden Kampfes gesperrt.');
  const { assets } = JSON.parse(await readFile(new URL('asset-publication.json', directory), 'utf8'));
  await Promise.all(Object.values(assets).map(async asset => {
    const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000) });
    assert(response.ok && response.headers.get('content-type')?.startsWith('image/'), 'Bild fehlt: ' + asset.url);
    await response.arrayBuffer();
  }));
  await backupContentPublication(label, [document, lock], plan.creatures.map(creature => `creatures/${creature.id}`), new Date().toISOString());
  const creatures = plan.creatures.map(creature => ({ ...creature,
    ...(current.ownerUid ? { ownerUid: current.ownerUid } : {}), ...(current.createdBy ? { createdBy: current.createdBy } : {}) }));
  const writes = creatures.map(creature => ({ update: { name: documentName(`creatures/${creature.id}`),
    fields: encodeFirestoreFields(withoutId(creature)) }, currentDocument: { exists: false } }));
  if (inventoryChanged) writes.unshift({ verify: documentName(lockPath), currentDocument: lock ? { updateTime: lock.updateTime } : { exists: false } });
  writes.push({ update: { name: document.name, fields: encodeFirestoreFields(plan.patch) },
    updateMask: { fieldPaths: Object.keys(plan.patch) }, currentDocument: { updateTime: document.updateTime } });
  const commit = await request(':commit', { writes });
  const after = decodeFirestoreFields((await request(`/characters/${current.id}`)).fields);
  for (const [key, value] of Object.entries(plan.patch)) assert.deepEqual(after[key], value, key);
  for (const [key, value] of Object.entries(withoutId(current))) if (!(key in plan.patch)) assert.deepEqual(after[key], value, 'Unbeteiligtes Feld: ' + key);
  for (const creature of creatures) assert.deepEqual(decodeFirestoreFields((await request(`/creatures/${creature.id}`)).fields), withoutId(creature));
  const verification = { publishedAt: commit.commitTime, characterId: plan.id, biographyPortraits: 5,
    traitIcons: plan.patch.biography.biography.abilities.length,
    connectionPortraits: plan.patch.biography.biography.connections.filter(connection => connection.type !== 'heading' && connection.image).length,
    fields: Object.keys(plan.patch), createdCreatures: creatures.map(creature => ({ id: creature.id, name: creature.name, species: creature.species,
      bestiaryReference: creature.bestiaryReference })), unrelatedCharacterFieldsUnchanged: true };
  await save(new URL('publication-verification.json', directory), verification);
  return { published: true, ...verification };
}

export async function runBiographyPublication(options) {
  const client = await createContentPublicationClient();
  const document = await client.request(`/characters/${options.characterId}`);
  assert(document, 'Die Online-Akte fehlt.');
  const current = { id: options.characterId, ...decodeFirestoreFields(document.fields) };
  if (!process.argv.includes('--apply')) return preparePublication({ ...options, current });
  const plan = JSON.parse(await readFile(new URL('prepared.json', options.directory), 'utf8'));
  return applyPublication({ ...options, current, document, plan, client });
}
