import { dutyIcon } from '../../Kontinente/modules/administration/office-duty-icons.mjs';
import { LEHENSWARTE_ID } from './lehenswarte-plan.mjs';

const artwork = {
  arcane: '/IconOrdner/Organisationsicons/Magie.png',
  court: '/IconOrdner/Icons%20f%C3%BCr%20Stand/Ritterf%C3%BCrst.PNG',
  justice: '/IconOrdner/Organisationsicons/Justiz.png',
  horse: '/IconOrdner/Traits%20Icon/Horse.png',
  sailing: '/IconOrdner/Traits%20Icon/Sea_King.png',
  music: '/IconOrdner/Buttom%20Icons/Singen.PNG',
  courier: '/IconOrdner/Cktraits/Trait_traveler.png',
  watch: '/IconOrdner/Cktraits/Trait_education_martial_prowess_4.png',
};

export const officeIcon = key => artwork[key] || dutyIcon(key);
export const COURT_AREA = { id: 'hof', name: 'Hofämter', imageSrc: officeIcon('court') };
export const REGENCY_AREA = { id: 'regentschaft', name: 'Regentschaft', imageSrc: officeIcon('diplomacy') };
export const LEHENSWARTE_AREA = { id: LEHENSWARTE_ID, name: 'Ortsämter und Lehen', imageSrc: officeIcon('diplomacy') };

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
