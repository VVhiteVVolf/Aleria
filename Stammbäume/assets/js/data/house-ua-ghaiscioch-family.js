import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createMarriage,
  createParentages
} from './family-record-builders.js';
import {
  createTirNaSinsearCadetRecordFactory,
  createTirNaSinsearHouse,
  createTirNaSinsearMarriedAwayBranch,
  createTirNaSinsearTimeJump
} from './tir-na-sinsear-cadet-family-builders.js';
import {
  HOUSE_UA_GHAISCIOCH_PORTRAITS,
  HOUSE_UA_GHAISCIOCH_REUSED_PORTRAIT_IDS
} from './tir-na-sinsear-cadet-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS
} from './leitheach-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import {
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

const GHAISCIOCH_HOUSE_ID = 'house-ghaiscioch';
const GHAISCIOCH_EMBLEM = TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch;

const HEAD_TITLES = Object.freeze({
  'taerlach-gallchobhair': 'Gründer und erster Laird des Clans Ua’Ghaiscíoch',
  'fiontann-ghaiscioch': 'Laird des Clans Ua’Ghaiscíoch',
  'iosogan-ghaiscioch': 'Laird des Clans Ua’Ghaiscíoch · bis 1698',
  'gregoir-ghaiscioch': 'Laird des Clans Ua’Ghaiscíoch · 1698–1715',
  'cleirchin-ghaiscioch': 'Laird des Clans Ua’Ghaiscíoch · 1715–1733',
  'darragh-ua-ghaiscioch': 'Laird des Clans Ua’Ghaiscíoch · seit 1733'
});

const TARGETS = Object.freeze({
  blach: Object.freeze({
    name: "Haus Blach O'Aberon",
    houseId: 'house-blach',
    targetFamilyId: 'haus-blach',
    emblem: SONNENKUESTE_HOUSE_EMBLEMS.blach
  }),
  fiachrach: Object.freeze({
    name: 'Clan Uí Fiachrach',
    houseId: 'house-fiachrach',
    targetFamilyId: 'haus-fiachrach',
    emblem: LEITHEACH_CADET_HOUSE_EMBLEMS['ui-fiachrach']
  }),
  cleir: Object.freeze({
    name: 'Clan Ua’Cleir',
    houseId: 'house-cleir',
    targetFamilyId: 'haus-cleir',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir
  }),
  mhuir: Object.freeze({
    name: 'Clan Na’Mhuir',
    houseId: 'house-na-mhuir',
    targetFamilyId: 'haus-na-mhuir',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
  })
});

const { person, spouse, awayWoman } = createTirNaSinsearCadetRecordFactory({
  houseId: GHAISCIOCH_HOUSE_ID,
  portraits: HOUSE_UA_GHAISCIOCH_PORTRAITS,
  headTitles: HEAD_TITLES
});

const TAERLACH_FOUNDER_IDS = ['taerlach-gallchobhair', 'keelaith-ancient'];
const MARWE_IDS = ['rhynnon-blach', 'marwe-ghaiscioch'];
const FIONTANN_IDS = ['fiontann-ghaiscioch', 'isibeal-ancient-ghaiscioch'];
const IOSOGAN_IDS = ['odhlanna-gallchobhair', 'iosogan-ghaiscioch'];
const AOIBHEANN_IDS = ['bhaltair-fiachrach', 'aoibheann-ghaiscioch'];
const EOGHAIR_IDS = ['eoghair-ghaiscioch', 'rualainn-iomrach'];
const GREGOIR_IDS = ['gregoir-ghaiscioch', 'praeleen-ceardaiocht'];
const CIONAODH_IDS = ['eoghan-cleir', 'cionaodh-ghaiscioch'];
const EADBHARD_IDS = ['eadbhard-ghaiscioch', 'saorlaith-caiomhe'];
const CLEIRCHIN_IDS = ['liodhnait-gealach', 'cleirchin-ghaiscioch'];
const KEELAITH_IDS = ['keelaith-ghaiscioch', 'criostoir-mhuir'];
const ZEIGHLAN_IDS = ['treasa-laoch', 'zeighlan-ghaiscioch'];
const DARRAGH_IDS = ['myfanwy-llwynog', 'darragh-ua-ghaiscioch'];
const TEARNAIT_IDS = ['orren-gallchobhair', 'tearnait-ghaiscioch'];
const TAERLACH_IDS = ['taerlach-ghaiscioch', 'meabh-ruitheach'];
const DARERCA_IDS = ['labhras-cleir', 'darerca-ghaiscioch'];

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'ghaiscioch-parentage',
    ...options
  });
}

export const HOUSE_UA_GHAISCIOCH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ghaiscioch',
    title: 'Clan Ua’Ghaiscíoch',
    motto: '',
    description: 'Laird-Clan in Tir na Sinsear und Kadettenlinie der Fir An’Gallchobhair, begründet durch Taerlach Gallchobhair.',
    emblem: GHAISCIOCH_EMBLEM,
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES.ghaiscioch
  },
  houses: [
    createTirNaSinsearHouse(GHAISCIOCH_HOUSE_ID, 'Clan Ua’Ghaiscíoch', GHAISCIOCH_EMBLEM),
    createTirNaSinsearHouse('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    createTirNaSinsearHouse('house-blach', "Haus Blach O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.blach),
    createTirNaSinsearHouse('house-fiachrach', 'Clan Uí Fiachrach', LEITHEACH_CADET_HOUSE_EMBLEMS['ui-fiachrach']),
    createTirNaSinsearHouse('house-iomrach', 'Haus Iomrach'),
    createTirNaSinsearHouse('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']),
    createTirNaSinsearHouse('house-cleir', 'Clan Ua’Cleir', TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir),
    createTirNaSinsearHouse('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    createTirNaSinsearHouse('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    createTirNaSinsearHouse('house-na-mhuir', 'Clan Na’Mhuir', TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']),
    createTirNaSinsearHouse('house-laoch', 'Ruin Ua Laoch', LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch']),
    createTirNaSinsearHouse('house-llwynog', "Haus Llwynog O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.llwynog),
    createTirNaSinsearHouse('house-ruitheach', 'Haus Ruitheach')
  ],
  persons: [
    person('taerlach-gallchobhair', 'Taerlach Gallchobhair', 'male', '????', '????', {
      houseId: 'house-gallchobhair',
      familyRole: 'core',
      notes: 'Taerlach begründete als Gallchobhair-Spross den Clan Ua’Ghaiscíoch.'
    }),
    spouse('keelaith-ancient', 'Keelaith', 'female', '????', '????'),

    awayWoman('marwe-ghaiscioch', 'Marwe Ghaiscíoch', '????', '????', TARGETS.blach),
    spouse('rhynnon-blach', 'Rhynnon Blach', 'male', '????', '????', 'house-blach'),
    person('fiontann-ghaiscioch', 'Fiontann Ghaiscíoch', 'male', '????', '????'),
    spouse('isibeal-ancient-ghaiscioch', 'Isibéal', 'female', '????', '????'),

    person('iosogan-ghaiscioch', 'Íosógán Ghaiscíoch', 'male', '1626', '1698'),
    spouse('odhlanna-gallchobhair', 'Odhlanna Gallchobhair', 'female', '1628', '1703', 'house-gallchobhair'),
    awayWoman('aoibheann-ghaiscioch', 'Aoibheann Ghaiscíoch', '1628', '1692', TARGETS.fiachrach),
    spouse('bhaltair-fiachrach', 'Bhaltair Fiachrach', 'male', '1628', '1674', 'house-fiachrach'),
    person('eoghair-ghaiscioch', 'Eoghair Ghaiscíoch', 'male', '1631', '1689'),
    spouse('rualainn-iomrach', 'Rualainn Iomrach', 'female', '1633', '1699', 'house-iomrach'),

    person('gregoir-ghaiscioch', 'Gréagóir Ghaiscíoch', 'male', '1648', '1715'),
    spouse('praeleen-ceardaiocht', 'Praeleen Ceardaíocht', 'female', '1651', '1709', 'house-dal-ceardaiocht'),
    awayWoman('cionaodh-ghaiscioch', 'Cionaodh Ghaiscíoch', '1652', '1704', TARGETS.cleir),
    spouse('eoghan-cleir', 'Eoghan Cleir', 'male', '1650', '1724', 'house-cleir'),
    person('eadbhard-ghaiscioch', 'Eadbhard Ghaiscíoch', 'male', '1652', '1720'),
    spouse('saorlaith-caiomhe', 'Saorlaith Caoimhe', 'female', '1650', '1726', 'house-caoimhe'),
    person('fergusan-ghaiscioch', 'Fergusán Ghaiscíoch', 'male', '1656', '1700'),

    person('cleirchin-ghaiscioch', 'Cléirchín Ghaiscíoch', 'male', '1670', '1733'),
    spouse('liodhnait-gealach', 'Líodhnait Gealach', 'female', '1672', '', 'house-gealach'),
    awayWoman('keelaith-ghaiscioch', 'Keelaith Ghaiscíoch', '1674', '', TARGETS.mhuir),
    spouse('criostoir-mhuir', 'Críostóir Mhuir', 'male', '1674', '', 'house-na-mhuir'),
    person('zeighlan-ghaiscioch', 'Zeighlan Ghaiscíoch', 'male', '1677', ''),
    spouse('treasa-laoch', 'Treasa Laoch', 'female', '1679', '', 'house-laoch'),

    person('darragh-ua-ghaiscioch', 'Darragh Ghaiscíoch', 'male', '1696', ''),
    spouse('myfanwy-llwynog', 'Myfanwy Llwynog', 'female', '1696', '', 'house-llwynog'),
    awayWoman('tearnait-ghaiscioch', 'Tearnait Ghaiscíoch', '1704', '', TARGETS.gallchobhair),
    spouse('orren-gallchobhair', 'Orren Gallchobhair', 'male', '1703', '1733', 'house-gallchobhair'),
    person('taerlach-ghaiscioch', 'Taerlach Ghaiscíoch', 'male', '1697', ''),
    spouse('meabh-ruitheach', 'Méabh Ruitheach', 'female', '1702', '', 'house-ruitheach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('darerca-ghaiscioch', 'Darerca Ghaiscíoch', '1702', '', TARGETS.cleir),
    spouse('labhras-cleir', 'Labhrás Cleir', 'male', '1699', '', 'house-cleir'),

    person('lorghus-ghaiscioch', 'Lorghus Ghaiscíoch', 'male', '1722', '', {
      title: 'Erster in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('brogan-ghaiscioch', 'Brogan Ghaiscíoch', 'male', '1725', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('ailis-ghaiscioch', 'Ailis Ghaiscíoch', 'female', '1727', '', {
      title: 'Dritte in der Erbfolge · Mündel Emyrs Blachs',
      lineageRole: 'mainline',
      notes: 'Die ausgearbeitete Blach-Gegenakte führt Ailis zusätzlich als aufgenommenes Mündel Emyrs Blachs.'
    }),
    person('darragh-1724-ghaiscioch', 'Darragh Ghaiscíoch', 'male', '1724', ''),
    person('aoife-ghaiscioch', 'Aoife Ghaiscíoch', 'female', '1726', '')
  ],
  partnerships: [
    createMarriage('marriage-taerlach-keelaith', ...TAERLACH_FOUNDER_IDS),
    createMarriage('marriage-rhynnon-marwe-blach', ...MARWE_IDS),
    createMarriage('marriage-fiontann-isibeal', ...FIONTANN_IDS),
    createMarriage('marriage-odhlanna-iosogan', ...IOSOGAN_IDS),
    createMarriage('marriage-bhaltair-aoibheann', ...AOIBHEANN_IDS),
    createMarriage('marriage-eoghair-rualainn', ...EOGHAIR_IDS),
    createMarriage('marriage-gregoir-praeleen', ...GREGOIR_IDS),
    createMarriage('marriage-eoghan-cionaodh', ...CIONAODH_IDS),
    createMarriage('marriage-eadbhard-saorlaith', ...EADBHARD_IDS),
    createMarriage('marriage-liodhnait-cleirchin', ...CLEIRCHIN_IDS),
    createMarriage('marriage-keelaith-criostoir', ...KEELAITH_IDS),
    createMarriage('marriage-treasa-zeighlan', ...ZEIGHLAN_IDS),
    createMarriage('marriage-myfanwy-darragh-llwynog', ...DARRAGH_IDS),
    createMarriage('marriage-orren-tearnait', ...TEARNAIT_IDS),
    createMarriage('marriage-taerlach-meabh', ...TAERLACH_IDS),
    createMarriage('marriage-labhras-darerca', ...DARERCA_IDS)
  ],
  parentages: [
    ...childrenOf(['marwe-ghaiscioch', 'fiontann-ghaiscioch'], TAERLACH_FOUNDER_IDS, 'marriage-taerlach-keelaith', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Taerlachs Gründerpaar und Marwe/Fiontann fehlen einzeln belegte Generationen.',
      extensions: { timeJumpId: 'gap-taerlach-marwe-fiontann' }
    }),
    ...childrenOf(['iosogan-ghaiscioch', 'aoibheann-ghaiscioch', 'eoghair-ghaiscioch'], FIONTANN_IDS, 'marriage-fiontann-isibeal', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Eine zweite Punktreihe trennt Fiontann/Isibéal von der Generation ab 1626.',
      extensions: { timeJumpId: 'gap-fiontann-iosogan-generation' }
    }),
    ...childrenOf(['gregoir-ghaiscioch', 'cionaodh-ghaiscioch'], IOSOGAN_IDS, 'marriage-odhlanna-iosogan'),
    ...childrenOf(['eadbhard-ghaiscioch', 'fergusan-ghaiscioch'], EOGHAIR_IDS, 'marriage-eoghair-rualainn'),
    ...childrenOf(['cleirchin-ghaiscioch', 'keelaith-ghaiscioch', 'zeighlan-ghaiscioch'], GREGOIR_IDS, 'marriage-gregoir-praeleen'),
    ...childrenOf(['darragh-ua-ghaiscioch', 'tearnait-ghaiscioch'], CLEIRCHIN_IDS, 'marriage-liodhnait-cleirchin'),
    ...childrenOf(['taerlach-ghaiscioch', 'darerca-ghaiscioch'], ZEIGHLAN_IDS, 'marriage-treasa-zeighlan'),
    ...childrenOf(['lorghus-ghaiscioch', 'brogan-ghaiscioch', 'ailis-ghaiscioch'], DARRAGH_IDS, 'marriage-myfanwy-darragh-llwynog'),
    ...childrenOf(['darragh-1724-ghaiscioch', 'aoife-ghaiscioch'], TAERLACH_IDS, 'marriage-taerlach-meabh')
  ],
  cadetBranches: [
    createTirNaSinsearMarriedAwayBranch('married-away-blach-marwe', 'marriage-rhynnon-marwe-blach', TARGETS.blach),
    createTirNaSinsearMarriedAwayBranch('married-away-fiachrach-aoibheann', 'marriage-bhaltair-aoibheann', TARGETS.fiachrach),
    createTirNaSinsearMarriedAwayBranch('married-away-cleir-cionaodh', 'marriage-eoghan-cionaodh', TARGETS.cleir),
    createTirNaSinsearMarriedAwayBranch('married-away-mhuir-keelaith', 'marriage-keelaith-criostoir', TARGETS.mhuir),
    createTirNaSinsearMarriedAwayBranch('married-away-gallchobhair-tearnait', 'marriage-orren-tearnait', TARGETS.gallchobhair),
    createTirNaSinsearMarriedAwayBranch('married-away-cleir-darerca', 'marriage-labhras-darerca', TARGETS.cleir)
  ],
  timeJumps: [
    createTirNaSinsearTimeJump({
      id: 'gap-taerlach-marwe-fiontann',
      parentPartnershipId: 'marriage-taerlach-keelaith',
      childIds: ['marwe-ghaiscioch', 'fiontann-ghaiscioch']
    }),
    createTirNaSinsearTimeJump({
      id: 'gap-fiontann-iosogan-generation',
      parentPartnershipId: 'marriage-fiontann-isibeal',
      childIds: ['iosogan-ghaiscioch', 'aoibheann-ghaiscioch', 'eoghair-ghaiscioch'],
      toYear: '1626'
    })
  ],
  lineage: {
    founderPartnershipId: 'marriage-taerlach-keelaith',
    houseId: GHAISCIOCH_HOUSE_ID,
    crestSubtitle: 'Lairdtum unter den Fir An’Gallchobhair · Tir na Sinsear · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'taerlach-gallchobhair',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Ua’Ghaiscíoch (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Oberhäupter und Erbfolge folgen der bereitgestellten Ua’Ghaiscíoch-Hierarchie. Die beiden Punktreihen werden als zwei strikt serielle Überlieferungssprünge geführt. Verheiratete Ghaiscíoch-Frauen ohne lokal fortgeführte Kinder besitzen direkte Zielhausknoten; Ailis bleibt zugleich biologisches Kind Darraghs und Myfanwys sowie das in der Blach-Gegenakte belegte Mündel Emyrs Blachs. Sämtliche Bilder der bereitgestellten Ghaiscíoch-Quelle werden als veraltet ignoriert; nur bereits bestehende Porträts identischer Weltpersonen werden wiederverwendet. Críostóir verwendet nun sein kanonisches Na’Mhuir-Porträt und die einheitliche Na’Mhuir-Hauskennung.',
    sourceRevision: 5,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird des Clans Ua’Ghaiscíoch',
      publishedOrder: Object.freeze(['lorghus-ghaiscioch', 'brogan-ghaiscioch', 'ailis-ghaiscioch'])
    }),
    portraitPolicy: Object.freeze({
      sourceImagesIgnored: true,
      reusedPersonIds: HOUSE_UA_GHAISCIOCH_REUSED_PORTRAIT_IDS
    }),
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    albicRank: 'laird',
    immediateLiegeHouseId: 'haus-gallchobhair',
    immediateLiegeHouseName: 'Fir An’Gallchobhair',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: ['sourceNote', 'inheritance', 'portraitPolicy'],
    registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: { houses: ['house-mhuir', 'house-caiomhe'] }
  }
});
