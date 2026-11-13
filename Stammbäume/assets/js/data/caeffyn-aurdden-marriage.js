import { createFamilyPerson, createMarriage, createMarriedAwayBranch } from './family-record-builders.js';
import { preserveSourceMetadataBoundaries } from './source-family-field-upgrade.js';
import { MAELRIG_CAEFFYN, CAEFFYN_EMBLEM, STUD_PORTRAITS } from './gwynthor-horse-studs/stud-roster.mjs';
export { CAEFFYN_EMBLEM, MAELRIG_CAEFFYN };
export const KYRIA_MARRIAGE_ID = 'marriage-maelrig-caeffyn-kyria-aurdden';
export const KYRIA_STUD_ASSIGNMENT = Object.freeze({
  title: 'Hofverwalterin · Finanzen von Rhosmeres Rösser – Gwynthor', branch: 'rhosmere', marriedAway: true,
  portrait: STUD_PORTRAITS['kyria-aurdden'], portraitNeeded: true,
  notes: '19 Jahre. Tochter Pereth Aurddens und Uffyrias. Die im Bankzweig gelernte geschäftliche Korrespondenz bildet die Grundlage ihrer neuen Aufgabe. Sie ist mit Maelrig Caeffyn verheiratet und führt als Hofverwalterin die Finanzen der Gwynthorer Niederlassung von Rhosmeres Rösser. Sie prüft Rechnungen, Verträge, vereinbarte Beteiligungen und die getrennten Eigentumsnachweise der Pferde. Ihre frühere Korrespondenzstelle im Aurdden-Bankzweig ist frei; das Paar hat noch keine Kinder.'
});
export function createMaelrigCaeffyn(familyRole = 'core') { return createFamilyPerson({ ...MAELRIG_CAEFFYN, familyRole,
  extensions: { authoredSource: 'gwynthor-horse-studs-20261113', registryManagedFields: ['name', 'title', 'portrait', 'notes'] } }); }
export function createKyriaCaeffynMarriage(counterpartFamilyId) {
  return createMarriage(KYRIA_MARRIAGE_ID, MAELRIG_CAEFFYN.id, 'kyria-aurdden', { start: '1740', status: 'active',
    notes: 'Maelrig Caeffyn und Kyria Aurdden sind verheiratet und leben in Gwynthor. Noch keine Kinder. Kyria ist an Familie Caeffyn wegverheiratet; ihre Aurdden-Abstammung und Weltidentität bleiben erhalten.',
    extensions: { crossFamilyRelationship: { linkId: KYRIA_MARRIAGE_ID, counterpartFamilyId } } });
}
export function withKyriaCaeffynMarriage(source) {
  if (source.partnerships.some(p => p.id === KYRIA_MARRIAGE_ID)) return source;
  const kyria = source.persons.find(p => p.id === 'kyria-aurdden');
  if (!kyria || kyria.worldPersonId !== 'person--haus-aurdden--kyria-aurdden') throw Error('Kanonische Kyria Aurdden fehlt.');
  if (source.partnerships.some(p => p.participantIds.includes(kyria.id) && p.status === 'active' && ['marriage', 'engagement', 'union'].includes(p.type))) throw Error('Kyria besitzt bereits eine exklusive Verbindung.');
  const bounded = preserveSourceMetadataBoundaries(source), revision = 2;
  return Object.freeze({ ...bounded,
    persons: [...bounded.persons.map(p => p.id === kyria.id ? { ...p, extensions: { ...p.extensions,
      registryManagedSourceRevision: revision, registryManagedFields: ['title', 'notes', 'portrait', 'tags'],
      registryManagedFieldRevisions: { ...p.extensions?.registryManagedFieldRevisions, title: revision, notes: revision, portrait: revision, tags: revision },
      registryManagedExtensionFields: [...new Set([...(p.extensions?.registryManagedExtensionFields || []), 'portraitIntentionallyAbsent'])],
      registryManagedExtensionFieldRevisions: { ...p.extensions?.registryManagedExtensionFieldRevisions, portraitIntentionallyAbsent: revision },
      portraitIntentionallyAbsent: false } } : p), { ...createMaelrigCaeffyn('married'), extensions: { registryManagedSourceRevision: revision } }],
    houses: [...bounded.houses, { id: 'house-caeffyn', name: 'Familie Caeffyn', emblem: CAEFFYN_EMBLEM, status: 'active', motto: '', extensions: { registryManagedSourceRevision: revision } }],
    partnerships: [...bounded.partnerships, createKyriaCaeffynMarriage('haus-caeffyn')],
    cadetBranches: [...bounded.cadetBranches, createMarriedAwayBranch({ id: 'married-away-kyria-caeffyn', name: 'Familie Caeffyn', parentPartnershipId: KYRIA_MARRIAGE_ID,
      houseId: 'house-caeffyn', targetFamilyId: 'haus-caeffyn', notes: 'Kyria ist mit Maelrig Caeffyn verheiratet und verwaltet die Finanzen von Rhosmeres Rösser – Gwynthor.', extensions: { chartAlignBelowPartnership: true } })],
    extensions: { ...bounded.extensions, sourceRevision: revision, registryManagedEntitySourceRevision: source.extensions.sourceRevision,
      sourceNote: `${source.extensions.sourceNote} Nutzerentscheidung 13.11.2026: Kyria heiratet Maelrig Caeffyn und verlässt die Korrespondenzstelle des Bankzweigs; beidseitiger direkter Familienlink.` }
  });
}
