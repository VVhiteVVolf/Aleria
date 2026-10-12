import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { encryptProjectBackup, decryptProjectBackup } from './project-backup-crypto.mjs';
import { createGoogleBackupReader } from './project-backup-source.mjs';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = fileURLToPath(new URL('../../../', import.meta.url));
const project = 'aleriaprojekt';

export async function captureProjectBackup() {
  const auth = require('firebase-tools/lib/auth.js');
  const account = auth.getProjectDefaultAccount(root);
  if (!account?.tokens?.refresh_token) throw new Error('Vorhandene Firebase-CLI-Anmeldung fehlt.');
  const access = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  const reader = createGoogleBackupReader({ accessToken: access.access_token, project });
  const startedAt = new Date().toISOString();
  const databases = await reader.request(`https://firestore.googleapis.com/v1/projects/${project}/databases`);
  const firestore = [];
  for (const database of databases.databases || []) {
    firestore.push(await reader.firestore(database.name.split('/').at(-1), startedAt, progress => console.log(JSON.stringify(progress))));
  }
  const [users, storage, authConfiguration] = await Promise.all([
    reader.users(), reader.bucket('aleriaprojekt.firebasestorage.app'),
    reader.request(`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`)
  ]);
  const configPaths = ['firebase.json', '.firebaserc', 'firebase/firestore.rules', 'firebase/firestore.family-trees.rules', 'firebase/firestore.indexes.json', 'firebase/firestore.family-trees.indexes.json', 'firebase/storage.rules'];
  const configuration = Object.fromEntries(await Promise.all(configPaths.map(async name => [name, await readFile(path.join(root, name), 'utf8')])));
  return { type: 'aleria-private-project-snapshot', version: 1, project, startedAt, finishedAt: new Date().toISOString(),
    repositoryCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim(),
    firestore, auth: { users, configuration: Object.fromEntries(['signIn', 'authorizedDomains', 'passwordPolicyConfig', 'emailPrivacyConfig'].filter(key => authConfiguration[key] !== undefined).map(key => [key, authConfiguration[key]])) }, storage: [storage], configuration,
    scope: { firestore: 'Alle vorhandenen Datenbanken und rekursiven Untercollections, ein gemeinsamer Lesezeitpunkt.',
      auth: 'Nutzerexport einschließlich UID, Provider und vorhandener Custom Claims; Aufnahmezeit innerhalb des Sicherungsfensters.',
      storage: 'App-Bucket einschließlich vorhandener Objektgenerationen; Functions-Quellpakete und Container stehen separat im Repository/Deployment.',
      excluded: 'GitHub-/Google-Zugangstokens, Secret-Manager-Inhalte, Zahlungsmethoden und externe Bildanbieter werden nicht exportiert.' } };
}

export function projectBackupSummary(payload) {
  return { project: payload.project, startedAt: payload.startedAt, finishedAt: payload.finishedAt,
    databases: payload.firestore.map(item => ({ id: item.databaseId, documents: item.documents.length, collections: Object.keys(item.collections).length })),
    users: payload.auth.users.length, storageObjects: payload.storage.reduce((sum, bucket) => sum + bucket.objects.length, 0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = await captureProjectBackup();
  const archive = await encryptProjectBackup(payload);
  const verified = await decryptProjectBackup(archive);
  if (JSON.stringify(verified) !== JSON.stringify(payload)) throw new Error('Rückleseprüfung fehlgeschlagen.');
  const directory = path.join(root, '.private-backups'); await mkdir(directory, { recursive: true });
  const filename = `aleriaprojekt-${payload.startedAt.replace(/[:.]/g, '-')}.aleria-backup`;
  await writeFile(path.join(directory, filename), archive, { flag: 'wx' });
  const summary = { ...projectBackupSummary(verified), file: filename, encryptedBytes: archive.length, encryptionVerified: true,
    keyProtection: 'Windows-Benutzerkonto dieses Computers; für andere Computer ist eine getrennte Schlüsselübergabe nötig.' };
  await writeFile(path.join(directory, `${filename}.summary.json`), `${JSON.stringify(summary, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify(summary));
}
