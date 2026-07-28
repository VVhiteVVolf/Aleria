import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GOLDMUND_HOUSE_PROFILES } from './goldmund-house-profiles.js';
import { HOUSE_HOCHREUTH_PORTRAITS } from './house-hochreuth-portraits.js';

const HOCHREUTH_HOUSE_ID = 'house-von-hochreuth';
const HOCHREUTH_EMBLEM = 'assets/images/houses/Goldmund/haus-von-hochreuth.png';
const RODEN_HOUSE_ID = 'house-roden';
const RODEN_EMBLEM = 'assets/images/houses/Goldmund/haus-roden.png';

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

function lineageRoleFor(personId) {
  if ([
    'friedrich-von-hochreuth-senior',
    'albrecht-von-hochreuth',
    'wilhelm-von-hochreuth',
    'ruprecht-von-hochreuth',
    'otto-von-hochreuth'
  ].includes(personId)) {
    return 'head';
  }
  if ([
    'eberhard-von-hochreuth',
    'friedrich-wilhelm-von-hochreuth',
    'ernst-von-hochreuth'
  ].includes(personId)) {
    return 'mainline';
  }
  return 'branch';
}

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? HOCHREUTH_HOUSE_ID : options.houseId,
    portrait: HOUSE_HOCHREUTH_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || lineageRoleFor(id),
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
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

const FRIEDRICH_KATHARINA_IDS = ['friedrich-von-hochreuth-senior', 'katharina-hochreuth-spouse'];
const ALBRECHT_ANNA_IDS = ['albrecht-von-hochreuth', 'anna-hochreuth-spouse'];
const FRIEDRICH_OTTILIE_IDS = ['friedrich-von-hochreuth-junior', 'ottilie-friedrich-fiancee'];
const LUISE_KONRAD_IDS = ['luise-von-hochreuth', 'konrad-unknown-spouse'];
const WILHELM_ELISABETH_IDS = ['wilhelm-von-hochreuth', 'elisabeth-hochreuth-spouse'];
const FRIEDERIKE_AUGUST_IDS = ['friederike-von-hochreuth', 'august-unknown-spouse'];
const RUPRECHT_MARGARETHE_IDS = ['ruprecht-von-hochreuth', 'margarethe-hochreuth-spouse'];
const LEOPOLD_CHARLOTTE_IDS = ['leopold-von-hochreuth', 'charlotte-roden-spouse'];
const OTTO_WILHELMINE_IDS = ['otto-von-hochreuth', 'wilhelmine-hochreuth-spouse'];
const DOROTHEA_GEORG_IDS = ['dorothea-von-hochreuth', 'georg-unknown-spouse'];

export const HOUSE_HOCHREUTH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-von-hochreuth',
    title: 'Haus von Hochreuth',
    motto: 'Unsere Wurzeln tragen uns.',
    description: 'Altehrwürdiges Ritterherrenhaus aus Goldmund und Vasall des Hauses Roden. Nach dem Stammwappen folgen Friedrichs drei Söhne Albrecht, Wilhelm und Leopold sowie seine wegverheiratete Tochter Dorothea. Nach dem Tod Albrechts und seiner drei Söhne beim Jagdausflug führt die rechtmäßige Erbfolge über Wilhelm zu Ruprecht. Otto gewinnt Burg und Titel erst 1736 durch einen politischen Eingriff des mit ihm mütterlicherseits verwandten Hauses Roden.',
    emblem: HOCHREUTH_EMBLEM,
    houseProfile: GOLDMUND_HOUSE_PROFILES.hochreuth
  },
  houses: [
    {
      id: HOCHREUTH_HOUSE_ID,
      name: 'Haus von Hochreuth',
      motto: 'Unsere Wurzeln tragen uns.',
      emblem: HOCHREUTH_EMBLEM,
      status: 'active'
    },
    {
      id: RODEN_HOUSE_ID,
      name: 'Haus Roden',
      motto: '',
      emblem: RODEN_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('friedrich-von-hochreuth-senior', 'Friedrich von Hochreuth', 'male', '1623', '1692', {
      title: 'Ritterherr von Hochreuth bis 1692',
      notes: 'Friedrich hinterließ drei Söhne und eine Tochter. Nach seinem Tod ging das Lehen nach gewöhnlicher männlicher Erbfolge zunächst an seinen ältesten Sohn Albrecht.'
    }),
    spouse('katharina-hochreuth-spouse', 'Katharina', 'female', '1628', '1704', {
      title: 'Gemahlin Friedrichs'
    }),

    person('albrecht-von-hochreuth', 'Albrecht von Hochreuth', 'male', '1648', '1699', {
      title: 'Ritterherr 1692–1699 · Tod beim Jagdausflug',
      tags: ['Tod beim Jagdausflug'],
      notes: 'Albrecht erbte als ältester Sohn rechtmäßig Burg und Titel. 1699 starb er auf einem gemeinsamen Jagdausflug mit allen drei Söhnen, als der Übergang über eine baufällige Schluchtbrücke unter der Jagdgesellschaft zusammenbrach.'
    }),
    spouse('anna-hochreuth-spouse', 'Anna', 'female', '1652', '1725', {
      title: 'Gemahlin Albrechts'
    }),
    person('eberhard-von-hochreuth', 'Eberhard von Hochreuth', 'male', '1670', '1699', {
      title: 'Ältester Sohn Albrechts · vorgesehener Erbe · Tod beim Jagdausflug',
      tags: ['Tod beim Jagdausflug']
    }),
    person('friedrich-von-hochreuth-junior', 'Friedrich von Hochreuth', 'male', '1673', '1699', {
      title: 'Zweiter Sohn Albrechts · Tod beim Jagdausflug',
      tags: ['Tod beim Jagdausflug']
    }),
    spouse('ottilie-friedrich-fiancee', 'Ottilie', 'female', '1675', '', {
      title: 'Verlobte Friedrichs',
      familyRole: 'betrothed',
      notes: 'Ottilies Familienname und Herkunftshaus sind nicht überliefert. Die Verlobung endete durch Friedrichs Tod beim Jagdausflug 1699.'
    }),
    person('heinrich-von-hochreuth', 'Heinrich von Hochreuth', 'male', '1676', '1699', {
      title: 'Dritter Sohn Albrechts · Tod beim Jagdausflug',
      tags: ['Tod beim Jagdausflug']
    }),
    person('luise-von-hochreuth', 'Luise von Hochreuth', 'female', '1678', '', {
      title: 'Tochter Albrechts · wegverheiratet',
      tags: ['Wegverheiratet'],
      notes: 'Luise überlebte ihren Vater und ihre Brüder. Nach dem für das Ritterlehen geltenden männlichen Erbgang fiel Burg Hochreuth 1699 an ihren Onkel Wilhelm. Das Haus ihres Ehemannes ist nicht überliefert.'
    }),
    spouse('konrad-unknown-spouse', 'Konrad', 'male', '1674', '', {
      title: 'Gemahl Luises · Haus unbekannt'
    }),

    person('wilhelm-von-hochreuth', 'Wilhelm von Hochreuth', 'male', '1651', '1708', {
      title: 'Ritterherr 1699–1708',
      tags: ['Rechtmäßiger Erbe nach dem Jagdunglück'],
      notes: 'Nach dem Tod Albrechts und aller drei männlichen Erben fiel das Lehen ohne konkurrierenden Anspruch an Wilhelm. Nach Wilhelms Tod 1708 erbte sein Sohn Ruprecht.'
    }),
    spouse('elisabeth-hochreuth-spouse', 'Elisabeth', 'female', '1655', '1720', {
      title: 'Gemahlin Wilhelms'
    }),
    person('friederike-von-hochreuth', 'Friederike von Hochreuth', 'female', '1677', '', {
      title: 'Tochter Wilhelms · wegverheiratet',
      tags: ['Wegverheiratet'],
      notes: 'Friederike wurde an August aus einem nicht überlieferten Haus verheiratet und führte das Haus von Hochreuth nicht fort.'
    }),
    spouse('august-unknown-spouse', 'August', 'male', '1673', '', {
      title: 'Gemahl Friederikes · Haus unbekannt'
    }),
    person('ruprecht-von-hochreuth', 'Ruprecht von Hochreuth', 'male', '1674', '', {
      title: 'Rechtmäßiger Ritterherr 1708–1736 · im Exil',
      tags: ['Ehemaliger Ritterherr', 'Im Exil'],
      notes: 'Ruprecht erbte Burg Hochreuth 1708 regulär von seinem Vater Wilhelm. Nach seinem Zerwürfnis mit Haus Roden wurde nicht seine Abstammung angezweifelt; vielmehr erklärte der Lehnsherr 1736 Ruprecht und seine Nachkommen für verwirkt und setzte dessen Vetter Otto ein. Ruprecht verweigerte einen Aufstand und zog mit Rupert, Kasper und freiwilligen Gefolgsleuten fort.'
    }),
    spouse('margarethe-hochreuth-spouse', 'Margarethe', 'female', '1693', '1719', {
      title: 'Gemahlin Ruprechts · bei Kaspers Geburt verstorben',
      notes: 'Ihr Familienname ist in der vorliegenden Hochreuther Überlieferung nicht genannt. Sie war fast zwanzig Jahre jünger als Ruprecht und starb 1719 bei der Geburt ihres jüngsten Sohnes Kasper.'
    }),
    person('rupert-von-hochreuth', 'Rupert von Hochreuth', 'male', '1712', '', {
      title: 'Ältester Sohn Ruprechts · ursprünglicher Erbe · im Exil',
      tags: ['Durch Haus Roden 1736 enterbt'],
      notes: 'Rupert war bis zur politischen Enteignung seiner Familie der vorgesehene Nachfolger Ruprechts. Er verließ Goldmund gemeinsam mit seinem Vater und seinem jüngeren Bruder.'
    }),
    person('kasper-von-hochreuth', 'Kasper von Hochreuth', 'male', '1719', '', {
      title: 'Zweiter Sohn Ruprechts · im Exil',
      tags: ['Durch Haus Roden 1736 enterbt'],
      notes: 'Kaspers Mutter starb bei seiner Geburt. Auch sein Anspruch wurde 1736 zusammen mit Ruprecht und dessen Nachkommen politisch verworfen.'
    }),

    person('leopold-von-hochreuth', 'Leopold von Hochreuth', 'male', '1654', '1722', {
      title: 'Jüngster Sohn Friedrichs',
      tags: [],
      notes: 'Leopold stand in der Erbfolge hinter Wilhelm und dessen Nachkommen. Seine Ehe mit einer Tochter des Hauses Roden machte seinen Sohn Otto später zum politisch bevorzugten Gegenkandidaten Ruprechts.'
    }),
    spouse('charlotte-roden-spouse', 'Charlotte Roden', 'female', '1659', '1728', {
      houseId: RODEN_HOUSE_ID,
      title: 'Gemahlin Leopolds · Haus Roden',
      tags: ['Haus Roden'],
      notes: 'Charlotte ist eine geborene Roden. Ihre Herkunft aus Haus Roden begründet Ottos enge mütterliche Bindung an den Lehnsherrn der Hochreuth.'
    }),
    person('otto-von-hochreuth', 'Otto von Hochreuth', 'male', '1684', '', {
      title: 'Von Haus Roden 1736 als Ritterherr eingesetzt',
      tags: ['Halb aus Haus Roden', 'Politisch eingesetzter Nachfolger'],
      notes: 'Otto besaß vor 1736 keinen gleichrangigen Erbanspruch gegen Ruprecht und dessen Söhne. Erst nachdem Haus Roden Ruprecht und dessen Nachkommen für verwirkt erklärt hatte, wurde Otto als Sohn einer Roden mit Burg und Titel belehnt. Seine Kinder bilden seither die von Roden bestätigte Nachfolge.'
    }),
    spouse('wilhelmine-hochreuth-spouse', 'Wilhelmine', 'female', '1688', '', {
      title: 'Gemahlin Ottos'
    }),
    person('friedrich-wilhelm-von-hochreuth', 'Friedrich Wilhelm von Hochreuth', 'male', '1709', '', {
      title: 'Ältester Sohn Ottos · bestätigter Erbe seit 1736',
      tags: ['Von Haus Roden bestätigte Erblinie']
    }),
    person('ernst-von-hochreuth', 'Ernst von Hochreuth', 'male', '1712', '', {
      title: 'Zweiter Sohn Ottos',
      tags: ['Von Haus Roden bestätigte Erblinie']
    }),
    person('henriette-von-hochreuth', 'Henriette von Hochreuth', 'female', '1716', '', {
      title: 'Tochter Ottos',
      tags: ['Von Haus Roden bestätigte Erblinie']
    }),

    person('dorothea-von-hochreuth', 'Dorothea von Hochreuth', 'female', '1657', '1710', {
      title: 'Tochter Friedrichs · wegverheiratet',
      tags: ['Wegverheiratet'],
      notes: 'Dorothea führte das Haus von Hochreuth nicht fort. Das Haus ihres Ehemannes ist nicht überliefert.'
    }),
    spouse('georg-unknown-spouse', 'Georg', 'male', '1654', '1716', {
      title: 'Gemahl Dorotheas · Haus unbekannt'
    })
  ],
  partnerships: [
    createMarriage('marriage-friedrich-katharina-hochreuth', ...FRIEDRICH_KATHARINA_IDS, { status: 'ended' }),
    createMarriage('marriage-albrecht-anna-hochreuth', ...ALBRECHT_ANNA_IDS, { status: 'ended', end: '1699' }),
    createMarriage('engagement-friedrich-ottilie-hochreuth', ...FRIEDRICH_OTTILIE_IDS, {
      type: 'engagement',
      status: 'ended',
      end: '1699'
    }),
    createMarriage('marriage-luise-konrad-hochreuth', ...LUISE_KONRAD_IDS),
    createMarriage('marriage-wilhelm-elisabeth-hochreuth', ...WILHELM_ELISABETH_IDS, { status: 'ended', end: '1708' }),
    createMarriage('marriage-friederike-august-hochreuth', ...FRIEDERIKE_AUGUST_IDS),
    createMarriage('marriage-ruprecht-margarethe-hochreuth', ...RUPRECHT_MARGARETHE_IDS, { status: 'widowed', end: '1719' }),
    createMarriage('marriage-leopold-charlotte-hochreuth', ...LEOPOLD_CHARLOTTE_IDS, { status: 'ended', end: '1722' }),
    createMarriage('marriage-otto-wilhelmine-hochreuth', ...OTTO_WILHELMINE_IDS),
    createMarriage('marriage-dorothea-georg-hochreuth', ...DOROTHEA_GEORG_IDS, { status: 'ended', end: '1710' })
  ],
  parentages: [
    ...createParentages(
      ['albrecht-von-hochreuth', 'wilhelm-von-hochreuth', 'leopold-von-hochreuth', 'dorothea-von-hochreuth'],
      FRIEDRICH_KATHARINA_IDS,
      'marriage-friedrich-katharina-hochreuth',
      { idPrefix: 'hochreuth-v2-parentage' }
    ),
    ...createParentages(
      ['eberhard-von-hochreuth', 'friedrich-von-hochreuth-junior', 'heinrich-von-hochreuth', 'luise-von-hochreuth'],
      ALBRECHT_ANNA_IDS,
      'marriage-albrecht-anna-hochreuth',
      { idPrefix: 'hochreuth-v2-parentage' }
    ),
    ...createParentages(
      ['ruprecht-von-hochreuth', 'friederike-von-hochreuth'],
      WILHELM_ELISABETH_IDS,
      'marriage-wilhelm-elisabeth-hochreuth',
      { idPrefix: 'hochreuth-v2-parentage' }
    ),
    ...createParentages(
      ['rupert-von-hochreuth', 'kasper-von-hochreuth'],
      RUPRECHT_MARGARETHE_IDS,
      'marriage-ruprecht-margarethe-hochreuth',
      { idPrefix: 'hochreuth-v2-parentage' }
    ),
    ...createParentages(
      ['otto-von-hochreuth'],
      LEOPOLD_CHARLOTTE_IDS,
      'marriage-leopold-charlotte-hochreuth',
      { idPrefix: 'hochreuth-v2-parentage' }
    ),
    ...createParentages(
      ['friedrich-wilhelm-von-hochreuth', 'ernst-von-hochreuth', 'henriette-von-hochreuth'],
      OTTO_WILHELMINE_IDS,
      'marriage-otto-wilhelmine-hochreuth',
      { idPrefix: 'hochreuth-v2-parentage' }
    )
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-luise-hochreuth',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-luise-konrad-hochreuth',
      houseId: 'house-unbekannt-luise-hochreuth',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      subtitle: 'Wegverheiratet',
      notes: 'Luise von Hochreuth wurde an Konrad aus einem nicht überlieferten Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-friederike-hochreuth',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-friederike-august-hochreuth',
      houseId: 'house-unbekannt-friederike-hochreuth',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      subtitle: 'Wegverheiratet',
      notes: 'Friederike von Hochreuth wurde an August aus einem nicht überlieferten Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-dorothea-hochreuth',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-dorothea-georg-hochreuth',
      houseId: 'house-unbekannt-dorothea-hochreuth',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      subtitle: 'Wegverheiratet',
      notes: 'Dorothea von Hochreuth wurde an Georg aus einem nicht überlieferten Haus verheiratet.'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-friedrich-katharina-hochreuth',
    houseId: HOCHREUTH_HOUSE_ID,
    crestSubtitle: 'Ritterherrenhaus unter Haus Roden',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'friedrich-von-hochreuth-senior',
    orientation: 'vertical',
    ancestorDepth: 5,
    descendantDepth: 5,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: 'Modulvorlagen/ruprecht-von-hochreuth-modulpaket-2026-07-28-04-18-49.json',
    sourceNote: 'Ruprechts Name, Geburtsjahr 1674, ehemaliger Ritterherrentitel, Herkunft aus Goldmund, Vasallität zu Haus Roden, Exil, die fast zwanzig Jahre jüngere und bei Kaspers Geburt verstorbene Gemahlin, die Söhne Rupert und Kasper sowie die höfisch betriebene Einsetzung des Vetters Otto sind aus der Modulvorlage belegt. Friedrichs vier Kinder, der Tod Albrechts und seiner drei Söhne beim Jagdausflug, Wilhelms und danach Ruprechts unstrittiger Erbgang, Ottos Mutter Charlotte Roden, Luise und Friederike als Wegverheiratete sowie Friedrichs Verlobung folgen den ausdrücklichen Benutzerkorrekturen. Ergänzte Vornamen und nicht vorgegebene Jahreszahlen sind eine preußisch geprägte Ausgestaltung; nicht ausdrücklich benannte Angeheiratete bleiben ohne erfundene Nachnamen.',
    registryManagedExtensionFields: ['sourceNote', 'successionConflict'],
    registryTombstones: {
      persons: [
        'arnulf-von-hochreuth',
        'mechthild-von-hochreuth',
        'dietrich-von-hochreuth',
        'adelheid-von-karsheim',
        'hildebrand-von-hochreuth',
        'lucia-von-hohenrain',
        'gerlind-von-tannrode',
        'berthold-von-hochreuth',
        'anselm-von-hochreuth',
        'klara-von-hochreuth',
        'unbekannte-gemahlin-ruprecht'
      ],
      partnerships: [
        'marriage-arnulf-mechthild',
        'marriage-dietrich-adelheid',
        'marriage-hildebrand-lucia',
        'marriage-otto-gerlind',
        'marriage-ruprecht-wife'
      ],
      parentages: [
        'parentage-dietrich-von-hochreuth',
        'parentage-hildebrand-von-hochreuth',
        'parentage-otto-von-hochreuth',
        'parentage-ruprecht-von-hochreuth',
        'parentage-berthold-von-hochreuth',
        'parentage-anselm-von-hochreuth',
        'parentage-klara-von-hochreuth',
        'parentage-rupert-von-hochreuth',
        'parentage-kasper-von-hochreuth'
      ]
    },
    successionConflict: {
      lawfulSequence: [
        { personId: 'albrecht-von-hochreuth', inheritedAt: '1692', endedAt: '1699' },
        { personId: 'wilhelm-von-hochreuth', inheritedAt: '1699', endedAt: '1708' },
        { personId: 'ruprecht-von-hochreuth', inheritedAt: '1708', endedAt: '1736' }
      ],
      huntingAccidentAt: '1699',
      huntingAccidentVictimIds: [
        'albrecht-von-hochreuth',
        'eberhard-von-hochreuth',
        'friedrich-von-hochreuth-junior',
        'heinrich-von-hochreuth'
      ],
      displacedPersonId: 'ruprecht-von-hochreuth',
      displacedDescendantIds: ['rupert-von-hochreuth', 'kasper-von-hochreuth'],
      installedPersonId: 'otto-von-hochreuth',
      installedSuccessorIds: [
        'friedrich-wilhelm-von-hochreuth',
        'ernst-von-hochreuth',
        'henriette-von-hochreuth'
      ],
      maternalRodenPersonId: 'charlotte-roden-spouse',
      rulingHouse: 'Haus Roden',
      displacedAt: '1736',
      basis: 'Politisch verfügte Verwirkung Ruprechts und seiner Nachkommen nach seinem Zerwürfnis mit Haus Roden; Otto hatte zuvor keinen gleichrangigen Erbanspruch.'
    }
  }
});
