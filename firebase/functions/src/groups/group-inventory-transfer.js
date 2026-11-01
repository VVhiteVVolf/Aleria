import { HttpsError } from 'firebase-functions/v2/https';
import { applySceneInventoryTransfer } from '../generated/scene-inventory/scene-inventory-transfer-model.js';
import { readItemDefinitionIndex, prepareUniqueItemClaims } from '../items/item-definition-repository.js';
import { itemDefinitionKey } from '../generated/item-definitions/item-definition-model.js';
import { transferredGroupEquipmentProfile } from './group-inventory-equipment.js';

export async function prepareGroupInventoryTransfer(database, transaction, account, member, memberKind, input, identity, actorUid, now) {
  const withdrawal = input.action === 'withdraw';
  const groupRecord = { ...account.record, _itemHolderKind: 'groups' };
  const memberRecord = { ...member, _itemHolderKind: memberKind };
  const definitions = await readItemDefinitionIndex(database, transaction, [groupRecord, memberRecord]);
  // The transfer model already materializes the transferred definition. Keep
  // saved loadouts intact for its equipped checks instead of reconciling every
  // unrelated inventory item before deciding whether ownership may change.
  const group = groupRecord, character = memberRecord;
  const source = withdrawal ? group : character, target = withdrawal ? character : group;
  const sourceKind = withdrawal ? 'groups' : memberKind, targetKind = withdrawal ? memberKind : 'groups';
  const sourceItem = input.object?.kind === 'item' ? source.inventory?.items?.find(item => item.id === input.object.itemId) : null;
  let linkedCreature = null;
  if (sourceItem?.creatureId) {
    if (memberKind !== 'characters') throw new HttpsError('failed-precondition', 'Verknüpfte Tiere werden zwischen Gruppenbestand und Figurenbesitz übertragen.');
    const reference = database.doc(`creatures/${sourceItem.creatureId}`), snapshot = await transaction.get(reference);
    const origin = snapshot.data()?.itemOrigin;
    if (!snapshot.exists || origin?.inventoryItemId !== sourceItem.id || origin?.instanceId !== (sourceItem.instanceId || sourceItem.id)
      || (withdrawal ? origin.ownerGroupId !== group.id || !!origin.ownerCharacterId : origin.ownerCharacterId !== character.id || !!origin.ownerGroupId)) {
      throw new HttpsError('failed-precondition', 'Die Begleiterverknüpfung wurde geändert.');
    }
    const lock = await transaction.get(database.doc(`combat_profile_locks/creatures/records/${reference.id}`));
    if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Der verknüpfte Begleiter nimmt gerade an einem Kampf teil.');
    linkedCreature = { reference, origin };
  }
  const result = applySceneInventoryTransfer(source, target, input.object, { definitions, transferItemId: identity, transferredAt: now });
  const combatProfile = transferredGroupEquipmentProfile(member.combatProfile,
    withdrawal ? result.receiverCombatProfile : result.giverCombatProfile,
    withdrawal ? result.object.receiverItemId : sourceItem?.id, { preserveExisting: true });
  const claim = await prepareUniqueItemClaims(database, transaction, sourceItem?.definitionRef ? [{
    definition: definitions.get(itemDefinitionKey(sourceItem.definitionRef)), instanceId: sourceItem.instanceId || sourceItem.id,
    quantity: input.object.quantity, holder: { kind: targetKind, recordId: target.id, itemId: result.object.receiverItemId },
    previousHolder: { kind: sourceKind, recordId: source.id, itemId: sourceItem.id }
  }] : [], { actorUid, now });
  return { groupInventory: withdrawal ? result.giverInventory : result.receiverInventory,
    memberInventory: withdrawal ? result.receiverInventory : result.giverInventory,
    ...(combatProfile ? { combatProfile } : {}),
    object: result.object, giver: { id: source.id, name: source.name || '', kind: sourceKind }, receiver: { id: target.id, name: target.name || '', kind: targetKind },
    write() {
      claim();
      if (linkedCreature) transaction.update(linkedCreature.reference, { itemOrigin: { ...linkedCreature.origin,
        inventoryItemId: result.object.receiverItemId, ownerCharacterId: withdrawal ? character.id : '', ownerCharacterName: withdrawal ? character.name || '' : '',
        ownerGroupId: withdrawal ? '' : group.id, disposition: withdrawal ? 'owned' : 'group-owned' }, updatedAt: now });
    } };
}
