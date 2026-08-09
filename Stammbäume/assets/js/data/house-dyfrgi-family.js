import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createMigrationHouseBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DYFRGI_PORTRAITS } from './house-dyfrgi-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES,
  KLAUENINSEL_ORIGIN_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';

const MYNYDDHARBWR_HOUSE_ID = 'house-dyfrgi';
const CAER_CRYFTLAWD_HOUSE_ID = 'house-dyfrgi-caer-cryftlawd';
const DYFRGI_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.dyfrgi;
const FOUNDER_TIME_JUMP_ID = 'gap-breseal-to-mawr-idwal-dyfrgi';

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

const HEAD_IDS = new Set([
  'breseal-dobhar',
  'mawr-dyfrgi',
  'gwayne-dyfrgi',
  'mevyn-dyfrgi',
  'lyr-dyfrgi'
]);

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

function worldPersonIdFor(houseId, id) {
  if (houseId === MYNYDDHARBWR_HOUSE_ID || houseId === CAER_CRYFTLAWD_HOUSE_ID) {
    return `person--haus-dyfrgi--${id}`;
  }
  return '';
}

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || worldPersonIdFor(houseId, id),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_DYFRGI_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || (HEAD_IDS.has(id) ? 'head' : 'branch'),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function originPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(MYNYDDHARBWR_HOUSE_ID, id, name, sex, birth, death, options);
}

function caerCryftlawdPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(CAER_CRYFTLAWD_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'dyfrgi-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold',
    subtitle: `Wegverheiratet an ${name}`
  });
}

const ORIGIN_HOUSES = Object.freeze([
  house(MYNYDDHARBWR_HOUSE_ID, "Haus Dyfrgi O'Mynyddharbwr", DYFRGI_EMBLEM),
  house(CAER_CRYFTLAWD_HOUSE_ID, "Haus Dyfrgi O'Caer Cryftlawd", DYFRGI_EMBLEM),
  house('house-blodyn', "Haus Blodyn O'Llyndor", 'assets/images/houses/Blütenland/haus-blodyn.png'),
  house('house-udgorn', 'Haus Udgorn'),
  house('house-aderyn', 'Haus Aderyn', 'assets/images/houses/Tal der Milane/haus-aderyn.png'),
  house('house-balauric', 'Haus Balauric'),
  house('house-morlais', 'Haus Morlais'),
  house('house-forsyth', 'Haus Forsyth'),
  house('house-bochdew', 'Haus Bochdew')
]);

const TARGET_HOUSES = Object.freeze([
  house(CAER_CRYFTLAWD_HOUSE_ID, "Haus Dyfrgi O'Caer Cryftlawd", DYFRGI_EMBLEM),
  house(MYNYDDHARBWR_HOUSE_ID, "Haus Dyfrgi O'Mynyddharbwr", DYFRGI_EMBLEM),
  house('house-blodyn', "Haus Blodyn O'Llyndor", 'assets/images/houses/Blütenland/haus-blodyn.png'),
  house('house-udgorn', 'Haus Udgorn')
]);

const ORIGIN_PARTNERS = Object.freeze({
  founders: ['morfydd-blodyn', 'breseal-dobhar'],
  mawr: ['mawr-dyfrgi', 'menna-udgorn'],
  idwal: ['idwal-dyfrgi', 'meaghan-aderyn'],
  gwayne: ['gwayne-dyfrgi', 'wenna-balauric'],
  myf: ['myf-dyfrgi', 'meuric-morlais'],
  mervyn: ['elin-blodyn', 'mevyn-dyfrgi'],
  rhondda: ['rhondda-dyfrgi', 'argyle-forsyth'],
  tudur: ['tudur-dyfrgi', 'anwen-spouse-dyfrgi'],
  oth: ['oth-dyfrgi', 'bronwen-bochdew']
});

export const HOUSE_DYFRGI_MYNYDDHARBWR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dyfrgi',
    title: "Haus Dyfrgi O'Mynyddharbwr",
    motto: '',
    description: 'Vollständige Herkunftsakte des alten vennyrianischen Grafenhauses aus Mynyddharbwr. Mervyn beginnt 1720 die getrennte Ritterfürstenlinie von Caer Cryftlawd; seine Nachkommen werden ausschließlich dort fortgeführt.',
    emblem: DYFRGI_EMBLEM,
    houseProfile: KLAUENINSEL_ORIGIN_HOUSE_PROFILES['dyfrgi-mynyddharbwr']
  },
  houses: [...ORIGIN_HOUSES],
  persons: [
    originPerson('breseal-dobhar', 'Breseal Dobhar', 'male', '????', '????', {
      worldPersonId: 'person--haus-dobhar--breseal-dobhar',
      familyRole: 'founder',
      lineageRole: 'head',
      title: "Letzter Dobhar · Gründer und erster Graf des Hauses Dyfrgi O'Mynyddharbwr"
    }),
    originPerson('morfydd-blodyn', 'Morfydd Blodyn', 'female', '????', '????', {
      houseId: 'house-blodyn',
      familyRole: 'founder',
      title: 'Prinzessin von Vennyr · Mitgründerin des Hauses Dyfrgi'
    }),

    originPerson('mawr-dyfrgi', 'Mawr Dyfrgi', 'male', '1629', '1685', {
      title: 'Graf von Mynyddharbwr'
    }),
    originPerson('menna-udgorn', 'Menna Udgorn', 'female', '1630', '1681', {
      houseId: 'house-udgorn',
      familyRole: 'married'
    }),
    originPerson('idwal-dyfrgi', 'Idwal Dyfrgi', 'male', '1631', '1693'),
    originPerson('meaghan-aderyn', 'Meaghan Aderyn', 'female', '1632', '1666', {
      houseId: 'house-aderyn',
      familyRole: 'married'
    }),

    originPerson('gwayne-dyfrgi', 'Gwayne Dyfrgi', 'male', '1648', '1720', {
      title: 'Letzter Graf von Mynyddharbwr'
    }),
    originPerson('wenna-balauric', 'Wenna Balauric', 'female', '1650', '1721', {
      houseId: 'house-balauric',
      familyRole: 'married'
    }),
    originPerson('myf-dyfrgi', 'Myf Dyfrgi', 'female', '1652', '1704', {
      title: 'Wegverheiratet an Haus Morlais',
      tags: ['Wegverheiratet']
    }),
    originPerson('meuric-morlais', 'Meuric Morlais', 'male', '1649', '1720', {
      houseId: 'house-morlais',
      familyRole: 'married'
    }),

    originPerson('mevyn-dyfrgi', 'Mervyn Dyfrgi', 'male', '1672', '', {
      lineageRole: 'head',
      title: 'Begründer und Ritterfürst der Caer-Cryftlawd-Linie seit 1720',
      notes: 'Die technische Personen-ID bleibt zur Synchronisation mit der Blodyn-Gegenakte unverändert; die sichtbare Schreibweise folgt der Quelle: Mervyn.'
    }),
    originPerson('elin-blodyn', 'Elin Blodyn', 'female', '1675', '', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    originPerson('rhondda-dyfrgi', 'Rhondda Dyfrgi', 'female', '1668', '1735', {
      title: 'Wegverheiratet an Haus Forsyth',
      tags: ['Wegverheiratet']
    }),
    originPerson('argyle-forsyth', 'Argyle Forsyth', 'male', '1667', '1717', {
      houseId: 'house-forsyth',
      familyRole: 'married'
    }),
    originPerson('tudur-dyfrgi', 'Tudur Dyfrgi', 'male', '1674', '1720'),
    originPerson('anwen-spouse-dyfrgi', 'Anwen', 'female', '1675', '1720', {
      houseId: '',
      familyRole: 'married'
    }),

    originPerson('oth-dyfrgi', 'Oth Dyfrgi', 'male', '1693', '1725'),
    originPerson('bronwen-bochdew', 'Bronwen Bochdew', 'female', '1695', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    originPerson('orbo-dyfrgi', 'Orbo Dyfrgi', 'male', '1713', '1720')
  ],
  partnerships: [
    endedMarriage('marriage-morfydd-breseal', ...ORIGIN_PARTNERS.founders),
    endedMarriage('marriage-mawr-menna-dyfrgi', ...ORIGIN_PARTNERS.mawr, '1681'),
    endedMarriage('marriage-idwal-meaghan-dyfrgi', ...ORIGIN_PARTNERS.idwal, '1666'),
    endedMarriage('marriage-gwayne-wenna-dyfrgi', ...ORIGIN_PARTNERS.gwayne, '1720'),
    endedMarriage('marriage-myf-meuric-dyfrgi', ...ORIGIN_PARTNERS.myf, '1704'),
    createMarriage('marriage-elin-mevyn', ...ORIGIN_PARTNERS.mervyn),
    endedMarriage('marriage-rhondda-argyle-dyfrgi', ...ORIGIN_PARTNERS.rhondda, '1717'),
    endedMarriage('marriage-tudur-anwen-dyfrgi', ...ORIGIN_PARTNERS.tudur, '1720'),
    endedMarriage('marriage-oth-bronwen-dyfrgi', ...ORIGIN_PARTNERS.oth, '1720')
  ],
  parentages: [
    ...childrenOf(['mawr-dyfrgi', 'idwal-dyfrgi'], ORIGIN_PARTNERS.founders, 'marriage-morfydd-breseal', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und den ab 1629 belegten Brüdern liegen nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['gwayne-dyfrgi'], ORIGIN_PARTNERS.mawr, 'marriage-mawr-menna-dyfrgi'),
    ...childrenOf(['myf-dyfrgi'], ORIGIN_PARTNERS.idwal, 'marriage-idwal-meaghan-dyfrgi'),
    ...childrenOf(['mevyn-dyfrgi', 'rhondda-dyfrgi', 'tudur-dyfrgi'], ORIGIN_PARTNERS.gwayne, 'marriage-gwayne-wenna-dyfrgi'),
    ...childrenOf(['oth-dyfrgi'], ORIGIN_PARTNERS.tudur, 'marriage-tudur-anwen-dyfrgi'),
    ...childrenOf(['orbo-dyfrgi'], ORIGIN_PARTNERS.oth, 'marriage-oth-bronwen-dyfrgi')
  ],
  cadetBranches: [
    marriedAway('married-away-myf-dyfrgi-morlais', 'Haus Morlais', 'marriage-myf-meuric-dyfrgi', 'house-morlais', 'haus-morlais'),
    marriedAway('married-away-rhondda-dyfrgi-forsyth', 'Haus Forsyth', 'marriage-rhondda-argyle-dyfrgi', 'house-forsyth', 'haus-forsyth'),
    createMigrationHouseBranch({
      id: 'migration-mervyn-dyfrgi-caer-cryftlawd',
      name: "Haus Dyfrgi O'Caer Cryftlawd",
      parentPersonId: 'mevyn-dyfrgi',
      houseId: CAER_CRYFTLAWD_HOUSE_ID,
      targetFamilyId: 'haus-dyfrgi-caer-cryftlawd',
      emblem: DYFRGI_EMBLEM,
      founded: '1720',
      subtitle: 'Von Mervyn begründete Ritterfürstenlinie in Caer Cryftlawd',
      crestFrame: 'gold',
      extensions: { offshootPlacement: 'below' },
      notes: 'Der nicht-genealogische Übergang hängt allein und geradlinig unter Mervyn. Elin schließt in der Zielakte als Ehefrau an; sämtliche Nachkommen des Paares werden nur dort fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-morfydd-breseal',
      sharedParentPartnershipIds: [],
      childIds: ['mawr-dyfrgi', 'idwal-dyfrgi'],
      years: 0,
      fromYear: '????',
      toYear: '1629',
      label: 'Die belegte Linie setzt 1629 wieder ein',
      notes: 'Absoluter Generationentrenner: Breseal und Morfydd, Hauswappen, genau ein serieller Zeitsprung und erst danach Mawr und Idwal.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-morfydd-breseal',
    houseId: MYNYDDHARBWR_HOUSE_ID,
    crestSubtitle: 'Altes vennyrianisches Grafenhaus von Mynyddharbwr',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'breseal-dobhar',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-dyfrgi-caer-cryftlawd',
    sourceRevision: 2,
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Mynyddharbwr-Herkunftsakte nach der Dyfrgi-Tabelle. Breseal Dobhar und Morfydd Blodyn begründen das umbenannte Haus; der einzige Haus-Zeitsprung führt seriell zu Mawr und Idwal. Gwayne ist ausschließlich Sohn Mawr/Mennas, Myf ausschließlich Tochter Idwal/Meaghans. Mervyn bleibt als Sohn Gwaynes und Wennas sichtbar, während seine Kinder allein in der Caer-Cryftlawd-Akte fortgeführt werden. Oths Seitenzweig verbleibt trotz seines Todes nach 1720 in der Herkunftsakte, weil Mervyn ausdrücklich die neue Linie begründet.'
  }
});

const TARGET_PARTNERS = Object.freeze({
  mervyn: ['elin-blodyn', 'mevyn-dyfrgi'],
  lyr: ['lyr-dyfrgi', 'tilda-spouse-dyfrgi'],
  ynyr: ['ynyr-dyfrgi', 'iona-udgorn'],
  glyn: ['glyn-dyfrgi', 'greer-spouse-dyfrgi']
});

export const HOUSE_DYFRGI_CAER_CRYFTLAWD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dyfrgi-caer-cryftlawd',
    title: "Haus Dyfrgi O'Caer Cryftlawd",
    motto: '',
    description: 'Die seit 1720 getrennt geführte Ritterfürstenlinie von Caer Cryftlawd. Sie beginnt mit Mervyn Dyfrgi und Elin Blodyn und führt ausschließlich deren drei Söhne sowie ihre Kindeskinder fort.',
    emblem: DYFRGI_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.dyfrgi
  },
  houses: [...TARGET_HOUSES],
  persons: [
    caerCryftlawdPerson('mevyn-dyfrgi', 'Mervyn Dyfrgi', 'male', '1672', '', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Gründer und Ritterfürst von Caer Cryftlawd seit 1720',
      notes: 'Die technische Personen-ID bleibt zur Synchronisation mit der Blodyn-Gegenakte unverändert; die sichtbare Schreibweise folgt der Quelle: Mervyn.'
    }),
    caerCryftlawdPerson('elin-blodyn', 'Elin Blodyn', 'female', '1675', '', {
      houseId: 'house-blodyn',
      familyRole: 'founder'
    }),

    caerCryftlawdPerson('lyr-dyfrgi', 'Lyr Dyfrgi', 'male', '1692', '', {
      lineageRole: 'mainline',
      title: 'Erster Erbe des Hauses Dyfrgi'
    }),
    caerCryftlawdPerson('tilda-spouse-dyfrgi', 'Tilda', 'female', '1695', '', {
      houseId: '',
      familyRole: 'married'
    }),
    caerCryftlawdPerson('ynyr-dyfrgi', 'Ynyr Dyfrgi', 'male', '1697', ''),
    caerCryftlawdPerson('iona-udgorn', 'Iona Udgorn', 'female', '1699', '', {
      houseId: 'house-udgorn',
      familyRole: 'married'
    }),
    caerCryftlawdPerson('glyn-dyfrgi', 'Glyn Dyfrgi', 'male', '1709', ''),
    caerCryftlawdPerson('greer-spouse-dyfrgi', 'Greer', 'female', '1710', '', {
      houseId: '',
      familyRole: 'married'
    }),

    caerCryftlawdPerson('ifan-dyfrgi', 'Ifan Dyfrgi', 'male', '1721', '', {
      lineageRole: 'mainline',
      title: 'Zweiter Erbe des Hauses Dyfrgi'
    }),
    caerCryftlawdPerson('eira-dyfrgi', 'Eira Dyfrgi', 'female', '1723', ''),
    caerCryftlawdPerson('llew-dyfrgi', 'Llew Dyfrgi', 'male', '1722', ''),
    caerCryftlawdPerson('una-dyfrgi', 'Una Dyfrgi', 'female', '1724', ''),
    caerCryftlawdPerson('iob-dyfrgi', 'Iob Dyfrgi', 'male', '1722', ''),
    caerCryftlawdPerson('nia-dyfrgi', 'Nia Dyfrgi', 'female', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-elin-mevyn', ...TARGET_PARTNERS.mervyn),
    createMarriage('marriage-lyr-tilda-dyfrgi', ...TARGET_PARTNERS.lyr),
    createMarriage('marriage-ynyr-iona-dyfrgi', ...TARGET_PARTNERS.ynyr),
    createMarriage('marriage-glyn-greer-dyfrgi', ...TARGET_PARTNERS.glyn)
  ],
  parentages: [
    ...childrenOf(['lyr-dyfrgi', 'ynyr-dyfrgi', 'glyn-dyfrgi'], TARGET_PARTNERS.mervyn, 'marriage-elin-mevyn'),
    ...childrenOf(['ifan-dyfrgi', 'eira-dyfrgi'], TARGET_PARTNERS.lyr, 'marriage-lyr-tilda-dyfrgi'),
    ...childrenOf(['llew-dyfrgi', 'una-dyfrgi'], TARGET_PARTNERS.ynyr, 'marriage-ynyr-iona-dyfrgi'),
    ...childrenOf(['iob-dyfrgi', 'nia-dyfrgi'], TARGET_PARTNERS.glyn, 'marriage-glyn-greer-dyfrgi')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-elin-mevyn',
    houseId: CAER_CRYFTLAWD_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Caer Cryftlawd · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'mevyn-dyfrgi',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-dyfrgi',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Caer-Cryftlawd-Nachfolgeakte nach dem Blaidd- und Mochdaer-Muster. Mervyn und Elin bilden das neue Gründerpaar; Lyr, Ynyr und Glyn sind ausschließlich ihre Kinder. Ifan/Eira, Llew/Una und Iob/Nia bleiben jeweils am richtigen Elternpaar. Rhondda, Tudur, Oth und Orbo gehören nicht zu Mervyns neuer Linie und verbleiben daher ausschließlich in der vollständigen Herkunftsakte.'
  }
});

export const DYFRGI_HOUSE_FAMILIES = Object.freeze([
  HOUSE_DYFRGI_MYNYDDHARBWR_FAMILY,
  HOUSE_DYFRGI_CAER_CRYFTLAWD_FAMILY
]);
