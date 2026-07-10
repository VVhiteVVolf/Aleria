// Atomic inventory transfer and scene-event persistence.
async function submitSceneInventoryTransfer() {
  const threadId = getCurrentCommentThreadId();
  const kind = document.getElementById('scene-transfer-kind')?.value || 'money';
  const input = {
    giverId: document.getElementById('scene-transfer-giver')?.value || '',
    receiverId: document.getElementById('scene-transfer-receiver')?.value || '',
    kind,
    currency: document.getElementById('scene-transfer-currency')?.value || 'gold',
    quantity: kind === 'item'
      ? document.getElementById('scene-transfer-item-amount')?.value
      : kind === 'register-item'
        ? document.getElementById('scene-transfer-register-amount')?.value
        : document.getElementById('scene-transfer-money-amount')?.value,
    itemId: document.getElementById('scene-transfer-item')?.value || '',
    registerItem: getSceneInventoryRegisterItem()
  };
  const flavour = String(document.getElementById('scene-transfer-flavour')?.value || '').trim();
  const visualIcon = String(document.getElementById('scene-transfer-icon')?.value || '').trim();
  let prepared;
  try { prepared = prepareSceneInventoryTransfer(input); }
  catch (error) { setSceneInventoryStatus(error.message || 'Übergabe ist ungültig.', 'error'); return; }
  if (!threadId) { setSceneInventoryStatus('Kein aktiver Szenen-Thread gefunden.', 'error'); return; }
  if (!window._fb?.transferCharacterInventories) { setSceneInventoryStatus('Firebase-Inventarübertragung ist nicht verfügbar.', 'error'); return; }
  const submit = document.querySelector('[data-scene-inventory-action="submit"]');
  if (submit) submit.disabled = true;
  try {
    const transfer = {
      transferId: `scene-transfer-${Date.now()}`,
      giver: { id: prepared.giver.id, name: prepared.giver.name, portrait: prepared.giver.portrait || '' },
      receiver: { id: prepared.receiver.id, name: prepared.receiver.name, portrait: prepared.receiver.portrait || '' },
      object: { ...prepared.transfer, visualIcon },
      flavour,
      createdAt: new Date().toISOString(),
      schemaVersion: 1
    };
    const text = `${prepared.giver.name} übergibt ${prepared.receiver.name} ${prepared.transfer.name}.`;
    await window._fb.transferCharacterInventories(
      prepared.giver.id,
      prepared.giverInventory,
      prepared.receiver.id,
      prepared.receiverInventory,
      threadId,
      { text, transfer, orderKey: getNextCommentOrderKey(threadId) },
      COMMENT_DELETE_CODE
    );
    const giverIndex = _characters.findIndex(character => character.id === prepared.giver.id);
    const receiverIndex = _characters.findIndex(character => character.id === prepared.receiver.id);
    if (giverIndex >= 0) _characters[giverIndex] = { ..._characters[giverIndex], inventory: prepared.giverInventory };
    if (receiverIndex >= 0) _characters[receiverIndex] = { ..._characters[receiverIndex], inventory: prepared.receiverInventory };
    closeSceneInventoryDialog();
    requestCommentAutoScroll(threadId);
    await loadCommentsIntoPage(threadId, true, { page: 'last' });
    renderCharGrid();
  } catch (error) {
    const message = typeof getFriendlyErrorMessage === 'function'
      ? getFriendlyErrorMessage(error, 'Übergabe konnte nicht gespeichert werden.')
      : (error?.message || 'Übergabe konnte nicht gespeichert werden.');
    setSceneInventoryStatus(message, 'error');
    if (submit) submit.disabled = false;
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-scene-inventory-action]');
  if (!trigger) return;
  event.preventDefault();
  const action = trigger.dataset.sceneInventoryAction;
  if (action === 'open') openSceneInventoryDialog();
  if (action === 'close') closeSceneInventoryDialog();
  if (action === 'submit') submitSceneInventoryTransfer();
  if (action === 'pick-register-item') {
    if (typeof openItemDbPicker !== 'function') return setSceneInventoryStatus('Das Item-Register ist nicht verfügbar.', 'error');
    openItemDbPicker({
      title: 'Item für die Szenenübergabe wählen',
      onSelect: item => {
        setSceneInventoryRegisterItem(item);
        refreshSceneInventoryRegisterSummary();
        refreshSceneInventoryDialog();
      }
    }).catch(error => setSceneInventoryStatus(error?.message || 'Das Item-Register konnte nicht geöffnet werden.', 'error'));
  }
  if (action === 'pick-icon') {
    if (typeof openIconDirectory === 'function') {
      openIconDirectory();
      const directory = document.getElementById('icon-directory-overlay');
      if (directory) directory.style.zIndex = '9200';
    }
    else setSceneInventoryStatus('Das Icon-Verzeichnis ist nicht verfügbar.', 'error');
  }
  if (action === 'clear-icon') {
    const input = document.getElementById('scene-transfer-icon');
    if (input) input.value = '';
    refreshSceneInventoryDialog();
  }
});

document.addEventListener('almanach-icon-selected', event => {
  const dialog = document.getElementById('scene-inventory-overlay');
  const iconDirectory = document.getElementById('icon-directory-overlay');
  if (!dialog?.classList.contains('active') || !iconDirectory?.classList.contains('active')) return;
  const input = document.getElementById('scene-transfer-icon');
  const src = String(event.detail?.src || '').trim();
  if (!input || !src) return;
  input.value = src;
  if (typeof closeIconDirectory === 'function') closeIconDirectory();
  iconDirectory.style.removeProperty('z-index');
  refreshSceneInventoryDialog();
});

document.addEventListener('input', event => {
  if (event.target?.closest?.('#scene-inventory-overlay')) refreshSceneInventoryDialog();
});
document.addEventListener('change', event => {
  if (!event.target?.closest?.('#scene-inventory-overlay')) return;
  refreshSceneInventoryDialog({ refreshItems: event.target?.id === 'scene-transfer-giver' });
});
