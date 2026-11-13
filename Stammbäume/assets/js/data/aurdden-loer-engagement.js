import { createFamilyPerson, createMarriage } from './family-record-builders.js';
import { HOUSE_LOER_PORTRAITS } from './house-loer-portraits.js';
import { AURDDEN_FAMILY_PEOPLE } from './aurdden-people.js';
import { HOUSE_AURDDEN_PORTRAITS } from './house-aurdden-portraits.js';
import { preserveSourceMetadataBoundaries } from './source-family-field-upgrade.js';

export const AURDDEN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Aurdden/aurdden-emblem.png';
export const AURDDEN_HOUSE_ID = 'house-aurdden';
export const AURDDEN_LOER_ENGAGEMENT_ID = 'engagement-aeron-loer-avelin-aurdden';

export function createAurddenPerson(source) {
  return createFamilyPerson({ ...source,
    portrait: HOUSE_AURDDEN_PORTRAITS[source.id] || source.portrait || '',
    houseId: source.spouse || source.bastard ? '' : AURDDEN_HOUSE_ID,
    familyRole: source.bastard ? 'bastard' : source.spouse ? 'married' : 'core',
    lineageRole: source.lineageRole || 'branch',
    tags: source.engagedAway ? ['An Haus Loer wegverlobt'] : source.marriedAway ? ['Wegverheiratet'] : [],
    extensions: { authoredSource: 'aurdden-20261109',
      ...(source.branch === 'bank' ? { portraitIntentionallyAbsent: true, aurddenBranch: 'bank' } : {}) }
  });
}

export const AURDDEN_AERON_LOER = Object.freeze(createFamilyPerson({
  id: 'aeron-loer', name: 'Aeron Loer', sex: 'male', birth: '1712', death: '',
  houseId: 'house-loer', worldPersonId: 'person--haus-loer--aeron-loer',
  portrait: HOUSE_LOER_PORTRAITS['aeron-loer'], familyRole: 'married', lineageRole: 'mainline'
}));

export function createAurddenLoerEngagement(counterpartFamilyId) {
  return createMarriage(AURDDEN_LOER_ENGAGEMENT_ID, 'aeron-loer', 'avelin-aurdden', {
    type: 'engagement', start: '1740',
    notes: 'Aeron Loer (28) und Avelin Aurdden (27) sind verlobt. Avelin ist an Haus Loer wegverlobt und hat keine Ladenaufgabe. Die Ehe ist noch nicht geschlossen.',
    extensions: { crossFamilyRelationship: { linkId: AURDDEN_LOER_ENGAGEMENT_ID, counterpartFamilyId } }
  });
}

/** Add one authorised engagement without reopening existing Loer genealogy. */
export function withAurddenLoerEngagement(source) {
  if (source.partnerships.some(relation => relation.id === AURDDEN_LOER_ENGAGEMENT_ID)) return source;
  const aeron = source.persons.find(person => person.id === 'aeron-loer');
  if (!aeron || aeron.worldPersonId !== AURDDEN_AERON_LOER.worldPersonId) throw new Error('Kanonischer Aeron Loer fehlt.');
  if (source.partnerships.some(relation => relation.participantIds.includes(aeron.id)
    && relation.status === 'active' && ['marriage', 'engagement', 'union'].includes(relation.type))) {
    throw new Error('Aeron Loer besitzt bereits eine exklusive Verbindung.');
  }
  const bounded = preserveSourceMetadataBoundaries(source);
  const revision = 4;
  const avelin = createAurddenPerson(AURDDEN_FAMILY_PEOPLE.find(person => person.id === 'avelin-aurdden'));
  return Object.freeze({ ...bounded,
    persons: [...source.persons, { ...avelin, familyRole: 'married', extensions: { ...avelin.extensions, registryManagedSourceRevision: revision } }],
    houses: [...source.houses, { id: AURDDEN_HOUSE_ID, name: 'Familie Aurdden', motto: '', emblem: AURDDEN_EMBLEM, status: 'active', extensions: { registryManagedSourceRevision: revision } }],
    partnerships: [...source.partnerships, createAurddenLoerEngagement('haus-aurdden')],
    extensions: { ...bounded.extensions, sourceRevision: revision,
      registryManagedEntitySourceRevision: source.extensions.registryManagedEntitySourceRevision ?? source.extensions.sourceRevision,
      aurddenEngagementInventory: 'aurdden-20261109',
      registryManagedExtensionFields: [...new Set([...(bounded.extensions.registryManagedExtensionFields || []), 'aurddenEngagementInventory'])],
      registryManagedExtensionFieldRevisions: { ...bounded.extensions.registryManagedExtensionFieldRevisions, aurddenEngagementInventory: revision }
    }
  });
}
