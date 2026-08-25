import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS
} from './kraehenmoor-house-profiles.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const WELLENSCHILD_HOUSE_ID = 'house-wellenschild';
const SOURCE_GAP_ID = 'gap-thord-ylva-to-yrsvard-ylandis-wellenschild';

const HOUSE_EMBLEMS = Object.freeze({
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  eibenschild: KRONENTAL_HOUSE_EMBLEMS.eibenschild,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz
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

const HEAD_IDS = new Set([
  'thord-wellenschild',
  'yrsvard-wellenschild',
  'fenrir-wellenschild',
  'kalfur-wellenschild',
  'othrik-wellenschild',
  'tjelvar-wellenschild',
  'asgeir-wellenschild',
  'hroar-wellenschild'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? WELLENSCHILD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_WELLENSCHILD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === WELLENSCHILD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
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
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function wardAwayPerson(id, name, sex, birth, targetHouseName, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    familyRole: 'ward-away',
    title: options.title || `Als Mündel an ${targetHouseName} vermittelt`,
    tags: [...(options.tags || []), 'Mündel', 'Weggegeben']
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

const PARTNERS_BY_ID = Object.freeze({
  'marriage-thord-ylva-wellenschild': ['thord-wellenschild', 'ylva-wellenschild-founder'],
  'marriage-alfrun-yrsvard-vaeren': ['alfrun-vaeren', 'yrsvard-wellenschild'],
  'marriage-ylandis-gunnar-wellenschild': ['ylandis-wellenschild', 'gunnar-wellensaenger'],
  'marriage-sturlaug-bylgja-soekeren': ['sturlaug-soekeren', 'bylgja-wellenschild'],
  'marriage-fritjof-kraka-wellenschild': ['fritjof-wellenschild', 'kraka-wellenschild-spouse'],
  'marriage-owain-arnora-trachwyll': ['owain-trachwyll', 'arnora-wellenschild'],
  'marriage-thordis-jorleif-wellenschild': ['thordis-wellenschild', 'jorleif-gullvig'],
  'marriage-fenrir-walla-wellenschild': ['fenrir-wellenschild', 'walla-culloch'],
  'marriage-torben-marit-wellenschild': ['torben-wellenschild', 'marit-eibenschild'],
  'marriage-yrska-thorin-wellenschild': ['yrska-wellenschild', 'thorin-eibenschild'],
  'marriage-kalfur-kenna-wellenschild': ['kalfur-wellenschild', 'kenna-eisenbieger'],
  'marriage-portha-hakon-wellenschild': ['portha-wellenschild', 'hakon-riesentot'],
  'marriage-magdis-kormak-wellenschild': ['magdis-wellenschild', 'kormak-sturmgeborener'],
  'marriage-othrik-cynehild-wellenschild': ['othrik-wellenschild', 'cynehild-frostauge'],
  'marriage-finnleik-petka-kummerherz': ['finnleik-kummerherz', 'petka-wellenschild'],
  'marriage-tjelvar-ciara-wellenschild': ['tjelvar-wellenschild', 'ciara-macborthwick'],
  'marriage-hallbjorn-laufey-wargh': ['hallbjorn-wargh', 'laufey-wellenschild'],
  'marriage-martein-gulda-wellenschild': ['martein-wellenschild', 'gulda-1682-goldglanz'],
  'marriage-asgeir-ivana-wellenschild': ['asgeir-wellenschild', 'ivana-wellensaenger'],
  'marriage-lornir-boudica-wellenschild': ['lornir-wellenschild', 'boudica-boyd'],
  'marriage-zorrik-rangrid-wellenschild': ['zorrik-wellenschild', 'rangrid-wellenschild-spouse'],
  'marriage-brogan-tjalda-schattenherz': ['brogan-wellenschild', 'tjalda-schattenherz']
});

function withLayoutExtension(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ]
    }
  };
}

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function alignLeafChildrenBelowPair(partnershipId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'wellenschild-parentage',
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
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function wardAway(id, name, parentPersonId, houseId, targetFamilyId, emblem = '') {
  return createWardAwayBranch({
    id,
    name,
    parentPersonId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Als Mündel an ${name} vermittelt`,
    extensions: {
      registryManagedFields: [
        'name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ]
    }
  });
}

export const HOUSE_WELLENSCHILD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wellenschild',
    title: 'Clan Wellenschild',
    motto: '',
    description: 'Hesirenclan von Wellenruh auf den Klageschild-Inseln im Königlichen Jarltum Kronental. Der Clan führt sich auf Thord Wellenschild zurück, der Wellenruh von Piraten befreite und dort den dauerhaften Sitz seiner Nachfahren begründete.',
    emblem: HOUSE_EMBLEMS.wellenschild,
    houseProfile: KRONENTAL_HOUSE_PROFILES.wellenschild
  },
  houses: [
    house(WELLENSCHILD_HOUSE_ID, 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-trachwyll', 'Haus Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-culloch', 'Clan Culloch'),
    house('house-eibenschild', 'Clan Eibenschild', HOUSE_EMBLEMS.eibenschild),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-macborthwick', 'Clan MacBorthwick'),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-boyd', 'Haus Boyd'),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz)
  ],
  persons: [
    person('thord-wellenschild', 'Thord Wellenschild', 'male', '????', '????', {
      title: 'Gründer des Clans Wellenschild',
      tags: ['Gründer']
    }),
    spouse('ylva-wellenschild-founder', 'Ylva', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Wellenschild',
      tags: ['Gründerin']
    }),

    person('yrsvard-wellenschild', 'Yrsvard Wellenschild', 'male', '1559', '1624'),
    awayWoman('ylandis-wellenschild', 'Ylandis Wellenschild', '1561', '1624', 'Clan Wellensänger'),
    spouse('alfrun-vaeren', 'Alfrún Vaeren', 'female', '1563', '1620', 'house-vaeren'),
    spouse('gunnar-wellensaenger', 'Gunnar Wellensänger', 'male', '1559', '1611', 'house-wellensaenger'),

    awayWoman('bylgja-wellenschild', 'Bylgja Wellenschild', '1579', '1634', 'Clan Sökeren'),
    person('fritjof-wellenschild', 'Fritjof Wellenschild', 'male', '1583', '1617'),
    awayWoman('arnora-wellenschild', 'Arnóra Wellenschild', '1586', '1659', 'Haus Trachwyll'),
    awayWoman('thordis-wellenschild', 'Thordis Wellenschild', '1600', '1675', 'Clan Gullvig'),
    person('fenrir-wellenschild', 'Fenrir Wellenschild', 'male', '1603', '1630'),
    spouse('sturlaug-soekeren', 'Sturlaug Sökeren', 'male', '1578', '1671', 'house-soekeren'),
    spouse('kraka-wellenschild-spouse', 'Kraka', 'female', '1584', '1605'),
    spouse('owain-trachwyll', 'Owain Trachwyll', 'male', '1585', '1654', 'house-trachwyll', {
      worldPersonId: 'person--haus-trachwyll-talfronwyn--owain-trachwyll'
    }),
    spouse('jorleif-gullvig', 'Jorleif Gullvig', 'male', '1600', '1695', 'house-gullvig'),
    spouse('walla-culloch', 'Walla Culloch', 'female', '1605', '1667', 'house-culloch'),

    person('torben-wellenschild', 'Torben Wellenschild', 'male', '1601', '1628'),
    person('yrska-wellenschild', 'Yrska Wellenschild', 'female', '1604', '1698', {
      notes: 'Thorin Eibenschild heiratete in die Wellenschild-Linie ein; Yrska führt den Stammzweig fort.'
    }),
    person('kalfur-wellenschild', 'Kalfur Wellenschild', 'male', '1624', '1677'),
    awayWoman('portha-wellenschild', 'Portha Wellenschild', '1627', '1704', 'Clan Riesentod'),
    spouse('marit-eibenschild', 'Marit Eibenschild', 'female', '1600', '1631', 'house-eibenschild'),
    spouse('thorin-eibenschild', 'Thorin Eibenschild', 'male', '1595', '1688', 'house-eibenschild'),
    spouse('kenna-eisenbieger', 'Kenna Eisenbieger', 'female', '1630', '1698', 'house-eisenbieger'),
    spouse('hakon-riesentot', 'Hakon Riesentod', 'male', '1627', '1681', 'house-riesentot'),

    person('reidar-wellenschild', 'Reidar Wellenschild', 'male', '1619', '1630'),
    awayWoman('magdis-wellenschild', 'Magdis Wellenschild', '1625', '1704', 'Clan Sturmgeborene'),
    person('othrik-wellenschild', 'Othrik Wellenschild', 'male', '1648', '1704'),
    awayWoman('petka-wellenschild', 'Petka Wellenschild', '1656', '1730', 'Clan Kummerherz'),
    spouse('kormak-sturmgeborener', 'Kormak Sturmgeborener', 'male', '1625', '1658', 'house-sturmgeborene'),
    spouse('cynehild-frostauge', 'Cynehild Frostauge', 'female', '1650', '1709', 'house-frostauge'),
    spouse('finnleik-kummerherz', 'Finnleik Kummerherz', 'male', '1656', '1724', 'house-kummerherz'),

    person('tjelvar-wellenschild', 'Tjelvar Wellenschild', 'male', '1666', ''),
    awayWoman('laufey-wellenschild', 'Laufey Wellenschild', '1674', '', 'Clan Wargh'),
    person('martein-wellenschild', 'Martein Wellenschild', 'male', '1679', ''),
    spouse('ciara-macborthwick', 'Ciara MacBorthwick', 'female', '1672', '', 'house-macborthwick'),
    spouse('hallbjorn-wargh', 'Hallbjorn Wargh', 'male', '1671', '', 'house-wargh'),
    spouse('gulda-1682-goldglanz', 'Gulda Goldglanz', 'female', '1682', '', 'house-goldglanz'),

    person('asgeir-wellenschild', 'Asgeir Wellenschild', 'male', '1690', ''),
    person('lornir-wellenschild', 'Lornir Wellenschild', 'male', '1697', ''),
    person('zorrik-wellenschild', 'Zorrik Wellenschild', 'male', '1703', ''),
    person('brogan-wellenschild', 'Brogan Wellenschild', 'male', '1700', ''),
    spouse('ivana-wellensaenger', 'Ivana Wellensänger', 'female', '1697', '', 'house-wellensaenger'),
    spouse('boudica-boyd', 'Boudica Boyd', 'female', '1702', '', 'house-boyd'),
    spouse('rangrid-wellenschild-spouse', 'Rangrid', 'female', '1705', ''),
    spouse('tjalda-schattenherz', 'Tjalda Schattenherz', 'female', '1702', '', 'house-schattenherz'),

    person('hroar-wellenschild', 'Hroar Wellenschild', 'male', '1715', ''),
    person('ulla-wellenschild', 'Ulla Wellenschild', 'female', '1719', ''),
    person('logi-wellenschild', 'Logi Wellenschild', 'male', '1721', ''),
    person('rinda-wellenschild', 'Rinda Wellenschild', 'female', '1724', ''),
    person('kolli-wellenschild', 'Kolli Wellenschild', 'male', '1724', ''),
    person('oda-wellenschild', 'Oda Wellenschild', 'female', '1727', ''),
    person('drott-wellenschild', 'Drott Wellenschild', 'male', '1723', ''),
    wardAwayPerson('inga-wellenschild', 'Inga Wellenschild', 'female', '1725', 'Clan Schattenherz', {
      title: 'Als Mündel an Clan Schattenherz vermittelt'
    })
  ],
  partnerships: [
    partnership('marriage-thord-ylva-wellenschild'),
    partnership('marriage-alfrun-yrsvard-vaeren', { status: 'ended', end: '1620' }),
    partnership('marriage-ylandis-gunnar-wellenschild', { status: 'ended', end: '1611' }),
    partnership('marriage-sturlaug-bylgja-soekeren', { status: 'ended', end: '1634' }),
    partnership('marriage-fritjof-kraka-wellenschild', { status: 'ended', end: '1605' }),
    partnership('marriage-owain-arnora-trachwyll', { status: 'ended', end: '1654' }),
    partnership('marriage-thordis-jorleif-wellenschild', { status: 'ended', end: '1675' }),
    partnership('marriage-fenrir-walla-wellenschild', { status: 'ended', end: '1630' }),
    directlyAboveOnlyChild('marriage-torben-marit-wellenschild', 'reidar-wellenschild', { status: 'ended', end: '1628' }),
    directlyAboveOnlyChild('marriage-yrska-thorin-wellenschild', 'magdis-wellenschild', { status: 'ended', end: '1688' }),
    partnership('marriage-kalfur-kenna-wellenschild', { status: 'ended', end: '1677' }),
    partnership('marriage-portha-hakon-wellenschild', { status: 'ended', end: '1681' }),
    partnership('marriage-magdis-kormak-wellenschild', { status: 'ended', end: '1658' }),
    partnership('marriage-othrik-cynehild-wellenschild', { status: 'ended', end: '1704' }),
    partnership('marriage-finnleik-petka-kummerherz', { status: 'ended', end: '1724' }),
    partnership('marriage-tjelvar-ciara-wellenschild'),
    partnership('marriage-hallbjorn-laufey-wargh'),
    directlyAboveOnlyChild('marriage-martein-gulda-wellenschild', 'brogan-wellenschild'),
    alignLeafChildrenBelowPair('marriage-asgeir-ivana-wellenschild'),
    alignLeafChildrenBelowPair('marriage-lornir-boudica-wellenschild'),
    alignLeafChildrenBelowPair('marriage-zorrik-rangrid-wellenschild'),
    alignLeafChildrenBelowPair('marriage-brogan-tjalda-schattenherz')
  ],
  parentages: [
    ...childrenOf(['yrsvard-wellenschild', 'ylandis-wellenschild'], 'marriage-thord-ylva-wellenschild', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(
      ['bylgja-wellenschild', 'fritjof-wellenschild', 'arnora-wellenschild', 'thordis-wellenschild', 'fenrir-wellenschild'],
      'marriage-alfrun-yrsvard-vaeren'
    ),
    ...childrenOf(['torben-wellenschild', 'yrska-wellenschild'], 'marriage-fritjof-kraka-wellenschild'),
    ...childrenOf(['kalfur-wellenschild', 'portha-wellenschild'], 'marriage-fenrir-walla-wellenschild'),
    ...childrenOf(['reidar-wellenschild'], 'marriage-torben-marit-wellenschild'),
    ...childrenOf(['magdis-wellenschild'], 'marriage-yrska-thorin-wellenschild'),
    ...childrenOf(['othrik-wellenschild', 'petka-wellenschild'], 'marriage-kalfur-kenna-wellenschild'),
    ...childrenOf(['tjelvar-wellenschild', 'laufey-wellenschild', 'martein-wellenschild'], 'marriage-othrik-cynehild-wellenschild'),
    ...childrenOf(['asgeir-wellenschild', 'lornir-wellenschild', 'zorrik-wellenschild'], 'marriage-tjelvar-ciara-wellenschild'),
    ...childrenOf(['brogan-wellenschild'], 'marriage-martein-gulda-wellenschild'),
    ...childrenOf(['hroar-wellenschild', 'ulla-wellenschild'], 'marriage-asgeir-ivana-wellenschild'),
    ...childrenOf(['logi-wellenschild', 'rinda-wellenschild'], 'marriage-lornir-boudica-wellenschild'),
    ...childrenOf(['kolli-wellenschild', 'oda-wellenschild'], 'marriage-zorrik-rangrid-wellenschild'),
    ...childrenOf(['drott-wellenschild', 'inga-wellenschild'], 'marriage-brogan-tjalda-schattenherz')
  ],
  cadetBranches: [
    marriedAway('married-away-ylandis-wellenschild-wellensaenger', 'Clan Wellensänger', 'marriage-ylandis-gunnar-wellenschild', 'house-wellensaenger', 'haus-wellensaenger', HOUSE_EMBLEMS.wellensaenger),
    marriedAway('married-away-bylgja-wellenschild-soekeren', 'Clan Sökeren', 'marriage-sturlaug-bylgja-soekeren', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren),
    marriedAway('married-away-arnora-wellenschild-trachwyll', 'Haus Trachwyll', 'marriage-owain-arnora-trachwyll', 'house-trachwyll', 'haus-trachwyll-talfronwyn', HOUSE_EMBLEMS.trachwyll),
    marriedAway('married-away-thordis-wellenschild-gullvig', 'Clan Gullvig', 'marriage-thordis-jorleif-wellenschild', 'house-gullvig', 'haus-gullvig', HOUSE_EMBLEMS.gullvig),
    marriedAway('married-away-portha-wellenschild-riesentod', 'Clan Riesentod', 'marriage-portha-hakon-wellenschild', 'house-riesentod', 'haus-riesentod', HOUSE_EMBLEMS.riesentod),
    marriedAway('married-away-magdis-wellenschild-sturmgeborene', 'Clan Sturmgeborene', 'marriage-magdis-kormak-wellenschild', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    marriedAway('married-away-petka-wellenschild-kummerherz', 'Clan Kummerherz', 'marriage-finnleik-petka-kummerherz', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-laufey-wellenschild-wargh', 'Clan Wargh', 'marriage-hallbjorn-laufey-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    wardAway('ward-away-inga-wellenschild-schattenherz', 'Clan Schattenherz', 'inga-wellenschild', 'house-schattenherz', 'haus-schattenherz', HOUSE_EMBLEMS.schattenherz)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-thord-ylva-wellenschild',
    parentPersonId: '',
    childIds: ['yrsvard-wellenschild', 'ylandis-wellenschild'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1559',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Wellenschild-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-thord-ylva-wellenschild',
    houseId: WELLENSCHILD_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Wellenruh · Klageschild-Inseln',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'thord-wellenschild',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    chartLayoutPolicy: 'strict-v1',
    sourceRevision: 2,
    sourceModule: 'Clan Wellenschild (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Wellenschild-Stammbaum wird ohne Personenfokus von Thord und Ylva bis zur jüngsten Generation des Jahres 1740 gezeigt. Das Hauswappen und genau ein absolut serieller Zeitsprung stehen direkt unter dem Gründerpaar. Yrska führt trotz ihrer Ehe mit Thorin Eibenschild die Wellenschild-Linie fort; alle auswärts fortgeführten Frauen erhalten dagegen direkte, senkrechte Wegverheiratet-Knoten. Inga bleibt leibliche Tochter Brogans und Tjaldas, trägt im Stammhaus aber den blauen Mündelstatus und eine direkte Verknüpfung zu Clan Schattenherz. Die fünf namenlosen Verlobten-Platzhalter der jüngsten Generation werden nicht importiert. Bereits ausgearbeitete Gegenakten liefern die kanonischen IDs und Porträts für Vaeren, Sökeren, Trachwyll, Kummerherz, Wargh, Goldglanz und Schattenherz. Wiederholte Standardsilhouetten werden nicht als Individualporträts gespeichert. Layout-Anker für Einzelkinder und blattförmige Geschwistergruppen werden als Quelldaten mitgeführt und durch die zentrale Layout-Prüfung validiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-wellenschild-gruender', 'haus-wellenschild-gruenderin'],
      partnerships: ['haus-wellenschild-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
