import { readFile, writeFile } from 'node:fs/promises';
import { PET_BREED_GROUP_IDS } from '../modules/pet-breed/pet-breed-registry.mjs';
import { renderPetBreedOverview } from '../modules/pet-breed/pet-breed-template.mjs';

const check = process.argv.includes('--check');

for (const id of PET_BREED_GROUP_IDS) {
  const directory = new URL(`../tiere/vieh/haustiere/${id}/`, import.meta.url);
  const record = JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
  if (record.id !== id) throw new Error(`Pet-breed group id does not match directory: ${id}`);

  const html = renderPetBreedOverview(record);
  const output = new URL('index.html', directory);
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated pet-breed page is out of date: ${id}. Run node Bestiarium/scripts/build-pet-breeds.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} pet-breed overview: ${id}`);
}
