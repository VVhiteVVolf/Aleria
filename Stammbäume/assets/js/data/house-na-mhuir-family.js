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
  HOUSE_NA_MHUIR_LOCAL_PORTRAIT_IDS,
  HOUSE_NA_MHUIR_PORTRAITS,
  HOUSE_NA_MHUIR_REUSED_PORTRAIT_IDS
} from './house-na-mhuir-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import {
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

const NA_MHUIR_HOUSE_ID = 'house-na-mhuir';
const NA_MHUIR_EMBLEM = TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir'];

const HEAD_TITLES = Object.freeze({
  'connla-mhuir': 'Erster überlieferter Laird des Clans Na’Mhuir',
  'ytaran-mhuir': 'Laird des Clans Na’Mhuir · bis 1694',
  'lochlainn-mhuir': 'Laird des Clans Na’Mhuir · 1694–1720',
  'aodhagan-mhuir': 'Laird des Clans Na’Mhuir · seit 1720'
});

const TARGETS = Object.freeze({
  ceardaiocht: Object.freeze({
    name: 'Clan Dál’Ceardaíocht',
    houseId: 'house-dal-ceardaiocht',
    targetFamilyId: 'haus-dal-ceardaiocht',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']
  }),
  gruenhand: Object.freeze({
    name: 'Sept Grünhand aus Leith',
    houseId: 'house-gruenhand',
    targetFamilyId: 'haus-gruenhand',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gruenhand
  }),
  cleir: Object.freeze({
    name: 'Clan Ua’Cleir',
    houseId: 'house-cleir',
    targetFamilyId: 'haus-cleir',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
  })
});

const { person, spouse, awayWoman } = createTirNaSinsearCadetRecordFactory({
  houseId: NA_MHUIR_HOUSE_ID,
  portraits: HOUSE_NA_MHUIR_PORTRAITS,
  headTitles: HEAD_TITLES
});

const CONNLA_IDS = ['connla-mhuir', 'dechtire-ancient-mhuir'];
const YTARAN_IDS = ['ytaran-mhuir', 'hearnait-laidir'];
const GLAINE_IDS = ['wiomar-ceardaiocht', 'glaine-mhuir'];
const LOCHLAINN_IDS = ['mallaidh-gallchobhair', 'lochlainn-mhuir'];
const MALACH_IDS = ['malach-mhuir', 'quonnait-caiomhe'];
const MUIRGHEAS_IDS = ['muirgheas-mhuir', 'fionnghuala-choinnich'];
const FIONNBARR_IDS = ['fionnbarr-mhuir', 'rosamair-gruenhand'];
const AODHAGAN_IDS = ['aodhagan-mhuir', 'rubybhna-gruenhand'];
const LANNRAIG_IDS = ['lannraig-mhuir', 'peregrain-gruenhand'];
const VIONAIGH_IDS = ['colm-cleir', 'vionaigh-mhuir'];
const CRIOSTOIR_IDS = ['keelaith-ghaiscioch', 'criostoir-mhuir'];
const TUAMAN_IDS = ['saorghlas-gealach', 'tuaman-mhuir'];
const OONAGH_IDS = ['holman-gallchobhair', 'oonagh-mhuir'];
const KHELLEN_IDS = ['branwen-illwath', 'khellen-mhuir'];
const KHELLEN_AFFAIR_IDS = ['khellen-mhuir', 'peadhra-mhuir-affair'];
const DUNA_IDS = ['daibhin-ceardaiocht', 'duna-mhuir'];
const ARTAIR_ENGAGEMENT_IDS = ['artair-mhuir', 'lobellin-gruenhand'];

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'na-mhuir-parentage',
    ...options
  });
}

export const HOUSE_NA_MHUIR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-na-mhuir',
    title: 'Clan Na’Mhuir',
    motto: '',
    description: 'Laird-Clan von Tir na Fancha mit Sitz in Broch an Coill, unmittelbar unter Clan Ua’Gaelach.',
    emblem: NA_MHUIR_EMBLEM,
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES['na-mhuir']
  },
  houses: [
    createTirNaSinsearHouse(NA_MHUIR_HOUSE_ID, 'Clan Na’Mhuir', NA_MHUIR_EMBLEM),
    createTirNaSinsearHouse('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    createTirNaSinsearHouse('house-laidir', 'Haus Laidir'),
    createTirNaSinsearHouse('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']),
    createTirNaSinsearHouse('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    createTirNaSinsearHouse('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    createTirNaSinsearHouse('house-choinnich', 'Haus Choinnich'),
    createTirNaSinsearHouse('house-gruenhand', 'Sept Grünhand aus Leith', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gruenhand),
    createTirNaSinsearHouse('house-cleir', 'Clan Ua’Cleir', TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir),
    createTirNaSinsearHouse('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch),
    createTirNaSinsearHouse('house-illwath', "Haus Illwath O'Caer Llew", SONNENKUESTE_HOUSE_EMBLEMS.illwath)
  ],
  persons: [
    person('connla-mhuir', 'Connla Mhuir', 'male', '????', '????'),
    spouse('dechtire-ancient-mhuir', 'Dechtire', 'female', '????', '????'),

    person('ytaran-mhuir', 'Ytáran Mhuir', 'male', '1628', '1694'),
    spouse('hearnait-laidir', 'Hearnait Laidir', 'female', '1632', '1699', 'house-laidir', {
      extensions: { registryManagedFields: ['death'] }
    }),
    awayWoman('glaine-mhuir', 'Glaine Mhuir', '1632', '1679', TARGETS.ceardaiocht),
    spouse('wiomar-ceardaiocht', 'Wíomar Ceardaíocht', 'male', '1630', '1681', 'house-dal-ceardaiocht'),

    person('lochlainn-mhuir', 'Lochlainn Mhuir', 'male', '1650', '1720'),
    spouse('mallaidh-gallchobhair', 'Mallaidh Gallchobhair', 'female', '1654', '1720', 'house-gallchobhair'),
    person('malach-mhuir', 'Málach Mhuir', 'male', '1652', '1715'),
    spouse('quonnait-caiomhe', 'Quonnait Caoimhe', 'female', '1648', '1729', 'house-caoimhe'),
    person('muirgheas-mhuir', 'Muirgheas Mhuir', 'male', '1654', '1709'),
    spouse('fionnghuala-choinnich', 'Fionnghuala Choinnich', 'female', '1656', '1734', 'house-choinnich'),

    person('fionnbarr-mhuir', 'Fionnbarr Mhuir', 'male', '1699', ''),
    spouse('rosamair-gruenhand', 'Rósamair Grünhand', 'female', '1704', '', 'house-gruenhand'),
    person('aodhagan-mhuir', 'Aodhagán Mhuir', 'male', '1672', ''),
    spouse('rubybhna-gruenhand', 'Rubybhna Grünhand', 'female', '1675', '', 'house-gruenhand'),
    awayWoman('lannraig-mhuir', 'Lannraig Mhuir', '1676', '', TARGETS.gruenhand),
    spouse('peregrain-gruenhand', 'Peregráin Grünhand', 'male', '1671', '', 'house-gruenhand'),
    awayWoman('vionaigh-mhuir', 'Víonaigh Mhuir', '1675', '', TARGETS.cleir),
    spouse('colm-cleir', 'Colm Cleir', 'male', '1670', '', 'house-cleir'),
    person('criostoir-mhuir', 'Críostóir Mhuir', 'male', '1674', ''),
    spouse('keelaith-ghaiscioch', 'Keelaith Ghaiscíoch', 'female', '1674', '', 'house-ghaiscioch'),

    person('tuaman-mhuir', 'Tuamán Mhuir', 'male', '1697', ''),
    spouse('saorghlas-gealach', 'Saorghlas Gealach', 'male', '1700', '', 'house-gealach'),
    awayWoman('oonagh-mhuir', 'Oonagh Mhuir', '1702', '', TARGETS.gallchobhair),
    spouse('holman-gallchobhair', 'Hólman Gallchobhair', 'male', '1700', '', 'house-gallchobhair'),
    person('dervla-mhuir', 'Dervla Mhuir', 'female', '1705', ''),
    person('khellen-mhuir', 'Khellen Mhuir', 'male', '1697', ''),
    spouse('branwen-illwath', 'Branwen Illwath', 'female', '1701', '', 'house-illwath'),
    person('peadhra-mhuir-affair', 'Peadhra', 'female', '1710', '????', {
      houseId: '',
      familyRole: 'affair',
      title: 'Affäre Khellens',
      tags: ['Affäre']
    }),
    awayWoman('duna-mhuir', 'Dúna Mhuir', '1700', '', TARGETS.ceardaiocht),
    spouse('daibhin-ceardaiocht', 'Daibhín Ceardaíocht', 'male', '1697', '', 'house-dal-ceardaiocht'),

    person('beathag-mhuir', 'Beathag Mhuir', 'female', '1721', ''),
    person('artair-mhuir', 'Artair Mhuir', 'male', '1724', ''),
    spouse('lobellin-gruenhand', 'Lobellín Grünhand', 'female', '1722', '', 'house-gruenhand', {
      title: 'Wegverlobt an Clan Na’Mhuir',
      tags: ['Wegverlobt']
    }),
    person('vannoch-mhuir', 'Vannoch Mhuir', 'male', '1723', ''),
    person('heulyn-mhuir', 'Heulyn Mhuir', 'female', '1727', ''),
    person('keiran-mhuir', 'Keiran Mhuir', 'male', '1730', '', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Khellens und Peadhras',
      tags: ['Bastard']
    })
  ],
  partnerships: [
    createMarriage('marriage-connla-dechtire', ...CONNLA_IDS, { status: 'ended' }),
    createMarriage('marriage-ytaran-hearnait', ...YTARAN_IDS, { status: 'ended', end: '1694' }),
    createMarriage('marriage-wiomar-glaine', ...GLAINE_IDS, { status: 'ended', end: '1679' }),
    createMarriage('marriage-mallaidh-lochlainn', ...LOCHLAINN_IDS, { status: 'ended', end: '1720' }),
    createMarriage('marriage-malach-quonnait', ...MALACH_IDS, { status: 'ended', end: '1715' }),
    createMarriage('marriage-muirgheas-fionnghuala', ...MUIRGHEAS_IDS, { status: 'ended', end: '1709' }),
    createMarriage('marriage-fionnbarr-rosamair-mhuir', ...FIONNBARR_IDS),
    createMarriage('marriage-aodhagan-rubybhna', ...AODHAGAN_IDS),
    createMarriage('marriage-lannraig-peregrain', ...LANNRAIG_IDS),
    createMarriage('marriage-colm-vionaigh', ...VIONAIGH_IDS),
    createMarriage('marriage-keelaith-criostoir', ...CRIOSTOIR_IDS),
    createMarriage('marriage-saorghlas-tuaman', ...TUAMAN_IDS),
    createMarriage('marriage-holman-oonagh', ...OONAGH_IDS),
    createMarriage('marriage-branwen-khellen-illwath', ...KHELLEN_IDS),
    createMarriage('affair-khellen-peadhra', ...KHELLEN_AFFAIR_IDS, {
      type: 'affair',
      status: 'ended',
      visibility: 'private',
      notes: 'Aus dieser Affäre stammt Keiran Mhuir.'
    }),
    createMarriage('marriage-daibhin-duna', ...DUNA_IDS),
    createMarriage('engagement-artair-lobellin', ...ARTAIR_ENGAGEMENT_IDS, {
      type: 'engagement',
      status: 'active'
    })
  ],
  parentages: [
    ...childrenOf(['ytaran-mhuir', 'glaine-mhuir'], CONNLA_IDS, 'marriage-connla-dechtire', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Connlas Gründerpaar und der Generation ab 1628 fehlen einzeln überlieferte Generationen.',
      extensions: { timeJumpId: 'gap-connla-ytaran-glaine' }
    }),
    ...childrenOf(['lochlainn-mhuir', 'malach-mhuir', 'muirgheas-mhuir'], YTARAN_IDS, 'marriage-ytaran-hearnait'),
    ...childrenOf(['fionnbarr-mhuir'], MALACH_IDS, 'marriage-malach-quonnait'),
    ...childrenOf(['aodhagan-mhuir', 'lannraig-mhuir'], LOCHLAINN_IDS, 'marriage-mallaidh-lochlainn'),
    ...childrenOf(['vionaigh-mhuir', 'criostoir-mhuir'], MUIRGHEAS_IDS, 'marriage-muirgheas-fionnghuala'),
    ...childrenOf(['tuaman-mhuir', 'oonagh-mhuir', 'dervla-mhuir'], AODHAGAN_IDS, 'marriage-aodhagan-rubybhna'),
    ...childrenOf(['khellen-mhuir', 'duna-mhuir'], CRIOSTOIR_IDS, 'marriage-keelaith-criostoir'),
    ...childrenOf(['beathag-mhuir', 'artair-mhuir'], TUAMAN_IDS, 'marriage-saorghlas-tuaman'),
    ...childrenOf(['vannoch-mhuir', 'heulyn-mhuir'], KHELLEN_IDS, 'marriage-branwen-khellen-illwath'),
    ...childrenOf(['keiran-mhuir'], KHELLEN_AFFAIR_IDS, 'affair-khellen-peadhra', {
      legitimacy: 'illegitimate'
    })
  ],
  cadetBranches: [
    createTirNaSinsearMarriedAwayBranch('married-away-ceardaiocht-glaine', 'marriage-wiomar-glaine', TARGETS.ceardaiocht),
    createTirNaSinsearMarriedAwayBranch('married-away-gruenhand-lannraig', 'marriage-lannraig-peregrain', TARGETS.gruenhand),
    createTirNaSinsearMarriedAwayBranch('married-away-cleir-vionaigh', 'marriage-colm-vionaigh', TARGETS.cleir),
    createTirNaSinsearMarriedAwayBranch('married-away-gallchobhair-oonagh', 'marriage-holman-oonagh', TARGETS.gallchobhair),
    createTirNaSinsearMarriedAwayBranch('married-away-ceardaiocht-duna', 'marriage-daibhin-duna', TARGETS.ceardaiocht)
  ],
  timeJumps: [
    createTirNaSinsearTimeJump({
      id: 'gap-connla-ytaran-glaine',
      parentPartnershipId: 'marriage-connla-dechtire',
      childIds: ['ytaran-mhuir', 'glaine-mhuir'],
      toYear: '1628'
    })
  ],
  lineage: {
    founderPartnershipId: 'marriage-connla-dechtire',
    houseId: NA_MHUIR_HOUSE_ID,
    crestSubtitle: 'Lairdtum Tir na Fancha · Broch an Coill · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'connla-mhuir',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Na’Mhuir (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Hausoberhäupter und die Überlieferungslücke folgen der bereitgestellten Na’Mhuir-Hierarchie. Tir na Fancha ersetzt die frühere technische Sammelbezeichnung „Herrschaft der Na’Mhuir“. Die individuellen Na’Mhuir-Porträts wurden lokal gesichert; für bereits anderweitig dargestellte Personen werden ausschließlich ihre vorhandenen kanonischen Bilder wiederverwendet. Wiederholte Standardsilhouetten dienen nur als Platzhalter und wurden nicht importiert. Glaine, Lannraig, Víonaigh, Oonagh und Dúna besitzen direkte Zielhausknoten. Die vier namenlosen Verlobten der jüngsten Sprösslinge wurden entfernt; nur Artairs namentlich belegte Verlobung mit Lobellín bleibt bestehen. Fionnbarr Mhuir und Rósamair Grünhand spiegeln die neu ausgebaute wegverheiratete Tochterlinie Peregráins. Kinder wegverheirateter Linien werden ausschließlich in den fortführenden Zielakten geführt.',
    sourceRevision: 5,
    blankFamily: false,
    preparedMainLine: false,
    sourceCorrections: Object.freeze([
      'Mallaidh Gallchobhairs Todesjahr folgt mit 1720 ihrer bereits ausgearbeiteten Gallchobhair-Gegenakte statt der Na’Mhuir-Altangabe 1715.',
      'Tuamán Mhuir wird entsprechend seinem individuellen Porträt als Mann geführt; die ältere Ua’Gaelach-Gegenakte wird daran angeglichen.'
    ]),
    inheritance: Object.freeze({
      title: 'Laird des Clans Na’Mhuir',
      publishedOrder: Object.freeze([]),
      sourceDiscrepancy: 'Die Erbfolgetafel enthält nur drei unbekannte Platzhalter und erlaubt keine belastbare Namenszuordnung.'
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_NA_MHUIR_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_NA_MHUIR_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    realm: 'Tir na Fancha',
    sourceSeatDiscrepancy: 'Die Familienübersicht nennt Broch an Abhainn; die ausführlichere Herrschaftsübersicht nennt Broch an Coill als Sitz.',
    albicRank: 'laird',
    immediateLiegeHouseId: 'haus-ua-gaelach',
    immediateLiegeHouseName: 'Clan Ua’Gaelach',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'sourceNote', 'sourceCorrections', 'inheritance', 'portraitPolicy', 'realm',
      'sourceSeatDiscrepancy'
    ],
    registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-mhuir', 'house-caiomhe'],
      persons: [
        'unknown-betrothed-beathag',
        'unknown-betrothed-vannoch',
        'unknown-betrothed-heulyn',
        'unknown-betrothed-keiran'
      ],
      partnerships: [
        'engagement-beathag-unknown',
        'engagement-vannoch-unknown',
        'engagement-heulyn-unknown',
        'engagement-keiran-unknown'
      ]
    }
  }
});
