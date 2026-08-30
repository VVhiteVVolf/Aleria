import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const NACHTJAEGER_HOUSE_ID = 'house-nachtjaeger';
const FOUNDER_TIME_JUMP_ID = 'gap-fannarr-gunnar-nachtjaeger';

const HOUSE_EMBLEMS = Object.freeze({
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene
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
  'fannarr-varulv',
  'gunnar-nachtjaeger',
  'vidarr-nachtjaeger',
  'sturlaugr-nachtjaeger',
  'joekull-nachtjaeger',
  'fjoelnir-nachtjaeger',
  'kjartan-nachtjaeger',
  'torvard-nachtjaeger'
]);

const MAINLINE_IDS = new Set([
  'rognar-nachtjaeger',
  'arnor-nachtjaeger',
  'joric-nachtjaeger'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? NACHTJAEGER_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_NACHTJAEGER_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === NACHTJAEGER_HOUSE_ID ? 'core' : 'married'),
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

function relationPartner(id, name, birth, death, familyRole, title, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole,
    lineageRole: 'branch',
    title,
    tags: [...(options.tags || []), familyRole === 'affair' ? 'Affäre' : 'Erzwungene Verbindung']
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
  founders: ['fannarr-varulv', 'ingeborg-brathfengr'],
  gunnar: ['gunnar-nachtjaeger', 'bergljot-brathfengr'],
  gudrun: ['ketill-freiwinter', 'gudrun-nachtjaeger'],
  vidarr: ['vidarr-nachtjaeger', 'arnkatla-schattenherz'],
  asthildr: ['asthildr-nachtjaeger', 'ulfgar-schattenherz'],
  sturlaugrIngunn: ['sturlaugr-nachtjaeger', 'ingunn-1614-feuerherz'],
  sturlaugrOrka: ['sturlaugr-nachtjaeger', 'orka-riesentot'],
  valdis: ['valdis-nachtjaeger', 'hrafnkell-vragi'],
  joekull: ['joekull-nachtjaeger', 'malfrid-kaltherz'],
  kjartan: ['kjartan-nachtjaeger', 'gunnhildr'],
  svandis: ['svandis-nachtjaeger', 'cuan'],
  fjoelnir: ['fjoelnir-nachtjaeger', 'hjoerdis'],
  fjoelnirMuirne: ['fjoelnir-nachtjaeger', 'muirne'],
  torvard: ['alva-varulv', 'torvard-nachtjaeger'],
  inghild: ['inghild-nachtjaeger', 'stiofan-blar'],
  baldvin: ['baldvin-nachtjaeger', 'hallbera'],
  rognar: ['rognar-nachtjaeger', 'ran-skald'],
  rognarVorna: ['rognar-nachtjaeger', 'vorna'],
  estridd: ['reidar-freiwinter', 'estridd-nachtjaeger'],
  starkad: ['starkad-nachtjaeger', 'oddrun-kampfgeborene'],
  gulda: ['gulda-nachtjaeger', 'kynwas-dyngwn']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-fannarr-ingeborg-varulv': COUPLES.founders,
  'marriage-gunnar-bergljot-nachtjaeger': COUPLES.gunnar,
  'marriage-ketill-gudrun-freiwinter': COUPLES.gudrun,
  'marriage-vidarr-arnkatla-nachtjaeger': COUPLES.vidarr,
  'marriage-asthildr-ulfgar-nachtjaeger': COUPLES.asthildr,
  'marriage-sturlaugr-ingunn-nachtjaeger': COUPLES.sturlaugrIngunn,
  'marriage-sturlaugr-orka-nachtjaeger': COUPLES.sturlaugrOrka,
  'marriage-valdis-hrafnkell-nachtjaeger': COUPLES.valdis,
  'marriage-joekull-malfrid-nachtjaeger': COUPLES.joekull,
  'marriage-kjartan-gunnhildr-nachtjaeger': COUPLES.kjartan,
  'marriage-svandis-cuan-nachtjaeger': COUPLES.svandis,
  'marriage-fjoelnir-hjoerdis-nachtjaeger': COUPLES.fjoelnir,
  'forced-fjoelnir-muirne-nachtjaeger': COUPLES.fjoelnirMuirne,
  'marriage-alva-torvard-varulv': COUPLES.torvard,
  'marriage-inghild-stiofan-nachtjaeger': COUPLES.inghild,
  'marriage-baldvin-hallbera-nachtjaeger': COUPLES.baldvin,
  'marriage-rognar-ran-nachtjaeger': COUPLES.rognar,
  'affair-rognar-vorna-nachtjaeger': COUPLES.rognarVorna,
  'marriage-reidar-estridd-freiwinter': COUPLES.estridd,
  'marriage-starkad-oddrun-nachtjaeger': COUPLES.starkad,
  'marriage-gulda-kynwas-nachtjaeger': COUPLES.gulda
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(partnership, partnerPersonId) {
  return {
    ...partnership,
    extensions: {
      ...partnership.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'nachtjaeger-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Zwischen dem Gründerpaar und diesen Geschwistern sind mehrere Generationen nicht einzeln überliefert.',
    extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
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
      registryManagedFields: ['name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle']
    }
  });
}

export const HOUSE_NACHTJAEGER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-nachtjaeger',
    title: 'Clan Nachtjäger',
    motto: '',
    description: 'Hesire-Clan von Burg Horunn im Dämmertal, Kadettenclan der Varulv und Vasall der Vangandr.',
    emblem: HOUSE_EMBLEMS.nachtjaeger,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.nachtjaeger
  },
  houses: [
    house(NACHTJAEGER_HOUSE_ID, 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-feuerherz', 'Clan Feuerherz'),
    house('house-riesentot', 'Clan Riesentot'),
    house('house-vragi', 'Clan Vragi'),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-nic-blar', 'Clan Nic Blar', 'assets/images/houses/Ceitheach/clan-nic-blar.png'),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('fannarr-varulv', 'Fannarr Varulv', 'male', '1259', '1335', {
      houseId: 'house-varulv',
      familyRole: 'founder',
      title: 'Begründer des Clans Nachtjäger',
      tags: ['Kadettengründer']
    }),
    spouse('ingeborg-brathfengr', 'Ingeborg Brathfengr', 'female', '1264', '1361', 'house-brathfengr'),

    person('gunnar-nachtjaeger', 'Gunnar Nachtjäger', 'male', '1567', '1621', { title: 'Hesir des Clans Nachtjäger' }),
    spouse('bergljot-brathfengr', 'Bergljót Brathfengr', 'female', '1567', '1656', 'house-brathfengr'),
    awayWoman('gudrun-nachtjaeger', 'Gudrun Nachtjäger', '1576', '1627', 'Clan Freiwinter'),
    spouse('ketill-freiwinter', 'Ketill Freiwinter', 'male', '1576', '1625', 'house-freiwinter'),

    person('vidarr-nachtjaeger', 'Vidarr Nachtjäger', 'male', '1585', '1632', { title: 'Hesir des Clans Nachtjäger' }),
    spouse('arnkatla-schattenherz', 'Arnkatla Schattenherz', 'female', '1589', '1635', 'house-schattenherz'),
    awayWoman('asthildr-nachtjaeger', 'Ásthildr Nachtjäger', '1587', '1659', 'Clan Schattenherz'),
    spouse('ulfgar-schattenherz', 'Ulfgar Schattenherz', 'male', '1584', '1632', 'house-schattenherz'),

    person('sturlaugr-nachtjaeger', 'Sturlaugr Nachtjäger', 'male', '1611', '1650', {
      title: 'Hesir des Clans Nachtjäger',
      extensions: { chartCenterBetweenSpousePersonIds: ['ingunn-1614-feuerherz', 'orka-riesentot'] }
    }),
    spouse('ingunn-1614-feuerherz', 'Ingunn Feuerherz', 'female', '1614', '1645', 'house-feuerherz', { title: 'Erste Ehefrau Sturlaugrs' }),
    spouse('orka-riesentot', 'Orka Riesentot', 'female', '1630', '1704', 'house-riesentot', { title: 'Zweite Ehefrau Sturlaugrs' }),
    awayWoman('valdis-nachtjaeger', 'Valdís Nachtjäger', '1614', '1701', 'Clan Vragi'),
    spouse('hrafnkell-vragi', 'Hrafnkell Vragi', 'male', '1610', '1677', 'house-vragi'),
    person('joekull-nachtjaeger', 'Jökull Nachtjäger', 'male', '1617', '1670', { title: 'Hesir des Clans Nachtjäger' }),
    spouse('malfrid-kaltherz', 'Malfrid Kaltherz', 'female', '1620', '1671', 'house-kaltherz'),

    person('kjartan-nachtjaeger', 'Kjartan Nachtjäger', 'male', '1648', '1720', { title: 'Hesir des Clans Nachtjäger' }),
    spouse('gunnhildr', 'Gunnhildr', 'female', '1652', '1729'),
    awayWoman('svandis-nachtjaeger', 'Svandís Nachtjäger', '1651', '1711', 'unbekanntes Haus'),
    spouse('cuan', 'Cuán', 'male', '1650', '1703', 'house-unknown'),
    person('fjoelnir-nachtjaeger', 'Fjölnir Nachtjäger', 'male', '1652', '1675', { title: 'Hesir des Clans Nachtjäger' }),
    spouse('hjoerdis', 'Hjördis', 'female', '1652', '1703'),
    relationPartner('muirne', 'Muirne', '1656', '1713', 'forced', 'Opfer Fjölnirs · Mutter Ardals'),

    person('torvard-nachtjaeger', 'Torvard Nachtjäger', 'male', '1670', '', { title: 'Hesir des Clans Nachtjäger seit 1720' }),
    spouse('alva-varulv', 'Alva Varulv', 'female', '1672', '', 'house-varulv'),
    awayWoman('inghild-nachtjaeger', 'Inghild Nachtjäger', '1675', '1720', 'Clan Blár'),
    spouse('stiofan-blar', 'Stiofán Blár', 'male', '1672', '1720', 'house-nic-blar'),
    person('baldvin-nachtjaeger', 'Baldvin Nachtjäger', 'male', '1677', ''),
    spouse('hallbera', 'Hallbera', 'female', '1679', ''),
    person('styrmir-nachtjaeger', 'Styrmir Nachtjäger', 'male', '1672', '1687'),
    person('ardal-nachtjaeger', 'Ardal Nachtjäger', 'male', '1674', '', {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Fjölnirs und Muirnes',
      tags: ['Bastard']
    }),

    person('rognar-nachtjaeger', 'Rognar Nachtjäger', 'male', '1693', '', { title: 'Erster Erbe des Clans Nachtjäger' }),
    spouse('ran-skald', 'Ran Skald', 'female', '1695', '', 'house-skald', {
      title: 'Ehefrau Rognars · Adoptivmutter Jorics'
    }),
    relationPartner('vorna', 'Vorna', '1701', '', 'affair', 'Affäre Rognars · biologische Mutter Jorics', {
      notes: 'Vorna war zugleich als Küchenmeisterin am Hof von Horunn tätig.'
    }),
    awayWoman('estridd-nachtjaeger', 'Estridd Nachtjäger', '1699', '', 'Clan Freiwinter'),
    spouse('reidar-freiwinter', 'Reidar Freiwinter', 'male', '1698', '', 'house-freiwinter'),
    person('starkad-nachtjaeger', 'Starkad Nachtjäger', 'male', '1695', ''),
    spouse('oddrun-kampfgeborene', 'Oddrun Kampfgeborene', 'female', '1699', '', 'house-kampfgeborene'),
    awayWoman('gulda-nachtjaeger', 'Gulda Nachtjäger', '1697', '', 'Haus Dyngwn'),
    spouse('kynwas-dyngwn', "Kynwas Dyngwn O'Mathragon", 'male', '1694', '', 'house-dyngwn'),

    person('arnor-nachtjaeger', 'Arnór Nachtjäger', 'male', '1718', '', { title: 'Zweiter Erbe des Clans Nachtjäger' }),
    person('laufey-nachtjaeger', 'Laufey Nachtjäger', 'female', '1722', ''),
    person('joric-nachtjaeger', 'Joric Nachtjäger', 'male', '1718', '', {
      familyRole: 'adopted',
      title: 'Affärensohn Rognars · von Ran als Sohn angenommen',
      tags: ['Adoptiert', 'Affärenkind'],
      notes: 'Rognar gab den zeitgleich mit Arnór geborenen Joric gegenüber Ran als ihr zweites Kind aus. Biologisch ist Vorna seine Mutter; Ran nahm ihn als Sohn an.'
    }),
    person('vear-nachtjaeger', 'Véar Nachtjäger', 'male', '1725', ''),
    person('nanna-nachtjaeger', 'Nanna Nachtjäger', 'female', '1731', '')
  ],
  partnerships: [
    marriage('marriage-fannarr-ingeborg-varulv'),
    marriage('marriage-gunnar-bergljot-nachtjaeger'),
    marriage('marriage-ketill-gudrun-freiwinter'),
    marriage('marriage-vidarr-arnkatla-nachtjaeger'),
    marriage('marriage-asthildr-ulfgar-nachtjaeger'),
    alignPartnerOverChildren(marriage('marriage-sturlaugr-ingunn-nachtjaeger'), 'ingunn-1614-feuerherz'),
    marriage('marriage-sturlaugr-orka-nachtjaeger'),
    marriage('marriage-valdis-hrafnkell-nachtjaeger'),
    marriage('marriage-joekull-malfrid-nachtjaeger'),
    marriage('marriage-kjartan-gunnhildr-nachtjaeger'),
    marriage('marriage-svandis-cuan-nachtjaeger'),
    alignPartnerOverChildren(marriage('marriage-fjoelnir-hjoerdis-nachtjaeger'), 'hjoerdis'),
    alignPartnerOverChildren(marriage('forced-fjoelnir-muirne-nachtjaeger', {
      type: 'forced',
      status: 'ended',
      end: '1675',
      visibility: 'private',
      notes: 'Die Quelle bezeichnet Muirne ausdrücklich als Fjölnirs Opfer und nicht als freiwillige Affäre.'
    }), 'muirne'),
    marriage('marriage-alva-torvard-varulv'),
    marriage('marriage-inghild-stiofan-nachtjaeger'),
    marriage('marriage-baldvin-hallbera-nachtjaeger'),
    alignPartnerOverChildren(marriage('marriage-rognar-ran-nachtjaeger'), 'ran-skald'),
    alignPartnerOverChildren(marriage('affair-rognar-vorna-nachtjaeger', {
      type: 'affair',
      status: 'ended',
      visibility: 'private',
      notes: 'Joric entstammt dieser Affäre. Ran war zur gleichen Zeit mit Arnór schwanger.'
    }), 'vorna'),
    marriage('marriage-reidar-estridd-freiwinter'),
    marriage('marriage-starkad-oddrun-nachtjaeger'),
    marriage('marriage-gulda-kynwas-nachtjaeger')
  ],
  parentages: [
    ...claimedChildren(['gunnar-nachtjaeger', 'gudrun-nachtjaeger'], 'marriage-fannarr-ingeborg-varulv'),
    ...childrenOf(['vidarr-nachtjaeger', 'asthildr-nachtjaeger'], 'marriage-gunnar-bergljot-nachtjaeger'),
    ...childrenOf(['sturlaugr-nachtjaeger', 'valdis-nachtjaeger', 'joekull-nachtjaeger'], 'marriage-vidarr-arnkatla-nachtjaeger'),
    ...childrenOf(['kjartan-nachtjaeger', 'svandis-nachtjaeger'], 'marriage-sturlaugr-ingunn-nachtjaeger'),
    ...childrenOf(['fjoelnir-nachtjaeger'], 'marriage-joekull-malfrid-nachtjaeger'),
    ...childrenOf(['torvard-nachtjaeger', 'inghild-nachtjaeger', 'baldvin-nachtjaeger'], 'marriage-kjartan-gunnhildr-nachtjaeger'),
    ...childrenOf(['styrmir-nachtjaeger'], 'marriage-fjoelnir-hjoerdis-nachtjaeger'),
    ...childrenOf(['ardal-nachtjaeger'], 'forced-fjoelnir-muirne-nachtjaeger', {
      legitimacy: 'illegitimate',
      notes: 'Ardal ist ausschließlich das Kind der erzwungenen Verbindung Fjölnirs mit Muirne.'
    }),
    ...childrenOf(['rognar-nachtjaeger', 'estridd-nachtjaeger', 'starkad-nachtjaeger'], 'marriage-alva-torvard-varulv'),
    ...childrenOf(['gulda-nachtjaeger'], 'marriage-baldvin-hallbera-nachtjaeger'),
    ...childrenOf(['arnor-nachtjaeger', 'laufey-nachtjaeger'], 'marriage-rognar-ran-nachtjaeger'),
    ...childrenOf(['joric-nachtjaeger'], 'affair-rognar-vorna-nachtjaeger', {
      legitimacy: 'illegitimate',
      notes: 'Biologische Abstammung Jorics: Rognar Nachtjäger und Vorna.'
    }),
    ...createParentages(['joric-nachtjaeger'], ['ran-skald'], '', {
      idPrefix: 'nachtjaeger-adoption',
      type: 'adoptive',
      legitimacy: 'unknown',
      notes: 'Ran nahm Joric als vermeintlich eigenes zweites Kind an; Rognar ist bereits als biologischer Vater erfasst.'
    }),
    ...childrenOf(['vear-nachtjaeger', 'nanna-nachtjaeger'], 'marriage-starkad-oddrun-nachtjaeger')
  ],
  cadetBranches: [
    marriedAway('married-away-gudrun-nachtjaeger-freiwinter', 'Clan Freiwinter', 'marriage-ketill-gudrun-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-asthildr-nachtjaeger-schattenherz', 'Clan Schattenherz', 'marriage-asthildr-ulfgar-nachtjaeger', 'house-schattenherz', 'haus-schattenherz'),
    marriedAway('married-away-valdis-nachtjaeger-vragi', 'Clan Vragi', 'marriage-valdis-hrafnkell-nachtjaeger', 'house-vragi', 'haus-vragi'),
    marriedAway('married-away-svandis-nachtjaeger-unknown', 'unbekanntes Haus', 'marriage-svandis-cuan-nachtjaeger', 'house-unknown', 'haus-unbekannt'),
    marriedAway('married-away-inghild-nachtjaeger-blar', 'Nic’Blar in Leitheach', 'marriage-inghild-stiofan-nachtjaeger', 'house-nic-blar', 'haus-nic-blar-leitheach', 'assets/images/houses/Ceitheach/clan-nic-blar.png'),
    marriedAway('married-away-estridd-nachtjaeger-freiwinter', 'Clan Freiwinter', 'marriage-reidar-estridd-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-gulda-nachtjaeger-dyngwn', 'Haus Dyngwn', 'marriage-gulda-kynwas-nachtjaeger', 'house-dyngwn', 'haus-dyngwn')
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-fannarr-ingeborg-varulv',
      parentPersonId: '',
      childIds: ['gunnar-nachtjaeger', 'gudrun-nachtjaeger'],
      years: 232,
      fromYear: '1335',
      toYear: '1567',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner: Der Zeitsprung folgt nach dem Hauswappen und steht niemals parallel zu einer anderen Fortsetzung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fannarr-ingeborg-varulv',
    houseId: NACHTJAEGER_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Horunn · Kadettenclan der Varulv',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fannarr-varulv',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: 'Clan Nachtjäger (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Genealogie folgt der bereitgestellten Nachtjäger-Hausseite. Fannarr Varulv und Ingeborg Brathfengr stehen als Gründer vor dem Nachtjäger-Wappen; ein serieller Zeitsprung führt danach zu Gunnar und Gudrun. Ehen von Nachtjäger-Frauen erhalten direkte Wegverheiratet-Knoten und werden in der Zielakte nicht mit Kindern gedoppelt. Joric ist biologisch das uneheliche Kind aus Rognars Affäre mit Vorna, zugleich aber als von Ran angenommener Sohn mit Adoptivrahmen geführt. Die Affärenlinie bleibt sichtbar und eindeutig über Joric ausgerichtet. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
