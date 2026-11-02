import fs from 'node:fs';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
const root = new URL('../../../', import.meta.url);
const before = JSON.parse(fs.readFileSync(new URL('shared/accepted-realms/sources/kingdom-existing-families-20261101.json', root), 'utf8'));
const profileFields = ['rankId', 'liegeHouseId', 'liegeHouseName'];
const extensionFields = ['acceptedRealmPlacement', 'registryManagedHouseProfileFieldRevisions'];
const pick = (value, fields) => Object.fromEntries(fields.filter(key => value[key] !== undefined).map(key => [key, value[key]]));
const families = Object.fromEntries(Object.entries(before).map(([id, family]) => {
  const current = getRegisteredFamily(id).family;
  for (const field of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'lineage', 'houses']) {
    if (JSON.stringify(current[field]) !== JSON.stringify(family[field])) throw Error(`Genealogy changed: ${id}/${field}`);
  }
  return [id, { profileBefore: pick(family.document.houseProfile, profileFields), profileAfter: pick(current.document.houseProfile, profileFields),
    extensionsBefore: pick(family.extensions, extensionFields), extensionsAfter: pick(current.extensions, extensionFields) }];
}));
fs.writeFileSync(new URL('Kontinente/tests/support/kingdom-metadata-review-20261101.json', root), JSON.stringify({
  source: 'User admission of Aeldrunmar, Talyndor and Brevanor on 1 November 2026; territorial metadata only. Historic family proof remains unchanged.', families,
}, null, 2) + '\n');
