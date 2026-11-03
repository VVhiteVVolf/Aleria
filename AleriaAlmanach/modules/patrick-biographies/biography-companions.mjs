import { createHouseholdCompanion } from '../creatures/catalog/household-companion-profiles.js';
import { sanitizeCreature } from '../creatures/creature-model.js';
import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from './biography-identities.mjs';

// Only details explicitly supplied in the current public biographies are authored here.
// Existing originals remain the default artwork. No age, sex or special training is inferred.
export const PATRICK_BIOGRAPHY_PETS = Object.freeze([
  Object.freeze({ ownerId: CADOGAN_CHARACTER_ID, ownerSlug: 'cadogan-sgrechiwr', slug: 'silberstolz',
    name: 'Silberstolz', species: 'Erlenglanz-Pferd', profile: 'horse', house: 'Haus Sgrechiwr',
    // Existing Erlenglanz scheme, also used by Rhoslyn; no inferred veteran levels.
    scores: Object.freeze([10, 18, 10, 2, 12, 16]), movement: 21,
    portrait: 'https://i.imgur.com/MeLpICX.png', bestiaryId: 'tiere/pferde/erlenglanz',
    description: 'Silberstolz ist Cadogan Sgrechiwrs Erlenglanz. Alter, Geschlecht und besondere Ausbildung sind nicht festgelegt.' }),
  Object.freeze({ ownerId: RHIANNON_CHARACTER_ID, ownerSlug: 'rhiannon-draenmelyn', slug: 'perle',
    name: 'Perle', species: 'Rhyfel-Pferd', profile: 'horse', house: 'Haus Swyll',
    portrait: 'https://i.imgur.com/gNI7qWb.png', bestiaryId: 'tiere/pferde/rhyfel',
    description: 'Perle ist Rhiannon Swylls, geborene Draenmelyn, Rhyfel. Alter, Geschlecht und besondere Ausbildung sind nicht festgelegt.' }),
  Object.freeze({ ownerId: GWEN_CHARACTER_ID, ownerSlug: 'gwen-hamnett', slug: 'sir-balthasar',
    name: 'Sir Balthasar', species: 'Samtlicht-Kater', profile: 'cat', house: '', sex: 'männlich',
    portrait: 'https://i.imgur.com/2pejsG8.png', bestiaryId: 'tiere/vieh/haustiere/katzen/samtlicht',
    description: 'Sir Balthasar ist Gwen Hamnetts geliebter, kostspieliger Samtlicht-Kater aus Weisenfluh. Eluned und Meinwen verliehen ihm als Kinder den Namenstitel „Sir“. Er sucht Gwens Nähe und hält sich gerne in ihrem Atelier auf. Alter und besondere Ausbildung sind nicht festgelegt.' }),
  Object.freeze({ ownerId: GWEN_CHARACTER_ID, ownerSlug: 'gwen-hamnett', slug: 'sonnenaufgang',
    name: 'Sonnenaufgang', species: 'Goldmähne-Pferd', profile: 'horse', house: '',
    portrait: 'https://i.imgur.com/LJnHgjt.jpeg', bestiaryId: 'tiere/pferde/goldmaehne',
    description: 'Sonnenaufgang ist Gwen Hamnetts Goldmähne. Alter, Geschlecht und besondere Ausbildung sind nicht festgelegt.' }),
]);

export function getPatrickBiographyPetSpecs(ownerId) {
  if (!ownerId) return [];
  return PATRICK_BIOGRAPHY_PETS.filter(spec => spec.ownerId === ownerId);
}

export function createPatrickBiographyCompanion(spec, owner, now, assetMap = {}) {
  if (!Number.isFinite(Date.parse(now))) throw new Error('Ein gültiger Planzeitpunkt fehlt.');
  if (!owner?.id || !spec.ownerId || owner.id !== spec.ownerId) throw new Error('Die Tierbesitzerzuordnung widerspricht der belegten Person.');
  const portrait = assetMap[`pet:${spec.slug}`] || spec.portrait;
  const source = createHouseholdCompanion({ ...spec, ownerId: owner.id, ownerName: owner.name,
    level: 1, location: 'Gwynthor', habitat: 'Gwynthor · Celtigerns Wacht', portrait });
  const creature = sanitizeCreature({ ...source, needsStatReview: true,
    bestiaryReference: { id: spec.bestiaryId }, createdAt: now, updatedAt: now,
    biography: { ...source.biography,
      facts: [...source.biography.facts, { label: 'Besitzer', value: owner.name },
        ...(spec.sex ? [{ label: 'Geschlecht', value: spec.sex }] : [])],
      connections: [{ type: 'connection', name: owner.name, image: owner.portrait || '', detail: 'Belegter Besitzer.' }] },
  });
  if (creature.bestiaryReference?.id !== spec.bestiaryId) throw new Error(`Bestiarium-Verweis fehlt: ${spec.name}`);
  return creature;
}
