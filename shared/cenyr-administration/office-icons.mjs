import { LEHENSWARTE_ID } from './lehenswarte-plan.mjs';

const artwork = new Set([
  'command', 'faith', 'justice', 'money', 'secrecy', 'diplomacy', 'arcane', 'music', 'court',
  'records', 'coordination', 'supplies', 'arms', 'scouting', 'learning', 'care', 'inquiry', 'proclamation',
  'hospitality', 'works', 'garden', 'judgment', 'horse', 'sailing', 'courier', 'watch', 'council',
  'mayor', 'toll', 'quill', 'territory', 'guild', 'import', 'export', 'search', 'ancestry',
]);

export function officeIcon(key) {
  if (!artwork.has(key)) throw new Error(`Unknown administration icon: ${key}`);
  return `/shared/cenyr-administration/assets/icons/${key}.webp`;
}

const areaIcons = {
  militaer: 'command', klerus: 'faith', gerichtsbarkeit: 'justice', finanzen: 'money',
  spionage: 'secrecy', diplomatie: 'diplomacy', magie: 'arcane', unterhaltung: 'music',
};
export const administrationAreaIcon = id => officeIcon(areaIcons[id] || 'court');

export const COURT_AREA = { id: 'hof', name: 'Hofämter', imageSrc: officeIcon('court') };
export const REGENCY_AREA = { id: 'regentschaft', name: 'Regentschaft', imageSrc: officeIcon('diplomacy') };
export const LEHENSWARTE_AREA = { id: LEHENSWARTE_ID, name: 'Ortsämter und Lehen', imageSrc: officeIcon('territory') };
export const ADDITIONAL_COUNCIL_AREAS = [
  { id: 'ratskanzlei', name: 'Ratskanzlei', imageSrc: officeIcon('records') },
  { id: 'ratsberatung', name: 'Ratsberatung', imageSrc: officeIcon('learning') },
];
export const CAMRUISGE_AREAS = [
  { id: 'aberllan', name: 'Aberllan', imageSrc: officeIcon('court') },
  { id: 'oilean', name: 'Oilean', imageSrc: officeIcon('coordination') },
  { id: 'inselabstimmung', name: 'Gemeinsame Angelegenheiten', imageSrc: officeIcon('diplomacy') },
];

const postIcons = {
  militaer: {
    admiral: 'sailing', seefuehrung: 'sailing', seeadjutant: 'sailing',
    'kriegswart-sicherheit': 'watch', 'kriegswart-logistik': 'supplies', 'kriegswart-ausbildung': 'learning',
    'kriegswart-aufklaerung': 'scouting', 'kriegswart-disziplin': 'judgment',
    wachkommandant: 'command', wachstellvertretung: 'coordination', bannerfuehrer: 'command',
    torhauptmann: 'watch', reitboten: 'horse',
    'landdienst-ermittler': 'inquiry', 'landdienst-inspektor': 'inquiry', 'landdienst-profoss': 'justice',
    'landdienst-heeresschoeffe': 'justice', 'landdienst-botenmeister': 'courier',
    'landdienst-zeugmeister': 'arms', 'landdienst-quartiermeister': 'supplies', 'landdienst-lehrhauptmann': 'learning',
    'landdienst-festungsbaumeister': 'works', 'landdienst-feldkaplan': 'faith', 'landdienst-feldscher': 'care',
    'landdienst-militaerherold': 'proclamation', schiffsheiler: 'care', werftmeister: 'works', seeproviant: 'supplies',
  },
  klerus: { register: 'records', bote: 'courier', paladin: 'watch', lehrhaus: 'learning', novizen: 'learning', wallfahrt: 'courier' },
  gerichtsbarkeit: { landfrieden: 'justice', gerichte: 'justice', akten: 'records', justizbote: 'courier', beweiswart: 'inquiry' },
  finanzen: { vorraete: 'supplies', werke: 'works', rechnung: 'records', magazinmeister: 'supplies', bauschreiber: 'works', haushaltsbote: 'courier' },
  spionage: { aufklaerung: 'scouting', ermittler: 'inquiry', fahndung: 'inquiry', fahnder: 'inquiry', nachrichten: 'courier', beweise: 'records', kuriermeister: 'courier', amtskurier: 'courier' },
  diplomatie: { protokoll: 'records', vertraege: 'records', zeichen: 'court', geleitmeister: 'horse', heroldsbote: 'courier' },
  magie: { gutachter: 'inquiry', heilkunde: 'care', bibliothekar: 'learning', kirchenkontakt: 'faith', archivar: 'records', werkstattmeister: 'works', amtsbote: 'courier' },
  unterhaltung: { hofbarde: 'music', erzaehlmeister: 'proclamation', spielleute: 'music', turniere: 'arms', heraldik: 'court', terminwart: 'records', instrumentenwart: 'music' },
};

export const subofficeIcon = (area, id, groupIcon) => officeIcon(postIcons[area]?.[id] || groupIcon);
