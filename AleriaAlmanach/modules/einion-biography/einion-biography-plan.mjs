import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { EINION_BIOGRAPHY, EINION_CHARACTER_ID } from './einion-biography.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';

const ITEMS = Object.freeze([
  { slug: 'sir-eichenbein', name: 'Sir Eichenbein', type: 'Stuhl',
    description: 'Einions Stuhl in seinen Gemächern. In seinen erfundenen Geschichten ist Sir Eichenbein der Verteidiger des Westturms und getreue Beschützer seiner Gemächer.' },
  { slug: 'lord-schmusedecke', name: 'Lord Schmusedecke', type: 'Beschädigte Decke',
    description: 'Einions persönliche Decke, in seinen Geschichten ein gefallener Freund und treuer Gefährte in kalten Nächten. Einion macht Carys für das Ende seines erfundenen Helden verantwortlich.' }
]);

// Editorial ownership is limited to this biography and two physical keepsakes.
// Greif already has a live creature and inventory binding. No creature is created.
export function planEinionBiography(character, now = new Date().toISOString()) {
  assert.equal(character.id, EINION_CHARACTER_ID);
  assert(Number.isFinite(Date.parse(now)));
  const inventory = structuredClone(character.inventory);
  assert(Array.isArray(inventory?.items) && Array.isArray(inventory.companions));
  const greifItems = inventory.items.filter(item => item.creatureId === 'companion-einion-greif');
  const greifCards = inventory.companions.filter(card => card.creatureId === 'companion-einion-greif');
  assert.equal(greifItems.length, 1, 'Greifs bestehender Inventarbesitz fehlt oder ist mehrdeutig.');
  assert.equal(greifCards.length, 1, 'Greifs bestehende Gefährtenkarte fehlt oder ist mehrdeutig.');
  assert.equal(greifItems[0].ownerCharacterId, character.id);
  assert.equal(greifCards[0].inventoryItemId, greifItems[0].id);
  for (const spec of ITEMS) {
    const id = `einion-${spec.slug}`;
    const existing = inventory.items.filter(item => item.id === id || item.name === spec.name);
    assert(existing.length <= 1, `Mehrdeutiger persönlicher Gegenstand: ${spec.name}`);
    if (existing.length) {
      assert.equal(existing[0].id, id);
      assert.equal(existing[0].ownerCharacterId, character.id);
      continue;
    }
    inventory.items.push({ id, instanceId: id, name: spec.name, type: spec.type,
      category: 'other', quantity: '1', description: spec.description,
      image: `/AleriaAlmanach/assets/einion-biography/${spec.slug}-v1.jpeg`,
      imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center',
      ownerCharacterId: character.id, ownerCharacterName: character.name,
      itemStorageMode: 'character', attributes: [], infoRows: [], tags: 'Persönlicher Gegenstand, Heldentruppe',
      acquiredAt: now });
  }
  const biography = sanitizeCharacterBiographyForFirestore({ biography: structuredClone(EINION_BIOGRAPHY) }).biography;
  const previousBiography = structuredClone(character.biography || {});
  delete previousBiography.revision;
  const patch = {};
  if (!isDeepStrictEqual(biography, previousBiography)) {
    patch.biography = { ...biography, revision: Math.max(Date.parse(now), Number(character.biography?.revision || 0) + 1) };
  }
  if (!isDeepStrictEqual(inventory, character.inventory)) {
    patch.inventory = { ...inventory, revision: Math.max(Date.parse(now), Number(character.inventory.revision || 0) + 1) };
  }
  if (Object.keys(patch).length) patch.updatedAt = now;
  return { id: character.id, patch: sanitizeCharacterBiographyForFirestore(patch), creatures: [] };
}
