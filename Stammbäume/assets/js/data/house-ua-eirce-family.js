import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_UA_EIRCE_PORTRAITS } from './house-ua-eirce-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS
} from './leitheach-house-profiles.js';

const EIRCE_HOUSE_ID = 'house-eirce';
const EIRCE_EMBLEM = LEITHEACH_LAIRD_HOUSE_EMBLEMS['ua-eirce'];

const HOUSE_EMBLEMS = Object.freeze({
  cumhail: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill'],
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  fiachrach: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach'],
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gaelach: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'],
  laoch: LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch'],
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const MARRIED_AWAY_TARGETS = Object.freeze({
  laoch: Object.freeze({
    name: 'Ruin Ua Laoch',
    houseId: 'house-laoch',
    targetFamilyId: 'haus-ruin-ua-laoch',
    emblem: HOUSE_EMBLEMS.laoch
  }),
  wyrm: Object.freeze({
    name: 'Haus Wyrm',
    houseId: 'house-wyrm',
    targetFamilyId: 'haus-wyrm',
    emblem: HOUSE_EMBLEMS.wyrm
  }),
  draig: Object.freeze({
    name: 'Haus Draig',
    houseId: 'house-draig',
    targetFamilyId: 'haus-draig',
    emblem: HOUSE_EMBLEMS.draig
  }),
  gafyr: Object.freeze({
    name: 'Haus Gafyr',
    houseId: 'house-gafyr',
    targetFamilyId: 'haus-gafyr',
    emblem: HOUSE_EMBLEMS.gafyr
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: HOUSE_EMBLEMS.gaelach
  })
});

const HOUSE_HEAD_IDS = new Set([
  'sinna-1250-cumhail',
  'eigneachan-eirce',
  'raghallach-eirce',
  'fiachra-eirce',
  'brock-eirce'
]);

const SUCCESSION_IDS = new Set(['nechtan-eirce', 'uisdean-eirce']);

const HEAD_TITLES = Object.freeze({
  'sinna-1250-cumhail': 'Gründer des Kadettenclans Ua’Eirce',
  'eigneachan-eirce': 'Ehemaliger Laird von Ua’Eirce · bis 1694',
  'raghallach-eirce': 'Laird von Ua’Eirce · 1694–1704',
  'fiachra-eirce': 'Laird von Ua’Eirce · 1704–1720',
  'brock-eirce': 'Laird von Ua’Eirce · seit 1720'
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = EIRCE_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_UA_EIRCE_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === EIRCE_HOUSE_ID ? 'core' : 'married'),
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
  const target = MARRIED_AWAY_TARGETS[targetKey];
  return person(id, name, 'female', birth, death, EIRCE_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...(options.tags || []), 'Wegverheiratet'],
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: [
        ...new Set([
          ...(options.extensions?.registryManagedFields || []),
          'sex',
          'title',
          'tags'
        ])
      ]
    }
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
  return createParentages(childIds, parentIds, partnershipId, options);
}

function marriedAway(id, partnershipId, targetKey) {
  const target = MARRIED_AWAY_TARGETS[targetKey];
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

const SINNA_IDS = ['sinna-1250-cumhail', 'eimear-cumhail'];
const EIGNEACHAN_IDS = ['eigneachan-eirce', 'sitheach-gealach'];
const BEBHINN_1635_IDS = ['bebhinn-1635-eirce', 'eolann-laoch'];
const RAGHALLACH_IDS = ['raghallach-eirce', 'luibheann-laidir'];
const MAIREAD_IDS = ['mairead-eirce', 'gwlyddyn-wyrm'];
const HOIBREAN_IDS = ['hoibrean-eirce', 'grian-cleir'];
const FIACHRA_IDS = ['fiachra-eirce', 'wylba-laoch'];
const BEIBHINN_IDS = ['beibhinn-eirce', 'odyar-draig'];
const VANNOCH_IDS = ['vannoch-eirce', 'paislie-fiachrach'];
const TALLULA_IDS = ['tallula-eirce', 'hywell-gafyr'];
const BROCK_IDS = ['brock-eirce', 'brietta-cumhail'];
const MAOLTUILE_IDS = ['maoltuile-eirce', 'finnbarr-gealach'];
const DAITHI_IDS = ['daithi-eirce', 'glaisne-choinnich'];
const RABHLA_IDS = ['rabhla-eirce', 'hugh-unknown'];

export const HOUSE_UA_EIRCE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ua-eirce',
    title: 'Clan Ua’Eirce',
    motto: '',
    description: 'Junger Kadettenclan der Mac Cumhaill, der die südliche Region der Oberherrschaft verwaltet und für Ordnung, Pflichtbewusstsein und verlässliche Landesverteidigung steht.',
    emblem: EIRCE_EMBLEM,
    houseProfile: LEITHEACH_LAIRD_HOUSE_PROFILES['ua-eirce']
  },
  houses: [
    house(EIRCE_HOUSE_ID, 'Clan Ua’Eirce', EIRCE_EMBLEM),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', HOUSE_EMBLEMS.cumhail),
    house('house-gealach', 'Clan Ua’Gaelach', HOUSE_EMBLEMS.gaelach),
    house('house-laoch', 'Ruin Ua Laoch', HOUSE_EMBLEMS.laoch),
    house('house-laidir', 'Haus Laidir'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-cleir', 'Haus Cléir'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-fiachrach', 'Clan Uí Fiachrach', HOUSE_EMBLEMS.fiachrach),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-choinnich', 'Haus Choinnich'),
    house('house-lockart', 'Haus Lockart')
  ],
  persons: [
    person('sinna-1250-cumhail', 'Sinna Cumhail', 'male', '1275', '1311', 'house-cumhail', {
      familyRole: 'core',
      notes: 'Sinna gründete den Kadettenclan Ua’Eirce. Die korrigierte Datierung 1275–1311 folgt der Hoftafel und der ausdrücklichen Benutzerangabe.'
    }),
    spouse('eimear-cumhail', 'Eimear', 'female', '1252', '1300', 'house-cumhail'),

    person('eigneachan-eirce', 'Eigneachán Eirce', 'male', '1630', '1694'),
    spouse('sitheach-gealach', 'Sítheach Gealach', 'female', '1630', '1704', 'house-gealach'),
    awayWoman('bebhinn-1635-eirce', 'Bébhinn Eirce', '1635', '1701', 'laoch'),
    spouse('eolann-laoch', 'Eolann Laoch', 'male', '1634', '1699', 'house-laoch', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    person('raghallach-eirce', 'Raghallach Eirce', 'male', '1648', '1704'),
    spouse('luibheann-laidir', 'Luibheann Laidir', 'female', '1650', '1725', 'house-laidir'),
    awayWoman('mairead-eirce', 'Mairead Eirce', '1650', '1698', 'wyrm'),
    spouse('gwlyddyn-wyrm', 'Gwlyddyn Wyrm', 'male', '1650', '1717', 'house-wyrm'),
    person('hoibrean-eirce', 'Hoibrean Eirce', 'male', '1649', '1711'),
    spouse('grian-cleir', 'Grian Cléir', 'female', '1650', '1707', 'house-cleir'),

    person('fiachra-eirce', 'Fiachra Eirce', 'male', '1668', '1720'),
    spouse('wylba-laoch', 'Wylba Laoch', 'female', '1675', '1739', 'house-laoch', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('beibhinn-eirce', 'Beibhinn Eirce', '1669', '', 'draig'),
    spouse('odyar-draig', 'Odyar Draig', 'male', '1668', '', 'house-draig'),
    person('vannoch-eirce', 'Vannoch Eirce', 'male', '1674', ''),
    spouse('paislie-fiachrach', 'Paislie Fiachrach', 'female', '1675', '', 'house-fiachrach'),
    awayWoman('tallula-eirce', 'Tallula Eirce', '1680', '', 'gafyr'),
    spouse('hywell-gafyr', 'Hywell Gafyr', 'male', '1677', '', 'house-gafyr'),

    person('brock-eirce', 'Brock Eirce', 'male', '1694', ''),
    spouse('brietta-cumhail', 'Brietta Cumhail', 'female', '1695', '', 'house-cumhail'),
    awayWoman('maoltuile-eirce', 'Maoltuile Eirce', '1700', '', 'gaelach'),
    spouse('finnbarr-gealach', 'Finnbarr Gealach', 'male', '1698', '', 'house-gealach'),
    person('daithi-eirce', 'Dáithí Eirce', 'male', '1697', ''),
    spouse('glaisne-choinnich', 'Glaisne Choinnich', 'female', '1700', '', 'house-choinnich'),
    person('rabhla-eirce', 'Rabhla Eirce', 'female', '1701', ''),
    spouse('hugh-unknown', 'Hugh', 'male', '1700', ''),

    person('nechtan-eirce', 'Nechtan Eirce', 'male', '1720', '', EIRCE_HOUSE_ID, {
      title: '1. Stelle der Erbfolge',
      notes: 'Die Hoftafel schreibt den Namen einmal Neachtan; Hierarchie und Stammbaum verwenden Nechtan.'
    }),
    person('keara-eirce', 'Keara Eirce', 'female', '1724', ''),
    person('uisdean-eirce', 'Uisdean Eirce', 'male', '1728', '', EIRCE_HOUSE_ID, {
      title: '2. Stelle der Erbfolge'
    }),
    person('barra-lockart', 'Barra Lockart', 'male', '1727', '', 'house-lockart', {
      familyRole: 'ward',
      title: 'Mündel Brocks',
      notes: 'Brock ist Barras Vormund, nicht sein leiblicher Vater.'
    }),
    person('wray-eirce', 'Wray Eirce', 'male', '1723', ''),
    person('kavan-eirce', 'Kavan Eirce', 'male', '1725', ''),
    person('jilbhe-eirce', 'Jilbhe Eirce', 'male', '1724', ''),
    person('vaila-eirce', 'Vaila Eirce', 'female', '1726', '')
  ],
  partnerships: [
    createMarriage('marriage-sinna-eimear', ...SINNA_IDS),
    createMarriage('marriage-eigneachan-sitheach', ...EIGNEACHAN_IDS),
    createMarriage('marriage-bebhinn-eolann', ...BEBHINN_1635_IDS),
    createMarriage('marriage-raghallach-luibheann', ...RAGHALLACH_IDS),
    createMarriage('marriage-gwlyddyn-mairead', ...MAIREAD_IDS),
    createMarriage('marriage-hoibrean-grian', ...HOIBREAN_IDS),
    createMarriage('marriage-fiachra-wylba', ...FIACHRA_IDS),
    createMarriage('marriage-odyar-beibhinn', ...BEIBHINN_IDS),
    createMarriage('marriage-vannoch-paislie', ...VANNOCH_IDS),
    createMarriage('marriage-hywell-tallula', ...TALLULA_IDS),
    createMarriage('marriage-brietta-brock', ...BROCK_IDS),
    createMarriage('marriage-maoltuile-finnbarr', ...MAOLTUILE_IDS),
    createMarriage('marriage-daithi-glaisne', ...DAITHI_IDS),
    createMarriage('marriage-rabhla-hugh', ...RABHLA_IDS)
  ],
  parentages: [
    ...childrenOf(['eigneachan-eirce', 'bebhinn-1635-eirce'], SINNA_IDS, 'marriage-sinna-eimear', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Punkte im Stammbaum markieren nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und dieser späteren Ua’Eirce-Generation.',
      extensions: { timeJumpId: 'gap-sinna-eigneachan' }
    }),
    ...childrenOf(['raghallach-eirce', 'mairead-eirce', 'hoibrean-eirce'], EIGNEACHAN_IDS, 'marriage-eigneachan-sitheach'),
    ...childrenOf(['fiachra-eirce', 'beibhinn-eirce'], RAGHALLACH_IDS, 'marriage-raghallach-luibheann'),
    ...childrenOf(['vannoch-eirce', 'tallula-eirce'], HOIBREAN_IDS, 'marriage-hoibrean-grian'),
    ...childrenOf(['brock-eirce', 'maoltuile-eirce'], FIACHRA_IDS, 'marriage-fiachra-wylba'),
    ...childrenOf(['daithi-eirce', 'rabhla-eirce'], VANNOCH_IDS, 'marriage-vannoch-paislie'),
    ...childrenOf(['nechtan-eirce', 'keara-eirce', 'uisdean-eirce'], BROCK_IDS, 'marriage-brietta-brock'),
    ...childrenOf(['barra-lockart'], ['brock-eirce'], '', {
      idPrefix: 'fosterage-brock',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Brock ist Barras Vormund; es besteht keine leibliche Abstammung.'
    }),
    ...childrenOf(['wray-eirce', 'kavan-eirce'], DAITHI_IDS, 'marriage-daithi-glaisne'),
    ...childrenOf(['jilbhe-eirce', 'vaila-eirce'], RABHLA_IDS, 'marriage-rabhla-hugh')
  ],
  cadetBranches: [
    marriedAway('married-away-laoch-bebhinn-1635', 'marriage-bebhinn-eolann', 'laoch'),
    marriedAway('married-away-wyrm-mairead', 'marriage-gwlyddyn-mairead', 'wyrm'),
    marriedAway('married-away-draig-beibhinn', 'marriage-odyar-beibhinn', 'draig'),
    marriedAway('married-away-gafyr-tallula', 'marriage-hywell-tallula', 'gafyr'),
    marriedAway('married-away-gaelach-maoltuile', 'marriage-maoltuile-finnbarr', 'gaelach')
  ],
  timeJumps: [
    {
      id: 'gap-sinna-eigneachan',
      parentPartnershipId: 'marriage-sinna-eimear',
      childIds: ['eigneachan-eirce', 'bebhinn-1635-eirce'],
      years: 330,
      fromYear: '1300',
      toYear: '1630',
      label: 'Rund 330 Jahre nicht einzeln überlieferte Generationen',
      notes: 'Die Quellgrafik setzt ober- und unterhalb des Ua’Eirce-Wappens ausdrückliche Punktreihen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-sinna-eimear',
    houseId: EIRCE_HOUSE_ID,
    crestSubtitle: 'Lairdtum im Süden von Tir na Sleagh · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'sinna-1250-cumhail',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Ua’Eirce (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Hausoberhäupter, Erbfolge und die eine große Überlieferungslücke folgen der bereitgestellten Ua’Eirce-Hausseite und ihrer Stammbaumgrafik. Sinnas Geburtsjahr wird entsprechend der Hoftafel und der ausdrücklichen Benutzerkorrektur mit 1275 statt der abweichenden Hierarchieangabe 1250 geführt. Bébhinn, Mairead, die jüngere Beibhinn, Tallula und Maoltuile besitzen direkte Wegverheiratet-Knoten zu ihren Zielhäusern. Sinna/Eimear, Gwlyddyn/Mairead, Odyar/Beibhinn, Hywell/Tallula und Brock/Brietta verwenden dieselben Weltpersonen-, Ehe- und Porträtzuordnungen wie ihre ausgearbeiteten Gegenakten. Paislie/Vannoch bilden den gemeinsamen Knoten zur Uí-Fiachrach-Akte; Bébhinn/Eolann und Fiachra/Wylba sind mit der ausgearbeiteten Ruin-Ua-Laoch-Akte synchronisiert. Kinder wegverheirateter Linien verbleiben ausschließlich im jeweils fortführenden Zielhaus. Barra Lockart ist Brocks Mündel und kein leibliches Kind. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    blankFamily: false,
    preparedMainLine: false,
    sourceRevision: 2,
    principality: 'Leitheach',
    territory: 'Tir na Sleagh',
    albicRank: 'laird',
    inheritance: {
      primaryRule: 'männliche Primogenitur',
      fallbackRule: 'Töchter erben nur ohne anerkannten männlichen Nachkommen und mit Zustimmung des Fürstenhauses.',
      publishedOrder: ['nechtan-eirce', 'uisdean-eirce']
    },
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: LEITHEACH_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
