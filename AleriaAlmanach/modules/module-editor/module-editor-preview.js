function bindModuleEditorLiveSync() {
  const body = document.getElementById('module-editor-body');
  if (!body || body.dataset.liveBound === '1') return;
  body.dataset.liveBound = '1';

  const maybeSync = target => {
    if (!target) return;
    if (target.id === 'me-json' || target.type === 'file') return;
    if (!target.closest('.module-editor-main')) return;
    syncModuleJsonPreview();
    updateModuleEditorDirtyState();
  };

  body.addEventListener('input', event => {
    maybeSync(event.target);
  });

  body.addEventListener('change', event => {
    maybeSync(event.target);
  });

  body.addEventListener('focusin', event => {
    const card = event.target.closest('.module-page-card');
    if (!card) return;
    setModuleEditorPreviewPage(Number(card.dataset.pageIndex || 0));
  });

  body.addEventListener('click', event => {
    const card = event.target.closest('.module-page-card');
    if (!card) return;
    setModuleEditorPreviewPage(Number(card.dataset.pageIndex || 0));
  });
}

let _moduleEditorPreviewRenderToken = 0;

function getModulePageCards() {
  return Array.from(document.querySelectorAll('#me-pages .module-page-card'));
}

function clampModuleEditorPreviewIndex(total) {
  if (!Number.isFinite(total) || total <= 0) {
    _moduleEditorPreviewPageIndex = 0;
    return;
  }
  _moduleEditorPreviewPageIndex = Math.max(0, Math.min(_moduleEditorPreviewPageIndex, total - 1));
}

function updateModuleEditorPageSelection() {
  const cards = getModulePageCards();
  clampModuleEditorPreviewIndex(cards.length);
  cards.forEach((card, index) => {
    card.classList.toggle('active', index === _moduleEditorPreviewPageIndex);
  });
}

function refreshModuleEditorCardTitles() {
  renumberModulePageCards();
  getModulePageCards().forEach(card => {
    renumberModuleSceneBlocks(card);
    renumberModuleCommentBlocks(card);
  });
}

function setModuleEditorPreviewPage(index) {
  _moduleEditorPreviewPageIndex = Number.isFinite(index) ? index : 0;
  updateModuleEditorPageSelection();
  syncModuleJsonPreview();
}

function buildModuleEditorPreviewHtml(page, entry, pageIndex = 0, total = 1) {
  const previousPreviewContext = globalThis._moduleRenderPreviewContext;
  globalThis._moduleRenderPreviewContext = { entry };
  try {
    return buildPage(page, entry, pageIndex, total).replace(/\s(?:id|onclick)="[^"]*"/g, '');
  } finally {
    if (previousPreviewContext) {
      globalThis._moduleRenderPreviewContext = previousPreviewContext;
    } else {
      delete globalThis._moduleRenderPreviewContext;
    }
  }
}

function renderModuleEditorPreview(payload = null, errorMessage = '') {
  const renderToken = ++_moduleEditorPreviewRenderToken;
  const stage = document.getElementById('me-preview-stage');
  const frame = document.getElementById('me-preview-frame');
  const empty = document.getElementById('me-preview-empty');
  const meta = document.getElementById('me-preview-meta');
  if (!stage || !frame || !empty || !meta) return;

  const pages = Array.isArray(payload?.entry?.pages) ? payload.entry.pages : [];
  if (!pages.length) {
    stage.hidden = true;
    if (typeof unmountRegisteredModuleTemplatePages === 'function') unmountRegisteredModuleTemplatePages(frame);
    frame.innerHTML = '';
    empty.hidden = false;
    empty.textContent = errorMessage || 'Noch keine Seite zum Vorschauen vorhanden.';
    meta.textContent = 'Keine Seite';
    return;
  }

  clampModuleEditorPreviewIndex(pages.length);
  const page = pages[_moduleEditorPreviewPageIndex] || pages[0];
  const previewEntry = sanitizeModuleEntry({
    ...payload.entry,
    appendCommentsPage: false,
    multipage: true,
    pages
  });
  const rawLabel = getPageNavLabel(page, _moduleEditorPreviewPageIndex, pages.length);
  const previousStageTop = stage.scrollTop || 0;
  const previousStageLeft = stage.scrollLeft || 0;
  const previousRuntimeState = typeof captureInlinePreviewRuntimeState === 'function'
    ? captureInlinePreviewRuntimeState(frame)
    : null;

  stage.hidden = false;
  empty.hidden = true;
  meta.textContent = `Seite ${_moduleEditorPreviewPageIndex + 1} · ${rawLabel}`;
  const previewSize = getModuleDisplaySize(previewEntry);
  const previewWidth = Math.round(1280 * (previewSize.width / 100));
  const previewMinHeight = Math.round(960 * (previewSize.height / 100));
  // Biography/house dossiers cap the card height so their three columns scroll
  // internally (like in the modal) instead of shrinking the whole preview scale.
  const previewTemplateId = typeof getModuleTemplateForPage === 'function' ? getModuleTemplateForPage(page).id : '';
  const fixedHeightStyle = previewTemplateId === 'object-profile' || previewTemplateId === 'houses'
    ? `height:${previewMinHeight}px;`
    : '';
  if (typeof unmountRegisteredModuleTemplatePages === 'function') unmountRegisteredModuleTemplatePages(frame);
  frame.innerHTML = `<div class="module-editor-preview-card" style="width:${previewWidth}px;min-height:${previewMinHeight}px;${fixedHeightStyle}">${buildModuleEditorPreviewHtml(page, previewEntry, _moduleEditorPreviewPageIndex, pages.length)}</div>`;
  if (typeof mountRegisteredModuleTemplatePage === 'function') {
    mountRegisteredModuleTemplatePage(page, previewEntry, _moduleEditorPreviewPageIndex, frame, { preview: true });
  }
  if (typeof restoreInlinePreviewRuntimeState === 'function') {
    restoreInlinePreviewRuntimeState(previousRuntimeState, frame);
  }

  requestAnimationFrame(() => {
    if (renderToken !== _moduleEditorPreviewRenderToken) return;
    const shell = document.getElementById('me-preview-shell');
    if (!shell) return;
    const availableWidth = Math.max(220, stage.clientWidth - 32);
    const availableHeight = Math.max(220, stage.clientHeight - 32);
    const previewCard = frame.querySelector('.module-editor-preview-card');
    const rawWidth = previewCard?.offsetWidth || previewWidth || 1280;
    const rawHeight = Math.max(previewMinHeight, previewCard?.scrollHeight || frame.scrollHeight || previewMinHeight);
    const scale = Math.min(1, availableWidth / rawWidth, availableHeight / rawHeight);
    frame.style.transform = `scale(${scale})`;
    frame.style.width = `${Math.round(rawWidth * scale)}px`;
    frame.style.height = `${Math.round(rawHeight * scale)}px`;
    stage.scrollTop = previousStageTop;
    stage.scrollLeft = previousStageLeft;
  });
}

function scheduleModuleEditorPreviewRefresh() {
  if (!document.getElementById('module-editor-overlay')?.classList.contains('active')) return;
  if (!document.getElementById('module-editor-body')?.classList.contains('visible')) return;
  requestAnimationFrame(() => {
    syncModuleJsonPreview();
    requestAnimationFrame(() => syncModuleJsonPreview());
  });
}
