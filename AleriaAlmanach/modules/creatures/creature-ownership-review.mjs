import { attachCreatureToInventory } from './creature-companion-link.js';

export const REVIEWED_COMPANION_OWNERS = Object.freeze([
  { id: 'kJss0DGF1RLuVrrVCBQT', name: 'Idwal Draig', creatures: ['companion-idwal-distry', 'companion-idwal-drecksack'] },
  { id: 'fq586i4k2gj5Lg30dUwW', name: 'Anaraut Draig', creatures: ['companion-anaraut-merfyn', 'companion-anaraut-gwrgi'] },
  { id: 'person--haus-wyrm--gais-wyrm', name: 'Gais Wyrm', creatures: ['companion-gais-rabenstolz'], legacyCardNames: { 'companion-gais-rabenstolz': 'Rabenstolz' } },
  { id: 'person--haus-balchder--kamber-balchder', name: 'Kamber Balchder', creatures: ['companion-kamber-silberwind'] },
  { id: 'person--haus-wylan--neala-wylan', name: 'Neala Wylan', creatures: ['companion-neala-floeckchen'] }
]);

// This explicit review never changes a creature's owner or transfers an animal.
// Only the already confirmed owner's existing inventory is repaired.
export function reconcileReviewedCompanions(character, creatures, now) {
  const review = REVIEWED_COMPANION_OWNERS.find(row => row.id === character.id);
  if (!review || character.name !== review.name) throw Error('Die geprüfte Tierbesitzeridentität stimmt nicht überein.');
  let inventory = structuredClone(character.inventory || {});
  for (const id of review.creatures) {
    const matches = creatures.filter(creature => creature.id === id);
    if (matches.length !== 1 || matches[0].itemOrigin?.ownerCharacterId !== character.id) throw Error(`Keine eindeutige belegte Besitzzuordnung: ${id}`);
    inventory = attachCreatureToInventory({ ...character, inventory }, matches[0], now);
    const card = inventory.companions.find(card => card.creatureId === id);
    if (card?.name === review.legacyCardNames?.[id]) card.name = matches[0].name;
  }
  return { ...character, inventory };
}
