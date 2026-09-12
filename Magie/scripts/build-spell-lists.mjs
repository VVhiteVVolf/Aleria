import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { listSpellCatalogEntries } from '../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { renderSpellListPage } from '../modules/spell-list/spell-list-template.mjs';
import { listSpellCatalogSchools } from '../../AleriaAlmanach/modules/spell-catalog/spell-catalog-schools.js';

for (const edition of [
  ...listSpellCatalogSchools().map(school => ({ directory: school.id, entries: listSpellCatalogEntries({ catalog: school.id }), archived: false })),
  { directory: 'elementarismus', entries: listSpellCatalogEntries({ revision: 1 }), archived: true }
]) {
  const directory = new URL(`../${edition.directory}/`, import.meta.url);
  const target = new URL('index.html', directory);
  const generated = renderSpellListPage(edition.entries, { archived: edition.archived });
  const current = await readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
  if (process.argv.includes('--check')) {
    if (generated !== current) throw new Error(`Zauberverzeichnis ${edition.directory} veraltet: build:magic ausführen.`);
  } else if (generated !== current) {
    await mkdir(directory, { recursive: true });
    await writeFile(target, generated, 'utf8');
  }
  console.log(`${edition.entries.length} ${edition.directory}-Zauber${edition.archived ? ' (Archivfassung)' : ''} ${process.argv.includes('--check') ? 'geprüft' : 'abgeglichen'}.`);
}
