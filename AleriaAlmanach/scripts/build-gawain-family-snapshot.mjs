import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { projectGawainFamilySnapshot } from '../modules/gawain-duncan/gawain-family-snapshot.mjs';
import { gawainFamilyBackupPath } from '../modules/gawain-duncan/gawain-family-backup.mjs';

const root = new URL('../../Stammbäume/assets/data/published-families/', import.meta.url);
const target = new URL('haus-draig.json', root), registryPath = new URL('registry.json', root);
const originalText = await readFile(target, 'utf8'), registryText = await readFile(registryPath, 'utf8');
const original = JSON.parse(originalText), registry = JSON.parse(registryText);
const source = FAMILY_REGISTRY.find(row => row.id === 'haus-draig');
if (!source) throw Error('Haus Draigs öffentliche Projektquelle fehlt.');
const result = projectGawainFamilySnapshot({ envelope: original, registry, sourceFamily: source.family, now: new Date().toISOString() });
const json = value => JSON.stringify(value, null, 2) + '\n';
const backups = result.changed ? [original, result.envelope].map(envelope => {
  const content = envelope === original ? originalText : json(envelope);
  return { path: new URL(gawainFamilyBackupPath(envelope, content), root), content };
}) : [];
// A colliding archive name is never overwritten. Check every output before
// writing the first one, and recheck the two live local inputs immediately.
for (const backup of backups) {
  const stored = await readFile(backup.path, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (stored != null && stored !== backup.content) throw Error(`Abweichende vorhandene Familiensicherung: ${backup.path.pathname}`);
  backup.exists = stored != null;
}
if (process.argv.includes('--check')) {
  if (result.changed || result.registryChanged) throw Error('Gawains öffentlicher Familien-Snapshot muss gezielt aktualisiert werden.');
} else if (result.changed || result.registryChanged) {
  if (await readFile(target, 'utf8') !== originalText || await readFile(registryPath, 'utf8') !== registryText) throw Error('Der lokale Familienstand wurde inzwischen geändert.');
  for (const backup of backups) if (!backup.exists) { await mkdir(new URL('./', backup.path), { recursive: true }); await writeFile(backup.path, backup.content, { flag: 'wx' }); }
  if (result.changed) await writeFile(target, json(result.envelope));
  if (result.registryChanged) await writeFile(registryPath, json(result.registry));
}
console.log(`Gawain-only: ${result.changed ? 'aktualisiert' : 'aktuell'}; Haus-Draig-Revision ${result.envelope.revision}; Personenquelle ${result.sourceRevision}. Keine übrige Familienreconciliation.`);
