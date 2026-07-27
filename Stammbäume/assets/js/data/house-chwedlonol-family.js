import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CHWEDLONOL_PORTRAITS } from './house-chwedlonol-portraits.js';

const CHWEDLONOL_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-chwedlonol.png';
const CHWEDLONOL_HOUSE_ID = 'house-chwedlonol';

// Chwedonol ist matriarchal: die Frauen (meist die älteste Tochter) erben,
// eingeheiratete Männer führen die Linie nicht fort.
const HOUSE_HEAD_IDS = new Set([
  'meredithe-chwedlonol',
  'gwenhwyfar-chwedlonol'
]);
const MAIN_LINE_IDS = new Set([
  'niniane-chwedlonol',
  'morgaine-chwedlonol',
  'eleyne-chwedlonol'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CHWEDLONOL_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_CHWEDLONOL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CHWEDLONOL_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '') {
  // Eingeheiratete Ehepartner ohne benanntes Herkunftshaus sind ohne Hausnamen überliefert.
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['meredithe-chwedlonol', 'ekmeleddin'];
const GWENHWYFAR_IDS = ['gwenhwyfar-chwedlonol', 'cynfarch'];
const RHIANNON_IDS = ['rhiannon-chwedlonol', 'efnisien'];
const NINIANE_IDS = ['niniane-chwedlonol', 'carantec'];
const MEREDITHE_JR_IDS = ['meredithe-1677-chwedlonol', 'rhodri'];
const RHONWEN_IDS = ['rhonwen-chwedlonol', 'cieran'];
const ANGHARAD_IDS = ['angharad-chwedlonol', 'drystan'];
const MORGAINE_IDS = ['morgaine-chwedlonol', 'marven-balchder'];
const GLYNDWR_IDS = ['glyndwr-chwedlonol', 'kathleen'];
const ROMNEY_JR_IDS = ['romney-1704-chwedlonol', 'emlyn-tawelgar'];
const GWYNETH_IDS = ['gwyneth-chwedlonol', 'daimeon'];
const EURIN_IDS = ['eurin-chwedlonol', 'shylene'];

export const HOUSE_CHWEDLONOL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-chwedlonol',
    title: 'Haus Chwedonol',
    motto: 'Pflicht kennt keine Flaute.',
    description: 'Die belegte Linie des matriarchal geführten Ritterherrenhauses Chwedonol unter Haus Saethwyr: von der Gründerin Meredithe bis zur Generation von 1730.',
    emblem: CHWEDLONOL_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.chwedlonol
  },
  houses: [
    { id: CHWEDLONOL_HOUSE_ID, name: 'Haus Chwedonol', motto: 'Pflicht kennt keine Flaute.', emblem: CHWEDLONOL_EMBLEM, status: 'active' },
    house('house-rhyddid', 'Haus Rhyddid', 'assets/images/houses/Llamreis Ankunft/haus-rhyddid.png'),
    house('house-balchder', 'Haus Balchder', 'assets/images/houses/Llamreis Ankunft/haus-balchder.png'),
    house('house-gwared', 'Haus Gwared', 'assets/images/houses/Rhonwens Tränen/Ritterliche/Gwared.png'),
    house('house-tawelgar', 'Haus Tawelgar', 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Tawelgar.png')
  ],
  persons: [
    // Gründerin und ihr Ehemann
    person('meredithe-chwedlonol', 'Meredithe Chwedonol', 'female', '????', '????', CHWEDLONOL_HOUSE_ID, {
      title: 'Begründerin des Ritterherrenhauses Chwedonol',
      notes: 'Diente als Gefährtin des Seefahrers Sir Kynwrig Draig, Begründer des Hauses Saethwyr, und wurde von ihm zur Ritterin geschlagen.'
    }),
    spouse('ekmeleddin', 'Ekmeleddin', 'male', '????', '????'),

    // Nach der Überlieferungslücke: drei Geschwister
    person('gwenhwyfar-chwedlonol', 'Gwenhwyfar Chwedonol', 'female', '1652', '', CHWEDLONOL_HOUSE_ID, {
      title: 'Ritterherrin des Hauses Chwedonol'
    }),
    spouse('cynfarch', 'Cynfarch', 'male', '1650', '1720'),
    person('arianwen-chwedlonol', 'Arianwen Chwedonol', 'female', '1654', '1725', CHWEDLONOL_HOUSE_ID),
    person('kerwin-rhyddid', 'Kerwin Rhyddid', 'male', '1651', '1735', 'house-rhyddid', {
      familyRole: 'married',
      title: 'Ritterherr des Hauses Rhyddid'
    }),
    person('rhiannon-chwedlonol', 'Rhiannon Chwedonol', 'female', '1660', '1737', CHWEDLONOL_HOUSE_ID),
    spouse('efnisien', 'Efnisien', 'male', '1658', '1730'),

    // Kinder von Gwenhwyfar und Cynfarch
    person('niniane-chwedlonol', 'Niniane Chwedonol', 'female', '1674', ''),
    person('meredithe-1677-chwedlonol', 'Meredithe Chwedonol', 'female', '1677', ''),
    person('rhonwen-chwedlonol', 'Rhonwen Chwedonol', 'female', '1681', '', CHWEDLONOL_HOUSE_ID, {
      title: 'Kommandantin des Großteils der Truppen',
      notes: 'Auch als „Romney“ überliefert.'
    }),
    spouse('carantec', 'Carantec', 'male', '1672', ''),
    spouse('rhodri', 'Rhodri', 'male', '1680', '1699'),
    spouse('cieran', 'Cieran', 'male', '1678', ''),

    // Kind von Rhiannon und Efnisien
    person('angharad-chwedlonol', 'Angharad Chwedonol', 'female', '1680', ''),
    spouse('drystan', 'Drystan', 'male', '1679', '', ),

    // Kinder von Niniane und Carantec
    person('morgaine-chwedlonol', 'Morgaine Chwedonol', 'female', '1695', '', CHWEDLONOL_HOUSE_ID, {
      title: 'Lehenswartin von Glastraeth'
    }),
    person('glyndwr-chwedlonol', 'Glyndwr Chwedonol', 'male', '1702', ''),
    person('marven-balchder', 'Marven Balchder', 'male', '1698', '', 'house-balchder', { familyRole: 'married' }),
    spouse('kathleen', 'Kathleen', 'female', '1706', ''),

    // Kind von Rhonwen und Cieran
    person('romney-1704-chwedlonol', 'Romney Chwedonol', 'female', '1704', ''),
    person('emlyn-tawelgar', 'Emlyn Tawelgar', 'male', '1707', '', 'house-tawelgar', {
      familyRole: 'married',
      notes: 'Eingeheirateter Tawelgar; seine Ehe mit Romney und ihre Kinder werden als matriarchale Chwedonol-Linie geführt.',
      extensions: {
        registryManagedFields: ['worldPersonId', 'birth', 'portrait', 'houseId', 'notes']
      }
    }),

    // Kinder von Angharad und Drystan
    person('gwyneth-chwedlonol', 'Gwyneth Chwedonol', 'female', '????', ''),
    person('eurin-chwedlonol', 'Eurin Chwedonol', 'male', '????', ''),
    spouse('daimeon', 'Daimeon', 'male', '????', ''),
    spouse('shylene', 'Shylene', 'female', '????', ''),

    // Kinder von Morgaine und Marven; Morgaines Mündel
    person('cederic-chwedlonol', 'Cederic Chwedonol', 'male', '1717', '', CHWEDLONOL_HOUSE_ID, {
      notes: 'Dient als Vertrauter auf dem Schiff Idwal Draigs, des Grafensohnes.'
    }),
    person('eleyne-chwedlonol', 'Eleyne Chwedonol', 'female', '1720', ''),
    person('soffi-gwared', 'Soffi Gwared', 'female', '1720', '', 'house-gwared', {
      familyRole: 'ward',
      notes: 'Aufgenommenes Mündel Morgaines, gemeinsam mit Eleyne aufgewachsen. Waise des 1720 erloschenen Zweigs des Hauses Gwared.'
    }),

    // Kind von Glyndwr und Kathleen
    person('caralyn-chwedlonol', 'Caralyn Chwedonol', 'female', '1722', ''),

    // Kinder von Romney (1704) und Emlyn Tawelgar
    person('kyndra-chwedlonol', 'Kyndra Chwedonol', 'female', '1723', ''),
    person('rhondia-chwedlonol', 'Rhondia Chwedonol', 'female', '1726', ''),

    // Kinder von Gwyneth und Daimeon
    person('meriel-chwedlonol', 'Meriel Chwedonol', 'female', '1724', ''),
    person('maxen-chwedlonol', 'Maxen Chwedonol', 'male', '1727', ''),

    // Kind von Eurin und Shylene
    person('hyrs-chwedlonol', 'Hyrs Chwedonol', 'male', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-meredithe-ekmeleddin', ...FOUNDER_IDS, {
      notes: 'Meredithes Herkunft und Verbindung zu Ekmeleddin sind vor der Überlieferungslücke kaum dokumentiert.'
    }),
    createMarriage('marriage-gwenhwyfar-cynfarch', ...GWENHWYFAR_IDS),
    createMarriage('marriage-arianwen-kerwin', 'arianwen-chwedlonol', 'kerwin-rhyddid'),
    createMarriage('marriage-rhiannon-efnisien', ...RHIANNON_IDS),
    createMarriage('marriage-niniane-carantec', ...NINIANE_IDS),
    createMarriage('marriage-meredithejr-rhodri', ...MEREDITHE_JR_IDS, {
      notes: 'Rhodri ertrank 1699 vor der Küste; Meredithe überlebte und heiratete nie erneut.'
    }),
    createMarriage('marriage-rhonwen-cieran', ...RHONWEN_IDS),
    createMarriage('marriage-angharad-drystan', ...ANGHARAD_IDS),
    createMarriage('marriage-morgaine-marven', ...MORGAINE_IDS),
    createMarriage('marriage-glyndwr-kathleen', ...GLYNDWR_IDS),
    createMarriage('marriage-romneyjr-emlyn', ...ROMNEY_JR_IDS),
    createMarriage('marriage-gwyneth-daimeon', ...GWYNETH_IDS),
    createMarriage('marriage-eurin-shylene', ...EURIN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['gwenhwyfar-chwedlonol', 'arianwen-chwedlonol', 'rhiannon-chwedlonol'],
      FOUNDER_IDS,
      'marriage-meredithe-ekmeleddin',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(
      ['niniane-chwedlonol', 'meredithe-1677-chwedlonol', 'rhonwen-chwedlonol'],
      GWENHWYFAR_IDS,
      'marriage-gwenhwyfar-cynfarch'
    ),
    ...childrenOf(['angharad-chwedlonol'], RHIANNON_IDS, 'marriage-rhiannon-efnisien'),
    ...childrenOf(['morgaine-chwedlonol', 'glyndwr-chwedlonol'], NINIANE_IDS, 'marriage-niniane-carantec'),
    ...childrenOf(['romney-1704-chwedlonol'], RHONWEN_IDS, 'marriage-rhonwen-cieran'),
    ...childrenOf(['gwyneth-chwedlonol', 'eurin-chwedlonol'], ANGHARAD_IDS, 'marriage-angharad-drystan'),
    ...childrenOf(['cederic-chwedlonol', 'eleyne-chwedlonol'], MORGAINE_IDS, 'marriage-morgaine-marven'),
    ...childrenOf(['soffi-gwared'], MORGAINE_IDS, 'marriage-morgaine-marven', {
      type: 'foster', legitimacy: 'unknown', notes: 'Soffi Gwared ist ein aufgenommenes Mündel und keine leibliche Tochter.'
    }),
    ...childrenOf(['caralyn-chwedlonol'], GLYNDWR_IDS, 'marriage-glyndwr-kathleen'),
    ...childrenOf(['kyndra-chwedlonol', 'rhondia-chwedlonol'], ROMNEY_JR_IDS, 'marriage-romneyjr-emlyn'),
    ...childrenOf(['meriel-chwedlonol', 'maxen-chwedlonol'], GWYNETH_IDS, 'marriage-gwyneth-daimeon'),
    ...childrenOf(['hyrs-chwedlonol'], EURIN_IDS, 'marriage-eurin-shylene')
  ],
  lineage: {
    founderPartnershipId: 'marriage-meredithe-ekmeleddin',
    houseId: CHWEDLONOL_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1652',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-rhyddid-arianwen',
      name: 'Haus Rhyddid',
      parentPartnershipId: 'marriage-arianwen-kerwin',
      houseId: 'house-rhyddid',
      targetFamilyId: 'haus-rhyddid',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-rhyddid.png',
      crestFrame: 'silver',
      notes: 'Arianwen wurde an das Ritterherrenhaus Rhyddid wegverheiratet; ihr Sohn Taran führt dort die Linie fort.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'meredithe-chwedlonol',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Chwedonol-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Als matriarchales Haus vererben die Frauen die Führung (Erbfolge Meredithe–Gwenhwyfar–Niniane–Morgaine–Eleyne); Arianwen wurde an Haus Rhyddid wegverheiratet und teilt sich dort mit Kerwin Rhyddid. Soffi Gwared ist Morgaines aufgenommenes Mündel. Die neuere Tawelgar-Gegenakte belegt Emlyns Geburtsjahr 1707, seine Herkunft aus Haus Tawelgar und sein individuelles Portrait; Weltperson und Ehe-ID bleiben in beiden Familienakten identisch. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Chwedonol den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherrin.',
    blankFamily: false,
    sourceRevision: 3
  }
});
