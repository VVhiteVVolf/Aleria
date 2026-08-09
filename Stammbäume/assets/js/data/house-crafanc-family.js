import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_CRAFANC_PORTRAITS } from './house-crafanc-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const CRAFANC_HOUSE_ID = 'house-crafanc';
const CRAFANC_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.crafanc;
const FOUNDER_TIME_JUMP_ID = 'gap-artgal-to-caradoc-crafanc';

const HOUSE_EMBLEMS = Object.freeze({
  arfordir: KLAUENINSEL_HOUSE_EMBLEMS.arfordir,
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  crafanc: CRAFANC_EMBLEM,
  cwningod: KLAUENINSEL_HOUSE_EMBLEMS.cwningod,
  dianc: KLAUENINSEL_HOUSE_EMBLEMS.dianc,
  eirth: KLAUENINSEL_HOUSE_EMBLEMS.eirth,
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  pawen: KLAUENINSEL_HOUSE_EMBLEMS.pawen,
  unigol: KLAUENINSEL_HOUSE_EMBLEMS.unigol,
  walwrs: KLAUENINSEL_HOUSE_EMBLEMS.walwrs
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

const HOUSE_HEAD_IDS = new Set([
  'artgal-arth',
  'caradoc-crafanc',
  'cynwrig-crafanc',
  'clinoch-crafanc',
  'elisud-crafanc'
]);

const MAINLINE_IDS = new Set([
  'dumnagual-crafanc',
  'melwas-crafanc',
  'iestyn-crafanc',
  'sadwyn-crafanc'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? CRAFANC_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_CRAFANC_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CRAFANC_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
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
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    ...(emblem ? { extensions: { registryManagedFields: ['name', 'emblem'] } } : {})
  };
}

const COUPLES = Object.freeze({
  founders: ['artgal-arth', 'amdarch-unknown'],
  caradoc: ['caradoc-crafanc', 'katelyn-unknown-crafanc'],
  kerenzaOlder: ['cadoc-pawen', 'kerenza-crafanc'],
  cynwrig: ['wenonah-arth', 'cynwrig-crafanc'],
  nesta: ['nesta-crafanc', 'taran-walwrs'],
  kerenzaYounger: ['kerenza-1627-crafanc', 'trachmyr-unigol'],
  clinoch: ['clinoch-crafanc', 'ffraid-unknown-crafanc'],
  elisud: ['afanen-1660-arth', 'elisud-crafanc'],
  kyndra: ['rhynnon-arth', 'kyndra-crafanc'],
  dumnagual: ['dumnagual-crafanc', 'ffion-cwningod'],
  andarch: ['andarch-crafanc', 'gereint-gwialen'],
  artgal: ['jowna-1681-mochdaer', 'artgal-crafanc'],
  glaw: ['glaw-crafanc', 'gingalain-dianc'],
  glinda: ['amaethon-pawen', 'glinda-crafanc'],
  melwas: ['olwen-arth', 'melwas-crafanc'],
  glynis: ['glynis-crafanc', 'tewdur-blaidd'],
  glesni: ['glesni-crafanc', 'madoc-arfordir'],
  tutagual: ['tutagual-crafanc', 'tegan-coedwig']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-artgal-amdarch': COUPLES.founders,
  'marriage-caradoc-katelyn-crafanc': COUPLES.caradoc,
  'marriage-cadoc-kerenza-pawen': COUPLES.kerenzaOlder,
  'marriage-wenonah-cynwrig': COUPLES.cynwrig,
  'marriage-nesta-taran-crafanc': COUPLES.nesta,
  'marriage-kerenza-trachmyr-crafanc': COUPLES.kerenzaYounger,
  'marriage-clinoch-ffraid-crafanc': COUPLES.clinoch,
  'marriage-afanen-elisud': COUPLES.elisud,
  'marriage-rhynnon-kyndra': COUPLES.kyndra,
  'marriage-dumnagual-ffion-crafanc': COUPLES.dumnagual,
  'marriage-andarch-gereint-gwialen': COUPLES.andarch,
  'marriage-jowna-artgal-mochdaer': COUPLES.artgal,
  'marriage-glaw-gingalain-crafanc': COUPLES.glaw,
  'marriage-amaethon-glinda-pawen': COUPLES.glinda,
  'marriage-olwen-melwas': COUPLES.melwas,
  'marriage-glynis-tewdur-crafanc': COUPLES.glynis,
  'marriage-glesni-madoc-crafanc': COUPLES.glesni,
  'marriage-tutagual-tegan-coedwig': COUPLES.tutagual
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'crafanc-parentage',
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
    extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
  });
}

export const HOUSE_CRAFANC_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-crafanc',
    title: "Haus Crafanc O'Talgarth",
    motto: 'Die Klaue des Bären als Zeichen von Stärke und Mut.',
    description: 'Zweites Kadettenhaus der Arth und ritterfürstliche Klaue Talgarths.',
    emblem: CRAFANC_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.crafanc
  },
  houses: [
    house(CRAFANC_HOUSE_ID, "Haus Crafanc O'Talgarth", CRAFANC_EMBLEM),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
    house('house-unbekannt-amdarch', 'Unbekanntes Haus'),
    house('house-unbekannt-katelyn-crafanc', 'Unbekanntes Haus'),
    house('house-pawen', "Haus Pawen O'Talgarth", HOUSE_EMBLEMS.pawen),
    house('house-walwrs', "Haus Walwrs O'Caer Deheuol", HOUSE_EMBLEMS.walwrs),
    house('house-unigol', "Haus Unigol O'Caer Marwor", HOUSE_EMBLEMS.unigol),
    house('house-unbekannt-ffraid-crafanc', 'Unbekanntes Haus'),
    house('house-eirth', "Haus Eirth O'Caer Glaslyn", HOUSE_EMBLEMS.eirth),
    house('house-cwningod', "Haus Cwningod O'Morea", HOUSE_EMBLEMS.cwningod),
    house('house-gwialen', "Haus Gwialen O'Tredegar", HOUSE_EMBLEMS.gwialen),
    house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau", HOUSE_EMBLEMS.mochdaer),
    house('house-dianc', "Haus Dianc O'Aberdail", HOUSE_EMBLEMS.dianc),
    house('house-blaidd', "Haus Blaidd O'Tredegar", HOUSE_EMBLEMS.blaidd),
    house('house-arfordir', "Haus Arfordir O'Aberdail", HOUSE_EMBLEMS.arfordir),
    house('house-coedwig', "Haus Coedwig O'Llanfyn", HOUSE_EMBLEMS.coedwig),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr)
  ],
  persons: [
    person('artgal-arth', 'Artgal Arth', 'male', '????', '????', {
      houseId: 'house-arth',
      familyRole: 'core',
      title: 'Gründer und erster Ritterfürst des Hauses Crafanc'
    }),
    spouse('amdarch-unknown', 'Amdarch', 'female', '????', '????', 'house-unbekannt-amdarch', {
      title: 'Mitgründerin des Hauses Crafanc'
    }),

    person('caradoc-crafanc', 'Caradoc Crafanc', 'male', '1590', '1652', {
      title: 'Ritterfürst des Hauses Crafanc 1615–1652'
    }),
    awayWoman('kerenza-crafanc', 'Kerenza Crafanc', '1596', '1643', 'Haus Pawen'),
    spouse('katelyn-unknown-crafanc', 'Katelyn', 'female', '1592', '????', 'house-unbekannt-katelyn-crafanc'),
    spouse('cadoc-pawen', 'Cadoc Pawen', 'male', '1592', '1643', 'house-pawen'),

    person('cynwrig-crafanc', 'Cynwrig Crafanc', 'male', '1617', '1677', {
      title: 'Ritterfürst des Hauses Crafanc 1652–1677'
    }),
    awayWoman('nesta-crafanc', 'Nesta Crafanc', '1619', '1672', 'Haus Walwrs'),
    awayWoman('kerenza-1627-crafanc', 'Kerenza Crafanc', '1627', '1669', 'Haus Unigol', {
      notes: 'Nicht mit der 1596 geborenen Kerenza Crafanc zu verwechseln.'
    }),
    spouse('wenonah-arth', 'Wenonah Arth', 'female', '1615', '1647', 'house-arth'),
    spouse('taran-walwrs', 'Taran Walwrs', 'male', '????', '????', 'house-walwrs'),
    spouse('trachmyr-unigol', 'Trachmyr Unigol', 'male', '????', '????', 'house-unigol'),

    person('clinoch-crafanc', 'Clinoch Crafanc', 'male', '1637', '1698', {
      title: 'Ritterfürst des Hauses Crafanc 1677–1698'
    }),
    spouse('ffraid-unknown-crafanc', 'Ffraid', 'female', '1638', '1671', 'house-unbekannt-ffraid-crafanc'),

    person('elisud-crafanc', 'Elisud Crafanc', 'male', '1661', '', {
      title: 'Ritterfürst von Talgarth · Oberhaupt des Hauses Crafanc seit 1698',
      notes: 'Die Crafanc-Quelle nennt abweichend 1659; die bereits kanonisierte Arth-Gegenakte führt 1661.'
    }),
    person('kyndra-crafanc', 'Kyndra Crafanc', 'female', '1655', '1701', {
      title: 'Mitgründerin des Hauses Eirth',
      tags: ['Kadettenhausgründerin'],
      notes: 'Das Quelljahr 1955 ist ein offensichtlicher Jahrhundertfehler und wird wie in der Arth-Gegenakte zu 1655 korrigiert.'
    }),
    spouse('afanen-1660-arth', 'Afanen Arth', 'female', '1660', '1710', 'house-arth'),
    spouse('rhynnon-arth', 'Rhynnon Arth', 'male', '1655', '1720', 'house-arth', {
      title: 'Mitgründer des Hauses Eirth'
    }),

    person('dumnagual-crafanc', 'Dumnagual Crafanc', 'male', '1676', '1718'),
    awayWoman('andarch-crafanc', 'Andarch Crafanc', '1679', '', 'Haus Gwialen', {
      notes: 'Die Crafanc-Quelle schreibt Amdarch; Partnerkarte und ausgearbeitete Gwialen-Gegenakte belegen Andarch.'
    }),
    person('artgal-crafanc', 'Artgal Crafanc', 'male', '1680', ''),
    spouse('ffion-cwningod', 'Ffion Cwningod', 'female', '1676', '1736', 'house-cwningod'),
    spouse('gereint-gwialen', 'Gereint Gwialen', 'male', '1676', '', 'house-gwialen'),
    spouse('jowna-1681-mochdaer', 'Jowna Mochdaer', 'female', '1681', '1738', 'house-mochdaer-gwyliau'),

    awayWoman('glaw-crafanc', 'Glaw Crafanc', '1693', '', 'Haus Dianc'),
    awayWoman('glinda-crafanc', 'Glinda Crafanc', '1693', '', 'Haus Pawen'),
    person('melwas-crafanc', 'Melwas Crafanc', 'male', '1696', '', {
      title: 'Erster Erbe des Hauses Crafanc'
    }),
    awayWoman('glynis-crafanc', 'Glynis Crafanc', '1697', '', 'Haus Blaidd'),
    awayWoman('glesni-crafanc', 'Glesni Crafanc', '1697', '', 'Haus Arfordir'),
    spouse('gingalain-dianc', 'Gingalain Dianc', 'male', '1694', '', 'house-dianc'),
    spouse('amaethon-pawen', 'Amaethon Pawen', 'male', '1695', '', 'house-pawen'),
    spouse('olwen-arth', 'Olwen Arth', 'female', '1697', '', 'house-arth'),
    spouse('tewdur-blaidd', 'Tewdur Blaidd', 'male', '1697', '', 'house-blaidd'),
    spouse('madoc-arfordir', 'Madoc Arfordir', 'male', '1700', '', 'house-arfordir'),

    person('tutagual-crafanc', 'Tutagual Crafanc', 'male', '1697', ''),
    person('arwen-1700-crafanc', 'Arwen Crafanc', 'female', '1700', '1720'),
    spouse('tegan-coedwig', 'Tegan Coedwig', 'female', '1698', '', 'house-coedwig'),

    person('iestyn-crafanc', 'Iestyn Crafanc', 'male', '1714', '', {
      title: 'Zweiter Erbe des Hauses Crafanc'
    }),
    person('gwenna-crafanc', 'Gwenna Crafanc', 'female', '1716', '', {
      familyRole: 'ward-away',
      title: 'Weggegebenes Mündel bei Haus Gafyr',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Gwenna bleibt leibliche Crafanc, wurde aber als Mündel in die Obhut Egon Gafyrs gegeben.'
    }),
    person('sadwyn-crafanc', 'Sadwyn Crafanc', 'male', '1723', '', {
      title: 'Dritter Erbe des Hauses Crafanc'
    }),
    person('eogan-crafanc', 'Eógan Crafanc', 'male', '1719', ''),
    person('arwen-1725-crafanc', 'Arwen Crafanc', 'female', '1725', '', {
      notes: 'Nicht mit der 1700 geborenen Arwen Crafanc zu verwechseln.'
    })
  ],
  partnerships: [
    createMarriage('marriage-artgal-amdarch', ...COUPLES.founders, {
      notes: 'Artgal Arth und Amdarch begründen gemeinsam das Kadettenhaus Crafanc.'
    }),
    createMarriage('marriage-caradoc-katelyn-crafanc', ...COUPLES.caradoc, { status: 'ended', end: '1652' }),
    createMarriage('marriage-cadoc-kerenza-pawen', ...COUPLES.kerenzaOlder, { status: 'ended', end: '1643' }),
    createMarriage('marriage-wenonah-cynwrig', ...COUPLES.cynwrig, { status: 'ended', end: '1647' }),
    createMarriage('marriage-nesta-taran-crafanc', ...COUPLES.nesta, { status: 'ended', end: '1672' }),
    createMarriage('marriage-kerenza-trachmyr-crafanc', ...COUPLES.kerenzaYounger, { status: 'ended', end: '1669' }),
    createMarriage('marriage-clinoch-ffraid-crafanc', ...COUPLES.clinoch, { status: 'ended', end: '1671' }),
    createMarriage('marriage-afanen-elisud', ...COUPLES.elisud, { status: 'ended', end: '1710' }),
    createMarriage('marriage-rhynnon-kyndra', ...COUPLES.kyndra, { status: 'ended', end: '1701' }),
    createMarriage('marriage-dumnagual-ffion-crafanc', ...COUPLES.dumnagual, { status: 'ended', end: '1718' }),
    createMarriage('marriage-andarch-gereint-gwialen', ...COUPLES.andarch),
    createMarriage('marriage-jowna-artgal-mochdaer', ...COUPLES.artgal, { status: 'ended', end: '1738' }),
    createMarriage('marriage-glaw-gingalain-crafanc', ...COUPLES.glaw),
    createMarriage('marriage-amaethon-glinda-pawen', ...COUPLES.glinda),
    createMarriage('marriage-olwen-melwas', ...COUPLES.melwas),
    createMarriage('marriage-glynis-tewdur-crafanc', ...COUPLES.glynis),
    createMarriage('marriage-glesni-madoc-crafanc', ...COUPLES.glesni),
    createMarriage('marriage-tutagual-tegan-coedwig', ...COUPLES.tutagual)
  ],
  parentages: [
    ...childrenOf(['caradoc-crafanc', 'kerenza-crafanc'], 'marriage-artgal-amdarch', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Caradoc und der älteren Kerenza.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['cynwrig-crafanc', 'nesta-crafanc', 'kerenza-1627-crafanc'], 'marriage-caradoc-katelyn-crafanc'),
    ...childrenOf(['clinoch-crafanc'], 'marriage-wenonah-cynwrig'),
    ...childrenOf(['elisud-crafanc', 'kyndra-crafanc'], 'marriage-clinoch-ffraid-crafanc'),
    ...childrenOf(['dumnagual-crafanc', 'andarch-crafanc', 'artgal-crafanc'], 'marriage-afanen-elisud'),
    ...childrenOf(['glaw-crafanc', 'glinda-crafanc', 'melwas-crafanc', 'glynis-crafanc', 'glesni-crafanc'], 'marriage-dumnagual-ffion-crafanc'),
    ...childrenOf(['tutagual-crafanc', 'arwen-1700-crafanc'], 'marriage-jowna-artgal-mochdaer'),
    ...childrenOf(['iestyn-crafanc', 'gwenna-crafanc', 'sadwyn-crafanc'], 'marriage-olwen-melwas'),
    ...childrenOf(['eogan-crafanc', 'arwen-1725-crafanc'], 'marriage-tutagual-tegan-coedwig')
  ],
  cadetBranches: [
    marriedAway('married-away-kerenza-crafanc-pawen', 'Haus Pawen', 'marriage-cadoc-kerenza-pawen', 'house-pawen', 'haus-pawen', HOUSE_EMBLEMS.pawen),
    marriedAway('married-away-nesta-crafanc-walwrs', 'Haus Walwrs', 'marriage-nesta-taran-crafanc', 'house-walwrs', 'haus-walwrs-caer-deheuol', HOUSE_EMBLEMS.walwrs),
    marriedAway('married-away-kerenza-1627-crafanc-unigol', 'Haus Unigol', 'marriage-kerenza-trachmyr-crafanc', 'house-unigol', 'haus-unigol', HOUSE_EMBLEMS.unigol),
    createCadetHouseBranch({
      id: 'cadet-eirth-kyndra-crafanc',
      name: 'Haus Eirth',
      parentPartnershipId: 'marriage-rhynnon-kyndra',
      houseId: 'house-eirth',
      targetFamilyId: 'haus-eirth',
      emblem: HOUSE_EMBLEMS.eirth,
      subtitle: 'Von Rhynnon Arth und Kyndra Crafanc begründetes Kadettenhaus',
      extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
    }),
    marriedAway('married-away-andarch-crafanc-gwialen', 'Haus Gwialen', 'marriage-andarch-gereint-gwialen', 'house-gwialen', 'haus-gwialen', HOUSE_EMBLEMS.gwialen),
    marriedAway('married-away-glaw-crafanc-dianc', 'Haus Dianc', 'marriage-glaw-gingalain-crafanc', 'house-dianc', 'haus-dianc-aberdail', HOUSE_EMBLEMS.dianc),
    marriedAway('married-away-glinda-crafanc-pawen', 'Haus Pawen', 'marriage-amaethon-glinda-pawen', 'house-pawen', 'haus-pawen', HOUSE_EMBLEMS.pawen),
    marriedAway('married-away-glynis-crafanc-blaidd', 'Haus Blaidd', 'marriage-glynis-tewdur-crafanc', 'house-blaidd', 'haus-blaidd-tredegar', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-glesni-crafanc-arfordir', 'Haus Arfordir', 'marriage-glesni-madoc-crafanc', 'house-arfordir', 'haus-arfordir-aberdail', HOUSE_EMBLEMS.arfordir),
    createWardAwayBranch({
      id: 'ward-away-gwenna-crafanc-gafyr',
      name: 'Haus Gafyr',
      parentPersonId: 'gwenna-crafanc',
      houseId: 'house-gafyr',
      targetFamilyId: 'haus-gafyr',
      emblem: HOUSE_EMBLEMS.gafyr,
      crestFrame: 'gold',
      notes: 'Gwenna Crafanc wurde als Mündel an Egon Gafyr vermittelt.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-artgal-amdarch',
      parentPersonId: '',
      childIds: ['caradoc-crafanc', 'kerenza-crafanc'],
      years: 0,
      fromYear: '????',
      toYear: '1590',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach Caradoc und die ältere Kerenza.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-artgal-amdarch',
    houseId: CRAFANC_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Talgarth · Zweites Kadettenhaus der Arth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'artgal-arth',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceFamilyId: 'haus-arth',
    sourcePartnershipId: 'marriage-artgal-amdarch',
    sourceModule: "Haus Crafanc O'Talgarth (bereitgestellte Altdaten)",
    sourceNote: 'Artgal Arth und Amdarch begründen Haus Crafanc. Der Hausknoten und genau ein serieller Zeitsprung stehen vor Caradoc und der älteren Kerenza. Kyndra und Rhynnon Arth begründen direkt Haus Eirth. Die ältere Kerenza, Nesta, die jüngere Kerenza, Andarch, Glaw, Glinda, Glynis und Glesni führen mit geraden Zielhausknoten in ihre jeweiligen Gegenhäuser; deren Kinder bleiben ausschließlich dort. Gwenna bleibt biologischer Crafanc-Spross, trägt als weggegebenes Mündel den dunkelblauen Rahmen und besitzt einen direkten Vermittlungsknoten zu Haus Gafyr. Gegenakten haben bei Widersprüchen Vorrang: die ältere Kerenza lebt 1596–1643, Elisud wird 1661 geboren, Kyndra 1655 und Andarch ist die Ehefrau Gereint Gwialens. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
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
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
