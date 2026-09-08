// Shared reader/editor navigation. Additional actions stay in a native disclosure.
function buildModalFocusToggleButton() {
  const enabled = typeof isSessionFocusModeEnabled === 'function' && isSessionFocusModeEnabled();
  const label = enabled ? 'Lesemodus verlassen' : 'Lesebereich maximieren';
  return `<button class="modal-page-tool modal-focus-toggle" type="button" data-modal-action="toggle-focus-mode" aria-pressed="${enabled ? 'true' : 'false'}" title="${label}" aria-label="${label}"><span data-focus-icon aria-hidden="true">${enabled ? '↙' : '⛶'}</span><span data-focus-label>${label}</span></button>`;
}

function getPageNavLabel(page, pageIndex, total) {
  if (!page) return `Seite ${pageIndex + 1}`;
  if (page._commentsPage) return 'Kommentare';
  return page.pageTitle || `Seite ${pageIndex + 1} von ${total}`;
}

function getPageTabLabel(page, pageIndex, total) {
  if (!page) return `${pageIndex + 1}`;
  if (page._commentsPage) return 'Kommentare';
  const title = String(page.pageTitle || '').trim();
  if (!title) return `${pageIndex + 1}`;
  const match = title.match(/^([IVXLCDM]+)\.\s*[—-]?\s*(.*)$/i);
  if (!match) return title;
  const numeral = match[1].toUpperCase() + '.';
  return match[2].trim() ? `${numeral} ${match[2].trim()}` : numeral;
}

function buildModalChapterList(pages, pageIndex) {
  if (pages.length < 2) return '';
  return `<nav class="modal-page-tabs" aria-label="Seiten dieses Moduls">
      ${pages.map((page, index) => `<button class="modal-page-tab${index === pageIndex ? ' active' : ''}" type="button" data-modal-action="jump-page" data-page-index="${index}"${index === pageIndex ? ' aria-current="page"' : ''} title="${escapeHtml(getPageNavLabel(page, index, pages.length))}">${escapeHtml(getPageTabLabel(page, index, pages.length))}</button>`).join('')}
  </nav>`;
}

function buildModalEditingActions(entry, pageIndex, total) {
  return `<section class="modal-menu-section">
    <h3 class="modal-menu-heading">Bearbeitung</h3>
    <div class="modal-menu-actions">
      <button class="modal-page-tool modal-menu-primary" type="button" data-modal-action="save-inline-edit">Änderungen speichern</button>
      <button class="modal-page-tool" type="button" data-modal-action="cancel-inline-edit">Bearbeitung abbrechen</button>
    </div>
  </section>
  <section class="modal-menu-section">
    <h3 class="modal-menu-heading">Seiten und Vorlage</h3>
    <label class="modal-menu-field">Seite hinzufügen
      <select class="modal-page-tool" data-modal-action="add-inline-page"><option value="">Vorlage wählen …</option>${buildModulePageTypeOptions('')}</select>
    </label>
    <label class="modal-menu-field">Modulvorlage
      <select class="modal-page-tool" data-modal-action="apply-inline-template">${buildModuleTemplateOptions(inferModuleTemplateType(entry))}</select>
    </label>
    <div class="modal-menu-actions">
      <button class="modal-page-tool" type="button" data-modal-action="move-inline-page" data-direction="-1" ${pageIndex === 0 ? 'disabled' : ''}>Seite nach vorn</button>
      <button class="modal-page-tool" type="button" data-modal-action="move-inline-page" data-direction="1" ${pageIndex === total - 1 ? 'disabled' : ''}>Seite nach hinten</button>
      ${total > 1 ? '<button class="modal-page-tool modal-menu-danger" type="button" data-modal-action="remove-inline-page">Seite löschen</button>' : ''}
    </div>
  </section>`;
}

function buildModalReadingActions(thread) {
  const disabled = thread?.threadId ? '' : 'disabled';
  return `<section class="modal-menu-section">
    <h3 class="modal-menu-heading">Modul</h3>
    <div class="modal-menu-actions">
      <button class="modal-page-tool modal-menu-primary" type="button" data-modal-action="open-module-editor-current">Bearbeiten</button>
      <button class="modal-page-tool" type="button" data-modal-action="export-current-module">Modul exportieren</button>
    </div>
  </section>
  <section class="modal-menu-section">
    <h3 class="modal-menu-heading">Kommentare</h3>
    <div class="modal-menu-actions">
      <button class="modal-page-tool" type="button" data-modal-action="export-current-comment-thread" ${disabled}>Kommentare exportieren</button>
      <button class="modal-page-tool" type="button" data-modal-action="import-current-comment-thread" ${disabled}>Kommentare importieren</button>
      <button class="modal-page-tool" type="button" data-modal-action="rescue-current-comment-thread" ${disabled}>Kommentare retten</button>
    </div>
  </section>`;
}

function buildNav(page, pageIndex, total) {
  const previewContext = globalThis._moduleRenderPreviewContext;
  if (previewContext?.entry) return '';
  const entry = currentEntry ? getRenderableEntry(currentEntry) : null;
  const pages = entry ? getPages(entry) : [];
  const editing = isInlineEditingEntry(currentEntry);
  const thread = !editing && entry
    ? (getCommentThreadForPage(page, entry, pageIndex) || getInlineCommentThreadForPage(page, entry, pageIndex))
    : null;
  return `<div class="modal-page-header modal-navigation">
    <div class="modal-page-summary">
      <span class="modal-page-eyebrow">${editing ? 'Modul bearbeiten' : 'Almanach'}</span>
      <span class="modal-page-title" title="${escapeHtml(getPageNavLabel(page, pageIndex, total))}">${escapeHtml(getPageNavLabel(page, pageIndex, total))}</span>
    </div>
    <div class="modal-page-nav" aria-label="Seitennavigation">
      <button class="modal-page-btn" type="button" data-modal-action="flip-page" data-direction="-1" ${pageIndex === 0 ? 'disabled' : ''}>‹ Zurück</button>
      <span class="modal-page-indicator">${pageIndex + 1} <span class="modal-page-count-divider">/</span> ${total}</span>
      <button class="modal-page-btn" type="button" data-modal-action="flip-page" data-direction="1" ${pageIndex === total - 1 ? 'disabled' : ''}>Weiter ›</button>
    </div>
    <div class="modal-page-actions">
      ${buildModalFocusToggleButton()}
      <details class="modal-tools-menu" data-modal-menu>
        <summary class="modal-page-tool modal-menu-toggle" aria-label="Weitere Modulaktionen" title="Weitere Modulaktionen">…</summary>
        <div class="modal-menu-panel">
          ${editing ? buildModalEditingActions(entry, pageIndex, total) : buildModalReadingActions(thread)}
        </div>
      </details>
    </div>
    ${buildModalChapterList(pages, pageIndex)}
  </div>`;
}

function initModalNavigation(scope) {
  const tabs = scope?.querySelector('.modal-page-tabs');
  const active = tabs?.querySelector('[aria-current="page"]');
  if (!active) return;
  // openModal renders before revealing the dialog; measure once it is visible.
  requestAnimationFrame(() => {
    if (!tabs.isConnected) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    if (right > tabs.scrollLeft + tabs.clientWidth) tabs.scrollLeft = right - tabs.clientWidth;
    else if (left < tabs.scrollLeft) tabs.scrollLeft = left;
  });
}

function closeModalNavigationMenu({ restoreFocus = false } = {}) {
  const menu = document.querySelector('#modal-overlay [data-modal-menu][open]');
  if (!menu) return false;
  menu.open = false;
  if (restoreFocus) menu.querySelector('summary')?.focus();
  return true;
}
