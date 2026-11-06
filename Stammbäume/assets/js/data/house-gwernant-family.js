import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const GWERNANT_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Gwernant/gwernant-emblem.png';
export const GWERNANT_HOUSE_ID = 'house-gwernant';
export const GWERNANT_PORTRAITS = Object.freeze({
  'catrin-gwernant': 'assets/images/portraits/haus-gwernant/catrin-gwernant.png',
  'efa-gwernant': 'assets/images/portraits/haus-gwernant/efa-gwernant.png'
});

const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-gwernant', title: 'Familie Gwernant', emblem: GWERNANT_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], {
    rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig'
  }),
  description: 'Kleine bürgerliche Leinen- und Kurzwarenhändlerfamilie aus Gwynthor. Der konkrete Familienkreis beginnt mit Bryn und Mabli; ältere Generationen bleiben hinter einem seriellen Überlieferungssprung unbekannt.',
  toYear: '1660', timeJumpLabel: 'Nicht einzeln bekannte Generationen bis Bryn Gwernant',
  pendingDescendantReview: false
});

const member = (id, name, sex, birth, title, notes, options = {}) => createFamilyPerson({
  id, name, sex, birth, title, notes,
  worldPersonId: `person--haus-gwernant--${id}`,
  houseId: options.married ? '' : GWERNANT_HOUSE_ID,
  familyRole: options.married ? 'married' : 'core',
  lineageRole: options.head ? 'head' : 'branch',
  death: options.death || '', portrait: GWERNANT_PORTRAITS[id] || '',
  extensions: { authoredSource: 'gwernant-20261106', ...(options.extensions || {}) }
});

const grandparents = ['bryn-gwernant', 'mabli-spouse-gwernant'];
const parents = ['idwal-gwernant', 'gwenllian-spouse-gwernant'];
const uncle = ['emrys-gwernant', 'nerys-spouse-gwernant'];
const firstMarriage = createMarriage('marriage-bryn-mabli-gwernant', ...grandparents, {
  start: '1686', end: '1731', status: 'ended',
  extensions: { chartAlignChildGroupBelowParentPair: true }
});
const parentsMarriage = createMarriage('marriage-idwal-gwenllian-gwernant', ...parents, {
  start: '1712', extensions: { chartAlignChildGroupBelowParentPair: true }
});
const uncleMarriage = createMarriage('marriage-emrys-nerys-gwernant', ...uncle, {
  start: '1719', extensions: { chartAlignParentPairOverChildPersonId: 'aled-gwernant' }
});

export const HOUSE_GWERNANT_FAMILY = Object.freeze({
  ...base,
  persons: [
    ...base.persons.map(person => createFamilyPerson({ ...person,
      name: person.sex === 'male' ? 'Unbekannter Gründer' : 'Unbekannte Gründerin',
      worldPersonId: `person--haus-gwernant--${person.id}`
    })),
    member('bryn-gwernant', 'Bryn Gwernant', 'male', '1660', 'Früherer Leinenhändler',
      'Älteste namentlich ausgearbeitete Generation. Führte mit Mabli den kleinen Leinenhandel in Gwynthor; Idwal und Emrys sind ihre Söhne. Die unbekannten älteren Generationen werden nicht zu seinen unmittelbaren Eltern erklärt.', { death: '1731' }),
    member('mabli-spouse-gwernant', 'Mabli', 'female', '1664', 'Frühere Kurzwarenhändlerin',
      'Gemahlin Bryns seit 1686 und Mutter Idwals und Emrys’. Betreute im Familiengeschäft Garn, Bänder und kleine Nähzutaten. Ihr Herkunftshaus ist nicht festgelegt.', { married: true, death: '1736' }),
    member('idwal-gwernant', 'Idwal Gwernant', 'male', '1688', 'Leinen- und Kurzwarenhändler',
      '52 Jahre. Führt den kleinen Laden der Familie in Gwynthor. Ehemann Gwenllians seit 1712; Vater Catrins und Efas. Solide örtliche Kundschaft, kein Fernhandelshaus und kein politisches Amt.', { head: true }),
    member('gwenllian-spouse-gwernant', 'Gwenllian', 'female', '1691', 'Haushalt und Warenpflege',
      '49 Jahre. Gemahlin Idwals und Mutter Catrins und Efas. Betreut Haushalt und Warenpflege, hält Leinen sauber und trocken und richtet kleinere Kundenbestellungen. Herkunftsfamilie und Mädchenname bleiben offen.', { married: true }),
    member('emrys-gwernant', 'Emrys Gwernant', 'male', '1692', 'Wareneinkauf und Lieferwege',
      '48 Jahre. Idwals jüngerer Bruder unterstützt den gemeinsamen Familienladen beim örtlichen Wareneinkauf und bei Lieferungen. Ehemann Nerys’ und Vater Aleds; kein eigener zweiter Laden.'),
    member('nerys-spouse-gwernant', 'Nerys', 'female', '1696', 'Kurzwaren und Verpackung',
      '44 Jahre. Gemahlin Emrys’ seit 1719 und Mutter Aleds. Sortiert Garn und Bänder, zählt kleine Warenbestände und richtet Lieferbündel. Ihre Herkunftsfamilie ist nicht festgelegt.', { married: true }),
    member('catrin-gwernant', 'Catrin Gwernant', 'female', '1714', 'Göttliche Eleganz · Beratung für Maßaufträge',
      '26 Jahre; unverheiratet und ohne Verlobung. Ältere Tochter Idwals und Gwenllians. Ist mit Leinen, Bändern und dem Umgang mit Kundschaft aufgewachsen. Nimmt unter Maelwen Coeddu erste Wünsche zu Maßaufträgen auf und hält Änderungen für die Schneiderei fest. Sie ist keine Schneidermeisterin.'),
    member('efa-gwernant', 'Efa Gwernant', 'female', '1718', 'Göttliche Eleganz · Hausmagd und Wäschepflege',
      '22 Jahre; unverheiratet und ohne Verlobung. Jüngere Tochter Idwals und Gwenllians, Catrins Schwester. Vertraut mit sorgfältiger Leinen- und Haushaltspflege. Pflegt unter Maelwen Coeddu Verkaufsraum, Vorhänge und Probiertücher und richtet die Anprobeecke her.'),
    member('aled-gwernant', 'Aled Gwernant', 'male', '1721', 'Hilfe im Familienladen',
      '19 Jahre; unverheiratet und ohne Verlobung. Sohn Emrys’ und Nerys’, Vetter Catrins und Efas. Lernt im Familienladen Warenannahme, Zählen und das saubere Verpacken kleiner Bestellungen. Kein weiterer Arbeitsplatz festgelegt.')
  ],
  partnerships: [
    { ...base.partnerships[0], status: 'ended', certainty: 'unknown', notes: 'Unbekanntes historisches Gründerpaar; kein erfundenes Ehejahr.' },
    firstMarriage, parentsMarriage, uncleMarriage
  ],
  parentages: [
    ...createParentages(['bryn-gwernant'], base.partnerships[0].participantIds, base.lineage.founderPartnershipId, {
      type: 'claimed', certainty: 'unknown', notes: 'Nur Zugehörigkeit über mehrere nicht ausgearbeitete Generationen; keine unmittelbare biologische Elternschaft.',
      extensions: { timeJumpId: base.timeJumps[0].id }
    }),
    ...createParentages(['idwal-gwernant', 'emrys-gwernant'], grandparents, firstMarriage.id),
    ...createParentages(['catrin-gwernant', 'efa-gwernant'], parents, parentsMarriage.id),
    ...createParentages(['aled-gwernant'], uncle, uncleMarriage.id)
  ],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['bryn-gwernant'],
    extensions: { ...base.timeJumps[0].extensions, preparedPlaceholder: false }
  }],
  lineage: { ...base.lineage, crestSubtitle: 'Bürgerliche Leinen- und Kurzwarenhändler · Gwynthor' },
  view: { ...base.view, limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, preparedTimeJump: false,
    sourceRevision: 2, chartLayoutPolicy: 'strict-v1',
    chartAlignLineageOriginOverPersonId: 'bryn-gwernant',
    registryManagedExtensionFields: ['chartLayoutPolicy', 'chartAlignLineageOriginOverPersonId'],
    authoredOn: '2026-11-06',
    sourceNote: 'Neue Familie auf ausdrücklichen Nutzerauftrag vom 6. November 2026. Catrin26 und Efa22, ihre Ledigkeit, Eltern Idwal52 und Gwenllian49 sowie der gewöhnliche örtliche Leinen-/Kurzwarenhandel folgen dem angenommenen Entwurf. Großeltern, kleiner Onkelzweig und ältere Lebensdaten sind autorisierte redaktionelle Ausgestaltung. Neun benannte Personen und zwei unbekannte Gründer, drei konkrete Generationen, ein serieller Zeitsprung. Keine besondere Abstammung, kein Adel, kein neuer Kartenpin, kein separates Shopmodul und keine Beziehungen zu bestehenden Namensgleichen. Herkunftshäuser der eingeheirateten Frauen bleiben offen.'
  }
});
