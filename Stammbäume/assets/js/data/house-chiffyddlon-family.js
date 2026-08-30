import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createExtinctBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';

const CHIFFYDDLON_HOUSE_ID = 'house-chiffyddlon';
const CHIFFYDDLON_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon;
const FOUNDER_TIME_JUMP_ID = 'gap-founder-to-urien-generation-chiffyddlon';
const MAELOR_TIME_JUMP_ID = 'gap-maelor-to-grufudd-generation-chiffyddlon';

const HOUSE_EMBLEMS = Object.freeze({
  aroglyn: AEHRENTAL_HOUSE_EMBLEMS.aroglyn,
  baedd: AEHRENTAL_HOUSE_EMBLEMS.baedd,
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  ciarog: AEHRENTAL_HOUSE_EMBLEMS.ciarog,
  grawn: AEHRENTAL_HOUSE_EMBLEMS.grawn,
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  gwythiad: AEHRENTAL_HOUSE_EMBLEMS.gwythiad,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn
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
  'iorwerth-founder-chiffyddlon': 'Gründer und erster Ritterfürst des Hauses Chiffyddlon',
  'urien-chiffyddlon': 'Ritterfürst des Hauses Chiffyddlon',
  'maelor-chiffyddlon': 'Ritterfürst des Hauses Chiffyddlon',
  'grufudd-chiffyddlon': 'Ritterfürst des Hauses Chiffyddlon bis 1679',
  'iorwerth-chiffyddlon': 'Ritterfürst des Hauses Chiffyddlon 1679–1688',
  'maelgwn-chiffyddlon': 'Ritterfürst des Hauses Chiffyddlon 1688–1704 · In der Schlacht gefallen',
  'gwilym-chiffyddlon': 'Letzter Ritterfürst des Hauses Chiffyddlon 1704–1720 · Beim Angriff der Nordmänner auf Glyndraith gefallen'
});

const HOUSE_HEAD_IDS = new Set(Object.keys(SUCCESSION_TITLES));

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? CHIFFYDDLON_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_CHIFFYDDLON_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CHIFFYDDLON_HOUSE_ID ? 'core' : 'married'),
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

function house(id, name, emblem = '', status = 'active') {
  return { id, name, motto: '', emblem, status };
}

const COUPLES = Object.freeze({
  founders: ['iorwerth-founder-chiffyddlon', 'arddunwen-founder-chiffyddlon'],
  urien: ['urien-chiffyddlon', 'mererid-ancient-chiffyddlon'],
  romney: ['romney-chiffyddlon', 'arwel-chiffyddlon'],
  maelor: ['maelor-chiffyddlon', 'malvina-gwythiad'],
  rhosyn: ['rhosyn-chiffyddlon', 'marmaduke-aroglyn'],
  grufudd: ['grufudd-chiffyddlon', 'llewella-canwyll'],
  ysobel: ['ysobel-chiffyddlon', 'drystan-gwarchod'],
  sulwen: ['sulwen-chiffyddlon', 'meredydd-gaeth'],
  iorwerth: ['morfudd-sgwarnog', 'iorwerth-chiffyddlon'],
  alys: ['osian-grawn', 'alys-chiffyddlon'],
  maelgwn: ['maelgwn-chiffyddlon', 'gwenfrewi-unigol'],
  eilun: ['berwyn-blach', 'eilun-chiffyddlon'],
  arddunwen: ['gwlgawd-dyngwn', 'arddunwen-chiffydllon'],
  mererid: ['mererid-1657-chiffyddlon', 'sheev-eryr'],
  gwilym: ['gwilym-chiffyddlon', 'dytiana-tiwna'],
  llinos: ['dalvin-ciarog', 'llinos-chiffyddlon'],
  angharad: ['vaethan-baedd', 'angharad-chiffyddlon'],
  rhondda: ['rhondda-chiffyddlon', 'mabon-sgwarnog'],
  nessa: ['nessa-chiffyddlon', 'rhisiog-crefyddol'],
  tegan: ['steffan-penderyn', 'teghan-chiffyddlon']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-iorwerth-arddunwen-chiffyddlon': COUPLES.founders,
  'marriage-urien-mererid-chiffyddlon': COUPLES.urien,
  'marriage-romney-arwel-chiffyddlon': COUPLES.romney,
  'marriage-maelor-malvina-chiffyddlon': COUPLES.maelor,
  'marriage-rhosyn-marmaduke-chiffyddlon': COUPLES.rhosyn,
  'marriage-grufudd-llewella-chiffyddlon': COUPLES.grufudd,
  'marriage-ysobel-drystan-chiffyddlon': COUPLES.ysobel,
  'marriage-sulwen-meredydd-chiffyddlon': COUPLES.sulwen,
  'marriage-morfudd-iorwerth-sgwarnog': COUPLES.iorwerth,
  'marriage-osian-alys': COUPLES.alys,
  'marriage-maelgwn-gwenfrewi-chiffyddlon': COUPLES.maelgwn,
  'marriage-berwyn-eilun-blach': COUPLES.eilun,
  'marriage-gwlgawd-arddunwen-dyngwn': COUPLES.arddunwen,
  'marriage-mererid-sheev-chiffyddlon': COUPLES.mererid,
  'marriage-gwilym-dytiana-chiffyddlon': COUPLES.gwilym,
  'marriage-dalvin-llinos-ciarog': COUPLES.llinos,
  'marriage-vaethan-angharad-baedd': COUPLES.angharad,
  'marriage-mabon-rhondda-sgwarnog': COUPLES.rhondda,
  'marriage-nessa-rhisiog-chiffyddlon': COUPLES.nessa,
  'marriage-steffan-teghan-penderyn': COUPLES.tegan
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'chiffyddlon-parentage', ...options }
  );
}

function gapChildren(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Zwischen-Generationen sind in der Quelle nicht einzeln überliefert.',
    extensions: { timeJumpId }
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

export const HOUSE_CHIFFYDDLON_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-chiffyddlon',
    title: "Haus Chiffyddlon O'Glyndraith",
    motto: '',
    description: 'Dynastisch erloschenes Ritterfürstenhaus von Glyndraith im Ährental.',
    emblem: CHIFFYDDLON_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.chiffyddlon
  },
  houses: [
    house(CHIFFYDDLON_HOUSE_ID, "Haus Chiffyddlon O'Glyndraith", CHIFFYDDLON_EMBLEM, 'extinct'),
    house('house-gwythiad', 'Haus Gwythiad', HOUSE_EMBLEMS.gwythiad),
    house('house-aroglyn', 'Haus Aroglyn', HOUSE_EMBLEMS.aroglyn),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-gwarchod', 'Haus Gwarchod', HOUSE_EMBLEMS.gwarchod, 'extinct'),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-sgwarnog', "Haus Sgwarnog O'Aldwynd", HOUSE_EMBLEMS.sgwarnog),
    house('house-grawn', "Haus Grawn O'Glyndraith", HOUSE_EMBLEMS.grawn),
    house('house-unigol', 'Haus Unigol'),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-eryr', 'Haus Eryr'),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-ciarog', "Haus Ciaróg O'Caer Diwedd", HOUSE_EMBLEMS.ciarog),
    house('house-baedd', "Haus Baedd O'Eirwyn", HOUSE_EMBLEMS.baedd),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-penderyn', "Haus Penderyn O'Mathragon", HOUSE_EMBLEMS.penderyn)
  ],
  persons: [
    person('iorwerth-founder-chiffyddlon', 'Iorwerth Chiffyddlon', 'male', '????', '????'),
    spouse('arddunwen-founder-chiffyddlon', 'Arddunwen', 'female', '????', '????', CHIFFYDDLON_HOUSE_ID, {
      title: 'Mitgründerin des Hauses Chiffyddlon'
    }),

    person('urien-chiffyddlon', 'Urien Chiffyddlon', 'male', '????', '????'),
    spouse('mererid-ancient-chiffyddlon', 'Mererid', 'female', '????', '????', CHIFFYDDLON_HOUSE_ID),
    person('romney-chiffyddlon', 'Romney Chiffyddlon', 'female', '????', '????'),
    spouse('arwel-chiffyddlon', 'Arwel', 'male', '????', '????'),

    person('maelor-chiffyddlon', 'Maelor Chiffyddlon', 'male', '????', '????'),
    spouse('malvina-gwythiad', 'Malvina Gwythiad', 'female', '????', '????', 'house-gwythiad'),
    awayWoman('rhosyn-chiffyddlon', 'Rhosyn Chiffyddlon', '????', '????', 'Haus Aroglyn'),
    spouse('marmaduke-aroglyn', 'Marmaduke Aroglyn', 'male', '????', '????', 'house-aroglyn'),

    person('grufudd-chiffyddlon', 'Grufudd Chiffyddlon', 'male', '1605', '1679'),
    awayWoman('ysobel-chiffyddlon', 'Ysobel Chiffyddlon', '1607', '1672', 'Haus Gwarchod'),
    awayWoman('sulwen-chiffyddlon', 'Sulwen Chiffyddlon', '1609', '1670', 'Haus Gaeth'),
    spouse('llewella-canwyll', 'Llewella Canwyll', 'female', '1608', '1678', 'house-canwyll'),
    spouse('drystan-gwarchod', 'Drystan Gwarchod', 'male', '1608', '1683', 'house-gwarchod', {
      notes: 'Die ausgearbeitete Gwarchod-Herkunftsakte überliefert 1608–1683 und hat für Drystans Lebensdaten Vorrang vor der älteren Chiffyddlon-Gegenangabe.'
    }),
    spouse('meredydd-gaeth', 'Meredydd Gaeth', 'male', '1606', '1668', 'house-gaeth'),

    person('iorwerth-chiffyddlon', "Iorwerth Chiffyddlon O'Glyndraith", 'male', '1623', '1688'),
    awayWoman('alys-chiffyddlon', 'Alys Chiffyddlon', '1625', '1700', 'Haus Grawn'),
    spouse('morfudd-sgwarnog', 'Morfudd Sgwarnog', 'female', '1630', '1694', 'house-sgwarnog'),
    spouse('osian-grawn', "Osian Grawn O'Glyndraith", 'male', '1624', '1688', 'house-grawn'),

    person('maelgwn-chiffyddlon', 'Maelgwn Chiffyddlon', 'male', '1651', '1704'),
    awayWoman('eilun-chiffyddlon', 'Eilun Chiffyddlon', '1653', '1700', 'Haus Blach'),
    awayWoman('arddunwen-chiffydllon', 'Arddunwen Chiffyddlon', '1655', '1701', 'Haus Dyngwn'),
    awayWoman('mererid-1657-chiffyddlon', 'Mererid Chiffyddlon', '1657', '1715', 'Haus Eryr'),
    spouse('gwenfrewi-unigol', 'Gwenfrewi Unigol', 'female', '1652', '1705', 'house-unigol'),
    spouse('berwyn-blach', 'Berwyn Blach', 'male', '1652', '1720', 'house-blach'),
    spouse('gwlgawd-dyngwn', 'Gwlgawd Dyngwn', 'male', '1654', '', 'house-dyngwn'),
    spouse('sheev-eryr', 'Sheev Eryr', 'male', '1655', '1697', 'house-eryr'),

    person('gwilym-chiffyddlon', 'Gwilym Chiffyddlon', 'male', '1674', '1720'),
    awayWoman('llinos-chiffyddlon', 'Llinos Chiffyddlon', '1676', '1720', 'Haus Ciaróg'),
    awayWoman('angharad-chiffyddlon', 'Angharad Chiffyddlon', '1675', '1735', 'Haus Baedd'),
    spouse('dytiana-tiwna', 'Dytiana Tiwna', 'female', '1676', '1720', 'house-tiwna'),
    spouse('dalvin-ciarog', 'Dalvin Ciaróg', 'male', '1676', '', 'house-ciarog'),
    spouse('vaethan-baedd', 'Vaethan Baedd', 'male', '1674', '1737', 'house-baedd'),

    awayWoman('rhondda-chiffyddlon', 'Rhondda Chiffyddlon', '1694', '', 'Haus Sgwarnog'),
    awayWoman('nessa-chiffyddlon', 'Nessa Chiffyddlon', '1696', '', 'Haus Crefyddol'),
    awayWoman('teghan-chiffyddlon', 'Tegan Chiffyddlon', '1698', '', 'Haus Penderyn'),
    spouse('mabon-sgwarnog', 'Mabon Sgwarnog', 'male', '1692', '', 'house-sgwarnog'),
    spouse('rhisiog-crefyddol', 'Rhisiog Crefyddol', 'male', '????', '', 'house-crefyddol'),
    spouse('steffan-penderyn', 'Steffan Penderyn', 'male', '1695', '', 'house-penderyn')
  ],
  partnerships: [
    createMarriage('marriage-iorwerth-arddunwen-chiffyddlon', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-urien-mererid-chiffyddlon', ...COUPLES.urien, { status: 'ended' }),
    createMarriage('marriage-romney-arwel-chiffyddlon', ...COUPLES.romney, { status: 'ended' }),
    createMarriage('marriage-maelor-malvina-chiffyddlon', ...COUPLES.maelor, { status: 'ended' }),
    createMarriage('marriage-rhosyn-marmaduke-chiffyddlon', ...COUPLES.rhosyn, { status: 'ended' }),
    createMarriage('marriage-grufudd-llewella-chiffyddlon', ...COUPLES.grufudd, { status: 'ended', end: '1678' }),
    createMarriage('marriage-ysobel-drystan-chiffyddlon', ...COUPLES.ysobel, { status: 'ended', end: '1672' }),
    createMarriage('marriage-sulwen-meredydd-chiffyddlon', ...COUPLES.sulwen, { status: 'ended', end: '1668' }),
    createMarriage('marriage-morfudd-iorwerth-sgwarnog', ...COUPLES.iorwerth, { status: 'ended', end: '1688' }),
    createMarriage('marriage-osian-alys', ...COUPLES.alys, { status: 'ended', end: '1688' }),
    createMarriage('marriage-maelgwn-gwenfrewi-chiffyddlon', ...COUPLES.maelgwn, { status: 'ended', end: '1704' }),
    createMarriage('marriage-berwyn-eilun-blach', ...COUPLES.eilun, { status: 'ended', end: '1700' }),
    createMarriage('marriage-gwlgawd-arddunwen-dyngwn', ...COUPLES.arddunwen, { status: 'ended', end: '1701' }),
    createMarriage('marriage-mererid-sheev-chiffyddlon', ...COUPLES.mererid, { status: 'ended', end: '1697' }),
    createMarriage('marriage-gwilym-dytiana-chiffyddlon', ...COUPLES.gwilym, { status: 'ended', end: '1720' }),
    createMarriage('marriage-dalvin-llinos-ciarog', ...COUPLES.llinos, { status: 'ended', end: '1720' }),
    createMarriage('marriage-vaethan-angharad-baedd', ...COUPLES.angharad, { status: 'ended', end: '1735' }),
    createMarriage('marriage-mabon-rhondda-sgwarnog', ...COUPLES.rhondda),
    createMarriage('marriage-nessa-rhisiog-chiffyddlon', ...COUPLES.nessa),
    createMarriage('marriage-steffan-teghan-penderyn', ...COUPLES.tegan)
  ],
  parentages: [
    ...gapChildren(['urien-chiffyddlon', 'romney-chiffyddlon'], 'marriage-iorwerth-arddunwen-chiffyddlon', FOUNDER_TIME_JUMP_ID),
    ...childrenOf(['maelor-chiffyddlon'], 'marriage-urien-mererid-chiffyddlon'),
    ...childrenOf(['rhosyn-chiffyddlon'], 'marriage-romney-arwel-chiffyddlon'),
    ...gapChildren(['grufudd-chiffyddlon', 'ysobel-chiffyddlon', 'sulwen-chiffyddlon'], 'marriage-maelor-malvina-chiffyddlon', MAELOR_TIME_JUMP_ID),
    ...childrenOf(['iorwerth-chiffyddlon', 'alys-chiffyddlon'], 'marriage-grufudd-llewella-chiffyddlon'),
    ...childrenOf(['maelgwn-chiffyddlon', 'eilun-chiffyddlon', 'arddunwen-chiffydllon', 'mererid-1657-chiffyddlon'], 'marriage-morfudd-iorwerth-sgwarnog'),
    ...childrenOf(['gwilym-chiffyddlon', 'llinos-chiffyddlon', 'angharad-chiffyddlon'], 'marriage-maelgwn-gwenfrewi-chiffyddlon'),
    ...childrenOf(['rhondda-chiffyddlon', 'nessa-chiffyddlon', 'teghan-chiffyddlon'], 'marriage-gwilym-dytiana-chiffyddlon')
  ],
  cadetBranches: [
    marriedAway('married-away-rhosyn-chiffyddlon-aroglyn', 'Haus Aroglyn', 'marriage-rhosyn-marmaduke-chiffyddlon', 'house-aroglyn', HOUSE_EMBLEMS.aroglyn),
    marriedAway('married-away-ysobel-chiffyddlon-gwarchod', 'Haus Gwarchod', 'marriage-ysobel-drystan-chiffyddlon', 'house-gwarchod', HOUSE_EMBLEMS.gwarchod),
    marriedAway('married-away-sulwen-chiffyddlon-gaeth', 'Haus Gaeth', 'marriage-sulwen-meredydd-chiffyddlon', 'house-gaeth'),
    marriedAway('married-away-alys-chiffyddlon-grawn', 'Haus Grawn', 'marriage-osian-alys', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-eilun-chiffyddlon-blach', 'Haus Blach', 'marriage-berwyn-eilun-blach', 'house-blach'),
    marriedAway('married-away-arddunwen-chiffyddlon-dyngwn', 'Haus Dyngwn', 'marriage-gwlgawd-arddunwen-dyngwn', 'house-dyngwn'),
    marriedAway('married-away-mererid-chiffyddlon-eryr', 'Haus Eryr', 'marriage-mererid-sheev-chiffyddlon', 'house-eryr'),
    marriedAway('married-away-llinos-chiffyddlon-ciarog', 'Haus Ciaróg', 'marriage-dalvin-llinos-ciarog', 'house-ciarog', HOUSE_EMBLEMS.ciarog),
    marriedAway('married-away-angharad-chiffyddlon-baedd', 'Haus Baedd', 'marriage-vaethan-angharad-baedd', 'house-baedd', HOUSE_EMBLEMS.baedd),
    marriedAway('married-away-rhondda-chiffyddlon-sgwarnog', 'Haus Sgwarnog', 'marriage-mabon-rhondda-sgwarnog', 'house-sgwarnog', HOUSE_EMBLEMS.sgwarnog),
    marriedAway('married-away-nessa-chiffyddlon-crefyddol', 'Haus Crefyddol', 'marriage-nessa-rhisiog-chiffyddlon', 'house-crefyddol'),
    marriedAway('married-away-tegan-chiffyddlon-penderyn', 'Haus Penderyn', 'marriage-steffan-teghan-penderyn', 'house-penderyn', HOUSE_EMBLEMS.penderyn),
    createExtinctBranch({
      id: 'extinct-house-chiffyddlon',
      parentPersonId: 'gwilym-chiffyddlon',
      houseId: CHIFFYDDLON_HOUSE_ID,
      emblem: CHIFFYDDLON_EMBLEM,
      notes: 'Gwilym fiel 1720 ohne männlichen Nachkommen. Seine drei Töchter waren bereits in andere Häuser verheiratet; damit endet die dynastische Linie.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-iorwerth-arddunwen-chiffyddlon',
      parentPersonId: '',
      childIds: ['urien-chiffyddlon', 'romney-chiffyddlon'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen; erst darunter beginnen Urien und Romney.',
      extensions: {}
    },
    {
      id: MAELOR_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-maelor-malvina-chiffyddlon',
      parentPersonId: '',
      childIds: ['grufudd-chiffyddlon', 'ysobel-chiffyddlon', 'sulwen-chiffyddlon'],
      years: 0,
      fromYear: '????',
      toYear: '1605',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der zweite absolute Generationentrenner gehört ausschließlich unter Maelor und Malvina; Rhosyns wegverheiratete Linie läuft nicht in ihn hinein.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-iorwerth-arddunwen-chiffyddlon',
    houseId: CHIFFYDDLON_HOUSE_ID,
    crestSubtitle: 'Erloschenes Ritterfürstenhaus von Glyndraith',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'iorwerth-founder-chiffyddlon',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: "Haus Chiffyddlon O'Glyndraith (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Erbfolge und Porträtzuordnungen folgen der bereitgestellten Chiffyddlon-Hausseite und ihrer vollständigen Stammbaumgrafik. Iorwerth und Arddunwen bilden das Gründerpaar; ihr Hauswappen und der erste Zeitsprung stehen strikt seriell darüber beziehungsweise darunter. Der zweite Zeitsprung gehört ausschließlich unter Maelor und Malvina. Zwölf aus dem Haus führende Frauenlinien erhalten direkte Wegverheiratet-Knoten. Acht in ausgearbeiteten Gegenakten vorhandene Ehen verwenden identische Weltpersonen-, Partnerschafts- und Porträtzuordnungen; Kinder erscheinen stets nur in der tatsächlich fortführenden Hausakte. Die Chiffyddlon-Kinder bleiben deshalb bei Iorwerth und Morfudd ausschließlich hier, während die Nachkommen von Alys, Eilun, Arddunwen, Llinos, Angharad, Rhondda und Tegan ausschließlich in Grawn, Blach, Dyngwn, Ciaróg, Baedd, Sgwarnog beziehungsweise Penderyn stehen. Die ausgearbeitete Eryr-Gegenakte präzisiert Sheev auf 1655–1697 und Mererid auf 1657–1715; ihre Kinder Gruffyd und Venora erscheinen ausschließlich dort. Drystans Lebensdaten wurden nach seiner nun ausgearbeiteten Gwarchod-Herkunftsakte auf 1608–1683 präzisiert. Das Haus endet 1720 mit Gwilym, da alle drei Töchter in andere Häuser verheiratet waren. Wiederholte neutrale Standardsilhouetten wurden nicht als individuelle Porträts übernommen.',
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
