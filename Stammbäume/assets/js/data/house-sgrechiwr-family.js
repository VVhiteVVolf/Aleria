import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SGRECHIWR_PORTRAITS } from './house-sgrechiwr-portraits.js';

const SGRECHIWR_EMBLEM = 'assets/images/houses/haus-sgrechiwr.png';
const SGRECHIWR_HOUSE_ID = 'house-sgrechiwr';
// Bürgerliche Erbfolge nach Eignung statt Erstgeburt (User-Vorgabe): die Kette reicht vom
// Begründer über den amtierenden Gareth hinaus bis zu den vorgesehenen Erben Brân und Cadell.
// Cadogan hat nur Töchter, daher springt die Erbfolge auf seinen Bruder Colwyn; Colwyn bleibt
// selbst kinderlos (laut Überlieferung nie verheiratet), daher springt sie weiter auf den
// Cousin Godwyn (Sohn von Garaths Bruder Gerallt).
const HOUSE_HEAD_IDS = new Set([
  'emrys-sgrechiwr',
  'dafydd-sgrechiwr',
  'gareth-sgrechiwr',
  'cadogan-sgrechiwr',
  'colwyn-sgrechiwr',
  'godwyn-sgrechiwr',
  'bran-sgrechiwr',
  'cadell-sgrechiwr'
]);

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = SGRECHIWR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_SGRECHIWR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SGRECHIWR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

// Die Quelltabelle überliefert für die meisten Ehepartner nur ein
// unbeschriftetes „???"-Bildfeld; sie bleiben namenlos und ohne Portrait.
function unnamedSpouse(id, name, sex, birth = '????', death = '????') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married', status: 'unknown' });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const EMRYS_IDS = ['emrys-sgrechiwr', 'unknown-emrys-spouse'];
const DAFYDD_IDS = ['dafydd-sgrechiwr', 'unknown-dafydd-spouse'];
const WENNA_IDS = ['wenna-sgrechiwr', 'unknown-wenna-spouse'];
const RHISIART_IDS = ['rhisiart-sgrechiwr', 'unknown-rhisiart-spouse'];
const GARETH_IDS = ['gareth-sgrechiwr', 'unknown-gareth-spouse'];
const SEREN_IDS = ['seren-sgrechiwr', 'unknown-seren-spouse'];
const GERALLT_IDS = ['gerallt-sgrechiwr', 'unknown-gerallt-spouse'];
const CADOGAN_IDS = ['cadogan-sgrechiwr', 'unknown-cadogan-spouse'];
const FFLUR_IDS = ['fflur-sgrechiwr', 'unknown-fflur-spouse'];
const GODWYN_IDS = ['godwyn-sgrechiwr', 'aerona-balchder'];
const AMLODD_IDS = ['amlodd-sgrechiwr', 'unknown-amlodd-spouse'];

export const HOUSE_SGRECHIWR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-sgrechiwr',
    title: 'Haus Sgrechiwr',
    motto: '',
    description: 'Die belegte Linie des bürgerlichen Hauses Sgrechiwr aus Lynthor, bekannt für Herolde, Hofschreier und Musiker sowie die bedeutendste Instrumentmacherei der Stadt: vom Begründer Emrys bis zur Generation um 1727.',
    emblem: SGRECHIWR_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.sgrechiwr
  },
  houses: [
    { id: SGRECHIWR_HOUSE_ID, name: 'Haus Sgrechiwr', motto: '', emblem: SGRECHIWR_EMBLEM, status: 'active' },
    { id: 'house-balchder', name: 'Haus Balchder', motto: '', emblem: 'assets/images/houses/haus-balchder.png', status: 'active' },
    { id: 'house-unbekannt-wenna', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-seren', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-fflur', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Begründer und seine Frau
    person('emrys-sgrechiwr', 'Emrys Sgrechiwr', 'male', '????', '????', SGRECHIWR_HOUSE_ID, {
      status: 'dead',
      title: 'Begründer des bürgerlichen Hauses Sgrechiwr',
      notes: 'Die Quelle überliefert weder Namen noch Portrait für den Begründer und seine Frau sowie die Generation seiner drei Kinder; die Namen wurden auf Anweisung des Users passend zum Haus als walisische Namen ergänzt.'
    }),
    unnamedSpouse('unknown-emrys-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Emrys'
    person('dafydd-sgrechiwr', 'Dafydd Sgrechiwr', 'male', '1638', '????'),
    unnamedSpouse('unknown-dafydd-spouse', 'Unbekannte Ehefrau', 'female'),
    person('wenna-sgrechiwr', 'Wenna Sgrechiwr', 'female', '1640', '????'),
    unnamedSpouse('unknown-wenna-spouse', 'Unbekannter Ehemann', 'male'),
    person('rhisiart-sgrechiwr', 'Rhisiart Sgrechiwr', 'male', '1642', '????'),
    unnamedSpouse('unknown-rhisiart-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Dafydds — Gareth ist das heutige Familienoberhaupt
    person('gareth-sgrechiwr', 'Gareth Sgrechiwr', 'male', '1664', '', SGRECHIWR_HOUSE_ID, {
      title: 'Oberhaupt des Hauses Sgrechiwr'
    }),
    unnamedSpouse('unknown-gareth-spouse', 'Unbekannte Ehefrau', 'female'),
    person('seren-sgrechiwr', 'Seren Sgrechiwr', 'female', '????', '????'),
    unnamedSpouse('unknown-seren-spouse', 'Unbekannter Ehemann', 'male'),

    // Kind Rhisiarts
    person('gerallt-sgrechiwr', 'Gerallt Sgrechiwr', 'male', '1668', ''),
    unnamedSpouse('unknown-gerallt-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Gareths
    person('cadogan-sgrechiwr', 'Cadogan Sgrechiwr', 'male', '1690', '', SGRECHIWR_HOUSE_ID, {
      title: 'Vorgesehener Erbe des Hauses Sgrechiwr',
      notes: 'Cadogan hat nur Töchter; die Erbfolge springt daher auf seinen Bruder Colwyn.'
    }),
    unnamedSpouse('unknown-cadogan-spouse', 'Unbekannte Ehefrau', 'female'),
    person('fflur-sgrechiwr', 'Fflur Sgrechiwr', 'female', '1692', ''),
    unnamedSpouse('unknown-fflur-spouse', 'Unbekannter Ehemann', 'male'),
    person('colwyn-sgrechiwr', 'Colwyn Sgrechiwr', 'male', '1694', '', SGRECHIWR_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Sgrechiwr',
      notes: 'Bekannter fahrender Barde; blieb laut Überlieferung trotz zahlreicher Bewunderinnen zeitlebens unverheiratet und kinderlos, weshalb die Erbfolge auf seinen Cousin Godwyn übergeht.'
    }),

    // Kinder Geralls
    person('godwyn-sgrechiwr', 'Godwyn Sgrechiwr', 'male', '1692', '', SGRECHIWR_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Sgrechiwr'
    }),
    person('aerona-balchder', 'Aerona Balchder', 'female', '????', '', 'house-balchder', { familyRole: 'married' }),
    person('amlodd-sgrechiwr', 'Amlodd Sgrechiwr', 'male', '1696', ''),
    unnamedSpouse('unknown-amlodd-spouse', 'Unbekannte Ehefrau', 'female'),

    // Jüngste Generation: Kinder Cadogans
    person('eluned-sgrechiwr', 'Eluned Sgrechiwr', 'female', '1716', '????'),
    person('meinwen-sgrechiwr', 'Meinwen Sgrechiwr', 'female', '1718', '????'),

    // Jüngste Generation: Kinder Amlodds
    person('euros-sgrechiwr', 'Euros Sgrechiwr', 'male', '1718', ''),
    person('angwen-sgrechiwr', 'Angwen Sgrechiwr', 'female', '1721', '????'),

    // Jüngste Generation: Kinder Godwyns und Aeronas
    person('eirwen-sgrechiwr', 'Eirwen Sgrechiwr', 'female', '1716', ''),
    person('dylis-sgrechiwr', 'Dylis Sgrechiwr', 'female', '1719', ''),
    person('bran-sgrechiwr', 'Brân Sgrechiwr', 'male', '1722', '', SGRECHIWR_HOUSE_ID, {
      title: 'Vierter Erbe des Hauses Sgrechiwr'
    }),
    person('arial-sgrechiwr', 'Arial Sgrechiwr', 'female', '1725', ''),
    person('cadell-sgrechiwr', 'Cadell Sgrechiwr', 'male', '1727', '', SGRECHIWR_HOUSE_ID, {
      title: 'Fünfter Erbe des Hauses Sgrechiwr'
    })
  ],
  partnerships: [
    createMarriage('marriage-emrys-spouse', ...EMRYS_IDS),
    createMarriage('marriage-dafydd-spouse', ...DAFYDD_IDS),
    createMarriage('marriage-wenna-spouse', ...WENNA_IDS),
    createMarriage('marriage-rhisiart-spouse', ...RHISIART_IDS),
    createMarriage('marriage-gareth-spouse', ...GARETH_IDS),
    createMarriage('marriage-seren-spouse', ...SEREN_IDS),
    createMarriage('marriage-gerallt-spouse', ...GERALLT_IDS),
    createMarriage('marriage-cadogan-spouse', ...CADOGAN_IDS),
    createMarriage('marriage-fflur-spouse', ...FFLUR_IDS),
    createMarriage('marriage-godwyn-aerona', ...GODWYN_IDS),
    createMarriage('marriage-amlodd-spouse', ...AMLODD_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['dafydd-sgrechiwr', 'wenna-sgrechiwr', 'rhisiart-sgrechiwr'],
      EMRYS_IDS,
      'marriage-emrys-spouse',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['gareth-sgrechiwr', 'seren-sgrechiwr'], DAFYDD_IDS, 'marriage-dafydd-spouse'),
    ...childrenOf(['gerallt-sgrechiwr'], RHISIART_IDS, 'marriage-rhisiart-spouse'),
    ...childrenOf(
      ['cadogan-sgrechiwr', 'fflur-sgrechiwr', 'colwyn-sgrechiwr'],
      GARETH_IDS,
      'marriage-gareth-spouse'
    ),
    ...childrenOf(['godwyn-sgrechiwr', 'amlodd-sgrechiwr'], GERALLT_IDS, 'marriage-gerallt-spouse'),
    ...childrenOf(['eluned-sgrechiwr', 'meinwen-sgrechiwr'], CADOGAN_IDS, 'marriage-cadogan-spouse'),
    ...childrenOf(['euros-sgrechiwr', 'angwen-sgrechiwr'], AMLODD_IDS, 'marriage-amlodd-spouse'),
    ...childrenOf(
      ['eirwen-sgrechiwr', 'dylis-sgrechiwr', 'bran-sgrechiwr', 'arial-sgrechiwr', 'cadell-sgrechiwr'],
      GODWYN_IDS,
      'marriage-godwyn-aerona'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-emrys-spouse',
    houseId: SGRECHIWR_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Bürgerliches Haus: eiserner statt goldener/silberner Wappenrahmen.
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1638',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-wenna',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-wenna-spouse',
      houseId: 'house-unbekannt-wenna',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Wenna wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-seren',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-seren-spouse',
      houseId: 'house-unbekannt-seren',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Seren wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-fflur',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-fflur-spouse',
      houseId: 'house-unbekannt-fflur',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Fflur wurde an ein nicht überliefertes Haus verheiratet.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'emrys-sgrechiwr',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Die Hof-Tabelle (Struktur/Familienoberhaupt/Erbfolge) ist ein komplett unausgefülltes generisches Vorlagenraster ohne echte Namen und wurde daher nicht als Strukturquelle herangezogen; maßgeblich waren die benannte Hierarchietabelle und die vom User mündlich mitgeteilte Erbfolge (Gareth > Cadogan > Colwyn > Godwyn > Brân & Cadell). Die Hierarchietabelle überliefert feste Jahreszahlen für Godwyn (1692), Amlodd (1696), Cadogans Tochter (1716), Amlodds Sohn Euros (1718) und Tochter (1721) sowie alle fünf Kinder Godwyns und Aeronas (1716-1727); alle übrigen Geburtsjahre wurden davon ausgehend mit einem Abstand von rund 22-28 Jahren rückwärts bzw. vorwärts hochgerechnet. Bürgerliche Erbfolge verläuft nach Eignung statt Erstgeburt (User-Vorgabe): Cadogan hat nur Töchter, daher fällt die Erbfolge an seinen Bruder Colwyn; Colwyn blieb laut der Historische-Figuren-Sektion trotz zahlreicher Bewunderinnen zeitlebens unverheiratet ("hat nie geheiratet") — obwohl die Hierarchietabelle ihm ebenfalls ein unbeschriftetes Ehepartner-Platzhalterfeld zuordnet, wurde die ausdrückliche Biographie als verlässlicher gewertet und kein Ehepartner angelegt. Die Ehefrau/Ehemann-Kopfzeilen für Gareths, Serens und Geralls Partner tragen als Textreste offenbar aus einer kopierten Vorlage die fremden Namen Rhydderchs, Mablens und Rhovans (aus Haus Gwyllach) — diese wurden ignoriert und stattdessen anhand der Spaltenposition der tatsächlich vorausgehenden Kinderzeile (Gareth/Seren/Gerallt) zugeordnet. Emrys (Begründer), Dafydd, Wenna, Rhisiart und Serens namenlos-portraitlose Positionen in der Quelle wurden auf ausdrücklichen Wunsch des Users mit passenden walisischen Namen versehen (nicht wie bei anderen Häusern als anonyme Platzhalter belassen). Godwyn ist mit Aerona Balchder verheiratet, die bereits als Tochter Dalvins in Haus Balchders eigener Akte geführt wird (dortige Wegverheiratet-Linie „Haus Sgrechiwr"); Godwyns Portrait wird hier kanonisch gehostet, Balchders Fassung bleibt ein namensgleicher Stub ohne eigenes Bild (Cludwyr/Rhyddid-Godwyn-Muster). Alle drei kinderlosen Kernfrauen mit unbenanntem Partner (Wenna, Seren, Fflur) wurden nach dem etablierten Muster als Wegverheiratete Linie markiert. Haus Sgrechiwr sitzt mit dem eigenen Sitz Lynthor abseits des generischen Gwynthor-Pfades direkt unter Llamreis Ankunft; das zugehörige Sitz-Wappen lag bereits in der neuen verschachtelten Ordnerstruktur vor. Als bürgerliches Haus führt Sgrechiwr den eisernen Wappenrahmen. Externe Portraitquellen wurden als lokale Projektdateien gesichert.',
    blankFamily: false,
    sourceRevision: 1
  }
});
