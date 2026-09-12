import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { loadHorseBreedingData } from '../modules/horse-breeding/horse-breeding-data.mjs';
import { renderHorseBreedingPage } from '../modules/horse-breeding/horse-breeding-template.mjs';

const outputDirectory = new URL('../tiere/pferde/zuchtbuch/', import.meta.url);
const outputFile = new URL('index.html', outputDirectory);
const check = process.argv.includes('--check');
const html = renderHorseBreedingPage(await loadHorseBreedingData());

if (check) {
  const existing = (await readFile(outputFile, 'utf8')).replace(/\r\n/g, '\n');
  if (existing !== html) {
    throw new Error('Generated horse-breeding page is out of date. Run node Bestiarium/scripts/build-horse-breeding.mjs');
  }
} else {
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputFile, html, 'utf8');
}

console.log(`${check ? 'Checked' : 'Built'} horse-breeding page with 27 breeds and 7 named crossings.`);
