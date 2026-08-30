import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_NIC_CAOIMHE_LOCAL_PORTRAIT_IDS,
  HOUSE_NIC_CAOIMHE_PORTRAITS,
  HOUSE_NIC_CAOIMHE_REUSED_PORTRAIT_IDS
} from './house-nic-caoimhe-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';

const CAOIMHE_HOUSE_ID = 'house-caoimhe';
const CAOIMHE_EMBLEM = TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe'];

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const HOUSE_HEAD_IDS = new Set([
  'fainne-founder-caoimhe',
  'pailin-caoimhe',
  'quonnait-caiomhe',
  'ciannait-caoimhe'
]);

const SUCCESSION_IDS = new Set(['yllana-caoimhe', 'realtin-caoimhe']);

const HEAD_TITLES = Object.freeze({
  'fainne-founder-caoimhe': 'Gründerin und erste Laird der Nic Caoimhe',
  'pailin-caoimhe': 'Laird der Nic Caoimhe · bis 1701',
  'quonnait-caiomhe': 'Laird der Nic Caoimhe · 1701–1729',
  'ciannait-caoimhe': 'Laird der Nic Caoimhe · seit 1729',
  'yllana-caoimhe': 'Erste in der Erbfolge der Laird',
  'realtin-caoimhe': 'Zweite in der Erbfolge der Laird'
});

const TARGETS = Object.freeze({
  trodach: Object.freeze({
    name: 'Ard Trodach',
    houseId: 'house-trodach',
    targetFamilyId: 'haus-ard-trodach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']
  }),
  frisealach: Object.freeze({
    name: 'Ard Frisealach',
    houseId: 'house-frisealach',
    targetFamilyId: 'haus-frisealach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach
  }),
  cetchathach: Object.freeze({
    name: 'Clan Cétchathach',
    houseId: 'house-cetchathach',
    targetFamilyId: 'haus-cetchathach',
    emblem: ''
  }),
  deaghaide: Object.freeze({
    name: 'Haus Deaghaide',
    houseId: 'house-deaghaide',
    targetFamilyId: 'haus-deaghaide',
    emblem: ''
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-airt']
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CAOIMHE_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_NIC_CAOIMHE_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === CAOIMHE_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
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
  return person(id, name, sex, birth, death, CAOIMHE_HOUSE_ID, {
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
    idPrefix: 'nic-caoimhe-parentage',
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

const FOUNDER_IDS = ['fainne-founder-caoimhe', 'eanbharr-ancient-caoimhe'];
const PAILIN_IDS = ['cleirchin-cruthin', 'pailin-caoimhe'];
const REATHNAIGH_IDS = ['jodhran-trodach', 'reathnaigh-caoimhe'];
const QUONNAIT_IDS = ['malach-mhuir', 'quonnait-caiomhe'];
const KERMENA_IDS = ['oirbhealach-frisealach', 'kermena-caoimhe'];
const SAORLAITH_IDS = ['eadbhard-ghaiscioch', 'saorlaith-caiomhe'];
const CIANNAIT_IDS = ['jaimhin-blar', 'ciannait-caoimhe'];
const HOMLACH_IDS = ['homlach-caoimhe', 'ultana-cetchathach'];
const UATHMAR_IDS = ['uathmar-caoimhe', 'zeilthra-deaghaide'];
const CIONAODH_IDS = ['brogan-ancient-caoimhe', 'cionaodh-caoimhe'];
const YLLANA_IDS = ['oistin-tairise', 'yllana-caoimhe'];
const BEBHINN_IDS = ['seamair-airt', 'bebhinn-caoimhe'];
const FAINNE_1696_IDS = ['dallan-airgid', 'fainne-1696-caoimhe'];
const BIORNA_IDS = ['nioclas-ancient-caoimhe', 'biorna-caoimhe'];
const LATHARNA_IDS = ['meallchu-cruthin', 'latharna-caoimhe'];

export const HOUSE_NIC_CAOIMHE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-nic-caoimhe',
    title: 'Nic Caoimhe',
    motto: '',
    description: 'Matriarchal geführter Laird-Clan innerhalb Lochansails in Tir na Gortanna.',
    emblem: CAOIMHE_EMBLEM,
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES['nic-caoimhe']
  },
  houses: [
    house(CAOIMHE_HOUSE_ID, 'Clan Nic Caoimhe', CAOIMHE_EMBLEM),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-na-mhuir', 'Clan Na’Mhuir', TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']),
    house('house-frisealach', 'Ard Frisealach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch),
    house('house-nic-blar', 'Clan Nic Blar', 'assets/images/houses/Ceitheach/clan-nic-blar.png'),
    house('house-cetchathach', 'Clan Cétchathach'),
    house('house-deaghaide', 'Haus Deaghaide'),
    house('house-tairise', 'Haus Tairise'),
    house('house-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-airgid', 'Haus Airgid')
  ],
  persons: [
    person('fainne-founder-caoimhe', 'Fainne Caoimhe', 'female', '????', '????', CAOIMHE_HOUSE_ID, {
      tags: ['Gründerin']
    }),
    spouse('eanbharr-ancient-caoimhe', 'Eanbharr', 'male', '????', '????'),

    person('pailin-caoimhe', 'Páilín Caoimhe', 'female', '1625', '1701'),
    spouse('cleirchin-cruthin', 'Cléirchín Cruthin', 'male', '1628', '1675', 'house-cruthin'),
    awayMember('reathnaigh-caoimhe', 'Reathnaigh Caoimhe', 'female', '1628', '1704', 'trodach'),
    spouse('jodhran-trodach', 'Jodhrán Trodach', 'male', '1630', '1695', 'house-trodach'),

    person('quonnait-caiomhe', 'Quonnait Caoimhe', 'female', '1648', '1729'),
    spouse('malach-mhuir', 'Málach Mhuir', 'male', '1652', '1715', 'house-na-mhuir'),
    awayMember('kermena-caoimhe', 'Kermena Caoimhe', 'female', '1654', '1739', 'frisealach'),
    spouse('oirbhealach-frisealach', 'Oirbhealach Frisealach', 'male', '1650', '1730', 'house-frisealach'),
    person('saorlaith-caiomhe', 'Saorlaith Caoimhe', 'female', '1650', '1726'),
    spouse('eadbhard-ghaiscioch', 'Eadbhard Ghaiscíoch', 'male', '1652', '1720', 'house-ghaiscioch'),

    person('ciannait-caoimhe', 'Ciannait Caoimhe', 'female', '1669', '', CAOIMHE_HOUSE_ID, {
      title: HEAD_TITLES['ciannait-caoimhe'],
      tags: ['Fianna', 'Kriegsheldin'],
      notes: 'Ciannait ist als ehrenhafte Fianna und Kriegsheldin des Clans überliefert.'
    }),
    spouse('jaimhin-blar', 'Jaimhín Blár', 'male', '1672', '', 'house-nic-blar'),
    awayMember('homlach-caoimhe', 'Hómlach Caoimhe', 'male', '1675', '', 'cetchathach'),
    spouse('ultana-cetchathach', 'Ultana Cétchathach', 'female', '1672', '', 'house-cetchathach'),
    awayMember('uathmar-caoimhe', 'Uathmar Caoimhe', 'male', '1672', '', 'deaghaide'),
    spouse('zeilthra-deaghaide', 'Zeilthra Deaghaide', 'female', '1671', '', 'house-deaghaide'),
    person('cionaodh-caoimhe', 'Cionaodh Caoimhe', 'female', '1674', ''),
    spouse('brogan-ancient-caoimhe', 'Brogan', 'male', '1673', ''),

    person('yllana-caoimhe', 'Yllána Caoimhe', 'female', '1691', ''),
    spouse('oistin-tairise', 'Oistín Tairise', 'male', '1695', '', 'house-tairise'),
    awayMember('bebhinn-caoimhe', 'Bébhinn Caoimhe', 'female', '1694', '', 'airt'),
    spouse('seamair-airt', 'Seamair Airt', 'male', '1692', '1735', 'house-airt'),
    person('fainne-1696-caoimhe', 'Fainne Caoimhe', 'female', '1696', ''),
    spouse('dallan-airgid', 'Dallán Airgid', 'male', '1700', '', 'house-airgid'),
    person('biorna-caoimhe', 'Biorna Caoimhe', 'female', '1697', ''),
    spouse('nioclas-ancient-caoimhe', 'Nioclás', 'male', '1697', ''),
    awayMember('latharna-caoimhe', 'Latharna Caoimhe', 'female', '1697', '', 'cruthin'),
    spouse('meallchu-cruthin', 'Meallchú Cruthin', 'male', '1691', '', 'house-cruthin'),

    person('realtin-caoimhe', 'Réaltin Caoimhe', 'female', '1712', ''),
    person('fionnain-caoimhe', 'Fionnáin Caoimhe', 'male', '1716', ''),
    person('brona-caoimhe', 'Bróna Caoimhe', 'female', '1720', ''),
    person('ollamh-caoimhe', 'Ollamh Caoimhe', 'male', '1726', ''),
    spouse('sionna-cetchathach', 'Sionna Cétchathach', 'female', '1726', '', 'house-cetchathach', {
      familyRole: 'ward',
      title: 'Mündel Fainnes'
    }),
    person('alfdis-caoimhe', 'Alfdis Caoimhe', 'female', '1722', ''),
    person('eoin-caoimhe', 'Eoin Caoimhe', 'male', '1725', '')
  ],
  partnerships: [
    endedMarriage('marriage-fainne-eanbharr-caoimhe', FOUNDER_IDS),
    endedMarriage('marriage-cleirchin-pailin', PAILIN_IDS, '1675'),
    endedMarriage('marriage-jodhran-reathnaigh', REATHNAIGH_IDS, '1695'),
    endedMarriage('marriage-malach-quonnait', QUONNAIT_IDS, '1715'),
    endedMarriage('marriage-oirbhealach-kermena', KERMENA_IDS, '1730'),
    endedMarriage('marriage-eadbhard-saorlaith', SAORLAITH_IDS, '1720'),
    createMarriage('marriage-jaimhin-ciannait', ...CIANNAIT_IDS),
    createMarriage('marriage-homlach-ultana', ...HOMLACH_IDS),
    createMarriage('marriage-uathmar-zeilthra', ...UATHMAR_IDS),
    createMarriage('marriage-brogan-cionaodh', ...CIONAODH_IDS),
    createMarriage('marriage-oistin-yllana', ...YLLANA_IDS),
    endedMarriage('marriage-seamair-bebhinn', BEBHINN_IDS, '1735'),
    createMarriage('marriage-dallan-fainne', ...FAINNE_1696_IDS),
    createMarriage('marriage-nioclas-biorna', ...BIORNA_IDS),
    createMarriage('marriage-meallchu-latharna', ...LATHARNA_IDS)
  ],
  parentages: [
    ...childrenOf(['pailin-caoimhe', 'reathnaigh-caoimhe'], FOUNDER_IDS, 'marriage-fainne-eanbharr-caoimhe', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und der ab 1625 datierten Linie.',
      extensions: { timeJumpId: 'gap-fainne-pailin-reathnaigh' }
    }),
    ...childrenOf(['quonnait-caiomhe', 'kermena-caoimhe', 'saorlaith-caiomhe'], PAILIN_IDS, 'marriage-cleirchin-pailin'),
    ...childrenOf(['ciannait-caoimhe', 'homlach-caoimhe'], QUONNAIT_IDS, 'marriage-malach-quonnait'),
    ...childrenOf(['uathmar-caoimhe', 'cionaodh-caoimhe'], SAORLAITH_IDS, 'marriage-eadbhard-saorlaith'),
    ...childrenOf(['yllana-caoimhe', 'bebhinn-caoimhe', 'fainne-1696-caoimhe'], CIANNAIT_IDS, 'marriage-jaimhin-ciannait'),
    ...childrenOf(['biorna-caoimhe', 'latharna-caoimhe'], CIONAODH_IDS, 'marriage-brogan-cionaodh'),
    ...childrenOf(['realtin-caoimhe', 'fionnain-caoimhe'], YLLANA_IDS, 'marriage-oistin-yllana'),
    ...childrenOf(['brona-caoimhe', 'ollamh-caoimhe'], FAINNE_1696_IDS, 'marriage-dallan-fainne'),
    ...childrenOf(['alfdis-caoimhe', 'eoin-caoimhe'], BIORNA_IDS, 'marriage-nioclas-biorna'),
    ...childrenOf(['sionna-cetchathach'], ['fainne-1696-caoimhe'], '', {
      type: 'foster',
      certainty: 'certain',
      notes: 'Sionna Cétchathach ist ausdrücklich als Fainnes Mündel überliefert.'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-trodach-reathnaigh', 'marriage-jodhran-reathnaigh', 'trodach'),
    marriedAway('married-away-frisealach-kermena', 'marriage-oirbhealach-kermena', 'frisealach'),
    marriedAway('married-away-cetchathach-homlach', 'marriage-homlach-ultana', 'cetchathach'),
    marriedAway('married-away-deaghaide-uathmar', 'marriage-uathmar-zeilthra', 'deaghaide'),
    marriedAway('married-away-airt-bebhinn', 'marriage-seamair-bebhinn', 'airt'),
    marriedAway('married-away-cruthin-latharna', 'marriage-meallchu-latharna', 'cruthin')
  ],
  timeJumps: [
    {
      id: 'gap-fainne-pailin-reathnaigh',
      parentPartnershipId: 'marriage-fainne-eanbharr-caoimhe',
      childIds: ['pailin-caoimhe', 'reathnaigh-caoimhe'],
      years: 0,
      fromYear: '????',
      toYear: '1625',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1625 datierten Linie',
      notes: 'Die Quellhierarchie setzt zwischen dem Gründerpaar und der späteren Linie eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fainne-eanbharr-caoimhe',
    houseId: CAOIMHE_HOUSE_ID,
    crestSubtitle: 'Matriarchaler Laird-Clan innerhalb Lochansails · Tir na Gortanna · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fainne-founder-caoimhe',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Nic Caoimhe (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten, Erbfolge und Ciannaits historische Rolle folgen der bereitgestellten Nic-Caoimhe-Akte. Der Clan gehört als Laird zur Eigenbaronie des Mor Tiarna in Lochansail. Er wird grundsätzlich matriarchal geführt; ausdrücklich wegverheiratete Männer und die seltenen weiblichen Ausnahmen erhalten dennoch jeweils einen Zielhausknoten. Reathnaigh, Kermena, Hómlach, Uathmar, Bébhinn und Latharna führen ihre Linie nicht innerhalb dieser Akte fort. Ihre gegebenenfalls vorhandenen Kinder bleiben ausschließlich in den jeweiligen Zielstammbäumen. Die ausdrückliche Punktreihe nach dem Gründerpaar bleibt als Überlieferungslücke erhalten. Individuelle Nic-Caoimhe-Porträts wurden lokal gesichert; bereits kanonische Gegenaktenbilder werden wiederverwendet. Wiederholte Standardsilhouetten wurden nicht importiert.',
    sourceRevision: 3,
    blankFamily: false,
    preparedMainLine: false,
    matriarchal: true,
    inheritance: Object.freeze({
      title: 'Laird der Nic Caoimhe',
      system: 'matriarchal',
      headOrder: Object.freeze([
        'fainne-founder-caoimhe',
        'pailin-caoimhe',
        'quonnait-caiomhe',
        'ciannait-caoimhe'
      ]),
      publishedOrder: Object.freeze(['yllana-caoimhe', 'realtin-caoimhe'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_NIC_CAOIMHE_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_NIC_CAOIMHE_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Gortanna',
    historicalStatus: 'active',
    directMorTiarnaBarony: true,
    albicRank: 'laird',
    administrativeRole: 'Laird innerhalb Lochansails',
    immediateLiegeHouseId: 'haus-dal-cruthin',
    immediateLiegeHouseName: 'Clan Dál’Cruthin',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'matriarchal', 'sourceNote',
      'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-nic-caoimhe-gruender', 'haus-nic-caoimhe-gruenderin'],
      partnerships: ['marriage-haus-nic-caoimhe-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
