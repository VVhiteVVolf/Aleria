import { houseTitle, houseHref, placeHref, placeId } from './catalog.mjs';
import { getHouseRank } from '../../Stammbäume/assets/js/domain/house-profile.js';

const categories = [
  { id: 'mmflrbzxydg7', label: 'Hauptstadt', color: '#a54430', marker: '/Karten/assets/icons/welt/stadt.png' },
  { id: 'mmflwdjfl6ah', label: 'Stadt', color: '#6b7747', marker: '/Karten/assets/icons/welt/stadt.png' },
  { id: 'accepted-realm-burg', label: 'Burg', color: '#79617e', marker: '/Karten/assets/icons/welt/burgsiedlung.png', placeholderCategoryId: 'mmfls5afqqpr' },
];
export function realmPlaces(realm) {
  const residentsAt = seatId => realm.houses.filter(h => h.seatId === seatId)
    .sort((a, b) => Number(b.isSeatRuler) - Number(a.isSeatRuler) || getHouseRank(a.rankId).order - getHouseRank(b.rankId).order || a.familyId.localeCompare(b.familyId, 'en'));
  const markers = realm.settlements.map(seat => {
    const category = categories.find(c => c.label === (seat.id === realm.capital ? 'Hauptstadt' : /Burg|Broch/.test(seat.kind || '') ? 'Burg' : 'Stadt'));
    return { id: placeId(realm, seat), title: seat.name, category: category.label, templateId: 'siedlung', icon: category.marker,
      territoryId: `${realm.id}-sitz-${seat.id}`, x: seat.point[0], y: 100 - seat.point[1], href: placeHref(realm, seat),
      residentFamilyIds: realm.historical ? [] : residentsAt(seat.id).map(h => h.familyId),
      sourceRef: { provider: 'aleria-accepted-realms', acceptedOn: '2026-10-28', settlementId: seat.id,
        coordinateOrigin: 'top-left', coordinateUnit: 'percent', coordinates: seat.point, provisional: !!seat.provisionalCoordinates } };
  });
  const describePlace = marker => {
    const seat = realm.settlements.find(s => placeId(realm, s) === marker.id);
    const territory = realm.territoriesById.get(marker.territoryId);
    const residents = residentsAt(seat.id);
    const ruler = residents.find(h => h.isSeatRuler);
    return { territory, house: ruler ? houseTitle(ruler) : 'Führung offen', houseHref: ruler ? houseHref(ruler) : '',
      crest: ruler?.crest || territory.banner, banner: territory.banner, bannerHref: territory.href,
      href: marker.href, text: [seat.geography, realm.historical ? 'Historischer Sitz vor der Eroberung; heutige Bewohner nicht bestätigt.' : realm.occupied ? 'Besetztes Gebiet; keine freiwillige Gefolgschaft der einheimischen Familien unterstellt.' : '', seat.provisionalCoordinates ? 'Ungefähre Kartenposition.' : ''].filter(Boolean).join(' '),
      fields: { 'Bekannte Familien': residents.map(houseTitle).join(', '), 'Herrschaft': territory.name,
        ...(seat.mapName || seat.mapLabel || seat.sourceName ? { 'Ältere Kartenbeschriftung': seat.mapName || seat.mapLabel || seat.sourceName } : {}),
        ...(realm.historical || realm.occupied ? { 'Status': realm.historical ? 'Historisch · von der Triarchie erobert' : 'Unter Besatzung' } : {}) }, faction: '', trade: '' };
  };
  return { markers, describePlace, categories: categories.filter(c => markers.some(m => m.category === c.label)),
    catalog: { definition: category => categories.find(c => c.id === category.id || c.label === category.label) } };
}
