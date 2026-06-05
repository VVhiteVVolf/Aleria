function buildSessionModuleEditorFields(page) {
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'session' ? ' visible' : ''}" data-page-type="session">
        <div class="module-editor-grid single">
          <div class="module-editor-field">
            <label>Introtext</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-page-session-intro">${escapeHtml(page?.sessionIntro || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Hinweis im Eingabebalken</label>
            <input type="text" class="me-page-session-hint" value="${escapeHtml(page?.sessionHint || '')}">
          </div>
          <div class="module-editor-field">
            <label>Leertitel</label>
            <input type="text" class="me-page-session-empty-title" value="${escapeHtml(page?.sessionEmptyTitle || '')}">
          </div>
          <div class="module-editor-field">
            <label>Leertext</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-page-session-empty-text small">${escapeHtml(page?.sessionEmptyText || '')}</textarea>
          </div>
        </div>
      </div>`;
}

function collectSessionModuleEditorPage(card, page) {
  page.sessionPage = true;
  page.sessionIntro = getTrimmedFormValue(card, '.me-page-session-intro');
  page.sessionHint = getTrimmedFormValue(card, '.me-page-session-hint');
  page.sessionEmptyTitle = getTrimmedFormValue(card, '.me-page-session-empty-title');
  page.sessionEmptyText = getTrimmedFormValue(card, '.me-page-session-empty-text');
  return page;
}
