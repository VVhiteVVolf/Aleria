import { HOUSE_ARMOR_HOUSES } from './house-armor-catalog.js?v=20261006-house-armor-v1';

export const HOUSE_ARMOR_CATEGORY = 'cenyr-ruestungen';
export const HOUSE_ARMOR_RANKS = Object.freeze([
  { id: 'jungritter', label: 'Jungritter', minimumLevel: 4, armorClassRange: '13–15' },
  { id: 'ritter', label: 'Gestandener Ritter', minimumLevel: 7, armorClassRange: '15–17' },
  { id: 'seniorritter', label: 'Seniorritter', minimumLevel: 10, armorClassRange: '18+' }
]);
export function houseArmorRank(level) {
  return [...HOUSE_ARMOR_RANKS].reverse().find(rank => Number(level) >= rank.minimumLevel) || null;
}
export function characterArmorLevel(character = {}) {
  return Number(character.combatProfile?.progression?.level) || 1;
}
export function findArmorHouse(character = {}) {
  // The actual primary house has precedence over foster-family and source-tree links.
  // A verified grant also covers older sheets whose primary link was never saved online.
  const id = String(character.genealogy?.houseId || character.houseArmorAssignment?.houseId || '').replace(/^house-/, 'haus-');
  return HOUSE_ARMOR_HOUSES.find(house => house.id === id || house.id === id.replace(/^haus-/, '')) || null;
}
export function armorTemplateId(houseId, rankId) {
  return `standard:cenyr-ruestungen:${houseId}:${rankId}`;
}
export function buildHouseArmorTemplates(houses = HOUSE_ARMOR_HOUSES) {
  return houses.filter(house => house.image).flatMap(house => HOUSE_ARMOR_RANKS.map(rank => ({
    id: armorTemplateId(house.id, rank.id), canonicalKey: armorTemplateId(house.id, rank.id), aliases: [],
    section: 'standard', category: HOUSE_ARMOR_CATEGORY, categoryLabel: 'Cenyr – Rüstungen',
    title: `${house.name} · ${rank.label}-Plattenrüstung`, type: 'Hausrüstung · Harnisch',
    description: `Harnisch des ${house.name.replace(/^Haus /, 'Hauses ')}. ${rank.label} ab Stufe ${rank.minimumLevel}.`,
    details: `RK-Rahmen ${rank.armorClassRange}. Konkrete Kampfwerte sind noch nicht festgelegt. Alle Rangvarianten verwenden dasselbe Hausbild.`,
    houseArmor: { houseId: house.id, regionId: house.regionId, rankId: rank.id, minimumLevel: rank.minimumLevel, armorClassRange: rank.armorClassRange },
    image: house.image, attributes: [], infoRows: [{ label: 'Region', value: house.region }, { label: 'Haus', value: house.name }, { label: 'RK-Rahmen', value: rank.armorClassRange }, { label: 'Rang ab Stufe', value: String(rank.minimumLevel) }],
    tags: ['Cenyr', house.region, house.name, rank.label, 'Harnisch'],
    priceRange: null, combatDefinition: null, stock: null, updatedAt: 0,
    sourceRefs: [{ kind: 'house-armor', houseId: house.id, sourceIllustrationId: house.sourceIllustrationId, sourcePage: house.tree }],
    hiddenMeta: { origin: house.region }
  })));
}
