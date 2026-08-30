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
  HOUSE_UA_CLEIR_PORTRAITS,
  HOUSE_UA_CLEIR_REUSED_PORTRAIT_IDS
} from './tir-na-sinsear-cadet-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS
} from './leitheach-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

const CLEIR_HOUSE_ID = 'house-cleir';
const CLEIR_EMBLEM = TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir;

const HEAD_TITLES = Object.freeze({
  'gilleon-gallchobhair': 'Gründer und erster Laird des Clans Ua’Cleir · bis 1207',
  'feidlimid-cleir': 'Laird des Clans Ua’Cleir · bis 1689',
  'eoghan-cleir': 'Laird des Clans Ua’Cleir · 1689–1724',
  'colm-cleir': 'Laird des Clans Ua’Cleir · seit 1724'
});

const TARGETS = Object.freeze({
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  eirce: Object.freeze({
    name: 'Clan Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ua-eirce']
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
  }),
  ceardaiocht: Object.freeze({
    name: 'Clan Dál’Ceardaíocht',
    houseId: 'house-dal-ceardaiocht',
    targetFamilyId: 'haus-dal-ceardaiocht',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']
  }),
  illwath: Object.freeze({
    name: "Haus Illwath O'Caer Llew",
    houseId: 'house-illwath',
    targetFamilyId: 'haus-illwath',
    emblem: SONNENKUESTE_HOUSE_EMBLEMS.illwath
  }),
  llwynog: Object.freeze({
    name: "Haus Llwynog O'Aberon",
    houseId: 'house-llwynog',
    targetFamilyId: 'haus-llwynog',
    emblem: SONNENKUESTE_HOUSE_EMBLEMS.llwynog
  })
});

const { person, spouse, awayWoman } = createTirNaSinsearCadetRecordFactory({
  houseId: CLEIR_HOUSE_ID,
  portraits: HOUSE_UA_CLEIR_PORTRAITS,
  headTitles: HEAD_TITLES
});

const GILLEON_IDS = ['gilleon-gallchobhair', 'aisling-ancient'];
const AIBHISTIN_IDS = ['aibhistin-gealach', 'greineach-cleir'];
const FEIDLIMID_IDS = ['unaith-gallchobhair', 'feidlimid-cleir'];
const GRIAN_IDS = ['hoibrean-eirce', 'grian-cleir'];
const EOGHAN_IDS = ['eoghan-cleir', 'cionaodh-ghaiscioch'];
const BOUDICA_IDS = ['boudica-cleir', 'fergal-ceardaiocht'];
const COLM_IDS = ['colm-cleir', 'vionaigh-mhuir'];
const CLODAGH_IDS = ['sloane-gallchobhair', 'clodagh-cleir'];
const BEARNARD_IDS = ['yoliva-fiachrach', 'bearnard-cleir'];
const GEAROID_IDS = ['gearoid-cleir', 'johana-ceardaiocht'];
const NESSA_IDS = ['kynwas-illwath', 'nessa-cleir'];
const MAIREAD_IDS = ['bevan-llwynog', 'mairead-cleir'];
const LABHRAS_IDS = ['labhras-cleir', 'darerca-ghaiscioch'];
const IOMHAR_IDS = ['iomhar-cleir', 'peighann-ancient'];

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'cleir-parentage',
    ...options
  });
}

export const HOUSE_UA_CLEIR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-cleir',
    title: 'Clan Ua’Cleir',
    motto: '',
    description: 'Laird-Clan in Tir na Sinsear und Kadettenlinie der Fir An’Gallchobhair, begründet durch Gilleón Gallchobhair.',
    emblem: CLEIR_EMBLEM,
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES.cleir
  },
  houses: [
    createTirNaSinsearHouse(CLEIR_HOUSE_ID, 'Clan Ua’Cleir', CLEIR_EMBLEM),
    createTirNaSinsearHouse('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    createTirNaSinsearHouse('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    createTirNaSinsearHouse('house-eirce', 'Clan Ua’Eirce', LEITHEACH_LAIRD_HOUSE_EMBLEMS['ua-eirce']),
    createTirNaSinsearHouse('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch),
    createTirNaSinsearHouse('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']),
    createTirNaSinsearHouse('house-na-mhuir', 'Clan Na’Mhuir', TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']),
    createTirNaSinsearHouse('house-fiachrach', 'Clan Uí Fiachrach', LEITHEACH_CADET_HOUSE_EMBLEMS['ui-fiachrach']),
    createTirNaSinsearHouse('house-illwath', "Haus Illwath O'Caer Llew", SONNENKUESTE_HOUSE_EMBLEMS.illwath),
    createTirNaSinsearHouse('house-llwynog', "Haus Llwynog O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.llwynog)
  ],
  persons: [
    person('gilleon-gallchobhair', 'Gilleón Gallchobhair', 'male', '1170', '1207', {
      houseId: 'house-gallchobhair',
      familyRole: 'core',
      notes: 'Gilleón begründete als Gallchobhair-Spross den Clan Ua’Cleir. Das bereits korrigierte Geburtsjahr 1170 ersetzt die erneute Altangabe 1125.'
    }),
    spouse('aisling-ancient', 'Aisling', 'female', '1130', '1229'),

    awayWoman('greineach-cleir', 'Gréineach Cleir', '1628', '1705', TARGETS.gaelach),
    spouse('aibhistin-gealach', 'Aibhistín Gealach', 'male', '1633', '1709', 'house-gealach'),
    person('feidlimid-cleir', 'Feidlimid Cleir', 'male', '1628', '1689'),
    spouse('unaith-gallchobhair', 'Únaith Gallchobhair', 'female', '1630', '1700', 'house-gallchobhair'),
    person('zairlach-cleir', 'Záirlach Cleir', 'male', '1628', ''),

    awayWoman('grian-cleir', 'Grian Cleir', '1650', '1707', TARGETS.eirce),
    spouse('hoibrean-eirce', 'Hoibrean Eirce', 'male', '1649', '1711', 'house-eirce'),
    person('eoghan-cleir', 'Eoghan Cleir', 'male', '1650', '1724'),
    spouse('cionaodh-ghaiscioch', 'Cionaodh Ghaiscíoch', 'female', '1652', '1704', 'house-ghaiscioch'),
    awayWoman('boudica-cleir', 'Boudica Cleir', '1653', '1709', TARGETS.ceardaiocht),
    spouse('fergal-ceardaiocht', 'Fergal Ceardaíocht', 'male', '????', '????', 'house-dal-ceardaiocht'),

    person('colm-cleir', 'Colm Cleir', 'male', '1670', ''),
    spouse('vionaigh-mhuir', 'Víonaigh Mhuir', 'female', '1675', '', 'house-na-mhuir'),
    awayWoman('clodagh-cleir', 'Clodagh Cleir', '1674', '', TARGETS.gallchobhair),
    spouse('sloane-gallchobhair', 'Sloane Gallchobhair', 'male', '1670', '', 'house-gallchobhair'),
    person('homlach-cleir', 'Hómlach Cleir', 'male', '1676', ''),
    person('bearnard-cleir', 'Bearnard Cleir', 'male', '1678', '1733'),
    spouse('yoliva-fiachrach', 'Yoliva Fiachrach', 'female', '1680', '', 'house-fiachrach'),

    person('gearoid-cleir', 'Gearóid Cleir', 'male', '1694', '1733'),
    spouse('johana-ceardaiocht', 'Jóhana Ceardaíocht', 'female', '1697', '', 'house-dal-ceardaiocht'),
    awayWoman('nessa-cleir', 'Nessa Cleir', '1698', '', TARGETS.illwath),
    spouse('kynwas-illwath', 'Kynwas Illwath', 'male', '1696', '', 'house-illwath'),
    awayWoman('mairead-cleir', 'Mairead Cleir', '1700', '', TARGETS.llwynog),
    spouse('bevan-llwynog', 'Bevan Llwynog', 'male', '1698', '', 'house-llwynog'),
    person('labhras-cleir', 'Labhrás Cleir', 'male', '1699', ''),
    spouse('darerca-ghaiscioch', 'Darerca Ghaiscíoch', 'female', '1702', '', 'house-ghaiscioch'),
    person('iomhar-cleir', 'Íomhar Cleir', 'male', '1702', ''),
    spouse('peighann-ancient', 'Peighann', 'female', '1704', '1733'),

    person('donal-cleir', 'Donal Cleir', 'male', '1719', ''),
    person('ciara-cleir', 'Ciara Cleir', 'female', '1724', ''),
    person('artair-cleir', 'Artair Cleir', 'male', '1720', '1733'),
    person('enya-cleir', 'Enya Cleir', 'female', '1725', ''),
    person('goban-cleir', 'Gobán Cleir', 'male', '1728', ''),
    person('heile-cleir', 'Héile Cleir', 'female', '1725', ''),
    person('kinnan-cleir', 'Kinnán Cleir', 'male', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-gilleon-aisling', ...GILLEON_IDS),
    createMarriage('marriage-aibhistin-greineach', ...AIBHISTIN_IDS),
    createMarriage('marriage-unaith-feidlimid', ...FEIDLIMID_IDS),
    createMarriage('marriage-hoibrean-grian', ...GRIAN_IDS),
    createMarriage('marriage-eoghan-cionaodh', ...EOGHAN_IDS),
    createMarriage('marriage-boudica-fergal', ...BOUDICA_IDS),
    createMarriage('marriage-colm-vionaigh', ...COLM_IDS),
    createMarriage('marriage-sloane-clodagh', ...CLODAGH_IDS),
    createMarriage('marriage-yoliva-bearnard', ...BEARNARD_IDS),
    createMarriage('marriage-gearoid-johana', ...GEAROID_IDS),
    createMarriage('marriage-kynwas-nessa-illwath', ...NESSA_IDS),
    createMarriage('marriage-bevan-mairead-llwynog', ...MAIREAD_IDS),
    createMarriage('marriage-labhras-darerca', ...LABHRAS_IDS),
    createMarriage('marriage-iomhar-peighann', ...IOMHAR_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['greineach-cleir', 'feidlimid-cleir', 'zairlach-cleir'],
      GILLEON_IDS,
      'marriage-gilleon-aisling',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Zwischen Gilleóns Gründerpaar und der Generation von 1628 fehlen viele einzeln belegte Generationen.',
        extensions: { timeJumpId: 'gap-gilleon-greineach-feidlimid' }
      }
    ),
    ...childrenOf(['grian-cleir', 'eoghan-cleir', 'boudica-cleir'], FEIDLIMID_IDS, 'marriage-unaith-feidlimid'),
    ...childrenOf(['colm-cleir', 'clodagh-cleir', 'homlach-cleir', 'bearnard-cleir'], EOGHAN_IDS, 'marriage-eoghan-cionaodh'),
    ...childrenOf(['gearoid-cleir', 'nessa-cleir', 'mairead-cleir'], COLM_IDS, 'marriage-colm-vionaigh'),
    ...childrenOf(['labhras-cleir', 'iomhar-cleir'], BEARNARD_IDS, 'marriage-yoliva-bearnard'),
    ...childrenOf(['donal-cleir', 'ciara-cleir'], GEAROID_IDS, 'marriage-gearoid-johana'),
    ...childrenOf(['artair-cleir', 'enya-cleir', 'goban-cleir'], LABHRAS_IDS, 'marriage-labhras-darerca'),
    ...childrenOf(['heile-cleir', 'kinnan-cleir'], IOMHAR_IDS, 'marriage-iomhar-peighann')
  ],
  cadetBranches: [
    createTirNaSinsearMarriedAwayBranch('married-away-gaelach-greineach', 'marriage-aibhistin-greineach', TARGETS.gaelach),
    createTirNaSinsearMarriedAwayBranch('married-away-eirce-grian', 'marriage-hoibrean-grian', TARGETS.eirce),
    createTirNaSinsearMarriedAwayBranch('married-away-ceardaiocht-boudica', 'marriage-boudica-fergal', TARGETS.ceardaiocht),
    createTirNaSinsearMarriedAwayBranch('married-away-gallchobhair-clodagh', 'marriage-sloane-clodagh', TARGETS.gallchobhair),
    createTirNaSinsearMarriedAwayBranch('married-away-illwath-nessa', 'marriage-kynwas-nessa-illwath', TARGETS.illwath),
    createTirNaSinsearMarriedAwayBranch('married-away-llwynog-mairead', 'marriage-bevan-mairead-llwynog', TARGETS.llwynog)
  ],
  timeJumps: [
    createTirNaSinsearTimeJump({
      id: 'gap-gilleon-greineach-feidlimid',
      parentPartnershipId: 'marriage-gilleon-aisling',
      childIds: ['greineach-cleir', 'feidlimid-cleir', 'zairlach-cleir'],
      fromYear: '1207',
      toYear: '1628'
    })
  ],
  lineage: {
    founderPartnershipId: 'marriage-gilleon-aisling',
    houseId: CLEIR_HOUSE_ID,
    crestSubtitle: 'Lairdtum unter den Fir An’Gallchobhair · Tir na Sinsear · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gilleon-gallchobhair',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Ua’Cleir (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Oberhäupter und Erbfolgen folgen der bereitgestellten Ua’Cleir-Hierarchie. Die erneute Altangabe 1125 für Gilleón wird durch die bereits ausdrücklich festgelegte Datierung 1170 ersetzt. Kynwas’ offenkundiges Quellenjahr 1996 wird anhand seiner ausgearbeiteten Illwath-Gegenakte als 1696 geführt. Die Punktreihe nach dem Gründerpaar bildet einen seriellen Überlieferungssprung. Verheiratete Cleir-Frauen ohne lokal fortgeführte Kinder besitzen direkte Zielhausknoten. Sämtliche Bilder der bereitgestellten Cleir-Quelle werden als veraltet ignoriert; nur bereits bestehende Porträts identischer Weltpersonen werden wiederverwendet. Víonaigh verwendet nun ihr kanonisches Na’Mhuir-Porträt und die einheitliche Na’Mhuir-Hauskennung.',
    sourceRevision: 3,
    blankFamily: false,
    preparedMainLine: false,
    sourceCorrections: Object.freeze([
      'Gilleón Gallchobhair wurde mit dem bereits festgelegten Geburtsjahr 1170 statt der alten Tabellenangabe 1125 übernommen.',
      'Kynwas Illwaths Geburtsjahr 1996 wurde entsprechend seiner bestehenden Gegenakte zu 1696 berichtigt.'
    ]),
    inheritance: Object.freeze({
      title: 'Laird des Clans Ua’Cleir',
      publishedOrder: Object.freeze([]),
      sourceDiscrepancy: 'Die Erbfolgetafel enthält lediglich drei unbekannte Platzhalter und erlaubt keine belastbare Namenszuordnung.'
    }),
    portraitPolicy: Object.freeze({
      sourceImagesIgnored: true,
      reusedPersonIds: HOUSE_UA_CLEIR_REUSED_PORTRAIT_IDS
    }),
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    albicRank: 'laird',
    immediateLiegeHouseId: 'haus-gallchobhair',
    immediateLiegeHouseName: 'Fir An’Gallchobhair',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'sourceNote', 'sourceCorrections', 'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: { houses: ['house-mhuir'] }
  }
});
