import { getHouseRank } from '../../domain/house-profile.js';
import {
  normalizeBiographyData,
  sanitizeBiographyStatsForFirestore
} from '../person-biography/person-biography-model.js';

export const HOUSE_BIOGRAPHY_EXTENSION_ID = 'houseBiographyModule';
export const HOUSE_BIOGRAPHY_SCHEMA = 'aleria.house-module';
export const HOUSE_BIOGRAPHY_SCHEMA_VERSION = 1;

const DEFAULT_DESCRIPTION = 'Beschreibe Ursprung, Werte und die gesellschaftliche Stellung dieses Hauses.';

function text(value, fallback = '') {
  return String(value || fallback).trim();
}

function normalizeStats(value) {
  return Array.isArray(value)
    ? value.map(item => (
        Array.isArray(item)
          ? [text(item[0]), text(item[1])]
          : [text(item?.label), text(item?.value)]
      )).filter(([label, entry]) => label || entry)
    : [];
}

function normalizeHouseData(value = {}) {
  const normalized = normalizeBiographyData(value);
  return {
    ...normalized,
    biographyTitle: text(value.biographyTitle, 'Über dieses Haus'),
    biographyText: text(value.biographyText, DEFAULT_DESCRIPTION),
    abilitiesTitle: text(value.abilitiesTitle, 'Einflussbereiche & Zuständigkeiten'),
    historyTitle: text(value.historyTitle, 'Geschichte des Hauses'),
    worksTitle: text(value.worksTitle, 'Bekannte Taten & Ereignisse'),
    triviaTitle: text(value.triviaTitle, 'Besonderheiten'),
    quotesTitle: text(value.quotesTitle, 'Hausworte & Zitate'),
    connectionsTitle: text(value.connectionsTitle, 'Verbündete, Rivalen & Vasallen'),
    documentsTitle: text(value.documentsTitle, 'Eigentum & Besitz'),
    crestImage: text(value.crestImage)
  };
}

export function normalizeHouseBiographyModule(value = {}) {
  const houseSource = value.house && typeof value.house === 'object'
    ? value.house
    : value.biography && typeof value.biography === 'object'
      ? value.biography
      : value;
  return {
    schema: HOUSE_BIOGRAPHY_SCHEMA,
    schemaVersion: HOUSE_BIOGRAPHY_SCHEMA_VERSION,
    pageTitle: text(value.pageTitle, 'I — Haus'),
    image: text(value.image),
    imageWidth: 30,
    imageSquare: true,
    housePage: true,
    description: text(value.description || houseSource.biographyText, DEFAULT_DESCRIPTION),
    stats: normalizeStats(value.stats),
    house: normalizeHouseData(houseSource),
    commentSequence: Array.isArray(value.commentSequence) ? [...value.commentSequence] : [],
    quote: text(value.quote, '„Ein Leitsatz oder Hauswort dieses Hauses.“'),
    quoteBy: text(value.quoteBy, '— Hauschronik')
  };
}

export function getHouseBiographyModule(family) {
  const stored = family?.extensions?.[HOUSE_BIOGRAPHY_EXTENSION_ID];
  return stored && typeof stored === 'object'
    ? normalizeHouseBiographyModule(stored)
    : null;
}

function currentHouse(family) {
  return family?.houses?.find(house => house.id === family?.lineage?.houseId)
    || family?.houses?.[0]
    || null;
}

function houseHead(family) {
  return family?.persons?.find(person => person.lineageRole === 'head' && person.status === 'alive')
    || family?.persons?.find(person => person.lineageRole === 'head')
    || null;
}

function houseLands(profile = {}) {
  return [profile.seat, profile.barony, profile.county, profile.kingdom].filter(Boolean).join(' · ');
}

function houseLieges(profile = {}) {
  const names = Array.isArray(profile.liegeHouses)
    ? profile.liegeHouses.map(entry => entry?.name).filter(Boolean)
    : [];
  return names.length ? names.join(' & ') : profile.liegeHouseName || '';
}

export function createHouseBiographyModule(family = {}) {
  const house = currentHouse(family);
  const profile = family.document?.houseProfile || {};
  const title = family.document?.title || house?.name || 'Unbenanntes Haus';
  const motto = family.document?.motto || house?.motto || '„Ein Leitsatz oder Hauswort dieses Hauses.“';
  return normalizeHouseBiographyModule({
    pageTitle: 'I — Haus',
    image: '',
    description: family.document?.description || DEFAULT_DESCRIPTION,
    stats: [
      ['Voller Name', title],
      ['Stammsitz', profile.seat || 'Noch festlegen'],
      ['Gegründet', 'Noch festlegen'],
      ['Oberhaupt', houseHead(family)?.name || 'Noch festlegen'],
      ['Erbe', 'Noch festlegen'],
      ['Lehensherr', houseLieges(profile) || 'Noch festlegen'],
      ['Vasallen', 'Noch festlegen'],
      ['Ländereien', houseLands(profile) || 'Noch festlegen'],
      ['Wappen', 'Noch festlegen'],
      ['Hausfarben', 'Noch festlegen'],
      ['Rang', getHouseRank(profile.rankId).label],
      ['Status', house?.status === 'extinct' ? 'Ausgestorben' : 'Aktiv']
    ],
    house: {
      crestImage: family.document?.emblem || house?.emblem || '',
      sideWidth: 100,
      connectionPortraitHeight: 68,
      connectionTextOffset: 0,
      biographyTitle: 'Über dieses Haus',
      biographyText: family.document?.description || DEFAULT_DESCRIPTION,
      abilitiesTitle: 'Einflussbereiche & Zuständigkeiten',
      abilities: [
        { icon: '../IconOrdner/Organisationsicons/Militär.png', title: 'Militär', detail: 'Streitmacht, Wehrpflicht oder Rittergefolge des Hauses.' },
        { icon: '../IconOrdner/Organisationsicons/Diplomatie.png', title: 'Diplomatie', detail: 'Bündnisse, Handelsabkommen und Beziehungen zu anderen Häusern.' },
        { icon: '../IconOrdner/Organisationsicons/Magie.png', title: 'Magie', detail: 'Arkane Tradition, Hofmagier oder magisches Erbe des Hauses.' }
      ],
      extraSections: [],
      historyTitle: 'Geschichte des Hauses',
      historyText: 'Was hat dieses Haus geprägt, welche Wendepunkte gab es, welche Spuren bleiben?',
      worksTitle: 'Bekannte Taten & Ereignisse',
      works: ['Erstes bekanntes Ereignis in der Geschichte des Hauses.', 'Zweites bedeutendes Ereignis.'],
      triviaTitle: 'Besonderheiten',
      trivia: ['Ein prägnantes Detail über das Haus.', 'Ein Gerücht oder eine Eigenheit.'],
      quotesTitle: 'Hausworte & Zitate',
      quotes: ['„Ein Leitsatz oder Hauswort.“'],
      connectionsTitle: 'Verbündete, Rivalen & Vasallen',
      connections: [
        { type: 'heading', title: 'Verbündete Häuser', detail: '' },
        { type: 'connection', name: 'Verbündetes Haus', detail: 'Art des Bündnisses', image: '', imageFormat: 'square' },
        { type: 'heading', title: 'Rivalen', detail: '' },
        { type: 'connection', name: 'Rivalisierendes Haus', detail: 'Grund der Rivalität', image: '', imageFormat: 'square' }
      ],
      documentsTitle: 'Eigentum & Besitz',
      documents: [
        { icon: '', title: 'Stammsitz', text: 'Ländereien, Burg und Einkünfte des Hauses.', link: '' },
        { icon: '', title: 'Wappenbrief', text: 'Gründungsurkunde und verbriefte Rechte.', link: '' }
      ],
      footer: 'Blut, Ehre und das Wort des Hauses.'
    },
    quote: motto,
    quoteBy: family.document?.motto || house?.motto ? '' : '— Hauschronik'
  });
}

export function sanitizeHouseBiographyForFirestore(module) {
  const normalized = normalizeHouseBiographyModule(module);
  return {
    ...normalized,
    stats: sanitizeBiographyStatsForFirestore(normalized.stats)
  };
}

export function parseHouseBiographyImportPayload(value) {
  const source = value?.houseBiographyModule
    || value?.page
    || value?.pages?.find?.(page => page?.housePage)
    || value;
  return normalizeHouseBiographyModule(source || {});
}
