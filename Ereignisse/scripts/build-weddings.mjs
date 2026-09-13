import { readFile, writeFile } from 'node:fs/promises';
import { renderWeddingShell } from '../modules/weddings/wedding-shell.mjs';
import { validateWeddingEnvelope, weddingRegistryEntry } from '../modules/weddings/wedding-schema.mjs';

const root = new URL('../', import.meta.url);
const record = validateWeddingEnvelope(JSON.parse(await readFile(new URL('Hochzeiten/data/tudwal-revelyn.json', root), 'utf8')));
const files = [
  ['Hochzeiten/Haus-Draig-und-Penderyn.html', renderWeddingShell({ prefix: '../', id: record.id, title: record.wedding.title })],
  ['hochzeit.html', renderWeddingShell()],
  ['Hochzeitsevent.html', renderWeddingShell({ template: true, title: 'Eine neue Hochzeit · Vorlage' })]
];
const registry = JSON.parse(await readFile(new URL('Hochzeiten/registry.json', root),'utf8'));
const entries = new Map(registry.weddings.map(entry => [entry.id,entry]));
entries.set(record.id,weddingRegistryEntry(record));
files.push(['Hochzeiten/registry.json',JSON.stringify({ schemaVersion:1,weddings:[...entries.values()] },null,2)+'\n']);
for (const [path, content] of files) {
  const current = await readFile(new URL(path,root),'utf8').catch(() => '');
  if (current === content) continue;
  if (process.argv.includes('--check')) throw new Error(`Hochzeitsseite veraltet: ${path}`);
  await writeFile(new URL(path,root),content,'utf8');
}
console.log('Hochzeitsseiten und Register sind aktuell.');
