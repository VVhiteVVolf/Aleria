import assert from 'node:assert/strict';
import { attachCreatureToInventory } from '../creatures/creature-companion-link.js';
import { sanitizeCharacterBiographyForFirestore, stampFreshRevisions } from '../characters/character-save-guard.js';
import { decorateBronaBiography } from './brona-biography-icons.mjs';
import { createBronaCompanions } from './brona-companions.mjs';

// This editorial plan owns only Brona's biography and the two linked animals.
// Persistence, concurrency checks and encrypted backup belong to the existing
// biography publication service; this function performs no I/O.
export function planBronaBiography(character, source, now = new Date().toISOString()) {
  assert(Number.isFinite(Date.parse(now)), 'Ungültiger Planzeitpunkt.');
  const biography = decorateBronaBiography(character, source);
  const creatures = createBronaCompanions(character, source, now);
  let inventory = structuredClone(character.inventory || {});
  for (const creature of creatures) {
    inventory = attachCreatureToInventory({ ...character, inventory }, creature, now);
    // Both are ridden animals; the common linker defaults non-horses to pets.
    inventory.companions.find(card => card.creatureId === creature.id).role = 'Reittier';
  }
  const revision = Math.max(Date.parse(now), Number(character.biography?.revision || 0) + 1,
    Number(character.inventory?.revision || 0) + 1);
  const patch = sanitizeCharacterBiographyForFirestore(stampFreshRevisions({ biography, inventory, updatedAt: now },
    ['biography', 'inventory'], revision));
  return { id: character.id, patch, creatures };
}
