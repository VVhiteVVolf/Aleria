// Explicit editorial publication. Only this module, selected profiles and
// bounded group configuration fields are written; live mechanics stay untouched.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { RETINUE_PEOPLE, RETINUE_ID, RETINUE_EXISTING_IDS } from '../../../AleriaAlmanach/modules/skalli-retinue/retinue-people.mjs';
import { buildSkalliRetinue } from '../../../AleriaAlmanach/modules/skalli-retinue/retinue-module.mjs';
import { planRetinueCharacters } from '../../../AleriaAlmanach/modules/skalli-retinue/retinue-characters.mjs';
import { buildRetinueConfig, extendSkalliBiography } from '../../../AleriaAlmanach/modules/skalli-retinue/retinue-publication.mjs';
import { groupNameKey } from '../../../AleriaAlmanach/modules/landing/group-landing-roster.js';

const directory = new URL('../../../Charakter Archiv Exporte/Module/Skallis Gefolge/', import.meta.url);
await mkdir(directory, { recursive: true });
const apply = process.argv.includes('--apply');
const client = await createContentPublicationClient();
const { request, documentName } = client;
const now = new Date().toISOString();
const configDocument = await request('/char_tabs/config');
const config = decodeFirestoreFields(configDocument.fields);
const listing = [];
let token = '';
do {
  const page = await request('/characters?pageSize=1000&mask.fieldPaths=name&mask.fieldPaths=identity&mask.fieldPaths=genealogy.worldPersonId' + (token ? '&pageToken=' + encodeURIComponent(token) : ''));
  listing.push(...(page.documents || []).map(raw => ({ id: raw.name.split('/').at(-1), ...decodeFirestoreFields(raw.fields) })));
  token = page.nextPageToken || '';
} while (token);
const selected = listing.filter(character => RETINUE_PEOPLE.some(person => character.id === person.worldPersonId || character.id === RETINUE_EXISTING_IDS[person.key] || character.identity?.worldPersonId === person.worldPersonId || character.genealogy?.worldPersonId === person.worldPersonId));
for (const person of RETINUE_PEOPLE) assert(listing.filter(character => character.name === person.name).every(character => selected.includes(character)), `Nicht verknüpfte gleichnamige Online-Figur: ${person.name}`);
const documents = await Promise.all(selected.map(character => request(`/characters/${encodeURIComponent(character.id)}`)));
const previous = documents.map(raw => ({ id: raw.name.split('/').at(-1), ...decodeFirestoreFields(raw.fields) }));
const plan = planRetinueCharacters(previous, config, now);
const source = JSON.parse(await readFile(new URL('../../../AleriaAlmanach/modules/skalli-retinue/skalli-biography-source.json', import.meta.url), 'utf8'));
const entry = buildSkalliRetinue(source);
entry.sessionCast = plan.entries.map(item => item.id);
const overview = entry.pages.find(page => page.landingPage).landing.group;
for (const member of overview.members) member.characterId = plan.entries.find(item => 'hierarchy:' + groupNameKey(RETINUE_PEOPLE.find(person => person.key === item.key).name) === member.id).id;
const moduleDocument = await request(`/module_store_entries/${RETINUE_ID}`);
if (moduleDocument) {
  const saved = decodeFirestoreFields(moduleDocument.fields);
  assert.deepEqual(saved.entryJson ? JSON.parse(saved.entryJson) : saved.entry, entry, 'Online-Modul wurde inzwischen redaktionell geändert.');
}
assert(!config.moduleStoreManifest.hiddenModuleIds?.[RETINUE_ID], 'Das Modul ist online ausgeblendet.');
for (const item of plan.entries.filter(item => !item.create)) {
  const prior = previous.find(character => character.id === item.id);
  if (item.key === 'skalli-varulv') {
    const biography = extendSkalliBiography(prior.biography);
    if (!isDeepStrictEqual(biography, prior.biography)) item.patch = { ...item.patch, biography, updatedAt: now };
  }
  if (item.key === 'fenrir-varulv' && !prior.identity?.worldPersonId && !prior.genealogy?.worldPersonId) {
    const worldPersonId = RETINUE_PEOPLE.find(person => person.key === item.key).worldPersonId;
    item.patch = { ...item.patch, identity: { worldPersonId }, genealogy: { ...item.patch?.genealogy, worldPersonId }, updatedAt: now };
  }
}
const nextConfig = buildRetinueConfig(config, plan.config);
const configPatch = Object.fromEntries(Object.entries(nextConfig).filter(([key, value]) => !isDeepStrictEqual(value, config[key])));
const changed = plan.entries.filter(item => item.create || item.patch);
const moduleChanged = !moduleDocument;
if (configPatch.moduleStoreManifest || moduleChanged) {
  configPatch.moduleStoreManifest ||= structuredClone(nextConfig.moduleStoreManifest);
  configPatch.moduleStoreManifest.updatedAtClient = Date.parse(now);
  configPatch.moduleStoreUpdatedAtClient = Date.parse(now);
}
const crewIds = ['lynnes-schiffsmannschaft', 'rhydians-schiffsmannschaft', 'parzifals-schiffsmannschaft'];
const crewsBefore = await Promise.all(crewIds.map(id => request(`/module_store_entries/${id}`)));
const summary = { module: RETINUE_ID, pages: entry.pages.length, newModule: moduleChanged, newProfiles: plan.entries.filter(item => item.create).length,
  existingProfiles: plan.entries.filter(item => !item.create).map(item => ({ name: RETINUE_PEOPLE.find(person => person.key === item.key).name, id: item.id, fields: Object.keys(item.patch || {}) })),
  configFields: Object.keys(configPatch), liveResourceWrites: 0, creaturesCreated: 0 };
await writeFile(new URL('release-plan.json', directory), JSON.stringify(summary, null, 2) + '\n');
if (!apply) { console.log(JSON.stringify({ dryRun: true, ...summary })); process.exit(0); }

// Verify that every referenced local portrait/scene is already deployed.
const artwork = new Set();
function collect(value) {
  if (typeof value === 'string' && /^(?:\.\/public\/assets\/|\.\.\/Stammbäume\/assets\/images\/)/.test(value)) artwork.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(entry);
for (const path of artwork) {
  const response = await fetch(new URL(path, 'https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html'), { signal: AbortSignal.timeout(30000) });
  assert(response.ok, `Bild noch nicht veröffentlicht: ${path}`);
  assert(Buffer.from(await response.arrayBuffer()).equals(await readFile(new URL(path, new URL('../../../AleriaAlmanach/AleriaAlmanach.html', import.meta.url)))), `Abweichendes Online-Bild: ${path}`);
}
await backupContentPublication('skallis-gefolge-2026-10-18', [configDocument, moduleDocument, ...documents, ...crewsBefore], plan.entries.filter(item => item.create).map(item => item.id), now);
const masks = new Map();
const writes = changed.map(item => {
  if (item.create) return { update: { name: documentName(`characters/${item.id}`), fields: encodeFirestoreFields(item.data) }, currentDocument: { exists: false } };
  const paths = Object.keys(item.patch).flatMap(key => ['identity', 'genealogy'].includes(key) ? Object.keys(item.patch[key]).map(field => `${key}.${field}`) : [key]);
  masks.set(item.id, paths);
  return { update: { name: documentName(`characters/${item.id}`), fields: encodeFirestoreFields(item.patch) }, updateMask: { fieldPaths: paths }, currentDocument: { updateTime: documents.find(raw => raw.name.endsWith('/' + item.id)).updateTime } };
});
if (moduleChanged) writes.push({ update: { name: documentName(`module_store_entries/${RETINUE_ID}`), fields: encodeFirestoreFields({ entryId: RETINUE_ID, moduleKind: 'override', entry: null, entryJson: JSON.stringify(entry), schemaVersion: 1, updatedAtClient: Date.parse(now) }) }, currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] });
if (Object.keys(configPatch).length) writes.push({ update: { name: configDocument.name, fields: encodeFirestoreFields(configPatch) }, updateMask: { fieldPaths: Object.keys(configPatch) }, currentDocument: { updateTime: configDocument.updateTime }, updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }] });
const committed = writes.length ? await request(':commit', { writes }) : {};
for (const item of plan.entries) {
  const after = decodeFirestoreFields((await request(`/characters/${item.id}`)).fields);
  if (item.create) assert.deepEqual(after, item.data);
  else {
    const { id, ...expected } = structuredClone(previous.find(character => character.id === item.id));
    for (const path of masks.get(item.id) || []) {
      const parts = path.split('.'); let target = expected, value = item.patch;
      for (const part of parts.slice(0, -1)) { target[part] ||= {}; target = target[part]; value = value[part]; }
      target[parts.at(-1)] = value[parts.at(-1)];
    }
    assert.deepEqual(after, expected, `Unbeteiligte Profildaten: ${item.key}`);
  }
}
const configAfter = decodeFirestoreFields((await request('/char_tabs/config')).fields);
const expectedConfig = { ...config, ...configPatch, moduleStoreUpdatedAt: configAfter.moduleStoreUpdatedAt };
assert.deepEqual(configAfter, expectedConfig, 'Unbeteiligte Konfiguration');
assert.equal((await request(`/module_store_entries/${RETINUE_ID}`)).fields.entryJson.stringValue, JSON.stringify(entry));
for (const [index, id] of crewIds.entries()) assert.deepEqual((await request(`/module_store_entries/${id}`)).fields, crewsBefore[index].fields, `Unveränderte Mannschaft: ${id}`);
const verification = { applied: true, committedAt: committed.commitTime || null, ...summary, verifiedArtwork: artwork.size, verifiedProfiles: plan.entries.length, preservedCrewModules: crewIds };
await writeFile(new URL('publication-verification.json', directory), JSON.stringify(verification, null, 2) + '\n');
console.log(JSON.stringify(verification));
