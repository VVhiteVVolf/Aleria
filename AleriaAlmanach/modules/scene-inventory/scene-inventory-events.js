// Atomic inventory transfer and scene-event persistence.
(function initializeSceneInventoryEvents() {
let submitting = false;
let pending = null;
function currentMoneyDialog(overlay, token) {
  return !!overlay?.classList.contains('active') && overlay.dataset.sceneInventoryOpenToken === token;
}
function restorePendingMoney(overlay, request) {
  const object = request.sceneEvent.transfer.object;
  const values = { 'scene-transfer-kind': 'money', 'scene-transfer-giver': request.giverId,
    'scene-transfer-receiver': request.receiverId || '', 'scene-transfer-money-mode': object.targetKind,
    'scene-transfer-currency': object.currency, 'scene-transfer-money-amount': String(object.quantity) };
  for (const [id, value] of Object.entries(values)) { const input = document.getElementById(id); if (input) input.value = value; }
  overlay.dataset.sceneMoneyPending = 'true';
  refreshSceneInventoryDialog();
  setSceneInventoryDialogLocked(true);
  const submit = overlay.querySelector('[data-scene-inventory-action="submit"]');
  if (submit) { submit.disabled = false; submit.textContent = 'Offene Buchung prüfen'; }
  setSceneInventoryStatus('Die Bestätigung einer Geldbewegung fehlt noch. Bitte dieselbe Buchung erneut prüfen.', 'info');
}
async function openInventoryWithMoneyRecovery(threadId) {
  const overlay = await openSceneInventoryDialog(threadId);
  if (!overlay?.classList.contains('active')) return;
  const token = overlay.dataset.sceneInventoryOpenToken;
  overlay.dataset.sceneMoneyPending = 'false'; overlay.dataset.sceneMoneySubmitting = 'false';
  setSceneInventoryDialogLocked(true);
  try {
    const { getSceneMoneyTransferSession } = await import('./scene-inventory-money-client.js');
    const session = await getSceneMoneyTransferSession(overlay.dataset.sceneInventoryThreadId);
    if (!currentMoneyDialog(overlay, token)) return;
    const request = session.pending();
    if (request) restorePendingMoney(overlay, request);
    else { setSceneInventoryDialogLocked(false); refreshSceneInventoryDialog(); }
  } catch (error) {
    if (currentMoneyDialog(overlay, token)) {
      setSceneInventoryDialogLocked(false);
      setSceneInventoryStatus(error?.message || 'Die Geldbewegung konnte nicht vorbereitet werden.', 'error');
    }
  }
}
async function submitSceneMoneyTransfer(threadId, input) {
  const overlay = document.getElementById('scene-inventory-overlay'), token = overlay?.dataset.sceneInventoryOpenToken;
  let session;
  submitting = true;
  if (overlay) overlay.dataset.sceneMoneySubmitting = 'true';
  setSceneInventoryDialogLocked(true);
  try {
    const client = await import('./scene-inventory-money-client.js');
    session = await client.getSceneMoneyTransferSession(threadId);
    let request = session.pending();
    const retry = !!request;
    if (!request) {
      const prepared = await prepareSceneInventoryTransfer(input);
      request = client.buildSceneMoneyRequest({ threadId, giver: prepared.giver, receiver: prepared.receiver, transfer: prepared.transfer });
    }
    const committed = retry ? await session.retry() : await session.submit(request);
    for (const [id, inventory] of [[request.giverId, committed.giverInventory], [request.receiverId, committed.receiverInventory]]) {
      if (!id || !inventory) continue;
      const index = _characters.findIndex(character => character.id === id);
      if (index >= 0) _characters[index] = { ..._characters[index], inventory };
    }
    // Money never enters the scene timeline, comment refresh or auto-scroll.
    try { renderCharGrid(); } catch (error) { console.warn('Geld gebucht; Inventaransicht konnte nicht aktualisiert werden.', error); }
    if (currentMoneyDialog(overlay, token)) closeSceneInventoryDialog();
  } catch (error) {
    if (currentMoneyDialog(overlay, token)) {
      const request = session?.pending();
      if (request) restorePendingMoney(overlay, request);
      else { overlay.dataset.sceneMoneyPending = 'false'; setSceneInventoryDialogLocked(false); }
      setSceneInventoryStatus(request ? 'Die Antwort fehlt noch. Bitte die offene Geldbewegung unverändert erneut prüfen.'
        : error?.message || 'Die Geldbewegung konnte nicht gebucht werden.', 'error');
    }
  } finally {
    submitting = false;
    if (currentMoneyDialog(overlay, token)) {
      overlay.dataset.sceneMoneySubmitting = 'false';
      const request = session?.pending();
      if (request) restorePendingMoney(overlay, request);
      else { setSceneInventoryDialogLocked(false); refreshSceneInventoryDialog(); }
    }
  }
}
async function openTradeFromInventory() {
  const dialog = document.getElementById('scene-inventory-overlay');
  const threadId = dialog?.dataset?.sceneInventoryThreadId || getCurrentCommentThreadId();
  if (!threadId) return setSceneInventoryStatus('Kein aktiver Szenen-Thread gefunden.', 'error');
  const actorCharacterId = document.getElementById('scene-transfer-giver')?.value || '';
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  const entry = thread?.threadId === threadId ? thread.entry : null;
  const participantThreadIds = entry && typeof getModuleCommentThreadIds === 'function' ? getModuleCommentThreadIds(entry) : [threadId];
  closeSceneInventoryDialog();
  try {
    const { openSceneTradeDialog } = await import('../scene-trade/scene-trade-controller.js');
    await openSceneTradeDialog({ threadId, actorCharacterId, characters: getSceneInventoryCharacters(),
      entry, moduleId: entry?.id || '', participantThreadIds: [...new Set([threadId, ...participantThreadIds])],
      getCachedComments: id => typeof _commentCache !== 'undefined' && Array.isArray(_commentCache[id]) ? _commentCache[id] : null,
      onCommitted: async ({ result }) => {
        for (const character of result.characters || []) {
          const index = _characters.findIndex(existing => existing.id === character.id);
          if (index >= 0) _characters[index] = character;
        }
        renderCharGrid();
        // Existing live comments receive the receipt. Preserve this scene's
        // page/scroll and never open or scroll a different scene after checkout.
        if (getCurrentCommentThreadId() === threadId) await loadCommentsIntoPage(threadId, true);
      }
    });
  } catch (error) {
    await openInventoryWithMoneyRecovery(threadId);
    setSceneInventoryStatus(error?.message || 'Der Handel konnte nicht geöffnet werden.', 'error');
  }
}
async function submitSceneInventoryTransfer() {
  if (submitting) return;
  const threadId = document.getElementById('scene-inventory-overlay')?.dataset?.sceneInventoryThreadId || getCurrentCommentThreadId();
  const kind = document.getElementById('scene-transfer-kind')?.value || 'money';
  const input = {
    giverId: document.getElementById('scene-transfer-giver')?.value || '',
    receiverId: document.getElementById('scene-transfer-receiver')?.value || '',
    kind,
    targetKind: kind === 'money' ? document.getElementById('scene-transfer-money-mode')?.value || 'character' : undefined,
    currency: document.getElementById('scene-transfer-currency')?.value || 'gold',
    quantity: kind === 'item'
      ? document.getElementById('scene-transfer-item-amount')?.value
      : ['register-item', 'register-purchase'].includes(kind)
        ? document.getElementById('scene-transfer-register-amount')?.value
        : document.getElementById('scene-transfer-money-amount')?.value,
    itemId: document.getElementById('scene-transfer-item')?.value || '',
    registerItem: getSceneInventoryRegisterItem(),
    ...(kind === 'register-purchase' ? { unitCopper: document.getElementById('scene-transfer-unit-copper')?.value } : {})
  };
  const flavour = String(document.getElementById('scene-transfer-flavour')?.value || '').trim();
  const visualIcon = String(document.getElementById('scene-transfer-icon')?.value || '').trim();
  if (!threadId) { setSceneInventoryStatus('Kein aktiver Szenen-Thread gefunden.', 'error'); return; }
  if (kind === 'money') return submitSceneMoneyTransfer(threadId, input);
  if (!window._fb?.transferCharacterInventories) { setSceneInventoryStatus('Firebase-Inventarübertragung ist nicht verfügbar.', 'error'); return; }
  const key = JSON.stringify({ threadId, input, flavour, visualIcon });
  if (pending?.key !== key) pending = { key };
  const attempt = pending;
  const submit = document.querySelector('[data-scene-inventory-action="submit"]');
  submitting = true;
  if (submit) submit.disabled = true;
  try {
    if (kind === 'register-purchase') {
      const { purchaseSceneItem } = await import('./scene-inventory-purchase.js');
      const committed = await purchaseSceneItem({ input, threadId, flavour, attempt, characters: _characters });
      const index = _characters.findIndex(character => character.id === input.receiverId);
      if (index >= 0 && committed.character) _characters[index] = committed.character;
      pending = null;
      closeSceneInventoryDialog(); requestCommentAutoScroll(threadId);
      await loadCommentsIntoPage(threadId, true, { page: 'last' }); renderCharGrid();
      return;
    }
    attempt.prepared ||= await prepareSceneInventoryTransfer(input);
    const prepared = attempt.prepared;
    // Preserve the exact operation through a lost response. Revalidation of a
    // locally updated inventory must not prevent replaying the server receipt.
    attempt.sceneEvent ||= {
      text: `${prepared.giver.name} übergibt ${prepared.receiver.name} ${prepared.transfer.name}.`,
      transfer: {
        transferId: `scene-transfer-${crypto.randomUUID()}`,
        giver: { id: prepared.giver.id, name: prepared.giver.name, portrait: prepared.giver.portrait || '' },
        receiver: { id: prepared.receiver.id, name: prepared.receiver.name, portrait: prepared.receiver.portrait || '' },
        object: { ...prepared.transfer, visualIcon }, flavour,
        createdAt: new Date().toISOString(), schemaVersion: 2
      },
      orderKey: getNextCommentOrderKey(threadId)
    };
    const committed = await window._fb.transferCharacterInventories(
      prepared.giver.id,
      prepared.giverInventory,
      prepared.receiver.id,
      prepared.receiverInventory,
      threadId,
      attempt.sceneEvent,
      COMMENT_DELETE_CODE
    );
    const giverIndex = _characters.findIndex(character => character.id === prepared.giver.id);
    const receiverIndex = _characters.findIndex(character => character.id === prepared.receiver.id);
    if (giverIndex >= 0) _characters[giverIndex] = { ..._characters[giverIndex], inventory: committed?.giverInventory || prepared.giverInventory };
    if (receiverIndex >= 0) _characters[receiverIndex] = { ..._characters[receiverIndex], inventory: committed?.receiverInventory || prepared.receiverInventory };
    pending = null;
    try {
      closeSceneInventoryDialog();
      await loadCommentsIntoPage(threadId, true);
      renderCharGrid();
    } catch (refreshError) {
      console.warn('Saved inventory transfer could not refresh its presentation:', refreshError);
      if (typeof showAppStatus === 'function') showAppStatus('Übergabe gespeichert. Bitte die Szenenansicht neu laden.', 'info');
    }
  } catch (error) {
    const message = typeof getFriendlyErrorMessage === 'function'
      ? getFriendlyErrorMessage(error, 'Übergabe konnte nicht gespeichert werden.')
      : (error?.message || 'Übergabe konnte nicht gespeichert werden.');
    setSceneInventoryStatus(message, 'error');
  } finally {
    submitting = false;
    if (submit) submit.disabled = false;
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-scene-inventory-action]');
  if (!trigger) return;
  event.preventDefault();
  const action = trigger.dataset.sceneInventoryAction;
  if (action === 'open') {
    if (submitting) return;
    return openInventoryWithMoneyRecovery(trigger.dataset.commentThreadId || getCurrentCommentThreadId());
  }
  if (action === 'close') closeSceneInventoryDialog();
  if (action === 'submit') return submitSceneInventoryTransfer();
  if (action === 'pick-register-item') {
    if (typeof openItemDbPicker !== 'function') return setSceneInventoryStatus('Das Item-Register ist nicht verfügbar.', 'error');
    openItemDbPicker({
      title: 'Item für die Szenenübergabe wählen',
      onSelect: item => {
        setSceneInventoryRegisterItem(item);
        const price = document.getElementById('scene-transfer-unit-copper');
        if (price) price.value = String(item.priceRange?.minCopper ?? 0);
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
  if (event.target?.closest?.('#scene-inventory-overlay') && event.target.matches?.('#scene-transfer-money-amount, #scene-transfer-item-amount, #scene-transfer-register-amount, #scene-transfer-unit-copper, #scene-transfer-icon')) refreshSceneInventoryDialog();
});
document.addEventListener('change', event => {
  if (!event.target?.closest?.('#scene-inventory-overlay')) return;
  if (!event.target.matches?.('#scene-transfer-kind, #scene-transfer-giver, #scene-transfer-receiver, #scene-transfer-currency, #scene-transfer-money-mode, #scene-transfer-item, #scene-transfer-money-amount, #scene-transfer-item-amount, #scene-transfer-register-amount')) return;
  if (event.target.id === 'scene-transfer-kind' && event.target.value === 'scene-trade') return openTradeFromInventory();
  refreshSceneInventoryDialog({ refreshItems: event.target?.id === 'scene-transfer-giver' });
});

}());
