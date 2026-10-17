import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { planNealaBiography, NEALA_CHARACTER_ID } from './neala-biography-plan.mjs';
import { buildBiographyExportPayload } from '../../../js/biography/biography-transfer.mjs';

const apply = process.argv.includes('--apply');
const directory = new URL('../../../AleriaAlmanach/assets/biographies/neala-wylan/2026-10-17/', import.meta.url);
const exportsDirectory = new URL('../../../Charakter Archiv Exporte/Biographien/neala-wylan-2026-10-17/', import.meta.url);
const { request, documentName } = await createContentPublicationClient();
const document = await request(`/characters/${NEALA_CHARACTER_ID}`);
assert(document, 'Nealas Online-Akte fehlt.');
const current = { id: NEALA_CHARACTER_ID, ...decodeFirestoreFields(document.fields) };
const save = (url, value) => writeFile(url, JSON.stringify(value, null, 2) + '\n');
let plan;
if (!apply) {
  const { assets } = JSON.parse(await readFile(new URL('asset-publication.json', directory), 'utf8'));
  plan = { ...planNealaBiography(current, assets), source: { biography: current.biography, inventory: current.inventory ?? null } };
  await save(new URL('prepared.json', directory), plan);
  await mkdir(exportsDirectory, { recursive: true });
  await save(new URL('neala-biografie.json', exportsDirectory), buildBiographyExportPayload({ biographyModule: plan.patch.biography, personId: plan.id, personName: current.name }));
  await save(new URL('neala-charakter.json', exportsDirectory), { type: 'aleria-character', version: 3, mergeStrategy: 'replace-exported-fields', exportedAt: plan.patch.updatedAt, character: { id: plan.id, name: current.name, ...plan.patch } });
  for (const creature of plan.creatures) await save(new URL(`${creature.id}.json`, exportsDirectory), { type: 'aleria-creature', creature });
  console.log(JSON.stringify({ ready: true, character: current.name, portraits: 5, icons: 6, companions: plan.creatures.map(creature => [creature.name, creature.species]), fields: Object.keys(plan.patch) }));
} else {
  plan = JSON.parse(await readFile(new URL('prepared.json', directory), 'utf8'));
  assert.equal(plan.id, NEALA_CHARACTER_ID);
  assert.deepEqual(Object.keys(plan.patch).sort(), ['biography', 'inventory', 'updatedAt']);
  const creature = plan.creatures[0];
  const existing = await request(`/creatures/${creature.id}`);
  if (isDeepStrictEqual(current.biography, plan.patch.biography) && isDeepStrictEqual(current.inventory, plan.patch.inventory)) {
    assert(existing, 'Flöckchens bereits verknüpfter Kreaturbogen fehlt.');
    console.log(JSON.stringify({ alreadyPublished: true, creatureId: creature.id }));
  } else {
    assert.deepEqual(current.biography, plan.source.biography, 'Nealas Bio wurde inzwischen bearbeitet. Bitte den Plan neu erstellen.');
    assert.deepEqual(current.inventory ?? null, plan.source.inventory, 'Nealas Inventar wurde inzwischen bearbeitet. Bitte den Plan neu erstellen.');
    assert(!existing, 'Flöckchen besitzt bereits eine Online-Akte; keine Überschreibung.');
    const lockPath = `combat_profile_locks/characters/records/${NEALA_CHARACTER_ID}`;
    const lock = await request('/' + lockPath);
    assert(!(lock && decodeFirestoreFields(lock.fields).activeEncounterKeys?.length), 'Neala befindet sich in einem laufenden Kampf.');
    const urls = [...plan.patch.biography.biography.portraitStages, creature.portrait,
      ...plan.patch.biography.biography.abilities.map(ability => new URL(ability.icon, 'https://dieweltvonaleria.netlify.app').href)];
    await Promise.all(urls.map(async url => {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      assert(response.ok && response.headers.get('content-type')?.startsWith('image/'), 'Bild fehlt: ' + url);
      await response.arrayBuffer();
    }));
    const now = new Date().toISOString();
    await backupContentPublication('neala-biography', [document, lock], [`creatures/${creature.id}`], now);
    const { id, ...data } = creature;
    if (current.ownerUid) data.ownerUid = current.ownerUid;
    if (current.createdBy) data.createdBy = current.createdBy;
    const writes = [
      { verify: documentName(lockPath), currentDocument: lock ? { updateTime: lock.updateTime } : { exists: false } },
      { update: { name: documentName(`creatures/${id}`), fields: encodeFirestoreFields(data) }, currentDocument: { exists: false } },
      { update: { name: document.name, fields: encodeFirestoreFields(plan.patch) }, updateMask: { fieldPaths: Object.keys(plan.patch) }, currentDocument: { updateTime: document.updateTime } }
    ];
    const commit = await request(':commit', { writes });
    const after = decodeFirestoreFields((await request(`/characters/${NEALA_CHARACTER_ID}`)).fields);
    for (const [key, value] of Object.entries(plan.patch)) assert.deepEqual(after[key], value, key);
    for (const key of Object.keys(current).filter(key => key !== 'id' && !(key in plan.patch))) assert.deepEqual(after[key], current[key], 'Unbeteiligtes Feld: ' + key);
    assert.deepEqual(decodeFirestoreFields((await request(`/creatures/${id}`)).fields), data);
    await save(new URL('publication-verification.json', directory), { publishedAt: commit.commitTime, characterId: plan.id,
      biographyPortraits: 5, traitIcons: 6, creatureId: id, species: data.species, bestiaryReference: data.bestiaryReference,
      companionLinked: true, unrelatedCharacterFieldsUnchanged: true });
    console.log(JSON.stringify({ published: true, character: current.name, portraits: 5, icons: 6, companion: 'Flöckchen', species: data.species, unrelatedFieldsUnchanged: true }));
  }
}
