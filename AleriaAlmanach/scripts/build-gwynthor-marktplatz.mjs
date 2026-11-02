import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { buildGwynthorMarketplace, MARKETPLACE_SECTION } from '../modules/gwynthor-marktplatz/marketplace-module.mjs';
import { MARKETPLACE_ART_BRIEFS } from '../modules/gwynthor-marktplatz/marketplace-art.mjs';

const entry = buildGwynthorMarketplace();
const outputs = new Map([
  [new URL('../modules/gwynthor-marktplatz/marketplace-data.js', import.meta.url),
    renderArchiveSectionRegistration('registerGwynthorMarketplace', [{ ...MARKETPLACE_SECTION, entry }], 'scripts/build-gwynthor-marktplatz.mjs')],
  [new URL('../../Charakter Archiv Exporte/Module/Gwynthor Marktplatz/gwynthor-marktplatz-2026-11-01.json', import.meta.url),
    JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-11-01T00:00:00Z',
      module: { type: 'aleria-module', version: 1, section: MARKETPLACE_SECTION, entry } }, null, 2) + '\n'],
  [new URL('../assets/gwynthor-marktplatz/image-prompts.json', import.meta.url),
    JSON.stringify({ version: 1, tool: 'built-in image_gen', images: MARKETPLACE_ART_BRIEFS }, null, 2) + '\n']
]);

for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltetes Marktplatz-Paket: ${url}`);
  } else {
    await mkdir(new URL('.', url), { recursive: true });
    await writeFile(url, content);
  }
}
console.log(JSON.stringify({ module: entry.id, pages: entry.pages.length, scenes: MARKETPLACE_ART_BRIEFS.length }));
