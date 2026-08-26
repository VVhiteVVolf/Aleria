import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_WELLENSAENGER_PORTRAITS } from './house-wellensaenger-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const WELLENSAENGER_HOUSE_ID = 'house-wellensaenger';
const SOURCE_GAP_ID = 'gap-snorri-to-gunnar-wellensaenger';

const HOUSE_EMBLEMS = Object.freeze({
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz
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
  'snorri-wellensaenger',
  'gunnar-wellensaenger',
  'hallvard-wellensaenger',
  'castar-wellensaenger',
  'agnar-wellensaenger',
  'eldgrim-wellensaenger',
  'fjorlag-wellensaenger'
]);

const HEIR_IDS = new Set(['uthar-wellensaenger', 'njall-wellensaenger']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? WELLENSAENGER_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_WELLENSAENGER_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === WELLENSAENGER_HOUSE_ID ? 'core' : 'married'),
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

function receivedWard(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel des Clans Wellensänger',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
  });
}

function sentWard(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
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
  'marriage-snorri-gwendolyn-wellensaenger': ['snorri-wellensaenger', 'gwendolyn-wellensaenger-founder'],
  'marriage-ylandis-gunnar-wellenschild': ['ylandis-wellenschild', 'gunnar-wellensaenger'],
  'marriage-siegthrygre-gunnora-vaeren': ['siegthrygre-vaeren', 'gunnora-wellensaenger'],
  'marriage-thorkel-elfrid-sturmgeborener': ['thorkel-sturmgeborener', 'elfrid-wellensaenger'],
  'marriage-hallvard-lathgertha-wellensaenger': ['hallvard-wellensaenger', 'lathgertha-frostauge'],
  'marriage-skeld-dagfrid-gullvig': ['skeld-gullvig', 'dagfrid-wellensaenger'],
  'marriage-castar-gilda-wellensaenger': ['castar-wellensaenger', 'gilda-eisenbieger'],
  'marriage-arthan-bergljot-trachwyll': ['arthan-trachwyll', 'bergljot-wellensaenger'],
  'marriage-agnar-una-wellensaenger': ['agnar-wellensaenger', 'una-wellensaenger-spouse'],
  'marriage-bjoern-vedis-freiwinter': ['bjoern-freiwinter', 'vedis-wellensaenger'],
  'marriage-ubbe-hildrun-wellensaenger': ['ubbe-wellensaenger-spouse', 'hildrun-wellensaenger'],
  'marriage-eldgrim-solrun-wellensaenger': ['eldgrim-wellensaenger', 'solrun-wellensaenger-spouse'],
  'marriage-hrothgar-fjorgyn-soekeren': ['hrothgar-soekeren', 'fjorgyn-wellensaenger'],
  'marriage-gustaf-theudelinde-wellensaenger': ['gustaf-wellensaenger', 'theudelinde-konradinger'],
  'marriage-fjorlag-bryndis-skald': ['fjorlag-wellensaenger', 'bryndis-skald'],
  'marriage-ulkfred-hulda-riesentod': ['ulkfred-riesentod', 'hulda-wellensaenger'],
  'marriage-drengur-lif-wellensaenger': ['drengur-wellensaenger', 'lif-wellensaenger-spouse'],
  'marriage-zyrek-ulla-wellensaenger': ['zyrek-wellensaenger', 'ulla-soekering'],
  'marriage-bjartur-albrun-wellensaenger': ['bjartur-wellensaenger', 'albrun-arnulfinger'],
  'marriage-uthar-isfir-wellensaenger': ['uthar-wellensaenger', 'isfir-riesentod'],
  'marriage-asgeir-ivana-wellenschild': ['asgeir-wellenschild', 'ivana-wellensaenger'],
  'marriage-njalfr-siri-wellensaenger': ['njalfr-wellensaenger', 'siri-schneehammer'],
  'marriage-nodin-ulrika-wellensaenger': ['nodin-heldenruf', 'ulrika-wellensaenger'],
  'marriage-hordur-sigrid-wellensaenger': ['hordur-wellensaenger', 'sigrid-eisensang'],
  'marriage-ulfrik-maiken-wellensaenger': ['ulfrik-nordwind', 'maiken-wellensaenger']
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

function alignChildrenBelowPair(partnershipId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'wellensaenger-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'wellensaenger-foster',
    type: 'foster',
    legitimacy: 'unknown',
    notes
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

export const HOUSE_WELLENSAENGER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wellensaenger',
    title: 'Clan Wellensänger',
    motto: '',
    description: 'Seefahrer- und Hesirenclan von Burg Amol in Wellenklang. Die Wellensänger verbinden aldrimarische Seekriegstradition mit vennyrischer Ritterlichkeit und verehren Nimue sowie Tethyra.',
    emblem: HOUSE_EMBLEMS.wellensaenger,
    houseProfile: KRONENTAL_HOUSE_PROFILES.wellensaenger
  },
  houses: [
    house(WELLENSAENGER_HOUSE_ID, 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn", HOUSE_EMBLEMS.trachwyll),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-soekering', 'Haus Sökering'),
    house('house-arnulfinger', 'Haus Arnulfinger'),
    house('house-konradinger', 'Haus Konradinger'),
    house('house-schneehammer', 'Clan Schneehammer'),
    house('house-heldenruf', 'Clan Heldenruf'),
    house('house-eisensang', 'Clan Eisensang'),
    house('house-nordwind', 'Clan Nordwind'),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz)
  ],
  persons: [
    person('snorri-wellensaenger', 'Snorri Wellensänger', 'male', '????', '????', {
      title: 'Gründer und erster Hesir des Clans Wellensänger',
      tags: ['Gründer']
    }),
    spouse('gwendolyn-wellensaenger-founder', 'Gwendolyn', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Wellensänger',
      tags: ['Gründerin']
    }),

    person('gunnar-wellensaenger', 'Gunnar Wellensänger', 'male', '1559', '1611', {
      title: 'Hesir des Clans Wellensänger'
    }),
    awayWoman('gunnora-wellensaenger', 'Gunnora Wellensänger', '1562', '1605', 'Clan Vaeren'),
    spouse('ylandis-wellenschild', 'Ylandis Wellenschild', 'female', '1561', '1624', 'house-wellenschild'),
    spouse('siegthrygre-vaeren', 'Siegthrygre Vaeren', 'male', '1561', '1616', 'house-vaeren'),

    awayWoman('elfrid-wellensaenger', 'Elfrid Wellensänger', '1580', '1635', 'Clan Sturmgeborene'),
    person('hallvard-wellensaenger', 'Hallvard Wellensänger', 'male', '1582', '1650', {
      title: 'Hesir und Herr von Burg Amol · Zweiter Admiral der Grünen'
    }),
    awayWoman('dagfrid-wellensaenger', 'Dagfrid Wellensänger', '1594', '1651', 'Clan Gullvig'),
    spouse('thorkel-sturmgeborener', 'Thorkel Sturmgeborener', 'male', '1580', '1625', 'house-sturmgeborene', {
      notes: 'Das Todesjahr 1625 folgt der vollständigen Sturmgeborenen-Gegenakte; 1623 bezeichnet dort den Beginn der nächsten überlieferten Phase und war hier fälschlich als Todesjahr übernommen worden.'
    }),
    spouse('lathgertha-frostauge', 'Lathgertha Frostauge', 'female', '1583', '1655', 'house-frostauge'),
    spouse('skeld-gullvig', 'Skeld Gullvig', 'male', '1594', '1630', 'house-gullvig'),

    person('castar-wellensaenger', 'Castar Wellensänger', 'male', '1603', '1671', {
      title: 'Hesir des Clans Wellensänger 1650–1671'
    }),
    awayWoman('bergljot-wellensaenger', 'Bergljot Wellensänger', '1610', '1677', 'Haus Trachwyll'),
    spouse('gilda-eisenbieger', 'Gilda Eisenbieger', 'female', '1600', '1681', 'house-eisenbieger'),
    spouse('arthan-trachwyll', 'Arthan Trachwyll', 'male', '1607', '1694', 'house-trachwyll-talfronwyn'),

    person('agnar-wellensaenger', 'Agnar Wellensänger', 'male', '1627', '1689', {
      title: 'Hesir des Clans Wellensänger 1671–1689'
    }),
    awayWoman('vedis-wellensaenger', 'Vedis Wellensänger', '1630', '1699', 'Clan Freiwinter'),
    person('hildrun-wellensaenger', 'Hildrun Wellensänger', 'female', '1634', '1704'),
    spouse('una-wellensaenger-spouse', 'Una', 'female', '1630', '1671'),
    spouse('bjoern-freiwinter', 'Bjoern Freiwinter', 'male', '1622', '1669', 'house-freiwinter'),
    spouse('ubbe-wellensaenger-spouse', 'Ubbe', 'male', '1632', '1695'),

    person('eldgrim-wellensaenger', 'Eldgrim Wellensänger', 'male', '1648', '1709', {
      title: 'Hesir des Clans Wellensänger 1689–1709'
    }),
    awayWoman('fjorgyn-wellensaenger', 'Fjörgyn Wellensänger', '1653', '1737', 'Clan Sökeren'),
    person('gustaf-wellensaenger', 'Gustaf Wellensänger', 'male', '1658', '', {
      title: 'Legendärer Seefahrer · Priester der Dame und Seemaid'
    }),
    spouse('solrun-wellensaenger-spouse', 'Solrun', 'female', '1651', '1694'),
    spouse('hrothgar-soekeren', 'Hrothgar Sökeren', 'male', '1648', '', 'house-soekeren'),
    spouse('theudelinde-konradinger', 'Theudelinde Konradinger', 'female', '1660', '', 'house-konradinger'),

    person('fjorlag-wellensaenger', 'Fjorlag Wellensänger', 'male', '1669', '', {
      title: 'Hesir des Clans Wellensänger seit 1709'
    }),
    awayWoman('hulda-wellensaenger', 'Hulda Wellensänger', '1674', '1739', 'Clan Riesentod'),
    person('drengur-wellensaenger', 'Drengur Wellensänger', 'male', '1679', ''),
    person('zyrek-wellensaenger', 'Zyrek Wellensänger', 'male', '1678', '', {
      title: 'Skalde des Clans Wellensänger'
    }),
    person('bjartur-wellensaenger', 'Bjartur Wellensänger', 'male', '1680', '', {
      title: 'Paladin der Seemaid und Dame der See'
    }),
    spouse('bryndis-skald', 'Bryndís Skald', 'female', '1674', '', 'house-skald'),
    spouse('ulkfred-riesentod', 'Ulkfred Riesentod', 'male', '1670', '1720', 'house-riesentod'),
    spouse('lif-wellensaenger-spouse', 'Lif', 'female', '1680', '1702'),
    spouse('ulla-soekering', 'Ulla Sökering', 'female', '1681', '', 'house-soekering'),
    spouse('albrun-arnulfinger', 'Albrun Arnulfinger', 'female', '1683', '', 'house-arnulfinger'),

    person('uthar-wellensaenger', 'Uthar Wellensänger', 'male', '1695', '', {
      title: 'Erster Erbe des Clans Wellensänger'
    }),
    awayWoman('ivana-wellensaenger', 'Ivana Wellensänger', '1697', '', 'Clan Wellenschild'),
    person('njalfr-wellensaenger', 'Njalfr Wellensänger', 'male', '1698', ''),
    person('ulrika-wellensaenger', 'Ulrika Wellensänger', 'female', '1702', ''),
    person('hordur-wellensaenger', 'Hordur Wellensänger', 'male', '1700', ''),
    person('maiken-wellensaenger', 'Maiken Wellensänger', 'female', '1704', ''),
    spouse('isfir-riesentod', 'Isfir Riesentod', 'female', '1698', '', 'house-riesentod'),
    spouse('asgeir-wellenschild', 'Asgeir Wellenschild', 'male', '1690', '', 'house-wellenschild'),
    spouse('siri-schneehammer', 'Siri Schneehammer', 'female', '????', '', 'house-schneehammer'),
    spouse('nodin-heldenruf', 'Nodin Heldenruf', 'male', '1700', '', 'house-heldenruf', {
      title: 'Hafenmeister am Hof der Wellensänger'
    }),
    spouse('sigrid-eisensang', 'Sigrid Eisensang', 'female', '1702', '', 'house-eisensang'),
    spouse('ulfrik-nordwind', 'Ulfrik Nordwind', 'male', '1701', '', 'house-nordwind'),

    person('njall-wellensaenger', 'Njall Wellensänger', 'male', '1720', '', {
      title: 'Zweiter Erbe des Clans Wellensänger'
    }),
    person('oksana-wellensaenger', 'Oksana Wellensänger', 'female', '1725', ''),
    receivedWard('bjarni-grendel', 'Bjarni Grendel', 'male', '1726', 'house-grendel', {
      title: 'Aufgenommenes Mündel Uthars'
    }),
    person('isak-wellensaenger', 'Isak Wellensänger', 'male', '1726', ''),
    sentWard('isaura-wellensaenger', 'Isaura Wellensänger', 'female', '1726', '', 'Clan Kummerherz', {
      title: 'Leibliche Tochter Njalfrs und Siris · als Mündel bei Clan Kummerherz'
    }),
    person('orm-wellensaenger', 'Orm Wellensänger', 'male', '1724', ''),
    person('rikka-wellensaenger', 'Rikka Wellensänger', 'female', '1723', ''),
    person('elrik-wellensaenger', 'Elrik Wellensänger', 'male', '1726', ''),
    person('arne-wellensaenger', 'Arne Wellensänger', 'male', '1724', ''),
    person('kaisa-wellensaenger', 'Kaisa Wellensänger', 'female', '1728', '')
  ],
  partnerships: [
    partnership('marriage-snorri-gwendolyn-wellensaenger', { status: 'ended' }),
    alignChildrenBelowPair('marriage-ylandis-gunnar-wellenschild', { status: 'ended', end: '1611' }),
    partnership('marriage-siegthrygre-gunnora-vaeren', { status: 'ended', end: '1605' }),
    partnership('marriage-thorkel-elfrid-sturmgeborener', { status: 'ended', end: '1623' }),
    alignChildrenBelowPair('marriage-hallvard-lathgertha-wellensaenger', { status: 'ended', end: '1650' }),
    partnership('marriage-skeld-dagfrid-gullvig', { status: 'ended', end: '1630' }),
    alignChildrenBelowPair('marriage-castar-gilda-wellensaenger', { status: 'ended', end: '1671' }),
    partnership('marriage-arthan-bergljot-trachwyll', { status: 'ended', end: '1677' }),
    alignChildrenBelowPair('marriage-agnar-una-wellensaenger', { status: 'ended', end: '1671' }),
    partnership('marriage-bjoern-vedis-freiwinter', { status: 'ended', end: '1669' }),
    directlyAboveOnlyChild('marriage-ubbe-hildrun-wellensaenger', 'gustaf-wellensaenger', { status: 'ended', end: '1695' }),
    alignChildrenBelowPair('marriage-eldgrim-solrun-wellensaenger', { status: 'ended', end: '1694' }),
    partnership('marriage-hrothgar-fjorgyn-soekeren', { status: 'ended', end: '1737' }),
    alignChildrenBelowPair('marriage-gustaf-theudelinde-wellensaenger'),
    alignChildrenBelowPair('marriage-fjorlag-bryndis-skald'),
    partnership('marriage-ulkfred-hulda-riesentod', { status: 'ended', end: '1720' }),
    alignChildrenBelowPair('marriage-drengur-lif-wellensaenger', { status: 'ended', end: '1702' }),
    directlyAboveOnlyChild('marriage-zyrek-ulla-wellensaenger', 'hordur-wellensaenger'),
    directlyAboveOnlyChild('marriage-bjartur-albrun-wellensaenger', 'maiken-wellensaenger'),
    alignChildrenBelowPair('marriage-uthar-isfir-wellensaenger'),
    partnership('marriage-asgeir-ivana-wellenschild'),
    alignChildrenBelowPair('marriage-njalfr-siri-wellensaenger'),
    directlyAboveOnlyChild('marriage-nodin-ulrika-wellensaenger', 'orm-wellensaenger'),
    alignChildrenBelowPair('marriage-hordur-sigrid-wellensaenger'),
    alignChildrenBelowPair('marriage-ulfrik-maiken-wellensaenger')
  ],
  parentages: [
    ...childrenOf(['gunnar-wellensaenger', 'gunnora-wellensaenger'], 'marriage-snorri-gwendolyn-wellensaenger', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Gunnar und Gunnora.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['elfrid-wellensaenger', 'hallvard-wellensaenger', 'dagfrid-wellensaenger'], 'marriage-ylandis-gunnar-wellenschild'),
    ...childrenOf(['castar-wellensaenger', 'bergljot-wellensaenger'], 'marriage-hallvard-lathgertha-wellensaenger'),
    ...childrenOf(['agnar-wellensaenger', 'vedis-wellensaenger', 'hildrun-wellensaenger'], 'marriage-castar-gilda-wellensaenger'),
    // Fjörgyns abgeschlossener Sökeren-Seitenzweig steht bewusst links von
    // Eldgrims fortgeführter Hauptlinie. Die Quellenreihenfolge nach Alter ist
    // für die Diagrammposition hier ausdrücklich nachrangig.
    ...childrenOf(['fjorgyn-wellensaenger', 'eldgrim-wellensaenger'], 'marriage-agnar-una-wellensaenger'),
    ...childrenOf(['gustaf-wellensaenger'], 'marriage-ubbe-hildrun-wellensaenger'),
    ...childrenOf(['fjorlag-wellensaenger', 'hulda-wellensaenger', 'drengur-wellensaenger'], 'marriage-eldgrim-solrun-wellensaenger'),
    ...childrenOf(['zyrek-wellensaenger', 'bjartur-wellensaenger'], 'marriage-gustaf-theudelinde-wellensaenger'),
    ...childrenOf(['uthar-wellensaenger', 'ivana-wellensaenger'], 'marriage-fjorlag-bryndis-skald'),
    ...childrenOf(['njalfr-wellensaenger', 'ulrika-wellensaenger'], 'marriage-drengur-lif-wellensaenger'),
    ...childrenOf(['hordur-wellensaenger'], 'marriage-zyrek-ulla-wellensaenger'),
    ...childrenOf(['maiken-wellensaenger'], 'marriage-bjartur-albrun-wellensaenger'),
    ...childrenOf(['njall-wellensaenger', 'oksana-wellensaenger'], 'marriage-uthar-isfir-wellensaenger'),
    ...fosterChildren(['bjarni-grendel'], 'uthar-wellensaenger', 'Bjarni Grendel ist Uthars aufgenommenes Mündel und kein leibliches Kind Uthars und Isfirs.'),
    ...childrenOf(['isak-wellensaenger', 'isaura-wellensaenger'], 'marriage-njalfr-siri-wellensaenger'),
    ...childrenOf(['orm-wellensaenger'], 'marriage-nodin-ulrika-wellensaenger'),
    ...childrenOf(['rikka-wellensaenger', 'elrik-wellensaenger'], 'marriage-hordur-sigrid-wellensaenger'),
    ...childrenOf(['arne-wellensaenger', 'kaisa-wellensaenger'], 'marriage-ulfrik-maiken-wellensaenger')
  ],
  cadetBranches: [
    marriedAway('married-away-gunnora-wellensaenger-vaeren', 'Clan Vaeren', 'marriage-siegthrygre-gunnora-vaeren', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-elfrid-wellensaenger-sturmgeborene', 'Clan Sturmgeborene', 'marriage-thorkel-elfrid-sturmgeborener', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    marriedAway('married-away-dagfrid-wellensaenger-gullvig', 'Clan Gullvig', 'marriage-skeld-dagfrid-gullvig', 'house-gullvig', 'haus-gullvig', HOUSE_EMBLEMS.gullvig),
    marriedAway('married-away-bergljot-wellensaenger-trachwyll', 'Haus Trachwyll', 'marriage-arthan-bergljot-trachwyll', 'house-trachwyll', 'haus-trachwyll-talfronwyn', HOUSE_EMBLEMS.trachwyll),
    marriedAway('married-away-vedis-wellensaenger-freiwinter', 'Clan Freiwinter', 'marriage-bjoern-vedis-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-fjorgyn-wellensaenger-soekeren', 'Clan Sökeren', 'marriage-hrothgar-fjorgyn-soekeren', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren),
    marriedAway('married-away-hulda-wellensaenger-riesentod', 'Clan Riesentod', 'marriage-ulkfred-hulda-riesentod', 'house-riesentod', 'haus-riesentod', HOUSE_EMBLEMS.riesentod),
    marriedAway('married-away-ivana-wellensaenger-wellenschild', 'Clan Wellenschild', 'marriage-asgeir-ivana-wellenschild', 'house-wellenschild', 'haus-wellenschild', HOUSE_EMBLEMS.wellenschild),
    wardAway('ward-away-isaura-wellensaenger-kummerherz', 'Clan Kummerherz', 'isaura-wellensaenger', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-snorri-gwendolyn-wellensaenger',
    parentPersonId: '',
    childIds: ['gunnar-wellensaenger', 'gunnora-wellensaenger'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1559',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Wellensänger-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-snorri-gwendolyn-wellensaenger',
    houseId: WELLENSAENGER_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Burg Amol · Wellenklang',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'snorri-wellensaenger',
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
    chartAlignLineageOriginOverTree: true,
    sourceRevision: 5,
    sourceModule: 'Clan Wellensänger (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus von Snorri und Gwendolyn bis zur jüngsten Generation des Jahres 1740. Das Hauswappen und genau ein absolut serieller Zeitsprung liegen zwischen dem Gründerpaar und Gunnar beziehungsweise Gunnora. Acht auswärtige Ehen von Wellensänger-Frauen besitzen direkte Wegverheiratet-Knoten; ihre fremden Nachkommen bleiben ausschließlich in den Zielakten. Hildrun, Ulrika und Maiken führen dagegen entsprechend ihren ausdrücklich überlieferten Wellensänger-Kindern die eigene Linie fort. Zwei Quellüberschriften verschweigen Gilda Eisenbieger beziehungsweise Una als Mutter, obwohl die jeweils unmittelbar zugeordnete Ehezeile sie als einzige Ehefrau des Vaters führt; beide werden daher als Mütter der zugehörigen Kinderblöcke verwendet. Die Wellensänger-Quelle datiert Isaura auf 1726, während die ältere Kummerherz-Gegenakte 1725 nannte; als Hausquelle ihrer Herkunft ist hier 1726 maßgeblich und wird in der Gegenakte gespiegelt. Dasselbe Bild und derselbe Name identifizieren den in der Grendel-Akte nur als an einen unbekannten Küstenclan vermittelten Bjarni eindeutig als Uthars Mündel bei den Wellensängern. Die Schreibweise Sökaren wird zum registrierten Clan Sökeren normalisiert. Thorkel Sturmgeboreners Todesjahr wurde anhand der vollständigen Sturmgeborenen-Gegenakte von 1623 auf 1625 berichtigt. Die fünf unbenannten Verlobtenfelder und wiederholte Standardsilhouetten werden nicht als Personen oder Individualporträts importiert.',
    registryManagedExtensionFields: [
      'blankFamily', 'sourceNote', 'chartLayoutPolicy', 'chartAlignLineageOriginOverTree'
    ],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-wellensaenger-gruender', 'haus-wellensaenger-gruenderin'],
      partnerships: ['haus-wellensaenger-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.wellensaenger.folderPath
});
