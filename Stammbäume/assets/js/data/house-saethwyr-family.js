import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  arwydd: 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const SAETHWYR_HOUSE_ID = 'house-saethwyr';
const HOUSE_HEAD_IDS = new Set([
  'kynwrig-draig',
  'odyar-saethwyr',
  'limwris-saethwyr',
  'llawvrodedd-saethwyr',
  'drudwas-saethwyr',
  'gruffyd-saethwyr',
  'gallgoid-saethwyr',
  'huw-saethwyr'
]);
const MAIN_LINE_IDS = new Set(['marmaduke-saethwyr', 'arian-saethwyr']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '', death = '', houseId = SAETHWYR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_SAETHWYR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SAETHWYR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const FOUNDER_IDS = ['kynwrig-draig', 'sianwyn-gafyr'];
const ODYAR_FAMILY_IDS = ['odyar-saethwyr', 'morwenna-gwefrydd'];
const LIMWRIS_FAMILY_IDS = ['limwris-saethwyr', 'mairwyn-gafyr'];
const LLAWVRODEDD_FAMILY_IDS = ['llawvrodedd-saethwyr', 'elinor-grael'];
const DRUDWAS_FAMILY_IDS = ['drudwas-saethwyr', 'evaine-dinefwr'];
const GRUFFYD_FAMILY_IDS = ['gruffyd-saethwyr', 'menna-coedwig'];
const GALLGOID_FAMILY_IDS = ['gallgoid-saethwyr', 'selyse-gwefrydd'];
const PADRIG_FAMILY_IDS = ['padrig-saethwyr', 'bricelyn-hwyaden'];
const HUW_FAMILY_IDS = ['huw-saethwyr', 'morwenna-gwyvern'];
const GWALCHGWYN_FAMILY_IDS = ['gwalchgwyn-saethwyr', 'melyn-arth'];
const BREANDAN_FAMILY_IDS = ['breandan-saethwyr', 'imogen-arwydd'];
const MARMADUKE_FAMILY_IDS = ['marmaduke-saethwyr', 'bronwyn-wyrm'];
const ANWYLL_FAMILY_IDS = ['anwyll-saethwyr', 'maelys-ceirwyn'];
const CARADOG_FAMILY_IDS = ['caradog-saethwyr', 'jenniffer-marwolaeth'];

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

export const HOUSE_SAETHWYR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-saethwyr',
    title: 'Haus Saethwyr',
    motto: '',
    description: 'Die überlieferte Hauptlinie des Hauses Saethwyr von der Gründerüberlieferung Kynwrig Draigs und Sianwyn Gafyrs bis zur Generation von 1725.',
    emblem: HOUSE_EMBLEMS.saethwyr,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.saethwyr
  },
  houses: [
    house(SAETHWYR_HOUSE_ID, 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-grael', 'Haus Grael'),
    house('house-dinefwr', 'Haus Dinefwr'),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-neidr', 'Haus Neidr'),
    house('house-hwyaden', 'Haus Hwyaden'),
    house('house-illyswen', 'Haus Illyswen'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd),
    house('house-illewod', 'Haus Illewod'),
    house('house-ceirwyn', 'Haus Ceirwyn'),
    house('house-saith', 'Haus Saith'),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-dyngwn', 'Haus Dyngwn')
  ],
  persons: [
    // Gründerüberlieferung und erste wieder namentlich bekannte Generation
    person('kynwrig-draig', 'Kynwrig Draig', 'male', '????', '????', 'house-draig', { status: 'dead' }),
    person('sianwyn-gafyr', 'Sianwyn Gafyr', 'female', '????', '????', 'house-gafyr', { status: 'dead' }),
    person('odyar-saethwyr', 'Odyar', 'male', '1096', '1143'),
    person('rhianwyn-saethwyr', 'Rhianwyn', 'female', '1099', '1166', SAETHWYR_HOUSE_ID, {
      notes: 'Die Saethwyr-Tabelle nennt 1099–1166; die Wyrm-Überlieferung führt dieselbe Weltperson mit 1100–1177.'
    }),
    person('morwenna-gwefrydd', 'Morwenna Gwefrydd', 'female', '1100', '1184', 'house-gwefrydd'),
    person('tryffin-draig', 'Tryffin Draig', 'male', '1098', '1171', 'house-draig'),

    // Nach der ersten Überlieferungslücke
    person('limwris-saethwyr', 'Limwris', 'male', '1250', '1300'),
    person('myfanwy-saethwyr', 'Myfanwy', 'female', '1252', '1297'),
    person('mairwyn-gafyr', 'Mairwyn Gafyr', 'female', '1251', '1312', 'house-gafyr'),
    person('gwastad-wyrm', 'Gwastad Wyrm', 'male', '1249', '1311', 'house-wyrm'),

    // Nach der zweiten großen Überlieferungslücke
    person('llawvrodedd-saethwyr', 'Llawvrodedd', 'male', '1578', '1644'),
    person('owena-saethwyr', 'Owena', 'female', '1583', '1683'),
    person('elinor-grael', 'Elinor Grael', 'female', '1580', '1679', 'house-grael'),
    person('bleddyn-draig', 'Bleddyn Draig', 'male', '1582', '1653', 'house-draig'),

    // Llawvrodedds Linie
    person('drudwas-saethwyr', 'Drudwas', 'male', '1604', '1674'),
    person('ceridwyn-saethwyr', 'Ceridwyn', 'female', '1606'),
    person('evaine-dinefwr', 'Evaine Dinefwr', 'female', '1607', '1681', 'house-dinefwr'),
    person('gruffyd-saethwyr', 'Gruffyd', 'male', '1630', '1700'),
    person('venora-saethwyr', 'Venora', 'female', '1632', '1700'),
    person('menna-coedwig', 'Menna Coedwig', 'female', '1634', '1701', 'house-coedwig'),
    person('dyvynwal-gwyvern', 'Dyvynwal Gwyvern', 'male', '1628', '1673', 'house-gwyvern'),

    // Kinder Gruffyds und Mennas
    person('gallgoid-saethwyr', 'Gallgoid', 'male', '1648', '1720'),
    person('dolena-saethwyr', 'Dolena', 'female', '1652', '????'),
    person('gwenllian-saethwyr', 'Gwenllian', 'female', '1650', '1720'),
    person('padrig-saethwyr', 'Padrig', 'male', '1654', '1720'),
    person('selyse-gwefrydd', 'Selyse Gwefrydd', 'female', '1651', '1705', 'house-gwefrydd'),
    person('llywellyn-neidr', 'Llywellyn Neidr', 'male', '1650', '1734', 'house-neidr'),
    person('gethin-draig', 'Gethin Draig', 'male', '1649', '1719', 'house-draig'),
    person('bricelyn-hwyaden', 'Bricelyn Hwyaden', 'female', '1654', '1700', 'house-hwyaden'),

    // Zwei fortgeführte Zweige
    person('huw-saethwyr', 'Huw', 'male', '1666'),
    person('wenna-saethwyr', 'Wenna', 'female', '1666', '1720'),
    person('gwalchgwyn-saethwyr', 'Gwalchgwyn', 'male', '1680'),
    person('elaine-saethwyr', 'Elaine', 'female', '1675'),
    person('breandan-saethwyr', 'Breandan', 'male', '1670', '1730'),
    person('morwenna-gwyvern', 'Morwenna Gwyvern', 'female', '1672', '', 'house-gwyvern'),
    person('ercwlff-illyswen', 'Ercwlff Illyswen', 'male', '1661', '1720', 'house-illyswen'),
    person('melyn-arth', 'Melyn Arth', 'male', '1684', '1735', 'house-arth'),
    person('derwen-wyrm', 'Derwen Wyrm', 'male', '1674', '', 'house-wyrm'),
    person('imogen-arwydd', 'Imogen Arwydd', 'female', '1675', '', 'house-arwydd'),

    // Generation 1692 bis 1703
    person('marmaduke-saethwyr', 'Marmaduke', 'male', '1695'),
    person('gwawr-saethwyr', 'Gwawr', 'female', '1699'),
    person('anwyll-saethwyr', 'Anwyll', 'male', '1696'),
    person('enora-saethwyr', 'Enora', 'female', '1703'),
    person('jeanne-saethwyr', 'Jeanne', 'female', '1694'),
    person('caradog-saethwyr', 'Caradog', 'male', '1696'),
    person('hafren-saethwyr', 'Hafren', 'female', '1700'),
    person('bronwyn-wyrm', 'Bronwyn Wyrm', 'female', '1697', '', 'house-wyrm'),
    person('sayres-illewod', 'Sayres Illewod', 'male', '1692', '', 'house-illewod'),
    person('maelys-ceirwyn', 'Maelys Ceirwyn', 'female', '1700', '', 'house-ceirwyn'),
    person('maelron-saith', 'Maelron Saith', 'male', '1701', '', 'house-saith'),
    person('uthred-gaeth', 'Uthred Gaeth', 'male', '1692', '', 'house-gaeth'),
    person('jenniffer-marwolaeth', 'Jenniffer Marwolaeth', 'female', '1695', '', 'house-marwolaeth'),
    person('dillan-dyngwn', 'Dillan Dyngwn', 'male', '1696', '', 'house-dyngwn'),

    // Jüngste in der Tabelle genannte Generation
    person('arian-saethwyr', 'Arian', 'female', '1721'),
    person('ened-saethwyr', 'Ened', 'female', '1723'),
    person('nudd-saethwyr', 'Nudd', 'male', '1721'),
    person('sian-saethwyr', 'Sian', 'female', '1723'),
    person('cadoc-saethwyr', 'Cadoc', 'male', '1725'),
    person('nia-saethwyr', 'Nia', 'female', '1725')
  ],
  partnerships: [
    createMarriage('marriage-kynwrig-sianwyn', ...FOUNDER_IDS),
    createMarriage('marriage-odyar-morwenna', ...ODYAR_FAMILY_IDS),
    createMarriage('marriage-rhianwyn-tryffin', 'rhianwyn-saethwyr', 'tryffin-draig'),
    createMarriage('marriage-limwris-mairwyn', ...LIMWRIS_FAMILY_IDS),
    createMarriage('marriage-myfanwy-gwastad', 'myfanwy-saethwyr', 'gwastad-wyrm'),
    createMarriage('marriage-llawvrodedd-elinor', ...LLAWVRODEDD_FAMILY_IDS),
    createMarriage('marriage-owena-bleddyn', 'owena-saethwyr', 'bleddyn-draig'),
    createMarriage('marriage-drudwas-evaine', ...DRUDWAS_FAMILY_IDS),
    createMarriage('marriage-gruffyd-menna', ...GRUFFYD_FAMILY_IDS, { status: 'ended', end: '1700' }),
    createMarriage('marriage-venora-dyvynwal', 'venora-saethwyr', 'dyvynwal-gwyvern'),
    createMarriage('marriage-gallgoid-selyse', ...GALLGOID_FAMILY_IDS),
    createMarriage('marriage-dolena-llywellyn', 'dolena-saethwyr', 'llywellyn-neidr'),
    createMarriage('marriage-gwenllian-gethin', 'gwenllian-saethwyr', 'gethin-draig'),
    createMarriage('marriage-padrig-bricelyn', ...PADRIG_FAMILY_IDS),
    createMarriage('marriage-huw-morwenna', ...HUW_FAMILY_IDS),
    createMarriage('marriage-wenna-ercwlff', 'wenna-saethwyr', 'ercwlff-illyswen'),
    createMarriage('marriage-gwalchgwyn-melyn', ...GWALCHGWYN_FAMILY_IDS),
    createMarriage('marriage-elaine-derwen', 'elaine-saethwyr', 'derwen-wyrm'),
    createMarriage('marriage-breandan-imogen', ...BREANDAN_FAMILY_IDS),
    createMarriage('marriage-marmaduke-bronwyn', ...MARMADUKE_FAMILY_IDS),
    createMarriage('marriage-gwawr-sayres', 'gwawr-saethwyr', 'sayres-illewod'),
    createMarriage('marriage-anwyll-maelys', ...ANWYLL_FAMILY_IDS),
    createMarriage('marriage-enora-maelron', 'enora-saethwyr', 'maelron-saith'),
    createMarriage('marriage-jeanne-uthred', 'jeanne-saethwyr', 'uthred-gaeth'),
    createMarriage('marriage-caradog-jenniffer', ...CARADOG_FAMILY_IDS),
    createMarriage('marriage-hafren-dillan', 'hafren-saethwyr', 'dillan-dyngwn')
  ],
  parentages: [
    ...createParentages(['odyar-saethwyr', 'rhianwyn-saethwyr'], FOUNDER_IDS, 'marriage-kynwrig-sianwyn', {
      type: 'claimed',
      notes: 'Die Vorlage führt diese Generation erst nach dem Gründerwappen und einer nicht bezifferten Überlieferungslücke.'
    }),
    ...createParentages(['limwris-saethwyr', 'myfanwy-saethwyr'], ODYAR_FAMILY_IDS, 'marriage-odyar-morwenna', {
      type: 'claimed',
      notes: 'Zwischen Odyars Generation und Limwris/Myfanwy fehlen einzelne Abstammungsglieder.',
      extensions: { timeJumpId: 'gap-odyar-limwris' }
    }),
    ...createParentages(['llawvrodedd-saethwyr', 'owena-saethwyr'], LIMWRIS_FAMILY_IDS, 'marriage-limwris-mairwyn', {
      type: 'claimed',
      notes: 'Die belegte Linie setzt nach mehreren Jahrhunderten wieder ein.',
      extensions: { timeJumpId: 'gap-limwris-llawvrodedd' }
    }),
    ...createParentages(['drudwas-saethwyr', 'ceridwyn-saethwyr'], LLAWVRODEDD_FAMILY_IDS, 'marriage-llawvrodedd-elinor'),
    ...createParentages(['gruffyd-saethwyr', 'venora-saethwyr'], DRUDWAS_FAMILY_IDS, 'marriage-drudwas-evaine'),
    ...createParentages(
      ['gallgoid-saethwyr', 'dolena-saethwyr', 'gwenllian-saethwyr', 'padrig-saethwyr'],
      GRUFFYD_FAMILY_IDS,
      'marriage-gruffyd-menna'
    ),
    ...createParentages(['huw-saethwyr', 'wenna-saethwyr', 'gwalchgwyn-saethwyr'], GALLGOID_FAMILY_IDS, 'marriage-gallgoid-selyse'),
    ...createParentages(['elaine-saethwyr', 'breandan-saethwyr'], PADRIG_FAMILY_IDS, 'marriage-padrig-bricelyn'),
    ...createParentages(['marmaduke-saethwyr', 'gwawr-saethwyr'], HUW_FAMILY_IDS, 'marriage-huw-morwenna'),
    ...createParentages(['anwyll-saethwyr', 'enora-saethwyr'], GWALCHGWYN_FAMILY_IDS, 'marriage-gwalchgwyn-melyn'),
    ...createParentages(['jeanne-saethwyr', 'caradog-saethwyr', 'hafren-saethwyr'], BREANDAN_FAMILY_IDS, 'marriage-breandan-imogen'),
    ...createParentages(['arian-saethwyr', 'ened-saethwyr'], MARMADUKE_FAMILY_IDS, 'marriage-marmaduke-bronwyn'),
    ...createParentages(['nudd-saethwyr', 'sian-saethwyr'], ANWYLL_FAMILY_IDS, 'marriage-anwyll-maelys'),
    ...createParentages(['cadoc-saethwyr', 'nia-saethwyr'], CARADOG_FAMILY_IDS, 'marriage-caradog-jenniffer')
  ],
  lineage: {
    founderPartnershipId: 'marriage-kynwrig-sianwyn',
    houseId: SAETHWYR_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1096',
      label: 'Die erste namentlich belegte Generation beginnt mit Odyar und Rhianwyn'
    }
  },
  cadetBranches: [
    marriedAway('married-away-wyrm-rhianwyn', 'Haus Wyrm', 'marriage-rhianwyn-tryffin', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-wyrm-myfanwy', 'Haus Wyrm', 'marriage-myfanwy-gwastad', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-draig-owena', 'Haus Draig', 'marriage-owena-bleddyn', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-gwyvern-venora', 'Haus Gwyvern', 'marriage-venora-dyvynwal', 'house-gwyvern', HOUSE_EMBLEMS.gwyvern),
    marriedAway('married-away-neidr-dolena', 'Haus Neidr', 'marriage-dolena-llywellyn', 'house-neidr'),
    marriedAway('married-away-draig-gwenllian', 'Haus Draig', 'marriage-gwenllian-gethin', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-illyswen-wenna', 'Haus Illyswen', 'marriage-wenna-ercwlff', 'house-illyswen'),
    marriedAway('married-away-wyrm-elaine', 'Haus Wyrm', 'marriage-elaine-derwen', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-illewod-gwawr', 'Haus Illewod', 'marriage-gwawr-sayres', 'house-illewod'),
    marriedAway('married-away-saith-enora', 'Haus Saith', 'marriage-enora-maelron', 'house-saith'),
    marriedAway('married-away-gaeth-jeanne', 'Haus Gaeth', 'marriage-jeanne-uthred', 'house-gaeth'),
    marriedAway('married-away-dyngwn-hafren', 'Haus Dyngwn', 'marriage-hafren-dillan', 'house-dyngwn')
  ],
  timeJumps: [
    {
      id: 'gap-odyar-limwris',
      parentPartnershipId: 'marriage-odyar-morwenna',
      childIds: ['limwris-saethwyr', 'myfanwy-saethwyr'],
      years: 66,
      fromYear: '1184',
      toYear: '1250',
      label: 'Die belegte Linie setzt 1250 wieder ein',
      notes: 'Die dazwischenliegenden Generationen werden in der Vorlage nicht einzeln genannt.',
      extensions: {}
    },
    {
      id: 'gap-limwris-llawvrodedd',
      parentPartnershipId: 'marriage-limwris-mairwyn',
      childIds: ['llawvrodedd-saethwyr', 'owena-saethwyr'],
      years: 266,
      fromYear: '1312',
      toYear: '1578',
      label: 'Die belegte Linie setzt im 16. Jahrhundert wieder ein',
      notes: 'Die dazwischenliegenden Generationen werden in der Vorlage nicht einzeln genannt.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kynwrig-draig',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Beziehungen, Lebensdaten und Portraitzuordnungen nach der bereitgestellten Saethwyr-Tabelle und Stammbaumgrafik. Bereits in Arwydd, Gafyr oder Wyrm geführte Personen verwenden dieselben Weltpersonen-IDs und lokalen Portraitdateien.',
    blankFamily: false,
    sourceRevision: 3
  }
});
