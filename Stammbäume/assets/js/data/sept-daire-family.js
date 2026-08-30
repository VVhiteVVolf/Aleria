import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import {
  CEITHEACH_HOUSE_PROFILES,
  CEITHEACH_MANAGED_PROFILE_FIELDS
} from './ceitheach-house-profiles.js';
import { SEPT_DAIRE_PORTRAITS } from './sept-daire-portraits.js';

const DAIRE_HOUSE_ID = 'sept-daire';
const DAIRE_EMBLEM = 'assets/images/houses/Ceitheach/sept-daire.png';

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
    houseId: options.houseId === undefined ? DAIRE_HOUSE_ID : options.houseId,
    portrait: SEPT_DAIRE_PORTRAITS[id] || '',
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
  founders: ['unknown-founder-daire', 'unknown-founder-wife-daire'],
  grandparents: ['donnchadh-daire', 'mor-donnchadh-spouse'],
  ciaran: ['ciaran-daire', 'aoife-ciaran-spouse'],
  fergus: ['fergus-daire', 'nessa-fergus-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-unknown-founders-daire': COUPLES.founders,
  'marriage-donnchadh-mor-daire': COUPLES.grandparents,
  'marriage-ciaran-aoife-daire': COUPLES.ciaran,
  'marriage-fergus-nessa-daire': COUPLES.fergus
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'daire-parentage', ...options }
  );
}

export const SEPT_DAIRE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'sept-daire',
    title: 'Sept Daire',
    motto: '',
    description: 'Einfache bürgerliche Sept aus Tulachinis in den Hügeln von Tír na Droma. Die Daire lebten als Hügelbewohner von Handwerk, Vorratshandel und Viehhaltung und standen unter den Mac Tuirseach. Ihre Männer dienten als Tiarna-Krieger im Aufgebot ihrer Herren. Der Krieg von 1720 und seine unmittelbaren Folgen löschten die Familie bis auf Lorcán aus.',
    emblem: DAIRE_EMBLEM,
    houseProfile: CEITHEACH_HOUSE_PROFILES.daire
  },
  houses: [
    {
      id: DAIRE_HOUSE_ID,
      name: 'Sept Daire',
      motto: '',
      emblem: DAIRE_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('unknown-founder-daire', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer der Sept Daire',
      lineageRole: 'head',
      notes: 'Die frühen Namen und Lebensdaten der bürgerlichen Sept sind nicht überliefert.'
    }),
    spouse('unknown-founder-wife-daire', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin der Sept Daire'
    }),

    person('donnchadh-daire', 'Donnchadh Daire', 'male', '1646', '1720', {
      title: 'Sippenältester und Tiarna-Krieger · Im Kriegsaufgebot 1720 gefallen',
      lineageRole: 'head',
      tags: ['Tiarna-Krieger', 'Im Kriegsaufgebot gefallen'],
      notes: 'Donnchadh ist Lorcáns Großvater und der erste namentlich ausgestaltete Daire nach der Überlieferungslücke. Er fiel 1720 im Kriegsaufgebot der Mac Tuirseach.'
    }),
    spouse('mor-donnchadh-spouse', 'Mór', 'female', '1651', '1721', {
      title: 'Verwalterin der Sippenvorräte'
    }),

    person('ciaran-daire', 'Ciarán Daire', 'male', '1673', '1722', {
      title: 'Tiarna-Krieger · Im Kriegsaufgebot 1722 gefallen',
      tags: ['Tiarna-Krieger', 'Im Kriegsaufgebot gefallen'],
      notes: 'Ciarán war Lorcáns Vater und folgte wie die übrigen wehrfähigen Daire dem Kriegsaufgebot der Mac Tuirseach.'
    }),
    spouse('aoife-ciaran-spouse', 'Aoife', 'female', '1678', '1723', {
      title: 'Weberin und Kräutersammlerin',
      notes: 'Aoife war Lorcáns Mutter und versorgte die Sept als Weberin und Kräutersammlerin.'
    }),
    person('fergus-daire', 'Fergus Daire', 'male', '1677', '1720', {
      title: 'Tiarna-Krieger · Im Kriegsaufgebot 1720 gefallen',
      tags: ['Tiarna-Krieger', 'Im Kriegsaufgebot gefallen']
    }),
    spouse('nessa-fergus-spouse', 'Nessa', 'female', '1681', '1721', {
      title: 'Gerberin'
    }),

    person('lorcan-daire', 'Lorcán Daire', 'male', '1702', '', {
      title: 'Tiarna-Krieger im Exil · Letzter Daire',
      lineageRole: 'head',
      tags: ['Tiarna-Krieger', 'Letzter Daire', 'Im Exil', 'Im Dienst des Hauses Draig'],
      notes: 'Lorcán war beim Kriegsausbruch 1720 achtzehn und ist 1740 achtunddreißig Jahre alt. Er folgte zunächst dem Aufgebot der Mac Tuirseach, erkannte später die falschen Kriegsgründe und verlor in den Folgejahren seine gesamte Sept. Nach einem langen Dienst beim Clan Dal’Leite wurde er wegen seiner Herkunft verstoßen und sucht nun außerhalb der albischen Fürstentümer einen neuen Herrn.'
    }),
    person('muireann-daire', 'Muireann Daire', 'female', '1706', '1721', {
      title: 'Töpferin',
      notes: 'Muireann war Lorcáns jüngere Schwester und arbeitete als Töpferin der Sept.'
    }),
    person('conall-daire', 'Conall Daire', 'male', '1705', '1722', {
      title: 'Junger Tiarna-Krieger · Im Kriegsaufgebot 1722 gefallen',
      tags: ['Tiarna-Krieger', 'Im Kriegsaufgebot gefallen'],
      notes: 'Lorcáns Vetter wurde wie sein Vater Fergus von den Mac Tuirseach zu den Waffen gerufen.'
    })
  ],
  partnerships: [
    createMarriage('marriage-unknown-founders-daire', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-donnchadh-mor-daire', ...COUPLES.grandparents, {
      status: 'ended',
      end: '1720'
    }),
    createMarriage('marriage-ciaran-aoife-daire', ...COUPLES.ciaran, {
      status: 'ended',
      start: '1698',
      end: '1722'
    }),
    createMarriage('marriage-fergus-nessa-daire', ...COUPLES.fergus, {
      status: 'ended',
      start: '1702',
      end: '1720'
    })
  ],
  parentages: [
    ...childrenOf(['donnchadh-daire'], 'marriage-unknown-founders-daire', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Donnchadh steht für die erste namentlich ausgestaltete Generation nach einer unbekannten Zahl nicht überlieferter Daire.',
      extensions: { timeJumpId: 'gap-founders-donnchadh-daire' }
    }),
    ...childrenOf(['ciaran-daire', 'fergus-daire'], 'marriage-donnchadh-mor-daire'),
    ...childrenOf(['lorcan-daire', 'muireann-daire'], 'marriage-ciaran-aoife-daire'),
    ...childrenOf(['conall-daire'], 'marriage-fergus-nessa-daire')
  ],
  cadetBranches: [],
  timeJumps: [
    {
      id: 'gap-founders-donnchadh-daire',
      parentPartnershipId: 'marriage-unknown-founders-daire',
      parentPersonId: '',
      childIds: ['donnchadh-daire'],
      years: 0,
      fromYear: '????',
      toYear: '1646',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Einziger absoluter Generationentrenner zwischen dem Gründerwappen der Sept und Lorcáns Großvater Donnchadh.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-daire',
    houseId: DAIRE_HOUSE_ID,
    crestSubtitle: 'Bürgerliche Sept aus den Hügeln von Tulachinis',
    crestEmblemScale: 0.86,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'donnchadh-daire',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: 'Modulvorlagen/lorcan-daire.json',
    sourceNote: 'Lorcáns Name, Geburtsjahr 1702, Alter 18 beim Kriegsbeginn 1720 und 38 im Jahr 1740, Herkunft aus einer einfachen bürgerlichen Sept Ceitheachs, Aufgebot durch die Mac Tuirseach, spätere Heimatlosigkeit, Dienst beim Clan Dal’Leite und Weg nach Celtigerns Wacht folgen der Modulvorlage. Die aktuelle Benutzervorgabe verortet die Sept in Tulachinis unter Tír na Droma und Tir na Dorcha und bestimmt Lorcán als ihren einzigen Überlebenden. Der Stammbaum bleibt deshalb auf Großvater-, Eltern- und Lorcán-Generation begrenzt. Die Daire werden nicht als Bauernfamilie, sondern als bürgerliche Hügelbewohner geführt; die Männer sind Tiarna-Krieger und sterben ausdrücklich im Kriegsaufgebot. Die Frauen behalten ausschließlich ihre zivilen Berufsbezeichnungen. Alle acht ergänzten Daire und Eheangehörigen sterben im Krieg von 1720 oder bis 1723 an seinen unmittelbaren Folgen.',
    registryManagedExtensionFields: ['sourceNote', 'extinction'],
    registryManagedHouseProfileFields: CEITHEACH_MANAGED_PROFILE_FIELDS,
    extinction: {
      warStartYear: 1720,
      settlement: 'Tulachinis',
      lastSurvivorPersonId: 'lorcan-daire',
      casualtyPersonIds: [
        'donnchadh-daire',
        'mor-donnchadh-spouse',
        'ciaran-daire',
        'aoife-ciaran-spouse',
        'fergus-daire',
        'nessa-fergus-spouse',
        'muireann-daire',
        'conall-daire'
      ],
      levyFallenPersonIds: [
        'donnchadh-daire',
        'ciaran-daire',
        'fergus-daire',
        'conall-daire'
      ]
    }
  }
});
