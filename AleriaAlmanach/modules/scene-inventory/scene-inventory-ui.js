// Scene-header control and transfer dialog.
function buildSceneInventoryControl(threadId = '') {
  return `<button class="scene-inventory-toggle" type="button" data-scene-inventory-action="open" data-comment-thread-id="${escapeHtml(threadId)}" aria-label="Inventar-Interaktion öffnen" title="Inventar-Interaktion"><img src="../IconOrdner/CK3 icons alt/Icon_loot.png" alt="" aria-hidden="true"></button>`;
}

function buildSceneInventoryCharacterOptions() {
  return getSceneInventoryCharacters().map(character => `<option value="${escapeHtml(character.id)}">${escapeHtml(character.name)}</option>`).join('');
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
    <header><div><span>Szeneninteraktion</span><h2 id="scene-inventory-title">Gegenstand übergeben</h2></div><button type="button" data-scene-inventory-action="close" aria-label="Dialog schließen">×</button></header>
    <div class="scene-inventory-body">
      <div class="scene-inventory-parties">
        <section><div class="scene-inventory-portrait" data-scene-transfer-giver-portrait></div><label>Geber<select id="scene-transfer-giver"></select></label></section>
        <div class="scene-inventory-object-preview" data-scene-transfer-object><span>◆</span><strong>Übergabe</strong><small>Wähle Geld oder Gegenstand</small></div>
        <section><div class="scene-inventory-portrait" data-scene-transfer-receiver-portrait></div><label>Empfänger<select id="scene-transfer-receiver"></select></label></section>
      </div>
      <div class="scene-inventory-fields">
        <label><span>Quelle</span><select id="scene-transfer-kind"><option value="money">Geld</option><option value="item">Charakterinventar</option><option value="register-item">Item-Register</option></select></label>
        <div class="scene-transfer-money-fields"><label><span>Währung</span><select id="scene-transfer-currency"><option value="gold">Gold</option><option value="silver">Silber</option><option value="copper">Kupfer</option></select></label><label><span>Menge</span><input id="scene-transfer-money-amount" type="number" min="1" step="1" value="1"></label></div>
        <div class="scene-transfer-item-fields" hidden><label><span>Gegenstand</span><select id="scene-transfer-item"></select></label><label><span>Menge</span><input id="scene-transfer-item-amount" type="number" min="1" step="1" value="1"></label></div>
        <div class="scene-transfer-register-fields" hidden><button type="button" data-scene-inventory-action="pick-register-item">Item aus Register wählen</button><div data-scene-transfer-register-summary>Noch kein Registeritem gewählt</div><label><span>Menge</span><input id="scene-transfer-register-amount" type="number" min="1" step="1" value="1"></label></div>
        <label class="wide scene-transfer-icon-field"><span>Transaktionsicon <small>(optional)</small></span><span><input id="scene-transfer-icon" type="text" placeholder="Icon aus dem Aleria-Verzeichnis wählen"><button type="button" data-scene-inventory-action="pick-icon">Icon wählen</button><button type="button" data-scene-inventory-action="clear-icon" aria-label="Transaktionsicon entfernen">×</button></span></label>
        <label class="wide"><span>Flavourtext</span><textarea id="scene-transfer-flavour" rows="3" maxlength="500" placeholder="Gwendolyn legt den schweren Beutel in Gawains Hand …"></textarea></label>
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

function renderSceneInventoryPortrait(character, target) {
  if (!target) return;
  const src = sanitizeImageSrc(character?.portrait || '');
  target.innerHTML = src ? `<img src="${src}" alt="${escapeHtml(character.name)}">` : `<span>${escapeHtml(getInitialChar(character?.name || '?'))}</span>`;
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
  const giver = getSceneInventoryCharacter(document.getElementById('scene-transfer-giver')?.value);
  const receiver = getSceneInventoryCharacter(document.getElementById('scene-transfer-receiver')?.value);
  const kind = document.getElementById('scene-transfer-kind')?.value || 'money';
  renderSceneInventoryPortrait(giver, document.querySelector('[data-scene-transfer-giver-portrait]'));
  renderSceneInventoryPortrait(receiver, document.querySelector('[data-scene-transfer-receiver-portrait]'));
  document.querySelector('.scene-transfer-money-fields').hidden = kind !== 'money';
  document.querySelector('.scene-transfer-item-fields').hidden = kind !== 'item';
  document.querySelector('.scene-transfer-register-fields').hidden = kind !== 'register-item';
  if (refreshItems) refreshSceneInventoryItems();
  const object = document.querySelector('[data-scene-transfer-object]');
  if (!object) return;
  if (kind === 'money') {
    const amount = document.getElementById('scene-transfer-money-amount')?.value || '1';
    const currency = document.getElementById('scene-transfer-currency')?.selectedOptions?.[0]?.textContent || 'Gold';
    object.innerHTML = `<img src="../IconOrdner/CK3 icons alt/Icon_gold.png" alt=""><strong>${escapeHtml(amount)} ${escapeHtml(currency)}</strong><small>Geldübergabe</small>`;
  } else if (kind === 'item') {
    const item = getSceneInventoryData(giver || {}).items.find((entry, index) => String(entry.id || index) === String(document.getElementById('scene-transfer-item')?.value));
    renderSceneInventoryObjectPreview(object, item, 'Charakterinventar');
  } else {
    renderSceneInventoryObjectPreview(object, getSceneInventoryRegisterItem(), 'Item-Register');
  }
  applySceneInventoryCustomIconPreview(object);
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

function openSceneInventoryDialog() {
  const characters = getSceneInventoryCharacters();
  if (characters.length < 2) {
    if (typeof showAppStatus === 'function') showAppStatus('Für eine Übergabe werden mindestens zwei gespeicherte Charaktere benötigt.', 'error');
    return;
  }
  const overlay = ensureSceneInventoryDialog();
  const options = buildSceneInventoryCharacterOptions();
  overlay.querySelector('#scene-transfer-giver').innerHTML = options;
  overlay.querySelector('#scene-transfer-receiver').innerHTML = options;
  overlay.querySelector('#scene-transfer-giver').value = characters[0].id;
  overlay.querySelector('#scene-transfer-receiver').value = characters[1].id;
  overlay.querySelector('#scene-transfer-kind').value = 'money';
  overlay.querySelector('#scene-transfer-money-amount').value = '1';
  overlay.querySelector('#scene-transfer-item-amount').value = '1';
  overlay.querySelector('#scene-transfer-register-amount').value = '1';
  overlay.querySelector('#scene-transfer-icon').value = '';
  overlay.querySelector('#scene-transfer-flavour').value = '';
  setSceneInventoryRegisterItem(null);
  refreshSceneInventoryRegisterSummary();
  setSceneInventoryStatus('');
  refreshSceneInventoryDialog({ refreshItems: true });
  activateDialog('scene-inventory-overlay', { initialFocus: '#scene-transfer-giver' });
}

function closeSceneInventoryDialog() { deactivateDialog('scene-inventory-overlay'); }
