import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AELDRUNMAR_HOUSE_PROFILES } from './aeldrunmar-house-profiles.js';
import { HOUSE_SCANDYN_PORTRAITS } from './house-scandyn-portraits.js';

const SCANDYN_HOUSE_ID = 'house-scandyn';
const SCANDYN_EMBLEM = 'assets/images/houses/Aeldrunmar/haus-scandyn.png';

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
    houseId: options.houseId === undefined ? SCANDYN_HOUSE_ID : options.houseId,
    portrait: HOUSE_SCANDYN_PORTRAITS[id] || '',
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
  founders: ['unknown-founder-scandyn', 'unknown-founder-wife-scandyn'],
  grandparents: ['ealdwine-scandyn', 'aelfwyn-ealdwine-spouse'],
  osric: ['osric-scandyn', 'wynburh-osric-spouse'],
  beornwulf: ['beornwulf-scandyn', 'cyneburh-beornwulf-spouse'],
  eadric: ['eadric-scandyn', 'mairwen-scandyn-spouse'],
  theodric: ['theodric-scandyn', 'ealhswith-theodric-spouse'],
  eadgyth: ['eadgyth-scandyn', 'unknown-eadgyth-spouse'],
  wulfric: ['wulfric-scandyn', 'frideswide-wulfric-spouse'],
  edwin: ['edwin-scandyn', 'elfswith-edwin-spouse'],
  hild: ['hild-scandyn', 'unknown-hild-spouse'],
  godric: ['godric-scandyn', 'mildrith-godric-spouse'],
  alden: ['alden-scandyn', 'wynflaed-alden-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-unknown-founders-scandyn': COUPLES.founders,
  'marriage-ealdwine-aelfwyn-scandyn': COUPLES.grandparents,
  'marriage-osric-wynburh-scandyn': COUPLES.osric,
  'marriage-beornwulf-cyneburh-scandyn': COUPLES.beornwulf,
  'marriage-eadric-mairwen-scandyn': COUPLES.eadric,
  'marriage-theodric-ealhswith-scandyn': COUPLES.theodric,
  'marriage-wulfric-frideswide-scandyn': COUPLES.wulfric,
  'marriage-edwin-elfswith-scandyn': COUPLES.edwin,
  'marriage-godric-mildrith-scandyn': COUPLES.godric,
  'marriage-alden-wynflaed-scandyn': COUPLES.alden
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'scandyn-parentage', ...options }
  );
}

export const HOUSE_SCANDYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-scandyn',
    title: 'Haus Scandyn',
    motto: 'Der Wind ist unser Gefährte.',
    description: 'Niederes Rittergeschlecht der Insel Scandmere in Aeldrunmar. Als Særinc verbinden die Scandyn ritterliche Pflichten mit Seefahrt, Schiffsbau und Küstenschutz im Dienst des Hauses Tharn. Cenric stammt aus dem dritten und für die Hausnachfolge entbehrlichen Zweig der Familie.',
    emblem: SCANDYN_EMBLEM,
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.scandyn
  },
  houses: [
    {
      id: SCANDYN_HOUSE_ID,
      name: 'Haus Scandyn',
      motto: 'Der Wind ist unser Gefährte.',
      emblem: SCANDYN_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('unknown-founder-scandyn', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Hauses Scandyn',
      lineageRole: 'head',
      notes: 'Name, Lebensdaten und Gründungsjahr der frühen Scandyn-Linie sind nicht überliefert.'
    }),
    spouse('unknown-founder-wife-scandyn', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Hauses Scandyn'
    }),

    person('ealdwine-scandyn', 'Ealdwine Scandyn', 'male', '1643', '1711', {
      title: 'Thain von Scandmere bis 1711',
      lineageRole: 'head',
      notes: 'Ealdwine ist Cenrics Großvater und der erste namentlich ausgestaltete Scandyn nach der Überlieferungslücke.'
    }),
    spouse('aelfwyn-ealdwine-spouse', 'Ælfwyn', 'female', '1649', '1718', {
      title: 'Gemahlin Ealdwines'
    }),

    person('osric-scandyn', 'Osric Scandyn', 'male', '1668', '1729', {
      title: 'Thain von Scandmere bis 1729',
      lineageRole: 'head',
      tags: ['Erste Linie', 'Hauptlinie']
    }),
    spouse('wynburh-osric-spouse', 'Wynburh', 'female', '1674', '1734', {
      title: 'Gemahlin Osrics'
    }),
    person('beornwulf-scandyn', 'Beornwulf Scandyn', 'male', '1672', '', {
      title: 'Særinc · Befehlshaber der nördlichen Küstenwacht',
      tags: ['Zweite Linie']
    }),
    spouse('cyneburh-beornwulf-spouse', 'Cyneburh', 'female', '1678', '', {
      title: 'Gemahlin Beornwulfs'
    }),
    person('eadric-scandyn', 'Eadric Scandyn', 'male', '1676', '', {
      title: 'Særinc · Verwalter einer kleinen Hafenwacht',
      tags: ['Dritte Linie', 'Entbehrlicher Zweig'],
      notes: 'Eadric ist Cenrics Vater. Sein jüngster Zweig besitzt weder die Hauptburg noch einen nahen Anspruch auf die Hausführung.'
    }),
    spouse('mairwen-scandyn-spouse', 'Mairwen Scandyn', 'female', '1682', '', {
      title: 'Gemahlin Eadrics · Mutter Cenrics'
    }),

    person('theodric-scandyn', 'Theodric Scandyn', 'male', '1696', '', {
      title: 'Thain von Scandmere · Oberhaupt des Hauses',
      lineageRole: 'head',
      notes: 'Theodric führt seit 1729 die Hauptlinie und hält Hafenburg und Hausnachfolge.'
    }),
    spouse('ealhswith-theodric-spouse', 'Ealhswith', 'female', '1701', '', {
      title: 'Gemahlin Theodrics'
    }),
    person('eadgyth-scandyn', 'Eadgyth Scandyn', 'female', '1699', '', {
      title: 'Wegverheiratete Tochter Osrics',
      tags: ['Wegverheiratet']
    }),
    spouse('unknown-eadgyth-spouse', '???', 'male', '1697', '', {
      title: 'Gemahl Eadgyths · Haus unbekannt'
    }),
    person('wulfric-scandyn', 'Wulfric Scandyn', 'male', '1703', '', {
      title: 'Særinc · Hauptmann der Hafenmauer'
    }),
    spouse('frideswide-wulfric-spouse', 'Frideswide', 'female', '1706', '', {
      title: 'Gemahlin Wulfrics'
    }),

    person('edwin-scandyn', 'Edwin Scandyn', 'male', '1698', '', {
      title: 'Særinc · Kapitän eines Küstenseglers'
    }),
    spouse('elfswith-edwin-spouse', 'Elfswith', 'female', '1703', '', {
      title: 'Gemahlin Edwins'
    }),
    person('hild-scandyn', 'Hild Scandyn', 'female', '1702', '', {
      title: 'Wegverheiratete Tochter Beornwulfs',
      tags: ['Wegverheiratet']
    }),
    spouse('unknown-hild-spouse', '???', 'male', '1699', '', {
      title: 'Gemahl Hilds · Haus unbekannt'
    }),
    person('godric-scandyn', 'Godric Scandyn', 'male', '1706', '', {
      title: 'Schiffsbauer und Küstenritter'
    }),
    spouse('mildrith-godric-spouse', 'Mildrith', 'female', '1707', '', {
      title: 'Gemahlin Godrics'
    }),

    person('alden-scandyn', 'Alden Scandyn', 'male', '1709', '', {
      title: 'Älterer Sohn Eadrics · Bewahrer des kleinen Seitenzweigs',
      tags: ['Älterer Bruder Cenrics'],
      notes: 'Alden verbleibt auf Scandmere und hält Eadrics kleinen Zweig zusammen. Selbst über ihn bleibt die Linie weit von der Hausnachfolge entfernt.'
    }),
    spouse('wynflaed-alden-spouse', 'Wynflæd', 'female', '1710', '', {
      title: 'Gemahlin Aldens'
    }),
    person('cenric-scandyn', 'Cenric Scandyn', 'male', '1717', '', {
      title: 'Særinc · fahrender Ritter zur See',
      tags: ['Særinc', 'Ritter zur See', 'Entbehrlicher Zweig', 'Im Dienst des Hauses Draig'],
      notes: 'Cenric ist im Jahr 1740 dreiundzwanzig Jahre alt. Als zweiter Sohn eines ohnehin nachrangigen Seitenzweigs besitzt er keinen nennenswerten Anspruch auf Scandmere. Er verließ Aeldrunmar freiwillig, um sich in Cenyr als fahrender Ritter zu beweisen und Haus Draig seinen Dienst anzubieten.'
    }),
    person('aelfgifu-scandyn', 'Ælfgifu Scandyn', 'female', '1712', '', {
      title: 'Unverheiratete jüngste Tochter Eadrics'
    }),

    person('leofric-scandyn', 'Leofric Scandyn', 'male', '1722', '', {
      title: 'Ältester Sohn Theodrics · vorgesehener Erbe',
      lineageRole: 'mainline'
    }),
    person('eadmund-scandyn', 'Eadmund Scandyn', 'male', '1726'),
    person('aelfrun-scandyn', 'Ælfrun Scandyn', 'female', '1730'),
    person('sigebert-scandyn', 'Sigebert Scandyn', 'male', '1727', '', {
      title: 'Ältester Sohn Wulfrics'
    }),
    person('wulfhild-scandyn', 'Wulfhild Scandyn', 'female', '1731'),
    person('hereward-scandyn', 'Hereward Scandyn', 'male', '1723', '', {
      title: 'Ältester Sohn Edwins'
    }),
    person('wigred-scandyn', 'Wigred Scandyn', 'male', '1728'),
    person('oswin-scandyn', 'Oswin Scandyn', 'male', '1729', '', {
      title: 'Ältester Sohn Godrics'
    }),
    person('eadburh-scandyn', 'Eadburh Scandyn', 'female', '1733'),
    person('cuthred-scandyn', 'Cuthred Scandyn', 'male', '1732', '', {
      title: 'Ältester Sohn Aldens'
    }),
    person('goldwyn-scandyn', 'Goldwyn Scandyn', 'female', '1735')
  ],
  partnerships: [
    createMarriage('marriage-unknown-founders-scandyn', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-ealdwine-aelfwyn-scandyn', ...COUPLES.grandparents, {
      status: 'ended',
      end: '1711'
    }),
    createMarriage('marriage-osric-wynburh-scandyn', ...COUPLES.osric, {
      status: 'ended',
      start: '1693',
      end: '1729'
    }),
    createMarriage('marriage-beornwulf-cyneburh-scandyn', ...COUPLES.beornwulf, { start: '1696' }),
    createMarriage('marriage-eadric-mairwen-scandyn', ...COUPLES.eadric, { start: '1706' }),
    createMarriage('marriage-theodric-ealhswith-scandyn', ...COUPLES.theodric, { start: '1720' }),
    createMarriage('marriage-eadgyth-unknown-scandyn', ...COUPLES.eadgyth, { start: '1719' }),
    createMarriage('marriage-wulfric-frideswide-scandyn', ...COUPLES.wulfric, { start: '1725' }),
    createMarriage('marriage-edwin-elfswith-scandyn', ...COUPLES.edwin, { start: '1721' }),
    createMarriage('marriage-hild-unknown-scandyn', ...COUPLES.hild, { start: '1722' }),
    createMarriage('marriage-godric-mildrith-scandyn', ...COUPLES.godric, { start: '1727' }),
    createMarriage('marriage-alden-wynflaed-scandyn', ...COUPLES.alden, { start: '1730' })
  ],
  parentages: [
    ...childrenOf(['ealdwine-scandyn'], 'marriage-unknown-founders-scandyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Ealdwine steht für die erste namentlich ausgestaltete Generation nach einer unbekannten Zahl nicht überlieferter Vorfahren.',
      extensions: { timeJumpId: 'gap-founders-ealdwine-scandyn' }
    }),
    ...childrenOf(
      ['osric-scandyn', 'beornwulf-scandyn', 'eadric-scandyn'],
      'marriage-ealdwine-aelfwyn-scandyn'
    ),
    ...childrenOf(
      ['theodric-scandyn', 'eadgyth-scandyn', 'wulfric-scandyn'],
      'marriage-osric-wynburh-scandyn'
    ),
    ...childrenOf(
      ['edwin-scandyn', 'hild-scandyn', 'godric-scandyn'],
      'marriage-beornwulf-cyneburh-scandyn'
    ),
    ...childrenOf(
      ['alden-scandyn', 'aelfgifu-scandyn', 'cenric-scandyn'],
      'marriage-eadric-mairwen-scandyn'
    ),
    ...childrenOf(
      ['leofric-scandyn', 'eadmund-scandyn', 'aelfrun-scandyn'],
      'marriage-theodric-ealhswith-scandyn'
    ),
    ...childrenOf(['sigebert-scandyn', 'wulfhild-scandyn'], 'marriage-wulfric-frideswide-scandyn'),
    ...childrenOf(['hereward-scandyn', 'wigred-scandyn'], 'marriage-edwin-elfswith-scandyn'),
    ...childrenOf(['oswin-scandyn', 'eadburh-scandyn'], 'marriage-godric-mildrith-scandyn'),
    ...childrenOf(['cuthred-scandyn', 'goldwyn-scandyn'], 'marriage-alden-wynflaed-scandyn')
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-eadgyth-scandyn',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-eadgyth-unknown-scandyn',
      houseId: 'house-unbekannt-eadgyth-scandyn',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Eadgyth Scandyn führt nach ihrer Ehe keine Scandyn-Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-hild-scandyn',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-hild-unknown-scandyn',
      houseId: 'house-unbekannt-hild-scandyn',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Hild Scandyn führt nach ihrer Ehe keine Scandyn-Linie fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-ealdwine-scandyn',
      parentPartnershipId: 'marriage-unknown-founders-scandyn',
      parentPersonId: '',
      childIds: ['ealdwine-scandyn'],
      years: 0,
      fromYear: '????',
      toYear: '1643',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Einziger absoluter Generationentrenner zwischen dem Scandyn-Hauswappen und Cenrics Großvater Ealdwine.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-scandyn',
    houseId: SCANDYN_HOUSE_ID,
    crestSubtitle: 'Niederes Rittergeschlecht von Scandmere',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ealdwine-scandyn',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Modulvorlagen/cenric-scandyn.json',
    sourceNote: 'Cenrics Name, Geburtsjahr 1717, Alter 23 im Jahr 1740, Rang als Særinc und Ritter zur See, Vater Eadric, Mutter Mairwen, älterer Bruder Alden, Herkunft aus Aeldrunmar sowie sein freiwilliger Weg nach Cenyr folgen der Modulvorlage. Die ausdrückliche Benutzervorgabe ordnet Eadrics Familie als dritten, für die Hausnachfolge entbehrlichen Zweig ein; die Hauptlinie wird deshalb über Osric und Theodric geführt. Auf unbekannte Gründer und das silbern gerahmte Scandyn-Wappen folgt genau ein serieller Zeitsprung zu Cenrics Großvater Ealdwine. Dessen Söhne Osric, Beornwulf und Eadric bilden drei klar getrennte Linien. Die ergänzten Namen sind angelsächsisch und rohirimisch geprägt; die dem Hochadel vorbehaltenen Präfixe Ceol- und Aeth-/Æth- werden für die Scandyn nicht verwendet. Es gibt keine Affären oder Bastarde; alle lebenden Personen unter 29 bleiben unverheiratet, während sämtliche lebenden Scandyn ab dreißig eine Ehe besitzen.',
    registryManagedExtensionFields: ['sourceNote', 'threeLines', 'expendableBranch'],
    threeLines: [
      {
        kind: 'mainline',
        anchorPersonId: 'osric-scandyn',
        currentPersonIds: ['theodric-scandyn', 'eadgyth-scandyn', 'wulfric-scandyn'],
        descendantPersonIds: [
          'leofric-scandyn',
          'eadmund-scandyn',
          'aelfrun-scandyn',
          'sigebert-scandyn',
          'wulfhild-scandyn'
        ]
      },
      {
        kind: 'secondary',
        anchorPersonId: 'beornwulf-scandyn',
        currentPersonIds: ['edwin-scandyn', 'hild-scandyn', 'godric-scandyn'],
        descendantPersonIds: [
          'hereward-scandyn',
          'wigred-scandyn',
          'oswin-scandyn',
          'eadburh-scandyn'
        ]
      },
      {
        kind: 'expendable',
        anchorPersonId: 'eadric-scandyn',
        currentPersonIds: ['alden-scandyn', 'aelfgifu-scandyn', 'cenric-scandyn'],
        descendantPersonIds: ['cuthred-scandyn', 'goldwyn-scandyn']
      }
    ],
    expendableBranch: {
      anchorPersonId: 'eadric-scandyn',
      branchKeeperPersonId: 'alden-scandyn',
      freeKnightPersonId: 'cenric-scandyn',
      successionDistance: 'Kein naher Anspruch auf Hausführung oder Hafenburg',
      reason: 'Cenric ist der zweite Sohn des jüngsten Großvaterzweigs; Alden bewahrt diesen Seitenzweig, während die Hausnachfolge über Osric, Theodric und Leofric verläuft.'
    }
  }
});
