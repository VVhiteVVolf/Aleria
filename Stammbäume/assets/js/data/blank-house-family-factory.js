import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';

export function createBlankHouseFamily({
  id,
  title,
  emblem,
  houseProfile,
  description = 'Vorbereitete, noch nicht ausgefüllte Familienakte.'
}) {
  const houseId = `house-${id.replace(/^haus-/, '')}`;
  return Object.freeze({
    schema: 'aleria.family-tree',
    schemaVersion: 1,
    document: { id, title, motto: '', description, emblem, houseProfile },
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
