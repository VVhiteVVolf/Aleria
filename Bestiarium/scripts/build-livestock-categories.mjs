import { readFile, writeFile } from 'node:fs/promises';
import { LIVESTOCK_CATEGORY_IDS } from '../modules/livestock-category/livestock-category-registry.mjs';
import { renderLivestockCategory } from '../modules/livestock-category/livestock-category-template.mjs';

const check = process.argv.includes('--check');

for (const id of LIVESTOCK_CATEGORY_IDS) {
  const directory = new URL(`../tiere/vieh/${id}/`, import.meta.url);
  const record = JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
  if (record.id !== id) throw new Error(`Livestock category id does not match directory: ${id}`);

  const html = renderLivestockCategory(record);
  const output = new URL('index.html', directory);
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated livestock category is out of date: ${id}. Run node Bestiarium/scripts/build-livestock-categories.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} livestock category: ${id}`);
}
