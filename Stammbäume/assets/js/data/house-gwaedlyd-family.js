import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createSingleFounderHouseBranch
} from './family-record-builders.js';
import {
  GRAUE_WEITE_HOUSE_EMBLEMS,
  GRAUE_WEITE_HOUSE_PROFILES,
  GRAUE_WEITE_ORIGIN_HOUSE_PROFILES
} from './graue-weite-house-profiles.js';
import { HOUSE_GWAEDLYD_PORTRAITS } from './house-gwaedlyd-portraits.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';

const CAER_GORWEL_HOUSE_ID = 'house-gwaedlyd';
const TREDEGAR_HOUSE_ID = 'house-gwaedlyd-tredegar';
const GWAEDLYD_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd;

const HOUSE_EMBLEMS = Object.freeze({
  arfordir: KLAUENINSEL_HOUSE_EMBLEMS.arfordir,
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  gwaedlyd: GWAEDLYD_EMBLEM,
  llyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil
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

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'gronw-gwaedlyd': 'person--haus-gwaedlyd-tredegar--gronw-gwaedlyd',
  'morcant-gwaedlyd': 'person--haus-gwaedlyd-tredegar--morcant-gwaedlyd',
  'uthyr-gwaedlyd': 'person--haus-gwaedlyd-tredegar--uthyr-gwaedlyd',
  'rhondda-gwaedlyd': 'person--haus-gwaedlyd-tredegar--rhondda-gwaedlyd'
});

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || SHARED_WORLD_PERSON_IDS[id] || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GWAEDLYD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
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

function originPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(CAER_GORWEL_HOUSE_ID, id, name, sex, birth, death, options);
}

function tredegarPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TREDEGAR_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'gwaedlyd-parentage',
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
    crestFrame: 'gold',
    subtitle: `Wegverheiratet an ${name}`
  });
}

const ORIGIN_HOUSES = Object.freeze([
  house(CAER_GORWEL_HOUSE_ID, "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd),
  house(TREDEGAR_HOUSE_ID, "Haus Gwaedlyd O'Tredegar", HOUSE_EMBLEMS.gwaedlyd),
  house('house-walwrs', 'Haus Walwrs'),
  house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn"),
  house('house-culloch', 'Haus Culloch'),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-morgryn', 'Haus Morgryn'),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-arfordir', "Haus Arfordir O'Serenlyn", HOUSE_EMBLEMS.arfordir),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
  house('house-diafol', 'Haus Diafol'),
  house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
  house('house-llyfant', 'Haus Llyfant', HOUSE_EMBLEMS.llyfant)
]);

const TREDEGAR_HOUSES = Object.freeze([
  house(TREDEGAR_HOUSE_ID, "Haus Gwaedlyd O'Tredegar", HOUSE_EMBLEMS.gwaedlyd),
  house(CAER_GORWEL_HOUSE_ID, "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-morgryn', 'Haus Morgryn'),
  house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
  house('house-diafol', 'Haus Diafol'),
  house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
  house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig)
]);

export const HOUSE_GWAEDLYD_CAER_GORWEL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwaedlyd',
    title: "Haus Gwaedlyd O'Caer Gorwel",
    motto: 'Gwaed ac eurogrwydd · Blut und Schuld',
    description: 'Vollständige vennyrianische Herkunftslinie des Ritterfürstenhauses von Caer Gorwel bis zu seinem Untergang und dem Neubeginn in Tredegar.',
    emblem: GWAEDLYD_EMBLEM,
    houseProfile: GRAUE_WEITE_ORIGIN_HOUSE_PROFILES['gwaedlyd-caer-gorwel']
  },
  houses: [...ORIGIN_HOUSES],
  persons: [
    originPerson('unknown-father-gwaedlyd', '???', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Unbekannter Vater Agravaines'
    }),
    originPerson('unknown-mother-gwaedlyd', '???', 'female', '????', '????', {
      familyRole: 'founder',
      title: 'Unbekannte Mutter Agravaines'
    }),
    originPerson('agravaine-gwaedlyd', 'Agravaine Gwaedlyd', 'male', '????', '????', {
      lineageRole: 'head',
      title: 'Der Hai · Gründer und erster Herr von Caer Gorwel'
    }),
    originPerson('unknown-wife-agravaine-gwaedlyd', '???', 'female', '????', '????', {
      familyRole: 'married',
      title: 'Unbekannte Ehefrau Agravaines',
      notes: 'Die Altquelle wiederholt an dieser Stelle irrtümlich Agravaines Namen; die Ehefrau bleibt daher neutral unbekannt.'
    }),

    originPerson('ywain-gwaedlyd', 'Ywain Gwaedlyd', 'male', '1629', '1700', {
      lineageRole: 'head',
      title: 'Ritterfürst von Caer Gorwel'
    }),
    originPerson('gwendolen-walwrs', 'Gwendolen Walwrs', 'female', '1633', '1685', {
      houseId: 'house-walwrs',
      familyRole: 'married'
    }),
    originPerson('meeghan-gwaedlyd', 'Meeghan Gwaedlyd', 'female', '1622', '1670', {
      title: 'Wegverheiratet an Haus Trachwyll',
      tags: ['Wegverheiratet'],
      notes: 'Die Altquelle nennt unmöglich 1722–1770. Genealogische Position und Ehepartner Bethwyn (1623–1654) ergeben 1622–1670.'
    }),
    originPerson('bethwyn-trachwyll', 'Bethwyn Trachwyll', 'male', '1623', '1654', {
      houseId: 'house-trachwyll-talfronwyn',
      familyRole: 'married'
    }),

    originPerson('merfyn-gwaedlyd', 'Merfyn Gwaedlyd', 'male', '1650', '1718', {
      lineageRole: 'head',
      title: 'Ritterfürst von Caer Gorwel 1700–1718'
    }),
    originPerson('morag-culloch', 'Morag Culloch', 'female', '1652', '1720', {
      houseId: 'house-culloch',
      familyRole: 'married'
    }),
    originPerson('bettrys-gwaedlyd', 'Bettrys Gwaedlyd', 'female', '1652', '1702', {
      title: 'Wegverheiratet an Haus Blodyn',
      tags: ['Wegverheiratet']
    }),
    originPerson('tathal-blodyn', 'Tathal Blodyn', 'male', '1652', '1708', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    originPerson('cawrdaf-gwaedlyd', 'Cawrdaf Gwaedlyd', 'male', '1654', '1720'),
    originPerson('aneira-morgryn', 'Aneira Morgryn', 'female', '????', '????', {
      houseId: 'house-morgryn',
      familyRole: 'married'
    }),

    originPerson('cadwgawn-gwaedlyd', 'Cadwgawn Gwaedlyd', 'male', '1672', '1720', {
      lineageRole: 'head',
      title: 'Ritterfürst von Caer Gorwel 1718–1720'
    }),
    originPerson('blodeuyn-gwenyen', 'Blodeuyn Gwenyen', 'female', '1674', '', {
      houseId: 'house-gwenyen',
      familyRole: 'married',
      title: 'Lady von Caer Gorwel · Überlebende der Blutschlacht'
    }),
    originPerson('arianrhod-gwaedlyd', 'Arianrhod Gwaedlyd', 'female', '1677', '', {
      title: 'Wegverheiratet an Haus Arfordir',
      tags: ['Wegverheiratet']
    }),
    originPerson('luc-arfordir', 'Luc Arfordir', 'male', '1677', '', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),
    originPerson('bedros-gwaedlyd', 'Bedros Gwaedlyd', 'male', '1672', '1720'),
    originPerson('eilun-bochdew', 'Eilun Bochdew', 'female', '1675', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),

    originPerson('gronw-gwaedlyd', 'Gronw Gwaedlyd', 'male', '1692', '', {
      lineageRole: 'head',
      title: 'Begründer der Tredegar-Linie',
      notes: 'Geschichte und Stammbaum nennen ihn durchgehend Gronw; das einzelne „Gonw“ der Hierarchietabelle ist ein Quellfehler.'
    }),
    originPerson('caraf-morfil', 'Caraf Morfil', 'female', '1697', '', {
      houseId: 'house-morfil',
      familyRole: 'married'
    }),
    originPerson('morcant-gwaedlyd', 'Morcant Gwaedlyd', 'male', '1694', ''),
    originPerson('tryffin-diafol', 'Tryffin Diafol', 'female', '1692', '', {
      houseId: 'house-diafol',
      familyRole: 'married'
    }),
    originPerson('uthyr-gwaedlyd', 'Uthyr Gwaedlyd', 'male', '1696', ''),
    originPerson('briallen-draenog', 'Briallen Draenog', 'female', '1698', '', {
      houseId: 'house-draenog',
      familyRole: 'married'
    }),
    originPerson('iltud-gwaedlyd', 'Iltud Gwaedlyd', 'male', '1690', '1720', {
      notes: 'Gefallen beim Untergang von Caer Gorwel.'
    }),
    originPerson('gwenifer-morgryn', 'Gwenifer Morgryn', 'female', '1693', '1720', {
      houseId: 'house-morgryn',
      familyRole: 'married'
    }),
    originPerson('uryen-gwaedlyd', 'Uryen Gwaedlyd', 'male', '1692', '1720', {
      notes: 'Gefallen beim Untergang von Caer Gorwel.'
    }),
    originPerson('frewi-llyfant', 'Frewi Llyfant', 'female', '1698', '1720', {
      houseId: 'house-llyfant',
      familyRole: 'married'
    }),

    originPerson('rhondda-gwaedlyd', 'Rhondda Gwaedlyd', 'female', '1714', '', {
      title: 'Junge Überlebende der Blutschlacht'
    }),
    originPerson('twm-gwaedlyd', 'Twm Gwaedlyd', 'male', '1715', '1720', {
      notes: 'Die Quelle markiert ihn als verstorben; nach der Familiengeschichte fiel er wie alle nicht genannten Überlebenden beim Untergang von Caer Gorwel.'
    }),
    originPerson('tre-gwaedlyd', 'Tre Gwaedlyd', 'male', '1715', '1720', {
      notes: 'Die Quelle markiert ihn als verstorben; nach der Familiengeschichte fiel er wie alle nicht genannten Überlebenden beim Untergang von Caer Gorwel.'
    })
  ],
  partnerships: [
    endedMarriage('marriage-unknown-founders-gwaedlyd', 'unknown-father-gwaedlyd', 'unknown-mother-gwaedlyd'),
    endedMarriage('marriage-agravaine-unknown-gwaedlyd', 'agravaine-gwaedlyd', 'unknown-wife-agravaine-gwaedlyd'),
    endedMarriage('marriage-ywain-gwendolen-gwaedlyd', 'ywain-gwaedlyd', 'gwendolen-walwrs', '1685'),
    endedMarriage('marriage-meeghan-bethwyn-gwaedlyd', 'meeghan-gwaedlyd', 'bethwyn-trachwyll', '1654'),
    endedMarriage('marriage-merfyn-morag-gwaedlyd', 'merfyn-gwaedlyd', 'morag-culloch', '1718'),
    endedMarriage('marriage-tathal-bettrys', 'tathal-blodyn', 'bettrys-gwaedlyd', '1702'),
    endedMarriage('marriage-cawrdaf-aneira-gwaedlyd', 'cawrdaf-gwaedlyd', 'aneira-morgryn', '1720'),
    endedMarriage('marriage-cadwgawn-blodeuyn-gwaedlyd', 'cadwgawn-gwaedlyd', 'blodeuyn-gwenyen', '1720'),
    createMarriage('marriage-arianrhod-luc-arfordir', 'arianrhod-gwaedlyd', 'luc-arfordir'),
    endedMarriage('marriage-bedros-eilun-gwaedlyd', 'bedros-gwaedlyd', 'eilun-bochdew', '1720'),
    createMarriage('marriage-gronw-caraf-morfil', 'gronw-gwaedlyd', 'caraf-morfil'),
    createMarriage('marriage-morcant-tryffin-gwaedlyd', 'morcant-gwaedlyd', 'tryffin-diafol'),
    createMarriage('marriage-briallen-uthyr-draenog', 'briallen-draenog', 'uthyr-gwaedlyd'),
    endedMarriage('marriage-iltud-gwenifer-gwaedlyd', 'iltud-gwaedlyd', 'gwenifer-morgryn', '1720'),
    endedMarriage('marriage-uryen-frewi-gwaedlyd', 'uryen-gwaedlyd', 'frewi-llyfant', '1720')
  ],
  parentages: [
    ...childrenOf(['agravaine-gwaedlyd'], ['unknown-father-gwaedlyd', 'unknown-mother-gwaedlyd'], 'marriage-unknown-founders-gwaedlyd'),
    ...childrenOf(['ywain-gwaedlyd', 'meeghan-gwaedlyd'], ['agravaine-gwaedlyd', 'unknown-wife-agravaine-gwaedlyd'], 'marriage-agravaine-unknown-gwaedlyd', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Agravaine und der 1629 wieder einsetzenden Linie sind nicht einzeln benannte Generationen markiert.'
    }),
    ...childrenOf(['merfyn-gwaedlyd', 'bettrys-gwaedlyd', 'cawrdaf-gwaedlyd'], ['ywain-gwaedlyd', 'gwendolen-walwrs'], 'marriage-ywain-gwendolen-gwaedlyd'),
    ...childrenOf(['cadwgawn-gwaedlyd', 'arianrhod-gwaedlyd'], ['merfyn-gwaedlyd', 'morag-culloch'], 'marriage-merfyn-morag-gwaedlyd'),
    ...childrenOf(['bedros-gwaedlyd'], ['cawrdaf-gwaedlyd', 'aneira-morgryn'], 'marriage-cawrdaf-aneira-gwaedlyd'),
    ...childrenOf(['gronw-gwaedlyd', 'morcant-gwaedlyd', 'uthyr-gwaedlyd'], ['cadwgawn-gwaedlyd', 'blodeuyn-gwenyen'], 'marriage-cadwgawn-blodeuyn-gwaedlyd'),
    ...childrenOf(['iltud-gwaedlyd', 'uryen-gwaedlyd'], ['bedros-gwaedlyd', 'eilun-bochdew'], 'marriage-bedros-eilun-gwaedlyd'),
    ...childrenOf(['rhondda-gwaedlyd'], ['iltud-gwaedlyd', 'gwenifer-morgryn'], 'marriage-iltud-gwenifer-gwaedlyd'),
    ...childrenOf(['twm-gwaedlyd', 'tre-gwaedlyd'], ['uryen-gwaedlyd', 'frewi-llyfant'], 'marriage-uryen-frewi-gwaedlyd')
  ],
  cadetBranches: [
    marriedAway('married-away-meeghan-gwaedlyd-trachwyll', "Haus Trachwyll O'Talfronwyn", 'marriage-meeghan-bethwyn-gwaedlyd', 'house-trachwyll-talfronwyn', 'haus-trachwyll-talfronwyn'),
    marriedAway('married-away-bettrys-gwaedlyd-blodyn', 'Haus Blodyn', 'marriage-tathal-bettrys', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-arianrhod-gwaedlyd-arfordir', "Haus Arfordir O'Aberdail", 'marriage-arianrhod-luc-arfordir', 'house-arfordir', 'haus-arfordir-aberdail', HOUSE_EMBLEMS.arfordir),
    createSingleFounderHouseBranch({
      id: 'migration-gronw-gwaedlyd-tredegar',
      name: "Haus Gwaedlyd O'Tredegar",
      parentPersonId: 'gronw-gwaedlyd',
      houseId: TREDEGAR_HOUSE_ID,
      targetFamilyId: 'haus-gwaedlyd-tredegar',
      emblem: GWAEDLYD_EMBLEM,
      founded: '1720',
      subtitle: 'Von Gronw geführte neue Ritterfürstenlinie in Tredegar',
      crestFrame: 'gold',
      notes: 'Der Übergang hängt allein und geradlinig unter Gronw. Alle ausdrücklich genannten Überlebenden werden in der Zielakte mitgeführt; Nachkommen nach 1720 erscheinen nur dort.'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-agravaine-unknown-gwaedlyd',
    houseId: CAER_GORWEL_HOUSE_ID,
    crestSubtitle: 'Altes Ritterfürstenhaus von Caer Gorwel',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1629',
      label: 'Die belegte Linie setzt 1629 mit Ywain und Meeghan wieder ein'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-gwaedlyd',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-gwaedlyd-tredegar',
    sourceRevision: 1,
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'timeGap'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Vollständige Herkunftsakte nach der Gwaedlyd-Quelle. Agravaine und seine unbekannte Ehefrau tragen Wappen und seriellen Zeitsprung. Sämtliche benannten historischen Zweige bleiben sichtbar. Die neue Tredegar-Akte beginnt bei Gronw und führt Blodeuyn, Gronw, Morcant, Uthyr und Rhondda als ausdrücklich genannten Überlebendenkreis mit; Arianrhod bleibt als bereits wegverheiratete Frau in ihrer Herkunftsbeziehung.'
  }
});

export const HOUSE_GWAEDLYD_TREDEGAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwaedlyd-tredegar',
    title: "Haus Gwaedlyd O'Tredegar",
    motto: 'Gwaed ac eurogrwydd · Blut und Schuld',
    description: 'Die seit 1720 von Gronw geführte neue Ritterfürstenlinie in Tredegar mit sämtlichen Überlebenden von Caer Gorwel und ihren nach der Flucht geborenen Nachkommen.',
    emblem: GWAEDLYD_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.gwaedlyd
  },
  houses: [...TREDEGAR_HOUSES],
  persons: [
    tredegarPerson('cadwgawn-gwaedlyd', 'Cadwgawn Gwaedlyd', 'male', '1672', '1720', {
      houseId: CAER_GORWEL_HOUSE_ID,
      familyRole: 'core',
      title: 'Letzter Ritterfürst von Caer Gorwel · Vater der Tredegar-Gründer'
    }),
    tredegarPerson('blodeuyn-gwenyen', 'Blodeuyn Gwenyen', 'female', '1674', '', {
      houseId: 'house-gwenyen',
      familyRole: 'married',
      title: 'Lady von Caer Gorwel · Überlebende der Blutschlacht'
    }),
    tredegarPerson('iltud-gwaedlyd', 'Iltud Gwaedlyd', 'male', '1690', '1720', {
      houseId: CAER_GORWEL_HOUSE_ID,
      familyRole: 'core',
      title: 'Vater Rhonddas · gefallen beim Untergang von Caer Gorwel'
    }),
    tredegarPerson('gwenifer-morgryn', 'Gwenifer Morgryn', 'female', '1693', '1720', {
      houseId: 'house-morgryn',
      familyRole: 'married',
      title: 'Mutter Rhonddas'
    }),
    tredegarPerson('gronw-gwaedlyd', 'Gronw Gwaedlyd', 'male', '1692', '', {
      lineageRole: 'head',
      title: 'Ritterfürst von Tredegar seit 1720',
      notes: 'Geschichte und Stammbaum nennen ihn durchgehend Gronw; das einzelne „Gonw“ der Hierarchietabelle ist ein Quellfehler.'
    }),
    tredegarPerson('caraf-morfil', 'Caraf Morfil', 'female', '1697', '', {
      houseId: 'house-morfil',
      familyRole: 'married'
    }),
    tredegarPerson('morcant-gwaedlyd', 'Morcant Gwaedlyd', 'male', '1694', ''),
    tredegarPerson('tryffin-diafol', 'Tryffin Diafol', 'female', '1692', '', {
      houseId: 'house-diafol',
      familyRole: 'married'
    }),
    tredegarPerson('uthyr-gwaedlyd', 'Uthyr Gwaedlyd', 'male', '1696', ''),
    tredegarPerson('briallen-draenog', 'Briallen Draenog', 'female', '1698', '', {
      houseId: 'house-draenog',
      familyRole: 'married'
    }),
    tredegarPerson('rhondda-gwaedlyd', 'Rhondda Gwaedlyd', 'female', '1714', '', {
      title: 'Junge Überlebende der Blutschlacht'
    }),
    tredegarPerson('talan-gwaedlyd', 'Talan Gwaedlyd', 'male', '1721', '', {
      lineageRole: 'mainline',
      title: 'Erster Erbe des Hauses Gwaedlyd'
    }),
    tredegarPerson('tud-gwaedlyd', 'Tud Gwaedlyd', 'male', '1729', '', {
      title: 'Zweiter Erbe des Hauses Gwaedlyd'
    }),
    tredegarPerson('tref-gwaedlyd', 'Tref Gwaedlyd', 'male', '1723', ''),
    tredegarPerson('alys-gwaedlyd', 'Alys Gwaedlyd', 'female', '1731', ''),
    tredegarPerson('zara-coedwig', 'Zara Coedwig', 'female', '1719', '', {
      houseId: 'house-coedwig',
      familyRole: 'married',
      title: 'Verlobte Talans'
    })
  ],
  partnerships: [
    endedMarriage('marriage-cadwgawn-blodeuyn-gwaedlyd', 'cadwgawn-gwaedlyd', 'blodeuyn-gwenyen', '1720'),
    endedMarriage('marriage-iltud-gwenifer-gwaedlyd', 'iltud-gwaedlyd', 'gwenifer-morgryn', '1720'),
    createMarriage('marriage-gronw-caraf-morfil', 'gronw-gwaedlyd', 'caraf-morfil'),
    createMarriage('marriage-morcant-tryffin-gwaedlyd', 'morcant-gwaedlyd', 'tryffin-diafol'),
    createMarriage('marriage-briallen-uthyr-draenog', 'briallen-draenog', 'uthyr-gwaedlyd'),
    createMarriage('engagement-talan-zara-gwaedlyd', 'talan-gwaedlyd', 'zara-coedwig', { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['gronw-gwaedlyd', 'morcant-gwaedlyd', 'uthyr-gwaedlyd'], ['cadwgawn-gwaedlyd', 'blodeuyn-gwenyen'], 'marriage-cadwgawn-blodeuyn-gwaedlyd'),
    ...childrenOf(['rhondda-gwaedlyd'], ['iltud-gwaedlyd', 'gwenifer-morgryn'], 'marriage-iltud-gwenifer-gwaedlyd'),
    ...childrenOf(['talan-gwaedlyd', 'tud-gwaedlyd'], ['gronw-gwaedlyd', 'caraf-morfil'], 'marriage-gronw-caraf-morfil'),
    ...childrenOf(['tref-gwaedlyd', 'alys-gwaedlyd'], ['briallen-draenog', 'uthyr-gwaedlyd'], 'marriage-briallen-uthyr-draenog')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: '',
    houseId: TREDEGAR_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Tredegar · seit 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'gwaedlyd-caer-gorwel-origin',
      houseId: CAER_GORWEL_HOUSE_ID,
      name: "Haus Gwaedlyd O'Caer Gorwel",
      subtitle: 'Herkunftslinie aus Vennyr · Überlebende von Caer Gorwel',
      emblem: GWAEDLYD_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['cadwgawn-gwaedlyd', 'iltud-gwaedlyd'],
      targetFamilyId: 'haus-gwaedlyd',
      notes: 'Der Ursprungsknoten führt die beiden notwendigen Elternanker aus Caer Gorwel ein. Blodeuyn steht als Cadwgawns Ehefrau und Mutter über Gronw, Morcant und Uthyr; Rhondda steht unter Iltud und Gwenifer. Dadurch bleibt der gesamte Überlebendenkreis genealogisch korrekt, statt auf einer falschen gemeinsamen Generation zu stehen.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'cadwgawn-gwaedlyd',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-gwaedlyd',
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Tredegar-Akte mit Gronw als Begründer der neuen Linie. Cadwgawn und Blodeuyn stehen als Eltern über Gronw, Morcant und Uthyr. Rhondda wird unter ihren verstorbenen Eltern Iltud und Gwenifer geführt; die beiden Toten sind ausschließlich als notwendige genealogische Anker enthalten und gehören nicht zum Überlebendenkreis. Caraf, Tryffin und Briallen erscheinen als lebende Ehepartner. Erst nach der Flucht geborene Kinder werden ausschließlich hier fortgeführt. Talan ist nach der neuen Gwaedlyd-Quelle mit Zara Coedwig verlobt; die alte widersprüchliche Zuordnung zu Talan Créyr wurde in beiden Gegenakten aufgehoben.'
  }
});
