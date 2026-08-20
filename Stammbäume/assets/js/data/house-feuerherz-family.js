import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_FEUERHERZ_PORTRAITS } from './house-feuerherz-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const FEUERHERZ_HOUSE_ID = 'house-feuerherz';
const SOURCE_GAP_ID = 'gap-fjalmar-to-norbjorn-feuerherz';

const HOUSE_EMBLEMS = Object.freeze({
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  hjerte: KRAEHENMOOR_HOUSE_EMBLEMS.hjerte,
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg
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
  'fjalmar-hjerte',
  'norbjorn-feuerherz',
  'sverin-feuerherz',
  'haraldur-feuerherz',
  'asbjorn-feuerherz',
  'borkur-feuerherz',
  'lythar-feuerherz'
]);

const HEIR_IDS = new Set([
  'rolfur-feuerherz',
  'kjalmar-feuerherz',
  'frodi-feuerherz'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? FEUERHERZ_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FEUERHERZ_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === FEUERHERZ_HOUSE_ID ? 'core' : 'married'),
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
  'marriage-fjalmar-volga-hjerte': ['fjalmar-hjerte', 'volga'],
  'marriage-norbjorn-grimny-feuerherz': ['norbjorn-feuerherz', 'grimny'],
  'marriage-sverin-fjorga-feuerherz': ['sverin-feuerherz', 'fjorga'],
  'marriage-oran-alfrun-leite': ['oran-leite', 'alfrun-feuerherz'],
  'marriage-vanadis-drengur-varangr': ['drengur-feuerherz', 'vanadis-varangr'],
  'marriage-sturlaugr-ingunn-nachtjaeger': ['sturlaugr-nachtjaeger', 'ingunn-1614-feuerherz'],
  'marriage-haraldur-johild-kummerherz': ['haraldur-feuerherz', 'johild-kummerherz'],
  'marriage-ketill-ingunn-ragnulf': ['ketill-ragnulf', 'ingunn-1611-feuerherz'],
  'marriage-sighvat-isbjorg-schmetterschild': ['sighvat-schmetterschild', 'isbjorg-feuerherz'],
  'marriage-vanadis-asbjorn-silberblut': ['asbjorn-feuerherz', 'vanadis-silberblut'],
  'marriage-iokul-hildrun-schattenherz': ['iokul-schattenherz', 'hildrun-feuerherz'],
  'marriage-dagur-siglind-feuerherz': ['dagur-feuerherz', 'siglind'],
  'marriage-borkur-runa-feuerherz': ['borkur-feuerherz', 'runa-goldglanz'],
  'marriage-halvar-wjardis-feuerherz': ['halvar-feuerherz', 'wjardis-schwarzblut'],
  'marriage-jodis-nvjar-goldglanz': ['nvjar-goldglanz', 'jodis-feuerherz'],
  'marriage-eyrun-lythar-blutstahl': ['lythar-feuerherz', 'eyrun-blutstahl'],
  'marriage-palsson-lofhild-feuerherz': ['palsson-feuerherz', 'lofhild'],
  'marriage-leifdis-hoibrean-eamhra': ['hoibrean-eamhra', 'leifdis-feuerherz'],
  'marriage-frida-rolfur-varangr': ['rolfur-feuerherz', 'frida-varangr'],
  'marriage-haeva-nordall-feuerherz': ['nordall-eisenbieger', 'haeva-feuerherz'],
  'marriage-yrkall-islrun-feuerherz': ['yrkall-feuerherz', 'islrun'],
  'marriage-stenulf-fenkatla-skogg': ['stenulf-skogg', 'fenkatla-feuerherz']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'feuerherz-parentage',
    ...options
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
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name',
        'parentPartnershipId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export const HOUSE_FEUERHERZ_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-feuerherz',
    title: 'Clan Feuerherz',
    motto: '',
    description: 'Hesirenclan aus Moortal und Kadettenlinie des erloschenen Hjerte-Clans. Die Feuerherzen gelten als impulsiv, tapfer und unerschütterlich ehrlich. Sie bevorzugen offene Konfrontation, verachten List und betrachten sich als die wahren Erben der Hjerte.',
    emblem: HOUSE_EMBLEMS.feuerherz,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.feuerherz
  },
  houses: [
    house(FEUERHERZ_HOUSE_ID, 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-hjerte', 'Clan Hjerte', HOUSE_EMBLEMS.hjerte, 'extinct'),
    house('house-leite', 'Clan Leite'),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-eamhra', 'Clan Eamhra'),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg)
  ],
  persons: [
    person('fjalmar-hjerte', 'Fjalmar Hjerte', 'male', '????', '????', {
      houseId: 'house-hjerte',
      familyRole: 'core',
      title: 'Hjerte-Spross · Begründer und erster Hesir des Clans Feuerherz',
      tags: ['Gründer', 'Kadettenhausgründer']
    }),
    spouse('volga', 'Volga', 'female', '????', '????', '', {
      title: 'Mitbegründerin des Clans Feuerherz',
      tags: ['Gründerin']
    }),

    person('norbjorn-feuerherz', 'Norbjorn Feuerherz', 'male', '1562', '1614', {
      title: 'Hesir des Clans Feuerherz bis 1614'
    }),
    spouse('grimny', 'Grimny', 'female', '????', '????', '', {
      notes: 'Die Quelle nennt widersprüchlich 1685 als Geburtsjahr, obwohl ihre Kinder 1585 und 1587 geboren wurden.'
    }),

    person('sverin-feuerherz', 'Sverin Feuerherz', 'male', '1585', '1652', {
      title: 'Hesir des Clans Feuerherz von 1614 bis 1652'
    }),
    awayWoman('alfrun-feuerherz', 'Alfrun Feuerherz', '1587', '????', 'Clan Leite'),
    spouse('fjorga', 'Fjorga', 'female', '????', '????'),
    spouse('oran-leite', 'Oran Leite', 'male', '????', '????', 'house-leite'),

    person('drengur-feuerherz', 'Drengur Feuerherz', 'male', '1610', '1641'),
    awayWoman('ingunn-1614-feuerherz', 'Ingunn Feuerherz', '1614', '1645', 'Clan Nachtjäger'),
    person('haraldur-feuerherz', 'Haraldur Feuerherz', 'male', '1620', '1671', {
      title: 'Hesir des Clans Feuerherz von 1652 bis 1671'
    }),
    awayWoman('ingunn-1611-feuerherz', 'Ingunn Feuerherz', '1611', '1685', 'Clan Ragnulf'),
    awayWoman('isbjorg-feuerherz', 'Isbjörg Feuerherz', '1606', '1700', 'Clan Schmetterschild'),
    spouse('vanadis-varangr', 'Vanadis Varangr', 'female', '1609', '????', 'house-varangr'),
    spouse('sturlaugr-nachtjaeger', 'Sturlaugr Nachtjäger', 'male', '1611', '1650', 'house-nachtjaeger'),
    spouse('johild-kummerherz', 'Johild Kummerherz', 'female', '1620', '1704', 'house-kummerherz'),
    spouse('ketill-ragnulf', 'Ketill Ragnulf', 'male', '1608', '1645', 'house-ragnulf'),
    spouse('sighvat-schmetterschild', 'Sighvat Schmetterschild', 'male', '1600', '1683', 'house-schmetterschild', {
      notes: 'Die Feuerherz-Quelle nennt 1653 als Todesjahr; die ausgearbeitete Schmetterschild-Gegenakte führt 1683.'
    }),

    person('asbjorn-feuerherz', 'Asbjörn Feuerherz', 'male', '1630', '1689', {
      title: 'Hesir des Clans Feuerherz von 1671 bis 1689'
    }),
    awayWoman('hildrun-feuerherz', 'Hildrun Feuerherz', '1630', '1679', 'Clan Schattenherz'),
    person('dagur-feuerherz', 'Dagur Feuerherz', 'male', '1638', '1720'),
    spouse('vanadis-silberblut', 'Vanadis Silberblut', 'female', '1633', '????', 'house-silberblut'),
    spouse('iokul-schattenherz', 'Iokul Schattenherz', 'male', '1626', '1681', 'house-schattenherz'),
    spouse('siglind', 'Siglind', 'female', '????', '????'),

    person('borkur-feuerherz', 'Börkur Feuerherz', 'male', '1650', '1709', {
      title: 'Hesir des Clans Feuerherz von 1689 bis 1709'
    }),
    person('halvar-feuerherz', 'Halvar Feuerherz', 'male', '1658', '1720'),
    spouse('runa-goldglanz', 'Runa Goldglanz', 'female', '1648', '1707', 'house-goldglanz'),
    spouse('wjardis-schwarzblut', 'Wjardis Schwarzblut', 'female', '1654', '1719', 'house-schwarzblut'),

    person('lythar-feuerherz', 'Lythar Feuerherz', 'male', '1670', '', {
      title: 'Hesir des Clans Feuerherz seit 1709'
    }),
    awayWoman('jodis-feuerherz', 'Jödis Feuerherz', '1674', '1734', 'Clan Goldglanz'),
    person('palsson-feuerherz', 'Palsson Feuerherz', 'male', '1677', ''),
    awayWoman('leifdis-feuerherz', 'Leifdis Feuerherz', '1679', '', 'Clan Eamhra'),
    spouse('eyrun-blutstahl', 'Eyrún Blutstahl', 'female', '1674', '', 'house-blutstahl'),
    spouse('nvjar-goldglanz', 'Nvjar Goldglanz', 'male', '1677', '', 'house-goldglanz'),
    spouse('lofhild', 'Lofhild', 'female', '????', '????'),
    spouse('hoibrean-eamhra', 'Hoibrean Eamhra', 'male', '????', '', 'house-eamhra', {
      status: 'unknown'
    }),

    person('rolfur-feuerherz', 'Rolfur Feuerherz', 'male', '1694', '', {
      title: 'Erster Erbe des Clans Feuerherz'
    }),
    awayWoman('haeva-feuerherz', 'Haeva Feuerherz', '1702', '', 'Clan Eisenbieger'),
    person('yrkall-feuerherz', 'Yrkall Feuerherz', 'male', '1698', ''),
    awayWoman('fenkatla-feuerherz', 'Fenkatla Feuerherz', '1697', '', 'Clan Skogg'),
    spouse('frida-varangr', 'Frida Varangr', 'female', '1694', '', 'house-varangr'),
    spouse('nordall-eisenbieger', 'Nordall Eisenbieger', 'male', '1698', '', 'house-eisenbieger'),
    spouse('islrun', 'Islrun', 'female', '????', '', '', { status: 'unknown' }),
    spouse('stenulf-skogg', 'Stenulf Skogg', 'male', '1693', '', 'house-skogg'),

    person('kjalmar-feuerherz', 'Kjalmar Feuerherz', 'male', '1720', '', {
      title: 'Zweiter Erbe des Clans Feuerherz'
    }),
    person('stina-feuerherz', 'Stina Feuerherz', 'female', '1723', ''),
    person('frodi-feuerherz', 'Frodi Feuerherz', 'male', '1726', '', {
      title: 'Dritter Erbe des Clans Feuerherz'
    }),
    person('castar-feuerherz', 'Castar Feuerherz', 'male', '1722', ''),
    person('ymirra-feuerherz', 'Ymirra Feuerherz', 'female', '1725', '')
  ],
  partnerships: [
    partnership('marriage-fjalmar-volga-hjerte', { status: 'ended' }),
    partnership('marriage-norbjorn-grimny-feuerherz', { status: 'ended', end: '1614' }),
    partnership('marriage-sverin-fjorga-feuerherz', { status: 'ended', end: '1652' }),
    partnership('marriage-oran-alfrun-leite', { status: 'ended' }),
    partnership('marriage-vanadis-drengur-varangr', { status: 'ended', end: '1641' }),
    partnership('marriage-sturlaugr-ingunn-nachtjaeger', { status: 'ended', end: '1645' }),
    partnership('marriage-haraldur-johild-kummerherz', { status: 'ended', end: '1671' }),
    partnership('marriage-ketill-ingunn-ragnulf', { status: 'ended', end: '1645' }),
    partnership('marriage-sighvat-isbjorg-schmetterschild', { status: 'ended', end: '1683' }),
    partnership('marriage-vanadis-asbjorn-silberblut', { status: 'ended', end: '1689' }),
    partnership('marriage-iokul-hildrun-schattenherz', { status: 'ended', end: '1679' }),
    partnership('marriage-dagur-siglind-feuerherz', { status: 'ended', end: '1720' }),
    partnership('marriage-borkur-runa-feuerherz', { status: 'ended', end: '1707' }),
    partnership('marriage-halvar-wjardis-feuerherz', { status: 'ended', end: '1719' }),
    partnership('marriage-jodis-nvjar-goldglanz', { status: 'ended', end: '1734' }),
    partnership('marriage-eyrun-lythar-blutstahl'),
    partnership('marriage-palsson-lofhild-feuerherz', { status: 'ended' }),
    partnership('marriage-leifdis-hoibrean-eamhra'),
    partnership('marriage-frida-rolfur-varangr'),
    partnership('marriage-haeva-nordall-feuerherz'),
    partnership('marriage-yrkall-islrun-feuerherz'),
    partnership('marriage-stenulf-fenkatla-skogg')
  ],
  parentages: [
    ...childrenOf(['norbjorn-feuerherz'], 'marriage-fjalmar-volga-hjerte', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['sverin-feuerherz', 'alfrun-feuerherz'], 'marriage-norbjorn-grimny-feuerherz'),
    ...childrenOf(
      ['isbjorg-feuerherz', 'drengur-feuerherz', 'ingunn-1611-feuerherz', 'ingunn-1614-feuerherz', 'haraldur-feuerherz'],
      'marriage-sverin-fjorga-feuerherz'
    ),
    ...childrenOf(['asbjorn-feuerherz', 'hildrun-feuerherz'], 'marriage-vanadis-drengur-varangr'),
    ...childrenOf(['dagur-feuerherz'], 'marriage-haraldur-johild-kummerherz'),
    ...childrenOf(['borkur-feuerherz'], 'marriage-vanadis-asbjorn-silberblut'),
    ...childrenOf(['halvar-feuerherz'], 'marriage-dagur-siglind-feuerherz'),
    ...childrenOf(['lythar-feuerherz', 'jodis-feuerherz'], 'marriage-borkur-runa-feuerherz'),
    ...childrenOf(['palsson-feuerherz', 'leifdis-feuerherz'], 'marriage-halvar-wjardis-feuerherz'),
    ...childrenOf(['rolfur-feuerherz', 'haeva-feuerherz'], 'marriage-eyrun-lythar-blutstahl'),
    ...childrenOf(['yrkall-feuerherz', 'fenkatla-feuerherz'], 'marriage-palsson-lofhild-feuerherz'),
    ...childrenOf(['kjalmar-feuerherz', 'stina-feuerherz', 'frodi-feuerherz'], 'marriage-frida-rolfur-varangr'),
    ...childrenOf(['castar-feuerherz', 'ymirra-feuerherz'], 'marriage-yrkall-islrun-feuerherz')
  ],
  cadetBranches: [
    marriedAway('married-away-alfrun-feuerherz-leite', 'Clan Leite', 'marriage-oran-alfrun-leite', 'house-leite', 'haus-leite'),
    marriedAway('married-away-ingunn-1614-feuerherz-nachtjaeger', 'Clan Nachtjäger', 'marriage-sturlaugr-ingunn-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-ingunn-1611-feuerherz-ragnulf', 'Clan Ragnulf', 'marriage-ketill-ingunn-ragnulf', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-isbjorg-feuerherz-schmetterschild', 'Clan Schmetterschild', 'marriage-sighvat-isbjorg-schmetterschild', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-hildrun-feuerherz-schattenherz', 'Clan Schattenherz', 'marriage-iokul-hildrun-schattenherz', 'house-schattenherz', 'haus-schattenherz', HOUSE_EMBLEMS.schattenherz),
    marriedAway('married-away-jodis-feuerherz-goldglanz', 'Clan Goldglanz', 'marriage-jodis-nvjar-goldglanz', 'house-goldglanz', 'haus-goldglanz', HOUSE_EMBLEMS.goldglanz),
    marriedAway('married-away-leifdis-feuerherz-eamhra', 'Clan Eamhra', 'marriage-leifdis-hoibrean-eamhra', 'house-eamhra', 'haus-eamhra'),
    marriedAway('married-away-haeva-feuerherz-eisenbieger', 'Clan Eisenbieger', 'marriage-haeva-nordall-feuerherz', 'house-eisenbieger', 'haus-eisenbieger'),
    marriedAway('married-away-fenkatla-feuerherz-skogg', 'Clan Skogg', 'marriage-stenulf-fenkatla-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-fjalmar-volga-hjerte',
    parentPersonId: '',
    childIds: ['norbjorn-feuerherz'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1562',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Feuerherz-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-fjalmar-volga-hjerte',
    houseId: FEUERHERZ_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Moortal · Kadettenlinie der Hjerte',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'hjerte-origin-feuerherz',
      houseId: 'house-hjerte',
      name: 'Clan Hjerte',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: HOUSE_EMBLEMS.hjerte,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['fjalmar-hjerte'],
      targetFamilyId: 'haus-hjerte',
      notes: 'Fjalmar Hjerte begründet gemeinsam mit Volga den Feuerherz-Zweig.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fjalmar-hjerte',
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
    sourceRevision: 2,
    sourceModule: 'Clan Feuerherz (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Feuerherz-Stammbaum wird ohne Personenfokus von Fjalmar Hjerte und Volga bis zur jüngsten Generation des Jahres 1740 gezeigt. Hauswappen und genau ein absolut serieller Zeitsprung stehen direkt unter dem Gründerpaar. Kinder werden ausschließlich unter dem belegten Elternpaar geführt; Nachkommen aus auswärtig fortgeführten Linien bleiben in deren Gegenakten. Neun Feuerherz-Frauen erhalten direkte Wegverheiratet-Knoten unter ihrer jeweiligen Ehe. Die zwei verschiedenen Frauen namens Ingunn werden über Geburtsjahr und eigene Weltpersonen getrennt. Fünf namenlose Verlobten-Platzhalter der jüngsten Generation werden nicht importiert. Wiederholte Standardsilhouetten werden nicht als Individualporträts gespeichert. Grimnys angebliches Geburtsjahr 1685 ist mit den Geburten ihrer Kinder 1585 und 1587 unvereinbar und bleibt deshalb offen. Sighvats Todesjahr 1653 widerspricht der ausgearbeiteten Schmetterschild-Gegenakte, die 1683 führt; die kanonische Gegenakte wird beibehalten und der Konflikt dokumentiert.',
    sourceConflicts: [{
      field: 'persons.grimny.birth',
      values: ['1685'],
      resolvedValue: '????',
      reason: '1685 liegt ein Jahrhundert nach den Geburten ihrer Kinder 1585 und 1587.'
    }, {
      field: 'persons.sighvat-schmetterschild.death',
      values: ['1653', '1683'],
      resolvedValue: '1683',
      reason: 'Die ausgearbeitete Schmetterschild-Gegenakte ist für Sighvats eigene Linie kanonisch.'
    }],
    registryTombstones: {
      persons: ['haus-feuerherz-gruender', 'haus-feuerherz-gruenderin'],
      partnerships: ['marriage-haus-feuerherz-founders']
    },
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceFamilyId',
      'sourceNote',
      'sourceConflicts'
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
