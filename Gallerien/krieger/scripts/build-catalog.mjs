// Rebuild from the repository root: node Gallerien/krieger/scripts/build-catalog.mjs
// CI / drift check: append --check. No network access or Firebase writes.
// Editorial inclusions/exclusions belong in data/selection.json after visual review.
// Registry imports preserve canonical identities; generated JSON/CSV are never hand-edited.
// Bump the gallery's catalog URL version after rebuilding for a new release.
// Limit an existing release to registered houses: --houses=haus-id,haus-id
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { collectHouses } from './house-catalog.mjs';
import { collectIllustrations } from './illustration-catalog.mjs';
import { createGalleryCsv, mergeScopedCatalog, parseHouseScope, updateScopedGalleryCsv, validateHouseScope } from './scoped-catalog.mjs';

const root = new URL('../../../', import.meta.url);
const directory = new URL('../data/', import.meta.url);
const selection = JSON.parse(readFileSync(new URL('selection.json', directory), 'utf8'));
const houseIds = parseHouseScope(process.argv.slice(2));
const previous = houseIds ? JSON.parse(readFileSync(new URL('catalog.json', directory), 'utf8')) : null;
const houseCatalog = collectHouses(root, { houseIds });
if (houseIds) validateHouseScope(previous, houseIds, { registeredHouses: houseCatalog.houses });
const illustrations = await collectIllustrations(root, houseCatalog, selection, { houseIds });
const houses = houseCatalog.houses.map(house => ({
  ...house,
  illustrationIds: illustrations.filter(image => image.houseIds.includes(house.id)).map(image => image.id),
  missingNote: selection.excludedHouses.find(entry => entry.id === house.id)?.reason || '',
}));
const rebuilt = {
  schema: 'aleria.warrior-gallery', version: 1, reviewedAt: selection.reviewedAt,
  scope: 'Projektdateien, Hausbios, Stammbaumregister einschließlich benannter Häuser innerhalb der Stammbäume und veröffentlichter Familien; zusätzlich die lokalen Sammlungen Bilder für Krieger, Gilden sowie Götter und Geistliche. Keine Klassen-Icons, Wappen, reinen Gegenstandsbilder oder gewöhnlichen Personenporträts. Private, ausschließlich online gespeicherte Entwürfe sind nicht enthalten.',
  houses, illustrations,
};
const catalog = houseIds ? mergeScopedCatalog(previous, rebuilt, houseIds) : rebuilt;
for (const image of illustrations) {
  for (const source of image.sources) if (!existsSync(new URL(source.path, root))) throw new Error(`Quelle fehlt: ${source.path}`);
  for (const variant of image.variants || []) if (!existsSync(new URL(variant.image, root))) throw new Error(`Fassung fehlt: ${variant.image}`);
}
const csv = houseIds ? updateScopedGalleryCsv(readFileSync(new URL('haeuser.csv', directory), 'utf8'), previous.houses, catalog.houses, houseIds) : createGalleryCsv(houses);
for (const [name, content] of [['catalog.json', JSON.stringify(catalog, null, 2) + '\n'], ['haeuser.csv', csv]]) {
  const target = new URL(name, directory);
  if (process.argv.includes('--check')) {
    // Git may check text out with CRLF on Windows; that is not a catalog change.
    if (!existsSync(target) || readFileSync(target, 'utf8').replaceAll('\r\n', '\n') !== content.replaceAll('\r\n', '\n')) throw new Error(`${name} ist nicht aktuell. build-catalog.mjs ausführen.`);
  } else writeFileSync(target, content);
}
console.log(JSON.stringify({ ...(houseIds ? { updatedHouses: houseIds } : {}), houses: catalog.houses.length, registered: catalog.houses.filter(h => h.kind === 'registered').length, mentioned: catalog.houses.filter(h => h.kind === 'mentioned').length, illustrated: catalog.houses.filter(h => h.illustrationIds.length).length, missing: catalog.houses.filter(h => !h.illustrationIds.length).length, illustrations: catalog.illustrations.length, otherAffiliations: catalog.illustrations.filter(i => !i.houseIds.length).length }, null, 2));
