// One-time, optimistic migration. Uses the existing Firebase CLI login; no keys.
// Dry run by default. --apply requires a backup outside the published tree.
import { createRequire } from 'node:module';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMaximumHitPoints, upgradeCharacterHitPoints } from '../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { mergeOnlineAndLocalCharacter } from '../../../CharakterDatenbank/assets/js/character-database-client.mjs';
const require = createRequire(new URL('../../package.json', import.meta.url));
const auth = require('firebase-tools/lib/auth.js');
const projectId = 'aleriaprojekt';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const account = auth.getProjectDefaultAccount(projectRoot);
if (!account?.tokens?.refresh_token) throw new Error('Firebase CLI: bitte zuerst anmelden.');
const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const database = `projects/${projectId}/databases/(default)`;
const base = `https://firestore.googleapis.com/v1/${database}`;
async function request(path, body) {
  const response = await fetch(`${base}${path}`, { method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore ${response.status}: ${(await response.json()).error?.message}`);
  return response.json();
}
function decode(value) {
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decode(item)]));
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('integerValue' in value) return Number(value.integerValue);
  return value.stringValue ?? value.doubleValue ?? value.booleanValue ?? value.timestampValue ?? null;
}
function encode(value) {
  if (value == null) return { nullValue: null };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)])) } };
}
const documents = [];
let pageToken = '';
do {
  const page = await request(`/documents/characters?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`);
  documents.push(...(page.documents || [])); pageToken = page.nextPageToken || '';
} while (pageToken);
const backup = resolve(projectRoot, '.codex-temp', `character-vitality-${Date.now()}.json`);
await mkdir(dirname(backup), { recursive: true });
await writeFile(backup, JSON.stringify(documents, null, 2));
const report = [];
const writes = [];
const localCharacters = JSON.parse(await readFile(resolve(projectRoot, 'CharakterDatenbank/generated/characters.snapshot.json'), 'utf8')).characters;
for (const document of documents) {
  const data = decode({ mapValue: { fields: document.fields } });
  const id = document.name.split('/').at(-1);
  const matches = localCharacters.filter(record => record.id === id || record.localRecord?.firestoreDocumentIds?.includes(id)
    || (record.identity?.worldPersonId && record.identity.worldPersonId === data.identity?.worldPersonId));
  const local = matches.length === 1 ? matches[0] : null;
  const profile = data.combatProfile || {};
  if (!Object.keys(profile).length && !local?.combatProfile) continue;
  const lockPath = `/documents/combat_profile_locks/characters/records/${id}`;
  const lock = await request(lockPath);
  const locked = decode({ mapValue: { fields: lock?.fields || {} } }).activeEncounterKeys?.length > 0;
  const upgradedOnline = Object.keys(profile).length ? { ...profile, hitPoints: upgradeCharacterHitPoints(profile).hitPoints } : null;
  const merged = local ? mergeOnlineAndLocalCharacter({ ...data, combatProfile: upgradedOnline }, local) : { ...data, combatProfile: upgradedOnline };
  const next = upgradeCharacterHitPoints(merged.combatProfile);
  const completeProfile = !!local?.combatProfile && (!Object.keys(profile).length
    || Number(local.combatProfile.classTraining?.schemaVersion || 0) > Number(profile.classTraining?.schemaVersion || 0));
  report.push({ id, name: data.name, before: getMaximumHitPoints(profile), after: getMaximumHitPoints(next), current: next.hitPoints.current, locked, migrated: !!profile.hitPoints?.vitality,
    completeProfile, levelBefore: profile.progression?.level || 1, levelAfter: next.progression.level });
  if ((profile.hitPoints?.vitality && !completeProfile) || locked) continue;
  // Fill missing or older training profiles using the same merge as the frontend.
  // Established profiles receive only HP and a revision, retaining all custom data.
  const revision = Math.max(Date.now(), Number(profile.revision || 0) + 1, Number(data.inventory?.revision || 0) + 1);
  const fields = { combatProfile: encode(completeProfile ? { ...merged.combatProfile, ...next, revision } : { hitPoints: next.hitPoints, revision }) };
  const fieldPaths = completeProfile ? ['combatProfile'] : ['combatProfile.hitPoints', 'combatProfile.revision'];
  if (completeProfile && !data.inventory && local?.inventory) { fields.inventory = encode({ ...local.inventory, revision }); fieldPaths.push('inventory'); }
  writes.push({ update: { name: document.name, fields }, updateMask: { fieldPaths }, currentDocument: { updateTime: document.updateTime } });
  // Abort if a combat starts between the lock read and the migration commit.
  writes.push({ verify: `${database}${lockPath}`, currentDocument: lock ? { updateTime: lock.updateTime } : { exists: false } });
}
console.log(JSON.stringify({ backup, total: documents.length, profiles: report, pending: writes.length / 2 }, null, 2));
if (process.argv.includes('--apply') && writes.length) {
  if (writes.length > 450) throw new Error('Mehr als 225 Änderungen: Migration vor dem Anwenden in kleinere Gruppen aufteilen.');
  await request('/documents:commit', { writes });
  console.log(`${writes.length / 2} Charakterbögen atomar migriert.`);
}
