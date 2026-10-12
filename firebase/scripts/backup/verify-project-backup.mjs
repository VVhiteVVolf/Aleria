import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { decryptProjectBackup } from './project-backup-crypto.mjs';
import { projectBackupSummary } from './backup-project.mjs';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key,
    key === 'timestampValue' ? String(item).replace(/\.(\d*?)0+Z$/, (_, digits) => digits ? `.${digits}Z` : 'Z') : canonical(item)]));
  return value;
}
const digest = fields => createHash('sha256').update(JSON.stringify(canonical(fields || {}))).digest('hex');

const filename = process.argv[2];
if (!filename) throw new Error('Pfad zur verschlüsselten Sicherung fehlt.');
const payload = await decryptProjectBackup(await readFile(filename));
const report = { ...projectBackupSummary(payload), encryptionVerified: true, restoredDocuments: 0 };
if (process.argv.includes('--emulator')) {
  const address = process.env.FIRESTORE_EMULATOR_HOST;
  if (!/^(?:127\.0\.0\.1|localhost):\d+$/.test(address || '')) throw new Error('Wiederherstellungsprüfung ist ausschließlich gegen einen lokalen Emulator erlaubt.');
  const project = 'demo-aleria-restore-check';
  async function api(url, body) {
    const response = await fetch(`http://${address}${url}`, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
    const data = await response.json(); if (!response.ok) throw new Error(`Emulator-Prüfung HTTP ${response.status}.`); return data;
  }
  for (const database of payload.firestore) {
    const root = `projects/${project}/databases/${database.databaseId}/documents`;
    const originalRoot = `projects/${payload.project}/databases/${database.databaseId}/documents`;
    for (let start = 0; start < database.documents.length; start += 150) {
      const chunk = database.documents.slice(start, start + 150);
      const writes = chunk.map(document => ({ update: { name: document.name.replace(originalRoot, root), fields: document.fields || {} } }));
      await api(`/v1/${root}:commit`, { writes });
      const restored = await api(`/v1/${root}:batchGet`, { documents: writes.map(write => write.update.name) });
      const byName = new Map(restored.filter(item => item.found).map(item => [item.found.name, item.found]));
      for (const write of writes) {
        const found = byName.get(write.update.name);
        if (!found || digest(found.fields) !== digest(write.update.fields)) throw new Error('Wiederhergestellte Felder unterscheiden sich vom Original.');
      }
      report.restoredDocuments += chunk.length;
    }
  }
  report.fieldChecksumsVerified = true;
  report.mechanicsExecuted = false;
  report.productionWrites = 0;
}
await writeFile(`${filename}.verification.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
