import { choosePickupResource } from './scene-items-model.js';
import { applyCombatResourceCosts } from '../combat/combat-state-model.js?v=20260928-equipment-art-v4';
import { inferInventoryUseMode, normalizeInventoryUse, getInventoryItemQuantity, applyInventoryUseToInventory } from '../inventory-use/inventory-use-model.js';
import { materializeInventoryItem, storeInventoryItem } from '../item-definitions/item-definition-resolver.js';
import { appendPickedUpEquipment, removeTransferredSceneEquipment } from './scene-item-equipment.js';

const clone = value => JSON.parse(JSON.stringify(value || {}));

export function applySceneItemInteraction({ entry, actor, sourceActor, operation = 'use', paymentResource = '', usageId, definitions, recoveryDayKey = '' }) {
  if (!entry?.available) throw new Error('Dieser Szenengegenstand ist nicht mehr verfügbar.');
  entry = { ...entry, item: materializeInventoryItem(entry.item, definitions) };
  if (!['pickup', 'use', 'consume'].includes(operation)) throw new Error('Unbekannte Gegenstandsaktion.');
  if (actor.currentHitPoints <= 0) throw new Error('Handlungsunfähige Figuren können keine Gegenstände benutzen oder aufheben.');
  if (operation === 'consume' && inferInventoryUseMode(entry.item) !== 'consume') throw new Error('Dieser Gegenstand ist kein Verbrauchsgut.');
  if (operation === 'use' && inferInventoryUseMode(entry.item) === 'consume') throw new Error('Verbrauchsgüter werden über Konsumieren verwendet.');
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
      sourceCombatProfile = sourceInventory.items.some(candidate => candidate.id === entry.item.id)
        ? clone(sourceActor.combatProfile)
        : removeTransferredSceneEquipment(sourceActor.combatProfile, {
          weaponId: entry.weaponId, inventoryItemId: item?.id || sourceActor.combatProfile?.weapons?.find(weapon => weapon.id === entry.weaponId)?.inventoryItemId || ''
        });
    }
    const itemId = `scene:${entry.sceneItemId}`;
    if (inventory.items.some(item => item.id === itemId)) throw new Error('Der Gegenstand wurde bereits aufgenommen.');
    const item = { ...clone(entry.item), id: itemId, instanceId: entry.item.instanceId || itemId,
      quantity: '1', equipped: false, ownerCharacterId: actor.characterId, ownerCharacterName: actor.name };
    if (item.combatDefinition) item.equipmentLink = { kind: item.combatDefinition.kind, combatEntryId: itemId };
    const picked = appendPickedUpEquipment(actor, item, definitions);
    inventory.items.push(picked.item);
    combatProfile = picked.combatProfile;
  }
  const used = operation !== 'pickup' && entry.item.definitionRef ? applyInventoryUseToInventory({ items: [storeInventoryItem(entry.item)] }, { item: entry.item, mode: operation, quantity: 1 }, { definitions, recoveryDayKey }) : null;
  const event = { operation, sceneItemId: entry.sceneItemId, actorId: actor.characterId, sourceActorId: entry.sourceActorId || '',
    ...(used?.inventory.items[0]?.itemState ? { itemState: used.inventory.items[0].itemState } : {}),
    item: storeInventoryItem(clone(entry.item)), text: operation === 'pickup'
      ? `${actor.name} hebt ${entry.item.name} auf.${sameOwner ? ' Die Waffe liegt wieder sicher in der Hand.' : ' Der Gegenstand ist nun in seinem Besitz.'}`
      : `${actor.name} ${operation === 'consume' ? 'verbraucht' : 'benutzt'} ${entry.item.name}.` };
  const inventoryUse = normalizeInventoryUse({ usageId, actorId: actor.characterId, actorName: actor.name,
    actorPersistence: actor.persistence, item: entry.item, quantity: 1, mode: operation === 'consume' ? 'consume' : 'use',
    requestedMode: operation === 'consume' ? 'consume' : 'use', source: 'scene', sceneItemId: entry.sceneItemId,
    operation, paymentResource: costs[0]?.resourceId || '', sceneItemEvent: event,
    ...(used?.inventoryUse.chargeSnapshot ? { chargeSnapshot: used.inventoryUse.chargeSnapshot } : {}),
    resourceSnapshot: costs.length ? { before: actor.resources, after: payment.after, changes: payment.changes } : null });
  if (operation === 'pickup' && !sameOwner) inventoryUse.inventorySnapshot = { before: clone(actor.inventory), after: inventory };
  return { inventory, inventoryUse, resources: payment.after, sourceInventory, sourceCombatProfile, combatProfile,
    inventoryChanged: operation === 'pickup' && !sameOwner };
}
