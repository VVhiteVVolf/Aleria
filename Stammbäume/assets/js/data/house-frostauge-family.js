import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS } from './kraehenmoor-house-profiles.js';
import { HOUSE_FROSTAUGE_PORTRAITS } from './house-frostauge-portraits.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const FROSTAUGE_HOUSE_ID = 'house-frostauge';
const SOURCE_GAP_ID = 'gap-thorfinn-yrsa-to-frostauge-branches';

const HOUSE_EMBLEMS = Object.freeze({
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  frostzorn: KRONENTAL_HOUSE_EMBLEMS.frostzorn,
  vaeren: KRONENTAL_HOUSE_EMBLEMS.vaeren,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  holmr: KRONENTAL_HOUSE_EMBLEMS.holmr,
  skaife: KRONENTAL_HOUSE_EMBLEMS.skaife,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  blutklinge: IVARSHEIM_HOUSE_EMBLEMS.blutklinge,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  varulv: RORIKSHEIM_HOUSE_EMBLEMS.varulv,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn
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
  'thorfinn-frostauge',
  'hrolfr-frostauge',
  'benjen-frostauge',
  'leifric-frostauge',
  'snorri-frostauge',
  'aegir-frostauge',
  'gangr-frostauge'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? FROSTAUGE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FROSTAUGE_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    familyRole: options.familyRole || (houseId === FROSTAUGE_HOUSE_ID ? 'core' : 'married'),
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
  'marriage-thorfinn-yrsa-frostauge': ['thorfinn-frostauge', 'yrsa-vaeren-frostauge-founder'],
  'marriage-hrolfr-bergdis-frostauge': ['hrolfr-frostauge', 'bergdis-eisenbieger'],
  'marriage-hallvard-lathgertha-frostauge': ['hallvard-wellensaenger', 'lathgertha-frostauge'],
  'marriage-vilhjalm-yrgitte-frostauge': ['vilhjalm-frostauge', 'yrgitte-holmr'],
  'marriage-benjen-carys-frostauge': ['benjen-frostauge', 'carys-drewi'],
  'marriage-sverre-yrsa-frostauge': ['sverre-sturmgeborener', 'yrsa-frostauge'],
  'marriage-eldric-rafla-frostauge': ['eldric-frostauge', 'rafla-blutklinge'],
  'marriage-leifric-alawen-frostauge': ['leifric-frostauge', 'alawen-trachwyll'],
  'marriage-ragnar-mif-frostauge': ['ragnar-frostauge', 'mif-ragnar-frostauge'],
  'marriage-vorn-pidra-frostauge': ['vorn-frostauge', 'pidra-vorn-frostauge'],
  'marriage-frideborg-owain-frostauge': ['owain-frideborg-frostauge', 'frideborg-frostauge'],
  'marriage-snorri-ranveig-frostauge': ['snorri-frostauge', 'ranveig-sturmgeborene'],
  'marriage-cyneleif-mirja-frostauge': ['cyneleif-frostauge', 'mirja-eisenbieger'],
  'marriage-halfdan-alfrun-frostauge': ['halfdan-skald', 'alfrun-frostauge'],
  'marriage-othrik-cynehild-frostauge': ['othrik-wellenschild', 'cynehild-frostauge'],
  'marriage-gunnleik-ormhild-frostauge': ['gunnleik-varulv', 'ormhild-frostauge'],
  'marriage-askeladd-ragnhild-frostauge': ['askeladd-skaife', 'ragnhild-frostauge'],
  'marriage-finnbar-ragnfrid-frostauge': ['finnbar-diud', 'ragnfrid-frostauge'],
  'marriage-njord-nott-frostauge': ['njord-frostauge', 'nott-grendel'],
  'marriage-tormund-yrgitte-frostauge': ['tormund-riesentod', 'yrgitte-frostauge'],
  'marriage-aegir-alta-frostauge': ['aegir-frostauge', 'alta-schwarzblut'],
  'marriage-tjudmund-egberta-frostauge': ['tjudmund-schwarzdorn', 'egberta-frostauge'],
  'marriage-inghard-eldrid-frostauge': ['inghard-frostauge', 'eldrid-gullvig'],
  'marriage-fjorgynn-jord-frostauge': ['fjorgynn-frostauge', 'jord-frostauge-spouse'],
  'marriage-sigurd-freydis-frostauge': ['sigurd-vaeren', 'freydis-frostauge'],
  'marriage-gangr-gerda-frostauge': ['gangr-frostauge', 'gerda-eisenbieger'],
  'marriage-runar-johild-frostauge': ['runar-1694-sturmgeborener', 'johild-frostauge'],
  'marriage-gardar-dagfrid-frostauge': ['gardar-frostauge', 'dagfrid-sturmgeborene'],
  'marriage-malfrid-olaf-frostauge': ['malfrid-frostauge', 'olaf-malfrid-frostauge']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function withLayoutExtension(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [...new Set([
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ])]
    }
  };
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function directlyAbovePrimaryChildWithPackedSiblingBranches(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    directlyAboveOnlyChild(partnershipId, childPersonId, options),
    'chartPackSiblingBranchesBesideAlignedChild',
    true
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
    idPrefix: 'frostauge-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '', subtitle = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: subtitle || `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function unknownHouseBranch(personSlug, partnershipId) {
  return marriedAway(
    `married-away-${personSlug}-unknown`,
    'Unbekanntes Haus',
    partnershipId,
    'house-unknown',
    'haus-unbekannt',
    '',
    'Wegverheiratet an ein unbekanntes Haus'
  );
}

function cadetFrostzornBranch() {
  return createCadetHouseBranch({
    id: 'cadet-house-frostzorn-from-vorn',
    name: 'Clan Frostzorn',
    parentPartnershipId: 'marriage-vorn-pidra-frostauge',
    houseId: 'house-frostzorn',
    targetFamilyId: 'haus-frostzorn',
    emblem: HOUSE_EMBLEMS.frostzorn,
    subtitle: 'Abtrünniger Kadettenzweig auf den Sirenen-Zahn-Riff-Inseln',
    crestFrame: 'iron',
    notes: 'Vorn Frostauge begründete den Zweig nach dem verlorenen Holmgang und seiner Verbannung.',
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem',
        'subtitle', 'crestFrame', 'notes'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export const HOUSE_FROSTAUGE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-frostauge',
    title: 'Clan Frostauge',
    motto: '',
    description: 'Hesirenclan aus Heldenwacht. Die Frostaugen zählen zu den großen Seekriegergeschlechtern des Königlichen Jarltums Kronental.',
    emblem: HOUSE_EMBLEMS.frostauge,
    houseProfile: KRONENTAL_HOUSE_PROFILES.frostauge
  },
  houses: [
    house(FROSTAUGE_HOUSE_ID, 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-frostzorn', 'Clan Frostzorn', HOUSE_EMBLEMS.frostzorn),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-holmr', 'Clan Holmr', HOUSE_EMBLEMS.holmr),
    house('house-drewi', 'Haus Drewi'),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-blutklinge', 'Clan Blutklinge', HOUSE_EMBLEMS.blutklinge),
    house('house-trachwyll', 'Clan Trachwyll', HOUSE_EMBLEMS.trachwyll),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-skaife', 'Clan Skaife', HOUSE_EMBLEMS.skaife),
    house('house-diud', 'Clan Diud'),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('thorfinn-frostauge', 'Thorfinn Frostauge', 'male', '????', '????', {
      title: 'Früher Stammvater des Clans Frostauge'
    }),
    spouse('yrsa-vaeren-frostauge-founder', 'Yrsa Vaeren', 'female', '????', '????', 'house-vaeren'),

    person('hrolfr-frostauge', 'Hrolfr Frostauge', 'male', '1572', '1630', {
      title: 'Hesir · Oberster Admiral der Grünen · Gefallen bei Wellenruh'
    }),
    awayWoman('lathgertha-frostauge', 'Lathgertha Frostauge', '1583', '1655', 'Clan Wellensänger'),
    person('vilhjalm-frostauge', 'Vilhjalm Frostauge', 'male', '1577', '1627'),
    spouse('bergdis-eisenbieger', 'Bergdis Eisenbieger', 'female', '1577', '1635', 'house-eisenbieger'),
    spouse('hallvard-wellensaenger', 'Hallvard Wellensänger', 'male', '1582', '1650', 'house-wellensaenger'),
    spouse('yrgitte-holmr', 'Yrgitte Holmr', 'female', '1578', '1634', 'house-holmr'),

    person('benjen-frostauge', 'Benjen Frostauge', 'male', '1597', '1630', {
      title: 'Hesir nach Hrolfr · in Gefangenschaft hingerichtet'
    }),
    awayWoman('yrsa-frostauge', 'Yrsa Frostauge', '1601', '1677', 'Clan Sturmgeborene', {
      title: 'Meisterflüsterin Aldrimars · Wegverheiratet an Clan Sturmgeborene'
    }),
    person('eldric-frostauge', 'Eldric Frostauge', 'male', '1596', '1630', {
      title: 'Kapitän · Gefallen bei der zweiten Seeschlacht von Wellenruh'
    }),
    person('leifric-frostauge', 'Leifric Frostauge', 'male', '1599', '1691', {
      title: 'Hesir nach Benjens Gefangennahme · Diplomat'
    }),
    spouse('carys-drewi', 'Carys Drewi', 'female', '1596', '1634', 'house-drewi'),
    spouse('sverre-sturmgeborener', 'Sverre Sturmgeborener', 'male', '1592', '1671', 'house-sturmgeborene'),
    spouse('rafla-blutklinge', 'Rafla Blutklinge', 'female', '1601', '1635', 'house-blutklinge'),
    spouse('alawen-trachwyll', 'Alawen Trachwyll', 'female', '1605', '1700', 'house-trachwyll'),

    person('ragnar-frostauge', 'Ragnar Frostauge', 'male', '1617', '1673'),
    person('lodin-frostauge', 'Lodin Frostauge', 'male', '1614', '1630'),
    person('vorn-frostauge', 'Vorn Frostauge', 'male', '1620', '1673', {
      title: 'Zweiter Sohn Benjens · Gründer des abtrünnigen Clan Frostzorn',
      notes: 'Unterlag Leifric im Holmgang und ging auf die Sirenen-Zahn-Riff-Inseln ins Exil.'
    }),
    awayWoman('frideborg-frostauge', 'Frideborg Frostauge', '1624', '1706', 'ein unbekanntes Haus'),
    person('snorri-frostauge', 'Snorri Frostauge', 'male', '1637', '1715'),
    person('cyneleif-frostauge', 'Cyneleif Frostauge', 'male', '1647', '1725'),
    awayWoman('alfrun-frostauge', 'Alfrún Frostauge', '1649', '1711', 'Clan Skald'),
    awayWoman('cynehild-frostauge', 'Cynehild Frostauge', '1650', '1709', 'Clan Wellenschild'),
    awayWoman('ormhild-frostauge', 'Ormhild Frostauge', '1655', '1687', 'Clan Varulv'),
    spouse('mif-ragnar-frostauge', 'Mif', 'female', '1620', '1681'),
    spouse('pidra-vorn-frostauge', 'Pidra', 'female', '1622', '1672'),
    spouse('owain-frideborg-frostauge', 'Owain', 'male', '1620', '1695'),
    spouse('ranveig-sturmgeborene', 'Ranveig Sturmgeborene', 'female', '1632', '1675', 'house-sturmgeborene'),
    spouse('mirja-eisenbieger', 'Mirja Eisenbieger', 'female', '1652', '1733', 'house-eisenbieger'),
    spouse('halfdan-skald', 'Halfdan Skald', 'male', '1648', '1703', 'house-skald'),
    spouse('othrik-wellenschild', 'Othrik Wellenschild', 'male', '1648', '1704', 'house-wellenschild'),
    spouse('gunnleik-varulv', 'Gunnleik Varulv', 'male', '1654', '1691', 'house-varulv'),

    awayWoman('ragnhild-frostauge', 'Ragnhild Frostauge', '1640', '1680', 'Clan Skaife'),
    awayWoman('ragnfrid-frostauge', 'Ragnfrid Frostauge', '1642', '1718', 'Clan Diud'),
    person('njord-frostauge', 'Njörd Frostauge', 'male', '1664', '', {
      title: 'Berühmter Seefahrer Aldrimars'
    }),
    awayWoman('yrgitte-frostauge', 'Yrgitte Frostauge', '1659', '1731', 'Clan Riesentod', {
      title: 'Spätere Erzpatriarchin Aldrimars · Wegverheiratet an Clan Riesentod'
    }),
    person('aegir-frostauge', 'Aegir Frostauge', 'male', '1671', '', {
      title: 'Amtierender Hesir des Clans Frostauge'
    }),
    awayWoman('egberta-frostauge', 'Egberta Frostauge', '1677', '', 'Clan Schwarzdorn'),
    person('inghard-frostauge', 'Inghard Frostauge', 'male', '1675', '', {
      title: 'Verwalter des Hafens von Heldenwacht'
    }),
    spouse('askeladd-skaife', 'Askeladd Skaife', 'male', '1638', '1680', 'house-skaife'),
    spouse('finnbar-diud', 'Finnbar Diud', 'male', '1638', '1731', 'house-diud'),
    spouse('nott-grendel', 'Nótt Grendel', 'female', '1669', '', 'house-grendel'),
    spouse('tormund-riesentod', 'Tormund Riesentod', 'male', '1656', '1738', 'house-riesentod'),
    spouse('alta-schwarzblut', 'Alta Schwarzblut', 'female', '1673', '', 'house-schwarzblut'),
    spouse('tjudmund-schwarzdorn', 'Tjudmund Schwarzdorn', 'male', '1673', '', 'house-schwarzdorn'),
    spouse('eldrid-gullvig', 'Eldrid Gullvig', 'female', '1677', '1731', 'house-gullvig'),

    person('fjorgynn-frostauge', 'Fjörgynn Frostauge', 'male', '1691', '', {
      title: 'Seefahrer und Krieger'
    }),
    awayWoman('freydis-frostauge', 'Freydis Frostauge', '1694', '', 'Clan Vaeren'),
    person('gangr-frostauge', 'Gangr Frostauge', 'male', '1695', '', {
      title: 'Erbe des Hesir-Titels'
    }),
    awayWoman('johild-frostauge', 'Johild Frostauge', '1698', '', 'Clan Sturmgeborene'),
    person('gardar-frostauge', 'Gardar Frostauge', 'male', '1696', ''),
    person('malfrid-frostauge', 'Málfrid Frostauge', 'female', '1700', ''),
    spouse('jord-frostauge-spouse', 'Jörd', 'female', '1696', '', '', {
      notes: 'Die Quelle nennt 1596; wegen Mann und Kindern wird der offensichtliche Jahrhundertfehler als 1696 gelesen.'
    }),
    spouse('sigurd-vaeren', 'Sigurd Vaeren', 'male', '1690', '', 'house-vaeren'),
    spouse('gerda-eisenbieger', 'Gerda Eisenbieger', 'female', '1693', '', 'house-eisenbieger'),
    spouse('runar-1694-sturmgeborener', 'Runar Sturmgeborener', 'male', '1694', '', 'house-sturmgeborene'),
    spouse('dagfrid-sturmgeborene', 'Dagfrid Sturmgeborene', 'female', '1700', '', 'house-sturmgeborene'),
    spouse('olaf-malfrid-frostauge', 'Olaf', 'male', '1702', ''),

    person('lykke-frostauge', 'Lykke Frostauge', 'female', '1714', ''),
    person('hler-frostauge', 'Hlér Frostauge', 'male', '1719', ''),
    person('garm-frostauge', 'Garm Frostauge', 'male', '1724', ''),
    person('gymir-frostauge', 'Gymir Frostauge', 'male', '1722', ''),
    person('kael-frostauge', 'Kael Frostauge', 'male', '1725', ''),
    person('unna-frostauge', 'Unna Frostauge', 'female', '1722', ''),
    person('ysa-frostauge', 'Ysa Frostauge', 'female', '1727', ''),
    person('lysild-frostauge', 'Lysild Frostauge', 'female', '1725', ''),
    person('nanna-frostauge', 'Nanna Frostauge', 'female', '1728', '')
  ],
  partnerships: [
    partnership('marriage-thorfinn-yrsa-frostauge', { status: 'ended' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-hrolfr-bergdis-frostauge', 'benjen-frostauge', { status: 'ended', end: '1630' }),
    partnership('marriage-hallvard-lathgertha-frostauge', { status: 'ended', end: '1650' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-vilhjalm-yrgitte-frostauge', 'leifric-frostauge', { status: 'ended', end: '1627' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-benjen-carys-frostauge', 'vorn-frostauge', { status: 'ended', end: '1630' }),
    partnership('marriage-sverre-yrsa-frostauge', { status: 'ended', end: '1671' }),
    directlyAboveOnlyChild('marriage-eldric-rafla-frostauge', 'frideborg-frostauge', { status: 'ended', end: '1630' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-leifric-alawen-frostauge', 'snorri-frostauge', { status: 'ended', end: '1691' }),
    alignLeafChildrenBelowPair('marriage-ragnar-mif-frostauge', { status: 'ended', end: '1673' }),
    partnership('marriage-vorn-pidra-frostauge', { status: 'ended', end: '1672' }),
    partnership('marriage-frideborg-owain-frostauge', { status: 'ended', end: '1695' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-snorri-ranveig-frostauge', 'aegir-frostauge', { status: 'ended', end: '1675' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-cyneleif-mirja-frostauge', 'inghard-frostauge', { status: 'ended', end: '1725' }),
    partnership('marriage-halfdan-alfrun-frostauge', { status: 'ended', end: '1703' }),
    partnership('marriage-othrik-cynehild-frostauge', { status: 'ended', end: '1704' }),
    partnership('marriage-gunnleik-ormhild-frostauge', { status: 'ended', end: '1687' }),
    partnership('marriage-askeladd-ragnhild-frostauge', { status: 'ended', end: '1680' }),
    partnership('marriage-finnbar-ragnfrid-frostauge', { status: 'ended', end: '1718' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-njord-nott-frostauge', 'fjorgynn-frostauge'),
    partnership('marriage-tormund-yrgitte-frostauge', { status: 'ended', end: '1731' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-aegir-alta-frostauge', 'gangr-frostauge'),
    partnership('marriage-tjudmund-egberta-frostauge'),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-inghard-eldrid-frostauge', 'gardar-frostauge', { status: 'ended', end: '1731' }),
    alignLeafChildrenBelowPair('marriage-fjorgynn-jord-frostauge'),
    partnership('marriage-sigurd-freydis-frostauge'),
    alignLeafChildrenBelowPair('marriage-gangr-gerda-frostauge'),
    partnership('marriage-runar-johild-frostauge'),
    alignLeafChildrenBelowPair('marriage-gardar-dagfrid-frostauge'),
    alignLeafChildrenBelowPair('marriage-malfrid-olaf-frostauge')
  ],
  parentages: [
    ...childrenOf(['hrolfr-frostauge', 'lathgertha-frostauge', 'vilhjalm-frostauge'], 'marriage-thorfinn-yrsa-frostauge', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden Thorfinn und Yrsa mit der Generation Hrolfrs, Lathgerthas und Vilhjalms.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['benjen-frostauge', 'yrsa-frostauge'], 'marriage-hrolfr-bergdis-frostauge'),
    ...childrenOf(['eldric-frostauge', 'leifric-frostauge'], 'marriage-vilhjalm-yrgitte-frostauge'),
    ...childrenOf(['ragnar-frostauge', 'lodin-frostauge', 'vorn-frostauge'], 'marriage-benjen-carys-frostauge'),
    ...childrenOf(['frideborg-frostauge'], 'marriage-eldric-rafla-frostauge'),
    ...childrenOf(['snorri-frostauge', 'cyneleif-frostauge', 'alfrun-frostauge', 'cynehild-frostauge', 'ormhild-frostauge'], 'marriage-leifric-alawen-frostauge'),
    ...childrenOf(['ragnhild-frostauge', 'ragnfrid-frostauge'], 'marriage-ragnar-mif-frostauge'),
    ...childrenOf(['njord-frostauge', 'yrgitte-frostauge', 'aegir-frostauge'], 'marriage-snorri-ranveig-frostauge'),
    ...childrenOf(['egberta-frostauge', 'inghard-frostauge'], 'marriage-cyneleif-mirja-frostauge'),
    ...childrenOf(['fjorgynn-frostauge', 'freydis-frostauge'], 'marriage-njord-nott-frostauge'),
    ...childrenOf(['gangr-frostauge', 'johild-frostauge'], 'marriage-aegir-alta-frostauge'),
    ...childrenOf(['gardar-frostauge', 'malfrid-frostauge'], 'marriage-inghard-eldrid-frostauge'),
    ...childrenOf(['lykke-frostauge', 'hler-frostauge'], 'marriage-fjorgynn-jord-frostauge'),
    ...childrenOf(['garm-frostauge', 'gymir-frostauge', 'kael-frostauge'], 'marriage-gangr-gerda-frostauge'),
    ...childrenOf(['unna-frostauge', 'ysa-frostauge'], 'marriage-gardar-dagfrid-frostauge'),
    ...childrenOf(['lysild-frostauge', 'nanna-frostauge'], 'marriage-malfrid-olaf-frostauge')
  ],
  cadetBranches: [
    marriedAway('married-away-lathgertha-frostauge-wellensaenger', 'Clan Wellensänger', 'marriage-hallvard-lathgertha-frostauge', 'house-wellensaenger', 'haus-wellensaenger', HOUSE_EMBLEMS.wellensaenger),
    marriedAway('married-away-yrsa-frostauge-sturmgeborene', 'Clan Sturmgeborene', 'marriage-sverre-yrsa-frostauge', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    cadetFrostzornBranch(),
    unknownHouseBranch('frideborg-frostauge', 'marriage-frideborg-owain-frostauge'),
    marriedAway('married-away-alfrun-frostauge-skald', 'Clan Skald', 'marriage-halfdan-alfrun-frostauge', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald),
    marriedAway('married-away-cynehild-frostauge-wellenschild', 'Clan Wellenschild', 'marriage-othrik-cynehild-frostauge', 'house-wellenschild', 'haus-wellenschild', HOUSE_EMBLEMS.wellenschild),
    marriedAway('married-away-ormhild-frostauge-varulv', 'Clan Varulv', 'marriage-gunnleik-ormhild-frostauge', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-ragnhild-frostauge-skaife', 'Clan Skaife', 'marriage-askeladd-ragnhild-frostauge', 'house-skaife', 'haus-skaife', HOUSE_EMBLEMS.skaife),
    marriedAway('married-away-ragnfrid-frostauge-diud', 'Clan Diud', 'marriage-finnbar-ragnfrid-frostauge', 'house-diud', 'haus-diud'),
    marriedAway('married-away-yrgitte-frostauge-riesentod', 'Clan Riesentod', 'marriage-tormund-yrgitte-frostauge', 'house-riesentod', 'haus-riesentod', HOUSE_EMBLEMS.riesentod),
    marriedAway('married-away-egberta-frostauge-schwarzdorn', 'Clan Schwarzdorn', 'marriage-tjudmund-egberta-frostauge', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-freydis-frostauge-vaeren', 'Clan Vaeren', 'marriage-sigurd-freydis-frostauge', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-johild-frostauge-sturmgeborene', 'Clan Sturmgeborene', 'marriage-runar-johild-frostauge', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-thorfinn-yrsa-frostauge',
    parentPersonId: '',
    childIds: ['hrolfr-frostauge', 'lathgertha-frostauge', 'vilhjalm-frostauge'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1572',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Frostaugen-Wappen; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-thorfinn-yrsa-frostauge',
    houseId: FROSTAUGE_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Heldenwacht · Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'thorfinn-frostauge',
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
    sourceRevision: 1,
    sourceModule: 'Der Frostauge Clan (Nutzerquelle)',
    sourceNote: 'Der vollständige Frostaugen-Stammbaum wurde ohne Personenfokus übernommen. Thorfinn Frostauge und Yrsa Vaeren bilden das Gründerpaar; nach dem Hauswappen folgt genau ein serieller Überlieferungssprung zur Generation Hrolfrs, Lathgerthas und Vilhjalms. Hrolfrs Sohn Benjen wird nach Hrolfr Hesir. Nach Benjens Gefangennahme führt Leifric aus Vilhjalms Linie den Hauptstamm fort. Vorn ist ausdrücklich Benjens zweiter Sohn; er und Pidra besitzen allein die geradlinige Kadettenhaus-Verknüpfung zum abtrünnigen Clan Frostzorn. Der Frostzorn-Zweig wird in einer eigenen Akte fortgeführt und läuft niemals in den Frostaugen-Hauptstamm zurück. Alle belegten wegverheirateten Frostaugen-Frauen erhalten direkte Zielhausknoten. Die fünf namenlosen Verlobungsplatzhalter der jüngsten Generation wurden nicht übernommen. Jörds Geburtsjahr 1596 widerspricht ihrem 1691 geborenen Mann und den 1714/1719 geborenen Kindern; der offensichtliche Jahrhundertfehler wird als 1696 aufgelöst.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-frostauge-gruender', 'haus-frostauge-gruenderin'],
      partnerships: ['marriage-haus-frostauge-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.frostauge.folderPath
});
