// Compact status panel for interactive scene pages.
// Static metadata belongs to the page; live values come from existing comment systems.

function normalizeSessionStatusParticipants(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/[,;\n]/);
  return [...new Set(source.map(item => String(item || '').trim()).filter(Boolean))];
}

function buildSessionStatusControl(page = {}, entry = {}, threadId = '') {
  const location = String(page.sessionLocation || '').trim() || String(entry.title || 'Ort nicht festgelegt').trim();
  const phase = String(page.sessionPhase || '').trim() || 'Laufende Szene';
  const status = ['active', 'paused', 'ended'].includes(String(page.sessionStatus || '')) ? String(page.sessionStatus) : 'active';
  const participants = normalizeSessionStatusParticipants(page.sessionParticipants);
  return `
    <div class="session-status" data-session-status data-session-state="${escapeHtml(status)}" data-comment-thread-id="${escapeHtml(threadId)}" data-session-base-status="${escapeHtml(status)}" data-session-participants="${escapeHtml(participants.join('|'))}">
      <button class="session-status-toggle" type="button" data-session-status-action="toggle" aria-expanded="false" aria-label="Szenenzustand anzeigen" title="Szenenzustand">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4.5h14v15H5zM8 8h8M8 12h8M8 16h5" /></svg>
        <span class="session-status-dot" aria-hidden="true"></span>
      </button>
      <section class="session-status-panel" hidden aria-label="Aktueller Szenenzustand">
        <div class="session-status-panel-head">
          <div><span>Szenenzustand</span><strong>${escapeHtml(location)}</strong></div>
          <span class="session-status-badge" data-session-status-badge>${status === 'paused' ? 'Pausiert' : status === 'ended' ? 'Beendet' : 'Aktiv'}</span>
        </div>
        <dl class="session-status-grid">
          <div><dt>Zeit</dt><dd data-session-status-time>Noch keine Szenenzeit</dd></div>
          <div><dt>Phase</dt><dd>${escapeHtml(phase)}</dd></div>
          <div class="wide"><dt>Anwesend</dt><dd data-session-status-participants>${escapeHtml(participants.join(', ') || 'Noch nicht festgelegt')}</dd></div>
          <div><dt>Am Zug</dt><dd data-session-status-turn>Wird geladen …</dd></div>
          <div><dt>Letzter Beitrag</dt><dd data-session-status-latest>Noch kein Beitrag</dd></div>
        </dl>
      </section>
    </div>`;
}

function getSessionStatusPanel(threadId = '') {
  return Array.from(document.querySelectorAll('[data-session-status]')).find(panel => panel.dataset.commentThreadId === String(threadId || '')) || null;
}

function setSessionStatusText(panel, selector, value) {
  const target = panel?.querySelector(selector);
  if (target) target.textContent = String(value || '');
}

function isSessionStatusSystemComment(comment = {}) {
  return !!(comment.sceneTimeEvent || comment.sceneTransition || comment.scenePoll || comment.sceneDiceRoll || comment.commentMode === 'scene-time' || comment.commentMode === 'scene-dice');
}

function refreshSessionStatusFromComments(threadId, comments = []) {
  const panel = getSessionStatusPanel(threadId);
  if (!panel) return;
  const sorted = sortCommentsByTimeline(comments);
  const eventComment = sorted.slice().reverse().find(comment => typeof isSceneTimeEventComment === 'function' && isSceneTimeEventComment(comment));
  if (eventComment && typeof getSceneTimeSafeEvent === 'function') {
    const event = getSceneTimeSafeEvent(eventComment);
    setSessionStatusText(panel, '[data-session-status-time]', [event.dayLabel || event.segmentLabel, event.timeLabel].filter(Boolean).join(' · ') || event.title);
  }
  const configured = String(panel.dataset.sessionParticipants || '').split('|').filter(Boolean);
  if (!configured.length) {
    const participants = [...new Set(sorted.filter(comment => !isSessionStatusSystemComment(comment) && !comment.narrator).map(comment => String(comment.charName || comment.name || '').trim()).filter(Boolean))];
    setSessionStatusText(panel, '[data-session-status-participants]', participants.join(', ') || 'Noch nicht festgelegt');
  }
  const latest = sorted.slice().reverse().find(comment => !isSessionStatusSystemComment(comment));
  if (latest) {
    const name = latest.narrator ? 'Erzähler' : (latest.charName || latest.name || 'Unbekannt');
    const age = typeof formatTimeAgo === 'function' ? formatTimeAgo(latest) : '';
    setSessionStatusText(panel, '[data-session-status-latest]', [name, age].filter(Boolean).join(' · '));
  }
}

function refreshSessionStatusTurn(threadId, state = {}) {
  const panel = getSessionStatusPanel(threadId);
  if (!panel) return;
  const current = String(state.current || '');
  const labels = typeof COMMENT_TURN_LABELS === 'object' ? COMMENT_TURN_LABELS : {};
  setSessionStatusText(panel, '[data-session-status-turn]', current === 'ended' ? 'Sitzung beendet' : (labels[current] || 'Noch nicht festgelegt'));
  const status = current === 'ended' ? 'ended' : (panel.dataset.sessionBaseStatus || 'active');
  panel.dataset.sessionState = status;
  setSessionStatusText(panel, '[data-session-status-badge]', status === 'paused' ? 'Pausiert' : status === 'ended' ? 'Beendet' : 'Aktiv');
}

function closeSessionStatusPanels() {
  document.querySelectorAll('.session-status-panel:not([hidden])').forEach(item => { item.hidden = true; });
  document.querySelectorAll('.session-status-toggle[aria-expanded="true"]').forEach(item => item.setAttribute('aria-expanded', 'false'));
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-session-status-action="toggle"]');
  if (trigger) {
    event.preventDefault();
    const control = trigger.closest('[data-session-status]');
    const panel = control?.querySelector('.session-status-panel');
    const open = !!panel?.hidden;
    closeSessionStatusPanels();
    if (panel && open) {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
    return;
  }
  if (!event.target?.closest?.('[data-session-status]')) closeSessionStatusPanels();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSessionStatusPanels();
});
