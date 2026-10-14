// Explicit publication of the two new brewery modules. Dry run by default.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { encryptProjectBackup } from '../backup/project-backup-crypto.mjs';
import { buildSchwarzdorn } from '../../../AleriaAlmanach/modules/brewer-guilds/schwarzdorn-model.mjs';
import { buildGoldenglanz } from '../../../AleriaAlmanach/modules/brewer-guilds/goldenglanz-model.mjs';
import { buildModuleOffers } from '../../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import { resolveModuleProduct } from '../../functions/src/mechanics/item-register-module-source.js';
import { STANDARD_ITEMS } from '../../functions/src/generated/item-register/item-register-standard.js';

const require = createRequire(new URL('../../package.json', import.meta.url));
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getProjectDefaultAccount(process.cwd());
const access = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const database = 'projects/aleriaprojekt/databases/(default)';
const root = `https://firestore.googleapis.com/v1/${database}/documents`;
const headers = { Authorization: `Bearer ${access.access_token}`, 'x-goog-user-project': 'aleriaprojekt', 'Content-Type': 'application/json' };
const sources = new URL('../../../AleriaAlmanach/modules/brewer-guilds/sources/', import.meta.url);
const source = async name => JSON.parse(await readFile(new URL(`${name}.json`, sources), 'utf8'));
const entries = [buildSchwarzdorn(await source('schwarzdorn')), buildGoldenglanz(await source('goldenglanz'))];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function request(path, body) {
  const response = await fetch(root + path, { method: body ? 'POST' : 'GET', headers, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  if (response.status === 404 && !body) return null;
  if (!response.ok) throw new Error(`Brauereiveröffentlichung: HTTP ${response.status}`);
  return response.json();
}

const config = await request('/char_tabs/config');
assert(config?.fields?.moduleStoreManifest?.mapValue, 'Das Modulmanifest fehlt.');
const manifest = config.fields.moduleStoreManifest.mapValue.fields;
const oldIds = manifest.entryOverrideIds?.arrayValue?.values || [];
const ids = [...new Set([...oldIds.map(value => value.stringValue), ...entries.map(entry => entry.id)])];
const documents = await Promise.all(entries.map(entry => request(`/module_store_entries/${entry.id}`)));
entries.forEach((entry, index) => {
  assert(!manifest.hiddenModuleIds?.mapValue?.fields?.[entry.id]?.booleanValue, `${entry.id} ist ausgeblendet.`);
  if (documents[index]) assert.equal(documents[index].fields.entryJson?.stringValue, JSON.stringify(entry), `${entry.id} besitzt eine abweichende Online-Bearbeitung. Zuerst gezielt abgleichen.`);
});

// Validate the exact prospective catalog without purchasing or touching a character.
const prospective = new Map([
  ['char_tabs/config', { moduleStoreManifest: { entryOverrideIds: ids, hiddenModuleIds: {} } }],
  ...entries.map(entry => [`module_store_entries/${entry.id}`, { entryJson: JSON.stringify(entry) }])
]);
const db = { doc: path => path, collection: name => ({ doc: id => `${name}/${id}` }) };
const transaction = { get: async path => ({ data: () => prospective.get(path) }) };
const offers = buildModuleOffers(entries, STANDARD_ITEMS);
assert.equal(offers.length, 30);
for (const offer of offers) {
  const resolved = await resolveModuleProduct({ database: db, transaction, input: { action: 'buy', moduleId: offer.moduleId, productId: offer.id, sourceRevision: offer.sourceRevision }, standards: STANDARD_ITEMS });
  assert.equal(resolved.id, offer.id);
}
const missing = entries.filter((entry, index) => !documents[index]);
const summary = { modules: entries.map(entry => entry.id), newModules: missing.length, validatedOffers: offers.length };
if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ dryRun: true, ...summary })); process.exit(0); }

// Assets must be live before the shared module store begins referencing them.
const assets = new Set();
function collect(value) {
  if (typeof value === 'string' && value.startsWith('./public/assets/brewer-guilds/')) assets.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
entries.forEach(collect);
for (const asset of assets) {
  const response = await fetch(`https://dieweltvonaleria.netlify.app/AleriaAlmanach/${asset.slice(2)}?aldrimar-release=20261014`, { signal: AbortSignal.timeout(30000) });
  assert(response.ok, `Bild noch nicht online: ${asset}`);
  assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(await readFile(new URL(`../../../AleriaAlmanach/${asset.slice(2)}`, import.meta.url))), asset);
}
if (!missing.length && ids.length === oldIds.length) { console.log(JSON.stringify({ alreadyPublished: true, ...summary })); process.exit(0); }

const now = new Date().toISOString(), millis = { integerValue: String(Date.parse(now)) };
const backup = new URL('../../../.private-backups/', import.meta.url);
await mkdir(backup, { recursive: true });
await writeFile(new URL(`aldrimar-breweries-${now.replace(/[:.]/g, '-')}.aleria-backup`, backup), await encryptProjectBackup({ type: 'aleria-content-before-publication', capturedAt: now, documents: [...documents, config] }), { flag: 'wx' });
const writes = missing.map(entry => ({
  update: { name: `${database}/documents/module_store_entries/${entry.id}`, fields: { entryId: { stringValue: entry.id }, moduleKind: { stringValue: 'override' }, entry: { nullValue: null }, entryJson: { stringValue: JSON.stringify(entry) }, schemaVersion: { integerValue: '1' }, updatedAtClient: millis } },
  currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }]
}));
writes.push({
  update: { name: config.name, fields: { moduleStoreManifest: { mapValue: { fields: { entryOverrideIds: { arrayValue: { values: ids.map(id => ({ stringValue: id })) } }, updatedAtClient: millis } } }, moduleStoreUpdatedAtClient: millis } },
  updateMask: { fieldPaths: ['moduleStoreManifest.entryOverrideIds', 'moduleStoreManifest.updatedAtClient', 'moduleStoreUpdatedAtClient'] },
  currentDocument: { updateTime: config.updateTime }, updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }]
});
await request(':commit', { writes });
for (const entry of entries) assert.equal((await request(`/module_store_entries/${entry.id}`)).fields.entryJson.stringValue, JSON.stringify(entry));
const afterConfig = (await request('/char_tabs/config')).fields;
const control = structuredClone(afterConfig);
control.moduleStoreManifest.mapValue.fields.entryOverrideIds = manifest.entryOverrideIds;
control.moduleStoreManifest.mapValue.fields.updatedAtClient = manifest.updatedAtClient;
control.moduleStoreUpdatedAtClient = config.fields.moduleStoreUpdatedAtClient;
control.moduleStoreUpdatedAt = config.fields.moduleStoreUpdatedAt;
assert.deepEqual(control, config.fields, 'Andere Konfigurationsfelder wurden verändert.');
console.log(JSON.stringify({ applied: true, ...summary, verifiedAssets: assets.size, characterOrCombatWrites: 0 }));
