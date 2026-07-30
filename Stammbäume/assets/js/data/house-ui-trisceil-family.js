import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_UI_TRISCEIL_PORTRAITS } from './house-ui-trisceil-portraits.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';

const UI_TRISCEIL_HOUSE_ID = 'house-trisceil';
const UI_TRISCEIL_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.trisceil;

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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function person(id, name, sex, birth = '????', death = '????', options = {}) {
  const houseId = options.houseId === undefined ? UI_TRISCEIL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_UI_TRISCEIL_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === UI_TRISCEIL_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, houseId, options = {}) {
  return person(id, name, sex, '????', '????', {
    ...options,
    houseId,
    familyRole: 'married'
  });
}

function awayWoman(id, name, targetHouseName, options = {}) {
  return person(id, name, 'female', '????', '????', {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold'
  });
}

const COUPLES = Object.freeze({
  founders: ['unknown-mor-tiarna-trisceil', 'unknown-founder-wife-trisceil'],
  phelim: ['phelim-trisceil', 'rheitlin-ua-fhaire-trisceil'],
  sadbh: ['melwas-wylan', 'sadbbh-trisceil'],
  fergal: ['fergal-trisceil', 'meabh-ni-riordain-trisceil'],
  mairin: ['mairin-trisceil', 'fachtna-ua-fhaire-trisceil'],
  tadhgin: ['merlion-wylan', 'tadhgin-trisceil']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-founders-trisceil': COUPLES.founders,
  'marriage-phelim-rheitlin-trisceil': COUPLES.phelim,
  'marriage-melwas-sadbbh': COUPLES.sadbh,
  'marriage-fergal-meabh-trisceil': COUPLES.fergal,
  'marriage-mairin-fachtna-trisceil': COUPLES.mairin,
  'marriage-merlion-tadhgin': COUPLES.tadhgin
});

export const HOUSE_UI_TRISCEIL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-trisceil',
    title: 'Clan Ui Trisceil',
    motto: '',
    description: 'Antikes Mor Tiarnatum der Crannath-Alben in der Weidebucht. Der Clan herrschte einst aus Talamhard über das Herz der Region, verlor Stadt und Einfluss jedoch in den Kriegen gegen die Norrnaigh. Seine letzten belegten Linien gingen in Ua Fhàire und Wylan auf.',
    emblem: UI_TRISCEIL_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES.trisceil
  },
  houses: [
    house(UI_TRISCEIL_HOUSE_ID, 'Clan Ui Trisceil', UI_TRISCEIL_EMBLEM),
    house('house-fhaire', 'Clan Ua Fhàire', WEIDEBUCHT_HOUSE_EMBLEMS.fhaire),
    house('house-riordain', 'Haus Ríordáin'),
    house('house-wylan', "Haus Wylan O'Cerrigarth", WEIDEBUCHT_HOUSE_EMBLEMS.wylan)
  ],
  persons: [
    person('unknown-mor-tiarna-trisceil', '???', 'male', '????', '????', {
      title: 'Unbekannter Mor Tiarna des Clans Ui Trisceil',
      lineageRole: 'head',
      notes: 'Die Quelle bezeichnet die Eltern Phelims und Sadbhs nur als unbekanntes Paar.'
    }),
    person('unknown-founder-wife-trisceil', '???', 'female', '????', '????', {
      title: 'Unbekannte Gemahlin des Mor Tiarna'
    }),

    person('phelim-trisceil', 'Phelim Trisceil', 'male', '????', '????', {
      title: 'Mor Tiarna des Clans Ui Trisceil',
      lineageRole: 'head'
    }),
    awayWoman('sadbbh-trisceil', 'Sadbh Trisceil', 'Haus Wylan', {
      notes: 'Die technische Personen-ID bleibt mit der älteren Wylan-Gegenakte kompatibel, die den Namen abweichend als „Sadbbh“ schreibt.'
    }),
    spouse('rheitlin-ua-fhaire-trisceil', 'Rhéitlín Ua Fhàire', 'female', 'house-fhaire'),
    spouse('melwas-wylan', 'Melwas Wylan', 'male', 'house-wylan', {
      title: 'Gründer des Hauses Wylan'
    }),

    person('fergal-trisceil', 'Fergal Trisceil', 'male', '????', '????', {
      title: 'Mor Tiarna des Clans Ui Trisceil',
      lineageRole: 'head'
    }),
    awayWoman('mairin-trisceil', 'Máirín Trisceil', 'Clan Ua Fhàire'),
    spouse('meabh-ni-riordain-trisceil', 'Meabh Nic Ríordáin', 'female', 'house-riordain'),
    spouse('fachtna-ua-fhaire-trisceil', 'Fachtna Ua Fhàire', 'male', 'house-fhaire'),

    awayWoman('tadhgin-trisceil', 'Tadhgín Trisceil', 'Haus Wylan', {
      lineageRole: 'mainline',
      title: 'Letzte namentlich überlieferte Trisceil · Wegverheiratet an Haus Wylan'
    }),
    spouse('merlion-wylan', 'Merlion Wylan', 'male', 'house-wylan', {
      title: 'Graf von Cerrigarth'
    })
  ],
  partnerships: [
    endedMarriage('marriage-unknown-founders-trisceil', ...COUPLES.founders),
    endedMarriage('marriage-phelim-rheitlin-trisceil', ...COUPLES.phelim),
    endedMarriage('marriage-melwas-sadbbh', ...COUPLES.sadbh),
    endedMarriage('marriage-fergal-meabh-trisceil', ...COUPLES.fergal),
    endedMarriage('marriage-mairin-fachtna-trisceil', ...COUPLES.mairin),
    endedMarriage('marriage-merlion-tadhgin', ...COUPLES.tadhgin)
  ],
  parentages: [
    ...childrenOf(['phelim-trisceil', 'sadbbh-trisceil'], 'marriage-unknown-founders-trisceil'),
    ...childrenOf(['fergal-trisceil', 'mairin-trisceil'], 'marriage-phelim-rheitlin-trisceil'),
    ...childrenOf(['tadhgin-trisceil'], 'marriage-fergal-meabh-trisceil', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Fergal und Tadhgín sind in der Quelle nicht einzeln überlieferte Generationen ausgelassen.',
      extensions: { timeJumpId: 'gap-fergal-to-tadhgin-trisceil' }
    })
  ],
  cadetBranches: [
    marriedAway('married-away-sadbh-trisceil-wylan', 'Haus Wylan', 'marriage-melwas-sadbbh', 'house-wylan', 'haus-wylan', WEIDEBUCHT_HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-mairin-trisceil-fhaire', 'Clan Ua Fhàire', 'marriage-mairin-fachtna-trisceil', 'house-fhaire', 'haus-fhaire', WEIDEBUCHT_HOUSE_EMBLEMS.fhaire),
    marriedAway('married-away-tadhgin-trisceil-wylan', 'Haus Wylan', 'marriage-merlion-tadhgin', 'house-wylan', 'haus-wylan', WEIDEBUCHT_HOUSE_EMBLEMS.wylan)
  ],
  timeJumps: [
    {
      id: 'gap-fergal-to-tadhgin-trisceil',
      parentPartnershipId: 'marriage-fergal-meabh-trisceil',
      parentPersonId: '',
      childIds: ['tadhgin-trisceil'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Trisceil-Generationen',
      notes: 'Der absolute Trenner liegt ausschließlich unter Fergal und Meabh; Máiríns wegverheirateter Ua-Fhàire-Zweig speist ihn nicht.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-trisceil',
    houseId: UI_TRISCEIL_HOUSE_ID,
    crestSubtitle: 'Antikes Mor Tiarnatum der Crannath · Talamhard',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-mor-tiarna-trisceil',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Clan Ui Trisceil (bereitgestellte Altdaten)',
    sourceNote: 'Die Quelle belegt ein unbekanntes Elternpaar mit den Kindern Phelim und Sadbh. Phelim und Rhéitlín führen zu Fergal und Máirín; ausschließlich Fergals Ehe mit Meabh führt nach einem seriellen Zeitsprung zur späteren Tadhgín-Generation. Sadbh/Melwas und Tadhgín/Merlion verwenden dieselben Weltpersonen- und Ehe-IDs wie die ausgearbeitete Wylan-Gegenakte. Ihre Wylan-Nachkommen werden ausschließlich dort dargestellt. Máirín besitzt einen direkten Wegverheiratet-Knoten zu Ua Fhàire. Die technische Schreibweise `sadbbh-trisceil` bleibt zur Gegenaktenkompatibilität erhalten, sichtbar folgt der Name der Ui-Trisceil-Quelle. Sämtliche Portraitlinks dieser Quelle gelten als veraltet und wurden nicht importiert. Nur Melwas, Sadbh, Merlion und Tadhgín verwenden die bereits vorhandenen neueren Wylan-Porträts; alle anderen Personen bleiben beim Systemplatzhalter.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
