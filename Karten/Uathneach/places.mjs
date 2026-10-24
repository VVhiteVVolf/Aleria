import { structure, territoriesById, clansById, familyHref } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';

const icons = { Hauptstadt: 'stadt', Stadt: 'stadt', Burgsiedlung: 'burgsiedlung',
  Dorf: 'bardensiedlung', Leuchtturmsiedlung: 'leuchtturm' };
export const markers = structure.settlements.map(place => ({
  id: 'uathneach-' + place.id, title: place.name, category: place.category, templateId: 'siedlung',
  icon: `/Karten/assets/icons/welt/${icons[place.category]}.png`, territoryId: place.territoryId,
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
  return { territory, house: primary.name, houseHref: familyHref(primary), crest: primary.crest,
    banner: territory.banner || territoriesById.get(territory.parentId)?.banner || '', bannerHref: territory.href,
    text: place.id === 'reithe' ? structure.decisions.find(decision => decision.id === 'reithe-special-fief').text : '',
    trade: '', faction: '', fields: { 'Bekannte Familien': residents.map(clan => clan.name).join(', '),
      ...(place.mapRegionId !== place.territoryId && place.id === 'reithe' ? { Kartenregion: 'Tir na Taoide', Lehenszugehörigkeit: 'Tir na Láimhe · fürstliches Sonderlehen' } : {}) },
  };
}
