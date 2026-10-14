import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { completeKrummeKanne } from '../modules/krumme-kanne/krumme-kanne-module.mjs';
const source = new URL('../modules/krumme-kanne/source/', import.meta.url);
const json = async name => JSON.parse(await readFile(new URL(name, source), 'utf8'));
const entry = completeKrummeKanne(await json('module-before.json'), await Promise.all(['teyrngarch.json', 'penderyn.json'].map(json)));
const target = new URL('../../Charakter Archiv Exporte/Module/Krumme Kanne/krumme-kanne-2026-10-14.json', import.meta.url);
const content = JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-10-14T12:00:00Z', module: { type: 'aleria-module', version: 1, section: await json('section.json'), entry } }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== content) throw new Error('Krumme-Kanne-Modulpaket veraltet.');
} else {
  await mkdir(new URL('./', target), { recursive: true });
  await writeFile(target, content);
}
console.log(`Krumme Kanne: ${entry.pages.length} Seiten, ${entry.pages[2].hierarchy.trees.length} Reiter, ${entry.pages[3].tradeCatalog.items.length} Angebote im Güterregister.`);
