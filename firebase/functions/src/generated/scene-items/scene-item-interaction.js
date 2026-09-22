import { choosePickupResource } from './scene-items-model.js';
import { applyCombatResourceCosts } from '../combat/combat-state-model.js';
import { inferInventoryUseMode, normalizeInventoryUse, getInventoryItemQuantity } from '../inventory-use/inventory-use-model.js';
import { synchronizeEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile } from '../combat/combat-profile-model.js';

const clone = value => JSON.parse(JSON.stringify(value || {}));

export function applySceneItemInteraction({ entry, actor, sourceActor, operation = 'use', paymentResource = '', usageId }) {
  if (!entry?.available) throw new Error('Dieser Szenengegenstand ist nicht mehr verfügbar.');
  if (!['pickup', 'use', 'consume'].includes(operation)) throw new Error('Unbekannte Gegenstandsaktion.');
  if (actor.currentHitPoints <= 0) throw new Error('Handlungsunfähige Figuren können keine Gegenstände benutzen oder aufheben.');
  if (operation === 'consume' && inferInventoryUseMode(entry.item) !== 'consume') throw new Error('Dieser Gegenstand ist kein Verbrauchsgut.');
  if (entry.operation === 'drop' && operation !== 'pickup') throw new Error('Die fallengelassene Waffe muss zuerst aufgehoben werden.');
  const sameOwner = entry.sourceActorId === actor.characterId;
  let inventory = clone(actor.inventory);
  inventory.items ||= [];
  let sourceInventory = null;
  let sourceCombatProfile = null;
  let combatProfile = null;
  const costs = operation === 'pickup' ? [{ resourceId: choosePickupResource(actor.resources, paymentResource), amount: 1 }] : [];
  const payment = applyCombatResourceCosts(actor.resources, costs);
  if (!payment.sufficient) throw new Error('Die Aktionskosten können nicht bezahlt werden.');
  if (operation === 'pickup' && !sameOwner) {
    if (entry.sourceActorId) {
      if (sourceActor?.id !== entry.sourceActorId) throw new Error('Die ursprüngliche Waffenquelle fehlt.');
      sourceInventory = clone(sourceActor.inventory);
      sourceInventory.items ||= [];
      const item = sourceInventory.items.find(item => item.id === entry.item.id);
      if (item) {
        if (getInventoryItemQuantity(item) < 1) throw new Error('Die fallengelassene Waffe ist im Quellinventar nicht mehr verfügbar.');
        if (getInventoryItemQuantity(item) === 1) sourceInventory.items = sourceInventory.items.filter(candidate => candidate.id !== item.id);
        else item.quantity = String(getInventoryItemQuantity(item) - 1);
      } else if (!(sourceActor.combatProfile?.weapons || []).some(weapon => weapon.id === entry.weaponId)) {
        throw new Error('Die fallengelassene Waffe ist im Quellprofil nicht mehr vorhanden.');
      }
      sourceCombatProfile = clone(sourceActor.combatProfile);
      sourceCombatProfile.weapons = (sourceCombatProfile.weapons || []).filter(weapon => weapon.id !== entry.weaponId);
    }
    const itemId = `scene:${entry.sceneItemId}`;
    if (inventory.items.some(item => item.id === itemId)) throw new Error('Der Gegenstand wurde bereits aufgenommen.');
    const item = { ...clone(entry.item), id: itemId, instanceId: entry.item.instanceId || itemId,
      quantity: '1', equipped: false, ownerCharacterId: actor.characterId, ownerCharacterName: actor.name };
    if (item.combatDefinition) item.equipmentLink = { kind: item.combatDefinition.kind, combatEntryId: itemId };
    inventory.items.push(item);
    const synced = synchronizeEquipmentFromInventory({ inventory, combatProfile: actor, addMissingEquipment: true });
    inventory = synced.inventory;
    combatProfile = sanitizeCharacterCombatProfile(synced.combatProfile);
  }
  const event = { operation, sceneItemId: entry.sceneItemId, actorId: actor.characterId, sourceActorId: entry.sourceActorId || '',
    item: clone(entry.item), text: operation === 'pickup'
      ? `${actor.name} hebt ${entry.item.name} auf.${sameOwner ? ' Die Waffe liegt wieder sicher in der Hand.' : ' Der Gegenstand ist nun in seinem Besitz.'}`
      : `${actor.name} ${operation === 'consume' ? 'verbraucht' : 'benutzt'} ${entry.item.name}.` };
  const inventoryUse = normalizeInventoryUse({ usageId, actorId: actor.characterId, actorName: actor.name,
    actorPersistence: actor.persistence, item: entry.item, quantity: 1, mode: operation === 'consume' ? 'consume' : 'use',
    requestedMode: operation === 'consume' ? 'consume' : 'use', source: 'scene', sceneItemId: entry.sceneItemId,
    operation, paymentResource: costs[0]?.resourceId || '', sceneItemEvent: event,
    resourceSnapshot: costs.length ? { before: actor.resources, after: payment.after, changes: payment.changes } : null });
  if (operation === 'pickup' && !sameOwner) inventoryUse.inventorySnapshot = { before: clone(actor.inventory), after: inventory };
  return { inventory, inventoryUse, resources: payment.after, sourceInventory, sourceCombatProfile, combatProfile,
    inventoryChanged: operation === 'pickup' && !sameOwner };
}
