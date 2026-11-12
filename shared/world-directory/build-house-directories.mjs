import { readFile, writeFile } from 'node:fs/promises';
import { readWorldDirectorySources } from './source-reader.mjs';
import { familyAtPlace, familyAtScope, territoryFamilyScope, reconcileHouseGroups } from './house-placement.mjs';
import { pathToFileURL } from 'node:url';

function signature(groups) {
  return JSON.stringify(groups.map(group => ({ title: group.title, variant: group.variant || '',
    entries: (group.cards || group.items || []).map(card => ({ id: card.id || card.familyId || '',
      href: decodeURI(card.href || ''), liege: card.liege || '' })) })));
}

export async function createHouseDirectoryCatalog() {
  const { families, places, territories } = await readWorldDirectorySources();
  const catalog = { version: 1, places: {}, territories: {} };
  const mappedFamilies = new Set(families.filter(family => places.some(place => familyAtPlace(family, place))).map(family => family.id));
  for (const place of places) {
    if (place.status === 'template' || /einrichtung|standort/i.test(place.hierarchy?.at(-1)?.type || '')) continue;
    const residents = families.map(family => familyAtPlace(family, place)).filter(Boolean);
    const residentIds = new Set(residents.map(family => family.id));
    const misplacedIds = new Set([...mappedFamilies].filter(id => !residentIds.has(id)));
    const groups = place.content?.houses || [];
    const projection = reconcileHouseGroups(groups, residents, { knownFamilies: families, misplacedIds });
    if (signature(projection) !== signature(groups)) catalog.places[place.id] = projection;
  }
  for (const territory of territories) {
    const groups = territory.content?.view?.familySections;
    if (!groups?.length) continue;
    const residents = families.map(family => familyAtScope(family, territoryFamilyScope(territory))).filter(Boolean);
    const projection = reconcileHouseGroups(groups, residents, { kind: 'territories', knownFamilies: families });
    if (signature(projection) !== signature(groups)) catalog.territories[territory.id] = projection;
  }
  return catalog;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const target = new URL('./house-directories.generated.json', import.meta.url);
  const output = JSON.stringify(await createHouseDirectoryCatalog(), null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== output) throw new Error('Hauszuordnungen sind veraltet; build-house-directories.mjs ausführen.');
  } else await writeFile(target, output);
  console.log('Gemeinsame Hausregister für Orte und Herrschaften ' + (process.argv.includes('--check') ? 'geprüft.' : 'erzeugt.'));
}
