let _itemDbPickerSession = null;

function itemDbGetPickerPanel() {
  let panel = document.getElementById('item-db-picker-panel');
  if (panel) return panel;
  panel = document.createElement('section');
  panel.id = 'item-db-picker-panel';
  panel.className = 'item-db-picker-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Item aus Datenbank laden');
  document.body.appendChild(panel);
  return panel;
}

function itemDbFilterPickerItems(items = []) {
  const needle = itemDbNormalizeText(_itemDbPickerSession?.search || '');
  if (!needle) return items;
  return items.filter(item => itemDbNormalizeText([
    item.title,
    item.categoryLabel,
    item.type,
    item.description,
    item.details,
    item.price,
    item.tags?.join(' ')
  ].join(' ')).includes(needle));
}

function itemDbRenderPickerSource(item = {}) {
  const ref = item.sourceRefs?.[0];
  if (!ref) return item.categoryLabel || 'Itemdatenbank';
  return ref.market || ref.moduleTitle || ref.kind || item.categoryLabel || 'Itemdatenbank';
}

function itemDbRenderPickerItems(items = []) {
  if (!items.length) {
    return '<div class="item-db-picker-empty">Keine passenden Items gefunden.</div>';
  }
  return items.map(item => `
    <button class="item-db-picker-item" type="button" data-item-db-picker-action="select" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">
      ${itemDbRenderImage(item)}
      <span>
        <strong>${itemDbEscapeHtml(item.title)}</strong>
        <small>${itemDbEscapeHtml([item.categoryLabel, item.type].filter(Boolean).join(' - '))}</small>
        <em>${itemDbEscapeHtml(item.description || item.details || item.price || 'Kein Beschreibungstext')}</em>
      </span>
      <b>${itemDbEscapeHtml(itemDbRenderPickerSource(item))}</b>
    </button>`).join('');
}

function renderItemDbPickerPanel() {
  const panel = itemDbGetPickerPanel();
  if (!_itemDbPickerSession) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }
  const items = itemDbBuildIndex();
  const visibleItems = itemDbFilterPickerItems(items);
  panel.hidden = false;
  panel.innerHTML = `
    <div class="item-db-picker-shell">
      <header class="item-db-picker-head">
        <div>
          <div class="item-db-kicker">Items und Gueter</div>
          <h3>${itemDbEscapeHtml(_itemDbPickerSession.title || 'Item laden')}</h3>
        </div>
        <button type="button" data-item-db-picker-action="close" aria-label="Schliessen">x</button>
      </header>
      <div class="item-db-picker-toolbar">
        <input type="search" value="${itemDbEscapeHtml(_itemDbPickerSession.search || '')}" placeholder="Item suchen..." data-item-db-picker-action="search">
        <button type="button" data-item-db-picker-action="refresh">Neu scannen</button>
      </div>
      <div class="item-db-picker-list">${itemDbRenderPickerItems(visibleItems)}</div>
    </div>`;
}

async function openItemDbPicker(options = {}) {
  _itemDbPickerSession = {
    title: options.title || 'Item laden',
    onSelect: typeof options.onSelect === 'function' ? options.onSelect : null,
    search: String(options.search || '').trim()
  };
  renderItemDbPickerPanel();
  if (typeof itemDbLoadMarketSources === 'function') {
    await itemDbLoadMarketSources();
    renderItemDbPickerPanel();
  }
  document.querySelector('#item-db-picker-panel [data-item-db-picker-action="search"]')?.focus();
}

function closeItemDbPicker() {
  _itemDbPickerSession = null;
  renderItemDbPickerPanel();
}

async function handleItemDbPickerClick(event) {
  const trigger = event.target?.closest?.('[data-item-db-picker-action]');
  if (!trigger) return;
  const action = trigger.dataset.itemDbPickerAction;
  if (!_itemDbPickerSession && action !== 'close') return;

  if (action === 'close') {
    event.preventDefault();
    closeItemDbPicker();
    return;
  }
  if (action === 'refresh') {
    event.preventDefault();
    if (typeof itemDbLoadMarketSources === 'function') await itemDbLoadMarketSources();
    renderItemDbPickerPanel();
    return;
  }
  if (action === 'select') {
    event.preventDefault();
    const item = itemDbBuildIndex().find(candidate => candidate.canonicalKey === trigger.dataset.itemKey);
    const onSelect = _itemDbPickerSession.onSelect;
    closeItemDbPicker();
    if (item && onSelect) onSelect(item);
  }
}

function handleItemDbPickerInput(event) {
  const input = event.target?.closest?.('[data-item-db-picker-action="search"]');
  if (!input || !_itemDbPickerSession) return;
  _itemDbPickerSession.search = input.value || '';
  renderItemDbPickerPanel();
  const nextInput = document.querySelector('#item-db-picker-panel [data-item-db-picker-action="search"]');
  if (nextInput) {
    nextInput.focus({ preventScroll: true });
    nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
  }
}

function initItemDbPicker() {
  document.addEventListener('click', handleItemDbPickerClick);
  document.addEventListener('input', handleItemDbPickerInput);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initItemDbPicker);
} else {
  initItemDbPicker();
}
