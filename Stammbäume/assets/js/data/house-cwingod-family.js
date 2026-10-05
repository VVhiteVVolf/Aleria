import { withVennyrSourceCounterUpgrade } from './vennyr-source-counter-upgrade.js';
import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { HOUSE_ARTH_FAMILY } from './house-arth-family.js';
import { HOUSE_CRAFANC_FAMILY } from './house-crafanc-family.js';
import { HOUSE_EIRTH_FAMILY } from './house-eirth-family.js';
import { HOUSE_LYFANT_DERWYDDION_FAMILY } from './house-lyfant-family.js';
import { HOUSE_MORTHWYLL_FAMILY } from './house-morthwyll-family.js';
import { HOUSE_PAWEN_FAMILY } from './house-pawen-family.js';
import { HOUSE_PYSGOD_FAMILY } from './house-pysgod-family.js';
import { HOUSE_UNIGOL_FAMILY } from './house-unigol-family.js';
import { KLAUENINSEL_HOUSE_EMBLEMS, KLAUENINSEL_HOUSE_PROFILES } from './klaueninseln-house-profiles.js';
import { HOUSE_CWINGOD_PORTRAITS } from './house-cwingod-portraits.js';
import { HOUSE_CWINGOD_BIOGRAPHY } from './house-cwingod-biography.js';

// Die bestehende Akten- und Haus-ID bleibt für gespeicherte Bäume stabil.
const HOUSE_ID = 'house-cwningod';
const EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.cwningod;
const MANAGED_PERSON_FIELDS = ['name', 'title', 'sex', 'status', 'birth', 'death', 'portrait', 'houseId', 'familyRole', 'lineageRole', 'notes'];
const SHARED_FAMILIES = [HOUSE_ARTH_FAMILY, HOUSE_CRAFANC_FAMILY, HOUSE_EIRTH_FAMILY, HOUSE_LYFANT_DERWYDDION_FAMILY, HOUSE_MORTHWYLL_FAMILY, HOUSE_PAWEN_FAMILY, HOUSE_PYSGOD_FAMILY, HOUSE_UNIGOL_FAMILY];

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({ id, name, sex, birth, death, houseId: HOUSE_ID,
    portrait: HOUSE_CWINGOD_PORTRAITS[id] || '', ...options,
    extensions: { registryManagedSourceRevision: 2, ...options.extensions,
      registryManagedFields: options.extensions?.registryManagedFields || MANAGED_PERSON_FIELDS }
  });
}

function shared(family, id, options = {}) {
  const source = family.persons.find(entry => entry.id === id);
  if (!source) throw new Error(`Cwingod: gemeinsame Person ${id} fehlt.`);
  return { ...source, familyRole: source.houseId === HOUSE_ID ? 'core' : 'married',
    lineageRole: 'branch', ...options,
    extensions: { ...source.extensions, registryManagedSourceRevision: 2, ...options.extensions, registryManagedFields: MANAGED_PERSON_FIELDS }
  };
}

const COUPLES = {
  founders: ['galeshin-ancient-arth', 'arianhrod-unknown'],
  rhodhri: ['braih-morthwyll', 'rhodhri-cwningod'],
  rhonwen: ['tarawg-unigol', 'rhonwen-cwningod'],
  sath: ['rian-arth', 'sath-cwningod'],
  delyth: ['delyth-cwingod', 'trevor-drewi'],
  domnall: ['domnall-cwingod', 'tuala-rioga'],
  ffion: ['dumnagual-crafanc', 'ffion-cwningod'],
  kerensa: ['maelgwn-pysgod', 'kerensa-cwningod'],
  teudebur: ['mared-lyfant', 'teudebur-cwningod'],
  ifanwy: ['prysor-eirth', 'ifanwy-cwningod'],
  galeshin: ['tiwlip-arth', 'galeshin-cwningod'],
  tegid: ['joally-pawen', 'tegid-cwningod'],
  riderch: ['riderch-cwingod', 'mervyn-serenoc'],
  gildas: ['gildas-cwingod', 'llio-cwingod-spouse']
};
const MARRIAGE_IDS = {
  founders: 'marriage-galeshin-arianhrod', rhodhri: 'marriage-braih-rhodhri-morthwyll',
  rhonwen: 'marriage-tarawg-rhonwen-unigol', sath: 'marriage-rian-sath',
  delyth: 'marriage-delyth-trevor-cwingod', domnall: 'marriage-domnall-tuala-cwingod',
  ffion: 'marriage-dumnagual-ffion-crafanc', kerensa: 'marriage-maelgwn-kerensa',
  teudebur: 'marriage-mared-teudebur-lyfant', ifanwy: 'marriage-prysor-ifanwy-eirth',
  galeshin: 'marriage-tiwlip-galeshin', tegid: 'marriage-joally-tegid-pawen',
  riderch: 'marriage-riderch-mervyn-cwingod', gildas: 'marriage-gildas-llio-cwingod'
};
function children(ids, key, options = {}) {
  return createParentages(ids, COUPLES[key], MARRIAGE_IDS[key], { idPrefix: 'cwingod-parentage', ...options });
}
function away(key, name, houseId, targetFamilyId) {
  return createMarriedAwayBranch({ id: `married-away-${key}-cwingod`, name, houseId, targetFamilyId,
    parentPartnershipId: MARRIAGE_IDS[key], extensions: { registryManagedFields: ['name', 'parentPartnershipId', 'houseId', 'targetFamilyId'] }
  });
}

const persons = [
  shared(HOUSE_ARTH_FAMILY, 'galeshin-ancient-arth', { familyRole: 'core', lineageRole: 'mainline' }),
  shared(HOUSE_ARTH_FAMILY, 'arianhrod-unknown'),
  shared(HOUSE_MORTHWYLL_FAMILY, 'rhodhri-cwningod', { lineageRole: 'mainline', title: 'Baron von Morea 1663–1671' }),
  shared(HOUSE_MORTHWYLL_FAMILY, 'braih-morthwyll', { notes: 'In der Cwingod-Quelle Braith; identisch mit Braih Morthwyll (1632–1675) der Gegenakte.' }),
  shared(HOUSE_UNIGOL_FAMILY, 'rhonwen-cwningod'),
  shared(HOUSE_UNIGOL_FAMILY, 'tarawg-unigol'),
  person('idris-cwingod', 'Idris Cwingod', 'male', '1650', '????', { title: 'Baron von Morea 1671–1672', notes: 'Die Amtsjahre 1671–1672 sind keine Lebensjahre; das Todesjahr bleibt unbekannt.' }),
  shared(HOUSE_ARTH_FAMILY, 'sath-cwningod', { lineageRole: 'mainline', title: 'Baron von Morea 1672–1713' }),
  shared(HOUSE_ARTH_FAMILY, 'rian-arth'),
  person('delyth-cwingod', 'Delyth Cwingod', 'female', '1656', '1694', { title: 'Wegverheiratet an Haus Drewi' }),
  person('trevor-drewi', 'Trevor Drewi', 'male', '1654', '1679', { houseId: 'house-drewi', familyRole: 'married' }),
  person('domnall-cwingod', 'Domnall Cwingod', 'male', '1671', '1738', { lineageRole: 'mainline', title: 'Baron von Morea 1713–1738' }),
  person('tuala-rioga', 'Tuala Ríoga', 'female', '1676', '1702', { houseId: 'house-rioga', familyRole: 'married', notes: 'Das Quelljahr 1976 widerspricht Tod 1702 und den Kindern 1694/1695; offensichtlicher Jahrhundertfehler, zu 1676 korrigiert.' }),
  shared(HOUSE_CRAFANC_FAMILY, 'ffion-cwningod', { title: 'Wegverheiratet an Haus Crafanc' }),
  shared(HOUSE_CRAFANC_FAMILY, 'dumnagual-crafanc'),
  shared(HOUSE_PYSGOD_FAMILY, 'kerensa-cwningod', { title: 'Wegverheiratet an Haus Pysgod' }),
  shared(HOUSE_PYSGOD_FAMILY, 'maelgwn-pysgod'),
  shared(HOUSE_LYFANT_DERWYDDION_FAMILY, 'teudebur-cwningod'),
  shared(HOUSE_LYFANT_DERWYDDION_FAMILY, 'mared-lyfant'),
  shared(HOUSE_EIRTH_FAMILY, 'ifanwy-cwningod', { title: 'Wegverheiratet an Haus Eirth' }),
  shared(HOUSE_EIRTH_FAMILY, 'prysor-eirth'),
  shared(HOUSE_ARTH_FAMILY, 'galeshin-cwningod', { lineageRole: 'head', title: 'Baron von Morea seit 1738' }),
  shared(HOUSE_ARTH_FAMILY, 'tiwlip-arth'),
  shared(HOUSE_PAWEN_FAMILY, 'tegid-cwningod'),
  shared(HOUSE_PAWEN_FAMILY, 'joally-pawen'),
  person('ywain-cwingod', 'Ywain Cwingod', 'male', '1699', '1720'),
  person('riderch-cwingod', 'Riderch Cwingod', 'male', '1702'),
  person('mervyn-serenoc', 'Mervyne Serenoc', 'unknown', '1700', '', { houseId: 'house-serenoc', familyRole: 'married', notes: 'Die Serenoc-Partnerkarte und beide Stammbaumgrafiken nennen Mervyne. Identisch mit der zuvor als Mervyn geführten Person der Cwingod-Akte; Personen- und Welt-ID bleiben stabil. Die abweichende alte Kinderüberschrift Engla begründet keine weitere Person.', extensions: { registryManagedSourceRevision: 3, registryManagedFields: ['name', 'notes'] } }),
  person('gildas-cwingod', 'Gildas Cwingod', 'male', '1705'),
  person('llio-cwingod-spouse', 'Llio', 'female', '1709', '', { houseId: 'house-unbekannt-llio', familyRole: 'married' }),
  person('artgal-cwingod', 'Artgal Cwingod', 'male', '1720', '', { lineageRole: 'mainline', title: 'Erster in der überlieferten Erbfolge' }),
  person('clinoch-cwingod', 'Clinoch Cwingod', 'male', '1722', '', { title: 'Ritter zur See · Besatzung des Seebären; zweiter in der überlieferten Erbfolge' }),
  person('hedd-morlais', 'Hedd Morlais', 'male', '1720', '', { houseId: 'house-morlais', familyRole: 'ward', notes: 'Leiblicher Sohn von Kibddar Morlais (1692) und Lunet Serenoc; die blaue Quellenmarkierung und die Cwingod-Gegenakte belegen seine Aufnahme bei Galeshin Cwingod und Tiwlip Arth. Biologische und Pflegeelternschaft bleiben getrennt.', extensions: { registryManagedSourceRevision: 3, registryManagedFields: ['notes'] } }),
  person('vaughan-cwingod', 'Vaughan Cwingod', 'male', '1719', '', { notes: 'Im Almanach als Vaughn Cwingod bei den Schwarzfischen geführt: gleiches Porträt, gleiches Haus und der Titel „Ritter, Morea“ belegen dieselbe Figur. Die bestehende Almanach-ID EPwTMvE8J0vG76aXt2NK bleibt erhalten.', extensions: { sourceNameVariants: ['Vaughn Cwingod'], almanachCharacterId: 'EPwTMvE8J0vG76aXt2NK' } }),
  person('arianrhod-cwingod', 'Arianrhod Cwingod', 'female', '1723'),
  person('adeon-cwingod', 'Adeon Cwingod', 'male', '1721'),
  person('sioned-cwingod', 'Sioned Cwingod', 'female', '1723'),
  person('slevin-cwingod', 'Slevin Cwingod', 'male', '1734'),
  person('eirwen-cwingod', 'Eirwen Cwingod', 'female', '1736')
];
const requiredHouseIds = new Set(persons.map(entry => entry.houseId));
const sharedHouses = new Map(SHARED_FAMILIES.flatMap(family => family.houses.map(house => [house.id, house])));
const houseNames = { 'house-drewi': 'Haus Drewi', 'house-rioga': 'Haus Ríoga', 'house-serenoc': 'Haus Serenoc', 'house-morlais': 'Haus Morlais', 'house-unbekannt-llio': 'Unbekanntes Haus' };

export const HOUSE_CWINGOD_FAMILY = withVennyrSourceCounterUpgrade({
  schema: 'aleria.family-tree', schemaVersion: 1,
  document: { id: 'haus-cwningod', title: "Haus Cwingod O'Morea", motto: 'Im Maul des Bären liegt die Kraft, die durch Worte und Taten spricht.',
    description: 'Drittes Kadettenhaus der Arth und Baronenhaus der Talklaue. Die vollständige überlieferte Linie steht unter Cra Fryn; Morea ist der in der Hausquelle genannte Stadt- und Handelssitz.',
    emblem: EMBLEM, houseProfile: KLAUENINSEL_HOUSE_PROFILES.cwningod
  },
  houses: [{ id: HOUSE_ID, name: "Haus Cwingod O'Morea", motto: 'Im Maul des Bären liegt die Kraft, die durch Worte und Taten spricht.', emblem: EMBLEM, status: 'active' },
    ...[...requiredHouseIds].filter(id => id !== HOUSE_ID).map(id => sharedHouses.get(id) || { id, name: houseNames[id] || 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' })],
  persons,
  partnerships: Object.entries(COUPLES).map(([key, ids]) => {
    const existing = SHARED_FAMILIES.flatMap(family => family.partnerships).find(entry => entry.id === MARRIAGE_IDS[key]);
    return existing ? { ...existing } : createMarriage(MARRIAGE_IDS[key], ...ids);
  }),
  parentages: [
    ...children(['rhodhri-cwningod', 'rhonwen-cwningod'], 'founders', { type: 'claimed', certainty: 'probable', notes: 'Nicht einzeln überlieferte Zwischengenerationen.', extensions: { timeJumpId: 'gap-cwingod-founders-rhodhri' } }),
    ...children(['idris-cwingod', 'sath-cwningod', 'delyth-cwingod'], 'rhodhri'),
    ...children(['domnall-cwingod', 'ffion-cwningod', 'kerensa-cwningod', 'teudebur-cwningod', 'ifanwy-cwningod'], 'sath'),
    ...children(['galeshin-cwningod', 'tegid-cwningod'], 'domnall'),
    ...children(['ywain-cwingod', 'riderch-cwingod', 'gildas-cwingod'], 'teudebur'),
    ...children(['artgal-cwingod', 'clinoch-cwingod'], 'galeshin'),
    ...children(['hedd-morlais'], 'galeshin', { type: 'foster', certainty: 'unknown', legitimacy: 'unknown', notes: 'Blaue Quellenverbindung; Art der Aufnahme nicht ausdrücklich benannt.' }),
    ...children(['vaughan-cwingod', 'arianrhod-cwingod'], 'tegid'),
    ...children(['adeon-cwingod', 'sioned-cwingod'], 'riderch', { certainty: 'confirmed', notes: 'Die Serenoc-Gegenquelle bestätigt Mervyne als Riderchs Eheperson; die abweichende Engla-Überschrift der Altquelle ist ein Kopierfehler.', extensions: { registryManagedSourceRevision: 3, registryManagedFields: ['certainty', 'notes'] } }),
    ...children(['slevin-cwingod', 'eirwen-cwingod'], 'gildas')
  ],
  cadetBranches: [away('rhonwen', 'Haus Unigol', 'house-unigol', 'haus-unigol'), away('delyth', 'Haus Drewi', 'house-drewi', 'haus-drewi'),
    away('ffion', 'Haus Crafanc', 'house-crafanc', 'haus-crafanc'), away('kerensa', 'Haus Pysgod', 'house-pysgod', 'haus-pysgod'), away('ifanwy', 'Haus Eirth', 'house-eirth', 'haus-eirth')],
  timeJumps: [{ id: 'gap-cwingod-founders-rhodhri', parentPartnershipId: MARRIAGE_IDS.founders, childIds: ['rhodhri-cwningod', 'rhonwen-cwningod'],
    years: 0, fromYear: '????', toYear: '1631', label: 'Nicht einzeln überlieferte Generationen', notes: 'Einziger absoluter serieller Trenner nach Gründerpaar und Hauswappen.', extensions: {} }],
  lineage: { founderPartnershipId: MARRIAGE_IDS.founders, houseId: HOUSE_ID, crestSubtitle: 'Baronenhaus der Talklaue · Kadettenhaus der Arth',
    crestEmblemScale: 0.86, crestFrame: 'gold', crestFrameScale: 1, timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' } },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: 'galeshin-ancient-arth', orientation: 'vertical', ancestorDepth: 16, descendantDepth: 16, limitGenerations: false, showSiblings: true },
  extensions: { blankFamily: false, sourceRevision: 3, sourceFamilyId: 'haus-arth', sourcePartnershipId: MARRIAGE_IDS.founders,
    houseBiographyModule: HOUSE_CWINGOD_BIOGRAPHY,
    sourceNote: 'Nutzerquelle und Stammbaumgrafik vom 05.10.2026. Cwingod ist die ausdrücklich korrigierte Schreibweise; alte Akten-, Haus- und Weltpersonen-IDs bleiben stabil. 39 Personen, 14 Ehen, 24 Abstammungs-/Aufnahmekanten, fünf Wegheiraten, ein serieller Zeitsprung. Amtsjahre werden von Lebensdaten getrennt. Gegenakten bestimmen Braih, Dumnagual, Mared Lyfant, Tarawgs Lebensdaten und Maelgwns Todesjahr 1740. Rhonwens Quellenkreuz belegt den Tod ohne Todesjahr. Tualas unmögliches 1976 wird zu 1676 korrigiert. Riderch/Engla gegenüber Mervyn und die blaue Hedd-Verbindung sind als Quellenwidersprüche dokumentiert. Leere Hof-, Verlobungs- und Trivia-Vorlagen werden nicht zu Personen. Die ausdrückliche Einordnung lautet Cenyr > Klaueninsel > Talklaue > Cra Fryn, während Morea als Stadt- und Handelssitz erhalten bleibt.',
    registryManagedDocumentFields: ['title', 'description', 'motto'],
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'houseBiographyModule'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'liegeHouseId', 'liegeHouseName', 'secondarySeats', 'regionEmblems', 'folderPath'],
    registryManagedRecordFields: ['folderPath', 'title'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings']
  }
});
