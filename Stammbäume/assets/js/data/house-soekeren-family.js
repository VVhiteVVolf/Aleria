import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SOEKEREN_PORTRAITS } from './house-soekeren-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const SOEKEREN_HOUSE_ID = 'house-soekeren';
const FOUNDER_TIME_JUMP_ID = 'gap-forseti-sturlaug-soekeren';

const HOUSE_EMBLEMS = Object.freeze({
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  brathfengr: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
  kampfgeborene: RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene,
  skald: RORIKSHEIM_HOUSE_EMBLEMS.skald,
  sterkr: RORIKSHEIM_HOUSE_EMBLEMS.sterkr,
  skjegg: RORIKSHEIM_HOUSE_EMBLEMS.skjegg,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn
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
  'forseti-soekeren-founder',
  'sturlaug-soekeren',
  'kjartan-soekeren',
  'hvitserk-soekeren',
  'langarr-soekeren',
  'hrothgar-soekeren'
]);

const MAINLINE_IDS = new Set([
  'thorlak-soekeren',
  'balrun-soekeren',
  'ljot-soekeren',
  'hermund-soekeren'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SOEKEREN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SOEKEREN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SOEKEREN_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['forseti-soekeren-founder', 'sjofn-skald'],
  sturlaug: ['sturlaug-soekeren', 'bylgja-wellenschild'],
  laufdis: ['tonvar-riesentot', 'laufdis-soekeren'],
  hallgerd: ['aegir-kampfgeborene', 'hallgerd-soekeren'],
  kjartan: ['kjartan-soekeren', 'bjarnhild-soekeren-spouse'],
  horik: ['horik-soekeren', 'irmtraut-soekeren-spouse'],
  hvitserk: ['isbjalla-1614-brathfengr', 'hvitserk-soekeren'],
  magnhild: ['gruffudd-ceirwyn', 'magnhild-sokaren'],
  langarr: ['skadi-sterkr', 'langarr-soekeren'],
  thorhild: ['halfdan-skjegg', 'thorhild-soekaren'],
  hrothgar: ['hrothgar-soekeren', 'fjorgyn-wellensaenger'],
  aslaug: ['steinarr-varulv', 'aslaug-soekeren'],
  thorlak: ['thorlak-soekeren', 'hildegard-soekering'],
  rikke: ['ulfrik-skald', 'rikke-soekeren'],
  skjomi: ['skjomi-soekeren', 'brigid-bhaird'],
  balrun: ['dagrun-brathfengr', 'balrun-soekeren'],
  runa: ['sven-skaal', 'runa-soekaren'],
  liska: ['dagonet-ceirwyn', 'liska-sokaren'],
  kjallak: ['kjallak-soekeren', 'hjordis-skald']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-forseti-sjofn-soekeren': COUPLES.founders,
  'marriage-sturlaug-bylgja-soekeren': COUPLES.sturlaug,
  'marriage-tonvar-laufdis-soekeren': COUPLES.laufdis,
  'marriage-aegir-hallgerd-kampfgeborene': COUPLES.hallgerd,
  'marriage-kjartan-bjarnhild-soekeren': COUPLES.kjartan,
  'marriage-horik-irmtraut-soekeren': COUPLES.horik,
  'marriage-isbjalla-hvitserk-brathfengr': COUPLES.hvitserk,
  'marriage-gruffudd-magnhild-ceirwyn': COUPLES.magnhild,
  'marriage-skadi-langarr-sterkr': COUPLES.langarr,
  'marriage-halfdan-thorhild-skjegg': COUPLES.thorhild,
  'marriage-hrothgar-fjorgyn-soekeren': COUPLES.hrothgar,
  'marriage-steinarr-aslaug-varulv': COUPLES.aslaug,
  'marriage-thorlak-hildegard-soekeren': COUPLES.thorlak,
  'marriage-ulfrik-rikke-soekeren': COUPLES.rikke,
  'marriage-skjomi-brigid-soekeren': COUPLES.skjomi,
  'marriage-dagrun-balrun-brathfengr': COUPLES.balrun,
  'marriage-sven-runa-skaal': COUPLES.runa,
  'marriage-dagonet-liska-ceirwyn': COUPLES.liska,
  'marriage-kjallak-hjordis-soekeren': COUPLES.kjallak
});

const PARTNERSHIP_OPTIONS = Object.freeze({
  'marriage-forseti-sjofn-soekeren': Object.freeze({ status: 'ended' }),
  'marriage-sturlaug-bylgja-soekeren': Object.freeze({ status: 'ended', end: '1634' }),
  'marriage-tonvar-laufdis-soekeren': Object.freeze({ status: 'ended', end: '1627' }),
  'marriage-aegir-hallgerd-kampfgeborene': Object.freeze({ status: 'ended', end: '1632' }),
  'marriage-kjartan-bjarnhild-soekeren': Object.freeze({ status: 'ended', end: '1649' }),
  'marriage-horik-irmtraut-soekeren': Object.freeze({ status: 'ended', end: '1655' }),
  'marriage-gruffudd-magnhild-ceirwyn': Object.freeze({ status: 'widowed', end: '1681' }),
  'marriage-skadi-langarr-sterkr': Object.freeze({ status: 'ended', end: '1720' }),
  'marriage-halfdan-thorhild-skjegg': Object.freeze({ status: 'ended', end: '1693' }),
  'marriage-hrothgar-fjorgyn-soekeren': Object.freeze({ status: 'ended', end: '1737' }),
  'marriage-ulfrik-rikke-soekeren': Object.freeze({ status: 'ended', end: '1720' })
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
    idPrefix: 'soekeren-parentage',
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

export const HOUSE_SOEKEREN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-soekeren',
    title: 'Clan Sökeren',
    motto: '',
    description: 'Hesire-Clan von Klangheim im Thanentum Skaldenheim. Der Clan geht auf Forseti den Trompeter, einen Schüler Jurgens Windrufers, zurück.',
    emblem: HOUSE_EMBLEMS.soekeren,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.soekeren
  },
  houses: [
    house(SOEKEREN_HOUSE_ID, 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-skald', 'Clan Skald', HOUSE_EMBLEMS.skald),
    house('house-wellenschild', 'Clan Wellenschild'),
    house('house-riesentot', 'Clan Riesentot'),
    house('house-kampfgeborene', 'Clan Kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    house('house-brathfengr', 'Clan Brathfengr', HOUSE_EMBLEMS.brathfengr),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-sterkr', 'Clan Sterkr', HOUSE_EMBLEMS.sterkr),
    house('house-skjegg', 'Clan Skjegg', HOUSE_EMBLEMS.skjegg),
    house('house-wellensaenger', 'Clan Wellensänger'),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-soekering', 'Haus Sökering'),
    house('house-bhaird', 'Haus Bhaird'),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal)
  ],
  persons: [
    person('forseti-soekeren-founder', 'Forseti der Trompeter', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Begründer und erster Hesir des Clans Sökeren · Schüler Jurgens Windrufers',
      tags: ['Gründer', 'Hesir']
    }),
    spouse('sjofn-skald', 'Sjöfn Skald', 'female', '????', '????', 'house-skald'),

    person('sturlaug-soekeren', 'Sturlaug Sökeren', 'male', '1578', '1671', {
      title: 'Hesir des Clans Sökeren bis 1671'
    }),
    awayWoman('laufdis-soekeren', 'Laufdís Sökeren', '1574', '????', 'Clan Riesentot'),
    spouse('bylgja-wellenschild', 'Bylgja Wellenschild', 'female', '1579', '1634', 'house-wellenschild'),
    spouse('tonvar-riesentot', 'Tonvar Riesentot', 'male', '1572', '1627', 'house-riesentot'),

    awayWoman('hallgerd-soekeren', 'Hallgerd Sökeren', '1600', '1698', 'Clan Kampfgeborene'),
    person('kjartan-soekeren', 'Kjartan Sökeren', 'male', '1597', '1686', {
      title: 'Hesir des Clans Sökeren 1671–1686'
    }),
    person('horik-soekeren', 'Horik Sökeren', 'male', '1606', '1712', {
      title: 'Sänger und Chronist des Krieges'
    }),
    spouse('aegir-kampfgeborene', 'Aegir Kampfgeborener', 'male', '1599', '1632', 'house-kampfgeborene'),
    spouse('bjarnhild-soekeren-spouse', 'Bjarnhild', 'female', '1597', '1649', '', {
      notes: 'Die Kinderüberschrift schreibt den Namen einmalig „Barnhild“; die Personenzeile und Stammbaumgrafik belegen „Bjarnhild“.'
    }),
    spouse('irmtraut-soekeren-spouse', 'Irmtraut', 'female', '1603', '1655'),

    person('hvitserk-soekeren', 'Hvitserk Sökeren', 'male', '1614', '1716', {
      title: 'Hesir des Clans Sökeren 1686–1716'
    }),
    awayWoman('magnhild-sokaren', 'Magnhild Sökaren', '1619', '1698', 'Haus Ceirwyn', {
      worldPersonId: 'person--haus-sokaren--magnhild-sokaren',
      notes: 'Die stabile Weltpersonen-ID bewahrt die ältere Sökaren-Schreibweise der bereits ausgearbeiteten Ceirwyn-Gegenakte.'
    }),
    spouse('isbjalla-1614-brathfengr', 'Ísbjalla Brathfengr', 'female', '1614', '1703', 'house-brathfengr'),
    spouse('gruffudd-ceirwyn', 'Gruffudd Ceirwyn', 'male', '1610', '1681', 'house-ceirwyn'),

    person('langarr-soekeren', 'Langarr Sökeren', 'male', '1631', '1720', {
      title: 'Hesir des Clans Sökeren 1716–1720'
    }),
    awayWoman('thorhild-soekaren', 'Thorhild Sökaren', '1627', '1726', 'Clan Skjegg'),
    spouse('skadi-sterkr', 'Skadi Sterkr', 'female', '1631', '', 'house-sterkr', {
      notes: 'Kein Todeszeichen ist belegt. Das hohe Lebensalter ist in Aleria wegen möglicher magischer Langlebigkeit allein kein Widerspruch.'
    }),
    spouse('halfdan-skjegg', 'Halfdan Skjegg', 'male', '1619', '1693', 'house-skjegg'),

    person('hrothgar-soekeren', 'Hrothgar Sökeren', 'male', '1648', '', {
      title: 'Hesir des Clans Sökeren seit 1720'
    }),
    awayWoman('aslaug-soekeren', 'Aslaug Sökeren', '1649', '1731', 'Clan Varulv'),
    spouse('fjorgyn-wellensaenger', 'Fjörgyn Wellensänger', 'female', '1653', '1737', 'house-wellensaenger', {
      notes: 'Die Kinderüberschrift nennt Hrothgars Partnerin nur „??“, während Personenzeile und Stammbaumgrafik Fjörgyn eindeutig als Ehefrau und Mutter des Kinderblocks zeigen.'
    }),
    spouse('steinarr-varulv', 'Steinarr Varulv', 'male', '1648', '1706', 'house-varulv'),

    person('thorlak-soekeren', 'Thorlak Sökeren', 'male', '1672', '', {
      title: 'Erster Erbe des Clans Sökeren'
    }),
    awayWoman('rikke-soekeren', 'Rikke Sökeren', '1672', '1720', 'Clan Skald'),
    person('skjomi-soekeren', 'Skjomi Sökeren', 'male', '1680', '', {
      notes: 'Die Personenzeile und die beschriftete Stammbaumgrafik nennen ihn Skjomi. Die Beziehungsüberschriften „Grinleik’s“ sind ein isolierter Übertragungsfehler derselben Spalte.'
    }),
    spouse('hildegard-soekering', 'Hildegard Sökering', 'female', '1676', '', 'house-soekering'),
    spouse('ulfrik-skald', 'Ulfrik Skald', 'male', '1668', '1720', 'house-skald'),
    spouse('brigid-bhaird', 'Brigid Bhaird', 'female', '1682', '', 'house-bhaird'),

    person('balrun-soekeren', 'Balrun Sökeren', 'male', '1695', '', {
      title: 'Erbe des Clans Sökeren'
    }),
    awayWoman('runa-soekaren', 'Runa Sökaren', '1697', '', 'Clan Skaal'),
    awayWoman('liska-sokaren', 'Liska Sökaren', '1705', '', 'Haus Ceirwyn', {
      worldPersonId: 'person--haus-sokaren--liska-sokaren',
      notes: 'Die stabile Weltpersonen-ID bewahrt die ältere Sökaren-Schreibweise der bereits ausgearbeiteten Ceirwyn-Gegenakte.'
    }),
    person('skjalm-soekeren', 'Skjalm Sökeren', 'male', '1712', ''),
    person('skorri-soekeren', 'Skorri Sökeren', 'male', '1700', '1720'),
    person('kjallak-soekeren', 'Kjallak Sökeren', 'male', '1702', ''),
    spouse('dagrun-brathfengr', 'Dágrun Brathfengr', 'female', '1699', '', 'house-brathfengr'),
    spouse('sven-skaal', 'Sven Skaal', 'male', '1694', '', 'house-skaal'),
    spouse('dagonet-ceirwyn', 'Dagonet Ceirwyn', 'male', '1704', '', 'house-ceirwyn'),
    spouse('hjordis-skald', 'Hjördis Skald', 'female', '1700', '', 'house-skald', {
      notes: 'Die Kinderüberschrift verstümmelt den Namen einmalig zu „Hjrödis“; die Personenzeile und Stammbaumgrafik belegen „Hjördis“. Die spätere Skald-Hausquelle korrigiert das Geburtsjahr von 1705 auf 1700.'
    }),

    person('ljot-soekeren', 'Ljot Sökeren', 'male', '1716', '', {
      title: 'Erbe des Clans Sökeren'
    }),
    person('mjoll-soekeren', 'Mjöll Sökeren', 'female', '1719', ''),
    person('hermund-soekeren', 'Hermund Sökeren', 'male', '1724', '', {
      title: 'Erbe des Clans Sökeren'
    }),
    person('hroald-soekeren', 'Hroald Sökeren', 'male', '1724', ''),
    person('lif-soekeren', 'Líf Sökeren', 'female', '1726', '')
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(marriage),
  parentages: [
    ...claimedChildren(
      ['sturlaug-soekeren', 'laufdis-soekeren'],
      'marriage-forseti-sjofn-soekeren',
      FOUNDER_TIME_JUMP_ID,
      'Die Quelle überspringt zwischen Forseti und Sjöfn sowie Sturlaug und Laufdís mehrere nicht einzeln überlieferte Generationen.'
    ),
    ...childrenOf(['hallgerd-soekeren', 'kjartan-soekeren', 'horik-soekeren'], 'marriage-sturlaug-bylgja-soekeren'),
    ...childrenOf(['hvitserk-soekeren', 'magnhild-sokaren'], 'marriage-kjartan-bjarnhild-soekeren'),
    ...childrenOf(['langarr-soekeren', 'thorhild-soekaren'], 'marriage-isbjalla-hvitserk-brathfengr'),
    ...childrenOf(['hrothgar-soekeren', 'aslaug-soekeren'], 'marriage-skadi-langarr-sterkr'),
    ...childrenOf(['thorlak-soekeren', 'rikke-soekeren', 'skjomi-soekeren'], 'marriage-hrothgar-fjorgyn-soekeren'),
    ...childrenOf(['balrun-soekeren', 'runa-soekaren', 'liska-sokaren', 'skjalm-soekeren'], 'marriage-thorlak-hildegard-soekeren'),
    ...childrenOf(['skorri-soekeren', 'kjallak-soekeren'], 'marriage-skjomi-brigid-soekeren'),
    ...childrenOf(['ljot-soekeren', 'mjoll-soekeren', 'hermund-soekeren'], 'marriage-dagrun-balrun-brathfengr'),
    ...childrenOf(['hroald-soekeren', 'lif-soekeren'], 'marriage-kjallak-hjordis-soekeren')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-soekering-horik-irmtraut',
      name: 'Haus Sökering',
      parentPartnershipId: 'marriage-horik-irmtraut-soekeren',
      houseId: 'house-soekering',
      targetFamilyId: 'haus-soekering',
      subtitle: 'Von Horik Sökeren und Irmtraut begründetes Kadettenhaus in Mathringen',
      notes: 'Die Gründung ist im Sökeren-Stammbaum vermerkt; eine eigene Familienakte für Haus Sökering wird erst später angelegt.',
      extensions: {
        registryManagedFields: [
          'name',
          'parentPartnershipId',
          'houseId',
          'targetFamilyId',
          'subtitle',
          'notes'
        ]
      }
    }),
    marriedAway('married-away-laufdis-soekeren-riesentot', 'Clan Riesentot', 'marriage-tonvar-laufdis-soekeren', 'house-riesentot', 'haus-riesentot'),
    marriedAway('married-away-hallgerd-soekeren-kampfgeborene', 'Clan Kampfgeborene', 'marriage-aegir-hallgerd-kampfgeborene', 'house-kampfgeborene', 'haus-kampfgeborene', HOUSE_EMBLEMS.kampfgeborene),
    marriedAway('married-away-magnhild-soekeren-ceirwyn', 'Haus Ceirwyn', 'marriage-gruffudd-magnhild-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    marriedAway('married-away-thorhild-soekeren-skjegg', 'Clan Skjegg', 'marriage-halfdan-thorhild-skjegg', 'house-skjegg', 'haus-skjegg', HOUSE_EMBLEMS.skjegg),
    marriedAway('married-away-aslaug-soekeren-varulv', 'Clan Varulv', 'marriage-steinarr-aslaug-varulv', 'house-varulv', 'haus-varulv', HOUSE_EMBLEMS.varulv),
    marriedAway('married-away-rikke-soekeren-skald', 'Clan Skald', 'marriage-ulfrik-rikke-soekeren', 'house-skald', 'haus-skald', HOUSE_EMBLEMS.skald),
    marriedAway('married-away-runa-soekeren-skaal', 'Clan Skaal', 'marriage-sven-runa-skaal', 'house-skaal', 'haus-skaal', HOUSE_EMBLEMS.skaal),
    marriedAway('married-away-liska-soekeren-ceirwyn', 'Haus Ceirwyn', 'marriage-dagonet-liska-ceirwyn', 'house-ceirwyn', 'haus-ceirwyn', HOUSE_EMBLEMS.ceirwyn)
  ],
  timeJumps: [
    timeJump(
      FOUNDER_TIME_JUMP_ID,
      'marriage-forseti-sjofn-soekeren',
      ['sturlaug-soekeren', 'laufdis-soekeren'],
      '????',
      '1574',
      'Nicht einzeln überlieferte Generationen'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-forseti-sjofn-soekeren',
    houseId: SOEKEREN_HOUSE_ID,
    crestSubtitle: 'Hesire-Clan von Klangheim · Vasallen der Brathfengr',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'forseti-soekeren-founder',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: 'Clan Sökaren/Sökeren (bereitgestellte Altdaten)',
    sourceNote: 'Die vollständige Akte übernimmt alle 45 benannten Quellpersonen, 19 Ehen und 25 Abstammungen. Forseti der Trompeter und Sjöfn Skald stehen vor dem Hauswappen; genau ein absolut serieller Zeitsprung führt danach gemeinsam zu Sturlaug und Laufdís. Horik Sökeren und Irmtraut begründen gemeinsam das Kadettenhaus Sökering in Mathringen; dessen Hausknoten hängt direkt unter beiden, eine eigene Sökering-Familienakte ist bewusst noch nicht angelegt. Acht belegte auswärtige Ehen von Sökeren-Frauen besitzen direkte Wegverheiratet-Knoten. Kinder in den Gegenakten Kampfgeborene, Ceirwyn, Skjegg, Varulv und Skaal werden hier nicht gedoppelt; Weltpersonen, Partnerschafts-IDs und Porträts bleiben kanonisch geteilt. Aufgelöste Quellfehler: Die Personenzeile und beschriftete Stammbaumgrafik belegen Skjomi, obwohl zwei Beziehungsüberschriften derselben Spalte „Grinleik“ schreiben. Ebenso werden die isolierten Schreibfehler „Barnhild“ und „Hjrödis“ nach den Personenzeilen als Bjarnhild und Hjördis geführt. Hrothgars Kinderüberschrift nennt die Mutter nur „??“, während Personenzeile und Grafik Fjörgyn Wellensänger eindeutig als Ehefrau und Mutter desselben Kinderblocks zeigen. Die Quelle schwankt zwischen Sökaren und dem bereits registrierten Clan Sökeren; die kanonische Registerschreibweise Sökeren bleibt erhalten, während bereits geteilte Gegenakten-Personen mit ihren stabilen Sökaren-Schreibungen unverändert bleiben. Ungewöhnlich hohe Lebensalter ohne Todeszeichen sind wegen möglicher magischer Langlebigkeit ausdrücklich kein Widerspruch. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
