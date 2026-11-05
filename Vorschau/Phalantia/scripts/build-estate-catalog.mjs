/** Phalantia's user-defined estates; authoring IO belongs to the shared source helper. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';

const { readJson, artwork, emit } = createCountryArtCatalogSource(new URL('../', import.meta.url));
const source = await readJson('sources/estate-facts.json');
const expectedIds = ['basileis', 'perioeken', 'kriegeradel', 'freie-buerger', 'heloten', 'gaeste'];
if (source.estates.length !== expectedIds.length
    || source.estates.some((estate, index) => estate.id !== expectedIds[index]
      || !estate.name || !estate.commonTitle || !estate.description || estate.present !== true)) {
  throw new Error('Expected six complete Phalantian estate and guest-status entries in their confirmed order.');
}
const estates = [];
for (const estate of source.estates) estates.push({ ...estate, ...await artwork('estates', estate.id) });
await emit('estate-data.mjs', [['ESTATE_CONTEXT', source.context], ['ESTATES', estates]]);
console.log(JSON.stringify({ estates: estates.length, readyEstates: estates.filter(estate => estate.ready).length }));
