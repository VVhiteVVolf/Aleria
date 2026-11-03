import { createHouseholdCompanion } from '../creatures/catalog/household-companion-profiles.js';
import { sanitizeCreature } from '../creatures/creature-model.js';

export const CARALYN_CHARACTER_ID = 'Eka4z7TWpzEgx8KjhIzy';
export function createCaralynCompanion(now = '2026-11-02T21:56:46.359Z') {
  const description = 'Eure Hufigkeit ist Caralyn Chwedonols persönliches Reitpferd, nach aktueller Nutzerzuordnung vermutlich ein Rhyfel. Die Rassenzuordnung bleibt vorläufig; Alter und Geschlecht sind nicht festgelegt. Die vorhandenen allgemeinen Pferdegrundwerte bleiben erhalten.';
  const source = createHouseholdCompanion({ profile: 'horse', slug: 'eure-hufigkeit', ownerSlug: 'caralyn',
    name: 'Eure Hufigkeit', species: 'Rhyfel (vermutlich)', level: 1, ownerId: CARALYN_CHARACTER_ID, ownerName: 'Caralyn Chwedonol',
    location: 'Gwynthor', house: 'Haus Chwedonol', habitat: 'Gwynthor und Glastraeth · Haus Chwedonol',
    portrait: 'https://i.imgur.com/c69AFl9.png', description });
  return sanitizeCreature({ ...source, createdAt: now, updatedAt: now });
}
