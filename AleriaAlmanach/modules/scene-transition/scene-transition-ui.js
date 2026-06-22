function renderSceneTransitionFallbackGlyph() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path d="M11 51V13h24v38M19 51V21h10v30M35 32h18M46 25l7 7-7 7M8 51h32"/>
  </svg>`;
}

function renderSceneTransitionIcon(icon) {
  const src = sanitizeImageSrc(icon?.url || '');
  return src
    ? `<img src="${src}" alt="${escapeHtml(icon?.label || 'Szenenwechsel')}" loading="lazy" decoding="async">`
    : renderSceneTransitionFallbackGlyph();
}

function renderSceneTransitionArrow() {
  return `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M5 16h20M18 8l8 8-8 8"/></svg>`;
}

function renderSceneTransitionCharacters(characters) {
  if (!characters.length) return '';
  return `<div class="scene-transition-cast" aria-label="Wechselnde Figuren">
    ${characters.map(character => {
      const portrait = sanitizeImageSrc(character.portrait || '');
      const safeName = escapeHtml(character.name);
      return `<span class="scene-transition-cast-member" tabindex="0" aria-label="${safeName}">
        <span class="scene-transition-cast-name" role="tooltip" aria-hidden="true">${safeName}</span>
        ${portrait
          ? `<img src="${portrait}" alt="" loading="lazy" decoding="async">`
          : `<span class="scene-transition-cast-placeholder">${escapeHtml(getInitialChar(character.name))}</span>`}
      </span>`;
    }).join('')}
  </div>`;
}

function renderSceneTransitionBlock(input, options = {}) {
  const transition = normalizeSceneTransition(input?.sceneTransition || input || {});
  const currentThreadId = String(options.threadId || getCurrentCommentThreadId?.() || '');
  const isArrival = currentThreadId === transition.target.threadId;
  const destination = isArrival ? transition.source : transition.target;
  const directionLabel = isArrival ? 'Zurück zur Szene' : 'Szene öffnen';
  const routeLabel = isArrival ? 'Von' : 'Nach';
  const actions = options.commentId && !options.hideActions ? `
    <div class="comment-narrator-actions scene-transition-actions">
      <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${escapeHtml(options.commentId)}">Löschen</button>
    </div>` : '';

  return `<article class="scene-transition" data-transition-direction="${isArrival ? 'arrival' : 'departure'}">
    <div class="scene-transition-main">
      <div class="scene-transition-mark" title="${escapeHtml(transition.icon.label)}">${renderSceneTransitionIcon(transition.icon)}</div>
      <div class="scene-transition-copy">${parseCommentMarkup(transition.flavourText)}</div>
      <button class="scene-transition-open" type="button" data-scene-transition-action="open-target" data-transition-thread-id="${escapeHtml(destination.threadId)}" aria-label="${escapeHtml(destination.pageTitle)} öffnen">
        ${renderSceneTransitionArrow()}
        <span>${directionLabel}</span>
        <strong>${escapeHtml(destination.pageTitle)}</strong>
      </button>
      ${actions}
    </div>
    <div class="scene-transition-route">
      <div><small>Von</small><strong>${escapeHtml(transition.source.pageTitle)}</strong></div>
      <span class="scene-transition-route-arrow">${renderSceneTransitionArrow()}</span>
      <div><small>Nach</small><strong>${escapeHtml(transition.target.pageTitle)}</strong></div>
      <span class="scene-transition-current-label">${routeLabel}: ${escapeHtml(destination.pageTitle)}</span>
    </div>
    ${renderSceneTransitionCharacters(transition.characters)}
  </article>`;
}

function renderSceneTransitionComment(comment, index = 0) {
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  return `${divider}${renderSceneTransitionBlock(comment, {
    commentId: comment?.id || '',
    threadId: comment?.entryId || getCurrentCommentThreadId?.() || ''
  })}`;
}

function buildSceneTransitionTargetOptions(selectedThreadId = '') {
  const source = getCurrentSceneTransitionEndpoint();
  const targets = getSceneTransitionEndpoints().filter(endpoint => endpoint.threadId !== source?.threadId);
  if (!targets.length) return '<option value="">Keine weitere interaktive Szene verfügbar</option>';
  return `<option value="">Zielszene wählen …</option>${targets.map(endpoint => `
    <option value="${escapeHtml(endpoint.threadId)}"${endpoint.threadId === selectedThreadId ? ' selected' : ''}>${escapeHtml(endpoint.entryTitle)} — ${escapeHtml(endpoint.pageTitle)}</option>`).join('')}`;
}

function buildSceneTransitionCharacterPicker(selectedIds = []) {
  const selected = new Set(selectedIds);
  const characters = typeof getVisibleCharacterRecords === 'function' ? getVisibleCharacterRecords() : [];
  if (!characters.length) return '<div class="scene-transition-empty">Keine Figuren verfügbar.</div>';
  return characters.map(character => {
    const id = String(character.id || '').trim();
    if (!id) return '';
    const portrait = sanitizeImageSrc(getSceneTransitionCharacterPortrait(character));
    return `<button type="button" class="scene-transition-character${selected.has(id) ? ' selected' : ''}" data-scene-transition-action="toggle-character" data-character-id="${escapeHtml(id)}" data-character-search="${escapeHtml(normalizeSearchText(`${character.name || ''} ${character.title || ''}`))}" aria-pressed="${selected.has(id)}">
      ${portrait ? `<img src="${portrait}" alt="" loading="lazy" decoding="async">` : `<span>${escapeHtml(getInitialChar(character.name))}</span>`}
      <strong>${escapeHtml(character.name || 'Unbekannt')}</strong>
    </button>`;
  }).join('');
}

function buildSceneTransitionIconPicker(selectedKey = 'general') {
  return getSceneTransitionIconPresets().map(icon => `
    <button type="button" class="scene-transition-icon-option${icon.key === selectedKey ? ' selected' : ''}" data-scene-transition-action="select-icon" data-transition-icon-key="${escapeHtml(icon.key)}" aria-pressed="${icon.key === selectedKey}">
      <img src="${sanitizeImageSrc(icon.url)}" alt="" loading="lazy" decoding="async">
      <span>${escapeHtml(icon.label)}</span>
    </button>`).join('');
}

function buildSceneTransitionFormatToolbar() {
  return `<div class="scene-transition-format-toolbar" aria-label="Text formatieren">
    <button type="button" data-action="format-comment-markup-wrap" data-target-id="scene-transition-text" data-wrap-before="**" data-wrap-after="**" title="Fett"><strong>F</strong></button>
    <button type="button" data-action="format-comment-markup-wrap" data-target-id="scene-transition-text" data-wrap-before="*" data-wrap-after="*" title="Kursiv"><em>K</em></button>
    <button type="button" data-action="format-comment-markup-wrap" data-target-id="scene-transition-text" data-wrap-before="__" data-wrap-after="__" title="Unterstrichen"><u>U</u></button>
    <button type="button" data-action="format-comment-markup-wrap" data-target-id="scene-transition-text" data-wrap-before="***" data-wrap-after="***" title="Fett und kursiv"><strong><em>FK</em></strong></button>
    <button type="button" data-action="format-comment-markup-list" data-target-id="scene-transition-text" title="Liste">Liste</button>
  </div>`;
}

function ensureSceneTransitionDialog() {
  let overlay = document.getElementById('scene-transition-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'scene-transition-overlay';
  overlay.className = 'scene-transition-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<div class="scene-transition-dialog">
    <header>
      <div><small>Szenenereignis</small><h2>Szenenwechsel anlegen</h2></div>
      <button type="button" data-scene-transition-action="close-dialog" aria-label="Schließen">×</button>
    </header>
    <div class="scene-transition-dialog-body">
      <section>
        <label for="scene-transition-target">Zielszene</label>
        <select id="scene-transition-target" data-scene-transition-action="update-preview"></select>
      </section>
      <section>
        <label>Symbol des Szenenwechsels</label>
        <div class="scene-transition-icon-list" data-scene-transition-icons>
          ${buildSceneTransitionIconPicker()}
        </div>
      </section>
      <section>
        <label for="scene-transition-text">Flavourtext</label>
        ${buildSceneTransitionFormatToolbar()}
        <textarea id="scene-transition-text" rows="5" data-scene-transition-action="update-preview" placeholder="Gwendolyn Draig und Ser Alaric verlassen den Thronsaal …"></textarea>
        <p>Die vorhandene Kommentarformatierung kann verwendet werden.</p>
      </section>
      <section>
        <label>Betroffene Figuren</label>
        <input class="scene-transition-character-search" type="search" placeholder="Figur suchen …" data-scene-transition-action="filter-characters">
        <div class="scene-transition-character-list" data-scene-transition-characters></div>
      </section>
      <section>
        <label>Vorschau</label>
        <div class="scene-transition-preview" data-scene-transition-preview></div>
      </section>
    </div>
    <footer>
      <div class="scene-transition-status" data-scene-transition-status role="status"></div>
      <div><button type="button" data-scene-transition-action="close-dialog">Abbrechen</button><button class="primary" type="button" data-scene-transition-action="submit">Szenenwechsel eintragen</button></div>
    </footer>
  </div>`;
  document.body.appendChild(overlay);
  return overlay;
}
