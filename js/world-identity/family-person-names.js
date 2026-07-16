import { normalizePersonName } from './person-identity.js';

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getHouseSurname(houseName) {
  return cleanText(houseName).replace(/^haus\s+/i, '').trim();
}

export function findPersonHouse(family, person) {
  return (family?.houses || []).find(house => house.id === person?.houseId) || null;
}

export function buildFamilyPersonDisplayName(family, person) {
  const recordedName = cleanText(person?.name) || 'Unbenannte Person';
  const surname = getHouseSurname(findPersonHouse(family, person)?.name);
  if (!surname || recordedName.split(/\s+/).length > 1) return recordedName;
  if (normalizePersonName(recordedName).endsWith(normalizePersonName(surname))) return recordedName;
  return `${recordedName} ${surname}`;
}
