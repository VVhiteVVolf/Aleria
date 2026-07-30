import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_MORFORWYN_PORTRAITS } from './house-morforwyn-portraits.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const MORFORWYN_HOUSE_ID = 'house-morforwyn';
const MORFORWYN_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.morforwyn;
const ELIMUE_LINE_HOUSE_ID = 'house-morforwyn-line-elimue';
const MARMUE_LINE_HOUSE_ID = 'house-morforwyn-line-marmue';
const ELIMUE_LINE_EMBLEM = 'assets/images/houses/Sonnenküste/Jungferntal/morforwyn-linie-elimue.png';
const MARMUE_LINE_EMBLEM = 'assets/images/houses/Sonnenküste/Jungferntal/morforwyn-linie-marmue.png';

const HOUSE_EMBLEMS = Object.freeze({
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  grael: VORTIGERNS_RUH_HOUSE_EMBLEMS.grael,
  illwath: SONNENKUESTE_HOUSE_EMBLEMS.illwath,
  llwynog: SONNENKUESTE_HOUSE_EMBLEMS.llwynog,
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  tiwna: ''
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

const REPEATED_MALE_PARTNERS = Object.freeze({
  'teirwton-morforwyn': 'marriage-serenmue-teirwton-morforwyn',
  'ofranton-1599-morforwyn': 'marriage-talfamue-ofranton-1599-morforwyn',
  'dewiton-morforwyn': 'marriage-ywamue-dewiton-morforwyn',
  'helygton-morforwyn': 'marriage-owamue-helygton-morforwyn',
  'rhydton-morforwyn': 'marriage-ysoltmue-rhydton-morforwyn',
  'ffeston-morforwyn': 'marriage-gwenmue-ffeston-morforwyn',
  'vynnston-morforwyn': 'marriage-branmue-vynnston-morforwyn',
  'ffinton-morforwyn': 'marriage-urumue-ffinton-morforwyn',
  'derwton-morforwyn': 'marriage-xynemue-derwton-morforwyn',
  'ofranton-1661-morforwyn': 'marriage-olmue-ofranton-1661-morforwyn',
  'branston-morforwyn': 'marriage-zedmue-branston-morforwyn',
  'idriston-morforwyn': 'marriage-varedmue-idriston-morforwyn',
  'madogton-morforwyn': 'marriage-glanmue-madogton-morforwyn',
  'gwalchton-morforwyn': 'marriage-eirymue-gwalchton-morforwyn',
  'merediton-morforwyn': 'marriage-karismue-merediton-morforwyn',
  'jeston-morforwyn': 'marriage-ffynmue-jeston-morforwyn',
  'alunton-morforwyn': 'marriage-jonamue-alunton-morforwyn',
  'neirton-morforwyn': 'marriage-wledmue-neirton-morforwyn',
  'llyrton-morforwyn': 'marriage-cerysmue-llyrton-morforwyn'
});

const MIRRORED_FEMALE_PARTNERS = Object.freeze({
  'serenmue-morforwyn': 'marriage-serenmue-teirwton-morforwyn',
  'talfamue-morforwyn': 'marriage-talfamue-ofranton-1599-morforwyn',
  'ywamue-morforwyn': 'marriage-ywamue-dewiton-morforwyn',
  'owamue-morforwyn': 'marriage-owamue-helygton-morforwyn',
  'ysoltmue-morforwyn': 'marriage-ysoltmue-rhydton-morforwyn',
  'gwenmue-morforwyn': 'marriage-gwenmue-ffeston-morforwyn',
  'branmue-morforwyn': 'marriage-branmue-vynnston-morforwyn',
  'urumue-morforwyn': 'marriage-urumue-ffinton-morforwyn',
  'xynemue-morforwyn': 'marriage-xynemue-derwton-morforwyn',
  'olmue-morforwyn': 'marriage-olmue-ofranton-1661-morforwyn',
  'zedmue-morforwyn': 'marriage-zedmue-branston-morforwyn',
  'varedmue-morforwyn': 'marriage-varedmue-idriston-morforwyn',
  'glanmue-morforwyn': 'marriage-glanmue-madogton-morforwyn',
  'eirymue-morforwyn': 'marriage-eirymue-gwalchton-morforwyn',
  'karismue-morforwyn': 'marriage-karismue-merediton-morforwyn',
  'ffynmue-morforwyn': 'marriage-ffynmue-jeston-morforwyn',
  'jonamue-morforwyn': 'marriage-jonamue-alunton-morforwyn',
  'wledmue-morforwyn': 'marriage-wledmue-neirton-morforwyn',
  'cerysmue-morforwyn': 'marriage-cerysmue-llyrton-morforwyn'
});

function chartAppearanceExtensions(id) {
  const repeatFor = REPEATED_MALE_PARTNERS[id];
  const mirrorFor = MIRRORED_FEMALE_PARTNERS[id];
  return {
    ...(repeatFor ? { chartRepeatForPartnershipIds: [repeatFor] } : {}),
    ...(mirrorFor ? { chartPartnerMirrorForPartnershipIds: [mirrorFor] } : {})
  };
}

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId: options.houseId === undefined ? MORFORWYN_HOUSE_ID : options.houseId,
    portrait: HOUSE_MORFORWYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...chartAppearanceExtensions(id),
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
    lineageRole: options.lineageRole || 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouse, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouse}`,
    tags: options.tags || ['Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  triston: ['triston-morforwyn', 'mapnimue'],
  founders: ['hafmue-morforwyn', 'talorton-legendary-morforwyn'],
  marmue: ['marmue-morforwyn', 'gwalchgwyn-morforwyn'],
  padmue: ['padmue-morforwyn', 'xylton-morforwyn'],
  elimue: ['elimue-morforwyn', 'aelwyn-morforwyn'],
  serenmue: ['serenmue-morforwyn', 'teirwton-morforwyn'],
  bethmue: ['bethmue-morforwyn', 'talorton-bethmue-morforwyn'],
  megmue: ['megmue-morforwyn', 'wynton-morforwyn'],
  talfamue: ['talfamue-morforwyn', 'ofranton-1599-morforwyn'],
  ywamue: ['ywamue-morforwyn', 'dewiton-morforwyn'],
  owamue: ['owamue-morforwyn', 'helygton-morforwyn'],
  eurolwyn: ['gwlyddyn-grael', 'eurolwyn-morforwyn'],
  ysoltmue: ['ysoltmue-morforwyn', 'rhydton-morforwyn'],
  gwenmue: ['gwenmue-morforwyn', 'ffeston-morforwyn'],
  branmue: ['branmue-morforwyn', 'vynnston-morforwyn'],
  meiriona: ['meredydd-blach', 'meiriona-morforwyn'],
  urumue: ['urumue-morforwyn', 'ffinton-morforwyn'],
  xynemue: ['xynemue-morforwyn', 'derwton-morforwyn'],
  olmue: ['olmue-morforwyn', 'ofranton-1661-morforwyn'],
  zedmue: ['zedmue-morforwyn', 'branston-morforwyn'],
  glanmue: ['glanmue-morforwyn', 'madogton-morforwyn'],
  eirymue: ['eirymue-morforwyn', 'gwalchton-morforwyn'],
  varedmue: ['varedmue-morforwyn', 'idriston-morforwyn'],
  endellion: ['deiniol-marwolaeth', 'endellion-morforwyn'],
  sioned: ['sioned-morforwyn', 'efrawg-tiwna'],
  rheanne: ['tarawg-illwath', 'rheanne-morforwyn'],
  karismue: ['karismue-morforwyn', 'merediton-morforwyn'],
  ffynmue: ['ffynmue-morforwyn', 'jeston-morforwyn'],
  jonamue: ['jonamue-morforwyn', 'alunton-morforwyn'],
  afanen: ['rhon-neidr', 'afanen-morforwyn'],
  glynis: ['colwin-llwynog', 'glynis-morforwyn'],
  wledmue: ['wledmue-morforwyn', 'neirton-morforwyn'],
  cerysmue: ['cerysmue-morforwyn', 'llyrton-morforwyn'],
  nefmue: ['nefmue-morforwyn', 'unknown-nefmue-husband'],
  sianmue: ['sianmue-morforwyn', 'unknown-sianmue-husband']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-triston-mapnimue-morforwyn': COUPLES.triston,
  'marriage-hafmue-talorton-morforwyn': COUPLES.founders,
  'marriage-marmue-gwalchgwyn-morforwyn': COUPLES.marmue,
  'marriage-padmue-xylton-morforwyn': COUPLES.padmue,
  'marriage-elimue-aelwyn-morforwyn': COUPLES.elimue,
  'marriage-serenmue-teirwton-morforwyn': COUPLES.serenmue,
  'marriage-bethmue-talorton-morforwyn': COUPLES.bethmue,
  'marriage-megmue-wynton-morforwyn': COUPLES.megmue,
  'marriage-talfamue-ofranton-1599-morforwyn': COUPLES.talfamue,
  'marriage-ywamue-dewiton-morforwyn': COUPLES.ywamue,
  'marriage-owamue-helygton-morforwyn': COUPLES.owamue,
  'marriage-ysoltmue-rhydton-morforwyn': COUPLES.ysoltmue,
  'marriage-gwenmue-ffeston-morforwyn': COUPLES.gwenmue,
  'marriage-branmue-vynnston-morforwyn': COUPLES.branmue,
  'marriage-urumue-ffinton-morforwyn': COUPLES.urumue,
  'marriage-xynemue-derwton-morforwyn': COUPLES.xynemue,
  'marriage-olmue-ofranton-1661-morforwyn': COUPLES.olmue,
  'marriage-zedmue-branston-morforwyn': COUPLES.zedmue,
  'marriage-glanmue-madogton-morforwyn': COUPLES.glanmue,
  'marriage-eirymue-gwalchton-morforwyn': COUPLES.eirymue,
  'marriage-varedmue-idriston-morforwyn': COUPLES.varedmue,
  'marriage-karismue-merediton-morforwyn': COUPLES.karismue,
  'marriage-ffynmue-jeston-morforwyn': COUPLES.ffynmue,
  'marriage-jonamue-alunton-morforwyn': COUPLES.jonamue
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'morforwyn-parentage', ...options }
  );
}

function claimedAfterGap(childIds, partnershipId, timeJumpId, notes) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes,
    extensions: { timeJumpId }
  });
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

const MORFORWYN_COMPLETE_SOURCE = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-morforwyn',
    title: "Haus Morforwyn O'Carngol",
    motto: '',
    description: 'Matriarchal geführtes Baronenhaus aus Carngol. Das Geschlecht leitet seine Herkunft von Triston, einem Ritter aus Avallorn, und Mapnimue, einer sagenhaften Tochter der Dame des Sees, ab. Die drei überlieferten Linien führen ihre Ämter und Abstammungen grundsätzlich über die Frauen fort.',
    emblem: MORFORWYN_EMBLEM,
    houseProfile: SONNENKUESTE_HOUSE_PROFILES.morforwyn
  },
  houses: [
    house(MORFORWYN_HOUSE_ID, "Haus Morforwyn O'Carngol", MORFORWYN_EMBLEM),
    house(ELIMUE_LINE_HOUSE_ID, 'Elimue-Linie des Hauses Morforwyn', ELIMUE_LINE_EMBLEM),
    house(MARMUE_LINE_HOUSE_ID, 'Marmue-Linie des Hauses Morforwyn', MARMUE_LINE_EMBLEM),
    house('house-grael', 'Haus Grael', HOUSE_EMBLEMS.grael),
    house('house-blach', "Haus Blach O'Aberon", HOUSE_EMBLEMS.blach),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-illwath', "Haus Illwath O'Caer Llew", HOUSE_EMBLEMS.illwath),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-llwynog', "Haus Llwynog O'Aberon", HOUSE_EMBLEMS.llwynog),
    house('house-unbekannt', 'Unbekanntes Haus')
  ],
  persons: [
    spouse('triston-morforwyn', 'Triston', 'male', '????', '????', {
      title: 'Sagenhafter Ritter aus Avallorn',
      notes: 'Triston gehört zur Herkunftslegende vor der eigentlichen Gründung des Hauses Morforwyn.'
    }),
    spouse('mapnimue', 'Mapnimue', 'female', '????', '????', {
      title: 'Sagengestalt · Tochter der Dame des Sees',
      notes: 'Sagenhafte Ahnfrau der Morforwyn.',
      extensions: { cardFrameId: 'holy' }
    }),
    person('hafmue-morforwyn', 'Hafmue', 'female', '????', '????', {
      title: 'Gründerin und erste Baronesse des Hauses Morforwyn',
      lineageRole: 'head'
    }),
    person('talorton-legendary-morforwyn', 'Talorton', 'male', '????', '????'),
    person('marmue-morforwyn', 'Marmue', 'female', '????', '????', {
      title: 'Begründerin der Marmue-Nebenlinie',
      lineageRole: 'head'
    }),
    person('padmue-morforwyn', 'Padmue', 'female', '????', '????'),
    person('xylton-morforwyn', 'Xylton', 'male', '????', '????'),
    person('elimue-morforwyn', 'Elimue', 'female', '????', '????', {
      title: 'Begründerin der Elimue-Nebenlinie',
      lineageRole: 'head'
    }),
    spouse('gwalchgwyn-morforwyn', 'Gwalchgwyn', 'male', '????', '????'),
    spouse('aelwyn-morforwyn', 'Aelwyn', 'male', '????', '????'),

    person('serenmue-morforwyn', 'Serenmue', 'female', '????', '????', {
      title: 'Historische Baronesse des Hauses Morforwyn',
      lineageRole: 'head'
    }),
    person('gwennalarch-morforwyn', 'Gwennalarch', 'female', '????', '????', {
      notes: 'In der Quelle auch Gwenmue genannt.'
    }),
    person('teirwton-morforwyn', 'Teirwton', 'male', '????', '????'),
    person('bethmue-morforwyn', 'Bethmue', 'female', '????', '????', {
      title: 'Historische Ritterherrin der Elimue-Linie',
      lineageRole: 'head'
    }),
    spouse('talorton-bethmue-morforwyn', 'Talorton', 'male', '????', '????', {
      notes: 'Nicht mit dem sagenhaften Talorton der Gründerzeit identisch; die Quelle trennt beide durch nicht überlieferte Generationen.'
    }),
    person('megmue-morforwyn', 'Megmue', 'female', '????', '????', {
      title: 'Historische Ritterherrin der Marmue-Linie',
      lineageRole: 'head'
    }),
    spouse('wynton-morforwyn', 'Wynton', 'male', '????', '????'),

    person('talfamue-morforwyn', 'Talfamue', 'female', '1592', '1699', {
      title: 'Historische Baronesse des Hauses Morforwyn',
      lineageRole: 'head'
    }),
    person('idmue-morforwyn', 'Idmue', 'female', '1599', ''),
    person('ofranton-1599-morforwyn', 'Ofranton', 'male', '1599', '1630'),
    person('ywamue-morforwyn', 'Ywamue', 'female', '1600', '1704', {
      title: 'Historische Ritterherrin der Marmue-Linie',
      lineageRole: 'head'
    }),
    person('dewiton-morforwyn', 'Dewiton', 'male', '1609', '1641'),
    person('owamue-morforwyn', 'Owamue', 'female', '1604', '1720', {
      title: 'Historische Ritterherrin der Elimue-Linie',
      lineageRole: 'head'
    }),
    person('helygton-morforwyn', 'Helygton', 'male', '1614', '1648'),
    awayWoman('eurolwyn-morforwyn', 'Eurolwyn Morforwyn', '1610', '1714', 'Haus Grael', {
      notes: 'In der Morforwyn-Quelle auch Eurolmue genannt; ihre Kinder werden ausschließlich im fortgeführten Grael-Zweig geführt.'
    }),
    spouse('gwlyddyn-grael', 'Gwlyddyn Grael', 'male', '1602', '1684', { houseId: 'house-grael' }),

    person('ysoltmue-morforwyn', 'Ysoltmue', 'female', '1623', '1735', {
      title: 'Historische Baronesse des Hauses Morforwyn',
      lineageRole: 'head'
    }),
    person('ffeston-morforwyn', 'Ffeston', 'male', '1633', '1659'),
    person('gwenmue-morforwyn', 'Gwenmue', 'female', '1631', '1720'),
    person('rhydton-morforwyn', 'Rhydton', 'male', '1628', '1654'),
    person('gwenlyn-morforwyn', 'Gwenlyn', 'female', '1625', '', {
      notes: 'In der Quelle auch Gwenmue genannt; nicht mit Gwenmue, geboren 1631, identisch.'
    }),
    person('branmue-morforwyn', 'Branmue', 'female', '1635', '', {
      title: 'Ritterherrin und Oberhaupt der Marmue-Linie',
      lineageRole: 'head'
    }),
    awayWoman('meiriona-morforwyn', 'Meiriona Morforwyn', '1630', '1726', 'Haus Blach', {
      notes: 'In der Quelle auch Meimue genannt; Berwyn und Millena werden ausschließlich im Blach-Zweig geführt.'
    }),
    person('vynnston-morforwyn', 'Vynnston', 'male', '1643', '1674'),
    spouse('meredydd-blach', 'Meredydd Blach', 'male', '1630', '1712', { houseId: 'house-blach' }),

    person('urumue-morforwyn', 'Urumue', 'female', '1645', '', {
      title: 'Baronesse und Oberhaupt des Hauses Morforwyn',
      lineageRole: 'head'
    }),
    person('xynemue-morforwyn', 'Xynemue', 'female', '1650', ''),
    person('ffinton-morforwyn', 'Ffinton', 'male', '1650', '1694'),
    person('derwton-morforwyn', 'Derwton', 'male', '1652', '1691'),
    person('olmue-morforwyn', 'Olmue', 'female', '1654', '', {
      title: 'Ritterherrin und Oberhaupt der Elimue-Linie',
      lineageRole: 'head'
    }),
    person('branston-morforwyn', 'Branston', 'male', '1657', '1678'),
    person('ofranton-1661-morforwyn', 'Ofranton', 'male', '1661', '1682'),
    person('zedmue-morforwyn', 'Zedmue', 'female', '1652', '', {
      title: 'Erste Nachfolgerin der Marmue-Linie',
      lineageRole: 'mainline'
    }),

    person('idriston-morforwyn', 'Idriston', 'male', '1678', '1720'),
    person('glanmue-morforwyn', 'Glanmue', 'female', '1667', '', {
      title: 'Erste Erbin des Hauses Morforwyn',
      lineageRole: 'mainline'
    }),
    person('madogton-morforwyn', 'Madogton', 'male', '1670', '1705'),
    person('eirymue-morforwyn', 'Eirymue', 'female', '1672', ''),
    person('gwalchton-morforwyn', 'Gwalchton', 'male', '1674', '1702'),
    awayWoman('endellion-morforwyn', 'Endellion Morforwyn', '1676', '', 'Haus Marwolaeth', {
      notes: 'Ihre vier Kinder werden ausschließlich in der Marwolaeth-Akte fortgeführt.'
    }),
    spouse('deiniol-marwolaeth', 'Deiniol Marwolaeth', 'male', '1675', '', { houseId: 'house-marwolaeth' }),
    awayWoman('sioned-morforwyn', 'Sioned Morforwyn', '1673', '', 'Haus Tiwna'),
    spouse('efrawg-tiwna', 'Efrawg Tiwna', 'male', '1672', '1720', { houseId: 'house-tiwna' }),
    person('varedmue-morforwyn', 'Varedmue', 'female', '1675', '', {
      title: 'Zweite Nachfolgerin der Marmue-Linie',
      lineageRole: 'mainline'
    }),
    awayWoman('rheanne-morforwyn', 'Rheanne Morforwyn', '1677', '', 'Haus Illwath', {
      notes: 'Die früher ausdrücklich ausgeschlossenen Altporträts werden auch in der Morforwyn-Akte nicht übernommen; ihre Kinder stehen ausschließlich bei Illwath.'
    }),
    spouse('tarawg-illwath', 'Tarawg Illwath', 'male', '1672', '', { houseId: 'house-illwath' }),

    awayWoman('afanen-morforwyn', 'Afanen Morforwyn', '1692', '', 'Haus Neidr', {
      notes: 'In der Quelle auch Afamue genannt; ihre Kinder werden ausschließlich in der Neidr-Akte geführt.'
    }),
    spouse('rhon-neidr', 'Rhon Neidr', 'male', '1698', '', { houseId: 'house-neidr' }),
    person('jonamue-morforwyn', 'Jonamue', 'female', '1690', '', {
      title: 'Dritte Nachfolgerin der Marmue-Linie',
      lineageRole: 'mainline'
    }),
    person('merediton-morforwyn', 'Merediton', 'male', '1696', ''),
    person('karismue-morforwyn', 'Karismue', 'female', '1686', '', {
      title: 'Zweite Erbin des Hauses Morforwyn',
      lineageRole: 'mainline'
    }),
    person('jeston-morforwyn', 'Jeston', 'male', '1700', ''),
    person('ffynmue-morforwyn', 'Ffynmue', 'female', '1698', ''),
    person('alunton-morforwyn', 'Alunton', 'male', '1702', ''),
    awayWoman('glynis-morforwyn', 'Glynis Morforwyn', '1698', '', 'Haus Llwynog', {
      notes: 'In der Quelle auch Glynmue genannt; Cari und Davie werden ausschließlich im Llwynog-Zweig geführt.'
    }),
    spouse('colwin-llwynog', 'Colwin Llwynog', 'male', '1700', '', { houseId: 'house-llwynog' }),

    person('wledmue-morforwyn', 'Wledmue', 'female', '1713', '', {
      title: 'Dritte Erbin des Hauses Morforwyn',
      lineageRole: 'mainline'
    }),
    person('cerysmue-morforwyn', 'Cerysmue', 'female', '1716', '', {
      title: 'Vierte Erbin des Hauses Morforwyn',
      lineageRole: 'mainline'
    }),
    person('nefmue-morforwyn', 'Nefmue', 'female', '1718', ''),
    person('llyrton-morforwyn', 'Llyrton', 'male', '1719', ''),
    person('sianmue-morforwyn', 'Sianmue', 'female', '1721', '', {
      title: 'Vierte Nachfolgerin der Marmue-Linie',
      lineageRole: 'mainline'
    }),
    person('neirton-morforwyn', 'Neirton', 'male', '1722', ''),
    spouse('unknown-nefmue-husband', 'Unbekannter Ehemann', 'male', '????', '', { houseId: 'house-unbekannt' }),
    spouse('unknown-sianmue-husband', 'Unbekannter Ehemann', 'male', '????', '', { houseId: 'house-unbekannt' })
  ],
  partnerships: [
    createMarriage('marriage-triston-mapnimue-morforwyn', ...COUPLES.triston, { status: 'ended' }),
    createMarriage('marriage-hafmue-talorton-morforwyn', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-marmue-gwalchgwyn-morforwyn', ...COUPLES.marmue, { status: 'ended' }),
    createMarriage('marriage-padmue-xylton-morforwyn', ...COUPLES.padmue, { status: 'ended' }),
    createMarriage('marriage-elimue-aelwyn-morforwyn', ...COUPLES.elimue, { status: 'ended' }),
    createMarriage('marriage-serenmue-teirwton-morforwyn', ...COUPLES.serenmue, { status: 'ended' }),
    createMarriage('marriage-bethmue-talorton-morforwyn', ...COUPLES.bethmue, { status: 'ended' }),
    createMarriage('marriage-megmue-wynton-morforwyn', ...COUPLES.megmue, { status: 'ended' }),
    createMarriage('marriage-talfamue-ofranton-1599-morforwyn', ...COUPLES.talfamue, { status: 'ended', end: '1630' }),
    createMarriage('marriage-ywamue-dewiton-morforwyn', ...COUPLES.ywamue, { status: 'ended', end: '1641' }),
    createMarriage('marriage-owamue-helygton-morforwyn', ...COUPLES.owamue, { status: 'ended', end: '1648' }),
    createMarriage('marriage-gwlyddyn-eurolwyn-grael', ...COUPLES.eurolwyn, { status: 'ended', end: '1684' }),
    createMarriage('marriage-ysoltmue-rhydton-morforwyn', ...COUPLES.ysoltmue, { status: 'ended', end: '1654' }),
    createMarriage('marriage-gwenmue-ffeston-morforwyn', ...COUPLES.gwenmue, { status: 'ended', end: '1659' }),
    createMarriage('marriage-branmue-vynnston-morforwyn', ...COUPLES.branmue, { status: 'ended', end: '1674' }),
    createMarriage('marriage-meredydd-meiriona-blach', ...COUPLES.meiriona, { status: 'ended', end: '1712' }),
    createMarriage('marriage-urumue-ffinton-morforwyn', ...COUPLES.urumue, { status: 'ended', end: '1694' }),
    createMarriage('marriage-xynemue-derwton-morforwyn', ...COUPLES.xynemue, { status: 'ended', end: '1691' }),
    createMarriage('marriage-olmue-ofranton-1661-morforwyn', ...COUPLES.olmue, { status: 'ended', end: '1682' }),
    createMarriage('marriage-zedmue-branston-morforwyn', ...COUPLES.zedmue, { status: 'ended', end: '1678' }),
    createMarriage('marriage-glanmue-madogton-morforwyn', ...COUPLES.glanmue, { status: 'ended', end: '1705' }),
    createMarriage('marriage-eirymue-gwalchton-morforwyn', ...COUPLES.eirymue, { status: 'ended', end: '1702' }),
    createMarriage('marriage-varedmue-idriston-morforwyn', ...COUPLES.varedmue, { status: 'ended', end: '1720' }),
    createMarriage('marriage-deiniol-endellion-marwolaeth', ...COUPLES.endellion),
    createMarriage('marriage-sioned-efrawg-morforwyn', ...COUPLES.sioned, { status: 'ended', end: '1720' }),
    createMarriage('marriage-tarawg-rheanne-illwath', ...COUPLES.rheanne),
    createMarriage('marriage-karismue-merediton-morforwyn', ...COUPLES.karismue),
    createMarriage('marriage-ffynmue-jeston-morforwyn', ...COUPLES.ffynmue),
    createMarriage('marriage-jonamue-alunton-morforwyn', ...COUPLES.jonamue),
    createMarriage('marriage-rhon-afanen', ...COUPLES.afanen),
    createMarriage('marriage-colwin-glynis-llwynog', ...COUPLES.glynis),
    createMarriage('marriage-wledmue-neirton-morforwyn', ...COUPLES.wledmue),
    createMarriage('marriage-cerysmue-llyrton-morforwyn', ...COUPLES.cerysmue),
    createMarriage('marriage-nefmue-unknown-morforwyn', ...COUPLES.nefmue),
    createMarriage('marriage-sianmue-unknown-morforwyn', ...COUPLES.sianmue)
  ],
  parentages: [
    ...childrenOf(['hafmue-morforwyn', 'talorton-legendary-morforwyn'], 'marriage-triston-mapnimue-morforwyn'),
    ...childrenOf(
      ['marmue-morforwyn', 'padmue-morforwyn', 'xylton-morforwyn', 'elimue-morforwyn'],
      'marriage-hafmue-talorton-morforwyn'
    ),
    ...claimedAfterGap(
      ['serenmue-morforwyn', 'gwennalarch-morforwyn'],
      'marriage-padmue-xylton-morforwyn',
      'gap-ancient-three-lines-morforwyn',
      'Die Hauptlinie ist nach der gemeinsamen frühen Überlieferungslücke erst mit Serenmue und Gwennalarch wieder belegt.'
    ),
    ...claimedAfterGap(
      ['teirwton-morforwyn', 'bethmue-morforwyn'],
      'marriage-elimue-aelwyn-morforwyn',
      'gap-ancient-three-lines-morforwyn',
      'Die Elimue-Linie ist nach der gemeinsamen frühen Überlieferungslücke erst mit Teirwton und Bethmue wieder belegt.'
    ),
    ...claimedAfterGap(
      ['megmue-morforwyn'],
      'marriage-marmue-gwalchgwyn-morforwyn',
      'gap-ancient-three-lines-morforwyn',
      'Die Marmue-Linie ist nach der gemeinsamen frühen Überlieferungslücke erst mit Megmue wieder belegt.'
    ),
    ...claimedAfterGap(
      ['talfamue-morforwyn', 'idmue-morforwyn'],
      'marriage-serenmue-teirwton-morforwyn',
      'gap-three-lines-to-1600-morforwyn',
      'Die Hauptlinie setzt nach der zweiten gemeinsamen Überlieferungslücke mit Talfamue und Idmue ein.'
    ),
    ...claimedAfterGap(
      ['dewiton-morforwyn', 'owamue-morforwyn', 'eurolwyn-morforwyn'],
      'marriage-bethmue-talorton-morforwyn',
      'gap-three-lines-to-1600-morforwyn',
      'Die Elimue-Linie setzt nach der zweiten gemeinsamen Überlieferungslücke mit Dewiton, Owamue und Eurolwyn ein.'
    ),
    ...claimedAfterGap(
      ['ywamue-morforwyn', 'helygton-morforwyn', 'ofranton-1599-morforwyn'],
      'marriage-megmue-wynton-morforwyn',
      'gap-three-lines-to-1600-morforwyn',
      'Die Marmue-Linie setzt nach der zweiten gemeinsamen Überlieferungslücke mit Ywamue, Helygton und Ofranton ein.'
    ),
    ...childrenOf(['ysoltmue-morforwyn', 'ffeston-morforwyn'], 'marriage-talfamue-ofranton-1599-morforwyn'),
    ...childrenOf(['gwenlyn-morforwyn', 'branmue-morforwyn', 'meiriona-morforwyn'], 'marriage-ywamue-dewiton-morforwyn'),
    ...childrenOf(['gwenmue-morforwyn', 'rhydton-morforwyn', 'vynnston-morforwyn'], 'marriage-owamue-helygton-morforwyn'),
    ...childrenOf(['urumue-morforwyn', 'xynemue-morforwyn'], 'marriage-ysoltmue-rhydton-morforwyn'),
    ...childrenOf(['derwton-morforwyn', 'olmue-morforwyn', 'branston-morforwyn'], 'marriage-gwenmue-ffeston-morforwyn'),
    ...childrenOf(['ofranton-1661-morforwyn', 'zedmue-morforwyn', 'ffinton-morforwyn'], 'marriage-branmue-vynnston-morforwyn'),
    ...childrenOf(['idriston-morforwyn', 'glanmue-morforwyn'], 'marriage-urumue-ffinton-morforwyn'),
    ...childrenOf(['madogton-morforwyn', 'eirymue-morforwyn'], 'marriage-xynemue-derwton-morforwyn'),
    ...childrenOf(['gwalchton-morforwyn', 'endellion-morforwyn'], 'marriage-olmue-ofranton-1661-morforwyn'),
    ...childrenOf(['sioned-morforwyn', 'varedmue-morforwyn', 'rheanne-morforwyn'], 'marriage-zedmue-branston-morforwyn'),
    ...childrenOf(['karismue-morforwyn', 'jeston-morforwyn'], 'marriage-glanmue-madogton-morforwyn'),
    ...childrenOf(['ffynmue-morforwyn', 'alunton-morforwyn', 'glynis-morforwyn'], 'marriage-eirymue-gwalchton-morforwyn'),
    ...childrenOf(['afanen-morforwyn', 'jonamue-morforwyn', 'merediton-morforwyn'], 'marriage-varedmue-idriston-morforwyn'),
    ...childrenOf(['wledmue-morforwyn', 'cerysmue-morforwyn'], 'marriage-karismue-merediton-morforwyn'),
    ...childrenOf(['nefmue-morforwyn', 'llyrton-morforwyn'], 'marriage-ffynmue-jeston-morforwyn'),
    ...childrenOf(['sianmue-morforwyn', 'neirton-morforwyn'], 'marriage-jonamue-alunton-morforwyn')
  ],
  cadetBranches: [
    marriedAway('married-away-eurolwyn-morforwyn-grael', 'Haus Grael', 'marriage-gwlyddyn-eurolwyn-grael', 'house-grael', { emblem: HOUSE_EMBLEMS.grael }),
    marriedAway('married-away-meiriona-morforwyn-blach', 'Haus Blach', 'marriage-meredydd-meiriona-blach', 'house-blach', { emblem: HOUSE_EMBLEMS.blach }),
    marriedAway('married-away-endellion-morforwyn-marwolaeth', 'Haus Marwolaeth', 'marriage-deiniol-endellion-marwolaeth', 'house-marwolaeth', { emblem: HOUSE_EMBLEMS.marwolaeth }),
    marriedAway('married-away-sioned-morforwyn-tiwna', 'Haus Tiwna', 'marriage-sioned-efrawg-morforwyn', 'house-tiwna'),
    marriedAway('married-away-rheanne-morforwyn-illwath', 'Haus Illwath', 'marriage-tarawg-rheanne-illwath', 'house-illwath', { emblem: HOUSE_EMBLEMS.illwath }),
    marriedAway('married-away-afanen-morforwyn-neidr', 'Haus Neidr', 'marriage-rhon-afanen', 'house-neidr', { emblem: HOUSE_EMBLEMS.neidr }),
    marriedAway('married-away-glynis-morforwyn-llwynog', 'Haus Llwynog', 'marriage-colwin-glynis-llwynog', 'house-llwynog', { emblem: HOUSE_EMBLEMS.llwynog })
  ],
  timeJumps: [
    {
      id: 'gap-ancient-three-lines-morforwyn',
      parentPartnershipId: 'marriage-padmue-xylton-morforwyn',
      sharedParentPartnershipIds: [
        'marriage-marmue-gwalchgwyn-morforwyn',
        'marriage-elimue-aelwyn-morforwyn'
      ],
      parentPersonId: '',
      childIds: [
        'serenmue-morforwyn',
        'gwennalarch-morforwyn',
        'teirwton-morforwyn',
        'bethmue-morforwyn',
        'megmue-morforwyn'
      ],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen aller drei Linien',
      notes: 'Ein einziger absoluter Trenner nimmt die Hauptlinie sowie Marmues und Elimues Nebenlinien auf. Kein paralleler Zeitsprung steht auf derselben Generationsebene.',
      extensions: {}
    },
    {
      id: 'gap-three-lines-to-1600-morforwyn',
      parentPartnershipId: 'marriage-serenmue-teirwton-morforwyn',
      sharedParentPartnershipIds: [
        'marriage-bethmue-talorton-morforwyn',
        'marriage-megmue-wynton-morforwyn'
      ],
      parentPersonId: '',
      childIds: [
        'talfamue-morforwyn',
        'idmue-morforwyn',
        'dewiton-morforwyn',
        'owamue-morforwyn',
        'eurolwyn-morforwyn',
        'ywamue-morforwyn',
        'helygton-morforwyn',
        'ofranton-1599-morforwyn'
      ],
      years: 0,
      fromYear: '????',
      toYear: '1592',
      label: 'Nicht einzeln überlieferte Generationen bis zur Zeit um 1600',
      notes: 'Der zweite globale Trenner führt alle drei Linien gemeinsam und seriell zur ab 1592 datierten Generation. Die fachlichen Abstammungen bleiben in den claimed-Elternschaften getrennt.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-hafmue-talorton-morforwyn',
    houseId: MORFORWYN_HOUSE_ID,
    crestSubtitle: 'Matriarchales Baronenhaus aus Carngol',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'triston-morforwyn',
    orientation: 'vertical',
    ancestorDepth: 30,
    descendantDepth: 30,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Haus Morforwyn und beide bereitgestellten Nebenlinien',
    sourceNote: 'Die drei bereitgestellten Tabellen werden als ein zusammenhängendes matriarchales Haus modelliert: Hafmues Hauptlinie sowie die von Marmue und Elimue ausgehenden Nebenlinien. Zwei je gemeinsam gespeiste globale Zeitsprünge ersetzen alle parallelen Punktreihen. Claimed-Elternschaften bewahren dabei, aus welcher Linie die später wieder belegten Personen stammen. Bei innerfamiliären Ehen führt stets die weibliche Morforwyn-Paarstelle die Kinder fort; der Mann wird an ihr als Partnerdarstellung wiederholt, während an seiner Herkunftsstelle nur eine kinderlose Spiegelkarte der Frau erscheint. Dadurch dürfen Karten mehrfach sichtbar sein, Weltperson, Ehe und Kinderlinie existieren aber nur einmal. Eurolwyn, Meiriona, Endellion, Sioned, Rheanne, Afanen und Glynis sind die belegten Ausnahmen von der matriarchalen Fortsetzung: Ihre Kinder stehen im jeweiligen Zielhaus, weshalb ihre Morforwyn-Zweige an direkten Wegverheiratet-Knoten enden. Die Partnerschaften und Weltpersonen mit Grael, Blach, Marwolaeth, Illwath, Neidr und Llwynog verwenden die bestehenden Gegenakten-IDs. Rheannes zuvor ausdrücklich ausgeschlossene Altporträts bleiben ungenutzt. Für Gwenmue wird bei zwei widersprüchlichen Quellbildern das Bild der Hauptakte verwendet; für Glynis und Afanen bleiben die bereits kanonischen Gegenaktenbilder maßgeblich. Die wiederholten schwarzen Standardsilhouetten werden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    chartViewport: { initialPosition: 'focus', initialScale: 0.25 }
  }
});

const MAIN_LINE_PERSON_IDS = Object.freeze([
  'triston-morforwyn',
  'mapnimue',
  'hafmue-morforwyn',
  'talorton-legendary-morforwyn',
  'marmue-morforwyn',
  'gwalchgwyn-morforwyn',
  'padmue-morforwyn',
  'xylton-morforwyn',
  'elimue-morforwyn',
  'aelwyn-morforwyn',
  'serenmue-morforwyn',
  'gwennalarch-morforwyn',
  'teirwton-morforwyn',
  'talfamue-morforwyn',
  'idmue-morforwyn',
  'ofranton-1599-morforwyn',
  'ysoltmue-morforwyn',
  'ffeston-morforwyn',
  'rhydton-morforwyn',
  'urumue-morforwyn',
  'xynemue-morforwyn',
  'ffinton-morforwyn',
  'derwton-morforwyn',
  'idriston-morforwyn',
  'varedmue-morforwyn',
  'glanmue-morforwyn',
  'madogton-morforwyn',
  'eirymue-morforwyn',
  'gwalchton-morforwyn',
  'karismue-morforwyn',
  'jeston-morforwyn',
  'ffynmue-morforwyn',
  'alunton-morforwyn',
  'jonamue-morforwyn',
  'glynis-morforwyn',
  'colwin-llwynog',
  'wledmue-morforwyn',
  'cerysmue-morforwyn',
  'merediton-morforwyn',
  'gwenmue-morforwyn',
  'nefmue-morforwyn',
  'llyrton-morforwyn',
  'neirton-morforwyn',
  'unknown-nefmue-husband'
]);

const MAIN_LINE_PARTNERSHIP_IDS = Object.freeze([
  'marriage-triston-mapnimue-morforwyn',
  'marriage-hafmue-talorton-morforwyn',
  'marriage-marmue-gwalchgwyn-morforwyn',
  'marriage-padmue-xylton-morforwyn',
  'marriage-elimue-aelwyn-morforwyn',
  'marriage-serenmue-teirwton-morforwyn',
  'marriage-talfamue-ofranton-1599-morforwyn',
  'marriage-ysoltmue-rhydton-morforwyn',
  'marriage-urumue-ffinton-morforwyn',
  'marriage-xynemue-derwton-morforwyn',
  'marriage-gwenmue-ffeston-morforwyn',
  'marriage-glanmue-madogton-morforwyn',
  'marriage-eirymue-gwalchton-morforwyn',
  'marriage-karismue-merediton-morforwyn',
  'marriage-varedmue-idriston-morforwyn',
  'marriage-ffynmue-jeston-morforwyn',
  'marriage-colwin-glynis-llwynog',
  'marriage-jonamue-alunton-morforwyn',
  'marriage-wledmue-neirton-morforwyn',
  'marriage-cerysmue-llyrton-morforwyn',
  'marriage-nefmue-unknown-morforwyn'
]);

const ELIMUE_LINE_PERSON_IDS = Object.freeze([
  'elimue-morforwyn',
  'aelwyn-morforwyn',
  'teirwton-morforwyn',
  'serenmue-morforwyn',
  'bethmue-morforwyn',
  'talorton-bethmue-morforwyn',
  'dewiton-morforwyn',
  'ywamue-morforwyn',
  'owamue-morforwyn',
  'helygton-morforwyn',
  'eurolwyn-morforwyn',
  'gwlyddyn-grael',
  'gwenmue-morforwyn',
  'rhydton-morforwyn',
  'vynnston-morforwyn',
  'ffeston-morforwyn',
  'ysoltmue-morforwyn',
  'branmue-morforwyn',
  'derwton-morforwyn',
  'xynemue-morforwyn',
  'olmue-morforwyn',
  'ofranton-1661-morforwyn',
  'branston-morforwyn',
  'zedmue-morforwyn',
  'gwalchton-morforwyn',
  'eirymue-morforwyn',
  'endellion-morforwyn',
  'deiniol-marwolaeth'
]);

const ELIMUE_LINE_PARTNERSHIP_IDS = Object.freeze([
  'marriage-elimue-aelwyn-morforwyn',
  'marriage-serenmue-teirwton-morforwyn',
  'marriage-bethmue-talorton-morforwyn',
  'marriage-ywamue-dewiton-morforwyn',
  'marriage-owamue-helygton-morforwyn',
  'marriage-gwlyddyn-eurolwyn-grael',
  'marriage-ysoltmue-rhydton-morforwyn',
  'marriage-gwenmue-ffeston-morforwyn',
  'marriage-branmue-vynnston-morforwyn',
  'marriage-xynemue-derwton-morforwyn',
  'marriage-olmue-ofranton-1661-morforwyn',
  'marriage-zedmue-branston-morforwyn',
  'marriage-deiniol-endellion-marwolaeth',
  'marriage-eirymue-gwalchton-morforwyn'
]);

const MARMUE_LINE_PERSON_IDS = Object.freeze([
  'marmue-morforwyn',
  'gwalchgwyn-morforwyn',
  'megmue-morforwyn',
  'wynton-morforwyn',
  'ywamue-morforwyn',
  'dewiton-morforwyn',
  'helygton-morforwyn',
  'owamue-morforwyn',
  'ofranton-1599-morforwyn',
  'talfamue-morforwyn',
  'gwenlyn-morforwyn',
  'branmue-morforwyn',
  'vynnston-morforwyn',
  'meiriona-morforwyn',
  'meredydd-blach',
  'ofranton-1661-morforwyn',
  'olmue-morforwyn',
  'zedmue-morforwyn',
  'branston-morforwyn',
  'ffinton-morforwyn',
  'urumue-morforwyn',
  'sioned-morforwyn',
  'efrawg-tiwna',
  'varedmue-morforwyn',
  'idriston-morforwyn',
  'rheanne-morforwyn',
  'tarawg-illwath',
  'afanen-morforwyn',
  'rhon-neidr',
  'jonamue-morforwyn',
  'alunton-morforwyn',
  'merediton-morforwyn',
  'karismue-morforwyn',
  'sianmue-morforwyn',
  'unknown-sianmue-husband',
  'neirton-morforwyn',
  'wledmue-morforwyn'
]);

const MARMUE_LINE_PARTNERSHIP_IDS = Object.freeze([
  'marriage-marmue-gwalchgwyn-morforwyn',
  'marriage-megmue-wynton-morforwyn',
  'marriage-ywamue-dewiton-morforwyn',
  'marriage-owamue-helygton-morforwyn',
  'marriage-talfamue-ofranton-1599-morforwyn',
  'marriage-branmue-vynnston-morforwyn',
  'marriage-meredydd-meiriona-blach',
  'marriage-olmue-ofranton-1661-morforwyn',
  'marriage-zedmue-branston-morforwyn',
  'marriage-urumue-ffinton-morforwyn',
  'marriage-sioned-efrawg-morforwyn',
  'marriage-varedmue-idriston-morforwyn',
  'marriage-tarawg-rheanne-illwath',
  'marriage-karismue-merediton-morforwyn',
  'marriage-jonamue-alunton-morforwyn',
  'marriage-rhon-afanen',
  'marriage-wledmue-neirton-morforwyn',
  'marriage-sianmue-unknown-morforwyn'
]);

function copyPersonForLine(person, chartRepeats) {
  const extensions = { ...person.extensions };
  delete extensions.chartRepeatForPartnershipIds;
  delete extensions.chartPartnerMirrorForPartnershipIds;
  chartRepeats.forEach(([womanId, manId, partnershipId]) => {
    if (person.id === manId) extensions.chartRepeatForPartnershipIds = [partnershipId];
    if (person.id === womanId) extensions.chartPartnerMirrorForPartnershipIds = [partnershipId];
  });
  const lineVisual = morforwynLineVisual(person.id);
  if (lineVisual) {
    extensions.cardHouseName = lineVisual.name;
    extensions.cardHouseEmblem = lineVisual.emblem;
  }
  const lineMarriage = LINE_MARRIAGE_BY_PERSON_ID.get(person.id);
  const marriageTarget = lineMarriage
    ? MORFORWYN_LINE_LINKS[lineMarriage.targetLine]
    : null;
  const tags = marriageTarget
    ? [...new Set([...(person.tags || []), 'Wegverheiratet'])]
    : person.tags;
  return Object.freeze({
    ...person,
    title: marriageTarget
      ? lineMarriageLabel(lineMarriage)
      : person.title,
    tags: Object.freeze([...(tags || [])]),
    extensions: Object.freeze(extensions)
  });
}

const MAIN_LINE_MEMBER_IDS = new Set([
  'hafmue-morforwyn', 'talorton-legendary-morforwyn', 'padmue-morforwyn', 'xylton-morforwyn',
  'serenmue-morforwyn', 'gwennalarch-morforwyn', 'talfamue-morforwyn', 'idmue-morforwyn',
  'ysoltmue-morforwyn', 'ffeston-morforwyn', 'urumue-morforwyn', 'xynemue-morforwyn',
  'idriston-morforwyn', 'glanmue-morforwyn', 'madogton-morforwyn', 'eirymue-morforwyn',
  'karismue-morforwyn', 'jeston-morforwyn', 'ffynmue-morforwyn', 'alunton-morforwyn',
  'glynis-morforwyn', 'wledmue-morforwyn', 'cerysmue-morforwyn', 'nefmue-morforwyn',
  'llyrton-morforwyn'
]);

const ELIMUE_LINE_MEMBER_IDS = new Set([
  'elimue-morforwyn', 'teirwton-morforwyn', 'bethmue-morforwyn', 'dewiton-morforwyn',
  'owamue-morforwyn', 'eurolwyn-morforwyn', 'gwenmue-morforwyn', 'rhydton-morforwyn',
  'vynnston-morforwyn', 'derwton-morforwyn', 'olmue-morforwyn', 'branston-morforwyn',
  'gwalchton-morforwyn', 'endellion-morforwyn'
]);

const MARMUE_LINE_MEMBER_IDS = new Set([
  'marmue-morforwyn', 'megmue-morforwyn', 'ywamue-morforwyn', 'helygton-morforwyn',
  'ofranton-1599-morforwyn', 'gwenlyn-morforwyn', 'branmue-morforwyn', 'meiriona-morforwyn',
  'ofranton-1661-morforwyn', 'zedmue-morforwyn', 'ffinton-morforwyn', 'sioned-morforwyn',
  'varedmue-morforwyn', 'rheanne-morforwyn', 'afanen-morforwyn', 'jonamue-morforwyn',
  'merediton-morforwyn', 'sianmue-morforwyn', 'neirton-morforwyn'
]);

function morforwynLineVisual(personId) {
  if (MAIN_LINE_MEMBER_IDS.has(personId)) {
    return { name: "Haus Morforwyn O'Carngol", emblem: MORFORWYN_EMBLEM };
  }
  if (ELIMUE_LINE_MEMBER_IDS.has(personId)) {
    return { name: 'Morforwyn · Elimue-Linie', emblem: ELIMUE_LINE_EMBLEM };
  }
  if (MARMUE_LINE_MEMBER_IDS.has(personId)) {
    return { name: 'Morforwyn · Marmue-Linie', emblem: MARMUE_LINE_EMBLEM };
  }
  return null;
}

const MORFORWYN_LINE_LINKS = Object.freeze({
  main: Object.freeze({
    familyId: 'haus-morforwyn',
    houseId: MORFORWYN_HOUSE_ID,
    name: "Stammlinie des Hauses Morforwyn O'Carngol",
    shortName: 'Stammlinie',
    emblem: MORFORWYN_EMBLEM
  }),
  Elimue: Object.freeze({
    familyId: 'haus-morforwyn-linie-elimue',
    houseId: ELIMUE_LINE_HOUSE_ID,
    name: 'Elimue-Linie des Hauses Morforwyn',
    shortName: 'Elimue-Linie',
    emblem: ELIMUE_LINE_EMBLEM
  }),
  Marmue: Object.freeze({
    familyId: 'haus-morforwyn-linie-marmue',
    houseId: MARMUE_LINE_HOUSE_ID,
    name: 'Marmue-Linie des Hauses Morforwyn',
    shortName: 'Marmue-Linie',
    emblem: MARMUE_LINE_EMBLEM
  })
});

// Das Haus ist matriarchal. Bei Ehen zwischen zwei Morforwyn-Linien führt
// deshalb die Linie der Frau die Kinder; am Herkunftsast des Mannes bleibt
// eine eindeutige, anklickbare Wegheirat zur fortführenden Linie zurück.
const MORFORWYN_CROSS_LINE_MARRIAGES = Object.freeze([
  ['teirwton-morforwyn', 'Elimue', 'main'],
  ['ofranton-1599-morforwyn', 'Marmue', 'main'],
  ['dewiton-morforwyn', 'Elimue', 'Marmue'],
  ['helygton-morforwyn', 'Marmue', 'Elimue'],
  ['rhydton-morforwyn', 'Elimue', 'main'],
  ['ffeston-morforwyn', 'main', 'Elimue'],
  ['vynnston-morforwyn', 'Elimue', 'Marmue'],
  ['ffinton-morforwyn', 'Marmue', 'main'],
  ['derwton-morforwyn', 'Elimue', 'main'],
  ['ofranton-1661-morforwyn', 'Marmue', 'Elimue'],
  ['branston-morforwyn', 'Elimue', 'Marmue'],
  ['idriston-morforwyn', 'main', 'Marmue'],
  ['gwalchton-morforwyn', 'Elimue', 'main'],
  ['merediton-morforwyn', 'Marmue', 'main'],
  ['alunton-morforwyn', 'main', 'Marmue'],
  ['neirton-morforwyn', 'Marmue', 'main']
].map(([personId, originLine, targetLine]) => Object.freeze({
  personId,
  originLine,
  targetLine
})));

// Diese drei Männer heiraten innerhalb der schwarzen Stammlinie in den
// fortführenden Zweig ihrer jeweiligen Schwester ein. Padmue/Xylton bleiben
// die ausdrücklich gewünschte Ausnahme ohne Wiederholung und Zusatzknoten.
const MORFORWYN_INTERNAL_LINE_MARRIAGES = Object.freeze([
  'madogton-morforwyn',
  'jeston-morforwyn',
  'llyrton-morforwyn'
].map(personId => Object.freeze({
  personId,
  originLine: 'main',
  targetLine: 'main',
  internal: true
})));

const MORFORWYN_LINE_MARRIAGES = Object.freeze([
  ...MORFORWYN_CROSS_LINE_MARRIAGES,
  ...MORFORWYN_INTERNAL_LINE_MARRIAGES
]);

const LINE_MARRIAGE_BY_PERSON_ID = new Map(
  MORFORWYN_LINE_MARRIAGES.map(entry => [entry.personId, entry])
);

function lineMarriageLabel(entry) {
  const target = MORFORWYN_LINE_LINKS[entry.targetLine];
  return entry.internal
    ? `Wegverheiratet innerhalb der ${target.shortName}`
    : `Wegverheiratet in die ${target.shortName}`;
}

function createLineMarriageBranches(originLine) {
  return MORFORWYN_LINE_MARRIAGES
    .filter(entry => entry.originLine === originLine)
    .map(entry => {
      const target = MORFORWYN_LINE_LINKS[entry.targetLine];
      return createMarriedAwayBranch({
        id: `${entry.internal ? 'internal' : 'cross'}-line-marriage-${entry.personId}`,
        name: target.name,
        subtitle: lineMarriageLabel(entry),
        parentPartnershipId: REPEATED_MALE_PARTNERS[entry.personId],
        houseId: target.houseId,
        targetFamilyId: target.familyId,
        emblem: target.emblem,
        notes: 'Die Person bleibt an ihrem Herkunftsast sichtbar. Ehe und mögliche Nachkommen werden ausschließlich am matriarchal fortführenden Zweig der Frau dargestellt.'
      });
    });
}

function selectedBranches(branchIds) {
  const selectedIds = new Set(branchIds);
  return MORFORWYN_COMPLETE_SOURCE.cadetBranches.filter(branch => selectedIds.has(branch.id));
}

function createMorforwynLineFamily({
  id,
  title,
  description,
  emblem,
  crestSubtitle,
  founderPartnershipId,
  personIds,
  partnershipIds,
  parentageChildIds,
  branchIds = [],
  linkedBranches = [],
  timeJumpIds,
  timeJumpParentPartnershipIds,
  timeJumpParentPersonIds = {},
  timeJumpChildIds,
  chartRepeats = [],
  focusPersonId,
  lineKind
}) {
  const selectedPersonIds = new Set(personIds);
  const selectedPartnershipIds = new Set(partnershipIds);
  const selectedParentageChildIds = new Set(parentageChildIds);
  const selectedTimeJumpIds = new Set(timeJumpIds);
  const branches = [...selectedBranches(branchIds), ...linkedBranches];
  const persons = MORFORWYN_COMPLETE_SOURCE.persons
    .filter(person => selectedPersonIds.has(person.id))
    .map(person => copyPersonForLine(person, chartRepeats));
  const partnerships = MORFORWYN_COMPLETE_SOURCE.partnerships
    .filter(partnership => selectedPartnershipIds.has(partnership.id));
  const parentages = MORFORWYN_COMPLETE_SOURCE.parentages.filter(parentage => (
    selectedPartnershipIds.has(parentage.partnershipId)
    && selectedParentageChildIds.has(parentage.childId)
  ));
  const timeJumps = MORFORWYN_COMPLETE_SOURCE.timeJumps
    .filter(timeJump => selectedTimeJumpIds.has(timeJump.id))
    .map(timeJump => Object.freeze({
      ...timeJump,
      parentPartnershipId: timeJumpParentPartnershipIds[timeJump.id],
      parentPersonId: timeJumpParentPersonIds[timeJump.id] || '',
      sharedParentPartnershipIds: Object.freeze([]),
      childIds: Object.freeze(timeJumpChildIds[timeJump.id]),
      label: timeJump.id === 'gap-ancient-three-lines-morforwyn'
        ? `Nicht einzeln überlieferte Generationen der ${lineKind === 'main' ? 'Stammlinie' : `${lineKind}-Linie`}`
        : `Nicht einzeln überlieferte Generationen der ${lineKind === 'main' ? 'Stammlinie' : `${lineKind}-Linie`} bis um 1600`,
      notes: `${timeJump.notes} In dieser getrennten Akte wird ausschließlich die zugehörige Morforwyn-Linie gespeist.`
    }));
  const lineageHouseId = lineKind === 'Elimue'
    ? ELIMUE_LINE_HOUSE_ID
    : lineKind === 'Marmue'
      ? MARMUE_LINE_HOUSE_ID
      : MORFORWYN_HOUSE_ID;
  const usedHouseIds = new Set([
    MORFORWYN_HOUSE_ID,
    lineageHouseId,
    ...persons.map(person => person.houseId),
    ...branches.map(branch => branch.houseId)
  ]);
  const houses = MORFORWYN_COMPLETE_SOURCE.houses
    .filter(entry => usedHouseIds.has(entry.id));

  return Object.freeze({
    ...MORFORWYN_COMPLETE_SOURCE,
    document: Object.freeze({
      ...MORFORWYN_COMPLETE_SOURCE.document,
      id,
      title,
      description,
      emblem
    }),
    houses: Object.freeze(houses),
    persons: Object.freeze(persons),
    partnerships: Object.freeze(partnerships),
    parentages: Object.freeze(parentages),
    cadetBranches: Object.freeze(branches),
    timeJumps: Object.freeze(timeJumps),
    lineage: Object.freeze({
      ...MORFORWYN_COMPLETE_SOURCE.lineage,
      founderPartnershipId,
      houseId: lineageHouseId,
      crestSubtitle
    }),
    view: Object.freeze({
      ...MORFORWYN_COMPLETE_SOURCE.view,
      focusPersonId
    }),
    extensions: Object.freeze({
      ...MORFORWYN_COMPLETE_SOURCE.extensions,
      sourceRevision: 5,
      lineKind,
      sourceNote: `${MORFORWYN_COMPLETE_SOURCE.extensions.sourceNote} Die drei genealogischen Linien sind als getrennte Familienakten modelliert. Diese Akte bildet ausschließlich die ${lineKind === 'main' ? 'schwarz bewappnete Stammlinie' : `${lineKind}-Nebenlinie`} ab.`
    })
  });
}

const LINKED_LINE_BRANCHES = Object.freeze([
  createLinkedLineBranch({
    id: 'linked-line-marmue-morforwyn',
    name: 'Marmue-Linie',
    subtitle: 'Eigenständige Nebenlinie des Hauses Morforwyn',
    parentPartnershipId: 'marriage-marmue-gwalchgwyn-morforwyn',
    houseId: MARMUE_LINE_HOUSE_ID,
    targetFamilyId: 'haus-morforwyn-linie-marmue',
    emblem: MARMUE_LINE_EMBLEM,
    notes: 'Die vollständige Marmue-Linie wird ausschließlich in der verlinkten Nebenlinienakte dargestellt.'
  }),
  createLinkedLineBranch({
    id: 'linked-line-elimue-morforwyn',
    name: 'Elimue-Linie',
    subtitle: 'Eigenständige Nebenlinie des Hauses Morforwyn',
    parentPartnershipId: 'marriage-elimue-aelwyn-morforwyn',
    houseId: ELIMUE_LINE_HOUSE_ID,
    targetFamilyId: 'haus-morforwyn-linie-elimue',
    emblem: ELIMUE_LINE_EMBLEM,
    notes: 'Die vollständige Elimue-Linie wird ausschließlich in der verlinkten Nebenlinienakte dargestellt.'
  })
]);

export const HOUSE_MORFORWYN_FAMILY = createMorforwynLineFamily({
  id: 'haus-morforwyn',
  title: "Haus Morforwyn O'Carngol",
  description: 'Die schwarz bewappnete Stammlinie des matriarchalen Baronenhauses Morforwyn aus Carngol.',
  emblem: MORFORWYN_EMBLEM,
  crestSubtitle: 'Schwarz bewappnete Stammlinie des Baronenhauses aus Carngol',
  founderPartnershipId: 'marriage-hafmue-talorton-morforwyn',
  personIds: MAIN_LINE_PERSON_IDS,
  partnershipIds: MAIN_LINE_PARTNERSHIP_IDS,
  parentageChildIds: [
    'hafmue-morforwyn',
    'talorton-legendary-morforwyn',
    'marmue-morforwyn',
    'padmue-morforwyn',
    'xylton-morforwyn',
    'elimue-morforwyn',
    'serenmue-morforwyn',
    'gwennalarch-morforwyn',
    'talfamue-morforwyn',
    'idmue-morforwyn',
    'ysoltmue-morforwyn',
    'ffeston-morforwyn',
    'urumue-morforwyn',
    'xynemue-morforwyn',
    'idriston-morforwyn',
    'glanmue-morforwyn',
    'madogton-morforwyn',
    'eirymue-morforwyn',
    'karismue-morforwyn',
    'jeston-morforwyn',
    'ffynmue-morforwyn',
    'alunton-morforwyn',
    'glynis-morforwyn',
    'wledmue-morforwyn',
    'cerysmue-morforwyn',
    'nefmue-morforwyn',
    'llyrton-morforwyn'
  ],
  branchIds: ['married-away-glynis-morforwyn-llwynog'],
  linkedBranches: [
    ...LINKED_LINE_BRANCHES,
    ...createLineMarriageBranches('main')
  ],
  timeJumpIds: ['gap-ancient-three-lines-morforwyn', 'gap-three-lines-to-1600-morforwyn'],
  timeJumpParentPartnershipIds: {
    'gap-ancient-three-lines-morforwyn': 'marriage-padmue-xylton-morforwyn',
    'gap-three-lines-to-1600-morforwyn': 'marriage-serenmue-teirwton-morforwyn'
  },
  timeJumpChildIds: {
    'gap-ancient-three-lines-morforwyn': ['serenmue-morforwyn', 'gwennalarch-morforwyn'],
    'gap-three-lines-to-1600-morforwyn': ['talfamue-morforwyn', 'idmue-morforwyn']
  },
  chartRepeats: [
    ['glanmue-morforwyn', 'madogton-morforwyn', 'marriage-glanmue-madogton-morforwyn'],
    ['ffynmue-morforwyn', 'jeston-morforwyn', 'marriage-ffynmue-jeston-morforwyn'],
    ['cerysmue-morforwyn', 'llyrton-morforwyn', 'marriage-cerysmue-llyrton-morforwyn']
  ],
  focusPersonId: 'triston-morforwyn',
  lineKind: 'main'
});

export const HOUSE_MORFORWYN_ELIMUE_LINE_FAMILY = createMorforwynLineFamily({
  id: 'haus-morforwyn-linie-elimue',
  title: 'Morforwyn – Elimue-Linie',
  description: 'Eigenständige matriarchale Nebenlinie des Hauses Morforwyn, ausgehend von Elimue und Aelwyn.',
  emblem: ELIMUE_LINE_EMBLEM,
  crestSubtitle: 'Elimue-Nebenlinie des Hauses Morforwyn',
  founderPartnershipId: 'marriage-elimue-aelwyn-morforwyn',
  personIds: ELIMUE_LINE_PERSON_IDS,
  partnershipIds: ELIMUE_LINE_PARTNERSHIP_IDS,
  parentageChildIds: [
    'teirwton-morforwyn',
    'bethmue-morforwyn',
    'dewiton-morforwyn',
    'owamue-morforwyn',
    'eurolwyn-morforwyn',
    'gwenmue-morforwyn',
    'rhydton-morforwyn',
    'vynnston-morforwyn',
    'derwton-morforwyn',
    'olmue-morforwyn',
    'branston-morforwyn',
    'gwalchton-morforwyn',
    'endellion-morforwyn'
  ],
  branchIds: [
    'married-away-eurolwyn-morforwyn-grael',
    'married-away-endellion-morforwyn-marwolaeth'
  ],
  linkedBranches: createLineMarriageBranches('Elimue'),
  timeJumpIds: ['gap-ancient-three-lines-morforwyn', 'gap-three-lines-to-1600-morforwyn'],
  timeJumpParentPartnershipIds: {
    'gap-ancient-three-lines-morforwyn': 'marriage-elimue-aelwyn-morforwyn',
    'gap-three-lines-to-1600-morforwyn': 'marriage-bethmue-talorton-morforwyn'
  },
  timeJumpChildIds: {
    'gap-ancient-three-lines-morforwyn': ['teirwton-morforwyn', 'bethmue-morforwyn'],
    'gap-three-lines-to-1600-morforwyn': ['dewiton-morforwyn', 'owamue-morforwyn', 'eurolwyn-morforwyn']
  },
  focusPersonId: 'elimue-morforwyn',
  lineKind: 'Elimue'
});

export const HOUSE_MORFORWYN_MARMUE_LINE_FAMILY = createMorforwynLineFamily({
  id: 'haus-morforwyn-linie-marmue',
  title: 'Morforwyn – Marmue-Linie',
  description: 'Eigenständige matriarchale Nebenlinie des Hauses Morforwyn, ausgehend von Marmue und Gwalchgwyn.',
  emblem: MARMUE_LINE_EMBLEM,
  crestSubtitle: 'Marmue-Nebenlinie des Hauses Morforwyn',
  founderPartnershipId: 'marriage-marmue-gwalchgwyn-morforwyn',
  personIds: MARMUE_LINE_PERSON_IDS,
  partnershipIds: MARMUE_LINE_PARTNERSHIP_IDS,
  parentageChildIds: [
    'megmue-morforwyn',
    'ywamue-morforwyn',
    'helygton-morforwyn',
    'ofranton-1599-morforwyn',
    'gwenlyn-morforwyn',
    'branmue-morforwyn',
    'meiriona-morforwyn',
    'ofranton-1661-morforwyn',
    'zedmue-morforwyn',
    'ffinton-morforwyn',
    'sioned-morforwyn',
    'varedmue-morforwyn',
    'rheanne-morforwyn',
    'afanen-morforwyn',
    'jonamue-morforwyn',
    'merediton-morforwyn',
    'sianmue-morforwyn',
    'neirton-morforwyn'
  ],
  branchIds: [
    'married-away-meiriona-morforwyn-blach',
    'married-away-sioned-morforwyn-tiwna',
    'married-away-rheanne-morforwyn-illwath',
    'married-away-afanen-morforwyn-neidr'
  ],
  linkedBranches: createLineMarriageBranches('Marmue'),
  timeJumpIds: ['gap-ancient-three-lines-morforwyn', 'gap-three-lines-to-1600-morforwyn'],
  timeJumpParentPartnershipIds: {
    'gap-ancient-three-lines-morforwyn': 'marriage-marmue-gwalchgwyn-morforwyn',
    'gap-three-lines-to-1600-morforwyn': 'marriage-megmue-wynton-morforwyn'
  },
  timeJumpChildIds: {
    'gap-ancient-three-lines-morforwyn': ['megmue-morforwyn'],
    'gap-three-lines-to-1600-morforwyn': ['ywamue-morforwyn', 'helygton-morforwyn', 'ofranton-1599-morforwyn']
  },
  focusPersonId: 'marmue-morforwyn',
  lineKind: 'Marmue'
});

export const HOUSE_MORFORWYN_LINKED_LINE_FAMILIES = Object.freeze([
  HOUSE_MORFORWYN_ELIMUE_LINE_FAMILY,
  HOUSE_MORFORWYN_MARMUE_LINE_FAMILY
]);
