import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createWorldPersonId } from '../domain/family-schema.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS
} from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const FREIWINTER_HOUSE_ID = 'house-freiwinter';
const FOUNDER_TIME_JUMP_ID = 'gap-vigulf-ketill-freiwinter';

const HOUSE_EMBLEMS = Object.freeze({
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  schwarzdorn: RORIKSHEIM_HOUSE_EMBLEMS.schwarzdorn,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr
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
  'vigulf-varulv',
  'ketill-freiwinter',
  'brynjolf-freiwinter',
  'bjoern-freiwinter',
  'vebjorn-freiwinter',
  'jakul-freiwinter',
  'fridthjof-freiwinter'
]);

const MAINLINE_IDS = new Set([
  'erling-freiwinter',
  'hrapp-freiwinter',
  'stig-freiwinter'
]);

const SHARED_VARULV_PERSON_IDS = new Set([
  'vigulf-varulv',
  'torborg-varulv',
  'gunnvor-varulv'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function sharedWorldPersonId(personId, houseId) {
  if (SHARED_VARULV_PERSON_IDS.has(personId)) {
    return createWorldPersonId('haus-varulv', personId);
  }
  if (personId === 'sif') return createWorldPersonId('', personId);
  return createWorldPersonId(houseId.replace(/^house-/, 'haus-'), personId);
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? FREIWINTER_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || sharedWorldPersonId(id, houseId || FREIWINTER_HOUSE_ID),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FREIWINTER_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === FREIWINTER_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['vigulf-varulv', 'sif'],
  ketill: ['ketill-freiwinter', 'gudrun-nachtjaeger'],
  svangun: ['svangun-freiwinter', 'snorri-windhueter'],
  fenrir: ['fenrir-freiwinter', 'gelda-schattenherz'],
  brynjolf: ['brynjolf-freiwinter', 'ragnhild-sturmgeborene'],
  brynhild: ['brynhild-freiwinter', 'ragnar-riesentot'],
  hildigunn: ['hildigunn-freiwinter', 'halstein-brathfengr'],
  hoskuld: ['hoskuld-freiwinter', 'fenja-skald'],
  bjoern: ['bjoern-freiwinter', 'vedis-wellensaenger'],
  vebjorn: ['vebjorn-freiwinter', 'sigrid-skjegg'],
  // Dieselbe Registerehe steht auch in der Varulv-Akte; deshalb bleibt nicht
  // nur die ID, sondern auch die kanonische Teilnehmerreihenfolge identisch.
  jakul: ['torborg-varulv', 'jakul-freiwinter'],
  svenja: ['svenja-freiwinter', 'vignar-schwarzdorn'],
  ljosdis: ['ljosdis-freiwinter', 'thorkel-silberzunge'],
  sigurd: ['sigurd-freiwinter', 'frida-feuerhaar'],
  fridthjof: ['fridthjof-freiwinter', 'katla-skaal'],
  freydis: ['freydis-freiwinter', 'skule-skogg'],
  hjalmar: ['hjalmar-freiwinter', 'gwelda-grindel'],
  hjalmfrid: ['hjalmfrid-freiwinter', 'brychan-durthacht'],
  erling: ['erling-freiwinter', 'revna-sterkr'],
  angreboda: ['angreboda-freiwinter', 'miermir-schwarzdorn'],
  edda: ['gunnvor-varulv', 'edda-freiwinter'],
  brunwulf: ['brunwulf-freiwinter', 'maeva-schwarzdorn'],
  reidar: ['reidar-freiwinter', 'estridd-nachtjaeger']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-vigulf-sif-varulv': COUPLES.founders,
  'marriage-ketill-gudrun-freiwinter': COUPLES.ketill,
  'marriage-svangun-snorri-freiwinter': COUPLES.svangun,
  'marriage-fenrir-gelda-freiwinter': COUPLES.fenrir,
  'marriage-brynjolf-ragnhild-freiwinter': COUPLES.brynjolf,
  'marriage-brynhild-ragnar-freiwinter': COUPLES.brynhild,
  'marriage-hildigunn-halstein-freiwinter': COUPLES.hildigunn,
  'marriage-hoskuld-fenja-freiwinter': COUPLES.hoskuld,
  'marriage-bjoern-vedis-freiwinter': COUPLES.bjoern,
  'marriage-vebjorn-sigrid-freiwinter': COUPLES.vebjorn,
  'marriage-torborg-jakul-varulv': COUPLES.jakul,
  'marriage-svenja-vignar-freiwinter': COUPLES.svenja,
  'marriage-ljosdis-thorkel-freiwinter': COUPLES.ljosdis,
  'marriage-sigurd-frida-freiwinter': COUPLES.sigurd,
  'marriage-fridthjof-katla-freiwinter': COUPLES.fridthjof,
  'marriage-freydis-skule-freiwinter': COUPLES.freydis,
  'marriage-hjalmar-gwelda-freiwinter': COUPLES.hjalmar,
  'marriage-hjalmfrid-brychan-freiwinter': COUPLES.hjalmfrid,
  'marriage-erling-revna-freiwinter': COUPLES.erling,
  'marriage-angreboda-miermir-freiwinter': COUPLES.angreboda,
  'marriage-gunnvor-edda-varulv': COUPLES.edda,
  'marriage-brunwulf-maeva-freiwinter': COUPLES.brunwulf,
  'marriage-reidar-estridd-freiwinter': COUPLES.reidar
});

const PARTNERSHIP_OPTIONS_BY_ID = Object.freeze({
  'marriage-ljosdis-thorkel-freiwinter': Object.freeze({ status: 'ended', end: '1709' }),
  'marriage-hjalmar-gwelda-freiwinter': Object.freeze({ status: 'ended', end: '1720' })
});

function marriage(partnershipId) {
  return createMarriage(
    partnershipId,
    ...PARTNERS_BY_ID[partnershipId],
    PARTNERSHIP_OPTIONS_BY_ID[partnershipId] || {}
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'freiwinter-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Quelle lässt zwischen dem Gründerpaar und diesen Geschwistern mehrere Generationen aus.',
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

export const HOUSE_FREIWINTER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-freiwinter',
    title: 'Clan Freiwinter',
    motto: '',
    description: 'Hesire-Clan von Wolfswacht und Kadettenclan der Varulv. Die Freiwinter sichern die Winterfänge im Rorikstal und führen ihre Linie auf Vigulf Varulv und Sif zurück.',
    emblem: HOUSE_EMBLEMS.freiwinter,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.freiwinter
  },
  houses: [
    house(FREIWINTER_HOUSE_ID, 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-windhueter', 'Clan Windhüter'),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-riesentot', 'Clan Riesentot'),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-wellensaenger', 'Clan Wellensänger'),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-schwarzdorn', 'Clan Schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    house('house-silberzunge', 'Clan Silberzunge'),
    house('house-feuerhaar', 'Clan Feuerhaar'),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-skogg', 'Clan Skogg'),
    house('house-grendel', 'Clan Grendel'),
    house('house-durthacht', 'Clan Durthacht'),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr)
  ],
  persons: [
    person('vigulf-varulv', 'Vigulf Varulv', 'male', '????', '????', {
      houseId: 'house-varulv',
      familyRole: 'founder',
      title: 'Begründer des Clans Freiwinter',
      tags: ['Kadettengründer']
    }),
    spouse('sif', 'Sif', 'female', '????', '????'),

    person('ketill-freiwinter', 'Ketill Freiwinter', 'male', '1576', '1625', { title: 'Hesir des Clans Freiwinter' }),
    spouse('gudrun-nachtjaeger', 'Gudrun Nachtjäger', 'female', '1576', '1627', 'house-nachtjaeger'),
    awayWoman('svangun-freiwinter', 'Svangun Freiwinter', '1579', '1656', 'Clan Windhüter'),
    spouse('snorri-windhueter', 'Snorri Windhüter', 'male', '1577', '1627', 'house-windhueter'),
    person('fenrir-freiwinter', 'Fenrir Freiwinter', 'male', '1584', '1627'),
    spouse('gelda-schattenherz', 'Gelda Schattenherz', 'female', '1585', '1650', 'house-schattenherz'),

    person('brynjolf-freiwinter', 'Brynjolf Freiwinter', 'male', '1594', '1665', { title: 'Hesir des Clans Freiwinter' }),
    spouse('ragnhild-sturmgeborene', 'Ragnhild Sturmgeborene', 'female', '1596', '1658', 'house-sturmgeborene'),
    awayWoman('brynhild-freiwinter', 'Brynhild Freiwinter', '1600', '1679', 'Clan Riesentot'),
    spouse('ragnar-riesentot', 'Ragnar Riesentot', 'male', '1592', '1650', 'house-riesentot'),
    awayWoman('hildigunn-freiwinter', 'Hildigunn Freiwinter', '1603', '1671', 'Clan Brathfengr'),
    spouse('halstein-brathfengr', 'Halstein Brathfengr', 'male', '1600', '1698', 'house-brathfengr'),
    person('hoskuld-freiwinter', 'Hoskuld Freiwinter', 'male', '1605', '1628'),
    spouse('fenja-skald', 'Fenja Skald', 'female', '1608', '1710', 'house-skald', {
      notes: 'Die spätere Skald-Hausquelle nennt 1608 als Geburtsjahr und korrigiert damit die ältere Freiwinter-Angabe 1606.'
    }),

    person('haldar-freiwinter', 'Haldar Freiwinter', 'male', '1615', '1632'),
    person('bjoern-freiwinter', 'Bjoern Freiwinter', 'male', '1622', '1669', { title: 'Hesir des Clans Freiwinter' }),
    spouse('vedis-wellensaenger', 'Vedis Wellensänger', 'female', '1630', '1699', 'house-wellensaenger'),
    person('vebjorn-freiwinter', 'Vebjorn Freiwinter', 'male', '1627', '1681', { title: 'Hesir des Clans Freiwinter' }),
    spouse('sigrid-skjegg', 'Sigrid Skjegg', 'female', '1631', '1712', 'house-skjegg'),

    person('alfhild-freiwinter', 'Alfhild Freiwinter', 'female', '1649', '', {
      notes: 'Die Quelle nennt keine Ehe; deshalb wird keine Wegverheiratung erfunden.'
    }),
    person('jakul-freiwinter', 'Jakul Freiwinter', 'male', '1650', '1701', { title: 'Hesir des Clans Freiwinter' }),
    spouse('torborg-varulv', 'Torborg Varulv', 'female', '1652', '1735', 'house-varulv'),
    awayWoman('svenja-freiwinter', 'Svenja Freiwinter', '1650', '1713', 'Clan Schwarzdorn'),
    spouse('vignar-schwarzdorn', 'Vignar Schwarzdorn', 'male', '1647', '1703', 'house-schwarzdorn'),
    awayWoman('ljosdis-freiwinter', 'Ljosdis Freiwinter', '1653', '1709', 'Clan Silberzunge'),
    spouse('thorkel-silberzunge', 'Thorkel Silberzunge', 'male', '1651', '1720', 'house-silberzunge'),
    person('sigurd-freiwinter', 'Sigurd Freiwinter', 'male', '1655', '1711'),
    spouse('frida-feuerhaar', 'Frida Feuerhaar', 'female', '1656', '', 'house-feuerhaar'),

    person('fridthjof-freiwinter', 'Fridthjof Freiwinter', 'male', '1670', '', { title: 'Hesir des Clans Freiwinter seit 1701' }),
    spouse('katla-skaal', 'Katla Skaal', 'female', '1672', '', 'house-skaal'),
    awayWoman('freydis-freiwinter', 'Freydis Freiwinter', '1673', '', 'Clan Skogg'),
    spouse('skule-skogg', 'Skule Skogg', 'male', '1672', '', 'house-skogg'),
    person('hjalmar-freiwinter', 'Hjalmar Freiwinter', 'male', '1673', '1720'),
    spouse('gwelda-grindel', 'Gwelda Grendel', 'female', '1674', '', 'house-grendel'),
    awayWoman('hjalmfrid-freiwinter', 'Hjalmfrid Freiwinter', '1675', '', 'Clan Durthacht'),
    spouse('brychan-durthacht', 'Brychan Durthacht', 'male', '1674', '', 'house-durthacht'),

    person('erling-freiwinter', 'Erling Freiwinter', 'male', '1695', '', { title: 'Erster Erbe des Clans Freiwinter' }),
    spouse('revna-sterkr', 'Revna Sterkr', 'female', '1697', '', 'house-sterkr'),
    awayWoman('angreboda-freiwinter', 'Angreboda Freiwinter', '1697', '1721', 'Clan Schwarzdorn'),
    spouse('miermir-schwarzdorn', 'Miermir Schwarzdorn', 'male', '1696', '1720', 'house-schwarzdorn'),
    awayWoman('edda-freiwinter', 'Edda Freiwinter', '1705', '', 'Clan Varulv'),
    spouse('gunnvor-varulv', 'Gunnvor Varulv', 'male', '1705', '', 'house-varulv'),
    person('brunwulf-freiwinter', 'Brunwulf Freiwinter', 'male', '1703', ''),
    spouse('maeva-schwarzdorn', 'Maeva Schwarzdorn', 'female', '1707', '', 'house-schwarzdorn'),
    person('reidar-freiwinter', 'Reidar Freiwinter', 'male', '1698', ''),
    spouse('estridd-nachtjaeger', 'Estridd Nachtjäger', 'female', '1699', '', 'house-nachtjaeger'),

    person('hrapp-freiwinter', 'Hrapp Freiwinter', 'male', '1721', '', { title: 'Zweiter Erbe des Clans Freiwinter' }),
    person('gaute-freiwinter', 'Gaute Freiwinter', 'male', '1723', ''),
    person('stig-freiwinter', 'Stig Freiwinter', 'male', '1726', '', { title: 'Dritter Erbe des Clans Freiwinter' }),
    person('leif-freiwinter', 'Leif Freiwinter', 'male', '1723', ''),
    person('vidar-freiwinter', 'Vidar Freiwinter', 'male', '1729', ''),
    person('egil-freiwinter', 'Egil Freiwinter', 'male', '1722', ''),
    person('hulda-freiwinter', 'Hulda Freiwinter', 'female', '1728', '')
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(marriage),
  parentages: [
    ...claimedChildren(['ketill-freiwinter', 'svangun-freiwinter', 'fenrir-freiwinter'], 'marriage-vigulf-sif-varulv'),
    ...childrenOf(['brynjolf-freiwinter', 'brynhild-freiwinter'], 'marriage-ketill-gudrun-freiwinter'),
    ...childrenOf(['hildigunn-freiwinter', 'hoskuld-freiwinter'], 'marriage-fenrir-gelda-freiwinter'),
    ...childrenOf(['haldar-freiwinter', 'bjoern-freiwinter'], 'marriage-brynjolf-ragnhild-freiwinter'),
    ...childrenOf(['vebjorn-freiwinter'], 'marriage-hoskuld-fenja-freiwinter'),
    ...childrenOf(['alfhild-freiwinter'], 'marriage-bjoern-vedis-freiwinter'),
    ...childrenOf(['jakul-freiwinter', 'svenja-freiwinter', 'ljosdis-freiwinter', 'sigurd-freiwinter'], 'marriage-vebjorn-sigrid-freiwinter'),
    ...childrenOf(['fridthjof-freiwinter', 'freydis-freiwinter'], 'marriage-torborg-jakul-varulv'),
    ...childrenOf(['hjalmar-freiwinter', 'hjalmfrid-freiwinter'], 'marriage-sigurd-frida-freiwinter'),
    ...childrenOf(['erling-freiwinter', 'angreboda-freiwinter', 'edda-freiwinter', 'brunwulf-freiwinter'], 'marriage-fridthjof-katla-freiwinter'),
    ...childrenOf(['reidar-freiwinter'], 'marriage-hjalmar-gwelda-freiwinter'),
    ...childrenOf(['hrapp-freiwinter', 'gaute-freiwinter', 'stig-freiwinter'], 'marriage-erling-revna-freiwinter'),
    ...childrenOf(['leif-freiwinter', 'vidar-freiwinter'], 'marriage-brunwulf-maeva-freiwinter'),
    ...childrenOf(['egil-freiwinter', 'hulda-freiwinter'], 'marriage-reidar-estridd-freiwinter')
  ],
  cadetBranches: [
    marriedAway('married-away-svangun-freiwinter-windhueter', 'Clan Windhüter', 'marriage-svangun-snorri-freiwinter', 'house-windhueter', 'haus-windhueter'),
    marriedAway('married-away-brynhild-freiwinter-riesentot', 'Clan Riesentot', 'marriage-brynhild-ragnar-freiwinter', 'house-riesentot', 'haus-riesentot'),
    marriedAway('married-away-hildigunn-freiwinter-brathfengr', 'Clan Brathfengr', 'marriage-hildigunn-halstein-freiwinter', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-svenja-freiwinter-schwarzdorn', 'Clan Schwarzdorn', 'marriage-svenja-vignar-freiwinter', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-ljosdis-freiwinter-silberzunge', 'Clan Silberzunge', 'marriage-ljosdis-thorkel-freiwinter', 'house-silberzunge', 'haus-silberzunge'),
    marriedAway('married-away-freydis-freiwinter-skogg', 'Clan Skogg', 'marriage-freydis-skule-freiwinter', 'house-skogg', 'haus-skogg'),
    marriedAway('married-away-hjalmfrid-freiwinter-durthacht', 'Clan Durthacht', 'marriage-hjalmfrid-brychan-freiwinter', 'house-durthacht', 'haus-durthacht'),
    marriedAway('married-away-angreboda-freiwinter-schwarzdorn', 'Clan Schwarzdorn', 'marriage-angreboda-miermir-freiwinter', 'house-schwarzdorn', 'haus-schwarzdorn', HOUSE_EMBLEMS.schwarzdorn),
    marriedAway('married-away-edda-freiwinter-varulv', 'Clan Varulv', 'marriage-gunnvor-edda-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-vigulf-sif-varulv',
      parentPersonId: '',
      childIds: ['ketill-freiwinter', 'svangun-freiwinter', 'fenrir-freiwinter'],
      years: 0,
      fromYear: '????',
      toYear: '1576',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner: Der Zeitsprung folgt erst nach dem Hauswappen und steht niemals parallel zu einer anderen Fortsetzung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-vigulf-sif-varulv',
    houseId: FREIWINTER_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Wolfswacht · Kadettenclan der Varulv',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'vigulf-varulv',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 5,
    sourceModule: 'Clan Freiwinter (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Genealogie folgt der bereitgestellten Freiwinter-Hausseite. Vigulf Varulv und Sif stehen als Gründer vor dem Freiwinter-Wappen; genau ein serieller Zeitsprung führt danach zu Ketill, Svangun und Fenrir. Die im Hofteil genannten Jahresbereiche der Hesire sind Amtszeiten, nicht Lebensdaten; Lebensdaten stammen aus der genealogischen Tabelle. Sämtliche belegten Ehen von Freiwinter-Frauen erhalten direkte Wegverheiratet-Knoten. Jakul/Torborg sowie Edda/Gunnvor verwenden dieselben Weltpersonen und Partnerschaften wie die Varulv-Gegenakte; die Kinder Eddas und Gunnvors werden ausschließlich bei den Varulv fortgeführt. Ljosdis Freiwinter und Thorkel Silberzunge teilen ihre 1709 durch Ljosdis Tod beendete Ehe mit der Silberzungen-Gegenakte. Die Grendel-Gegenakte präzisiert Gwelda Grendel auf 1674–lebend und beendet ihre Ehe mit Hjalmar durch dessen Tod 1720; ihr Sohn Reidar bleibt ausschließlich in der Freiwinter-Linie. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
