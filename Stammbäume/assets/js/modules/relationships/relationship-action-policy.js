import {
  isExclusiveActivePartnership,
  isReplaceableRelationshipPlaceholder
} from './exclusive-partnership-policy.js';

const ACTIVE_STATUSES = new Set(['active', 'secret']);
const SEPARABLE_TYPES = new Set(['marriage', 'engagement', 'union', 'affair', 'concubinage', 'forced']);

function personById(family, personId) {
  return family.persons.find(person => person.id === personId) || null;
}

function partnerNames(family, partnerships, personId) {
  return [...new Set(partnerships.flatMap(partnership => (
    partnership.participantIds
      .filter(id => id !== personId)
      .map(id => personById(family, id)?.name || id)
  )))].join(', ');
}

function exclusiveBlock(family, personId) {
  const active = family.partnerships.filter(partnership => (
    partnership.participantIds.includes(personId) && isExclusiveActivePartnership(partnership)
  ));
  const real = active.filter(partnership => partnership.participantIds
    .filter(id => id !== personId)
    .some(id => !isReplaceableRelationshipPlaceholder(personById(family, id))));
  if (!real.length) return '';
  const names = partnerNames(family, real, personId);
  if (real.some(partnership => partnership.type === 'marriage')) {
    return `Bereits mit ${names} verheiratet. Zuerst die bestehende Verbindung lösen; Affären bleiben möglich.`;
  }
  if (real.some(partnership => partnership.type === 'engagement')) {
    return `Bereits mit ${names} verlobt. Das Verlöbnis zuerst umwandeln oder lösen.`;
  }
  return `Bereits in einer aktiven Verbindung mit ${names}. Diese Verbindung zuerst bearbeiten oder lösen.`;
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
  const block = exclusiveBlock(family, personId);
  const alreadySent = person.familyRole === 'ward-away'
    || family.cadetBranches.some(branch => branch.linkType === 'ward-away' && branch.parentPersonId === personId);
  return Object.freeze({
    person,
    partnerships,
    engagements,
    separable,
    exclusiveBlock: block,
    actionAvailability: Object.freeze({
      marry: Object.freeze({ enabled: !block, reason: block }),
      betroth: Object.freeze({ enabled: !block, reason: block }),
      affair: Object.freeze({ enabled: true, reason: '' }),
      'send-ward': Object.freeze({
        enabled: !alreadySent,
        reason: alreadySent ? 'Diese Person ist bereits als fortgegebenes Mündel verzeichnet.' : ''
      })
    })
  });
}

export function partnerCandidateAvailability(family, personId, action) {
  if (!['marry', 'betroth'].includes(action)) return Object.freeze({ enabled: true, reason: '' });
  const reason = exclusiveBlock(family, personId);
  return Object.freeze({ enabled: !reason, reason });
}
