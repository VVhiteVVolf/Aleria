import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { FALCHDYN_MAERLLYS_MARRIAGE } from './falchdyn-maerllys-marriage.js';
import { HOUSE_FALCHDYN_PORTRAITS } from './house-falchdyn-portraits.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';

const FALCHDYN_HOUSE_ID = 'house-falchdyn';
const FALCHDYN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Falchdyn.png';
const FALCHDYN_HOUSE_IMAGE = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Falchdyn-Hausbild.png';
const CELTIGERNS_ECHO_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Celtigerns-Echo.png';
const MAERLLYS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png';
const DRAIG_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-draig.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-falchdyn',
  title: 'Haus Falchdyn',
  emblem: FALCHDYN_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.falchdyn,
  description: 'Volksnahe Schreiber- und Journalistenfamilie aus Gwynthor, die Celtigerns Echo herausgibt, Schreibende ausbildet und mit kleinen Redaktionsstuben in den größeren Orten Celtigerns Wacht vertreten ist.',
  toYear: '1660',
  timeJumpLabel: 'Die belegte Falchdyn-Linie setzt mit drei Brüdern um 1660 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', death = '', houseId = FALCHDYN_HOUSE_ID, options = {}) {
  const portrait = options.portrait || HOUSE_FALCHDYN_PORTRAITS[id] || '';
  const registryManagedFields = new Set([
    ...(options.extensions?.registryManagedFields || []),
    ...(options.registryManagedFields || [])
  ]);
  if (portrait) registryManagedFields.add('portrait');

  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === FALCHDYN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      ...(registryManagedFields.size
        ? { registryManagedFields: [...registryManagedFields] }
        : {})
    }
  });
}

function sharedPerson(definition, familyRole) {
  return person(definition.id, definition.name, definition.sex, definition.birth, definition.death || '', definition.houseId, {
    familyRole,
    title: definition.title,
    portrait: definition.portrait,
    notes: definition.notes
  });
}

function house(id, name, emblem = '') {
  return Object.freeze({ id, name, motto: '', emblem, status: 'active' });
}

function marriageWithLeafGroupAnchor(id, participantIds) {
  return createMarriage(id, ...participantIds, {
    extensions: {
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: ['chartAlignChildGroupBelowParentPair']
    }
  });
}

function marriedAwayBranch(options) {
  return createMarriedAwayBranch({
    ...options,
    extensions: {
      ...(options.extensions || {}),
      chartAlignBelowPartnership: true,
      registryManagedExtensionFields: [
        ...new Set([
          ...(options.extensions?.registryManagedExtensionFields || []),
          'chartAlignBelowPartnership'
        ])
      ]
    }
  });
}

function unknownHusband(id, wifeName, houseId) {
  return person(id, 'Unbekannter Ehemann', 'male', '????', '', houseId, {
    familyRole: 'married',
    status: 'unknown',
    title: `Ehemann von ${wifeName}`,
    notes: `Name und Herkunft des Ehemanns von ${wifeName} sind nicht überliefert.`
  });
}

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;

const COUPLES = Object.freeze({
  dafydd: Object.freeze(['dafydd-falchdyn', 'eirlys-spouse-falchdyn']),
  iorwerth: Object.freeze(['iorwerth-falchdyn', 'mabli-spouse-falchdyn']),
  madoc: Object.freeze(['madoc-falchdyn', 'seren-spouse-falchdyn']),
  aneirin: Object.freeze(['aneirin-falchdyn', 'catrin-spouse-falchdyn']),
  rhodri: Object.freeze(['rhodri-falchdyn', 'enid-spouse-falchdyn']),
  emrys: Object.freeze(['emrys-falchdyn', 'lowri-spouse-falchdyn']),
  owain: Object.freeze(['owain-falchdyn', 'nerys-spouse-falchdyn'])
});

const UNKNOWN_MARRIED_AWAY = Object.freeze([
  Object.freeze({
    personId: 'angharad-falchdyn',
    spouseId: 'unknown-spouse-angharad-falchdyn',
    partnershipId: 'marriage-angharad-unknown-falchdyn',
    name: 'Angharad Falchdyn',
    birth: '1695'
  }),
  Object.freeze({
    personId: 'efa-falchdyn',
    spouseId: 'unknown-spouse-efa-falchdyn',
    partnershipId: 'marriage-efa-unknown-falchdyn',
    name: 'Efa Falchdyn',
    birth: '1698'
  }),
  Object.freeze({
    personId: 'nest-falchdyn',
    spouseId: 'unknown-spouse-nest-falchdyn',
    partnershipId: 'marriage-nest-unknown-falchdyn',
    name: 'Nest Falchdyn',
    birth: '1701'
  })
]);

const YOUNGEST_GENERATION = Object.freeze([
  person('ceredig-falchdyn', 'Ceredig Falchdyn', 'male', '1712', '', FALCHDYN_HOUSE_ID, {
    lineageRole: 'mainline',
    title: 'Lokalreporter von Gwynthors Bannkreis',
    tags: ['Lokalreporter', 'Celtigerns Echo'],
    notes: 'Ältester Sohn Aneirins und vorgesehener Nachfolger des Hauses. Berichtet unmittelbar aus Gwynthor und den Siedlungen seines Bannkreises. Unverheiratet und ohne Verlobung.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('branwen-falchdyn', 'Branwen Falchdyn', 'female', '1715', '', FALCHDYN_HOUSE_ID, {
    title: 'Freche Nachwuchsreporterin',
    tags: ['Nachwuchsreporterin', 'Celtigerns Echo'],
    notes: 'Sucht ihre Geschichten in Werkstätten, auf Märkten und mitten in den Nachbarschaften; ihre direkte Art bringt sie schnell ins Gespräch. Unverheiratet und ohne Verlobung.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('taliesin-falchdyn', 'Taliesin Falchdyn', 'male', '1719', '', FALCHDYN_HOUSE_ID, {
    title: 'Karikaturist und Satiriker',
    tags: ['Karikatur', 'Satire', 'Celtigerns Echo'],
    notes: 'Verdichtet große Eitelkeiten und kleine Alltagswidersprüche zu frechen Zeichnungen, ohne das Blatt in bloßen Klatsch abgleiten zu lassen. Unverheiratet und ohne Verlobung.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('tegid-falchdyn', 'Tegid Falchdyn', 'male', '1716', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; seine berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('eluned-falchdyn', 'Eluned Falchdyn', 'female', '1720', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; ihre berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('gethin-falchdyn', 'Gethin Falchdyn', 'male', '1714', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; seine berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('seren-falchdyn', 'Seren Falchdyn', 'female', '1718', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; ihre berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('aled-falchdyn', 'Aled Falchdyn', 'male', '1723', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; seine berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('maredudd-falchdyn', 'Maredudd Falchdyn', 'male', '1717', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; seine berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('ffion-falchdyn', 'Ffion Falchdyn', 'female', '1721', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; ihre berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  }),
  person('idris-falchdyn', 'Idris Falchdyn', 'male', '1725', '', FALCHDYN_HOUSE_ID, {
    notes: 'Unverheiratet und ohne Verlobung; seine berufliche Ausrichtung ist noch nicht festgelegt.',
    registryManagedFields: ['title', 'tags', 'notes']
  })
]);

export const FALCHDYN_HOUSE_BIOGRAPHY = Object.freeze({
  schema: 'aleria.house-module',
  schemaVersion: 1,
  pageTitle: 'I — Haus Falchdyn',
  image: FALCHDYN_HOUSE_IMAGE,
  imageWidth: 30,
  imageSquare: true,
  housePage: true,
  description: 'Volksnahe Schreiber- und Journalistenfamilie aus Gwynthor und Herausgeberin des lokalen Zeitungsblatts Celtigerns Echo.',
  stats: Object.freeze([
    Object.freeze(['Voller Name', 'Haus Falchdyn']),
    Object.freeze(['Stammsitz', 'Gwynthor']),
    Object.freeze(['Gegründet', 'Vor dem überlieferten Zeitsprung']),
    Object.freeze(['Oberhaupt', 'Aneirin Falchdyn']),
    Object.freeze(['Nachfolger', 'Ceredig Falchdyn']),
    Object.freeze(['Lehnshaus', 'Haus Draig']),
    Object.freeze(['Betrieb', 'Celtigerns Echo']),
    Object.freeze(['Wirkungsgebiet', 'Celtigerns Wacht']),
    Object.freeze(['Wappen', 'Druckerpresse über einem beschriebenen Blatt']),
    Object.freeze(['Hausfarben', 'Dunkelrot · Schwarz · Pergament']),
    Object.freeze(['Rang', 'Bürgerfamilie']),
    Object.freeze(['Status', 'Aktiv'])
  ]),
  house: Object.freeze({
    biographyTitle: 'Über dieses Haus',
    biographyText: 'Haus Falchdyn ist eine alte Gwynthorer Schreiber- und Journalistenfamilie. Seine Angehörigen führen das Zeitungsblatt Celtigerns Echo, bilden Schreiberinnen und Schreiber aus und stellen sowohl feste Autoren als auch freie Stimmen aus der Grafschaft ein. Die Hauptredaktion sitzt in Gwynthor; kleinere Redaktionsstuben an den größeren Orten Celtigerns Wacht sammeln Berichte, Briefe und Anliegen für die nächste Ausgabe.',
    abilitiesTitle: 'Einflussbereiche & Zuständigkeiten',
    abilities: Object.freeze([
      Object.freeze({
        icon: CELTIGERNS_ECHO_EMBLEM,
        title: 'Celtigerns Echo',
        detail: 'Herausgabe, Redaktion und Verteilung eines lokalen Blattes für Gwynthor und die größeren Orte der Grafschaft.'
      }),
      Object.freeze({
        icon: '../IconOrdner/ZunftsWappen/Schreiber.png',
        title: 'Schreiberausbildung',
        detail: 'Ausbildung in Schrift, Mitschrift, Quellenprüfung, verständlicher Sprache und verantwortlichem Umgang mit Aussagen.'
      }),
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Administration.png',
        title: 'Redaktionsnetz',
        detail: 'Koordination kleiner Redaktionsstuben, Korrespondenten und Botenwege innerhalb Celtigerns Wacht.'
      })
    ]),
    extraSections: Object.freeze([
      Object.freeze({
        title: 'Das Herz des Blattes',
        text: 'Celtigerns Echo sucht nicht zuerst den Skandal, sondern die Stimmen, die sonst überhört werden: Sorgen aus einem Viertel, ein Streit um einen Brunnen, eine gelungene Ernte, ein vermisster Bote oder die Geschichte einer Handwerkerin. Das Blatt will Zusammenhalt fördern, ohne Schwierigkeiten schönzureden.'
      }),
      Object.freeze({
        title: 'Anspruch und Wirklichkeit',
        text: 'Auch Falchdyns Redaktion kennt Zeitdruck, knappe Kassen, missverständliche Aussagen und den Einfluss mächtiger Interessen. Fehler werden nicht als Schande verschwiegen, sondern nach Möglichkeit berichtigt. Innerhalb der Familie wird regelmäßig darum gerungen, wie nahbar ein Blatt sein kann, ohne unkritisch zu werden.'
      })
    ]),
    historyTitle: 'Geschichte des Hauses',
    historyText: 'Die Namen des Gründerpaares und die frühen Generationen sind nicht erhalten. Um 1660 setzt die belegte Linie mit den Brüdern Dafydd, Iorwerth und Madoc wieder ein. Aus den Schreiberstuben der Familie entwickelte sich über mehrere Jahrzehnte ein regelmäßiges Nachrichtenblatt. Aneirin Falchdyn führt heute Haus und Hauptredaktion; seine Brüder und Vettern teilen Ausbildung, Druck, Korrespondentennetz und Verwaltung untereinander. Madocs vier Töchter heirateten aus dem Haus fort, darunter Llio Falchdyn, deren Ehe mit Geraint Maerllys beide Bürgerfamilien verbindet.',
    worksTitle: 'Bekannte Leistungen',
    works: Object.freeze([
      'Aufbau der Hauptredaktion von Celtigerns Echo in Gwynthor.',
      'Einrichtung kleiner Redaktionsstuben an größeren Orten Celtigerns Wacht.',
      'Offene Ausbildung von Schreibern, Setzern, Korrespondenten und angehenden Autoren.',
      'Regelmäßiger Raum für lokale Anliegen, Gegendarstellungen und kleine Geschichten aus dem Alltag.'
    ]),
    triviaTitle: 'Besonderheiten',
    trivia: Object.freeze([
      'Ein Beitrag muss nicht groß sein, um gedruckt zu werden; entscheidend ist, ob er für die Menschen vor Ort Bedeutung besitzt.',
      'Klatsch ohne überprüfbaren Anlass gilt in der Hauptredaktion als schlechte Arbeit und nicht als guter Verkaufstrick.',
      'Lehrlinge beginnen im Archiv und beim Abschreiben, bevor sie selbst Gespräche führen oder Texte zeichnen dürfen.',
      'In jeder Redaktionsstube liegt ein öffentliches Anliegenbuch aus, in das Bürger Themen eintragen lassen können.'
    ]),
    quotesTitle: 'Hausworte & Redaktionssätze',
    quotes: Object.freeze([
      '„Was gehört wird, geht nicht verloren.“',
      '„Eine kleine Geschichte kann für ein ganzes Viertel die wichtigste sein.“',
      '„Erst zuhören. Dann prüfen. Dann drucken.“'
    ]),
    connectionsTitle: 'Bindungen & Zusammenarbeit',
    connections: Object.freeze([
      Object.freeze({ type: 'heading', title: 'Lehens- und Ortsbindung', detail: '' }),
      Object.freeze({
        type: 'connection',
        name: 'Haus Draig',
        detail: 'Lehnshaus der Gwynthorer Bürgerfamilie; Celtigerns Echo bleibt dennoch als lokales Blatt eigenständig in seiner Themenwahl.',
        image: DRAIG_EMBLEM,
        imageFormat: 'square'
      }),
      Object.freeze({ type: 'heading', title: 'Familienbande', detail: '' }),
      Object.freeze({
        type: 'connection',
        name: 'Haus Maerllys',
        detail: 'Llio Falchdyn ist mit Geraint Maerllys verheiratet; dieselbe Verbindung wird in beiden Stammbäumen geführt.',
        image: MAERLLYS_EMBLEM,
        imageFormat: 'square'
      })
    ]),
    documentsTitle: 'Betriebe & Besitz',
    documents: Object.freeze([
      Object.freeze({
        icon: CELTIGERNS_ECHO_EMBLEM,
        title: 'Celtigerns Echo',
        text: 'Zeitungsblatt mit Hauptredaktion und Druckerei in Gwynthor sowie kleineren Redaktionsstuben in der Grafschaft.',
        link: ''
      }),
      Object.freeze({
        icon: '../IconOrdner/ZunftsWappen/Schreiber.png',
        title: 'Falchdyns Schreiberschule',
        text: 'Familiengeführte Ausbildung für Schreiber, Korrektoren, Setzer und Autoren; geeignete Außenstehende können aufgenommen und angestellt werden.',
        link: ''
      }),
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Administration.png',
        title: 'Anliegenbücher',
        text: 'Öffentlich zugängliche Bücher der Redaktionsstuben, in denen Sorgen, Hinweise und erzählenswerte Begebenheiten gesammelt werden.',
        link: ''
      })
    ]),
    footer: 'Nah am Volk. Sorgfältig im Wort.',
    sideWidth: 100,
    connectionPortraitHeight: 68,
    connectionTextOffset: 0,
    crestImage: FALCHDYN_EMBLEM
  }),
  commentSequence: Object.freeze([]),
  quote: '„Was gehört wird, geht nicht verloren.“',
  quoteBy: 'Leitspruch des Hauses Falchdyn'
});

export const HOUSE_FALCHDYN_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  document: Object.freeze({
    ...BASE_FAMILY.document,
    motto: 'Was gehört wird, geht nicht verloren.'
  }),
  houses: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.houses[0],
      motto: 'Was gehört wird, geht nicht verloren.'
    }),
    house('house-maerllys', 'Haus Maerllys', MAERLLYS_EMBLEM),
    ...UNKNOWN_MARRIED_AWAY.map(relation => (
      house(`house-unbekannt-${relation.personId}`, 'Unbekanntes Haus')
    ))
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Drei Brüder bilden nach dem Überlieferungssprung die Großvätergeneration.
    person('dafydd-falchdyn', 'Dafydd Falchdyn', 'male', '1660', '', FALCHDYN_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Seniorautor · Stimme der Leserschaft',
      tags: ['Seniorautor', 'Celtigerns Echo'],
      notes: 'Lebt 1740 noch und hört besonders gern den Sorgen, Erinnerungen und kleinen Erfolgen der Gwynthorer Bevölkerung zu.',
      registryManagedFields: ['death', 'status', 'title', 'tags', 'notes']
    }),
    person('eirlys-spouse-falchdyn', 'Eirlys', 'female', '1664', '1736', '', {
      familyRole: 'married',
      title: 'Ehefrau Dafydd Falchdyns'
    }),
    person('iorwerth-falchdyn', 'Iorwerth Falchdyn', 'male', '1663', '', FALCHDYN_HOUSE_ID, {
      title: 'Chronist und Quellenprüfer',
      tags: ['Chronik', 'Quellenprüfung', 'Celtigerns Echo'],
      notes: 'Lebt 1740 noch und bewahrt das Gedächtnis der Redaktion; Behauptungen ohne überprüfbare Herkunft begegnet er mit sichtbarer Skepsis.',
      registryManagedFields: ['death', 'status', 'title', 'tags', 'notes']
    }),
    person('mabli-spouse-falchdyn', 'Mabli', 'female', '1667', '1738', '', {
      familyRole: 'married',
      title: 'Ehefrau Iorwerth Falchdyns'
    }),
    person('madoc-falchdyn', 'Madoc Falchdyn', 'male', '1666', '1737', FALCHDYN_HOUSE_ID, {
      title: 'Schreiber · Vater von vier wegverheirateten Töchtern'
    }),
    person('seren-spouse-falchdyn', 'Seren', 'female', '1669', '', '', {
      familyRole: 'married',
      title: 'Ehefrau Madoc Falchdyns'
    }),

    // Dafydds und Iorwerths Söhne tragen Redaktion und Ausbildung in der Gegenwart.
    person('aneirin-falchdyn', 'Aneirin Falchdyn', 'male', '1687', '', FALCHDYN_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Oberhaupt des Hauses · Herausgeber von Celtigerns Echo',
      tags: ['Herausgeber', 'Celtigerns Echo']
    }),
    person('catrin-spouse-falchdyn', 'Catrin Pencaletwch', 'female', '1690', '', '', {
      familyRole: 'married',
      title: 'Autorin bei Celtigerns Echo',
      tags: ['Autorin', 'Celtigerns Echo'],
      notes: 'Stammt aus einer nördlichen Familie; ihre genauere Herkunft bleibt vorerst offen.',
      registryManagedFields: ['name', 'title', 'tags', 'notes']
    }),
    person('rhodri-falchdyn', 'Rhodri Falchdyn', 'male', '1690', '', FALCHDYN_HOUSE_ID, {
      title: 'Leiter des Korrespondentennetzes',
      tags: ['Korrespondenten', 'Celtigerns Echo'],
      registryManagedFields: ['title', 'tags']
    }),
    person('enid-spouse-falchdyn', 'Enid Braffwrdd', 'female', '1693', '', '', {
      familyRole: 'married',
      title: 'Autorin bei Celtigerns Echo',
      tags: ['Autorin', 'Celtigerns Echo'],
      registryManagedFields: ['name', 'title', 'tags', 'notes']
    }),
    person('emrys-falchdyn', 'Emrys Falchdyn', 'male', '1691', '', FALCHDYN_HOUSE_ID, {
      title: 'Politikbeobachter und Kolumnist',
      tags: ['Kolumnist', 'Stadtpolitik', 'Celtigerns Echo'],
      registryManagedFields: ['title', 'tags']
    }),
    person('lowri-spouse-falchdyn', 'Lowri Llawen', 'female', '1694', '', '', {
      familyRole: 'married',
      title: 'Autorin bei Celtigerns Echo',
      tags: ['Autorin', 'Celtigerns Echo'],
      registryManagedFields: ['name', 'title', 'tags', 'notes']
    }),
    person('owain-falchdyn', 'Owain Falchdyn', 'male', '1694', '', FALCHDYN_HOUSE_ID, {
      title: 'Ausbilder und Redaktionsverwalter',
      tags: ['Schreiberschule', 'Celtigerns Echo'],
      registryManagedFields: ['title', 'tags']
    }),
    person('nerys-spouse-falchdyn', 'Nerys Anfoesgarwch', 'female', '1697', '', '', {
      familyRole: 'married',
      title: 'Autorin bei Celtigerns Echo',
      tags: ['Autorin', 'Celtigerns Echo'],
      registryManagedFields: ['name', 'title', 'tags', 'notes']
    }),

    // Madocs Zweig endet im Haus: alle vier Töchter sind fortverheiratet.
    sharedPerson(FALCHDYN_MAERLLYS_MARRIAGE.second, 'core'),
    sharedPerson(FALCHDYN_MAERLLYS_MARRIAGE.first, 'married'),
    ...UNKNOWN_MARRIED_AWAY.flatMap(relation => [
      person(relation.personId, relation.name, 'female', relation.birth, '', FALCHDYN_HOUSE_ID, {
        title: 'Wegverheiratete Tochter Madoc Falchdyns',
        notes: 'Heiratete in ein nicht näher überliefertes Bürgerhaus; ihre Nachkommen werden nicht in der Falchdyn-Linie fortgeführt.'
      }),
      unknownHusband(relation.spouseId, relation.name, `house-unbekannt-${relation.personId}`)
    ]),

    ...YOUNGEST_GENERATION
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-dafydd-eirlys-falchdyn', ...COUPLES.dafydd),
    createMarriage('marriage-iorwerth-mabli-falchdyn', ...COUPLES.iorwerth),
    marriageWithLeafGroupAnchor('marriage-madoc-seren-falchdyn', COUPLES.madoc),
    marriageWithLeafGroupAnchor('marriage-aneirin-catrin-falchdyn', COUPLES.aneirin),
    marriageWithLeafGroupAnchor('marriage-rhodri-enid-falchdyn', COUPLES.rhodri),
    marriageWithLeafGroupAnchor('marriage-emrys-lowri-falchdyn', COUPLES.emrys),
    marriageWithLeafGroupAnchor('marriage-owain-nerys-falchdyn', COUPLES.owain),
    createMarriage(FALCHDYN_MAERLLYS_MARRIAGE.id, ...FALCHDYN_MAERLLYS_MARRIAGE.participantIds),
    ...UNKNOWN_MARRIED_AWAY.map(relation => (
      createMarriage(relation.partnershipId, relation.personId, relation.spouseId)
    ))
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['dafydd-falchdyn', 'iorwerth-falchdyn', 'madoc-falchdyn'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das unbekannte Gründerpaar mit den drei belegten Falchdyn-Brüdern.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(['aneirin-falchdyn', 'rhodri-falchdyn'], COUPLES.dafydd, 'marriage-dafydd-eirlys-falchdyn'),
    ...createParentages(['emrys-falchdyn', 'owain-falchdyn'], COUPLES.iorwerth, 'marriage-iorwerth-mabli-falchdyn'),
    ...createParentages(
      ['llio-falchdyn', ...UNKNOWN_MARRIED_AWAY.map(relation => relation.personId)],
      COUPLES.madoc,
      'marriage-madoc-seren-falchdyn'
    ),
    ...createParentages(['ceredig-falchdyn', 'branwen-falchdyn', 'taliesin-falchdyn'], COUPLES.aneirin, 'marriage-aneirin-catrin-falchdyn'),
    ...createParentages(['tegid-falchdyn', 'eluned-falchdyn'], COUPLES.rhodri, 'marriage-rhodri-enid-falchdyn'),
    ...createParentages(['gethin-falchdyn', 'seren-falchdyn', 'aled-falchdyn'], COUPLES.emrys, 'marriage-emrys-lowri-falchdyn'),
    ...createParentages(['maredudd-falchdyn', 'ffion-falchdyn', 'idris-falchdyn'], COUPLES.owain, 'marriage-owain-nerys-falchdyn')
  ]),
  cadetBranches: Object.freeze([
    marriedAwayBranch({
      id: 'married-away-maerllys-llio-falchdyn',
      name: 'Haus Maerllys',
      parentPartnershipId: FALCHDYN_MAERLLYS_MARRIAGE.id,
      houseId: 'house-maerllys',
      targetFamilyId: 'haus-maerllys',
      emblem: MAERLLYS_EMBLEM,
      crestFrame: 'iron',
      notes: 'Llio Falchdyn wurde an Geraint Maerllys verheiratet. Person und Ehe werden mit denselben IDs in beiden Familienakten geführt.'
    }),
    ...UNKNOWN_MARRIED_AWAY.map(relation => marriedAwayBranch({
      id: `married-away-${relation.personId}`,
      name: 'Unbekanntes Haus',
      parentPartnershipId: relation.partnershipId,
      houseId: `house-unbekannt-${relation.personId}`,
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'iron',
      notes: `${relation.name} heiratete in ein nicht näher überliefertes Bürgerhaus.`
    }))
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['dafydd-falchdyn', 'iorwerth-falchdyn', 'madoc-falchdyn']),
      toYear: '1660',
      label: 'Die belegte Falchdyn-Linie setzt mit drei Brüdern um 1660 wieder ein',
      notes: 'Der Zeitsprung bleibt der einzige absolute Generationentrenner unter dem Falchdyn-Wappen; Dafydd, Iorwerth und Madoc folgen gemeinsam dahinter.',
      extensions: Object.freeze({
        ...BASE_FAMILY.timeJumps[0].extensions,
        registryManagedFields: Object.freeze([
          'parentPartnershipId',
          'parentPersonId',
          'childIds',
          'fromYear',
          'toYear',
          'label',
          'notes'
        ])
      })
    })
  ]),
  presentation: Object.freeze({ relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } }),
  view: Object.freeze({
    focusPersonId: BASE_FAMILY.view.focusPersonId,
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  }),
  extensions: Object.freeze({
    ...BASE_FAMILY.extensions,
    blankFamily: false,
    pendingDescendantReview: false,
    sourceRevision: 2,
    sourceModule: 'Haus Falchdyn und Celtigerns Echo (Ausarbeitung 1740)',
    sourceNote: 'Haus Falchdyn folgt der vorgegebenen Struktur: ein unbekanntes Gründerpaar, genau ein serieller Überlieferungssprung und danach drei Brüder als Großvätergeneration. Dafydd und Iorwerth leben 1740 und führen die Linie über jeweils zwei Söhne bis zu elf unverheirateten Sprösslingen fort. Madoc besitzt ausschließlich vier wegverheiratete Töchter. Nur Llio wird mit dem bereits bestehenden Geraint Maerllys verbunden; dieselbe Weltperson und dieselbe Ehe erscheinen beidseitig, ohne fremde Nachkommen im Falchdyn-Baum zu doppeln. Die übrigen drei Zielhäuser bleiben mangels Vorgabe unbekannt. Dreizehn bereitgestellte Personenportraits, Wappen, Hausbild und Emblem von Celtigerns Echo wurden lokal gesichert und quellenbelegt. Die Berufsprofile der jungen Generation bleiben bis auf Ceredig, Branwen und Taliesin bewusst offen. Das eingebettete Häuser-Modul dokumentiert Zeitung, Schreiberschule, Redaktionsnetz und den volksnahen Familienkern.',
    houseBiographyModule: FALCHDYN_HOUSE_BIOGRAPHY,
    chartLayoutPolicy: 'strict-v1',
    registryManagedHouseProfileFields: Object.freeze([
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ]),
    registryManagedRecordFields: Object.freeze(['folderPath']),
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations'])
  })
});
