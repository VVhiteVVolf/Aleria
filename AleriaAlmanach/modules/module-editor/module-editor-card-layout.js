// Shared hierarchy layout editor for card-based module pages.

const MODULE_CARD_LAYOUT_CONFIG = {
  profiles: {
    cardSelector: '.module-profile-card',
    idSelector: '.me-profile-id',
    titleSelector: '.me-profile-name',
    fallbackLabel: 'Charakter',
    layoutKey: 'profileLayout',
    cardPrefix: 'profile'
  },
  wanted: {
    cardSelector: '.module-wanted-card',
    idSelector: '.me-wanted-id',
    titleSelector: '.me-wanted-name',
    fallbackLabel: 'Kopfgeld',
    layoutKey: 'wantedLayout',
    cardPrefix: 'wanted'
  }
};

function getModuleCardLayoutConfig(kind = 'profiles') {
  return MODULE_CARD_LAYOUT_CONFIG[kind] || MODULE_CARD_LAYOUT_CONFIG.profiles;
}

function createModuleEditorCardEntityId(prefix = 'card') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeModuleEditorCardId(value, kind = 'card', index = 0) {
  const fallback = `${kind}-${index + 1}`;
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || fallback;
}

function normalizeModuleEditorCards(cards = [], kind = 'profiles') {
  const config = getModuleCardLayoutConfig(kind);
  const used = new Set();
  return (Array.isArray(cards) ? cards : []).map((card, index) => {
    const next = card && typeof card === 'object' ? { ...card } : {};
    let id = normalizeModuleEditorCardId(next.id, config.cardPrefix, index);
    let suffix = 2;
    while (used.has(id)) {
      id = `${normalizeModuleEditorCardId(next.id, config.cardPrefix, index)}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    next.id = id;
    return next;
  });
}

function getModuleCardLayoutBlocks(page, kind = 'profiles') {
  const config = getModuleCardLayoutConfig(kind);
  return Array.isArray(page?.[config.layoutKey]) ? page[config.layoutKey] : [];
}

function createDefaultModuleCardLayout(cards = [], kind = 'profiles') {
  const ids = cards.map((card, index) => normalizeModuleEditorCardId(card?.id, getModuleCardLayoutConfig(kind).cardPrefix, index));
  if (!ids.length) return [];
  const firstRow = ids.slice(0, 4);
  const remainingRows = ids.slice(4).map((id, index) => ({
    id: createModuleEditorCardEntityId('layout-row'),
    type: 'row',
    columns: 1,
    cardIds: [id]
  }));
  return [
    {
      id: createModuleEditorCardEntityId('layout-row'),
      type: 'row',
      columns: Math.min(4, firstRow.length),
      cardIds: firstRow
    },
    ...remainingRows
  ];
}

function normalizeModuleCardLayoutForEditor(layout = [], cards = [], kind = 'profiles') {
  const validIds = new Set(cards.map(card => String(card?.id || '').trim()).filter(Boolean));
  const usedIds = new Set();
  const blocks = (Array.isArray(layout) ? layout : []).map((block, index) => {
    const type = String(block?.type || '').trim();
    if (type === 'heading') {
      return {
        id: normalizeModuleEditorCardId(block.id, 'layout', index),
        type,
        title: String(block.title || '').trim(),
        subtitle: String(block.subtitle || '').trim()
      };
    }
    if (type === 'row') {
      const seen = new Set();
      const rawCardIds = (Array.isArray(block.cardIds) ? block.cardIds : [])
        .map(id => String(id || '').trim())
        .filter(id => validIds.has(id) && !seen.has(id) && seen.add(id))
        .slice(0, 4);
      const cardIds = rawCardIds.filter(id => !usedIds.has(id) && usedIds.add(id));
      if (!cardIds.length) return null;
      return {
        id: normalizeModuleEditorCardId(block.id, 'layout', index),
        type,
        columns: Math.max(1, Math.min(4, Number(block.columns) || cardIds.length || 1)),
        cardIds
      };
    }
    return null;
  }).filter(Boolean);

  const missingCards = cards.filter(card => card?.id && !usedIds.has(card.id));
  if (missingCards.length) {
    blocks.push(...createDefaultModuleCardLayout(missingCards, kind));
  }

  return blocks.length ? blocks : createDefaultModuleCardLayout(cards, kind);
}

function getModuleCardLayoutCardsFromDom(pageCard, kind = 'profiles') {
  const config = getModuleCardLayoutConfig(kind);
  return Array.from(pageCard?.querySelectorAll(config.cardSelector) || []).map((card, index) => {
    const idInput = card.querySelector(config.idSelector);
    if (!idInput.value) idInput.value = createModuleEditorCardEntityId(config.cardPrefix);
    return {
      id: normalizeModuleEditorCardId(idInput.value, config.cardPrefix, index),
      name: getTrimmedFormValue(card, config.titleSelector) || `${config.fallbackLabel} ${index + 1}`
    };
  });
}

function buildModuleCardLayoutCardOptions(cards = [], selected = '') {
  return `
    <option value="">- frei -</option>
    ${cards.map((card, index) => `
      <option value="${escapeHtml(card.id)}"${card.id === selected ? ' selected' : ''}>${escapeHtml(card.name || `Karte ${index + 1}`)}</option>
    `).join('')}`;
}

function buildModuleCardLayoutBlockMarkup(block, index, cards = []) {
  if (block.type === 'heading') {
    return `
      <div class="module-card-layout-block" data-layout-block-type="heading">
        <input type="hidden" class="me-card-layout-id" value="${escapeHtml(block.id || createModuleEditorCardEntityId('layout-heading'))}">
        <input type="hidden" class="me-card-layout-type" value="heading">
        <div class="module-card-layout-block-head">
          <div class="inline-edit-kicker">Trenner ${index + 1}</div>
          <div class="module-editor-inline">
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-card-layout-block" data-layout-direction="-1">Hoch</button>
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-card-layout-block" data-layout-direction="1">Runter</button>
            <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-card-layout-block">Loeschen</button>
          </div>
        </div>
        <div class="module-editor-grid">
          <div class="module-editor-field">
            <label>Ueberschrift</label>
            <input class="me-card-layout-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="z.B. Angestellte">
          </div>
          <div class="module-editor-field">
            <label>Unterzeile</label>
            <input class="me-card-layout-subtitle" type="text" value="${escapeHtml(block.subtitle || '')}" placeholder="optional">
          </div>
        </div>
      </div>`;
  }

  const columns = Math.max(1, Math.min(4, Number(block.columns) || 1));
  return `
    <div class="module-card-layout-block" data-layout-block-type="row">
      <input type="hidden" class="me-card-layout-id" value="${escapeHtml(block.id || createModuleEditorCardEntityId('layout-row'))}">
      <input type="hidden" class="me-card-layout-type" value="row">
      <div class="module-card-layout-block-head">
        <div class="inline-edit-kicker">Hierarchieebene ${index + 1}</div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-card-layout-block" data-layout-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-card-layout-block" data-layout-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-card-layout-block">Loeschen</button>
        </div>
      </div>
      <div class="module-card-layout-row-editor">
        <div class="module-editor-field">
          <label>Karten in dieser Ebene</label>
          <select class="me-card-layout-columns">
            <option value="1"${columns === 1 ? ' selected' : ''}>1 Karte</option>
            <option value="2"${columns === 2 ? ' selected' : ''}>2 Karten</option>
            <option value="3"${columns === 3 ? ' selected' : ''}>3 Karten</option>
            <option value="4"${columns === 4 ? ' selected' : ''}>4 Karten</option>
          </select>
        </div>
        ${[0, 1, 2, 3].map(slot => `
          <div class="module-editor-field">
            <label>Position ${slot + 1}</label>
            <select class="me-card-layout-card-id">
              ${buildModuleCardLayoutCardOptions(cards, block.cardIds?.[slot] || '')}
            </select>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function buildModuleCardLayoutEditor(kind, layout, cards) {
  const normalizedCards = normalizeModuleEditorCards(cards, kind);
  const blocks = normalizeModuleCardLayoutForEditor(layout, normalizedCards, kind);
  return `
    <div class="module-card-layout-editor" data-card-layout-kind="${escapeHtml(kind)}">
      <div class="module-card-layout-toolbar">
        <div>
          <div class="inline-edit-kicker">Hierarchie / Darstellung</div>
          <div class="module-editor-help">Baue Stammbaum-Ebenen von oben nach unten. Jede Ebene kann 1 bis 4 Karten tragen; darunter darf wieder 1, 2, 3 oder 4 folgen.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-card-layout-heading" data-layout-kind="${escapeHtml(kind)}">+ Trenner</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-card-layout-row" data-layout-kind="${escapeHtml(kind)}">+ Ebene</button>
        </div>
      </div>
      <div class="module-card-layout-blocks">
        ${blocks.map((block, blockIndex) => buildModuleCardLayoutBlockMarkup(block, blockIndex, normalizedCards)).join('') || '<div class="inline-placeholder-note">Noch keine Darstellung definiert.</div>'}
      </div>
    </div>`;
}

function collectModuleCardLayoutFromCard(pageCard, kind = 'profiles') {
  const cards = getModuleCardLayoutCardsFromDom(pageCard, kind);
  const validIds = new Set(cards.map(card => card.id));
  return Array.from(pageCard?.querySelectorAll(`.module-card-layout-editor[data-card-layout-kind="${kind}"] .module-card-layout-block`) || [])
    .map((block, index) => {
      const type = getTrimmedFormValue(block, '.me-card-layout-type');
      const id = getTrimmedFormValue(block, '.me-card-layout-id') || createModuleEditorCardEntityId('layout');
      if (type === 'heading') {
        const title = getTrimmedFormValue(block, '.me-card-layout-title');
        const subtitle = getTrimmedFormValue(block, '.me-card-layout-subtitle');
        return title || subtitle ? { id, type, title, subtitle } : null;
      }
      if (type === 'row') {
        const columns = Math.max(1, Math.min(4, Number(getFormValue(block, '.me-card-layout-columns')) || 1));
        const seen = new Set();
        const cardIds = Array.from(block.querySelectorAll('.me-card-layout-card-id'))
          .slice(0, columns)
          .map(select => String(select.value || '').trim())
          .filter(cardId => validIds.has(cardId) && !seen.has(cardId) && seen.add(cardId));
        return cardIds.length ? { id, type, columns: Math.min(columns, cardIds.length), cardIds } : null;
      }
      return null;
    })
    .filter(Boolean);
}

function rerenderModuleCardLayoutEditor(pageCard, kind = 'profiles') {
  const editor = pageCard?.querySelector(`.module-card-layout-editor[data-card-layout-kind="${kind}"]`);
  if (!editor) return;
  const layout = collectModuleCardLayoutFromCard(pageCard, kind);
  const cards = getModuleCardLayoutCardsFromDom(pageCard, kind);
  editor.outerHTML = buildModuleCardLayoutEditor(kind, layout, cards);
}

function addModuleCardLayoutHeading(button) {
  const pageCard = button.closest('.module-page-card');
  const kind = button.dataset.layoutKind || pageCard?.querySelector('.module-card-layout-editor')?.dataset.cardLayoutKind || 'profiles';
  const blocks = pageCard?.querySelector(`.module-card-layout-editor[data-card-layout-kind="${kind}"] .module-card-layout-blocks`);
  if (!pageCard || !blocks) return;
  blocks.querySelector('.inline-placeholder-note')?.remove();
  const cards = getModuleCardLayoutCardsFromDom(pageCard, kind);
  const block = {
    id: createModuleEditorCardEntityId('layout-heading'),
    type: 'heading',
    title: 'Neue Ebene',
    subtitle: ''
  };
  blocks.insertAdjacentHTML('beforeend', buildModuleCardLayoutBlockMarkup(block, blocks.querySelectorAll('.module-card-layout-block').length, cards));
  syncModuleJsonPreview();
}

function addModuleCardLayoutRow(button) {
  const pageCard = button.closest('.module-page-card');
  const kind = button.dataset.layoutKind || pageCard?.querySelector('.module-card-layout-editor')?.dataset.cardLayoutKind || 'profiles';
  const blocks = pageCard?.querySelector(`.module-card-layout-editor[data-card-layout-kind="${kind}"] .module-card-layout-blocks`);
  if (!pageCard || !blocks) return;
  blocks.querySelector('.inline-placeholder-note')?.remove();
  const cards = getModuleCardLayoutCardsFromDom(pageCard, kind);
  const existingIds = new Set(collectModuleCardLayoutFromCard(pageCard, kind).flatMap(block => block.cardIds || []));
  const nextCard = cards.find(card => !existingIds.has(card.id)) || cards[0];
  const block = {
    id: createModuleEditorCardEntityId('layout-row'),
    type: 'row',
    columns: 1,
    cardIds: nextCard ? [nextCard.id] : []
  };
  blocks.insertAdjacentHTML('beforeend', buildModuleCardLayoutBlockMarkup(block, blocks.querySelectorAll('.module-card-layout-block').length, cards));
  syncModuleJsonPreview();
}

function removeModuleCardLayoutBlock(button) {
  const pageCard = button.closest('.module-page-card');
  const block = button.closest('.module-card-layout-block');
  if (!pageCard || !block) return;
  const kind = block.closest('.module-card-layout-editor')?.dataset.cardLayoutKind || 'profiles';
  block.remove();
  rerenderModuleCardLayoutEditor(pageCard, kind);
  syncModuleJsonPreview();
}

function moveModuleCardLayoutBlock(button) {
  const pageCard = button.closest('.module-page-card');
  const block = button.closest('.module-card-layout-block');
  const direction = Number(button.dataset.layoutDirection) || 0;
  if (!pageCard || !block || !direction) return;
  if (direction < 0 && block.previousElementSibling) {
    block.parentElement.insertBefore(block, block.previousElementSibling);
  } else if (direction > 0 && block.nextElementSibling) {
    block.parentElement.insertBefore(block.nextElementSibling, block);
  }
  const kind = block.closest('.module-card-layout-editor')?.dataset.cardLayoutKind || 'profiles';
  rerenderModuleCardLayoutEditor(pageCard, kind);
  syncModuleJsonPreview();
}
