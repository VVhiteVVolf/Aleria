import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import {
  HOUSE_IOMRACH_LOCAL_PORTRAIT_IDS,
  HOUSE_IOMRACH_PORTRAITS,
  HOUSE_IOMRACH_REUSED_PORTRAIT_IDS
} from './house-iomrach-portraits.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';

const IOMRACH_HOUSE_ID = 'house-iomrach';
const IOMRACH_EMBLEM = TIR_NA_GORTANNA_HOUSE_EMBLEMS.iomrach;

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const HEAD_TITLES = Object.freeze({
  'conan-founder-iomrach': 'Gründer und erster Laird der An’Iomrach',
  'bearnard-iomrach': 'Laird der An’Iomrach · bis 1679',
  'keava-iomrach': 'Laird der An’Iomrach · 1679–1699',
  'purseil-iomrach': 'Letzter amtierender Laird der An’Iomrach · 1699–1733'
});

const SUCCESSION_TITLES = Object.freeze({
  'keiran-iomrach': 'Erster in der historischen Erbfolge · 1733 getötet',
  'tuala-iomrach': 'Zweite in der historischen Erbfolge · 1733 getötet',
  'conan-iomrach': 'Letzter Überlebender und Erbe der An’Iomrach · Mündel Oisean Somhairles'
});

const MASSACRE_IDS = new Set([
  'purseil-iomrach',
  'meallan-iomrach',
  'vadria-airgid',
  'oithiona-iomrach',
  'fearghas-iomrach',
  'donnacha-iomrach',
  'maonait-ancient-iomrach',
  'ulfhild-ancient-iomrach',
  'keiran-iomrach',
  'tuala-iomrach',
  'zilda-iomrach'
]);

const TARGETS = Object.freeze({
  ghaiscioch: Object.freeze({
    name: 'Clan Ua’Ghaiscíoch',
    houseId: 'house-ghaiscioch',
    targetFamilyId: 'haus-ghaiscioch',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  }),
  somhairle: Object.freeze({
    name: 'Sidhe Somhairle',
    houseId: 'house-somhairle',
    targetFamilyId: 'haus-somhairle',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle
  })
});

function lineageRoleFor(personId) {
  if (HEAD_TITLES[personId]) return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = IOMRACH_HOUSE_ID, options = {}) {
  const massacreNote = MASSACRE_IDS.has(id)
    ? 'Starb 1733 beim Überfall der Schwarzblutmarodeure auf Broch an Clais.'
    : '';
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_IOMRACH_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === IOMRACH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || SUCCESSION_TITLES[id] || '',
    tags: [...new Set([
      ...(options.tags || []),
      ...(MASSACRE_IDS.has(id) ? ['Untergang von Broch an Clais'] : [])
    ])],
    notes: [options.notes || '', massacreNote].filter(Boolean).join(' '),
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayMember(id, name, sex, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, sex, birth, death, IOMRACH_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...new Set([...(options.tags || []), 'Wegverheiratet'])]
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

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'iomrach-parentage',
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
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

const FOUNDER_IDS = ['conan-founder-iomrach', 'loinneog-ancient-iomrach'];
const BEARNARD_IDS = ['bearnard-iomrach', 'kaivin-birn'];
const RUALAINN_IDS = ['eoghair-ghaiscioch', 'rualainn-iomrach'];
const KEAVA_IDS = ['geallan-cruthin', 'keava-iomrach'];
const EACHAIDH_IDS = ['wailbhe-trodach', 'eachaidh-iomrach'];
const PURSEIL_IDS = ['purseil-iomrach', 'vadria-airgid'];
const MEALLAN_IDS = ['meallan-iomrach', 'oithiona-iomrach'];
const FEARGHAS_IDS = ['fearghas-iomrach', 'maonait-ancient-iomrach'];
const DONNACHA_IDS = ['donnacha-iomrach', 'ulfhild-ancient-iomrach'];
const YBHNA_IDS = ['fionnchu-somhairle', 'ybhna-iomrach'];
const CONAN_IDS = ['conan-iomrach', 'breanna-somhairle'];

export const HOUSE_IOMRACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-iomrach',
    title: 'An’Iomrach',
    motto: '',
    description: 'Ehemaliger Laird-Clan von Broch an Clais, 1733 als Herrschaft vernichtet; Cónán überlebte als auswärtiges Mündel.',
    emblem: IOMRACH_EMBLEM,
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES.iomrach
  },
  houses: [
    house(IOMRACH_HOUSE_ID, 'An’Iomrach', IOMRACH_EMBLEM, 'extinct'),
    house('house-birn', 'Haus Birn'),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-airgid', 'Haus Airgid'),
    house('house-eamhra', 'Haus Eamhra'),
    house('house-somhairle', 'Sidhe Somhairle', TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle)
  ],
  persons: [
    person('conan-founder-iomrach', 'Cónán Iomrach', 'male', '????', '????', IOMRACH_HOUSE_ID, {
      tags: ['Gründer']
    }),
    spouse('loinneog-ancient-iomrach', 'Loinneog', 'female', '????', '????'),

    person('bearnard-iomrach', 'Bearnard Iomrach', 'male', '1629', '1679', IOMRACH_HOUSE_ID, {
      notes: 'Wohlhabender und umsichtiger Laird, der wegen seines entstellten Äußeren und grausamer Gerüchte zunehmend in Melancholie verfiel und sich 1679 erhängte.'
    }),
    spouse('kaivin-birn', 'Kaivín Birn', 'female', '????', '????', 'house-birn'),
    awayMember('rualainn-iomrach', 'Rualainn Iomrach', 'female', '1633', '1699', 'ghaiscioch'),
    spouse('eoghair-ghaiscioch', 'Eoghair Ghaiscíoch', 'male', '1631', '1689', 'house-ghaiscioch'),

    awayMember('keava-iomrach', 'Keava Iomrach', 'female', '1654', '1711', 'cruthin', {
      title: 'Laird der An’Iomrach · 1679–1699 · Wegverheiratet an Clan Dál’Cruthin'
    }),
    spouse('geallan-cruthin', 'Geallán Cruthin', 'male', '1651', '1714', 'house-cruthin'),
    person('eachaidh-iomrach', 'Eachaidh Iomrach', 'male', '1650', '1731'),
    spouse('wailbhe-trodach', 'Wailbhe Trodach', 'female', '1654', '1699', 'house-trodach'),

    person('purseil-iomrach', 'Puirséil Iomrach', 'male', '1669', '1733'),
    spouse('vadria-airgid', 'Vadria Airgid', 'female', '1674', '1733', 'house-airgid'),
    person('meallan-iomrach', 'Meallán Iomrach', 'male', '1675', '1733'),
    spouse('peighann-eamhra', 'Peighann Eamhra', 'female', '1675', '1720', 'house-eamhra', {
      title: 'Ehemalige Verlobte Meallán Iomrachs',
      tags: ['Verlobt']
    }),
    spouse('oithiona-iomrach', 'Oithíona', 'female', '1678', '1733'),

    person('fearghas-iomrach', 'Fearghas Iomrach', 'male', '1692', '1733'),
    spouse('maonait-ancient-iomrach', 'Maonait', 'female', '1696', '1733'),
    person('donnacha-iomrach', 'Donnacha Iomrach', 'male', '1695', '1733'),
    spouse('ulfhild-ancient-iomrach', 'Ulfhild', 'female', '1698', '1733'),
    awayMember('ybhna-iomrach', 'Ybhna Iomrach', 'female', '1700', '', 'somhairle', {
      tags: ['Bastard'],
      notes: 'Als uneheliche Tochter Mealláns überliefert; ihre Somhairle-Nachkommen werden in der Zielakte fortgeführt.'
    }),
    spouse('fionnchu-somhairle', 'Fionnchu Somhairle', 'male', '1700', '', 'house-somhairle'),

    person('keiran-iomrach', 'Keiran Iomrach', 'male', '1715', '1733'),
    person('tuala-iomrach', 'Tuala Iomrach', 'female', '1720', '1733'),
    person('zilda-iomrach', 'Zilda Iomrach', 'female', '1718', '1733'),
    person('conan-iomrach', 'Cónán Iomrach', 'male', '1727', '', IOMRACH_HOUSE_ID, {
      familyRole: 'ward-away',
      tags: ['Mündel', 'Letzter Überlebender'],
      notes: 'Überlebte den Untergang des Clans, weil er fern von Broch an Clais als Mündel Oisean Somhairles aufwuchs. Er wird als Erbe der An’Iomrach erzogen.'
    }),
    spouse('breanna-somhairle', 'Breanna Somhairle', 'female', '1728', '', 'house-somhairle', {
      title: 'Verlobte Cónán Iomrachs',
      tags: ['Verlobt']
    })
  ],
  partnerships: [
    endedMarriage('marriage-conan-loinneog-iomrach', FOUNDER_IDS),
    endedMarriage('marriage-bearnard-kaivin', BEARNARD_IDS, '1679'),
    endedMarriage('marriage-eoghair-rualainn', RUALAINN_IDS, '1689'),
    endedMarriage('marriage-geallan-keava', KEAVA_IDS, '1711'),
    endedMarriage('marriage-wailbhe-eachaidh', EACHAIDH_IDS, '1699'),
    endedMarriage('marriage-purseil-vadria', PURSEIL_IDS, '1733'),
    createMarriage('engagement-meallan-peighann', 'meallan-iomrach', 'peighann-eamhra', {
      type: 'engagement',
      status: 'ended',
      end: '1720'
    }),
    endedMarriage('marriage-meallan-oithiona', MEALLAN_IDS, '1733'),
    endedMarriage('marriage-fearghas-maonait', FEARGHAS_IDS, '1733'),
    endedMarriage('marriage-donnacha-ulfhild', DONNACHA_IDS, '1733'),
    createMarriage('marriage-fionnchu-ybhna', ...YBHNA_IDS),
    createMarriage('engagement-conan-breanna-iomrach-somhairle', ...CONAN_IDS, {
      type: 'engagement'
    })
  ],
  parentages: [
    ...childrenOf(['bearnard-iomrach', 'rualainn-iomrach'], FOUNDER_IDS, 'marriage-conan-loinneog-iomrach', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und der ab 1629 datierten Linie.',
      extensions: { timeJumpId: 'gap-conan-bearnard-rualainn-iomrach' }
    }),
    ...childrenOf(['keava-iomrach', 'eachaidh-iomrach'], BEARNARD_IDS, 'marriage-bearnard-kaivin'),
    ...childrenOf(['purseil-iomrach', 'meallan-iomrach'], EACHAIDH_IDS, 'marriage-wailbhe-eachaidh'),
    ...childrenOf(['fearghas-iomrach', 'donnacha-iomrach'], PURSEIL_IDS, 'marriage-purseil-vadria'),
    ...childrenOf(['ybhna-iomrach'], ['meallan-iomrach'], '', {
      legitimacy: 'illegitimate',
      notes: 'Die Quelle bezeichnet Ybhna ausdrücklich als Mealláns Bastard; eine Mutter ist nicht überliefert.'
    }),
    ...childrenOf(['keiran-iomrach', 'tuala-iomrach'], FEARGHAS_IDS, 'marriage-fearghas-maonait'),
    ...childrenOf(['zilda-iomrach', 'conan-iomrach'], DONNACHA_IDS, 'marriage-donnacha-ulfhild')
  ],
  cadetBranches: [
    marriedAway('married-away-ghaiscioch-rualainn', 'marriage-eoghair-rualainn', 'ghaiscioch'),
    marriedAway('married-away-cruthin-keava', 'marriage-geallan-keava', 'cruthin'),
    marriedAway('married-away-somhairle-ybhna', 'marriage-fionnchu-ybhna', 'somhairle'),
    createWardAwayBranch({
      id: 'ward-away-somhairle-conan-iomrach',
      name: TARGETS.somhairle.name,
      parentPersonId: 'conan-iomrach',
      houseId: TARGETS.somhairle.houseId,
      targetFamilyId: TARGETS.somhairle.targetFamilyId,
      emblem: TARGETS.somhairle.emblem,
      subtitle: 'Als Mündel bei Sidhe Somhairle aufgewachsen',
      notes: 'Oisean Somhairle nahm Cónán fern von Broch an Clais als Mündel auf; dadurch überlebte Cónán den Überfall von 1733.',
      extensions: {
        sidePlacement: true,
        registryManagedFields: [
          'name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle', 'notes'
        ]
      }
    })
  ],
  timeJumps: [{
    id: 'gap-conan-bearnard-rualainn-iomrach',
    parentPartnershipId: 'marriage-conan-loinneog-iomrach',
    parentPersonId: '',
    childIds: ['bearnard-iomrach', 'rualainn-iomrach'],
    years: 0,
    fromYear: '????',
    toYear: '1629',
    label: 'Nicht einzeln überlieferte Generationen bis zur ab 1629 datierten Linie',
    notes: 'Die Quellhierarchie setzt nach dem Gründerpaar eine ausdrückliche Punktreihe.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-conan-loinneog-iomrach',
    houseId: IOMRACH_HOUSE_ID,
    crestSubtitle: 'Ehemaliger Laird-Clan von Broch an Clais · 1733 als Herrschaft vernichtet',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'conan-founder-iomrach',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'An’Iomrach (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtsfolge, Erbfolge und die Vernichtung von Broch an Clais folgen der bereitgestellten An’Iomrach-Akte. Der Clan ist als Herrschaft erloschen, biologisch jedoch nicht vollständig ausgestorben: Ybhna lebt bei Sidhe Somhairle, und Cónán überlebte als Oiseans auswärtiges Mündel. Rualainn, Keava und Ybhna erhalten direkte Zielhausknoten; ihre auswärtig fortgeführten Kinder bleiben ausschließlich in den Gegenakten. Cónáns Mündelschaft wird zusätzlich direkt mit Sidhe Somhairle verknüpft. Die An’Iomrach-Akte nennt Keavas Tod abweichend 1699; die bereits ausgearbeitete Dál’Cruthin-Gegenakte belegt 1711, das deshalb als kanonisches Todesjahr erhalten bleibt. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    sourceRevision: 2,
    blankFamily: false,
    preparedMainLine: false,
    principality: 'Leitheach',
    territory: 'Tir na Gortanna',
    historicalStatus: 'extinct',
    albicRank: 'laird',
    administrativeRole: 'Erloschener ehemaliger Laird von Broch an Clais',
    immediateLiegeHouseId: 'haus-dal-cruthin',
    immediateLiegeHouseName: 'Clan Dál’Cruthin',
    legacyTitles: Object.freeze(['Haus Iomrach']),
    extinctionEvent: Object.freeze({
      year: '1733',
      cause: 'Überfall der Schwarzblutmarodeure auf Broch an Clais',
      administrativeExtinction: true,
      survivorIds: Object.freeze(['ybhna-iomrach', 'conan-iomrach'])
    }),
    sourceDiscrepancies: Object.freeze({
      keavaDeath: Object.freeze({ iomrachSource: '1699', cruthinSource: '1711', canonical: '1711' })
    }),
    inheritance: Object.freeze({
      title: 'Laird der An’Iomrach',
      headOrder: Object.freeze([
        'conan-founder-iomrach',
        'bearnard-iomrach',
        'keava-iomrach',
        'purseil-iomrach'
      ]),
      publishedOrder: Object.freeze(['keiran-iomrach', 'tuala-iomrach']),
      survivingHeirId: 'conan-iomrach'
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_IOMRACH_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_IOMRACH_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'sourceNote', 'historicalStatus',
      'extinctionEvent', 'sourceDiscrepancies', 'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-iomrach-gruender', 'haus-iomrach-gruenderin'],
      partnerships: ['marriage-haus-iomrach-founders'],
      parentages: [],
      cadetBranches: ['extinct-haus-iomrach'],
      timeJumps: []
    }
  }
});
