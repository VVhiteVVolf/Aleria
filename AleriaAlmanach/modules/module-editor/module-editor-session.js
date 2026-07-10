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
            <label>Ort</label>
            <input type="text" class="me-page-session-location" value="${escapeHtml(page?.sessionLocation || '')}" placeholder="Llysfaen · Ratssaal">
          </div>
          <div class="module-editor-field">
            <label>Aktuelle Phase</label>
            <input type="text" class="me-page-session-phase" value="${escapeHtml(page?.sessionPhase || '')}" placeholder="Anhörung des ersten Bittstellers">
          </div>
          <div class="module-editor-field">
            <label>Anwesende Figuren</label>
            <input type="text" class="me-page-session-participants" value="${escapeHtml(normalizeSessionStatusParticipants(page?.sessionParticipants).join(', '))}" placeholder="Guinevere, Gawain, Fenrir">
          </div>
          <div class="module-editor-field">
            <label>Szenenstatus</label>
            <select class="me-page-session-status">
              <option value="active"${page?.sessionStatus !== 'paused' && page?.sessionStatus !== 'ended' ? ' selected' : ''}>Aktiv</option>
              <option value="paused"${page?.sessionStatus === 'paused' ? ' selected' : ''}>Pausiert</option>
              <option value="ended"${page?.sessionStatus === 'ended' ? ' selected' : ''}>Beendet</option>
            </select>
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
  page.sessionLocation = getTrimmedFormValue(card, '.me-page-session-location');
  page.sessionPhase = getTrimmedFormValue(card, '.me-page-session-phase');
  page.sessionParticipants = normalizeSessionStatusParticipants(getTrimmedFormValue(card, '.me-page-session-participants'));
  page.sessionStatus = getTrimmedFormValue(card, '.me-page-session-status') || 'active';
  page.sessionEmptyTitle = getTrimmedFormValue(card, '.me-page-session-empty-title');
  page.sessionEmptyText = getTrimmedFormValue(card, '.me-page-session-empty-text');
  return page;
}
