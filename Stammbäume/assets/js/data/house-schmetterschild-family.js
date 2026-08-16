import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const SCHMETTERSCHILD_HOUSE_ID = 'house-schmetterschild';

const HOUSE_EMBLEMS = Object.freeze({
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig
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
  'hurin-schmetterschild',
  'gunvald-schmetterschild',
  'hakon-schmetterschild',
  'sigvard-schmetterschild',
  'hafgrim-schmetterschild',
  'solmund-schmetterschild',
  'skjoldulf-schmetterschild'
]);

const HEIR_IDS = new Set([
  'magnus-schmetterschild',
  'kolgrimm-schmetterschild'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SCHMETTERSCHILD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SCHMETTERSCHILD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SCHMETTERSCHILD_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, sex, birth = '????', death = '', options = {}) {
  return spouse(id, name, sex, birth, death, '', {
    ...options,
    familyRole: 'affair',
    title: options.title || 'Affäre',
    tags: [...(options.tags || []), 'Affäre']
  });
}

function ward(id, name, sex, birth, houseId = '', options = {}) {
  return person(id, name, sex, birth, '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel Magnus Schmetterschilds',
    tags: [...(options.tags || []), 'Aufgenommenes Mündel']
  });
}

function awayMember(id, name, sex, birth, death, targetHouseName, options = {}) {
  return person(id, name, sex, birth, death, {
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
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['hurin-schmetterschild', 'irmgard-schmetterschild'],
  gunvald: ['gunvald-schmetterschild', 'magnhild'],
  svandis: ['yrsvard-helgr', 'svandis-schmetterschild'],
  hakon: ['hakon-schmetterschild', 'ingunn-wargh'],
  halldis: ['lodvar-todbrand', 'halldis-schmetterschild'],
  sigvard: ['sigvard-schmetterschild', 'gyda-graumahne'],
  bergljot: ['vemund-schattenherz', 'bergljot-schmetterschild'],
  sighvat: ['sighvat-schmetterschild', 'isbjorg-feuerherz'],
  hafgrim: ['hafgrim-schmetterschild', 'yrsa-graumahne'],
  signy: ['viglund-graumahne', 'signy-schmetterschild'],
  lodinn: ['lodinn-schmetterschild', 'embla'],
  ottilie: ['rhodri-coedwig', 'ottilie-brakskjold'],
  solmund: ['solmund-schmetterschild', 'gudrun-vragi'],
  tordis: ['thengil-silberblut', 'tordis-schmetterschild'],
  oddleif: ['sigurd-goldglanz', 'oddleif-schmetterschild'],
  thorarin: ['thorarin-schmetterschild', 'dagrun'],
  thorarinAffair: ['thorarin-schmetterschild', 'eldfrid'],
  skjoldulf: ['skjoldulf-schmetterschild', 'alfrun-helgr'],
  ormrun: ['tryggvi-kummerherz', 'ormrun-schmetterschild'],
  thorodd: ['thorodd-schmetterschild', 'freydis-kaltherz'],
  hafvard: ['hafvard-schmetterschild', 'ingibjorg'],
  magnus: ['magnus-schmetterschild', 'hlokk-todbrand'],
  hildrun: ['odvald-ragnulf', 'hildrun-schmetterschild'],
  sigmunda: ['sigmunda-schmetterschild', 'bjorn'],
  glaumur: ['glaumur-schmetterschild', 'jofrid-graumahne'],
  valtyr: ['valtyr-schmetterschild', 'gunnhildr'],
  valtyrSolveig: ['valtyr-schmetterschild', 'solveig'],
  valtyrGunndis: ['valtyr-schmetterschild', 'gunndis']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-hurin-irmgard-schmetterschild': COUPLES.founders,
  'marriage-gunvald-magnhild-schmetterschild': COUPLES.gunvald,
  'marriage-yrsvard-svandis-helgr': COUPLES.svandis,
  'marriage-ingunn-hakon-wargh': COUPLES.hakon,
  'marriage-lodvar-halldis-todbrand': COUPLES.halldis,
  'marriage-gyda-sigvard-graumahne': COUPLES.sigvard,
  'marriage-vemund-bergljot-schmetterschild': COUPLES.bergljot,
  'marriage-sighvat-isbjorg-schmetterschild': COUPLES.sighvat,
  'marriage-yrsa-hafgrim-graumahne': COUPLES.hafgrim,
  'marriage-viglund-signy-graumahne': COUPLES.signy,
  'marriage-lodinn-embla-schmetterschild': COUPLES.lodinn,
  'marriage-rhodri-ottilie-coedwig': COUPLES.ottilie,
  'marriage-solmund-gudrun-schmetterschild': COUPLES.solmund,
  'marriage-thengil-tordis-schmetterschild': COUPLES.tordis,
  'marriage-sigurd-oddleif-schmetterschild': COUPLES.oddleif,
  'marriage-thorarin-dagrun-schmetterschild': COUPLES.thorarin,
  'affair-thorarin-eldfrid-schmetterschild': COUPLES.thorarinAffair,
  'marriage-alfrun-skjoldulf-schmetterschild': COUPLES.skjoldulf,
  'marriage-tryggvi-ormrun-schmetterschild': COUPLES.ormrun,
  'marriage-thorodd-freydis-schmetterschild': COUPLES.thorodd,
  'marriage-hafvard-ingibjorg-schmetterschild': COUPLES.hafvard,
  'marriage-hlokk-magnus-todbrand': COUPLES.magnus,
  'marriage-odvald-hildrun-ragnulf': COUPLES.hildrun,
  'marriage-sigmunda-bjorn-schmetterschild': COUPLES.sigmunda,
  'marriage-jofrid-glaumur-graumahne': COUPLES.glaumur,
  'marriage-valtyr-gunnhildr-schmetterschild': COUPLES.valtyr,
  'affair-valtyr-solveig-schmetterschild': COUPLES.valtyrSolveig,
  'affair-valtyr-gunndis-schmetterschild': COUPLES.valtyrGunndis
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(record, partnerPersonId, options = {}) {
  const managedExtensionFields = ['chartAlignPartnerOverChildrenPersonId'];
  if (options.reserveLeafChildLane) managedExtensionFields.push('chartReserveLeafChildLane');
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      ...(options.reserveLeafChildLane ? { chartReserveLeafChildLane: true } : {}),
      registryManagedExtensionFields: managedExtensionFields
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'schmetterschild-parentage',
    ...options
  });
}

function fosterChildren(childIds, parentPersonId) {
  return createParentages(childIds, [parentPersonId], '', {
    idPrefix: 'schmetterschild-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes: 'Aufgenommenes Mündel; keine leibliche Abstammung vom Clan Schmetterschild.'
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
      registryManagedFields: [
        'name',
        'parentPartnershipId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ]
    }
  });
}

export const HOUSE_SCHMETTERSCHILD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-schmetterschild',
    title: 'Clan Schmetterschild',
    motto: 'Im Feuer geprüft, im Stahl verewigt.',
    description: 'Wohlhabender Hesirenclan von Wolfsklamm, bekannt für Bergbau, meisterhafte Schmiedekunst und schwer gerüstete Elitekrieger.',
    emblem: HOUSE_EMBLEMS.schmetterschild,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.schmetterschild
  },
  houses: [
    house(SCHMETTERSCHILD_HOUSE_ID, 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-wargh', 'Clan Wargh'),
    house('house-todbrand', 'Clan Todbrand', HOUSE_EMBLEMS.todbrand),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-feuerherz', 'Clan Feuerherz'),
    house('house-coedwig', "Haus Coedwig O'Llanfyn", HOUSE_EMBLEMS.coedwig),
    house('house-vragi', 'Clan Vragi'),
    house('house-silberblut', 'Clan Silberblut'),
    house('house-goldglanz', 'Clan Goldglanz'),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf)
  ],
  persons: [
    person('hurin-schmetterschild', 'Hurin Schmetterschild', 'male', '????', '????', {
      title: 'Gründer und erster Hesir des Clans Schmetterschild'
    }),
    spouse('irmgard-schmetterschild', 'Irmgard', 'female', '????', '????'),

    person('gunvald-schmetterschild', 'Gunvald Schmetterschild', 'male', '1550', '1589', {
      title: 'Oberhaupt des Clans Schmetterschild'
    }),
    awayMember('svandis-schmetterschild', 'Svandis Schmetterschild', 'female', '1560', '1607', 'Clan Helgr'),
    spouse('magnhild', 'Magnhild', 'female', '1553', '1600'),
    spouse('yrsvard-helgr', 'Yrsvard Helgr', 'male', '1560', '1630', 'house-helgr'),

    person('hakon-schmetterschild', 'Hakon Schmetterschild', 'male', '1572', '1609', {
      title: 'Oberhaupt des Clans Schmetterschild'
    }),
    awayMember('halldis-schmetterschild', 'Halldis Schmetterschild', 'female', '1573', '1655', 'Clan Todbrand'),
    spouse('ingunn-wargh', 'Ingunn Wargh', 'female', '1573', '1625', 'house-wargh'),
    spouse('lodvar-todbrand', 'Lodvar Todbrand', 'male', '1571', '1622', 'house-todbrand', {
      notes: 'Der Todbrand-Ursprungsbaum führt 1622 als Todesjahr; dieser kanonische Gegenaktenwert hat Vorrang vor der Angabe 1624 in der Schmetterschild-Quelle.'
    }),

    person('sigvard-schmetterschild', 'Sigvard Schmetterschild', 'male', '1594', '1670', {
      title: 'Oberhaupt des Clans Schmetterschild'
    }),
    awayMember('bergljot-schmetterschild', 'Bergljot Schmetterschild', 'female', '1597', '1655', 'Clan Schattenherz'),
    person('sighvat-schmetterschild', 'Sighvat Schmetterschild', 'male', '1600', '1683'),
    spouse('gyda-graumahne', 'Gyda Graumähne', 'female', '1596', '1677', 'house-graumahne'),
    spouse('vemund-schattenherz', 'Vemund Schattenherz', 'male', '1593', '1632', 'house-schattenherz'),
    spouse('isbjorg-feuerherz', 'Isbjörg Feuerherz', 'female', '1606', '1700', 'house-feuerherz'),

    person('hafgrim-schmetterschild', 'Hafgrim Schmetterschild', 'male', '1625', '1700', {
      title: 'Oberhaupt des Clans Schmetterschild'
    }),
    awayMember('signy-schmetterschild', 'Signy Schmetterschild', 'female', '1628', '1704', 'Clan Graumähne'),
    person('lodinn-schmetterschild', 'Lodinn Schmetterschild', 'male', '1630', '1685'),
    awayMember('ottilie-brakskjold', 'Ottilie Schmetterschild', 'female', '1636', '1703', "Haus Coedwig O'Llanfyn", {
      notes: 'Die Schmetterschild-Quelle identifiziert die in der Coedwig-Gegenakte bislang als Brakskjold geführte Ottilie eindeutig als Schmetterschild.'
    }),
    spouse('yrsa-graumahne', 'Yrsa Graumähne', 'female', '1630', '1705', 'house-graumahne'),
    spouse('viglund-graumahne', 'Viglund Graumähne', 'male', '1627', '1701', 'house-graumahne'),
    spouse('embla', 'Embla', 'female', '1633', '1677'),
    spouse('rhodri-coedwig', 'Rhodri Coedwig', 'male', '1636', '1710', 'house-coedwig'),

    person('solmund-schmetterschild', 'Solmund Schmetterschild', 'male', '1649', '1725', {
      title: 'Oberhaupt des Clans Schmetterschild'
    }),
    awayMember('tordis-schmetterschild', 'Tordis Schmetterschild', 'female', '1655', '1712', 'Clan Silberblut'),
    awayMember('oddleif-schmetterschild', 'Oddleif Schmetterschild', 'female', '1652', '1714', 'Clan Goldglanz'),
    person('thorarin-schmetterschild', 'Thorarin Schmetterschild', 'male', '1654', '1720'),
    spouse('gudrun-vragi', 'Gudrun Vragi', 'female', '1651', '1735', 'house-vragi'),
    spouse('thengil-silberblut', 'Thengil Silberblut', 'male', '1652', '1698', 'house-silberblut'),
    spouse('sigurd-goldglanz', 'Sigurd Goldglanz', 'male', '1650', '1731', 'house-goldglanz'),
    spouse('dagrun', 'Dagrún', 'female', '1654', '1700'),
    affair('eldfrid', 'Eldfrid', 'female', '1667', '1729', {
      title: 'Affäre Thorarins · Mutter Ingolfs'
    }),

    person('skjoldulf-schmetterschild', 'Skjoldulf Schmetterschild', 'male', '1669', '', {
      title: 'Oberhaupt des Clans Schmetterschild'
    }),
    awayMember('ormrun-schmetterschild', 'Ormrún Schmetterschild', 'female', '1674', '', 'Clan Kummerherz'),
    person('thorodd-schmetterschild', 'Thorodd Schmetterschild', 'male', '1677', ''),
    person('hafvard-schmetterschild', 'Hafvard Schmetterschild', 'male', '1675', '1720'),
    person('ingolf-schmetterschild', 'Ingolf Schmetterschild', 'male', '1684', '', {
      familyRole: 'bastard',
      title: 'Bastardsohn Thorarins und Eldfrids',
      tags: ['Bastard']
    }),
    spouse('alfrun-helgr', 'Alfrún Helgr', 'female', '1676', '', 'house-helgr', {
      notes: 'Der Helgr-Ursprungsbaum führt 1676 als Geburtsjahr; dieser kanonische Gegenaktenwert hat Vorrang vor der Angabe 1672 in der Schmetterschild-Quelle.'
    }),
    spouse('tryggvi-kummerherz', 'Tryggvi Kummerherz', 'male', '1673', '', 'house-kummerherz'),
    spouse('freydis-kaltherz', 'Freydis Kaltherz', 'female', '1680', '1732', 'house-kaltherz'),
    spouse('ingibjorg', 'Ingibjörg', 'female', '1675', '1740'),

    person('magnus-schmetterschild', 'Magnus Schmetterschild', 'male', '1695', '', {
      title: 'Erbe des Clans Schmetterschild'
    }),
    awayMember('hildrun-schmetterschild', 'Hildrun Schmetterschild', 'female', '1703', '', 'Clan Ragnulf'),
    person('sigmunda-schmetterschild', 'Sigmunda Schmetterschild', 'female', '1700', ''),
    awayMember('glaumur-schmetterschild', 'Glaumur Schmetterschild', 'male', '1702', '', 'Clan Graumähne'),
    person('valtyr-schmetterschild', 'Valtyr Schmetterschild', 'male', '1699', ''),
    affair('solveig', 'Solveig', 'female', '1705', '', {
      title: 'Affäre Valtyrs · Mutter Helgas'
    }),
    affair('gunndis', 'Gunndis', 'female', '1712', '', {
      title: 'Affäre Valtyrs · Mutter Knuts'
    }),
    spouse('hlokk-todbrand', 'Hlökk Todbrand', 'female', '1700', '', 'house-todbrand'),
    spouse('odvald-ragnulf', 'Odvald Ragnulf', 'male', '1701', '', 'house-ragnulf'),
    spouse('bjorn', 'Björn', 'male', '1700', ''),
    spouse('jofrid-graumahne', 'Jofrid Graumähne', 'female', '1697', '', 'house-graumahne'),
    spouse('gunnhildr', 'Gunnhildr', 'female', '1700', ''),

    person('kolgrimm-schmetterschild', 'Kolgrimm Schmetterschild', 'male', '1719', '', {
      title: 'Erbe des Clans Schmetterschild'
    }),
    ward('saedis-schmetterschild-ward', 'Saedís', 'female', '1721'),
    ward('kjallak-goldglanz', 'Kjallak Goldglanz', 'male', '1724', 'house-goldglanz'),
    person('armod-schmetterschild', 'Armod Schmetterschild', 'male', '1722', ''),
    person('idunn-schmetterschild', 'Idunn Schmetterschild', 'female', '1724', ''),
    person('ivarr-schmetterschild', 'Ivarr Schmetterschild', 'male', '1723', ''),
    person('lif-schmetterschild', 'Líf Schmetterschild', 'female', '1725', ''),
    person('helga-schmetterschild-bastard', 'Helga Schmetterschild', 'female', '1724', '', {
      familyRole: 'bastard',
      title: 'Bastardtochter Valtyrs und Solveigs',
      tags: ['Bastard']
    }),
    person('knut-schmetterschild-bastard', 'Knut Schmetterschild', 'male', '1725', '', {
      familyRole: 'bastard',
      title: 'Bastardsohn Valtyrs und Gunndis',
      tags: ['Bastard']
    })
  ],
  partnerships: [
    partnership('marriage-hurin-irmgard-schmetterschild'),
    partnership('marriage-gunvald-magnhild-schmetterschild', { status: 'ended', end: '1589' }),
    partnership('marriage-yrsvard-svandis-helgr', { status: 'ended', end: '1607' }),
    partnership('marriage-ingunn-hakon-wargh', { status: 'ended', end: '1609' }),
    partnership('marriage-lodvar-halldis-todbrand', { status: 'ended', end: '1622' }),
    partnership('marriage-gyda-sigvard-graumahne', { status: 'ended', end: '1670' }),
    partnership('marriage-vemund-bergljot-schmetterschild', { status: 'ended', end: '1632' }),
    partnership('marriage-sighvat-isbjorg-schmetterschild', { status: 'ended', end: '1683' }),
    partnership('marriage-yrsa-hafgrim-graumahne', { status: 'ended', end: '1700' }),
    partnership('marriage-viglund-signy-graumahne', { status: 'ended', end: '1701' }),
    partnership('marriage-lodinn-embla-schmetterschild', { status: 'ended', end: '1677' }),
    partnership('marriage-rhodri-ottilie-coedwig', { status: 'ended', end: '1703' }),
    partnership('marriage-solmund-gudrun-schmetterschild', { status: 'ended', end: '1725' }),
    partnership('marriage-thengil-tordis-schmetterschild', { status: 'ended', end: '1698' }),
    partnership('marriage-sigurd-oddleif-schmetterschild', { status: 'ended', end: '1714' }),
    partnership('marriage-thorarin-dagrun-schmetterschild', { status: 'ended', end: '1700' }),
    alignPartnerOverChildren(partnership('affair-thorarin-eldfrid-schmetterschild', {
      type: 'affair',
      status: 'ended',
      end: '1720',
      visibility: 'private',
      notes: 'Ingolf entstammt ausschließlich Thorarins Affäre mit Eldfrid.'
    }), 'eldfrid', { reserveLeafChildLane: true }),
    partnership('marriage-alfrun-skjoldulf-schmetterschild'),
    partnership('marriage-tryggvi-ormrun-schmetterschild'),
    partnership('marriage-thorodd-freydis-schmetterschild', { status: 'ended', end: '1732' }),
    partnership('marriage-hafvard-ingibjorg-schmetterschild', { status: 'ended', end: '1720' }),
    partnership('marriage-hlokk-magnus-todbrand'),
    partnership('marriage-odvald-hildrun-ragnulf'),
    partnership('marriage-sigmunda-bjorn-schmetterschild'),
    partnership('marriage-jofrid-glaumur-graumahne'),
    partnership('marriage-valtyr-gunnhildr-schmetterschild'),
    alignPartnerOverChildren(partnership('affair-valtyr-solveig-schmetterschild', {
      type: 'affair',
      visibility: 'private',
      notes: 'Helga entstammt ausschließlich Valtyrs Affäre mit Solveig.'
    }), 'solveig', { reserveLeafChildLane: true }),
    alignPartnerOverChildren(partnership('affair-valtyr-gunndis-schmetterschild', {
      type: 'affair',
      visibility: 'private',
      notes: 'Knut entstammt ausschließlich Valtyrs Affäre mit Gunndis.'
    }), 'gunndis', { reserveLeafChildLane: true })
  ],
  parentages: [
    ...childrenOf(['gunvald-schmetterschild', 'svandis-schmetterschild'], 'marriage-hurin-irmgard-schmetterschild', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen nach dem Hauswappen.'
    }),
    ...childrenOf(['hakon-schmetterschild', 'halldis-schmetterschild'], 'marriage-gunvald-magnhild-schmetterschild'),
    ...childrenOf(['sigvard-schmetterschild', 'bergljot-schmetterschild', 'sighvat-schmetterschild'], 'marriage-ingunn-hakon-wargh'),
    ...childrenOf(['hafgrim-schmetterschild', 'signy-schmetterschild'], 'marriage-gyda-sigvard-graumahne'),
    ...childrenOf(['lodinn-schmetterschild', 'ottilie-brakskjold'], 'marriage-sighvat-isbjorg-schmetterschild'),
    ...childrenOf(['solmund-schmetterschild', 'tordis-schmetterschild'], 'marriage-yrsa-hafgrim-graumahne'),
    ...childrenOf(['oddleif-schmetterschild', 'thorarin-schmetterschild'], 'marriage-lodinn-embla-schmetterschild'),
    ...childrenOf(['skjoldulf-schmetterschild', 'ormrun-schmetterschild', 'thorodd-schmetterschild'], 'marriage-solmund-gudrun-schmetterschild'),
    ...childrenOf(['hafvard-schmetterschild'], 'marriage-thorarin-dagrun-schmetterschild'),
    ...childrenOf(['ingolf-schmetterschild'], 'affair-thorarin-eldfrid-schmetterschild', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Biologische Eltern: Thorarin Schmetterschild und Eldfrid.'
    }),
    ...childrenOf(['magnus-schmetterschild', 'hildrun-schmetterschild'], 'marriage-alfrun-skjoldulf-schmetterschild'),
    ...childrenOf(['sigmunda-schmetterschild', 'glaumur-schmetterschild'], 'marriage-thorodd-freydis-schmetterschild'),
    ...childrenOf(['valtyr-schmetterschild'], 'marriage-hafvard-ingibjorg-schmetterschild'),
    ...childrenOf(['kolgrimm-schmetterschild'], 'marriage-hlokk-magnus-todbrand'),
    ...fosterChildren(['saedis-schmetterschild-ward', 'kjallak-goldglanz'], 'magnus-schmetterschild'),
    ...childrenOf(['armod-schmetterschild', 'idunn-schmetterschild'], 'marriage-sigmunda-bjorn-schmetterschild'),
    ...childrenOf(['ivarr-schmetterschild', 'lif-schmetterschild'], 'marriage-valtyr-gunnhildr-schmetterschild'),
    ...childrenOf(['helga-schmetterschild-bastard'], 'affair-valtyr-solveig-schmetterschild', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Biologische Eltern: Valtyr Schmetterschild und Solveig.'
    }),
    ...childrenOf(['knut-schmetterschild-bastard'], 'affair-valtyr-gunndis-schmetterschild', {
      legitimacy: 'illegitimate',
      visibility: 'private',
      notes: 'Biologische Eltern: Valtyr Schmetterschild und Gunndis.'
    })
  ],
  cadetBranches: [
    marriedAway('married-away-svandis-schmetterschild-helgr', 'Clan Helgr', 'marriage-yrsvard-svandis-helgr', 'house-helgr', 'haus-helgr', HOUSE_EMBLEMS.helgr),
    marriedAway('married-away-halldis-schmetterschild-todbrand', 'Clan Todbrand', 'marriage-lodvar-halldis-todbrand', 'house-todbrand', 'haus-todbrand', HOUSE_EMBLEMS.todbrand),
    marriedAway('married-away-bergljot-schmetterschild-schattenherz', 'Clan Schattenherz', 'marriage-vemund-bergljot-schmetterschild', 'house-schattenherz', 'haus-schattenherz'),
    marriedAway('married-away-signy-schmetterschild-graumahne', 'Clan Graumähne', 'marriage-viglund-signy-graumahne', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-ottilie-schmetterschild-coedwig', "Haus Coedwig O'Llanfyn", 'marriage-rhodri-ottilie-coedwig', 'house-coedwig', 'haus-coedwig', HOUSE_EMBLEMS.coedwig),
    marriedAway('married-away-tordis-schmetterschild-silberblut', 'Clan Silberblut', 'marriage-thengil-tordis-schmetterschild', 'house-silberblut', 'haus-silberblut'),
    marriedAway('married-away-oddleif-schmetterschild-goldglanz', 'Clan Goldglanz', 'marriage-sigurd-oddleif-schmetterschild', 'house-goldglanz', 'haus-goldglanz'),
    marriedAway('married-away-ormrun-schmetterschild-kummerherz', 'Clan Kummerherz', 'marriage-tryggvi-ormrun-schmetterschild', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-hildrun-schmetterschild-ragnulf', 'Clan Ragnulf', 'marriage-odvald-hildrun-ragnulf', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    marriedAway('married-away-glaumur-schmetterschild-graumahne', 'Clan Graumähne', 'marriage-jofrid-glaumur-graumahne', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne)
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-hurin-irmgard-schmetterschild',
    houseId: SCHMETTERSCHILD_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Schwarzfenn · Sitz Wolfsklamm',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1550',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'hurin-schmetterschild',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 3,
    sourceModule: 'Clan Schmetterschild (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Schmetterschild-Stammbaum wurde ohne Personenfokus von Hurin und Irmgard bis zur Generation von 1740 übernommen. Nach dem Gründerpaar folgen genau ein Hauswappen und ein serieller Quellenabstand; daneben steht kein paralleler Zeitsprung. Alle Nachkommen sind ihrer tatsächlichen Elternverbindung zugeordnet. Die Affären von Thorarin und Valtyr bilden eigene, bei Bedarf verbreiterte Mutter-Kind-Blöcke; jeder Bastard steht direkt unter seiner Mutter. Saedís und Kjallak Goldglanz sind als aufgenommene Mündel Magnus zugeordnet und nicht als leibliche Kinder. Belegte Wegverheiratungen besitzen direkte Zielhausknoten; Nachkommen aus extern fortgeführten Ehen werden ausschließlich in der jeweiligen Gegenakte gezeigt. Ottilie wird mit stabiler Weltpersonen-ID aus der Coedwig-Akte übernommen, dort aber anhand dieser Quelle von Brakskjold zu Schmetterschild korrigiert. Lodvars kanonisches Todesjahr 1622 stammt aus der Todbrand-Ursprungsakte; Alfrúns kanonisches Geburtsjahr 1676 aus der Helgr-Ursprungsakte. Die fünf namenlosen Verlobten-Platzhalter und wiederholte Standardsilhouetten der Altquelle wurden nicht importiert.',
    registryTombstones: {
      persons: ['haus-schmetterschild-gruender', 'haus-schmetterschild-gruenderin'],
      partnerships: ['marriage-haus-schmetterschild-founders']
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
