// Inline editor hierarchy layout for card-based module pages.

const INLINE_CARD_LAYOUT_CONFIG = {
  profiles: {
    cardsKey: 'profiles',
    layoutKey: 'profileLayout',
    cardPrefix: 'profile',
    fallbackLabel: 'Charakter'
  },
  wanted: {
    cardsKey: 'wanted',
    layoutKey: 'wantedLayout',
    cardPrefix: 'wanted',
    fallbackLabel: 'Kopfgeld'
  }
};

function getInlineCardLayoutConfig(kind = 'profiles') {
  return INLINE_CARD_LAYOUT_CONFIG[kind] || INLINE_CARD_LAYOUT_CONFIG.profiles;
}

function ensureInlineCardIds(page, kind = 'profiles') {
  const config = getInlineCardLayoutConfig(kind);
  page[config.cardsKey] = normalizeModuleEditorCards(Array.isArray(page?.[config.cardsKey]) ? page[config.cardsKey] : [], kind);
  return page[config.cardsKey];
}

function getInlineCardLayoutCards(page, kind = 'profiles') {
  const config = getInlineCardLayoutConfig(kind);
  const cards = ensureInlineCardIds(page, kind);
  return cards.map((card, index) => ({
    id: card.id,
    name: String(card.name || `${config.fallbackLabel} ${index + 1}`).trim()
  }));
}

function normalizeInlineCardLayout(page, kind = 'profiles') {
  const config = getInlineCardLayoutConfig(kind);
  const cards = ensureInlineCardIds(page, kind);
  const layout = normalizeModuleCardLayoutForEditor(page[config.layoutKey], cards, kind);
  page[config.layoutKey] = layout;
  return layout;
}

function buildInlineCardLayoutCardOptions(cards = [], selected = '') {
  return `
    <option value="">- frei -</option>
    ${cards.map((card, index) => `
      <option value="${escapeHtml(card.id)}"${card.id === selected ? ' selected' : ''}>${escapeHtml(card.name || `Karte ${index + 1}`)}</option>
    `).join('')}`;
}

function buildInlineCardLayoutBlockMarkup(kind, block, index, cards = []) {
  if (block.type === 'heading') {
    return `
      <div class="module-card-layout-block" data-inline-layout-block>
        <div class="module-card-layout-block-head">
          <div class="inline-edit-kicker">Trenner ${index + 1}</div>
          <div class="module-editor-inline">
            <button class="module-editor-mini-btn" type="button" data-inline-action="move-card-layout-block" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-direction="-1">Hoch</button>
            <button class="module-editor-mini-btn" type="button" data-inline-action="move-card-layout-block" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-direction="1">Runter</button>
            <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-card-layout-block" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}">Loeschen</button>
          </div>
        </div>
        <div class="inline-edit-grid">
          <div class="inline-edit-field">
            <span class="inline-edit-label">Ueberschrift</span>
            <input class="inline-edit-input" type="text" data-inline-action="update-card-layout-heading" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-field="title" value="${escapeHtml(block.title || '')}" placeholder="z.B. Angestellte">
          </div>
          <div class="inline-edit-field">
            <span class="inline-edit-label">Unterzeile</span>
            <input class="inline-edit-input" type="text" data-inline-action="update-card-layout-heading" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-field="subtitle" value="${escapeHtml(block.subtitle || '')}" placeholder="optional">
          </div>
        </div>
      </div>`;
  }

  const columns = Math.max(1, Math.min(3, Number(block.columns) || 1));
  return `
    <div class="module-card-layout-block" data-inline-layout-block>
      <div class="module-card-layout-block-head">
        <div class="inline-edit-kicker">Kartenreihe ${index + 1}</div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-card-layout-block" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="move-card-layout-block" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-card-layout-block" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}">Loeschen</button>
        </div>
      </div>
      <div class="module-card-layout-row-editor">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Karten in Reihe</span>
          <select class="inline-edit-select" data-inline-action="update-card-layout-row" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-field="columns">
            <option value="1"${columns === 1 ? ' selected' : ''}>1 Karte</option>
            <option value="2"${columns === 2 ? ' selected' : ''}>2 Karten</option>
            <option value="3"${columns === 3 ? ' selected' : ''}>3 Karten</option>
          </select>
        </div>
        ${[0, 1, 2].map(slot => `
          <div class="inline-edit-field">
            <span class="inline-edit-label">Position ${slot + 1}</span>
            <select class="inline-edit-select" data-inline-action="update-card-layout-row" data-layout-kind="${escapeHtml(kind)}" data-layout-index="${index}" data-layout-field="card" data-layout-slot="${slot}">
              ${buildInlineCardLayoutCardOptions(cards, block.cardIds?.[slot] || '')}
            </select>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function buildInlineCardLayoutEditor(kind, page) {
  const cards = getInlineCardLayoutCards(page, kind);
  const layout = normalizeInlineCardLayout(page, kind);
  return `
    <div class="module-card-layout-editor inline-card-layout-editor" data-inline-layout-kind="${escapeHtml(kind)}">
      <div class="module-card-layout-toolbar">
        <div>
          <div class="inline-edit-kicker">Hierarchie / Darstellung</div>
          <div class="module-editor-help">Setze Trenner und bestimme pro Reihe, ob eine, zwei oder drei Karten nebeneinander stehen.</div>
        </div>
        <div class="module-editor-inline">
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-card-layout-heading" data-layout-kind="${escapeHtml(kind)}">+ Trenner</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-card-layout-row" data-layout-kind="${escapeHtml(kind)}">+ Reihe</button>
        </div>
      </div>
      <div class="module-card-layout-blocks">
        ${layout.map((block, index) => buildInlineCardLayoutBlockMarkup(kind, block, index, cards)).join('') || '<div class="inline-placeholder-note">Noch keine Darstellung definiert.</div>'}
      </div>
    </div>`;
}

function addInlineCardLayoutHeading(kind = 'profiles') {
  const page = getInlineDraftPage();
  if (!page) return;
  const config = getInlineCardLayoutConfig(kind);
  const layout = normalizeInlineCardLayout(page, kind);
  layout.push({
    id: createModuleEditorCardEntityId('layout-heading'),
    type: 'heading',
    title: 'Neue Ebene',
    subtitle: ''
  });
  page[config.layoutKey] = layout;
  renderPage(currentPage, 0);
}

function addInlineCardLayoutRow(kind = 'profiles') {
  const page = getInlineDraftPage();
  if (!page) return;
  const config = getInlineCardLayoutConfig(kind);
  const cards = getInlineCardLayoutCards(page, kind);
  if (!cards.length) return;
  const layout = normalizeInlineCardLayout(page, kind);
  const usedIds = new Set(layout.flatMap(block => Array.isArray(block.cardIds) ? block.cardIds : []));
  const nextCard = cards.find(card => !usedIds.has(card.id)) || cards[0];
  layout.push({
    id: createModuleEditorCardEntityId('layout-row'),
    type: 'row',
    columns: 1,
    cardIds: [nextCard.id]
  });
  page[config.layoutKey] = layout;
  renderPage(currentPage, 0);
}

function removeInlineCardLayoutBlock(kind = 'profiles', index = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const config = getInlineCardLayoutConfig(kind);
  const layout = normalizeInlineCardLayout(page, kind);
  layout.splice(index, 1);
  page[config.layoutKey] = layout;
  renderPage(currentPage, 0);
}

function moveInlineCardLayoutBlock(kind = 'profiles', index = 0, direction = 0) {
  const page = getInlineDraftPage();
  if (!page || !direction) return;
  const config = getInlineCardLayoutConfig(kind);
  const layout = normalizeInlineCardLayout(page, kind);
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= layout.length) return;
  const [block] = layout.splice(index, 1);
  layout.splice(nextIndex, 0, block);
  page[config.layoutKey] = layout;
  renderPage(currentPage, 0);
}

function updateInlineCardLayoutHeading(input, options = {}) {
  const page = getInlineDraftPage();
  if (!page) return;
  const kind = input.dataset.layoutKind || 'profiles';
  const config = getInlineCardLayoutConfig(kind);
  const layout = normalizeInlineCardLayout(page, kind);
  const block = layout[Number(input.dataset.layoutIndex || -1)];
  if (!block || block.type !== 'heading') return;
  const field = input.dataset.layoutField === 'subtitle' ? 'subtitle' : 'title';
  block[field] = String(input.value || '').trim();
  page[config.layoutKey] = layout;
  if (options.render !== false) renderPage(currentPage, 0);
}

function updateInlineCardLayoutRow(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const kind = input.dataset.layoutKind || 'profiles';
  const config = getInlineCardLayoutConfig(kind);
  const layout = normalizeInlineCardLayout(page, kind);
  const block = layout[Number(input.dataset.layoutIndex || -1)];
  if (!block || block.type !== 'row') return;

  if (input.dataset.layoutField === 'columns') {
    block.columns = Math.max(1, Math.min(3, Number(input.value) || 1));
  } else {
    const slot = Math.max(0, Math.min(2, Number(input.dataset.layoutSlot) || 0));
    block.cardIds = Array.isArray(block.cardIds) ? block.cardIds.slice(0, 3) : [];
    block.cardIds[slot] = String(input.value || '').trim();
    block.cardIds = block.cardIds.filter(Boolean);
    block.columns = Math.max(1, Math.min(3, Number(block.columns) || block.cardIds.length || 1));
  }

  page[config.layoutKey] = layout;
  renderPage(currentPage, 0);
}
