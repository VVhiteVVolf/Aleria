import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { readReligionCatalog, entryPagePath, RELIGION_ROOT } from '../modules/content/content-repository.mjs';
import { renderCatalog } from '../modules/catalog/catalog-template.mjs';
import { renderReligionEntry } from '../modules/content/page-template.mjs';
import { readClergyCatalog } from '../modules/clergy/clergy-repository.mjs';
import { renderClergyPages } from '../modules/clergy/clergy-pages.mjs';
import { renderEntryRedirect } from '../modules/content/redirect-template.mjs';

const catalog = readReligionCatalog();
const check = process.argv.includes('--check');
const pages = [
  ['Religionen/index.html', renderCatalog(catalog)],
  ...catalog.entries.filter(entry => entry.page).map(entry => [entryPagePath(entry), renderReligionEntry(catalog, entry)]),
  ...catalog.entries.flatMap(entry => (entry.aliases || []).map(path => [path, renderEntryRedirect(entry, path)])),
  ...renderClergyPages(readClergyCatalog(catalog),catalog)
];
const outdated = [];
for (const [path, content] of pages) {
  const destination = resolve(RELIGION_ROOT, '..', path);
  if (check) {
    const current = await readFile(destination, 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (current?.replace(/\r\n/g, '\n') !== content) outdated.push(path);
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content, 'utf8');
  }
}
if (outdated.length) {
  console.error(`Religionsseiten nicht aktuell:\n${outdated.join('\n')}`);
  process.exitCode = 1;
} else console.log(`${pages.length} Religionsseiten ${check ? 'geprüft' : 'erzeugt'}.`);
