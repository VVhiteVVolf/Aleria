import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { parseBiographyImportPayload } from '../../../js/biography/biography-transfer.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { attachCreatureToInventory } from '../creatures/creature-companion-link.js';
import { CARALYN_CHARACTER_ID, createCaralynCompanion } from './caralyn-companion.js';

const ICONS = Object.freeze({ Bodenständig: 'Content', Warmherzig: 'Kind', Pflichtbewusst: 'Diligent',
  Selbstbewusst: 'Brave', Bescheiden: 'Humble', Aufrichtig: 'Honest', Traditionsbewusst: 'Conscientious',
  Gutgläubig: 'Trusting', Umsichtig: 'Patient', Humorvoll: 'Gregarious' });

export function planCaralynBiography(character, source, now) {
  assert.equal(character.id, CARALYN_CHARACTER_ID);
  assert.equal(source.characterId, character.id);
  assert(Number.isFinite(Date.parse(now)));
  const biography = parseBiographyImportPayload(source.biography);
  const bio = biography.biography;
  bio.portrait ||= character.portrait || '';
  assert.equal(bio.abilities.length, 10);
  bio.abilities = bio.abilities.map(ability => {
    assert(ICONS[ability.title], `Ungeprüfte Eigenschaft: ${ability.title}`);
    return { ...ability, icon: `/IconOrdner/Traits%20Icon/${ICONS[ability.title]}.png` };
  });
  bio.connections = bio.connections.map(connection => connection.name === 'Eure Blubbrigkeit'
    ? { ...connection, detail: 'Goldfisch · biografische Erwähnung' } : connection.name === 'Eure Hufigkeit'
      ? { ...connection, detail: 'Reitpferd · vermutlich Rhyfel' } : connection);
  const creature = createCaralynCompanion(now);
  let inventory = attachCreatureToInventory(character, creature, now);
  if (!isDeepStrictEqual(inventory, character.inventory)) inventory = { ...inventory, revision: Math.max(Date.parse(now), (character.inventory?.revision || 0) + 1) };
  const patch = sanitizeCharacterBiographyForFirestore({ biography, inventory, updatedAt: now });
  return { id: character.id, patch, creatures: [creature] };
}
