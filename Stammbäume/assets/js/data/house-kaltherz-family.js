import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_KALTHERZ_PORTRAITS } from './house-kaltherz-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const KALTHERZ_HOUSE_ID = 'house-kaltherz';
const SOURCE_GAP_ID = 'gap-kjalmar-to-kjartan-kolfinna-kaltherz';

const HOUSE_EMBLEMS = Object.freeze({
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  hjerte: KRAEHENMOOR_HOUSE_EMBLEMS.hjerte,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
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
  'kjalmar-hjerte',
  'kjartan-kaltherz',
  'gorrim-kaltherz',
  'vigtyr-kaltherz',
  'nottulf-kaltherz',
  'ljotur-kaltherz',
  'jorvik-kaltherz'
]);

const HEIR_IDS = new Set(['njvar-kaltherz', 'hjalmar-kaltherz', 'fjori-kaltherz']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? KALTHERZ_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_KALTHERZ_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === KALTHERZ_HOUSE_ID ? 'core' : 'married'),
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

function affairPartner(id, name, sex, birth, death, houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'affair',
    lineageRole: 'branch',
    tags: [...(options.tags || []), 'Affäre']
  });
}

function victim(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'forced',
    lineageRole: 'branch',
    tags: [...(options.tags || []), 'Opfer']
  });
}

function bastard(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    familyRole: 'bastard',
    lineageRole: 'branch',
    tags: [...(options.tags || []), 'Bastard']
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
  'marriage-kjalmar-rorda-hjerte': ['kjalmar-hjerte', 'rorda'],
  'marriage-kjartan-urska-kaltherz': ['kjartan-kaltherz', 'urska'],
  'marriage-jothmund-kolfinna-kummerherz': ['jothmund-kummerherz', 'kolfinna-kaltherz'],
  'marriage-gorrim-nidrun-kaltherz': ['gorrim-kaltherz', 'nidrun'],
  'marriage-kavan-hjordis-leite': ['kavan-leite', 'hjordis-kaltherz'],
  'marriage-katlin-vigtyr-graumahne': ['vigtyr-kaltherz', 'katlin-graumahne'],
  'marriage-joekull-malfrid-nachtjaeger': ['joekull-nachtjaeger', 'malfrid-kaltherz'],
  'marriage-eldgrim-hildegard-ragnulf': ['eldgrim-ragnulf', 'hildegard-kaltherz'],
  'marriage-frideborg-galvar-varangr': ['galvar-kaltherz', 'frideborg-varangr'],
  'marriage-arnsten-hjordis-schattenherz': ['arnsten-kaltherz', 'hjordis-schattenherz'],
  'marriage-alfhild-nottulf-blutstahl': ['nottulf-kaltherz', 'alfhild-blutstahl'],
  'marriage-eggert-brita-schattenherz': ['eggert-schattenherz', 'brita-kaltherz'],
  'marriage-lillrun-kalfur-schwarzblut': ['kalfur-kaltherz', 'lillrun-schwarzblut'],
  'affair-kalfur-prisa-kaltherz': ['kalfur-kaltherz', 'prisa'],
  'marriage-ljotur-ivana-kaltherz': ['ljotur-kaltherz', 'ivana-goldglanz'],
  'marriage-eadbhard-frida-eldath': ['eadbhard-eldath', 'frida-kaltherz'],
  'marriage-joekull-kveldfrid-kaltherz': ['joekull-kaltherz', 'kveldfrid'],
  'forced-joekull-murda-kaltherz': ['joekull-kaltherz', 'murda'],
  'marriage-dagfrid-jorvik-blutstahl': ['jorvik-kaltherz', 'dagfrid-blutstahl'],
  'marriage-thorodd-freydis-schmetterschild': ['thorodd-schmetterschild', 'freydis-kaltherz'],
  'marriage-hordur-rynhild-kaltherz': ['hordur-kaltherz', 'rynhild'],
  'marriage-erna-njvar-varangr': ['njvar-kaltherz', 'erna-varangr'],
  'marriage-simun-dagni-schattenherz': ['simun-schattenherz', 'dagni-kaltherz'],
  'affair-dagni-nordall-kaltherz': ['dagni-kaltherz', 'nordall-eisenbieger'],
  'marriage-jerrik-melnis-kaltherz': ['jerrik-kaltherz', 'melnis'],
  'marriage-sigrod-eldkatla-skogg': ['sigrod-skogg', 'eldkatla-kaltherz']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(record, partnerPersonId, {
  reserveLeafChildLane = false,
  reserveDescendantBranchLane = false
} = {}) {
  const registryManagedExtensionFields = ['chartAlignPartnerOverChildrenPersonId'];
  if (reserveLeafChildLane) registryManagedExtensionFields.push('chartReserveLeafChildLane');
  if (reserveDescendantBranchLane) {
    registryManagedExtensionFields.push('chartReserveDescendantBranchLane');
  }
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      ...(reserveLeafChildLane ? { chartReserveLeafChildLane: true } : {}),
      ...(reserveDescendantBranchLane ? { chartReserveDescendantBranchLane: true } : {}),
      registryManagedExtensionFields
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'kaltherz-parentage',
    ...options
  });
}

function bastardChildrenOf(childIds, partnershipId, notes) {
  return childrenOf(childIds, partnershipId, {
    legitimacy: 'illegitimate',
    visibility: 'private',
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

export const HOUSE_KALTHERZ_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-kaltherz',
    title: 'Clan Kaltherz',
    motto: 'Geduld und Kalkül führen zum Sieg',
    description: 'Hesirenclan aus Moortal und Kadettenlinie des erloschenen Hjerte-Clans. Die Kaltherzen gelten als geduldige Strategen und Meister verdeckter Einflussnahme; sie dienten den Varangr loyal und betrachten die Feuerherzen als Rivalen um das wahre Erbe der Hjerte.',
    emblem: HOUSE_EMBLEMS.kaltherz,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.kaltherz
  },
  houses: [
    house(KALTHERZ_HOUSE_ID, 'Clan Kaltherz', HOUSE_EMBLEMS.kaltherz),
    house('house-hjerte', 'Clan Hjerte', HOUSE_EMBLEMS.hjerte, 'extinct'),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-leite', 'Clan Leite'),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-eldath', 'Clan Eldath'),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg)
  ],
  persons: [
    person('kjalmar-hjerte', 'Kjalmar Hjerte', 'male', '????', '????', {
      houseId: 'house-hjerte',
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Hjerte-Spross · Begründer des Clans Kaltherz',
      tags: ['Gründer', 'Kadettenhausgründer']
    }),
    spouse('rorda', 'Rorda', 'female', '????', '????', '', {
      title: 'Mitbegründerin des Clans Kaltherz',
      tags: ['Gründerin']
    }),

    person('kjartan-kaltherz', 'Kjartan Kaltherz', 'male', '1560', '1611', {
      title: 'Hesir des Clans Kaltherz bis 1611'
    }),
    awayWoman('kolfinna-kaltherz', 'Kolfinna Kaltherz', '1565', '1610', 'Clan Kummerherz'),
    spouse('urska', 'Urska', 'female', '????', '????'),
    spouse('jothmund-kummerherz', 'Jothmund Kummerherz', 'male', '1560', '1623', 'house-kummerherz'),

    person('gorrim-kaltherz', 'Gorrim Kaltherz', 'male', '1580', '1678', {
      title: 'Hesir des Clans Kaltherz bis 1678',
      notes: 'Die detaillierte Stammbaumtafel nennt 1580 als Geburtsjahr; die Hofliste nennt widersprüchlich 1611.'
    }),
    awayWoman('hjordis-kaltherz', 'Hjordis Kaltherz', '1585', '????', 'Clan Leite'),
    spouse('nidrun', 'Nidrun', 'female', '????', '????'),
    spouse('kavan-leite', 'Kavan Leite', 'male', '????', '????', 'house-leite'),

    person('vigtyr-kaltherz', 'Vigtyr Kaltherz', 'male', '1607', '1681', {
      title: 'Hesir des Clans Kaltherz bis 1681'
    }),
    awayWoman('malfrid-kaltherz', 'Malfrid Kaltherz', '1620', '1671', 'Clan Nachtjäger'),
    awayWoman('hildegard-kaltherz', 'Hildegard Kaltherz', '1612', '1698', 'Clan Ragnulf'),
    person('galvar-kaltherz', 'Galvar Kaltherz', 'male', '1610', '1693', {
      notes: 'Zeuge der Ermordung Rogers und Astrids; später einer der ersten Herdwächter.'
    }),
    person('arnsten-kaltherz', 'Arnsten Kaltherz', 'male', '1610', '1645'),
    spouse('katlin-graumahne', 'Katlin Graumähne', 'female', '1609', '????', 'house-graumahne'),
    spouse('joekull-nachtjaeger', 'Jökull Nachtjäger', 'male', '1617', '1670', 'house-nachtjaeger'),
    spouse('eldgrim-ragnulf', 'Eldgrim Ragnulf', 'male', '1610', '1660', 'house-ragnulf'),
    spouse('frideborg-varangr', 'Frideborg Varangr', 'female', '1611', '1671', 'house-varangr'),
    spouse('hjordis-schattenherz', 'Hjördis Schattenherz', 'female', '1610', '1701', 'house-schattenherz'),

    person('nottulf-kaltherz', 'Nottulf Kaltherz', 'male', '1630', '1695', {
      title: 'Hesir des Clans Kaltherz bis 1695'
    }),
    awayWoman('brita-kaltherz', 'Brita Kaltherz', '1633', '1694', 'Clan Schattenherz'),
    person('kalfur-kaltherz', 'Kalfur Kaltherz', 'male', '1637', '1689', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['lillrun-schwarzblut', 'prisa'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('alfhild-blutstahl', 'Alfhild Blutstahl', 'female', '1629', '1704', 'house-blutstahl'),
    spouse('eggert-schattenherz', 'Eggert Schattenherz', 'male', '1634', '1685', 'house-schattenherz'),
    spouse('lillrun-schwarzblut', 'Lillrun Schwarzblut', 'female', '1633', '1684', 'house-schwarzblut'),
    affairPartner('prisa', 'Prisa', 'female', '????', '????', '', {
      title: 'Affäre Kalfurs'
    }),

    person('ljotur-kaltherz', 'Ljotur Kaltherz', 'male', '1649', '1711', {
      title: 'Hesir des Clans Kaltherz bis 1711'
    }),
    awayWoman('frida-kaltherz', 'Frida Kaltherz', '1655', '????', 'Clan Eldath'),
    person('joekull-kaltherz', 'Jökull Kaltherz', 'male', '1660', '1720', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['kveldfrid', 'murda'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('ivana-goldglanz', 'Ivana Goldglanz', 'female', '1651', '1709', 'house-goldglanz'),
    spouse('eadbhard-eldath', 'Eadbhard Eldath', 'male', '????', '????', 'house-eldath'),
    spouse('kveldfrid', 'Kveldfrid', 'female', '????', '????'),
    victim('murda', 'Murda', 'female', '????', '????', {
      title: 'Opfer Jökulls · Mutter Rofgeirs'
    }),

    person('jorvik-kaltherz', 'Jorvik Kaltherz', 'male', '1670', '', {
      title: 'Hesir des Clans Kaltherz seit 1711'
    }),
    awayWoman('freydis-kaltherz', 'Freydis Kaltherz', '1680', '1732', 'Clan Schmetterschild'),
    person('hordur-kaltherz', 'Hordur Kaltherz', 'male', '1679', ''),
    bastard('rofgeir-kaltherz', 'Rofgeir Kaltherz', 'male', '????', '????', {
      title: 'Bastardsohn Jökulls und seines Opfers Murda'
    }),
    spouse('dagfrid-blutstahl', 'Dagfrid Blutstahl', 'female', '1675', '1714', 'house-blutstahl'),
    spouse('thorodd-schmetterschild', 'Thorodd Schmetterschild', 'male', '1677', '', 'house-schmetterschild'),
    spouse('rynhild', 'Rynhild', 'female', '????', '????'),

    person('njvar-kaltherz', 'Njvar Kaltherz', 'male', '1694', '', {
      title: 'Erster Erbe des Clans Kaltherz'
    }),
    awayWoman('dagni-kaltherz', 'Dagni Kaltherz', '1702', '', 'Clan Schattenherz', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['simun-schattenherz', 'nordall-eisenbieger'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    person('jerrik-kaltherz', 'Jerrik Kaltherz', 'male', '1698', ''),
    awayWoman('eldkatla-kaltherz', 'Eldkatla Kaltherz', '1700', '', 'Clan Skogg'),
    spouse('erna-varangr', 'Erna Varangr', 'female', '1698', '', 'house-varangr'),
    spouse('simun-schattenherz', 'Simun Schattenherz', 'male', '1701', '', 'house-schattenherz'),
    affairPartner('nordall-eisenbieger', 'Nordall Eisenbieger', 'male', '1698', '', 'house-eisenbieger', {
      title: 'Affäre Dagnis'
    }),
    spouse('melnis', 'Melnis', 'female', '????', '????'),
    spouse('sigrod-skogg', 'Sigrod Skogg', 'male', '1699', '', 'house-skogg'),

    person('hjalmar-kaltherz', 'Hjalmar Kaltherz', 'male', '1720', '', {
      title: 'Zweiter Erbe des Clans Kaltherz'
    }),
    person('fjori-kaltherz', 'Fjori Kaltherz', 'male', '1723', '', {
      title: 'Dritter Erbe des Clans Kaltherz',
      notes: 'Laut Quelle schwer in Stina Feuerherz verliebt; keine Verlobung belegt.'
    }),
    person('rina-kaltherz', 'Rina Kaltherz', 'female', '1726', ''),
    person('elrik-kaltherz', 'Elrik Kaltherz', 'male', '1722', ''),
    person('mjoll-kaltherz', 'Mjoll Kaltherz', 'female', '1725', '')
  ],
  partnerships: [
    partnership('marriage-kjalmar-rorda-hjerte', { status: 'ended' }),
    partnership('marriage-kjartan-urska-kaltherz', { status: 'ended', end: '1611' }),
    partnership('marriage-jothmund-kolfinna-kummerherz', { status: 'ended', end: '1610' }),
    partnership('marriage-gorrim-nidrun-kaltherz', { status: 'ended', end: '1678' }),
    partnership('marriage-kavan-hjordis-leite', { status: 'ended' }),
    partnership('marriage-katlin-vigtyr-graumahne', { status: 'ended', end: '1681' }),
    partnership('marriage-joekull-malfrid-nachtjaeger', { status: 'ended', end: '1670' }),
    partnership('marriage-eldgrim-hildegard-ragnulf', { status: 'ended', end: '1660' }),
    partnership('marriage-frideborg-galvar-varangr', { status: 'ended', end: '1671' }),
    partnership('marriage-arnsten-hjordis-schattenherz', { status: 'ended', end: '1645' }),
    partnership('marriage-alfhild-nottulf-blutstahl', { status: 'ended', end: '1695' }),
    partnership('marriage-eggert-brita-schattenherz', { status: 'ended', end: '1685' }),
    alignPartnerOverChildren(
      partnership('marriage-lillrun-kalfur-schwarzblut', { status: 'ended', end: '1684' }),
      'lillrun-schwarzblut',
      { reserveDescendantBranchLane: true }
    ),
    partnership('affair-kalfur-prisa-kaltherz', {
      type: 'affair',
      status: 'ended',
      visibility: 'private'
    }),
    partnership('marriage-ljotur-ivana-kaltherz', { status: 'ended', end: '1709' }),
    partnership('marriage-eadbhard-frida-eldath', { status: 'ended' }),
    alignPartnerOverChildren(
      partnership('marriage-joekull-kveldfrid-kaltherz', { status: 'ended', end: '1720' }),
      'kveldfrid',
      { reserveDescendantBranchLane: true }
    ),
    alignPartnerOverChildren(
      partnership('forced-joekull-murda-kaltherz', {
        type: 'forced',
        status: 'ended',
        visibility: 'private',
        notes: 'Murda ist ein Opfer Jökulls und keine freiwillige Affäre.'
      }),
      'murda',
      { reserveLeafChildLane: true }
    ),
    partnership('marriage-dagfrid-jorvik-blutstahl', { status: 'ended', end: '1714' }),
    partnership('marriage-thorodd-freydis-schmetterschild', { status: 'ended', end: '1732' }),
    partnership('marriage-hordur-rynhild-kaltherz'),
    partnership('marriage-erna-njvar-varangr'),
    partnership('marriage-simun-dagni-schattenherz'),
    partnership('affair-dagni-nordall-kaltherz', {
      type: 'affair',
      visibility: 'private'
    }),
    partnership('marriage-jerrik-melnis-kaltherz'),
    partnership('marriage-sigrod-eldkatla-skogg')
  ],
  parentages: [
    ...childrenOf(['kjartan-kaltherz', 'kolfinna-kaltherz'], 'marriage-kjalmar-rorda-hjerte', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['gorrim-kaltherz', 'hjordis-kaltherz'], 'marriage-kjartan-urska-kaltherz'),
    ...childrenOf(
      ['vigtyr-kaltherz', 'malfrid-kaltherz', 'hildegard-kaltherz', 'galvar-kaltherz', 'arnsten-kaltherz'],
      'marriage-gorrim-nidrun-kaltherz'
    ),
    ...childrenOf(['nottulf-kaltherz', 'brita-kaltherz'], 'marriage-katlin-vigtyr-graumahne'),
    ...childrenOf(['kalfur-kaltherz'], 'marriage-frideborg-galvar-varangr'),
    ...childrenOf(['ljotur-kaltherz', 'frida-kaltherz'], 'marriage-alfhild-nottulf-blutstahl'),
    ...childrenOf(['joekull-kaltherz'], 'marriage-lillrun-kalfur-schwarzblut'),
    ...childrenOf(['jorvik-kaltherz', 'freydis-kaltherz'], 'marriage-ljotur-ivana-kaltherz'),
    ...childrenOf(['hordur-kaltherz'], 'marriage-joekull-kveldfrid-kaltherz'),
    ...bastardChildrenOf(
      ['rofgeir-kaltherz'],
      'forced-joekull-murda-kaltherz',
      'Rofgeir entstammt der erzwungenen Verbindung Jökulls mit seinem Opfer Murda.'
    ),
    ...childrenOf(['njvar-kaltherz', 'dagni-kaltherz'], 'marriage-dagfrid-jorvik-blutstahl'),
    ...childrenOf(['jerrik-kaltherz', 'eldkatla-kaltherz'], 'marriage-hordur-rynhild-kaltherz'),
    ...childrenOf(['hjalmar-kaltherz', 'fjori-kaltherz', 'rina-kaltherz'], 'marriage-erna-njvar-varangr'),
    ...childrenOf(['elrik-kaltherz', 'mjoll-kaltherz'], 'marriage-jerrik-melnis-kaltherz')
  ],
  cadetBranches: [
    marriedAway('married-away-kolfinna-kaltherz-kummerherz', 'Clan Kummerherz', 'marriage-jothmund-kolfinna-kummerherz', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-hjordis-kaltherz-leite', 'Clan Leite', 'marriage-kavan-hjordis-leite', 'house-leite', 'haus-leite'),
    marriedAway('married-away-malfrid-kaltherz-nachtjaeger', 'Clan Nachtjäger', 'marriage-joekull-malfrid-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-hildegard-kaltherz-ragnulf', 'Clan Ragnulf', 'marriage-eldgrim-hildegard-ragnulf', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-brita-kaltherz-schattenherz', 'Clan Schattenherz', 'marriage-eggert-brita-schattenherz', 'house-schattenherz', 'haus-schattenherz', HOUSE_EMBLEMS.schattenherz),
    marriedAway('married-away-frida-kaltherz-eldath', 'Clan Eldath', 'marriage-eadbhard-frida-eldath', 'house-eldath', 'haus-eldath'),
    marriedAway('married-away-freydis-kaltherz-schmetterschild', 'Clan Schmetterschild', 'marriage-thorodd-freydis-schmetterschild', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-dagni-kaltherz-schattenherz', 'Clan Schattenherz', 'marriage-simun-dagni-schattenherz', 'house-schattenherz', 'haus-schattenherz', HOUSE_EMBLEMS.schattenherz),
    marriedAway('married-away-eldkatla-kaltherz-skogg', 'Clan Skogg', 'marriage-sigrod-eldkatla-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-kjalmar-rorda-hjerte',
    parentPersonId: '',
    childIds: ['kjartan-kaltherz', 'kolfinna-kaltherz'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1560',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Kaltherz-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-kjalmar-rorda-hjerte',
    houseId: KALTHERZ_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Moortal · Kadettenlinie der Hjerte',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'hjerte-origin-kaltherz',
      houseId: 'house-hjerte',
      name: 'Clan Hjerte',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: HOUSE_EMBLEMS.hjerte,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['kjalmar-hjerte'],
      targetFamilyId: 'haus-hjerte',
      notes: 'Kjalmar Hjerte begründet gemeinsam mit Rorda den Kaltherz-Zweig.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kjalmar-hjerte',
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
    sourceRevision: 3,
    sourceModule: 'Clan Kaltherz (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Kaltherz-Stammbaum wird ohne Personenfokus von Kjalmar Hjerte und Rorda bis zur jüngsten Generation des Jahres 1740 gezeigt. Das Hauswappen steht unmittelbar unter dem Gründerpaar; genau ein absolut serieller Zeitsprung führt danach zu Kjartan und Kolfinna. Kinder werden ausschließlich unter dem belegten Elternpaar geführt. Rofgeir ist Jökulls Bastard aus der erzwungenen Opferbeziehung mit Murda. Die Affären Kalfur–Prisa und Dagni–Nordall haben in der Quelle keine benannten Kinder. Wegverheiratete Frauen erhalten direkte Knoten unter ihrer jeweiligen Ehe; die auswärtigen Nachkommen werden ausschließlich in den fortführenden Gegenakten gezeigt. Fünf namenlose Verlobten-Platzhalter der jüngsten Generation werden nicht importiert. Gorrims Geburtsjahr ist widersprüchlich: Die Hofliste nennt 1611, die detaillierte Stammbaumtafel 1580. Da Gorrims Kinder ab 1607 geboren sind, wird 1580 übernommen und der Widerspruch ausdrücklich bewahrt.',
    sourceConflicts: [{
      field: 'persons.gorrim-kaltherz.birth',
      values: ['1611', '1580'],
      resolvedValue: '1580',
      reason: 'Die detaillierte Stammbaumtafel und die Chronologie seiner ab 1607 geborenen Kinder stützen 1580.'
    }],
    registryTombstones: {
      persons: ['haus-kaltherz-gruender', 'haus-kaltherz-gruenderin'],
      partnerships: ['marriage-haus-kaltherz-founders']
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
