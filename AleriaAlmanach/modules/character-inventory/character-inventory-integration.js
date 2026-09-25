import { indexInventoryTemplates, resolveInventoryItem, inventoryCompanionViews, isInventoryCompanion } from './character-inventory-identity.js?v=20260925-creature-biography-v1';
import { inventoryCardModel } from './character-inventory-card-model.js';

function context(data) {
  const snapshot = globalThis.AleriaItemRegister?.store.snapshot();
  return {
    character: globalThis.getCharacterById?.(data.characterId)
      || snapshot?.characters.find(character => character.id === data.characterId) || { id: data.characterId },
    templates: indexInventoryTemplates(snapshot ? [...snapshot.standards, ...snapshot.offers] : []),
    creatures: [...new Map([...(snapshot?.creatures || []), ...(globalThis.AleriaCreatures?.getAll?.() || [])]
      .map(creature => [creature.id, creature])).values()]
  };
}

// One adapter for the legacy page renderer; no second inventory state or backend.
globalThis.AleriaCharacterInventory = Object.freeze({
  resolve(data) {
    const sources = context(data);
    return { ...data, items: data.items.map(item => resolveInventoryItem(item, sources)) };
  },
  companions: data => inventoryCompanionViews(data, context(data).creatures),
  isCompanion: isInventoryCompanion,
  card: inventoryCardModel
});

let refreshQueued = false;
function refreshVisibleInventory() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    document.querySelectorAll('.character-inventory-page').forEach(page => {
      // The draft is authoritative while editing. Only the read projection refreshes.
      globalThis.refreshCharacterInventoryPresentation?.(page);
    });
  });
}
window.addEventListener('item-db-store-updated', refreshVisibleInventory);
document.addEventListener('aleria:creatures-changed', refreshVisibleInventory);
refreshVisibleInventory();
