import { presentPartnership } from '../../domain/partnership-presentation.js';

const CHILD_TYPES = new Set(['biological', 'adoptive', 'magical', 'claimed']);

export function buildRelationshipPartnershipGroups(graph, personId) {
  const partnerships = graph.getPartnerships(personId);
  const groups = partnerships.map(partnership => {
    const children = graph.getChildren(personId, { types: [...CHILD_TYPES] }).flatMap(person => {
      const parentages = graph.getParentages(person.id).filter(parentage => CHILD_TYPES.has(parentage.type));
      const parentage = parentages.find(parentage => parentage.partnershipId === partnership.id)
        || parentages.find(parentage => !parentage.partnershipId
          && partnership.participantIds.every(id => parentage.parentIds.includes(id))
          && partnerships.filter(candidate => candidate.participantIds.every(id => parentage.parentIds.includes(id))).length === 1);
      return parentage ? [{ person, type: parentage.type, legitimacy: parentage.legitimacy }] : [];
    });
    return Object.freeze({
      partnership,
      presentation: presentPartnership(partnership),
      partners: Object.freeze(partnership.participantIds.filter(id => id !== personId).map(id => graph.getPerson(id)).filter(Boolean)),
      children: Object.freeze(children)
    });
  });
  const assignedIds = new Set(groups.flatMap(group => group.children.map(child => child.person.id)));
  return Object.freeze({
    groups: Object.freeze(groups),
    unassignedChildren: Object.freeze(graph.getChildren(personId, { types: [...CHILD_TYPES] }).filter(child => !assignedIds.has(child.id)))
  });
}
