import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';

function createBlankHouseFamily({ id, title, emblem }) {
  const houseId = `house-${id.replace(/^haus-/, '')}`;
  return Object.freeze({
    schema: 'aleria.family-tree',
    schemaVersion: 1,
    document: {
      id,
      title,
      motto: '',
      description: 'Vorbereitete, noch nicht ausgefüllte Familienakte.',
      emblem
    },
    houses: [
      { id: houseId, name: title, motto: '', emblem, status: 'active' }
    ],
    persons: [],
    partnerships: [],
    parentages: [],
    lineage: {
      founderPartnershipId: '',
      houseId,
      crestSubtitle: '',
      crestEmblemScale: 0.86,
      crestFrame: 'gold',
      crestFrameScale: 1,
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    cadetBranches: [],
    timeJumps: [],
    presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
    view: {
      focusPersonId: '',
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      showSiblings: true
    },
    extensions: { blankFamily: true }
  });
}

export const HOUSE_DRAIG_FAMILY = createBlankHouseFamily({
  id: 'haus-draig',
  title: 'Haus Draig',
  emblem: 'assets/images/houses/haus-draig.png'
});

export const HOUSE_WYRM_FAMILY = createBlankHouseFamily({
  id: 'haus-wyrm',
  title: 'Haus Wyrm',
  emblem: 'assets/images/houses/haus-wyrm.png'
});

export const HOUSE_SAETHWYR_FAMILY = createBlankHouseFamily({
  id: 'haus-saethwyr',
  title: 'Haus Saethwyr',
  emblem: 'assets/images/houses/haus-saethwyr.png'
});

export const HOUSE_GAFYR_FAMILY = createBlankHouseFamily({
  id: 'haus-gafyr',
  title: 'Haus Gafyr',
  emblem: 'assets/images/houses/haus-gafyr.png'
});
