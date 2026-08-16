import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const HELGR_HOUSE_ID = 'house-helgr';

const HOUSE_EMBLEMS = Object.freeze({
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  arnvild: SCHWARZFENN_HOUSE_EMBLEMS.arnvild,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  hrafn: SCHWARZFENN_HOUSE_EMBLEMS.hrafn,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  silberzunge: IVARSHEIM_HOUSE_EMBLEMS.silberzunge,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth
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
  'aegir-helgr',
  'arvid-helgr',
  'avulstein-helgr',
  'ithmar-helgr',
  'heimskr-helgr'
]);

const HEIR_IDS = new Set([
  'magnus-helgr',
  'torgeir-helgr',
  'utgar-helgr',
  'kalf-helgr'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? HELGR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_HELGR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === HELGR_HOUSE_ID ? 'core' : 'married'),
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
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-helgr--${id}`),
    houseId,
    familyRole: 'married',
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
  founders: ['aegir-helgr', 'pallvor'],
  arvid: ['arvid-helgr', 'vefrun-arnvild'],
  grimhildr: ['snorri-silberzunge', 'grimhildr-helgr'],
  yrsvard: ['yrsvard-helgr', 'svandis-schmetterschild'],
  valgard: ['valgard-helgr', 'irmgunn'],
  brynhild: ['hjalmar-skaal', 'brynhild-helgr'],
  dagnhild: ['hjorleif-skjegg', 'dagnhild-helgr'],
  fjorgyn: ['herleif-wargh', 'fjorgyn-helgr'],
  avulstein: ['avulstein-helgr', 'ingrun'],
  saga: ['vorn-arnvild', 'saga-helgr'],
  ithmar: ['ithmar-helgr', 'orka-arnvild'],
  rognstein: ['rognstein-helgr', 'valborg'],
  ingrid: ['llwyarch-blaidd', 'ingrid-helgr'],
  heimskr: ['heimskr-helgr', 'franziska-staufenberg'],
  eldrid: ['sigmund-skaal', 'eldrid-helgr'],
  yggrid: ['hafgrim-sturmgeborener', 'yggrid-helgr'],
  halstein: ['halstein-helgr', 'tjalda'],
  magnus: ['magnus-helgr', 'kunigunde-witten'],
  leikny: ['osvald-hrafn', 'leikny-helgr'],
  pynta: ['gideon-weissmann', 'pynta-helgr'],
  roska: ['donnagh-luga', 'roska-helgr'],
  kormak: ['kormak-helgr', 'ludmilla-halbrecht'],
  ragnstein: ['ragnstein-helgr', 'milfgard'],
  oydis: ['eibhear-somhairle', 'oydis-helgr'],
  torgeir: ['torgeir-helgr', 'petka-riesentot'],
  helga: ['griffith-marwolaeth', 'helga-helgr'],
  asfrid: ['thrain-ragnulf', 'asfrid-helgr'],
  eldfred: ['eldfred-helgr', 'urdis-graumahne'],
  alfrun: ['skjoldulf-schmetterschild', 'alfrun-helgr'],
  brandr: ['brandr-helgr', 'gyrid-brandr-spouse'],
  eystein: ['eystein-helgr', 'trynna'],
  utgar: ['utgar-helgr', 'vencha-mac-magach'],
  dagny: ['sjovald-skaal', 'dagny-helgr'],
  sighild: ['harold-skjegg', 'sighild-helgr'],
  burin: ['burin-helgr', 'astridur-vragi'],
  eirik: ['eirik-helgr', 'idunn'],
  peder: ['peder-helgr', 'gyrid-peder-spouse'],
  irma: ['finnbar-mac-ailella', 'irma-helgr'],
  birta: ['gudbrand-todbrand', 'birta-helgr']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-aegir-pallvor-helgr': COUPLES.founders,
  'marriage-arvid-vefrun-helgr': COUPLES.arvid,
  'marriage-snorri-grimhildr-silberzunge': COUPLES.grimhildr,
  'marriage-yrsvard-svandis-helgr': COUPLES.yrsvard,
  'marriage-valgard-irmgunn-helgr': COUPLES.valgard,
  'marriage-hjalmar-brynhild-skaal': COUPLES.brynhild,
  'marriage-hjorleif-dagnhild-skjegg': COUPLES.dagnhild,
  'marriage-herleif-fjorgyn-wargh': COUPLES.fjorgyn,
  'marriage-avulstein-ingrun-helgr': COUPLES.avulstein,
  'marriage-saga-vorn-arnvild': COUPLES.saga,
  'marriage-ithmar-orka-helgr': COUPLES.ithmar,
  'marriage-rognstein-valborg-helgr': COUPLES.rognstein,
  'marriage-llwyarch-ingrid-blaidd': COUPLES.ingrid,
  'marriage-heimskr-franziska-helgr': COUPLES.heimskr,
  'marriage-sigmund-eldrid-skaal': COUPLES.eldrid,
  'marriage-yggrid-hafgrim-sturmgeborener': COUPLES.yggrid,
  'marriage-halstein-tjalda-helgr': COUPLES.halstein,
  'marriage-magnus-kunigunde-helgr': COUPLES.magnus,
  'marriage-leikny-osvald-hrafn': COUPLES.leikny,
  'marriage-pynta-gideon-weissmann': COUPLES.pynta,
  'marriage-roska-donnagh-luga': COUPLES.roska,
  'marriage-kormak-ludmilla-helgr': COUPLES.kormak,
  'marriage-ragnstein-milfgard-helgr': COUPLES.ragnstein,
  'marriage-oydis-eibhear-somhairle': COUPLES.oydis,
  'marriage-torgeir-petka-helgr': COUPLES.torgeir,
  'marriage-griffith-helga-marwolaeth': COUPLES.helga,
  'marriage-thrain-asfrid-ragnulf': COUPLES.asfrid,
  'marriage-eldfred-urdis-helgr': COUPLES.eldfred,
  'marriage-alfrun-skjoldulf-schmetterschild': COUPLES.alfrun,
  'marriage-brandr-gyrid-helgr': COUPLES.brandr,
  'marriage-eystein-trynna-helgr': COUPLES.eystein,
  'marriage-utgar-vencha-helgr': COUPLES.utgar,
  'marriage-sjovald-dagny-skaal': COUPLES.dagny,
  'marriage-harold-sighild-skjegg': COUPLES.sighild,
  'marriage-burin-astridur-helgr': COUPLES.burin,
  'marriage-eirik-idunn-helgr': COUPLES.eirik,
  'marriage-peder-gyrid-helgr': COUPLES.peder,
  'marriage-irma-finnbar-mac-ailella': COUPLES.irma,
  'marriage-birta-gudbrand-todbrand': COUPLES.birta
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'helgr-parentage',
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

function timeJump(id, parentPartnershipId, childIds) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear: '????',
    toYear: '1556',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; der Zeitsprung steht weder parallel zu Personen noch zu Hausknoten.',
    extensions: {}
  };
}

export const HOUSE_HELGR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-helgr',
    title: 'Clan Helgr',
    motto: '',
    description: 'Thanenclan von Schwarzfenn. Die Helgr dienen als religiös und kulturell geprägtes Herrschergeschlecht von Finstermoor.',
    emblem: HOUSE_EMBLEMS.helgr,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.helgr
  },
  houses: [
    house(HELGR_HOUSE_ID, 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-arnvild', 'Clan Arnvild', HOUSE_EMBLEMS.arnvild),
    house('house-silberzunge', 'Clan Silberzunge', HOUSE_EMBLEMS.silberzunge),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-blaidd', "Haus Blaidd O'Branon", HOUSE_EMBLEMS.blaidd),
    house('house-sturmgeborener', 'Clan Sturmgeborener'),
    house('house-staufenberg', 'Haus Staufenberg'),
    house('house-witten', 'Haus Witten'),
    house('house-hrafn', 'Clan Hrafn', HOUSE_EMBLEMS.hrafn),
    house('house-weissmann', 'Haus Weissmann'),
    house('house-luga', 'Clan Luga'),
    house('house-halbrecht', 'Haus Halbrecht'),
    house('house-somhairle', 'Clan Somhairle'),
    house('house-riesentot', 'Clan Riesentot'),
    house('house-marwolaeth', "Haus Marwolaeth O'Mathragon", HOUSE_EMBLEMS.marwolaeth),
    house('house-ragnulf', 'Clan Ragnulf'),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-mac-magach', 'Clan Mac Magach'),
    house('house-vragi', 'Clan Vragi'),
    house('house-mac-ailella', 'Clan Mac Ailella'),
    house('house-todbrand', 'Clan Todbrand', HOUSE_EMBLEMS.todbrand)
  ],
  persons: [
    person('aegir-helgr', 'Aegir Helgr', 'male', '????', '????', {
      title: 'Gründer und erster überlieferter Thane des Clans Helgr'
    }),
    spouse('pallvor', 'Pallvör', 'female', '????', '????'),

    person('arvid-helgr', 'Arvid Helgr', 'male', '1556', '1666', {
      title: 'Thane des Clans Helgr bis 1633'
    }),
    awayWoman('grimhildr-helgr', 'Grímhíldr Helgr', '1564', '1629', 'Clan Silberzunge'),
    person('yrsvard-helgr', 'Yrsvard Helgr', 'male', '1560', '1630'),
    spouse('vefrun-arnvild', 'Vefrún Arnvild', 'female', '1555', '1632', 'house-arnvild'),
    spouse('snorri-silberzunge', 'Snorri Silberzunge', 'male', '1562', '1650', 'house-silberzunge'),
    spouse('svandis-schmetterschild', 'Svandis Schmetterschild', 'female', '1560', '1607', 'house-schmetterschild'),

    person('valgard-helgr', 'Valgard Helgr', 'male', '1576', '1633'),
    awayWoman('brynhild-helgr', 'Brynhild Helgr', '1581', '1656', 'Clan Skaal'),
    awayWoman('dagnhild-helgr', 'Dagnhild Helgr', '1582', '1629', 'Clan Skjegg'),
    awayWoman('fjorgyn-helgr', 'Fjörgyn Helgr', '1593', '1629', 'Clan Wargh'),
    person('avulstein-helgr', 'Avulstein Helgr', 'male', '1576', '1666', {
      title: 'Thane des Clans Helgr von 1633 bis 1666'
    }),
    spouse('irmgunn', 'Irmgunn', 'female', '1581', '1631'),
    spouse('hjalmar-skaal', 'Hjalmar Skaal', 'male', '1575', '1629', 'house-skaal'),
    spouse('hjorleif-skjegg', 'Hjorleif Skjegg', 'male', '1580', '1629', 'house-skjegg'),
    spouse('herleif-wargh', 'Herleif Wargh', 'male', '1591', '1629', 'house-wargh'),
    spouse('ingrun', 'Ingrun', 'female', '????', '????'),

    awayWoman('saga-helgr', 'Saga Helgr', '1608', '1628', 'Clan Arnvild'),
    person('ithmar-helgr', 'Ithmar Helgr', 'male', '1610', '1712', {
      title: 'Thane des Clans Helgr von 1666 bis 1712'
    }),
    person('rognstein-helgr', 'Rognstein Helgr', 'male', '1612', '1632'),
    awayWoman('ingrid-helgr', 'Ingrid Helgr', '1614', '1703', "Haus Blaidd O'Branon"),
    spouse('vorn-arnvild', 'Vorn Arnvild', 'male', '1606', '1628', 'house-arnvild'),
    spouse('orka-arnvild', 'Orka Arnvild', 'female', '1611', '1715', 'house-arnvild'),
    spouse('valborg', 'Valborg', 'female', '1612', '1674'),
    spouse('llwyarch-blaidd', 'Llwyarch Blaidd', 'male', '1614', '1686', 'house-blaidd'),

    person('heimskr-helgr', 'Heimskr Helgr', 'male', '1629', '????', {
      title: 'Thane des Clans Helgr seit 1712'
    }),
    awayWoman('eldrid-helgr', 'Eldrid Helgr', '1636', '1734', 'Clan Skaal'),
    awayWoman('yggrid-helgr', 'Yggrid Helgr', '1633', '1712', 'Clan Sturmgeborener'),
    person('halstein-helgr', 'Halstein Helgr', 'male', '1633', '1715'),
    spouse('franziska-staufenberg', 'Franziska Staufenberg', 'female', '1630', '1740', 'house-staufenberg'),
    spouse('sigmund-skaal', 'Sigmund Skaal', 'male', '1635', '1720', 'house-skaal'),
    spouse('hafgrim-sturmgeborener', 'Hafgrim Sturmgeborener', 'male', '1627', '1694', 'house-sturmgeborener'),
    spouse('tjalda', 'Tjalda', 'female', '1637', '1691'),

    person('magnus-helgr', 'Magnus Helgr', 'male', '1653', '????', { title: 'Erster Erbe des Clans Helgr' }),
    awayWoman('leikny-helgr', 'Leikny Helgr', '1655', '????', 'Clan Hrafn'),
    awayWoman('pynta-helgr', 'Pynta Helgr', '1657', '????', 'Haus Weissmann'),
    awayWoman('roska-helgr', 'Róska Helgr', '1658', '????', 'Clan Luga'),
    person('kormak-helgr', 'Kormak Helgr', 'male', '1659', '????'),
    person('ragnstein-helgr', 'Ragnstein Helgr', 'male', '1657', '1735'),
    awayWoman('oydis-helgr', 'Oydis Helgr', '1660', '1700', 'Clan Somhairle'),
    spouse('kunigunde-witten', 'Kunigunde Witten', 'female', '1654', '????', 'house-witten'),
    spouse('osvald-hrafn', 'Osvald Hrafn', 'male', '1650', '1717', 'house-hrafn'),
    spouse('gideon-weissmann', 'Gideon Weissmann', 'male', '1650', '1711', 'house-weissmann'),
    spouse('donnagh-luga', 'Donnagh Luga', 'male', '1654', '????', 'house-luga'),
    spouse('ludmilla-halbrecht', 'Ludmilla Halbrecht', 'female', '1660', '????', 'house-halbrecht'),
    spouse('milfgard', 'Milfgard', 'female', '1660', '1730'),
    spouse('eibhear-somhairle', 'Eibhear Somhairle', 'male', '1660', '1720', 'house-somhairle'),

    person('torgeir-helgr', 'Torgeir Helgr', 'male', '1672', '', { title: 'Zweiter Erbe des Clans Helgr' }),
    awayWoman('helga-helgr', 'Helga Helgr', '1675', '', "Haus Marwolaeth O'Mathragon"),
    awayWoman('asfrid-helgr', 'Asfrid Helgr', '1679', '', 'Clan Ragnulf'),
    person('eldfred-helgr', 'Eldfred Helgr', 'male', '1677', ''),
    awayWoman('alfrun-helgr', 'Alfrún Helgr', '1676', '', 'Clan Schmetterschild'),
    person('brandr-helgr', 'Brandr Helgr', 'male', '1679', ''),
    person('eystein-helgr', 'Eystein Helgr', 'male', '1680', ''),
    spouse('petka-riesentot', 'Petka Riesentot', 'female', '1674', '', 'house-riesentot'),
    spouse('griffith-marwolaeth', 'Griffith Marwolaeth', 'male', '1671', '', 'house-marwolaeth'),
    spouse('thrain-ragnulf', 'Thrain Ragnulf', 'male', '1677', '', 'house-ragnulf'),
    spouse('urdis-graumahne', 'Ùrdís Graumähne', 'female', '1681', '', 'house-graumahne'),
    spouse('skjoldulf-schmetterschild', 'Skjoldulf Schmetterschild', 'male', '1669', '', 'house-schmetterschild'),
    spouse('gyrid-brandr-spouse', 'Gyrid', 'female', '1680', ''),
    spouse('trynna', 'Trynna', 'female', '1680', '1738'),

    person('utgar-helgr', 'Útgar Helgr', 'male', '1693', '', { title: 'Dritter Erbe des Clans Helgr' }),
    awayWoman('dagny-helgr', 'Dagny Helgr', '1695', '', 'Clan Skaal'),
    awayWoman('sighild-helgr', 'Sighild Helgr', '1696', '', 'Clan Skjegg'),
    person('burin-helgr', 'Burin Helgr', 'male', '1700', ''),
    person('eirik-helgr', 'Eirik Helgr', 'male', '1702', ''),
    person('peder-helgr', 'Peder Helgr', 'male', '1700', ''),
    awayWoman('irma-helgr', 'Irma Helgr', '1704', '', 'Clan Mac Ailella'),
    awayWoman('birta-helgr', 'Birta Helgr', '1707', '', 'Clan Todbrand'),
    spouse('vencha-mac-magach', 'Vencha Mac Magach', 'female', '1697', '', 'house-mac-magach'),
    spouse('sjovald-skaal', 'Sjovald Skaal', 'male', '1692', '1720', 'house-skaal'),
    spouse('harold-skjegg', 'Harold Skjegg', 'male', '1692', '', 'house-skjegg'),
    spouse('astridur-vragi', 'Astridur Vragi', 'female', '1703', '', 'house-vragi'),
    spouse('idunn', 'Idunn', 'female', '1704', ''),
    spouse('gyrid-peder-spouse', 'Gyrid', 'female', '1706', ''),
    spouse('finnbar-mac-ailella', 'Finnbar Mac Ailella', 'male', '1700', '', 'house-mac-ailella'),
    spouse('gudbrand-todbrand', 'Gudbrand Todbrand', 'male', '1703', '', 'house-todbrand'),

    person('kalf-helgr', 'Kalf Helgr', 'male', '1718', '', { title: 'Vierter Erbe des Clans Helgr' }),
    person('karia-helgr', 'Karia Helgr', 'female', '1724', ''),
    person('oleg-helgr', 'Oleg Helgr', 'male', '1722', ''),
    person('lenja-helgr', 'Lenja Helgr', 'female', '1725', ''),
    person('hedin-helgr', 'Hedin Helgr', 'male', '1723', '', {
      notes: 'Die alte Schaubildfassung markiert Hedin abweichend blau, erläutert diese Farbe jedoch nicht. Ohne belastbare Quellenangabe bleibt er als leiblicher Helgr-Sohn erfasst.'
    }),
    person('mysa-helgr', 'Mysa Helgr', 'female', '1725', ''),
    person('vidar-helgr', 'Vidar Helgr', 'male', '1726', ''),
    person('olna-helgr', 'Olna Helgr', 'female', '1730', '', {
      notes: 'Die alte Schaubildfassung markiert Olna abweichend blau, erläutert diese Farbe jedoch nicht. Ohne belastbare Quellenangabe bleibt sie als leibliche Helgr-Tochter erfasst.'
    })
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map((partnershipId) => partnership(partnershipId)),
  parentages: [
    ...childrenOf(['arvid-helgr', 'grimhildr-helgr', 'yrsvard-helgr'], 'marriage-aegir-pallvor-helgr', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: 'gap-aegir-arvid-helgr' }
    }),
    ...childrenOf(['valgard-helgr', 'brynhild-helgr', 'dagnhild-helgr', 'fjorgyn-helgr'], 'marriage-arvid-vefrun-helgr'),
    ...childrenOf(['avulstein-helgr'], 'marriage-yrsvard-svandis-helgr'),
    ...childrenOf(['saga-helgr', 'ithmar-helgr'], 'marriage-valgard-irmgunn-helgr'),
    ...childrenOf(['rognstein-helgr', 'ingrid-helgr'], 'marriage-avulstein-ingrun-helgr'),
    ...childrenOf(['heimskr-helgr', 'eldrid-helgr'], 'marriage-ithmar-orka-helgr'),
    ...childrenOf(['yggrid-helgr', 'halstein-helgr'], 'marriage-rognstein-valborg-helgr'),
    ...childrenOf(['magnus-helgr', 'leikny-helgr', 'pynta-helgr', 'roska-helgr', 'kormak-helgr'], 'marriage-heimskr-franziska-helgr'),
    ...childrenOf(['ragnstein-helgr', 'oydis-helgr'], 'marriage-halstein-tjalda-helgr'),
    ...childrenOf(['torgeir-helgr', 'helga-helgr', 'asfrid-helgr', 'eldfred-helgr'], 'marriage-magnus-kunigunde-helgr'),
    ...childrenOf(['alfrun-helgr', 'brandr-helgr'], 'marriage-kormak-ludmilla-helgr'),
    ...childrenOf(['eystein-helgr'], 'marriage-ragnstein-milfgard-helgr'),
    ...childrenOf(['utgar-helgr', 'dagny-helgr', 'sighild-helgr'], 'marriage-torgeir-petka-helgr'),
    ...childrenOf(['burin-helgr', 'eirik-helgr'], 'marriage-eldfred-urdis-helgr'),
    ...childrenOf(['peder-helgr', 'irma-helgr'], 'marriage-brandr-gyrid-helgr'),
    ...childrenOf(['birta-helgr'], 'marriage-eystein-trynna-helgr'),
    ...childrenOf(['kalf-helgr', 'karia-helgr'], 'marriage-utgar-vencha-helgr'),
    ...childrenOf(['oleg-helgr', 'lenja-helgr'], 'marriage-burin-astridur-helgr'),
    ...childrenOf(['hedin-helgr', 'mysa-helgr'], 'marriage-eirik-idunn-helgr'),
    ...childrenOf(['vidar-helgr', 'olna-helgr'], 'marriage-peder-gyrid-helgr')
  ],
  cadetBranches: [
    marriedAway('married-away-grimhildr-helgr-silberzunge', 'Clan Silberzunge', 'marriage-snorri-grimhildr-silberzunge', 'house-silberzunge', 'haus-silberzunge', HOUSE_EMBLEMS.silberzunge),
    marriedAway('married-away-brynhild-helgr-skaal', 'Clan Skaal', 'marriage-hjalmar-brynhild-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-dagnhild-helgr-skjegg', 'Clan Skjegg', 'marriage-hjorleif-dagnhild-skjegg', 'house-skjegg', 'haus-skjegg', HOUSE_EMBLEMS.skjegg),
    marriedAway('married-away-fjorgyn-helgr-wargh', 'Clan Wargh', 'marriage-herleif-fjorgyn-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-saga-helgr-arnvild', 'Clan Arnvild', 'marriage-saga-vorn-arnvild', 'house-arnvild', 'haus-arnvild', HOUSE_EMBLEMS.arnvild),
    marriedAway('married-away-ingrid-helgr-blaidd', "Haus Blaidd O'Branon", 'marriage-llwyarch-ingrid-blaidd', 'house-blaidd', 'haus-blaidd', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-eldrid-helgr-skaal', 'Clan Skaal', 'marriage-sigmund-eldrid-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-yggrid-helgr-sturmgeborener', 'Clan Sturmgeborener', 'marriage-yggrid-hafgrim-sturmgeborener', 'house-sturmgeborener', 'haus-sturmgeborener'),
    marriedAway('married-away-leikny-helgr-hrafn', 'Clan Hrafn', 'marriage-leikny-osvald-hrafn', 'house-hrafn', 'haus-hrafn', HOUSE_EMBLEMS.hrafn),
    marriedAway('married-away-pynta-helgr-weissmann', 'Haus Weissmann', 'marriage-pynta-gideon-weissmann', 'house-weissmann', 'haus-weissmann'),
    marriedAway('married-away-roska-helgr-luga', 'Clan Luga', 'marriage-roska-donnagh-luga', 'house-luga', 'haus-luga'),
    marriedAway('married-away-oydis-helgr-somhairle', 'Clan Somhairle', 'marriage-oydis-eibhear-somhairle', 'house-somhairle', 'haus-somhairle'),
    marriedAway('married-away-helga-helgr-marwolaeth', "Haus Marwolaeth O'Mathragon", 'marriage-griffith-helga-marwolaeth', 'house-marwolaeth', 'haus-marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    marriedAway('married-away-asfrid-helgr-ragnulf', 'Clan Ragnulf', 'marriage-thrain-asfrid-ragnulf', 'house-ragnulf', 'haus-ragnulf'),
    marriedAway('married-away-alfrun-helgr-schmetterschild', 'Clan Schmetterschild', 'marriage-alfrun-skjoldulf-schmetterschild', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-dagny-helgr-skaal', 'Clan Skaal', 'marriage-sjovald-dagny-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-sighild-helgr-skjegg', 'Clan Skjegg', 'marriage-harold-sighild-skjegg', 'house-skjegg', 'haus-skjegg', HOUSE_EMBLEMS.skjegg),
    marriedAway('married-away-irma-helgr-mac-ailella', 'Clan Mac Ailella', 'marriage-irma-finnbar-mac-ailella', 'house-mac-ailella', 'haus-mac-ailella'),
    marriedAway('married-away-birta-helgr-todbrand', 'Clan Todbrand', 'marriage-birta-gudbrand-todbrand', 'house-todbrand', 'haus-todbrand', HOUSE_EMBLEMS.todbrand)
  ],
  timeJumps: [
    timeJump('gap-aegir-arvid-helgr', 'marriage-aegir-pallvor-helgr', [
      'arvid-helgr',
      'grimhildr-helgr',
      'yrsvard-helgr'
    ])
  ],
  lineage: {
    founderPartnershipId: 'marriage-aegir-pallvor-helgr',
    houseId: HELGR_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Schwarzfenn · Sitz Finstermoor',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aegir-helgr',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 5,
    sourceModule: 'Clan Helgr (bereitgestellte Altdaten)',
    sourceNote: 'Der Stammbaum bildet die vollständige überlieferte Helgr-Genealogie ohne Personenfokus ab. Aegir und Pallvör bilden das Gründerpaar; der einzige Quellenzeitsprung folgt strikt seriell auf den ersten Hausknoten. Die Oberhauptfolge Aegir, Arvid, Avulstein, Ithmar und Heimskr sowie die Erbfolge Magnus, Torgeir, Útgar und Kalf stammen aus der Hoftabelle. Sämtliche verheirateten Helgr-Frauen erhalten direkte Wegverheiratet-Verknüpfungen; Nachkommen in den Zielhäusern werden dort und nicht doppelt im Helgr-Baum fortgeführt. Bestehende Gegenregister-Porträts werden wiederverwendet. Die Schreibweise Anvild wurde als offensichtlicher Quellenfehler zu Arnvild normalisiert, Fjörgyn aus der beschädigten HTML-Kodierung wiederhergestellt und Idunn entsprechend ihrer Rolle als Ehefrau weiblich erfasst. Die Quelle nennt Eldrids Tod 1734 und Dagnhilds Tod 1629; diese präziseren Daten ersetzen die bisherigen unbekannten Todesangaben in den Gegenakten. Die alte Bildgrafik färbt Hedin und Olna blau, liefert dafür aber weder Legende noch Statusangabe. Beide bleiben daher bis zu einer belastbaren Klärung als leibliche Helgr-Kinder erfasst. Die fünf unbenannten Verlobten-Platzhalter der HTML-Tabelle wurden nicht erfunden und nicht in den Stammbaum übernommen.',
    registryTombstones: {
      persons: ['haus-helgr-gruender', 'haus-helgr-gruenderin'],
      partnerships: ['marriage-haus-helgr-founders']
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
