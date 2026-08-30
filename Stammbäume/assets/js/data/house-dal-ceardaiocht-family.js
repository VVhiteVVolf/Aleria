import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createMarriage,
  createParentages
} from './family-record-builders.js';
import {
  createTirNaSinsearCadetRecordFactory,
  createTirNaSinsearHouse,
  createTirNaSinsearMarriedAwayBranch
} from './tir-na-sinsear-cadet-family-builders.js';
import {
  HOUSE_DAL_CEARDAIOCHT_PORTRAITS,
  HOUSE_DAL_CEARDAIOCHT_REUSED_PORTRAIT_IDS
} from './tir-na-sinsear-cadet-portraits.js';
import {
  LEITHEACH_HOUSE_EMBLEMS
} from './leitheach-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

const CEARDAIOCHT_HOUSE_ID = 'house-dal-ceardaiocht';
const CEARDAIOCHT_EMBLEM = TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht'];

const HEAD_TITLES = Object.freeze({
  'aonghus-gallchobhair': 'Gründer und erster Laird des Clans Dál’Ceardaíocht · bis 1672',
  'wiomar-ceardaiocht': 'Laird des Clans Dál’Ceardaíocht · 1672–1681',
  'lugaid-ceardaiocht': 'Laird des Clans Dál’Ceardaíocht · 1681–1720',
  'caibrel-ceardaiocht': 'Laird des Clans Dál’Ceardaíocht · seit 1720'
});

const TARGETS = Object.freeze({
  ruitheach: Object.freeze({
    name: 'Haus Ruitheach',
    houseId: 'house-ruitheach',
    targetFamilyId: 'haus-ruitheach',
    emblem: ''
  }),
  ghaiscioch: Object.freeze({
    name: 'Clan Ua’Ghaiscíoch',
    houseId: 'house-ghaiscioch',
    targetFamilyId: 'haus-ghaiscioch',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  blach: Object.freeze({
    name: "Haus Blach O'Aberon",
    houseId: 'house-blach',
    targetFamilyId: 'haus-blach',
    emblem: SONNENKUESTE_HOUSE_EMBLEMS.blach
  }),
  cleir: Object.freeze({
    name: 'Clan Ua’Cleir',
    houseId: 'house-cleir',
    targetFamilyId: 'haus-cleir',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir
  })
});

const { person, spouse, awayWoman } = createTirNaSinsearCadetRecordFactory({
  houseId: CEARDAIOCHT_HOUSE_ID,
  portraits: HOUSE_DAL_CEARDAIOCHT_PORTRAITS,
  headTitles: HEAD_TITLES
});

const AONGHUS_FOUNDER_IDS = ['aonghus-gallchobhair', 'etain-ancient'];
const WIOMAR_IDS = ['wiomar-ceardaiocht', 'glaine-mhuir'];
const WUNAIRE_IDS = ['wunaire-ceardaiocht', 'janar-ruitheach'];
const SEAMUS_AFFAIR_IDS = ['seamus-ceardaiocht', 'rannveig-ancient'];
const SEAMUS_IDS = ['seamus-ceardaiocht', 'peig-ancient'];
const LUGAID_IDS = ['uathach-gallchobhair', 'lugaid-ceardaiocht'];
const PRAELEEN_IDS = ['gregoir-ghaiscioch', 'praeleen-ceardaiocht'];
const FERGAL_IDS = ['boudica-cleir', 'fergal-ceardaiocht'];
const CAIBREL_IDS = ['sianwen-illwath', 'caibrel-ceardaiocht'];
const BLATHLI_IDS = ['erlach-gealach', 'blathli-ceardaiocht'];
const MIDEAN_IDS = ['midean-ceardaiocht', 'hanae-frisealach'];
const BARDAN_IDS = ['bardan-ceardaiocht', 'lorna-tsaoir'];
const ROGAN_IDS = ['aideen-gallchobhair', 'rogan-ceardaiocht'];
const CAITRIONA_IDS = ['emyrs-blach', 'caitriona-ceardaiocht'];
const DAIBHIN_IDS = ['daibhin-ceardaiocht', 'duna-mhuir'];
const JOHANA_IDS = ['gearoid-cleir', 'johana-ceardaiocht'];
const AONGHUS_YOUNGER_IDS = ['aonghus-1700-ceardaiocht', 'brona-ancient-ceardaiocht'];

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'ceardaiocht-parentage',
    ...options
  });
}

export const HOUSE_DAL_CEARDAIOCHT_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dal-ceardaiocht',
    title: 'Clan Dál’Ceardaíocht',
    motto: '',
    description: 'Laird-Clan in Tir na Sinsear und Kadettenlinie der Fir An’Gallchobhair, begründet durch Aonghus Gallchobhair.',
    emblem: CEARDAIOCHT_EMBLEM,
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES['dal-ceardaiocht']
  },
  houses: [
    createTirNaSinsearHouse(CEARDAIOCHT_HOUSE_ID, 'Clan Dál’Ceardaíocht', CEARDAIOCHT_EMBLEM),
    createTirNaSinsearHouse('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    createTirNaSinsearHouse('house-na-mhuir', 'Clan Na’Mhuir', TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']),
    createTirNaSinsearHouse('house-ruitheach', 'Haus Ruitheach'),
    createTirNaSinsearHouse('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch),
    createTirNaSinsearHouse('house-cleir', 'Clan Ua’Cleir', TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir),
    createTirNaSinsearHouse('house-illwath', "Haus Illwath O'Caer Llew", SONNENKUESTE_HOUSE_EMBLEMS.illwath),
    createTirNaSinsearHouse('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    createTirNaSinsearHouse('house-frisealach', 'Haus Frisealach'),
    createTirNaSinsearHouse('house-dal-t-saor', 'Dal T’Saor'),
    createTirNaSinsearHouse('house-blach', "Haus Blach O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.blach),
    createTirNaSinsearHouse('house-llwynog', "Haus Llwynog O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.llwynog)
  ],
  persons: [
    person('aonghus-gallchobhair', 'Aonghus Gallchobhair', 'male', '1635', '1672', {
      houseId: 'house-gallchobhair',
      familyRole: 'core',
      notes: 'Aonghus begründete als Gallchobhair-Spross den Clan Dál’Ceardaíocht. Das bereits festgelegte Geburtsjahr 1635 ersetzt die erneute Altangabe 1610.'
    }),
    spouse('etain-ancient', 'Ètáin', 'female', '1622', '1695'),

    person('wiomar-ceardaiocht', 'Wíomar Ceardaíocht', 'male', '1630', '1681'),
    spouse('glaine-mhuir', 'Glaine Mhuir', 'female', '1632', '1679', 'house-na-mhuir'),
    awayWoman('wunaire-ceardaiocht', 'Wúnaire Ceardaíocht', '1632', '1704', TARGETS.ruitheach),
    spouse('janar-ruitheach', 'Jánar Ruitheach', 'male', '1628', '1671', 'house-ruitheach'),
    person('seamus-ceardaiocht', 'Séamus Ceardaíocht', 'male', '1634', '1659'),
    spouse('rannveig-ancient', 'Rannveig', 'female', '1630', '1659'),
    spouse('peig-ancient', 'Peig', 'female', '1634', '1670'),

    person('lugaid-ceardaiocht', 'Lugaid Ceardaíocht', 'male', '1650', '1720'),
    spouse('uathach-gallchobhair', 'Uathach Gallchobhair', 'female', '1652', '1711', 'house-gallchobhair'),
    awayWoman('praeleen-ceardaiocht', 'Praeleen Ceardaíocht', '1651', '1709', TARGETS.ghaiscioch),
    spouse('gregoir-ghaiscioch', 'Gréagóir Ghaiscíoch', 'male', '1648', '1715', 'house-ghaiscioch'),
    person('zinotra-ceardaiocht', 'Zinótra Ceardaíocht', 'female', '1650', '', {
      title: 'Uneheliche Tochter Séamus’ und Rannveigs',
      tags: ['Unehelich']
    }),
    person('fergal-ceardaiocht', 'Fergal Ceardaíocht', 'male', '1652', '1702'),
    spouse('boudica-cleir', 'Boudica Cleir', 'female', '1653', '1709', 'house-cleir'),

    person('caibrel-ceardaiocht', 'Caibrel Ceardaíocht', 'male', '1675', ''),
    spouse('sianwen-illwath', 'Sianwen Illwath', 'female', '1674', '', 'house-illwath'),
    awayWoman('blathli-ceardaiocht', 'Bláthlí Ceardaíocht', '1678', '', TARGETS.gaelach),
    spouse('erlach-gealach', 'Érlach Gealach', 'male', '1676', '', 'house-gealach'),
    person('midean-ceardaiocht', 'Mídean Ceardaíocht', 'male', '1679', '1733'),
    spouse('hanae-frisealach', 'Hanae Frisealach', 'female', '1680', '', 'house-frisealach'),
    person('bardan-ceardaiocht', 'Bardán Ceardaíocht', 'male', '1677', ''),
    spouse('lorna-tsaoir', 'Lorna T’Saoir', 'female', '1677', '1733', 'house-dal-t-saor'),
    person('goibhne-ceardaiocht', 'Goibhne Ceardaíocht', 'male', '1682', ''),

    person('rogan-ceardaiocht', 'Rógán Ceardaíocht', 'male', '1696', '', {
      title: 'Erster in der Erbfolge',
      lineageRole: 'mainline'
    }),
    spouse('aideen-gallchobhair', 'Aideen Gallchobhair', 'female', '1703', '1733', 'house-gallchobhair'),
    awayWoman('caitriona-ceardaiocht', 'Caitriona Ceardaíocht', '1696', '', TARGETS.blach),
    spouse('emyrs-blach', 'Emyrs Blach', 'male', '1692', '', 'house-blach'),
    person('daibhin-ceardaiocht', 'Daibhín Ceardaíocht', 'male', '1697', ''),
    spouse('duna-mhuir', 'Dúna Mhuir', 'female', '1700', '', 'house-na-mhuir'),
    awayWoman('johana-ceardaiocht', 'Jóhana Ceardaíocht', '1697', '', TARGETS.cleir),
    spouse('gearoid-cleir', 'Gearóid Cleir', 'male', '1694', '1733', 'house-cleir'),
    person('aonghus-1700-ceardaiocht', 'Aonghus Ceardaíocht', 'male', '1700', '1733'),
    spouse('brona-ancient-ceardaiocht', 'Bróna', 'female', '1702', '1733'),

    person('jocan-ceardaiocht', 'Jocán Ceardaíocht', 'male', '1724', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('etain-ceardaiocht', 'Étaín Ceardaíocht', 'female', '1726', '', {
      title: 'Dritte in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('cari-llwynog', 'Cari Llwynog', 'female', '1724', '', {
      houseId: 'house-llwynog',
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Rógáns',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Cari ist biologisch dem Hause Llwynog zugeordnet und wird hier ausschließlich als Rógáns Mündel geführt.'
    }),
    person('bran-ceardaiocht', 'Bran Ceardaíocht', 'male', '1722', ''),
    person('zoran-ceardaiocht', 'Zorán Ceardaíocht', 'male', '1726', ''),
    person('tomas-ceardaiocht', 'Tómas Ceardaíocht', 'male', '1723', '1733'),
    person('hallaith-ceardaiocht', 'Hallaith Ceardaíocht', 'female', '1728', '')
  ],
  partnerships: [
    createMarriage('marriage-aonghus-etain', ...AONGHUS_FOUNDER_IDS),
    createMarriage('marriage-wiomar-glaine', ...WIOMAR_IDS),
    createMarriage('marriage-wunaire-janar', ...WUNAIRE_IDS),
    createMarriage('affair-seamus-rannveig', ...SEAMUS_AFFAIR_IDS, { type: 'affair', status: 'ended' }),
    createMarriage('marriage-seamus-peig', ...SEAMUS_IDS),
    createMarriage('marriage-uathach-lugaid', ...LUGAID_IDS),
    createMarriage('marriage-gregoir-praeleen', ...PRAELEEN_IDS),
    createMarriage('marriage-boudica-fergal', ...FERGAL_IDS),
    createMarriage('marriage-sianwen-caibrel-illwath', ...CAIBREL_IDS),
    createMarriage('marriage-erlach-blathli', ...BLATHLI_IDS),
    createMarriage('marriage-midean-hanae', ...MIDEAN_IDS),
    createMarriage('marriage-bardan-lorna', ...BARDAN_IDS),
    createMarriage('marriage-aideen-rogan', ...ROGAN_IDS),
    createMarriage('marriage-emyrs-caitriona-blach', ...CAITRIONA_IDS),
    createMarriage('marriage-daibhin-duna', ...DAIBHIN_IDS),
    createMarriage('marriage-gearoid-johana', ...JOHANA_IDS),
    createMarriage('marriage-aonghus-brona', ...AONGHUS_YOUNGER_IDS)
  ],
  parentages: [
    ...childrenOf(['wiomar-ceardaiocht', 'wunaire-ceardaiocht', 'seamus-ceardaiocht'], AONGHUS_FOUNDER_IDS, 'marriage-aonghus-etain', {
      notes: 'Die überlieferten Geburtsjahre dieser Generation liegen vor dem bereits ausdrücklich korrigierten Geburtsjahr des Gründers Aonghus; der ungelöste Quellenwiderspruch wird bewusst erhalten.'
    }),
    ...childrenOf(['lugaid-ceardaiocht', 'praeleen-ceardaiocht'], WIOMAR_IDS, 'marriage-wiomar-glaine'),
    ...childrenOf(['zinotra-ceardaiocht'], SEAMUS_AFFAIR_IDS, 'affair-seamus-rannveig', {
      legitimacy: 'illegitimate',
      notes: 'Zinótra entstammt der außerehelichen Verbindung Séamus’ mit Rannveig.'
    }),
    ...childrenOf(['fergal-ceardaiocht'], SEAMUS_IDS, 'marriage-seamus-peig'),
    ...childrenOf(['caibrel-ceardaiocht', 'blathli-ceardaiocht', 'midean-ceardaiocht'], LUGAID_IDS, 'marriage-uathach-lugaid'),
    ...childrenOf(['bardan-ceardaiocht', 'goibhne-ceardaiocht'], FERGAL_IDS, 'marriage-boudica-fergal'),
    ...childrenOf(['rogan-ceardaiocht', 'caitriona-ceardaiocht'], CAIBREL_IDS, 'marriage-sianwen-caibrel-illwath'),
    ...childrenOf(['daibhin-ceardaiocht', 'johana-ceardaiocht'], MIDEAN_IDS, 'marriage-midean-hanae'),
    ...childrenOf(['aonghus-1700-ceardaiocht'], BARDAN_IDS, 'marriage-bardan-lorna'),
    ...childrenOf(['jocan-ceardaiocht', 'etain-ceardaiocht'], ROGAN_IDS, 'marriage-aideen-rogan'),
    ...createParentages(['cari-llwynog'], ['rogan-ceardaiocht'], '', {
      idPrefix: 'ceardaiocht-parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Cari bleibt biologisch Kind des Hauses Llwynog und wurde von Rógán als Mündel aufgenommen.'
    }),
    ...childrenOf(['bran-ceardaiocht', 'zoran-ceardaiocht'], DAIBHIN_IDS, 'marriage-daibhin-duna'),
    ...childrenOf(['tomas-ceardaiocht', 'hallaith-ceardaiocht'], AONGHUS_YOUNGER_IDS, 'marriage-aonghus-brona')
  ],
  cadetBranches: [
    createTirNaSinsearMarriedAwayBranch('married-away-ruitheach-wunaire', 'marriage-wunaire-janar', TARGETS.ruitheach),
    createTirNaSinsearMarriedAwayBranch('married-away-ghaiscioch-praeleen', 'marriage-gregoir-praeleen', TARGETS.ghaiscioch),
    createTirNaSinsearMarriedAwayBranch('married-away-gaelach-blathli', 'marriage-erlach-blathli', TARGETS.gaelach),
    createTirNaSinsearMarriedAwayBranch('married-away-blach-caitriona', 'marriage-emyrs-caitriona-blach', TARGETS.blach),
    createTirNaSinsearMarriedAwayBranch('married-away-cleir-johana', 'marriage-gearoid-johana', TARGETS.cleir)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-aonghus-etain',
    houseId: CEARDAIOCHT_HOUSE_ID,
    crestSubtitle: 'Lairdtum unter den Fir An’Gallchobhair · Tir na Sinsear · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aonghus-gallchobhair',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Dál’Ceardaíocht (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Oberhäupter und Erbfolge folgen der bereitgestellten Dál’Ceardaíocht-Hierarchie. Aonghus wird entsprechend der bereits ausdrücklich festgelegten Datierung 1635–1672 geführt; dadurch liegen die übernommenen Geburtsjahre seiner ersten drei Nachkommen vor seinem eigenen und bleiben als offener Quellenwiderspruch dokumentiert. Die offenkundig vertauschten Todesjahre des jüngeren Aonghus und Brónas werden zu 1733 normalisiert. Cari bleibt biologisches Kind des Hauses Llwynog und erscheint ausschließlich als Rógáns aufgenommenes Mündel. Sämtliche Bilder der bereitgestellten Ceardaíocht-Quelle werden als veraltet ignoriert; nur bereits bestehende Porträts identischer Weltpersonen werden wiederverwendet. Glaine und Dúna verwenden nun ihre kanonischen Na’Mhuir-Porträts und die einheitliche Na’Mhuir-Hauskennung. Lornas Hauskennung verweist nun auf die ausgearbeitete Hauptakte Dal T’Saor.',
    sourceRevision: 5,
    blankFamily: false,
    preparedMainLine: false,
    sourceCorrections: Object.freeze([
      'Aonghus Gallchobhair wurde mit der bereits festgelegten Datierung 1635–1672 statt der alten Tabellenangabe 1610–1672 übernommen.',
      'Die Todesjahre 1633 des jüngeren Aonghus und Brónas wurden als offenkundige Zahlendreher zu 1733 berichtigt.'
    ]),
    sourceDiscrepancies: Object.freeze([
      'Wíomar (1630), Wúnaire (1632) und Séamus (1634) werden als Kinder des auf 1635 datierten Gründers Aonghus überliefert. Die widersprüchlichen Kinderdaten bleiben bis zu einer inhaltlichen Klärung unverändert.'
    ]),
    inheritance: Object.freeze({
      title: 'Laird des Clans Dál’Ceardaíocht',
      publishedOrder: Object.freeze(['rogan-ceardaiocht', 'jocan-ceardaiocht', 'etain-ceardaiocht'])
    }),
    portraitPolicy: Object.freeze({
      sourceImagesIgnored: true,
      reusedPersonIds: HOUSE_DAL_CEARDAIOCHT_REUSED_PORTRAIT_IDS
    }),
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    albicRank: 'laird',
    immediateLiegeHouseId: 'haus-gallchobhair',
    immediateLiegeHouseName: 'Fir An’Gallchobhair',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'sourceNote', 'sourceCorrections', 'sourceDiscrepancies', 'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: { houses: ['house-mhuir', 'house-tsaoir'] }
  }
});
