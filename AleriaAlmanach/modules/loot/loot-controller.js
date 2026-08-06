import {
  ensureLootDialog,
  getSelectedLootItemIds,
  getSelectedLootReceiverId,
  renderLootHead,
  renderLootItems,
  renderLootReceiverOptions,
  setLootStatus,
  setLootSubmitting
} from './loot-ui.js?v=20260807-loot-v1';

let activeClaim = null;

function creatureRecordIdForDataset(dataset = {}) {
  return dataset.persistenceKind === 'scene-creature' ? dataset.persistenceSourceCreatureId : dataset.persistenceRecordId;
}

function availableReceivers() {
  try {
    const characters = typeof globalThis.getAvailableCommentCharacters === 'function' ? globalThis.getAvailableCommentCharacters() : [];
    return characters.filter(character => character?.id && character.entityType !== 'creature');
  } catch {
    return [];
  }
}

async function openLootDialog(dataset = {}) {
  const recordId = creatureRecordIdForDataset(dataset);
  activeClaim = {
    entryId: String(dataset.entryId || ''),
    encounterId: String(dataset.encounterId || ''),
    actorId: String(dataset.actorId || ''),
    actorName: String(dataset.actorName || ''),
    recordId: String(recordId || '')
  };
  ensureLootDialog();
  renderLootHead(activeClaim.actorName, dataset.actorPortrait || '');
  renderLootReceiverOptions(availableReceivers());
  renderLootItems([]);
  setLootStatus('Beute wird geladen …');
  setLootSubmitting(false);
  globalThis.activateDialog?.('loot-overlay', { initialFocus: '[data-loot-field="item"], [data-loot-receiver]' });

  try {
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.getCreatureLootTable) throw new Error('Der Online-Speicher unterstützt Beute noch nicht.');
    const table = await backend.getCreatureLootTable(activeClaim.recordId);
    if (activeClaim) activeClaim.items = Array.isArray(table.items) ? table.items : [];
    renderLootItems(table.items || []);
    setLootStatus(table.items?.length ? '' : 'Diese Kreatur hat keine hinterlegte Beute.');
  } catch (error) {
    console.error('loot table load failed:', error);
    setLootStatus(error?.message || 'Die Beute konnte nicht geladen werden.', 'error');
  }
}

function closeLootDialog() {
  globalThis.deactivateDialog?.('loot-overlay');
  activeClaim = null;
}

async function submitLootClaim() {
  if (!activeClaim) return;
  const itemIds = getSelectedLootItemIds();
  const receiverId = getSelectedLootReceiverId();
  if (!itemIds.length) {
    setLootStatus('Wähle mindestens einen Gegenstand aus.', 'error');
    return;
  }
  if (!receiverId) {
    setLootStatus('Wähle, wer die Beute nimmt.', 'error');
    return;
  }
  setLootSubmitting(true);
  try {
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.claimCreatureLoot) throw new Error('Der Online-Speicher unterstützt Beute noch nicht.');
    const claim = activeClaim;
    const threadId = claim.entryId;
    const items = itemIds.map(id => ({ id, quantity: claim.items?.find(item => item.id === id)?.quantity || 1 }));
    await backend.claimCreatureLoot(claim.entryId, claim.encounterId, claim.actorId, receiverId, items);
    closeLootDialog();
    await globalThis.loadCommentsIntoPage?.(threadId, true, { page: 'last' });
    globalThis.showAppStatus?.('Die Beute wurde verteilt.', 'success');
  } catch (error) {
    console.error('loot claim failed:', error);
    setLootStatus(error?.message || 'Die Beute konnte nicht verteilt werden.', 'error');
  } finally {
    setLootSubmitting(false);
  }
}

document.addEventListener('click', event => {
  const opener = event.target?.closest?.('[data-action="open-creature-loot"]');
  if (opener) {
    void openLootDialog(opener.dataset);
    return;
  }
  const trigger = event.target?.closest?.('[data-loot-action]');
  if (!trigger) return;
  const action = trigger.dataset.lootAction;
  if (action === 'close') closeLootDialog();
  if (action === 'submit') void submitLootClaim();
});
