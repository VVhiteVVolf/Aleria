// Die öffentlichen Namen werden korrigiert; bestehende Weltpersonen- und
// Haus-IDs bleiben erhalten, damit ältere Akten dieselben Personen behalten.
const HOUSE_ID = 'house-cwningod';

function withManagedFields(record, fields) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      registryManagedFields: [...new Set([
        ...(record.extensions?.registryManagedFields || []), ...fields
      ])]
    }
  };
}

export function withCwingodHouseNameUpgrade(family) {
  if (!family.houses.some(house => house.id === HOUSE_ID)
    && family.document.houseProfile?.liegeHouseId !== 'haus-cwningod') return family;
  return {
    ...family,
    persons: family.persons.map(person => person.houseId === HOUSE_ID
      ? withManagedFields(person, ['name', ...(person.id === 'rhonwen-cwningod' ? ['status'] : [])])
      : person),
    houses: family.houses.map(house => house.id === HOUSE_ID
      ? withManagedFields(house, ['name', 'emblem']) : house),
    cadetBranches: family.cadetBranches.map(branch => branch.houseId === HOUSE_ID
      ? withManagedFields(branch, ['name', 'notes']) : branch),
    extensions: {
      ...family.extensions,
      registryManagedHouseProfileFields: [...new Set([
        ...(family.extensions?.registryManagedHouseProfileFields || []), 'liegeHouseName'
      ])]
    }
  };
}
