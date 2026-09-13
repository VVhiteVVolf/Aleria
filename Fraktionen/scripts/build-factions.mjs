import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readFactionCatalog, FACTION_ROOT } from '../modules/catalog/faction-repository.mjs';
import { renderFactionPage } from '../modules/catalog/faction-template.mjs';

const catalog = readFactionCatalog();
const html = renderFactionPage(catalog);
const output = resolve(FACTION_ROOT, 'index.html');
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== html) throw new Error('Fraktionsseite ist veraltet. npm run build:factions ausführen.');
  console.log('Fraktionsseite und Hierarchien sind aktuell.');
} else {
  writeFileSync(output, html, 'utf8');
  console.log(`Fraktionsseite erstellt: ${catalog.reduce((sum, category) => sum + category.entries.length, 0)} Einträge in fünf Bereichen.`);
}
