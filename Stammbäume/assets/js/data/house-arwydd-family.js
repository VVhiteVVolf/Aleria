import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';

const ARWYDD_EMBLEM = 'https://i.imgur.com/I6OEMqq.png';

function person(id, name, sex, familyRole, houseId = '') {
  return {
    id,
    name,
    title: '',
    sex,
    status: 'unknown',
    birth: '',
    death: '',
    portrait: '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole,
    tags: [],
    notes: ''
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
    emblem: ARWYDD_EMBLEM
  },
  houses: [
    { id: 'house-arwydd', name: 'Haus Arwydd', motto: '', emblem: ARWYDD_EMBLEM, status: 'active' },
    { id: 'house-saethwyr', name: 'Haus Saethwyr', motto: '', emblem: '', status: 'active' },
    { id: 'house-mwyalchen', name: 'Haus Mwyalchen', motto: '', emblem: '', status: 'active' },
    { id: 'house-wym', name: 'Haus Wym', motto: '', emblem: '', status: 'active' },
    { id: 'house-draig', name: 'Haus Draig', motto: '', emblem: '', status: 'active' },
    { id: 'house-gafyr', name: 'Haus Gafyr', motto: '', emblem: '', status: 'active' },
    { id: 'house-gwefrydd', name: 'Haus Gwefrydd', motto: '', emblem: '', status: 'active' },
    { id: 'house-gwywern', name: 'Haus Gwywern', motto: '', emblem: '', status: 'active' },
    { id: 'house-dyngwn', name: 'Haus Dyngwn', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    person('idwalladr-arwydd', 'Idwalladr', 'male', 'core', 'house-arwydd'),
    person('carys', 'Carys', 'female', 'married'),

    person('imogen-arwydd', 'Imogen', 'female', 'core', 'house-arwydd'),
    person('breandan-saethwyr', 'Breandan Saethwyr', 'male', 'married', 'house-saethwyr'),
    person('idris-arwydd', 'Idris', 'male', 'core', 'house-arwydd'),
    person('deliah-mwyalchen', 'Deliah Mwyalchen', 'female', 'married', 'house-mwyalchen'),
    person('iseult-arwydd', 'Iseult', 'female', 'core', 'house-arwydd'),
    person('eiddon-wym', 'Eiddon Wym', 'male', 'married', 'house-wym'),

    person('ianto-arwydd', 'Ianto', 'male', 'core', 'house-arwydd'),
    person('tecwyn-draig', 'Tecwyn Draig', 'unknown', 'married', 'house-draig'),
    person('izolda-arwydd', 'Izolda', 'female', 'core', 'house-arwydd'),
    person('kelyddon-gafyr', 'Kelyddon Gafyr', 'male', 'married', 'house-gafyr'),
    person('ieuan-arwydd', 'Ieuan', 'male', 'core', 'house-arwydd'),
    person('myrcella-gwefrydd', 'Myrcella Gwefrydd', 'female', 'married', 'house-gwefrydd'),
    person('izobel-arwydd', 'Izobel', 'female', 'core', 'house-arwydd'),
    person('gwynnan-gwywern', 'Gwynnan Gwywern', 'male', 'married', 'house-gwywern'),
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
      name: 'Haus Wym',
      subtitle: 'Wegverheiratete Linie',
      linkType: 'married-away',
      parentPartnershipId: 'marriage-iseult-eiddon',
      houseId: 'house-wym',
      emblem: '',
      crestFrame: 'gold',
      founded: '',
      targetFamilyId: 'haus-wym',
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
      name: 'Haus Gwywern',
      subtitle: 'Wegverheiratete Linie',
      linkType: 'married-away',
      parentPartnershipId: 'marriage-izobel-gwynnan',
      houseId: 'house-gwywern',
      emblem: '',
      crestFrame: 'gold',
      founded: '',
      targetFamilyId: 'haus-gwywern',
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
    sourceNote: 'Nach Screenshotvorlage; fehlende Jahreszahlen, Titel und Nebenwappen bleiben bewusst offen.'
  }
});
