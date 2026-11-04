/** Venalys owns the five social facts; shared authoring IO supplies image paths. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';
const { readJson,artwork,emit } = createCountryArtCatalogSource(new URL('../',import.meta.url));
const source = await readJson('sources/estate-facts.json');
const expected = ['patrizier','magnarier','mercantier','plebejer','advena'];
if (source.estates.length !== expected.length || source.estates.some((estate,i) => estate.id !== expected[i]
  || !estate.present || !estate.name || !estate.description)) throw new Error('Expected five confirmed Venalys estates.');
const estates = [];
for (const estate of source.estates) estates.push({ ...estate,kind:'estate',...await artwork('estates',estate.id) });
await emit('estate-data.mjs',[['ESTATE_CONTEXT',source.context],['ESTATES',estates]]);
console.log(JSON.stringify({ estates:estates.length,readyEstates:estates.filter(estate => estate.ready).length }));
