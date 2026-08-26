import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const SCHATTENHERZ_HOUSE_ID = 'house-schattenherz';
const SOURCE_GAP_ID = 'gap-zarnik-to-ulfgar-schattenherz';

const HOUSE_EMBLEMS = Object.freeze({
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz,
  hjerte: KRAEHENMOOR_HOUSE_EMBLEMS.hjerte,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz
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

const HEAD_IDS = new Set([
  'zarnik-hjerte',
  'ulfgar-schattenherz',
  'jorulf-schattenherz',
  'iokul-schattenherz',
  'eggert-schattenherz',
  'ornulf-schattenherz',
  'ulfrik-schattenherz'
]);

const HEIR_IDS = new Set(['isbrand-schattenherz', 'thjald-schattenherz']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SCHATTENHERZ_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SCHATTENHERZ_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SCHATTENHERZ_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function receivedWard(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel des Clans Schattenherz',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
  });
}

function house(id, name, emblem = '', status = 'active') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status,
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-zarnik-gluthilda-hjerte': ['zarnik-hjerte', 'gluthilda'],
  'marriage-asthildr-ulfgar-nachtjaeger': ['asthildr-nachtjaeger', 'ulfgar-schattenherz'],
  'marriage-fenrir-gelda-freiwinter': ['fenrir-freiwinter', 'gelda-schattenherz'],
  'marriage-vidarr-arnkatla-nachtjaeger': ['vidarr-nachtjaeger', 'arnkatla-schattenherz'],
  'marriage-vemund-bergljot-schmetterschild': ['vemund-schattenherz', 'bergljot-schmetterschild'],
  'marriage-jorah-gulda-kummerherz': ['jorah-kummerherz', 'gulda-schattenherz'],
  'marriage-jorulf-kolfrid-schattenherz': ['jorulf-schattenherz', 'kolfrid'],
  'marriage-arnsten-hjordis-schattenherz': ['arnsten-kaltherz', 'hjordis-schattenherz'],
  'marriage-jarnbjorn-wyrhild-schattenherz': ['jarnbjorn-schattenherz', 'wyrhild'],
  'marriage-marduk-kenhild-varangr': ['marduk-varangr', 'kenhild-schattenherz'],
  'marriage-iokul-hildrun-schattenherz': ['iokul-schattenherz', 'hildrun-feuerherz'],
  'marriage-stigandr-gudrun-skogg': ['stigandr-skogg', 'gudrun-schattenherz'],
  'marriage-eggert-brita-schattenherz': ['eggert-schattenherz', 'brita-kaltherz'],
  'marriage-ornulf-krumhild-schattenherz': ['ornulf-schattenherz', 'krumhild'],
  'marriage-ingjald-unhild-schattenherz': ['ingjald-blutstahl', 'unhild-schattenherz'],
  'marriage-kvedulf-siglind-schattenherz': ['kvedulf-schattenherz', 'siglind'],
  'marriage-fritjof-torhild-schattenherz': ['fritjof-silberblut', 'torhild-schattenherz'],
  'marriage-ulfrik-hulda-kampfgeborene': ['ulfrik-schattenherz', 'hulda-kampfgeborene'],
  'marriage-thongvar-lysfrid-schattenherz': ['thongvar-silberblut', 'lysfrid-schattenherz'],
  'marriage-wiglund-ysgarda-schattenherz': ['wiglund-schattenherz', 'ysgarda'],
  'marriage-hallgrim-ingithora-schattenherz': ['hallgrim-blutstahl', 'ingithora-schattenherz'],
  'marriage-isbrand-kjara-schattenherz': ['isbrand-schattenherz', 'kjara'],
  'marriage-brogan-tjalda-schattenherz': ['brogan-wellenschild', 'tjalda-schattenherz'],
  'marriage-tyrfing-thera-schattenherz': ['tyrfing-schattenherz', 'thera-goldglanz'],
  'marriage-simun-dagni-schattenherz': ['simun-schattenherz', 'dagni-kaltherz'],
  'affair-dagni-nordall-kaltherz': ['dagni-kaltherz', 'nordall-eisenbieger'],
  'marriage-rorik-gisrun-varangr': ['rorik-varangr', 'gisrun-schattenherz']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'schattenherz-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'schattenherz-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes
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
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      registryManagedFields: [
        'name',
        'parentPartnershipId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ]
    }
  });
}

export const HOUSE_SCHATTENHERZ_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-schattenherz',
    title: 'Clan Schattenherz',
    motto: '',
    description: 'Thanenclan von Rabenfurt im Thanentum Rabenweide und Kadettenhaus des erloschenen Hjerte-Clans. Im Krieg der Prätendenten hielten die Schattenherzen die Brücke von Rabenfurt für die Rote Fraktion, erlitten 1632 vor Rorikshall jedoch eine vernichtende Niederlage.',
    emblem: HOUSE_EMBLEMS.schattenherz,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.schattenherz
  },
  houses: [
    house(SCHATTENHERZ_HOUSE_ID, 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-hjerte', 'Clan Hjerte', HOUSE_EMBLEMS.hjerte, 'extinct'),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-kaltherz', 'Clan Kaltherz', HOUSE_EMBLEMS.kaltherz),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-feuerherz', 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-wellenschild', 'Clan Wellenschild'),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz)
  ],
  persons: [
    person('zarnik-hjerte', 'Zarnik Hjerte', 'male', '????', '????', {
      houseId: 'house-hjerte',
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Hjerte-Spross · Gründer und erster Thane der Schattenherzen',
      tags: ['Gründer', 'Kadettenhausgründer']
    }),
    spouse('gluthilda', 'Gluthilda', 'female', '????', '????', '', {
      title: 'Mitbegründerin des Clans Schattenherz',
      tags: ['Gründerin']
    }),

    person('ulfgar-schattenherz', 'Ulfgar Schattenherz', 'male', '1584', '1632', {
      title: 'Thane des Clans Schattenherz bis 1632 · gefallen im Hinterhalt bei Rorikshall'
    }),
    awayWoman('gelda-schattenherz', 'Gelda Schattenherz', '1585', '1650', 'Clan Freiwinter'),
    awayWoman('arnkatla-schattenherz', 'Arnkatla Schattenherz', '1589', '1635', 'Clan Nachtjäger'),
    person('vemund-schattenherz', 'Vemund Schattenherz', 'male', '1593', '1632'),
    awayWoman('gulda-schattenherz', 'Gulda Schattenherz', '1597', '1677', 'Clan Kummerherz'),
    spouse('asthildr-nachtjaeger', 'Ásthildr Nachtjäger', 'female', '1587', '1659', 'house-nachtjaeger'),
    spouse('fenrir-freiwinter', 'Fenrir Freiwinter', 'male', '1584', '1627', 'house-freiwinter'),
    spouse('vidarr-nachtjaeger', 'Vidarr Nachtjäger', 'male', '1585', '1632', 'house-nachtjaeger'),
    spouse('bergljot-schmetterschild', 'Bergljot Schmetterschild', 'female', '1597', '1655', 'house-schmetterschild'),
    spouse('jorah-kummerherz', 'Jorah Kummerherz', 'male', '1583', '1677', 'house-kummerherz'),

    person('jorulf-schattenherz', 'Jorulf Schattenherz', 'male', '1606', '1671', {
      title: 'Thane des Clans Schattenherz von 1632 bis 1671'
    }),
    awayWoman('hjordis-schattenherz', 'Hjördis Schattenherz', '1610', '1701', 'Clan Kaltherz'),
    person('jarnbjorn-schattenherz', 'Jarnbjorn Schattenherz', 'male', '1615', '1669'),
    awayWoman('kenhild-schattenherz', 'Kenhild Schattenherz', '1617', '1700', 'Clan Varangr'),
    spouse('kolfrid', 'Kolfrid', 'female', '????', '????'),
    spouse('arnsten-kaltherz', 'Arnsten Kaltherz', 'male', '1610', '1645', 'house-kaltherz'),
    spouse('wyrhild', 'Wyrhild', 'female', '????', '????'),
    spouse('marduk-varangr', 'Marduk Varangr', 'male', '1617', '1639', 'house-varangr'),

    person('iokul-schattenherz', 'Iokul Schattenherz', 'male', '1626', '1681', {
      title: 'Thane des Clans Schattenherz von 1671 bis 1681'
    }),
    awayWoman('gudrun-schattenherz', 'Gudrun Schattenherz', '1630', '1699', 'Clan Skogg'),
    person('eggert-schattenherz', 'Eggert Schattenherz', 'male', '1634', '1685', {
      title: 'Thane des Clans Schattenherz von 1681 bis 1685'
    }),
    spouse('hildrun-feuerherz', 'Hildrun Feuerherz', 'female', '1630', '1679', 'house-feuerherz'),
    spouse('stigandr-skogg', 'Stigandr Skogg', 'male', '1629', '1675', 'house-skogg'),
    spouse('brita-kaltherz', 'Brita Kaltherz', 'female', '1633', '1694', 'house-kaltherz'),

    person('ornulf-schattenherz', 'Ornulf Schattenherz', 'male', '1647', '1711', {
      title: 'Thane des Clans Schattenherz von 1685 bis 1711'
    }),
    awayWoman('unhild-schattenherz', 'Unhild Schattenherz', '1650', '1733', 'Clan Blutstahl'),
    person('kvedulf-schattenherz', 'Kvedulf Schattenherz', 'male', '1654', '1694'),
    awayWoman('torhild-schattenherz', 'Torhild Schattenherz', '1656', '1694', 'Clan Silberblut'),
    spouse('krumhild', 'Krumhild', 'female', '????', '????'),
    spouse('ingjald-blutstahl', 'Ingjald Blutstahl', 'male', '1650', '1715', 'house-blutstahl'),
    spouse('siglind', 'Siglind', 'female', '????', '????'),
    spouse('fritjof-silberblut', 'Fritjof Silberblut', 'male', '1650', '1700', 'house-silberblut'),

    person('ulfrik-schattenherz', 'Ulfrik Schattenherz', 'male', '1672', '', {
      title: 'Thane des Clans Schattenherz seit 1711'
    }),
    awayWoman('lysfrid-schattenherz', 'Lysfrid Schattenherz', '1677', '1733', 'Clan Silberblut'),
    person('wiglund-schattenherz', 'Wiglund Schattenherz', 'male', '1675', ''),
    awayWoman('ingithora-schattenherz', 'Ingithora Schattenherz', '1678', '1706', 'Clan Blutstahl'),
    spouse('hulda-kampfgeborene', 'Hulda Kampfgeborene', 'female', '1671', '', 'house-kampfgeborene'),
    spouse('thongvar-silberblut', 'Thongvar Silberblut', 'male', '1673', '', 'house-silberblut'),
    spouse('ysgarda', 'Ysgarda', 'female', '????', ''),
    spouse('hallgrim-blutstahl', 'Hallgrim Blutstahl', 'male', '1673', '', 'house-blutstahl'),

    person('isbrand-schattenherz', 'Isbrand Schattenherz', 'male', '1697', '', {
      title: 'Erster Erbe des Clans Schattenherz · Vetter und Rivale Simuns'
    }),
    awayWoman('tjalda-schattenherz', 'Tjalda Schattenherz', '1702', '', 'Clan Wellenschild'),
    person('tyrfing-schattenherz', 'Tyrfing Schattenherz', 'male', '1700', ''),
    person('simun-schattenherz', 'Simun Schattenherz', 'male', '1701', '', {
      title: 'Vetter und Rivale Isbrands',
      notes: 'Die Quelle berichtet, dass eines seiner drei vermeintlichen Kinder aus einer Affäre Dagnis stammt. Welches Kind betroffen ist, wird nicht genannt.'
    }),
    awayWoman('gisrun-schattenherz', 'Gisrun Schattenherz', '1703', '', 'Clan Varangr'),
    spouse('kjara', 'Kjara', 'female', '????', ''),
    spouse('brogan-wellenschild', 'Brogan Wellenschild', 'male', '1700', '', 'house-wellenschild'),
    spouse('thera-goldglanz', 'Thera Goldglanz', 'female', '1700', '', 'house-goldglanz'),
    spouse('dagni-kaltherz', 'Dagni Kaltherz', 'female', '1702', '', 'house-kaltherz', {
      notes: 'Die Kaltherz-Gegenakte benennt Nordall Eisenbieger als Affärenpartner. Welches der drei öffentlich Simun zugerechneten Kinder aus der Affäre stammt, bleibt unbekannt.',
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['simun-schattenherz', 'nordall-eisenbieger'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('nordall-eisenbieger', 'Nordall Eisenbieger', 'male', '1698', '', 'house-eisenbieger', {
      familyRole: 'affair',
      title: 'Affäre Dagnis',
      tags: ['Affäre']
    }),
    spouse('rorik-varangr', 'Rörik Varangr', 'male', '1696', '1720', 'house-varangr'),

    person('thjald-schattenherz', 'Thjald Schattenherz', 'male', '1720', '', {
      title: 'Zweiter Erbe des Clans Schattenherz'
    }),
    person('ake-schattenherz', 'Ake Schattenherz', 'male', '1725', ''),
    receivedWard('inga-wellenschild', 'Inga Wellenschild', 'female', '1725', 'house-wellenschild', {
      title: 'Aufgenommenes Mündel Isbrands'
    }),
    person('selrik-schattenherz', 'Selrik Schattenherz', 'male', '1724', ''),
    person('volga-schattenherz', 'Volga Schattenherz', 'female', '1729', ''),
    person('rimbert-schattenherz', 'Rimbert Schattenherz', 'male', '1723', '', {
      notes: 'Leiblicher Sohn Simuns und Dagnis. Die Eisenbieger-Gegenakte klärt, dass nicht Rimbert, sondern Hilda aus Dagnis Affäre stammt.'
    }),
    person('jurgla-schattenherz', 'Jurgla Schattenherz', 'female', '1725', '', {
      notes: 'Leibliche Tochter Simuns und Dagnis. Die Eisenbieger-Gegenakte klärt, dass nicht Jurgla, sondern Hilda aus Dagnis Affäre stammt.'
    }),
    person('hilda-schattenherz', 'Hilda Schattenherz', 'female', '1728', '', {
      familyRole: 'bastard',
      title: 'Öffentlich Simun zugerechnet · Tochter Nordall Eisenbiegers und Dagnis',
      tags: ['Bastard'],
      notes: 'Die Eisenbieger-Herkunftsakte identifiziert Hilda ausdrücklich als Kind der geheimen Affäre Nordall Eisenbieger–Dagni Kaltherz.'
    })
  ],
  partnerships: [
    partnership('marriage-zarnik-gluthilda-hjerte', { status: 'ended' }),
    partnership('marriage-asthildr-ulfgar-nachtjaeger', { status: 'ended', end: '1632' }),
    partnership('marriage-fenrir-gelda-freiwinter', { status: 'ended', end: '1627' }),
    partnership('marriage-vidarr-arnkatla-nachtjaeger', { status: 'ended', end: '1632' }),
    partnership('marriage-vemund-bergljot-schmetterschild', { status: 'ended', end: '1632' }),
    partnership('marriage-jorah-gulda-kummerherz', { status: 'ended', end: '1677' }),
    partnership('marriage-jorulf-kolfrid-schattenherz', { status: 'ended', end: '1671' }),
    partnership('marriage-arnsten-hjordis-schattenherz', { status: 'ended', end: '1645' }),
    partnership('marriage-jarnbjorn-wyrhild-schattenherz', { status: 'ended', end: '1669' }),
    partnership('marriage-marduk-kenhild-varangr', { status: 'ended', end: '1639' }),
    partnership('marriage-iokul-hildrun-schattenherz', { status: 'ended', end: '1679' }),
    partnership('marriage-stigandr-gudrun-skogg', { status: 'ended', end: '1675' }),
    partnership('marriage-eggert-brita-schattenherz', { status: 'ended', end: '1685' }),
    partnership('marriage-ornulf-krumhild-schattenherz', { status: 'ended', end: '1711' }),
    partnership('marriage-ingjald-unhild-schattenherz', { status: 'ended', end: '1715' }),
    partnership('marriage-kvedulf-siglind-schattenherz', { status: 'ended', end: '1694' }),
    partnership('marriage-fritjof-torhild-schattenherz', { status: 'ended', end: '1694' }),
    partnership('marriage-ulfrik-hulda-kampfgeborene'),
    partnership('marriage-thongvar-lysfrid-schattenherz', { status: 'ended', end: '1733' }),
    partnership('marriage-wiglund-ysgarda-schattenherz'),
    partnership('marriage-hallgrim-ingithora-schattenherz', { status: 'ended', end: '1706' }),
    partnership('marriage-isbrand-kjara-schattenherz'),
    partnership('marriage-brogan-tjalda-schattenherz'),
    partnership('marriage-tyrfing-thera-schattenherz'),
    partnership('marriage-simun-dagni-schattenherz', {
      notes: 'Rimbert und Jurgla sind leibliche Kinder Simuns und Dagnis. Hilda wurde öffentlich Simun zugerechnet, stammt laut Eisenbieger-Gegenakte jedoch aus Dagnis Affäre mit Nordall.'
    }),
    partnership('affair-dagni-nordall-kaltherz', {
      type: 'affair',
      visibility: 'private',
      notes: 'Nordall ist Dagnis Affärenpartner und laut Eisenbieger-Herkunftsakte Hildas biologischer Vater.'
    }),
    partnership('marriage-rorik-gisrun-varangr', { status: 'ended', end: '1720' })
  ],
  parentages: [
    ...childrenOf(
      ['ulfgar-schattenherz', 'gelda-schattenherz', 'arnkatla-schattenherz', 'vemund-schattenherz', 'gulda-schattenherz'],
      'marriage-zarnik-gluthilda-hjerte',
      {
        type: 'claimed',
        legitimacy: 'unknown',
        certainty: 'probable',
        notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
        extensions: { timeJumpId: SOURCE_GAP_ID }
      }
    ),
    ...childrenOf(['jorulf-schattenherz', 'hjordis-schattenherz'], 'marriage-asthildr-ulfgar-nachtjaeger'),
    ...childrenOf(['jarnbjorn-schattenherz', 'kenhild-schattenherz'], 'marriage-vemund-bergljot-schmetterschild'),
    ...childrenOf(['iokul-schattenherz', 'gudrun-schattenherz'], 'marriage-jorulf-kolfrid-schattenherz'),
    ...childrenOf(['eggert-schattenherz'], 'marriage-jarnbjorn-wyrhild-schattenherz'),
    ...childrenOf(['ornulf-schattenherz', 'unhild-schattenherz'], 'marriage-iokul-hildrun-schattenherz'),
    ...childrenOf(['kvedulf-schattenherz', 'torhild-schattenherz'], 'marriage-eggert-brita-schattenherz'),
    ...childrenOf(['ulfrik-schattenherz', 'lysfrid-schattenherz'], 'marriage-ornulf-krumhild-schattenherz'),
    ...childrenOf(['wiglund-schattenherz', 'ingithora-schattenherz'], 'marriage-kvedulf-siglind-schattenherz'),
    ...childrenOf(['isbrand-schattenherz', 'tjalda-schattenherz', 'tyrfing-schattenherz'], 'marriage-ulfrik-hulda-kampfgeborene'),
    ...childrenOf(['simun-schattenherz', 'gisrun-schattenherz'], 'marriage-wiglund-ysgarda-schattenherz'),
    ...childrenOf(['thjald-schattenherz', 'ake-schattenherz'], 'marriage-isbrand-kjara-schattenherz'),
    ...fosterChildren(
      ['inga-wellenschild'],
      'isbrand-schattenherz',
      'Inga Wellenschild ist Isbrands aufgenommenes Mündel und kein leibliches Kind von Isbrand und Kjara.'
    ),
    ...childrenOf(['selrik-schattenherz', 'volga-schattenherz'], 'marriage-tyrfing-thera-schattenherz'),
    ...childrenOf(['rimbert-schattenherz', 'jurgla-schattenherz'], 'marriage-simun-dagni-schattenherz'),
    ...childrenOf(['hilda-schattenherz'], 'affair-dagni-nordall-kaltherz', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Die biologische Abstammung von Nordall und Dagni ist geheim; öffentlich gilt Hilda als Simuns Tochter.'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-gelda-schattenherz-freiwinter', 'Clan Freiwinter', 'marriage-fenrir-gelda-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-arnkatla-schattenherz-nachtjaeger', 'Clan Nachtjäger', 'marriage-vidarr-arnkatla-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-gulda-schattenherz-kummerherz', 'Clan Kummerherz', 'marriage-jorah-gulda-kummerherz', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-hjordis-schattenherz-kaltherz', 'Clan Kaltherz', 'marriage-arnsten-hjordis-schattenherz', 'house-kaltherz', 'haus-kaltherz', HOUSE_EMBLEMS.kaltherz),
    marriedAway('married-away-kenhild-schattenherz-varangr', 'Clan Varangr', 'marriage-marduk-kenhild-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-gudrun-schattenherz-skogg', 'Clan Skogg', 'marriage-stigandr-gudrun-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg),
    marriedAway('married-away-unhild-schattenherz-blutstahl', 'Clan Blutstahl', 'marriage-ingjald-unhild-schattenherz', 'house-blutstahl', 'haus-blutstahl', HOUSE_EMBLEMS.blutstahl),
    marriedAway('married-away-torhild-schattenherz-silberblut', 'Clan Silberblut', 'marriage-fritjof-torhild-schattenherz', 'house-silberblut', 'haus-silberblut', HOUSE_EMBLEMS.silberblut),
    marriedAway('married-away-lysfrid-schattenherz-silberblut', 'Clan Silberblut', 'marriage-thongvar-lysfrid-schattenherz', 'house-silberblut', 'haus-silberblut', HOUSE_EMBLEMS.silberblut),
    marriedAway('married-away-ingithora-schattenherz-blutstahl', 'Clan Blutstahl', 'marriage-hallgrim-ingithora-schattenherz', 'house-blutstahl', 'haus-blutstahl', HOUSE_EMBLEMS.blutstahl),
    marriedAway('married-away-tjalda-schattenherz-wellenschild', 'Clan Wellenschild', 'marriage-brogan-tjalda-schattenherz', 'house-wellenschild', 'haus-wellenschild'),
    marriedAway('married-away-gisrun-schattenherz-varangr', 'Clan Varangr', 'marriage-rorik-gisrun-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-zarnik-gluthilda-hjerte',
    parentPersonId: '',
    childIds: ['ulfgar-schattenherz', 'gelda-schattenherz', 'arnkatla-schattenherz', 'vemund-schattenherz', 'gulda-schattenherz'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1584',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Schattenherz-Hausknoten; keine Person und kein anderer Knoten steht parallel auf seiner Ebene.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-zarnik-gluthilda-hjerte',
    houseId: SCHATTENHERZ_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Rabenfurt · Kadettenhaus der Hjerte',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'hjerte-origin-schattenherz',
      houseId: 'house-hjerte',
      name: 'Clan Hjerte',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: HOUSE_EMBLEMS.hjerte,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['zarnik-hjerte'],
      targetFamilyId: 'haus-hjerte',
      notes: 'Zarnik Hjerte begründet gemeinsam mit Gluthilda den Schattenherz-Zweig.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'zarnik-hjerte',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceFamilyId: 'haus-hjerte',
    sourceRevision: 6,
    sourceModule: 'Clan Schattenherz (bereitgestellte Altdaten)',
    sourceCrossRecordNote: 'Die Eisenbieger-Herkunftsakte beseitigt die bisherige Mehrdeutigkeit: Hilda ist das Kind der Affäre Nordall Eisenbieger–Dagni Kaltherz; Rimbert und Jurgla bleiben leibliche Kinder Simuns und Dagnis.',
    sourceNote: 'Der vollständige überlieferte Schattenherz-Stammbaum wird ohne Personenfokus von Zarnik Hjerte und Gluthilda bis zur jüngsten Generation des Jahres 1740 gezeigt. Der Hjerte-Ursprung steht verlinkt über Zarnik; der Schattenherz-Hausknoten folgt direkt unter dem Gründerpaar und genau ein serieller Zeitsprung führt danach zu Ulfgar, Gelda, Arnkatla, Vemund und Gulda. Die Oberhauptfolge lautet Zarnik, Ulfgar, Jorulf, Iokul, Eggert, Ornulf und Ulfrik; Isbrand und Thjald bilden die angegebene Erbfolge. Zwölf belegte auswärtige Ehen von Schattenherz-Frauen besitzen direkte Wegverheiratet-Knoten; ihre fremden Nachkommen bleiben ausschließlich in den Zielakten. Inga Wellenschild ist ausschließlich Isbrands aufgenommenes Mündel. Arnsten Kaltherz wird anhand der ausgearbeiteten Kaltherz-Gegenakte auf 1610–1645 präzisiert. Die Quelle berichtet, dass eines der drei als Simuns Kinder geführten Geschwister Rimbert, Jurgla und Hilda aus Dagnis geheimer Affäre stammt. Die Kaltherz-Gegenakte benennt den Vater als Nordall Eisenbieger, aber weiterhin nicht das betroffene Kind. Deshalb wird kein Kind willkürlich als Bastard ausgezeichnet; die Vaterschaft aller drei bleibt als bestrittene, öffentlich anerkannte Abstammung dokumentiert. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryTombstones: {
      persons: [
        'haus-schattenherz-gruender',
        'haus-schattenherz-gruenderin',
        'bergtor-ragnulf'
      ],
      partnerships: [
        'marriage-haus-schattenherz-founders',
        'engagement-bergtor-hjordis-ragnulf'
      ]
    },
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceFamilyId',
      'sourceNote'
    ],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse']
  }
});
