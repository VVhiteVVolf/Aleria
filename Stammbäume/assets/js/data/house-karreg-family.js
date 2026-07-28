import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_KARREG_PORTRAITS } from './house-karreg-portraits.js';
import { MORGORN_HOUSE_PROFILES } from './morgorn-house-profiles.js';

const KARREG_HOUSE_ID = 'house-karreg';
const KARREG_EMBLEM = 'assets/images/houses/Morgorn/haus-karreg.png';

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
    houseId: options.houseId === undefined ? KARREG_HOUSE_ID : options.houseId,
    portrait: HOUSE_KARREG_PORTRAITS[id] || '',
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

const COUPLES = Object.freeze({
  founders: ['unknown-founder-karreg', 'unknown-founder-wife-karreg'],
  grandparents: ['karhald-karreg', 'faurkarna-karreg-spouse'],
  brennar: ['brennar-karreg', 'maela-karreg-spouse'],
  vethran: ['vethran-karreg', 'orkarna-vethran-spouse'],
  halchor: ['halchor-karreg', 'dorhelda-halchor-spouse'],
  thoran: ['thoran-karreg', 'skarthera-thoran-spouse'],
  arkarn: ['arkarn-karreg', 'lanchora-arkarn-spouse'],
  gorthera: ['gorthera-karreg', 'unknown-gorthera-spouse'],
  wartharn: ['wartharn-karreg', 'erkarna-wartharn-spouse'],
  shenhelda: ['shenhelda-karreg', 'unknown-shenhelda-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-unknown-founders-karreg': COUPLES.founders,
  'marriage-karhald-faurkarna-karreg': COUPLES.grandparents,
  'marriage-brennar-maela-karreg': COUPLES.brennar,
  'marriage-vethran-orkarna-karreg': COUPLES.vethran,
  'marriage-halchor-dorhelda-karreg': COUPLES.halchor,
  'marriage-thoran-skarthera-karreg': COUPLES.thoran,
  'marriage-arkarn-lanchora-karreg': COUPLES.arkarn,
  'marriage-wartharn-erkarna-karreg': COUPLES.wartharn
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'karreg-parentage', ...options }
  );
}

export const HOUSE_KARREG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-karreg',
    title: 'Haus Karreg',
    motto: 'Aus Stein geboren, im Sturm bewährt.',
    description: 'Niederes Rittergeschlecht aus der Felsbreche in Morgorn. Von Burg Karregwacht aus sichern die Karreg die Gebirgspässe, züchten gepanzerte Kriegswidder und dienen dem Königshaus Eisenherz. Die gegenwärtige Familie gliedert sich in drei männliche Linien; Keldran entstammt der Hauptlinie, hat Morgorn jedoch als Felsenritter verlassen.',
    emblem: KARREG_EMBLEM,
    houseProfile: MORGORN_HOUSE_PROFILES.karreg
  },
  houses: [
    {
      id: KARREG_HOUSE_ID,
      name: 'Haus Karreg',
      motto: 'Aus Stein geboren, im Sturm bewährt.',
      emblem: KARREG_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('unknown-founder-karreg', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Hauses Karreg',
      lineageRole: 'head',
      notes: 'Name und Lebensdaten des im Jahr 1214 belegten Hausgründers sind nicht überliefert.'
    }),
    spouse('unknown-founder-wife-karreg', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Hauses Karreg'
    }),

    person('karhald-karreg', 'Karhald Karreg', 'male', '1642', '1709', {
      title: 'Ritterherr von Karregwacht bis 1709',
      lineageRole: 'head',
      notes: 'Karhald ist Keldrans Großvater und der erste namentlich ausgestaltete Vorfahr nach der Überlieferungslücke.'
    }),
    spouse('faurkarna-karreg-spouse', 'Faurkarna', 'female', '1648', '1715', {
      title: 'Gemahlin Karhalds'
    }),

    person('brennar-karreg', 'Brennar Karreg', 'male', '1672', '1736', {
      title: 'Ritterherr von Karregwacht bis 1736',
      lineageRole: 'head',
      tags: ['Erste Linie'],
      notes: 'Brennar war Keldrans Vater und führte als ältester Sohn die Hauptlinie fort.'
    }),
    spouse('maela-karreg-spouse', 'Maela', 'female', '1679', '', {
      title: 'Witwe Brennars · Mutter Keldrans'
    }),
    person('vethran-karreg', 'Vethran Karreg', 'male', '1675', '', {
      title: 'Felsenritter · Hüter der westlichen Passwacht',
      tags: ['Zweite Linie']
    }),
    spouse('orkarna-vethran-spouse', 'Orkarna', 'female', '1680', '', {
      title: 'Gemahlin Vethrans'
    }),
    person('halchor-karreg', 'Halchor Karreg', 'male', '1679', '', {
      title: 'Felsenritter · Vorsteher der Widderzucht',
      tags: ['Dritte Linie']
    }),
    spouse('dorhelda-halchor-spouse', 'Dorhelda', 'female', '1684', '', {
      title: 'Gemahlin Halchors'
    }),

    person('thoran-karreg', 'Thoran Karreg', 'male', '1699', '', {
      title: 'Ritterherr von Karregwacht · Oberhaupt des Hauses',
      lineageRole: 'head',
      tags: ['Älterer Bruder Keldrans'],
      notes: 'Thoran ist Keldrans älterer Bruder und übernahm 1736 nach Brennars Tod die Führung des Hauses.'
    }),
    spouse('skarthera-thoran-spouse', 'Skarthera', 'female', '1705', '', {
      title: 'Gemahlin Thorans'
    }),
    person('keldran-karreg', 'Keldran Karreg', 'male', '1704', '', {
      title: 'Felsenritter von Morgorn · Widderritter',
      tags: ['Felsenritter', 'Widderritter', 'Graubart', 'Im Dienst des Hauses Draig'],
      notes: 'Keldran ist im Jahr 1740 sechsunddreißig Jahre alt. Er wurde gemeinsam mit Lady Brona Eisenherz am Königshof ausgebildet und zog später mit seinem Gebirgswidder Graubart nach Cenyr, um Haus Draig seinen Eid anzubieten. Er ist bewusst der einzige unverheiratete Karreg über dreißig.'
    }),
    person('brarena-karreg', 'Brarena Karreg', 'female', '1712', '', {
      title: 'Unverheiratete jüngste Tochter Brennars'
    }),

    person('arkarn-karreg', 'Arkarn Karreg', 'male', '1702', '', {
      title: 'Felsenritter der westlichen Passwacht'
    }),
    spouse('lanchora-arkarn-spouse', 'Lanchora', 'female', '1706', '', {
      title: 'Gemahlin Arkarns'
    }),
    person('gorthera-karreg', 'Gorthera Karreg', 'female', '1708', '', {
      title: 'Wegverheiratete Tochter Vethrans',
      tags: ['Wegverheiratet']
    }),
    spouse('unknown-gorthera-spouse', '???', 'male', '1705', '', {
      title: 'Gemahl Gortheras · Haus unbekannt'
    }),

    person('wartharn-karreg', 'Wartharn Karreg', 'male', '1703', '', {
      title: 'Felsenritter und Meister der Widderställe'
    }),
    spouse('erkarna-wartharn-spouse', 'Erkarna', 'female', '1707', '', {
      title: 'Gemahlin Wartharns'
    }),
    person('shenhelda-karreg', 'Shenhelda Karreg', 'female', '1710', '', {
      title: 'Wegverheiratete Tochter Halchors',
      tags: ['Wegverheiratet']
    }),
    spouse('unknown-shenhelda-spouse', '???', 'male', '1708', '', {
      title: 'Gemahl Shenheldas · Haus unbekannt'
    }),
    person('parorn-karreg', 'Parorn Karreg', 'male', '1714', '', {
      title: 'Unverheirateter jüngster Sohn Halchors'
    }),

    person('tarkarn-karreg', 'Tarkarn Karreg', 'male', '1728', '', {
      title: 'Ältester Sohn Thorans · vorgesehener Erbe',
      lineageRole: 'mainline'
    }),
    person('morrena-karreg', 'Morrena Karreg', 'female', '1731'),
    person('dorhald-karreg', 'Dorhald Karreg', 'male', '1735'),
    person('gorskar-karreg', 'Gorskar Karreg', 'male', '1729', '', {
      title: 'Ältester Sohn Arkarns'
    }),
    person('naiterga-karreg', 'Naiterga Karreg', 'female', '1733'),
    person('yrtharn-karreg', 'Yrtharn Karreg', 'male', '1730', '', {
      title: 'Ältester Sohn Wartharns'
    }),
    person('parzarn-karreg', 'Parzarn Karreg', 'male', '1733'),
    person('arkarna-karreg', 'Arkarna Karreg', 'female', '1737')
  ],
  partnerships: [
    createMarriage('marriage-unknown-founders-karreg', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-karhald-faurkarna-karreg', ...COUPLES.grandparents, {
      status: 'ended',
      end: '1709'
    }),
    createMarriage('marriage-brennar-maela-karreg', ...COUPLES.brennar, {
      status: 'widowed',
      start: '1697',
      end: '1736'
    }),
    createMarriage('marriage-vethran-orkarna-karreg', ...COUPLES.vethran, { start: '1698' }),
    createMarriage('marriage-halchor-dorhelda-karreg', ...COUPLES.halchor, { start: '1701' }),
    createMarriage('marriage-thoran-skarthera-karreg', ...COUPLES.thoran, { start: '1726' }),
    createMarriage('marriage-arkarn-lanchora-karreg', ...COUPLES.arkarn, { start: '1727' }),
    createMarriage('marriage-gorthera-unknown-karreg', ...COUPLES.gorthera, { start: '1730' }),
    createMarriage('marriage-wartharn-erkarna-karreg', ...COUPLES.wartharn, { start: '1728' }),
    createMarriage('marriage-shenhelda-unknown-karreg', ...COUPLES.shenhelda, { start: '1733' })
  ],
  parentages: [
    ...childrenOf(['karhald-karreg'], 'marriage-unknown-founders-karreg', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Karhald steht für die erste namentlich ausgestaltete Generation nach einer unbekannten Zahl nicht überlieferter Vorfahren.',
      extensions: { timeJumpId: 'gap-founders-karhald-karreg' }
    }),
    ...childrenOf(
      ['brennar-karreg', 'vethran-karreg', 'halchor-karreg'],
      'marriage-karhald-faurkarna-karreg'
    ),
    ...childrenOf(
      ['thoran-karreg', 'keldran-karreg', 'brarena-karreg'],
      'marriage-brennar-maela-karreg'
    ),
    ...childrenOf(['arkarn-karreg', 'gorthera-karreg'], 'marriage-vethran-orkarna-karreg'),
    ...childrenOf(
      ['wartharn-karreg', 'shenhelda-karreg', 'parorn-karreg'],
      'marriage-halchor-dorhelda-karreg'
    ),
    ...childrenOf(
      ['tarkarn-karreg', 'morrena-karreg', 'dorhald-karreg'],
      'marriage-thoran-skarthera-karreg'
    ),
    ...childrenOf(['gorskar-karreg', 'naiterga-karreg'], 'marriage-arkarn-lanchora-karreg'),
    ...childrenOf(
      ['yrtharn-karreg', 'parzarn-karreg', 'arkarna-karreg'],
      'marriage-wartharn-erkarna-karreg'
    )
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-gorthera-karreg',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-gorthera-unknown-karreg',
      houseId: 'house-unbekannt-gorthera-karreg',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Gorthera Karreg führt nach ihrer Ehe keine Karreg-Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-shenhelda-karreg',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-shenhelda-unknown-karreg',
      houseId: 'house-unbekannt-shenhelda-karreg',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Shenhelda Karreg führt nach ihrer Ehe keine Karreg-Linie fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-karhald-karreg',
      parentPartnershipId: 'marriage-unknown-founders-karreg',
      parentPersonId: '',
      childIds: ['karhald-karreg'],
      years: 0,
      fromYear: '1214',
      toYear: '1642',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Einziger absoluter Generationentrenner zwischen dem Karreg-Hauswappen und Keldrans Großvater Karhald.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-karreg',
    houseId: KARREG_HOUSE_ID,
    crestSubtitle: 'Niederes Rittergeschlecht aus der Felsbreche',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'karhald-karreg',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Modulvorlagen/keldran-karreg.json',
    sourceNote: 'Keldrans Name, Geburtsjahr 1704, Alter 36 im Jahr 1740, Rang als Felsen- und Widderritter, Vater Brennar, Mutter Maela, älterer Bruder und gegenwärtiges Oberhaupt Thoran, Ausbildung am Hof der Eisenherz sowie sein Zug mit Graubart nach Cenyr folgen der Modulvorlage. Die aktuelle Benutzervorgabe vereinheitlicht die dort wechselnde Schreibweise Karrag/Karreg auf Karreg. Der Stammbaum beginnt mit unbekannten Gründern, dem silbern gerahmten Hauswappen und genau einem seriellen Zeitsprung; danach folgen Keldrans Großvater Karhald, die drei Söhne Brennar, Vethran und Halchor als exakt drei Hauslinien, Keldrans Generation und deren junge Sprösslinge. Sämtliche ergänzten Eigennamen entstammen den belegten Morgar/Karnrith-Stämmen und Endformen. Es gibt keine Affären oder Bastarde; alle lebenden Personen unter 29 bleiben unverheiratet, und Keldran ist der einzige ledige Karreg über dreißig.',
    registryManagedExtensionFields: ['sourceNote', 'threeLines'],
    threeLines: [
      {
        anchorPersonId: 'brennar-karreg',
        currentPersonIds: ['thoran-karreg', 'keldran-karreg', 'brarena-karreg'],
        descendantPersonIds: ['tarkarn-karreg', 'morrena-karreg', 'dorhald-karreg']
      },
      {
        anchorPersonId: 'vethran-karreg',
        currentPersonIds: ['arkarn-karreg', 'gorthera-karreg'],
        descendantPersonIds: ['gorskar-karreg', 'naiterga-karreg']
      },
      {
        anchorPersonId: 'halchor-karreg',
        currentPersonIds: ['wartharn-karreg', 'shenhelda-karreg', 'parorn-karreg'],
        descendantPersonIds: ['yrtharn-karreg', 'parzarn-karreg', 'arkarna-karreg']
      }
    ]
  }
});
