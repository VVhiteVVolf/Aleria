import { structure, territoriesById, clansById, familyHref } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { classifyCity, cityDefinition } from './city-classification.mjs';

export const cityClassifications = new Map(structure.settlements.map(place => [place.id, classifyCity(place, structure.clans)]));
export const markers = structure.settlements.map(place => ({
  id: 'uathneach-' + place.id, title: place.name, category: cityClassifications.get(place.id).type, templateId: 'siedlung',
  icon: cityDefinition(cityClassifications.get(place.id).type).marker, territoryId: place.territoryId,
  x: place.point[0] / 100 * 4096, y: (1 - place.point[1] / 100) * 3365,
  residentFamilyIds: place.residentFamilyIds,
  sourceRef: { provider: 'aleria-reviewed-map', source: 'Uathneach Städte Namen.png',
    selection: 'original', settlementId: place.id, coordinateOrigin: 'top-left',
    coordinateUnit: 'percent', coordinates: [...place.point] },
}));

export function describePlace(marker) {
  const territory = territoriesById.get(marker.territoryId);
  if (!territory) throw new Error(`Unbekannte Herrschaft: ${marker.territoryId}`);
  const place = structure.settlements.find(place => 'uathneach-' + place.id === marker.id);
  const residents = place.residentFamilyIds.map(id => structure.clans.find(clan => clan.familyId === id));
  const primary = residents[0] || clansById.get(territory.rulerId);
  const city = cityClassifications.get(place.id);
  return { territory, house: primary.name, houseHref: familyHref(primary), crest: primary.crest,
    banner: territory.banner || territoriesById.get(territory.parentId)?.banner || '', bannerHref: territory.href,
    text: place.id === 'reithe' ? structure.decisions.find(decision => decision.id === 'reithe-special-fief').text : '',
    trade: '', faction: '', fields: { 'Bekannte Familien': residents.map(clan => clan.name).join(', '),
      Funktion: city.role, Größenklasse: city.size,
      ...(place.mapRegionId !== place.territoryId && place.id === 'reithe' ? { Kartenregion: 'Tir na Taoide', Lehenszugehörigkeit: 'Tir na Láimhe · fürstliches Sonderlehen' } : {}) },
  };
}
