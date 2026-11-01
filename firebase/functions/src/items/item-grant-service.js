import { HttpsError } from 'firebase-functions/v2/https';
import { createGrantedItem } from '../generated/item-register/item-register-model.js';
import { moneyState, moneyTotal, toMinor, formatMoney } from '../generated/item-register/item-register-money.js';
import { attachInventoryEquipment } from '../generated/character-equipment/character-equipment-registration.js';
import { synchronizeEquipmentFromInventory } from '../generated/character-equipment/character-equipment-sync.js';
import { itemDefinitionKey, assertItemQuantity } from '../generated/item-definitions/item-definition-model.js';
import { productWithItemDefinition, prepareTemplateDefinition, prepareUniqueItemClaims, readItemDefinitionIndex } from './item-definition-repository.js';
import { selectiveItemInventoryUpdate } from './item-inventory-update.js';

export async function prepareItemGrant(database, transaction, record, grants, { identity, copper = 0, acquisition, actorUid, recordKind = 'characters', now = new Date().toISOString(), definitionPreparations = null }) {
  const definitions = await readItemDefinitionIndex(database, transaction, [{ ...record, _itemHolderKind: recordKind }]);
  const inventory = structuredClone(record.inventory || { items: [] }); inventory.items ||= [];
  const combatProfile = structuredClone(record.combatProfile || {});
  const versions = new Map(), unique = [], granted = [];
  for (const [index, grant] of grants.entries()) {
    const product = productWithItemDefinition(grant.product);
    const key = itemDefinitionKey(product.definitionRef);
    let prepared = versions.get(key);
    if (!prepared) {
      prepared = definitionPreparations?.get(key);
      if (!prepared) {
        const candidate = await prepareTemplateDefinition(database, transaction, product, { actorUid, publishHead: true, now });
        let written = false;
        prepared = { ...candidate, write() { if (!written) { candidate.write(); written = true; } } };
        definitionPreparations?.set(key, prepared);
      }
      versions.set(key, prepared);
    }
    const definition = prepared.definition;
    definitions.set(key, definition);
    const quantity = assertItemQuantity(definition, grant.quantity ?? 1);
    if (inventory.items.length >= 80) throw new HttpsError('failed-precondition', 'Das Inventar hat bereits 80 Einträge.');
    const instanceId = `${identity}:${index}`;
    if (inventory.items.some(item => item.id === instanceId)) throw new HttpsError('already-exists', 'Diese Zuteilung ist bereits im Inventar.');
    const item = createGrantedItem({ ...product, combatDefinition: definition.combatDefinition }, { id: instanceId, characterId: record.id, characterName: record.name, quantity, now });
    if (acquisition) item.acquisition = { ...acquisition, at: now };
    if (definition.useDefinition.chargesMaximum) item.itemState = { chargesCurrent: definition.useDefinition.chargesMaximum };
    inventory.items.push(item); granted.push(item);
    attachInventoryEquipment(combatProfile, item, { definition });
    unique.push({ definition, instanceId, quantity, holder: { kind: recordKind, recordId: record.id, itemId: item.id } });
  }
  const amount = toMinor(copper), wallet = toMinor(moneyTotal(inventory.moneyState || inventory.money));
  if (!Number.isSafeInteger(wallet + amount)) throw new HttpsError('invalid-argument', 'Der Geldbetrag ist zu groß.');
  if (amount) { inventory.moneyState = moneyState((wallet + amount) / 100); inventory.money = formatMoney(inventory.moneyState); }
  const claim = await prepareUniqueItemClaims(database, transaction, unique, { actorUid, now });
  const synced = synchronizeEquipmentFromInventory({ inventory, combatProfile, definitions });
  return { ...selectiveItemInventoryUpdate(record, synced, granted.map(item => item.id)), granted,
    write() { for (const version of versions.values()) version.write(); claim(); } };
}
