import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_UI_FIACHRACH_PORTRAITS } from './house-ui-fiachrach-portraits.js';
import {
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS
} from './leitheach-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';

const FIACHRACH_HOUSE_ID = 'house-fiachrach';
const FIACHRACH_EMBLEM = LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach'];

const HOUSE_EMBLEMS = Object.freeze({
  blach: 'assets/images/houses/Sonnenküste/Gersteküste/haus-blach.png',
  cumhail: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill'],
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  eirce: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ua-eirce'],
  gaelach: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'],
  cleir: TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir,
  ghaiscioch: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch,
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const MARRIED_AWAY_TARGETS = Object.freeze({
  blach: Object.freeze({
    name: 'Haus Blach',
    houseId: 'house-blach',
    targetFamilyId: 'haus-blach',
    emblem: HOUSE_EMBLEMS.blach
  }),
  wyrm: Object.freeze({
    name: 'Haus Wyrm',
    houseId: 'house-wyrm',
    targetFamilyId: 'haus-wyrm',
    emblem: HOUSE_EMBLEMS.wyrm
  }),
  cleir: Object.freeze({
    name: 'Clan Ua’Cleir',
    houseId: 'house-cleir',
    targetFamilyId: 'haus-cleir',
    emblem: HOUSE_EMBLEMS.cleir
  }),
  eirce: Object.freeze({
    name: 'Clan Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: HOUSE_EMBLEMS.eirce
  }),
  draig: Object.freeze({
    name: 'Haus Draig',
    houseId: 'house-draig',
    targetFamilyId: 'haus-draig',
    emblem: HOUSE_EMBLEMS.draig
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: HOUSE_EMBLEMS.gaelach
  })
});

const HOUSE_HEAD_IDS = new Set([
  'seamair-fiachrach',
  'naodhan-fiachrach',
  'tiarnog-fiachrach',
  'domhnallach-fiachrach',
  'grada-fiachrach'
]);

const SUCCESSION_IDS = new Set([
  'seamus-fiachrach',
  'ultach-fiachrach',
  'gadhra-fiachrach',
  'connla-fiachrach'
]);

const HEAD_TITLES = Object.freeze({
  'seamair-fiachrach': 'Gründer und erster Laird des Clans Fiachrach',
  'naodhan-fiachrach': 'Laird des Clans Fiachrach · 1653–1673',
  'tiarnog-fiachrach': 'Laird des Clans Fiachrach · 1673–1685',
  'domhnallach-fiachrach': 'Laird des Clans Fiachrach · 1685–1734',
  'grada-fiachrach': 'Laird des Clans Uí Fiachrach · seit 1734'
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = FIACHRACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_UI_FIACHRACH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === FIACHRACH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetKey, options = {}) {
  const target = MARRIED_AWAY_TARGETS[targetKey];
  return person(id, name, 'female', birth, death, FIACHRACH_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...(options.tags || []), 'Wegverheiratet'],
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: [
        ...new Set([
          ...(options.extensions?.registryManagedFields || []),
          'sex',
          'title',
          'tags'
        ])
      ]
    }
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function marriedAway(id, partnershipId, targetKey) {
  const target = MARRIED_AWAY_TARGETS[targetKey];
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

const SEAMAIR_IDS = ['seamair-fiachrach', 'carys-unknown-fiachrach'];
const NAODHAN_IDS = ['naodhan-fiachrach', 'mairghread-cein'];
const FIDELMA_IDS = ['fidelma-fiachrach', 'ehangwen-blach'];
const TORMODH_IDS = ['tormodh-fiachrach', 'xibhne-craobhan'];
const FOTHADH_IDS = ['fothadh-fiachrach', 'iolanda-unknown-fiachrach'];
const TIARNOG_IDS = ['tiarnog-fiachrach', 'valibh-frisealach'];
const KESTER_IDS = ['kester-fiachrach', 'nora-unknown-fiachrach'];
const KESTER_AFFAIR_IDS = ['kester-fiachrach', 'helga-unknown-fiachrach'];
const BHALTAIR_IDS = ['bhaltair-fiachrach', 'aoibheann-ghaiscioch'];
const DOMHNALLACH_IDS = ['domhnallach-fiachrach', 'ysalach-laoch'];
const CAIRENN_IDS = ['cairenn-fiachrach', 'efnisien-wyrm'];
const WIARNAN_IDS = ['wiarnan-fiachrach', 'sorcha-unknown-fiachrach'];
const BREASAL_IDS = ['breasal-fiachrach', 'nessa-unknown-fiachrach'];
const GRADA_IDS = ['grada-fiachrach', 'roisin-cumhail'];
const YOLIVA_IDS = ['yoliva-fiachrach', 'bearnard-cleir'];
const GORMFLAITH_IDS = ['gormflaith-fiachrach', 'tomos-unknown-fiachrach'];
const ULTACH_IDS = ['ultach-fiachrach', 'uibhla-unknown-fiachrach'];
const PAISLIE_IDS = ['paislie-fiachrach', 'vannoch-eirce'];
const SEAMUS_IDS = ['seamus-fiachrach', 'beathag-cein'];
const WYNONNA_IDS = ['wynonna-fiachrach', 'cadfan-draig'];
const GADHRA_IDS = ['gadhra-fiachrach', 'astrid-unknown-fiachrach'];
const UALLACH_IDS = ['uallach-fiachrach', 'bercan-gealach'];

export const HOUSE_UI_FIACHRACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-fiachrach',
    title: 'Clan Uí Fiachrach',
    motto: '',
    description: 'Junger Laird-Clan des Fürstentums Leitheach, dessen verstreute, günstig gelegene Besitzungen und bemerkenswerter Aufstieg mit Gelegenheit, Anpassungsfähigkeit und dem Segen der Glücksmaid verbunden werden.',
    emblem: FIACHRACH_EMBLEM,
    houseProfile: LEITHEACH_LAIRD_HOUSE_PROFILES['ui-fiachrach']
  },
  houses: [
    house(FIACHRACH_HOUSE_ID, 'Clan Uí Fiachrach', FIACHRACH_EMBLEM),
    house('house-cein', 'Haus Céin'),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-craobhan', 'Haus Craobhan'),
    house('house-frisealach', 'Haus Frisealach'),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', HOUSE_EMBLEMS.ghaiscioch),
    house('house-laoch', 'Ruin Ua Laoch'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-cleir', 'Clan Ua’Cleir', HOUSE_EMBLEMS.cleir),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', HOUSE_EMBLEMS.cumhail),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-eirce', 'Clan Ua’Eirce', HOUSE_EMBLEMS.eirce),
    house('house-gealach', 'Clan Ua’Gaelach', HOUSE_EMBLEMS.gaelach)
  ],
  persons: [
    person('seamair-fiachrach', 'Seamair Fiachrach', 'male', '1575', '1653', FIACHRACH_HOUSE_ID, {
      notes: 'Die detaillierte Hierarchie nennt 1575 als Geburtsjahr; die Hoftafel weicht mit 1600 ab, was wegen des 1598 geborenen Sohnes Naodhan chronologisch unmöglich wäre.'
    }),
    spouse('carys-unknown-fiachrach', 'Carys', 'female', '????', '????'),

    person('naodhan-fiachrach', 'Naodhan Fiachrach', 'male', '1598', '1673'),
    spouse('mairghread-cein', 'Mairghread Céin', 'female', '1605', '1672', 'house-cein'),
    awayWoman('fidelma-fiachrach', 'Fidelma Fiachrach', '1600', '1655', 'blach'),
    spouse('ehangwen-blach', 'Ehangwen Blach', 'male', '1598', '1638', 'house-blach'),
    person('tormodh-fiachrach', 'Tormodh Fiachrach', 'male', '1608', '1680'),
    spouse('xibhne-craobhan', 'Xibhne Craobhan', 'female', '1610', '1684', 'house-craobhan'),
    person('fothadh-fiachrach', 'Fothadh Fiachrach', 'male', '1610', '1684'),
    spouse('iolanda-unknown-fiachrach', 'Iolanda', 'female', '1610', '1700'),

    person('tiarnog-fiachrach', 'Tiarnóg Fiachrach', 'male', '1626', '1685'),
    spouse('valibh-frisealach', 'Valibh Frisealach', 'female', '1628', '1693', 'house-frisealach'),
    person('kester-fiachrach', 'Kester Fiachrach', 'male', '1628', '1694'),
    spouse('nora-unknown-fiachrach', 'Nóra', 'female', '1630', '1684'),
    spouse('helga-unknown-fiachrach', 'Helga', 'female', '1654', '1730', '', {
      familyRole: 'affair',
      title: 'Geliebte Kesters'
    }),
    person('bhaltair-fiachrach', 'Bhaltair Fiachrach', 'male', '1628', '1674'),
    spouse('aoibheann-ghaiscioch', 'Aoibheann Ghaiscíoch', 'female', '1628', '1692', 'house-ghaiscioch'),

    person('domhnallach-fiachrach', 'Domhnallach Fiachrach', 'male', '1651', '1734'),
    spouse('ysalach-laoch', 'Ysalach Laoch', 'female', '1655', '1729', 'house-laoch'),
    awayWoman('cairenn-fiachrach', 'Cairenn Fiachrach', '1653', '1702', 'wyrm'),
    spouse('efnisien-wyrm', 'Efnisien Wyrm', 'male', '1652', '1715', 'house-wyrm'),
    person('wiarnan-fiachrach', 'Wiárnan Fiachrach', 'male', '1657', '1734'),
    spouse('sorcha-unknown-fiachrach', 'Sorcha', 'female', '1658', '1711'),
    person('ythran-fiachrach', 'Ythran Fiachrach', 'male', '1673', '', FIACHRACH_HOUSE_ID, {
      title: 'Unehelicher Sohn Kesters und Helgas',
      tags: ['Unehelich']
    }),
    person('breasal-fiachrach', 'Breasal Fiachrach', 'male', '1656', '1734'),
    spouse('nessa-unknown-fiachrach', 'Nessa', 'female', '1656', '1724'),

    person('grada-fiachrach', 'Gráda Fiachrach', 'male', '1670', ''),
    spouse('roisin-cumhail', 'Roisin Cumhail', 'female', '1674', '', 'house-cumhail'),
    awayWoman('yoliva-fiachrach', 'Yoliva Fiachrach', '1680', '', 'cleir'),
    spouse('bearnard-cleir', 'Bearnard Cléir', 'male', '1678', '1733', 'house-cleir'),
    person('gormflaith-fiachrach', 'Gormflaith Fiachrach', 'female', '1677', ''),
    spouse('tomos-unknown-fiachrach', 'Tomos', 'male', '1674', ''),
    person('ultach-fiachrach', 'Ultach Fiachrach', 'male', '1675', '', FIACHRACH_HOUSE_ID, {
      title: '2. Stelle der Erbfolge'
    }),
    spouse('uibhla-unknown-fiachrach', 'Uibhla', 'female', '1678', ''),
    awayWoman('paislie-fiachrach', 'Paislie Fiachrach', '1675', '', 'eirce'),
    spouse('vannoch-eirce', 'Vannoch Eirce', 'male', '1674', '', 'house-eirce'),

    person('seamus-fiachrach', 'Séamus Fiachrach', 'male', '1694', '', FIACHRACH_HOUSE_ID, {
      title: '1. Stelle der Erbfolge'
    }),
    spouse('beathag-cein', 'Beathag Céin', 'female', '1697', '', 'house-cein'),
    awayWoman('wynonna-fiachrach', 'Wynonna Fiachrach', '1700', '', 'draig'),
    spouse('cadfan-draig', 'Cadfan Draig', 'male', '1696', '', 'house-draig'),
    person('padraig-fiachrach', 'Pádraig Fiachrach', 'male', '1698', ''),
    person('gadhra-fiachrach', 'Gadhra Fiachrach', 'male', '1697', '', FIACHRACH_HOUSE_ID, {
      title: '3. Stelle der Erbfolge'
    }),
    spouse('astrid-unknown-fiachrach', 'Astrid', 'female', '1702', ''),
    awayWoman('uallach-fiachrach', 'Uallach Fiachrach', '1701', '', 'gaelach'),
    spouse('bercan-gealach', 'Bercán Gealach', 'male', '1698', '', 'house-gealach'),

    person('talitha-fiachrach', 'Talitha Fiachrach', 'female', '1718', ''),
    person('neart-fiachrach', 'Neart Fiachrach', 'male', '1724', ''),
    person('liosa-cein', 'Liosa Céin', 'female', '1726', '', 'house-cein', {
      familyRole: 'ward',
      title: 'Mündel Séamus’',
      notes: 'Séamus ist Liosas Vormund, nicht ihr leiblicher Vater.'
    }),
    person('connla-fiachrach', 'Connla Fiachrach', 'male', '1722', '', FIACHRACH_HOUSE_ID, {
      title: '4. Stelle der Erbfolge'
    }),
    person('fiadh-fiachrach', 'Fiadh Fiachrach', 'female', '1726', '')
  ],
  partnerships: [
    createMarriage('marriage-seamair-carys', ...SEAMAIR_IDS),
    createMarriage('marriage-naodhan-mairghread', ...NAODHAN_IDS),
    createMarriage('marriage-ehangwen-fidelma-blach', ...FIDELMA_IDS),
    createMarriage('marriage-tormodh-xibhne', ...TORMODH_IDS),
    createMarriage('marriage-fothadh-iolanda', ...FOTHADH_IDS),
    createMarriage('marriage-tiarnog-valibh', ...TIARNOG_IDS),
    createMarriage('marriage-kester-nora', ...KESTER_IDS),
    createMarriage('affair-kester-helga', ...KESTER_AFFAIR_IDS, {
      type: 'affair',
      status: 'ended',
      end: '1694'
    }),
    createMarriage('marriage-bhaltair-aoibheann', ...BHALTAIR_IDS),
    createMarriage('marriage-domhnallach-ysalach', ...DOMHNALLACH_IDS),
    createMarriage('marriage-efnisien-cairenn', ...CAIRENN_IDS),
    createMarriage('marriage-wiarnan-sorcha', ...WIARNAN_IDS),
    createMarriage('marriage-breasal-nessa', ...BREASAL_IDS),
    createMarriage('marriage-roisin-grada', ...GRADA_IDS),
    createMarriage('marriage-yoliva-bearnard', ...YOLIVA_IDS),
    createMarriage('marriage-gormflaith-tomos', ...GORMFLAITH_IDS),
    createMarriage('marriage-ultach-uibhla', ...ULTACH_IDS),
    createMarriage('marriage-vannoch-paislie', ...PAISLIE_IDS),
    createMarriage('marriage-seamus-beathag', ...SEAMUS_IDS),
    createMarriage('marriage-cadfan-wynonna', ...WYNONNA_IDS),
    createMarriage('marriage-gadhra-astrid', ...GADHRA_IDS),
    createMarriage('marriage-uallach-bercan', ...UALLACH_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['naodhan-fiachrach', 'fidelma-fiachrach', 'tormodh-fiachrach', 'fothadh-fiachrach'],
      SEAMAIR_IDS,
      'marriage-seamair-carys'
    ),
    ...childrenOf(['tiarnog-fiachrach'], NAODHAN_IDS, 'marriage-naodhan-mairghread'),
    ...childrenOf(['kester-fiachrach'], TORMODH_IDS, 'marriage-tormodh-xibhne'),
    ...childrenOf(['bhaltair-fiachrach'], FOTHADH_IDS, 'marriage-fothadh-iolanda'),
    ...childrenOf(['domhnallach-fiachrach', 'cairenn-fiachrach'], TIARNOG_IDS, 'marriage-tiarnog-valibh'),
    ...childrenOf(['wiarnan-fiachrach'], KESTER_IDS, 'marriage-kester-nora'),
    ...childrenOf(['ythran-fiachrach'], KESTER_AFFAIR_IDS, 'affair-kester-helga', {
      legitimacy: 'illegitimate',
      notes: 'Die Quelle bezeichnet Ythran ausdrücklich als Kesters Bastard.'
    }),
    ...childrenOf(['breasal-fiachrach'], BHALTAIR_IDS, 'marriage-bhaltair-aoibheann'),
    ...childrenOf(['grada-fiachrach', 'yoliva-fiachrach'], DOMHNALLACH_IDS, 'marriage-domhnallach-ysalach', {
      notes: 'Die Stammbaumgrafik belegt Domhnallach und Ysalach als Eltern. Die Tabellenüberschrift „Domhnallach & Cairenn“ ist ein Quellfehler.'
    }),
    ...childrenOf(['gormflaith-fiachrach'], WIARNAN_IDS, 'marriage-wiarnan-sorcha'),
    ...childrenOf(['ultach-fiachrach', 'paislie-fiachrach'], BREASAL_IDS, 'marriage-breasal-nessa'),
    ...childrenOf(['seamus-fiachrach', 'wynonna-fiachrach'], GRADA_IDS, 'marriage-roisin-grada'),
    ...childrenOf(['padraig-fiachrach'], GORMFLAITH_IDS, 'marriage-gormflaith-tomos'),
    ...childrenOf(['gadhra-fiachrach', 'uallach-fiachrach'], ULTACH_IDS, 'marriage-ultach-uibhla'),
    ...childrenOf(['talitha-fiachrach', 'neart-fiachrach'], SEAMUS_IDS, 'marriage-seamus-beathag'),
    ...childrenOf(['liosa-cein'], ['seamus-fiachrach'], '', {
      idPrefix: 'fosterage-seamus',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Séamus ist Liosas Vormund; es besteht keine leibliche Abstammung.'
    }),
    ...childrenOf(['connla-fiachrach', 'fiadh-fiachrach'], GADHRA_IDS, 'marriage-gadhra-astrid')
  ],
  cadetBranches: [
    marriedAway('married-away-blach-fidelma', 'marriage-ehangwen-fidelma-blach', 'blach'),
    marriedAway('married-away-wyrm-cairenn', 'marriage-efnisien-cairenn', 'wyrm'),
    marriedAway('married-away-cleir-yoliva', 'marriage-yoliva-bearnard', 'cleir'),
    marriedAway('married-away-eirce-paislie', 'marriage-vannoch-paislie', 'eirce'),
    marriedAway('married-away-draig-wynonna', 'marriage-cadfan-wynonna', 'draig'),
    marriedAway('married-away-gaelach-uallach', 'marriage-uallach-bercan', 'gaelach')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-seamair-carys',
    houseId: FIACHRACH_HOUSE_ID,
    crestSubtitle: 'Lairdtum von Tir na Sleagh · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'seamair-fiachrach',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Na Fiachrach / Uí Fiachrach (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Hausoberhäupter, Erbfolge und Hausgeschichte folgen der bereitgestellten Fiachrach-Hausseite und ihrer vollständigen Stammbaumgrafik. Der Benutzerbezeichnung folgend wird die Akte als Clan Uí Fiachrach geführt; die Quelle selbst verwendet daneben Na Fiachrach und Clan Fiachrach. Seamairs chronologisch stimmiges Geburtsjahr 1575 aus der Hierarchie erhält Vorrang vor der unmöglichen Hoftafel-Angabe 1600. Die Grafik klärt außerdem den Quellfehler „Domhnallach & Cairenn“: Gráda und Yoliva sind die Kinder Domhnallachs und Ysalachs. Fidelma, Cairenn, Yoliva, Paislie, Wynonna und Uallach besitzen direkte Wegverheiratet-Knoten. Ehangwen/Fidelma, Efnisien/Cairenn, Gráda/Roisin und Cadfan/Wynonna verwenden dieselben Weltpersonen-, Ehe- und Porträtzuordnungen wie ihre ausgearbeiteten Gegenakten; Paislie/Vannoch sind mit der Ua’Eirce-Akte geteilt. Ythran ist Kesters unehelicher Sohn aus der Affäre mit Helga. Liosa Céin ist Séamus’ Mündel und kein leibliches Kind. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    blankFamily: false,
    preparedMainLine: false,
    sourceRevision: 2,
    principality: 'Leitheach',
    territory: 'Tir na Sleagh',
    albicRank: 'laird',
    inheritance: {
      primaryRule: 'männliche Primogenitur',
      fallbackRule: 'Der Titel fällt durch die nächsten männlichen Linien; Töchter erben erst nach Erlöschen sämtlicher männlicher Linien.',
      publishedOrder: ['seamus-fiachrach', 'ultach-fiachrach', 'gadhra-fiachrach', 'connla-fiachrach']
    },
    sourceDiscrepancies: {
      founderBirth: 'Hoftafel 1600; Hierarchie 1575. Verwendet wird 1575.',
      parentHeading: 'Die fehlerhafte Überschrift nennt Domhnallach und Cairenn; die Stammbaumgrafik belegt Domhnallach und Ysalach.'
    },
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: LEITHEACH_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
