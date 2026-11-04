/** Solestia's confirmed estates, with image readiness supplied by shared IO. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';

const { readJson,artwork,emit } = createCountryArtCatalogSource(new URL('../',import.meta.url));
const source = await readJson('sources/estate-facts.json');
const expectedIds = ['sobira','conde','regulo','hidalgo','senor','caballero','escudero','paje','pechero'];
if (source.estates.length !== expectedIds.length
    || source.estates.some((estate,index) => estate.id !== expectedIds[index]
      || !estate.name || !estate.commonTitle || !estate.description || typeof estate.present !== 'boolean')) {
  throw new Error('Expected nine complete Solestian estate types in their confirmed order.');
}
if (source.estates.find(estate => estate.id === 'conde').present
    || source.estates.filter(estate => !estate.present).length !== 1) {
  throw new Error('Conde is hypothetical; the other eight Solestian estate types are present.');
}
const estates = [];
for (const estate of source.estates) {
  estates.push({ ...estate,kind:'estate',...await artwork('estates',estate.id) });
}
await emit('estate-data.mjs',[['ESTATE_CONTEXT',source.context],['ESTATES',estates]]);
console.log(JSON.stringify({ estates:estates.length,readyEstates:estates.filter(estate => estate.ready).length }));
