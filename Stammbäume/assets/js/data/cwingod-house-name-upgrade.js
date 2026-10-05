// Die öffentlichen Namen werden korrigiert; bestehende Weltpersonen- und
// Haus-IDs bleiben erhalten, damit ältere Akten dieselben Personen behalten.
const HOUSE_ID = 'house-cwningod';

function withManagedFields(record, fields, sourceRevision) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      registryManagedFieldRevisions: {
        ...record.extensions?.registryManagedFieldRevisions,
        ...Object.fromEntries(fields.map(field => [field, sourceRevision]))
      },
      registryManagedFields: [...new Set([
        ...(record.extensions?.registryManagedFields || []), ...fields
      ])]
    }
  };
}

export function withCwingodHouseNameUpgrade(family) {
  if (!family.houses.some(house => house.id === HOUSE_ID)
    && family.document.houseProfile?.liegeHouseId !== 'haus-cwningod') return family;
  const sourceRevision = Number.isInteger(family.extensions?.sourceRevision) ? family.extensions.sourceRevision : 0;
  return {
    ...family,
    persons: family.persons.map(person => person.houseId === HOUSE_ID
      ? withManagedFields(person, ['name', ...(person.id === 'rhonwen-cwningod' ? ['status'] : [])], sourceRevision)
      : person),
    houses: family.houses.map(house => house.id === HOUSE_ID
      ? withManagedFields(house, ['name', 'emblem'], sourceRevision) : house),
    cadetBranches: family.cadetBranches.map(branch => branch.houseId === HOUSE_ID
      ? withManagedFields(branch, ['name', 'notes'], sourceRevision) : branch),
    extensions: {
      ...family.extensions,
      registryManagedHouseProfileFields: [...new Set([
        ...(family.extensions?.registryManagedHouseProfileFields || []), 'liegeHouseName'
      ])]
    }
  };
}
