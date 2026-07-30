import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { HOUSE_CIAROG_PORTRAITS } from './house-ciarog-portraits.js';

const CIAROG_HOUSE_ID = 'house-ciarog';
const CIAROG_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.ciarog;
const TIME_JUMP_ID = 'gap-brogan-hailidhe-to-hywel-generation-ciarog';

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
  'brogan-ciarog': 'Ritterfürst von Caer Diwedd · Gründer des Hauses Ciaróg',
  'hywel-ciarog': 'Ritterfürst von Caer Diwedd bis 1681',
  'carranog-ciarog': 'Ritterfürst von Caer Diwedd 1681–1698',
  'amaethon-ciarog': 'Ritterfürst von Caer Diwedd 1698–1720',
  'tarrant-ciarog': 'Ritterfürst von Caer Diwedd seit 1720',
  'karanteg-ciarog': 'Erster Erbe des Hauses Ciaróg',
  'loyd-ciarog': 'Zweiter Erbe des Hauses Ciaróg'
});

const HOUSE_HEAD_IDS = new Set([
  'brogan-ciarog',
  'hywel-ciarog',
  'carranog-ciarog',
  'amaethon-ciarog',
  'tarrant-ciarog'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? CIAROG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_CIAROG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CIAROG_HOUSE_ID ? 'core' : 'married'),
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
    familyRole: options.familyRole || 'married',
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['brogan-ciarog', 'hailidhe-ciarog'],
  hywel: ['hywel-ciarog', 'graine-morna'],
  gwenog: ['dystan-grawn', 'gwennog-ciarog'],
  mordred: ['mordred-ciarog', 'eibhlin-rioga'],
  carranog: ['carranog-ciarog', 'laoise-treada'],
  alys: ['alys-ciarog', 'fionn-fiantorc'],
  morgan: ['morgan-ciarog', 'aodnait-choinnich'],
  amaethon: ['amaethon-ciarog', 'clodagh-suiste'],
  gwennaelle: ['gwennaelle-ciarog', 'diarmait-gairner'],
  bryce: ['bryce-ciarog', 'innogen-cleirigh'],
  tarrant: ['tarrant-ciarog', 'emer-ailella'],
  ulyana: ['vaughan-baedd', 'ulyana-ciarog'],
  orla: ['orla-ciarog', 'daddweir-mwyalchen'],
  dalvin: ['dalvin-ciarog', 'llinos-chiffyddlon'],
  wynndie: ['wynndie-ciarog', 'sabrian-gwarchod'],
  karanteg: ['karanteg-ciarog', 'aine-aonghusa'],
  cymraes: ['lyon-marchog', 'cymraes-ciarog'],
  yale: ['yale-ciarog', 'aoife-cadhla'],
  dyfan: ['dyfan-ciarog', 'brigid-ceallaigh'],
  bhreac: ['bhreac-ciarog', 'iseult-tartarfhuil'],
  loyd: ['loyd-ciarog', 'emer-casur']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-brogan-hailidhe-ciarog': COUPLES.founders,
  'marriage-hywel-graine-ciarog': COUPLES.hywel,
  'marriage-dystan-gwennog': COUPLES.gwenog,
  'marriage-mordred-eibhlin-ciarog': COUPLES.mordred,
  'marriage-carranog-laoise-ciarog': COUPLES.carranog,
  'marriage-alys-fionn-ciarog': COUPLES.alys,
  'marriage-morgan-aodnait-ciarog': COUPLES.morgan,
  'marriage-amaethon-clodagh-ciarog': COUPLES.amaethon,
  'marriage-gwennaelle-diarmait-ciarog': COUPLES.gwennaelle,
  'marriage-bryce-innogen-ciarog': COUPLES.bryce,
  'marriage-tarrant-emer-ciarog': COUPLES.tarrant,
  'marriage-vaughan-ulyana-baedd': COUPLES.ulyana,
  'marriage-orla-daddweir-ciarog': COUPLES.orla,
  'marriage-dalvin-llinos-ciarog': COUPLES.dalvin,
  'marriage-wynndie-sabrian-ciarog': COUPLES.wynndie,
  'marriage-karanteg-aine-ciarog': COUPLES.karanteg,
  'marriage-lyon-cymraes-marchog': COUPLES.cymraes,
  'marriage-yale-aoife-ciarog': COUPLES.yale,
  'marriage-dyfan-brigid-ciarog': COUPLES.dyfan,
  'marriage-bhreac-iseult-ciarog': COUPLES.bhreac
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'ciarog-parentage', ...options }
  );
}

function gapChildren(childIds) {
  return childrenOf(childIds, 'marriage-brogan-hailidhe-ciarog', {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Zwischen-Generationen sind in der Quelle nicht einzeln überliefert.',
    extensions: { timeJumpId: TIME_JUMP_ID }
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

export const HOUSE_CIAROG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ciarog',
    title: "Haus Ciaróg O'Caer Diwedd",
    motto: '',
    description: 'Altes Ritterfürstengeschlecht von Caer Diwedd mit Crannath-Wurzeln und engen Bindungen zu cenyrischen wie albischen Häusern.',
    emblem: CIAROG_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.ciarog
  },
  houses: [
    house(CIAROG_HOUSE_ID, "Haus Ciaróg O'Caer Diwedd", CIAROG_EMBLEM),
    house('house-morna', 'Haus Morna'),
    house('house-grawn', "Haus Grawn O'Glyndraith", AEHRENTAL_HOUSE_EMBLEMS.grawn),
    house('house-rioga', 'Haus Rioga'),
    house('house-treada', 'Haus Tréada'),
    house('house-fiantorc', 'Haus Fiantorc'),
    house('house-choinnich', 'Haus Choinnich'),
    house('house-suiste', 'Haus Suiste'),
    house('house-gairner', 'Haus Gáirner'),
    house('house-cleirigh', 'Haus Cléirigh'),
    house('house-ailella', 'Haus Ailella'),
    house('house-baedd', 'Haus Baedd', AEHRENTAL_HOUSE_EMBLEMS.baedd),
    house('house-mwyalchen', 'Haus Mwyalchen'),
    house('house-chiffyddlon', 'Haus Chiffyddlon', AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon),
    house('house-gwarchod', 'Haus Gwarchod', AEHRENTAL_HOUSE_EMBLEMS.gwarchod),
    house('house-aonghusa', 'Haus Aonghusa'),
    house('house-marchog', 'Haus Marchog', AEHRENTAL_HOUSE_EMBLEMS.marchog),
    house('house-cadhla', 'Haus Cadhla'),
    house('house-ceallaigh', 'Haus Ceallaigh'),
    house('house-tartarfhuil', 'Haus Tartarfhuil'),
    house('house-casur', 'Haus Casur'),
    house('house-tir-fiachiontach', 'Haus Tir Fiachiontach')
  ],
  persons: [
    person('brogan-ciarog', 'Brogan Ciaróg', 'male', '????', '????'),
    spouse('hailidhe-ciarog', 'Hailidhe', 'female', '????', '????'),

    person('hywel-ciarog', 'Hywel Ciaróg', 'male', '1602', '1681'),
    spouse('graine-morna', 'Graine Morna', 'female', '1606', '????', 'house-morna'),
    person('cynddylan-ciarog', 'Cynddylan Ciaróg', 'male', '1604', '????'),
    person('mordred-ciarog', 'Mordred Ciaróg', 'male', '1606', '????'),
    spouse('eibhlin-rioga', 'Eibhlin Rioga', 'female', '1608', '????', 'house-rioga'),
    awayWoman('gwennog-ciarog', 'Gwennog Ciaróg', '1608', '1673', 'Haus Grawn'),
    spouse('dystan-grawn', 'Dystan Grawn', 'male', '1602', '1667', 'house-grawn'),

    person('carranog-ciarog', 'Carranog Ciaróg', 'male', '1624', '1698'),
    spouse('laoise-treada', 'Laoise Tréada', 'female', '1628', '????', 'house-treada'),
    awayWoman('alys-ciarog', 'Alys Ciaróg', '1627', '????', 'Haus Fiantorc'),
    spouse('fionn-fiantorc', 'Fionn Fiantorc', 'male', '1626', '1692', 'house-fiantorc'),
    person('morgan-ciarog', 'Morgan Ciaróg', 'male', '1626', '????'),
    spouse('aodnait-choinnich', 'Aodnait Choinnich', 'female', '1626', '1683', 'house-choinnich'),

    person('amaethon-ciarog', 'Amaethon Ciaróg', 'male', '1648', '1720'),
    spouse('clodagh-suiste', 'Clodagh Suiste', 'female', '1650', '1720', 'house-suiste'),
    awayWoman('gwennaelle-ciarog', 'Gwennaelle Ciaróg', '1652', '1699', 'Haus Gáirner'),
    spouse('diarmait-gairner', 'Diarmait Gáirner', 'male', '1650', '1685', 'house-gairner'),
    person('bryce-ciarog', 'Bryce Ciaróg', 'male', '1657', '1713'),
    spouse('innogen-cleirigh', 'Innogen Cléirigh', 'female', '1658', '1701', 'house-cleirigh'),

    person('tarrant-ciarog', 'Tarrant Ciaróg', 'male', '1669'),
    spouse('emer-ailella', 'Emer Ailella', 'female', '????', '????', 'house-ailella'),
    awayWoman('ulyana-ciarog', "Ulyana Ciaróg O'Caer Diwedd", '1672', '', 'Haus Baedd', {
      notes: 'Die bestehende Baedd-Gegenakte führt dieselbe Weltperson und dieselbe Ehe mit Vaughan.'
    }),
    spouse('vaughan-baedd', 'Vaughan Baedd', 'male', '1670', '', 'house-baedd'),
    awayWoman('orla-ciarog', 'Orla Ciaróg', '1674', '1713', 'Haus Mwyalchen'),
    spouse('daddweir-mwyalchen', 'Daddweir Mwyalchen', 'male', '1673', '1720', 'house-mwyalchen', {
      notes: 'Die Ciaróg-Quelle schreibt den Hausnamen abweichend „Mywalchen“; vorhandene Akten führen kanonisch Mwyalchen.'
    }),
    person('dalvin-ciarog', 'Dalvin Ciaróg', 'male', '1676'),
    spouse('llinos-chiffyddlon', 'Llinos Chiffyddlon', 'female', '1676', '1720', 'house-chiffyddlon'),
    awayWoman('wynndie-ciarog', 'Wynndie Ciaróg', '1678', '1720', 'Haus Gwarchod'),
    spouse('sabrian-gwarchod', 'Sabrian Gwarchod', 'male', '1678', '1720', 'house-gwarchod'),

    person('karanteg-ciarog', 'Karanteg Ciaróg', 'male', '1696'),
    spouse('aine-aonghusa', 'Aine Aonghusa', 'female', '1697', '', 'house-aonghusa'),
    awayWoman('cymraes-ciarog', 'Cymraes Ciaróg', '1698', '', 'Haus Marchog', {
      notes: 'Die bestehende Marchog-Gegenakte führt dieselbe Weltperson und dieselbe Ehe mit Lyon.'
    }),
    spouse('lyon-marchog', 'Lyon Marchog', 'male', '1698', '', 'house-marchog'),
    person('yale-ciarog', 'Yale Ciaróg', 'male', '1700'),
    spouse('aoife-cadhla', 'Aoife Cadhla', 'female', '1700', '????', 'house-cadhla'),
    person('dyfan-ciarog', 'Dyfan Ciaróg', 'male', '1697'),
    spouse('brigid-ceallaigh', 'Brigid Ceallaigh', 'female', '1699', '????', 'house-ceallaigh'),
    person('bhreac-ciarog', 'Bhreac Ciaróg', 'male', '1700'),
    spouse('iseult-tartarfhuil', 'Iseult Tartarfhuil', 'female', '1701', '????', 'house-tartarfhuil'),

    person('loyd-ciarog', 'Loyd Ciaróg', 'male', '1715'),
    person('nest-ciarog', 'Nest Ciaróg', 'female', '1727'),
    spouse('emer-casur', 'Emer Casur', 'female', '1718', '', 'house-casur', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Karantegs · Verlobte Loyds',
      tags: ['Aufgenommenes Mündel', 'Verlobt'],
      notes: 'Emer ist Karantegs aufgenommenes Mündel und kein leibliches Kind des Hauses Ciaróg. Die Quelle nennt sie im Mündelblock „Emer An Casur“ und bei der Verlobung „Emer Casur“; beide Angaben bezeichnen dieselbe Person.'
    }),
    person('lugh-ciarog', 'Lugh Ciaróg', 'male', '1721'),
    person('shan-ciarog', 'Shan Ciaróg', 'female', '1723'),
    person('nye-ciarog', 'Nye Ciaróg', 'male', '1718'),
    person('cady-ciarog', 'Cady Ciaróg', 'female', '1724'),
    spouse('ultan-tir-fiachiontach', 'Ultán Tir Fiachiontach', 'male', '1723', '', 'house-tir-fiachiontach', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Dyfans',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Ultán ist Dyfans aufgenommenes Mündel und kein leiblicher Sohn der Ciaróg.'
    }),
    person('cadel-ciarog', 'Cadel Ciaróg', 'male', '1723'),
    person('soffi-ciarog', 'Soffi Ciaróg', 'female', '1725')
  ],
  partnerships: [
    createMarriage('marriage-brogan-hailidhe-ciarog', ...COUPLES.founders),
    createMarriage('marriage-hywel-graine-ciarog', ...COUPLES.hywel),
    createMarriage('marriage-dystan-gwennog', ...COUPLES.gwenog),
    createMarriage('marriage-mordred-eibhlin-ciarog', ...COUPLES.mordred),
    createMarriage('marriage-carranog-laoise-ciarog', ...COUPLES.carranog),
    createMarriage('marriage-alys-fionn-ciarog', ...COUPLES.alys),
    createMarriage('marriage-morgan-aodnait-ciarog', ...COUPLES.morgan),
    createMarriage('marriage-amaethon-clodagh-ciarog', ...COUPLES.amaethon),
    createMarriage('marriage-gwennaelle-diarmait-ciarog', ...COUPLES.gwennaelle),
    createMarriage('marriage-bryce-innogen-ciarog', ...COUPLES.bryce),
    createMarriage('marriage-tarrant-emer-ciarog', ...COUPLES.tarrant),
    createMarriage('marriage-vaughan-ulyana-baedd', ...COUPLES.ulyana),
    createMarriage('marriage-orla-daddweir-ciarog', ...COUPLES.orla),
    createMarriage('marriage-dalvin-llinos-ciarog', ...COUPLES.dalvin),
    createMarriage('marriage-wynndie-sabrian-ciarog', ...COUPLES.wynndie),
    createMarriage('marriage-karanteg-aine-ciarog', ...COUPLES.karanteg),
    createMarriage('marriage-lyon-cymraes-marchog', ...COUPLES.cymraes),
    createMarriage('marriage-yale-aoife-ciarog', ...COUPLES.yale),
    createMarriage('marriage-dyfan-brigid-ciarog', ...COUPLES.dyfan),
    createMarriage('marriage-bhreac-iseult-ciarog', ...COUPLES.bhreac),
    createMarriage('engagement-loyd-emer-casur-ciarog', ...COUPLES.loyd, {
      type: 'engagement',
      notes: 'Emer Casur ist zugleich Karantegs aufgenommenes Mündel und Loyds Verlobte.'
    })
  ],
  parentages: [
    ...gapChildren(['hywel-ciarog', 'gwennog-ciarog', 'mordred-ciarog', 'cynddylan-ciarog']),
    ...childrenOf(['carranog-ciarog', 'alys-ciarog'], 'marriage-hywel-graine-ciarog'),
    ...childrenOf(['morgan-ciarog'], 'marriage-mordred-eibhlin-ciarog'),
    ...childrenOf(['amaethon-ciarog', 'gwennaelle-ciarog'], 'marriage-carranog-laoise-ciarog'),
    ...childrenOf(['bryce-ciarog'], 'marriage-morgan-aodnait-ciarog'),
    ...childrenOf(['tarrant-ciarog', 'ulyana-ciarog', 'orla-ciarog'], 'marriage-amaethon-clodagh-ciarog'),
    ...childrenOf(['dalvin-ciarog', 'wynndie-ciarog'], 'marriage-bryce-innogen-ciarog'),
    ...childrenOf(['karanteg-ciarog', 'cymraes-ciarog', 'yale-ciarog'], 'marriage-tarrant-emer-ciarog'),
    ...childrenOf(['dyfan-ciarog', 'bhreac-ciarog'], 'marriage-dalvin-llinos-ciarog'),
    ...childrenOf(['loyd-ciarog', 'nest-ciarog'], 'marriage-karanteg-aine-ciarog'),
    ...createParentages(['emer-casur'], ['karanteg-ciarog'], '', {
      idPrefix: 'ciarog-parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Emer Casur ist Karantegs aufgenommenes Mündel; die Verbindung ist ausschließlich eine Vormundschaft.'
    }),
    ...childrenOf(['lugh-ciarog', 'shan-ciarog'], 'marriage-yale-aoife-ciarog'),
    ...childrenOf(['nye-ciarog', 'cady-ciarog'], 'marriage-dyfan-brigid-ciarog'),
    ...createParentages(['ultan-tir-fiachiontach'], ['dyfan-ciarog'], '', {
      idPrefix: 'ciarog-parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Ultán Tir Fiachiontach ist Dyfans aufgenommenes Mündel; die Verbindung ist ausschließlich eine Vormundschaft.'
    }),
    ...childrenOf(['cadel-ciarog', 'soffi-ciarog'], 'marriage-bhreac-iseult-ciarog')
  ],
  cadetBranches: [
    marriedAway('married-away-gwennog-ciarog-grawn', 'Haus Grawn', 'marriage-dystan-gwennog', 'house-grawn', AEHRENTAL_HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-alys-ciarog-fiantorc', 'Haus Fiantorc', 'marriage-alys-fionn-ciarog', 'house-fiantorc'),
    marriedAway('married-away-gwennaelle-ciarog-gairner', 'Haus Gáirner', 'marriage-gwennaelle-diarmait-ciarog', 'house-gairner'),
    marriedAway('married-away-ulyana-ciarog-baedd', 'Haus Baedd', 'marriage-vaughan-ulyana-baedd', 'house-baedd', AEHRENTAL_HOUSE_EMBLEMS.baedd),
    marriedAway('married-away-orla-ciarog-mwyalchen', 'Haus Mwyalchen', 'marriage-orla-daddweir-ciarog', 'house-mwyalchen'),
    marriedAway('married-away-wynndie-ciarog-gwarchod', 'Haus Gwarchod', 'marriage-wynndie-sabrian-ciarog', 'house-gwarchod', AEHRENTAL_HOUSE_EMBLEMS.gwarchod),
    marriedAway('married-away-cymraes-ciarog-marchog', 'Haus Marchog', 'marriage-lyon-cymraes-marchog', 'house-marchog', AEHRENTAL_HOUSE_EMBLEMS.marchog)
  ],
  timeJumps: [
    {
      id: TIME_JUMP_ID,
      parentPartnershipId: 'marriage-brogan-hailidhe-ciarog',
      childIds: ['hywel-ciarog', 'gwennog-ciarog', 'mordred-ciarog', 'cynddylan-ciarog'],
      years: 0,
      fromYear: '????',
      toYear: '1602',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Die Quelle markiert nach dem Hauswappen genau eine Überlieferungslücke vor der ab 1602 belegten Generation.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-brogan-hailidhe-ciarog',
    houseId: CIAROG_HOUSE_ID,
    crestSubtitle: 'Ritterfürstengeschlecht von Caer Diwedd · Crannath-Wurzeln',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'brogan-ciarog',
    orientation: 'vertical',
    ancestorDepth: 14,
    descendantDepth: 14,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Genealogie, Lebensdaten, Kopfschaft, Erbfolge und individuelle Porträts folgen der bereitgestellten Ciaróg-Haustabelle samt vollständiger Stammbaumgrafik. Brogan und Hailidhe bilden das Gründerpaar; ihr goldener Hausknoten führt in genau einen strikt seriellen Überlieferungssprung vor die ab 1602 belegte Generation. Emer Casur und Ultán Tir Fiachiontach sind aufgenommene Mündel mit je einer ausschließlichen Pflegebeziehung zu Karanteg beziehungsweise Dyfan und keine leiblichen Ciaróg-Kinder. Emer erscheint nur einmal und ist zusätzlich mit Loyd verlobt; die Darstellung verwendet dafür die Zusatz-Verlobungslinie innerhalb desselben Geschwister- und Mündelblocks. Gwenog, Alys, Gwennaelle, Ulyana, Orla, Wynndie und Cymraes besitzen direkte Wegverheiratet-Knoten. Gemeinsame Weltpersonen, Partnerschafts-IDs und Porträts mit Grawn, Baedd und Marchog werden unverändert wiederverwendet. Die Kinder von Gwenog/Dystan, Ulyana/Vaughan und Cymraes/Lyon bleiben ausschließlich in den fortführenden Gegenakten und werden hier nicht gedoppelt. Die Quellformen Emer An Casur und Emer Casur werden als eine Person geführt; Mywalchen wird zur bestehenden Hausschreibung Mwyalchen normalisiert. Neutrale Standardsilhouetten werden nicht als individuelle Porträts gespeichert.',
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
