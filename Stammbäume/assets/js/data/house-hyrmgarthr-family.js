import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import { HOUSE_HYRMGARTHR_PORTRAITS } from './house-hyrmgarthr-portraits.js';
import {
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { KLAUENINSEL_HOUSE_EMBLEMS } from './klaueninseln-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const HYRMGARTHR_HOUSE_ID = 'house-hyrmgardr';
const FOUNDER_TIME_JUMP_ID = 'gap-founders-bjaldir-irvandir-hyrmgardr';
const HALGRIM_TIME_JUMP_ID = 'gap-halgrim-three-sons-hyrmgardr';

const HOUSE_EMBLEMS = Object.freeze({
  hyrmgarthr: IVARSHEIM_HOUSE_EMBLEMS.hyrmgardr,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  morthwyll: KLAUENINSEL_HOUSE_EMBLEMS.morthwyll
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
  'bjaldir-1380-hyrmgardr',
  'halgrim-hyrmgardr',
  'skorr-hyrmgardr',
  'falknir-hyrmgardr',
  'svennar-hyrmgardr',
  'gunnir-hyrmgarthr',
  'snorri-einauge-hyrmgardr'
]);

const MAINLINE_IDS = new Set([
  'gunnhildr-hyrmgardr',
  'niflhel-hyrmgardr',
  'hjalmar-hyrmgardr',
  'eirik-hyrmgardr',
  'asmund-hyrmgardr',
  'mikkel-hyrmgardr'
]);

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'gunnir-hyrmgarthr': 'person--haus-hyrmgarthr--gunnir-hyrmgarthr',
  'dagbjorg-wargh': 'person--haus-wargh--dagbjorg-wargh',
  'skeggjadis-hrymgardr': 'person--haus-hrymgardr--skeggjadis-hrymgardr',
  'ingjald-brathfengr': 'person--haus-brathfengr--ingjald-brathfengr',
  'yrthinn-hyrmgardr': 'person--haus-hyrmgardr--yrthinn-hyrmgardr',
  'sunniva-skogg': 'person--haus-skogg--sunniva-skogg',
  'njordinn-hyrmgardr': 'person--haus-hyrmgardr--njordinn-hyrmgardr',
  'freydis-silberzunge': 'person--haus-silberzunge--freydis-silberzunge',
  'magnhild-hyrmgardr': 'person--haus-hyrmgardr--magnhild-hyrmgardr',
  'sigvaldr-skogg': 'person--haus-skogg--sigvaldr-skogg',
  'jarell-hyrmgardr': 'person--haus-hyrmgardr--jarell-hyrmgardr',
  'maven-schwarzdorn': 'person--haus-schwarzdorn--maven-schwarzdorn',
  'hedvig-hyrmgardr': 'person--haus-hyrmgardr--hedvig-hyrmgardr',
  'grugyn-morthwyll': 'person--haus-morthwyll--grugyn-morthwyll'
});

const INTERNAL_MARRIAGES = Object.freeze({
  kara: 'marriage-falknir-kara-hyrmgardr',
  frigga: 'marriage-asmund-frigga-hyrmgardr'
});

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function worldPersonIdFor(id, houseId) {
  if (SHARED_WORLD_PERSON_IDS[id]) return SHARED_WORLD_PERSON_IDS[id];
  if (!houseId || houseId === HYRMGARTHR_HOUSE_ID) return `person--haus-hyrmgardr--${id}`;
  return `person--${houseId.replace(/^house-/, 'haus-')}--${id}`;
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? HYRMGARTHR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || worldPersonIdFor(id, houseId),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_HYRMGARTHR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === HYRMGARTHR_HOUSE_ID ? 'core' : 'married'),
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
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['gunnhildr-hyrmgardr', 'niflhel-hyrmgardr'],
  bjaldir: ['bjaldir-1380-hyrmgardr', 'valkira-hyrmgardr-spouse'],
  irvandir: ['irvandir-hyrmgardr', 'arnlifa-hyrmgardr-spouse'],
  halgrim: ['halgrim-hyrmgardr', 'fjorhild-1407-hyrmgardr-spouse'],
  thorvir: ['thorvir-hyrmgardr', 'thyrelia-hyrmgardr-spouse'],
  skorr: ['skorr-hyrmgardr', 'kynhildra-hyrmgardr-spouse'],
  vigdrod: ['vigdrod-hyrmgardr', 'angreboda-hyrmgardr-spouse'],
  bjaldir1539: ['bjaldir-1539-hyrmgardr', 'hvelda-hyrmgardr-spouse'],
  falknir: ['falknir-hyrmgardr', 'kara-hyrmgardr'],
  thorlund: ['thorlund-hyrmgardr', 'jornhildr-hyrmgardr-spouse'],
  drangar: ['drangar-hyrmgardr', 'mjoll-hyrmgardr-spouse'],
  svennar: ['svennar-hyrmgardr', 'yrsa-hyrmgardr-spouse'],
  skeggjadis: ['ingjald-brathfengr', 'skeggjadis-hrymgardr'],
  jorvak: ['jorvak-hyrmgardr', 'eydra-hyrmgardr-spouse'],
  gunnir: ['dagbjorg-wargh', 'gunnir-hyrmgarthr'],
  hardar: ['hardar-hyrmgardr', 'fjorda-hyrmgardr-spouse'],
  eindulf: ['eindulf-hyrmgardr', 'alvindra-hyrmgardr-spouse'],
  snorri: ['snorri-einauge-hyrmgardr', 'elvryn-hyrmgardr-spouse'],
  yrthinn: ['sunniva-skogg', 'yrthinn-hyrmgardr'],
  kjalmar: ['kjalmar-hyrmgardr', 'fjorhild-1634-hyrmgardr-spouse'],
  hjalmar: ['hjalmar-hyrmgardr', 'runhild-hyrmgardr-spouse'],
  galmar: ['galmar-hyrmgardr', 'eidwyn-hyrmgardr-spouse'],
  kjorn: ['kjorn-hyrmgardr', 'lofthild-hyrmgardr-spouse'],
  hranvald: ['hranvald-hyrmgardr', 'yrnhild-riesentot'],
  njordinn: ['freydis-silberzunge', 'njordinn-hyrmgardr'],
  magnhild: ['sigvaldr-skogg', 'magnhild-hyrmgardr'],
  ulfgar: ['ulfgar-hyrmgardr', 'hrevna-hyrmgardr-spouse'],
  geir: ['geir-hyrmgardr', 'frigga-1674-hyrmgardr-spouse'],
  jarell: ['jarell-hyrmgardr', 'maven-schwarzdorn'],
  eirik: ['eirik-hyrmgardr', 'livara-hyrmgardr-spouse'],
  sigvald: ['sigvald-hyrmgardr', 'skovja-hyrmgardr-spouse'],
  erlund: ['erlund-hyrmgardr', 'ravna-hyrmgardr-spouse'],
  surtur: ['surtur-hyrmgardr', 'gerdur-hyrmgardr-spouse'],
  asmund: ['asmund-hyrmgardr', 'frigga-1695-hyrmgardr'],
  yngvar: ['yngvar-hyrmgardr', 'lyngrid-hyrmgardr-spouse'],
  hedvig: ['grugyn-morthwyll', 'hedvig-hyrmgardr']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-gunnhildr-niflhel-hyrmgardr': COUPLES.founders,
  'marriage-bjaldir-valkira-hyrmgardr': COUPLES.bjaldir,
  'marriage-irvandir-arnlifa-hyrmgardr': COUPLES.irvandir,
  'marriage-halgrim-fjorhild-hyrmgardr': COUPLES.halgrim,
  'marriage-thorvir-thyrelia-hyrmgardr': COUPLES.thorvir,
  'marriage-skorr-kynhildra-hyrmgardr': COUPLES.skorr,
  'marriage-vigdrod-angreboda-hyrmgardr': COUPLES.vigdrod,
  'marriage-bjaldir-hvelda-hyrmgardr': COUPLES.bjaldir1539,
  [INTERNAL_MARRIAGES.kara]: COUPLES.falknir,
  'marriage-thorlund-jornhildr-hyrmgardr': COUPLES.thorlund,
  'marriage-drangar-mjoll-hyrmgardr': COUPLES.drangar,
  'marriage-svennar-yrsa-hyrmgardr': COUPLES.svennar,
  'marriage-ingjald-skeggjadis-brathfengr': COUPLES.skeggjadis,
  'marriage-jorvak-eydra-hyrmgardr': COUPLES.jorvak,
  'marriage-dagbjorg-gunnir-wargh': COUPLES.gunnir,
  'marriage-hardar-fjorda-hyrmgardr': COUPLES.hardar,
  'marriage-eindulf-alvindra-hyrmgardr': COUPLES.eindulf,
  'marriage-snorri-elvryn-hyrmgardr': COUPLES.snorri,
  'marriage-sunniva-yrthinn-skogg': COUPLES.yrthinn,
  'marriage-kjalmar-fjorhild-hyrmgardr': COUPLES.kjalmar,
  'marriage-hjalmar-runhild-hyrmgardr': COUPLES.hjalmar,
  'marriage-galmar-eidwyn-hyrmgardr': COUPLES.galmar,
  'marriage-kjorn-lofthild-hyrmgardr': COUPLES.kjorn,
  'marriage-hranvald-yrnhild-hyrmgardr': COUPLES.hranvald,
  'marriage-freydis-njordinn-silberzunge': COUPLES.njordinn,
  'marriage-sigvaldr-magnhild-skogg': COUPLES.magnhild,
  'marriage-ulfgar-hrevna-hyrmgardr': COUPLES.ulfgar,
  'marriage-geir-frigga-hyrmgardr': COUPLES.geir,
  'marriage-jarell-maven-schwarzdorn': COUPLES.jarell,
  'marriage-eirik-livara-hyrmgardr': COUPLES.eirik,
  'marriage-sigvald-skovja-hyrmgardr': COUPLES.sigvald,
  'marriage-erlund-ravna-hyrmgardr': COUPLES.erlund,
  'marriage-surtur-gerdur-hyrmgardr': COUPLES.surtur,
  [INTERNAL_MARRIAGES.frigga]: COUPLES.asmund,
  'marriage-yngvar-lyngrid-hyrmgardr': COUPLES.yngvar,
  'marriage-grugyn-hedvig-morthwyll': COUPLES.hedvig
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'hyrmgarthr-parentage',
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

export const HOUSE_HYRMGARTHR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-hyrmgardr',
    title: 'Clan Hyrmgarthr',
    motto: '',
    description: 'Zurückgezogener Magierclan von Winterfeste. Die Hyrmgarthr herrschen über Winterwacht, dienen dem Clan Skogg und führen ihre außergewöhnliche magische Begabung auf Gunnhildr und Niflhel den Arkanisten zurück.',
    emblem: HOUSE_EMBLEMS.hyrmgarthr,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.hyrmgardr
  },
  houses: [
    house(HYRMGARTHR_HOUSE_ID, 'Clan Hyrmgarthr', HOUSE_EMBLEMS.hyrmgarthr),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-morthwyll', 'Haus Morthwyll', HOUSE_EMBLEMS.morthwyll),
    house('house-riesentot', 'Clan Riesentot')
  ],
  persons: [
    person('gunnhildr-hyrmgardr', 'Gunnhildr Hyrmgarthr', 'female', '????', '????', {
      title: 'Gründerin und sagenhafte Blutmutter des Clans Hyrmgarthr',
      extensions: { cardFrameId: 'infernal' }
    }),
    person('niflhel-hyrmgardr', 'Niflhel der Arkanist', 'male', '????', '????', {
      title: 'Gründer und erster Hesir des Clans Hyrmgarthr'
    }),

    person('bjaldir-1380-hyrmgardr', 'Bjaldir Hyrmgarthr', 'male', '1380', '1477', {
      title: 'Hesir des Clans Hyrmgarthr bis 1477'
    }),
    person('irvandir-hyrmgardr', 'Irvandir Hyrmgarthr', 'male', '1381', '1503'),
    spouse('valkira-hyrmgardr-spouse', 'Valkira', 'female', '1384', '1457'),
    spouse('arnlifa-hyrmgardr-spouse', 'Arnlifa', 'female', '1387', '1445'),

    person('halgrim-hyrmgardr', 'Halgrim Hyrmgarthr', 'male', '1402', '1500', {
      title: 'Hesir des Clans Hyrmgarthr von 1477 bis 1500'
    }),
    spouse('fjorhild-1407-hyrmgardr-spouse', 'Fjorhild', 'female', '1407', '1488'),
    person('aldis-hyrmgardr', 'Aldis Hyrmgarthr', 'male', '1406', '????', {
      title: 'Großer Magier · Schüler Halfdans des Schwarzen · verschollen'
    }),
    person('freydis-1400-hyrmgardr', 'Freydis Hyrmgarthr', 'female', '1400', '????', {
      title: 'Große Magierin · Schülerin Halfdans des Schwarzen · verschollen'
    }),

    person('thorvir-hyrmgardr', 'Thorvir Hyrmgarthr', 'male', '1519', '1625'),
    person('skorr-hyrmgardr', 'Skorr Hyrmgarthr', 'male', '1515', '1614', {
      title: 'Hesir des Clans Hyrmgarthr von 1500 bis 1614'
    }),
    person('vigdrod-hyrmgardr', 'Vigdrod Hyrmgarthr', 'male', '1517', '1629'),
    spouse('thyrelia-hyrmgardr-spouse', 'Thyrelia', 'female', '1521', '1589'),
    spouse('kynhildra-hyrmgardr-spouse', 'Kynhildra', 'female', '1517', '1577'),
    spouse('angreboda-hyrmgardr-spouse', 'Angreboda', 'female', '1519', '1600'),

    person('bjaldir-1539-hyrmgardr', 'Bjaldir Hyrmgarthr', 'male', '1539', '1632'),
    person('falknir-hyrmgardr', 'Falknir Hyrmgarthr', 'male', '1535', '1623', {
      title: 'Hesir des Clans Hyrmgarthr von 1614 bis 1623',
      extensions: { chartPartnerMirrorForPartnershipIds: [INTERNAL_MARRIAGES.kara] }
    }),
    awayWoman('kara-hyrmgardr', 'Kara Hyrmgarthr', '1537', '1681', 'Clan Hyrmgarthr', {
      title: 'Wegverheiratet innerhalb des Clans Hyrmgarthr',
      extensions: { chartRepeatForPartnershipIds: [INTERNAL_MARRIAGES.kara] }
    }),
    person('thorlund-hyrmgardr', 'Thorlund Hyrmgarthr', 'male', '1543', '1673'),
    spouse('hvelda-hyrmgardr-spouse', 'Hvelda', 'female', '1541', '1598'),
    spouse('jornhildr-hyrmgardr-spouse', 'Jornhildr', 'female', '1545', '1600'),

    person('drangar-hyrmgardr', 'Drangar Hyrmgarthr', 'male', '1560', '1689'),
    person('svennar-hyrmgardr', 'Svennar Hyrmgarthr', 'male', '1555', '1625', {
      title: 'Hesir des Clans Hyrmgarthr von 1623 bis 1625'
    }),
    awayWoman('skeggjadis-hrymgardr', 'Skeggjadís Hyrmgarthr', '1563', '1661', 'Clan Brathfengr'),
    spouse('mjoll-hyrmgardr-spouse', 'Mjöll', 'female', '1565', '1608'),
    spouse('yrsa-hyrmgardr-spouse', 'Yrsa', 'female', '1556', '1601'),
    spouse('ingjald-brathfengr', 'Ingjald Brathfengr', 'male', '1563', '1665', 'house-brathfengr'),

    person('jorvak-hyrmgardr', 'Jorvak Hyrmgarthr', 'male', '1583', '1703'),
    person('gunnir-hyrmgarthr', 'Gunnir Hyrmgarthr', 'male', '1574', '1659', {
      title: 'Hesir des Clans Hyrmgarthr von 1625 bis 1659'
    }),
    person('bergelmir-hyrmgardr', 'Bergelmir Hyrmgarthr', 'male', '1576', ''),
    person('hardar-hyrmgardr', 'Hardar Hyrmgarthr', 'male', '1579', '1698'),
    spouse('eydra-hyrmgardr-spouse', 'Eydra', 'female', '1587', '1725', '', {
      notes: 'Die Tabelle druckt 1687. Da ihr Sohn Eindulf bereits 1607 geboren wird, ist die Jahrhundertstelle anhand der Generationenfolge zu 1587 berichtigt.'
    }),
    spouse('dagbjorg-wargh', 'Dagbjorg Wargh', 'female', '1570', '1641', 'house-wargh'),
    spouse('fjorda-hyrmgardr-spouse', 'Fjorda', 'female', '1580', '1623'),

    person('eindulf-hyrmgardr', 'Eindulf Hyrmgarthr', 'male', '1607', ''),
    person('snorri-einauge-hyrmgardr', 'Snorri „Einauge“ Hyrmgarthr', 'male', '1602', '', {
      title: 'Hesir des Clans Hyrmgarthr seit 1659'
    }),
    person('yrthinn-hyrmgardr', 'Yrthinn Hyrmgarthr', 'male', '1599', '1692'),
    spouse('alvindra-hyrmgardr-spouse', 'Alvindra', 'female', '1614', '1685'),
    spouse('elvryn-hyrmgardr-spouse', 'Elvryn', 'female', '1609', '1674'),
    spouse('sunniva-skogg', 'Sunniva Skogg', 'female', '1603', '1681', 'house-skogg'),

    person('kjalmar-hyrmgardr', 'Kjalmar Hyrmgarthr', 'male', '1632', ''),
    person('kjaldra-hyrmgardr', 'Kjaldra Hyrmgarthr', 'female', '1635', ''),
    person('hjalmar-hyrmgardr', 'Hjalmar Hyrmgarthr', 'male', '1627', '', {
      title: 'Erster in der Erbfolge des Clans Hyrmgarthr'
    }),
    person('galmar-hyrmgardr', 'Galmar Hyrmgarthr', 'male', '1627', ''),
    person('kjorn-hyrmgardr', 'Kjorn Hyrmgarthr', 'male', '1629', ''),
    spouse('fjorhild-1634-hyrmgardr-spouse', 'Fjorhild', 'female', '1634', '1691'),
    spouse('runhild-hyrmgardr-spouse', 'Runhild', 'female', '1630', '1697'),
    spouse('eidwyn-hyrmgardr-spouse', 'Eidwyn', 'female', '1632', '1701'),
    spouse('lofthild-hyrmgardr-spouse', 'Lofthild', 'female', '1634', '1679'),

    person('hranvald-hyrmgardr', 'Hranvald Hyrmgarthr', 'male', '1652', ''),
    person('njordinn-hyrmgardr', 'Njordinn Hyrmgarthr', 'male', '1649', '1711'),
    awayWoman('magnhild-hyrmgardr', 'Magnhild Hyrmgarthr', '1650', '1738', 'Clan Skogg'),
    person('ulfgar-hyrmgardr', 'Ulfgar Hyrmgarthr', 'male', '1655', ''),
    spouse('yrnhild-riesentot', 'Edla Riesentod', 'female', '1652', '1705', 'house-riesentot', {
      notes: 'Die Hyrmgarthr-Kinderüberschrift und ihre Stammbaumgrafik nennen diese Frau Yrnhild; die Ehepartnerzeile und die eigenständige Riesentod-Akte nennen dieselbe Person Edla. Die ausführliche Herkunftsakte Riesentod ist für den Anzeigenamen maßgeblich; die veröffentlichte Weltpersonen-ID bleibt stabil.'
    }),
    spouse('freydis-silberzunge', 'Freydis Silberzunge', 'female', '1653', '1719', 'house-silberzunge'),
    spouse('sigvaldr-skogg', 'Sigvaldr Skogg', 'male', '1648', '1723', 'house-skogg'),
    spouse('hrevna-hyrmgardr-spouse', 'Hrevna', 'female', '1657', '1711'),

    person('geir-hyrmgardr', 'Geir Hyrmgarthr', 'male', '1671', ''),
    person('jarell-hyrmgardr', 'Jarell Hyrmgarthr', 'male', '1673', '', {
      title: 'Wegverheiratet an Clan Schwarzdorn',
      tags: ['Wegverheiratet']
    }),
    person('eirik-hyrmgardr', 'Eirik Hyrmgarthr', 'male', '1669', '', {
      title: 'Zweiter in der Erbfolge des Clans Hyrmgarthr'
    }),
    person('sigvald-hyrmgardr', 'Sigvald Hyrmgarthr', 'male', '1675', ''),
    person('erlund-hyrmgardr', 'Erlund Hyrmgarthr', 'male', '1678', ''),
    spouse('frigga-1674-hyrmgardr-spouse', 'Frigga', 'female', '1674', ''),
    spouse('maven-schwarzdorn', 'Maven Schwarzdorn', 'female', '1693', '', 'house-schwarzdorn'),
    spouse('livara-hyrmgardr-spouse', 'Livara', 'female', '1673', ''),
    spouse('skovja-hyrmgardr-spouse', 'Skovja', 'female', '1679', ''),
    spouse('ravna-hyrmgardr-spouse', 'Ravna', 'female', '1680', ''),

    person('surtur-hyrmgardr', 'Surtur Hyrmgarthr', 'male', '1692', ''),
    awayWoman('frigga-1695-hyrmgardr', 'Frigga Hyrmgarthr', '1695', '', 'Clan Hyrmgarthr', {
      title: 'Wegverheiratet innerhalb des Clans Hyrmgarthr',
      extensions: { chartRepeatForPartnershipIds: [INTERNAL_MARRIAGES.frigga] }
    }),
    person('asmund-hyrmgardr', 'Asmund Hyrmgarthr', 'male', '1690', '', {
      title: 'Dritter in der Erbfolge des Clans Hyrmgarthr',
      extensions: { chartPartnerMirrorForPartnershipIds: [INTERNAL_MARRIAGES.frigga] }
    }),
    person('yngvar-hyrmgardr', 'Yngvar Hyrmgarthr', 'male', '1694', ''),
    awayWoman('hedvig-hyrmgardr', 'Hedvig Hyrmgarthr', '1698', '', 'Haus Morthwyll'),
    spouse('gerdur-hyrmgardr-spouse', 'Gerdur', 'female', '1699', ''),
    spouse('lyngrid-hyrmgardr-spouse', 'Lyngrid', 'female', '1699', ''),
    spouse('grugyn-morthwyll', 'Grugyn Morthwyll', 'male', '1695', '', 'house-morthwyll'),

    person('thokk-hyrmgardr', 'Thokk Hyrmgarthr', 'male', '1720', ''),
    person('mikkel-hyrmgardr', 'Mikkel Hyrmgarthr', 'male', '1715', '', {
      title: 'Vierter in der Erbfolge des Clans Hyrmgarthr'
    }),
    person('vaelra-hyrmgardr', 'Vaelra Hyrmgarthr', 'female', '1722', ''),
    person('kvasir-hyrmgardr', 'Kvasir Hyrmgarthr', 'male', '1721', '')
  ],
  partnerships: [
    endedMarriage('marriage-gunnhildr-niflhel-hyrmgardr'),
    endedMarriage('marriage-bjaldir-valkira-hyrmgardr', '1457'),
    endedMarriage('marriage-irvandir-arnlifa-hyrmgardr', '1445'),
    endedMarriage('marriage-halgrim-fjorhild-hyrmgardr', '1488'),
    endedMarriage('marriage-thorvir-thyrelia-hyrmgardr', '1589'),
    endedMarriage('marriage-skorr-kynhildra-hyrmgardr', '1577'),
    endedMarriage('marriage-vigdrod-angreboda-hyrmgardr', '1600'),
    endedMarriage('marriage-bjaldir-hvelda-hyrmgardr', '1598'),
    endedMarriage(INTERNAL_MARRIAGES.kara, '1623'),
    endedMarriage('marriage-thorlund-jornhildr-hyrmgardr', '1600'),
    endedMarriage('marriage-drangar-mjoll-hyrmgardr', '1608'),
    endedMarriage('marriage-svennar-yrsa-hyrmgardr', '1601'),
    endedMarriage('marriage-ingjald-skeggjadis-brathfengr', '1661'),
    endedMarriage('marriage-jorvak-eydra-hyrmgardr', '1703'),
    endedMarriage('marriage-dagbjorg-gunnir-wargh', '1641'),
    endedMarriage('marriage-hardar-fjorda-hyrmgardr', '1623'),
    endedMarriage('marriage-eindulf-alvindra-hyrmgardr', '1685'),
    endedMarriage('marriage-snorri-elvryn-hyrmgardr', '1674'),
    endedMarriage('marriage-sunniva-yrthinn-skogg', '1681'),
    endedMarriage('marriage-kjalmar-fjorhild-hyrmgardr', '1691'),
    endedMarriage('marriage-hjalmar-runhild-hyrmgardr', '1697'),
    endedMarriage('marriage-galmar-eidwyn-hyrmgardr', '1701'),
    endedMarriage('marriage-kjorn-lofthild-hyrmgardr', '1679'),
    endedMarriage('marriage-hranvald-yrnhild-hyrmgardr', '1705'),
    endedMarriage('marriage-freydis-njordinn-silberzunge', '1711'),
    endedMarriage('marriage-sigvaldr-magnhild-skogg', '1723'),
    endedMarriage('marriage-ulfgar-hrevna-hyrmgardr', '1711'),
    marriage('marriage-geir-frigga-hyrmgardr'),
    marriage('marriage-jarell-maven-schwarzdorn'),
    marriage('marriage-eirik-livara-hyrmgardr'),
    marriage('marriage-sigvald-skovja-hyrmgardr'),
    marriage('marriage-erlund-ravna-hyrmgardr'),
    marriage('marriage-surtur-gerdur-hyrmgardr'),
    marriage(INTERNAL_MARRIAGES.frigga),
    marriage('marriage-yngvar-lyngrid-hyrmgardr'),
    marriage('marriage-grugyn-hedvig-morthwyll')
  ],
  parentages: [
    ...childrenOf(['bjaldir-1380-hyrmgardr', 'irvandir-hyrmgardr'], 'marriage-gunnhildr-niflhel-hyrmgardr', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Bjaldir und Irvandir.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['halgrim-hyrmgardr'], 'marriage-bjaldir-valkira-hyrmgardr'),
    ...childrenOf(['aldis-hyrmgardr', 'freydis-1400-hyrmgardr'], 'marriage-irvandir-arnlifa-hyrmgardr'),
    ...childrenOf(['thorvir-hyrmgardr', 'skorr-hyrmgardr', 'vigdrod-hyrmgardr'], 'marriage-halgrim-fjorhild-hyrmgardr', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Quelle überspringt mehrere Generationen vor den drei Brüdern.',
      extensions: { timeJumpId: HALGRIM_TIME_JUMP_ID }
    }),
    ...childrenOf(['bjaldir-1539-hyrmgardr'], 'marriage-thorvir-thyrelia-hyrmgardr'),
    ...childrenOf(['falknir-hyrmgardr'], 'marriage-skorr-kynhildra-hyrmgardr'),
    ...childrenOf(['kara-hyrmgardr', 'thorlund-hyrmgardr'], 'marriage-vigdrod-angreboda-hyrmgardr'),
    ...childrenOf(['drangar-hyrmgardr'], 'marriage-bjaldir-hvelda-hyrmgardr'),
    ...childrenOf(['svennar-hyrmgardr'], INTERNAL_MARRIAGES.kara),
    ...childrenOf(['skeggjadis-hrymgardr'], 'marriage-thorlund-jornhildr-hyrmgardr'),
    ...childrenOf(['jorvak-hyrmgardr'], 'marriage-drangar-mjoll-hyrmgardr'),
    ...childrenOf(['gunnir-hyrmgarthr', 'bergelmir-hyrmgardr', 'hardar-hyrmgardr'], 'marriage-svennar-yrsa-hyrmgardr'),
    ...childrenOf(['eindulf-hyrmgardr'], 'marriage-jorvak-eydra-hyrmgardr'),
    ...childrenOf(['snorri-einauge-hyrmgardr'], 'marriage-dagbjorg-gunnir-wargh'),
    ...childrenOf(['yrthinn-hyrmgardr'], 'marriage-hardar-fjorda-hyrmgardr'),
    ...childrenOf(['kjalmar-hyrmgardr', 'kjaldra-hyrmgardr'], 'marriage-eindulf-alvindra-hyrmgardr'),
    ...childrenOf(['hjalmar-hyrmgardr', 'galmar-hyrmgardr'], 'marriage-snorri-elvryn-hyrmgardr'),
    ...childrenOf(['kjorn-hyrmgardr'], 'marriage-sunniva-yrthinn-skogg'),
    ...childrenOf(['hranvald-hyrmgardr'], 'marriage-kjalmar-fjorhild-hyrmgardr'),
    ...childrenOf(['njordinn-hyrmgardr'], 'marriage-hjalmar-runhild-hyrmgardr'),
    ...childrenOf(['magnhild-hyrmgardr'], 'marriage-galmar-eidwyn-hyrmgardr'),
    ...childrenOf(['ulfgar-hyrmgardr'], 'marriage-kjorn-lofthild-hyrmgardr'),
    ...childrenOf(['geir-hyrmgardr', 'jarell-hyrmgardr'], 'marriage-hranvald-yrnhild-hyrmgardr'),
    ...childrenOf(['eirik-hyrmgardr'], 'marriage-freydis-njordinn-silberzunge'),
    ...childrenOf(['sigvald-hyrmgardr', 'erlund-hyrmgardr'], 'marriage-ulfgar-hrevna-hyrmgardr'),
    ...childrenOf(['surtur-hyrmgardr', 'frigga-1695-hyrmgardr'], 'marriage-geir-frigga-hyrmgardr'),
    ...childrenOf(['asmund-hyrmgardr'], 'marriage-eirik-livara-hyrmgardr'),
    ...childrenOf(['yngvar-hyrmgardr'], 'marriage-sigvald-skovja-hyrmgardr'),
    ...childrenOf(['hedvig-hyrmgardr'], 'marriage-erlund-ravna-hyrmgardr'),
    ...childrenOf(['thokk-hyrmgardr'], 'marriage-surtur-gerdur-hyrmgardr'),
    ...childrenOf(['mikkel-hyrmgardr', 'vaelra-hyrmgardr'], INTERNAL_MARRIAGES.frigga),
    ...childrenOf(['kvasir-hyrmgardr'], 'marriage-yngvar-lyngrid-hyrmgardr')
  ],
  cadetBranches: [
    marriedAway(
      'internal-marriage-kara-hyrmgardr',
      'Clan Hyrmgarthr',
      INTERNAL_MARRIAGES.kara,
      HYRMGARTHR_HOUSE_ID,
      'haus-hyrmgardr',
      HOUSE_EMBLEMS.hyrmgarthr,
      'Wegverheiratet innerhalb des Clans Hyrmgarthr'
    ),
    marriedAway('married-away-skeggjadis-hyrmgardr-brathfengr', 'Clan Brathfengr', 'marriage-ingjald-skeggjadis-brathfengr', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-magnhild-hyrmgardr-skogg', 'Clan Skogg', 'marriage-sigvaldr-magnhild-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg),
    marriedAway(
      'internal-marriage-frigga-hyrmgardr',
      'Clan Hyrmgarthr',
      INTERNAL_MARRIAGES.frigga,
      HYRMGARTHR_HOUSE_ID,
      'haus-hyrmgardr',
      HOUSE_EMBLEMS.hyrmgarthr,
      'Wegverheiratet innerhalb des Clans Hyrmgarthr'
    ),
    marriedAway('married-away-jarell-hyrmgardr-schwarzdorn', 'Clan Schwarzdorn', 'marriage-jarell-maven-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-hedvig-hyrmgardr-morthwyll', 'Haus Morthwyll', 'marriage-grugyn-hedvig-morthwyll', 'house-morthwyll', 'haus-morthwyll', HOUSE_EMBLEMS.morthwyll)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-gunnhildr-niflhel-hyrmgardr',
      parentPersonId: '',
      childIds: ['bjaldir-1380-hyrmgardr', 'irvandir-hyrmgardr'],
      years: 0,
      fromYear: '????',
      toYear: '1380',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner direkt unter dem Clanwappen.',
      extensions: {}
    },
    {
      id: HALGRIM_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-halgrim-fjorhild-hyrmgardr',
      parentPersonId: '',
      childIds: ['thorvir-hyrmgardr', 'skorr-hyrmgardr', 'vigdrod-hyrmgardr'],
      years: 0,
      fromYear: '1402',
      toYear: '1515',
      label: 'Mehrere nicht einzeln überlieferte Generationen',
      notes: 'Die drei parallelen Punktreihen der alten Grafik sind als ein gemeinsamer serieller Trenner modelliert.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gunnhildr-niflhel-hyrmgardr',
    houseId: HYRMGARTHR_HOUSE_ID,
    crestSubtitle: 'Magierclan von Winterfeste · Hesire von Winterwacht · Vasallen des Clans Skogg',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gunnhildr-hyrmgardr',
    orientation: 'vertical',
    ancestorDepth: 30,
    descendantDepth: 30,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: 'Clan Hyrmgarthr (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Quellenstammbaum wurde ohne Personenfokus von Gunnhildr und Niflhel bis zur Generation von 1740 übernommen. Gunnhildr trägt als sagenhafte infernale Blutmutter den Infernalen Rahmen; Niflhel bleibt im normalen Kernrahmen. Das Clanwappen und der erste Zeitsprung stehen strikt seriell zwischen dem Gründerpaar und den Brüdern Bjaldir und Irvandir. Die drei parallelen Punktreihen nach Halgrim und Fjorhild werden wegen der absoluten Zeitsprungregel zu einem einzigen seriellen Trenner vor Thorvir, Skorr und Vigdrod vereinigt. Clanmitglieder können laut Quelle mehrere Jahrhunderte leben; ein hohes Alter allein wird deshalb nicht berichtigt. Eydras gedrucktes Geburtsjahr 1687 ist dennoch unmöglich, da ihr Sohn Eindulf 1607 geboren wird, und wird als offensichtlicher Jahrhundertfehler zu 1587 aufgelöst. Hranvalds Frau heißt in Kinderüberschrift und Stammbaumgrafik Yrnhild, während die Partnerzeile und die eigenständige Riesentod-Akte sie Edla nennen; die ausführliche Herkunftsakte ist für den Anzeigenamen Edla Riesentod maßgeblich, die stabile Weltpersonen-ID bleibt erhalten. Falknir/Kara sowie Asmund/Frigga sind interne Clan-Ehen. Beide Partner bleiben an ihrer Herkunftsstelle sichtbar; die Braut wird am männlich fortgeführten Zweig kontrolliert wiederholt, der Ehemann an ihrer kinderlosen Herkunftspaarung gespiegelt. Nur die männlich verankerte Paarfassung führt die gemeinsamen Kinder. Unter der weiblichen Herkunftspaarung steht jeweils der normale Wegverheiratet-Knoten zurück zu Clan Hyrmgarthr. Skeggjadís, Magnhild und Hedvig führen mit direkten Zielknoten nach Brathfengr, Skogg und Morthwyll. Jarell wird als nach Clan Schwarzdorn wegverheiratet geführt; seine Kinder mit Maven werden ausschließlich in der fortführenden Schwarzdorn-Akte dargestellt. Eingehende Ehen aus Wargh, Skogg und Silberzunge teilen Weltpersonen und Partnerschaften mit den Gegenakten. Die technischen Altformen Hrymgardr/Hyrmgardr/Hyrmgarthr bleiben nur in stabilen IDs erhalten; sichtbar wird der Registername Hyrmgarthr verwendet. Vier namenlose Verlobungsfelder und die wiederholte Standardsilhouette werden nicht als Personen oder Individualporträts importiert.',
    registryTombstones: {
      persons: ['haus-hyrmgardr-gruender', 'haus-hyrmgardr-gruenderin'],
      partnerships: ['marriage-haus-hyrmgardr-founders']
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedLineageFields: ['founderPartnershipId'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
