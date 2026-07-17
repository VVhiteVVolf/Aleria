import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CLUDWYR_PORTRAITS } from './house-cludwyr-portraits.js';

const CLUDWYR_EMBLEM = 'assets/images/houses/haus-cludwyr.png';
const CLUDWYR_HOUSE_ID = 'house-cludwyr';
const HOUSE_HEAD_IDS = new Set([
  'saith-cludwyr',
  'godwyn-cludwyr',
  'rhain-cludwyr'
]);
const MAIN_LINE_IDS = new Set(['slevin-cludwyr', 'aled-cludwyr']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CLUDWYR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_CLUDWYR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CLUDWYR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '') {
  // Die Cludwyr heiraten bevorzugt Menschen aus dem einfachen Volk ohne Hausnamen.
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['saith-cludwyr', 'tirion'];
const GODWYN_IDS = ['godwyn-cludwyr', 'evangelin-rhyddid'];
const ENFYS_IDS = ['enfys-cludwyr', 'owain'];
const RHAIN_IDS = ['rhain-cludwyr', 'klervi-balchder'];
const TIGRIS_IDS = ['tigris-cludwyr', 'sean'];
const PARZIFAL_IDS = ['parzifal-cludwyr', 'rhena'];
const SLEVIN_IDS = ['slevin-cludwyr', 'arwen'];
const GLAW_IDS = ['glaw-cludwyr', 'gavin-1702'];
const IESTYN_IDS = ['iestyn-cludwyr', 'aslaug'];
const WINNIFRED_IDS = ['winnifred-cludwyr', 'janto'];
const SELWYN_IDS = ['selwyn-cludwyr', 'llio'];

export const HOUSE_CLUDWYR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-cludwyr',
    title: 'Haus Cludwyr',
    motto: 'Der Boden lügt nicht.',
    description: 'Die belegte Linie des Ritterherrenhauses Cludwyr unter Haus Wyrm: von Saith Cludwyr, dem ersten Lehenswart von Bronhir, bis zur Generation von 1732.',
    emblem: CLUDWYR_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.cludwyr
  },
  houses: [
    { id: CLUDWYR_HOUSE_ID, name: 'Haus Cludwyr', motto: 'Der Boden lügt nicht.', emblem: CLUDWYR_EMBLEM, status: 'active' },
    house('house-rhyddid', 'Haus Rhyddid', 'assets/images/houses/haus-rhyddid.png'),
    house('house-balchder', 'Haus Balchder', 'assets/images/houses/haus-balchder.png')
  ],
  persons: [
    // Gründerpaar
    person('saith-cludwyr', 'Saith Cludwyr', 'male', '????', '????', CLUDWYR_HOUSE_ID, {
      title: 'Begründer des Ritterherrenhauses Cludwyr',
      notes: 'Verwaister Bauernsohn, von einem Ritter des Hauses Rhyddid als Knappe aufgenommen; vom Ritterfürsten der Wyrm zum Ritter geschlagen und als erster Ritterherr zum Lehenswart von Bronhir erhoben.'
    }),
    spouse('tirion', 'Tirion', 'female', '????', '????'),

    // Nach der Überlieferungslücke
    person('godwyn-cludwyr', 'Godwyn', 'male', '1651', '1720'),
    person('enfys-cludwyr', 'Enfys', 'female', '1656', '1738'),
    person('evangelin-rhyddid', 'Evangelin Rhyddid', 'female', '1654', '1730', 'house-rhyddid', { familyRole: 'married' }),
    spouse('owain', 'Owain', 'male', '1650', '1730'),

    // Kinder von Godwyn und Evangelin sowie Enfys und Owain
    person('rhain-cludwyr', 'Rhain', 'male', '1674', '', CLUDWYR_HOUSE_ID, {
      title: 'Ritterherr des Hauses Cludwyr',
      notes: 'Lehenswart von Bronhir.'
    }),
    person('tigris-cludwyr', 'Tigris', 'female', '1680', ''),
    person('parzifal-cludwyr', 'Parzifal', 'male', '1679', ''),
    person('klervi-balchder', 'Klervi Balchder', 'female', '1678', '', 'house-balchder', { familyRole: 'married' }),
    spouse('sean', 'Sean', 'male', '1678', ''),
    spouse('rhena', 'Rhena', 'female', '1683', ''),

    // Kinder von Rhain und Klervi
    person('slevin-cludwyr', 'Slevin', 'male', '1699', ''),
    person('glaw-cludwyr', 'Glaw', 'female', '1705', ''),
    person('iestyn-cludwyr', 'Iestyn', 'male', '1707', ''),
    spouse('arwen', 'Arwen', 'female', '1703', ''),
    spouse('gavin-1702', 'Gavin', 'male', '1702', ''),
    spouse('aslaug', 'Aslaug', 'female', '1707', ''),

    // Kind von Tigris und Sean
    person('winnifred-cludwyr', 'Winnifred', 'female', '1702', ''),
    spouse('janto', 'Janto', 'male', '1700', ''),

    // Kind von Parzifal und Rhena
    person('selwyn-cludwyr', 'Selwyn', 'male', '1710', ''),
    spouse('llio', 'Llio', 'female', '1712', ''),

    // Kinder von Slevin und Arwen
    person('sian-cludwyr', 'Sian', 'female', '1719', ''),
    person('aled-cludwyr', 'Aled', 'male', '1724', ''),

    // Kinder von Glaw und Gavin
    person('bogus-cludwyr', 'Bogus', 'male', '1723', ''),
    person('cady-cludwyr', 'Cady', 'female', '1726', ''),
    person('brac-cludwyr', 'Brac', 'male', '1729', ''),

    // Kinder von Iestyn und Aslaug
    person('gildas-cludwyr', 'Gildas', 'male', '1725', ''),
    person('ellis-cludwyr', 'Ellis', 'male', '1730', ''),

    // Kinder von Winnifred und Janto
    person('dee-cludwyr', 'Dee', 'female', '1722', ''),
    person('eira-cludwyr', 'Eira', 'female', '1727', ''),

    // Kind von Selwyn und Llio
    person('dewi-cludwyr', 'Dewi', 'male', '1732', '')
  ],
  partnerships: [
    createMarriage('marriage-saith-tirion', ...FOUNDER_IDS),
    createMarriage('marriage-godwyn-evangelin', ...GODWYN_IDS),
    createMarriage('marriage-enfys-owain', ...ENFYS_IDS),
    createMarriage('marriage-rhain-klervi', ...RHAIN_IDS),
    createMarriage('marriage-tigris-sean', ...TIGRIS_IDS),
    createMarriage('marriage-parzifal-rhena', ...PARZIFAL_IDS),
    createMarriage('marriage-slevin-arwen', ...SLEVIN_IDS),
    createMarriage('marriage-glaw-gavin', ...GLAW_IDS),
    createMarriage('marriage-iestyn-aslaug', ...IESTYN_IDS),
    createMarriage('marriage-winnifred-janto', ...WINNIFRED_IDS),
    createMarriage('marriage-selwyn-llio', ...SELWYN_IDS)
  ],
  parentages: [
    ...childrenOf(['godwyn-cludwyr', 'enfys-cludwyr'], FOUNDER_IDS, 'marriage-saith-tirion', {
      type: 'claimed', certainty: 'probable'
    }),
    ...childrenOf(['rhain-cludwyr', 'tigris-cludwyr'], GODWYN_IDS, 'marriage-godwyn-evangelin'),
    ...childrenOf(['parzifal-cludwyr'], ENFYS_IDS, 'marriage-enfys-owain'),
    ...childrenOf(['slevin-cludwyr', 'glaw-cludwyr', 'iestyn-cludwyr'], RHAIN_IDS, 'marriage-rhain-klervi'),
    ...childrenOf(['winnifred-cludwyr'], TIGRIS_IDS, 'marriage-tigris-sean'),
    ...childrenOf(['selwyn-cludwyr'], PARZIFAL_IDS, 'marriage-parzifal-rhena'),
    ...childrenOf(['sian-cludwyr', 'aled-cludwyr'], SLEVIN_IDS, 'marriage-slevin-arwen'),
    ...childrenOf(['bogus-cludwyr', 'cady-cludwyr', 'brac-cludwyr'], GLAW_IDS, 'marriage-glaw-gavin'),
    ...childrenOf(['gildas-cludwyr', 'ellis-cludwyr'], IESTYN_IDS, 'marriage-iestyn-aslaug'),
    ...childrenOf(['dee-cludwyr', 'eira-cludwyr'], WINNIFRED_IDS, 'marriage-winnifred-janto'),
    ...childrenOf(['dewi-cludwyr'], SELWYN_IDS, 'marriage-selwyn-llio')
  ],
  lineage: {
    founderPartnershipId: 'marriage-saith-tirion',
    houseId: CLUDWYR_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1651',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-in-rhyddid-evangelin',
      name: 'Haus Rhyddid',
      subtitle: 'Herkunftshaus der Braut',
      parentPartnershipId: 'marriage-godwyn-evangelin',
      houseId: 'house-rhyddid',
      targetFamilyId: 'haus-rhyddid',
      emblem: 'assets/images/houses/haus-rhyddid.png',
      crestFrame: 'silver',
      notes: 'Evangelin heiratete aus dem Ritterherrenhaus Rhyddid in das Haus Cludwyr ein; im Rhyddid-Stammbaum ist die Ehe als Wegheirat vermerkt.'
    }),
    createMarriedAwayBranch({
      id: 'married-in-balchder-klervi',
      name: 'Haus Balchder',
      subtitle: 'Herkunftshaus der Braut',
      parentPartnershipId: 'marriage-rhain-klervi',
      houseId: 'house-balchder',
      targetFamilyId: 'haus-balchder',
      emblem: 'assets/images/houses/haus-balchder.png',
      crestFrame: 'silver',
      notes: 'Klervi heiratete aus dem Ritterherrenhaus Balchder in das Haus Cludwyr ein.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'saith-cludwyr',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Cludwyr-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Godwyn und Evangelin Rhyddid sind mit dem Rhyddid-Stammbaum geteilt; ihre Kinder führen die Cludwyr-Linie fort. Die eingeheirateten Ehepartner entstammen dem einfachen Volk und sind ohne Hausnamen überliefert. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Cludwyr den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
