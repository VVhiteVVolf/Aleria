import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_DAL_CRUTHIN_LOCAL_PORTRAIT_IDS,
  HOUSE_DAL_CRUTHIN_PORTRAITS,
  HOUSE_DAL_CRUTHIN_REUSED_PORTRAIT_IDS
} from './house-dal-cruthin-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';

const CRUTHIN_HOUSE_ID = 'house-cruthin';
const CRUTHIN_EMBLEM = TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin'];

const HOUSE_HEAD_IDS = new Set([
  'fearghus-founder-cruthin',
  'fionntan-cruthin',
  'haolthan-cruthin',
  'cathaoir-cruthin'
]);

const SUCCESSION_IDS = new Set(['meallchu-cruthin', 'kolman-cruthin']);

const HEAD_TITLES = Object.freeze({
  'fearghus-founder-cruthin': 'Gründer und erster Mor Tiarna des Clans Dál’Cruthin',
  'fionntan-cruthin': 'Mor Tiarna von Tir na Gortanna · bis 1671',
  'haolthan-cruthin': 'Mor Tiarna von Tir na Gortanna · 1671–1694',
  'cathaoir-cruthin': 'Mor Tiarna von Tir na Gortanna · seit 1694',
  'meallchu-cruthin': 'Erster der Erbfolge des Mor Tiarna',
  'kolman-cruthin': 'Zweiter der Erbfolge des Mor Tiarna'
});

const TARGETS = Object.freeze({
  frisealach: Object.freeze({
    name: 'Ard Frisealach',
    houseId: 'house-frisealach',
    targetFamilyId: 'haus-frisealach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-airt']
  }),
  cuinn: Object.freeze({
    name: 'Clan Tir An’Cuinn',
    houseId: 'house-cuinn',
    targetFamilyId: 'haus-tir-an-cuinn',
    emblem: LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn']
  }),
  cumhail: Object.freeze({
    name: 'Clan Mac Ard Cumhaill',
    houseId: 'house-cumhail',
    targetFamilyId: 'haus-mac-ard-cumhaill',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']
  }),
  tarvo: Object.freeze({
    name: 'Clan Fir An’Tarvo',
    houseId: 'house-tarvo',
    targetFamilyId: 'haus-fir-an-tarvo',
    emblem: LEITHEACH_HOUSE_EMBLEMS['fir-an-tarvo']
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CRUTHIN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_DAL_CRUTHIN_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === CRUTHIN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, 'female', birth, death, CRUTHIN_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
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
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'dal-cruthin-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
}

function marriedAway(id, partnershipId, targetKey) {
  const target = TARGETS[targetKey];
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: { chartAlignBelowPartnership: true }
  });
}

const FEARGHUS_IDS = ['fearghus-founder-cruthin', 'sorcha-founder-cruthin'];
const FIONNTAN_IDS = ['fionntan-cruthin', 'saorghlas-cuinn'];
const JEARLACH_IDS = ['jearlach-cruthin', 'draighneach-tordach'];
const HAOLTHAN_IDS = ['haolthan-cruthin', 'caomhfionn-ceallaigh'];
const JONEEN_IDS = ['joneen-cruthin', 'kalman-frisealach'];
const CLEIRCHIN_IDS = ['cleirchin-cruthin', 'pailin-caoimhe'];
const CNAMHFHIONN_IDS = ['samthann-gealach', 'cnamhfhionn-cruthin'];
const CATHAOIR_IDS = ['cathaoir-cruthin', 'zeilthra-tarvo'];
const DUANA_IDS = ['duana-cruthin', 'aidan-airt'];
const GEALLAN_IDS = ['geallan-cruthin', 'keava-iomrach'];
const CAOIMHIN_IDS = ['keelaith-gallchobhair', 'caoimhin-cruthin'];
const MACHA_IDS = ['macha-cruthin', 'gofraidh-cuinn'];
const BROGAN_IDS = ['brogan-cruthin', 'caireall-trodach'];
const CATHALAN_IDS = ['cathalan-cruthin', 'bronnach-frisealach'];
const MEALLCHU_IDS = ['meallchu-cruthin', 'latharna-caoimhe'];
const POLAIN_IDS = ['senan-1700-cumhail', 'polain-cruthin'];
const FEARGHUS_1699_IDS = ['fearghus-1699-cruthin', 'ailidh-somhairle'];
const LACHTNAID_IDS = ['lachtnaid-cruthin', 'tiona-laidir'];
const SORCHA_1700_IDS = ['sorcha-1700-cruthin', 'gaius-tarvo'];
const KOIBHNE_IDS = ['koibhne-cruthin', 'zolaith-gortach'];

export const HOUSE_DAL_CRUTHIN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dal-cruthin',
    title: 'Clan Dál’Cruthin',
    motto: '',
    description: 'Mor-Tiarna-Clan von Tir na Gortanna mit Sitz in Lochansail; gegründet von Fearghus, einem Bastard der Mac Suileach.',
    emblem: CRUTHIN_EMBLEM,
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES['dal-cruthin']
  },
  houses: [
    house(CRUTHIN_HOUSE_ID, 'Clan Dál’Cruthin', CRUTHIN_EMBLEM),
    house('house-suileach', 'Mac Suileach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.suileach),
    house('house-cuinn', 'Clan Tir An’Cuinn', LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn']),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-ceallaigh', 'Haus Ceallaigh'),
    house('house-frisealach', 'Ard Frisealach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach),
    house('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-tarvo', 'Clan Fir An’Tarvo', LEITHEACH_HOUSE_EMBLEMS['fir-an-tarvo']),
    house('house-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-iomrach', 'Haus An’Iomrach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach),
    house('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']),
    house('house-somhairle', 'Sidhe Somhairle', TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle),
    house('house-laidir', 'Haus Laidir'),
    house('house-gortach', 'Haus Gortach'),
    house('house-cein', 'Haus Céin')
  ],
  persons: [
    person('fearghus-founder-cruthin', 'Fearghus Cruthin', 'male', '????', '????', CRUTHIN_HOUSE_ID, {
      tags: ['Gründer', 'Bastard'],
      notes: 'Gründer des Clans Dál’Cruthin und Bastard der Mac Suileach.'
    }),
    spouse('sorcha-founder-cruthin', 'Sorcha', 'female', '????', '????'),

    person('fionntan-cruthin', 'Fionntan Cruthin', 'male', '1602', '1671'),
    spouse('saorghlas-cuinn', 'Saorghlas Cuinn', 'female', '1603', '1685', 'house-cuinn'),
    person('jearlach-cruthin', 'Jéarlach Cruthin', 'male', '1607', '1681'),
    spouse('draighneach-tordach', 'Draighneach Trodach', 'female', '1610', '1691', 'house-trodach', {
      extensions: { registryManagedFields: ['name'] }
    }),

    person('haolthan-cruthin', 'Haolthan Cruthin', 'male', '1620', '1694'),
    spouse('caomhfionn-ceallaigh', 'Caomhfionn Ceallaigh', 'female', '1623', '1697', 'house-ceallaigh'),
    awayWoman('joneen-cruthin', 'Joneen Cruthin', '1628', '1701', 'frisealach'),
    spouse('kalman-frisealach', 'Kalman Frisealach', 'male', '1626', '1681', 'house-frisealach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('cleirchin-cruthin', 'Cléirchín Cruthin', 'male', '1628', '1675'),
    spouse('pailin-caoimhe', 'Páilín Caoimhe', 'female', '1625', '1701', 'house-caoimhe', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('cnamhfhionn-cruthin', 'Cnámhfhionn Cruthin', '1632', '1679', 'gaelach'),
    spouse('samthann-gealach', 'Samthann Gealach', 'male', '1627', '1698', 'house-gealach'),

    person('cathaoir-cruthin', 'Cathaoir Cruthin', 'male', '1641', '', CRUTHIN_HOUSE_ID, {
      notes: 'Seit 46 Jahren Mor Tiarna. Trotz seines hohen Alters und körperlichen Verfalls gilt er als geistig scharf und für sein außergewöhnliches Gedächtnis bekannt.'
    }),
    spouse('zeilthra-tarvo', 'Zeilthra Tarvo', 'female', '1652', '1733', 'house-tarvo'),
    awayWoman('duana-cruthin', 'Duana Cruthin', '1646', '1700', 'airt'),
    spouse('aidan-airt', 'Aidan Airt', 'male', '1646', '1715', 'house-airt'),
    person('rionach-cruthin', 'Rionach Cruthin', 'female', '1648', '', CRUTHIN_HOUSE_ID, {
      title: 'Magierin des Clans Dál’Cruthin',
      tags: ['Magierin'],
      notes: 'Rionach ist als Magierin überliefert.'
    }),
    person('geallan-cruthin', 'Geallán Cruthin', 'male', '1651', '1714'),
    spouse('keava-iomrach', 'Keava Iomrach', 'female', '1654', '1711', 'house-iomrach'),

    person('caoimhin-cruthin', 'Caoimhín Cruthin', 'male', '1670', ''),
    spouse('keelaith-gallchobhair', 'Keelaith Gallchobhair', 'female', '1674', '', 'house-gallchobhair'),
    awayWoman('macha-cruthin', 'Mácha Cruthin', '1675', '', 'cuinn'),
    spouse('gofraidh-cuinn', 'Gofraidh Cuinn', 'male', '1670', '', 'house-cuinn'),
    person('brogan-cruthin', 'Brogan Cruthin', 'female', '1675', '', CRUTHIN_HOUSE_ID, {
      extensions: { registryManagedFields: ['sex'] }
    }),
    spouse('caireall-trodach', 'Caireall Trodach', 'male', '1671', '', 'house-trodach', {
      extensions: { registryManagedFields: ['sex', 'portrait'] }
    }),
    person('cathalan-cruthin', 'Cáthalán Cruthin', 'male', '1677', ''),
    spouse('bronnach-frisealach', 'Bronnach Frisealach', 'female', '1679', '', 'house-frisealach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    person('meallchu-cruthin', 'Meallchú Cruthin', 'male', '1691', ''),
    spouse('latharna-caoimhe', 'Latharna Caoimhe', 'female', '1697', '', 'house-caoimhe', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('polain-cruthin', 'Pólain Cruthin', '1700', '', 'cumhail'),
    spouse('senan-1700-cumhail', 'Senán Cumhail', 'male', '1700', '', 'house-cumhail'),
    person('ruairi-cruthin', 'Ruairí Cruthin', 'male', '1695', ''),
    person('fearghus-1699-cruthin', 'Fearghus Cruthin', 'male', '1699', ''),
    spouse('ailidh-somhairle', 'Ailidh Somhairle', 'female', '1701', '', 'house-somhairle'),
    person('lachtnaid-cruthin', 'Lachtnaid Cruthin', 'male', '1695', ''),
    spouse('tiona-laidir', 'Tíona Laidir', 'female', '1698', '', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('sorcha-1700-cruthin', 'Sorcha Cruthin', '1700', '', 'tarvo'),
    spouse('gaius-tarvo', 'Gaius Tarvo', 'male', '1696', '', 'house-tarvo', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('koibhne-cruthin', 'Koibhne Cruthin', 'male', '1702', ''),
    spouse('zolaith-gortach', 'Zólaith Gortach', 'female', '1704', '', 'house-gortach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    person('tamsin-cruthin', 'Tamsin Cruthin', 'female', '1719', ''),
    person('kolman-cruthin', 'Kólmán Cruthin', 'male', '1724', ''),
    person('neartfhlaith-cein', 'Neartfhlaith Cein', 'female', '1726', '', 'house-cein', {
      familyRole: 'ward',
      title: 'Mündel Ruairí Cruthins',
      tags: ['Mündel'],
      notes: 'Die Quelltabelle bezeichnet Neartfhlaith als Mündel; ihre Position ordnet sie Ruairís unverheirateter Linie zu.'
    }),
    person('mairtin-cruthin', 'Máirtín Cruthin', 'male', '1722', ''),
    person('priosa-cruthin', 'Príosa Cruthin', 'female', '1726', ''),
    person('loreen-cruthin', 'Loreen Cruthin', 'female', '1723', ''),
    person('ollamh-cruthin', 'Ollamh Cruthin', 'male', '1725', ''),
    person('padraig-cruthin', 'Pádraig Cruthin', 'male', '1727', ''),
    person('nollaig-cruthin', 'Nollaig Cruthin', 'female', '1730', '')
  ],
  partnerships: [
    endedMarriage('marriage-fearghus-sorcha-cruthin', FEARGHUS_IDS),
    endedMarriage('marriage-fionntan-saorghlas', FIONNTAN_IDS, '1671'),
    endedMarriage('marriage-jearlach-draighneach', JEARLACH_IDS, '1681'),
    endedMarriage('marriage-haolthan-caomhfionn', HAOLTHAN_IDS, '1694'),
    endedMarriage('marriage-joneen-kalman', JONEEN_IDS, '1681'),
    endedMarriage('marriage-cleirchin-pailin', CLEIRCHIN_IDS, '1675'),
    endedMarriage('marriage-samthann-cnamhfhionn', CNAMHFHIONN_IDS, '1679'),
    endedMarriage('marriage-cathaoir-zeilthra', CATHAOIR_IDS, '1733'),
    endedMarriage('marriage-duana-aidan', DUANA_IDS, '1700'),
    endedMarriage('marriage-geallan-keava', GEALLAN_IDS, '1711'),
    createMarriage('marriage-keelaith-caoimhin', ...CAOIMHIN_IDS),
    createMarriage('marriage-macha-gofraidh', ...MACHA_IDS),
    createMarriage('marriage-brogan-caireall', ...BROGAN_IDS),
    createMarriage('marriage-cathalan-bronnach', ...CATHALAN_IDS),
    createMarriage('marriage-meallchu-latharna', ...MEALLCHU_IDS),
    createMarriage('marriage-senan-polain', ...POLAIN_IDS),
    createMarriage('marriage-fearghus-ailidh', ...FEARGHUS_1699_IDS),
    createMarriage('marriage-lachtnaid-tiona', ...LACHTNAID_IDS),
    createMarriage('marriage-sorcha-gaius', ...SORCHA_1700_IDS),
    createMarriage('marriage-koibhne-zolaith', ...KOIBHNE_IDS)
  ],
  parentages: [
    ...childrenOf(['fionntan-cruthin', 'jearlach-cruthin'], FEARGHUS_IDS, 'marriage-fearghus-sorcha-cruthin', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und der ab 1602 datierten Linie fehlen einzeln überlieferte Generationen.',
      extensions: { timeJumpId: 'gap-fearghus-fionntan-jearlach' }
    }),
    ...childrenOf(['haolthan-cruthin', 'joneen-cruthin'], FIONNTAN_IDS, 'marriage-fionntan-saorghlas'),
    ...childrenOf(['cleirchin-cruthin', 'cnamhfhionn-cruthin'], JEARLACH_IDS, 'marriage-jearlach-draighneach'),
    ...childrenOf(
      ['cathaoir-cruthin', 'duana-cruthin', 'rionach-cruthin', 'geallan-cruthin'],
      HAOLTHAN_IDS,
      'marriage-haolthan-caomhfionn'
    ),
    ...childrenOf(['caoimhin-cruthin', 'macha-cruthin'], CATHAOIR_IDS, 'marriage-cathaoir-zeilthra'),
    ...childrenOf(['brogan-cruthin', 'cathalan-cruthin'], GEALLAN_IDS, 'marriage-geallan-keava'),
    ...childrenOf(
      ['meallchu-cruthin', 'polain-cruthin', 'ruairi-cruthin', 'fearghus-1699-cruthin'],
      CAOIMHIN_IDS,
      'marriage-keelaith-caoimhin'
    ),
    ...childrenOf(['lachtnaid-cruthin', 'sorcha-1700-cruthin', 'koibhne-cruthin'], CATHALAN_IDS, 'marriage-cathalan-bronnach'),
    ...childrenOf(['tamsin-cruthin', 'kolman-cruthin'], MEALLCHU_IDS, 'marriage-meallchu-latharna'),
    ...childrenOf(['neartfhlaith-cein'], ['ruairi-cruthin'], '', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Neartfhlaith ist Ruairís Mündel und kein leibliches Kind.'
    }),
    ...childrenOf(['mairtin-cruthin', 'priosa-cruthin'], FEARGHUS_1699_IDS, 'marriage-fearghus-ailidh'),
    ...childrenOf(['loreen-cruthin', 'ollamh-cruthin'], LACHTNAID_IDS, 'marriage-lachtnaid-tiona'),
    ...childrenOf(['padraig-cruthin', 'nollaig-cruthin'], KOIBHNE_IDS, 'marriage-koibhne-zolaith')
  ],
  cadetBranches: [
    marriedAway('married-away-frisealach-joneen', 'marriage-joneen-kalman', 'frisealach'),
    marriedAway('married-away-gaelach-cnamhfhionn', 'marriage-samthann-cnamhfhionn', 'gaelach'),
    marriedAway('married-away-airt-duana', 'marriage-duana-aidan', 'airt'),
    marriedAway('married-away-cuinn-macha', 'marriage-macha-gofraidh', 'cuinn'),
    marriedAway('married-away-cumhail-polain', 'marriage-senan-polain', 'cumhail'),
    marriedAway('married-away-tarvo-sorcha', 'marriage-sorcha-gaius', 'tarvo')
  ],
  timeJumps: [
    {
      id: 'gap-fearghus-fionntan-jearlach',
      parentPartnershipId: 'marriage-fearghus-sorcha-cruthin',
      childIds: ['fionntan-cruthin', 'jearlach-cruthin'],
      years: 0,
      fromYear: '????',
      toYear: '1602',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1602 datierten Linie',
      notes: 'Die Quellhierarchie setzt zwischen dem Gründerpaar und der späteren Hauptlinie eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fearghus-sorcha-cruthin',
    houseId: CRUTHIN_HOUSE_ID,
    crestSubtitle: 'Mor Tiarnatum Tir na Gortanna · Lochansail · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fearghus-founder-cruthin',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Dál’Cruthin (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten und Erbfolge folgen der bereitgestellten Dál’Cruthin-Akte. Lochansail ist die Hauptstadt der nicht eigens benannten Eigenbaronie des Mor Tiarna. Die ausdrückliche Überlieferungslücke zwischen dem Gründerpaar und der Linie ab 1602 bleibt als Zeitsprung erhalten. Cnámhfhionn, Caoimhín, Keelaith, Pólain, Senán und Samthann verwenden dieselben Weltpersonen-IDs wie ihre bereits ausgearbeiteten Gegenakten. Bereits vorhandene Porträts angeheirateter Personen werden wiederverwendet; wiederholte Standardsilhouetten wurden nicht importiert. Die ausgearbeitete Ard-Trodach-Gegenakte präzisiert Brogan als Frau und ihren Gatten Caireall als männlichen Laird; Cairealls dortiges Porträt wird hier gespiegelt. Páilín und Latharna erhalten ihre ausgearbeiteten Nic-Caoimhe-Porträts, Keava und Ailidh nun ihre Bilder aus den ausgearbeiteten Iomrach- beziehungsweise Somhairle-Gegenakten. Neartfhlaith Cein ist entsprechend ihrer Tabellenposition als Ruairís Mündel, nicht als leibliches Kind, eingeordnet.',
    sourceRevision: 9,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Mor Tiarna von Tir na Gortanna',
      headOrder: Object.freeze([
        'fearghus-founder-cruthin',
        'fionntan-cruthin',
        'haolthan-cruthin',
        'cathaoir-cruthin'
      ]),
      publishedOrder: Object.freeze(['meallchu-cruthin', 'kolman-cruthin'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_DAL_CRUTHIN_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_DAL_CRUTHIN_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Gortanna',
    historicalStatus: 'active',
    directMorTiarnaBarony: true,
    albicRank: 'mor-tiarna',
    administrativeRole: 'Aktiver Mor Tiarna von Tir na Gortanna',
    immediateLiegeHouseId: 'haus-mac-ard-cumhaill',
    immediateLiegeHouseName: 'Clan Mac Ard Cumhaill',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'sourceNote', 'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-dal-cruthin'],
      persons: ['haus-dal-cruthin-gruender', 'haus-dal-cruthin-gruenderin'],
      partnerships: ['marriage-haus-dal-cruthin-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
