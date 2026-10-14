// Explicit, bounded content publication. Never runs from a page renderer or loader.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { encryptProjectBackup } from '../backup/project-backup-crypto.mjs';
import { completeKrummeKanne, KANNE_MODULE_ID } from '../../../AleriaAlmanach/modules/krumme-kanne/krumme-kanne-module.mjs';

const require = createRequire(new URL('../../package.json', import.meta.url));
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getProjectDefaultAccount(process.cwd());
const access = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const root = 'https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents';
const headers = { Authorization: `Bearer ${access.access_token}`, 'x-goog-user-project': 'aleriaprojekt', 'Content-Type': 'application/json' };
const source = new URL('../../../AleriaAlmanach/modules/krumme-kanne/source/', import.meta.url);
const json = async name => JSON.parse(await readFile(new URL(name, source), 'utf8'));
const original = await json('module-before-editorial.json');
const next = completeKrummeKanne(original, await Promise.all(['teyrngarch.json', 'penderyn.json'].map(json)));
const entryJson = JSON.stringify(next);
const hash = value => createHash('sha256').update(value).digest('hex');
const projectName = url => url.split('/v1/')[1];
async function request(url, body) {
  const r = await fetch(url, { method: body ? 'POST' : 'GET', headers, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Krumme-Kanne-Veröffentlichung: HTTP ${r.status}`);
  return r.json();
}
const url = `${root}/module_store_entries/${KANNE_MODULE_ID}`;
const current = await request(url);
const data = decodeFirestoreFields(current.fields);
const currentEntry = data.entry || JSON.parse(data.entryJson);
if (JSON.stringify(currentEntry) === entryJson) {
  console.log(JSON.stringify({ alreadyPublished: true, id: KANNE_MODULE_ID, sha256: hash(entryJson) }));
  process.exit(0);
}
if (JSON.stringify(currentEntry) !== JSON.stringify(original)) throw new Error('Das Online-Modul wurde seit der Aufnahme geändert. Neue Änderungen zuerst abgleichen.');
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ dryRun: true, id: KANNE_MODULE_ID, pages: next.pages.length, tabs: next.pages[2].hierarchy.trees.length, fields: ['entry', 'entryJson', 'updatedAtClient', 'updatedAt'], otherModulesWritten: 0, commentsWritten: 0, sha256: hash(entryJson) }));
  process.exit(0);
}

// Publish the static files first. Every newly referenced image must be available
// and byte-identical before the online module starts referring to it.
const assets = new Set();
function collect(value) {
  if (typeof value === 'string' && value.startsWith('./assets/krumme-kanne/')) assets.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(next);
for (const path of assets) {
  const r = await fetch(`https://dieweltvonaleria.netlify.app/AleriaAlmanach/${path.slice(2)}`, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Bild noch nicht veröffentlicht: ${path}`);
  const online = Buffer.from(await r.arrayBuffer());
  const local = await readFile(new URL(`../../../AleriaAlmanach/${path.slice(2)}`, import.meta.url));
  if (hash(online) !== hash(local)) throw new Error(`Bild weicht vom geprüften Stand ab: ${path}`);
}
const configUrl = `${root}/char_tabs/config`;
const config = await request(configUrl);
const now = new Date().toISOString();
const millis = Date.parse(now);
const backupDir = new URL('../../../.private-backups/', import.meta.url);
await mkdir(backupDir, { recursive: true });
await writeFile(new URL(`krumme-kanne-${now.replace(/[:.]/g, '-')}.aleria-backup`, backupDir), await encryptProjectBackup({ type: 'aleria-content-before-publication', capturedAt: now, documents: [current, config] }), { flag: 'wx' });
const ms = { integerValue: String(millis) }, timestamp = { timestampValue: now };
await request(`${root}:commit`, { writes: [
  { update: { name: projectName(url), fields: { entry: { nullValue: null }, entryJson: { stringValue: entryJson }, updatedAtClient: ms, updatedAt: timestamp } }, updateMask: { fieldPaths: ['entry', 'entryJson', 'updatedAtClient', 'updatedAt'] }, currentDocument: { updateTime: current.updateTime } },
  { update: { name: projectName(configUrl), fields: { moduleStoreManifest: { mapValue: { fields: { updatedAtClient: ms } } }, moduleStoreUpdatedAtClient: ms, moduleStoreUpdatedAt: timestamp } }, updateMask: { fieldPaths: ['moduleStoreManifest.updatedAtClient', 'moduleStoreUpdatedAtClient', 'moduleStoreUpdatedAt'] }, currentDocument: { updateTime: config.updateTime } }
] });
const after = decodeFirestoreFields((await request(url)).fields);
if (after.entry !== null || after.entryJson !== entryJson) throw new Error('Rückleseprüfung des Moduls fehlgeschlagen.');
for (const key of ['entryId', 'moduleKind', 'section', 'sectionIndex', 'entryIndex', 'schemaVersion'])
  if (!isDeepStrictEqual(after[key], data[key])) throw new Error(`Modulmetadaten verändert: ${key}`);
console.log(JSON.stringify({ applied: true, id: KANNE_MODULE_ID, pages: next.pages.length, tabs: next.pages[2].hierarchy.trees.length, verifiedAssets: assets.size, otherModulesWritten: 0, commentsWritten: 0, characterOrCombatWrites: 0, sha256: hash(entryJson) }));
