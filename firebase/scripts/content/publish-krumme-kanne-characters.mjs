// Explicit publication of this household; no runtime migration or name-only matching.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { encryptProjectBackup } from '../backup/project-backup-crypto.mjs';
import { planKanneCharacters } from '../../../AleriaAlmanach/modules/krumme-kanne/krumme-kanne-characters.mjs';

const require = createRequire(new URL('../../package.json', import.meta.url));
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getProjectDefaultAccount(process.cwd());
const access = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const root = 'https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents';
const headers = { Authorization: `Bearer ${access.access_token}`, 'x-goog-user-project': 'aleriaprojekt', 'Content-Type': 'application/json' };
async function request(path, body) {
  const response = await fetch(`${root}${path}`, { method: body ? 'POST' : 'GET', headers,
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Kanne-Charakterverzeichnis: HTTP ${response.status}`);
  return response.json();
}
function value(input) {
  if (input === null) return { nullValue: null };
  if (Array.isArray(input)) return { arrayValue: { values: input.map(value) } };
  if (typeof input === 'object') return { mapValue: { fields: fields(input) } };
  if (typeof input === 'boolean') return { booleanValue: input };
  if (typeof input === 'string') return { stringValue: input };
  if (typeof input === 'number' && Number.isFinite(input)) return Number.isInteger(input) ? { integerValue: String(input) } : { doubleValue: input };
  throw new Error('Nicht unterstütztes Profilfeld');
}
const fields = input => Object.fromEntries(Object.entries(input).map(([key, entry]) => [key, value(entry)]));
const now = new Date().toISOString();
const blank = planKanneCharacters([], {}, now);
const listing = [];
let token = '';
do {
  const page = await request(`/characters?pageSize=1000&mask.fieldPaths=identity&mask.fieldPaths=genealogy.worldPersonId${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`);
  listing.push(...(page.documents || []).map(raw => ({ id: raw.name.split('/').at(-1), ...decodeFirestoreFields(raw.fields || {}) })));
  token = page.nextPageToken || '';
} while (token);
const targetIds = new Set(blank.entries.map(e => e.id));
const related = listing.filter(c => targetIds.has(c.id) || targetIds.has(c.identity?.worldPersonId || c.genealogy?.worldPersonId));
const documents = await Promise.all(related.map(c => request(`/characters/${encodeURIComponent(c.id)}`)));
const existing = documents.map(raw => ({ id: raw.name.split('/').at(-1), ...decodeFirestoreFields(raw.fields) }));
const configDocument = await request('/char_tabs/config');
const config = decodeFirestoreFields(configDocument.fields);
const plan = planKanneCharacters(existing, config, now);
const archive = new URL('../../../Charakter Archiv Exporte/Module/Krumme Kanne/krumme-kanne-character-plan.json', import.meta.url);
await writeFile(archive, JSON.stringify({ schemaVersion: 1, createdAt: now, group: 'Die Krumme Kanne', entries: plan.entries }, null, 2) + '\n');
const changes = plan.entries.filter(e => e.create || e.patch);
const configChanged = Object.keys(plan.config).some(key => !isDeepStrictEqual(plan.config[key], config[key]));
const summary = { newProfiles: plan.entries.filter(e => e.create).length, linkedProfiles: plan.entries.filter(e => !e.create).length,
  profileWrites: changes.length, totalMembers: plan.entries.length, groups: plan.config.subtabs['Die Krumme Kanne'], configChanged };
if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ dryRun: true, ...summary })); process.exit(0); }
if (!changes.length && !configChanged) { console.log(JSON.stringify({ alreadyPublished: true, ...summary })); process.exit(0); }

for (const entry of plan.entries.filter(e => e.create)) {
  const path = entry.data.portrait;
  if (!path.startsWith('./assets/krumme-kanne/')) continue;
  const response = await fetch(`https://dieweltvonaleria.netlify.app/AleriaAlmanach/${path.slice(2)}`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !Buffer.from(await response.arrayBuffer()).equals(await readFile(new URL(`../../../AleriaAlmanach/${path.slice(2)}`, import.meta.url)))) throw new Error(`Profilporträt noch nicht veröffentlicht: ${entry.key}`);
}
const backupDir = new URL('../../../.private-backups/', import.meta.url);
await mkdir(backupDir, { recursive: true });
await writeFile(new URL(`kanne-characters-${now.replace(/[:.]/g, '-')}.aleria-backup`, backupDir),
  await encryptProjectBackup({ type: 'aleria-characters-before-publication', capturedAt: now, newIds: plan.entries.filter(e => e.create).map(e => e.id), documents: [...documents, configDocument] }), { flag: 'wx' });
const database = root.split('/v1/')[1];
const writes = changes.map(entry => entry.create ? {
  update: { name: `${database}/characters/${entry.id}`, fields: fields(entry.data) }, currentDocument: { exists: false }
} : {
  update: { name: `${database}/characters/${entry.id}`, fields: fields(entry.patch) },
  updateMask: { fieldPaths: ['genealogy.sources', 'updatedAt'] },
  currentDocument: { updateTime: documents.find(raw => raw.name.endsWith(`/${entry.id}`)).updateTime }
});
if (configChanged) writes.push({ update: { name: configDocument.name, fields: fields(plan.config) },
  updateMask: { fieldPaths: Object.keys(plan.config) }, currentDocument: { updateTime: configDocument.updateTime } });
await request(':commit', { writes });
const after = await Promise.all(plan.entries.map(e => request(`/characters/${encodeURIComponent(e.id)}`)));
for (const raw of after) {
  const entry = plan.entries.find(e => raw.name.endsWith(`/${e.id}`));
  if (entry.create) {
    if (!isDeepStrictEqual(decodeFirestoreFields(raw.fields), entry.data)) throw new Error(`Profil-Rückleseprüfung: ${entry.key}`);
  } else {
    const priorFields = documents.find(d => d.name === raw.name).fields;
    // Compare raw values, preserving timestamps, inventory and all unrelated fields exactly.
    for (const key of Object.keys(priorFields).filter(k => !['genealogy', 'updatedAt'].includes(k)))
      if (!isDeepStrictEqual(raw.fields[key], priorFields[key])) throw new Error(`Bestehendes Profil verändert: ${entry.key}/${key}`);
    const beforeGenealogy = priorFields.genealogy?.mapValue?.fields || {};
    const afterGenealogy = raw.fields.genealogy?.mapValue?.fields || {};
    for (const key of Object.keys(beforeGenealogy).filter(k => k !== 'sources'))
      if (!isDeepStrictEqual(afterGenealogy[key], beforeGenealogy[key])) throw new Error(`Bestehende Genealogie verändert: ${entry.key}/${key}`);
  }
}
const afterConfig = decodeFirestoreFields((await request('/char_tabs/config')).fields);
for (const key of Object.keys(config).filter(key => !Object.hasOwn(plan.config, key)))
  if (!isDeepStrictEqual(afterConfig[key], config[key])) throw new Error(`Unbeteiligte Registerkonfiguration verändert: ${key}`);
for (const [key, data] of Object.entries(plan.config)) if (!isDeepStrictEqual(afterConfig[key], data)) throw new Error(`Register-Rückleseprüfung: ${key}`);
console.log(JSON.stringify({ applied: true, ...summary, verifiedProfiles: after.length }));
