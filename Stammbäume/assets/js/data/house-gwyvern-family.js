import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  arwydd: 'assets/images/houses/haus-arwydd.png',
  draig: 'assets/images/houses/haus-draig.png',
  gafyr: 'assets/images/houses/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/haus-gwyvern.png',
  saethwyr: 'assets/images/houses/haus-saethwyr.png',
  wyrm: 'assets/images/houses/haus-wyrm.png'
});

const GWYVERN_HOUSE_ID = 'house-gwyvern';
const HOUSE_HEAD_IDS = new Set([
  'bleddyn-draig',
  'gwrddnei-gwyvern',
  'dyvynwal-gwyvern',
  'seithved-gwyvern',
  'maredudd-gwyvern',
  'mervyn-gwyvern'
]);
const MAIN_LINE_IDS = new Set(['trevor-gwyvern', 'huw-gwyvern']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GWYVERN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GWYVERN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GWYVERN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem
  });
}

const FOUNDER_IDS = ['bleddyn-draig', 'owena-saethwyr'];
const GWRDDNEI_IDS = ['gwrddnei-gwyvern', 'igraine-gafyr'];
const DYVYNWAL_IDS = ['dyvynwal-gwyvern', 'venora-saethwyr'];
const SEITHVED_IDS = ['seithved-gwyvern', 'enola-dyngwn'];
const KIMBALL_IDS = ['kimball-gwyvern', 'dajenne-illyswen'];
const MAREDUDD_IDS = ['maredudd-gwyvern', 'olwen-wyrm'];
const AETHLEM_IDS = ['aethlem-gwyvern', 'beatha-airt'];
const MERVYN_IDS = ['mervyn-gwyvern', 'jeannae-aderyn'];
const GWYNNAN_IDS = ['gwynnan-gwyvern', 'izobel-arwydd'];

export const HOUSE_GWYVERN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwyvern',
    title: 'Haus Gwyvern',
    motto: '',
    description: 'Die belegte Linie des Baronenhauses Gwyvern von Bleddyn Draig und Owena Saethwyr bis zur Generation von 1725.',
    emblem: HOUSE_EMBLEMS.gwyvern,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gwyvern
  },
  houses: [
    house(GWYVERN_HOUSE_ID, 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-airgid', 'Haus Airgid'),
    house('house-taranvyr', 'Haus Taranvyr'),
    house('house-illyswen', 'Haus Illyswen'),
    house('house-arth', 'Haus Arth'),
    house('house-airt', 'Haus Airt'),
    house('house-hebog', 'Haus Hebog'),
    house('house-aderyn', 'Haus Aderyn'),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd),
    house('house-creyr', 'Haus Créyr')
  ],
  persons: [
    // Gründerpaar
    person('bleddyn-draig', 'Bleddyn Draig', 'male', '1582', '1653', 'house-draig', {
      familyRole: 'core',
      title: 'Begründer des Baronenhauses Gwyvern'
    }),
    person('owena-saethwyr', 'Owena Saethwyr', 'female', '1583', '1683', 'house-saethwyr'),

    // Kinder von Bleddyn und Owena
    person('gwrddnei-gwyvern', 'Gwrddnei', 'male', '1600', '1667'),
    person('endellion-gwyvern', 'Endellion', 'female', '1602', '1671'),
    person('igraine-gafyr', 'Igraine Gafyr', 'female', '1598', '1672', 'house-gafyr'),
    person('grippiud-marwolaeth', 'Grippiud Marwolaeth', 'male', '1598', '1672', 'house-marwolaeth'),

    // Kinder von Gwrddnei und Igraine
    person('dyvynwal-gwyvern', 'Dyvynwal', 'male', '1628', '1673'),
    person('angharad-gwyvern', 'Angharad', 'female', '1635', '1709'),
    person('venora-saethwyr', 'Venora Saethwyr', 'female', '1632', '1700', 'house-saethwyr'),
    person('cynwrig-wyrm', 'Cynwrig Wyrm', 'male', '1630', '1701', 'house-wyrm'),

    // Kinder von Dyvynwal und Venora
    person('seithved-gwyvern', 'Seithved', 'male', '1649', '1714'),
    person('gwyneira-gwyvern', 'Gwyneira', 'female', '1653', '1700'),
    person('talaith-gwyvern', 'Talaith', 'female', '1652', '1735'),
    person('kimball-gwyvern', 'Kimball', 'male', '1652', '1715'),
    person('enola-dyngwn', 'Enola Dyngwn', 'female', '1650', '1711', 'house-dyngwn'),
    person('conall-airgid', 'Conall Airgid', 'male', '1650', '1712', 'house-airgid'),
    person('kenyon-taranvyr', 'Kenyon Taranvyr', 'male', '1650', '????', 'house-taranvyr'),
    person('dajenne-illyswen', 'Dajenne Illyswen', 'female', '1654', '1699', 'house-illyswen'),

    // Kinder von Seithved und Enola
    person('maredudd-gwyvern', 'Maredudd', 'male', '1671', '1720'),
    person('heledd-gwyvern', 'Heledd', 'female', '1670', ''),
    person('delyth-gwyvern', 'Delyth', 'female', '1675', '1705'),
    person('olwen-wyrm', 'Olwen Wyrm', 'female', '1675', '', 'house-wyrm'),
    person('meurig-draig', 'Meurig Draig', 'male', '1668', '', 'house-draig'),
    person('afal-arth', 'Afal Arth', 'male', '1675', '????', 'house-arth'),

    // Kinder von Kimball und Dajenne
    person('aethlem-gwyvern', 'Aethlem', 'male', '1670', ''),
    person('liliwen-gwyvern', 'Liliwen', 'female', '1676', ''),
    person('morwenna-gwyvern', 'Morwenna', 'female', '1672', ''),
    person('beatha-airt', 'Beatha Airt', 'female', '1674', '', 'house-airt'),
    person('griffith-hebog', 'Griffith Hebog', 'male', '1677', '', 'house-hebog'),
    person('huw-saethwyr', 'Huw Saethwyr', 'male', '1666', '', 'house-saethwyr'),

    // Kinder von Maredudd und Olwen
    person('mervyn-gwyvern', 'Mervyn', 'male', '1696', ''),
    person('alys-gwyvern', 'Alys', 'female', '1699', ''),
    person('jeannae-aderyn', 'Jeannae Aderyn', 'female', '1702', '', 'house-aderyn'),
    person('thomos-gwefrydd', 'Thomos Gwefrydd', 'male', '1698', '', 'house-gwefrydd'),

    // Kinder von Aethlem und Beatha
    person('gwynnan-gwyvern', 'Gwynnan', 'male', '1696', '', GWYVERN_HOUSE_ID, {
      worldPersonId: 'person--haus-arwydd--gwynnan-gwywern'
    }),
    person('genofeva-gwyvern', 'Genofeva', 'female', '1700', ''),
    person('izobel-arwydd', 'Izobel Arwydd', 'female', '1703', '', 'house-arwydd'),
    person('madoc-creyr', 'Madoc Créyr', 'male', '1695', '', 'house-creyr'),

    // Jüngste Generation
    person('trevor-gwyvern', 'Trevor', 'male', '1719', ''),
    person('tegwen-gwyvern', 'Tegwen', 'female', '1720', ''),
    person('huw-gwyvern', 'Huw', 'male', '1722', ''),
    person('gwenfrewi-gwyvern', 'Gwenfrewi', 'female', '1725', ''),
    person('brizio-gwyvern', 'Brizio', 'male', '1722', ''),
    person('bryn-gwyvern', 'Bryn', 'male', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-bleddyn-owena', ...FOUNDER_IDS),
    createMarriage('marriage-gwrddnei-igraine', ...GWRDDNEI_IDS),
    createMarriage('marriage-endellion-grippiud', 'endellion-gwyvern', 'grippiud-marwolaeth'),
    createMarriage('marriage-dyvynwal-venora', ...DYVYNWAL_IDS),
    createMarriage('marriage-angharad-cynwrig', 'angharad-gwyvern', 'cynwrig-wyrm'),
    createMarriage('marriage-seithved-enola', ...SEITHVED_IDS),
    createMarriage('marriage-gwyneira-conall', 'gwyneira-gwyvern', 'conall-airgid'),
    createMarriage('marriage-talaith-kenyon', 'talaith-gwyvern', 'kenyon-taranvyr'),
    createMarriage('marriage-kimball-dajenne', ...KIMBALL_IDS),
    createMarriage('marriage-maredudd-olwen', ...MAREDUDD_IDS),
    createMarriage('marriage-heledd-meurig', 'heledd-gwyvern', 'meurig-draig'),
    createMarriage('marriage-delyth-afal', 'delyth-gwyvern', 'afal-arth'),
    createMarriage('marriage-aethlem-beatha', ...AETHLEM_IDS),
    createMarriage('marriage-liliwen-griffith', 'liliwen-gwyvern', 'griffith-hebog'),
    createMarriage('marriage-morwenna-huw', 'morwenna-gwyvern', 'huw-saethwyr'),
    createMarriage('marriage-mervyn-jeannae', ...MERVYN_IDS),
    createMarriage('marriage-alys-thomos', 'alys-gwyvern', 'thomos-gwefrydd'),
    createMarriage('marriage-gwynnan-izobel', ...GWYNNAN_IDS),
    createMarriage('marriage-genofeva-madoc', 'genofeva-gwyvern', 'madoc-creyr')
  ],
  parentages: [
    ...childrenOf(['gwrddnei-gwyvern', 'endellion-gwyvern'], FOUNDER_IDS, 'marriage-bleddyn-owena'),
    ...childrenOf(['dyvynwal-gwyvern', 'angharad-gwyvern'], GWRDDNEI_IDS, 'marriage-gwrddnei-igraine'),
    ...childrenOf(
      ['seithved-gwyvern', 'gwyneira-gwyvern', 'talaith-gwyvern', 'kimball-gwyvern'],
      DYVYNWAL_IDS,
      'marriage-dyvynwal-venora'
    ),
    ...childrenOf(['maredudd-gwyvern', 'heledd-gwyvern', 'delyth-gwyvern'], SEITHVED_IDS, 'marriage-seithved-enola'),
    ...childrenOf(['aethlem-gwyvern', 'liliwen-gwyvern', 'morwenna-gwyvern'], KIMBALL_IDS, 'marriage-kimball-dajenne'),
    ...childrenOf(['mervyn-gwyvern', 'alys-gwyvern'], MAREDUDD_IDS, 'marriage-maredudd-olwen'),
    ...childrenOf(['gwynnan-gwyvern', 'genofeva-gwyvern'], AETHLEM_IDS, 'marriage-aethlem-beatha'),
    ...childrenOf(
      ['trevor-gwyvern', 'tegwen-gwyvern', 'huw-gwyvern', 'gwenfrewi-gwyvern'],
      MERVYN_IDS,
      'marriage-mervyn-jeannae'
    ),
    ...childrenOf(['brizio-gwyvern', 'bryn-gwyvern'], GWYNNAN_IDS, 'marriage-gwynnan-izobel')
  ],
  lineage: {
    founderPartnershipId: 'marriage-bleddyn-owena',
    houseId: GWYVERN_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    marriedAway('married-away-marwolaeth-endellion', 'Haus Marwolaeth', 'marriage-endellion-grippiud', 'house-marwolaeth'),
    marriedAway('married-away-wyrm-angharad', 'Haus Wyrm', 'marriage-angharad-cynwrig', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-airgid-gwyneira', 'Haus Airgid', 'marriage-gwyneira-conall', 'house-airgid'),
    marriedAway('married-away-taranvyr-talaith', 'Haus Taranvyr', 'marriage-talaith-kenyon', 'house-taranvyr'),
    marriedAway('married-away-draig-heledd', 'Haus Draig', 'marriage-heledd-meurig', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-arth-delyth', 'Haus Arth', 'marriage-delyth-afal', 'house-arth'),
    marriedAway('married-away-hebog-liliwen', 'Haus Hebog', 'marriage-liliwen-griffith', 'house-hebog'),
    marriedAway('married-away-saethwyr-morwenna', 'Haus Saethwyr', 'marriage-morwenna-huw', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-gwefrydd-alys', 'Haus Gwefrydd', 'marriage-alys-thomos', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-creyr-genofeva', 'Haus Créyr', 'marriage-genofeva-madoc', 'house-creyr')
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'bleddyn-draig',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Gwyvern-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Namens- und jahresgleiche Personen aus Draig, Saethwyr, Gafyr, Wyrm und Arwydd verwenden dieselben Weltpersonen-IDs und Portraitdateien; externe Portraitquellen wurden als lokale Projektdateien gesichert. Die in der Grafik angedeutete Verlobung Tegwens wurde auf Anweisung nicht übernommen.',
    blankFamily: false,
    sourceRevision: 1
  }
});
