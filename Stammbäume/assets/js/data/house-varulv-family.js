import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES
} from './aldrimar-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';

const VARULV_HOUSE_ID = 'house-varulv';

const HOUSE_EMBLEMS = Object.freeze({
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
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
  'rorik-varulv',
  'thorkell-varulv',
  'arnor-varulv',
  'torger-varulv',
  'erling-varulv',
  'eldgrim-varulv',
  'eldar-varulv',
  'steinarr-varulv',
  'sigfast-varulv',
  'gleipnir-varulv'
]);

const MAINLINE_IDS = new Set(['geri-varulv', 'freki-varulv', 'floki-varulv']);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? VARULV_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_VARULV_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === VARULV_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['rorik-varulv', 'caragh-varulv'],
  thorkell: ['thorkell-varulv', 'bjarnhild-vaeren'],
  vigulf: ['vigulf-varulv', 'sif'],
  arnor: ['arnor-varulv', 'annegret-wargh'],
  fannarr: ['fannarr-varulv', 'ingeborg-brathfengr'],
  torger: ['torger-varulv', 'aslaug-ragnulf'],
  herdis: ['herdis-varulv', 'hjolm-kampfgeborene'],
  erling: ['erling-varulv', 'dagni-brathfengr'],
  edda: ['edda-varulv', 'macsen-trachwyll'],
  eldgrim: ['eldgrim-varulv', 'saoirse-ard-dubglais'],
  eldar: ['eldar-varulv', 'svanhild-skald'],
  astrid: ['astrid-varulv', 'roger-vaeren'],
  steinarr: ['steinarr-varulv', 'aslaug-soekeren'],
  rannveig: ['rannveig-varulv', 'torger-sturmgeborene'],
  torborg: ['torborg-varulv', 'jakul-freiwinter'],
  gunnleik: ['gunnleik-varulv', 'ormhild-frostauge'],
  sigfast: ['sigfast-varulv', 'rekka-kampfgeborene'],
  alva: ['alva-varulv', 'torvard-nachtjaeger'],
  torygg: ['torygg-varulv', 'ingrid-schwarzdorn'],
  erla: ['erla-varulv', 'einarr-sterkr'],
  gunhild: ['gunhild-varulv', 'vorna-brathfengr'],
  gunnar: ['gunnar-varulv', 'olga-eisenbieger'],
  gleipnir: ['gleipnir-varulv', 'antke-skald-varulv'],
  sleipnir: ['sleipnir-varulv', 'svantje-skaal'],
  freyrs: ['freyrs-varulv', 'ketill-wargh'],
  tyr: ['tyr-varulv', 'dagmar-skjegg'],
  skirnir: ['skirnir-varulv', 'bodvild-skogg'],
  gunnvor: ['gunnvor-varulv', 'edda-freiwinter'],
  skalli: ['anaraut-draig', 'skalli-varulv']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-rorik-caragh-varulv': COUPLES.founders,
  'marriage-thorkell-bjarnhild-varulv': COUPLES.thorkell,
  'marriage-vigulf-sif-varulv': COUPLES.vigulf,
  'marriage-arnor-annegret-varulv': COUPLES.arnor,
  'marriage-fannarr-ingeborg-varulv': COUPLES.fannarr,
  'marriage-torger-aslaug-varulv': COUPLES.torger,
  'marriage-herdis-hjolm-varulv': COUPLES.herdis,
  'marriage-erling-dagni-varulv': COUPLES.erling,
  'marriage-edda-macsen-varulv': COUPLES.edda,
  'marriage-eldgrim-saoirse-varulv': COUPLES.eldgrim,
  'marriage-eldar-svanhild-varulv': COUPLES.eldar,
  'marriage-astrid-roger-varulv': COUPLES.astrid,
  'marriage-steinarr-aslaug-varulv': COUPLES.steinarr,
  'marriage-rannveig-torger-varulv': COUPLES.rannveig,
  'marriage-torborg-jakul-varulv': COUPLES.torborg,
  'marriage-gunnleik-ormhild-varulv': COUPLES.gunnleik,
  'marriage-sigfast-rekka-varulv': COUPLES.sigfast,
  'marriage-alva-torvard-varulv': COUPLES.alva,
  'marriage-torygg-ingrid-varulv': COUPLES.torygg,
  'marriage-erla-einarr-varulv': COUPLES.erla,
  'marriage-gunhild-vorna-varulv': COUPLES.gunhild,
  'marriage-gunnar-olga-varulv': COUPLES.gunnar,
  'marriage-gleipnir-antke-varulv': COUPLES.gleipnir,
  'marriage-sleipnir-svantje-varulv': COUPLES.sleipnir,
  'marriage-freyrs-ketill-varulv': COUPLES.freyrs,
  'marriage-tyr-dagmar-varulv': COUPLES.tyr,
  'marriage-skirnir-bodvild-varulv': COUPLES.skirnir,
  'marriage-gunnvor-edda-varulv': COUPLES.gunnvor,
  'engagement-anaraut-skalli': COUPLES.skalli
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'varulv-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
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
      registryManagedFields: ['name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle']
    }
  });
}

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; Seitenzweige und Hausknoten werden nicht parallel als Fortsetzung geführt.',
    extensions: {}
  };
}

export const HOUSE_VARULV_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-varulv',
    title: 'Clan Varulv',
    motto: '',
    description: 'Jarlsclan von Roriksheim und Herren von Rorikshall. Der Clan führt seine Herkunft auf Rorik zurück; Nachtjäger und Freiwinter gingen als Kadettenzweige aus Fannarr beziehungsweise Vigulf Varulv hervor.',
    emblem: HOUSE_EMBLEMS.varulv,
    houseProfile: ALDRIMAR_HOUSE_PROFILES.varulv
  },
  houses: [
    house(VARULV_HOUSE_ID, 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn"),
    house('house-ard-dubglais', 'Clan Ard Dubglais'),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-frostauge', 'Clan Frostauge'),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-skogg', 'Clan Skogg')
  ],
  persons: [
    person('rorik-varulv', 'Rorik Varulv', 'male', '????', '????', {
      title: 'Stammvater und erster Jarl des Clans Varulv'
    }),
    spouse('caragh-varulv', 'Caragh', 'female', '????', '????'),

    person('thorkell-varulv', 'Thorkell Varulv', 'male', '????', '????', { title: 'Jarl von Roriksheim' }),
    spouse('bjarnhild-vaeren', 'Bjarnhild Vaeren', 'female', '????', '????', 'house-vaeren'),
    person('vigulf-varulv', 'Vigulf Varulv', 'male', '????', '????', {
      title: 'Begründer des Clans Freiwinter',
      tags: ['Kadettengründer']
    }),
    spouse('sif', 'Sif', 'female', '????', '????'),

    person('arnor-varulv', 'Arnór Varulv', 'male', '1257', '1309', { title: 'Jarl von Roriksheim' }),
    spouse('annegret-wargh', 'Annegret Wargh', 'female', '1262', '1304', 'house-wargh'),
    person('fannarr-varulv', 'Fannarr Varulv', 'male', '1259', '1335', {
      title: 'Begründer des Clans Nachtjäger',
      tags: ['Kadettengründer']
    }),
    spouse('ingeborg-brathfengr', 'Ingeborg Brathfengr', 'female', '1264', '1361', 'house-brathfengr'),

    person('torger-varulv', 'Torger Varulv', 'male', '1554', '1600', { title: 'Jarl von Roriksheim' }),
    spouse('aslaug-ragnulf', 'Aslaug Ragnulf', 'female', '1559', '1625', 'house-ragnulf'),
    awayWoman('herdis-varulv', 'Herdis Varulv', '1579', '1627', 'Clan Kampfgeborene'),
    spouse('hjolm-kampfgeborene', 'Hjolm Kampfgeborener', 'male', '1579', '1629', 'house-kampfgeborene'),

    person('erling-varulv', 'Erling Varulv', 'male', '1577', '1625', { title: 'Jarl von Roriksheim' }),
    spouse('dagni-brathfengr', 'Dagni Brathfengr', 'female', '1579', '1654', 'house-brathfengr'),
    awayWoman('edda-varulv', 'Edda Varulv', '1583', '1627', "Haus Trachwyll O'Talfronwyn"),
    spouse('macsen-trachwyll', "Macsen Trachwyll O'Talfronwyn", 'male', '1580', '1650', 'house-trachwyll-talfronwyn'),
    person('eldgrim-varulv', 'Eldgrim Varulv', 'male', '1580', '1625', { title: 'Jarl von Roriksheim' }),
    spouse('saoirse-ard-dubglais', 'Saoirse Ard Dubglais', 'female', '1581', '1635', 'house-ard-dubglais'),

    person('freyja-varulv', 'Freyja Varulv', 'female', '1600', '', {
      status: 'unknown',
      notes: 'Die Quelle nennt weder Ehe noch Todesjahr; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('eldar-varulv', 'Eldar Varulv', 'male', '1599', '1667', { title: 'Jarl von Roriksheim' }),
    spouse('svanhild-skald', 'Svanhild Skald', 'female', '1628', '1702', 'house-skald'),
    awayWoman('astrid-varulv', 'Astrid Varulv', '1603', '1627', 'Clan Vaeren'),
    spouse('roger-vaeren', 'Roger Vaeren', 'male', '1606', '1627', 'house-vaeren', { title: 'König von Aldrimar' }),

    person('steinarr-varulv', 'Steinarr Varulv', 'male', '1648', '1706', { title: 'Jarl von Roriksheim' }),
    spouse('aslaug-soekeren', 'Aslaug Sökeren', 'female', '1649', '1731', 'house-soekeren', {
      notes: 'Die Quelle schreibt den Clannamen abweichend als „Sökaren“; das Register führt kanonisch Sökeren.'
    }),
    awayWoman('rannveig-varulv', 'Rannveig Varulv', '1650', '1696', 'Clan Sturmgeborene'),
    spouse('torger-sturmgeborene', 'Torger Sturmgeborener', 'male', '1647', '1693', 'house-sturmgeborene'),
    awayWoman('torborg-varulv', 'Torborg Varulv', '1652', '1735', 'Clan Freiwinter'),
    spouse('jakul-freiwinter', 'Jakul Freiwinter', 'male', '1650', '1701', 'house-freiwinter'),
    person('gunnleik-varulv', 'Gunnleik Varulv', 'male', '1654', '1691'),
    spouse('ormhild-frostauge', 'Ormhild Frostauge', 'female', '1655', '1687', 'house-frostauge'),

    person('sigfast-varulv', 'Sigfast Varulv', 'male', '1667', '1720', { title: 'Jarl von Roriksheim' }),
    spouse('rekka-kampfgeborene', 'Rekka Kampfgeborene', 'female', '1674', '', 'house-kampfgeborene'),
    awayWoman('alva-varulv', 'Alva Varulv', '1672', '', 'Clan Nachtjäger'),
    spouse('torvard-nachtjaeger', 'Torvard Nachtjäger', 'male', '1670', '', 'house-nachtjaeger'),
    person('torygg-varulv', 'Torygg Varulv', 'male', '1674', '1720'),
    spouse('ingrid-schwarzdorn', 'Ingrid Schwarzdorn', 'female', '1675', '1730', 'house-schwarzdorn'),
    awayWoman('erla-varulv', 'Erla Varulv', '1675', '', 'Clan Sterkr'),
    spouse('einarr-sterkr', 'Einarr Sterkr', 'male', '1674', '', 'house-sterkr'),
    awayWoman('gunhild-varulv', 'Gunhild Varulv', '1680', '', 'Clan Brathfengr'),
    spouse('vorna-brathfengr', 'Vorna Brathfengr', 'male', '1678', '', 'house-brathfengr'),
    person('gunnar-varulv', 'Gunnar Varulv', 'male', '1687', ''),
    spouse('olga-eisenbieger', 'Olga Eisenbieger', 'female', '1680', '', 'house-eisenbieger'),

    person('gleipnir-varulv', 'Gleipnir Varulv', 'male', '1694', '', { title: 'Jarl von Roriksheim seit 1720' }),
    spouse('antke-skald-varulv', 'Antje Skald', 'female', '1695', '', 'house-skald', {
      notes: 'Die Skald-Hausquelle belegt die Schreibweise Antje. Sie ist nicht identisch mit der 1696 geborenen Antke Skald der Ceirwyn-Akte; beide Frauen führen zeitgleich verschiedene Ehen.'
    }),
    person('sleipnir-varulv', 'Sleipnir Varulv', 'male', '1696', ''),
    spouse('svantje-skaal', 'Svantje Skaal', 'female', '1698', '', 'house-skaal'),
    awayWoman('freyrs-varulv', 'Freyrs Varulv', '1698', '', 'Clan Wargh'),
    spouse('ketill-wargh', 'Ketill Wargh', 'male', '1693', '', 'house-wargh'),
    person('tyr-varulv', 'Tyr Varulv', 'male', '1697', ''),
    spouse('dagmar-skjegg', 'Dagmar Skjegg', 'female', '1698', '', 'house-skjegg'),
    person('skirnir-varulv', 'Skirnir Varulv', 'male', '1700', ''),
    spouse('bodvild-skogg', 'Bodvild Skogg', 'female', '1700', '', 'house-skogg'),
    person('gunnvor-varulv', 'Gunnvor Varulv', 'male', '1705', ''),
    spouse('edda-freiwinter', 'Edda Freiwinter', 'female', '1705', '', 'house-freiwinter'),

    person('geri-varulv', 'Geri Varulv', 'male', '1714', '', { title: 'Erster Erbe des Clans Varulv' }),
    person('freki-varulv', 'Freki Varulv', 'male', '1718', '', { title: 'Zweiter Erbe des Clans Varulv' }),
    person('floki-varulv', 'Floki Varulv', 'male', '1723', '', { title: 'Dritter Erbe des Clans Varulv' }),
    person('skadi-varulv', 'Skadi Varulv', 'female', '1719', ''),
    awayWoman('skalli-varulv', 'Skalli Varulv', '1716', '', 'Haus Draig', {
      title: 'Wegverlobt an Haus Draig',
      tags: ['Wegverlobt']
    }),
    person('fenrir-varulv', 'Fenrir Varulv', 'male', '1718', ''),
    person('hati-varulv', 'Hati Varulv', 'male', '1725', ''),
    person('ask-varulv', 'Ask Varulv', 'male', '1721', ''),
    person('embla-varulv', 'Embla Varulv', 'female', '1723', ''),
    person('jordis-varulv', 'Jördis Varulv', 'female', '1722', ''),
    person('hymir-varulv', 'Hymir Varulv', 'male', '1729', ''),
    person('mimir-varulv', 'Mimir Varulv', 'male', '1729', ''),
    person('gunrik-varulv', 'Gunrik Varulv', 'male', '1723', ''),
    person('gundel-varulv', 'Gundel Varulv', 'female', '1725', ''),
    person('gunvir-varulv', 'Gunvir Varulv', 'male', '1730', ''),
    spouse('anaraut-draig', 'Anaraut', 'male', '1715', '', 'house-draig')
  ],
  partnerships: [
    marriage('marriage-rorik-caragh-varulv'),
    marriage('marriage-thorkell-bjarnhild-varulv'),
    marriage('marriage-vigulf-sif-varulv'),
    marriage('marriage-arnor-annegret-varulv'),
    marriage('marriage-fannarr-ingeborg-varulv'),
    marriage('marriage-torger-aslaug-varulv'),
    marriage('marriage-herdis-hjolm-varulv'),
    marriage('marriage-erling-dagni-varulv'),
    marriage('marriage-edda-macsen-varulv'),
    marriage('marriage-eldgrim-saoirse-varulv'),
    marriage('marriage-eldar-svanhild-varulv'),
    marriage('marriage-astrid-roger-varulv'),
    marriage('marriage-steinarr-aslaug-varulv'),
    marriage('marriage-rannveig-torger-varulv'),
    marriage('marriage-torborg-jakul-varulv'),
    marriage('marriage-gunnleik-ormhild-varulv'),
    marriage('marriage-sigfast-rekka-varulv'),
    marriage('marriage-alva-torvard-varulv'),
    marriage('marriage-torygg-ingrid-varulv'),
    marriage('marriage-erla-einarr-varulv'),
    marriage('marriage-gunhild-vorna-varulv'),
    marriage('marriage-gunnar-olga-varulv'),
    marriage('marriage-gleipnir-antke-varulv'),
    marriage('marriage-sleipnir-svantje-varulv'),
    marriage('marriage-freyrs-ketill-varulv'),
    marriage('marriage-tyr-dagmar-varulv'),
    marriage('marriage-skirnir-bodvild-varulv'),
    marriage('marriage-gunnvor-edda-varulv'),
    marriage('engagement-anaraut-skalli', { type: 'engagement' })
  ],
  parentages: [
    ...claimedChildren(['thorkell-varulv', 'vigulf-varulv'], 'marriage-rorik-caragh-varulv', 'gap-rorik-thorkell-varulv'),
    ...claimedChildren(['arnor-varulv', 'fannarr-varulv'], 'marriage-thorkell-bjarnhild-varulv', 'gap-thorkell-arnor-varulv'),
    ...claimedChildren(['torger-varulv', 'herdis-varulv'], 'marriage-arnor-annegret-varulv', 'gap-arnor-torger-varulv'),
    ...childrenOf(['erling-varulv', 'edda-varulv', 'eldgrim-varulv'], 'marriage-torger-aslaug-varulv'),
    ...childrenOf(['freyja-varulv'], 'marriage-erling-dagni-varulv'),
    ...childrenOf(['eldar-varulv', 'astrid-varulv'], 'marriage-eldgrim-saoirse-varulv'),
    ...childrenOf(['steinarr-varulv', 'rannveig-varulv', 'torborg-varulv', 'gunnleik-varulv'], 'marriage-eldar-svanhild-varulv'),
    ...childrenOf(['sigfast-varulv', 'alva-varulv', 'torygg-varulv', 'erla-varulv'], 'marriage-steinarr-aslaug-varulv'),
    ...childrenOf(['gunhild-varulv', 'gunnar-varulv'], 'marriage-gunnleik-ormhild-varulv'),
    ...childrenOf(['gleipnir-varulv', 'sleipnir-varulv', 'freyrs-varulv'], 'marriage-sigfast-rekka-varulv'),
    ...childrenOf(['tyr-varulv', 'skirnir-varulv'], 'marriage-torygg-ingrid-varulv'),
    ...childrenOf(['gunnvor-varulv'], 'marriage-gunnar-olga-varulv'),
    ...childrenOf(['geri-varulv', 'freki-varulv', 'floki-varulv', 'skadi-varulv'], 'marriage-gleipnir-antke-varulv'),
    ...childrenOf(['skalli-varulv', 'fenrir-varulv', 'hati-varulv'], 'marriage-sleipnir-svantje-varulv'),
    ...childrenOf(['ask-varulv', 'embla-varulv'], 'marriage-tyr-dagmar-varulv'),
    ...childrenOf(['jordis-varulv', 'hymir-varulv', 'mimir-varulv'], 'marriage-skirnir-bodvild-varulv'),
    ...childrenOf(['gunrik-varulv', 'gundel-varulv', 'gunvir-varulv'], 'marriage-gunnvor-edda-varulv')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-freiwinter-vigulf-sif',
      name: 'Clan Freiwinter',
      parentPartnershipId: 'marriage-vigulf-sif-varulv',
      houseId: 'house-freiwinter',
      targetFamilyId: 'haus-freiwinter',
      emblem: HOUSE_EMBLEMS.freiwinter,
      subtitle: 'Kadettenclan der Varulv',
      notes: 'Vigulf Varulv und Sif begründen den Clan Freiwinter; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-nachtjaeger-fannarr-ingeborg',
      name: 'Clan Nachtjäger',
      parentPartnershipId: 'marriage-fannarr-ingeborg-varulv',
      houseId: 'house-nachtjaeger',
      targetFamilyId: 'haus-nachtjaeger',
      emblem: HOUSE_EMBLEMS.nachtjaeger,
      subtitle: 'Kadettenclan der Varulv',
      notes: 'Fannarr Varulv und Ingeborg Brathfengr begründen den Clan Nachtjäger; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    marriedAway('married-away-herdis-varulv-kampfgeborene', 'Clan Kampfgeborene', 'marriage-herdis-hjolm-varulv', 'house-kampfgeborene', 'haus-kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    marriedAway('married-away-edda-varulv-trachwyll', "Haus Trachwyll O'Talfronwyn", 'marriage-edda-macsen-varulv', 'house-trachwyll-talfronwyn', 'haus-trachwyll-talfronwyn'),
    marriedAway('married-away-astrid-varulv-vaeren', 'Clan Vaeren', 'marriage-astrid-roger-varulv', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-rannveig-varulv-sturmgeborene', 'Clan Sturmgeborene', 'marriage-rannveig-torger-varulv', 'house-sturmgeborene', 'haus-sturmgeborene'),
    marriedAway('married-away-torborg-varulv-freiwinter', 'Clan Freiwinter', 'marriage-torborg-jakul-varulv', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-alva-varulv-nachtjaeger', 'Clan Nachtjäger', 'marriage-alva-torvard-varulv', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-erla-varulv-sterkr', 'Clan Sterkr', 'marriage-erla-einarr-varulv', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-gunhild-varulv-brathfengr', 'Clan Brathfengr', 'marriage-gunhild-vorna-varulv', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-freyrs-varulv-wargh', 'Clan Wargh', 'marriage-freyrs-ketill-varulv', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('engaged-away-skalli-varulv-draig', 'Haus Draig', 'engagement-anaraut-skalli', 'house-draig', 'haus-draig', HOUSE_EMBLEMS.draig, 'Wegverlobt an Haus Draig')
  ],
  timeJumps: [
    timeJump('gap-rorik-thorkell-varulv', 'marriage-rorik-caragh-varulv', ['thorkell-varulv', 'vigulf-varulv'], '????', '????'),
    timeJump('gap-thorkell-arnor-varulv', 'marriage-thorkell-bjarnhild-varulv', ['arnor-varulv', 'fannarr-varulv'], '????', '1257'),
    timeJump('gap-arnor-torger-varulv', 'marriage-arnor-annegret-varulv', ['torger-varulv', 'herdis-varulv'], '1309', '1554')
  ],
  lineage: {
    founderPartnershipId: 'marriage-rorik-caragh-varulv',
    houseId: VARULV_HOUSE_ID,
    crestSubtitle: 'Jarlsclan von Roriksheim · Sitz Rorikshall',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'rorik-varulv',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: "Clan Varulv O'Rorikshall (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Jarlfolge und Porträtzuordnungen folgen der bereitgestellten Varulv-Hausseite. Rorik und Caragh tragen den Hausknoten; drei Quellenlücken werden als strikt serielle absolute Generationentrenner umgesetzt. Vigulf und Sif begründen Clan Freiwinter, Fannarr und Ingeborg Brathfengr Clan Nachtjäger; beide Kadettenknoten hängen direkt unter dem jeweiligen Gründerpaar und führen die Varulv-Hauptlinie nicht fort. Verheiratete Varulv-Frauen erhalten direkte Zielclanknoten; ihre Kinder werden nur im Zielclan fortgeführt. Skallis Verlobung mit Anaraut Draig verwendet dieselben Weltpersonen, dieselbe Partnerschaft und dieselben Porträts wie die Draig-Gegenakte. Wiederholte Standardsilhouetten und vier namenlose Verlobungsplatzhalter wurden nicht als Individualpersonen importiert. Die später ausgewertete Skald-Hausquelle korrigiert die 1695 geborene Ehefrau Gleipnirs von Antke zu Antje; sie bleibt von der 1696 geborenen Antke der Ceirwyn-Akte getrennt.',
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
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
