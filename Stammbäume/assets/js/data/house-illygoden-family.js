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
import { HOUSE_ILLYGODEN_PORTRAITS } from './house-illygoden-portraits.js';

const TIRWEDD_HOUSE_ID = 'house-illygoden';
const TREDEGAR_HOUSE_ID = 'house-illygoden-tredegar';
const ILLYGODEN_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.illygoden;
const SECOND_TIME_JUMP_ID = 'gap-powell-macsen-to-taliesin-sulwen-illygoden';

const HOUSE_EMBLEMS = Object.freeze({
  illygoden: ILLYGODEN_EMBLEM,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  wivern: GRAUE_WEITE_HOUSE_EMBLEMS.wivern
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
  'powell-illygoden': 'person--haus-illygoden--powell-illygoden',
  'quendolin-blaidd': 'person--haus-blaidd--quendolin-blaidd',
  'taliesin-illygoden': 'person--haus-illygoden--taliesin-illygoden',
  'braith-blaidd': 'person--haus-blaidd--braith-blaidd',
  'corryn-illygoden': 'person--haus-illygoden--corryn-illygoden',
  'diafol-blodyn': 'person--haus-blodyn--diafol-blodyn',
  'bleddyn-illygoden': 'person--haus-illygoden-tredegar--bleddyn-illygoden',
  'gwen-gwialen': 'person--haus-gwialen--gwen-gwialen',
  'valmai-bochdew': 'person--haus-bochdew--valmai-bochdew',
  'emrys-bochdew': 'person--haus-bochdew--emrys-bochdew',
  'meredydd-illygoden': 'person--haus-illygoden-tredegar--meredydd-illygoden',
  'adda-drewi': 'person--haus-drewi--adda-drewi',
  'maxen-illygoden': 'person--haus-illygoden-tredegar--maxen-illygoden',
  'fflur-blaidd': 'person--haus-blaidd-tredegar--fflur-blaidd',
  'dolena-illygoden': 'person--haus-illygoden-tredegar--dolena-illygoden',
  'zachariah-coedwig': 'person--haus-coedwig--zachariah-coedwig',
  'faelan-illygoden': 'person--haus-illygoden-tredegar--faelan-illygoden',
  'gwydion-draenog': 'person--haus-draenog--gwydion-draenog',
  'kevern-illygoden': 'person--haus-illygoden-tredegar--kevern-illygoden',
  'nolwenn-wivern': 'person--haus-wivern--nolwenn-wivern'
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
    portrait: HOUSE_ILLYGODEN_PORTRAITS[id] || '',
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

function tirweddPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TIRWEDD_HOUSE_ID, id, name, sex, birth, death, options);
}

function tredegarPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TREDEGAR_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function alignPartnerOverChildren(partnership, partnerPersonId) {
  return {
    ...partnership,
    extensions: {
      ...partnership.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId
    }
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'illygoden-parentage',
    ...options
  });
}

function gapChildren(childIds, parentIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, parentIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Zwischen den benannten Generationen sind in der Quelle nicht einzeln überlieferte Vorfahren markiert.',
    extensions: { timeJumpId }
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

const TIRWEDD_HOUSES = Object.freeze([
  house(TIRWEDD_HOUSE_ID, "Haus Illygoden O'Tirwedd", HOUSE_EMBLEMS.illygoden),
  house(TREDEGAR_HOUSE_ID, "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden),
  house('house-blaidd', "Haus Blaidd O'Branon", HOUSE_EMBLEMS.blaidd),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-dianc', 'Haus Dianc'),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-trachwyll', 'Haus Trachwyll'),
  house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-culloch', 'Haus Culloch'),
  house('house-drewi', 'Haus Drewi')
]);

const TREDEGAR_HOUSES = Object.freeze([
  house(TREDEGAR_HOUSE_ID, "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden),
  house(TIRWEDD_HOUSE_ID, "Haus Illygoden O'Tirwedd", HOUSE_EMBLEMS.illygoden),
  house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-drewi', 'Haus Drewi'),
  house('house-blaidd-tredegar', "Haus Blaidd O'Tredegar", HOUSE_EMBLEMS.blaidd),
  house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
  house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
  house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern)
]);

export const HOUSE_ILLYGODEN_TIRWEDD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-illygoden',
    title: "Haus Illygoden O'Tirwedd",
    motto: 'An Mut muss man sich nicht erinnern, denn er wird nie vergessen.',
    description: 'Alte vennyrianische Baronslinie von Tirwedd. Die Akte endet bei den 1720 nach Tredegar überführten Familienzweigen und führt deren Nachkommen nicht doppelt fort.',
    emblem: ILLYGODEN_EMBLEM,
    houseProfile: GRAUE_WEITE_ORIGIN_HOUSE_PROFILES['illygoden-tirwedd']
  },
  houses: [...TIRWEDD_HOUSES],
  persons: [
    tirweddPerson('unknown-father-illygoden', '???', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Unbekannter Gründer des Hauses Illygoden'
    }),
    tirweddPerson('unknown-mother-illygoden', '???', 'female', '????', '????', {
      familyRole: 'founder',
      title: 'Unbekannte Mitgründerin des Hauses Illygoden'
    }),
    tirweddPerson('corryn-founder-illygoden', 'Corryn Illygoden', 'male', '????', '????', {
      title: 'Baron von Tirwedd',
      lineageRole: 'head'
    }),
    tirweddPerson('hafren-founder-illygoden', 'Hafren', 'female', '????', '????', {
      familyRole: 'married'
    }),

    tirweddPerson('powell-illygoden', 'Powell Illygoden', 'male', '????', '????'),
    tirweddPerson('quendolin-blaidd', 'Quendolin Blaidd', 'female', '????', '????', {
      houseId: 'house-blaidd',
      familyRole: 'married'
    }),
    tirweddPerson('macsen-illygoden', 'Macsen Illygoden', 'male', '????', '????'),
    tirweddPerson('siriol-illygoden', 'Siriol', 'female', '????', '????', {
      familyRole: 'married'
    }),

    tirweddPerson('taliesin-illygoden', 'Taliesin Illygoden', 'male', '1630', '1700', {
      title: 'Baron von Tirwedd',
      lineageRole: 'head'
    }),
    tirweddPerson('braith-blaidd', 'Braith Blaidd', 'female', '1635', '1705', {
      houseId: 'house-blaidd',
      familyRole: 'married'
    }),
    tirweddPerson('sulwen-illygoden', 'Sulwen Illygoden', 'female', '????', '????', {
      title: 'Wegverheiratet an Haus Trachwyll',
      tags: ['Wegverheiratet']
    }),
    tirweddPerson('griffudd-trachwyll', 'Griffudd Trachwyll', 'male', '????', '????', {
      houseId: 'house-trachwyll',
      familyRole: 'married'
    }),

    tirweddPerson('corryn-illygoden', 'Corryn Illygoden', 'female', '1648', '1714', {
      title: 'Baronin von Tirwedd 1700–1714',
      lineageRole: 'head'
    }),
    tirweddPerson('diafol-blodyn', 'Diafol Blodyn', 'male', '1653', '1671', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    tirweddPerson('wynne-illygoden', 'Wynne Illygoden', 'female', '1655', '1690', {
      title: 'Wegverheiratet an Haus Dianc',
      tags: ['Wegverheiratet']
    }),
    tirweddPerson('sywlch-dianc', 'Sywlch Dianc', 'male', '1655', '1720', {
      houseId: 'house-dianc',
      familyRole: 'married',
      notes: 'Das Todesjahr 1720 folgt der direkten Dianc-Herkunftsakte; die Ehe endet bereits 1690 mit Wynnes Tod.'
    }),
    tirweddPerson('griflet-illygoden', 'Griflet Illygoden', 'male', '1657', '1720'),
    tirweddPerson('delwen-gwenyen', 'Delwen Gwenyen', 'female', '1658', '1703', {
      houseId: 'house-gwenyen',
      familyRole: 'married'
    }),

    tirweddPerson('bleddyn-illygoden', 'Bleddyn Illygoden', 'male', '1672', '', {
      title: 'Baron von Tirwedd 1714–1720 · Begründer der Tredegar-Linie',
      lineageRole: 'head',
      notes: 'Bleddyn bleibt als Sohn Corryns und Diafols in der Herkunftsakte sichtbar. Seine Nachkommen werden ausschließlich in der verknüpften Tredegar-Akte geführt.'
    }),
    tirweddPerson('gwen-gwialen', 'Gwen Gwialen', 'female', '1677', '1700', {
      houseId: 'house-gwialen',
      familyRole: 'married',
      title: 'Erste Ehefrau Bleddyns'
    }),
    tirweddPerson('valmai-bochdew', 'Valmai Bochdew', 'female', '1688', '', {
      houseId: 'house-bochdew',
      familyRole: 'married',
      title: 'Zweite Ehefrau Bleddyns'
    }),
    tirweddPerson('gaynor-illygoden', 'Gaynor Illygoden', 'female', '1675', '1720', {
      title: 'Wegverheiratet an Haus Bochdew',
      tags: ['Wegverheiratet']
    }),
    tirweddPerson('emrys-bochdew', 'Emrys Bochdew', 'male', '1673', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    tirweddPerson('crystin-illygoden', 'Crystin Illygoden', 'female', '1674', '1720', {
      title: 'Wegverheiratet an Haus Culloch',
      tags: ['Wegverheiratet']
    }),
    tirweddPerson('darragh-culloch', 'Darragh Culloch', 'male', '1668', '', {
      houseId: 'house-culloch',
      familyRole: 'married'
    }),
    tirweddPerson('meredydd-illygoden', 'Meredydd Illygoden', 'male', '1676', '1720', {
      notes: 'Meredydd bleibt als Sohn Griflets und Delwens in der Herkunftsakte sichtbar. Seine Kinder und Kindeskinder werden ausschließlich in der Tredegar-Akte fortgeführt.'
    }),
    tirweddPerson('adda-drewi', 'Adda Drewi', 'female', '1676', '1720', {
      houseId: 'house-drewi',
      familyRole: 'married'
    })
  ],
  partnerships: [
    endedMarriage('marriage-unknown-founders-illygoden', 'unknown-father-illygoden', 'unknown-mother-illygoden'),
    endedMarriage('marriage-corryn-hafren-illygoden', 'corryn-founder-illygoden', 'hafren-founder-illygoden'),
    endedMarriage('marriage-quendolin-powell-blaidd', 'quendolin-blaidd', 'powell-illygoden'),
    endedMarriage('marriage-macsen-siriol-illygoden', 'macsen-illygoden', 'siriol-illygoden'),
    endedMarriage('marriage-braith-taliesin-blaidd', 'braith-blaidd', 'taliesin-illygoden', '1700'),
    endedMarriage('marriage-sulwen-griffudd-illygoden', 'sulwen-illygoden', 'griffudd-trachwyll'),
    endedMarriage('marriage-diafol-corryn', 'diafol-blodyn', 'corryn-illygoden', '1671'),
    endedMarriage('marriage-wynne-sywlch-illygoden', 'wynne-illygoden', 'sywlch-dianc', '1690'),
    endedMarriage('marriage-griflet-delwen-illygoden', 'griflet-illygoden', 'delwen-gwenyen', '1703'),
    endedMarriage('marriage-gwen-bleddyn-gwialen', 'gwen-gwialen', 'bleddyn-illygoden', '1700'),
    createMarriage('marriage-bleddyn-valmai-illygoden', 'bleddyn-illygoden', 'valmai-bochdew'),
    endedMarriage('marriage-gaynor-emrys-illygoden', 'gaynor-illygoden', 'emrys-bochdew', '1720'),
    endedMarriage('marriage-crystin-darragh-illygoden', 'crystin-illygoden', 'darragh-culloch', '1720'),
    endedMarriage('marriage-meredydd-adda-illygoden', 'meredydd-illygoden', 'adda-drewi', '1720')
  ],
  parentages: [
    ...childrenOf(['corryn-founder-illygoden'], ['unknown-father-illygoden', 'unknown-mother-illygoden'], 'marriage-unknown-founders-illygoden'),
    ...childrenOf(['powell-illygoden', 'macsen-illygoden'], ['corryn-founder-illygoden', 'hafren-founder-illygoden'], 'marriage-corryn-hafren-illygoden'),
    ...gapChildren(['taliesin-illygoden'], ['quendolin-blaidd', 'powell-illygoden'], 'marriage-quendolin-powell-blaidd', SECOND_TIME_JUMP_ID),
    ...gapChildren(['sulwen-illygoden'], ['macsen-illygoden', 'siriol-illygoden'], 'marriage-macsen-siriol-illygoden', SECOND_TIME_JUMP_ID),
    ...childrenOf(['corryn-illygoden', 'wynne-illygoden', 'griflet-illygoden'], ['braith-blaidd', 'taliesin-illygoden'], 'marriage-braith-taliesin-blaidd'),
    ...childrenOf(['bleddyn-illygoden', 'gaynor-illygoden'], ['diafol-blodyn', 'corryn-illygoden'], 'marriage-diafol-corryn'),
    ...childrenOf(['crystin-illygoden', 'meredydd-illygoden'], ['griflet-illygoden', 'delwen-gwenyen'], 'marriage-griflet-delwen-illygoden')
  ],
  cadetBranches: [
    marriedAway('married-away-sulwen-illygoden-trachwyll', 'Haus Trachwyll', 'marriage-sulwen-griffudd-illygoden', 'house-trachwyll', 'haus-trachwyll'),
    marriedAway('married-away-wynne-illygoden-dianc', 'Haus Dianc', 'marriage-wynne-sywlch-illygoden', 'house-dianc', 'haus-dianc'),
    marriedAway('married-away-gaynor-illygoden-bochdew', 'Haus Bochdew', 'marriage-gaynor-emrys-illygoden', 'house-bochdew', 'haus-bochdew'),
    marriedAway('married-away-crystin-illygoden-culloch', 'Haus Culloch', 'marriage-crystin-darragh-illygoden', 'house-culloch', 'haus-culloch'),
    createSingleFounderHouseBranch({
      id: 'migration-bleddyn-illygoden-tredegar',
      name: "Haus Illygoden O'Tredegar",
      parentPersonId: 'bleddyn-illygoden',
      houseId: TREDEGAR_HOUSE_ID,
      targetFamilyId: 'haus-illygoden-tredegar',
      emblem: ILLYGODEN_EMBLEM,
      founded: '1720',
      subtitle: 'Von Bleddyn geführte neue Ritterfürstenlinie in Tredegar',
      crestFrame: 'gold',
      notes: 'Der Übergangsknoten hängt ausdrücklich allein und geradlinig unter Bleddyn. Seine Ehefrauen sind keine Mitgründerinnen der neuen Hauslinie. Die Nachkommen beider Ehen sowie Meredydds überlebender Seitenzweig werden nur in der Zielakte fortgeführt.'
    }),
    createSingleFounderHouseBranch({
      id: 'migration-meredydd-illygoden-tredegar',
      name: "Haus Illygoden O'Tredegar",
      parentPersonId: 'meredydd-illygoden',
      houseId: TREDEGAR_HOUSE_ID,
      targetFamilyId: 'haus-illygoden-tredegar',
      emblem: ILLYGODEN_EMBLEM,
      founded: '1720',
      subtitle: 'Meredydds fortgeführter Seitenzweig in Tredegar',
      crestFrame: 'gold',
      notes: 'Auch Meredydds überlebender Seitenzweig führt geradlinig in die neue Tredegar-Akte. Der Knoten hängt allein unter Meredydd und erzeugt in Tirwedd keine zweite Nachkommenlinie.'
    })
  ],
  timeJumps: [
    {
      id: SECOND_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-quendolin-powell-blaidd',
      sharedParentPartnershipIds: ['marriage-macsen-siriol-illygoden'],
      childIds: ['taliesin-illygoden', 'sulwen-illygoden'],
      years: 0,
      fromYear: '????',
      toYear: '1630',
      label: 'Die belegten Linien setzen 1630 wieder ein',
      notes: 'Ein gemeinsamer serieller Zeitsprung verbindet beide Elternpaare mit ihren jeweiligen Nachkommen; es wird kein paralleler zweiter Sprungknoten erzeugt.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-corryn-hafren-illygoden',
    houseId: TIRWEDD_HOUSE_ID,
    crestSubtitle: 'Altes Baronshaus von Tirwedd',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Die Linie setzt später mit Powell und Macsen wieder ein'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-illygoden',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-illygoden-tredegar',
    sourceRevision: 5,
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Vollständige Herkunftsakte nach der bereitgestellten Illygoden-Tabelle: unbekanntes Elternpaar, Corryn und Hafren, erst danach der Hausknoten, zwei serielle Quellenlücken und sämtliche belegten Personen bis zur Fluchtgeneration. Bleddyn und Meredydd bleiben mit Eltern und Ehepartnern in Tirwedd sichtbar; ihre Nachkommen werden ausschließlich in der verknüpften Tredegar-Akte geführt. Je ein Übergabeknoten zur neuen Linie hängt allein und geradlinig unter Bleddyn beziehungsweise Meredydd. Sywlchs Todesjahr ist mit der direkten Dianc-Gegenakte auf 1720 synchronisiert; seine Ehe mit Wynne endet weiterhin 1690.'
  }
});

export const HOUSE_ILLYGODEN_TREDEGAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-illygoden-tredegar',
    title: "Haus Illygoden O'Tredegar",
    motto: 'An Mut muss man sich nicht erinnern, denn er wird nie vergessen.',
    description: 'Die seit 1720 von Bleddyn Illygoden geführte Ritterfürstenlinie von Tredegar. Sie enthält sowohl seine beiden klar getrennten Ehen als auch Meredydds fortgeführten Seitenzweig.',
    emblem: ILLYGODEN_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.illygoden
  },
  houses: [...TREDEGAR_HOUSES],
  persons: [
    tredegarPerson('bleddyn-illygoden', 'Bleddyn Illygoden', 'male', '1672', '', {
      title: 'Ritterfürst von Tredegar seit 1720',
      lineageRole: 'head',
      extensions: {
        chartCenterBetweenSpousePersonIds: ['gwen-gwialen', 'valmai-bochdew']
      }
    }),
    tredegarPerson('gwen-gwialen', 'Gwen Gwialen', 'female', '1677', '1700', {
      houseId: 'house-gwialen',
      familyRole: 'married',
      title: 'Erste Ehefrau Bleddyns'
    }),
    tredegarPerson('valmai-bochdew', 'Valmai Bochdew', 'female', '1688', '', {
      houseId: 'house-bochdew',
      familyRole: 'married',
      title: 'Zweite Ehefrau Bleddyns'
    }),
    tredegarPerson('meredydd-illygoden', 'Meredydd Illygoden', 'male', '1676', '1720', {
      title: 'Fortgeführter Seitenzweig aus Tirwedd'
    }),
    tredegarPerson('adda-drewi', 'Adda Drewi', 'female', '1676', '1720', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),

    tredegarPerson('maxen-illygoden', 'Maxen Illygoden', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Illygoden',
      lineageRole: 'mainline'
    }),
    tredegarPerson('fflur-blaidd', 'Fflur Blaidd', 'female', '1697', '', {
      houseId: 'house-blaidd-tredegar',
      familyRole: 'married',
      notes: 'Das offensichtlich fehlerhafte Geburtsjahr 1997 der Altquelle bleibt wie in der kanonischen Blaidd-Akte auf 1697 berichtigt.'
    }),
    tredegarPerson('dolena-illygoden', 'Dolena Illygoden', 'female', '1696', '', {
      title: 'Wegverheiratet an Haus Coedwig',
      tags: ['Wegverheiratet']
    }),
    tredegarPerson('zachariah-coedwig', 'Zachariah Coedwig', 'male', '1696', '', {
      houseId: 'house-coedwig',
      familyRole: 'married'
    }),
    tredegarPerson('gryn-illygoden', 'Gryn Illygoden', 'male', '1710', '', {
      lineageRole: 'mainline'
    }),
    tredegarPerson('afanen-bochdew', 'Afanen Bochdew', 'female', '1710', '', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),

    tredegarPerson('taredd-illygoden', 'Taredd Illygoden', 'male', '1694', ''),
    tredegarPerson('megan-bochdew', 'Megan Bochdew', 'female', '1698', '', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    tredegarPerson('faelan-illygoden', 'Faelan Illygoden', 'female', '1696', '', {
      title: 'Wegverheiratet an Haus Draenog',
      tags: ['Wegverheiratet']
    }),
    tredegarPerson('gwydion-draenog', 'Gwydion Draenog', 'male', '1698', '', {
      houseId: 'house-draenog',
      familyRole: 'married'
    }),
    tredegarPerson('kevern-illygoden', 'Kevern Illygoden', 'male', '1697', ''),
    tredegarPerson('nolwenn-wivern', 'Nolwenn Wivern', 'female', '1700', '', {
      houseId: 'house-wivern',
      familyRole: 'married'
    }),

    tredegarPerson('caryl-illygoden', 'Caryl Illygoden', 'male', '1721', ''),
    tredegarPerson('ifor-illygoden', 'Ifor Illygoden', 'male', '1723', ''),
    tredegarPerson('hafren-illygoden', 'Hafren Illygoden', 'female', '1715', ''),
    tredegarPerson('dewi-illygoden', 'Dewi Illygoden', 'male', '1732', ''),
    tredegarPerson('pryce-illygoden', 'Pryce Illygoden', 'male', '????', ''),
    tredegarPerson('meg-illygoden', 'Meg Illygoden', 'female', '????', ''),
    tredegarPerson('beth-illygoden', 'Beth Illygoden', 'female', '????', ''),
    tredegarPerson('nia-illygoden', 'Nia Illygoden', 'female', '????', '')
  ],
  partnerships: [
    alignPartnerOverChildren(
      endedMarriage('marriage-gwen-bleddyn-gwialen', 'gwen-gwialen', 'bleddyn-illygoden', '1700'),
      'gwen-gwialen'
    ),
    alignPartnerOverChildren(
      createMarriage('marriage-bleddyn-valmai-illygoden', 'bleddyn-illygoden', 'valmai-bochdew'),
      'valmai-bochdew'
    ),
    endedMarriage('marriage-meredydd-adda-illygoden', 'meredydd-illygoden', 'adda-drewi', '1720'),
    createMarriage('marriage-fflur-maxen-blaidd', 'fflur-blaidd', 'maxen-illygoden'),
    createMarriage('marriage-zachariah-dolena-coedwig', 'zachariah-coedwig', 'dolena-illygoden'),
    createMarriage('marriage-gryn-afanen-illygoden', 'gryn-illygoden', 'afanen-bochdew'),
    createMarriage('marriage-taredd-megan-illygoden', 'taredd-illygoden', 'megan-bochdew'),
    createMarriage('marriage-gwydion-faelan-draenog', 'gwydion-draenog', 'faelan-illygoden'),
    createMarriage('marriage-nolwenn-kevern-wivern', 'nolwenn-wivern', 'kevern-illygoden')
  ],
  parentages: [
    ...childrenOf(['maxen-illygoden', 'dolena-illygoden'], ['gwen-gwialen', 'bleddyn-illygoden'], 'marriage-gwen-bleddyn-gwialen'),
    ...childrenOf(['gryn-illygoden'], ['bleddyn-illygoden', 'valmai-bochdew'], 'marriage-bleddyn-valmai-illygoden'),
    ...childrenOf(['taredd-illygoden', 'faelan-illygoden', 'kevern-illygoden'], ['meredydd-illygoden', 'adda-drewi'], 'marriage-meredydd-adda-illygoden'),
    ...childrenOf(['caryl-illygoden', 'ifor-illygoden', 'hafren-illygoden'], ['fflur-blaidd', 'maxen-illygoden'], 'marriage-fflur-maxen-blaidd'),
    ...childrenOf(['dewi-illygoden'], ['gryn-illygoden', 'afanen-bochdew'], 'marriage-gryn-afanen-illygoden'),
    ...childrenOf(['pryce-illygoden', 'meg-illygoden'], ['taredd-illygoden', 'megan-bochdew'], 'marriage-taredd-megan-illygoden'),
    ...childrenOf(['beth-illygoden', 'nia-illygoden'], ['nolwenn-wivern', 'kevern-illygoden'], 'marriage-nolwenn-kevern-wivern')
  ],
  cadetBranches: [
    marriedAway('married-away-dolena-illygoden-coedwig', 'Haus Coedwig', 'marriage-zachariah-dolena-coedwig', 'house-coedwig', 'haus-coedwig', HOUSE_EMBLEMS.coedwig),
    marriedAway('married-away-faelan-illygoden-draenog', 'Haus Draenog', 'marriage-gwydion-faelan-draenog', 'house-draenog', 'haus-draenog', HOUSE_EMBLEMS.draenog)
  ],
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
      id: 'illygoden-tirwedd-origin',
      houseId: TIRWEDD_HOUSE_ID,
      name: "Haus Illygoden O'Tirwedd",
      subtitle: 'Herkunftslinie aus Vennyr',
      emblem: ILLYGODEN_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['bleddyn-illygoden', 'meredydd-illygoden'],
      targetFamilyId: 'haus-illygoden',
      notes: 'Bleddyn führt die Hauptlinie in Tredegar. Meredydds überlebender Seitenzweig wird in derselben neuen Hausakte vollständig mitgeführt.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'bleddyn-illygoden',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    originFamilyId: 'haus-illygoden',
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Tredegar-Akte nach der Illygoden-Tabelle. Der bereits in Tirwedd unter Bleddyn gesetzte Übergangsknoten wird hier nicht noch einmal unter Gwen wiederholt. Bleddyn erscheint genau einmal und wird zwischen seinen beiden legitimen Ehefrauen zentriert. Gwen steht über Maxen und Dolena, Valmai über Gryn; jedes Kind behält ausschließlich seine tatsächliche Mutter. Meredydds Zweig mit Taredd, Faelan und Kevern wird vollständig mitgeführt. Nachkommen der wegverheirateten Dolena und Faelan verbleiben ausschließlich in den Gegenakten Coedwig beziehungsweise Draenog, damit sie nicht doppelt erscheinen.'
  }
});
