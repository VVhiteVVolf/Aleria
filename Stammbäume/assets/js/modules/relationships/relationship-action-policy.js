import {
  isExclusiveActivePartnership
} from './exclusive-partnership-policy.js';

const ACTIVE_STATUSES = new Set(['active', 'secret']);
const SEPARABLE_TYPES = new Set(['marriage', 'engagement', 'union', 'affair', 'concubinage', 'forced']);

function personById(family, personId) {
  return family.persons.find(person => person.id === personId) || null;
}

function hasCrossFamilyLink(record) {
  return Boolean(
    record?.extensions?.crossFamilyRelationship?.linkId
    || record?.extensions?.crossFamilyGuardianship?.linkId
  );
}

export function personHasMirroredConnections(family, personId) {
  if (hasCrossFamilyLink(personById(family, personId))) return true;
  if (family.partnerships.some(partnership => (
    partnership.participantIds.includes(personId) && hasCrossFamilyLink(partnership)
  ))) return true;
  if (family.parentages.some(parentage => (
    (parentage.childId === personId || parentage.parentIds.includes(personId))
    && hasCrossFamilyLink(parentage)
  ))) return true;
  return family.cadetBranches.some(branch => (
    branch.parentPersonId === personId && hasCrossFamilyLink(branch)
  ));
}

function engagementBlock(family, personId) {
  const active = family.partnerships.filter(partnership => (
    partnership.participantIds.includes(personId)
    && partnership.type === 'engagement'
    && isExclusiveActivePartnership(partnership)
  ));
  if (!active.length) return '';
  const names = active.flatMap(partnership => partnership.participantIds)
    .filter(id => id !== personId)
    .map(id => personById(family, id)?.name || id)
    .join(', ');
  return `Bereits mit ${names} verlobt. Das Verlöbnis zuerst umwandeln, beenden oder vollständig entfernen.`;
}

export function relationshipActionState(family, personId) {
  const person = personById(family, personId);
  if (!person) throw new Error('Die Person wurde nicht gefunden.');
  const partnerships = family.partnerships.filter(partnership => partnership.participantIds.includes(personId));
  const engagements = partnerships.filter(partnership => (
    partnership.type === 'engagement' && ACTIVE_STATUSES.has(partnership.status || 'active')
  ));
  const separable = partnerships.filter(partnership => (
    SEPARABLE_TYPES.has(partnership.type) && ACTIVE_STATUSES.has(partnership.status || 'active')
  ));
  const removableParentages = family.parentages.filter(parentage => (
    parentage.childId === personId || parentage.parentIds.includes(personId)
  ));
  const hasMirroredGuardianship = Boolean(person.extensions?.crossFamilyGuardianship?.linkId)
    || removableParentages.some(parentage => parentage.extensions?.crossFamilyGuardianship?.linkId);
  const betrothalBlock = engagementBlock(family, personId);
  const alreadySent = person.familyRole === 'ward-away'
    || family.cadetBranches.some(branch => branch.linkType === 'ward-away' && branch.parentPersonId === personId);
  const mirroredConnections = personHasMirroredConnections(family, personId);
  return Object.freeze({
    person,
    partnerships,
    engagements,
    separable,
    removablePartnerships: partnerships,
    removableParentages,
    hasMirroredGuardianship,
    actionAvailability: Object.freeze({
      marry: Object.freeze({ enabled: true, reason: '' }),
      betroth: Object.freeze({ enabled: !betrothalBlock, reason: betrothalBlock }),
      affair: Object.freeze({ enabled: true, reason: '' }),
      'send-ward': Object.freeze({
        enabled: !alreadySent,
        reason: alreadySent ? 'Diese Person ist bereits als fortgegebenes Mündel verzeichnet.' : ''
      }),
      'delete-current-person': Object.freeze({
        enabled: !mirroredConnections,
        reason: mirroredConnections
          ? 'Zuerst die gespiegelten Ehen, Affären oder Mündelverknüpfungen entfernen. So bleibt die Gegenakte konsistent.'
          : ''
      })
    })
  });
}

function partnershipTypeForAction(action) {
  if (action === 'marry') return 'marriage';
  if (action === 'betroth') return 'engagement';
  if (action === 'affair') return 'affair';
  return '';
}

export function partnerCandidateAvailability(family, personId, action, referencePersonId = '') {
  const relationshipType = partnershipTypeForAction(action);
  if (referencePersonId && relationshipType) {
    const duplicate = family.partnerships.find(partnership => (
      partnership.type === relationshipType
      && ACTIVE_STATUSES.has(partnership.status || 'active')
      && partnership.participantIds.includes(referencePersonId)
      && partnership.participantIds.includes(personId)
    ));
    if (duplicate) {
      return Object.freeze({
        enabled: false,
        reason: 'Diese aktive Verbindung ist bereits eingetragen.'
      });
    }
  }
  if (action !== 'betroth') return Object.freeze({ enabled: true, reason: '' });
  const reason = engagementBlock(family, personId);
  return Object.freeze({ enabled: !reason, reason });
}
