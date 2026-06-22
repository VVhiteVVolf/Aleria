let _itemDbState = {
  open: false,
  activeCategory: 'alle',
  search: '',
  selectedKey: '',
  creating: false,
  loading: false,
  loadMessage: ''
};

function itemDbGetPanel() {
  let panel = document.getElementById('item-db-panel');
  if (panel) return panel;

  panel = document.createElement('section');
  panel.id = 'item-db-panel';
  panel.className = 'item-db-panel';
  panel.setAttribute('aria-label', 'Item- und Güterdatenbank');
  panel.hidden = true;
  document.body.appendChild(panel);
  return panel;
}

function itemDbGetVisibleItems(items) {
  const needle = itemDbNormalizeText(_itemDbState.search);
  return items.filter(item => {
    if (_itemDbState.activeCategory !== 'alle' && item.category !== _itemDbState.activeCategory) return false;
    if (!needle) return true;
    return itemDbNormalizeText([
      item.title,
      item.type,
      item.description,
      item.details,
      item.price,
      item.tags?.join(' ')
    ].join(' ')).includes(needle);
  });
}

function itemDbRenderImage(item) {
  const image = itemDbSanitizeImage(item.image || '');
  if (image) {
    return `<span class="item-db-image"><img src="${image}" alt="${itemDbEscapeHtml(item.title)}" loading="lazy" decoding="async"></span>`;
  }
  const initial = typeof getInitialChar === 'function' ? getInitialChar(item.title) : item.title.slice(0, 1).toUpperCase();
  return `<span class="item-db-image placeholder">${itemDbEscapeHtml(initial || '?')}</span>`;
}

function itemDbRenderTabs(items) {
  return ITEM_DB_CATEGORIES.map(category => {
    const count = category.id === 'alle'
      ? items.length
      : items.filter(item => item.category === category.id).length;
    const active = _itemDbState.activeCategory === category.id ? ' active' : '';
    return `<button class="item-db-tab${active}" type="button" data-item-db-action="set-category" data-category="${itemDbEscapeHtml(category.id)}">
      <span>${itemDbEscapeHtml(category.label)}</span><strong>${count}</strong>
    </button>`;
  }).join('');
}

function itemDbRenderTable(items) {
  if (!items.length) {
    return `<div class="item-db-empty">Keine Items für diesen Filter gefunden.</div>`;
  }

  return `<div class="item-db-table" role="table" aria-label="Items und Güter">
    <div class="item-db-row item-db-head" role="row">
      <div>Item</div>
      <div>Kategorie</div>
      <div>Beschreibung</div>
      <div>Preis</div>
      <div>Quellen</div>
    </div>
    ${items.map(item => {
      const selected = item.canonicalKey === _itemDbState.selectedKey ? ' selected' : '';
      return `<button class="item-db-row item-db-item${selected}" type="button" role="row" data-item-db-action="select-item" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">
        <div class="item-db-title-cell">${itemDbRenderImage(item)}<span><strong>${itemDbEscapeHtml(item.title)}</strong><small>${itemDbEscapeHtml(item.type || item.categoryLabel)}</small></span></div>
        <div>${itemDbEscapeHtml(item.categoryLabel)}</div>
        <div class="item-db-description">${itemDbEscapeHtml(item.description || item.details || 'Keine Beschreibung')}</div>
        <div>${itemDbEscapeHtml(item.price || '-')}</div>
        <div><span class="item-db-source-pill">${item.sourceRefs?.length || 0}</span>${item.editedLocally ? '<span class="item-db-local-pill">Lokal</span>' : ''}</div>
      </button>`;
    }).join('')}
  </div>`;
}

function itemDbRenderSources(item) {
  if (!item?.sourceRefs?.length) return '<p class="item-db-muted">Keine Quellen hinterlegt.</p>';
  return `<ul class="item-db-source-list">
    ${item.sourceRefs.map(ref => `<li>
      <strong>${itemDbEscapeHtml(ref.kind || 'Quelle')}</strong>
      <span>${itemDbEscapeHtml(ref.moduleTitle || ref.market || 'Unbekannte Quelle')}</span>
      ${ref.pageTitle ? `<small>${itemDbEscapeHtml(ref.pageTitle)}</small>` : ''}
    </li>`).join('')}
  </ul>`;
}

function itemDbRenderEditorFields(item = {}) {
  return `
    <label>Titel<input type="text" data-item-edit="title" value="${itemDbEscapeHtml(item.title || '')}" placeholder="Name des Items"></label>
    <label>Kategorie<select data-item-edit="category">
      ${ITEM_DB_CATEGORIES.filter(category => category.id !== 'alle').map(category => `<option value="${itemDbEscapeHtml(category.id)}"${category.id === (item.category || ITEM_DB_DEFAULT_CATEGORY) ? ' selected' : ''}>${itemDbEscapeHtml(category.label)}</option>`).join('')}
    </select></label>
    <label>Typ<input type="text" data-item-edit="type" value="${itemDbEscapeHtml(item.type || '')}"></label>
    <label>Bild-URL<input type="url" data-item-edit="image" value="${itemDbEscapeHtml(item.image || '')}"></label>
    <label>Preis<input type="text" data-item-edit="price" value="${itemDbEscapeHtml(item.price || '')}"></label>
    <label>Währung<input type="text" data-item-edit="currency" value="${itemDbEscapeHtml(item.currency || '')}"></label>
    <label>Tags<input type="text" data-item-edit="tags" value="${itemDbEscapeHtml((item.tags || []).join(', '))}"></label>
    <label>Beschreibung<textarea rows="4" data-item-edit="description">${itemDbEscapeHtml(item.description || '')}</textarea></label>
    <label>Details<textarea rows="4" data-item-edit="details">${itemDbEscapeHtml(item.details || '')}</textarea></label>`;
}

function itemDbRenderEditor(item, creating = false) {
  if (creating) {
    return `<aside class="item-db-editor">
      <div class="item-db-editor-head">
        <span>Neues Item</span>
        <button type="button" data-item-db-action="cancel-create">Abbrechen</button>
      </div>
      ${itemDbRenderEditorFields()}
      <button class="item-db-save" type="button" data-item-db-action="create-item">Item hinzufügen</button>
    </aside>`;
  }
  if (!item) {
    return `<aside class="item-db-editor item-db-editor-empty">
      <h3>Eintrag auswählen</h3>
      <p>Wähle links ein Item aus, um Quellen und lokale Korrekturen zu sehen.</p>
    </aside>`;
  }

  return `<aside class="item-db-editor">
    <div class="item-db-editor-head">
      <span>Lokale Korrektur</span>
      <div class="item-db-editor-head-actions">
        ${item.locallyCreated ? '' : `<button type="button" data-item-db-action="clear-override" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">Zurücksetzen</button>`}
        <button class="danger" type="button" data-item-db-action="delete-item" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">Löschen</button>
      </div>
    </div>
    ${itemDbRenderEditorFields(item)}
    <button class="item-db-save" type="button" data-item-db-action="save-item" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">Korrektur speichern</button>
    <section class="item-db-source-box">
      <h4>Quellen</h4>
      ${itemDbRenderSources(item)}
    </section>
  </aside>`;
}

function renderItemDatabasePanel() {
  const panel = itemDbGetPanel();
  const allItems = itemDbBuildIndex();
  const visibleItems = itemDbGetVisibleItems(allItems);
  const selected = allItems.find(item => item.canonicalKey === _itemDbState.selectedKey) || visibleItems[0] || null;
  if (selected && !_itemDbState.selectedKey) _itemDbState.selectedKey = selected.canonicalKey;
  const summary = itemDbGetSummary(allItems);

  panel.hidden = !_itemDbState.open;
  panel.innerHTML = `
    <div class="item-db-shell">
      <header class="item-db-header">
        <div>
          <div class="item-db-kicker">Aleria Datenbank</div>
          <h2>Items und Güter</h2>
          <p>${summary.itemCount} Einträge aus ${summary.sourceCount} Quellen · ${summary.duplicateCount} zusammengeführte Dubletten</p>
        </div>
        <button class="item-db-close" type="button" data-item-db-action="close" aria-label="Schließen">×</button>
      </header>
      <div class="item-db-body">
        <nav class="item-db-tabs" aria-label="Item-Kategorien">${itemDbRenderTabs(allItems)}</nav>
        <main class="item-db-main">
          <div class="item-db-toolbar">
            <input type="search" value="${itemDbEscapeHtml(_itemDbState.search)}" placeholder="Items suchen..." data-item-db-action="search">
            <button class="item-db-add" type="button" data-item-db-action="start-create">+ Neues Item</button>
            <button type="button" data-item-db-action="rescan"${_itemDbState.loading ? ' disabled' : ''}>${_itemDbState.loading ? 'Scan läuft...' : 'Neu scannen'}</button>
          </div>
          ${_itemDbState.loadMessage ? `<div class="item-db-status">${itemDbEscapeHtml(_itemDbState.loadMessage)}</div>` : ''}
          ${itemDbRenderTable(visibleItems)}
        </main>
        ${itemDbRenderEditor(selected, _itemDbState.creating)}
      </div>
    </div>`;
}

async function itemDbRefreshSources(message = 'Marktquellen werden geladen...') {
  if (_itemDbState.loading) return;
  _itemDbState.loading = true;
  _itemDbState.loadMessage = message;
  renderItemDatabasePanel();
  try {
    if (typeof itemDbLoadMarketSources === 'function') await itemDbLoadMarketSources();
    const summary = itemDbGetSummary();
    _itemDbState.loadMessage = `${summary.itemCount} Einträge aus ${summary.sourceCount} Quellen geladen.`;
  } catch (error) {
    console.error('Item database scan failed:', error);
    _itemDbState.loadMessage = 'Scan fehlgeschlagen. Details stehen in der Konsole.';
  } finally {
    _itemDbState.loading = false;
    renderItemDatabasePanel();
  }
}

function itemDbOpen() {
  _itemDbState.open = true;
  renderItemDatabasePanel();
  itemDbRefreshSources();
}

function itemDbClose() {
  _itemDbState.open = false;
  renderItemDatabasePanel();
}

function itemDbCollectEditorValues(panel) {
  const valueFor = field => panel.querySelector(`[data-item-edit="${field}"]`)?.value || '';
  return {
    title: valueFor('title'),
    category: valueFor('category'),
    type: valueFor('type'),
    image: valueFor('image'),
    price: valueFor('price'),
    currency: valueFor('currency'),
    tags: valueFor('tags'),
    description: valueFor('description'),
    details: valueFor('details')
  };
}

async function handleItemDatabaseClick(event) {
  const trigger = event.target?.closest?.('[data-item-db-action]');
  if (!trigger) return;
  const action = trigger.dataset.itemDbAction;

  if (action === 'open') {
    event.preventDefault();
    itemDbOpen();
    return;
  }
  if (action === 'close') {
    event.preventDefault();
    itemDbClose();
    return;
  }
  if (action === 'set-category') {
    _itemDbState.activeCategory = trigger.dataset.category || 'alle';
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'select-item') {
    _itemDbState.selectedKey = trigger.dataset.itemKey || '';
    _itemDbState.creating = false;
    renderItemDatabasePanel();
    return;
  }
  if (action === 'start-create') {
    _itemDbState.creating = true;
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    document.querySelector('#item-db-panel [data-item-edit="title"]')?.focus();
    return;
  }
  if (action === 'cancel-create') {
    _itemDbState.creating = false;
    renderItemDatabasePanel();
    return;
  }
  if (action === 'create-item') {
    const panel = trigger.closest('.item-db-panel');
    try {
      const key = itemDbCreateCustomItem(itemDbCollectEditorValues(panel));
      _itemDbState.creating = false;
      _itemDbState.selectedKey = key;
      renderItemDatabasePanel();
    } catch (error) {
      if (typeof showAppStatus === 'function') showAppStatus(error.message || 'Item konnte nicht angelegt werden.', 'error');
      document.querySelector('#item-db-panel [data-item-edit="title"]')?.focus();
    }
    return;
  }
  if (action === 'save-item') {
    const panel = trigger.closest('.item-db-panel');
    itemDbSaveItem(trigger.dataset.itemKey, itemDbCollectEditorValues(panel));
    renderItemDatabasePanel();
    return;
  }
  if (action === 'clear-override') {
    itemDbClearOverride(trigger.dataset.itemKey);
    renderItemDatabasePanel();
    return;
  }
  if (action === 'delete-item') {
    const key = trigger.dataset.itemKey || '';
    const item = itemDbBuildIndex().find(candidate => candidate.canonicalKey === key);
    if (!item) return;
    const confirmed = window.confirm(`„${item.title}“ aus der Items- und Güterdatenbank entfernen?`);
    if (!confirmed) return;
    itemDbDeleteItem(key);
    _itemDbState.selectedKey = '';
    _itemDbState.creating = false;
    renderItemDatabasePanel();
    return;
  }
  if (action === 'rescan') {
    await itemDbRefreshSources('Markt- und Modulquellen werden neu gescannt...');
  }
}

function handleItemDatabaseInput(event) {
  const input = event.target?.closest?.('[data-item-db-action="search"]');
  if (!input) return;
  _itemDbState.search = input.value || '';
  _itemDbState.selectedKey = '';
  renderItemDatabasePanel();
  const nextInput = document.querySelector('#item-db-panel [data-item-db-action="search"]');
  if (nextInput) {
    nextInput.focus({ preventScroll: true });
    nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
  }
}

function initItemDatabaseUi() {
  document.addEventListener('click', handleItemDatabaseClick);
  document.addEventListener('input', handleItemDatabaseInput);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initItemDatabaseUi);
} else {
  initItemDatabaseUi();
}
