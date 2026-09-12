import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { listSpellCatalogEntries } from '../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { renderSpellListPage } from '../modules/spell-list/spell-list-template.mjs';

const target = new URL('../elementarismus/index.html', import.meta.url);
const generated = renderSpellListPage(listSpellCatalogEntries());
const current = await readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
if (process.argv.includes('--check')) {
  if (generated !== current) throw new Error('Zauberverzeichnis veraltet: build:magic ausführen.');
} else if (generated !== current) {
  await mkdir(new URL('../elementarismus/', import.meta.url), { recursive: true });
  await writeFile(target, generated, 'utf8');
}
console.log(`72 Elementarismus-Zauber ${process.argv.includes('--check') ? 'geprüft' : 'abgeglichen'}.`);
