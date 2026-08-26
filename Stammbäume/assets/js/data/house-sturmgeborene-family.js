import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_STURMGEBORENE_PORTRAITS } from './house-sturmgeborene-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KRAEHENMOOR_HOUSE_EMBLEMS } from './kraehenmoor-house-profiles.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const STURMGEBORENE_HOUSE_ID = 'house-sturmgeborene';
const SOURCE_GAP_ID = 'gap-asgeir-kara-to-runar-generation';

const HOUSE_EMBLEMS = Object.freeze({
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  vaeren: KRONENTAL_HOUSE_EMBLEMS.vaeren,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  spindelschlag: KRONENTAL_HOUSE_EMBLEMS.spindelschlag,
  holmr: KRONENTAL_HOUSE_EMBLEMS.holmr,
  grimr: KRONENTAL_HOUSE_EMBLEMS.grimr,
  skaife: KRONENTAL_HOUSE_EMBLEMS.skaife,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  varulv: RORIKSHEIM_HOUSE_EMBLEMS.varulv,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  varangr: KRAEHENMOOR_HOUSE_EMBLEMS.varangr,
  vragi: KRAEHENMOOR_HOUSE_EMBLEMS.vragi,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  grendel: IVARSHEIM_HOUSE_EMBLEMS.grendel,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod
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
  'asgeir-sturmgeborener',
  'runar-1562-sturmgeborener',
  'thorkel-sturmgeborener',
  'sverre-sturmgeborener',
  'floki-sturmgeborener',
  'torger-sturmgeborene',
  'thorbrand-sturmgeborener',
  'arnthor-sturmgeborener'
]);

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? STURMGEBORENE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_STURMGEBORENE_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    familyRole: options.familyRole || (houseId === STURMGEBORENE_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || (HEAD_IDS.has(id) ? 'head' : 'branch'),
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
  'marriage-asgeir-kara-sturmgeborene': ['asgeir-sturmgeborener', 'kara-sturmgeborene-founder'],
  'marriage-runar-yrgitte-sturmgeborene': ['runar-1562-sturmgeborener', 'yrgitte-holmr'],
  'marriage-norlind-solvig-sturmgeborene': ['norlind-sturmgeborener', 'solvig-eisenbieger'],
  'marriage-ulfar-ingibjorg-sturmgeborene': ['ulfar-sturmgeborener', 'ingibjorg-sturmgeborene-spouse'],
  'marriage-thorkel-elfrid-sturmgeborener': ['thorkel-sturmgeborener', 'elfrid-wellensaenger'],
  'marriage-balgruuf-eola-vaeren': ['balgruuf-younger-vaeren', 'eola-sturmgeborene'],
  'marriage-sverre-yrsa-sturmgeborene': ['sverre-sturmgeborener', 'yrsa-frostauge'],
  'marriage-brynjolf-ragnhild-freiwinter': ['brynjolf-freiwinter', 'ragnhild-sturmgeborene'],
  'marriage-sigurd-thialda-sturmgeborene': ['sigurd-sturmgeborener', 'thialda-riesentod'],
  'marriage-gunnar-tjodis-sturmgeborene': ['gunnar-sturmgeborener', 'tjodis-sturmgeborene-spouse'],
  'marriage-jorunn-llewarc-gwialen': ['jorunn-sturmgeborene', 'llewarc-gwialen'],
  'marriage-floki-gunnlaug-kummerherz': ['floki-sturmgeborener', 'gunnlaug-kummerherz'],
  'marriage-birger-vallborg-blutstahl': ['birger-blutstahl', 'vallborg-sturmgeborene'],
  'marriage-ranveig-snorri-sturmgeborene': ['ranveig-sturmgeborene', 'snorri-frostauge'],
  'marriage-hafgrim-yggrid-sturmgeborene': ['hafgrim-sturmgeborener', 'yggrid-helgr'],
  'marriage-kormak-magdis-sturmgeborene': ['kormak-sturmgeborener', 'magdis-wellenschild'],
  'marriage-rannveig-torger-varulv': ['torger-sturmgeborene', 'rannveig-varulv'],
  'marriage-rag-lydia-vaeren': ['rag-vaeren', 'lydia-sturmgeborene'],
  'marriage-thorbrand-astrid-grendel': ['thorbrand-sturmgeborener', 'astrid-grendel'],
  'marriage-hallveig-raloff-sturmgeborene': ['hallveig-sturmgeborene', 'raloff-skaife'],
  'marriage-erlend-svana-sturmgeborene': ['erlend-sturmgeborener', 'svana-riesentod'],
  'marriage-ingeborg-hadvar-sturmgeborene': ['ingeborg-sturmgeborene', 'hadvar-varangr'],
  'marriage-arnthor-elinborg-sturmgeborene': ['arnthor-sturmgeborener', 'elinborg-sturmgeborene'],
  'marriage-idmar-drifa-vragi': ['idmar-sturmgeborener', 'drifa-vragi'],
  'marriage-bergthor-bjork-sturmgeborene': ['bergthor-sturmgeborener', 'bjork-sturmgeborene-spouse'],
  'marriage-runar-johild-sturmgeborene': ['runar-1694-sturmgeborener', 'johild-frostauge'],
  'marriage-torvard-vilborg-schwarzdorn': ['torvard-schwarzdorn', 'vilborg-sturmgeborene'],
  'marriage-nottulf-casthild-kummerherz': ['nottulf-kummerherz', 'casthild-sturmgeborene'],
  'marriage-uvard-norelle-sturmgeborene': ['uvard-sturmgeborener', 'norelle-spindelschlag'],
  'marriage-njord-muna-sturmgeborene': ['njord-sturmgeborener', 'muna-grimr'],
  'marriage-grimnir-aoife-sturmgeborene': ['grimnir-sturmgeborener', 'aoife-grannd'],
  'marriage-dagfrid-gardar-sturmgeborene': ['dagfrid-sturmgeborene', 'gardar-frostauge']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function withLayout(record, extensionName, extensionValue) {
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

function alignChildrenBelowPair(partnershipId, options = {}) {
  return withLayout(partnership(partnershipId, options), 'chartAlignChildGroupBelowParentPair', true);
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayout(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function directlyAbovePrimaryChildWithPackedSiblingBranches(
  partnershipId,
  childPersonId,
  options = {}
) {
  return withLayout(
    directlyAboveOnlyChild(partnershipId, childPersonId, options),
    'chartPackSiblingBranchesBesideAlignedChild',
    true
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'sturmgeborene-parentage',
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

export const HOUSE_STURMGEBORENE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-sturmgeborene',
    title: 'Clan Sturmgeborene',
    motto: '',
    description: 'Hesirenclan von Heldenwacht im Königlichen Jarltum Kronental. Die vollständig überlieferte Linie reicht von Asgeir und Kára bis in die Generation des Jahres 1740.',
    emblem: HOUSE_EMBLEMS.sturmgeborene,
    houseProfile: KRONENTAL_HOUSE_PROFILES.sturmgeborene
  },
  houses: [
    house(STURMGEBORENE_HOUSE_ID, 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-eisenbieger', 'Clan Eisenbieger', KRONENTAL_HOUSE_EMBLEMS.eisenbieger),
    house('house-holmr', 'Clan Holmr', HOUSE_EMBLEMS.holmr),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-gwialen', 'Haus Gwialen O’Tredegar', HOUSE_EMBLEMS.gwialen),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-grendel', 'Clan Grendel', HOUSE_EMBLEMS.grendel),
    house('house-skaife', 'Clan Skaife', HOUSE_EMBLEMS.skaife),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-vragi', 'Clan Vragi', HOUSE_EMBLEMS.vragi),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-spindelschlag', 'Clan Spindelschlag', HOUSE_EMBLEMS.spindelschlag),
    house('house-grimr', 'Clan Grimr', HOUSE_EMBLEMS.grimr)
  ],
  persons: [
    person('asgeir-sturmgeborener', 'Asgeir Sturmgeborener', 'male', '????', '????', {
      title: 'Gründer des Clans Sturmgeborene',
      tags: ['Gründer']
    }),
    spouse('kara-sturmgeborene-founder', 'Kára', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Sturmgeborene',
      tags: ['Gründerin']
    }),

    person('runar-1562-sturmgeborener', 'Runar Sturmgeborener', 'male', '1562', '1623', { title: 'Oberhaupt des Clans Sturmgeborene' }),
    awayWoman('norlind-sturmgeborener', 'Norlind Sturmgeborene', '1570', '1636', 'Clan Eisenbieger', {
      notes: 'Das unmögliche Quellenjahr 1670–1636 wurde anhand der Generationenfolge und der Eisenbieger-Gegenakte zu 1570–1636 berichtigt.'
    }),
    person('ulfar-sturmgeborener', 'Ulfar Sturmgeborener', 'male', '1577', '1627'),
    spouse('yrgitte-holmr', 'Yrgitte Holmr', 'female', '1565', '1734', 'house-holmr'),
    spouse('solvig-eisenbieger', 'Solvig Eisenbieger', 'male', '1567', '1627', 'house-eisenbieger'),
    spouse('ingibjorg-sturmgeborene-spouse', 'Ingibjorg', 'female', '1578', '1625'),

    person('thorkel-sturmgeborener', 'Thorkel Sturmgeborener', 'male', '1580', '1625', { title: 'Oberhaupt des Clans Sturmgeborene' }),
    awayWoman('eola-sturmgeborene', 'Eola Sturmgeborene', '1583', '1608', 'Clan Vaeren'),
    person('sverre-sturmgeborener', 'Sverre Sturmgeborener', 'male', '1592', '1671', { title: 'Oberhaupt des Clans Sturmgeborene' }),
    awayWoman('ragnhild-sturmgeborene', 'Ragnhild Sturmgeborene', '1596', '1658', 'Clan Freiwinter'),
    person('sigurd-sturmgeborener', 'Sigurd Sturmgeborener', 'male', '1604', '1632'),
    spouse('elfrid-wellensaenger', 'Elfrid Wellensänger', 'female', '1580', '1635', 'house-wellensaenger'),
    spouse('balgruuf-younger-vaeren', 'Balgruuf der Jüngere Vaeren', 'male', '1585', '1627', 'house-vaeren'),
    spouse('yrsa-frostauge', 'Yrsa Frostauge', 'female', '1601', '1677', 'house-frostauge'),
    spouse('brynjolf-freiwinter', 'Brynjolf Freiwinter', 'male', '1594', '1665', 'house-freiwinter'),
    spouse('thialda-riesentod', 'Thialda Riesentod', 'female', '1602', '1671', 'house-riesentod'),

    person('gunnar-sturmgeborener', 'Gunnar Sturmgeborener', 'male', '1605', '1628'),
    awayWoman('jorunn-sturmgeborene', 'Jorunn Sturmgeborene', '1613', '1700', 'Haus Gwialen O’Tredegar'),
    person('floki-sturmgeborener', 'Floki Sturmgeborener', 'male', '1618', '1677', { title: 'Oberhaupt des Clans Sturmgeborene' }),
    awayWoman('vallborg-sturmgeborene', 'Vallborg Sturmgeborene', '1620', '1659', 'Clan Blutstahl'),
    awayWoman('ranveig-sturmgeborene', 'Ranveig Sturmgeborene', '1632', '1675', 'Clan Frostauge'),
    person('hafgrim-sturmgeborener', 'Hafgrim Sturmgeborener', 'male', '1627', '1694'),
    spouse('tjodis-sturmgeborene-spouse', 'Tjodis', 'female', '????', '????'),
    spouse('llewarc-gwialen', 'Llewarc Gwialen O’Tredegar', 'male', '1611', '1681', 'house-gwialen', {
      notes: 'Die Herkunftsakte Gwialen bestätigt 1611–1681; das Quellenjahr 1611–1618 ist ein Übertragungsfehler.'
    }),
    spouse('gunnlaug-kummerherz', 'Gunnlaug Kummerherz', 'female', '1619', '1704', 'house-kummerherz'),
    spouse('birger-blutstahl', 'Birger Blutstahl', 'male', '1620', '1671', 'house-blutstahl'),
    spouse('snorri-frostauge', 'Snorri Frostauge', 'male', '1637', '1715', 'house-frostauge'),
    spouse('yggrid-helgr', 'Yggrid Helgr', 'female', '1633', '1712', 'house-helgr'),

    person('kormak-sturmgeborener', 'Kormak Sturmgeborener', 'male', '1625', '1658'),
    person('torger-sturmgeborene', 'Torger Sturmgeborener', 'male', '1647', '1693', { title: 'Oberhaupt des Clans Sturmgeborene' }),
    awayWoman('lydia-sturmgeborene', 'Lydia Sturmgeborene', '1658', '1733', 'Clan Vaeren'),
    person('thorbrand-sturmgeborener', 'Thorbrand Sturmgeborener', 'male', '1650', '1720', { title: 'Oberhaupt des Clans Sturmgeborene' }),
    awayWoman('hallveig-sturmgeborene', 'Hallveig Sturmgeborene', '1652', '1680', 'Clan Skaife'),
    person('erlend-sturmgeborener', 'Erlend Sturmgeborener', 'male', '1654', '1738', {
      notes: 'Das Todesjahr folgt der Sturmgeborenen-Quelle und berichtigt die abweichende Riesentod-Gegenakte.'
    }),
    spouse('magdis-wellenschild', 'Magdis Wellenschild', 'female', '1625', '1704', 'house-wellenschild'),
    spouse('rannveig-varulv', 'Rannveig Varulv', 'female', '1650', '1696', 'house-varulv'),
    spouse('rag-vaeren', 'Rag Vaeren', 'male', '1657', '1727', 'house-vaeren'),
    spouse('astrid-grendel', 'Astrid Grendel', 'female', '1653', '1704', 'house-grendel'),
    spouse('raloff-skaife', 'Raloff Skaife', 'male', '1648', '1680', 'house-skaife'),
    spouse('svana-riesentod', 'Svana Riesentod', 'female', '1654', '1725', 'house-riesentod'),

    awayWoman('ingeborg-sturmgeborene', 'Ingeborg Sturmgeborene', '1649', '', 'Clan Varangr'),
    person('jornborg-sturmgeborene', 'Jornborg Sturmgeborene', 'female', '1657', ''),
    awayWoman('elinborg-sturmgeborene', 'Elinborg Sturmgeborene', '1665', '1704', 'Clan Sturmgeborene', {
      title: 'Wegverheiratet innerhalb des Clans Sturmgeborene',
      notes: 'Interne Ehe mit Arnthor Sturmgeborener; dieselbe Karte wird am fortgeführten Arnthor-Zweig kontrolliert wiederholt. Die Kinder werden nur dort geführt.',
      extensions: {
        chartRepeatForPartnershipIds: ['marriage-arnthor-elinborg-sturmgeborene'],
        registryManagedExtensionFields: ['chartRepeatForPartnershipIds']
      }
    }),
    person('arnthor-sturmgeborener', 'Arnthor Sturmgeborener', 'male', '1669', '', {
      title: 'Oberhaupt des Clans Sturmgeborene seit 1720',
      extensions: {
        chartPartnerMirrorForPartnershipIds: ['marriage-arnthor-elinborg-sturmgeborene'],
        registryManagedExtensionFields: ['chartPartnerMirrorForPartnershipIds']
      }
    }),
    person('arnkatla-sturmgeborene', 'Arnkatla Sturmgeborene', 'female', '1676', ''),
    person('idmar-sturmgeborener', 'Idmar Sturmgeborener', 'male', '1673', ''),
    person('bergthor-sturmgeborener', 'Bergthor Sturmgeborener', 'male', '1676', ''),
    spouse('hadvar-varangr', 'Hadvar Varangr', 'male', '1642', '', 'house-varangr'),
    spouse('drifa-vragi', 'Drifa Vragi', 'female', '1677', '', 'house-vragi'),
    spouse('bjork-sturmgeborene-spouse', 'Björk', 'female', '1679', ''),

    person('runar-1694-sturmgeborener', 'Runar Sturmgeborener', 'male', '1694', ''),
    awayWoman('vilborg-sturmgeborene', 'Vilborg Sturmgeborene', '1702', '', 'Clan Schwarzdorn'),
    awayWoman('casthild-sturmgeborene', 'Casthild Sturmgeborene', '1705', '', 'Clan Kummerherz'),
    person('uvard-sturmgeborener', 'Uvard Sturmgeborener', 'male', '1698', ''),
    person('canrik-sturmgeborener', 'Canrik Sturmgeborener', 'male', '1697', ''),
    person('njord-sturmgeborener', 'Njord Sturmgeborener', 'male', '1701', ''),
    person('grimnir-sturmgeborener', 'Grimnir Sturmgeborener', 'male', '1703', ''),
    awayWoman('dagfrid-sturmgeborene', 'Dagfrid Sturmgeborene', '1700', '', 'Clan Frostauge'),
    spouse('johild-frostauge', 'Johild Frostauge', 'female', '1698', '', 'house-frostauge'),
    spouse('torvard-schwarzdorn', 'Torvard Schwarzdorn', 'male', '1700', '', 'house-schwarzdorn'),
    spouse('nottulf-kummerherz', 'Nottulf Kummerherz', 'male', '1702', '', 'house-kummerherz'),
    spouse('norelle-spindelschlag', 'Norelle Spindelschlag', 'female', '1701', '', 'house-spindelschlag'),
    spouse('muna-grimr', 'Muna Grimr', 'female', '1700', '', 'house-grimr'),
    spouse('aoife-grannd', 'Aoife Grannd', 'female', '1704', ''),
    spouse('gardar-frostauge', 'Gardar Frostauge', 'male', '1696', '', 'house-frostauge'),

    person('tyr-sturmgeborener', 'Tyr Sturmgeborener', 'male', '1719', ''),
    person('rjotr-sturmgeborener', 'Rjotr Sturmgeborener', 'male', '1728', ''),
    spouse('isdis-grendel', 'Ísdis Grendel', 'female', '1731', '', 'house-grendel', {
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Runars',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Ísdis ist Runars aufgenommenes Mündel und kein leibliches Kind der Sturmgeborenen.'
    }),
    person('ottar-sturmgeborener', 'Ottar Sturmgeborener', 'male', '1723', ''),
    person('greta-sturmgeborene', 'Greta Sturmgeborene', 'female', '1727', ''),
    person('illug-sturmgeborener', 'Illug Sturmgeborener', 'male', '1722', ''),
    person('hekla-sturmgeborene', 'Hekla Sturmgeborene', 'female', '1725', ''),
    person('dofri-sturmgeborener', 'Dofri Sturmgeborener', 'male', '1723', ''),
    person('katla-sturmgeborene', 'Katla Sturmgeborene', 'female', '1727', '')
  ],
  partnerships: [
    partnership('marriage-asgeir-kara-sturmgeborene'),
    directlyAbovePrimaryChildWithPackedSiblingBranches(
      'marriage-runar-yrgitte-sturmgeborene',
      'sverre-sturmgeborener',
      { status: 'ended', end: '1623' }
    ),
    partnership('marriage-norlind-solvig-sturmgeborene', { status: 'ended', end: '1627' }),
    alignChildrenBelowPair('marriage-ulfar-ingibjorg-sturmgeborene', { status: 'ended', end: '1625' }),
    alignChildrenBelowPair('marriage-thorkel-elfrid-sturmgeborener', { status: 'ended', end: '1625' }),
    partnership('marriage-balgruuf-eola-vaeren', { status: 'ended', end: '1608' }),
    directlyAboveOnlyChild('marriage-sverre-yrsa-sturmgeborene', 'floki-sturmgeborener', { status: 'ended', end: '1671' }),
    partnership('marriage-brynjolf-ragnhild-freiwinter', { status: 'ended', end: '1658' }),
    alignChildrenBelowPair('marriage-sigurd-thialda-sturmgeborene', { status: 'ended', end: '1632' }),
    directlyAboveOnlyChild('marriage-gunnar-tjodis-sturmgeborene', 'kormak-sturmgeborener', { status: 'ended', end: '1628' }),
    partnership('marriage-jorunn-llewarc-gwialen', { status: 'ended', end: '1681' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches(
      'marriage-floki-gunnlaug-kummerherz',
      'torger-sturmgeborene',
      { status: 'ended', end: '1677' }
    ),
    partnership('marriage-birger-vallborg-blutstahl', { status: 'ended', end: '1659' }),
    partnership('marriage-ranveig-snorri-sturmgeborene', { status: 'ended', end: '1675' }),
    alignChildrenBelowPair('marriage-hafgrim-yggrid-sturmgeborene', { status: 'ended', end: '1694' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches(
      'marriage-kormak-magdis-sturmgeborene',
      'elinborg-sturmgeborene',
      { status: 'ended', end: '1658' }
    ),
    directlyAbovePrimaryChildWithPackedSiblingBranches(
      'marriage-rannveig-torger-varulv',
      'arnthor-sturmgeborener',
      { status: 'ended', end: '1693' }
    ),
    partnership('marriage-rag-lydia-vaeren', { status: 'ended', end: '1727' }),
    directlyAboveOnlyChild('marriage-thorbrand-astrid-grendel', 'idmar-sturmgeborener', { status: 'ended', end: '1704' }),
    partnership('marriage-hallveig-raloff-sturmgeborene', { status: 'ended', end: '1680' }),
    directlyAboveOnlyChild('marriage-erlend-svana-sturmgeborene', 'bergthor-sturmgeborener', { status: 'ended', end: '1725' }),
    partnership('marriage-ingeborg-hadvar-sturmgeborene'),
    directlyAbovePrimaryChildWithPackedSiblingBranches(
      'marriage-arnthor-elinborg-sturmgeborene',
      'runar-1694-sturmgeborener',
      { status: 'ended', end: '1704' }
    ),
    alignChildrenBelowPair('marriage-idmar-drifa-vragi'),
    alignChildrenBelowPair('marriage-bergthor-bjork-sturmgeborene'),
    alignChildrenBelowPair('marriage-runar-johild-sturmgeborene'),
    partnership('marriage-torvard-vilborg-schwarzdorn'),
    partnership('marriage-nottulf-casthild-kummerherz'),
    alignChildrenBelowPair('marriage-uvard-norelle-sturmgeborene'),
    alignChildrenBelowPair('marriage-njord-muna-sturmgeborene'),
    alignChildrenBelowPair('marriage-grimnir-aoife-sturmgeborene'),
    partnership('marriage-dagfrid-gardar-sturmgeborene')
  ],
  parentages: [
    ...childrenOf(['runar-1562-sturmgeborener', 'norlind-sturmgeborener', 'ulfar-sturmgeborener'], 'marriage-asgeir-kara-sturmgeborene', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['thorkel-sturmgeborener', 'eola-sturmgeborene', 'sverre-sturmgeborener'], 'marriage-runar-yrgitte-sturmgeborene'),
    ...childrenOf(['ragnhild-sturmgeborene', 'sigurd-sturmgeborener'], 'marriage-ulfar-ingibjorg-sturmgeborene'),
    ...childrenOf(['gunnar-sturmgeborener', 'jorunn-sturmgeborene'], 'marriage-thorkel-elfrid-sturmgeborener'),
    ...childrenOf(['floki-sturmgeborener', 'vallborg-sturmgeborene'], 'marriage-sverre-yrsa-sturmgeborene'),
    ...childrenOf(['ranveig-sturmgeborene', 'hafgrim-sturmgeborener'], 'marriage-sigurd-thialda-sturmgeborene'),
    ...childrenOf(['kormak-sturmgeborener'], 'marriage-gunnar-tjodis-sturmgeborene'),
    ...childrenOf(['torger-sturmgeborene', 'lydia-sturmgeborene', 'thorbrand-sturmgeborener'], 'marriage-floki-gunnlaug-kummerherz'),
    ...childrenOf(['hallveig-sturmgeborene', 'erlend-sturmgeborener'], 'marriage-hafgrim-yggrid-sturmgeborene'),
    ...childrenOf(['ingeborg-sturmgeborene', 'jornborg-sturmgeborene', 'elinborg-sturmgeborene'], 'marriage-kormak-magdis-sturmgeborene'),
    ...childrenOf(['arnthor-sturmgeborener', 'arnkatla-sturmgeborene'], 'marriage-rannveig-torger-varulv'),
    ...childrenOf(['idmar-sturmgeborener'], 'marriage-thorbrand-astrid-grendel'),
    ...childrenOf(['bergthor-sturmgeborener'], 'marriage-erlend-svana-sturmgeborene'),
    ...childrenOf(['runar-1694-sturmgeborener', 'vilborg-sturmgeborene', 'casthild-sturmgeborene', 'uvard-sturmgeborener'], 'marriage-arnthor-elinborg-sturmgeborene'),
    ...childrenOf(['canrik-sturmgeborener', 'njord-sturmgeborener'], 'marriage-idmar-drifa-vragi'),
    ...childrenOf(['grimnir-sturmgeborener', 'dagfrid-sturmgeborene'], 'marriage-bergthor-bjork-sturmgeborene'),
    ...childrenOf(['tyr-sturmgeborener', 'rjotr-sturmgeborener'], 'marriage-runar-johild-sturmgeborene'),
    ...createParentages(['isdis-grendel'], ['runar-1694-sturmgeborener'], '', {
      idPrefix: 'sturmgeborene-parentage-foster',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Ísdis Grendel ist Runars aufgenommenes Mündel; die Verbindung ist ausschließlich eine Vormundschaft.'
    }),
    ...childrenOf(['ottar-sturmgeborener', 'greta-sturmgeborene'], 'marriage-uvard-norelle-sturmgeborene'),
    ...childrenOf(['illug-sturmgeborener', 'hekla-sturmgeborene'], 'marriage-njord-muna-sturmgeborene'),
    ...childrenOf(['dofri-sturmgeborener', 'katla-sturmgeborene'], 'marriage-grimnir-aoife-sturmgeborene')
  ],
  cadetBranches: [
    marriedAway('married-away-norlind-sturmgeborene-eisenbieger', 'Clan Eisenbieger', 'marriage-norlind-solvig-sturmgeborene', 'house-eisenbieger', 'haus-eisenbieger', KRONENTAL_HOUSE_EMBLEMS.eisenbieger),
    marriedAway('married-away-eola-sturmgeborene-vaeren', 'Clan Vaeren', 'marriage-balgruuf-eola-vaeren', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-ragnhild-sturmgeborene-freiwinter', 'Clan Freiwinter', 'marriage-brynjolf-ragnhild-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-jorunn-sturmgeborene-gwialen', 'Haus Gwialen O’Tredegar', 'marriage-jorunn-llewarc-gwialen', 'house-gwialen', 'haus-gwialen', HOUSE_EMBLEMS.gwialen),
    marriedAway('married-away-vallborg-sturmgeborene-blutstahl', 'Clan Blutstahl', 'marriage-birger-vallborg-blutstahl', 'house-blutstahl', 'haus-blutstahl', HOUSE_EMBLEMS.blutstahl),
    marriedAway('married-away-ranveig-sturmgeborene-frostauge', 'Clan Frostauge', 'marriage-ranveig-snorri-sturmgeborene', 'house-frostauge', 'haus-frostauge', HOUSE_EMBLEMS.frostauge),
    marriedAway('married-away-lydia-sturmgeborene-vaeren', 'Clan Vaeren', 'marriage-rag-lydia-vaeren', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-hallveig-sturmgeborene-skaife', 'Clan Skaife', 'marriage-hallveig-raloff-sturmgeborene', 'house-skaife', 'haus-skaife', HOUSE_EMBLEMS.skaife),
    marriedAway('married-away-ingeborg-sturmgeborene-varangr', 'Clan Varangr', 'marriage-ingeborg-hadvar-sturmgeborene', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway(
      'married-away-elinborg-sturmgeborene-internal',
      'Arnthor Sturmgeborener',
      'marriage-arnthor-elinborg-sturmgeborene',
      STURMGEBORENE_HOUSE_ID,
      'haus-sturmgeborene',
      HOUSE_EMBLEMS.sturmgeborene,
      'Wegverheiratet an Arnthor Sturmgeborener'
    ),
    marriedAway('married-away-vilborg-sturmgeborene-schwarzdorn', 'Clan Schwarzdorn', 'marriage-torvard-vilborg-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-casthild-sturmgeborene-kummerherz', 'Clan Kummerherz', 'marriage-nottulf-casthild-kummerherz', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-dagfrid-sturmgeborene-frostauge', 'Clan Frostauge', 'marriage-dagfrid-gardar-sturmgeborene', 'house-frostauge', 'haus-frostauge', HOUSE_EMBLEMS.frostauge)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-asgeir-kara-sturmgeborene',
    parentPersonId: '',
    childIds: ['runar-1562-sturmgeborener', 'norlind-sturmgeborener', 'ulfar-sturmgeborener'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1562',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Ein einziger absoluter serieller Generationentrenner folgt dem Gründerpaar und dem Sturmgeborenen-Wappen; kein anderer Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-asgeir-kara-sturmgeborene',
    houseId: STURMGEBORENE_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Heldenwacht · Königliches Jarltum Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'asgeir-sturmgeborener',
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
    sourceModule: 'Clan Sturmgeborene (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus. Norlinds unmögliches Quellenjahr 1670–1636 wurde zu 1570–1636 berichtigt. Llewarcs Todesjahr folgt mit 1681 der Gwialen-Gegenakte. Erlends Todesjahr 1738 folgt dieser Primärakte. Die widersprüchliche Kinderüberschrift „Njord & Johild“ wurde anhand der ausdrücklich verzeichneten Ehe als Njord und Muna Grimr aufgelöst. Elinborg wird wegen der internen Ehe kontrolliert doppelt dargestellt; ihre Kinder erscheinen ausschließlich bei Arnthor und der Partnerkopie. Unbenannte Verlobten-Platzhalter der jüngsten Generation wurden nicht importiert. Ísdis Grendel ist ausschließlich als aufgenommenes Mündel verzeichnet.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-sturmgeborene-gruender', 'haus-sturmgeborene-gruenderin'],
      partnerships: ['haus-sturmgeborene-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.sturmgeborene.folderPath
});
