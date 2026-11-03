import assert from 'node:assert/strict';
import { itemDefinitionKey } from '../item-definitions/item-definition-model.js';
export const SILBERHIRSCH_TEMPLATE_ID = 'gwynthor-seven:rianna-silberhirsch';
export const SILBERHIRSCH_OWNER_ID = 'vk0xAa3ZcEhVvGC1CzNq';
export const SILBERHIRSCH_PREVIOUS_OWNER_ID = 'person--haus-wyrm--rianna-wyrm';
export const isSilberhirsch = item => item.definitionRef?.id === SILBERHIRSCH_TEMPLATE_ID || item.templateId === SILBERHIRSCH_TEMPLATE_ID;

// Correct the owner of the existing physical coin. Never grant a second coin,
// consume resources or alter unrelated equipment and money.
export function planSilberhirschOwnerCorrection({ previousOwner, owner, template, now }) {
  assert.equal(previousOwner.id, SILBERHIRSCH_PREVIOUS_OWNER_ID); assert.equal(owner.id, SILBERHIRSCH_OWNER_ID);
  assert.equal(previousOwner.name, 'Rianna Wyrm'); assert.equal(owner.name, 'Oweta Draig');
  assert.equal(template.id, SILBERHIRSCH_TEMPLATE_ID); assert(template.definitionRef);
  assert(Number.isFinite(Date.parse(now)));
  const previousCoins = previousOwner.inventory.items.filter(isSilberhirsch), ownedCoins = owner.inventory.items.filter(isSilberhirsch);
  if (!previousCoins.length && ownedCoins.length === 1) {
    assert.equal(itemDefinitionKey(ownedCoins[0].definitionRef), itemDefinitionKey(template.definitionRef));
    assert.equal(ownedCoins[0].ownerCharacterId, owner.id);
    return { changed: false, characters: [structuredClone(previousOwner), structuredClone(owner)], itemId: ownedCoins[0].id };
  }
  assert.equal(previousCoins.length, 1, 'Genau ein bestehender Silberhirsch wird erwartet.');
  assert.equal(ownedCoins.length, 0, 'Oweta besitzt bereits einen Silberhirsch.');
  const coin = structuredClone(previousCoins[0]); assert.equal(Number(coin.quantity), 1);
  const from = structuredClone(previousOwner), to = structuredClone(owner);
  from.inventory.items = from.inventory.items.filter(item => item.id !== coin.id);
  Object.assign(coin, { name: template.title, templateName: template.title, description: template.description,
    definitionRef: structuredClone(template.definitionRef), image: template.image, ownerCharacterId: owner.id, ownerCharacterName: owner.name });
  if (coin.icon) coin.icon = template.image;
  to.inventory.items.push(coin);
  const fields = new Map();
  for (const character of [from, to]) {
    character.inventory.revision = Math.max(Date.parse(now), Number(character.inventory.revision || 0) + 1);
    character.updatedAt = now;
    fields.set(character.id, ['inventory', 'updatedAt']);
  }
  if (from.combatProfile?.equipmentPassiveEffects?.some(effect => effect.itemId === coin.id)) {
    from.combatProfile.equipmentPassiveEffects = from.combatProfile.equipmentPassiveEffects.filter(effect => effect.itemId !== coin.id);
    from.combatProfile.revision = Math.max(Date.parse(now), Number(from.combatProfile.revision || 0) + 1);
    fields.get(from.id).push('combatProfile.equipmentPassiveEffects', 'combatProfile.revision');
  }
  return { changed: true, characters: [from, to], fieldPaths: Object.fromEntries(fields), itemId: coin.id };
}
