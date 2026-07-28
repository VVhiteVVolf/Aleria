import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_WEINLAUB_PORTRAITS } from './house-weinlaub-portraits.js';
import { WEISENFLUH_HOUSE_PROFILES } from './weisenfluh-house-profiles.js';

const WEINLAUB_HOUSE_ID = 'house-weinlaub';
const WEINLAUB_EMBLEM = 'assets/images/houses/Weisenfluh/haus-weinlaub.png';

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

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? WEINLAUB_HOUSE_ID : options.houseId,
    portrait: HOUSE_WEINLAUB_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    status: options.status || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

const UNKNOWN_FOUNDER_IDS = ['unknown-founder-weinlaub', 'unknown-founder-wife-weinlaub'];
const SALOMON_REBEKKA_IDS = ['salomon-weinlaub', 'rebekka-weinlaub-spouse'];
const JOSIAH_RAHEL_IDS = ['josiah-weinlaub', 'rahel-weinlaub-spouse'];
const JOSIAH_MIRYAM_IDS = ['josiah-weinlaub', 'miryam-weinlaub'];

export const HOUSE_WEINLAUB_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-weinlaub',
    title: 'Haus Weinlaub',
    motto: 'Geduld trägt süße Frucht.',
    description: 'Niederes Ritterhaus von Burg Rebenwacht am Ewigensee. Nach Rahels frühem Tod heiratete Josiah Miryam. Unter ihrem Einfluss entzog er seinem erstgeborenen Sohn Gideon das Erbrecht, verwies ihn des Hauses und bestimmte den jüngeren Halbbruder Elias zum bevorzugten Erben.',
    emblem: WEINLAUB_EMBLEM,
    houseProfile: WEISENFLUH_HOUSE_PROFILES.weinlaub
  },
  houses: [
    {
      id: WEINLAUB_HOUSE_ID,
      name: 'Haus Weinlaub',
      motto: 'Geduld trägt süße Frucht.',
      emblem: WEINLAUB_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('unknown-founder-weinlaub', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Hauses Weinlaub',
      lineageRole: 'head',
      notes: 'Name und Lebensdaten des frühen Gründers sind nicht überliefert.'
    }),
    spouse('unknown-founder-wife-weinlaub', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Hauses Weinlaub',
      notes: 'Name und Lebensdaten der Ehefrau des frühen Gründers sind nicht überliefert.'
    }),
    person('salomon-weinlaub', 'Salomon Weinlaub', 'male', '1647', '1710', {
      title: 'Ritterherr von Rebenwacht bis 1710',
      lineageRole: 'head',
      notes: 'Salomon ist der erste namentlich ausgestaltete Vorfahr Gideons nach der nicht einzeln überlieferten Frühzeit des Hauses.'
    }),
    spouse('rebekka-weinlaub-spouse', 'Rebekka', 'female', '1652', '1716', {
      title: 'Gemahlin Salomons'
    }),
    person('josiah-weinlaub', 'Josiah Weinlaub', 'male', '1678', '', {
      title: 'Ritterherr von Rebenwacht · Oberhaupt des Hauses',
      lineageRole: 'head',
      tags: ['Vater Gideons', 'Vater des bevorzugten Erben'],
      notes: 'Josiah verlor seine erste Frau Rahel früh und heiratete später Miryam. Über Jahre ließ er sich von Miryams Zweifeln an Gideons Charakter beeinflussen. 1728 entzog er Gideon das Erbrecht, verwies ihn des Hauses und bestimmte Elias zum neuen Erben.'
    }),
    spouse('rahel-weinlaub-spouse', 'Rahel', 'female', '1684', '1714', {
      title: 'Erste Gemahlin Josiahs · Mutter Gideons',
      notes: 'Rahel starb 1714, als Gideon noch ein Kind war. Ihr Ring ist das einzige persönliche Erinnerungsstück, das Gideon aus Rebenwacht mitnahm.'
    }),
    person('gideon-weinlaub', 'Gideon Weinlaub', 'male', '1711', '', {
      title: 'Enterbter Erstgeborener · seit 1728 fahrender Ritter',
      lineageRole: 'branch',
      tags: ['Enterbt', 'Verstoßen', 'Fahrender Ritter', 'Im Exil'],
      notes: 'Gideon war Josiahs erstgeborener Sohn und ursprünglicher Erbe. Nach jahrelanger Einflussnahme seiner Stiefmutter Miryam wurde er 1728 mit siebzehn Jahren enterbt und verstoßen. Seither zieht er als fahrender Ritter durch die Reiche; im Jahr 1740 ist er neunundzwanzig Jahre alt.'
    }),
    spouse('miryam-weinlaub', 'Miryam Weinlaub', 'female', '1691', '', {
      title: 'Zweite Gemahlin Josiahs · Gideons Stiefmutter',
      notes: 'Miryam säte über Jahre Zweifel an Gideons Charakter und Eignung als Erben. Ihr Einfluss auf Josiah bereitete die Enterbung Gideons und die Bevorzugung ihres eigenen Sohnes Elias vor.'
    }),
    person('elias-weinlaub', 'Elias Weinlaub', 'male', '1719', '', {
      title: 'Jüngerer Halbbruder Gideons · bevorzugter Erbe',
      lineageRole: 'mainline',
      tags: ['Bevorzugter Erbe'],
      notes: 'Elias ist der Sohn Josiahs aus dessen zweiter Ehe mit Miryam. Obwohl Gideon der Erstgeborene war, bestimmte Josiah Elias 1728 zum neuen Erben des Hauses Weinlaub.'
    })
  ],
  partnerships: [
    createMarriage('marriage-unknown-founders-weinlaub', ...UNKNOWN_FOUNDER_IDS, {
      status: 'ended'
    }),
    createMarriage('marriage-salomon-rebekka-weinlaub', ...SALOMON_REBEKKA_IDS, {
      status: 'ended',
      end: '1710'
    }),
    createMarriage('marriage-josiah-rahel-weinlaub', ...JOSIAH_RAHEL_IDS, {
      status: 'widowed',
      end: '1714'
    }),
    createMarriage('marriage-josiah-miryam-weinlaub', ...JOSIAH_MIRYAM_IDS, {
      status: 'active',
      start: '1716'
    })
  ],
  parentages: [
    ...createParentages(
      ['salomon-weinlaub'],
      UNKNOWN_FOUNDER_IDS,
      'marriage-unknown-founders-weinlaub',
      {
        idPrefix: 'weinlaub-parentage',
        type: 'claimed',
        certainty: 'probable',
        notes: 'Salomon steht für die erste namentlich ausgestaltete Generation nach der Überlieferungslücke; die genaue Zahl der Zwischengenerationen ist unbekannt.',
        extensions: { timeJumpId: 'gap-unknown-founders-salomon-weinlaub' }
      }
    ),
    ...createParentages(
      ['josiah-weinlaub'],
      SALOMON_REBEKKA_IDS,
      'marriage-salomon-rebekka-weinlaub',
      { idPrefix: 'weinlaub-parentage' }
    ),
    ...createParentages(
      ['gideon-weinlaub'],
      JOSIAH_RAHEL_IDS,
      'marriage-josiah-rahel-weinlaub',
      { idPrefix: 'weinlaub-parentage' }
    ),
    ...createParentages(
      ['elias-weinlaub'],
      JOSIAH_MIRYAM_IDS,
      'marriage-josiah-miryam-weinlaub',
      { idPrefix: 'weinlaub-parentage' }
    )
  ],
  cadetBranches: [],
  timeJumps: [
    {
      id: 'gap-unknown-founders-salomon-weinlaub',
      parentPartnershipId: 'marriage-unknown-founders-weinlaub',
      parentPersonId: '',
      childIds: ['salomon-weinlaub'],
      years: 0,
      fromYear: '????',
      toYear: '1647',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung ist der einzige und absolute Generationentrenner zwischen dem Gründerwappen und Gideons Großvater Salomon.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-weinlaub',
    houseId: WEINLAUB_HOUSE_ID,
    crestSubtitle: 'Niederes Ritterhaus am Ewigensee',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'josiah-weinlaub',
    orientation: 'vertical',
    ancestorDepth: 4,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Modulvorlagen/gideon-weinlaub.json',
    sourceNote: 'Gideons Name, Geburtsjahr 1711, Alter 29 im Jahr 1740, sein Status als enterbter Erstgeborener und fahrender Ritter, Vater Josiah, Stiefmutter Miryam, Halbbruder Elias, Rahels früher Tod sowie die Bevorzugung des Sohnes aus Josiahs zweiter Ehe folgen der Modulvorlage und den ausdrücklichen Benutzervorgaben. Der Baum beginnt nach Vorgabe mit einem unbekannten Gründerpaar; unter dessen Weinlaub-Wappen steht genau ein absoluter serieller Zeitsprung, bevor die namentlich ausgestaltete Linie bei Gideons Großvater Salomon einsetzt. Salomon, Rebekka, Rahel und die ergänzten Jahreszahlen dienen als kompakte deutsch-jüdisch geprägte Ausgestaltung der fehlenden Generationen.',
    registryManagedExtensionFields: ['sourceNote', 'successionConflict'],
    successionConflict: {
      fatherPersonId: 'josiah-weinlaub',
      deceasedMotherPersonId: 'rahel-weinlaub-spouse',
      stepmotherPersonId: 'miryam-weinlaub',
      originalHeirPersonId: 'gideon-weinlaub',
      preferredHeirPersonId: 'elias-weinlaub',
      firstMotherDiedAt: '1714',
      remarriedAt: '1716',
      disinheritedAt: '1728',
      exiledAt: '1728',
      basis: 'Miryam säte über Jahre Zweifel an Gideons Charakter und Eignung. Josiah entzog daraufhin seinem erstgeborenen Sohn das Erbrecht, verwies ihn des Hauses und bevorzugte Elias, den Sohn seiner zweiten Ehe.'
    }
  }
});
