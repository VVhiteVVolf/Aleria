import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_THORNWICK_PORTRAITS } from './house-thornwick-portraits.js';
import { TALYNDOR_HOUSE_PROFILES } from './talyndor-house-profiles.js';

const THORNWICK_HOUSE_ID = 'house-thornwick';
const THORNWICK_EMBLEM = 'assets/images/houses/Talyndor/haus-thornwick.png';

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
    houseId: options.houseId === undefined ? THORNWICK_HOUSE_ID : options.houseId,
    portrait: HOUSE_THORNWICK_PORTRAITS[id] || '',
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
  founders: ['unknown-founder-thornwick', 'unknown-founder-wife-thornwick'],
  grandparents: ['garric-thornwick', 'maelin-garric-spouse'],
  berwyn: ['berwyn-thornwick', 'helyne-berwyn-spouse'],
  aldric: ['aldric-thornwick', 'elwyn-thornwick-spouse'],
  osgar: ['osgar-thornwick', 'mara-osgar-spouse'],
  rowena: ['rowena-thornwick', 'unknown-rowena-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-unknown-founders-thornwick': COUPLES.founders,
  'marriage-garric-maelin-thornwick': COUPLES.grandparents,
  'marriage-berwyn-helyne-thornwick': COUPLES.berwyn,
  'marriage-aldric-elwyn-thornwick': COUPLES.aldric,
  'marriage-osgar-mara-thornwick': COUPLES.osgar
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'thornwick-parentage', ...options }
  );
}

export const HOUSE_THORNWICK_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-thornwick',
    title: 'Haus Thornwick',
    motto: 'Auch im Dunkel sehen wir.',
    description: 'Nahezu ausgelöschtes niederes Rittergeschlecht aus Thornholt in Talyndor. Nach dem Umsturz durch die Triarchie im Jahr 1720 verlor das Haus seine Waldburg, floh in die Wälder und kämpfte an der Seite der Blauschwingen weiter. Refri wurde dort seit ihrem fünften Lebensjahr erzogen und führt das Haus nach der Hinrichtung ihrer Eltern im Jahr 1739.',
    emblem: THORNWICK_EMBLEM,
    houseProfile: TALYNDOR_HOUSE_PROFILES.thornwick
  },
  houses: [
    {
      id: THORNWICK_HOUSE_ID,
      name: 'Haus Thornwick',
      motto: 'Auch im Dunkel sehen wir.',
      emblem: THORNWICK_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('unknown-founder-thornwick', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Hauses Thornwick',
      lineageRole: 'head',
      notes: 'Name, Lebensdaten und Gründungsjahr der frühen Thornwick sind nicht überliefert.'
    }),
    spouse('unknown-founder-wife-thornwick', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Hauses Thornwick'
    }),

    person('garric-thornwick', 'Garric Thornwick', 'male', '1647', '1720', {
      title: 'Ritterherr von Thornholt · Gefallen bei der Verteidigung der Waldburg',
      lineageRole: 'head',
      tags: ['Kriegsopfer 1720'],
      notes: 'Garric ist Refris Großvater und der erste namentlich ausgestaltete Thornwick nach der Überlieferungslücke. Er fiel beim Angriff der Triarchie auf Thornholt.'
    }),
    spouse('maelin-garric-spouse', 'Maelin', 'female', '1652', '1721', {
      title: 'Gemahlin Garrics · Auf der Flucht in den Wald gestorben',
      tags: ['Kriegsopfer']
    }),

    person('berwyn-thornwick', 'Berwyn Thornwick', 'male', '1672', '1720', {
      title: 'Ältester Sohn Garrics · Gefallen beim Fall von Thornholt',
      tags: ['Kriegsopfer 1720']
    }),
    spouse('helyne-berwyn-spouse', 'Helyne', 'female', '1677', '1720', {
      title: 'Gemahlin Berwyns · Beim Rückzug aus Thornholt getötet',
      tags: ['Kriegsopfer 1720']
    }),
    person('aldric-thornwick', 'Aldric Thornwick', 'male', '1680', '1739', {
      title: 'Waldritter · Vater Refris · Vor Burg Warren hingerichtet',
      tags: ['Blauschwingen', 'Hingerichtet 1739'],
      notes: 'Aldric wurde bei einem Vorratsüberfall der Blauschwingen gefangen genommen und eine Woche später gemeinsam mit Elwyn öffentlich hingerichtet.'
    }),
    spouse('elwyn-thornwick-spouse', 'Elwyn Thornwick', 'female', '1685', '1739', {
      title: 'Mutter Refris · Vor Burg Warren hingerichtet',
      tags: ['Blauschwingen', 'Hingerichtet 1739'],
      notes: 'Elwyn erzog Refri im Wald zur Ritterin und wurde gemeinsam mit Aldric öffentlich hingerichtet.'
    }),
    person('osgar-thornwick', 'Osgar Thornwick', 'male', '1683', '1728', {
      title: 'Waldläufer der Blauschwingen · Im Widerstand gefallen',
      tags: ['Blauschwingen', 'Kriegsopfer']
    }),
    spouse('mara-osgar-spouse', 'Mara', 'female', '1686', '1720', {
      title: 'Gemahlin Osgars · Auf der Flucht aus Thornholt getötet',
      tags: ['Kriegsopfer 1720']
    }),
    person('rowena-thornwick', 'Rowena Thornwick', 'female', '1688', '', {
      title: 'Wegverheiratete Tochter Garrics · Tante Refris',
      tags: ['Wegverheiratet', 'Überlebende des Hauses'],
      notes: 'Rowena hatte Thornholt bereits vor dem Krieg durch ihre Ehe verlassen und überlebte dadurch den Untergang der Kernfamilie.'
    }),
    spouse('unknown-rowena-spouse', '???', 'male', '1685', '', {
      title: 'Gemahl Rowenas · Haus unbekannt'
    }),

    person('ivor-thornwick', 'Ivor Thornwick', 'male', '1699', '1720', {
      title: 'Waldritter · Gefallen beim Fall von Thornholt',
      tags: ['Kriegsopfer 1720']
    }),
    person('seren-thornwick', 'Seren Thornwick', 'female', '1704', '1724', {
      title: 'Späherin der Blauschwingen · Im Widerstand gefallen',
      tags: ['Blauschwingen', 'Kriegsopfer']
    }),
    person('refri-thornwick', 'Refri Thornwick', 'female', '1715', '', {
      title: 'Ritterin · Oberhaupt des heimatlosen Hauses Thornwick',
      lineageRole: 'head',
      tags: ['Überlebende des Hauses', 'Ehemals Blauschwingen', 'Im Dienst des Hauses Draig'],
      notes: 'Refri ist 1740 fünfundzwanzig Jahre alt. Als die Triarchie 1720 Thornholt stürzte, war sie fünf und floh mit ihren Eltern in die Wälder. Nach deren Hinrichtung 1739 brach sie mit den Blauschwingen auf und sucht in Celtigerns Wacht einen neuen ritterlichen Dienst.'
    }),
    person('wulstan-thornwick', 'Wulstan Thornwick', 'male', '1706', '', {
      title: 'Waldläufer der Blauschwingen · Vetter Refris',
      tags: ['Blauschwingen', 'Überlebender des Hauses'],
      notes: 'Wulstan ist 1740 vierunddreißig Jahre alt und kämpft weiterhin in Talyndors Wäldern. Er erkennt Refri als Oberhaupt des heimatlosen Hauses an und beansprucht Thornwick nicht für sich.'
    })
  ],
  partnerships: [
    createMarriage('marriage-unknown-founders-thornwick', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-garric-maelin-thornwick', ...COUPLES.grandparents, {
      status: 'ended',
      end: '1720'
    }),
    createMarriage('marriage-berwyn-helyne-thornwick', ...COUPLES.berwyn, {
      status: 'ended',
      start: '1697',
      end: '1720'
    }),
    createMarriage('marriage-aldric-elwyn-thornwick', ...COUPLES.aldric, {
      status: 'ended',
      start: '1712',
      end: '1739'
    }),
    createMarriage('marriage-osgar-mara-thornwick', ...COUPLES.osgar, {
      status: 'ended',
      start: '1704',
      end: '1720'
    }),
    createMarriage('marriage-rowena-unknown-thornwick', ...COUPLES.rowena, { start: '1708' })
  ],
  parentages: [
    ...childrenOf(['garric-thornwick'], 'marriage-unknown-founders-thornwick', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Garric steht für die erste namentlich ausgestaltete Generation nach einer unbekannten Zahl nicht überlieferter Vorfahren.',
      extensions: { timeJumpId: 'gap-founders-garric-thornwick' }
    }),
    ...childrenOf(
      ['berwyn-thornwick', 'aldric-thornwick', 'osgar-thornwick', 'rowena-thornwick'],
      'marriage-garric-maelin-thornwick'
    ),
    ...childrenOf(['ivor-thornwick', 'seren-thornwick'], 'marriage-berwyn-helyne-thornwick'),
    ...childrenOf(['refri-thornwick'], 'marriage-aldric-elwyn-thornwick'),
    ...childrenOf(['wulstan-thornwick'], 'marriage-osgar-mara-thornwick')
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-rowena-thornwick',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-rowena-unknown-thornwick',
      houseId: 'house-unbekannt-rowena-thornwick',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Rowena Thornwick führt nach ihrer Ehe keine Thornwick-Linie fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-garric-thornwick',
      parentPartnershipId: 'marriage-unknown-founders-thornwick',
      parentPersonId: '',
      childIds: ['garric-thornwick'],
      years: 0,
      fromYear: '????',
      toYear: '1647',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Einziger absoluter Generationentrenner zwischen dem Thornwick-Hauswappen und Refris Großvater Garric.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-thornwick',
    houseId: THORNWICK_HOUSE_ID,
    crestSubtitle: 'Heimatloses Rittergeschlecht aus Thornholt',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'garric-thornwick',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Modulvorlagen/refri-thornwick.json',
    sourceNote: 'Refris Name, Geburtsjahr 1715, Alter 25 im Jahr 1740, Eltern Aldric und Elwyn, Kindheit im Wald seit dem Umsturz von 1720, Erziehung bei den Blauschwingen, Bruch nach der Gefangennahme und öffentlichen Hinrichtung ihrer Eltern sowie ihr Weg nach Celtigerns Wacht folgen der Modulvorlage. Die aktuelle Benutzervorgabe präzisiert die Hinrichtung auf 1739 und ergänzt Rowena als wegverheiratete Tante sowie Wulstan als älteren, weiterhin bei den Blauschwingen kämpfenden Vetter. Damit ist Refri nicht die buchstäblich einzige Überlebende, bleibt aber Oberhaupt und letzte Erbin ihrer unmittelbaren Linie. Sämtliche ergänzten Todesfälle liegen zwischen dem Fall Thornholts 1720 und der Hinrichtung von Aldric und Elwyn 1739.',
    registryManagedExtensionFields: ['sourceNote', 'warLosses', 'survivors'],
    warLosses: {
      uprisingYear: 1720,
      lostSeat: 'Waldburg Thornholt',
      parentExecutionYear: 1739,
      casualtyPersonIds: [
        'garric-thornwick',
        'maelin-garric-spouse',
        'berwyn-thornwick',
        'helyne-berwyn-spouse',
        'aldric-thornwick',
        'elwyn-thornwick-spouse',
        'osgar-thornwick',
        'mara-osgar-spouse',
        'ivor-thornwick',
        'seren-thornwick'
      ]
    },
    survivors: [
      {
        personId: 'refri-thornwick',
        role: 'Hausoberhaupt und fahrende Ritterin'
      },
      {
        personId: 'wulstan-thornwick',
        role: 'Vetter und aktiver Widerstandskämpfer der Blauschwingen'
      },
      {
        personId: 'rowena-thornwick',
        role: 'Vor dem Krieg wegverheiratete Tante'
      }
    ]
  }
});
