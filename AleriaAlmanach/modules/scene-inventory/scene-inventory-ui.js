// Scene-header control and transfer dialog.
function buildSceneInventoryControl(threadId = '') {
  return `<button class="scene-inventory-toggle" type="button" data-scene-inventory-action="open" data-comment-thread-id="${escapeHtml(threadId)}" aria-label="Inventar-Interaktion öffnen" title="Inventar-Interaktion"><img src="../IconOrdner/CK3 icons alt/Icon_loot.png" alt="" aria-hidden="true"></button>`;
}

function ensureSceneInventoryDialog() {
  let overlay = document.getElementById('scene-inventory-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'scene-inventory-overlay';
  overlay.className = 'scene-inventory-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'scene-inventory-title');
  overlay.innerHTML = `<div class="scene-inventory-card">
    <header><div><span>Inventar</span><h2 id="scene-inventory-title">Geld bewegen</h2></div><button type="button" data-scene-inventory-action="close" aria-label="Dialog schließen">×</button></header>
    <div class="scene-inventory-body">
      <div class="scene-inventory-toolbar"><label><span>Aktion</span><select id="scene-transfer-kind"><option value="money">Geld bewegen</option><option value="item">Gegenstand übergeben</option><option value="scene-trade">Handeln · Kaufen oder verkaufen</option><option value="register-item">Freie Registerzuteilung (Spielleitung)</option></select></label>
        <div class="scene-money-target" data-scene-money-controls><input id="scene-transfer-money-mode" type="hidden" value="character"><span>Verwendung</span><div class="scene-inventory-segments" role="group" aria-label="Geld verwenden"><button type="button" data-scene-money-target="character" aria-pressed="true">An Figur</button><button type="button" data-scene-money-target="sink" aria-pressed="false">Ausgeben · Bank</button></div></div></div>
      <p class="scene-money-privacy" data-scene-money-controls>Nur im Inventar · unsichtbar in der Szene</p>
      <div class="scene-inventory-scope"><span>Figuren auswählen</span><div class="scene-inventory-segments" role="group" aria-label="Figurenauswahl filtern"><button type="button" data-scene-inventory-scope="scene" aria-pressed="true">In dieser Szene <small data-scene-scope-count>…</small></button><button type="button" data-scene-inventory-scope="all" aria-pressed="false">Alle Figuren <small data-scene-scope-count>…</small></button></div></div>
      <div class="scene-inventory-parties">
        <section><input type="hidden" id="scene-transfer-giver"><div data-scene-inventory-picker="giver"><p>Figuren werden vorbereitet …</p></div></section>
        <div class="scene-inventory-object-preview" data-scene-transfer-object><span>◆</span><strong>Übergabe</strong><small>Wähle Geld oder Gegenstand</small></div>
        <section data-scene-inventory-receiver><input type="hidden" id="scene-transfer-receiver"><div data-scene-inventory-picker="receiver"><p>Figuren werden vorbereitet …</p></div></section>
      </div>
      <div class="scene-inventory-fields">
        <div class="scene-transfer-money-fields"><div class="scene-money-amount"><label><span>Betrag</span><input id="scene-transfer-money-amount" type="number" min="1" step="1" inputmode="numeric" value="1"></label><label><span>Währung</span><select id="scene-transfer-currency"><option value="gold">Gold</option><option value="silver">Silber</option><option value="copper" selected>Kupfer</option><option value="pfennig">Eisenpfennig</option></select></label></div><div class="scene-money-quick" role="group" aria-label="Schnellbetrag">${[1, 10, 90, 100].map(amount => `<button type="button" data-scene-money-amount="${amount}">${amount}</button>`).join('')}</div><div class="scene-money-preview" data-scene-money-preview aria-live="polite"></div></div>
        <div class="scene-transfer-item-fields" hidden><label><span>Gegenstand</span><select id="scene-transfer-item"></select></label><label><span>Menge</span><input id="scene-transfer-item-amount" type="number" min="1" step="1" value="1"></label></div>
        <div class="scene-transfer-register-fields" hidden><button type="button" data-scene-inventory-action="pick-register-item">Item aus Register wählen</button><div data-scene-transfer-register-summary>Noch kein Registeritem gewählt</div><label><span>Menge</span><input id="scene-transfer-register-amount" type="number" min="1" step="1" value="1"></label><label data-scene-purchase-price hidden><span>Vereinbarter Stückpreis (KT)</span><input id="scene-transfer-unit-copper" type="number" min="0" step="0.01" value="0"></label></div>
        <label class="wide scene-transfer-icon-field" data-scene-item-narrative><span>Transaktionsicon <small>(optional)</small></span><span><input id="scene-transfer-icon" type="text" placeholder="Icon aus dem Aleria-Verzeichnis wählen"><button type="button" data-scene-inventory-action="pick-icon">Icon wählen</button><button type="button" data-scene-inventory-action="clear-icon" aria-label="Transaktionsicon entfernen">×</button></span></label>
        <label class="wide" data-scene-item-narrative><span>Flavourtext</span><textarea id="scene-transfer-flavour" rows="3" maxlength="500" placeholder="Gwendolyn legt den schweren Beutel in Gawains Hand …"></textarea></label>
      </div>
    </div>
    <footer><div data-scene-inventory-status role="status"></div><div><button type="button" data-scene-inventory-action="close">Abbrechen</button><button class="primary" type="button" data-scene-inventory-action="submit">Übergabe vollziehen</button></div></footer>
  </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function setSceneInventoryStatus(message = '', type = 'info') {
  const target = document.querySelector('[data-scene-inventory-status]');
  if (!target) return;
  target.dataset.status = type;
  target.textContent = String(message || '');
}

function refreshSceneInventoryItems({ preserveSelection = true } = {}) {
  const giver = getSceneInventoryCharacter(document.getElementById('scene-transfer-giver')?.value);
  const select = document.getElementById('scene-transfer-item');
  if (!select) return;
  const selectedItemId = preserveSelection ? select.value : '';
  const inventory = giver ? getSceneInventoryData(giver) : null;
  select.innerHTML = (inventory?.items || [])
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => getSceneInventoryItemQuantity(item) > 0)
    .map(({ item, originalIndex }) => `<option value="${escapeHtml(item.id || originalIndex)}">${escapeHtml(item.name)} (${getSceneInventoryItemQuantity(item)})</option>`)
    .join('');
  if (selectedItemId && Array.from(select.options).some(option => option.value === selectedItemId)) select.value = selectedItemId;
}

function refreshSceneInventoryDialog({ refreshItems = false } = {}) {
  const overlay = document.getElementById('scene-inventory-overlay');
  if (!overlay) return;
  const giver = getSceneInventoryCharacter(document.getElementById('scene-transfer-giver')?.value);
  const receiver = getSceneInventoryCharacter(document.getElementById('scene-transfer-receiver')?.value);
  const kind = document.getElementById('scene-transfer-kind')?.value || 'money';
  const previousKind = overlay.dataset.sceneInventoryKind;
  const money = kind === 'money', sink = money && overlay.querySelector('#scene-transfer-money-mode')?.value === 'sink';
  overlay.dataset.sceneInventoryKind = kind;
  overlay.dataset.sceneInventoryTarget = sink ? 'sink' : 'character';
  overlay.querySelector('#scene-inventory-title').textContent = money ? 'Geld bewegen' : 'Gegenstand übergeben';
  for (const target of overlay.querySelectorAll('[data-scene-money-controls]')) target.hidden = !money;
  for (const target of overlay.querySelectorAll('[data-scene-item-narrative]')) target.hidden = money;
  overlay.querySelector('[data-scene-inventory-receiver]').hidden = sink;
  document.querySelector('.scene-transfer-money-fields').hidden = kind !== 'money';
  document.querySelector('.scene-transfer-item-fields').hidden = kind !== 'item';
  document.querySelector('.scene-transfer-register-fields').hidden = !['register-item', 'register-purchase'].includes(kind);
  document.querySelector('[data-scene-purchase-price]').hidden = kind !== 'register-purchase';
  document.getElementById('scene-transfer-giver').closest('section').hidden = kind === 'register-purchase';
  if (kind === 'item' && (refreshItems || previousKind !== 'item')) refreshSceneInventoryItems();
  const object = document.querySelector('[data-scene-transfer-object]');
  if (!object) return;
  object.hidden = money;
  if (kind === 'item') {
    const item = getSceneInventoryData(giver || {}).items.find((entry, index) => String(entry.id || index) === String(document.getElementById('scene-transfer-item')?.value));
    renderSceneInventoryObjectPreview(object, item, 'Charakterinventar');
  } else if (!money) {
    renderSceneInventoryObjectPreview(object, getSceneInventoryRegisterItem(), 'Item-Register');
  }
  if (!money) applySceneInventoryCustomIconPreview(object);
  const submit = overlay.querySelector('[data-scene-inventory-action="submit"]');
  if (submit) submit.textContent = money ? (sink ? 'Betrag ausbuchen' : 'Geld übertragen') : 'Übergabe vollziehen';
  const token = overlay.dataset.sceneInventoryOpenToken;
  void Promise.all([import('./scene-inventory-people.js'), import('./scene-inventory-money-ui.js')]).then(([people, moneyUi]) => {
    if (!token || overlay.dataset.sceneInventoryOpenToken !== token || !overlay.classList.contains('active')) return;
    people.refreshSceneInventoryPeople(overlay);
    moneyUi.refreshSceneInventoryMoneyPreview(overlay, { giver, receiver });
  }).catch(error => {
    if (token && overlay.dataset.sceneInventoryOpenToken === token && overlay.classList.contains('active')) setSceneInventoryStatus(error?.message || 'Die Inventarvorschau konnte nicht vorbereitet werden.', 'error');
  });
}

function renderSceneInventoryObjectPreview(target, item = null, sourceLabel = '') {
  const name = item?.name || item?.title || 'Noch nichts ausgewählt';
  const image = sanitizeImageSrc(item?.image || item?.icon || '');
  const symbol = image ? `<img src="${image}" alt="">` : `<span>${escapeHtml(item?.icon || '◆')}</span>`;
  target.innerHTML = `${symbol}<strong>${escapeHtml(name)}</strong><small>${escapeHtml(item?.description || item?.details || item?.type || sourceLabel)}</small>`;
}

function applySceneInventoryCustomIconPreview(target) {
  const icon = sanitizeImageSrc(document.getElementById('scene-transfer-icon')?.value || '');
  if (!icon || !target) return;
  const visual = target.querySelector('img, span');
  if (visual) visual.outerHTML = `<img src="${icon}" alt="">`;
}

function refreshSceneInventoryRegisterSummary() {
  const target = document.querySelector('[data-scene-transfer-register-summary]');
  if (!target) return;
  const item = getSceneInventoryRegisterItem();
  target.textContent = item ? `${item.title} · ${item.categoryLabel || item.type || 'Item'}` : 'Noch kein Registeritem gewählt';
}

async function openSceneInventoryDialog(threadId = '') {
  const characters = getSceneInventoryCharacters();
  if (characters.length < 1) {
    if (typeof showAppStatus === 'function') showAppStatus('Für eine Inventarbuchung wird eine gespeicherte Figur benötigt.', 'error');
    return;
  }
  const overlay = ensureSceneInventoryDialog();
  overlay.dataset.sceneInventoryThreadId = String(threadId || getCurrentCommentThreadId() || '');
  const token = crypto.randomUUID(); overlay.dataset.sceneInventoryOpenToken = token;
  overlay.dataset.sceneMoneyPending = 'false'; overlay.dataset.sceneMoneySubmitting = 'false';
  setSceneInventoryDialogLocked(true);
  overlay.querySelector('#scene-transfer-giver').value = characters[0].id;
  overlay.querySelector('#scene-transfer-receiver').value = (characters[1] || characters[0]).id;
  overlay.querySelector('#scene-transfer-kind').value = 'money';
  overlay.querySelector('#scene-transfer-money-mode').value = 'character';
  overlay.querySelector('#scene-transfer-currency').value = 'copper';
  overlay.querySelector('#scene-transfer-money-amount').value = '1';
  overlay.querySelector('#scene-transfer-item-amount').value = '1';
  overlay.querySelector('#scene-transfer-register-amount').value = '1';
  overlay.querySelector('#scene-transfer-icon').value = '';
  overlay.querySelector('#scene-transfer-flavour').value = '';
  setSceneInventoryRegisterItem(null);
  refreshSceneInventoryRegisterSummary();
  setSceneInventoryStatus('');
  activateDialog('scene-inventory-overlay', { initialFocus: '#scene-transfer-kind' });
  refreshSceneInventoryDialog({ refreshItems: true });
  try {
    const [people, moneyUi] = await Promise.all([import('./scene-inventory-people.js'), import('./scene-inventory-money-ui.js')]);
    if (overlay.dataset.sceneInventoryOpenToken !== token || !overlay.classList.contains('active')) return null;
    const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
    const comments = typeof _commentCache !== 'undefined' && Array.isArray(_commentCache[overlay.dataset.sceneInventoryThreadId]) ? _commentCache[overlay.dataset.sceneInventoryThreadId] : [];
    people.mountSceneInventoryPeople(overlay, { characters, entry: thread?.threadId === overlay.dataset.sceneInventoryThreadId ? thread.entry : null, comments });
    moneyUi.mountSceneInventoryMoneyControls(overlay);
    setSceneInventoryDialogLocked(false);
    refreshSceneInventoryDialog({ refreshItems: true });
  } catch (error) { if (overlay.dataset.sceneInventoryOpenToken === token) setSceneInventoryStatus(error?.message || 'Die Inventarauswahl konnte nicht geöffnet werden.', 'error'); }
  return overlay.dataset.sceneInventoryOpenToken === token ? overlay : null;
}

function setSceneInventoryDialogLocked(locked) {
  const overlay = document.getElementById('scene-inventory-overlay');
  if (!overlay) return;
  overlay.dataset.sceneInventoryLocked = String(!!locked);
  for (const input of overlay.querySelectorAll('input, select, textarea, button')) {
    if (input.dataset.sceneInventoryAction === 'close') continue;
    if (input.dataset.sceneInventoryAction === 'submit' && overlay.dataset.sceneMoneyPending === 'true') {
      input.disabled = overlay.dataset.sceneMoneySubmitting === 'true';
      input.textContent = input.disabled ? 'Wird gespeichert …' : 'Offene Buchung prüfen';
    } else input.disabled = !!locked;
  }
  for (const picker of overlay.querySelectorAll('[data-trade-actor-picker][open]')) if (locked) picker.open = false;
}

function closeSceneInventoryDialog() {
  const overlay = document.getElementById('scene-inventory-overlay');
  if (overlay) overlay.dataset.sceneInventoryOpenToken = '';
  deactivateDialog('scene-inventory-overlay');
  void Promise.all([import('./scene-inventory-people.js'), import('./scene-inventory-money-ui.js')]).then(([people, moneyUi]) => {
    if (overlay?.dataset.sceneInventoryOpenToken) return;
    people.disposeSceneInventoryPeople(overlay); moneyUi.disposeSceneInventoryMoneyControls(overlay);
  }).catch(() => {});
}
