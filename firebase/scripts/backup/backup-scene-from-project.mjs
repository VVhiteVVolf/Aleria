// A point-in-time archive of an already captured project snapshot. Unlike
// endSceneSession, this does not end/reopen a scene or write any live turn.
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { decryptProjectBackup } from './project-backup-crypto.mjs';
import { decodeFirestoreFields } from './firestore-value-codec.mjs';
import { moduleFromStore } from '../../functions/src/backup/scene-backup-snapshot.js';
import { buildSceneBackupFiles, sceneBackupDirectory } from '../../functions/src/backup/scene-backup-format.js';
import { createSceneBackupGitHub } from '../../functions/src/backup/scene-backup-github.js';

const [filename, moduleId] = process.argv.slice(2);
if (!filename || !moduleId) throw new Error('Aufruf: backup-scene-from-project.mjs SICHERUNG MODUL-ID [--apply]');
const backup = await decryptProjectBackup(await readFile(filename));
const database = backup.firestore.find(database => database.databaseId === '(default)');
const documents = database.documents.map(document => ({ path: document.name.split('/documents/')[1], data: decodeFirestoreFields(document.fields || {}) }));
const config = documents.find(document => document.path === 'char_tabs/config')?.data;
const stored = documents.find(document => document.path === `module_store_entries/${moduleId}`)?.data;
if (!stored) throw new Error('Das Modul fehlt im gesicherten Online-Modulbestand.');
const entry = stored.entryJson ? JSON.parse(stored.entryJson) : stored.entry;
const captured = moduleFromStore(config, stored, { type: 'aleria-module', version: 2, entry, section: { key: 'szenen' } });
if (captured.moduleSource === 'browser-export') throw new Error('Das Modul ist nicht im gesicherten Manifest registriert.');
const page = entry.pages.findIndex(page => page.sessionPage);
const threadId = `${moduleId}::session:${entry.pages[page].commentThreadKey || page}`;
const comments = documents.filter(document => document.path.startsWith('comments/') && document.path.split('/').length === 2).map(document => ({ ...document.data, id: document.path.split('/')[1] }));
const turns = documents.filter(document => document.path.startsWith('comment_turns/')).map(document => ({ ...document.data, id: document.path.split('/')[1], threadId: document.path.split('/')[1] }));
const backupId = `snapshot-${randomUUID()}`;
const result = buildSceneBackupFiles({ ...captured, comments, turns, threadId, backupId, requestedAt: backup.startedAt, capturedAt: backup.startedAt, moduleSource: `${captured.moduleSource}; manueller Sicherungsstand ohne Sitzungsabschluss` });
const exported = JSON.parse(result.files.find(file => file.path === 'comments.json').content);
// Exercise the actual browser importer, without writing/importing into Firebase.
const context = vm.createContext({ cloneForBackup: value => structuredClone(value) });
vm.runInContext(await readFile('AleriaAlmanach/modules/comments/comments-session-io.js', 'utf8'), context);
const imported = context.getImportableThreadsFromPayload(exported);
if (imported.reduce((count, thread) => count + thread.comments.length, 0) !== exported.comments.length) throw new Error('Kommentar-Rückleseprüfung fehlgeschlagen.');
const byId = (a, b) => a.id.localeCompare(b.id);
if (JSON.stringify(imported.flatMap(thread => thread.comments).sort(byId)) !== JSON.stringify([...exported.comments].sort(byId))) throw new Error('Der Browserimport verändert Kommentardaten.');
const directory = sceneBackupDirectory(moduleId, backupId, backup.startedAt);
let receipt = null;
if (process.argv.includes('--apply')) {
  const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', windowsHide: true }).trim();
  receipt = await createSceneBackupGitHub({ token, repository: 'VVhiteVVolf/Aleria', branch: 'master' }).commitBackup({ directory, files: result.files, backupId, moduleTitle: entry.title });
  for (const file of result.files) {
    const response = await fetch(`https://raw.githubusercontent.com/VVhiteVVolf/Aleria/${receipt.commitSha}/${directory}/${file.path}`, { signal: AbortSignal.timeout(60000) });
    if (!response.ok || createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex') !== createHash('sha256').update(file.content).digest('hex')) throw new Error('GitHub-Rückleseprüfung fehlgeschlagen.');
  }
}
const report = { applied: !!receipt, ...result.summary, directory, receipt, files: result.files.map(file => ({ path: file.path, bytes: Buffer.byteLength(file.content) })), browserImportVerified: true, githubReadbackVerified: !!receipt, liveDocumentsWritten: 0 };
await writeFile(`${filename}.scene-report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
