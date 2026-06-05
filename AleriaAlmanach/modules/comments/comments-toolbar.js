// Comment toolbar, turn-bar builders, reader settings, and preview layout controls.
const COMMENT_TOOLS_VISIBLE_KEY = 'aleria-comment-tools-visible-v1';
const COMMENT_QUICK_TOOLS_VISIBLE_KEY = 'aleria-comment-quick-tools-visible-v1';
const COMMENT_PREVIEW_STATE_KEY = 'aleria-comment-preview-state-v1';
const COMMENT_PREVIEW_WIDTH_KEY = 'aleria-comment-preview-width-v1';
const COMMENT_READER_SETTINGS_KEY = 'aleria-comment-reader-settings-v1';

let _commentToolsVisible = localStorage.getItem(COMMENT_TOOLS_VISIBLE_KEY) === '1';
let _commentQuickToolsVisible = localStorage.getItem(COMMENT_QUICK_TOOLS_VISIBLE_KEY) !== '0';

function buildCommentTurnBar(threadId) {
  const safeThreadId = escapeHtml(threadId || '');
  return `
    <div class="comment-turn-bar" data-comment-thread-id="${safeThreadId}">
      <div class="comment-turn-main">
        <span class="comment-turn-kicker">Redestab</span>
        <span class="comment-turn-state" data-turn-state>Wird geladen...</span>
      </div>
      <div class="comment-turn-actions">
        <button class="comment-turn-btn" type="button" data-action="set-comment-turn" data-turn-value="erdi">Erdi</button>
        <button class="comment-turn-btn" type="button" data-action="set-comment-turn" data-turn-value="patrick">Patrick</button>
        <button class="comment-turn-btn comment-turn-ended" type="button" data-action="set-comment-turn" data-turn-value="ended">Sitzung beendet</button>
      </div>
    </div>`;
}

function buildCommentToolsToggle() {
  return '<button class="comment-tools-toggle" type="button" data-action="toggle-comment-tools" data-comment-tools-toggle>Bearbeitung anzeigen</button>';
}

function buildCommentQuickToolsToggle() {
  const quickToolsVisible = getCommentQuickToolsVisible();
  return `<button class="comment-tools-toggle comment-quick-tools-toggle${quickToolsVisible ? ' active' : ''}" type="button" data-action="toggle-comment-quick-tools" data-comment-quick-tools-toggle aria-pressed="${quickToolsVisible ? 'true' : 'false'}">${quickToolsVisible ? 'Leiste ausblenden' : 'Leiste anzeigen'}</button>`;
}

function buildCommentQuickTools() {
  const readerSettings = getCommentReaderSettings();
  const quickToolsVisible = getCommentQuickToolsVisible();
  return `
    <div class="comment-quick-tools${quickToolsVisible ? '' : ' collapsed'}" data-comment-quick-tools${quickToolsVisible ? '' : ' hidden'}>
      <div class="comment-jump-search">
        <input
          type="search"
          class="comment-jump-input"
          data-comment-jump-input
          list="comment-author-jump-list"
          placeholder="Kommentator suchen..."
          autocomplete="off">
        <datalist id="comment-author-jump-list"></datalist>
        <button class="comment-jump-btn" type="button" data-action="jump-to-latest-comment-author">Jüngste</button>
      </div>
      <div class="comment-scroll-actions" aria-label="Kommentar-Navigation">
        <button class="comment-scroll-btn" type="button" data-action="scroll-comments" data-direction="top" title="Zum Anfang" aria-label="Zum Anfang">↑</button>
        <button class="comment-scroll-btn" type="button" data-action="scroll-comments" data-direction="bottom" title="Zum Ende" aria-label="Zum Ende">↓</button>
      </div>
      <div class="comment-reader-controls" aria-label="Lesedarstellung">
        <label class="comment-reader-control">
          <span>Schrift</span>
          <input type="range" min="85" max="130" step="5" value="${readerSettings.font}" data-action="set-comment-reader-setting" data-reader-setting="font">
        </label>
        <label class="comment-reader-control">
          <span>Avatare</span>
          <input type="range" min="65" max="125" step="5" value="${readerSettings.avatar}" data-action="set-comment-reader-setting" data-reader-setting="avatar">
        </label>
        <button class="comment-reader-reset" type="button" data-action="reset-comment-reader-settings" title="Darstellung zurücksetzen" aria-label="Darstellung zurücksetzen">↺</button>
      </div>
      <div class="comment-jump-status" data-comment-jump-status></div>
    </div>`;
}

function getCommentQuickToolsVisible() {
  try {
    _commentQuickToolsVisible = localStorage.getItem(COMMENT_QUICK_TOOLS_VISIBLE_KEY) !== '0';
  } catch {
    _commentQuickToolsVisible = true;
  }
  return _commentQuickToolsVisible;
}

function setCommentQuickToolsVisible(visible) {
  _commentQuickToolsVisible = !!visible;
  try {
    localStorage.setItem(COMMENT_QUICK_TOOLS_VISIBLE_KEY, _commentQuickToolsVisible ? '1' : '0');
  } catch {
    // Visual state still updates for this render.
  }
  applyCommentToolsVisibility();
}

function toggleCommentQuickToolsVisibility() {
  setCommentQuickToolsVisible(!getCommentQuickToolsVisible());
}

function applyCommentToolsVisibility() {
  const quickToolsVisible = getCommentQuickToolsVisible();
  document.querySelectorAll('.comments-scroll').forEach(scroll => {
    scroll.classList.toggle('comment-tools-visible', _commentToolsVisible);
  });
  document.querySelectorAll('.comment-turn-bar').forEach(bar => {
    bar.classList.toggle('comment-tools-visible', _commentToolsVisible);
  });
  document.querySelectorAll('[data-comment-quick-tools]').forEach(bar => {
    bar.classList.toggle('collapsed', !quickToolsVisible);
    bar.hidden = !quickToolsVisible;
    bar.style.display = quickToolsVisible ? '' : 'none';
  });
  document.querySelectorAll('[data-comment-quick-tools-toggle]').forEach(btn => {
    btn.textContent = quickToolsVisible ? 'Leiste ausblenden' : 'Leiste anzeigen';
    btn.classList.toggle('active', quickToolsVisible);
    btn.setAttribute('aria-pressed', quickToolsVisible ? 'true' : 'false');
  });
  document.querySelectorAll('[data-comment-tools-toggle]').forEach(btn => {
    btn.textContent = _commentToolsVisible ? 'Bearbeitung ausblenden' : 'Bearbeitung anzeigen';
    btn.classList.toggle('active', _commentToolsVisible);
    btn.setAttribute('aria-pressed', _commentToolsVisible ? 'true' : 'false');
  });
}

function toggleCommentToolsVisibility() {
  _commentToolsVisible = !_commentToolsVisible;
  try {
    localStorage.setItem(COMMENT_TOOLS_VISIBLE_KEY, _commentToolsVisible ? '1' : '0');
  } catch {
    // Visual state still updates for this render.
  }
  applyCommentToolsVisibility();
}

function getCommentPreviewPanelState(layout = null) {
  if (layout?.classList?.contains('preview-collapsed')) return 'collapsed';
  if (layout?.classList?.contains('preview-maximized')) return 'maximized';
  try {
    return localStorage.getItem(COMMENT_PREVIEW_STATE_KEY) || 'split';
  } catch {
    return 'split';
  }
}

function getCommentPreviewWidth() {
  try {
    const value = Number(localStorage.getItem(COMMENT_PREVIEW_WIDTH_KEY));
    return Number.isFinite(value) ? Math.max(24, Math.min(68, value)) : 38;
  } catch {
    return 38;
  }
}

function getCommentPreviewLayoutFromTrigger(trigger) {
  return trigger?.closest?.('.comment-compose-layout, .edit-step-form') || null;
}

function getCommentPreviewLayouts(targetLayout = null) {
  if (targetLayout) return [targetLayout];
  return [
    document.querySelector('#comment-form-overlay .comment-compose-layout'),
    document.querySelector('#edit-comment-overlay .edit-step-form.visible')
  ].filter(Boolean);
}

function setCommentPreviewPanelState(state, targetLayout = null) {
  const next = state === 'collapsed' || state === 'maximized' ? state : 'split';
  try {
    localStorage.setItem(COMMENT_PREVIEW_STATE_KEY, next);
  } catch {
    // The panel still updates for this render.
  }
  applyCommentPreviewLayout(targetLayout);
}

function applyCommentPreviewLayout(targetLayout = null) {
  const layouts = getCommentPreviewLayouts(targetLayout);
  if (!layouts.length) return;
  const state = getCommentPreviewPanelState();
  const width = getCommentPreviewWidth();
  layouts.forEach(layout => {
    layout.style.setProperty('--comment-preview-width', `${width}%`);
    layout.classList.toggle('preview-collapsed', state === 'collapsed');
    layout.classList.toggle('preview-maximized', state === 'maximized');
  });
  const buttonScope = targetLayout || document;
  buttonScope.querySelectorAll('[data-comment-preview-collapse]').forEach(btn => {
    const active = state === 'collapsed';
    btn.classList.toggle('active', active);
    btn.textContent = active ? '>' : '<';
    btn.setAttribute('aria-label', active ? 'Live-Ansicht ausklappen' : 'Live-Ansicht einklappen');
    btn.setAttribute('title', active ? 'Live-Ansicht ausklappen' : 'Live-Ansicht einklappen');
  });
  buttonScope.querySelectorAll('[data-comment-preview-maximize]').forEach(btn => {
    const active = state === 'maximized';
    btn.classList.toggle('active', active);
    btn.textContent = active ? '-' : '[]';
    btn.setAttribute('aria-label', active ? 'Live-Ansicht verkleinern' : 'Live-Ansicht maximieren');
    btn.setAttribute('title', active ? 'Live-Ansicht verkleinern' : 'Live-Ansicht maximieren');
  });
}

function toggleCommentPreviewPanel(mode, trigger = null) {
  const targetLayout = getCommentPreviewLayoutFromTrigger(trigger);
  const current = getCommentPreviewPanelState(targetLayout);
  if (mode === 'collapsed') {
    setCommentPreviewPanelState(current === 'collapsed' ? 'split' : 'collapsed', targetLayout);
    return;
  }
  if (mode === 'maximized') {
    setCommentPreviewPanelState(current === 'maximized' ? 'split' : 'maximized', targetLayout);
  }
}

function initCommentPreviewSplitter() {
  const layout = document.querySelector('#comment-form-overlay .comment-compose-layout');
  const splitter = layout?.querySelector?.('.comment-compose-splitter');
  if (!layout || !splitter || splitter.dataset.bound === 'true') return;
  splitter.dataset.bound = 'true';
  splitter.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const current = getCommentPreviewWidth();
    const delta = event.key === 'ArrowLeft' ? 3 : -3;
    const next = Math.max(24, Math.min(68, current + delta));
    setCommentPreviewPanelState('split');
    layout.style.setProperty('--comment-preview-width', `${next}%`);
    try {
      localStorage.setItem(COMMENT_PREVIEW_WIDTH_KEY, String(Math.round(next)));
    } catch {
      // Ignore persistence failures.
    }
    event.preventDefault();
  });
  splitter.addEventListener('pointerdown', event => {
    if (event.button != null && event.button !== 0) return;
    const rect = layout.getBoundingClientRect();
    if (!rect.width) return;
    setCommentPreviewPanelState('split');
    layout.classList.add('resizing');
    splitter.setPointerCapture?.(event.pointerId);
    const move = moveEvent => {
      const editorPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const previewPercent = Math.max(24, Math.min(68, 100 - editorPercent));
      layout.style.setProperty('--comment-preview-width', `${previewPercent}%`);
      try {
        localStorage.setItem(COMMENT_PREVIEW_WIDTH_KEY, String(Math.round(previewPercent)));
      } catch {
        // Ignore persistence failures.
      }
    };
    const done = doneEvent => {
      layout.classList.remove('resizing');
      splitter.releasePointerCapture?.(doneEvent.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', done);
      window.removeEventListener('pointercancel', done);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', done);
    window.addEventListener('pointercancel', done);
    event.preventDefault();
  });
}

function clampCommentReaderValue(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(65, Math.min(140, Math.round(number)));
}

function getCommentReaderSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMMENT_READER_SETTINGS_KEY) || '{}');
    return {
      font: clampCommentReaderValue(parsed.font, 100),
      avatar: clampCommentReaderValue(parsed.avatar, 100)
    };
  } catch {
    return { font: 100, avatar: 100 };
  }
}

function saveCommentReaderSettings(settings) {
  try {
    localStorage.setItem(COMMENT_READER_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Reading controls remain usable for the current render.
  }
}

function applyCommentReaderSettings(settings = getCommentReaderSettings()) {
  const fontScale = clampCommentReaderValue(settings.font, 100) / 100;
  const avatarScale = clampCommentReaderValue(settings.avatar, 100) / 100;
  document.querySelectorAll('.session-page').forEach(page => {
    page.style.setProperty('--session-comment-font-scale', String(fontScale));
    page.style.setProperty('--session-comment-avatar-scale', String(avatarScale));
  });
  document.querySelectorAll('.comment-reader-control input').forEach(input => {
    const key = input.dataset.readerSetting === 'avatar' ? 'avatar' : 'font';
    input.value = String(settings[key] || 100);
  });
}

function setCommentReaderSetting(key, value) {
  const settings = getCommentReaderSettings();
  if (key !== 'font' && key !== 'avatar') return;
  settings[key] = clampCommentReaderValue(value, 100);
  saveCommentReaderSettings(settings);
  applyCommentReaderSettings(settings);
}

function resetCommentReaderSettings() {
  const settings = { font: 100, avatar: 100 };
  saveCommentReaderSettings(settings);
  applyCommentReaderSettings(settings);
}
