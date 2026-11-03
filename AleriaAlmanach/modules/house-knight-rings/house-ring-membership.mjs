import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';

export function hasWorkedInventory(character = {}) {
  return Array.isArray(character.inventory?.items)
    && character.inventory.items.some(item => !isInventoryPlaceholder(item));
}

// Callers supply canonical rank data and, where needed, the already linked local
// identity. Service, surnames and image colors never determine house membership.
export function resolveHouseSignetMembership(character, { families, ranks, knownCharacter } = {}) {
  const genealogy = character.genealogy?.houseId ? character.genealogy : knownCharacter?.genealogy || character.genealogy || {};
  const worldId = character.identity?.worldPersonId || genealogy.worldPersonId || knownCharacter?.identity?.worldPersonId || '';
  const knownWorldId = knownCharacter?.identity?.worldPersonId || '';
  if (worldId && knownWorldId && worldId !== knownWorldId) throw Error('Die bekannte Hausidentität gehört zu einer anderen Weltperson.');
  const requested = String(genealogy.houseId || '').replace(/^house-/, 'haus-');
  const family = families.find(entry => entry.id === requested)
    || families.filter(entry => worldId.startsWith(`person--${entry.id}--`)).sort((a,b) => b.id.length-a.id.length)[0];
  if (!family) return null;
  const rankId = family.houseProfile?.rankId || family.rankId || 'unknown';
  if (!(ranks[rankId]?.order <= ranks.knight.order)) return null;
  return { familyId: family.id, familyName: family.title || family.name, rankId, worldPersonId: worldId };
}

export function personalSignetName(characterName) {
  const name = String(characterName || '').trim().replace(/^(?:Sir|Dame|Lady|Lord)\s+/i, '');
  if (!name) throw Error('Der Siegelring benötigt einen benannten Besitzer.');
  return name === 'Der Schwarze Zitteraal' ? 'Zitteraal Siegelring' : `${name.split(/\s+/)[0]} Siegelring`;
}
