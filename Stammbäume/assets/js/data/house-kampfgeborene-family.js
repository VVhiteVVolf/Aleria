import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createSingleFounderHouseBranch
} from './family-record-builders.js';
import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const KAMPFGEBORENE_HOUSE_ID = 'house-kampfgeborene';
const FOUNDER_TIME_JUMP_ID = 'gap-fridthjof-bujold-kampfgeborene';

const HOUSE_EMBLEMS = Object.freeze({
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  frostgeborene: RORIKSHEIM_HOUSE_EMBLEMS.frostgeborene,
  varulv: RORIKSHEIM_HOUSE_EMBLEMS.varulv,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole',
  'lineageRole', 'tags', 'notes'
]);

const HEAD_IDS = new Set([
  'fridthjof-kampfgeborene',
  'bujold-kampfgeborene',
  'aegir-kampfgeborene',
  'alrek-kampfgeborene',
  'halstein-kampfgeborene',
  'valeric-kampfgeborene',
  'lars-kampfgeborene'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return personId === 'jorund-kampfgeborene' ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? KAMPFGEBORENE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_KAMPFGEBORENE_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === KAMPFGEBORENE_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['fridthjof-kampfgeborene', 'finnhild'],
  bujold: ['bujold-kampfgeborene', 'eithne-drummond'],
  linnea: ['padrig-oglivy', 'linnea-kampfgeborene'],
  ottnar: ['ottnar-kampfgeborene', 'helga-skaal'],
  hjolm: ['herdis-varulv', 'hjolm-kampfgeborene'],
  aegir: ['aegir-kampfgeborene', 'hallgerd-soekeren'],
  ulrikka: ['tadgh-seaghdha', 'ulrikka-kampfgeborene'],
  valdemar: ['valdemar-kampfgeborene', 'gertrud'],
  alrek: ['alrek-kampfgeborene', 'vorga-schwarzdorn'],
  thorhild: ['vormund-schwarzdorn', 'thorhild-kampfgeborene'],
  jokulHilda: ['jokul-kampfgeborene', 'hilda'],
  halstein: ['halstein-kampfgeborene', 'ylfrun-brathfengr'],
  ljosdis: ['valdemar-skjegg', 'ljosdis-kampfgeborene'],
  tordis: ['aonghas-craobhan', 'tordis-kampfgeborene'],
  bodvar: ['bodvar-kampfgeborene', 'disa'],
  valeric: ['valeric-kampfgeborene', 'ana-goldglanz'],
  rekka: ['sigfast-varulv', 'rekka-kampfgeborene'],
  hulda: ['ulfrik-schattenherz', 'hulda-kampfgeborene'],
  asbjorn: ['asbjorn-kampfgeborene', 'ethna-eldath'],
  lars: ['lars-kampfgeborene', 'morga'],
  jon: ['jon-kampfgeborene', 'hella'],
  jonMorga: ['jon-kampfgeborene', 'morga'],
  wiglaff: ['wiglaff-kampfgeborene', 'vigdis'],
  hjalmar: ['hjalmar-kampfgeborene', 'alvilda'],
  oddrun: ['starkad-nachtjaeger', 'oddrun-kampfgeborene']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-fridthjof-finnhild-kampfgeborene': COUPLES.founders,
  'marriage-bujold-eithne-kampfgeborene': COUPLES.bujold,
  'marriage-padrig-linnea-kampfgeborene': COUPLES.linnea,
  'marriage-ottnar-helga-kampfgeborene': COUPLES.ottnar,
  'marriage-herdis-hjolm-varulv': COUPLES.hjolm,
  'marriage-aegir-hallgerd-kampfgeborene': COUPLES.aegir,
  'marriage-tadgh-ulrikka-kampfgeborene': COUPLES.ulrikka,
  'marriage-valdemar-gertrud-kampfgeborene': COUPLES.valdemar,
  'marriage-alrek-vorga-schwarzdorn': COUPLES.alrek,
  'marriage-vormund-thorhild-schwarzdorn': COUPLES.thorhild,
  'affair-jokul-hilda-kampfgeborene': COUPLES.jokulHilda,
  'marriage-halstein-ylfrun-kampfgeborene': COUPLES.halstein,
  'marriage-valdemar-ljosdis-kampfgeborene': COUPLES.ljosdis,
  'marriage-aonghas-tordis-kampfgeborene': COUPLES.tordis,
  'marriage-bodvar-disa-kampfgeborene': COUPLES.bodvar,
  'marriage-valeric-ana-kampfgeborene': COUPLES.valeric,
  'marriage-sigfast-rekka-varulv': COUPLES.rekka,
  'marriage-ulfrik-hulda-kampfgeborene': COUPLES.hulda,
  'marriage-asbjorn-ethna-kampfgeborene': COUPLES.asbjorn,
  'marriage-lars-morga-kampfgeborene': COUPLES.lars,
  'marriage-jon-hella-kampfgeborene': COUPLES.jon,
  'affair-jon-morga-kampfgeborene': COUPLES.jonMorga,
  'marriage-wiglaff-vigdis-kampfgeborene': COUPLES.wiglaff,
  'marriage-hjalmar-alvilda-kampfgeborene': COUPLES.hjalmar,
  'marriage-starkad-oddrun-nachtjaeger': COUPLES.oddrun
});

function marriage(partnershipId, options = {}) {
  const registryManagedExtensionFields = new Set([
    ...(options.extensions?.registryManagedExtensionFields || []),
    'chartAlignPartnerOverChildrenPersonId'
  ]);
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], {
    ...options,
    extensions: {
      ...(options.extensions || {}),
      registryManagedExtensionFields: [...registryManagedExtensionFields]
    }
  });
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
    idPrefix: options.idPrefix || 'kampfgeborene-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Zwischen dem Gründerpaar und Bujold sowie Linnea sind mehrere Generationen nicht einzeln überliefert.',
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

export const HOUSE_KAMPFGEBORENE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-kampfgeborene',
    title: 'Clan Kampfgeborene',
    motto: '',
    description: 'Hesire-Clan von Rorikshall, Vasall der Varulv und Ursprung des bürgerlichen Bastardhauses Frostgeborene.',
    emblem: HOUSE_EMBLEMS.kampfgeborene,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.kampfgeborene
  },
  houses: [
    house(KAMPFGEBORENE_HOUSE_ID, 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-frostgeborene', 'Haus Frostgeborene', HOUSE_EMBLEMS.frostgeborene),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-drummond', 'Clan Drummond'),
    house('house-oglivy', 'Clan Oglivy'),
    house('house-seaghdha', 'Clan Séaghdha'),
    house('house-craobhan', 'Clan Craobhan'),
    house('house-goldglanz', 'Clan Goldglanz'),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-eldath', 'Clan Eldath')
  ],
  persons: [
    person('fridthjof-kampfgeborene', 'Fridthjof Kampfgeborener', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer des Clans Kampfgeborene'
    }),
    spouse('finnhild', 'Finnhild', 'female', '????', '????'),

    person('bujold-kampfgeborene', 'Bujold Kampfgeborener', 'male', '1556', '1648', { title: 'Hesir des Clans Kampfgeborene' }),
    awayWoman('linnea-kampfgeborene', 'Linnea Kampfgeborene', '1560', '1623', 'Clan Oglivy'),
    spouse('eithne-drummond', 'Eithne Drummond', 'female', '1559', '1630', 'house-drummond'),
    spouse('padrig-oglivy', 'Padrig Oglivy', 'male', '1559', '1637', 'house-oglivy'),

    person('ottnar-kampfgeborene', 'Ottnar Kampfgeborener', 'male', '1577', '1626', {
      notes: 'Die Quelle nennt als Todesjahr 1526; im Generationszusammenhang ist 1626 die eindeutige Jahrhundertkorrektur.'
    }),
    person('jofrid-kampfgeborene', 'Jofrid Kampfgeborene', 'female', '1583', '1601'),
    person('hjolm-kampfgeborene', 'Hjolm Kampfgeborener', 'male', '1579', '1629'),
    spouse('helga-skaal', 'Helga Skaal', 'female', '1580', '1630', 'house-skaal'),
    spouse('herdis-varulv', 'Herdis Varulv', 'female', '1579', '1627', 'house-varulv'),

    person('aegir-kampfgeborene', 'Aegir Kampfgeborener', 'male', '1599', '1632', { title: 'Hesir des Clans Kampfgeborene' }),
    awayWoman('ulrikka-kampfgeborene', 'Ulrikka Kampfgeborene', '1603', '1677', 'Clan Séaghdha'),
    person('valdemar-kampfgeborene', 'Valdemar Kampfgeborener', 'male', '1605', '1659'),
    spouse('hallgerd-soekeren', 'Hallgerd Sökeren', 'female', '1600', '1698', 'house-soekeren'),
    spouse('tadgh-seaghdha', 'Tadgh Séaghdha', 'male', '1600', '1654', 'house-seaghdha'),
    spouse('gertrud', 'Gertrud', 'female', '1607', '1650'),

    person('alrek-kampfgeborene', 'Alrek Kampfgeborener', 'male', '1618', '1674', { title: 'Hesir des Clans Kampfgeborene' }),
    awayWoman('thorhild-kampfgeborene', 'Thorhild Kampfgeborene', '1621', '1689', 'Clan Schwarzdorn'),
    person('ulfrik-kampfgeborene', 'Ulfrik Kampfgeborener', 'male', '1624', '1640'),
    person('jokul-kampfgeborene', 'Jokul Kampfgeborener', 'male', '1627', '1645'),
    spouse('vorga-schwarzdorn', 'Vorga Schwarzdorn', 'female', '1621', '1686', 'house-schwarzdorn'),
    spouse('vormund-schwarzdorn', 'Vormund Schwarzdorn', 'male', '1617', '1690', 'house-schwarzdorn'),
    spouse('hilda', 'Hilda', 'female', '1628', '1646', '', {
      familyRole: 'affair',
      title: 'Affäre Jokuls · Mutter Thorims'
    }),

    person('halstein-kampfgeborene', 'Halstein Kampfgeborener', 'male', '1649', '1702', { title: 'Hesir des Clans Kampfgeborene' }),
    awayWoman('ljosdis-kampfgeborene', 'Ljosdis Kampfgeborene', '1651', '1739', 'Clan Skjegg'),
    awayWoman('tordis-kampfgeborene', 'Tordis Kampfgeborene', '1651', '1720', 'Clan Craobhan'),
    person('bodvar-kampfgeborene', 'Bodvar Kampfgeborener', 'male', '1653', '1720'),
    person('thorim-frostgeborene', 'Thorim der Bastard', 'male', '1646', '1705', {
      familyRole: 'bastard',
      title: 'Jokuls Bastard · Gründer des bürgerlichen Hauses Frostgeborene',
      tags: ['Bastard', 'Hausgründer']
    }),
    spouse('ylfrun-brathfengr', 'Ylfrun Brathfengr', 'female', '1649', '1740', 'house-brathfengr'),
    spouse('valdemar-skjegg', 'Valdemar Skjegg', 'male', '1648', '1739', 'house-skjegg'),
    spouse('aonghas-craobhan', 'Aonghas Craobhan', 'male', '1650', '1720', 'house-craobhan'),
    spouse('disa', 'Disa', 'female', '1653', '1736'),

    person('valeric-kampfgeborene', 'Valeric Kampfgeborener', 'male', '1667', '1714', { title: 'Hesir des Clans Kampfgeborene' }),
    awayWoman('rekka-kampfgeborene', 'Rekka Kampfgeborene', '1674', '', 'Clan Varulv'),
    awayWoman('hulda-kampfgeborene', 'Hulda Kampfgeborene', '1671', '', 'Clan Schattenherz'),
    person('asbjorn-kampfgeborene', 'Asbjorn Kampfgeborener', 'male', '1675', ''),
    spouse('ana-goldglanz', 'Ana Goldglanz', 'female', '1670', '1733', 'house-goldglanz'),
    spouse('sigfast-varulv', 'Sigfast Varulv', 'male', '1667', '1720', 'house-varulv'),
    spouse('ulfrik-schattenherz', 'Ulfrik Schattenherz', 'male', '1672', '', 'house-schattenherz'),
    spouse('ethna-eldath', 'Ethna Eldath', 'female', '1676', '', 'house-eldath'),

    person('lars-kampfgeborene', 'Lars Kampfgeborener', 'male', '1688', '', {
      title: 'Hesir des Clans Kampfgeborene seit 1714 · öffentlicher Vater Jorunds und Jordis',
      tags: ['Unfruchtbar'],
      notes: 'Lars ist unfruchtbar. Nur Lars, Jon und Morga wissen, dass Jon der biologische Vater der öffentlich Lars zugerechneten Kinder ist.'
    }),
    person('jon-kampfgeborene', 'Jon Kampfgeborener', 'male', '1691', '', {
      title: 'Ehemann Hellas · heimlicher Vater Jorunds und Jordis'
    }),
    person('wiglaff-kampfgeborene', 'Wiglaff Kampfgeborener', 'male', '1693', '1720'),
    person('hjalmar-kampfgeborene', 'Hjalmar Kampfgeborener', 'male', '1696', ''),
    awayWoman('oddrun-kampfgeborene', 'Oddrun Kampfgeborene', '1699', '', 'Clan Nachtjäger'),
    spouse('morga', 'Morga', 'female', '1690', '', '', {
      title: 'Ehefrau Lars’ · geheime Verbindung mit Jon',
      notes: 'Morga zeugte Jorund und Jordis mit Jon; öffentlich gelten beide als Lars’ Kinder.'
    }),
    spouse('hella', 'Hella', 'female', '1694', '', '', { title: 'Ehefrau Jons' }),
    spouse('vigdis', 'Vigdis', 'female', '1694', ''),
    spouse('alvilda', 'Alvilda', 'female', '1698', ''),
    spouse('starkad-nachtjaeger', 'Starkad Nachtjäger', 'male', '1695', '', 'house-nachtjaeger'),

    person('jorund-kampfgeborene', 'Jorund Kampfgeborener', 'male', '1716', '', {
      title: 'Erster Erbe · öffentlich Sohn Lars’ und Morgas',
      notes: 'Biologische Eltern: Jon Kampfgeborener und Morga. Die Öffentlichkeit hält Lars für den Vater.'
    }),
    person('jordis-kampfgeborene', 'Jordis Kampfgeborene', 'female', '1718', '', {
      title: 'Öffentlich Tochter Lars’ und Morgas',
      notes: 'Biologische Eltern: Jon Kampfgeborener und Morga. Die Öffentlichkeit hält Lars für den Vater.'
    }),
    person('ysmal-kampfgeborene', 'Ysmal Kampfgeborener', 'male', '1720', '', {
      title: 'Geheimer Sohn Jons und Morgas',
      notes: 'Ysmal wird im frauenpriorisierten Familienblock gemeinsam mit Morgas Kindern geführt; Hella ist ausschließlich Olafs Mutter.'
    }),
    person('olaf-kampfgeborene', 'Olaf Kampfgeborener', 'male', '1719', ''),
    person('sigrid-kampfgeborene', 'Sigrid Kampfgeborene', 'female', '1718', ''),
    person('eydis-kampfgeborene', 'Eydis Kampfgeborene', 'female', '1720', ''),
    person('svend-kampfgeborene', 'Svend Kampfgeborener', 'male', '1719', ''),
    person('throst-kampfgeborene', 'Throst Kampfgeborener', 'male', '1720', ''),
    person('gestur-kampfgeborene', 'Gestur Kampfgeborener', 'male', '1723', '')
  ],
  partnerships: [
    marriage('marriage-fridthjof-finnhild-kampfgeborene'),
    marriage('marriage-bujold-eithne-kampfgeborene', { status: 'ended', end: '1630' }),
    marriage('marriage-padrig-linnea-kampfgeborene', { status: 'ended', end: '1623' }),
    marriage('marriage-ottnar-helga-kampfgeborene', { status: 'ended', end: '1626' }),
    marriage('marriage-herdis-hjolm-varulv', { status: 'ended', end: '1627' }),
    marriage('marriage-aegir-hallgerd-kampfgeborene', { status: 'ended', end: '1632' }),
    marriage('marriage-tadgh-ulrikka-kampfgeborene', { status: 'ended', end: '1654' }),
    marriage('marriage-valdemar-gertrud-kampfgeborene', { status: 'ended', end: '1650' }),
    marriage('marriage-alrek-vorga-schwarzdorn', { status: 'ended', end: '1674' }),
    marriage('marriage-vormund-thorhild-schwarzdorn', { status: 'ended', end: '1689' }),
    marriage('affair-jokul-hilda-kampfgeborene', {
      type: 'affair',
      status: 'ended',
      end: '1645',
      visibility: 'restricted',
      notes: 'Thorim entstammt ausschließlich Jokuls Affäre mit Hilda.'
    }),
    marriage('marriage-halstein-ylfrun-kampfgeborene', { status: 'ended', end: '1702' }),
    marriage('marriage-valdemar-ljosdis-kampfgeborene', { status: 'ended', end: '1739' }),
    marriage('marriage-aonghas-tordis-kampfgeborene', { status: 'ended', end: '1720' }),
    marriage('marriage-bodvar-disa-kampfgeborene', { status: 'ended', end: '1720' }),
    marriage('marriage-valeric-ana-kampfgeborene', { status: 'ended', end: '1714' }),
    marriage('marriage-sigfast-rekka-varulv', { status: 'ended', end: '1720' }),
    marriage('marriage-ulfrik-hulda-kampfgeborene'),
    marriage('marriage-asbjorn-ethna-kampfgeborene'),
    alignPartnerOverChildren(marriage('marriage-lars-morga-kampfgeborene', {
      notes: 'Öffentlich gelten Jorund und Jordis als die ehelichen Kinder von Lars und Morga.',
      extensions: {
        chartAlignPartnerOverAdditionalChildrenIds: ['ysmal-kampfgeborene'],
        chartArrangeLeafChildrenEvenly: true,
        registryManagedExtensionFields: [
          'chartAlignPartnerOverChildrenPersonId',
          'chartAlignPartnerOverAdditionalChildrenIds',
          'chartArrangeLeafChildrenEvenly'
        ]
      }
    }), 'morga'),
    alignPartnerOverChildren(marriage('marriage-jon-hella-kampfgeborene'), 'hella'),
    marriage('affair-jon-morga-kampfgeborene', {
      type: 'affair',
      status: 'secret',
      visibility: 'secret',
      notes: 'Geheime Verbindung: Jon ist der biologische Vater von Jorund, Jordis und Ysmal. Jorund und Jordis gelten öffentlich als Lars’ Kinder.',
      extensions: {
        chartCenteredPartnershipLine: true,
        registryManagedExtensionFields: ['chartCenteredPartnershipLine']
      }
    }),
    marriage('marriage-wiglaff-vigdis-kampfgeborene', { status: 'ended', end: '1720' }),
    marriage('marriage-hjalmar-alvilda-kampfgeborene'),
    marriage('marriage-starkad-oddrun-nachtjaeger')
  ],
  parentages: [
    ...claimedChildren(['bujold-kampfgeborene', 'linnea-kampfgeborene'], 'marriage-fridthjof-finnhild-kampfgeborene'),
    ...childrenOf(['ottnar-kampfgeborene', 'jofrid-kampfgeborene', 'hjolm-kampfgeborene'], 'marriage-bujold-eithne-kampfgeborene'),
    ...childrenOf(['aegir-kampfgeborene', 'ulrikka-kampfgeborene'], 'marriage-ottnar-helga-kampfgeborene'),
    ...childrenOf(['valdemar-kampfgeborene'], 'marriage-herdis-hjolm-varulv'),
    ...childrenOf(['alrek-kampfgeborene', 'thorhild-kampfgeborene'], 'marriage-aegir-hallgerd-kampfgeborene'),
    ...childrenOf(['ulfrik-kampfgeborene', 'jokul-kampfgeborene'], 'marriage-valdemar-gertrud-kampfgeborene'),
    ...childrenOf(['halstein-kampfgeborene', 'ljosdis-kampfgeborene', 'tordis-kampfgeborene', 'bodvar-kampfgeborene'], 'marriage-alrek-vorga-schwarzdorn'),
    ...childrenOf(['thorim-frostgeborene'], 'affair-jokul-hilda-kampfgeborene', {
      legitimacy: 'illegitimate',
      notes: 'Thorim ist Jokuls unehelicher Sohn mit Hilda und begründet später das Haus Frostgeborene.'
    }),
    ...childrenOf(['valeric-kampfgeborene', 'rekka-kampfgeborene'], 'marriage-halstein-ylfrun-kampfgeborene'),
    ...childrenOf(['hulda-kampfgeborene', 'asbjorn-kampfgeborene'], 'marriage-bodvar-disa-kampfgeborene'),
    ...childrenOf(['lars-kampfgeborene', 'jon-kampfgeborene', 'wiglaff-kampfgeborene'], 'marriage-valeric-ana-kampfgeborene'),
    ...childrenOf(['hjalmar-kampfgeborene', 'oddrun-kampfgeborene'], 'marriage-asbjorn-ethna-kampfgeborene'),
    ...childrenOf(['jorund-kampfgeborene', 'jordis-kampfgeborene'], 'marriage-lars-morga-kampfgeborene', {
      extensions: {
        chartPrimaryParentage: true,
        publicParentage: true,
        chartParentageGroupId: 'morga-kinderblock',
        chartParentageGroupAnchorPersonId: 'morga',
        registryManagedExtensionFields: [
          'chartPrimaryParentage',
          'publicParentage',
          'chartParentageGroupId',
          'chartParentageGroupAnchorPersonId'
        ]
      },
      notes: 'Öffentlich und rechtlich werden beide Kinder Lars und Morga zugerechnet.'
    }),
    ...childrenOf(['jorund-kampfgeborene', 'jordis-kampfgeborene'], 'affair-jon-morga-kampfgeborene', {
      idPrefix: 'kampfgeborene-secret-parentage',
      visibility: 'secret',
      notes: 'Geheime biologische Abstammung: Jon Kampfgeborener und Morga.',
      extensions: { biologicalTruth: true }
    }),
    ...childrenOf(['ysmal-kampfgeborene'], 'affair-jon-morga-kampfgeborene', {
      idPrefix: 'kampfgeborene-secret-parentage',
      visibility: 'secret',
      notes: 'Geheime biologische Abstammung: Jon Kampfgeborener und Morga.',
      extensions: {
        biologicalTruth: true,
        chartPrimaryParentage: true,
        chartParentageGroupId: 'morga-kinderblock',
        chartParentageGroupAnchorPersonId: 'morga',
        registryManagedExtensionFields: [
          'biologicalTruth',
          'chartPrimaryParentage',
          'chartParentageGroupId',
          'chartParentageGroupAnchorPersonId'
        ]
      }
    }),
    ...childrenOf(['olaf-kampfgeborene'], 'marriage-jon-hella-kampfgeborene'),
    ...childrenOf(['sigrid-kampfgeborene', 'eydis-kampfgeborene'], 'marriage-wiglaff-vigdis-kampfgeborene'),
    ...childrenOf(['svend-kampfgeborene', 'throst-kampfgeborene', 'gestur-kampfgeborene'], 'marriage-hjalmar-alvilda-kampfgeborene')
  ],
  cadetBranches: [
    marriedAway('married-away-linnea-kampfgeborene-oglivy', 'Clan Oglivy', 'marriage-padrig-linnea-kampfgeborene', 'house-oglivy', 'haus-oglivy'),
    marriedAway('married-away-ulrikka-kampfgeborene-seaghdha', 'Clan Séaghdha', 'marriage-tadgh-ulrikka-kampfgeborene', 'house-seaghdha', 'haus-seaghdha'),
    marriedAway('married-away-thorhild-kampfgeborene-schwarzdorn', 'Clan Schwarzdorn', 'marriage-vormund-thorhild-schwarzdorn', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    createSingleFounderHouseBranch({
      id: 'bastard-house-frostgeborene-thorim',
      name: 'Haus Frostgeborene',
      parentPersonId: 'thorim-frostgeborene',
      houseId: 'house-frostgeborene',
      targetFamilyId: 'haus-frostgeborene',
      emblem: HOUSE_EMBLEMS.frostgeborene,
      crestFrame: 'iron',
      subtitle: 'Von Thorim dem Bastard gegründetes bürgerliches Bastardhaus',
      notes: 'Thorim, unehelicher Sohn Jokuls, begründet die nichtadelige Familie Frostgeborene.',
      extensions: { registryManagedFields: ['name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'] }
    }),
    marriedAway('married-away-ljosdis-kampfgeborene-skjegg', 'Clan Skjegg', 'marriage-valdemar-ljosdis-kampfgeborene', 'house-skjegg', 'haus-skjegg', HOUSE_EMBLEMS.skjegg),
    marriedAway('married-away-tordis-kampfgeborene-craobhan', 'Clan Craobhan', 'marriage-aonghas-tordis-kampfgeborene', 'house-craobhan', 'haus-craobhan'),
    marriedAway('married-away-rekka-kampfgeborene-varulv', 'Clan Varulv', 'marriage-sigfast-rekka-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-hulda-kampfgeborene-schattenherz', 'Clan Schattenherz', 'marriage-ulfrik-hulda-kampfgeborene', 'house-schattenherz', 'haus-schattenherz'),
    marriedAway('married-away-oddrun-kampfgeborene-nachtjaeger', 'Clan Nachtjäger', 'marriage-starkad-oddrun-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-fridthjof-finnhild-kampfgeborene',
      parentPersonId: '',
      childIds: ['bujold-kampfgeborene', 'linnea-kampfgeborene'],
      years: 0,
      fromYear: '????',
      toYear: '1556',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner: Gründerpaar, Hauswappen, Zeitsprung und erst danach Bujold und Linnea.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fridthjof-finnhild-kampfgeborene',
    houseId: KAMPFGEBORENE_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Rorikshall · Vasall der Varulv',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fridthjof-kampfgeborene',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 5,
    sourceNote: 'Die vollständige Genealogie folgt der bereitgestellten Kampfgeborenen-Tabelle und den ausdrücklichen Darstellungskorrekturen. Die unmögliche Angabe Ottnar 1577–1526 wurde als eindeutiger Jahrhundertfehler zu 1626 korrigiert. Thorim bleibt Jokuls Bastard und verweist geradlinig auf das separat registrierte, bürgerliche Haus Frostgeborene. Normale Kinderlinien entspringen gemeinsam der Verbindung beider Eltern; deshalb besitzen Wiglaff/Vigdis und Hjalmar/Alvilda keine einseitige Frauenausrichtung. Jorund und Jordis werden öffentlich unter Lars und Morga geführt; biologisch stammen Jorund, Jordis und Ysmal aus Jons geheimer Verbindung mit Morga. Nur dieser ausdrücklich belegte Mehrpartner-Ausnahmeblock führt die sichtbare gemeinsame Kinderlinie aller drei Geschwister direkt und geradlinig von Morga, ohne die vollständigen Elternschaften im Datenmodell zu verändern. Die geheime Verbindung zwischen Morga und Jon wird mittig zwischen ihren Karten gezeigt, während Hella abseits ausschließlich über Olaf steht. Jon erscheint nur einmal und bleibt sowohl mit Hella verheiratet als auch geheim mit Morga verbunden. Kinder wegverheirateter Frauen werden ausschließlich in den fortführenden Zielakten abgebildet. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts übernommen.',
    registryTombstones: {
      parentages: ['kampfgeborene-parentage-ysmal-kampfgeborene']
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'liegeHouseId',
      'liegeHouseName', 'secondarySeats', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
