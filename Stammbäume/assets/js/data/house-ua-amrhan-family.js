import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_UA_AMRHAN_LOCAL_PORTRAIT_IDS,
  HOUSE_UA_AMRHAN_PORTRAITS,
  HOUSE_UA_AMRHAN_REUSED_PORTRAIT_IDS
} from './house-ua-amrhan-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import {
  TIR_NA_SRUTH_HOUSE_EMBLEMS,
  TIR_NA_SRUTH_HOUSE_PROFILES,
  TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS
} from './tir-na-sruth-house-profiles.js';
import { TIR_NA_TONN_HOUSE_EMBLEMS } from './tir-na-tonn-house-profiles.js';

const AMRHAN_HOUSE_ID = 'house-amrhan';
const AMRHAN_EMBLEM = TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan;

const HOUSE_HEAD_IDS = new Set([
  'nathrachan-cuinn',
  'faithleach-amrhan',
  'quioghan-amrhan',
  'tarlachan-amrhan',
  'fionntan-amrhan'
]);

const SUCCESSION_IDS = new Set([
  'scannlan-amrhan',
  'xiston-amrhan',
  'muiris-amrhan'
]);

const HEAD_TITLES = Object.freeze({
  'nathrachan-cuinn': 'Begründer des Kadettenhauses Ua’Amhran',
  'faithleach-amrhan': 'Laird des Clan Ua’Amhran · bis 1679',
  'quioghan-amrhan': 'Laird des Clan Ua’Amhran · 1679–1706',
  'tarlachan-amrhan': 'Laird des Clan Ua’Amhran · 1706–1737',
  'fionntan-amrhan': 'Laird des Clan Ua’Amhran · seit 1737',
  'scannlan-amrhan': 'Erster der Erbfolge des Laird',
  'xiston-amrhan': 'Zweiter der Erbfolge des Laird',
  'muiris-amrhan': 'Dritter der Erbfolge des Laird'
});

const TARGETS = Object.freeze({
  ridderspore: Object.freeze({
    name: 'Haus Ridderspore',
    houseId: 'house-ridderspore',
    targetFamilyId: 'haus-ridderspore',
    emblem: ''
  }),
  cuinn: Object.freeze({
    name: 'Clan Tir An’Cuinn',
    houseId: 'house-cuinn',
    targetFamilyId: 'haus-tir-an-cuinn',
    emblem: TIR_NA_SRUTH_HOUSE_EMBLEMS['tir-an-cuinn']
  }),
  morath: Object.freeze({
    name: 'Haus Morath',
    houseId: 'house-morath',
    targetFamilyId: 'haus-morath',
    emblem: ''
  }),
  trodach: Object.freeze({
    name: 'Ard Trodach',
    houseId: 'house-trodach',
    targetFamilyId: 'haus-ard-trodach',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']
  }),
  sokering: Object.freeze({
    name: 'Haus Sökering',
    houseId: 'house-sokering',
    targetFamilyId: 'haus-sokering',
    emblem: ''
  }),
  airgid: Object.freeze({
    name: 'Tir An’Airgid',
    houseId: 'house-airgid',
    targetFamilyId: 'haus-airgid',
    emblem: TIR_NA_SRUTH_HOUSE_EMBLEMS.airgid
  }),
  gortach: Object.freeze({
    name: 'Ru’Gortach',
    houseId: 'house-gortach',
    targetFamilyId: 'haus-ru-gortach',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS.gortach
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = AMRHAN_HOUSE_ID, options = {}) {
  const portrait = HOUSE_UA_AMRHAN_PORTRAITS[id] || '';
  const registryManagedFields = new Set(options.extensions?.registryManagedFields || []);
  if (portrait) registryManagedFields.add('portrait');

  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait,
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === AMRHAN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      ...(registryManagedFields.size > 0
        ? { registryManagedFields: [...registryManagedFields] }
        : {})
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayMember(id, name, sex, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, sex, birth, death, AMRHAN_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
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
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'ua-amrhan-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
}

function marriedAway(id, partnershipId, targetKey) {
  const target = TARGETS[targetKey];
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: { chartAlignBelowPartnership: true }
  });
}

const FOUNDER_IDS = ['nathrachan-cuinn', 'amerlaith-cuinn'];
const FAITHLEACH_IDS = ['faithleach-amrhan', 'siomhrach-urquhart'];
const MEABHROG_IDS = ['gernot-ridderspore', 'meabhrog-amrhan'];
const VAITHREACH_IDS = ['vaithreach-amrhan', 'zaorbha'];
const LABHAOISE_IDS = ['roghnall-cuinn', 'labhaoise-amrhan'];
const QUIOGHAN_IDS = ['quioghan-amrhan', 'beathag-muiredaigh'];
const GLAODHAICH_IDS = ['zibhneach-morath', 'glaodhaich-amrhan'];
const TIGHEARNACH_IDS = ['tighearnach-amrhan', 'padhla'];
const SCEOLAIGH_IDS = ['lorcan-trodach', 'sceolaigh-amhran'];
const TARLACHAN_IDS = ['tarlachan-amrhan', 'wihalg-bhaird'];
const FUIRSEACH_IDS = ['fuirseach-amrhan', 'uisigh'];
const UACHALL_IDS = ['sieghart-sokering', 'uachall-amrhan'];
const QUBHNA_IDS = ['tomaltach-airgid', 'qubhna-amrhan'];
const FIONNTAN_IDS = ['fionntan-amrhan', 'fiadh-airt'];
const RIONACH_IDS = ['kinneth-gortach', 'rionach-amhran'];
const SCANNLAN_IDS = ['scannlan-amrhan', 'huaid-morath'];
const ZOMHLAIGH_IDS = ['gorm-cuinn', 'zomhlaigh-amrhan'];
const GORMAN_IDS = ['gorman-amrhan', 'tuiren-muiredaigh'];

export const HOUSE_UA_AMRHAN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-amrhan',
    title: 'Ua’Amhran',
    motto: '',
    description: 'Bardenreicher Kadettenclan der Tir An’Cuinn und unmittelbar in Ceanntire ansässige Lairds. Das Haus ging aus der verbotenen, später als gottgepriesen verehrten Ehe Nathracháns und Amerlaiths hervor.',
    emblem: AMRHAN_EMBLEM,
    houseProfile: TIR_NA_SRUTH_HOUSE_PROFILES.amrhan
  },
  houses: [
    house(AMRHAN_HOUSE_ID, 'Clan Ua’Amhran', AMRHAN_EMBLEM),
    house('house-cuinn', 'Clan Tir An’Cuinn', TIR_NA_SRUTH_HOUSE_EMBLEMS['tir-an-cuinn']),
    house('house-urquhart', 'Haus Urquhart'),
    house('house-ridderspore', 'Haus Ridderspore'),
    house('house-muiredaigh', 'Haus Muiredaigh'),
    house('house-morath', 'Haus Morath'),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-bhaird', 'Haus Bhaird'),
    house('house-sokering', 'Haus Sökering'),
    house('house-airgid', 'Tir An’Airgid', TIR_NA_SRUTH_HOUSE_EMBLEMS.airgid),
    house('house-mac-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-gortach', 'Ru’Gortach', TIR_NA_TONN_HOUSE_EMBLEMS.gortach)
  ],
  persons: [
    person('nathrachan-cuinn', 'Nathrachán Cuinn', 'male', '????', '????', 'house-cuinn', {
      familyRole: 'core',
      tags: ['Gründer', 'Enterbter Cuinn-Erbe'],
      notes: 'Nathrachán verließ die Tir An’Cuinn für Amerlaith und begründete mit ihr das anerkannte Kadettenhaus Ua’Amhran.'
    }),
    person('amerlaith-cuinn', 'Amerlaith', 'female', '????', '????', '', {
      familyRole: 'core',
      title: 'Bardin und Mitbegründerin des Kadettenhauses Ua’Amhran',
      tags: ['Gründerin', 'Bardin'],
      notes: 'Die zunächst verbotene Ehe Amerlaiths mit Nathrachán wurde wegen ihrer unerwartet zahlreichen Nachkommen später als gottgepriesen verehrt.'
    }),

    person('faithleach-amrhan', 'Fáithleach Amrhan', 'male', '1605', '1679'),
    spouse('siomhrach-urquhart', 'Síomhrach Urquhart', 'female', '1608', '1711', 'house-urquhart'),
    awayMember('meabhrog-amrhan', 'Meabhróg Amrhan', 'female', '1607', '1701', 'ridderspore'),
    spouse('gernot-ridderspore', 'Gernot Ridderspore', 'male', '1605', '1700', 'house-ridderspore'),
    person('vaithreach-amrhan', 'Vaithreach Amrhan', 'male', '1610', '1696'),
    spouse('zaorbha', 'Zaorbha', 'female', '1600', '1654'),

    awayMember('labhaoise-amrhan', 'Labhaoise Amrhan', 'female', '1628', '1702', 'cuinn'),
    spouse('roghnall-cuinn', 'Ròghnall Cuinn', 'male', '1628', '1694', 'house-cuinn'),
    person('quioghan-amrhan', 'Quíoghán Amrhan', 'male', '1630', '1706'),
    spouse('beathag-muiredaigh', 'Beathag Muiredaigh', 'female', '1635', '1716', 'house-muiredaigh'),
    awayMember('glaodhaich-amrhan', 'Glaodhaich Amrhan', 'female', '1634', '1712', 'morath'),
    spouse('zibhneach-morath', 'Zibhneach Morath', 'male', '1629', '1699', 'house-morath'),
    person('zeabhnan-amrhan', 'Zeabhnán Amrhan', 'male', '1632', '1729', AMRHAN_HOUSE_ID, {
      title: 'Fianna des Clan Ua’Amhran',
      tags: ['Fianna'],
      notes: 'Zeabhnán ist als Fianna des Clans überliefert.'
    }),
    person('tighearnach-amrhan', 'Tighearnach Amrhan', 'male', '1634', '1700'),
    spouse('padhla', 'Pádhla', 'female', '1635', '1656'),

    awayMember('sceolaigh-amhran', 'Sceolaigh Amrhan', 'female', '1651', '1735', 'trodach'),
    spouse('lorcan-trodach', 'Lorcán Trodach', 'male', '1649', '1703', 'house-trodach'),
    person('tarlachan-amrhan', 'Tarlachán Amrhan', 'male', '1653', '1737'),
    spouse('wihalg-bhaird', 'Wihalg Bhaird', 'female', '1658', '1740', 'house-bhaird'),
    person('fuirseach-amrhan', 'Fuirseach Amrhan', 'male', '1654', '1720'),
    spouse('uisigh', 'Uisigh', 'female', '1656', '1698'),
    awayMember('uachall-amrhan', 'Uachall Amrhan', 'female', '1656', '1739', 'sokering'),
    spouse('sieghart-sokering', 'Sieghart Sökering', 'male', '1650', '1725', 'house-sokering'),

    awayMember('qubhna-amrhan', 'Qubhna Amrhan', 'female', '1678', '', 'airgid'),
    spouse('tomaltach-airgid', 'Tomaltach Airgid', 'male', '1674', '', 'house-airgid'),
    person('fionntan-amrhan', 'Fionntan Amrhan', 'male', '1676', ''),
    spouse('fiadh-airt', 'Fíadh Airt', 'female', '1678', '', 'house-mac-airt'),
    person('oibhrin-amrhan', 'Oibhrín Amrhan', 'female', '1674', '', AMRHAN_HOUSE_ID, {
      title: 'Bardin der Musen der Maid',
      tags: ['Bardin', 'Musen der Maid'],
      notes: 'Oibhrín ist eine weithin bekannte albische Bardin. Sie studierte im Hochlied von Leitheach, anschließend Heraldik und avallornische Geschichte in Cenyr und vertiefte ihre magischen Begabungen bei den Skalden in Klangheim.'
    }),
    awayMember('rionach-amhran', 'Rionach Amrhan', 'female', '1676', '', 'gortach'),
    spouse('kinneth-gortach', 'Kinneth Gortach', 'male', '1673', '', 'house-gortach'),

    person('scannlan-amrhan', 'Scannlán Amrhan', 'male', '1696', ''),
    spouse('huaid-morath', 'Húaid Morath', 'female', '1700', '', 'house-morath'),
    person('rogaire-amrhan', 'Rógaire Amrhan', 'male', '1698', ''),
    awayMember('zomhlaigh-amrhan', 'Zòmhlaigh Amrhan', 'female', '1699', '', 'cuinn'),
    spouse('gorm-cuinn', 'Gorm Cuinn', 'male', '1694', '', 'house-cuinn'),
    person('zulach-amrhan', 'Zúlach Amrhan', 'male', '1703', ''),
    person('gorman-amrhan', 'Gormán Amrhan', 'male', '1705', ''),
    spouse('tuiren-muiredaigh', 'Tuiren Muiredaigh', 'female', '1709', '', 'house-muiredaigh'),

    person('xiston-amrhan', 'Xiston Amrhan', 'male', '1718', ''),
    person('jorna-amrhan', 'Jórna Amrhan', 'female', '1721', ''),
    person('muiris-amrhan', 'Muiris Amrhan', 'male', '1725', ''),
    person('nalainn-amrhan', 'Nálainn Amrhan', 'female', '1727', ''),
    person('eachann-amrhan', 'Eachann Amrhan', 'male', '1730', '')
  ],
  partnerships: [
    endedMarriage('marriage-nathrachan-amerlaith-cuinn', FOUNDER_IDS),
    endedMarriage('marriage-faithleach-siomhrach-amrhan', FAITHLEACH_IDS, '1679'),
    endedMarriage('marriage-gernot-meabhrog-amrhan', MEABHROG_IDS, '1700'),
    endedMarriage('marriage-vaithreach-zaorbha-amrhan', VAITHREACH_IDS, '1654'),
    endedMarriage('marriage-roghnall-labhaoise-cuinn', LABHAOISE_IDS, '1694'),
    endedMarriage('marriage-quioghan-beathag-amrhan', QUIOGHAN_IDS, '1706'),
    endedMarriage('marriage-zibhneach-glaodhaich-amrhan', GLAODHAICH_IDS, '1699'),
    endedMarriage('marriage-tighearnach-padhla-amrhan', TIGHEARNACH_IDS, '1656'),
    endedMarriage('marriage-lorcan-sceolaigh', SCEOLAIGH_IDS, '1703'),
    endedMarriage('marriage-tarlachan-wihalg-amrhan', TARLACHAN_IDS, '1737'),
    endedMarriage('marriage-fuirseach-uisigh-amrhan', FUIRSEACH_IDS, '1698'),
    endedMarriage('marriage-sieghart-uachall-amrhan', UACHALL_IDS, '1725'),
    createMarriage('marriage-tomaltach-qubhna-amrhan', ...QUBHNA_IDS),
    createMarriage('marriage-fionntan-fiadh-airt', ...FIONNTAN_IDS),
    createMarriage('marriage-kinneth-rionach-gortach', ...RIONACH_IDS),
    createMarriage('marriage-scannlan-huaid-amrhan', ...SCANNLAN_IDS),
    createMarriage('marriage-gorm-zomhlaigh-cuinn', ...ZOMHLAIGH_IDS),
    createMarriage('marriage-gorman-tuiren-amrhan', ...GORMAN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['faithleach-amrhan', 'meabhrog-amrhan', 'vaithreach-amrhan'],
      FOUNDER_IDS,
      'marriage-nathrachan-amerlaith-cuinn',
      {
        type: 'claimed',
        legitimacy: 'unknown',
        certainty: 'probable',
        notes: 'Zwischen dem Gründerpaar und der ab 1605 datierten Generation sind nicht einzeln überlieferte Generationen ausgelassen.',
        extensions: { timeJumpId: 'gap-nathrachan-faithleach-meabhrog-vaithreach-amrhan' }
      }
    ),
    ...childrenOf(
      ['labhaoise-amrhan', 'quioghan-amrhan', 'glaodhaich-amrhan'],
      FAITHLEACH_IDS,
      'marriage-faithleach-siomhrach-amrhan'
    ),
    ...childrenOf(
      ['zeabhnan-amrhan', 'tighearnach-amrhan'],
      VAITHREACH_IDS,
      'marriage-vaithreach-zaorbha-amrhan'
    ),
    ...childrenOf(['sceolaigh-amhran', 'tarlachan-amrhan'], QUIOGHAN_IDS, 'marriage-quioghan-beathag-amrhan'),
    ...childrenOf(['fuirseach-amrhan', 'uachall-amrhan'], TIGHEARNACH_IDS, 'marriage-tighearnach-padhla-amrhan'),
    ...childrenOf(['qubhna-amrhan', 'fionntan-amrhan'], TARLACHAN_IDS, 'marriage-tarlachan-wihalg-amrhan'),
    ...childrenOf(['oibhrin-amrhan', 'rionach-amhran'], FUIRSEACH_IDS, 'marriage-fuirseach-uisigh-amrhan'),
    ...childrenOf(
      ['scannlan-amrhan', 'rogaire-amrhan', 'zomhlaigh-amrhan', 'zulach-amrhan', 'gorman-amrhan'],
      FIONNTAN_IDS,
      'marriage-fionntan-fiadh-airt'
    ),
    ...childrenOf(['xiston-amrhan', 'jorna-amrhan', 'muiris-amrhan'], SCANNLAN_IDS, 'marriage-scannlan-huaid-amrhan'),
    ...childrenOf(['nalainn-amrhan', 'eachann-amrhan'], GORMAN_IDS, 'marriage-gorman-tuiren-amrhan')
  ],
  cadetBranches: [
    marriedAway('married-away-ridderspore-meabhrog-amrhan', 'marriage-gernot-meabhrog-amrhan', 'ridderspore'),
    marriedAway('married-away-cuinn-labhaoise-amrhan', 'marriage-roghnall-labhaoise-cuinn', 'cuinn'),
    marriedAway('married-away-morath-glaodhaich-amrhan', 'marriage-zibhneach-glaodhaich-amrhan', 'morath'),
    marriedAway('married-away-trodach-sceolaigh-amrhan', 'marriage-lorcan-sceolaigh', 'trodach'),
    marriedAway('married-away-sokering-uachall-amrhan', 'marriage-sieghart-uachall-amrhan', 'sokering'),
    marriedAway('married-away-airgid-qubhna-amrhan', 'marriage-tomaltach-qubhna-amrhan', 'airgid'),
    marriedAway('married-away-gortach-rionach-amrhan', 'marriage-kinneth-rionach-gortach', 'gortach'),
    marriedAway('married-away-cuinn-zomhlaigh-amrhan', 'marriage-gorm-zomhlaigh-cuinn', 'cuinn')
  ],
  timeJumps: [
    {
      id: 'gap-nathrachan-faithleach-meabhrog-vaithreach-amrhan',
      parentPartnershipId: 'marriage-nathrachan-amerlaith-cuinn',
      sharedParentPartnershipIds: [],
      childIds: ['faithleach-amrhan', 'meabhrog-amrhan', 'vaithreach-amrhan'],
      years: 0,
      fromYear: '????',
      toYear: '1605',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1605 datierten Linie',
      notes: 'Die ausdrückliche Punktreihe der Quelle wird als Überlieferungslücke erhalten und nicht als unmittelbare biologische Elternschaft ausgegeben.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-nathrachan-amerlaith-cuinn',
    houseId: AMRHAN_HOUSE_ID,
    crestSubtitle: 'Laird in Ceanntire · Tir na Sruth · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'nathrachan-cuinn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Ua’Amhran (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Oberhauptfolge, Erbfolge und historische Hinweise folgen der bereitgestellten Ua-Amhran-Akte. Nathrachán Cuinn und die Bardin Amerlaith begründen gemeinsam das Kadettenhaus; die spätere Cuinn-Hauptlinie wird von diesem Paar getrennt weitergeführt. Die ausdrückliche Punktreihe nach dem Gründerpaar bleibt als serielle Überlieferungslücke sichtbar. Zeabhnán ist als Fianna und Oibhrín als weithin bekannte Bardin der Musen der Maid vermerkt. Die aktuellen individuellen Ua-Amhran-Bilder der Quelle werden lokal geführt; eindeutig identische angeheiratete Personen erhalten vorhandene kanonische Gegenaktenporträts. Wiederholte Standardsilhouetten und die unbenannten Verlobtenfelder der jüngsten Generation werden nicht als Personen importiert.',
    sourceRevision: 3,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird des Clan Ua’Amhran',
      headOrder: Object.freeze([
        'nathrachan-cuinn',
        'faithleach-amrhan',
        'quioghan-amrhan',
        'tarlachan-amrhan',
        'fionntan-amrhan'
      ]),
      publishedOrder: Object.freeze(['scannlan-amrhan', 'xiston-amrhan', 'muiris-amrhan'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_UA_AMRHAN_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_UA_AMRHAN_REUSED_PORTRAIT_IDS,
      currentSourceImagesUsed: true,
      genericSourceSilhouettesIgnored: true,
      anonymousBetrothedsIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Sruth',
    territoryGloss: 'Land des Stroms',
    historicalStatus: 'active',
    albicRank: 'laird',
    administrativeRole: 'Laird in Ceanntire',
    immediateLiegeHouseId: 'haus-tir-an-cuinn',
    immediateLiegeHouseName: 'Clan Tir An’Cuinn',
    legacyTitles: ['Haus Amrhan', "Ua'Amrhan", "Ua'Amhran"],
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceNote',
      'inheritance',
      'portraitPolicy',
      'principality',
      'territory',
      'territoryGloss',
      'historicalStatus',
      'albicRank',
      'administrativeRole',
      'immediateLiegeHouseId',
      'immediateLiegeHouseName',
      'legacyTitles'
    ],
    registryManagedHouseProfileFields: TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-amrhan-gruender', 'haus-amrhan-gruenderin'],
      partnerships: ['marriage-haus-amrhan-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
