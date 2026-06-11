// Comment page and embedded comment shell builders.
function buildCommentActionBar(hintText) {
  return `
    <div class="comments-form-bar">
      <button class="comments-add-btn" type="button" data-action="open-comment-form" title="Kommentar hinterlassen" aria-label="Kommentar hinterlassen">+</button>
      <button class="comments-add-btn comments-showcase-add-btn" type="button" data-action="open-showcase-form" title="Objekt vorstellen" aria-label="Objekt vorstellen">◇</button>
      <button class="comments-add-btn comments-attachment-add-btn" type="button" data-action="open-attachment-form" title="Anhang präsentieren" aria-label="Anhang präsentieren">▤</button>
      <span class="comments-form-hint">${escapeHtml(hintText || '')}</span>
      ${buildCommentQuickToolsToggle()}
      ${buildCommentToolsToggle()}
    </div>`;
}

function buildCommentsPage(entry, pageIndex, total) {
  const nav = buildNav({ pageTitle: '\u2726 \u2014 Stimmen der Leser' }, pageIndex, total);
  return `
    ${nav}
    <div class="comments-page" style="flex-direction:row;">
      <div style="
        width:220px; min-width:180px; flex-shrink:0;
        background: linear-gradient(to bottom, rgba(120,80,20,0.25), rgba(120,80,20,0.1));
        border-right: 1px solid rgba(212,180,100,0.2);
        overflow: hidden; position: relative;
      ">
        <img src="https://i.imgur.com/1ytTJap.jpeg" alt="" loading="lazy" decoding="async" style="
          width:100%; height:100%; object-fit:cover; object-position:center top;
          opacity:0.75; display:block;
        ">
        <div style="
          position:absolute; bottom:0; left:0; right:0;
          background: linear-gradient(to top, rgba(100,65,15,0.5) 0%, transparent 100%);
          height: 80px;
        "></div>
      </div>
      <div style="flex:1; display:flex; flex-direction:column; min-height:0; overflow:hidden;">
        <div class="comments-scroll" id="comments-scroll">
          <div class="comment-empty" id="comments-loading">Lade Kommentare\u2026</div>
        </div>
        ${buildCommentQuickTools()}
        ${buildCommentTurnBar(entry.id)}
        ${buildCommentActionBar('Hinterlasse eine Stimme aus Charakterperspektive')}
      </div>
    </div>`;
}

function buildSessionPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const focusMode = isSessionFocusModeEnabled();
  const intro = page.sessionIntro
    ? `<div class="session-stage-copy">${sanitizeContentHtml(page.sessionIntro)}</div>`
    : '';
  const imgW = page.imageWidth != null && page.imageWidth !== ''
    ? `${Math.max(20, Math.min(70, Number(page.imageWidth) || 38))}%`
    : 'clamp(380px, 36vw, 560px)';
  return `
    ${nav}
    <div class="session-page${focusMode ? ' session-focus-mode' : ''}">
      <div class="session-art-col" id="modal-img-col-el" style="width:${imgW};">
        <img src="${sanitizeImageSrc(page.image || 'https://i.imgur.com/pEuJo6v.png')}" alt="${escapeHtml(entry.title)}" loading="eager" decoding="async" fetchpriority="high">
        <div class="session-art-overlay"></div>
        <div class="session-art-stamp">${escapeHtml(entry.stamp)}</div>
      </div>
      <div class="modal-resizer" id="modal-resizer"></div>
      <div class="session-content">
        <div class="session-stage-bar">
          <div class="session-stage-head">
            <div class="session-stage-heading">
              <div class="session-stage-kicker">Interaktive Szene</div>
              <div class="session-stage-title">${escapeHtml(page.pageTitle || 'Anhörung')}</div>
            </div>
            <button
              class="session-focus-toggle"
              type="button"
              data-action="toggle-session-focus-mode"
              title="${focusMode ? 'Lesemodus verlassen' : 'Lesebereich maximieren'}"
              aria-label="${focusMode ? 'Lesemodus verlassen' : 'Lesebereich maximieren'}"
              aria-pressed="${focusMode ? 'true' : 'false'}">${focusMode ? '↙' : '⛶'}</button>
          </div>
          ${intro}
        </div>
        <div
          class="comments-scroll"
          id="comments-scroll"
          data-empty-title="${escapeHtml(page.sessionEmptyTitle || 'Die Sitzung wartet')}"
          data-empty-text="${escapeHtml(page.sessionEmptyText || 'Noch ist kein Beitrag eingetragen.')}">
          <div class="comment-empty" id="comments-loading">Lade Sitzung…</div>
        </div>
        ${buildCommentQuickTools()}
        ${buildCommentTurnBar(getSessionThreadId(entry.id, getPageCommentThreadKey(page, pageIndex)))}
        ${buildCommentActionBar(page.sessionHint || 'Lass die Anhörung als Szene weiterlaufen.')}
      </div>
    </div>`;
}

function buildEmbeddedCommentsSection(thread, hintText = '') {
  if (!thread) return '';
  const safeTitle = escapeHtml(thread.emptyTitle || 'Noch keine Stimmen');
  const safeText = escapeHtml(thread.emptyText || 'Sei der Erste.');
  const safeHint = escapeHtml(hintText || thread.inlineHint || 'Beiträge hier beziehen sich auf diese Seite.');
  const kicker = thread.kind === 'entry-comments' ? 'Kommentare' : 'Seitenkommentare';
  const formHint = thread.kind === 'entry-comments'
    ? 'Mit dem vorhandenen Kommentiermodus direkt unter diesem Modul kommentieren'
    : 'Mit ausgewählten Figuren direkt zu dieser Seite kommentieren';
  return `
    <div class="module-embedded-comments">
      <div class="module-embedded-comments-head">
        <div class="module-embedded-comments-kicker">${kicker}</div>
        <div class="module-embedded-comments-hint">${safeHint}</div>
      </div>
      <div
        class="comments-scroll"
        id="comments-scroll"
        data-empty-title="${safeTitle}"
        data-empty-text="${safeText}">
        <div class="comment-empty" id="comments-loading">Lade Kommentare…</div>
      </div>
      ${buildCommentQuickTools()}
      ${buildCommentTurnBar(thread.threadId)}
      ${buildCommentActionBar(formHint)}
    </div>`;
}

function buildOrganicCommentsContinuation(thread, hintText = '') {
  if (!thread) return '';
  const safeTitle = escapeHtml(thread.emptyTitle || 'Noch keine Stimmen');
  const safeText = escapeHtml(thread.emptyText || 'Sei der Erste.');
  const formHint = hintText || 'Direkt an den bestehenden Kommentar anknüpfen';
  return `
    <div class="module-organic-comments">
      <div
        class="comments-scroll"
        id="comments-scroll"
        data-empty-title="${safeTitle}"
        data-empty-text="${safeText}">
        <div class="comment-empty" id="comments-loading">Lade Kommentare…</div>
      </div>
      ${buildCommentQuickTools()}
      ${buildCommentTurnBar(thread.threadId)}
      ${buildCommentActionBar(formHint)}
    </div>`;
}
