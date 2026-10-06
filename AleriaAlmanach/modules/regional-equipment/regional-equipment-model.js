import { REGIONAL_EQUIPMENT_TERRITORIES, REGIONAL_EQUIPMENT_HOUSES } from './regional-equipment-catalog.js?v=20261006-regional-equipment-v2';
export const REGIONAL_EQUIPMENT_SECTION = 'regional';
export const REGIONAL_EQUIPMENT_LABEL = 'Länder Spezifische Rüstungen und Waffen';
const territories = new Map(REGIONAL_EQUIPMENT_TERRITORIES.map(node => [node.id, node]));
const houses = new Map(REGIONAL_EQUIPMENT_HOUSES.map(house => [house.id, house]));
export const regionalTerritory = id => territories.get(id || '') || territories.get('');
export const regionalHouse = id => houses.get(id) || null;
export function regionalChildren(id) {
  return regionalTerritory(id).children.map(id => territories.get(id)).sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
export function regionalHouses(id) {
  return regionalTerritory(id).houseIds.map(id => houses.get(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
export function regionalAncestors(id) {
  const chain = []; let node = regionalTerritory(id);
  while (node.id) { chain.unshift(node); node = regionalTerritory(node.parentId); }
  return chain;
}
export function regionalHomeForHouse(id) {
  return REGIONAL_EQUIPMENT_TERRITORIES.filter(node => node.houseIds.includes(id)).sort((a, b) => b.path.length - a.path.length)[0]?.id || '';
}
export function regionalQuery(state) {
  return state.section === REGIONAL_EQUIPMENT_SECTION ? { ...state, houseIds: regionalTerritory(state.territoryId).houseIds } : state;
}
