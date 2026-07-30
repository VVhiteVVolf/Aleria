import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ILLWATH_PORTRAITS } from './house-illwath-portraits.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';

const ILLWATH_HOUSE_ID = 'house-illwath';
const ILLWATH_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.illwath;

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? ILLWATH_HOUSE_ID : options.houseId,
    portrait: HOUSE_ILLWATH_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    status: options.status || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, targetHouse, options = {}) {
  return person(id, name, 'female', birth, options.death || '', {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouse}`,
    tags: options.tags || ['Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['ehangwen-illewod', 'rhondda-llwynog'],
  tarawg: ['tarawg-illwath', 'rheanne-morforwyn'],
  sianwen: ['sianwen-illwath', 'caibrel-ceardaiocht'],
  vorath: ['alicyn-blach', 'vorath-illwath'],
  kynwas: ['kynwas-illwath', 'nessa-cleir'],
  rhianu: ['rhianu-illwath', 'fintan-airt'],
  gwifredd: ['shylene-teyrngarch', 'gwifredd-illwath'],
  branwen: ['branwen-illwath', 'khellen-mhuir']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-ehangwen-rhondda': COUPLES.founders,
  'marriage-tarawg-rheanne-illwath': COUPLES.tarawg,
  'marriage-alicyn-vorath-blach': COUPLES.vorath,
  'marriage-kynwas-nessa-illwath': COUPLES.kynwas,
  'marriage-shylene-gwifredd-teyrngarch': COUPLES.gwifredd
});

function childrenOf(childIds, partnershipId) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'illwath-parentage' }
  );
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_ILLWATH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-illwath',
    title: "Haus Illwath O'Caer Llew",
    motto: '',
    description: 'Ritterfürstliches Kadettenhaus der Illewod aus Löwenberg. Ehangwen Illewod begründete das Geschlecht gemeinsam mit Rhondda Llwynog auf der Grenzburg Caer Llew und erhob die alte Ruine Dun Afalla erneut zum befestigten Sitz.',
    emblem: ILLWATH_EMBLEM,
    houseProfile: SONNENKUESTE_HOUSE_PROFILES.illwath
  },
  houses: [
    house(ILLWATH_HOUSE_ID, "Haus Illwath O'Caer Llew", ILLWATH_EMBLEM),
    house('house-illewod', "Haus Illewod O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.illewod),
    house('house-llwynog', "Haus Llwynog O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.llwynog),
    house('house-morforwyn', 'Haus Morforwyn', SONNENKUESTE_HOUSE_EMBLEMS.morforwyn),
    house('house-ceardaiocht', 'Haus Ceardaíocht'),
    house('house-blach', "Haus Blach O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.blach),
    house('house-cleir', 'Haus Cléir'),
    house('house-airt', 'Haus Airt'),
    house('house-teyrngarch', 'Haus Teyrngarch', SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch),
    house('house-mhuir', 'Haus Mhuir')
  ],
  persons: [
    person('ehangwen-illewod', 'Ehangwen Illewod', 'male', '1652', '1720', {
      houseId: 'house-illewod',
      title: 'Gründer und erster Ritterfürst des Hauses Illwath bis 1720',
      lineageRole: 'head',
      notes: 'Jüngster Spross seiner Illewod-Generation. Ehangwen zog mit graflicher Erlaubnis nach Caer Llew und begründete dort das Kadettenhaus Illwath.'
    }),
    spouse('rhondda-llwynog', 'Rhondda Llwynog', 'female', '1654', '1734', {
      houseId: 'house-llwynog',
      title: 'Mitgründerin des Hauses Illwath'
    }),

    person('tarawg-illwath', 'Tarawg Illwath', 'male', '1672', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Illwath seit 1720',
      lineageRole: 'head'
    }),
    awayWoman('sianwen-illwath', 'Sianwen Illwath', '1674', 'Haus Ceardaíocht'),
    person('vorath-illwath', 'Vorath Illwath', 'male', '1676', ''),
    spouse('rheanne-morforwyn', 'Rheanne Morforwyn', 'female', '1677', '', {
      houseId: 'house-morforwyn',
      notes: 'Das ausdrücklich ausgeschlossene ältere Quellenporträt wird nicht übernommen.'
    }),
    spouse('caibrel-ceardaiocht', 'Caibrel Ceardaíocht', 'male', '1675', '', {
      houseId: 'house-ceardaiocht',
      notes: 'Die Quelltabelle schreibt den Hausnamen einmal Caerdaíocht; die kanonische Schreibweise im Projekt lautet Ceardaíocht.'
    }),
    spouse('alicyn-blach', 'Alicyn Blach', 'female', '1678', '', {
      houseId: 'house-blach'
    }),

    person('kynwas-illwath', 'Kynwas Illwath', 'male', '1696', '', {
      title: 'Erster Erbe des Hauses Illwath',
      lineageRole: 'mainline',
      notes: 'Das Quellenjahr 1996 ist innerhalb der belegten Generationenfolge offenkundig ein Zahlendreher und wird als 1696 geführt.'
    }),
    awayWoman('rhianu-illwath', 'Rhianu Illwath', '1700', 'Haus Airt'),
    person('gwifredd-illwath', 'Gwifredd Illwath', 'male', '1697', '', {
      notes: 'Die Quelle schreibt den Namen Gwiffred; die bestehende Teyrngarch-Gegenakte führt dieselbe Weltperson als Gwifredd.'
    }),
    awayWoman('branwen-illwath', 'Branwen Illwath', '1701', 'Haus Mhuir'),
    spouse('nessa-cleir', 'Nessa Cléir', 'female', '1698', '', {
      houseId: 'house-cleir'
    }),
    spouse('fintan-airt', 'Fintan Airt', 'male', '1700', '', {
      houseId: 'house-airt',
      notes: 'Das ausdrücklich ausgeschlossene ältere Quellenporträt wird nicht übernommen.'
    }),
    spouse('shylene-teyrngarch', 'Shylene Teyrngarch', 'female', '1700', '', {
      houseId: 'house-teyrngarch'
    }),
    spouse('khellen-mhuir', 'Khellen Mhuir', 'male', '1697', '', {
      houseId: 'house-mhuir'
    }),

    person('arthgal-illwath', 'Arthgal Illwath', 'male', '1721', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('sian-illwath', 'Sian Illwath', 'female', '1723', ''),
    person('gawl-illwath', 'Gawl Illwath', 'male', '1726', '', {
      title: 'Dritter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('urien-illwath', 'Urien Illwath', 'male', '1723', ''),
    person('mared-illwath', 'Mared Illwath', 'female', '1725', '')
  ],
  partnerships: [
    createMarriage('marriage-ehangwen-rhondda', ...COUPLES.founders, { status: 'ended', end: '1720' }),
    createMarriage('marriage-tarawg-rheanne-illwath', ...COUPLES.tarawg),
    createMarriage('marriage-sianwen-caibrel-illwath', ...COUPLES.sianwen),
    createMarriage('marriage-alicyn-vorath-blach', ...COUPLES.vorath),
    createMarriage('marriage-kynwas-nessa-illwath', ...COUPLES.kynwas),
    createMarriage('marriage-rhianu-fintan-illwath', ...COUPLES.rhianu),
    createMarriage('marriage-shylene-gwifredd-teyrngarch', ...COUPLES.gwifredd),
    createMarriage('marriage-branwen-khellen-illwath', ...COUPLES.branwen)
  ],
  parentages: [
    ...childrenOf(['tarawg-illwath', 'sianwen-illwath', 'vorath-illwath'], 'marriage-ehangwen-rhondda'),
    ...childrenOf(['kynwas-illwath', 'rhianu-illwath'], 'marriage-tarawg-rheanne-illwath'),
    ...childrenOf(['gwifredd-illwath', 'branwen-illwath'], 'marriage-alicyn-vorath-blach'),
    ...childrenOf(['arthgal-illwath', 'sian-illwath', 'gawl-illwath'], 'marriage-kynwas-nessa-illwath'),
    ...childrenOf(['urien-illwath', 'mared-illwath'], 'marriage-shylene-gwifredd-teyrngarch')
  ],
  cadetBranches: [
    marriedAway('married-away-sianwen-illwath-ceardaiocht', 'Haus Ceardaíocht', 'marriage-sianwen-caibrel-illwath', 'house-ceardaiocht'),
    marriedAway('married-away-rhianu-illwath-airt', 'Haus Airt', 'marriage-rhianu-fintan-illwath', 'house-airt'),
    marriedAway('married-away-branwen-illwath-mhuir', 'Haus Mhuir', 'marriage-branwen-khellen-illwath', 'house-mhuir')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-ehangwen-rhondda',
    houseId: ILLWATH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Kadettenhaus der Illewod aus Löwenberg',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ehangwen-illewod',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Illwath O'Caer Llew (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Partnerschaften, Elternschaften und Erbfolge folgen der bereitgestellten Illwath-Tabelle. Ehangwens männliches Geschlecht ist durch Quelltext und Porträt belegt; Rhondda ist seine Ehefrau. Das Hauswappen steht direkt unter ihrem Gründerpaar, bevor Tarawg, Sianwen und Vorath folgen. Der offenkundige Zahlendreher 1996 bei Kynwas wird generationengerecht zu 1696 korrigiert. Gwiffred wird anhand der Teyrngarch-Gegenakte als Gwifredd normalisiert; Caerdaíocht zur bestehenden Projektschreibweise Ceardaíocht. Die Partnerschaften Ehangwen/Rhondda, Vorath/Alicyn und Gwifredd/Shylene verwenden dieselben IDs und Weltidentitäten wie ihre Gegenakten; Kinder werden ausschließlich im fortgeführten Illwath-Zweig geführt. Sianwen, Rhianu und Branwen besitzen direkte Wegverheiratet-Knoten. Die jüngste Generation bleibt auf ausdrückliche Vorgabe vollständig unverlobt. Die ausdrücklich ausgeschlossenen älteren Porträts von Rheanne Morforwyn und Fintan Airt werden nicht übernommen. Wiederholte generische Silhouetten werden ebenfalls nicht als individuelle Bilddateien importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    chartViewport: { initialPosition: 'focus', initialScale: 0.62 }
  }
});
