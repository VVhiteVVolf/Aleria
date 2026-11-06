import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { buildHonigtoertchen } from '../modules/zum-honigtoertchen/honigtoertchen-module.mjs';
import { HONIGTOERTCHEN_SECTION } from '../modules/zum-honigtoertchen/honigtoertchen-profile.mjs';

if (process.argv.slice(2).some(argument => argument !== '--check')) throw new Error('Verwendung: build-honigtoertchen.mjs [--check]');
const entry = buildHonigtoertchen();
const outputs = new Map([
  [new URL('../modules/zum-honigtoertchen/honigtoertchen-data.js', import.meta.url),
    renderArchiveSectionRegistration('registerHonigtoertchen', [{ ...HONIGTOERTCHEN_SECTION, entry }], 'scripts/build-honigtoertchen.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Zum Honigtörtchen/zum-honigtoertchen-2026-11-05.json', import.meta.url),
    JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-11-05T12:00:00Z',
      module: { type: 'aleria-module', version: 1, section: HONIGTOERTCHEN_SECTION, entry } }, null, 2) + '\n']
]);
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltetes Honigtörtchen-Paket: ${url}`);
  } else {
    await mkdir(new URL('.', url), { recursive: true });
    await writeFile(url, content);
  }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length,
  products: entry.pages.find(page => page.tradeCatalogPage).tradeCatalog.items.length,
  services: entry.pages.find(page => page.guildServicesPage).guildServices.services.length,
  scenes: entry.pages.filter(page => page.sessionPage).length }));
