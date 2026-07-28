import { createFamilyPerson } from './family-record-builders.js';

function sourceEntity(map, entityId, entityLabel, sourceTitle) {
  const entity = map.get(entityId);
  if (!entity) throw new Error(`${sourceTitle}: ${entityLabel} fehlt: ${entityId}`);
  return entity;
}

export function createMigrationHouseSource(sourceFamily) {
  const sourceTitle = sourceFamily?.document?.title || 'Herkunftsfamilie';
  const originFamilyId = sourceFamily?.document?.id || '';
  const personById = new Map((sourceFamily?.persons || []).map(person => [person.id, person]));
  const partnershipById = new Map((sourceFamily?.partnerships || []).map(partnership => [partnership.id, partnership]));
  const houseById = new Map((sourceFamily?.houses || []).map(house => [house.id, house]));

  return Object.freeze({
    person(personId, overrides = {}) {
      const source = sourceEntity(personById, personId, 'Quellperson', sourceTitle);
      return createFamilyPerson({
        ...source,
        ...overrides,
        worldPersonId: source.worldPersonId,
        tags: [...source.tags],
        extensions: {
          ...source.extensions,
          ...(overrides.extensions || {}),
          originFamilyId,
          originPersonId: personId
        }
      });
    },

    partnership(partnershipId) {
      const source = sourceEntity(partnershipById, partnershipId, 'Quellpartnerschaft', sourceTitle);
      return {
        ...source,
        participantIds: [...source.participantIds],
        extensions: { ...source.extensions }
      };
    },

    parentage(childId, partnershipId) {
      const source = (sourceFamily?.parentages || []).find(parentage => (
        parentage.childId === childId && parentage.partnershipId === partnershipId
      ));
      if (!source) throw new Error(`${sourceTitle}: Quellabstammung fehlt: ${childId}`);
      return {
        ...source,
        parentIds: [...source.parentIds],
        extensions: { ...source.extensions }
      };
    },

    house(houseId) {
      const source = sourceEntity(houseById, houseId, 'Quellhaus', sourceTitle);
      return { ...source };
    }
  });
}
