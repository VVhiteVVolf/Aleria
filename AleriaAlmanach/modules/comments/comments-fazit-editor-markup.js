// Pure editor markup and Fazit-specific presets. State changes stay in comments-fazit.js;
// this file owns the increasingly rich block editor UI.
const FAZIT_LINE_KIND_META = Object.freeze({
  tokens: { label: 'Symbolzeile', glyph: '✦' },
  text: { label: 'Textabsatz', glyph: '¶' },
  heading: { label: 'Überschrift', glyph: 'H' },
  list: { label: 'Liste', glyph: '☷' }
});

const FAZIT_CONNECTOR_PRESETS = Object.freeze({
  'arrow-right': { icon: '../IconOrdner/Pfeillinks.png', label: '', flip: true },
  'arrow-left': { icon: '../IconOrdner/Pfeillinks.png', label: '' },
  dash: { icon: '', label: '–' },
  plus: { icon: '../IconOrdner/Plus.png', label: '' },
  minus: { icon: '../IconOrdner/minus2.png', label: '' },
  and: { icon: '../IconOrdner/Undsymbol.png', label: '' },
  equals: { icon: '', label: '=' },
  or: { icon: '', label: 'oder' },
  consequence: { icon: '', label: 'folglich' }
});

const FAZIT_SYMBOL_PRESETS = Object.freeze([
  { key: 'decision', label: 'Entscheidung', icon: '../IconOrdner/Fazit Icons/Vereinbarung.png' },
  { key: 'agreement', label: 'Abkommen', icon: '../IconOrdner/Fazit Icons/Handschlag.png' },
  { key: 'conflict', label: 'Konflikt', icon: '../IconOrdner/Fazit Icons/Kampf.png' },
  { key: 'contract', label: 'Vertrag', icon: '../IconOrdner/Fazit Icons/Vertrag.png' },
  { key: 'clue', label: 'Schlüssel', icon: '../IconOrdner/Fazit Icons/Schlüssel.png' },
  { key: 'record', label: 'Dokument', icon: '../IconOrdner/Fazit Icons/Dokument.png' },
  { key: 'payment', label: 'Bezahlung', icon: '../IconOrdner/Fazit Icons/Geldbörse.png' },
  { key: 'judgement', label: 'Abwägung', icon: '../IconOrdner/Fazit Icons/Waage.png' }
]);

const FAZIT_BLOCK_TYPES = Object.freeze([
  { kind: 'heading', label: 'Überschrift', glyph: 'H' },
  { kind: 'list', label: 'Liste', glyph: '☷' },
  { kind: 'tokens', label: 'Symbolzeile', glyph: '✦' },
  { kind: 'text', label: 'Textabsatz', glyph: '¶' }
]);

function getFazitLineKindMeta(kind) {
  return FAZIT_LINE_KIND_META[kind] || FAZIT_LINE_KIND_META.tokens;
}

function renderFazitAddBlockButtons(afterLineId = '', disabled = false) {
  const insertionAttribute = afterLineId
    ? ` data-after-line-id="${escapeHtml(afterLineId)}"`
    : '';
  const disabledAttribute = disabled ? ' disabled aria-disabled="true"' : '';
  return FAZIT_BLOCK_TYPES.map(block => `<button class="fazit-add-block-btn" type="button" data-action="add-fazit-line" data-line-kind="${block.kind}"${insertionAttribute}${disabledAttribute}>
    <span aria-hidden="true">${block.glyph}</span>${block.label}
  </button>`).join('');
}

function renderFazitBlockToolbar({ afterLineId = '', lineCount = 0, position = 0, variant = 'primary' } = {}) {
  const inline = variant === 'inline';
  const limitReached = lineCount >= FAZIT_CONTENT_LIMITS.maxLines;
  const safePosition = Math.max(1, Number(position) || 1);
  const label = inline
    ? `Baustein nach Abschnitt ${safePosition} einfügen`
    : 'Fazit-Bausteine hinzufügen';
  const copy = inline
    ? `<span class="fazit-editor-toolbar-kicker">Direkt einfügen</span>
       <strong>Nach Abschnitt ${safePosition}</strong>
       <small>${limitReached ? `Maximal ${FAZIT_CONTENT_LIMITS.maxLines} Bausteine erreicht.` : 'Der neue Baustein erscheint genau an dieser Stelle.'}</small>`
    : `<span class="fazit-editor-toolbar-kicker">Bausteine · ${lineCount} von ${FAZIT_CONTENT_LIMITS.maxLines}</span>
       <strong>Was möchtest du festhalten?</strong>
       <small>${limitReached ? `Maximal ${FAZIT_CONTENT_LIMITS.maxLines} Bausteine erreicht.` : 'Bausteine lassen sich jederzeit verschieben, duplizieren und anders gestalten.'}</small>`;
  return `<div class="fazit-editor-toolbar${inline ? ' fazit-editor-toolbar-inline' : ''}" aria-label="${label}">
    <div class="fazit-editor-toolbar-copy">${copy}</div>
    <div class="fazit-lines-editor-head-actions">${renderFazitAddBlockButtons(afterLineId, limitReached)}</div>
  </div>`;
}

function getFazitLineSummary(line, maxLength = 72) {
  let summary = '';
  if (line.kind === 'list') {
    const firstItem = line.items?.find(item => String(item.text || '').trim());
    summary = firstItem?.text || 'Leere Liste';
    if ((line.items?.length || 0) > 1) summary += ` · ${line.items.length} Punkte`;
  } else if (line.kind === 'tokens') {
    summary = (line.tokens || []).map(token => token.label).filter(Boolean).join(' · ') || 'Leere Symbolzeile';
  } else {
    summary = String(line.text || '').trim() || `Leere ${getFazitLineKindMeta(line.kind).label}`;
  }
  return summary.length > maxLength ? `${summary.slice(0, maxLength - 1).trim()}…` : summary;
}

function renderFazitEditorCommandbar({ historyState = {}, draftStatus = 'idle', lineCount = 0, collapsedCount = 0 } = {}) {
  const draftLabels = {
    saving: 'Entwurf wird gespeichert …',
    saved: 'Entwurf gespeichert',
    restored: 'Entwurf wiederhergestellt',
    unavailable: 'Entwurf lokal nicht verfügbar',
    idle: 'Lokaler Entwurf aktiv'
  };
  const canUndo = historyState.canUndo === true;
  const canRedo = historyState.canRedo === true;
  const allCollapsed = lineCount > 0 && collapsedCount === lineCount;
  return `<div class="fazit-commandbar" aria-label="Fazit-Werkzeuge">
    <div class="fazit-commandbar-group">
      <button type="button" data-action="undo-fazit-change" title="Rückgängig (Strg+Z)"${canUndo ? '' : ' disabled'}><span aria-hidden="true">↶</span> Rückgängig</button>
      <button type="button" data-action="redo-fazit-change" title="Wiederholen (Strg+Y)"${canRedo ? '' : ' disabled'}><span aria-hidden="true">↷</span> Wiederholen</button>
    </div>
    <div class="fazit-commandbar-group fazit-commandbar-view-actions">
      <button type="button" data-action="collapse-all-fazit-lines"${allCollapsed || !lineCount ? ' disabled' : ''}>Alle einklappen</button>
      <button type="button" data-action="expand-all-fazit-lines"${!collapsedCount ? ' disabled' : ''}>Alle ausklappen</button>
    </div>
    <div class="fazit-draft-status fazit-draft-status-${escapeHtml(draftStatus)}" role="status" aria-live="polite">
      <span aria-hidden="true">${draftStatus === 'saving' ? '◌' : '●'}</span>${draftLabels[draftStatus] || draftLabels.idle}
    </div>
  </div>`;
}

function renderFazitOutline(lines, activeLineId = '') {
  if (!lines.length) return '';
  const items = lines.map((line, index) => {
    const meta = getFazitLineKindMeta(line.kind);
    const active = String(line.id) === String(activeLineId);
    return `<button type="button" class="fazit-outline-item${active ? ' is-active' : ''}" data-action="focus-fazit-line" data-line-id="${escapeHtml(line.id)}"${active ? ' aria-current="true"' : ''}>
      <span class="fazit-outline-index">${index + 1}</span>
      <span class="fazit-outline-glyph" aria-hidden="true">${meta.glyph}</span>
      <span class="fazit-outline-copy"><strong>${meta.label}</strong><small>${escapeHtml(getFazitLineSummary(line, 54))}</small></span>
      ${line.collapsed ? '<span class="fazit-outline-collapsed" title="Eingeklappt">›</span>' : ''}
    </button>`;
  }).join('');
  return `<nav class="fazit-outline" aria-label="Fazit-Gliederung">
    <div class="fazit-outline-head"><span>Gliederung</span><small>${lines.length} Bausteine</small></div>
    <div class="fazit-outline-list">${items}</div>
  </nav>`;
}

function renderFazitLineHeader(line, index, lineCount) {
  const meta = getFazitLineKindMeta(line.kind);
  const safeLineId = escapeHtml(line.id);
  const disabledUp = index <= 0 ? ' disabled' : '';
  const disabledDown = index >= lineCount - 1 ? ' disabled' : '';
  const disabledDuplicate = lineCount >= FAZIT_CONTENT_LIMITS.maxLines ? ' disabled aria-disabled="true"' : '';
  return `<div class="fazit-line-editor-head">
    <button type="button" class="fazit-line-drag-handle" draggable="true" data-role="fazit-drag-handle" data-line-id="${safeLineId}" title="Baustein ziehen" aria-label="Baustein ${index + 1} ziehen">⋮⋮</button>
    <div class="fazit-line-kind"><span aria-hidden="true">${meta.glyph}</span><strong>${meta.label}</strong><small>${index + 1}</small></div>
    <span class="fazit-line-collapsed-summary">${escapeHtml(getFazitLineSummary(line))}</span>
    <div class="fazit-line-order-actions" aria-label="Baustein bearbeiten">
      <button type="button" data-action="toggle-fazit-line-collapse" data-line-id="${safeLineId}" title="Baustein ${line.collapsed ? 'ausklappen' : 'einklappen'}" aria-label="Baustein ${line.collapsed ? 'ausklappen' : 'einklappen'}" aria-expanded="${line.collapsed ? 'false' : 'true'}">${line.collapsed ? '⌄' : '⌃'}</button>
      <button type="button" data-action="move-fazit-line" data-direction="up" data-line-id="${safeLineId}" title="Baustein nach oben verschieben" aria-label="Baustein nach oben verschieben"${disabledUp}>↑</button>
      <button type="button" data-action="move-fazit-line" data-direction="down" data-line-id="${safeLineId}" title="Baustein nach unten verschieben" aria-label="Baustein nach unten verschieben"${disabledDown}>↓</button>
      <button type="button" data-action="duplicate-fazit-line" data-line-id="${safeLineId}" title="Baustein duplizieren" aria-label="Baustein duplizieren"${disabledDuplicate}>⧉</button>
      <button type="button" class="is-danger" data-action="remove-fazit-line" data-line-id="${safeLineId}" title="Baustein entfernen" aria-label="Baustein entfernen">×</button>
    </div>
  </div>`;
}

function renderFazitLineShell(line, index, lineCount, bodyMarkup, footerMarkup = '', extraMarkup = '') {
  return `<section class="fazit-line-editor fazit-line-editor-${escapeHtml(line.kind)}${line.collapsed ? ' is-collapsed' : ''}${line.active ? ' is-active' : ''}" data-line-id="${escapeHtml(line.id)}" data-fazit-line>
    ${renderFazitLineHeader(line, index, lineCount)}
    <div class="fazit-line-editor-body">${bodyMarkup}</div>
    ${footerMarkup ? `<div class="fazit-line-actions">${footerMarkup}</div>` : ''}
    ${extraMarkup}
  </section>`;
}

function renderFazitTokenEditor(line, token) {
  const safeLineId = escapeHtml(line.id);
  const safeTokenId = escapeHtml(token.id);
  const safeIcon = escapeHtml(token.icon);
  const imageSrc = sanitizeImageSrc(token.icon || '');
  const typeLabel = token.kind === 'person' ? 'Person' : 'Symbol';
  const disabledDuplicate = line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine ? ' disabled aria-disabled="true"' : '';
  const picker = token.kind === 'person'
    ? `<button type="button" class="fazit-token-portrait-btn" data-action="pick-fazit-token-person" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" title="Figur wählen">
        ${imageSrc ? `<img src="${imageSrc}" alt="">` : '<span>?</span>'}
      </button>`
    : `<div class="fazit-token-symbol-picker">
        <button type="button" class="fazit-token-symbol-preview" data-action="pick-fazit-token-icon" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" title="Symbol im Icon-Verzeichnis wählen">
          ${imageSrc ? `<img src="${imageSrc}" alt="">` : '<span aria-hidden="true">＋</span>'}
        </button>
        <input type="text" class="fazit-token-icon-input" value="${safeIcon}" placeholder="Icon-URL oder Verzeichnis" data-action="update-fazit-token-icon" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" aria-label="Icon-Adresse">
      </div>`;
  const variantSelect = token.kind === 'person' ? '' : `<label class="fazit-token-option">Darstellung
      <select data-action="update-fazit-token-variant" data-line-id="${safeLineId}" data-token-id="${safeTokenId}">
        <option value="plain"${token.variant === 'plain' ? ' selected' : ''}>Frei</option>
        <option value="tile"${token.variant === 'tile' ? ' selected' : ''}>Kachel</option>
        <option value="seal"${token.variant === 'seal' ? ' selected' : ''}>Siegel</option>
      </select>
    </label>`;
  const mirrorButton = token.kind === 'person' ? '' : `<button type="button" class="fazit-token-option-btn${token.flip ? ' is-active' : ''}" data-action="toggle-fazit-token-flip" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" aria-pressed="${token.flip ? 'true' : 'false'}" title="Symbol horizontal spiegeln">⇋ Spiegeln</button>`;
  return `<article class="fazit-token-editor" data-token-id="${safeTokenId}" data-token-kind="${token.kind}">
    <div class="fazit-token-editor-head">
      <span>${typeLabel}</span>
      <span class="fazit-token-editor-actions">
        <button type="button" data-action="move-fazit-token" data-direction="left" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" title="Nach links verschieben" aria-label="Nach links verschieben">←</button>
        <button type="button" data-action="move-fazit-token" data-direction="right" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" title="Nach rechts verschieben" aria-label="Nach rechts verschieben">→</button>
        <button type="button" data-action="duplicate-fazit-token" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" title="Symbol duplizieren" aria-label="Symbol duplizieren"${disabledDuplicate}>⧉</button>
        <button type="button" class="is-danger" data-action="remove-fazit-token" data-line-id="${safeLineId}" data-token-id="${safeTokenId}" title="Baustein entfernen" aria-label="Baustein entfernen">×</button>
      </span>
    </div>
    <div class="fazit-token-main-fields">
      ${picker}
      <label class="fazit-token-label-field">Beschriftung
        <input type="text" class="fazit-token-label-input" value="${escapeHtml(token.label)}" maxlength="80" placeholder="${token.kind === 'person' ? 'Name' : 'Optionaler Text'}" data-action="update-fazit-token-label" data-line-id="${safeLineId}" data-token-id="${safeTokenId}">
      </label>
    </div>
    <div class="fazit-token-options">
      <label class="fazit-token-option">Größe
        <select data-action="update-fazit-token-size" data-line-id="${safeLineId}" data-token-id="${safeTokenId}">
          <option value="small"${token.size === 'small' ? ' selected' : ''}>Klein</option>
          <option value="medium"${token.size === 'medium' ? ' selected' : ''}>Mittel</option>
          <option value="large"${token.size === 'large' ? ' selected' : ''}>Groß</option>
        </select>
      </label>
      ${variantSelect}
      ${mirrorButton}
    </div>
  </article>`;
}

function renderFazitConnectorButtons(line) {
  const buttons = [
    ['arrow-right', '→', 'Pfeil nach rechts'],
    ['arrow-left', '←', 'Pfeil nach links'],
    ['dash', '–', 'Gedankenstrich'],
    ['plus', '+', 'Plus'],
    ['minus', '−', 'Minus'],
    ['and', '&', 'Und-Symbol'],
    ['equals', '=', 'Gleich'],
    ['or', 'oder', 'Oder'],
    ['consequence', '⇒', 'Folgerung']
  ];
  const disabled = line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine ? ' disabled aria-disabled="true"' : '';
  return buttons.map(([key, glyph, title]) => `<button type="button" class="fazit-connector-btn" data-action="add-fazit-connector" data-connector="${key}" data-line-id="${escapeHtml(line.id)}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}"${disabled}>${glyph}</button>`).join('');
}

function renderFazitSymbolPresetButtons(line) {
  const disabled = line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine ? ' disabled aria-disabled="true"' : '';
  return FAZIT_SYMBOL_PRESETS.map(preset => `<button type="button" class="fazit-symbol-preset" data-action="add-fazit-symbol-preset" data-preset="${preset.key}" data-line-id="${escapeHtml(line.id)}" title="${escapeHtml(preset.label)}"${disabled}>
    <img src="${escapeHtml(preset.icon)}" alt=""><span>${escapeHtml(preset.label)}</span>
  </button>`).join('');
}

function renderFazitTokenLineEditor(line, index, lineCount, personPickerMarkup) {
  const tokenMarkup = line.tokens.map(token => renderFazitTokenEditor(line, token)).join('')
    || '<span class="fazit-line-empty">Noch keine Symbole – wähle eine Person, ein eigenes Icon oder eine Vorlage.</span>';
  const tokenLimitReached = line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine;
  const disabled = tokenLimitReached ? ' disabled aria-disabled="true"' : '';
  const footer = `<div class="fazit-line-add-actions">
      <button type="button" class="module-editor-mini-btn" data-action="add-fazit-token" data-token-kind="person" data-line-id="${escapeHtml(line.id)}"${disabled}>＋ Person</button>
      <button type="button" class="module-editor-mini-btn" data-action="add-fazit-token" data-token-kind="symbol" data-line-id="${escapeHtml(line.id)}"${disabled}>＋ Eigenes Symbol</button>
    </div>
    <label class="fazit-line-alignment">Ausrichtung
      <select data-action="update-fazit-line-align" data-line-id="${escapeHtml(line.id)}">
        <option value="left"${line.align === 'left' ? ' selected' : ''}>Links</option>
        <option value="center"${line.align === 'center' ? ' selected' : ''}>Mittig</option>
        <option value="right"${line.align === 'right' ? ' selected' : ''}>Rechts</option>
      </select>
    </label>
    <details class="fazit-symbol-library">
      <summary>Symbolvorlagen</summary>
      <div class="fazit-symbol-presets">${renderFazitSymbolPresetButtons(line)}</div>
    </details>
    <div class="fazit-connector-group"><span>Verknüpfen</span><div class="fazit-connector-buttons">${renderFazitConnectorButtons(line)}</div></div>`;
  return renderFazitLineShell(line, index, lineCount, `<div class="fazit-line-tokens">${tokenMarkup}</div>`, footer, personPickerMarkup);
}

function renderFazitTextLineEditor(line, index, lineCount) {
  const body = `<div class="fazit-line-text-editor">
    <textarea rows="3" maxlength="600" placeholder="Freier Text für diesen Absatz …" data-action="update-fazit-line-text" data-line-id="${escapeHtml(line.id)}">${escapeHtml(line.text)}</textarea>
    <label>Stil
      <select data-action="update-fazit-line-tone" data-line-id="${escapeHtml(line.id)}">
        <option value="plain"${line.tone === 'plain' ? ' selected' : ''}>Fließtext</option>
        <option value="note"${line.tone === 'note' ? ' selected' : ''}>Merksatz</option>
        <option value="quote"${line.tone === 'quote' ? ' selected' : ''}>Zitat</option>
      </select>
    </label>
  </div>`;
  return renderFazitLineShell(line, index, lineCount, body);
}

function renderFazitHeadingLineEditor(line, index, lineCount) {
  const body = `<div class="fazit-heading-editor-fields">
    <label>Überschrift
      <input type="text" maxlength="160" value="${escapeHtml(line.text)}" placeholder="z. B. Beschlüsse und Folgen" data-action="update-fazit-line-text" data-line-id="${escapeHtml(line.id)}">
    </label>
    <label>Ebene
      <select data-action="update-fazit-heading-level" data-line-id="${escapeHtml(line.id)}">
        <option value="section"${line.level === 'section' ? ' selected' : ''}>Abschnitt</option>
        <option value="subsection"${line.level === 'subsection' ? ' selected' : ''}>Unterpunkt</option>
      </select>
    </label>
  </div>`;
  return renderFazitLineShell(line, index, lineCount, body);
}

function renderFazitListLineEditor(line, index, lineCount) {
  const bulletIcon = line.style === 'bullet' ? sanitizeImageSrc(line.bulletIcon || '') : '';
  const listItems = line.items.map((item, itemIndex) => {
    const safeItemId = escapeHtml(item.id);
    const marker = line.style === 'numbered'
      ? `${itemIndex + 1}.`
      : line.style === 'check'
        ? '□'
        : bulletIcon ? `<img src="${bulletIcon}" alt="">` : '•';
    return `<div class="fazit-list-item-editor" data-item-id="${safeItemId}">
      <span class="fazit-list-item-marker" aria-hidden="true">${marker}</span>
      <textarea rows="1" maxlength="300" placeholder="Listenpunkt …" data-action="update-fazit-list-item" data-line-id="${escapeHtml(line.id)}" data-item-id="${safeItemId}">${escapeHtml(item.text)}</textarea>
      <span class="fazit-list-item-actions">
        <button type="button" data-action="move-fazit-list-item" data-direction="up" data-line-id="${escapeHtml(line.id)}" data-item-id="${safeItemId}" title="Punkt nach oben" aria-label="Punkt nach oben"${itemIndex === 0 ? ' disabled' : ''}>↑</button>
        <button type="button" data-action="move-fazit-list-item" data-direction="down" data-line-id="${escapeHtml(line.id)}" data-item-id="${safeItemId}" title="Punkt nach unten" aria-label="Punkt nach unten"${itemIndex === line.items.length - 1 ? ' disabled' : ''}>↓</button>
        <button type="button" class="is-danger" data-action="remove-fazit-list-item" data-line-id="${escapeHtml(line.id)}" data-item-id="${safeItemId}" title="Punkt entfernen" aria-label="Punkt entfernen">×</button>
      </span>
    </div>`;
  }).join('') || '<span class="fazit-line-empty">Noch keine Listenpunkte.</span>';
  const iconPicker = line.style === 'bullet' ? `<div class="fazit-list-icon-control">
      <span>Aufzählungs-Icon</span>
      <button type="button" class="fazit-list-icon-picker" data-action="pick-fazit-list-bullet-icon" data-line-id="${escapeHtml(line.id)}" title="Icon aus dem Verzeichnis wählen">
        ${bulletIcon ? `<img src="${bulletIcon}" alt=""><span>Ändern</span>` : '<span class="fazit-list-icon-fallback" aria-hidden="true">•</span><span>Icon wählen</span>'}
      </button>
      <button type="button" class="fazit-list-icon-clear" data-action="clear-fazit-list-bullet-icon" data-line-id="${escapeHtml(line.id)}"${bulletIcon ? '' : ' disabled'}>Standardpunkt</button>
    </div>` : '';
  const listLimitReached = line.items.length >= FAZIT_CONTENT_LIMITS.maxListItemsPerLine;
  const disabled = listLimitReached ? ' disabled aria-disabled="true"' : '';
  const footer = `<button type="button" class="module-editor-mini-btn" data-action="add-fazit-list-item" data-line-id="${escapeHtml(line.id)}"${disabled}>＋ Listenpunkt <span class="fazit-capacity-count">${line.items.length}/${FAZIT_CONTENT_LIMITS.maxListItemsPerLine}</span></button>
    <label class="fazit-list-style">Listenstil
      <select data-action="update-fazit-list-style" data-line-id="${escapeHtml(line.id)}">
        <option value="bullet"${line.style === 'bullet' ? ' selected' : ''}>Punkte</option>
        <option value="numbered"${line.style === 'numbered' ? ' selected' : ''}>Nummern</option>
        <option value="check"${line.style === 'check' ? ' selected' : ''}>Checkliste</option>
      </select>
    </label>
    ${iconPicker}`;
  return renderFazitLineShell(line, index, lineCount, `<div class="fazit-list-editor">${listItems}</div>`, footer);
}
