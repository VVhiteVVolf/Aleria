import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SKALD_PORTRAITS } from './house-skald-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const SKALD_HOUSE_ID = 'house-skald';
const BRAGI_TIME_JUMP_ID = 'gap-bragi-ragnor-skald';
const PARENT_PAIR_OVER_CHILD_EXTENSION = 'chartAlignParentPairOverChildPersonId';

const HOUSE_EMBLEMS = Object.freeze({
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  eisenjungfer: RORIKSHEIM_HOUSE_EMBLEMS.eisenjungfer,
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf
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
  'jurgen-windrufer-skald',
  'bragi-skald',
  'ragnor-skald',
  'eirekr-skald',
  'oleg-skald',
  'ketill-skald',
  'ulfrik-skald',
  'ragnar-skald'
]);

const MAINLINE_IDS = new Set([
  'bjoern-skald',
  'ubbe-skald',
  'hvitserk-skald',
  'sigurd-skald',
  'ivar-skald'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SKALD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SKALD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SKALD_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['jurgen-windrufer-skald', 'saga-skald'],
  bragi: ['bragi-skald', 'unknown-bragi-spouse-skald'],
  gefjon: ['kvasir-founder-brathfengr', 'gefjon-skald'],
  sjofn: ['forseti-soekeren-founder', 'sjofn-skald'],
  var: ['aegir-sterkr-founder', 'var-skald'],
  ragnor: ['ragnor-skald', 'mistkatla-sterkr'],
  aslaug: ['caedmon-ceirwyn', 'aslaug-skald'],
  eirekr: ['eirekr-skald', 'ormrun-grindel'],
  fenja: ['hoskuld-freiwinter', 'fenja-skald'],
  alarik: ['alarik-skald', 'loralia-adorin'],
  oleg: ['oleg-skald', 'roisin-urquhart'],
  svanhild: ['eldar-varulv', 'svanhild-skald'],
  lodvar: ['lodvar-skald', 'ailionora-bhaird'],
  halfdan: ['halfdan-skald', 'alfrun-frostauge'],
  ketill: ['ketill-skald', 'freydis-skaal'],
  glodis: ['munthor-brathfengr', 'glodis-skald'],
  fjornir: ['fjornir-skald', 'baldkatla-skald-spouse'],
  svartulf: ['svartulf-skald', 'glaumur-eisenbieger'],
  ulfrik: ['ulfrik-skald', 'rikke-soekeren'],
  angebroda: ['angebroda-skald', 'borg-wargh'],
  bryndis: ['fjorlag-wellensaenger', 'bryndis-skald'],
  mjolnir: ['mjolnir-skald', 'irmgard-soekering'],
  oddmar: ['oddmar-skald', 'gerdur-skald-spouse'],
  ragnar: ['ragnar-skald', 'lagertha-eisenjungfer'],
  antje: ['gleipnir-varulv', 'antke-skald-varulv'],
  antke: ['mandon-ceirwyn', 'antke-skald'],
  ran: ['rognar-nachtjaeger', 'ran-skald'],
  galmar: ['linnea-sterkr', 'galmar-skald'],
  hjordis: ['kjallak-soekeren', 'hjordis-skald'],
  vebjorn: ['vebjorn-skald', 'treasa-morath'],
  hogrand: ['hogrand-skald', 'solveig-skald'],
  bjoern: ['bjoern-skald', 'gulda-ragnulf']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-jurgen-saga-skald': COUPLES.founders,
  'marriage-bragi-unknown-skald': COUPLES.bragi,
  'marriage-kvasir-gefjon-brathfengr': COUPLES.gefjon,
  'marriage-forseti-sjofn-soekeren': COUPLES.sjofn,
  'marriage-aegir-var-sterkr': COUPLES.var,
  'marriage-ragnor-mistkatla-sterkr': COUPLES.ragnor,
  'marriage-caedmon-aslaug-ceirwyn': COUPLES.aslaug,
  'marriage-eirekr-ormrun-skald': COUPLES.eirekr,
  'marriage-hoskuld-fenja-freiwinter': COUPLES.fenja,
  'marriage-alarik-loralia-skald': COUPLES.alarik,
  'marriage-oleg-roisin-skald': COUPLES.oleg,
  'marriage-eldar-svanhild-varulv': COUPLES.svanhild,
  'marriage-lodvar-ailionora-skald': COUPLES.lodvar,
  'marriage-halfdan-alfrun-skald': COUPLES.halfdan,
  'marriage-ketill-freydis-skald': COUPLES.ketill,
  'marriage-munthor-glodis-brathfengr': COUPLES.glodis,
  'marriage-fjornir-baldkatla-skald': COUPLES.fjornir,
  'marriage-svartulf-glaumur-skald': COUPLES.svartulf,
  'marriage-ulfrik-rikke-soekeren': COUPLES.ulfrik,
  'marriage-angebroda-borg-skald': COUPLES.angebroda,
  'marriage-fjorlag-bryndis-skald': COUPLES.bryndis,
  'marriage-mjolnir-irmgard-skald': COUPLES.mjolnir,
  'marriage-oddmar-gerdur-skald': COUPLES.oddmar,
  'marriage-ragnar-lagertha-skald': COUPLES.ragnar,
  'marriage-gleipnir-antke-varulv': COUPLES.antje,
  'marriage-mandon-antke-ceirwyn': COUPLES.antke,
  'marriage-rognar-ran-nachtjaeger': COUPLES.ran,
  'marriage-linnea-galmar-sterkr': COUPLES.galmar,
  'marriage-kjallak-hjordis-soekeren': COUPLES.hjordis,
  'marriage-vebjorn-treasa-skald': COUPLES.vebjorn,
  'marriage-hogrand-solveig-skald': COUPLES.hogrand,
  'engagement-bjoern-gulda-skald': COUPLES.bjoern
});

const PARTNERSHIP_OPTIONS = Object.freeze({
  'marriage-jurgen-saga-skald': Object.freeze({ status: 'ended' }),
  'marriage-bragi-unknown-skald': Object.freeze({ status: 'ended' }),
  'marriage-forseti-sjofn-soekeren': Object.freeze({ status: 'ended' }),
  'marriage-aegir-var-sterkr': Object.freeze({ status: 'ended' }),
  'marriage-ragnor-mistkatla-sterkr': Object.freeze({ status: 'ended', end: '1687' }),
  'marriage-caedmon-aslaug-ceirwyn': Object.freeze({ status: 'widowed', end: '1650' }),
  'marriage-eirekr-ormrun-skald': Object.freeze({ status: 'ended', end: '1681' }),
  'marriage-alarik-loralia-skald': Object.freeze({ status: 'ended', end: '1740' }),
  'marriage-oleg-roisin-skald': Object.freeze({ status: 'ended', end: '1711' }),
  'marriage-lodvar-ailionora-skald': Object.freeze({ status: 'ended', end: '1704' }),
  'marriage-halfdan-alfrun-skald': Object.freeze({ status: 'ended', end: '1703' }),
  'marriage-ketill-freydis-skald': Object.freeze({ status: 'ended', end: '1720' }),
  'marriage-fjornir-baldkatla-skald': Object.freeze({ status: 'ended', end: '1704' }),
  'marriage-svartulf-glaumur-skald': Object.freeze({
    status: 'ended',
    end: '1720',
    extensions: Object.freeze({
      [PARENT_PAIR_OVER_CHILD_EXTENSION]: 'oddmar-skald',
      registryManagedExtensionFields: Object.freeze([PARENT_PAIR_OVER_CHILD_EXTENSION])
    })
  }),
  'marriage-ulfrik-rikke-soekeren': Object.freeze({ status: 'ended', end: '1720' }),
  'marriage-angebroda-borg-skald': Object.freeze({ status: 'widowed', end: '1734' }),
  'marriage-linnea-galmar-sterkr': Object.freeze({ status: 'ended', end: '1740' }),
  'marriage-oddmar-gerdur-skald': Object.freeze({
    extensions: Object.freeze({
      [PARENT_PAIR_OVER_CHILD_EXTENSION]: 'solveig-skald',
      registryManagedExtensionFields: Object.freeze([PARENT_PAIR_OVER_CHILD_EXTENSION])
    })
  }),
  'engagement-bjoern-gulda-skald': Object.freeze({ type: 'engagement' })
});

function partnership(partnershipId) {
  return createMarriage(
    partnershipId,
    ...PARTNERS_BY_ID[partnershipId],
    PARTNERSHIP_OPTIONS[partnershipId] || {}
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'skald-parentage',
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

export const HOUSE_SKALD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-skald',
    title: 'Clan Skald',
    motto: '',
    description: 'Hesire-Clan von Klangheim im Thanentum Skaldenheim. Der Clan geht auf Jurgen „Windrufer“ zurück, dessen Schüler die späteren Clans Brathfengr, Sökeren und Sterkr begründeten.',
    emblem: HOUSE_EMBLEMS.skald,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.skald
  },
  houses: [
    house(SKALD_HOUSE_ID, 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-grindel', 'Clan Grindel'),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-adorin', 'Haus Adorin'),
    house('house-urquhart', 'Clan Urquhart'),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-bhaird', 'Haus Bhaird'),
    house('house-frostauge', 'Clan Frostauge'),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-wellensaenger', 'Clan Wellensänger'),
    house('house-soekering', 'Haus Sökering'),
    house('house-eisenjungfer', 'Clan Eisenjungfer', HOUSE_EMBLEMS.eisenjungfer),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-morath', 'Clan Morath'),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf)
  ],
  persons: [
    person('jurgen-windrufer-skald', 'Jurgen „Windrufer“ Skald', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Begründer und erster Hesir des Clans Skald · Begründer der Tradition der Skalden',
      tags: ['Gründer', 'Hesir'],
      notes: 'Legendärer Tungur und Barde; Lehrer Kvasirs, Forsetis und Aegirs sowie Verteidiger des späteren Klangheim.'
    }),
    spouse('saga-skald', 'Saga Skald', 'female', '????', '????', SKALD_HOUSE_ID),

    person('bragi-skald', 'Bragi Skald', 'male', '????', '????', {
      title: 'Hesir des Clans Skald'
    }),
    awayWoman('gefjon-skald', 'Gefjon Skald', '????', '????', 'Clan Brathfengr'),
    awayWoman('sjofn-skald', 'Sjöfn Skald', '????', '????', 'Clan Sökeren'),
    awayWoman('var-skald', 'Vár Skald', '????', '????', 'Clan Sterkr'),
    spouse('unknown-bragi-spouse-skald', '???', 'female', '????', '????'),
    spouse('kvasir-founder-brathfengr', 'Kvasir der Trommler', 'male', '????', '????', 'house-brathfengr'),
    spouse('forseti-soekeren-founder', 'Forseti der Trompeter', 'male', '????', '????', 'house-soekeren'),
    spouse('aegir-sterkr-founder', 'Aegir der Streicher', 'male', '????', '????', 'house-sterkr'),

    person('ragnor-skald', 'Ragnor Skald', 'male', '1591', '1687', {
      title: 'Hesir des Clans Skald bis 1687 · Skalde und Herdwächter',
      notes: 'Die Quelle nennt ihn 36 Jahre alt zu Beginn des von ihm besungenen Krieges.'
    }),
    awayWoman('aslaug-skald', 'Aslaug Skald', '1592', '1693', 'Haus Ceirwyn', {
      notes: 'Die Skald-Hausquelle nennt 1693 als Todesjahr; die ältere Ceirwyn-Gegenakte führte abweichend 1690.'
    }),
    spouse('mistkatla-sterkr', 'Mistkatla Sterkr', 'female', '1591', '1690', 'house-sterkr', {
      notes: 'Ehefrau Ragnors und anhand der Stammbaumgrafik Mutter von Eirekr, Fenja und Alarik. Die Kinderüberschrift ersetzt ihren Namen widersprüchlich durch „??“.'
    }),
    spouse('caedmon-ceirwyn', 'Caedmon Ceirwyn', 'male', '1589', '1650', 'house-ceirwyn'),

    person('eirekr-skald', 'Eirekr Skald', 'male', '1608', '1697', {
      title: 'Hesir des Clans Skald 1687–1697'
    }),
    awayWoman('fenja-skald', 'Fenja Skald', '1608', '1710', 'Clan Freiwinter', {
      notes: 'Die Skald-Hausquelle nennt 1608 als Geburtsjahr; die ältere Freiwinter-Gegenakte führte abweichend 1606.'
    }),
    person('alarik-skald', 'Alarik Skald', 'male', '1612', '', {
      title: 'Chronist und Gefährte Galmars',
      notes: 'War laut Quelle 15 Jahre alt zu Beginn des von Ragnor besungenen Krieges und schrieb ihn später anhand von Zeugnissen nieder.'
    }),
    spouse('ormrun-grindel', 'Ormrún Grindel', 'female', '1608', '1681', 'house-grindel', {
      notes: 'Ehefrau Eirekrs und anhand der Stammbaumgrafik Mutter von Oleg, Svanhild und Lodvar. Die Kinderüberschrift ersetzt ihren Namen widersprüchlich durch „??“.'
    }),
    spouse('hoskuld-freiwinter', 'Hoskuld Freiwinter', 'male', '1605', '1628', 'house-freiwinter'),
    spouse('loralia-adorin', 'Loralia Adorin', 'female', '1627', '1740', 'house-adorin'),

    person('oleg-skald', 'Oleg Skald', 'male', '1626', '1711', {
      title: 'Hesir des Clans Skald 1697–1711'
    }),
    awayWoman('svanhild-skald', 'Svanhild Skald', '1628', '1702', 'Clan Varulv'),
    person('lodvar-skald', 'Lodvar Skald', 'male', '1630', '1704'),
    person('halfdan-skald', 'Halfdan Skald', 'male', '1648', '1703'),
    spouse('roisin-urquhart', 'Róisín Urquhart', 'female', '1630', '????', 'house-urquhart'),
    spouse('eldar-varulv', 'Eldar Varulv', 'male', '1599', '1667', 'house-varulv'),
    spouse('ailionora-bhaird', 'Ailionóra Bhaird', 'female', '????', '????', 'house-bhaird'),
    spouse('alfrun-frostauge', 'Alfrún Frostauge', 'female', '1649', '????', 'house-frostauge'),

    person('ketill-skald', 'Ketill Skald', 'male', '1650', '1720', {
      title: 'Hesir des Clans Skald 1711–1720'
    }),
    awayWoman('glodis-skald', 'Glódís Skald', '1655', '', 'Clan Brathfengr'),
    person('hrappson-skald', 'Hrappson Skald', 'male', '1651', '1672'),
    person('fjornir-skald', 'Fjornir Skald', 'male', '1653', '1720'),
    person('valbrand-skald', 'Valbrand Skald', 'male', '1668', '1672'),
    person('svartulf-skald', 'Svartulf Skald', 'male', '1671', '1720'),
    spouse('freydis-skaal', 'Freydis Skaal', 'female', '1651', '1717', 'house-skaal'),
    spouse('munthor-brathfengr', 'Munthor Brathfengr', 'male', '????', '', 'house-brathfengr'),
    spouse('baldkatla-skald-spouse', 'Baldkatla', 'female', '1655', '1704', '', {
      notes: 'Die Kinderüberschrift schreibt ihren Namen einmalig „Baldkatkla“; die Personenzeile und Stammbaumgrafik belegen Baldkatla.'
    }),
    spouse('glaumur-eisenbieger', 'Glaumur Eisenbieger', 'male', '1672', '', 'house-eisenbieger'),

    person('ulfrik-skald', 'Ulfrik Skald', 'male', '1668', '1720', {
      title: 'Hesir des Clans Skald im Jahr 1720'
    }),
    awayWoman('angebroda-skald', 'Angebroda Skald', '1670', '', 'Clan Wargh'),
    awayWoman('bryndis-skald', 'Bryndís Skald', '1674', '', 'Clan Wellensänger'),
    person('mjolnir-skald', 'Mjolnir Skald', 'male', '1679', ''),
    person('oddmar-skald', 'Oddmar Skald', 'male', '1689', ''),
    spouse('rikke-soekeren', 'Rikke Sökeren', 'female', '1672', '1720', 'house-soekeren'),
    spouse('borg-wargh', 'Borg Wargh', 'male', '1667', '1734', 'house-wargh'),
    spouse('fjorlag-wellensaenger', 'Fjorlag Wellensänger', 'male', '1669', '', 'house-wellensaenger'),
    spouse('irmgard-soekering', 'Irmgard Sökering', 'female', '1680', '', 'house-soekering'),
    spouse('gerdur-skald-spouse', 'Gerdur', 'female', '1691', ''),

    person('ragnar-skald', 'Ragnar Skald', 'male', '1688', '', {
      title: 'Hesir des Clans Skald seit 1720'
    }),
    awayWoman('antke-skald-varulv', 'Antje Skald', '1695', '', 'Clan Varulv', {
      notes: 'Die Skald-Quelle unterscheidet Antje (1695, Ehe mit Gleipnir Varulv) ausdrücklich von Antke (1696, Ehe mit Mandon Ceirwyn). Die ältere Varulv-Gegenakte schrieb Antjes Namen fälschlich ebenfalls Antke.'
    }),
    awayWoman('antke-skald', 'Antke Skald', '1696', '', 'Haus Ceirwyn'),
    awayWoman('ran-skald', 'Ran Skald', '1695', '', 'Clan Nachtjäger'),
    person('galmar-skald', 'Galmar Skald', 'male', '1692', '1740'),
    awayWoman('hjordis-skald', 'Hjördis Skald', '1700', '', 'Clan Sökeren', {
      notes: 'Die Skald-Hausquelle nennt 1700 als Geburtsjahr; die ältere Sökeren-Gegenakte führte abweichend 1705.'
    }),
    person('vebjorn-skald', 'Vebjorn Skald', 'male', '1703', ''),
    person('hogrand-skald', 'Hogrand Skald', 'male', '1707', '', {
      notes: 'Sohn von Mjolnir Skald und Irmgard Sökering; Ehemann Solveigs und Vater von Lilja und Hildr.'
    }),
    person('solveig-skald', 'Solveig Skald', 'female', '1710', '', {
      notes: 'Einziges Kind von Oddmar Skald und Gerdur; Ehefrau Hogrands und Mutter von Lilja und Hildr.'
    }),
    spouse('lagertha-eisenjungfer', 'Lagertha Eisenjungfer', 'female', '1691', '', 'house-eisenjungfer', {
      notes: 'Tochter des amtierenden Eisenjungfer-Oberhaupts Hervor. Ihre Ehe mit Ragnar und die gemeinsamen Kinder werden hier als fortgeführte Skald-Linie dargestellt.'
    }),
    spouse('gleipnir-varulv', 'Gleipnir Varulv', 'male', '1694', '', 'house-varulv'),
    spouse('mandon-ceirwyn', 'Mandon Ceirwyn O’Calon', 'male', '1690', '', 'house-ceirwyn'),
    spouse('rognar-nachtjaeger', 'Rognar Nachtjäger', 'male', '1693', '', 'house-nachtjaeger'),
    spouse('linnea-sterkr', 'Linnea Sterkr', 'female', '1699', '', 'house-sterkr'),
    spouse('kjallak-soekeren', 'Kjallak Sökeren', 'male', '1702', '', 'house-soekeren'),
    spouse('treasa-morath', 'Treasa Morath', 'female', '1704', '', 'house-morath'),

    person('bjoern-skald', 'Bjoern Skald', 'male', '1712', '', {
      title: 'Erster Erbe des Clans Skald'
    }),
    person('gyda-skald', 'Gyda Skald', 'female', '1714', ''),
    person('ubbe-skald', 'Ubbe Skald', 'male', '1715', '', {
      title: 'Zweiter Erbe des Clans Skald'
    }),
    person('hvitserk-skald', 'Hvitserk Skald', 'male', '1716', '', {
      title: 'Dritter Erbe des Clans Skald'
    }),
    person('sigurd-skald', 'Sigurd Skald', 'male', '1717', '', {
      title: 'Vierter Erbe des Clans Skald'
    }),
    person('ivar-skald', 'Ivar Skald', 'male', '1719', '', {
      title: 'Fünfter Erbe des Clans Skald'
    }),
    person('freya-skald', 'Freya Skald', 'female', '1720', ''),
    person('kalf-skald', 'Kalf Skald', 'male', '1720', ''),
    person('fenja-1723-skald', 'Fenja Skald', 'female', '1723', ''),
    person('sinrig-skald', 'Sinrig Skald', 'male', '1726', ''),
    person('igor-skald', 'Igor Skald', 'male', '1722', ''),
    person('katlin-skald', 'Katlin Skald', 'female', '1725', ''),
    person('lilja-skald', 'Lilja Skald', 'female', '1728', ''),
    person('hildr-skald', 'Hildr Skald', 'female', '1734', ''),
    spouse('gulda-ragnulf', 'Gulda Ragnulf', 'female', '1710', '', 'house-ragnulf', {
      title: 'Verlobte Bjoerns'
    })
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(partnership),
  parentages: [
    ...childrenOf(['bragi-skald', 'gefjon-skald', 'sjofn-skald', 'var-skald'], 'marriage-jurgen-saga-skald'),
    ...claimedChildren(
      ['ragnor-skald', 'aslaug-skald'],
      'marriage-bragi-unknown-skald',
      BRAGI_TIME_JUMP_ID,
      'Die Quelle überspringt zwischen Bragi und seiner unbekannten Frau sowie Ragnor und Aslaug mehrere nicht einzeln überlieferte Generationen.'
    ),
    ...childrenOf(['eirekr-skald', 'fenja-skald', 'alarik-skald'], 'marriage-ragnor-mistkatla-sterkr'),
    ...childrenOf(['oleg-skald', 'svanhild-skald', 'lodvar-skald'], 'marriage-eirekr-ormrun-skald'),
    ...childrenOf(['halfdan-skald'], 'marriage-alarik-loralia-skald'),
    ...childrenOf(['ketill-skald', 'glodis-skald'], 'marriage-oleg-roisin-skald'),
    ...childrenOf(['hrappson-skald', 'fjornir-skald'], 'marriage-lodvar-ailionora-skald'),
    ...childrenOf(['valbrand-skald', 'svartulf-skald'], 'marriage-halfdan-alfrun-skald'),
    ...childrenOf(['ulfrik-skald', 'angebroda-skald'], 'marriage-ketill-freydis-skald'),
    ...childrenOf(['bryndis-skald', 'mjolnir-skald'], 'marriage-fjornir-baldkatla-skald'),
    ...childrenOf(['oddmar-skald'], 'marriage-svartulf-glaumur-skald'),
    ...childrenOf(
      ['ragnar-skald', 'antke-skald-varulv', 'antke-skald', 'ran-skald', 'galmar-skald'],
      'marriage-ulfrik-rikke-soekeren'
    ),
    ...childrenOf(['hjordis-skald', 'vebjorn-skald', 'hogrand-skald'], 'marriage-mjolnir-irmgard-skald'),
    ...childrenOf(['solveig-skald'], 'marriage-oddmar-gerdur-skald'),
    ...childrenOf(
      ['bjoern-skald', 'gyda-skald', 'ubbe-skald', 'hvitserk-skald', 'sigurd-skald', 'ivar-skald', 'freya-skald'],
      'marriage-ragnar-lagertha-skald'
    ),
    ...childrenOf(['kalf-skald', 'fenja-1723-skald', 'sinrig-skald'], 'marriage-linnea-galmar-sterkr'),
    ...childrenOf(['igor-skald', 'katlin-skald'], 'marriage-vebjorn-treasa-skald'),
    ...childrenOf(['lilja-skald', 'hildr-skald'], 'marriage-hogrand-solveig-skald')
  ],
  cadetBranches: [
    marriedAway('married-away-gefjon-skald-brathfengr', 'Clan Brathfengr', 'marriage-kvasir-gefjon-brathfengr', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-sjofn-skald-soekeren', 'Clan Sökeren', 'marriage-forseti-sjofn-soekeren', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren),
    marriedAway('married-away-var-skald-sterkr', 'Clan Sterkr', 'marriage-aegir-var-sterkr', 'house-sterkr', 'haus-sterkr', HOUSE_EMBLEMS.sterkr),
    marriedAway('married-away-aslaug-skald-ceirwyn', 'Haus Ceirwyn', 'marriage-caedmon-aslaug-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-fenja-skald-freiwinter', 'Clan Freiwinter', 'marriage-hoskuld-fenja-freiwinter', 'house-freiwinter', 'haus-freiwinter', HOUSE_EMBLEMS.freiwinter),
    marriedAway('married-away-svanhild-skald-varulv', 'Clan Varulv', 'marriage-eldar-svanhild-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-glodis-skald-brathfengr', 'Clan Brathfengr', 'marriage-munthor-glodis-brathfengr', 'house-brathfengr', 'haus-brathfengr', HOUSE_EMBLEMS.brathfengr),
    marriedAway('married-away-angebroda-skald-wargh', 'Clan Wargh', 'marriage-angebroda-borg-skald', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-bryndis-skald-wellensaenger', 'Clan Wellensänger', 'marriage-fjorlag-bryndis-skald', 'house-wellensaenger', 'haus-wellensaenger'),
    marriedAway('married-away-antje-skald-varulv', 'Clan Varulv', 'marriage-gleipnir-antke-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-antke-skald-ceirwyn', 'Haus Ceirwyn', 'marriage-mandon-antke-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-ran-skald-nachtjaeger', 'Clan Nachtjäger', 'marriage-rognar-ran-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-hjordis-skald-soekeren', 'Clan Sökeren', 'marriage-kjallak-hjordis-soekeren', 'house-soekeren', 'haus-soekeren', HOUSE_EMBLEMS.soekeren)
  ],
  timeJumps: [
    timeJump(
      BRAGI_TIME_JUMP_ID,
      'marriage-bragi-unknown-skald',
      ['ragnor-skald', 'aslaug-skald'],
      '????',
      '1591',
      'Nicht einzeln überlieferte Generationen'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-jurgen-saga-skald',
    houseId: SKALD_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Klangheim · Vasallen der Brathfengr',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'jurgen-windrufer-skald',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: 'Clan Skald (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Akte übernimmt 78 benannte Quellpersonen sowie die für Bragis Fortsetzung notwendige unbekannte Ehefrau, 32 Verbindungen und 47 Abstammungen. Jurgen und Saga stehen vor dem Stammwappen; genau ein absolut serieller Zeitsprung führt ausschließlich unter Bragi und seiner unbekannten Frau zu Ragnor und Aslaug. Dreizehn belegte auswärtige Ehen von Skald-Frauen besitzen direkte Zielhausknoten; Kinder in den Gegenakten Brathfengr, Sökeren, Sterkr, Ceirwyn, Freiwinter, Varulv und Nachtjäger werden hier nicht gedoppelt. Mjolnir und Irmgard Sökering haben Hjördis, Vebjorn und Hogrand als Kinder; Oddmar und Gerdur haben ausschließlich Solveig. Hogrand und Solveig bilden anschließend ihr eigenes Ehepaar, unter dem Lilja und Hildr fortgeführt werden. Aufgelöste Quellfehler: Die Kinderüberschriften verschweigen Mistkatla bei Ragnor und Ormrún bei Eirekr, obwohl Ehezeilen und Stammbaumgrafik beide Mütter eindeutig belegen; „Baldkatkla“ ist ein isolierter Schreibfehler für Baldkatla. Die Skald-Hausquelle ist für die eigenen Clanmitglieder maßgeblich und korrigiert drei abweichende ältere Gegenakten: Aslaug stirbt 1693 statt 1690, Fenja wird 1608 statt 1606 geboren und Hjördis 1700 statt 1705. Außerdem unterscheidet sie Antje (1695, Ehe mit Gleipnir Varulv) klar von Antke (1696, Ehe mit Mandon Ceirwyn); die ältere Varulv-Akte nannte Antje fälschlich ebenfalls Antke. Ungewöhnlich hohe Lebensalter ohne weiteren chronologischen Konflikt sind wegen möglicher magischer Langlebigkeit ausdrücklich kein Widerspruch. Vier namenlose Verlobungsplatzhalter und wiederholte Standardsilhouetten wurden nicht als Individualpersonen importiert.',
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
