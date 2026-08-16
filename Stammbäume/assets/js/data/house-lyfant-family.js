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
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';

const DERWYDDION_HOUSE_ID = 'house-lyfant';
const DERWYDDION_ALIAS_HOUSE_ID = 'house-llyfant';
const CAER_ASGWRN_HOUSE_ID = 'house-lyfant-caer-asgwrn';
const LYFANT_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.lyfant;

const HOUSE_EMBLEMS = Object.freeze({
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
  lyfant: LYFANT_EMBLEM,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
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
  'cledwyn-lyfant': 'person--haus-lyfant--cledwyn-lyfant',
  'cadwgan-lyfant': 'person--haus-lyfant--cadwgan-lyfant'
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
    portrait: HOUSE_LYFANT_PORTRAITS[id] || '',
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

function derwyddionPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(DERWYDDION_HOUSE_ID, id, name, sex, birth, death, options);
}

function caerAsgwrnPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(CAER_ASGWRN_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'lyfant-parentage',
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

const DERWYDDION_HOUSES = Object.freeze([
  house(DERWYDDION_HOUSE_ID, "Haus Lyfant O'Derwyddion", HOUSE_EMBLEMS.lyfant),
  house(DERWYDDION_ALIAS_HOUSE_ID, "Haus Lyfant O'Derwyddion", HOUSE_EMBLEMS.lyfant),
  house(CAER_ASGWRN_HOUSE_ID, "Haus Lyfant O'Caer Asgwrn", HOUSE_EMBLEMS.lyfant),
  house('house-drummond', 'Haus Drummond'),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn"),
  house('house-dianc', 'Haus Dianc'),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-drewi', 'Haus Drewi'),
  house('house-crwynog', 'Haus Crwynog'),
  house('house-gwanrhyd', 'Haus Gwanrhyd'),
  house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau", HOUSE_EMBLEMS.mochdaer),
  house('house-cwningod', 'Haus Cwningod'),
  house('house-serenoc', 'Haus Serenoc'),
  house('house-blodeuwedd', 'Haus Blodeuwedd'),
  house('house-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd)
]);

const CAER_ASGWRN_HOUSES = Object.freeze([
  house(CAER_ASGWRN_HOUSE_ID, "Haus Lyfant O'Caer Asgwrn", HOUSE_EMBLEMS.lyfant),
  house(DERWYDDION_HOUSE_ID, "Haus Lyfant O'Derwyddion", HOUSE_EMBLEMS.lyfant),
  house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau", HOUSE_EMBLEMS.mochdaer),
  house('house-serenoc', 'Haus Serenoc'),
  house('house-eisenbieger', 'Haus Eisenbieger'),
  house('house-walwrs-caer-deheuol', "Haus Walwrs O'Caer Deheuol", KLAUENINSEL_HOUSE_EMBLEMS.walwrs),
  house('house-drummond', 'Haus Drummond'),
  house('house-arfordir', 'Haus Arfordir'),
  house('house-morfil', "Haus Morfil O'Talsarn", HOUSE_EMBLEMS.morfil)
]);

export const HOUSE_LYFANT_DERWYDDION_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-lyfant',
    title: "Haus Lyfant O'Derwyddion",
    motto: 'Mwynha’r byd pan fo’r môr, awyr a sêr yn dy amgylchynu.',
    description: 'Vollständige vennyrianische Herkunftslinie des Ritterfürstenhauses von Derwyddion. Cledwyn und Cadwgan führen getrennt nach Caer Asgwrn; Meredydds vollständig 1720 erloschener Zweig verbleibt ausschließlich in dieser Akte.',
    emblem: LYFANT_EMBLEM,
    houseProfile: GRAUE_WEITE_ORIGIN_HOUSE_PROFILES['lyfant-derwyddion']
  },
  houses: [...DERWYDDION_HOUSES],
  persons: [
    derwyddionPerson('conan-founder-lyfant', 'Conan Lyfant', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: "Gründer des Hauses Lyfant O'Derwyddion"
    }),
    derwyddionPerson('ffion-founder-lyfant', 'Ffion', 'female', '????', '????', {
      familyRole: 'founder',
      title: 'Gründerin und Ehefrau Conans'
    }),

    derwyddionPerson('gareth-lyfant', 'Gareth Lyfant', 'male', '1632', '1693', {
      lineageRole: 'head',
      title: 'Ritterfürst von Derwyddion'
    }),
    derwyddionPerson('sadbh-drummond', 'Sadbh Drummond', 'female', '1633', '1689', {
      houseId: 'house-drummond',
      familyRole: 'married'
    }),
    derwyddionPerson('catryn-llyfant', 'Catryn Lyfant', 'female', '1635', '1652', {
      houseId: DERWYDDION_ALIAS_HOUSE_ID,
      title: 'Wegverheiratet an Haus Blodyn'
    }),
    derwyddionPerson('gruffydd-blodyn', 'Gruffydd Blodyn', 'male', '1635', '1694', {
      houseId: 'house-blodyn',
      familyRole: 'married',
      title: 'König von Vennyr 1668–1694'
    }),
    derwyddionPerson('glesni-lyfant', 'Glesni Lyfant', 'female', '1637', '1701', {
      title: 'Wegverheiratet an Haus Trachwyll'
    }),
    derwyddionPerson('dafydd-trachwyll', 'Dafydd Trachwyll', 'male', '1636', '1705', {
      houseId: 'house-trachwyll-talfronwyn',
      familyRole: 'married',
      notes: 'Das Quellbild ist veraltet und wird daher bewusst nicht übernommen.'
    }),

    derwyddionPerson('macsen-lyfant', 'Macsen Lyfant', 'male', '1654', '1698'),
    derwyddionPerson('gwenhwyfach-dianc', 'Gwenhwyfach Dianc', 'female', '1655', '1699', {
      houseId: 'house-dianc',
      familyRole: 'married'
    }),
    derwyddionPerson('taleyth-lyfant', 'Taleyth Lyfant', 'male', '1656', '1700', {
      title: 'Unverheiratet'
    }),
    derwyddionPerson('mairwen-lyfant', 'Mairwen Lyfant', 'female', '1656', '1710', {
      title: 'Wegverheiratet an Haus Drewi'
    }),
    derwyddionPerson('gereint-drewi', 'Gereint Drewi', 'male', '1660', '1685', {
      houseId: 'house-drewi',
      familyRole: 'married',
      notes: 'Das Quellbild ist veraltet und wird daher bewusst nicht übernommen.'
    }),
    derwyddionPerson('telyn-lyfant', 'Telyn Lyfant', 'female', '1656', '1718', {
      title: 'Wegverheiratet an Haus Crwynog'
    }),
    derwyddionPerson('wynfor-crwynog', 'Wynfor Crwynog', 'male', '1652', '1720', {
      houseId: 'house-crwynog',
      familyRole: 'married'
    }),
    derwyddionPerson('tomos-lyfant', 'Tomos Lyfant', 'male', '1658', '1720'),
    derwyddionPerson('blaun-gwanrhyd', 'Blaun Gwanrhyd', 'female', '1658', '1720', {
      houseId: 'house-gwanrhyd',
      familyRole: 'married'
    }),

    derwyddionPerson('cledwyn-lyfant', 'Cledwyn Lyfant', 'male', '1672', '', {
      lineageRole: 'head',
      title: 'Letzter Ritterfürst von Derwyddion · Begründer der Caer-Asgwrn-Linie'
    }),
    derwyddionPerson('rhosyn-mochdaer', 'Rhosyn Mochdaer', 'female', '1673', '1720', {
      houseId: 'house-mochdaer-gwyliau',
      familyRole: 'married'
    }),
    derwyddionPerson('mared-lyfant', 'Mared Lyfant', 'female', '1682', '', {
      title: 'Wegverheiratet an Haus Cwningod'
    }),
    derwyddionPerson('teudebur-cwningod', 'Teudebur Cwningod', 'male', '1678', '', {
      houseId: 'house-cwningod',
      familyRole: 'married'
    }),
    derwyddionPerson('cadwgan-lyfant', 'Cadwgan Lyfant', 'male', '1674', '1735', {
      title: 'Mitausgewanderter Seitenzweig der Caer-Asgwrn-Linie'
    }),
    derwyddionPerson('neila-serenoc', 'Neila Serenoc', 'female', '1674', '1730', {
      houseId: 'house-serenoc',
      familyRole: 'married'
    }),
    derwyddionPerson('lanette-lyfant', 'Lanette Lyfant', 'female', '1677', '1720', {
      title: 'Wegverheiratet an Haus Blodeuwedd'
    }),
    derwyddionPerson('edlym-blodeuwedd', 'Edlym Blodeuwedd', 'male', '1674', '1720', {
      houseId: 'house-blodeuwedd',
      familyRole: 'married'
    }),

    derwyddionPerson('ffion-lyfant', 'Ffion Lyfant', 'female', '1675', '1720', {
      title: 'Wegverheiratet an Haus Gwenyen'
    }),
    derwyddionPerson('owain-gwenyen', 'Owain Gwenyen', 'male', '1672', '1720', {
      houseId: 'house-gwenyen',
      familyRole: 'married'
    }),
    derwyddionPerson('meredydd-lyfant', 'Meredydd Lyfant', 'male', '1676', '1720', {
      title: 'In Derwyddion verbliebener Seitenzweig'
    }),
    derwyddionPerson('main-trachwyll', 'Main Trachwyll', 'female', '1671', '1720', {
      houseId: 'house-trachwyll-talfronwyn',
      familyRole: 'married'
    }),
    derwyddionPerson('deiniol-lyfant', 'Deiniol Lyfant', 'male', '1696', '1720', {
      notes: 'Starb mit seinem in Derwyddion verbliebenen Familienzweig im Jahr 1720.'
    }),
    derwyddionPerson('agnes', 'Agnes', 'female', '1696', '', {
      houseId: '',
      familyRole: 'married',
      notes: 'Das Quellbild ist veraltet und wird daher bewusst nicht übernommen.'
    }),
    derwyddionPerson('frewi-llyfant', 'Frewi Llyfant', 'female', '1698', '1720', {
      houseId: DERWYDDION_ALIAS_HOUSE_ID,
      title: 'Wegverheiratet an Haus Gwaedlyd'
    }),
    derwyddionPerson('uryen-gwaedlyd', 'Uryen Gwaedlyd', 'male', '1692', '1720', {
      houseId: 'house-gwaedlyd',
      familyRole: 'married'
    }),
    derwyddionPerson('ceri-lyfant', 'Ceri Lyfant', 'male', '1713', '1720', {
      notes: 'Letzter Sprössling von Deiniols Derwyddion-Zweig; 1720 verstorben.'
    }),
    derwyddionPerson('cadi-lyfant', 'Cadi Lyfant', 'female', '1716', '1720', {
      notes: 'Letzter Sprössling von Deiniols Derwyddion-Zweig; 1720 verstorben.'
    })
  ],
  partnerships: [
    endedMarriage('marriage-conan-ffion-founders-lyfant', 'conan-founder-lyfant', 'ffion-founder-lyfant'),
    endedMarriage('marriage-gareth-sadbh-lyfant', 'gareth-lyfant', 'sadbh-drummond'),
    createMarriage('marriage-gruffydd-catryn', 'gruffydd-blodyn', 'catryn-llyfant'),
    endedMarriage('marriage-glesni-dafydd-lyfant', 'glesni-lyfant', 'dafydd-trachwyll'),
    endedMarriage('marriage-macsen-gwenhwyfach-lyfant', 'macsen-lyfant', 'gwenhwyfach-dianc'),
    endedMarriage('marriage-mairwen-gereint-lyfant', 'mairwen-lyfant', 'gereint-drewi'),
    endedMarriage('marriage-telyn-wynfor-lyfant', 'telyn-lyfant', 'wynfor-crwynog'),
    endedMarriage('marriage-tomos-blaun-lyfant', 'tomos-lyfant', 'blaun-gwanrhyd', '1720'),
    endedMarriage('marriage-rhosyn-cledwyn-mochdaer', 'rhosyn-mochdaer', 'cledwyn-lyfant'),
    createMarriage('marriage-mared-teudebur-lyfant', 'mared-lyfant', 'teudebur-cwningod'),
    endedMarriage('marriage-cadwgan-neila-lyfant', 'cadwgan-lyfant', 'neila-serenoc', '1730'),
    endedMarriage('marriage-lanette-edlym-lyfant', 'lanette-lyfant', 'edlym-blodeuwedd', '1720'),
    endedMarriage('marriage-ffion-owain-lyfant', 'ffion-lyfant', 'owain-gwenyen', '1720'),
    endedMarriage('marriage-meredydd-main-lyfant', 'meredydd-lyfant', 'main-trachwyll', '1720'),
    endedMarriage('marriage-deiniol-agnes-lyfant', 'deiniol-lyfant', 'agnes', '1720'),
    endedMarriage('marriage-uryen-frewi-gwaedlyd', 'uryen-gwaedlyd', 'frewi-llyfant', '1720')
  ],
  parentages: [
    ...childrenOf(['gareth-lyfant', 'catryn-llyfant', 'glesni-lyfant'], ['conan-founder-lyfant', 'ffion-founder-lyfant'], 'marriage-conan-ffion-founders-lyfant', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen den Gründern und der ab 1632 wieder belegten Linie liegen nicht einzeln benannte Generationen.'
    }),
    ...childrenOf(['macsen-lyfant', 'taleyth-lyfant', 'mairwen-lyfant', 'telyn-lyfant', 'tomos-lyfant'], ['gareth-lyfant', 'sadbh-drummond'], 'marriage-gareth-sadbh-lyfant'),
    ...childrenOf(['cledwyn-lyfant', 'mared-lyfant', 'cadwgan-lyfant', 'lanette-lyfant'], ['macsen-lyfant', 'gwenhwyfach-dianc'], 'marriage-macsen-gwenhwyfach-lyfant'),
    ...childrenOf(['ffion-lyfant', 'meredydd-lyfant'], ['tomos-lyfant', 'blaun-gwanrhyd'], 'marriage-tomos-blaun-lyfant'),
    ...childrenOf(['deiniol-lyfant', 'frewi-llyfant'], ['meredydd-lyfant', 'main-trachwyll'], 'marriage-meredydd-main-lyfant'),
    ...childrenOf(['ceri-lyfant', 'cadi-lyfant'], ['deiniol-lyfant', 'agnes'], 'marriage-deiniol-agnes-lyfant')
  ],
  cadetBranches: [
    marriedAway('married-away-catryn-lyfant-blodyn', 'Haus Blodyn', 'marriage-gruffydd-catryn', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-glesni-lyfant-trachwyll', "Haus Trachwyll O'Talfronwyn", 'marriage-glesni-dafydd-lyfant', 'house-trachwyll-talfronwyn', 'haus-trachwyll-talfronwyn'),
    marriedAway('married-away-mairwen-lyfant-drewi', 'Haus Drewi', 'marriage-mairwen-gereint-lyfant', 'house-drewi', 'haus-drewi'),
    marriedAway('married-away-telyn-lyfant-crwynog', 'Haus Crwynog', 'marriage-telyn-wynfor-lyfant', 'house-crwynog', 'haus-crwynog'),
    createSingleFounderHouseBranch({
      id: 'migration-cledwyn-lyfant-caer-asgwrn',
      name: "Haus Lyfant O'Caer Asgwrn",
      parentPersonId: 'cledwyn-lyfant',
      houseId: CAER_ASGWRN_HOUSE_ID,
      targetFamilyId: 'haus-lyfant-caer-asgwrn',
      emblem: LYFANT_EMBLEM,
      founded: '1720',
      subtitle: 'Cledwyns primär fortgeführte Ritterfürstenlinie in Caer Asgwrn',
      crestFrame: 'gold',
      notes: 'Der Übergang hängt allein und geradlinig unter Cledwyn. Seine Nachkommen werden ausschließlich in der Zielakte fortgeführt.'
    }),
    marriedAway('married-away-mared-lyfant-cwningod', 'Haus Cwningod', 'marriage-mared-teudebur-lyfant', 'house-cwningod', 'haus-cwningod'),
    createSingleFounderHouseBranch({
      id: 'migration-cadwgan-lyfant-caer-asgwrn',
      name: "Haus Lyfant O'Caer Asgwrn",
      parentPersonId: 'cadwgan-lyfant',
      houseId: CAER_ASGWRN_HOUSE_ID,
      targetFamilyId: 'haus-lyfant-caer-asgwrn',
      emblem: LYFANT_EMBLEM,
      founded: '1720',
      subtitle: 'Cadwgans fortgeführter Seitenzweig in Caer Asgwrn',
      crestFrame: 'gold',
      notes: 'Cadwgan bleibt in Derwyddion sichtbar und wird zugleich als genealogischer Anker seiner Kinder in der Zielakte wiederholt. Der Übergang hängt allein unter ihm.'
    }),
    marriedAway('married-away-lanette-lyfant-blodeuwedd', 'Haus Blodeuwedd', 'marriage-lanette-edlym-lyfant', 'house-blodeuwedd', 'haus-blodeuwedd'),
    marriedAway('married-away-ffion-lyfant-gwenyen', 'Haus Gwenyen', 'marriage-ffion-owain-lyfant', 'house-gwenyen', 'haus-gwenyen'),
    marriedAway('married-away-frewi-lyfant-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", 'marriage-uryen-frewi-gwaedlyd', 'house-gwaedlyd', 'haus-gwaedlyd', HOUSE_EMBLEMS.gwaedlyd)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-conan-ffion-founders-lyfant',
    houseId: DERWYDDION_HOUSE_ID,
    crestSubtitle: 'Altes Ritterfürstenhaus von Derwyddion',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1632',
      label: 'Die belegte Linie setzt 1632 mit Gareth, Catryn und Glesni wieder ein'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'conan-founder-lyfant',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-lyfant-caer-asgwrn',
    sourceRevision: 1,
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'timeGap'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Vollständige Derwyddion-Herkunftsakte nach der Lyfant-Quelle. Der Hausknoten und der einzige Zeitsprung folgen seriell auf Conan und Ffion. Cledwyn und Cadwgan erhalten je einen direkten Übergang nach Caer Asgwrn; ihre Kinder werden nur dort fortgeführt. Meredydd, Main, Deiniol, Frewi sowie Ceri und Cadi bleiben ausschließlich in Derwyddion, weil dieser Zweig 1720 erlischt. Frewis Ehe und Nachkommen werden im Gegenstammbaum Gwaedlyd fortgeführt.'
  }
});

export const HOUSE_LYFANT_CAER_ASGWRN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-lyfant-caer-asgwrn',
    title: "Haus Lyfant O'Caer Asgwrn",
    motto: 'Mwynha’r byd pan fo’r môr, awyr a sêr yn dy amgylchynu.',
    description: 'Die seit 1720 von Cledwyn primär geführte Ritterfürstenlinie in Caer Asgwrn. Cadwgan und seine Kinder bilden den mitausgewanderten Seitenzweig; Meredydds erloschene Linie verbleibt in Derwyddion.',
    emblem: LYFANT_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.lyfant
  },
  houses: [...CAER_ASGWRN_HOUSES],
  persons: [
    caerAsgwrnPerson('cledwyn-lyfant', 'Cledwyn Lyfant', 'male', '1672', '', {
      lineageRole: 'head',
      title: 'Ritterfürst von Caer Asgwrn seit 1720 · Begründer der neuen Linie'
    }),
    caerAsgwrnPerson('rhosyn-mochdaer', 'Rhosyn Mochdaer', 'female', '1673', '1720', {
      houseId: 'house-mochdaer-gwyliau',
      familyRole: 'married',
      title: 'Erste Ehefrau Cledwyns · Mutter seines fortgeführten Zweigs'
    }),
    caerAsgwrnPerson('cadwgan-lyfant', 'Cadwgan Lyfant', 'male', '1674', '1735', {
      title: 'Mitausgewanderter Seitenzweig in Caer Asgwrn'
    }),
    caerAsgwrnPerson('neila-serenoc', 'Neila Serenoc', 'female', '1674', '1730', {
      houseId: 'house-serenoc',
      familyRole: 'married'
    }),

    caerAsgwrnPerson('rhisiart-lyfant', 'Rhisiart Lyfant', 'male', '1696', '', {
      lineageRole: 'mainline',
      title: 'Erster Erbe des Hauses Lyfant'
    }),
    caerAsgwrnPerson('gunhild-eisenbieger', 'Gunhild Eisenbieger', 'female', '1699', '', {
      houseId: 'house-eisenbieger',
      familyRole: 'married',
      notes: 'Das Quellbild ist veraltet und wird daher bewusst nicht übernommen.'
    }),
    caerAsgwrnPerson('goronwy-lyfant', 'Goronwy Lyfant', 'male', '1698', ''),
    caerAsgwrnPerson('aine-drummond', 'Aine Drummond', 'female', '1705', '', {
      houseId: 'house-drummond',
      familyRole: 'married',
      notes: 'Das Quellbild ist veraltet und wird daher bewusst nicht übernommen.'
    }),
    caerAsgwrnPerson('bethan-lyfant', 'Bethan Lyfant', 'female', '1700', '', {
      title: 'Wegverheiratet an Haus Walwrs'
    }),
    caerAsgwrnPerson('pryderi-walwrs', 'Pryderi Walwrs', 'male', '1699', '', {
      worldPersonId: 'person--haus-walwrs--pryderi-walwrs',
      houseId: 'house-walwrs-caer-deheuol',
      familyRole: 'married'
    }),
    caerAsgwrnPerson('yale-lyfant', 'Yale Lyfant', 'male', '1696', '', {
      title: 'Sohn Cadwgans · fortgeführter Caer-Asgwrn-Zweig'
    }),
    caerAsgwrnPerson('morgana-arfordir', 'Morgana Arfordir', 'female', '1698', '', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),
    caerAsgwrnPerson('eilun-llyfant', 'Eilun Llyfant', 'female', '1697', '', {
      title: 'Wegverheiratet an Haus Morfil'
    }),
    caerAsgwrnPerson('guto-morfil', 'Guto Morfil', 'male', '1696', '', {
      houseId: 'house-morfil',
      familyRole: 'married'
    }),

    caerAsgwrnPerson('conan-young-lyfant', 'Conan Lyfant', 'male', '????', ''),
    caerAsgwrnPerson('heulwen-lyfant', 'Heulwen Lyfant', 'female', '????', ''),
    caerAsgwrnPerson('derfel-lyfant', 'Derfel Lyfant', 'male', '????', ''),
    caerAsgwrnPerson('cybi-lyfant', 'Cybi Lyfant', 'male', '????', ''),
    caerAsgwrnPerson('crispin-lyfant', 'Crispin Lyfant', 'male', '????', ''),
    caerAsgwrnPerson('eilin-lyfant', 'Eilin Lyfant', 'female', '????', '')
  ],
  partnerships: [
    endedMarriage('marriage-rhosyn-cledwyn-mochdaer', 'rhosyn-mochdaer', 'cledwyn-lyfant'),
    endedMarriage('marriage-cadwgan-neila-lyfant', 'cadwgan-lyfant', 'neila-serenoc', '1730'),
    createMarriage('marriage-rhisiart-gunhild-lyfant', 'rhisiart-lyfant', 'gunhild-eisenbieger'),
    createMarriage('marriage-goronwy-aine-lyfant', 'goronwy-lyfant', 'aine-drummond'),
    createMarriage('marriage-bethan-pryderi-lyfant', 'bethan-lyfant', 'pryderi-walwrs'),
    createMarriage('marriage-yale-morgana-lyfant', 'yale-lyfant', 'morgana-arfordir'),
    createMarriage('marriage-guto-eilun-morfil', 'guto-morfil', 'eilun-llyfant')
  ],
  parentages: [
    ...childrenOf(['rhisiart-lyfant', 'goronwy-lyfant', 'bethan-lyfant'], ['cledwyn-lyfant', 'rhosyn-mochdaer'], 'marriage-rhosyn-cledwyn-mochdaer'),
    ...childrenOf(['yale-lyfant', 'eilun-llyfant'], ['cadwgan-lyfant', 'neila-serenoc'], 'marriage-cadwgan-neila-lyfant'),
    ...childrenOf(['conan-young-lyfant', 'heulwen-lyfant'], ['rhisiart-lyfant', 'gunhild-eisenbieger'], 'marriage-rhisiart-gunhild-lyfant'),
    ...childrenOf(['derfel-lyfant', 'cybi-lyfant'], ['goronwy-lyfant', 'aine-drummond'], 'marriage-goronwy-aine-lyfant'),
    ...childrenOf(['crispin-lyfant', 'eilin-lyfant'], ['yale-lyfant', 'morgana-arfordir'], 'marriage-yale-morgana-lyfant')
  ],
  cadetBranches: [
    marriedAway('married-away-bethan-lyfant-walwrs', "Haus Walwrs O'Caer Deheuol", 'marriage-bethan-pryderi-lyfant', 'house-walwrs-caer-deheuol', 'haus-walwrs-caer-deheuol', KLAUENINSEL_HOUSE_EMBLEMS.walwrs),
    marriedAway('married-away-eilun-lyfant-morfil', "Haus Morfil O'Talsarn", 'marriage-guto-eilun-morfil', 'house-morfil', 'haus-morfil', HOUSE_EMBLEMS.morfil)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: '',
    houseId: CAER_ASGWRN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Caer Asgwrn · seit 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'lyfant-derwyddion-origin',
      houseId: DERWYDDION_HOUSE_ID,
      name: "Haus Lyfant O'Derwyddion",
      subtitle: 'Vennyrianische Herkunftslinie · Übergang nach Caer Asgwrn 1720',
      emblem: LYFANT_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['cledwyn-lyfant', 'cadwgan-lyfant'],
      targetFamilyId: 'haus-lyfant',
      notes: 'Cledwyn bildet die primäre neue Linie; Cadwgan wird als zweiter ausgewanderter Elternanker mit seinen Kindern mitgeführt. Meredydd und seine vollständig 1720 verstorbene Linie sind bewusst nicht enthalten.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'cledwyn-lyfant',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-lyfant',
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Caer-Asgwrn-Nachfolgeakte mit Cledwyn als primärem Linienführer. Cledwyn und Cadwgan erscheinen erneut als genealogische Anker; nur ihre Kinder und Kindeskinder werden hier fortgeführt. Meredydd, Main, Deiniol, Frewi, Ceri und Cadi verbleiben ausschließlich in Derwyddion. Die Kinder der wegverheirateten Eilun werden nur im Morfil-Stammbaum geführt. Bethans Ehe mit Pryderi verweist auf die neue Caer-Deheuol-Akte, in der ihre Walwrs-Kinder ausschließlich fortgeführt werden.'
  }
});

export const LYFANT_HOUSE_FAMILIES = Object.freeze([
  HOUSE_LYFANT_DERWYDDION_FAMILY,
  HOUSE_LYFANT_CAER_ASGWRN_FAMILY
]);
