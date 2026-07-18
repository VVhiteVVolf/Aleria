import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_AWENYDD_PORTRAITS } from './house-awenydd-portraits.js';

const AWENYDD_EMBLEM = 'assets/images/houses/haus-awenydd.png';
const AWENYDD_HOUSE_ID = 'house-awenydd';
const HOUSE_HEAD_IDS = new Set([
  'aeddan-awenydd',
  'colwyn-awenydd',
  'derfel-awenydd'
]);
const MAIN_LINE_IDS = new Set(['gildas-awenydd']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = AWENYDD_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_AWENYDD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === AWENYDD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

// Die Quelltabelle überliefert für die meisten Ehepartner nur ein
// unbeschriftetes „???“-Bildfeld; sie bleiben namenlos und ohne Portrait.
function unnamedSpouse(id, name, sex, birth = '????', death = '????') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married', status: 'unknown' });
}

function spouse(id, name, sex, birth = '????', death = '') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['aeddan-awenydd', 'alis'];
const COLWYN_IDS = ['colwyn-awenydd', 'unknown-colwyn-spouse'];
const BRYNNA_IDS = ['brynna-awenydd', 'unknown-brynna-spouse'];
const SELWYN_IDS = ['selwyn-awenydd', 'unknown-selwyn-spouse'];
const DERFEL_IDS = ['derfel-awenydd', 'unknown-derfel-spouse'];
const ELERI_IDS = ['eleri-awenydd', 'unknown-eleri-spouse'];
const HAFGAN_IDS = ['hafgan-awenydd', 'unknown-hafgan-spouse'];
const GILDAS_IDS = ['gildas-awenydd', 'unknown-gildas-spouse'];
const DELYTH_IDS = ['delyth-awenydd', 'ruarc-balguen'];
const IDNERTH_IDS = ['idnerth-awenydd', 'unknown-idnerth-spouse'];
const GWERN_IDS = ['gwern-awenydd', 'unknown-gwern-spouse'];
const BRYCHAN_IDS = ['brychan-awenydd', 'rhoswyn-penwyn'];

export const HOUSE_AWENYDD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-awenydd',
    title: 'Haus Awenydd',
    motto: '',
    description: 'Die belegte Linie des unauffälligen, aber verlässlichen Ritterherrenhauses Awenydd unter Haus Draig: vom Gründer Aeddan bis zur Generation von 1733.',
    emblem: AWENYDD_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.awenydd
  },
  houses: [
    { id: AWENYDD_HOUSE_ID, name: 'Haus Awenydd', motto: '', emblem: AWENYDD_EMBLEM, status: 'active' },
    { id: 'house-balguen', name: 'Haus Balguen', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-brynna', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-eleri', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Gründer und seine Frau
    person('aeddan-awenydd', 'Aeddan Awenydd', 'male', '????', '????', AWENYDD_HOUSE_ID, {
      title: 'Begründer des Ritterherrenhauses Awenydd',
      notes: 'Ein namentlich kaum überlieferter Ritter aus Gwynthor, der dem Haus Draig nüchtern und endgültig die Treue schwor.'
    }),
    unnamedSpouse('alis', 'Alis', 'female'),

    // Drei Geschwister nach der Überlieferungslücke
    person('colwyn-awenydd', 'Colwyn Awenydd', 'male', '1640', '????', AWENYDD_HOUSE_ID),
    unnamedSpouse('unknown-colwyn-spouse', 'Unbekannte Ehefrau', 'female', '1642'),
    person('brynna-awenydd', 'Brynna Awenydd', 'female', '1642', '????'),
    unnamedSpouse('unknown-brynna-spouse', 'Unbekannter Ehemann', 'male', '1640'),
    person('selwyn-awenydd', 'Selwyn Awenydd', 'male', '1645', '????'),
    unnamedSpouse('unknown-selwyn-spouse', 'Unbekannte Ehefrau', 'female', '1647'),

    // Kinder von Colwyn
    person('derfel-awenydd', 'Derfel Awenydd', 'male', '1665', '', AWENYDD_HOUSE_ID, {
      title: 'Ritterherr des Hauses Awenydd'
    }),
    unnamedSpouse('unknown-derfel-spouse', 'Unbekannte Ehefrau', 'female', '1667', ''),
    person('eleri-awenydd', 'Eleri Awenydd', 'female', '1667', ''),
    unnamedSpouse('unknown-eleri-spouse', 'Unbekannter Ehemann', 'male', '1665', ''),

    // Kind von Selwyn
    person('hafgan-awenydd', 'Hafgan Awenydd', 'male', '1670', '', AWENYDD_HOUSE_ID, {
      status: 'missing',
      notes: 'Persönlicher Waldläufer des Ratsmagiers Myrddin; bei der Bergung eines Artefakts im Gebirge von Aldrimar nahe den Ruinen von Ard Eabhraig verschollen.'
    }),
    unnamedSpouse('unknown-hafgan-spouse', 'Unbekannte Ehefrau', 'female', '1672', ''),

    // Kinder von Derfel
    person('gildas-awenydd', 'Gildas Awenydd', 'male', '1690', ''),
    unnamedSpouse('unknown-gildas-spouse', 'Unbekannte Ehefrau', 'female', '1692', ''),
    person('delyth-awenydd', 'Delyth Awenydd', 'female', '1692', ''),
    spouse('ruarc-balguen', 'Ruarc Balguen', 'male', '????', ''),
    person('idnerth-awenydd', 'Idnerth Awenydd', 'male', '1692', '', AWENYDD_HOUSE_ID, {
      notes: 'Vertragsmeister im engeren Gefolge des Erzritters Sir Owain Draig, meist fern der Familie in der Hauptstadt Cenyrs.'
    }),
    unnamedSpouse('unknown-idnerth-spouse', 'Unbekannte Ehefrau', 'female', '1694', ''),

    // Kind von Hafgan
    person('gwern-awenydd', 'Gwern Awenydd', 'male', '1695', '', AWENYDD_HOUSE_ID, {
      notes: 'Verwaltet als Kämmerer das persönliche Gestüt des Erzritters Sir Owain Draig, unweit der Burg und des Gestüts des eigenen Hauses.'
    }),
    unnamedSpouse('unknown-gwern-spouse', 'Unbekannte Ehefrau', 'female', '1697', ''),
    person('brychan-awenydd', 'Brychan Awenydd', 'male', '1698', '', AWENYDD_HOUSE_ID, {
      notes: 'Persönlicher Botengänger und Waldläufer des Ratsmagiers Myrddin, Nachfolger seines Vaters Hafgan.'
    }),
    spouse('rhoswyn-penwyn', 'Rhoswyn Penwyn', 'female', '????', ''),

    // Jüngste Generation
    person('rhiwallon-awenydd', 'Rhiwallon Awenydd', 'male', '1714', ''),
    person('hafren-awenydd', 'Hafren Awenydd', 'female', '1716', ''),
    person('orlaith-awenydd', 'Orlaith Awenydd', 'female', '1718', ''),
    person('amren-awenydd', 'Amren Awenydd', 'male', '1717', '', AWENYDD_HOUSE_ID, {
      notes: 'Diente als Knappe unter Sir Owain Draig und steht ihm nun als Ritter im Gefolge zur Seite.'
    }),
    person('arthen-awenydd', 'Arthen Awenydd', 'male', '1726', '', AWENYDD_HOUSE_ID, {
      notes: 'Vierzehnjähriger Knappe im Gefolge von Sir Owain Draig.'
    }),
    person('beliad-awenydd', 'Beliad Awenydd', 'male', '1720', ''),
    person('rhosyn-awenydd', 'Rhosyn Awenydd', 'female', '1723', ''),
    person('ysolt-awenydd', 'Ysolt Awenydd', 'female', '1733', ''),
    person('bors-awenydd', 'Bors Awenydd', 'male', '1724', ''),
    person('ludd-awenydd', 'Ludd Awenydd', 'male', '1729', '')
  ],
  partnerships: [
    createMarriage('marriage-aeddan-alis', ...FOUNDER_IDS),
    createMarriage('marriage-colwyn-spouse', ...COLWYN_IDS),
    createMarriage('marriage-brynna-spouse', ...BRYNNA_IDS),
    createMarriage('marriage-selwyn-spouse', ...SELWYN_IDS),
    createMarriage('marriage-derfel-spouse', ...DERFEL_IDS),
    createMarriage('marriage-eleri-spouse', ...ELERI_IDS),
    createMarriage('marriage-hafgan-spouse', ...HAFGAN_IDS),
    createMarriage('marriage-gildas-spouse', ...GILDAS_IDS),
    createMarriage('marriage-delyth-ruarc', ...DELYTH_IDS),
    createMarriage('marriage-idnerth-spouse', ...IDNERTH_IDS),
    createMarriage('marriage-gwern-spouse', ...GWERN_IDS),
    createMarriage('marriage-brychan-rhoswyn', ...BRYCHAN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['colwyn-awenydd', 'brynna-awenydd', 'selwyn-awenydd'],
      FOUNDER_IDS,
      'marriage-aeddan-alis',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['derfel-awenydd', 'eleri-awenydd'], COLWYN_IDS, 'marriage-colwyn-spouse'),
    ...childrenOf(['hafgan-awenydd'], SELWYN_IDS, 'marriage-selwyn-spouse'),
    ...childrenOf(
      ['gildas-awenydd', 'delyth-awenydd', 'idnerth-awenydd', 'gwern-awenydd'],
      DERFEL_IDS,
      'marriage-derfel-spouse'
    ),
    ...childrenOf(['brychan-awenydd'], HAFGAN_IDS, 'marriage-hafgan-spouse'),
    ...childrenOf(['rhiwallon-awenydd', 'hafren-awenydd', 'orlaith-awenydd'], GILDAS_IDS, 'marriage-gildas-spouse'),
    ...childrenOf(['amren-awenydd', 'arthen-awenydd'], IDNERTH_IDS, 'marriage-idnerth-spouse'),
    ...childrenOf(['beliad-awenydd', 'rhosyn-awenydd', 'ysolt-awenydd'], GWERN_IDS, 'marriage-gwern-spouse'),
    ...childrenOf(['bors-awenydd', 'ludd-awenydd'], BRYCHAN_IDS, 'marriage-brychan-rhoswyn')
  ],
  lineage: {
    founderPartnershipId: 'marriage-aeddan-alis',
    houseId: AWENYDD_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1640',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-balguen-delyth',
      name: 'Haus Balguen',
      parentPartnershipId: 'marriage-delyth-ruarc',
      houseId: 'house-balguen',
      targetFamilyId: 'haus-balguen',
      crestFrame: 'gold',
      notes: 'Delyth wurde an Haus Balguen wegverheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-brynna',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-brynna-spouse',
      houseId: 'house-unbekannt-brynna',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Brynna wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-eleri',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-eleri-spouse',
      houseId: 'house-unbekannt-eleri',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Eleri wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aeddan-awenydd',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Die Quelltabelle überliefert nur wenige Namen und keine Lebensdaten; Geburtsjahre der jüngsten Generation wurden anhand des dargestellten Alters (14–26 Jahre, verankert an Arthens ausdrücklich genannten 14 Lebensjahren) geschätzt und die Elterngenerationen rückwirkend so berechnet, dass die Altersabstände plausibel sind. Die meisten Ehepartner sind in der Quelle nur als unbeschriftetes Portraitfeld überliefert und bleiben namenlos. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Awenydd den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
