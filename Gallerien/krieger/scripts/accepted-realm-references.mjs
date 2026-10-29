import { allHouses } from '../../../shared/accepted-realms/catalog.mjs';

const references = new Map(allHouses.filter(h => h.warrior?.fullsize).map(h => [
  decodeURI(h.warrior.fullsize.replace(/^\//, '')), h.familyId,
]));
// Nested reference archives use source IDs, which are not necessarily house IDs.
export const acceptedReferenceFamily = file => references.get(file) || '';
