import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHouseholdCatalog } from '../modules/households/household-model.mjs';
import { loadHouseholdSources } from './household-sources.mjs';

const root = new URL('../', import.meta.url), context = { window: {} };
runInNewContext(await readFile(new URL('karten.registry.js', root), 'utf8'), context);
const reviewedPins = {};
for (const map of context.window.KartoMapRegistry.all().filter(map => map.status === 'active' && map.dataPath)) {
  const source = new URL(map.dataPath.replace(/[^/]+$/, 'house-affiliation-review.json'), root);
  let review;
  try { review = JSON.parse(await readFile(source, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  reviewedPins[map.id] = Object.fromEntries(review.pins.map(pin => [pin.pinId, [pin.familyId || pin.houseId]]));
}
const catalog = createHouseholdCatalog(FAMILY_REGISTRY, reviewedPins, await loadHouseholdSources());
const output = JSON.stringify(catalog, null, 2) + '\n';
const destination = new URL('modules/households/households.generated.json', root);
if (process.argv.includes('--check')) {
  if (await readFile(destination, 'utf8') !== output) throw new Error('Wappenregister aktualisieren: node Karten/tools/build-households.mjs');
} else await writeFile(destination, output);
console.log(`${catalog.families.length} Familienwappen, ${Object.keys(reviewedPins).length} geprüfte örtliche Zuordnungslisten.`);
