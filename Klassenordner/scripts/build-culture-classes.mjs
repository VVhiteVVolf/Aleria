import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { CENYR_CLASS_IDS } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js';
import { VENNYR_CLASS_IDS } from '../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-registry.js';
import { getVennyrClassProgression } from '../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-progression.js';
import { ALDRIMAR_CLASS_IDS } from '../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-registry.js';
import { getAldrimarClassProgression } from '../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-progression.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { renderCultureClassPage } from '../modules/culture/culture-class-template.js';
import { writeClassPageOutput } from './class-page-output.mjs';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const volumes = await Promise.all([
  { folder: 'Cenyr', ids: CENYR_CLASS_IDS, progression: getCenyrClassProgression },
  { folder: 'Vennyr', ids: VENNYR_CLASS_IDS, progression: getVennyrClassProgression },
  { folder: 'Aldrimar', ids: ALDRIMAR_CLASS_IDS, progression: getAldrimarClassProgression }
].map(async volume => {
  const culture = JSON.parse(await readFile(new URL(`${volume.folder}/kultur.json`, root), 'utf8'));
  const documents = await Promise.all(volume.ids.map(async id => resolveCultureClassDocument(
    JSON.parse(await readFile(new URL(`${volume.folder}/${id}/klasse.json`, root), 'utf8')), culture
  )));
  return { ...volume, culture, documents };
}));
for (const volume of volumes) {
  const navigation = volume.folder === 'Cenyr'
    ? [...volume.documents, volumes.find(entry => entry.folder === 'Vennyr').documents.find(document => document.id === 'derwyn')]
    : volume.documents;
  for (const document of volume.documents) {
    await writeClassPageOutput(root, `${volume.folder}/${document.id}/index.html`,
      renderCultureClassPage(document, navigation, volume.culture, volume.progression(document.id)), check);
  }
}
let catalog = await readFile(new URL('Klassenseite.html', root), 'utf8');
for (const volume of volumes) {
  for (const id of volume.ids) {
    const pattern = new RegExp(`<a\\b[^>]*\\bid="klasse-${volume.culture.id}-${id}"[^>]*>`);
    assert(pattern.test(catalog), `${volume.folder}-Registerkarte fehlt: ${id}`);
    catalog = catalog.replace(pattern, tag => tag.replace(/href="[^"]*"/, `href="${volume.folder}/${id}/index.html"`)
      .replace(/ (?:data-action|aria-haspopup|aria-controls)="[^"]*"/g, ''));
  }
}
await writeClassPageOutput(root, 'Klassenseite.html', catalog, check);
console.log(`${volumes.map(volume => `${volume.documents.length} ${volume.folder}-Klassen`).join(', ')} mit Ausbildung 1–20 ${check ? 'geprüft' : 'erstellt'}.`);
