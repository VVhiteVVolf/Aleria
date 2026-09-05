import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { CENYR_CLASS_IDS } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { renderCultureClassPage } from '../modules/culture/culture-class-template.js';
import { writeClassPageOutput } from './class-page-output.mjs';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const culture = JSON.parse(await readFile(new URL('Cenyr/kultur.json', root), 'utf8'));
const documents = await Promise.all(CENYR_CLASS_IDS.map(async id => resolveCultureClassDocument(
  JSON.parse(await readFile(new URL(`Cenyr/${id}/klasse.json`, root), 'utf8')), culture
)));
for (const document of documents) {
  await writeClassPageOutput(root, `Cenyr/${document.id}/index.html`,
    renderCultureClassPage(document, documents, culture, getCenyrClassProgression(document.id)), check);
}
let catalog = await readFile(new URL('Klassenseite.html', root), 'utf8');
for (const id of CENYR_CLASS_IDS) {
  const pattern = new RegExp(`<a\\b[^>]*\\bid="klasse-cenyr-${id}"[^>]*>`);
  assert(pattern.test(catalog), `Cenyr-Registerkarte fehlt: ${id}`);
  catalog = catalog.replace(pattern, tag => tag.replace(/href="[^"]*"/, `href="Cenyr/${id}/index.html"`)
    .replace(/ (?:data-action|aria-haspopup|aria-controls)="[^"]*"/g, ''));
}
await writeClassPageOutput(root, 'Klassenseite.html', catalog, check);
console.log(`${documents.length} Cenyr-Klassen mit Ausbildung 1–20 ${check ? 'geprüft' : 'erstellt'}.`);
