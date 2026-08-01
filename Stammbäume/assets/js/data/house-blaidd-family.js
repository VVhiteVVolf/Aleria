import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  GRAUE_WEITE_HOUSE_EMBLEMS,
  GRAUE_WEITE_HOUSE_PROFILES,
  GRAUE_WEITE_ORIGIN_HOUSE_PROFILES
} from './graue-weite-house-profiles.js';
import { HOUSE_BLAIDD_PORTRAITS } from './house-blaidd-portraits.js';

const BRANON_HOUSE_ID = 'house-blaidd';
const TREDEGAR_HOUSE_ID = 'house-blaidd-tredegar';
const BLAIDD_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.blaidd;
const FIRST_TIME_JUMP_ID = 'gap-gwynfor-to-trahayarn-generation';
const SECOND_TIME_JUMP_ID = 'gap-trahayarn-to-galahad-generation';

const HOUSE_EMBLEMS = Object.freeze({
  blaidd: BLAIDD_EMBLEM,
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod
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
  'breunor-blodyn': 'person--haus-blodyn--breunor-blodyn',
  'myfanwy-blaidd': 'person--haus-blaidd--myfanwy-blaidd',
  'ceridwen-blodyn': 'person--haus-blodyn--ceridwen-blodyn',
  'gwynfor-blaidd': 'person--haus-blaidd--gwynfor-blaidd',
  'arvyn-blodyn': 'person--haus-blodyn--arvyn-blodyn',
  'trystan-blaidd': 'person--haus-blaidd--trystan-blaidd',
  'guenevere-pysgod': 'person--haus-pysgod--guenevere-pysgod',
  'kyndrwyn-blaidd': 'person--haus-blaidd--kyndrwyn-blaidd',
  'caradoc-1675-pysgod': 'person--haus-pysgod--caradoc-1675-pysgod',
  'brynn-blaidd': 'person--haus-blaidd--brynn-blaidd',
  'aethlem-mochdaer': 'person--haus-mochdaer-gwyliau--aethlem-mochdaer',
  'lunet-blaidd': 'person--haus-blaidd--lunet-blaidd',
  'yvain-blodyn': 'person--haus-blodyn--yvain-blodyn',
  'bronwen-blaidd': 'person--haus-blaidd--bronwen-blaidd',
  'ninian-draenog': 'person--haus-draenog--ninian-draenog',
  'enora-blaidd': 'person--haus-blaidd-tredegar--enora-blaidd',
  'ossian-blaidd': 'person--haus-blaidd-tredegar--ossian-blaidd',
  'gwenllian-brithyll': 'person--haus-brithyll--gwenllian-brithyll',
  'pelleas-blaidd': 'person--haus-blaidd--pelleas-blaidd',
  'caron-dianc': 'person--haus-dianc--caron-dianc'
});

const BRANON_HEAD_IDS = new Set([
  'gwynfor-blaidd',
  'trahayarn-blaidd',
  'galahad-blaidd',
  'llwyarch-blaidd',
  'kyvwlch-blaidd'
]);

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
  const defaultLineageRole = BRANON_HEAD_IDS.has(id)
    ? 'head'
    : id === 'pelleas-blaidd' || id === 'taran-blaidd' || id === 'hedd-blaidd'
      ? 'mainline'
      : 'branch';
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || SHARED_WORLD_PERSON_IDS[id] || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_BLAIDD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || defaultLineageRole,
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function branonPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(BRANON_HOUSE_ID, id, name, sex, birth, death, options);
}

function tredegarPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TREDEGAR_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'blaidd-parentage',
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
    crestFrame: 'gold'
  });
}

const BRANON_HOUSES = Object.freeze([
  house(BRANON_HOUSE_ID, "Haus Blaidd O'Branon", BLAIDD_EMBLEM),
  house(TREDEGAR_HOUSE_ID, "Haus Blaidd O'Tredegar", BLAIDD_EMBLEM),
  house('house-alben', 'Stamm der Alben'),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-buadhtreun', 'Haus Buadhtreun'),
  house('house-illygoden', "Haus Illygoden O'Tirwedd", HOUSE_EMBLEMS.illygoden),
  house('house-arfordir', 'Haus Arfordir'),
  house('house-stwatchn', 'Haus Stwatchn'),
  house('house-helgr', 'Haus Helgr'),
  house('house-trachwyll', 'Haus Trachwyll'),
  house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-drewi', 'Haus Drewi'),
  house('house-grimr', 'Haus Grimr'),
  house('house-dianc', 'Haus Dianc'),
  house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau"),
  house('house-gwenyen', 'Haus Gwenyen')
]);

const TREDEGAR_HOUSES = Object.freeze([
  house(TREDEGAR_HOUSE_ID, "Haus Blaidd O'Tredegar", BLAIDD_EMBLEM),
  house(BRANON_HOUSE_ID, "Haus Blaidd O'Branon", BLAIDD_EMBLEM),
  house('house-dianc', 'Haus Dianc'),
  house('house-arfordir', 'Haus Arfordir'),
  house('house-illygoden-tredegar', "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-blodyn-aberdail', 'Haus Blodyn von Aberdail', HOUSE_EMBLEMS.blodyn),
  house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
  house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll)
]);

export const HOUSE_BLAIDD_BRANON_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-blaidd',
    title: "Haus Blaidd O'Branon",
    motto: '',
    description: 'Die vollständige vennyrianische Herkunftslinie der Blaidd aus Branon. Aus einem unbekannten Elternpaar gehen die Brüder Llewelyn und Sieffre hervor; Gwynfor, Llewelyns Sohn, begründet mit Ceridwen Blodyn die spätere Blaidd-Linie. Nur Pelleas wechselt 1720 in die getrennte Tredegar-Akte.',
    emblem: BLAIDD_EMBLEM,
    houseProfile: GRAUE_WEITE_ORIGIN_HOUSE_PROFILES['blaidd-branon']
  },
  houses: [...BRANON_HOUSES],
  persons: [
    branonPerson('unknown-father-blaidd-brothers', '???', 'male', '????', '????', {
      title: 'Unbekannter Vater Llewelyns und Sieffres',
      houseId: '',
      familyRole: 'core'
    }),
    branonPerson('unknown-mother-blaidd-brothers', '???', 'female', '????', '????', {
      title: 'Unbekannte Mutter Llewelyns und Sieffres',
      houseId: '',
      familyRole: 'married'
    }),
    branonPerson('llewelyn-founder-blaidd', 'Llewelyn Blaidd', 'male', '????', '????', {
      title: 'Priester · Älterer Sohn des unbekannten Elternpaares'
    }),
    branonPerson('cliodhna-alben', 'Clíodhna', 'female', '????', '????', {
      houseId: 'house-alben',
      familyRole: 'married'
    }),
    branonPerson('sieffre-founder-blaidd', 'Sieffre Blaidd', 'male', '????', '????', {
      title: 'Priester · Jüngerer Sohn des unbekannten Elternpaares'
    }),
    branonPerson('catelyn-alben', 'Catelyn', 'female', '????', '????', {
      houseId: 'house-alben',
      familyRole: 'married'
    }),

    branonPerson('gwynfor-blaidd', 'Gwynfor Blaidd', 'male', '????', '????', {
      title: 'Gründer der Blaidd-Linie · Graf von Branon',
      lineageRole: 'head'
    }),
    branonPerson('ceridwen-blodyn', 'Ceridwen Blodyn', 'female', '????', '????', {
      houseId: 'house-blodyn',
      familyRole: 'married',
      title: 'Mitgründerin der Blaidd-Linie'
    }),
    branonPerson('myfanwy-blaidd', 'Myfanwy Blaidd', 'female', '????', '????', {
      title: 'Wegverheiratet an Haus Blodyn',
      tags: ['Wegverheiratet']
    }),
    branonPerson('breunor-blodyn', 'Breunor Blodyn', 'male', '????', '????', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),

    branonPerson('tangwistl-blaidd', 'Tangwistl Blaidd', 'female', '????', '????'),
    branonPerson('trahayarn-blaidd', 'Trahayarn Blaidd', 'male', '????', '????', {
      title: 'Graf von Branon',
      lineageRole: 'head'
    }),
    branonPerson('orflaith-buadhtreun', 'Órflaith Buadhtreun', 'female', '????', '????', {
      houseId: 'house-buadhtreun',
      familyRole: 'married'
    }),
    branonPerson('quendolin-blaidd', 'Quendolin Blaidd', 'female', '????', '????', {
      title: "Wegverheiratet an Haus Illygoden O'Tirwedd",
      tags: ['Wegverheiratet']
    }),
    branonPerson('powell-illygoden', 'Powell Illygoden', 'male', '????', '????', {
      houseId: 'house-illygoden',
      familyRole: 'married'
    }),

    branonPerson('galahad-blaidd', 'Galahad Blaidd', 'male', '1590', '1674', {
      title: 'Graf von Branon',
      lineageRole: 'head'
    }),
    branonPerson('tamsin-stwatchn', 'Tamsin Stwatchn', 'female', '1592', '1688', {
      houseId: 'house-stwatchn',
      familyRole: 'married'
    }),
    branonPerson('gwyneth-blaidd', 'Gwyneth Blaidd', 'female', '1592', '1635', {
      title: 'Wegverheiratet an Haus Arfordir',
      tags: ['Wegverheiratet']
    }),
    branonPerson('seissylwch-arfordir', 'Seissylwch Arfordir', 'male', '1589', '1664', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),

    branonPerson('llwyarch-blaidd', 'Llwyarch Blaidd', 'male', '1614', '1686', {
      title: 'Graf von Branon',
      lineageRole: 'head'
    }),
    branonPerson('ingrid-helgr', 'Ingrid Helgr', 'female', '1614', '1703', {
      houseId: 'house-helgr',
      familyRole: 'married'
    }),
    branonPerson('llenlleawg-blaidd', 'Llenlleawg Blaidd', 'male', '1616', '1640'),
    branonPerson('iesin-blaidd', 'Iesin Blaidd', 'male', '1618', '1650'),
    branonPerson('dyvynwal-trachwyll', 'Dyvynwal Trachwyll', 'female', '1616', '1676', {
      houseId: 'house-trachwyll',
      familyRole: 'married'
    }),

    branonPerson('kyvwlch-blaidd', 'Kyvwlch Blaidd', 'male', '1632', '1720', {
      title: 'Graf von Branon',
      lineageRole: 'head'
    }),
    branonPerson('jinell-trachwyll', 'Jinell Trachwyll', 'female', '1633', '1674', {
      houseId: 'house-trachwyll',
      familyRole: 'married'
    }),
    branonPerson('braith-blaidd', 'Braith Blaidd', 'female', '1635', '1705', {
      title: "Wegverheiratet an Haus Illygoden O'Tirwedd",
      tags: ['Wegverheiratet']
    }),
    branonPerson('taliesin-illygoden', 'Taliesin Illygoden', 'male', '1630', '1700', {
      houseId: 'house-illygoden',
      familyRole: 'married'
    }),
    branonPerson('vorath-blaidd', 'Vorath Blaidd', 'male', '1633', '1699'),
    branonPerson('glenys-bochdew', 'Glenys Bochdew', 'female', '1632', '1702', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),

    branonPerson('trystan-blaidd', "Trystan Blaidd O'Branon", 'male', '1651', '1720'),
    branonPerson('arvyn-blodyn', 'Arvyn Blodyn', 'female', '1655', '????', {
      houseId: 'house-blodyn',
      familyRole: 'married',
      notes: 'Die kanonische Gegenakte Haus Blodyn führt Arvyn als Ehefrau Trystans; der abweichende Altquellenname Caryln wird nicht als zweite Person angelegt.'
    }),
    branonPerson('isolwyn-blaidd', 'Isolwyn Blaidd', 'female', '1651', '1720', {
      title: 'Wegverheiratet an Haus Drewi',
      tags: ['Wegverheiratet']
    }),
    branonPerson('gwawrdur-drewi', 'Gwawrdur Drewi', 'male', '1650', '1720', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),
    branonPerson('kyndrwyn-blaidd', 'Kyndrwyn Blaidd', 'male', '1650', '1720'),
    branonPerson('guenevere-pysgod', 'Guenevere Pysgod', 'female', '1652', '1720', {
      houseId: 'house-pysgod',
      familyRole: 'married'
    }),
    branonPerson('maygan-blaidd', 'Maygan Blaidd', 'female', '1653', '1702', {
      title: 'Wegverheiratet an Haus Grimr',
      tags: ['Wegverheiratet']
    }),
    branonPerson('odin-grimr', 'Odin Grimr', 'male', '1651', '1715', {
      houseId: 'house-grimr',
      familyRole: 'married'
    }),

    branonPerson('pelleas-blaidd', 'Pelleas Blaidd', 'male', '1669', '', {
      title: "Begründer der ausgewanderten Tredegar-Linie",
      lineageRole: 'mainline',
      notes: 'Pelleas bleibt als Sohn Trystans und Arvyns in der Herkunftsakte sichtbar. Sämtliche Nachkommen werden ausschließlich in der verknüpften Tredegar-Akte geführt.'
    }),
    branonPerson('caron-dianc', 'Caron Dianc', 'female', '1673', '', {
      houseId: 'house-dianc',
      familyRole: 'married'
    }),
    branonPerson('brynn-blaidd', 'Brynn Blaidd', 'female', '1674', '', {
      title: "Wegverheiratet an Haus Pysgod O'Tredegar",
      tags: ['Wegverheiratet']
    }),
    branonPerson('caradoc-1675-pysgod', 'Caradoc Pysgod', 'male', '1675', '', {
      houseId: 'house-pysgod',
      familyRole: 'married'
    }),
    branonPerson('lunet-blaidd', 'Lunet Blaidd', 'female', '1678', '', {
      title: "Wegverheiratet an Haus Mochdaer O'Gwyliau",
      tags: ['Wegverheiratet']
    }),
    branonPerson('aethlem-mochdaer', 'Aethlem Mochdaer', 'male', '1675', '', {
      houseId: 'house-mochdaer-gwyliau',
      familyRole: 'married'
    }),
    branonPerson('pedrawd-blaidd', 'Pedrawd Blaidd', 'male', '1672', '1720'),
    branonPerson('arianwen-bochdew', 'Arianwen Bochdew', 'female', '1674', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    branonPerson('ysgonan-blaidd', 'Ysgonan Blaidd', 'male', '1670', '1720'),
    branonPerson('eurolwyn-gwenyen', 'Eurolwyn Gwenyen', 'female', '1674', '1720', {
      houseId: 'house-gwenyen',
      familyRole: 'married'
    })
  ],
  partnerships: [
    endedMarriage('marriage-unknown-parents-blaidd', 'unknown-father-blaidd-brothers', 'unknown-mother-blaidd-brothers'),
    endedMarriage('marriage-llewelyn-cliodhna-blaidd', 'llewelyn-founder-blaidd', 'cliodhna-alben'),
    endedMarriage('marriage-sieffre-catelyn-blaidd', 'sieffre-founder-blaidd', 'catelyn-alben'),
    endedMarriage('marriage-ceridwen-gwynfor', 'ceridwen-blodyn', 'gwynfor-blaidd'),
    endedMarriage('marriage-breunor-myfanwy', 'breunor-blodyn', 'myfanwy-blaidd'),
    endedMarriage('marriage-trahayarn-orflaith-blaidd', 'trahayarn-blaidd', 'orflaith-buadhtreun'),
    endedMarriage('marriage-quendolin-powell-blaidd', 'quendolin-blaidd', 'powell-illygoden'),
    endedMarriage('marriage-galahad-tamsin-blaidd', 'galahad-blaidd', 'tamsin-stwatchn'),
    endedMarriage('marriage-gwyneth-seissylwch-blaidd', 'gwyneth-blaidd', 'seissylwch-arfordir'),
    endedMarriage('marriage-llwyarch-ingrid-blaidd', 'llwyarch-blaidd', 'ingrid-helgr'),
    endedMarriage('marriage-iesin-dyvynwal-blaidd', 'iesin-blaidd', 'dyvynwal-trachwyll'),
    endedMarriage('marriage-kyvwlch-jinell-blaidd', 'kyvwlch-blaidd', 'jinell-trachwyll'),
    endedMarriage('marriage-braith-taliesin-blaidd', 'braith-blaidd', 'taliesin-illygoden'),
    endedMarriage('marriage-vorath-glenys-blaidd', 'vorath-blaidd', 'glenys-bochdew'),
    endedMarriage('marriage-arvyn-trystan', 'arvyn-blodyn', 'trystan-blaidd'),
    endedMarriage('marriage-isolwyn-gwawrdur-blaidd', 'isolwyn-blaidd', 'gwawrdur-drewi'),
    endedMarriage('marriage-guenevere-kyndrwyn', 'guenevere-pysgod', 'kyndrwyn-blaidd'),
    endedMarriage('marriage-maygan-odin-blaidd', 'maygan-blaidd', 'odin-grimr'),
    createMarriage('marriage-pelleas-caron-blaidd', 'pelleas-blaidd', 'caron-dianc'),
    createMarriage('marriage-caradoc1675-brynn', 'caradoc-1675-pysgod', 'brynn-blaidd'),
    createMarriage('marriage-aethlem-lunet-mochdaer', 'aethlem-mochdaer', 'lunet-blaidd'),
    endedMarriage('marriage-pedrawd-arianwen-blaidd', 'pedrawd-blaidd', 'arianwen-bochdew'),
    endedMarriage('marriage-ysgonan-eurolwyn-blaidd', 'ysgonan-blaidd', 'eurolwyn-gwenyen')
  ],
  parentages: [
    ...childrenOf(
      ['llewelyn-founder-blaidd', 'sieffre-founder-blaidd'],
      ['unknown-father-blaidd-brothers', 'unknown-mother-blaidd-brothers'],
      'marriage-unknown-parents-blaidd'
    ),
    ...childrenOf(['gwynfor-blaidd'], ['llewelyn-founder-blaidd', 'cliodhna-alben'], 'marriage-llewelyn-cliodhna-blaidd'),
    ...childrenOf(['myfanwy-blaidd'], ['sieffre-founder-blaidd', 'catelyn-alben'], 'marriage-sieffre-catelyn-blaidd'),
    ...gapChildren(['tangwistl-blaidd', 'trahayarn-blaidd', 'quendolin-blaidd'], ['ceridwen-blodyn', 'gwynfor-blaidd'], 'marriage-ceridwen-gwynfor', FIRST_TIME_JUMP_ID),
    ...gapChildren(['galahad-blaidd', 'gwyneth-blaidd'], ['trahayarn-blaidd', 'orflaith-buadhtreun'], 'marriage-trahayarn-orflaith-blaidd', SECOND_TIME_JUMP_ID),
    ...childrenOf(['llwyarch-blaidd', 'llenlleawg-blaidd', 'iesin-blaidd'], ['galahad-blaidd', 'tamsin-stwatchn'], 'marriage-galahad-tamsin-blaidd'),
    ...childrenOf(['kyvwlch-blaidd', 'braith-blaidd', 'vorath-blaidd'], ['llwyarch-blaidd', 'ingrid-helgr'], 'marriage-llwyarch-ingrid-blaidd'),
    ...childrenOf(['trystan-blaidd', 'isolwyn-blaidd'], ['kyvwlch-blaidd', 'jinell-trachwyll'], 'marriage-kyvwlch-jinell-blaidd'),
    ...childrenOf(['kyndrwyn-blaidd', 'maygan-blaidd'], ['vorath-blaidd', 'glenys-bochdew'], 'marriage-vorath-glenys-blaidd'),
    ...childrenOf(['pelleas-blaidd', 'brynn-blaidd', 'lunet-blaidd', 'pedrawd-blaidd'], ['arvyn-blodyn', 'trystan-blaidd'], 'marriage-arvyn-trystan'),
    ...childrenOf(['ysgonan-blaidd'], ['guenevere-pysgod', 'kyndrwyn-blaidd'], 'marriage-guenevere-kyndrwyn')
  ],
  cadetBranches: [
    marriedAway('married-away-blodyn-myfanwy-blaidd', 'Haus Blodyn', 'marriage-breunor-myfanwy', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-illygoden-quendolin-blaidd', "Haus Illygoden O'Tirwedd", 'marriage-quendolin-powell-blaidd', 'house-illygoden', 'haus-illygoden', HOUSE_EMBLEMS.illygoden),
    marriedAway('married-away-arfordir-gwyneth-blaidd', 'Haus Arfordir', 'marriage-gwyneth-seissylwch-blaidd', 'house-arfordir', 'haus-arfordir'),
    marriedAway('married-away-illygoden-braith-blaidd', "Haus Illygoden O'Tirwedd", 'marriage-braith-taliesin-blaidd', 'house-illygoden', 'haus-illygoden', HOUSE_EMBLEMS.illygoden),
    marriedAway('married-away-drewi-isolwyn-blaidd', 'Haus Drewi', 'marriage-isolwyn-gwawrdur-blaidd', 'house-drewi', 'haus-drewi'),
    marriedAway('married-away-grimr-maygan-blaidd', 'Haus Grimr', 'marriage-maygan-odin-blaidd', 'house-grimr', 'haus-grimr'),
    marriedAway('married-away-pysgod-brynn-blaidd', "Haus Pysgod O'Tredegar", 'marriage-caradoc1675-brynn', 'house-pysgod', 'haus-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-mochdaer-lunet-blaidd', "Haus Mochdaer O'Gwyliau", 'marriage-aethlem-lunet-mochdaer', 'house-mochdaer-gwyliau', 'haus-mochdaer-gwyliau'),
    createCadetHouseBranch({
      id: 'migration-pelleas-tredegar',
      name: "Haus Blaidd O'Tredegar",
      parentPartnershipId: 'marriage-pelleas-caron-blaidd',
      houseId: TREDEGAR_HOUSE_ID,
      targetFamilyId: 'haus-blaidd-tredegar',
      emblem: BLAIDD_EMBLEM,
      founded: '1720',
      subtitle: 'Neue Ritterfürstenlinie von Tredegar',
      crestFrame: 'gold',
      notes: 'Der Übergangsknoten geht gemeinsam von Pelleas und Caron aus. Ihre Nachkommen werden nur in der Zielakte von Tredegar fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: FIRST_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-ceridwen-gwynfor',
      sharedParentPartnershipIds: [],
      childIds: ['tangwistl-blaidd', 'trahayarn-blaidd', 'quendolin-blaidd'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Die Linie Gwynfors setzt später wieder ein',
      notes: 'Der Zeitsprung gehört ausschließlich unter Gwynfor und Ceridwen. Myfanwys Linie endet zuvor im Wegverheiratet-Knoten des Hauses Blodyn.'
    },
    {
      id: SECOND_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-trahayarn-orflaith-blaidd',
      sharedParentPartnershipIds: [],
      childIds: ['galahad-blaidd', 'gwyneth-blaidd'],
      years: 0,
      fromYear: '????',
      toYear: '1590',
      label: 'Die belegte Linie setzt 1590 wieder ein',
      notes: 'Der zweite Auslassungspunkt der Quelle trennt Trahayarns Generation seriell von Galahad und Gwyneth.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-ceridwen-gwynfor',
    houseId: BRANON_HOUSE_ID,
    crestSubtitle: 'Von Gwynfor Blaidd und Ceridwen Blodyn begründetes Grafenhaus von Branon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-blaidd-brothers',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-blaidd-tredegar',
    sourceRevision: 4,
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Vollständige Branon-Herkunftsakte nach der bereitgestellten Blaidd-Tabelle. Ein unbekanntes Elternpaar führt zu den Brüdern Llewelyn und Sieffre samt ihren Ehefrauen. Sieffres Tochter Myfanwy endet in der Wegverheiratung nach Haus Blodyn. Llewelyns Sohn Gwynfor begründet mit Ceridwen Blodyn erst danach das Haus Blaidd; der erste Zeitsprung folgt seriell unmittelbar unter diesem Hausknoten. Pelleas und Caron schließen die Herkunftsakte mit einem gemeinsamen Übergabeknoten nach Tredegar ab; keine ihrer Nachkommen wird hier gedoppelt. Der Name Arvyn folgt der bereits kanonischen Blodyn-Gegenakte statt der widersprüchlichen Altquellenbezeichnung Caryln.'
  }
});

export const HOUSE_BLAIDD_TREDEGAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-blaidd-tredegar',
    title: "Haus Blaidd O'Tredegar",
    motto: '',
    description: 'Die 1720 von Pelleas Blaidd und Caron Dianc begründete Ritterfürstenlinie von Tredegar. Diese Akte allein führt ihre Kinder und Kindeskinder fort.',
    emblem: BLAIDD_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.blaidd
  },
  houses: [...TREDEGAR_HOUSES],
  persons: [
    tredegarPerson('pelleas-blaidd', 'Pelleas Blaidd', 'male', '1669', '', {
      title: 'Gründer und Ritterfürst von Tredegar seit 1720',
      lineageRole: 'head'
    }),
    tredegarPerson('caron-dianc', 'Caron Dianc', 'female', '1673', '', {
      houseId: 'house-dianc',
      familyRole: 'married'
    }),
    tredegarPerson('taran-blaidd', 'Taran Blaidd', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Blaidd',
      lineageRole: 'mainline'
    }),
    tredegarPerson('meredithe-arfordir', 'Meredithe Arfordir', 'female', '1698', '', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),
    tredegarPerson('fflur-blaidd', 'Fflur Blaidd', 'female', '1697', '', {
      title: "Wegverheiratet an Haus Illygoden O'Tredegar",
      tags: ['Wegverheiratet'],
      notes: 'Das offensichtlich fehlerhafte Geburtsjahr 1997 der Altquelle wurde in den generationell passenden Wert 1697 berichtigt.'
    }),
    tredegarPerson('maxen-illygoden', 'Maxen Illygoden', 'male', '1694', '', {
      houseId: 'house-illygoden-tredegar',
      familyRole: 'married'
    }),
    tredegarPerson('bronwen-blaidd', 'Bronwen Blaidd', 'female', '1694', '', {
      title: 'Wegverheiratet und Mitbegründerin des Hauses Blodyn von Aberdail',
      tags: ['Wegverheiratet']
    }),
    tredegarPerson('yvain-blodyn', 'Yvain Blodyn', 'male', '1694', '', {
      title: 'Baron von Aberdail',
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    tredegarPerson('enora-blaidd', 'Enora Blaidd', 'female', '1699', '', {
      title: 'Wegverheiratet an Haus Draenog',
      tags: ['Wegverheiratet']
    }),
    tredegarPerson('ninian-draenog', 'Ninian Draenog', 'male', '1695', '', {
      title: 'Zweiter Erbe des Hauses Draenog',
      houseId: 'house-draenog',
      familyRole: 'married'
    }),
    tredegarPerson('ossian-blaidd', 'Ossian Blaidd', 'male', '1695', ''),
    tredegarPerson('gwenllian-brithyll', 'Gwenllian Brithyll', 'female', '1696', '', {
      houseId: 'house-brithyll',
      familyRole: 'married'
    }),
    tredegarPerson('hedd-blaidd', 'Hedd Blaidd', 'male', '1715', '', {
      title: 'Zweiter Erbe des Hauses Blaidd',
      lineageRole: 'mainline'
    }),
    tredegarPerson('mair-blaidd', 'Mair Blaidd', 'female', '1717', ''),
    tredegarPerson('telyn-blaidd', 'Telyn Blaidd', 'female', '1720', ''),
    tredegarPerson('unig-blaidd', 'Unig Blaidd', 'male', '1718', ''),
    tredegarPerson('wynne-blaidd', 'Wynne Blaidd', 'female', '1720', '')
  ],
  partnerships: [
    createMarriage('marriage-pelleas-caron-blaidd', 'pelleas-blaidd', 'caron-dianc'),
    createMarriage('marriage-taran-meredithe-blaidd', 'taran-blaidd', 'meredithe-arfordir'),
    createMarriage('marriage-fflur-maxen-blaidd', 'fflur-blaidd', 'maxen-illygoden'),
    createMarriage('marriage-yvain-bronwen', 'yvain-blodyn', 'bronwen-blaidd'),
    createMarriage('marriage-ninian-enora-draenog', 'ninian-draenog', 'enora-blaidd'),
    createMarriage('marriage-ossian-gwenllian-brithyll', 'ossian-blaidd', 'gwenllian-brithyll')
  ],
  parentages: [
    ...childrenOf(['taran-blaidd', 'fflur-blaidd', 'bronwen-blaidd', 'enora-blaidd', 'ossian-blaidd'], ['pelleas-blaidd', 'caron-dianc'], 'marriage-pelleas-caron-blaidd'),
    ...childrenOf(['hedd-blaidd', 'mair-blaidd', 'telyn-blaidd'], ['taran-blaidd', 'meredithe-arfordir'], 'marriage-taran-meredithe-blaidd'),
    ...childrenOf(['unig-blaidd', 'wynne-blaidd'], ['ossian-blaidd', 'gwenllian-brithyll'], 'marriage-ossian-gwenllian-brithyll')
  ],
  cadetBranches: [
    marriedAway('married-away-illygoden-fflur-blaidd', "Haus Illygoden O'Tredegar", 'marriage-fflur-maxen-blaidd', 'house-illygoden-tredegar', 'haus-illygoden-tredegar', HOUSE_EMBLEMS.illygoden),
    createCadetHouseBranch({
      id: 'cadet-blodyn-aberdail-bronwen-blaidd',
      name: 'Haus Blodyn von Aberdail',
      parentPartnershipId: 'marriage-yvain-bronwen',
      houseId: 'house-blodyn-aberdail',
      targetFamilyId: 'haus-blodyn-aberdail',
      emblem: HOUSE_EMBLEMS.blodyn,
      subtitle: 'Von Yvain Blodyn und Bronwen Blaidd begründete Linie',
      crestFrame: 'gold'
    }),
    marriedAway('married-away-draenog-enora-blaidd', 'Haus Draenog', 'marriage-ninian-enora-draenog', 'house-draenog', 'haus-draenog', HOUSE_EMBLEMS.draenog)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-pelleas-caron-blaidd',
    houseId: TREDEGAR_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Tredegar · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'pelleas-blaidd',
    orientation: 'vertical',
    ancestorDepth: 6,
    descendantDepth: 8,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-blaidd',
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Tredegar-Nachfolgeakte nach dem Mochdaer- und Blodyn-Muster. Sie beginnt bewusst erneut mit Pelleas und Caron als Gründerpaar und enthält ausschließlich ihre Kinder sowie die in der Quelle genannten Kindeskinder. Nachkommen der wegverheirateten Bronwen und Enora bleiben in den Gegenakten Blodyn von Aberdail beziehungsweise Draenog; so entstehen keine doppelten Kinderlinien.'
  }
});

export const BLAIDD_HOUSE_FAMILIES = Object.freeze([
  HOUSE_BLAIDD_BRANON_FAMILY,
  HOUSE_BLAIDD_TREDEGAR_FAMILY
]);
