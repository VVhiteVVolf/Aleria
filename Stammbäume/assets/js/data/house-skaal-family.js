import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SKAAL_PORTRAITS } from './house-skaal-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const SKAAL_HOUSE_ID = 'house-skaal';
const FOUNDER_TIME_JUMP_ID = 'gap-thor-hjalmar-skaal';

const HOUSE_EMBLEMS = Object.freeze({
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren
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
  'thor-skaal-founder',
  'hjalmar-skaal',
  'sveinung-skaal',
  'steinarr-skaal',
  'sigvard-skaal',
  'arne-skaal'
]);

const MAINLINE_IDS = new Set([
  'sven-skaal',
  'jorah-skaal'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SKAAL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SKAAL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SKAAL_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['thor-skaal-founder', 'sif-skaal-founder'],
  hjalmar: ['hjalmar-skaal', 'brynhild-helgr'],
  helga: ['ottnar-kampfgeborener', 'helga-skaal'],
  asmund: ['asmund-skaal', 'mairin-magach'],
  sveinung: ['sveinung-skaal', 'gudlaug-skjegg'],
  svanhild: ['bjoern-vaeren', 'svanhild-skaal'],
  ofeig: ['ofeig-skaal', 'thordis-skogg'],
  yngvild: ['hogne-wargh', 'yngvild-skaal'],
  steinarr: ['steinarr-skaal', 'vallgerd-skaal-spouse'],
  fridgerd: ['skjold-brathfengr', 'fridgerd-skaal'],
  sigmund: ['sigmund-skaal', 'eldrid-helgr'],
  sigvard: ['sigvard-skaal', 'gudrun-skogg'],
  freydis: ['ketill-skald', 'freydis-skaal'],
  thrand: ['thrand-skaal', 'gwelda-sterkr'],
  ulrikka: ['gunnar-feuerhaar', 'ulrikka-skaal'],
  arne: ['arne-skaal', 'revna-skjegg'],
  hanne: ['thiodolf-skjegg', 'hanne-skaal'],
  katla: ['fridthjof-freiwinter', 'katla-skaal'],
  sigurd: ['sigurd-skaal', 'asgerd-skaal-spouse'],
  sjovald: ['sjovald-skaal', 'dagny-helgr'],
  sven: ['sven-skaal', 'runa-soekaren'],
  svantje: ['sleipnir-varulv', 'svantje-skaal'],
  hardar: ['hardar-skaal', 'vilborg-skaal-spouse']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-thor-sif-skaal': COUPLES.founders,
  'marriage-hjalmar-brynhild-skaal': COUPLES.hjalmar,
  'marriage-helga-ottnar-skaal': COUPLES.helga,
  'marriage-asmund-mairin-skaal': COUPLES.asmund,
  'marriage-sveinung-gudlaug-skaal': COUPLES.sveinung,
  'engagement-bjoern-svanhild-vaeren': COUPLES.svanhild,
  'marriage-ofeig-thordis-skaal': COUPLES.ofeig,
  'marriage-hogne-yngvild-wargh': COUPLES.yngvild,
  'marriage-steinarr-vallgerd-skaal': COUPLES.steinarr,
  'marriage-skjold-fridgerd-brathfengr': COUPLES.fridgerd,
  'marriage-sigmund-eldrid-skaal': COUPLES.sigmund,
  'marriage-sigvard-gudrun-skaal': COUPLES.sigvard,
  'marriage-ketill-freydis-skald': COUPLES.freydis,
  'marriage-thrand-gwelda-skaal': COUPLES.thrand,
  'marriage-gunnar-ulrikka-feuerhaar': COUPLES.ulrikka,
  'marriage-arne-revna-skaal': COUPLES.arne,
  'marriage-thiodolf-hanne-skjegg': COUPLES.hanne,
  'marriage-fridthjof-katla-freiwinter': COUPLES.katla,
  'marriage-sigurd-asgerd-skaal': COUPLES.sigurd,
  'marriage-sjovald-dagny-skaal': COUPLES.sjovald,
  'marriage-sven-runa-skaal': COUPLES.sven,
  'marriage-sleipnir-svantje-varulv': COUPLES.svantje,
  'marriage-hardar-vilborg-skaal': COUPLES.hardar
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

function endedMarriage(partnershipId, end = '') {
  return marriage(partnershipId, { status: 'ended', end });
}

function endedEngagement(partnershipId, end = '') {
  return marriage(partnershipId, { type: 'engagement', status: 'ended', end });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'skaal-parentage',
    ...options
  });
}

function claimedChildren(childIds) {
  return childrenOf(childIds, 'marriage-thor-sif-skaal', {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Zwischen den überlieferten Ursprungsfiguren Thor und Sif und diesen drei Geschwistern liegen nicht einzeln dokumentierte Generationen.',
    extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
  });
}

function marriedAway(
  id,
  name,
  partnershipId,
  houseId,
  targetFamilyId,
  emblem = '',
  subtitle = `Wegverheiratet an ${name}`
) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle,
    extensions: {
      registryManagedFields: ['name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle']
    }
  });
}

export const HOUSE_SKAAL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-skaal',
    title: 'Clan Skaal',
    motto: '',
    description: 'Alter Thanenclan von Schwertfall in Schwerthohn, Bewahrer norrnaighischer Glaubens- und Kriegertraditionen und Lehnsherren der Skjegg.',
    emblem: HOUSE_EMBLEMS.skaal,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.skaal
  },
  houses: [
    house(SKAAL_HOUSE_ID, 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-helgr', 'Clan Helgr'),
    house('house-magach', 'Haus Magach'),
    house('house-skogg', 'Clan Skogg'),
    house('house-feuerhaar', 'Clan Feuerhaar')
  ],
  persons: [
    person('thor-skaal-founder', 'Thor Skaal', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Überlieferter Stammvater des Clans Skaal',
      notes: 'Die Hausüberlieferung führt den Ursprung des Clans auf Thor und Sif zurück; historische Lebensdaten sind nicht überliefert.'
    }),
    person('sif-skaal-founder', 'Sif', 'female', '????', '????', {
      familyRole: 'founder',
      title: 'Überlieferte Stammmutter des Clans Skaal',
      notes: 'Die Hausüberlieferung führt den Ursprung des Clans auf Thor und Sif zurück; historische Lebensdaten sind nicht überliefert.'
    }),

    person('hjalmar-skaal', 'Hjalmar Skaal', 'male', '1575', '1629', {
      title: 'Herr von Schwertfall · 1629 hingerichtet',
      notes: 'Ziehvater Bjoern Vaerens und Unterstützer der Blauen Fraktion; nach der Einnahme Schwertfalls von Eldar Varulv hingerichtet.'
    }),
    awayWoman('helga-skaal', 'Helga Skaal', '1580', '1630', 'Clan Kampfgeborene'),
    person('asmund-skaal', 'Asmund Skaal', 'male', '1580', '1660', {
      title: 'Ehemaliger Führer des Ritterordens von Schwertfall',
      notes: 'Bruder Hjalmars; nach einem Tribunal der Ordinatoren musste er die Ordensführung abgeben.'
    }),
    spouse('brynhild-helgr', 'Brynhild Helgr', 'female', '1581', '1656', 'house-helgr'),
    spouse('ottnar-kampfgeborener', 'Ottnar Kampfgeborener', 'male', '1577', '1626', 'house-kampfgeborene'),
    spouse('mairin-magach', 'Máirín Magach', 'female', '1585', '1667', 'house-magach'),

    person('sveinung-skaal', 'Sveinung Skaal', 'male', '1611', '1672'),
    person('svanhild-skaal', 'Svanhild Skaal', 'female', '1613', '1633', {
      title: 'Wegverlobt an Clan Vaeren',
      tags: ['Wegverlobt']
    }),
    person('bjoern-vaeren', 'Bjoern Vaeren', 'male', '1610', '1633', {
      houseId: 'house-vaeren',
      familyRole: 'married',
      lineageRole: 'branch',
      title: 'Verlobter Svanhilds',
      tags: ['Verlobt'],
      notes: 'Bjoern Vaeren und Svanhild Skaal waren verlobt. Eine Mündel- oder Pflegebeziehung zu Hjalmar Skaal wird nicht geführt.'
    }),
    person('ofeig-skaal', 'Ofeig Skaal', 'male', '1614', '1689'),
    awayWoman('yngvild-skaal', 'Yngvild Skaal', '1616', '1650', 'Clan Wargh'),
    spouse('gudlaug-skjegg', 'Gudlaug Skjegg', 'female', '1612', '1687', 'house-skjegg'),
    spouse('thordis-skogg', 'Thordis Skogg', 'female', '1616', '????', 'house-skogg'),
    spouse('hogne-wargh', 'Hogne Wargh', 'male', '1614', '1679', 'house-wargh'),

    person('steinarr-skaal', 'Steinarr Skaal', 'male', '1630', '1699'),
    awayWoman('fridgerd-skaal', 'Fridgerd Skaal', '1633', '1706', 'Clan Brathfengr'),
    person('sigmund-skaal', 'Sigmund Skaal', 'male', '1635', '1720'),
    spouse('vallgerd-skaal-spouse', 'Vallgerd', 'female', '1630', '1702'),
    spouse('skjold-brathfengr', 'Skjold Brathfengr', 'male', '1631', '1715', 'house-brathfengr'),
    spouse('eldrid-helgr', 'Eldrid Helgr', 'female', '1636', '1734', 'house-helgr'),

    person('sigvard-skaal', 'Sigvard Skaal', 'male', '1648', '1719'),
    awayWoman('freydis-skaal', 'Freydis Skaal', '1651', '1717', 'Clan Skald'),
    person('thrand-skaal', 'Thrand Skaal', 'male', '1654', '1679'),
    awayWoman('ulrikka-skaal', 'Ulrikka Skaal', '1657', '1709', 'Clan Feuerhaar'),
    spouse('gudrun-skogg', 'Gudrun Skogg', 'female', '1651', '1725', 'house-skogg'),
    spouse('ketill-skald', 'Ketill Skald', 'male', '1650', '1720', 'house-skald'),
    spouse('gwelda-sterkr', 'Gwelda Sterkr', 'female', '1654', '1711', 'house-sterkr'),
    spouse('gunnar-feuerhaar', 'Gunnar Feuerhaar', 'male', '1654', '1715', 'house-feuerhaar'),

    person('arne-skaal', 'Arne Skaal', 'male', '1669', ''),
    awayWoman('hanne-skaal', 'Hanne Skaal', '1673', '', 'Clan Skjegg'),
    awayWoman('katla-skaal', 'Katla Skaal', '1672', '', 'Clan Freiwinter'),
    person('sigurd-skaal', 'Sigurd Skaal', 'male', '1679', ''),
    spouse('revna-skjegg', 'Revna Skjegg', 'female', '1673', '', 'house-skjegg'),
    spouse('thiodolf-skjegg', 'Thiodolf Skjegg', 'male', '1670', '', 'house-skjegg'),
    spouse('fridthjof-freiwinter', 'Fridthjof Freiwinter', 'male', '1670', '', 'house-freiwinter'),
    spouse('asgerd-skaal-spouse', 'Asgerd', 'female', '1675', ''),

    person('sjovald-skaal', 'Sjovald Skaal', 'male', '1692', '1720'),
    person('sven-skaal', 'Sven Skaal', 'male', '1694', ''),
    awayWoman('svantje-skaal', 'Svantje Skaal', '1698', '', 'Clan Varulv'),
    person('baldvin-skaal', 'Baldvin Skaal', 'male', '1700', '1720'),
    person('hardar-skaal', 'Hardar Skaal', 'male', '1702', ''),
    spouse('dagny-helgr', 'Dagny Helgr', 'female', '1695', '', 'house-helgr'),
    spouse('runa-soekaren', 'Runa Sökaren', 'female', '1697', '', 'house-soekeren'),
    spouse('sleipnir-varulv', 'Sleipnir Varulv', 'male', '1696', '', 'house-varulv'),
    spouse('vilborg-skaal-spouse', 'Vilborg', 'female', '1706', ''),

    person('brynja-skaal', 'Brynja Skaal', 'female', '1713', ''),
    person('jorah-skaal', 'Jorah Skaal', 'male', '1718', ''),
    person('juna-skaal', 'Juna Skaal', 'female', '1721', ''),
    person('duna-skaal', 'Duna Skaal', 'female', '1722', ''),
    person('dora-skaal', 'Dora Skaal', 'female', '1724', ''),
    person('olaf-skaal', 'Olaf Skaal', 'male', '1724', ''),
    person('ivar-skaal', 'Ivar Skaal', 'male', '1729', ''),
    person('knut-skaal', 'Knut Skaal', 'male', '1735', '')
  ],
  partnerships: [
    endedMarriage('marriage-thor-sif-skaal'),
    endedMarriage('marriage-hjalmar-brynhild-skaal', '1629'),
    endedMarriage('marriage-helga-ottnar-skaal', '1626'),
    endedMarriage('marriage-asmund-mairin-skaal', '1660'),
    endedMarriage('marriage-sveinung-gudlaug-skaal', '1672'),
    endedEngagement('engagement-bjoern-svanhild-vaeren', '1633'),
    endedMarriage('marriage-ofeig-thordis-skaal', '1689'),
    endedMarriage('marriage-hogne-yngvild-wargh', '1650'),
    endedMarriage('marriage-steinarr-vallgerd-skaal', '1699'),
    endedMarriage('marriage-skjold-fridgerd-brathfengr', '1706'),
    endedMarriage('marriage-sigmund-eldrid-skaal', '1720'),
    endedMarriage('marriage-sigvard-gudrun-skaal', '1719'),
    endedMarriage('marriage-ketill-freydis-skald', '1706'),
    endedMarriage('marriage-thrand-gwelda-skaal', '1679'),
    endedMarriage('marriage-gunnar-ulrikka-feuerhaar', '1709'),
    marriage('marriage-arne-revna-skaal'),
    marriage('marriage-thiodolf-hanne-skjegg'),
    marriage('marriage-fridthjof-katla-freiwinter'),
    marriage('marriage-sigurd-asgerd-skaal'),
    endedMarriage('marriage-sjovald-dagny-skaal', '1720'),
    marriage('marriage-sven-runa-skaal'),
    marriage('marriage-sleipnir-svantje-varulv'),
    marriage('marriage-hardar-vilborg-skaal')
  ],
  parentages: [
    ...claimedChildren(['hjalmar-skaal', 'helga-skaal', 'asmund-skaal']),
    ...childrenOf(['sveinung-skaal', 'svanhild-skaal'], 'marriage-hjalmar-brynhild-skaal'),
    ...childrenOf(['ofeig-skaal', 'yngvild-skaal'], 'marriage-asmund-mairin-skaal'),
    ...childrenOf(['steinarr-skaal', 'fridgerd-skaal'], 'marriage-sveinung-gudlaug-skaal'),
    ...childrenOf(['sigmund-skaal'], 'marriage-ofeig-thordis-skaal'),
    ...childrenOf(['sigvard-skaal', 'freydis-skaal'], 'marriage-steinarr-vallgerd-skaal'),
    ...childrenOf(['thrand-skaal', 'ulrikka-skaal'], 'marriage-sigmund-eldrid-skaal'),
    ...childrenOf(['arne-skaal', 'hanne-skaal'], 'marriage-sigvard-gudrun-skaal'),
    ...childrenOf(['katla-skaal', 'sigurd-skaal'], 'marriage-thrand-gwelda-skaal'),
    ...childrenOf(['sjovald-skaal', 'sven-skaal', 'svantje-skaal'], 'marriage-arne-revna-skaal'),
    ...childrenOf(['baldvin-skaal', 'hardar-skaal'], 'marriage-sigurd-asgerd-skaal'),
    ...childrenOf(['brynja-skaal'], 'marriage-sjovald-dagny-skaal'),
    ...childrenOf(['jorah-skaal', 'juna-skaal', 'duna-skaal', 'dora-skaal'], 'marriage-sven-runa-skaal'),
    ...childrenOf(['olaf-skaal', 'ivar-skaal', 'knut-skaal'], 'marriage-hardar-vilborg-skaal')
  ],
  cadetBranches: [
    marriedAway('married-away-helga-skaal-kampfgeborene', 'Clan Kampfgeborene', 'marriage-helga-ottnar-skaal', 'house-kampfgeborene', 'haus-kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    marriedAway(
      'married-away-svanhild-skaal-vaeren',
      'Clan Vaeren',
      'engagement-bjoern-svanhild-vaeren',
      'house-vaeren',
      'haus-vaeren',
      HOUSE_EMBLEMS.vaeren,
      'Wegverlobt an Clan Vaeren'
    ),
    marriedAway('married-away-yngvild-skaal-wargh', 'Clan Wargh', 'marriage-hogne-yngvild-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-fridgerd-skaal-brathfengr', 'Clan Brathfengr', 'marriage-skjold-fridgerd-brathfengr', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-freydis-skaal-skald', 'Clan Skald', 'marriage-ketill-freydis-skald', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald),
    marriedAway('married-away-ulrikka-skaal-feuerhaar', 'Clan Feuerhaar', 'marriage-gunnar-ulrikka-feuerhaar', 'house-feuerhaar', 'haus-feuerhaar'),
    marriedAway('married-away-hanne-skaal-skjegg', 'Clan Skjegg', 'marriage-thiodolf-hanne-skjegg', 'house-skjegg', 'haus-skjegg', HOUSE_EMBLEMS.skjegg),
    marriedAway('married-away-katla-skaal-freiwinter', 'Clan Freiwinter', 'marriage-fridthjof-katla-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-svantje-skaal-varulv', 'Clan Varulv', 'marriage-sleipnir-svantje-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-thor-sif-skaal',
      parentPersonId: '',
      childIds: ['hjalmar-skaal', 'helga-skaal', 'asmund-skaal'],
      years: 0,
      fromYear: '????',
      toYear: '1575',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner: Thor und Sif, Stammwappen, Zeitsprung und erst danach Hjalmar, Helga und Asmund.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-thor-sif-skaal',
    houseId: SKAAL_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Schwertfall · Herren von Schwerthohn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'thor-skaal-founder',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 5,
    sourceModule: 'Clan Skaal (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Skaal-Stammbaum folgt der bereitgestellten Hausseite. Thor und Sif stehen als überlieferte Ursprungsfiguren vor dem Wappen; genau ein strikt serieller Generationentrenner führt zu Hjalmar, Helga und Asmund. Bjoern Vaeren und Svanhild Skaal werden ausschließlich als Verlobung geführt; eine frühere Mündel-, Pflege- oder Ehedarstellung wird entfernt. Bei der missverständlich vertauschten Partnerüberschrift der jüngeren Generation folgt die Zuordnung den ausdrücklich benannten Kindergruppen: Sven und Runa sind Eltern von Jorah, Juna, Duna und Dora; Svantje ist mit Sleipnir Varulv verheiratet. Verheiratete und wegverlobte Skaal-Frauen erhalten direkte Zielclanknoten; Nachkommen in Skjegg, Freiwinter und Varulv werden ausschließlich in den Zielakten fortgeführt.',
    registryTombstones: {
      persons: ['haus-skaal-gruender', 'haus-skaal-gruenderin'],
      partnerships: ['marriage-haus-skaal-founders', 'marriage-bjoern-svanhild-vaeren'],
      parentages: ['skaal-foster-parentage-bjoern-vaeren']
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
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
