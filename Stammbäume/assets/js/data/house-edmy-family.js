import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_EDMY_PORTRAITS } from './house-edmy-portraits.js';

const EDMY_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Edmy.png';
const EDMY_HOUSE_ID = 'house-edmy';
const HOUSE_EMBLEMS = Object.freeze({
  cenfig: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Cenfig.png',
  penwyn: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Penwyn.png'
});

const HOUSE_HEAD_IDS = new Set([
  'edmwnd-edmy',
  'conwy-edmy',
  'caledfwlch-edmy'
]);

const MAIN_LINE_IDS = new Set([
  'digain-edmy',
  'gerallt-edmy',
  'peredur-edmy'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = EDMY_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_EDMY_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === EDMY_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    familyRole: 'married',
    ...options
  });
}

function unknownSpouse(id, sex, notes = '') {
  return spouse(id, '???', sex, '????', '????', '', {
    status: 'dead',
    notes
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const EDMWND_IDS = ['edmwnd-edmy', 'unknown-spouse-edmwnd-edmy'];
const CONWY_IDS = ['conwy-edmy', 'unknown-spouse-conwy-edmy'];
const MERERID_IDS = ['mererid-edmy', 'unknown-spouse-mererid-edmy'];
const BOWEN_IDS = ['bowen-edmy', 'unknown-spouse-bowen-edmy'];
const CALEDFWLCH_IDS = ['caledfwlch-edmy', 'unknown-spouse-caledfwlch-edmy'];
// Reihenfolge und ID entsprechen der kanonischen Penwyn-Gegenakte.
const CATELYN_IDS = ['rhys-penwyn', 'catelyn-edmy'];
const MELANGELL_IDS = ['melangell-edmy', 'lleward-cenfig'];
const ARIAL_IDS = ['arial-edmy', 'unknown-spouse-arial-edmy'];
const DIGAIN_IDS = ['digain-edmy', 'unknown-spouse-digain-edmy'];
const EDERN_IDS = ['edern-edmy', 'unknown-spouse-edern-edmy'];
const BRAN_IDS = ['bran-edmy', 'unknown-spouse-bran-edmy'];
const EFANNA_IDS = ['efanna-edmy', 'unknown-spouse-efanna-edmy'];

export const HOUSE_EDMY_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-edmy',
    title: 'Haus Edmy',
    motto: '',
    description: 'Das kleine Ritterhaus Edmy aus Abergwint bewahrt den nie erfüllten Eid seines Gründers, Königin Isobels verlorenen avallornischen Ring zu finden.',
    emblem: EDMY_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.edmy
  },
  houses: [
    house(EDMY_HOUSE_ID, 'Haus Edmy', EDMY_EMBLEM),
    house('house-penwyn', 'Haus Penwyn', HOUSE_EMBLEMS.penwyn),
    house('house-cenfig', 'Haus Cenfig', HOUSE_EMBLEMS.cenfig),
    house('house-unbekannt-mererid-edmy', 'Unbekanntes Haus'),
    house('house-unbekannt-efanna-edmy', 'Unbekanntes Haus')
  ],
  persons: [
    person('edmwnd-edmy', 'Edmwnd Edmy', 'male', '????', '????', EDMY_HOUSE_ID, {
      status: 'dead',
      title: 'Der Unerbitterte · Gründer und erster Ritterherr des Hauses Edmy',
      notes: 'Schwor Königin Isobel, den verlorenen avallornischen Ring zu finden. Seine lebenslange, erfolglose Suche wurde als ehrenstiftender Eid des neuen Hauses anerkannt.'
    }),
    unknownSpouse(
      'unknown-spouse-edmwnd-edmy',
      'female',
      'Edmwnds Ehefrau ist nur als verstorbene, namenlose Gründerin überliefert.'
    ),

    person('conwy-edmy', 'Conwy Edmy', 'male', '????', '????', EDMY_HOUSE_ID, {
      status: 'dead',
      title: 'Ehemaliger Ritterherr des Hauses Edmy'
    }),
    unknownSpouse('unknown-spouse-conwy-edmy', 'female'),
    person('mererid-edmy', 'Mererid Edmy', 'female', '????', '????', EDMY_HOUSE_ID, {
      status: 'dead',
      notes: 'Mererid wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Edmy-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-mererid-edmy',
      'male',
      'Mererids Ehemann und dessen Haus sind nicht überliefert.'
    ),
    person('bowen-edmy', 'Bowen Edmy', 'male', '????', '????', EDMY_HOUSE_ID, {
      status: 'dead'
    }),
    unknownSpouse('unknown-spouse-bowen-edmy', 'female'),

    person('caledfwlch-edmy', 'Caledfwlch Edmy', 'male', '1662', '', EDMY_HOUSE_ID, {
      title: 'Ritterherr des Hauses Edmy',
      notes: 'Führt das Haus streng und betrachtet den isobelitischen Eid als Bürde, niemals als Flucht vor den alltäglichen Pflichten.'
    }),
    unknownSpouse(
      'unknown-spouse-caledfwlch-edmy',
      'female',
      'Caledfwlchs Ehefrau ist nur als verstorbene, namenlose Partnerin überliefert.'
    ),
    person('catelyn-edmy', 'Catelyn Edmy', 'female', '1664', '', EDMY_HOUSE_ID, {
      notes: 'Catelyn heiratete Rhys Penwyn. Ihre Nachkommen und die fortgeführte Linie werden in der Penwyn-Akte geführt.'
    }),
    spouse('rhys-penwyn', 'Rhys Penwyn', 'male', '1667', '', 'house-penwyn', {
      title: 'Ritterherr des Hauses Penwyn · Verwalter von Morddyn'
    }),
    person('melangell-edmy', 'Melangell Edmy', 'female', '1663', '', EDMY_HOUSE_ID, {
      notes: 'Melangell heiratete Lleward Cenfig und führt die Edmy-Linie nicht fort.'
    }),
    spouse('lleward-cenfig', 'Lleward Cenfig', 'male', '1665', '', 'house-cenfig'),
    person('arial-edmy', 'Arial Edmy', 'male', '1665', '', EDMY_HOUSE_ID, {
      title: 'Ritter des Hauses Edmy',
      notes: 'Vetter Caledfwlchs und ruhiger, verlässlicher Unterstützer bei Verwaltung, Aufsicht und militärischem Dienst.'
    }),
    unknownSpouse(
      'unknown-spouse-arial-edmy',
      'female',
      'Arials Ehefrau ist nur als verstorbene, namenlose Partnerin überliefert.'
    ),

    person('digain-edmy', 'Digain Edmy', 'male', '1693', '', EDMY_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Edmy · Hauptmann der Wache in Traethfael',
      notes: 'Vertritt die Interessen des Hauses als pflichtbewusster und durchsetzungsfähiger Hauptmann.'
    }),
    unknownSpouse('unknown-spouse-digain-edmy', 'female'),
    person('edern-edmy', 'Edern Edmy', 'male', '1696', '', EDMY_HOUSE_ID, {
      title: 'Waffenmeister von Traethfael',
      notes: 'Verantwortet Ausbildung, Disziplin und Bewaffnung der Wache von Traethfael.'
    }),
    unknownSpouse('unknown-spouse-edern-edmy', 'female'),
    person('elfed-edmy', 'Elfed Edmy', 'male', '1704', '', EDMY_HOUSE_ID, {
      status: 'missing',
      title: 'Isobelit',
      notes: 'Gilt in Cenyr als verschollen, lebt aber als auffallend romantischer fahrender Ritter in Weisenfluh und deutlich über den üblichen Mitteln eines Isobeliten.'
    }),
    person('bran-edmy', 'Bran Edmy', 'male', '1688', '', EDMY_HOUSE_ID, {
      title: 'Ritter und Verwalter von Burg und Höfen',
      notes: 'Sohn Arials; verwaltet zuverlässig die Burg und die angrenzenden schutzpflichtigen Bauernhöfe.'
    }),
    unknownSpouse('unknown-spouse-bran-edmy', 'female'),
    person('brochwel-edmy', 'Brochwel Edmy', 'male', '1691', '', EDMY_HOUSE_ID, {
      status: 'missing',
      title: 'Isobelit',
      notes: 'Verschwand auf der Suche im nördlichen Vennyr. Das Haus hält ihn seit dem dortigen Einfall der Nordmänner für tot, sein Tod ist jedoch nicht bestätigt.'
    }),
    person('celyddon-edmy', 'Celyddon Edmy', 'male', '1699', '', EDMY_HOUSE_ID, {
      status: 'missing',
      title: 'Isobelit',
      notes: 'Folgte einer Spur nach Tirnara und gilt seither als verschollen.'
    }),
    person('derwen-edmy', 'Derwen Edmy', 'female', '1703', '', EDMY_HOUSE_ID, {
      status: 'missing',
      title: 'Erste anerkannte Isobelitin des Hauses Edmy',
      notes: 'Brach zur Suche nach Aldervan auf; seither fehlt jede Kunde.'
    }),

    person('gerallt-edmy', 'Gerallt Edmy', 'male', '1722', '', EDMY_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Edmy'
    }),
    person('peredur-edmy', 'Peredur Edmy', 'male', '1724', '', EDMY_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Edmy · Mündel und Knappe bei Haus Penwyn',
      familyRole: 'ward-away',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Peredur bleibt biologischer und dynastischer Edmy, wurde aber als Mündel und Knappe zur Ausbildung an Haus Penwyn vermittelt.'
    }),
    person('elenid-edmy', 'Elenid Edmy', 'female', '1722'),
    person('llinos-edmy', 'Llinos Edmy', 'female', '1726', '', EDMY_HOUSE_ID, {
      title: 'Mündel bei Haus Penwyn',
      familyRole: 'ward-away',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Llinos bleibt biologisch eine Edmy, wurde aber als Mündel an Haus Penwyn vermittelt.'
    }),
    person('efanna-edmy', 'Efanna Edmy', 'female', '1714', '', EDMY_HOUSE_ID, {
      notes: 'Efanna wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Edmy-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-efanna-edmy',
      'male',
      'Efannas Ehemann und dessen Haus sind nicht überliefert.'
    ),
    person('cedig-edmy', 'Cedig Edmy', 'male', '1716'),
    person('olwen-edmy', 'Olwen Edmy', 'female', '1719'),
    person('aedd-edmy', 'Aedd Edmy', 'male', '1722', '', EDMY_HOUSE_ID, {
      title: 'Jungritter · Anwärter auf den isobelitischen Eid',
      notes: 'Hat die Erlaubnis erhalten, Isobelit zu werden, muss aber vor dem endgültigen Antritt noch die vorgeschriebenen weltlichen Zustimmungen und den kirchlichen Segen einholen.'
    })
  ],
  partnerships: [
    createMarriage('marriage-edmwnd-unknown-edmy', ...EDMWND_IDS, { status: 'ended' }),
    createMarriage('marriage-conwy-unknown-edmy', ...CONWY_IDS, { status: 'ended' }),
    createMarriage('marriage-mererid-unknown-edmy', ...MERERID_IDS, { status: 'ended' }),
    createMarriage('marriage-bowen-unknown-edmy', ...BOWEN_IDS, { status: 'ended' }),
    createMarriage('marriage-caledfwlch-unknown-edmy', ...CALEDFWLCH_IDS, { status: 'widowed' }),
    createMarriage('marriage-rhys-catelyn', ...CATELYN_IDS),
    createMarriage('marriage-melangell-lleward', ...MELANGELL_IDS),
    createMarriage('marriage-arial-unknown-edmy', ...ARIAL_IDS, { status: 'widowed' }),
    createMarriage('marriage-digain-unknown-edmy', ...DIGAIN_IDS, { status: 'widowed' }),
    createMarriage('marriage-edern-unknown-edmy', ...EDERN_IDS, { status: 'widowed' }),
    createMarriage('marriage-bran-unknown-edmy', ...BRAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-efanna-unknown-edmy', ...EFANNA_IDS, { status: 'widowed' })
  ],
  parentages: [
    ...childrenOf(
      ['conwy-edmy', 'mererid-edmy', 'bowen-edmy'],
      EDMWND_IDS,
      'marriage-edmwnd-unknown-edmy',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Conwy, Mererid und Bowen.',
        extensions: { timeJumpId: 'gap-edmwnd-conwy-edmy' }
      }
    ),
    ...childrenOf(['caledfwlch-edmy', 'catelyn-edmy'], CONWY_IDS, 'marriage-conwy-unknown-edmy'),
    ...childrenOf(['melangell-edmy', 'arial-edmy'], BOWEN_IDS, 'marriage-bowen-unknown-edmy'),
    ...childrenOf(['digain-edmy', 'edern-edmy', 'elfed-edmy'], CALEDFWLCH_IDS, 'marriage-caledfwlch-unknown-edmy'),
    ...childrenOf(['bran-edmy', 'brochwel-edmy', 'celyddon-edmy', 'derwen-edmy'], ARIAL_IDS, 'marriage-arial-unknown-edmy'),
    ...childrenOf(['gerallt-edmy', 'peredur-edmy'], DIGAIN_IDS, 'marriage-digain-unknown-edmy'),
    ...childrenOf(['elenid-edmy', 'llinos-edmy'], EDERN_IDS, 'marriage-edern-unknown-edmy'),
    ...childrenOf(['efanna-edmy', 'cedig-edmy', 'olwen-edmy', 'aedd-edmy'], BRAN_IDS, 'marriage-bran-unknown-edmy')
  ],
  lineage: {
    founderPartnershipId: 'marriage-edmwnd-unknown-edmy',
    houseId: EDMY_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-mererid-edmy',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-mererid-unknown-edmy',
      houseId: 'house-unbekannt-mererid-edmy',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Mererid Edmy wurde an ein nicht näher überliefertes Haus verheiratet und führt die Edmy-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-penwyn-catelyn-edmy',
      name: 'Haus Penwyn',
      parentPartnershipId: 'marriage-rhys-catelyn',
      houseId: 'house-penwyn',
      targetFamilyId: 'haus-penwyn',
      emblem: HOUSE_EMBLEMS.penwyn,
      crestFrame: 'silver',
      notes: 'Catelyn Edmy wurde an Rhys Penwyn verheiratet; ihre Nachkommen werden in der Penwyn-Akte geführt.'
    }),
    createWardAwayBranch({
      id: 'ward-away-peredur-penwyn',
      name: 'Haus Penwyn',
      parentPersonId: 'peredur-edmy',
      houseId: 'house-penwyn',
      targetFamilyId: 'haus-penwyn',
      emblem: HOUSE_EMBLEMS.penwyn,
      crestFrame: 'silver',
      notes: 'Peredur Edmy wurde als Mündel und Knappe an Haus Penwyn vermittelt; ein namentlicher Vormund ist nicht überliefert.'
    }),
    createWardAwayBranch({
      id: 'ward-away-llinos-penwyn',
      name: 'Haus Penwyn',
      parentPersonId: 'llinos-edmy',
      houseId: 'house-penwyn',
      targetFamilyId: 'haus-penwyn',
      emblem: HOUSE_EMBLEMS.penwyn,
      crestFrame: 'silver',
      notes: 'Llinos Edmy wurde als Mündel an Haus Penwyn vermittelt; ein namentlicher Vormund ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-cenfig-melangell-edmy',
      name: 'Haus Cenfig',
      parentPartnershipId: 'marriage-melangell-lleward',
      houseId: 'house-cenfig',
      targetFamilyId: 'haus-cenfig',
      emblem: HOUSE_EMBLEMS.cenfig,
      crestFrame: 'silver',
      notes: 'Melangell Edmy wurde an Lleward Cenfig verheiratet und führt die Edmy-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-efanna-edmy',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-efanna-unknown-edmy',
      houseId: 'house-unbekannt-efanna-edmy',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Efanna Edmy wurde an ein nicht näher überliefertes Haus verheiratet und führt die Edmy-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-edmwnd-conwy-edmy',
      parentPartnershipId: 'marriage-edmwnd-unknown-edmy',
      parentPersonId: '',
      childIds: ['conwy-edmy', 'mererid-edmy', 'bowen-edmy'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem vom Gründerpaar begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'edmwnd-edmy',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Edmy-Hausseite samt Stammbaumgrafik. Unter Edmwnds silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Conwy, Mererid und Bowen. Die Kopfschaft verläuft über Edmwnd und Conwy zu Caledfwlch; die ausdrückliche Erbfolge lautet Digain – Gerallt – Peredur. Peredur bleibt biologischer und dynastischer Edmy, trägt als fortgegebenes Mündel und Knappe den entsprechenden Rahmen und besitzt unmittelbar unter seiner Karte die Vermittlungsverknüpfung zu Haus Penwyn. Llinos bleibt biologische Tochter Ederns, trägt als fortgegebenes Mündel ebenfalls den Mündelrahmen und besitzt direkt unter ihrer Karte einen eigenen Penwyn-Zielhausknoten. Mangels namentlich belegter Vormünder wird in beiden Fällen keine Pflege-Elternschaft erfunden. Catelyn und Rhys verwenden dieselben Weltpersonen, dieselbe Ehe und dieselben Portraitdateien wie in der Penwyn-Gegenakte. Mererid und Efanna besitzen direkte Wegverheiratet-Knoten zu unbekannten Häusern, Catelyn den direkten Knoten zu Haus Penwyn und Melangell den direkten Knoten zu Haus Cenfig. Die missbeschrifteten generischen Ehezeilen der Tabelle wurden anhand der gezeichneten Stammbaumgrafik und der Isobeliten-Biografien aufgelöst: Nur Bran und Efanna besitzen an diesen Stellen namenlose Partner; Brochwel, Celyddon, Derwen und Aedd bleiben ohne erfundene Ehe. Caledfwlchs Geburtsjahr 1662 folgt der ausführlichen Genealogie, obwohl die Oberhaupttabelle es offenlässt; die Kurzform „Caledfwch“ in einem Figurenkopf wurde zur mehrfach belegten Schreibweise Caledfwlch normalisiert. Generische Silhouetten werden nicht als individuelle Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Kleine Landburg zwischen Traethfael und Abergwint mit wenigen Bauernhöfen und Plantagen',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Königin Isobel Draig',
      ethnicity: 'Cenyri',
      wealth: 'Sehr beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: [],
      feud: 'Keine offene Fehde.',
      trade: ['Wachdienst', 'Verwaltung', 'militärischer Dienst', 'Landwirtschaft'],
      tradition: 'In jeder Generation können einzelne Edmy nach Zustimmung von Haus Draig und Haus Pendrag sowie dem Segen in Llanforwyn als Isobeliten die nie erfüllte Suche nach Königin Isobels Ring aufnehmen. Eidgeschworene heiraten nicht und gründen keine eigene Linie.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
