import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';

const GWARED_EMBLEM = 'assets/images/houses/Rhonwens Tränen/Ritterliche/Gwared.png';
const GWARED_HOUSE_ID = 'house-gwared';

// Die Kopfschaft lag bis 1720 bei der älteren, Illysywen-treuen Linie (Cyrwyn →
// Dyrian → Firban → Gwaedan), die mit Gwaedans Tod erlischt. Erst danach fällt sie
// an die jüngere, Draig-treue Linie (Rhydor → Maelric → Brenan → Ellric), die zu
// Lebzeiten der älteren Linie selbst nur Nebenlinie war — daher tragen NUR die
// tatsächlich amtierenden Personen 'head', nicht rückwirkend ihre ganze Ahnenreihe.
const HOUSE_HEAD_IDS = new Set([
  'cyrwyn-gwared',
  'dyrian-gwared',
  'firban-gwared',
  'gwaedan-gwared',
  'ellric-gwared'
]);
const MAIN_LINE_IDS = new Set([
  'rhydor-gwared',
  'maelric-gwared',
  'brenan-gwared',
  'dyrwyn-gwared',
  'maelwen-gwared',
  'nera-gwared'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GWARED_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    familyRole: options.familyRole || (houseId === GWARED_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

// Eingeheiratete Ehepartner ohne benanntes Herkunftshaus sind ohne Hausnamen überliefert.
function spouse(id, name, sex, birth = '????', death = '') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['uwchor-gwared', 'sairwen'];
const CYRWYN_IDS = ['cyrwyn-gwared', 'nerella'];
const RHYDOR_IDS = ['rhydor-gwared', 'avelia'];
const DYRIAN_IDS = ['dyrian-gwared', 'cyrena'];
const ELLOR_IDS = ['ellor-gwared', 'firwen'];
const MAELRIC_IDS = ['maelric-gwared', 'gwena'];
const THALRIC_IDS = ['thalric-gwared', 'helyga'];
const FIRBAN_IDS = ['firban-gwared', 'kyria'];
const JANOR_IDS = ['janor-gwared', 'dynwen'];
const BRENAN_IDS = ['brenan-gwared', 'iwra'];
const OENBAN_IDS = ['oenban-gwared', 'thalwen'];
const NEDDYR_IDS = ['neddyr-gwared', 'cyrin'];
const PERAN_IDS = ['peran-gwared', 'rhewa'];
const GWAEDAN_IDS = ['gwaedan-gwared', 'perdena'];
const KYRBAN_IDS = ['kyrban-gwared', 'sairyn'];

export const HOUSE_GWARED_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwared',
    title: 'Haus Gwared',
    motto: 'Ehre wägt schwerer als Blut.',
    description: 'Ein ritterliches Haus aus Rhonwens Tränen: einst Illysywen verpflichtet, seit dem Fall Illysywens 1720 im Banner Haus Arwydds.',
    emblem: GWARED_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gwared
  },
  houses: [
    { id: GWARED_HOUSE_ID, name: 'Haus Gwared', motto: 'Ehre wägt schwerer als Blut.', emblem: GWARED_EMBLEM, status: 'active' }
  ],
  persons: [
    // Sagenhafter Begründer, vor der Überlieferungslücke
    person('uwchor-gwared', 'Uwchor Gwared', 'male', '????', '????', GWARED_HOUSE_ID, {
      title: 'Sagenhafter Begründer des Hauses Gwared'
    }),
    spouse('sairwen', 'Sairwen', 'female', '????', '????'),

    // Nach der Überlieferungslücke: die beiden Brüder, an denen sich das Haus
    // 1618 zu spalten beginnt
    person('cyrwyn-gwared', 'Cyrwyn Gwared', 'male', '1618', '1668', GWARED_HOUSE_ID, {
      title: 'Ritterherr des Hauses Gwared',
      notes: 'Hielt Haus Illysywen die Treue; fiel in einem frühen Gefecht des schwelenden Zwists um die Gefolgschaft.'
    }),
    spouse('nerella', 'Nerella', 'female', '1620', ''),
    person('rhydor-gwared', 'Rhydor Gwared', 'male', '1621', '1675', GWARED_HOUSE_ID, {
      title: 'Jüngerer Bruder Cyrwyns',
      notes: 'Wandte sich von Illysywen ab und stellte sich früh an die Seite Haus Draigs; zu Lebzeiten nur Nebenlinie, da Cyrwyns Nachkommen die Kopfschaft hielten.'
    }),
    spouse('avelia', 'Avelia', 'female', '1624', ''),

    // Kinder Cyrwyns: die Linie spaltet sich in Fortführung und Sackgasse
    person('dyrian-gwared', 'Dyrian Gwared', 'male', '1644', '1694', GWARED_HOUSE_ID, {
      title: 'Ritterherr des Hauses Gwared',
      notes: 'Führte die Illysywen-treue Linie fort; fiel im andauernden Zwist gegen Draig-treue Gefolgsleute.'
    }),
    spouse('cyrena', 'Cyrena', 'female', '1646', ''),
    person('ellor-gwared', 'Ellor Gwared', 'male', '1647', '', GWARED_HOUSE_ID, {
      notes: 'Keine überlieferten Nachkommen.'
    }),
    spouse('firwen', 'Firwen', 'female', '1650', ''),

    // Kinder Rhydors: beide Söhne führen die Draig-treue Nebenlinie fort
    person('maelric-gwared', 'Maelric Gwared', 'male', '1645', '1701', GWARED_HOUSE_ID),
    spouse('gwena', 'Gwena', 'female', '1648', ''),
    person('thalric-gwared', 'Thalric Gwared', 'male', '1648', '1705', GWARED_HOUSE_ID),
    spouse('helyga', 'Helyga', 'female', '1651', ''),

    // Kinder Dyrians
    person('firban-gwared', 'Firban Gwared', 'male', '1670', '1719', GWARED_HOUSE_ID, {
      title: 'Ritterherr des Hauses Gwared',
      notes: 'Letzter Ritterherr vor dem Fall Illysywens; starb ein Jahr vor Nodawls Schändung Rhonwen Draigs.'
    }),
    spouse('kyria', 'Kyria', 'female', '1673', ''),
    person('janor-gwared', 'Janor Gwared', 'male', '1673', '', GWARED_HOUSE_ID, {
      notes: 'Keine überlieferten Nachkommen.'
    }),
    spouse('dynwen', 'Dynwen', 'female', '1676', ''),

    // Kinder Maelrics und Thalrics
    person('brenan-gwared', 'Brenan Gwared', 'male', '1669', '1728', GWARED_HOUSE_ID),
    spouse('iwra', 'Iwra', 'female', '1672', ''),
    person('oenban-gwared', 'Oenban Gwared', 'male', '1672', '', GWARED_HOUSE_ID, {
      notes: 'Nebenzweig ohne überlieferte weitere Nachkommen.'
    }),
    spouse('thalwen', 'Thalwen', 'female', '1675', ''),
    person('neddyr-gwared', 'Neddyr Gwared', 'male', '1671', '1730', GWARED_HOUSE_ID),
    spouse('cyrin', 'Cyrin', 'female', '1674', ''),
    person('peran-gwared', 'Peran Gwared', 'male', '1674', '', GWARED_HOUSE_ID, {
      notes: 'Nebenzweig ohne überlieferte weitere Nachkommen.'
    }),
    spouse('rhewa', 'Rhewa', 'female', '1677', ''),

    // Firbans Kinder: Gwaedan und seine Frau sterben 1720 im Zuge von Nodawls
    // Schändung Rhonwen Draigs und dem folgenden Zusammenbruch Illysywens
    person('gwaedan-gwared', 'Gwaedan Gwared', 'male', '1695', '1720', GWARED_HOUSE_ID, {
      title: 'Letzter Ritterherr der Illysywen-treuen Linie',
      notes: 'Starb 1720 gemeinsam mit seiner Frau im Zusammenbruch nach Nodawls Schändung Rhonwen Draigs; seine Kinder Sheev und Soffi waren daran unbeteiligt und wurden als Mündel an ehrbare Häuser gegeben.'
    }),
    spouse('perdena', 'Perdena', 'female', '1697', '1720'),
    person('kyrban-gwared', 'Kyrban Gwared', 'male', '1698', '', GWARED_HOUSE_ID, {
      notes: 'Keine überlieferten Nachkommen.'
    }),
    spouse('sairyn', 'Sairyn', 'female', '1701', ''),

    // Gwaedans Kinder: als Waisen 1720 in ehrbare Vormundschaft gegeben, da sie
    // mit dem Konflikt nichts zu tun hatten. Im eigenen Stammbaum sind sie
    // leibliche Kernmitglieder Gwareds ('core'); 'ward' gilt erst in den
    // jeweiligen Vormund-Häusern (Balchder/Chwedonol), wo die volle Personenakte liegt.
    person('sheev-gwared', 'Sheev Gwared', 'male', '1720', '', GWARED_HOUSE_ID, {
      notes: 'Als Waise 1720 in die Vormundschaft Avan Balchders gegeben.'
    }),
    person('soffi-gwared', 'Soffi Gwared', 'female', '1720', '', GWARED_HOUSE_ID, {
      notes: 'Als Waise 1720 in die Vormundschaft Morgaine Chwedonols gegeben.'
    }),

    // Brenans Kinder: die heutige Kopfschaft
    person('ellric-gwared', 'Ellric Gwared', 'male', '1694', '', GWARED_HOUSE_ID, {
      title: 'Ritterherr des Hauses Gwared',
      notes: 'Heutiges Oberhaupt des Hauses Gwared, im Banner Haus Arwydds.'
    }),
    person('maelwen-gwared', 'Maelwen Gwared', 'female', '1697', '', GWARED_HOUSE_ID),

    // Neddyrs Kinder
    person('dyrwyn-gwared', 'Dyrwyn Gwared', 'male', '1696', '', GWARED_HOUSE_ID),
    person('nera-gwared', 'Nera Gwared', 'female', '1699', '', GWARED_HOUSE_ID)
  ],
  partnerships: [
    createMarriage('marriage-uwchor-sairwen', ...FOUNDER_IDS, {
      notes: 'Herkunft und Frühzeit des Hauses vor der Überlieferungslücke sind kaum dokumentiert.'
    }),
    createMarriage('marriage-cyrwyn-nerella', ...CYRWYN_IDS),
    createMarriage('marriage-rhydor-avelia', ...RHYDOR_IDS),
    createMarriage('marriage-dyrian-cyrena', ...DYRIAN_IDS),
    createMarriage('marriage-ellor-firwen', ...ELLOR_IDS),
    createMarriage('marriage-maelric-gwena', ...MAELRIC_IDS),
    createMarriage('marriage-thalric-helyga', ...THALRIC_IDS),
    createMarriage('marriage-firban-kyria', ...FIRBAN_IDS),
    createMarriage('marriage-janor-dynwen', ...JANOR_IDS),
    createMarriage('marriage-brenan-iwra', ...BRENAN_IDS),
    createMarriage('marriage-oenban-thalwen', ...OENBAN_IDS),
    createMarriage('marriage-neddyr-cyrin', ...NEDDYR_IDS),
    createMarriage('marriage-peran-rhewa', ...PERAN_IDS),
    createMarriage('marriage-gwaedan-perdena', ...GWAEDAN_IDS, {
      notes: 'Beide starben 1720 im Zusammenbruch nach Nodawls Schändung Rhonwen Draigs.'
    }),
    createMarriage('marriage-kyrban-sairyn', ...KYRBAN_IDS)
  ],
  parentages: [
    ...childrenOf(['cyrwyn-gwared', 'rhydor-gwared'], FOUNDER_IDS, 'marriage-uwchor-sairwen', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Mehrere Generationen zwischen dem Gründerpaar und den Brüdern sind nicht überliefert.',
      extensions: { timeJumpId: 'gap-uwchor-cyrwyn' }
    }),
    ...childrenOf(['dyrian-gwared', 'ellor-gwared'], CYRWYN_IDS, 'marriage-cyrwyn-nerella'),
    ...childrenOf(['maelric-gwared', 'thalric-gwared'], RHYDOR_IDS, 'marriage-rhydor-avelia'),
    ...childrenOf(['firban-gwared', 'janor-gwared'], DYRIAN_IDS, 'marriage-dyrian-cyrena'),
    ...childrenOf(['brenan-gwared', 'oenban-gwared'], MAELRIC_IDS, 'marriage-maelric-gwena'),
    ...childrenOf(['neddyr-gwared', 'peran-gwared'], THALRIC_IDS, 'marriage-thalric-helyga'),
    ...childrenOf(['gwaedan-gwared', 'kyrban-gwared'], FIRBAN_IDS, 'marriage-firban-kyria'),
    ...childrenOf(['sheev-gwared', 'soffi-gwared'], GWAEDAN_IDS, 'marriage-gwaedan-perdena'),
    ...childrenOf(['ellric-gwared', 'maelwen-gwared'], BRENAN_IDS, 'marriage-brenan-iwra'),
    ...childrenOf(['dyrwyn-gwared', 'nera-gwared'], NEDDYR_IDS, 'marriage-neddyr-cyrin')
  ],
  lineage: {
    founderPartnershipId: 'marriage-uwchor-sairwen',
    houseId: GWARED_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.86,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [],
  timeJumps: [
    {
      id: 'gap-uwchor-cyrwyn',
      parentPartnershipId: 'marriage-uwchor-sairwen',
      childIds: ['cyrwyn-gwared', 'rhydor-gwared'],
      years: 0,
      fromYear: '????',
      toYear: '1618',
      label: 'Mehrere Generationen der frühen Hausgeschichte sind nicht überliefert',
      notes: '',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    // Fokus auf dem Gründer statt dem heutigen Oberhaupt, damit standardmäßig
    // BEIDE Linien (die erloschene Cyrwyn-Linie und die überlebende Rhydor-Linie)
    // sichtbar sind — der Family-Chart zeigt bei einem Fokus mitten im Baum nur
    // dessen eigene Vorfahren/Nachkommen, nicht die ganze verbundene Sippe.
    focusPersonId: 'uwchor-gwared',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Struktur nach der vom User bereitgestellten Stammbaumgrafik: ein Gründerpaar vor einer Überlieferungslücke, danach zwei Brüder (1618), an denen sich das Haus in eine Illysywen-treue Linie (links, erloschen) und eine Draig-treue Linie (rechts, überlebt) spaltet. Alle Namen außer Sheev und Soffi Gwared (bereits in Haus Balchder/Chwedonol als Mündel angelegt) wurden mit dem Rheunwaith-Namensschema (Namenslisten-Modul des Aleria Almanachs) frei erfunden. Die Illysywen-treue Linie erlischt 1720 mit Gwaedan und seiner Frau im Zusammenbruch nach Nodawls Schändung Rhonwen Draigs (siehe house-illysywen-family.js); ihre Kinder Sheev und Soffi waren am Konflikt unbeteiligt und wurden als Mündel an die ehrbaren Häuser Balchder und Chwedonol gegeben. Die Kopfschaft fällt danach an die überlebende, vormals nebengeordnete Draig-treue Linie (Rhydor–Maelric–Brenan–Ellric). Haus Gwared steht seither im Banner Haus Arwydds.',
    blankFamily: false,
    sourceRevision: 1
  }
});
