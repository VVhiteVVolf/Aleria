import { readFile } from 'node:fs/promises';
import { writeClassPageOutput } from './class-page-output.mjs';
import assert from 'node:assert/strict';
import { UNIVERSAL_CLASS_IDS } from '../modules/pages/universal-class-registry.js';
import { validateClassDocument } from '../modules/pages/class-page-content.js';
import { renderUniversalClassPage, renderUniversalClassCards } from '../modules/pages/class-page-template.js';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const documents = await Promise.all(UNIVERSAL_CLASS_IDS.map(async id => {
  const source = await readFile(new URL(`Basisklassen/${id}/klasse.json`, root), 'utf8');
  return validateClassDocument(JSON.parse(source), id);
}));

const output = (path, content) => writeClassPageOutput(root, path, content, check);

for (const document of documents) {
  await output(`Basisklassen/${document.id}/index.html`, renderUniversalClassPage(document, documents));
}
const index = await readFile(new URL('Klassenseite.html', root), 'utf8');
const start = index.indexOf('    <!-- BASISKLASSEN -->');
const end = index.indexOf('    <!-- LÄNDERPFADE -->');
assert(start >= 0 && end > start, 'Klassenregister-Markierungen fehlen.');
await output('Klassenseite.html', index.slice(0, start) + renderUniversalClassCards(documents) + index.slice(end));
console.log(`${documents.length} Universalklassen und Registerkarten ${check ? 'geprüft' : 'erstellt'}.`);
