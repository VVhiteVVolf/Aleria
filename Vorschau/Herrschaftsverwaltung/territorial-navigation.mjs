import { ABERLLAN_COUNTY_POST, ABERLLAN_LEAD, CAMRUISGE_SCOPE } from '../../shared/cenyr-administration/camruisge-plan.mjs';
import { preparationHref } from '../../shared/cenyr-administration/office-appointments.mjs';

export const DEFAULT_COUNTY = 'celtigerns-wacht';
export const ABERLLAN_PREVIEW = '/Vorschau/Herrschaftsverwaltung/Cenyr/aberllan.html';
export const aberllanOfficeHref = preparationHref(CAMRUISGE_SCOPE, 'aberllan', undefined, ABERLLAN_LEAD);

export function administrationHref(county, house) {
  const params = new URLSearchParams({ grafschaft: county });
  if (house) params.set('haus', house);
  return `/Vorschau/Herrschaftsverwaltung/index.html?${params}`;
}

export function territorialGroups(directory) {
  return [directory.kingdom, ...directory.counties];
}

export function prepareTerritorialHouses(legacyHouses, directory) {
  const countyByScope = new Map(territorialGroups(directory).flatMap(county => county.scopes.map(scope => [scope.id, county])));
  return [...legacyHouses, ...directory.houses].map(house => {
    const county = countyByScope.get(house.id);
    const territorial = { ...house, countyId: county.id, countyName: county.name, candidateRegion: county.candidateRegion };
    if (house.id !== 'draig') return territorial;
    return {
      ...territorial,
      fiefContacts: house.fiefContacts.filter(contact => contact.seat !== 'Aberllan'),
      delegatedOffices: [{ title: 'Lehenswart Aberllans', href: aberllanOfficeHref }],
    };
  });
}

export function officeDestination(params) {
  const legacyAberllan = params.get('haus') === 'draig' && params.get('posten') === ABERLLAN_COUNTY_POST;
  return legacyAberllan ? { id: CAMRUISGE_SCOPE, area: 'aberllan', post: ABERLLAN_LEAD }
    : { id: params.get('haus'), area: params.get('amt'), department: params.get('abteilung'), post: params.get('posten') };
}
