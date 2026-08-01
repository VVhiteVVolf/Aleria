import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const HWYADEN_HOUSE_ID = 'house-hwyaden';
const HWYADEN_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden;

const HOUSE_EMBLEMS = Object.freeze({
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  asyn: WEIDEBUCHT_HOUSE_EMBLEMS.asyn,
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  dinefwr: WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  fhaire: WEIDEBUCHT_HOUSE_EMBLEMS.fhaire,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  'tir-addawol': WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'],
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? HWYADEN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_HWYADEN_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === HWYADEN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold'
  });
}

const COUPLES = Object.freeze({
  founders: ['unknown-founder-hwyaden', 'unknown-founder-wife-hwyaden'],
  gorman: ['gorman-hwyaden', 'wrantha-hwyaden'],
  owain: ['owain-hwyaden', 'meara-fhaire'],
  oweta: ['oweta-hwyaden', 'aonghus-fhaire'],
  gwiawn: ['gwiawn-hwyaden', 'cariad-asyn'],
  tanwen: ['rhodhri-wylan', 'tanwen-hwyaden'],
  run: ['run-hwyaden', 'olwyna-coedwig'],
  delwen: ['macsen-wylan', 'delwen-hwyaden'],
  collen: ['deliah-dyngwn', 'collen-hwyaden'],
  nest: ['aneurin-grawn', 'nest-hwyaden'],
  meeghan: ['meeghan-hwyaden', 'gereint-gaeth'],
  grugyn: ['grugyn-hwyaden', 'gwerful-draenog'],
  bricelyn: ['padrig-saethwyr', 'bricelyn-hwyaden'],
  catwg: ['catwg-hwyaden', 'zenovia-pyrth'],
  heatherlinn: ['ossian-blach', 'heatherlinn-hwyaden'],
  emyas: ['milenna-tir-addawol', 'emyas-hwyaden'],
  peibyn: ['sulwen-dinefwr', 'peibyn-hwyaden'],
  zinnara: ['zinnara-hwyaden', 'xylon-saith'],
  neirin: ['gwen-dienyddiwr', 'neirin-hwyaden'],
  gwenifer: ['gwenifer-hwyaden', 'dadweir-creyr'],
  alun: ['anona-wylan', 'alun-hwyaden'],
  marve: ['jareth-mochdaer', 'marve-hwyaden']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-founders-hwyaden': COUPLES.founders,
  'marriage-gorman-wrantha-hwyaden': COUPLES.gorman,
  'marriage-owain-meara-hwyaden': COUPLES.owain,
  'marriage-oweta-aonghus-hwyaden': COUPLES.oweta,
  'marriage-gwiawn-cariad-hwyaden': COUPLES.gwiawn,
  'marriage-rhodhri-tanwen': COUPLES.tanwen,
  'marriage-run-olwyna-hwyaden': COUPLES.run,
  'marriage-macsen-delwen': COUPLES.delwen,
  'marriage-deliah-collen-dyngwn': COUPLES.collen,
  'marriage-aneurin-nest': COUPLES.nest,
  'marriage-meeghan-gereint-hwyaden': COUPLES.meeghan,
  'marriage-grugyn-gwerful-hwyaden': COUPLES.grugyn,
  'marriage-padrig-bricelyn': COUPLES.bricelyn,
  'marriage-catwg-zenovia-hwyaden': COUPLES.catwg,
  'marriage-ossian-heatherlinn-blach': COUPLES.heatherlinn,
  'marriage-milenna-emyas-tir-addawol': COUPLES.emyas,
  'marriage-sulwen-peibyn-dinefwr': COUPLES.peibyn,
  'marriage-zinnara-xylon-hwyaden': COUPLES.zinnara,
  'marriage-gwen-neirin-dienyddiwr': COUPLES.neirin,
  'marriage-gwenifer-dadweir-hwyaden': COUPLES.gwenifer,
  'engagement-anona-alun': COUPLES.alun,
  'engagement-jareth-marve-mochdaer': COUPLES.marve
});

export const HOUSE_HWYADEN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-hwyaden',
    title: "Haus Hwyaden O'Trefyddin",
    motto: 'Treue im Blick.',
    description: 'Baronshaus von Trefyddin in der Baronie Borkenstein. Die Hwyaden sind für ihre Helwyr-Bogenschützen, Fährtenleser und ihre auffälligen orangefarbenen Augen bekannt.',
    emblem: HWYADEN_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES.hwyaden
  },
  houses: [
    house(HWYADEN_HOUSE_ID, "Haus Hwyaden O'Trefyddin", HWYADEN_EMBLEM),
    house('house-fhaire', 'Clan Ua Fhàire', HOUSE_EMBLEMS.fhaire),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-asyn', 'Haus Asyn', HOUSE_EMBLEMS.asyn),
    house('house-wylan', "Haus Wylan O'Cerrigarth", HOUSE_EMBLEMS.wylan),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-grawn', 'Haus Grawn'),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-draenog', 'Haus Draenog', GRAUE_WEITE_HOUSE_EMBLEMS.draenog),
    house('house-pyrth', 'Haus Pyrth'),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-tir-addawol', 'Haus Tir Addawol', HOUSE_EMBLEMS['tir-addawol']),
    house('house-dinefwr', "Haus Dinefwr O'Cerrigarth", HOUSE_EMBLEMS.dinefwr),
    house('house-saith', 'Haus Saith'),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-mochdaer', "Haus Mochdaer O'Cerrigarth", HOUSE_EMBLEMS.mochdaer)
  ],
  persons: [
    person('unknown-founder-hwyaden', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Hauses Hwyaden',
      lineageRole: 'head',
      notes: 'Der Name des frühen Gründers ist nicht überliefert.'
    }),
    person('unknown-founder-wife-hwyaden', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Hauses Hwyaden'
    }),

    person('gorman-hwyaden', 'Gormán Hwyaden', 'male', '????', '????', {
      title: 'Erster namentlich überlieferter Ahnherr',
      lineageRole: 'head'
    }),
    spouse('wrantha-hwyaden', 'Wrantha', 'female', '????', '????'),

    person('owain-hwyaden', 'Owain Hwyaden', 'male', '????', '????', {
      title: 'Baron von Trefyddin',
      lineageRole: 'head'
    }),
    awayWoman('oweta-hwyaden', 'Oweta Hwyaden', '????', '????', 'Clan Ua Fhàire'),
    spouse('meara-fhaire', 'Meara Fhàire', 'female', '????', '????', 'house-fhaire'),
    spouse('aonghus-fhaire', 'Aonghus Fhàire', 'male', '????', '????', 'house-fhaire'),

    person('gwiawn-hwyaden', 'Gwiawn Hwyaden', 'male', '????', '????', {
      title: 'Baron von Trefyddin',
      lineageRole: 'head'
    }),
    awayWoman('tanwen-hwyaden', 'Tanwen Hwyaden', '????', '????', 'Haus Créyr', {
      title: 'Mitgründerin des Hauses Créyr',
      tags: ['Hausgründerin']
    }),
    spouse('cariad-asyn', 'Cariad Asyn', 'female', '????', '????', 'house-asyn'),
    spouse('rhodhri-wylan', 'Rhodhri Wylan', 'male', '????', '????', 'house-wylan', {
      title: 'Mitgründer des Hauses Créyr'
    }),

    person('run-hwyaden', 'Run Hwyaden', 'male', '1611', '1673', {
      title: 'Baron von Trefyddin bis 1673',
      lineageRole: 'head'
    }),
    awayWoman('delwen-hwyaden', 'Delwen Hwyaden', '1611', '1634', 'Haus Wylan'),
    spouse('olwyna-coedwig', 'Olwyna Coedwig', 'female', '1612', '1687', 'house-coedwig'),
    spouse('macsen-wylan', 'Macsen Wylan', 'male', '1605', '1646', 'house-wylan'),

    person('collen-hwyaden', 'Collen Hwyaden', 'male', '1630', '1703', {
      title: 'Baron von Trefyddin 1673–1703',
      lineageRole: 'head'
    }),
    awayWoman('nest-hwyaden', 'Nest Hwyaden', '1632', '1703', 'Haus Grawn'),
    awayWoman('meeghan-hwyaden', 'Meeghan Hwyaden', '1631', '1703', 'Haus Gaeth'),
    spouse('deliah-dyngwn', 'Deliah Dyngwn', 'female', '1633', '1687', 'house-dyngwn', {
      notes: 'Die Hwyaden-Quelle schreibt den Namen abweichend als „Delilah“; die ausgearbeitete Dyngwn-Gegenakte führt die kanonische Form Deliah und belegt ihr Todesjahr 1687.'
    }),
    spouse('aneurin-grawn', 'Aneurin Grawn', 'male', '1632', '1695', 'house-grawn'),
    spouse('gereint-gaeth', 'Gereint Gaeth', 'male', '1630', '1696', 'house-gaeth'),

    person('grugyn-hwyaden', 'Grugyn Hwyaden', 'male', '1652', '1717', {
      title: 'Baron von Trefyddin 1703–1717',
      lineageRole: 'head'
    }),
    awayWoman('bricelyn-hwyaden', 'Bricelyn Hwyaden', '1654', '1700', 'Haus Saethwyr'),
    spouse('gwerful-draenog', 'Gwerful Draenog', 'female', '1648', '', 'house-draenog'),
    spouse('padrig-saethwyr', 'Padrig Saethwyr', 'male', '1654', '1720', 'house-saethwyr'),

    person('catwg-hwyaden', 'Catwg Hwyaden', 'male', '1670', '', {
      title: 'Baron von Trefyddin seit 1717',
      lineageRole: 'head',
      notes: 'Die Hofübersicht nennt abweichend „Cadwg (1709–????)“. Hier gilt die ausführliche Hierarchie mit Catwg, geboren 1670; 1717 ist der belegte Beginn seiner Amtszeit.'
    }),
    person('gwerthmwl-hwyaden', 'Gwerthmwl Hwyaden', 'male', '1670', ''),
    awayWoman('heatherlinn-hwyaden', 'Heatherlinn Hwyaden', '1674', '', 'Haus Blach'),
    person('emyas-hwyaden', 'Emyas Hwyaden', 'male', '1672', '', {
      notes: 'Die Kinderzeile der Quelle schreibt einmal „Ewyas“; die Partnerzeile und die Tir-Addawol-Gegenakte belegen die kanonische Form Emyas.'
    }),
    spouse('zenovia-pyrth', 'Zenovia Pyrth', 'female', '1674', '', 'house-pyrth'),
    spouse('ossian-blach', 'Ossian Blach', 'male', '1671', '', 'house-blach'),
    spouse('milenna-tir-addawol', 'Milenna Tir Addawol', 'female', '1673', '', 'house-tir-addawol'),

    person('peibyn-hwyaden', 'Peibyn Hwyaden', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Hwyaden',
      lineageRole: 'mainline'
    }),
    awayWoman('zinnara-hwyaden', 'Zinnara Hwyaden', '1698', '', 'Haus Saith'),
    person('neirin-hwyaden', 'Neirin Hwyaden', 'male', '1695', ''),
    awayWoman('gwenifer-hwyaden', 'Gwenifer Hwyaden', '1700', '', 'Haus Créyr'),
    spouse('sulwen-dinefwr', 'Sulwen Dinefwr', 'female', '1696', '', 'house-dinefwr'),
    spouse('xylon-saith', 'Xylon Saith', 'male', '1693', '', 'house-saith'),
    spouse('gwen-dienyddiwr', 'Gwen Dienyddiwr', 'female', '1699', '', 'house-dienyddiwr'),
    spouse('dadweir-creyr', 'Dadweir Créyr', 'male', '1694', '', 'house-creyr'),

    person('alun-hwyaden', 'Alun Hwyaden', 'male', '1722', '', {
      title: 'Zweiter Erbe des Hauses Hwyaden',
      lineageRole: 'mainline'
    }),
    person('marve-hwyaden', 'Marve Hwyaden', 'female', '1723', ''),
    person('eiryn-hwyaden', 'Eiryn Hwyaden', 'female', '1727', '', {
      title: 'Dritter Erbe des Hauses Hwyaden',
      lineageRole: 'mainline'
    }),
    person('fflam-hwyaden', 'Fflam Hwyaden', 'female', '1723', ''),
    person('dolena-hwyaden', 'Dolena Hwyaden', 'female', '1726', ''),
    spouse('anona-wylan', 'Anona Wylan', 'female', '1724', '', 'house-wylan'),
    spouse('jareth-mochdaer', 'Jareth Mochdaer', 'male', '1721', '', 'house-mochdaer')
  ],
  partnerships: [
    endedMarriage('marriage-unknown-founders-hwyaden', ...COUPLES.founders),
    endedMarriage('marriage-gorman-wrantha-hwyaden', ...COUPLES.gorman),
    endedMarriage('marriage-owain-meara-hwyaden', ...COUPLES.owain),
    endedMarriage('marriage-oweta-aonghus-hwyaden', ...COUPLES.oweta),
    endedMarriage('marriage-gwiawn-cariad-hwyaden', ...COUPLES.gwiawn),
    endedMarriage('marriage-rhodhri-tanwen', ...COUPLES.tanwen),
    endedMarriage('marriage-run-olwyna-hwyaden', ...COUPLES.run, { end: '1673' }),
    endedMarriage('marriage-macsen-delwen', ...COUPLES.delwen, { end: '1634' }),
    endedMarriage('marriage-deliah-collen-dyngwn', ...COUPLES.collen, { end: '1687' }),
    endedMarriage('marriage-aneurin-nest', ...COUPLES.nest, { end: '1695' }),
    endedMarriage('marriage-meeghan-gereint-hwyaden', ...COUPLES.meeghan, { end: '1696' }),
    endedMarriage('marriage-grugyn-gwerful-hwyaden', ...COUPLES.grugyn, { end: '1717' }),
    endedMarriage('marriage-padrig-bricelyn', ...COUPLES.bricelyn, { end: '1700' }),
    createMarriage('marriage-catwg-zenovia-hwyaden', ...COUPLES.catwg),
    createMarriage('marriage-ossian-heatherlinn-blach', ...COUPLES.heatherlinn),
    createMarriage('marriage-milenna-emyas-tir-addawol', ...COUPLES.emyas),
    createMarriage('marriage-sulwen-peibyn-dinefwr', ...COUPLES.peibyn),
    createMarriage('marriage-zinnara-xylon-hwyaden', ...COUPLES.zinnara),
    createMarriage('marriage-gwen-neirin-dienyddiwr', ...COUPLES.neirin),
    createMarriage('marriage-gwenifer-dadweir-hwyaden', ...COUPLES.gwenifer),
    createMarriage('engagement-anona-alun', ...COUPLES.alun, { type: 'engagement' }),
    createMarriage('engagement-jareth-marve-mochdaer', ...COUPLES.marve, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['gorman-hwyaden'], 'marriage-unknown-founders-hwyaden', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Gormán ist der erste namentlich überlieferte Ahnherr nach einer unbekannten Zahl ausgelassener Generationen.',
      extensions: { timeJumpId: 'gap-founders-to-gorman-hwyaden' }
    }),
    ...childrenOf(['owain-hwyaden', 'oweta-hwyaden'], 'marriage-gorman-wrantha-hwyaden', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Gormán und der Generation von Owain und Oweta sind nicht einzeln überlieferte Hwyaden ausgelassen.',
      extensions: { timeJumpId: 'gap-gorman-to-owain-generation-hwyaden' }
    }),
    ...childrenOf(['gwiawn-hwyaden', 'tanwen-hwyaden'], 'marriage-owain-meara-hwyaden'),
    ...childrenOf(['run-hwyaden', 'delwen-hwyaden'], 'marriage-gwiawn-cariad-hwyaden'),
    ...childrenOf(['collen-hwyaden', 'nest-hwyaden', 'meeghan-hwyaden'], 'marriage-run-olwyna-hwyaden'),
    ...childrenOf(['grugyn-hwyaden', 'bricelyn-hwyaden'], 'marriage-deliah-collen-dyngwn'),
    ...childrenOf(
      ['catwg-hwyaden', 'gwerthmwl-hwyaden', 'heatherlinn-hwyaden', 'emyas-hwyaden'],
      'marriage-grugyn-gwerful-hwyaden'
    ),
    ...childrenOf(['peibyn-hwyaden', 'zinnara-hwyaden'], 'marriage-catwg-zenovia-hwyaden'),
    ...childrenOf(['neirin-hwyaden', 'gwenifer-hwyaden'], 'marriage-milenna-emyas-tir-addawol'),
    ...childrenOf(['alun-hwyaden', 'marve-hwyaden', 'eiryn-hwyaden'], 'marriage-sulwen-peibyn-dinefwr'),
    ...childrenOf(['fflam-hwyaden', 'dolena-hwyaden'], 'marriage-gwen-neirin-dienyddiwr')
  ],
  cadetBranches: [
    marriedAway('married-away-oweta-hwyaden-fhaire', 'Clan Ua Fhàire', 'marriage-oweta-aonghus-hwyaden', 'house-fhaire', 'haus-fhaire', HOUSE_EMBLEMS.fhaire),
    createCadetHouseBranch({
      id: 'cadet-creyr-rhodhri',
      name: 'Haus Créyr',
      parentPartnershipId: 'marriage-rhodhri-tanwen',
      houseId: 'house-creyr',
      targetFamilyId: 'haus-creyr',
      emblem: HOUSE_EMBLEMS.creyr,
      crestFrame: 'gold',
      notes: 'Rhodhri Wylan und Tanwen Hwyaden begründen Haus Créyr; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    marriedAway('married-away-delwen-hwyaden-wylan', 'Haus Wylan', 'marriage-macsen-delwen', 'house-wylan', 'haus-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-nest-hwyaden-grawn', 'Haus Grawn', 'marriage-aneurin-nest', 'house-grawn', 'haus-grawn'),
    marriedAway('married-away-meeghan-hwyaden-gaeth', 'Haus Gaeth', 'marriage-meeghan-gereint-hwyaden', 'house-gaeth', 'haus-gaeth'),
    marriedAway('married-away-bricelyn-hwyaden-saethwyr', 'Haus Saethwyr', 'marriage-padrig-bricelyn', 'house-saethwyr', 'haus-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-heatherlinn-hwyaden-blach', 'Haus Blach', 'marriage-ossian-heatherlinn-blach', 'house-blach', 'haus-blach', HOUSE_EMBLEMS.blach),
    marriedAway('married-away-zinnara-hwyaden-saith', 'Haus Saith', 'marriage-zinnara-xylon-hwyaden', 'house-saith', 'haus-saith'),
    marriedAway('married-away-gwenifer-hwyaden-creyr', 'Haus Créyr', 'marriage-gwenifer-dadweir-hwyaden', 'house-creyr', 'haus-creyr', HOUSE_EMBLEMS.creyr)
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-gorman-hwyaden',
      parentPartnershipId: 'marriage-unknown-founders-hwyaden',
      parentPersonId: '',
      childIds: ['gorman-hwyaden'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte frühe Hwyaden-Generationen',
      notes: 'Der erste absolute Generationentrenner folgt seriell auf das Gründerpaar und den Hausknoten; Gormán beginnt ausschließlich darunter.',
      extensions: {}
    },
    {
      id: 'gap-gorman-to-owain-generation-hwyaden',
      parentPartnershipId: 'marriage-gorman-wrantha-hwyaden',
      parentPersonId: '',
      childIds: ['owain-hwyaden', 'oweta-hwyaden'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Hwyaden-Generationen',
      notes: 'Der zweite absolute Generationentrenner liegt ausschließlich unter Gormán und Wrantha und steht zu keinem anderen Knoten parallel.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-hwyaden',
    houseId: HWYADEN_HOUSE_ID,
    crestSubtitle: 'Baronshaus von Trefyddin in Borkenstein',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-founder-hwyaden',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: "Haus Hwyaden O'Trefyddin (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Porträts, Baronsfolge und Erbfolge folgen der bereitgestellten Hwyaden-Hausseite. Das unbekannte Gründerpaar führt zuerst in den Hausknoten und danach in einen absoluten Zeitsprung zu Gormán; ein zweiter serieller Sprung verbindet Gormán und Wrantha mit Owain und Oweta. Catwg folgt der ausführlichen Hierarchie; die widersprüchliche Hofkurzform Cadwg und ihre Amtszahl wurden nicht als zweite Person oder Geburtsjahr übernommen. Emyas folgt der Partnerzeile und der Tir-Addawol-Gegenakte statt der einmaligen Schreibvariante Ewyas. Deliah folgt der Dyngwn-Gegenakte statt der Variante Delilah. Oweta, Delwen, Nest, Meeghan, Bricelyn, Heatherlinn, Zinnara und Gwenifer besitzen direkt an ihrer Ehe einen Wegverheiratet-Knoten. Rhodhri Wylan und Tanwen Hwyaden tragen direkt unter ihrer Ehe den Gründungsknoten des Hauses Créyr. Nachkommen wegverheirateter Hwyaden werden nur in der jeweils fortgeführten Gegenakte gezeigt; dadurch entstehen keine doppelten Kinderlinien. Generische schwarze Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
