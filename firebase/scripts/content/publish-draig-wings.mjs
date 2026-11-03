// Bounded editorial publication: only the residential modules and placement.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { createContentPublicationClient, createPublicContentReadClient, backupContentPublication } from './content-publication-client.mjs';
import { DRAIG_ROOMS_MODULE_ID } from '../../../AleriaAlmanach/modules/castell-draig-rooms/room-pages.mjs';
import { RESIDENTIAL_NODE_ID } from '../../../AleriaAlmanach/modules/castell-draig-rooms/wing-households.mjs';
import { loadWingArtwork, saveWingPackages, wingSource } from '../../../AleriaAlmanach/modules/castell-draig-rooms/wing-package.mjs';

const publicClient = createPublicContentReadClient();
const entryOf = document => JSON.parse(decodeFirestoreFields(document.fields).entryJson);
const source = JSON.parse(await readFile(new URL('module-before.json', wingSource), 'utf8')).entry;
const artwork = await loadWingArtwork();
const modulePath = `/module_store_entries/${DRAIG_ROOMS_MODULE_ID}`;

async function assertEmptyOriginalScenes(client, transaction = '') {
  const response = await client.request(':runQuery', { structuredQuery: { from: [{ collectionId: 'comments' }],
    where: { compositeFilter: { op: 'AND', filters: [
      { fieldFilter: { field: { fieldPath: 'entryId' }, op: 'GREATER_THAN_OR_EQUAL', value: { stringValue: DRAIG_ROOMS_MODULE_ID } } },
      { fieldFilter: { field: { fieldPath: 'entryId' }, op: 'LESS_THAN', value: { stringValue: `${DRAIG_ROOMS_MODULE_ID}\uf8ff` } } }
    ] } }, limit: 1 }, ...(transaction ? { transaction } : {}) });
  assert(!response.some(row => row.document), 'Neue Wohntrakt-Beiträge vorhanden. Keine Szenen mit Geschichte verschieben.');
  const suffixes = ['', ...source.pages.flatMap((page, index) => [`::session:${page.commentThreadKey || index}`, `::page:${page.commentThreadKey || index}`])];
  if (transaction) {
    const states = await client.request(':batchGet', { transaction, documents: suffixes.map(suffix => client.documentName(`comment_turns/${DRAIG_ROOMS_MODULE_ID}${suffix}`)) });
    assert(!states.some(row => row.found), 'Ein Szenenzustand wurde inzwischen angelegt.');
    return;
  }
  for (const suffix of suffixes) {
    assert.equal(await client.request(`/comment_turns/${DRAIG_ROOMS_MODULE_ID}${suffix}`), null, 'Ein gespeicherter Szenenzustand muss zuerst gesondert übernommen werden.');
  }
}

async function verifyPublished(client, payload) {
  for (const section of payload.customSections) for (const entry of section.entries) {
    const current = await client.request(`/module_store_entries/${entry.id}`);
    assert(current, `Modul fehlt: ${entry.id}`);
    assert.deepEqual(entryOf(current), entry, `Modul weicht ab: ${entry.id}`);
  }
  const config = decodeFirestoreFields((await client.request('/char_tabs/config')).fields);
  for (const node of payload.moduleSectionNodes.filter(node => node.id.startsWith(RESIDENTIAL_NODE_ID))) {
    assert.deepEqual(config.moduleStoreManifest.moduleSectionNodes.find(row => row.id === node.id), node);
  }
  for (const section of payload.customSections) {
    const { entries, ...placement } = section;
    assert.deepEqual(config.moduleStoreManifest.customSections.find(row => row.nodeId === placement.nodeId), placement);
    for (const entry of entries) {
      assert.equal(config.moduleStoreManifest.moduleNodeAssignments[entry.id], placement.nodeId);
      assert(!config.hiddenModuleIds?.[entry.id] && !config.moduleStoreManifest.hiddenModuleIds?.[entry.id]);
    }
  }
  for (const art of artwork) {
    const response = await fetch(art.url, { signal: AbortSignal.timeout(30000) });
    assert(response.ok, `Bild fehlt: ${art.id}`);
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), art.sha256);
  }
}

const initialConfigDocument = await publicClient.request('/char_tabs/config');
const initialConfig = decodeFirestoreFields(initialConfigDocument.fields);
if (initialConfig.moduleStoreManifest.moduleSectionNodes.some(node => node.id === RESIDENTIAL_NODE_ID)) {
  const payload = JSON.parse(await readFile(new URL('module-publication.json', wingSource), 'utf8'));
  await verifyPublished(publicClient, payload);
  console.log(JSON.stringify({ verified: true, alreadyApplied: true, modules: payload.customSections.flatMap(section => section.entries).length }));
} else {
  assert.deepEqual(entryOf(await publicClient.request(modulePath)), source, 'Ausgangsmodul wurde zwischenzeitlich verändert.');
  await assertEmptyOriginalScenes(publicClient);
  const { plan, payload } = await saveWingPackages(source, initialConfig.moduleStoreManifest, artwork);
  for (const person of plan.review.people.filter(person => person.characterId)) {
    assert(await publicClient.request(`/characters/${person.characterId}`), `Figur fehlt online: ${person.personId}`);
  }
  for (const entry of plan.entries.filter(entry => entry.id !== source.id)) {
    assert.equal(await publicClient.request(`/module_store_entries/${entry.id}`), null, `Modul-ID ist bereits belegt: ${entry.id}`);
  }
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ dryRun: true, wings: 6, households: 34, modules: plan.entries.length,
      livingDraigs: plan.review.livingDraigs, images: artwork.length, emptyOriginalScenesVerified: true,
      preservedGawainThreadAndDate: true, unlinkedCharacterPersons: plan.review.unlinkedCharacterPersons }));
  } else {
    const client = await createContentPublicationClient();
    const [configDocument, moduleDocument] = await Promise.all([client.request('/char_tabs/config'), client.request(modulePath)]);
    assert.equal(configDocument.updateTime, initialConfigDocument.updateTime, 'Konfiguration wurde gleichzeitig bearbeitet.');
    assert.deepEqual(entryOf(moduleDocument), source);
    await assertEmptyOriginalScenes(client);
    const now = new Date().toISOString();
    await backupContentPublication('draig-wohnfluegel-20261102', [configDocument, moduleDocument], plan.entries.filter(entry => entry.id !== source.id).map(entry => entry.id), now);
    for (const art of artwork) await client.publishFamilyArtwork({ familyId: 'haus-draig', assetId: art.assetId, bytes: art.bytes,
      metadata: { kind: 'scene', sha256: art.sha256, moduleId: art.id === 'familienstube' ? 'castell-draig-familienstube' : `castell-draig-gemach-${art.id}` } });
    const { transaction } = await client.request(':beginTransaction', { options: { readWrite: {} } });
    await assertEmptyOriginalScenes(client, transaction);
    const revision = Math.max(Date.now(), Number(initialConfig.moduleStoreUpdatedAtClient || 0) + 1);
    plan.manifest.updatedAtClient = revision;
    const writes = plan.entries.map(entry => ({ update: { name: client.documentName(`module_store_entries/${entry.id}`),
      fields: encodeFirestoreFields({ entryJson: JSON.stringify(entry), updatedAtClient: revision }) },
      ...(entry.id === source.id ? { updateMask: { fieldPaths: ['entryJson', 'updatedAtClient'] }, currentDocument: { updateTime: moduleDocument.updateTime } } : { currentDocument: { exists: false } }),
      updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] }));
    writes.push({ update: { name: configDocument.name, fields: encodeFirestoreFields({ moduleStoreManifest: plan.manifest, moduleStoreUpdatedAtClient: revision }) },
      updateMask: { fieldPaths: ['moduleStoreManifest', 'moduleStoreUpdatedAtClient'] },
      updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { updateTime: configDocument.updateTime } });
    // The transaction reads the comments query and missing turn documents, so
    // a simultaneous scene start aborts the publication without moving it.
    try { await client.request(':commit', { transaction, writes }); }
    catch (error) { await client.request(':rollback', { transaction }).catch(() => {}); throw error; }
    await verifyPublished(publicClient, payload);
    const after = await client.request('/char_tabs/config');
    for (const [key, value] of Object.entries(configDocument.fields)) {
      if (!['moduleStoreManifest', 'moduleStoreUpdatedAtClient', 'moduleStoreUpdatedAt'].includes(key)) assert.deepEqual(after.fields[key], value, `Fremdes Konfigurationsfeld verändert: ${key}`);
    }
    const receipt = { publishedAt: now, wings: 6, households: 34, modules: plan.entries.length, livingDraigs: plan.review.livingDraigs,
      generatedImages: artwork.length, imageHashesVerified: true, commentsWritten: 0, profileWrites: 0,
      preservedGawainThreadAndDate: true, unrelatedConfigFieldsPreserved: true, publicReadbackVerified: true,
      unlinkedCharacterPersons: plan.review.unlinkedCharacterPersons,
      url: 'https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html?entry=castell-draig-wohntrakte' };
    await writeFile(new URL('publication-verification.json', wingSource), JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt));
  }
}
