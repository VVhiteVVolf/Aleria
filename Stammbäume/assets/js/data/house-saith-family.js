import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS, SILBERINSEL_HOUSE_PROFILES } from './silberinsel-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';
import { HOUSE_SAITH_PORTRAITS } from './house-saith-portraits.js';

const SAITH_HOUSE_ID = 'house-saith';
const SAITH_EMBLEM = SILBERINSEL_HOUSE_EMBLEMS.saith;
const SHARED_TIME_JUMP_ID = 'gap-dadweir-elinor-to-argyll-enfys-saith';

const HOUSE_EMBLEMS = Object.freeze({
  saith: SAITH_EMBLEM,
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  tiwna: SILBERINSEL_HOUSE_EMBLEMS.tiwna,
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan,
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  tirAddawol: WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'],
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png'
});

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

const SUCCESSION_TITLES = Object.freeze({
  'bors-saith': 'Begründer des Hauses Saith',
  'dadweir-saith': 'Ritterfürst des Hauses Saith',
  'argyll-saith': 'Ritterfürst des Hauses Saith bis 1701',
  'lancel-saith': 'Ritterfürst des Hauses Saith 1701–1717',
  'duny-saith': 'Ritterfürst des Hauses Saith seit 1717',
  'lyonel-saith': 'Erster Erbe des Hauses Saith'
});

const HOUSE_HEAD_IDS = new Set([
  'bors-saith',
  'dadweir-saith',
  'argyll-saith',
  'lancel-saith',
  'duny-saith'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return personId === 'lyonel-saith' ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SAITH_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SAITH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SAITH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['gwennan-neidr', 'bors-saith'],
  dadweir: ['dadweir-saith', 'llewella-saith'],
  elinor: ['merwin-neidr', 'elinor-saith'],
  argyll: ['argyll-saith', 'ysella-crefyddol'],
  enfys: ['enfys-saith', 'sieffre-draenog'],
  lancel: ['blodwen-creyr', 'lancel-saith'],
  ygraine: ['ygraine-saith', 'luan-tsaoir'],
  hetwn: ['jinell-neidr', 'hetwn-saith'],
  hopcyn: ['enid-wylan', 'hopcyn-saith'],
  merlijn: ['merlijn-saith', 'ysolt-pyrth'],
  duny: ['pavetta-marwolaeth', 'duny-saith'],
  darwyn: ['darwyn-saith', 'gwendolyn-crefyddol'],
  vortigern: ['vortigern-saith', 'jowan-canwyll'],
  alaweyn: ['alaweyn-saith', 'uvel-canwyll'],
  yseut: ['waleran-gwarchod', 'yseut-saith'],
  lyabelle: ['lyabelle-saith', 'bran-tiwna'],
  maelron: ['enora-saethwyr', 'maelron-saith'],
  maelyn: ['maelyn-saith', 'wynoc-pyrth'],
  xylon: ['zinnara-hwyaden', 'xylon-saith'],
  ariana: ['odyar-neidr', 'ariana-saith'],
  yvette: ['tirian-tir-addawol', 'yvette-saith']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-gwennan-bors': COUPLES.founders,
  'marriage-dadweir-llewella-saith': COUPLES.dadweir,
  'marriage-merwin-elinor': COUPLES.elinor,
  'marriage-argyll-ysella-saith': COUPLES.argyll,
  'marriage-blodwen-lancel-creyr': COUPLES.lancel,
  'marriage-jinell-hetwn': COUPLES.hetwn,
  'marriage-enid-hopcyn': COUPLES.hopcyn,
  'marriage-merlijn-ysolt-saith': COUPLES.merlijn,
  'marriage-pavetta-duny-marwolaeth': COUPLES.duny,
  'marriage-darwyn-gwendolyn-saith': COUPLES.darwyn,
  'marriage-vortigern-jowan-saith': COUPLES.vortigern,
  'marriage-enora-maelron': COUPLES.maelron,
  'marriage-zinnara-xylon-hwyaden': COUPLES.xylon
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'saith-parentage', ...options }
  );
}

function claimedAfterSharedGap(childIds, partnershipId, notes) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes,
    extensions: { timeJumpId: SHARED_TIME_JUMP_ID }
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: `Wegverheiratet an ${name}`
  });
}

export const HOUSE_SAITH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-saith',
    title: "Haus Saith O'Llanvane",
    motto: 'Trag deine Last und geh!',
    description: 'Die fromme, akademisch und seemännisch geprägte Ritterfürstenlinie der treuen Neidr-Vasallen von Llanvane.',
    emblem: SAITH_EMBLEM,
    houseProfile: SILBERINSEL_HOUSE_PROFILES.saith
  },
  houses: [
    house(SAITH_HOUSE_ID, "Haus Saith O'Llanvane", SAITH_EMBLEM),
    house('house-neidr', "Haus Neidr O'Llanvane", HOUSE_EMBLEMS.neidr),
    house('house-crefyddol', 'Haus Crefyddol', HOUSE_EMBLEMS.crefyddol),
    house('house-draenog', 'Haus Draenog'),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-tsaoir', "Haus T'Saoir"),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-canwyll', 'Haus Canwyll', HOUSE_EMBLEMS.canwyll),
    house('house-gwarchod', "Haus Gwarchod O'Glyndraith", HOUSE_EMBLEMS.gwarchod),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-tir-addawol', 'Haus Tir Addawol', HOUSE_EMBLEMS.tirAddawol)
  ],
  persons: [
    person('bors-saith', 'Bors Saith', 'male', '????', '????'),
    spouse('gwennan-neidr', 'Gwennan Neidr', 'female', '????', '????', 'house-neidr'),

    person('dadweir-saith', 'Dadweir Saith', 'male', '????', '????'),
    spouse('llewella-saith', 'Llewella Saith', 'female', '????', '????'),
    awayWoman('elinor-saith', 'Elinor Saith', '????', '????', 'Haus Neidr'),
    spouse('merwin-neidr', 'Merwin Neidr', 'male', '????', '????', 'house-neidr'),

    person('argyll-saith', 'Argyll Saith', 'male', '????', '1701'),
    spouse('ysella-crefyddol', 'Ysella Crefyddol', 'female', '1632', '1694', 'house-crefyddol'),
    awayWoman('enfys-saith', 'Enfys Saith', '1629', '1698', 'Haus Draenog'),
    spouse('sieffre-draenog', 'Sieffre Draenog', 'male', '1625', '1704', 'house-draenog'),

    person('lancel-saith', 'Lancel Saith', 'male', '1646', '1717'),
    spouse('blodwen-creyr', 'Blodwen Créyr', 'female', '1648', '1714', 'house-creyr'),
    awayWoman('ygraine-saith', 'Ygraine Saith', '1650', '????', "Haus T'Saoir"),
    spouse('luan-tsaoir', "Luan T'Saoir", 'male', '1649', '????', 'house-tsaoir'),
    person('hetwn-saith', 'Hetwn Saith', 'male', '1654', '1717'),
    spouse('jinell-neidr', 'Jinell Neidr', 'female', '1659', '1703', 'house-neidr'),
    person('hopcyn-saith', 'Hopcyn Saith', 'male', '1652', '1713'),
    spouse('enid-wylan', 'Enid Wylan', 'female', '1655', '1729', 'house-wylan'),
    person('merlijn-saith', 'Merlijn Saith', 'male', '1656', '1720'),
    spouse('ysolt-pyrth', 'Ysolt Pyrth', 'female', '1658', '1720', 'house-pyrth'),

    person('duny-saith', 'Duny Saith', 'male', '1670', ''),
    spouse('pavetta-marwolaeth', 'Pavetta Marwolaeth', 'female', '1676', '', 'house-marwolaeth'),
    person('nelwyn-saith', 'Nelwyn Saith', 'female', '1674', ''),
    person('darwyn-saith', 'Darwyn Saith', 'male', '1676', ''),
    spouse('gwendolyn-crefyddol', 'Gwendolyn Crefyddol', 'female', '1674', '', 'house-crefyddol'),
    person('vortigern-saith', 'Vortigern Saith', 'male', '1674', ''),
    spouse('jowan-canwyll', 'Jowan Canwyll', 'female', '1676', '', 'house-canwyll'),
    person('alaweyn-saith', 'Alaweyn Saith', 'male', '1676', ''),
    spouse('uvel-canwyll', 'Uvel Canwyll', 'female', '1674', '', 'house-canwyll'),
    awayWoman('yseut-saith', 'Yseut Saith', '1677', '1720', 'Haus Gwarchod'),
    spouse('waleran-gwarchod', 'Waleran Gwarchod', 'male', '1676', '????', 'house-gwarchod', {
      status: 'dead',
      notes: 'Die Gwarchod-Herkunftsakte belegt, dass Waleran 1720 noch nicht starb, später aus Gefangenschaft zurückkehrte und erst danach beim Blutbund fiel; das genaue Todesjahr bleibt unbekannt.'
    }),
    person('saselia-saith', 'Saselia Saith', 'female', '1679', ''),

    person('lyonel-saith', 'Lyonel Saith', 'male', '1702', ''),
    awayWoman('lyabelle-saith', 'Lyabelle Saith', '1704', '', 'Haus Tiwna'),
    spouse('bran-tiwna', 'Bran Tiwna', 'male', '1700', '', 'house-tiwna'),
    person('maelron-saith', 'Maelron Saith', 'male', '1701', ''),
    spouse('enora-saethwyr', 'Enora Saethwyr', 'female', '1703', '', 'house-saethwyr'),
    awayWoman('maelyn-saith', 'Maelyn Saith', '1703', '', 'Haus Pyrth'),
    spouse('wynoc-pyrth', 'Wynoc Pyrth', 'male', '1698', '', 'house-pyrth'),
    person('xylon-saith', 'Xylon Saith', 'male', '1693', ''),
    spouse('zinnara-hwyaden', 'Zinnara Hwyaden', 'female', '1698', '', 'house-hwyaden'),
    awayWoman('ariana-saith', 'Ariana Saith', '1698', '', 'Haus Neidr'),
    spouse('odyar-neidr', 'Odyar Neidr', 'male', '1697', '', 'house-neidr'),
    awayWoman('yvette-saith', 'Yvette Saith', '1704', '', 'Haus Tir Addawol'),
    spouse('tirian-tir-addawol', 'Tirian Tir Addawol', 'male', '1704', '', 'house-tir-addawol'),

    person('boudwin-saith', 'Boudwin Saith', 'male', '1724', ''),
    person('eleri-saith', 'Eleri Saith', 'female', '1734', ''),
    person('ysarn-saith', 'Ysarn Saith', 'male', '1731', ''),
    person('urien-saith', 'Urien Saith', 'male', '1722', ''),
    person('bysen-saith', 'Bysen Saith', 'male', '1725', '')
  ],
  partnerships: [
    createMarriage('marriage-gwennan-bors', ...COUPLES.founders),
    createMarriage('marriage-dadweir-llewella-saith', ...COUPLES.dadweir),
    createMarriage('marriage-merwin-elinor', ...COUPLES.elinor),
    createMarriage('marriage-argyll-ysella-saith', ...COUPLES.argyll, { status: 'ended', end: '1694' }),
    createMarriage('marriage-enfys-sieffre-saith', ...COUPLES.enfys, { status: 'ended', end: '1698' }),
    createMarriage('marriage-blodwen-lancel-creyr', ...COUPLES.lancel, { status: 'ended', end: '1714' }),
    createMarriage('marriage-ygraine-luan-saith', ...COUPLES.ygraine, { status: 'ended' }),
    createMarriage('marriage-jinell-hetwn', ...COUPLES.hetwn),
    createMarriage('marriage-enid-hopcyn', ...COUPLES.hopcyn),
    createMarriage('marriage-merlijn-ysolt-saith', ...COUPLES.merlijn, { status: 'ended', end: '1720' }),
    createMarriage('marriage-pavetta-duny-marwolaeth', ...COUPLES.duny),
    createMarriage('marriage-darwyn-gwendolyn-saith', ...COUPLES.darwyn),
    createMarriage('marriage-vortigern-jowan-saith', ...COUPLES.vortigern),
    createMarriage('marriage-alaweyn-uvel-saith', ...COUPLES.alaweyn),
    createMarriage('marriage-waleran-yseut-gwarchod', ...COUPLES.yseut, { status: 'ended', end: '1720' }),
    createMarriage('marriage-lyabelle-bran-saith', ...COUPLES.lyabelle),
    createMarriage('marriage-enora-maelron', ...COUPLES.maelron),
    createMarriage('marriage-maelyn-wynoc-saith', ...COUPLES.maelyn),
    createMarriage('marriage-zinnara-xylon-hwyaden', ...COUPLES.xylon),
    createMarriage('marriage-odyar-ariana', ...COUPLES.ariana),
    createMarriage('marriage-tirian-yvette-tir-addawol', ...COUPLES.yvette)
  ],
  parentages: [
    ...childrenOf(['dadweir-saith', 'elinor-saith'], 'marriage-gwennan-bors', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Gründerpaar und dieser Generation liegen nicht einzeln überlieferte Generationen.'
    }),
    ...claimedAfterSharedGap(
      ['argyll-saith'],
      'marriage-dadweir-llewella-saith',
      'Argyll führt nach der gemeinsamen Überlieferungslücke die Linie Dadweirs und Llewellas fort.'
    ),
    ...claimedAfterSharedGap(
      ['enfys-saith'],
      'marriage-merwin-elinor',
      'Enfys stammt nach der gemeinsamen Überlieferungslücke aus der Linie Elinors und Merwins.'
    ),
    ...childrenOf(['lancel-saith', 'ygraine-saith', 'hetwn-saith', 'hopcyn-saith', 'merlijn-saith'], 'marriage-argyll-ysella-saith'),
    ...childrenOf(['duny-saith', 'nelwyn-saith', 'darwyn-saith'], 'marriage-blodwen-lancel-creyr'),
    ...childrenOf(['vortigern-saith', 'alaweyn-saith'], 'marriage-jinell-hetwn'),
    ...childrenOf(['yseut-saith'], 'marriage-enid-hopcyn'),
    ...childrenOf(['saselia-saith'], 'marriage-merlijn-ysolt-saith'),
    ...childrenOf(['lyonel-saith', 'lyabelle-saith'], 'marriage-pavetta-duny-marwolaeth'),
    ...childrenOf(['maelron-saith', 'maelyn-saith'], 'marriage-darwyn-gwendolyn-saith'),
    ...childrenOf(['xylon-saith', 'ariana-saith', 'yvette-saith'], 'marriage-vortigern-jowan-saith'),
    ...childrenOf(['boudwin-saith', 'eleri-saith', 'ysarn-saith'], 'marriage-enora-maelron'),
    ...childrenOf(['urien-saith', 'bysen-saith'], 'marriage-zinnara-xylon-hwyaden')
  ],
  cadetBranches: [
    marriedAway('married-away-elinor-saith-neidr', 'Haus Neidr', 'marriage-merwin-elinor', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-enfys-saith-draenog', 'Haus Draenog', 'marriage-enfys-sieffre-saith', 'house-draenog'),
    marriedAway('married-away-ygraine-saith-tsaoir', "Haus T'Saoir", 'marriage-ygraine-luan-saith', 'house-tsaoir'),
    marriedAway('married-away-yseut-saith-gwarchod', 'Haus Gwarchod', 'marriage-waleran-yseut-gwarchod', 'house-gwarchod', HOUSE_EMBLEMS.gwarchod),
    marriedAway('married-away-lyabelle-saith-tiwna', 'Haus Tiwna', 'marriage-lyabelle-bran-saith', 'house-tiwna', HOUSE_EMBLEMS.tiwna),
    marriedAway('married-away-maelyn-saith-pyrth', 'Haus Pyrth', 'marriage-maelyn-wynoc-saith', 'house-pyrth', HOUSE_EMBLEMS.pyrth),
    marriedAway('married-away-ariana-saith-neidr', 'Haus Neidr', 'marriage-odyar-ariana', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-yvette-saith-tir-addawol', 'Haus Tir Addawol', 'marriage-tirian-yvette-tir-addawol', 'house-tir-addawol', HOUSE_EMBLEMS.tirAddawol)
  ],
  timeJumps: [
    {
      id: SHARED_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-dadweir-llewella-saith',
      sharedParentPartnershipIds: ['marriage-merwin-elinor'],
      parentPersonId: '',
      childIds: ['argyll-saith', 'enfys-saith'],
      years: 0,
      fromYear: '????',
      toYear: '1629',
      label: 'Nicht einzeln überlieferte Generationen beider Zweige',
      notes: 'Ein einziger absoluter Generationentrenner wird von Dadweir/Llewella und Elinor/Merwin gespeist; dahinter bleiben beide fachlichen Abstammungen getrennt.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwennan-bors',
    houseId: SAITH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Llanvane',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'bors-saith',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Saith O'Llanvane (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Amtsfolge und Porträtzuordnungen folgen der bereitgestellten Saith-Hausseite. Bors Saith und Gwennan Neidr bilden das Gründerpaar; der Hausknoten und die erste Überlieferungslücke folgen strikt seriell. Der zweite, einzige freie Zeitsprung ist ein gemeinsamer absoluter Trenner der Linien Dadweir/Llewella und Elinor/Merwin. Die Quellenform Crefyddoll wird als projektweit kanonisches Crefyddol geführt. Bei Merlijn nennt eine Kinderüberschrift irrtümlich Yseut; die zugehörige Ehezeile weist eindeutig Ysolt Pyrth als Ehefrau und Saselia als gemeinsames Kind aus. Bereits vorhandene Gegenakten verwenden identische Weltpersonen-, Partnerschafts- und Porträtzuordnungen. Kinder erscheinen nur in der fortführenden Akte: Arianas Kinder ausschließlich bei Neidr, Yseuts Kind bei Gwarchod und Yvettes Kinder bei Tir Addawol; Xylons und Maelrons Kinder ausschließlich hier. Walerans Todesjahr bleibt gemäß seiner ausführlicheren Gwarchod-Herkunftsakte unbekannt und liegt nach 1730. Wiederholte Standardsilhouetten der Altdaten bleiben Systemplatzhalter.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
