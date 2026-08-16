import {
  isExclusiveActivePartnership
} from './exclusive-partnership-policy.js';

const ACTIVE_STATUSES = new Set(['active', 'secret']);
const SEPARABLE_TYPES = new Set(['marriage', 'engagement', 'union', 'affair', 'concubinage', 'forced']);

function personById(family, personId) {
  return family.persons.find(person => person.id === personId) || null;
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
      })
    })
  });
}

export function partnerCandidateAvailability(family, personId, action) {
  if (action !== 'betroth') return Object.freeze({ enabled: true, reason: '' });
  const reason = engagementBlock(family, personId);
  return Object.freeze({ enabled: !reason, reason });
}
