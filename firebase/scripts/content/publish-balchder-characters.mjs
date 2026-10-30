import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { BALCHDER_PROFILE_IDS, planBalchderCharacters } from './balchder-character-plan.mjs';

const root = new URL('../../../', import.meta.url);
const directory = new URL('.tmp/balchder-character-publication/', root);
const evidence = new URL('AleriaAlmanach/assets/biographies/balchder-vertragsstube/2026-10-30/', root);
const save = (url, value) => writeFile(url, JSON.stringify(value, null, 2) + '\n');
const exports = await Promise.all(BALCHDER_PROFILE_IDS.map(id => readFile(new URL(`Charakter Archiv Exporte/balchder-vertragsstube-2026-10-29/${id}.json`, root), 'utf8').then(JSON.parse)));
const client = await createContentPublicationClient();
const names = new Set(exports.map(e => e.character.name));
const worldIds = new Set(exports.map(e => e.character.id));
const query = await client.request(':runQuery', { structuredQuery: { from: [{ collectionId: 'characters' }],
  select: { fields: ['name', 'identity', 'genealogy.worldPersonId'].map(fieldPath => ({ fieldPath })) } } });
const selected = query.filter(r => r.document).map(r => ({ id: r.document.name.split('/').at(-1), ...decodeFirestoreFields(r.document.fields) }))
  .filter(p => names.has(p.name) || worldIds.has(p.id) || worldIds.has(p.identity?.worldPersonId) || worldIds.has(p.genealogy?.worldPersonId));
const documents = await Promise.all(selected.map(p => client.request('/characters/' + encodeURIComponent(p.id))));
const existingCharacters = documents.map(raw => ({ id: raw.name.split('/').at(-1), ...decodeFirestoreFields(raw.fields) }));
const configDocument = await client.request('/char_tabs/config');
assert(configDocument, 'Die bestehende Charaktergruppen-Konfiguration fehlt.');
const config = decodeFirestoreFields(configDocument.fields);
const now = new Date().toISOString();
const plan = planBalchderCharacters({ records: ['haus-balchder', 'haus-gelyn'].map(getRegisteredFamily), exports, existingCharacters, config, now });
const configPatch = Object.fromEntries(Object.entries(plan.config).filter(([key, value]) => !isDeepStrictEqual(value, config[key])));
const changed = plan.entries.filter(e => e.create || e.patch);
await mkdir(directory, { recursive: true });
await save(new URL('plan-summary.json', directory), { profiles: plan.entries.map(e => ({ id: e.id, create: e.create, fields: Object.keys(e.data || e.patch || {}) })), configFields: Object.keys(configPatch) });
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ dryRun: true, newProfiles: plan.entries.filter(e => e.create).length, changedProfiles: changed.length, configFields: Object.keys(configPatch) }));
} else {
  await backupContentPublication('balchder-biographies-20261030', [...documents, configDocument], plan.entries.filter(e => e.create).map(e => 'characters/' + e.id), now);
  const writes = changed.map(entry => ({ update: { name: client.documentName('characters/' + entry.id), fields: encodeFirestoreFields(entry.create ? entry.data : entry.patch) },
    ...(entry.create ? { currentDocument: { exists: false } } : {
      updateMask: { fieldPaths: Object.keys(entry.patch).map(key => key === 'genealogy' ? 'genealogy.sources' : key) },
      currentDocument: { updateTime: documents.find(raw => raw.name.endsWith('/' + entry.id)).updateTime }
    }) }));
  if (Object.keys(configPatch).length) writes.push({ update: { name: configDocument.name, fields: encodeFirestoreFields(configPatch) },
    updateMask: { fieldPaths: Object.keys(configPatch) }, currentDocument: { updateTime: configDocument.updateTime } });
  const commit = writes.length ? await client.request(':commit', { writes }) : null;
  const after = await Promise.all(plan.entries.map(async entry => {
    const document = await client.request('/characters/' + encodeURIComponent(entry.id));
    const data = decodeFirestoreFields(document.fields);
    if (entry.create) assert.deepEqual(data, entry.data);
    else {
      const prior = documents.find(raw => raw.name === document.name);
      const control = structuredClone(document.fields);
      for (const key of Object.keys(entry.patch || {})) {
        if (key === 'genealogy') {
          assert.deepEqual(data.genealogy.sources, entry.patch.genealogy.sources);
          if (prior.fields.genealogy?.mapValue.fields.sources) control.genealogy.mapValue.fields.sources = prior.fields.genealogy.mapValue.fields.sources;
          else delete control.genealogy.mapValue.fields.sources;
          if (!prior.fields.genealogy) delete control.genealogy;
        } else {
          assert.deepEqual(data[key], entry.patch[key], key);
          if (prior.fields[key]) control[key] = prior.fields[key]; else delete control[key];
        }
      }
      assert.deepEqual(control, prior.fields, 'Unbeteiligte Felder und Firestore-Typen: ' + entry.id);
    }
    return { id: entry.id, ...data };
  }));
  const afterConfig = decodeFirestoreFields((await client.request('/char_tabs/config')).fields);
  assert.deepEqual(afterConfig, { ...config, ...configPatch }, 'Unbeteiligte Konfiguration');
  await mkdir(evidence, { recursive: true });
  for (const character of after) {
    const slug = BALCHDER_PROFILE_IDS.find(id => character.identity?.worldPersonId === `person--haus-balchder--${id}`);
    assert(slug, 'Unerwartete Weltperson');
    const { ownerUid, createdBy, ...publicCharacter } = character;
    await save(new URL(`Charakter Archiv Exporte/${slug}-veroeffentlicht-2026-10-30.json`, root), {
      type: 'aleria-character', version: 3, mergeStrategy: 'replace-exported-fields', assignedTab: 'Gwynthor',
      exportedAt: character.updatedAt, character: publicCharacter });
  }
  await save(new URL('publication-verification.json', evidence), {
    publishedAt: commit?.commitTime || now, profiles: after.map(c => ({ id: c.id, name: c.name, biography: !!c.biography?.biography?.biographyText })),
    newProfiles: plan.entries.filter(e => e.create).length, existingFieldsPreserved: true, liveResourceWrites: 0, group: 'Gwynthor', subgroup: 'Gwynthor - Haus Balchder' });
  await save(new URL('published-group.json', directory), { charTabs: Object.fromEntries(Object.keys(plan.config).map(key => [key, afterConfig[key]])) });
  console.log(JSON.stringify({ applied: true, profiles: after.map(c => ({ id: c.id, name: c.name, biography: !!c.biography })), newProfiles: plan.entries.filter(e => e.create).length, existingFieldsPreserved: true, liveResourceWrites: 0 }));
}
