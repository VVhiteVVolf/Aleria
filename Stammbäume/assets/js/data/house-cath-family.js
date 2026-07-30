import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CATH_PORTRAITS } from './house-cath-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const CATH_HOUSE_ID = 'house-cath';
const CATH_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.cath;

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
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? CATH_HOUSE_ID : options.houseId,
    portrait: HOUSE_CATH_PORTRAITS[id] || '',
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

const COUPLES = Object.freeze({
  founders: ['kibddar-cath', 'siriol-cath'],
  arawn: ['arawn-cath', 'oweta-o-cenyr'],
  floyd: ['floyd-cath', 'bricelyn-o-cenyr'],
  heledd: ['heledd-cath', 'grufudd-pawen'],
  drystan: ['drystan-cath', 'owena-o-cenyr'],
  blegwyrd: ['blegwyrd-cath', 'eleri-o-cenyr'],
  breck: ['breck-cath', 'aliza-o-cenyr'],
  taran: ['taran-cath', 'mag-o-cenyr'],
  heston: ['heston-cath', 'gven-o-cenyr'],
  jareth: ['jareth-cath', 'merriam-o-cenyr']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-kibddar-siriol-cath': COUPLES.founders,
  'marriage-arawn-oweta-cath': COUPLES.arawn,
  'marriage-floyd-bricelyn-cath': COUPLES.floyd,
  'marriage-drystan-owena-cath': COUPLES.drystan,
  'marriage-blegwyrd-eleri-cath': COUPLES.blegwyrd,
  'marriage-breck-aliza-cath': COUPLES.breck,
  'marriage-taran-mag-cath': COUPLES.taran,
  'marriage-heston-gven-cath': COUPLES.heston,
  'marriage-jareth-merriam-cath': COUPLES.jareth
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'cath-parentage', ...options }
  );
}

export const HOUSE_CATH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-cath',
    title: "Haus Cath O'Mathragon",
    motto: '',
    description: 'Altes Ritterfürstengeschlecht aus Mathragon. Kibddar „die Kralle“ und Siriol „Katzenauge“ begründeten das Haus; Siriols verborgenes Nachrichtennetz schützt Cenyr bis in die Gegenwart. Nach der Familientradition führt ein männliches Oberhaupt das Haus nach außen, während eine unverheiratete Frau die geheime Organisation leitet.',
    emblem: CATH_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.cath
  },
  houses: [
    {
      id: CATH_HOUSE_ID,
      name: "Haus Cath O'Mathragon",
      motto: '',
      emblem: CATH_EMBLEM,
      status: 'active'
    },
    {
      id: 'house-cenyr',
      name: "Haus O'Cenyr",
      motto: '',
      emblem: '',
      status: 'active'
    },
    {
      id: 'house-pawen',
      name: 'Haus Pawen',
      motto: '',
      emblem: '',
      status: 'active'
    }
  ],
  persons: [
    person('kibddar-cath', 'Kibddar Cath', 'male', '????', '????', {
      title: '„Die Kralle“ · Ritter und Gründer des Hauses Cath',
      lineageRole: 'head',
      notes: 'Berühmter cenyrischer Ritter. Seine scheinbar unfehlbare Voraussicht beruhte auf den von Siriol beschafften Nachrichten.'
    }),
    spouse('siriol-cath', 'Siriol Cath', 'female', '????', '????', {
      houseId: CATH_HOUSE_ID,
      title: '„Katzenauge“ · Mitgründerin des Hauses Cath',
      notes: 'Meisterin der Informationsbeschaffung und Tarnung; sie schuf das geheime Nachrichtennetz der Cath.'
    }),
    person('arawn-cath', 'Arawn Cath', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Cath',
      lineageRole: 'mainline'
    }),
    person('anwen-cath', 'Anwen Cath', 'female', '????', '????'),
    spouse('oweta-o-cenyr', "Oweta O'Cenyr", 'female', '????', '????', {
      houseId: 'house-cenyr'
    }),

    person('saselia-cath', 'Saselia Cath', 'female', '1637', '1700'),
    person('floyd-cath', 'Floyd Cath', 'male', '1632', '1697', {
      title: 'Ritterfürst des Hauses Cath bis 1697',
      lineageRole: 'mainline'
    }),
    spouse('bricelyn-o-cenyr', "Bricelyn O'Cenyr", 'female', '1633', '1671', {
      houseId: 'house-cenyr'
    }),
    person('heledd-cath', 'Heledd Cath', 'female', '1645', '1699', {
      title: 'Wegverheiratet an Haus Pawen',
      tags: ['Wegverheiratet']
    }),
    spouse('grufudd-pawen', 'Grufudd Pawen', 'male', '1644', '1710', {
      houseId: 'house-pawen'
    }),

    person('drystan-cath', 'Drystan Cath', 'male', '1651', '1720', {
      title: 'Ritterfürst des Hauses Cath von 1697 bis 1720',
      lineageRole: 'mainline'
    }),
    spouse('owena-o-cenyr', "Owena O'Cenyr", 'female', '1652', '????', {
      houseId: 'house-cenyr'
    }),
    person('ginevra-cath', 'Ginevra Cath', 'female', '1656', '????'),

    person('blegwyrd-cath', 'Blegwyrd Cath', 'male', '1670', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Cath seit 1720',
      lineageRole: 'head'
    }),
    spouse('eleri-o-cenyr', "Eleri O'Cenyr", 'female', '1673', '', {
      houseId: 'house-cenyr'
    }),
    person('evangelin-cath', 'Evangelin Cath', 'female', '1674', ''),
    person('breck-cath', 'Breck Cath', 'male', '1676', ''),
    spouse('aliza-o-cenyr', "Aliza O'Cenyr", 'female', '1674', '', {
      houseId: 'house-cenyr'
    }),

    person('taran-cath', 'Taran Cath', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Cath',
      lineageRole: 'mainline'
    }),
    spouse('mag-o-cenyr', "Mag O'Cenyr", 'female', '1696', '', {
      houseId: 'house-cenyr'
    }),
    person('heston-cath', 'Heston Cath', 'male', '1697', ''),
    spouse('gven-o-cenyr', "Gven O'Cenyr", 'female', '1700', '', {
      houseId: 'house-cenyr'
    }),
    person('ceciley-cath', 'Ceciley Cath', 'female', '1702', ''),
    person('jareth-cath', 'Jareth Cath', 'male', '1698', ''),
    spouse('merriam-o-cenyr', "Merriam O'Cenyr", 'female', '1703', '', {
      houseId: 'house-cenyr'
    }),

    person('ysolt-cath', 'Ysolt Cath', 'female', '1719', ''),
    person('niya-cath', 'Niya Cath', 'female', '1721', ''),
    person('rhain-cath', 'Rhain Cath', 'male', '1722', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('isotta-cath', 'Isotta Cath', 'female', '1720', ''),
    person('klervi-cath', 'Klervi Cath', 'female', '1723', ''),
    person('wyett-cath', 'Wyett Cath', 'male', '1722', ''),
    person('nolwen-cath', 'Nolwen Cath', 'female', '1723', ''),
    person('itan-cath', 'Itan Cath', 'male', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-kibddar-siriol-cath', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-arawn-oweta-cath', ...COUPLES.arawn, { status: 'ended' }),
    createMarriage('marriage-floyd-bricelyn-cath', ...COUPLES.floyd, {
      status: 'widowed',
      end: '1671'
    }),
    createMarriage('marriage-heledd-grufudd-pawen', ...COUPLES.heledd, {
      status: 'ended',
      end: '1699'
    }),
    createMarriage('marriage-drystan-owena-cath', ...COUPLES.drystan, {
      status: 'ended',
      end: '1720'
    }),
    createMarriage('marriage-blegwyrd-eleri-cath', ...COUPLES.blegwyrd),
    createMarriage('marriage-breck-aliza-cath', ...COUPLES.breck),
    createMarriage('marriage-taran-mag-cath', ...COUPLES.taran),
    createMarriage('marriage-heston-gven-cath', ...COUPLES.heston),
    createMarriage('marriage-jareth-merriam-cath', ...COUPLES.jareth)
  ],
  parentages: [
    ...childrenOf(['arawn-cath', 'anwen-cath'], 'marriage-kibddar-siriol-cath'),
    ...childrenOf(['saselia-cath', 'floyd-cath', 'heledd-cath'], 'marriage-arawn-oweta-cath', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Diese drei Geschwister stehen für die erste namentlich überlieferte Generation nach einer unbekannten Zahl ausgelassener Generationen.',
      extensions: { timeJumpId: 'gap-arawn-to-floyd-generation-cath' }
    }),
    ...childrenOf(['drystan-cath', 'ginevra-cath'], 'marriage-floyd-bricelyn-cath'),
    ...childrenOf(
      ['blegwyrd-cath', 'evangelin-cath', 'breck-cath'],
      'marriage-drystan-owena-cath'
    ),
    ...childrenOf(['taran-cath', 'heston-cath'], 'marriage-blegwyrd-eleri-cath'),
    ...childrenOf(['ceciley-cath', 'jareth-cath'], 'marriage-breck-aliza-cath'),
    ...childrenOf(['ysolt-cath', 'niya-cath', 'rhain-cath'], 'marriage-taran-mag-cath'),
    ...childrenOf(['isotta-cath', 'klervi-cath'], 'marriage-heston-gven-cath'),
    ...childrenOf(['wyett-cath', 'nolwen-cath', 'itan-cath'], 'marriage-jareth-merriam-cath')
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-heledd-cath-pawen',
      name: 'Haus Pawen',
      parentPartnershipId: 'marriage-heledd-grufudd-pawen',
      houseId: 'house-pawen',
      targetFamilyId: 'haus-pawen',
      subtitle: 'Wegverheiratet an Haus Pawen',
      notes: 'Heledd Cath führt die Cath-Linie nach ihrer Ehe mit Grufudd Pawen nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-arawn-to-floyd-generation-cath',
      parentPartnershipId: 'marriage-arawn-oweta-cath',
      parentPersonId: '',
      childIds: ['saselia-cath', 'floyd-cath', 'heledd-cath'],
      years: 0,
      fromYear: '????',
      toYear: '1632',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Arawn und Oweta. Sämtliche späteren Cath stehen ausschließlich unter diesem Knoten; der Sprung teilt keine Ebene mit einem anderen Nachfahrenknoten.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-kibddar-siriol-cath',
    houseId: CATH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Haus aus Mathragon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kibddar-cath',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Cath O'Mathragon (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Ehen, Elternschaften, Amtsfolge und Porträts folgen der beigefügten Cath-Tabelle und ihrer eingebetteten Stammbaumgrafik. Der dort mit Punkten markierte Überlieferungssprung wird als einziger serieller Zeitsprung unter Arawn und Oweta geführt. Heledd ist als legitime Cath im roten Hausrahmen verzeichnet; erst unter ihrer Ehe mit Grufudd Pawen zweigt die Wegverheiratet-Verknüpfung zu Haus Pawen ab. Die dreimal verwendete schwarze Standardsilhouette wurde bewusst nicht als individuelles Porträt von Oweta, Bricelyn und Owena dupliziert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
