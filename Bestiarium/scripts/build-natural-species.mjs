import { readFile, writeFile } from 'node:fs/promises';
import { NATURAL_SPECIES_IDS } from '../modules/natural-species/natural-species-registry.mjs';
import { renderNaturalSpecies } from '../modules/natural-species/natural-species-template.mjs';

const check = process.argv.includes('--check');

for (const id of NATURAL_SPECIES_IDS) {
  const directory = new URL(`../tiere/${id}/`, import.meta.url);
  const record = JSON.parse(await readFile(new URL('art.json', directory), 'utf8'));
  if (record.id !== id) throw new Error(`Natural-species id does not match directory: ${id}`);

  const html = renderNaturalSpecies(record);
  const output = new URL('index.html', directory);
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated natural-species page is out of date: ${id}. Run node Bestiarium/scripts/build-natural-species.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} natural-species page: ${id}`);
}
