import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BRATHFENGR_PORTRAITS } from './house-brathfengr-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const BRATHFENGR_HOUSE_ID = 'house-brathfengr';
const FOUNDER_TIME_JUMP_ID = 'gap-kvasir-tryggvar-brathfengr';
const TRYGGVAR_TIME_JUMP_ID = 'gap-tryggvar-bjarn-brathfengr';

const HOUSE_EMBLEMS = Object.freeze({
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  illysywen: 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png',
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
  'kvasir-founder-brathfengr',
  'tryggvar-brathfengr',
  'bjarn-brathfengr',
  'ingjald-brathfengr',
  'sigurd-brathfengr',
  'halstein-brathfengr',
  'skjold-brathfengr',
  'munthor-brathfengr'
]);

const MAINLINE_IDS = new Set([
  'vorna-brathfengr',
  'kvasir-1730-brathfengr',
  'valir-brathfengr'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? BRATHFENGR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_BRATHFENGR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === BRATHFENGR_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['kvasir-founder-brathfengr', 'gefjon-skald'],
  isbjorg: ['isbjorg-brathfengr', 'ragnfred-sterkr'],
  tryggvar: ['tryggvar-brathfengr', 'saoirse-morath'],
  ingeborg: ['fannarr-varulv', 'ingeborg-brathfengr'],
  bjarn: ['bjarn-brathfengr', 'ingibjorg-blutklinge'],
  steinunn: ['steinunn-brathfengr', 'thaldric-skaife'],
  ingjald: ['ingjald-brathfengr', 'skeggjadis-hrymgardr'],
  bergljot: ['gunnar-nachtjaeger', 'bergljot-brathfengr'],
  dagni: ['erling-varulv', 'dagni-brathfengr'],
  sigurd: ['sigurd-brathfengr', 'torgunna-todbrand'],
  svanhild: ['hakon-skjegg', 'svanhild-brathfengr'],
  halstein: ['hildigunn-freiwinter', 'halstein-brathfengr'],
  isbjalla1614: ['isbjalla-1614-brathfengr', 'hvitserk-soekeren'],
  asahel: ['asahel-brathfengr', 'ingthor-varangr'],
  skjold: ['skjold-brathfengr', 'fridgerd-skaal'],
  munthor: ['munthor-brathfengr', 'glodis-skald'],
  ylfrun: ['halstein-kampfgeborene', 'ylfrun-brathfengr'],
  irnskar: ['merlion-ceirwyn', 'irnskar-brathfengr'],
  vorna: ['gunhild-varulv', 'vorna-brathfengr'],
  dagny: ['nodawl-illysywen', 'dagny-brathfengr'],
  isbjalla1696: ['isbjalla-1696-brathfengr', 'rognvaldr-sterkr'],
  hildigunn: ['hoskuld-schwarzdorn', 'hildigunn-brathfengr'],
  dagrun: ['dagrun-brathfengr', 'balrun-soekeren']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-kvasir-gefjon-brathfengr': COUPLES.founders,
  'marriage-isbjorg-ragnfred-brathfengr': COUPLES.isbjorg,
  'marriage-tryggvar-saoirse-brathfengr': COUPLES.tryggvar,
  'marriage-fannarr-ingeborg-varulv': COUPLES.ingeborg,
  'marriage-bjarn-ingibjorg-brathfengr': COUPLES.bjarn,
  'marriage-steinunn-thaldric-brathfengr': COUPLES.steinunn,
  'marriage-ingjald-skeggjadis-brathfengr': COUPLES.ingjald,
  'marriage-gunnar-bergljot-nachtjaeger': COUPLES.bergljot,
  'marriage-erling-dagni-varulv': COUPLES.dagni,
  'marriage-sigurd-torgunna-brathfengr': COUPLES.sigurd,
  'marriage-hakon-svanhild-skjegg': COUPLES.svanhild,
  'marriage-hildigunn-halstein-freiwinter': COUPLES.halstein,
  'marriage-isbjalla-hvitserk-brathfengr': COUPLES.isbjalla1614,
  'marriage-asahel-ingthor-brathfengr': COUPLES.asahel,
  'marriage-skjold-fridgerd-brathfengr': COUPLES.skjold,
  'marriage-munthor-glodis-brathfengr': COUPLES.munthor,
  'marriage-halstein-ylfrun-kampfgeborene': COUPLES.ylfrun,
  'marriage-merlion-irnskar-ceirwyn': COUPLES.irnskar,
  'marriage-gunhild-vorna-varulv': COUPLES.vorna,
  'marriage-nodawl-dagny': COUPLES.dagny,
  'marriage-isbjalla-rognvaldr-brathfengr': COUPLES.isbjalla1696,
  'marriage-hoskuld-hildigunn-schwarzdorn': COUPLES.hildigunn,
  'marriage-dagrun-balrun-brathfengr': COUPLES.dagrun
});

const PARTNERSHIP_OPTIONS = Object.freeze({
  'marriage-hakon-svanhild-skjegg': Object.freeze({ status: 'ended', end: '1653' }),
  'marriage-skjold-fridgerd-brathfengr': Object.freeze({ status: 'ended', end: '1706' }),
  'marriage-halstein-ylfrun-kampfgeborene': Object.freeze({ status: 'ended', end: '1702' })
});

function marriage(partnershipId) {
  return createMarriage(
    partnershipId,
    ...PARTNERS_BY_ID[partnershipId],
    PARTNERSHIP_OPTIONS[partnershipId] || {}
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'brathfengr-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId, notes) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes,
    extensions: { timeJumpId }
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

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear, label) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label,
    notes: 'Absoluter serieller Generationentrenner: Dieser Zeitsprung steht niemals parallel zu Personen oder anderen Knoten.',
    extensions: {}
  };
}

export const HOUSE_BRATHFENGR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-brathfengr',
    title: 'Clan Brathfengr',
    motto: '',
    description: 'Thanenclan von Klangheim im Thanentum Skaldenheim. Die Brathfengr führen ihre Gründung auf Kvasir den Trommler und Gefjon Skald zurück.',
    emblem: HOUSE_EMBLEMS.brathfengr,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.brathfengr
  },
  houses: [
    house(BRATHFENGR_HOUSE_ID, 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-morath', 'Clan Morath'),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-blutklinge', 'Clan Blutklinge'),
    house('house-skaife', 'Clan Skaife'),
    house('house-hrymgardr', 'Clan Hrymgarðr'),
    house('house-todbrand', 'Clan Todbrand'),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-illysywen', 'Haus Illysywen', HOUSE_EMBLEMS.illysywen),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn)
  ],
  persons: [
    person('kvasir-founder-brathfengr', 'Kvasir der Trommler', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer und erster Thane des Clans Brathfengr',
      tags: ['Gründer', 'Thane']
    }),
    spouse('gefjon-skald', 'Gefjon Skald', 'female', '????', '????', 'house-skald'),

    awayWoman('isbjorg-brathfengr', 'Isbjörg Brathfengr', '1265', '1361', 'Clan Sterkr'),
    spouse('ragnfred-sterkr', 'Ragnfred Sterkr', 'male', '1258', '1365', 'house-sterkr'),
    person('tryggvar-brathfengr', 'Tryggvar Brathfengr', 'male', '1263', '1391', {
      title: 'Thane des Clans Brathfengr'
    }),
    spouse('saoirse-morath', 'Saoirse Morath', 'female', '1265', '1311', 'house-morath'),
    awayWoman('ingeborg-brathfengr', 'Ingeborg Brathfengr', '1264', '1361', 'Clan Nachtjäger', {
      title: 'Mitbegründerin des Clans Nachtjäger · Wegverheiratet an Clan Nachtjäger',
      tags: ['Kadettengründerin']
    }),
    spouse('fannarr-varulv', 'Fannarr Varulv', 'male', '1259', '1335', 'house-varulv', {
      title: 'Begründer des Clans Nachtjäger',
      tags: ['Kadettengründer']
    }),

    person('bjarn-brathfengr', 'Bjarn Brathfengr', 'male', '1547', '1663', {
      title: 'Thane des Clans Brathfengr'
    }),
    spouse('ingibjorg-blutklinge', 'Ingibjörg Blutklinge', 'female', '1547', '1619', 'house-blutklinge'),
    awayWoman('steinunn-brathfengr', 'Steinunn Brathfengr', '1555', '????', 'Clan Skaife'),
    spouse('thaldric-skaife', 'Thaldric Skaife', 'male', '1557', '1640', 'house-skaife'),

    person('ingjald-brathfengr', 'Ingjald Brathfengr', 'male', '1563', '1665', {
      title: 'Thane des Clans Brathfengr 1663–1665'
    }),
    spouse('skeggjadis-hrymgardr', 'Skeggjadís Hrymgarðr', 'female', '1563', '1661', 'house-hrymgardr'),
    person('valir-brathfengr', 'Valir Brathfengr', 'male', '1566', '', {
      status: 'unknown',
      title: 'Dritter Erbe des Clans Brathfengr',
      notes: 'Die Quelle nennt trotz des Geburtsjahres 1566 weder Todesjahr noch Todeszeichen. Der Status bleibt deshalb ausdrücklich ungeklärt.'
    }),
    awayWoman('bergljot-brathfengr', 'Bergljót Brathfengr', '1567', '1656', 'Clan Nachtjäger'),
    spouse('gunnar-nachtjaeger', 'Gunnar Nachtjäger', 'male', '1567', '1621', 'house-nachtjaeger'),

    awayWoman('dagni-brathfengr', 'Dagni Brathfengr', '1579', '1654', 'Clan Varulv'),
    spouse('erling-varulv', 'Erling Varulv', 'male', '1577', '1625', 'house-varulv'),
    person('sigurd-brathfengr', 'Sigurd Brathfengr', 'male', '1582', '1686', {
      title: 'Thane des Clans Brathfengr 1665–1686'
    }),
    spouse('torgunna-todbrand', 'Torgunna Todbrand', 'female', '1582', '1651', 'house-todbrand'),
    awayWoman('svanhild-brathfengr', 'Svanhild Brathfengr', '1583', '1668', 'Clan Skjegg'),
    spouse('hakon-skjegg', 'Hakon Skjegg', 'male', '1582', '1653', 'house-skjegg'),

    person('halstein-brathfengr', 'Halstein Brathfengr', 'male', '1600', '1698', {
      title: 'Thane des Clans Brathfengr 1686–1698'
    }),
    spouse('hildigunn-freiwinter', 'Hildigunn Freiwinter', 'female', '1603', '1671', 'house-freiwinter'),
    awayWoman('isbjalla-1614-brathfengr', 'Ísbjalla Brathfengr', '1614', '1703', 'Clan Sökeren'),
    spouse('hvitserk-soekeren', 'Hvitserk Sökeren', 'male', '1614', '1716', 'house-soekeren'),

    awayWoman('asahel-brathfengr', 'Ásahel Brathfengr', '1627', '1700', 'Clan Varangr'),
    spouse('ingthor-varangr', 'Ingthor Varangr', 'male', '1626', '1694', 'house-varangr'),
    person('skjold-brathfengr', 'Skjold Brathfengr', 'male', '1631', '1715', {
      title: 'Thane des Clans Brathfengr 1698–1715'
    }),
    spouse('fridgerd-skaal', 'Fridgerd Skaal', 'female', '1633', '1706', 'house-skaal'),

    person('munthor-brathfengr', 'Munthor Brathfengr', 'male', '1653', '', {
      title: 'Thane des Clans Brathfengr seit 1715'
    }),
    spouse('glodis-skald', 'Glódís Skald', 'female', '1655', '', 'house-skald'),
    awayWoman('ylfrun-brathfengr', 'Ylfrun Brathfengr', '1649', '1740', 'Clan Kampfgeborene'),
    spouse('halstein-kampfgeborene', 'Halstein Kampfgeborener', 'male', '1649', '1702', 'house-kampfgeborene'),

    awayWoman('irnskar-brathfengr', 'Irnskar Brathfengr', '1674', '', 'Haus Ceirwyn'),
    spouse('merlion-ceirwyn', 'Merlion Ceirwyn', 'male', '1669', '', 'house-ceirwyn'),
    person('vorna-brathfengr', 'Vorna Brathfengr', 'male', '1678', '', {
      title: 'Erster Erbe des Clans Brathfengr'
    }),
    spouse('gunhild-varulv', 'Gunhild Varulv', 'female', '1680', '', 'house-varulv'),
    awayWoman('dagny-brathfengr', 'Dagny Brathfengr', '1684', '', 'Haus Illysywen'),
    spouse('nodawl-illysywen', "Nodawl Illysywen O'Castellbryn", 'male', '1682', '1720', 'house-illysywen'),

    awayWoman('isbjalla-1696-brathfengr', 'Ísbjalla Brathfengr', '1696', '', 'Clan Sterkr'),
    spouse('rognvaldr-sterkr', 'Rognvaldr Sterkr', 'male', '1694', '', 'house-sterkr'),
    awayWoman('hildigunn-brathfengr', 'Hildigunn Brathfengr', '1698', '', 'Clan Schwarzdorn'),
    spouse('hoskuld-schwarzdorn', 'Hoskuld Schwarzdorn', 'male', '1696', '', 'house-schwarzdorn'),
    awayWoman('dagrun-brathfengr', 'Dágrun Brathfengr', '1699', '', 'Clan Sökeren'),
    spouse('balrun-soekeren', 'Balrun Sökeren', 'male', '1695', '', 'house-soekeren'),
    person('lova-brathfengr', 'Lova Brathfengr', 'female', '1705', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('hallbera-brathfengr', 'Hallbera Brathfengr', 'female', '1709', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('solja-brathfengr', 'Solja Brathfengr', 'female', '1714', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('asta-brathfengr', 'Asta Brathfengr', 'female', '1717', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('blenda-brathfengr', 'Blenda Brathfengr', 'female', '1721', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('inga-brathfengr', 'Inga Brathfengr', 'female', '1725', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('kvasir-1730-brathfengr', 'Kvasir Brathfengr', 'male', '1730', '', {
      title: 'Zweiter Erbe des Clans Brathfengr'
    })
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(marriage),
  parentages: [
    ...claimedChildren(
      ['isbjorg-brathfengr', 'tryggvar-brathfengr', 'ingeborg-brathfengr'],
      'marriage-kvasir-gefjon-brathfengr',
      FOUNDER_TIME_JUMP_ID,
      'Die Quelle überspringt zwischen dem Gründerpaar und diesen drei Geschwistern mehrere nicht einzeln überlieferte Generationen.'
    ),
    ...claimedChildren(
      ['bjarn-brathfengr', 'steinunn-brathfengr'],
      'marriage-tryggvar-saoirse-brathfengr',
      TRYGGVAR_TIME_JUMP_ID,
      'Die Quelle überspringt zwischen Tryggvar und Bjarn beziehungsweise Steinunn mehrere nicht einzeln überlieferte Generationen.'
    ),
    ...childrenOf(['ingjald-brathfengr', 'valir-brathfengr', 'bergljot-brathfengr'], 'marriage-bjarn-ingibjorg-brathfengr'),
    ...childrenOf(['dagni-brathfengr', 'sigurd-brathfengr', 'svanhild-brathfengr'], 'marriage-ingjald-skeggjadis-brathfengr'),
    ...childrenOf(['halstein-brathfengr', 'isbjalla-1614-brathfengr'], 'marriage-sigurd-torgunna-brathfengr'),
    ...childrenOf(['asahel-brathfengr', 'skjold-brathfengr'], 'marriage-hildigunn-halstein-freiwinter'),
    ...childrenOf(['munthor-brathfengr', 'ylfrun-brathfengr'], 'marriage-skjold-fridgerd-brathfengr'),
    ...childrenOf(['irnskar-brathfengr', 'vorna-brathfengr', 'dagny-brathfengr'], 'marriage-munthor-glodis-brathfengr'),
    ...childrenOf([
      'isbjalla-1696-brathfengr',
      'hildigunn-brathfengr',
      'dagrun-brathfengr',
      'lova-brathfengr',
      'hallbera-brathfengr',
      'solja-brathfengr',
      'asta-brathfengr',
      'blenda-brathfengr',
      'inga-brathfengr',
      'kvasir-1730-brathfengr'
    ], 'marriage-gunhild-vorna-varulv')
  ],
  cadetBranches: [
    marriedAway('married-away-isbjorg-brathfengr-sterkr', 'Clan Sterkr', 'marriage-isbjorg-ragnfred-brathfengr', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-ingeborg-brathfengr-nachtjaeger', 'Clan Nachtjäger', 'marriage-fannarr-ingeborg-varulv', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-steinunn-brathfengr-skaife', 'Clan Skaife', 'marriage-steinunn-thaldric-brathfengr', 'house-skaife', 'haus-skaife'),
    marriedAway('married-away-bergljot-brathfengr-nachtjaeger', 'Clan Nachtjäger', 'marriage-gunnar-bergljot-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-dagni-brathfengr-varulv', 'Clan Varulv', 'marriage-erling-dagni-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-svanhild-brathfengr-skjegg', 'Clan Skjegg', 'marriage-hakon-svanhild-skjegg', 'house-skjegg', 'haus-skjegg', HOUSE_EMBLEMS.skjegg),
    marriedAway('married-away-isbjalla-1614-brathfengr-soekeren', 'Clan Sökeren', 'marriage-isbjalla-hvitserk-brathfengr', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren),
    marriedAway('married-away-asahel-brathfengr-varangr', 'Clan Varangr', 'marriage-asahel-ingthor-brathfengr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-ylfrun-brathfengr-kampfgeborene', 'Clan Kampfgeborene', 'marriage-halstein-ylfrun-kampfgeborene', 'house-kampfgeborene', 'haus-kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    marriedAway('married-away-irnskar-brathfengr-ceirwyn', 'Haus Ceirwyn', 'marriage-merlion-irnskar-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-dagny-brathfengr-illysywen', 'Haus Illysywen', 'marriage-nodawl-dagny', 'house-illysywen', 'haus-illysywen', HOUSE_EMBLEMS.illysywen),
    marriedAway('married-away-isbjalla-1696-brathfengr-sterkr', 'Clan Sterkr', 'marriage-isbjalla-rognvaldr-brathfengr', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-hildigunn-brathfengr-schwarzdorn', 'Clan Schwarzdorn', 'marriage-hoskuld-hildigunn-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-dagrun-brathfengr-soekeren', 'Clan Sökeren', 'marriage-dagrun-balrun-brathfengr', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren)
  ],
  timeJumps: [
    timeJump(
      FOUNDER_TIME_JUMP_ID,
      'marriage-kvasir-gefjon-brathfengr',
      ['isbjorg-brathfengr', 'tryggvar-brathfengr', 'ingeborg-brathfengr'],
      '????',
      '1263',
      'Nicht einzeln überlieferte Generationen'
    ),
    timeJump(
      TRYGGVAR_TIME_JUMP_ID,
      'marriage-tryggvar-saoirse-brathfengr',
      ['bjarn-brathfengr', 'steinunn-brathfengr'],
      '1391',
      '1547',
      'Nicht einzeln überlieferte Generationen'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-kvasir-gefjon-brathfengr',
    houseId: BRATHFENGR_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Klangheim · Vasallen der Varulv',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kvasir-founder-brathfengr',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: 'Clan Brathfengr (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Akte übernimmt alle im Quellstammbaum belegten Personen und Ehen. Nach dem Gründerpaar folgt zuerst das Hauswappen und anschließend ein absolut serieller Zeitsprung zu Isbjörg, Tryggvar und Ingeborg. Ein zweiter absolut serieller Zeitsprung führt ausschließlich unter Tryggvar und Saoirse zu Bjarn und Steinunn. Die Kinder anderer Häuser werden nicht doppelt fortgeführt; gemeinsam vorkommende Personen und Partnerschaften verwenden dieselben Register-IDs wie ihre Gegenakten. Alle vierzehn belegten auswärtigen Ehen von Brathfengr-Frauen besitzen direkte Wegverheiratet-Knoten. Für Valir nennt die Quelle trotz des Geburtsjahres 1566 kein Todeszeichen; der Status bleibt ungeklärt. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
