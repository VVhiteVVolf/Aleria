import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_ARWYDD_PORTRAITS } from './house-arwydd-portraits.js';

const ARWYDD_EMBLEM = 'assets/images/houses/haus-arwydd.png';
const ARWYDD_HOUSE_EMBLEMS = Object.freeze({
  saethwyr: 'assets/images/houses/haus-saethwyr.png',
  wyrm: 'assets/images/houses/haus-wyrm.png',
  draig: 'assets/images/houses/haus-draig.png',
  gafyr: 'assets/images/houses/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/haus-gwefrydd.png',
  gwywern: 'assets/images/houses/haus-gwyvern.png'
});

const ARWYDD_LIFE_DATES = Object.freeze({
  'idwalladr-arwydd': ['1653', '1720'],
  carys: ['1654', ''],
  'imogen-arwydd': ['1675', ''],
  'breandan-saethwyr': ['1670', '1730'],
  'idris-arwydd': ['1672', ''],
  'deliah-mwyalchen': ['1675', ''],
  'iseult-arwydd': ['1675', ''],
  'eiddon-wym': ['1671', ''],
  'ianto-arwydd': ['1700', ''],
  'tecwyn-draig': ['1700', ''],
  'izolda-arwydd': ['1701', ''],
  'kelyddon-gafyr': ['1698', ''],
  'ieuan-arwydd': ['1702', ''],
  'myrcella-gwefrydd': ['1702', ''],
  'izobel-arwydd': ['1703', ''],
  'gwynnan-gwywern': ['1696', ''],
  'iorwerth-arwydd': ['1704', ''],
  'dyddi-dyngwn': ['1704', ''],
  'ifor-arwydd': ['1722', ''],
  'idelle-arwydd': ['1724', ''],
  'ivor-arwydd': ['1726', ''],
  'isolde-arwydd': ['1732', ''],
  'ioan-arwydd': ['1721', ''],
  'ida-arwydd': ['1722', ''],
  'iwan-arwydd': ['1726', ''],
  'isaac-arwydd': ['1723', ''],
  'ilaria-arwydd': ['1728', '']
});

const HOUSE_HEAD_IDS = new Set(['idris-arwydd']);
const MAIN_LINE_IDS = new Set(['ianto-arwydd', 'ifor-arwydd', 'ivor-arwydd']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, familyRole, houseId = '', details = {}) {
  const [birth, death] = ARWYDD_LIFE_DATES[id] || ['', ''];
  return {
    id,
    name,
    title: '',
    sex,
    status: death ? 'dead' : birth ? 'alive' : 'unknown',
    birth,
    death,
    portrait: HOUSE_ARWYDD_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole,
    lineageRole: details.lineageRole || lineageRoleFor(id),
    tags: [],
    notes: '',
    ...details
  };
}

function partnership(id, firstId, secondId) {
  return {
    id,
    participantIds: [firstId, secondId],
    type: 'marriage',
    status: 'active',
    start: '',
    end: '',
    certainty: 'confirmed',
    visibility: 'public',
    notes: '',
    extensions: {}
  };
}

function parentage(id, childId, parentIds, partnershipId) {
  return {
    id,
    childId,
    parentIds,
    partnershipId,
    type: 'biological',
    legitimacy: 'legitimate',
    certainty: 'confirmed',
    visibility: 'public',
    notes: '',
    extensions: {}
  };
}

const FOUNDER_IDS = ['idwalladr-arwydd', 'carys'];
const IDRIS_FAMILY_IDS = ['idris-arwydd', 'deliah-mwyalchen'];
const IANTO_FAMILY_IDS = ['ianto-arwydd', 'tecwyn-draig'];
const IEUAN_FAMILY_IDS = ['ieuan-arwydd', 'myrcella-gwefrydd'];
const IORWERTH_FAMILY_IDS = ['iorwerth-arwydd', 'dyddi-dyngwn'];

export const HOUSE_ARWYDD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-arwydd',
    title: 'Haus Arwydd',
    motto: '',
    description: 'Familienlinie von Haus Arwydd nach der überlieferten Stammbaumvorlage.',
    emblem: ARWYDD_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.arwydd
  },
  houses: [
    { id: 'house-arwydd', name: 'Haus Arwydd', motto: '', emblem: ARWYDD_EMBLEM, status: 'active' },
    { id: 'house-saethwyr', name: 'Haus Saethwyr', motto: '', emblem: ARWYDD_HOUSE_EMBLEMS.saethwyr, status: 'active' },
    { id: 'house-mwyalchen', name: 'Haus Mwyalchen', motto: '', emblem: '', status: 'active' },
    { id: 'house-wyrm', name: 'Haus Wyrm', motto: '', emblem: ARWYDD_HOUSE_EMBLEMS.wyrm, status: 'active' },
    { id: 'house-draig', name: 'Haus Draig', motto: '', emblem: ARWYDD_HOUSE_EMBLEMS.draig, status: 'active' },
    { id: 'house-gafyr', name: 'Haus Gafyr', motto: '', emblem: ARWYDD_HOUSE_EMBLEMS.gafyr, status: 'active' },
    { id: 'house-gwefrydd', name: 'Haus Gwefrydd', motto: '', emblem: ARWYDD_HOUSE_EMBLEMS.gwefrydd, status: 'active' },
    { id: 'house-gwywern', name: 'Haus Gwyvern', motto: '', emblem: ARWYDD_HOUSE_EMBLEMS.gwywern, status: 'active' },
    { id: 'house-dyngwn', name: 'Haus Dyngwn', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    person('idwalladr-arwydd', 'Idwalladr', 'male', 'core', 'house-arwydd'),
    person('carys', 'Carys', 'female', 'married'),

    person('imogen-arwydd', 'Imogen', 'female', 'core', 'house-arwydd'),
    person('breandan-saethwyr', 'Breandan Saethwyr', 'male', 'married', 'house-saethwyr', {
      worldPersonId: 'person--haus-saethwyr--breandan-saethwyr'
    }),
    person('idris-arwydd', 'Idris', 'male', 'core', 'house-arwydd'),
    person('deliah-mwyalchen', 'Deliah Mwyalchen', 'female', 'married', 'house-mwyalchen'),
    person('iseult-arwydd', 'Iseult', 'female', 'core', 'house-arwydd', {
      worldPersonId: 'person--haus-arwydd--iseult-arwydd'
    }),
    person('eiddon-wym', 'Eiddon Wyrm', 'male', 'married', 'house-wyrm', {
      worldPersonId: 'person--haus-wyrm--eiddon-wyrm'
    }),

    person('ianto-arwydd', 'Ianto', 'male', 'core', 'house-arwydd'),
    person('tecwyn-draig', 'Tecwyn Draig', 'unknown', 'married', 'house-draig'),
    person('izolda-arwydd', 'Izolda', 'female', 'core', 'house-arwydd'),
    person('kelyddon-gafyr', 'Kelyddon Gafyr', 'male', 'married', 'house-gafyr', {
      worldPersonId: 'person--haus-gafyr--kelyddon-gafyr'
    }),
    person('ieuan-arwydd', 'Ieuan', 'male', 'core', 'house-arwydd'),
    person('myrcella-gwefrydd', 'Myrcella Gwefrydd', 'female', 'married', 'house-gwefrydd'),
    person('izobel-arwydd', 'Izobel', 'female', 'core', 'house-arwydd'),
    person('gwynnan-gwywern', 'Gwynnan Gwyvern', 'male', 'married', 'house-gwywern'),
    person('iorwerth-arwydd', 'Iorwerth', 'male', 'core', 'house-arwydd'),
    person('dyddi-dyngwn', 'Dyddi Dyngwn', 'unknown', 'married', 'house-dyngwn'),

    person('ifor-arwydd', 'Ifor', 'male', 'core', 'house-arwydd'),
    person('idelle-arwydd', 'Idelle', 'female', 'core', 'house-arwydd'),
    person('ivor-arwydd', 'Ivor', 'male', 'core', 'house-arwydd'),
    person('isolde-arwydd', 'Isolde', 'female', 'core', 'house-arwydd'),
    person('ioan-arwydd', 'Ioan', 'male', 'core', 'house-arwydd'),
    person('ida-arwydd', 'Ida', 'female', 'core', 'house-arwydd'),
    person('iwan-arwydd', 'Iwan', 'male', 'core', 'house-arwydd'),
    person('isaac-arwydd', 'Isaac', 'male', 'core', 'house-arwydd'),
    person('ilaria-arwydd', 'Ilaria', 'female', 'core', 'house-arwydd')
  ],
  partnerships: [
    partnership('marriage-idwalladr-carys', ...FOUNDER_IDS),
    partnership('marriage-imogen-breandan', 'imogen-arwydd', 'breandan-saethwyr'),
    partnership('marriage-idris-deliah', ...IDRIS_FAMILY_IDS),
    partnership('marriage-iseult-eiddon', 'iseult-arwydd', 'eiddon-wym'),
    partnership('marriage-ianto-tecwyn', ...IANTO_FAMILY_IDS),
    partnership('marriage-izolda-kelyddon', 'izolda-arwydd', 'kelyddon-gafyr'),
    partnership('marriage-ieuan-myrcella', ...IEUAN_FAMILY_IDS),
    partnership('marriage-izobel-gwynnan', 'izobel-arwydd', 'gwynnan-gwywern'),
    partnership('marriage-iorwerth-dyddi', ...IORWERTH_FAMILY_IDS)
  ],
  parentages: [
    parentage('parentage-imogen', 'imogen-arwydd', FOUNDER_IDS, 'marriage-idwalladr-carys'),
    parentage('parentage-idris', 'idris-arwydd', FOUNDER_IDS, 'marriage-idwalladr-carys'),
    parentage('parentage-iseult', 'iseult-arwydd', FOUNDER_IDS, 'marriage-idwalladr-carys'),

    parentage('parentage-ianto', 'ianto-arwydd', IDRIS_FAMILY_IDS, 'marriage-idris-deliah'),
    parentage('parentage-izolda', 'izolda-arwydd', IDRIS_FAMILY_IDS, 'marriage-idris-deliah'),
    parentage('parentage-ieuan', 'ieuan-arwydd', IDRIS_FAMILY_IDS, 'marriage-idris-deliah'),
    parentage('parentage-izobel', 'izobel-arwydd', IDRIS_FAMILY_IDS, 'marriage-idris-deliah'),
    parentage('parentage-iorwerth', 'iorwerth-arwydd', IDRIS_FAMILY_IDS, 'marriage-idris-deliah'),

    parentage('parentage-ifor', 'ifor-arwydd', IANTO_FAMILY_IDS, 'marriage-ianto-tecwyn'),
    parentage('parentage-idelle', 'idelle-arwydd', IANTO_FAMILY_IDS, 'marriage-ianto-tecwyn'),
    parentage('parentage-ivor', 'ivor-arwydd', IANTO_FAMILY_IDS, 'marriage-ianto-tecwyn'),
    parentage('parentage-isolde', 'isolde-arwydd', IANTO_FAMILY_IDS, 'marriage-ianto-tecwyn'),

    parentage('parentage-ioan', 'ioan-arwydd', IEUAN_FAMILY_IDS, 'marriage-ieuan-myrcella'),
    parentage('parentage-ida', 'ida-arwydd', IEUAN_FAMILY_IDS, 'marriage-ieuan-myrcella'),
    parentage('parentage-iwan', 'iwan-arwydd', IEUAN_FAMILY_IDS, 'marriage-ieuan-myrcella'),

    parentage('parentage-isaac', 'isaac-arwydd', IORWERTH_FAMILY_IDS, 'marriage-iorwerth-dyddi'),
    parentage('parentage-ilaria', 'ilaria-arwydd', IORWERTH_FAMILY_IDS, 'marriage-iorwerth-dyddi')
  ],
  lineage: {
    founderPartnershipId: 'marriage-idwalladr-carys',
    houseId: 'house-arwydd',
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    {
      id: 'married-away-saethwyr',
      name: 'Haus Saethwyr',
      subtitle: 'Wegverheiratete Linie',
      linkType: 'married-away',
      parentPartnershipId: 'marriage-imogen-breandan',
      houseId: 'house-saethwyr',
      emblem: '',
      crestFrame: 'gold',
      founded: '',
      targetFamilyId: 'haus-saethwyr',
      notes: '',
      extensions: {}
    },
    {
      id: 'married-away-wym',
      name: 'Haus Wyrm',
      subtitle: 'Wegverheiratete Linie',
      linkType: 'married-away',
      parentPartnershipId: 'marriage-iseult-eiddon',
      houseId: 'house-wyrm',
      emblem: '',
      crestFrame: 'gold',
      founded: '',
      targetFamilyId: 'haus-wyrm',
      notes: '',
      extensions: {}
    },
    {
      id: 'married-away-gafyr',
      name: 'Haus Gafyr',
      subtitle: 'Wegverheiratete Linie',
      linkType: 'married-away',
      parentPartnershipId: 'marriage-izolda-kelyddon',
      houseId: 'house-gafyr',
      emblem: '',
      crestFrame: 'gold',
      founded: '',
      targetFamilyId: 'haus-gafyr',
      notes: '',
      extensions: {}
    },
    {
      id: 'married-away-gwywern',
      name: 'Haus Gwyvern',
      subtitle: 'Wegverheiratete Linie',
      linkType: 'married-away',
      parentPartnershipId: 'marriage-izobel-gwynnan',
      houseId: 'house-gwywern',
      emblem: ARWYDD_HOUSE_EMBLEMS.gwywern,
      crestFrame: 'gold',
      founded: '',
      targetFamilyId: 'haus-gwyvern',
      notes: '',
      extensions: {}
    }
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'idwalladr-arwydd',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Beziehungen, Lebensdaten und Portraitzuordnungen nach der bereitgestellten Tabelle und Stammbaumgrafik. Portraitquellen wurden als lokale Projektdateien gesichert; fehlende Titel und Nebenwappen bleiben bewusst offen.'
  }
});
