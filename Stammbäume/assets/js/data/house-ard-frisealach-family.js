import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_ARD_FRISEALACH_LOCAL_PORTRAIT_IDS,
  HOUSE_ARD_FRISEALACH_PORTRAITS,
  HOUSE_ARD_FRISEALACH_REUSED_PORTRAIT_IDS
} from './house-ard-frisealach-portraits.js';
import {
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS
} from './leitheach-house-profiles.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';

const FRISEALACH_HOUSE_ID = 'house-frisealach';
const FRISEALACH_EMBLEM = TIR_NA_GORTANNA_HOUSE_EMBLEMS.frisealach;

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const HOUSE_HEAD_IDS = new Set([
  'tadhghan-founder-frisealach',
  'aodhagan-frisealach',
  'kalman-frisealach',
  'oirbhealach-frisealach',
  'giollanaimhe-frisealach'
]);

const SUCCESSION_IDS = new Set([
  'koarnach-frisealach',
  'yachthar-frisealach',
  'nioran-frisealach'
]);

const HEAD_TITLES = Object.freeze({
  'tadhghan-founder-frisealach': 'Gründer und erster Dún Tiarna der Ard Frisealach',
  'aodhagan-frisealach': 'Dún Tiarna der Ard Frisealach · bis 1662',
  'kalman-frisealach': 'Dún Tiarna der Ard Frisealach · 1662–1681',
  'oirbhealach-frisealach': 'Dún Tiarna der Ard Frisealach · 1681–1730',
  'giollanaimhe-frisealach': 'Dún Tiarna der Ard Frisealach · seit 1730',
  'koarnach-frisealach': 'Erster in der Erbfolge des Dún Tiarna',
  'yachthar-frisealach': 'Zweiter in der Erbfolge des Dún Tiarna',
  'nioran-frisealach': 'Dritter in der Erbfolge des Dún Tiarna'
});

const TARGETS = Object.freeze({
  airgid: Object.freeze({
    name: 'Haus Airgid',
    houseId: 'house-airgid',
    targetFamilyId: 'haus-airgid',
    emblem: ''
  }),
  fiachrach: Object.freeze({
    name: 'Clan Uí Fiachrach',
    houseId: 'house-fiachrach',
    targetFamilyId: 'haus-ui-fiachrach',
    emblem: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach']
  }),
  trodach: Object.freeze({
    name: 'Ard Trodach',
    houseId: 'house-trodach',
    targetFamilyId: 'haus-ard-trodach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']
  }),
  suedstahl: Object.freeze({
    name: 'Clan Südstahl',
    houseId: 'house-suedstahl',
    targetFamilyId: 'haus-suedstahl',
    emblem: KRONENTAL_HOUSE_EMBLEMS.suedstahl
  }),
  somhairle: Object.freeze({
    name: 'Sidhe Somhairle',
    houseId: 'house-somhairle',
    targetFamilyId: 'haus-somhairle',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle
  }),
  cumhail: Object.freeze({
    name: 'Clan Mac Ard Cumhaill',
    houseId: 'house-cumhail',
    targetFamilyId: 'haus-mac-ard-cumhaill',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  }),
  ceardaiocht: Object.freeze({
    name: 'Clan Dál’Ceardaíocht',
    houseId: 'house-dal-ceardaiocht',
    targetFamilyId: 'haus-dal-ceardaiocht',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']
  }),
  gwefrydd: Object.freeze({
    name: 'Haus Gwefrydd',
    houseId: 'house-gwefrydd',
    targetFamilyId: 'haus-gwefrydd',
    emblem: 'assets/images/houses/Artus Streben/haus-gwefrydd.png'
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = FRISEALACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_ARD_FRISEALACH_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === FRISEALACH_HOUSE_ID ? 'core' : 'married'),
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

function awayWoman(id, name, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, 'female', birth, death, FRISEALACH_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...new Set([...(options.tags || []), 'Wegverheiratet'])]
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
    idPrefix: 'frisealach-parentage',
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

const TADHGHAN_IDS = ['tadhghan-founder-frisealach', 'garmania-ancient'];
const AODHAGAN_IDS = ['aodhagan-frisealach', 'koarnach-rioga'];
const BAOIGHEALL_IDS = ['baoigheall-frisealach', 'gaothaire-airgid'];
const KALMAN_IDS = ['joneen-cruthin', 'kalman-frisealach'];
const VALIBH_IDS = ['tiarnog-fiachrach', 'valibh-frisealach'];
const BRIGHDE_IDS = ['brighde-frisealach', 'fothadh-trodach'];
const EADBHARD_IDS = ['eadbhard-frisealach', 'duibhseach-gortach'];
const OIRBHEALACH_IDS = ['oirbhealach-frisealach', 'kermena-caoimhe'];
const GORMLAITH_IDS = ['salah-suedstahl', 'gormlaith-frisealach'];
const DIARMUID_IDS = ['diarmuid-frisealach', 'hati-1655-spindelschlag'];
const BAIRRFHIONN_IDS = ['bairrfhionn-frisealach', 'donndubhan-ancient'];
const GLAODHACH_IDS = ['glaodhach-frisealach', 'muiredach-somhairle'];
const GIOLLANAIHME_IDS = ['slainefhlaith-gealach', 'giollanaimhe-frisealach'];
const UILINN_IDS = ['tairdelbach-cumhail', 'uilinn-frisealach'];
const BRONNACH_IDS = ['cathalan-cruthin', 'bronnach-frisealach'];
const KADHGHAN_IDS = ['kadhghan-frisealach', 'muirgheal-trodach'];
const HANAE_IDS = ['midean-ceardaiocht', 'hanae-frisealach'];
const KOARNACH_IDS = ['koarnach-frisealach', 'ealar-morgacht'];
const EITHNE_IDS = ['tommen-gwefrydd', 'eithne-frisealach'];
const HURRACAN_IDS = ['hurracan-frisealach', 'wihalg-somhairle'];
const HOILBHE_IDS = ['hoilbhe-frisealach', 'nobhan-ancient'];
const JARALT_IDS = ['jaralt-frisealach', 'leagha-luchdon'];

export const HOUSE_ARD_FRISEALACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-frisealach',
    title: 'Ard Frisealach',
    motto: '',
    description: 'Dún-Tiarna-Haus der Lehensherrschaft Ard Frisealach mit Sitz in Lasbun, Tir na Gortanna.',
    emblem: FRISEALACH_EMBLEM,
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES.frisealach
  },
  houses: [
    house(FRISEALACH_HOUSE_ID, 'Ard Frisealach', FRISEALACH_EMBLEM),
    house('house-rioga', 'Haus Rioga'),
    house('house-airgid', 'Haus Airgid'),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-fiachrach', 'Clan Uí Fiachrach', LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach']),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-gortach', 'Haus Gortach'),
    house('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    house('house-suedstahl', 'Clan Südstahl', KRONENTAL_HOUSE_EMBLEMS.suedstahl),
    house('house-spindelschlag', 'Clan Spindelschlag', KRONENTAL_HOUSE_EMBLEMS.spindelschlag),
    house('house-somhairle', 'Sidhe Somhairle', TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']),
    house('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']),
    house('house-morgacht', 'Haus Mórgacht'),
    house('house-gwefrydd', 'Haus Gwefrydd', 'assets/images/houses/Artus Streben/haus-gwefrydd.png'),
    house('house-luchdon', 'Haus Luchdon')
  ],
  persons: [
    person('tadhghan-founder-frisealach', 'Tadhghán Frisealach', 'male', '????', '????', FRISEALACH_HOUSE_ID, {
      tags: ['Gründer']
    }),
    spouse('garmania-ancient', 'Garmania', 'female', '????', '????'),

    person('aodhagan-frisealach', 'Aodhagán Frisealach', 'male', '1606', '1662'),
    spouse('koarnach-rioga', 'Koarnach Rioga', 'female', '1608', '1655', 'house-rioga'),
    person('tighearnach-frisealach', 'Tighearnach Frisealach', 'male', '1609', '1704', FRISEALACH_HOUSE_ID, {
      title: 'Ehemaliger Anführer der Höllenreiter',
      tags: ['Höllenreiter'],
      notes: 'Tighearnach führte die Höllenreiter bis zu seinem Tod.'
    }),
    awayWoman('baoigheall-frisealach', 'Baoigheall Frisealach', '1612', '1679', 'airgid'),
    spouse('gaothaire-airgid', 'Gaothaire Airgid', 'male', '1608', '1674', 'house-airgid'),

    person('kalman-frisealach', 'Kalman Frisealach', 'male', '1626', '1681'),
    spouse('joneen-cruthin', 'Joneen Cruthin', 'female', '1628', '1701', 'house-cruthin'),
    awayWoman('valibh-frisealach', 'Valibh Frisealach', '1628', '1693', 'fiachrach'),
    spouse('tiarnog-fiachrach', 'Tiarnóg Fiachrach', 'male', '1626', '1685', 'house-fiachrach'),
    awayWoman('brighde-frisealach', 'Brighde Frisealach', '1630', '1701', 'trodach'),
    spouse('fothadh-trodach', 'Fothadh Trodach', 'male', '1627', '1690', 'house-trodach'),
    person('eadbhard-frisealach', 'Èadbhard Frisealach', 'male', '1632', '1697'),
    spouse('duibhseach-gortach', 'Duibhseach Gortach', 'female', '1632', '1704', 'house-gortach'),

    person('oirbhealach-frisealach', 'Oirbhealach Frisealach', 'male', '1650', '1730'),
    spouse('kermena-caoimhe', 'Kermena Caoimhe', 'female', '1654', '1739', 'house-caoimhe'),
    awayWoman('gormlaith-frisealach', 'Gormlaith Frisealach', '1652', '1727', 'suedstahl', {
      notes: 'Gormlaith und ihr Zwillingsbruder Diarmuid gehörten Rag Blauzahns Abenteurergilde an. Später heiratete sie Salah und lebte in Heldenwacht.'
    }),
    spouse('salah-suedstahl', 'Salah Südstahl', 'male', '1651', '1719', 'house-suedstahl'),
    person('diarmuid-frisealach', 'Diarmuid Frisealach', 'male', '1652', '1730', FRISEALACH_HOUSE_ID, {
      tags: ['Abenteurergilde'],
      notes: 'Diarmuid und seine Zwillingsschwester Gormlaith gehörten Rag Blauzahns Abenteurergilde an. Er lebte am Hof eines Freundes und kehrte nach dessen Tod nach Lasbun zurück.'
    }),
    spouse('hati-1655-spindelschlag', 'Hati Spindelschlag', 'female', '1655', '1728', 'house-spindelschlag'),
    person('bairrfhionn-frisealach', 'Bairrfhionn Frisealach', 'male', '1655', '1719'),
    spouse('donndubhan-ancient', 'Donndubhán', 'female', '1657', '1709'),
    awayWoman('glaodhach-frisealach', 'Glaodhach Frisealach', '1655', '1699', 'somhairle'),
    spouse('muiredach-somhairle', 'Muiredach Somhairle', 'male', '1648', '1720', 'house-somhairle'),

    person('giollanaimhe-frisealach', 'Giollanáimhe Frisealach', 'male', '1672', ''),
    spouse('slainefhlaith-gealach', 'Slainefhlaith Gealach', 'female', '1677', '', 'house-gealach'),
    awayWoman('uilinn-frisealach', 'Uilinn Frisealach', '1676', '', 'cumhail'),
    spouse('tairdelbach-cumhail', 'Tairdelbach Cumhail', 'male', '1674', '', 'house-cumhail'),
    awayWoman('bronnach-frisealach', 'Bronnach Frisealach', '1679', '', 'cruthin'),
    spouse('cathalan-cruthin', 'Cáthalán Cruthin', 'male', '1677', '', 'house-cruthin'),
    person('muircheartach-frisealach', 'Muircheartach Frisealach', 'male', '1690', '', FRISEALACH_HOUSE_ID, {
      title: 'Anführer der Höllenreiter · Huskarl und Tiarna',
      tags: ['Höllenreiter', 'Huskarl', 'Tiarna'],
      notes: 'Sohn Diarmuids und Hatis. Er wuchs in Heldenwacht auf, zog später zu seinen Verwandten und führt heute die Höllenreiter. Als Huskarl und Tiarna vereint er ungewöhnlich viele Klassen und Künste.'
    }),
    person('kadhghan-frisealach', 'Kadhghán Frisealach', 'male', '1677', ''),
    spouse('muirgheal-trodach', 'Muirgheal Trodach', 'female', '1682', '', 'house-trodach'),
    awayWoman('hanae-frisealach', 'Hanae Frisealach', '1680', '', 'ceardaiocht'),
    spouse('midean-ceardaiocht', 'Mídean Ceardaíocht', 'male', '1679', '1733', 'house-dal-ceardaiocht'),

    person('koarnach-frisealach', 'Koarnach Frisealach', 'male', '1692', ''),
    spouse('ealar-morgacht', 'Ealar Mórgacht', 'female', '1696', '', 'house-morgacht'),
    awayWoman('eithne-frisealach', 'Eithne Frisealach', '1702', '', 'gwefrydd', {
      notes: 'Die neue Ard-Frisealach-Quelle nennt 1700; die bereits ausgearbeitete Gegenakte des Hauses Gwefrydd führt kanonisch 1702.'
    }),
    spouse('tommen-gwefrydd', 'Tommen Gwefrydd', 'male', '1698', '', 'house-gwefrydd'),
    person('hurracan-frisealach', 'Hurracan Frisealach', 'male', '1695', ''),
    spouse('wihalg-somhairle', 'Wihalg Somhairle', 'female', '1700', '', 'house-somhairle'),
    person('sluaghan-frisealach', 'Sluaghán Frisealach', 'male', '1699', ''),
    person('vathna-frisealach', 'Vathna Frisealach', 'female', '1703', ''),
    person('hoilbhe-frisealach', 'Hoilbhe Frisealach', 'female', '1699', ''),
    spouse('nobhan-ancient', 'Nobhán', 'male', '1701', ''),
    person('jaralt-frisealach', 'Jaralt Frisealach', 'male', '1702', ''),
    spouse('leagha-luchdon', 'Leagha Luchdon', 'female', '1705', '', 'house-luchdon'),
    person('rioghbhar-frisealach', 'Rioghbhár Frisealach', 'male', '1705', ''),
    person('kermena-1708-frisealach', 'Kermena Frisealach', 'female', '1708', ''),
    person('tarlachan-frisealach', 'Tarlachán Frisealach', 'male', '1712', ''),

    person('yachthar-frisealach', 'Yachthar Frisealach', 'male', '1714', ''),
    person('nioran-frisealach', 'Niorán Frisealach', 'male', '1718', ''),
    person('neidhe-frisealach', 'Néidhe Frisealach', 'female', '1722', ''),
    person('parthas-frisealach', 'Párthas Frisealach', 'male', '1725', ''),
    person('uaithe-frisealach', 'Uaithe Frisealach', 'female', '1728', ''),
    person('trianach-frisealach', 'Trianach Frisealach', 'male', '1722', ''),
    person('gaothaire-1726-frisealach', 'Gaothaire Frisealach', 'male', '1726', ''),
    person('aolbha-frisealach', 'Aolbha Frisealach', 'female', '1724', ''),
    person('jiarla-frisealach', 'Jiarla Frisealach', 'female', '1727', '')
  ],
  partnerships: [
    endedMarriage('marriage-tadhghan-garmania-frisealach', TADHGHAN_IDS),
    endedMarriage('marriage-aodhagan-koarnach', AODHAGAN_IDS, '1655'),
    endedMarriage('marriage-baoigheall-gaothaire', BAOIGHEALL_IDS, '1674'),
    endedMarriage('marriage-joneen-kalman', KALMAN_IDS, '1681'),
    endedMarriage('marriage-tiarnog-valibh', VALIBH_IDS, '1685'),
    endedMarriage('marriage-brighde-fothadh', BRIGHDE_IDS, '1690'),
    endedMarriage('marriage-eadbhard-duibhseach', EADBHARD_IDS, '1697'),
    endedMarriage('marriage-oirbhealach-kermena', OIRBHEALACH_IDS, '1730'),
    endedMarriage('marriage-salah-gormlaith-suedstahl', GORMLAITH_IDS, '1719'),
    endedMarriage('marriage-diarmuid-hati', DIARMUID_IDS, '1728'),
    endedMarriage('marriage-bairrfhionn-donndubhan', BAIRRFHIONN_IDS, '1709'),
    endedMarriage('marriage-glaodhach-muiredach', GLAODHACH_IDS, '1699'),
    createMarriage('marriage-slainefhlaith-giollanaimhe', ...GIOLLANAIHME_IDS),
    createMarriage('marriage-tairdelbach-uilinn', ...UILINN_IDS),
    createMarriage('marriage-cathalan-bronnach', ...BRONNACH_IDS),
    createMarriage('marriage-kadhghan-muirgheal', ...KADHGHAN_IDS),
    endedMarriage('marriage-midean-hanae', HANAE_IDS, '1733'),
    createMarriage('marriage-koarnach-ealar', ...KOARNACH_IDS),
    createMarriage('marriage-tommen-eithne', ...EITHNE_IDS),
    createMarriage('marriage-hurracan-wihalg', ...HURRACAN_IDS),
    createMarriage('marriage-hoilbhe-nobhan', ...HOILBHE_IDS),
    createMarriage('marriage-jaralt-leagha', ...JARALT_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['aodhagan-frisealach', 'tighearnach-frisealach', 'baoigheall-frisealach'],
      TADHGHAN_IDS,
      'marriage-tadhghan-garmania-frisealach',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Zwischen dem Gründerpaar und der ab 1606 datierten Linie fehlen einzeln überlieferte Generationen.',
        extensions: { timeJumpId: 'gap-tadhghan-aodhagan-siblings' }
      }
    ),
    ...childrenOf(
      ['kalman-frisealach', 'valibh-frisealach', 'brighde-frisealach', 'eadbhard-frisealach'],
      AODHAGAN_IDS,
      'marriage-aodhagan-koarnach'
    ),
    ...childrenOf(
      ['oirbhealach-frisealach', 'gormlaith-frisealach', 'diarmuid-frisealach'],
      KALMAN_IDS,
      'marriage-joneen-kalman'
    ),
    ...childrenOf(['bairrfhionn-frisealach', 'glaodhach-frisealach'], EADBHARD_IDS, 'marriage-eadbhard-duibhseach'),
    ...childrenOf(
      ['giollanaimhe-frisealach', 'uilinn-frisealach', 'bronnach-frisealach'],
      OIRBHEALACH_IDS,
      'marriage-oirbhealach-kermena'
    ),
    ...childrenOf(['muircheartach-frisealach'], DIARMUID_IDS, 'marriage-diarmuid-hati'),
    ...childrenOf(['kadhghan-frisealach', 'hanae-frisealach'], BAIRRFHIONN_IDS, 'marriage-bairrfhionn-donndubhan'),
    ...childrenOf(
      ['koarnach-frisealach', 'eithne-frisealach', 'hurracan-frisealach', 'sluaghan-frisealach', 'vathna-frisealach'],
      GIOLLANAIHME_IDS,
      'marriage-slainefhlaith-giollanaimhe'
    ),
    ...childrenOf(
      ['hoilbhe-frisealach', 'jaralt-frisealach', 'rioghbhar-frisealach', 'kermena-1708-frisealach', 'tarlachan-frisealach'],
      KADHGHAN_IDS,
      'marriage-kadhghan-muirgheal'
    ),
    ...childrenOf(['yachthar-frisealach', 'nioran-frisealach'], KOARNACH_IDS, 'marriage-koarnach-ealar'),
    ...childrenOf(['neidhe-frisealach', 'parthas-frisealach', 'uaithe-frisealach'], HURRACAN_IDS, 'marriage-hurracan-wihalg'),
    ...childrenOf(['trianach-frisealach', 'gaothaire-1726-frisealach'], HOILBHE_IDS, 'marriage-hoilbhe-nobhan'),
    ...childrenOf(['aolbha-frisealach', 'jiarla-frisealach'], JARALT_IDS, 'marriage-jaralt-leagha')
  ],
  cadetBranches: [
    marriedAway('married-away-airgid-baoigheall', 'marriage-baoigheall-gaothaire', 'airgid'),
    marriedAway('married-away-fiachrach-valibh', 'marriage-tiarnog-valibh', 'fiachrach'),
    marriedAway('married-away-trodach-brighde', 'marriage-brighde-fothadh', 'trodach'),
    marriedAway('married-away-suedstahl-gormlaith', 'marriage-salah-gormlaith-suedstahl', 'suedstahl'),
    marriedAway('married-away-somhairle-glaodhach', 'marriage-glaodhach-muiredach', 'somhairle'),
    marriedAway('married-away-cumhail-uilinn', 'marriage-tairdelbach-uilinn', 'cumhail'),
    marriedAway('married-away-cruthin-bronnach', 'marriage-cathalan-bronnach', 'cruthin'),
    marriedAway('married-away-ceardaiocht-hanae', 'marriage-midean-hanae', 'ceardaiocht'),
    marriedAway('married-away-gwefrydd-eithne', 'marriage-tommen-eithne', 'gwefrydd')
  ],
  timeJumps: [
    {
      id: 'gap-tadhghan-aodhagan-siblings',
      parentPartnershipId: 'marriage-tadhghan-garmania-frisealach',
      parentPersonId: '',
      childIds: ['aodhagan-frisealach', 'tighearnach-frisealach', 'baoigheall-frisealach'],
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1606 datierten Linie',
      fromYear: '????',
      toYear: '1606',
      estimatedYears: 0,
      certainty: 'probable',
      notes: 'Die Punktreihe der bereitgestellten Hierarchie markiert nicht einzeln überlieferte Generationen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-tadhghan-garmania-frisealach',
    houseId: FRISEALACH_HOUSE_ID,
    crestSubtitle: 'Dún Tiarnatum der Ard Frisealach · Lasbun · Tir na Gortanna · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tadhghan-founder-frisealach',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Ard Frisealach (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten, Erbfolge und historische Hinweise folgen der bereitgestellten Ard-Frisealach-Akte. Die ausdrückliche Punktreihe nach dem Gründerpaar bleibt als Überlieferungslücke erhalten. Der Quellfehler zu den Zwillingen Gormlaith und Diarmuid wurde eindeutig berichtigt. Die Partnerkarte nennt Nobhán, während eine spätere Überschrift Noghán schreibt; übernommen wurde die Karte. Eithnes bereits kanonisches Geburtsjahr 1702 aus der Gwefrydd-Gegenakte bleibt gegenüber der neuen Altangabe 1700 bestehen. Die frühere Kadhghán–Lannraig-Verknüpfung wurde auf Nutzerhinweis berichtigt: Kadhghán ist mit Muirgheal Trodach, der ergänzten Schwester Lannraigs und Cearbhalls, verheiratet. Bereits vorhandene Porträts derselben Weltpersonen werden wiederverwendet; Muiredach und Wihalg erhalten nun ihre Bilder aus der ausgearbeiteten Somhairle-Gegenakte. Wiederholte Standardsilhouetten und abweichende historische Zweitbilder wurden nicht importiert.',
    sourceRevision: 6,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Dún Tiarna der Ard Frisealach',
      headOrder: Object.freeze([
        'tadhghan-founder-frisealach',
        'aodhagan-frisealach',
        'kalman-frisealach',
        'oirbhealach-frisealach',
        'giollanaimhe-frisealach'
      ]),
      publishedOrder: Object.freeze([
        'koarnach-frisealach',
        'yachthar-frisealach',
        'nioran-frisealach'
      ])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_ARD_FRISEALACH_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_ARD_FRISEALACH_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true,
      historicalAlternatePortraitsIgnored: true
    }),
    sourceDiscrepancies: Object.freeze({
      eithneBirth: Object.freeze({ source: '1700', canonical: '1702' }),
      nobhanSpelling: Object.freeze({ card: 'Nobhán', descendantHeading: 'Noghán', canonical: 'Nobhán' })
    }),
    principality: 'Leitheach',
    territory: 'Tir na Gortanna',
    historicalStatus: 'active',
    albicRank: 'dun-tiarna',
    administrativeRole: 'Dún Tiarna der Lehensherrschaft Ard Frisealach',
    immediateLiegeHouseId: 'haus-dal-cruthin',
    immediateLiegeHouseName: 'Clan Dál’Cruthin',
    legacyTitles: Object.freeze(['Haus Frisealach', 'Clan Frisealach']),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'sourceNote', 'inheritance',
      'portraitPolicy', 'sourceDiscrepancies'
    ],
    registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-frisealach-gruender', 'haus-frisealach-gruenderin', 'lannraig-trodach'],
      partnerships: ['marriage-haus-frisealach-founders', 'marriage-kadhghan-lannraig'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
