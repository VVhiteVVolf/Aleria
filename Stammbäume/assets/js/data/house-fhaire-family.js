import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_FHAIRE_PORTRAITS } from './house-fhaire-portraits.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';

const FHAIRE_HOUSE_ID = 'house-fhaire';
const FHAIRE_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.fhaire;

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
  const houseId = options.houseId === undefined ? FHAIRE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FHAIRE_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === FHAIRE_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, houseId, worldPersonId = '', options = {}) {
  return person(id, name, sex, '????', '????', {
    ...options,
    houseId,
    worldPersonId,
    familyRole: 'married'
  });
}

function awayWoman(id, name, targetHouseName, worldPersonId, options = {}) {
  return person(id, name, 'female', '????', '????', {
    ...options,
    worldPersonId,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, participantIds, options = {}) {
  return createMarriage(id, ...participantIds, { status: 'ended', ...options });
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
  founders: ['unknown-laird-fhaire', 'unknown-founder-wife-fhaire'],
  gearoid: ['gearoid-fhaire', 'laoiseach-ni-riordain-fhaire'],
  rheitlin: ['phelim-trisceil', 'rheitlin-ua-fhaire-trisceil'],
  fachtna: ['mairin-trisceil', 'fachtna-ua-fhaire-trisceil'],
  oilean: ['breandan-wylan', 'oilean-fhaire'],
  aonghus: ['oweta-hwyaden', 'aonghus-fhaire'],
  meara: ['owain-hwyaden', 'meara-fhaire'],
  bedelia: ['beynon-tarw-dinefwr', 'bedelia-ua-fhaire'],
  aithne: ['eynon-tarw-dinefwr', 'aithne-ua-fhaire']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-founders-fhaire': COUPLES.founders,
  'marriage-gearoid-laoiseach-fhaire': COUPLES.gearoid,
  'marriage-phelim-rheitlin-trisceil': COUPLES.rheitlin,
  'marriage-mairin-fachtna-trisceil': COUPLES.fachtna,
  'marriage-breandan-oilean': COUPLES.oilean,
  'marriage-oweta-aonghus-hwyaden': COUPLES.aonghus,
  'marriage-owain-meara-hwyaden': COUPLES.meara,
  'marriage-beynon-bedelia-dinefwr': COUPLES.bedelia,
  'marriage-eynon-aithne-dinefwr': COUPLES.aithne
});

export const HOUSE_FHAIRE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-fhaire',
    title: 'Clan Ua Fhàire',
    motto: '',
    description: 'Antikes Lairdtum der Crannath-Alben in Bhiorach. Der kriegerische und religiöse Clan verehrte besonders Ordates, den Gott der Zeit und Vergangenheit, und war für seine Druiden, Schwertmeister und berittenen Krieger bekannt.',
    emblem: FHAIRE_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES.fhaire
  },
  houses: [
    house(FHAIRE_HOUSE_ID, 'Clan Ua Fhàire', FHAIRE_EMBLEM),
    house('house-riordain', 'Haus Ríordáin'),
    house('house-trisceil', 'Clan Ui Trisceil', WEIDEBUCHT_HOUSE_EMBLEMS.trisceil),
    house('house-wylan', "Haus Wylan O'Cerrigarth", WEIDEBUCHT_HOUSE_EMBLEMS.wylan),
    house('house-hwyaden', 'Haus Hwyaden', WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden),
    house('house-dinefwr', 'Haus Dinefwr', WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr),
    house('house-tir-addawol', 'Haus Tir Addawol', WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'])
  ],
  persons: [
    person('unknown-laird-fhaire', '???', 'male', '????', '????', {
      title: 'Unbekannter Laird des Clans Ua Fhàire',
      lineageRole: 'head',
      notes: 'Die Quelle bezeichnet die Eltern Gearoids und Rhéiltíns nur als unbekanntes Paar.'
    }),
    person('unknown-founder-wife-fhaire', '???', 'female', '????', '????', {
      title: 'Unbekannte Gemahlin des Lairds'
    }),

    person('gearoid-fhaire', 'Gearoid Ua Fhàire', 'male', '????', '????', {
      title: 'Laird des Clans Ua Fhàire',
      lineageRole: 'head'
    }),
    awayWoman(
      'rheitlin-ua-fhaire-trisceil',
      'Rhéitlín Ua Fhàire',
      'Clan Ui Trisceil',
      'person--haus-fhaire--rheitlin-ua-fhaire-trisceil',
      { notes: 'Die Ua-Fhàire-Quelle schreibt den Vornamen abweichend als „Réiltín“.' }
    ),
    spouse('laoiseach-ni-riordain-fhaire', 'Laoiseach Nic Ríordáin', 'female', 'house-riordain'),
    spouse(
      'phelim-trisceil',
      'Phelim Trisceil',
      'male',
      'house-trisceil',
      'person--haus-trisceil--phelim-trisceil'
    ),

    person('fachtna-ua-fhaire-trisceil', 'Fachtna Ua Fhàire', 'male', '????', '????', {
      title: 'Laird des Clans Ua Fhàire',
      lineageRole: 'head',
      worldPersonId: 'person--haus-fhaire--fachtna-ua-fhaire-trisceil'
    }),
    awayWoman(
      'oilean-fhaire',
      'Oileán Fhàire',
      'Haus Wylan',
      'person--haus-fhaire--oilean-fhaire'
    ),
    spouse(
      'mairin-trisceil',
      'Máirín Trisceil',
      'female',
      'house-trisceil',
      'person--haus-trisceil--mairin-trisceil'
    ),
    spouse(
      'breandan-wylan',
      'Breandan Wylan',
      'male',
      'house-wylan',
      'person--haus-wylan--breandan-wylan'
    ),

    person('aonghus-fhaire', 'Aonghus Fhàire', 'male', '????', '????', {
      title: 'Laird des Clans Ua Fhàire',
      lineageRole: 'head',
      worldPersonId: 'person--haus-fhaire--aonghus-fhaire'
    }),
    awayWoman(
      'meara-fhaire',
      'Meara Fhàire',
      'Haus Hwyaden',
      'person--haus-fhaire--meara-fhaire'
    ),
    spouse(
      'oweta-hwyaden',
      'Oweta Hwyaden',
      'female',
      'house-hwyaden',
      'person--haus-hwyaden--oweta-hwyaden'
    ),
    spouse(
      'owain-hwyaden',
      'Owain Hwyaden',
      'male',
      'house-hwyaden',
      'person--haus-hwyaden--owain-hwyaden'
    ),

    awayWoman(
      'bedelia-ua-fhaire',
      'Bedelia Ua Fhàire',
      'Haus Dinefwr',
      'person--haus-fhaire--bedelia-ua-fhaire'
    ),
    awayWoman(
      'aithne-ua-fhaire',
      'Aithne Ua Fhàire',
      'Haus Tir Addawol',
      'person--haus-fhaire--aithne-ua-fhaire'
    ),
    spouse(
      'beynon-tarw-dinefwr',
      'Beynon Tarw',
      'male',
      'house-dinefwr',
      'person--haus-dinefwr--beynon-tarw-dinefwr'
    ),
    spouse(
      'eynon-tarw-dinefwr',
      'Eynon Tarw',
      'male',
      'house-tir-addawol',
      'person--haus-dinefwr--eynon-tarw-dinefwr'
    )
  ],
  partnerships: [
    endedMarriage('marriage-unknown-founders-fhaire', COUPLES.founders),
    endedMarriage('marriage-gearoid-laoiseach-fhaire', COUPLES.gearoid),
    endedMarriage('marriage-phelim-rheitlin-trisceil', COUPLES.rheitlin),
    endedMarriage('marriage-mairin-fachtna-trisceil', COUPLES.fachtna),
    endedMarriage('marriage-breandan-oilean', COUPLES.oilean),
    endedMarriage('marriage-oweta-aonghus-hwyaden', COUPLES.aonghus),
    endedMarriage('marriage-owain-meara-hwyaden', COUPLES.meara),
    endedMarriage('marriage-beynon-bedelia-dinefwr', COUPLES.bedelia),
    endedMarriage('marriage-eynon-aithne-dinefwr', COUPLES.aithne)
  ],
  parentages: [
    ...childrenOf(['gearoid-fhaire', 'rheitlin-ua-fhaire-trisceil'], 'marriage-unknown-founders-fhaire'),
    ...childrenOf(['fachtna-ua-fhaire-trisceil', 'oilean-fhaire'], 'marriage-gearoid-laoiseach-fhaire'),
    ...childrenOf(['aonghus-fhaire', 'meara-fhaire'], 'marriage-mairin-fachtna-trisceil', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Fachtna und Aonghus sind in der Quelle nicht einzeln überlieferte Generationen ausgelassen.',
      extensions: { timeJumpId: 'gap-fachtna-to-aonghus-generation-fhaire' }
    }),
    ...childrenOf(['bedelia-ua-fhaire', 'aithne-ua-fhaire'], 'marriage-oweta-aonghus-hwyaden')
  ],
  cadetBranches: [
    marriedAway('married-away-rheitlin-fhaire-trisceil', 'Clan Ui Trisceil', 'marriage-phelim-rheitlin-trisceil', 'house-trisceil', 'haus-trisceil', WEIDEBUCHT_HOUSE_EMBLEMS.trisceil),
    marriedAway('married-away-oilean-fhaire-wylan', 'Haus Wylan', 'marriage-breandan-oilean', 'house-wylan', 'haus-wylan', WEIDEBUCHT_HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-meara-fhaire-hwyaden', 'Haus Hwyaden', 'marriage-owain-meara-hwyaden', 'house-hwyaden', 'haus-hwyaden', WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden),
    marriedAway('married-away-bedelia-fhaire-dinefwr', 'Haus Dinefwr', 'marriage-beynon-bedelia-dinefwr', 'house-dinefwr', 'haus-dinefwr', WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr),
    marriedAway('married-away-aithne-fhaire-tir-addawol', 'Haus Tir Addawol', 'marriage-eynon-aithne-dinefwr', 'house-tir-addawol', 'haus-tir-addawol', WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'])
  ],
  timeJumps: [
    {
      id: 'gap-fachtna-to-aonghus-generation-fhaire',
      parentPartnershipId: 'marriage-mairin-fachtna-trisceil',
      parentPersonId: '',
      childIds: ['aonghus-fhaire', 'meara-fhaire'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Ua-Fhàire-Generationen',
      notes: 'Der absolute Trenner liegt ausschließlich unter Fachtna und Máirín. Oileáns wegverheirateter Wylan-Zweig speist ihn nicht.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-fhaire',
    houseId: FHAIRE_HOUSE_ID,
    crestSubtitle: 'Antikes Lairdtum der Crannath · Bhiorach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-laird-fhaire',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Clan Ua Fhàire (bereitgestellte Altdaten)',
    sourceNote: 'Die Quelle belegt ein unbekanntes Elternpaar mit den Kindern Gearoid und Réiltín. Gearoid und Laoiseach führen zu Fachtna und Oileán; ausschließlich Fachtna und Máirín führen nach einem seriellen Zeitsprung zur Generation von Aonghus und Meara. Aonghus und Oweta führen zu Bedelia und Aithne. Réiltín/Phelim, Oileán/Breandan, Meara/Owain, Bedelia/Beynon und Aithne/Eynon verwenden dieselben Weltpersonen-, Ehe- und Teilnehmer-IDs wie ihre ausgearbeiteten Gegenakten. Deren Nachkommen erscheinen ausschließlich im jeweils fortgeführten Zielhaus. Die sichtbare Schreibweise Rhéiltín folgt der bestehenden Ui-Trisceil-Gegenakte. Der ausdrücklichen Benutzerkorrektur folgend wird das Lairdtum mit dem eigenen albischen Rang `laird` auf Ritterfürsten-Tier eingeordnet. Sämtliche Portraitlinks der Ua-Fhàire-Quelle gelten als veraltet und wurden nicht importiert. Nur Breandan, Owain, Meara, Oweta, Aonghus, Beynon, Bedelia, Eynon und Aithne verwenden bereits vorhandene kanonische Gegenaktenporträts; alle anderen Personen bleiben beim Systemplatzhalter.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
