function getSceneTimeSafeEvent(commentOrEvent) {
  return normalizeSceneTimeEvent(commentOrEvent?.sceneTimeEvent || commentOrEvent || {});
}

function renderSceneTimeIcon(event) {
  if (event.iconUrl) {
    return `<img src="${sanitizeImageSrc(event.iconUrl)}" alt="" loading="lazy" decoding="async">`;
  }
  return `<span>${escapeHtml(event.iconMark || '')}</span>`;
}

function renderSceneTimePresetMark(preset) {
  if (preset.iconUrl) {
    return `<img src="${sanitizeImageSrc(preset.iconUrl)}" alt="" loading="lazy" decoding="async">`;
  }
  return `<span>${escapeHtml(preset.iconMark)}</span>`;
}

function renderSceneTimeEventBlock(eventInput, options = {}) {
  const event = getSceneTimeSafeEvent(eventInput);
  const title = escapeHtml(event.title);
  const dayLabel = event.dayLabel ? `<span>${escapeHtml(event.dayLabel)}</span>` : '';
  const timeLabel = event.timeLabel ? `<span>${escapeHtml(event.timeLabel)}</span>` : '';
  const body = event.body ? `<div class="scene-time-event-body">${parseCommentMarkup(event.body)}</div>` : '';
  const actions = options.commentId && !options.hideActions
    ? `<div class="comment-narrator-actions scene-time-event-actions">${options.lockMarkup || `<button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${escapeHtml(options.commentId)}" title="Loeschen">Loeschen</button>`}</div>`
    : '';

  return `
    <div class="scene-time-event" data-scene-time-theme="${escapeHtml(event.theme)}" data-scene-time-preset="${escapeHtml(event.presetKey)}">
      <div class="scene-time-event-line" aria-hidden="true"></div>
      <div class="scene-time-event-panel">
        <div class="scene-time-event-icon" aria-hidden="true">${renderSceneTimeIcon(event)}</div>
        <div class="scene-time-event-copy">
          <div class="scene-time-event-kicker">Szenenzeit</div>
          <div class="scene-time-event-title">${title}</div>
          <div class="scene-time-event-meta">${dayLabel}${timeLabel}</div>
          ${body}
        </div>
        ${actions}
      </div>
    </div>`;
}

function renderSceneTimeEventComment(comment, index = 0) {
  const divider = index > 0
    ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>'
    : '';
  const lockMarkup = window.renderCommentTransactionLock?.(comment) || '';
  return `${divider}${renderSceneTimeEventBlock(comment, { commentId: comment?.id || '', lockMarkup })}`;
}

function buildSceneClockControl(threadId, page = {}) {
  const startDate = sanitizeAleriaDate(page?.sessionDateAleria);
  const hasStart = hasAleriaDate(startDate);
  const dateAttrs = hasStart
    ? ` data-scene-aleria-year="${startDate.year}" data-scene-aleria-month="${startDate.month}" data-scene-aleria-day="${startDate.day}"`
    : '';
  const dateLabel = hasStart ? formatAleriaDate(startDate) : '';
  return `<div class="scene-clock" data-scene-clock data-scene-thread-id="${escapeHtml(threadId)}"${dateAttrs} title="Zeit dieser Szenenseite"><span class="scene-clock-icon" aria-hidden="true"><img src="../IconOrdner/Etablissement Icons/Sanduhr.PNG" alt="" decoding="async"></span><span class="scene-clock-copy"><span class="scene-clock-label">Szenenzeit</span><strong data-scene-clock-value>Zeit nicht gesetzt</strong>${hasStart ? `<span class="scene-clock-date" data-scene-clock-date>${escapeHtml(dateLabel)}</span>` : ''}</span><button type="button" data-scene-time-action="open-event-dialog" aria-label="Szenenzeit einstellen" title="Szenenzeit einstellen">✎</button></div>`;
}

function renderSceneCommentTime(entry) {
  if (!entry || !Number.isFinite(entry.startSeconds)) return '';
  const end = Number.isFinite(entry.endSeconds) ? entry.endSeconds : entry.startSeconds;
  const hasAleria = !!entry.aleriaDate;
  const prefix = hasAleria ? `${formatAleriaDate(entry.aleriaDate)} · Seite ${entry.aleriaPageInDay} · ` : '';
  const text = `${prefix}${formatSceneClock(entry.startSeconds, !hasAleria)}${end !== entry.startSeconds ? ` → ${formatSceneClock(end, false)}` : ''}`;
  return `<div class="scene-comment-time" title="Dauer dieses Beitrags: ${entry.durationSeconds || 0} Sekunden">${escapeHtml(text)}</div>`;
}

function buildSceneTimePresetButtons(selectedKey = 'evening') {
  return getSceneTimeEventPresets().filter(preset => !preset.hiddenInTimeDialog).map(preset => `
    <button
      type="button"
      class="scene-time-preset-btn${preset.key === selectedKey ? ' active' : ''}"
      data-scene-time-action="select-preset"
      data-scene-time-preset="${escapeHtml(preset.key)}"
      aria-pressed="${preset.key === selectedKey ? 'true' : 'false'}">
      <span class="scene-time-preset-mark">${renderSceneTimePresetMark(preset)}</span>
      <span>${escapeHtml(preset.label)}</span>
    </button>`).join('');
}

function ensureSceneTimeEventDialog() {
  let overlay = document.getElementById('scene-time-event-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'scene-time-event-overlay';
  overlay.className = 'scene-time-event-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'scene-time-event-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="scene-time-event-card">
      <div class="scene-time-event-card-head">
        <div>
          <div class="scene-time-event-dialog-kicker">Erzaehlerereignis</div>
          <h2 id="scene-time-event-title">Szenenzeit ankuendigen</h2>
        </div>
        <button class="scene-time-event-close" type="button" data-scene-time-action="close-dialog" aria-label="Zeitereignis schliessen">x</button>
      </div>
      <div class="scene-time-event-card-body">
        <div class="scene-time-dialog-hint" data-scene-time-mode-hint style="display:none;">
          Wird direkt nach dem gewählten Beitrag eingefügt – dieser Beitrag bleibt beim bisherigen Tag, alles danach (bis zum nächsten Tag-Marker) zählt zu diesem neu benannten Tag. Zeit/Tag der Zeitlinie sind so vorausgefüllt, dass die bisherige Zeitrechnung nicht springt.
        </div>
        <section class="scene-time-dialog-panel">
          <label>Tagesform oder Ereignis</label>
          <div class="scene-time-preset-grid" data-scene-time-presets>
            ${buildSceneTimePresetButtons('evening')}
          </div>
          <input type="hidden" id="ste-preset" value="evening">
        </section>

        <section class="scene-time-dialog-panel">
          <div class="scene-time-dialog-grid">
            <label>
              <span>Titel</span>
              <input id="ste-title" type="text" placeholder="Der Abend senkt sich">
            </label>
            <label>
              <span>Tag / Abschnitt</span>
              <input id="ste-day-label" type="text" placeholder="Tag 1, spaeter Abend">
            </label>
            <label>
              <span>Zeitangabe</span>
              <input id="ste-time-label" type="text" placeholder="18:30 Uhr, Abend, mehrere Stunden spaeter">
            </label>
            <label>
              <span>Tag der Zeitlinie</span>
              <input id="ste-anchor-day" type="number" min="1" step="1" value="1">
            </label>
            <label>
              <span>Verbindliche Uhrzeit</span>
              <input id="ste-anchor-time" type="text" inputmode="numeric" value="18:30:00" placeholder="HH:MM:SS" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?" maxlength="8" autocomplete="off" required>
            </label>
            <label class="wide">
              <span>Ankuendigungstext</span>
              <textarea id="ste-body" rows="4" placeholder="Die Sonne verschwindet hinter den Mauern, und in der Szene vergeht Zeit."></textarea>
            </label>
          </div>
        </section>

        <section class="scene-time-dialog-panel">
          <label>Vorschau</label>
          <div class="scene-time-preview" data-scene-time-preview></div>
        </section>
      </div>
      <div class="scene-time-event-card-foot">
        <div class="scene-time-event-status" data-scene-time-status role="status"></div>
        <div class="scene-time-event-buttons">
          <button type="button" data-scene-time-action="close-dialog">Abbrechen</button>
          <button class="primary" type="button" data-scene-time-action="submit-event">Einlaeuten</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function getSceneTimeDialogPayload() {
  const anchorTime = document.getElementById('ste-anchor-time')?.value || '';
  return normalizeSceneTimeEvent({
    presetKey: document.getElementById('ste-preset')?.value || 'evening',
    title: document.getElementById('ste-title')?.value || '',
    dayLabel: document.getElementById('ste-day-label')?.value || '',
    timeLabel: document.getElementById('ste-time-label')?.value || '',
    body: document.getElementById('ste-body')?.value || '',
    anchorDay: document.getElementById('ste-anchor-day')?.value || 1,
    anchorTime
  });
}

function renderSceneTimeDialogPreview() {
  const preview = document.querySelector('[data-scene-time-preview]');
  if (!preview) return;
  preview.innerHTML = renderSceneTimeEventBlock(getSceneTimeDialogPayload(), { hideActions: true });
}

function syncSceneTimeAnchorFromLabel() {
  const label = document.getElementById('ste-time-label')?.value || '';
  const anchorInput = document.getElementById('ste-anchor-time');
  const seconds = normalizeSceneTimeAnchorSeconds(null, label);
  if (!anchorInput || !Number.isFinite(seconds)) return;
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  anchorInput.value = `${hh}:${mm}:${ss}`;
}

function setSceneTimeEventStatus(message = '', type = 'info') {
  const status = document.querySelector('[data-scene-time-status]');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = message;
}

function setSceneTimePreset(presetKey) {
  const preset = getSceneTimeEventPreset(presetKey);
  const presetInput = document.getElementById('ste-preset');
  const title = document.getElementById('ste-title');
  const timeLabel = document.getElementById('ste-time-label');
  const dayLabel = document.getElementById('ste-day-label');
  if (presetInput) presetInput.value = preset.key;
  if (title && !title.dataset.userEdited) title.value = preset.title;
  if (timeLabel && !timeLabel.dataset.userEdited) timeLabel.value = preset.timeLabel;
  if (dayLabel) {
    dayLabel.placeholder = isSceneTimeSegmentBreakPreset(preset.key)
      ? 'Leer lassen fuer Tag I, Tag II ...'
      : 'Tag 1, spaeter Abend';
  }
  document.querySelectorAll('[data-scene-time-preset]').forEach(btn => {
    const active = btn.dataset.sceneTimePreset === preset.key;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  renderSceneTimeDialogPreview();
}

function resetSceneTimeEventDialog() {
  const preset = getSceneTimeEventPreset('evening');
  ['ste-title', 'ste-day-label', 'ste-time-label', 'ste-body'].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;
    field.dataset.userEdited = '';
    field.value = '';
  });
  const title = document.getElementById('ste-title');
  const timeLabel = document.getElementById('ste-time-label');
  if (title) title.value = preset.title;
  if (timeLabel) timeLabel.value = preset.timeLabel;
  // Sonst wuerde ein vorheriger rueckwirkender Aufruf (prefillSceneTimeAnchorFromSeconds)
  // seine Tag/Uhrzeit-Werte in ein spaeteres normales "jetzt ankuendigen" durchsickern lassen.
  const anchorDay = document.getElementById('ste-anchor-day');
  const anchorTime = document.getElementById('ste-anchor-time');
  if (anchorDay) anchorDay.value = '1';
  if (anchorTime) anchorTime.value = '18:30:00';
  setSceneTimeEventStatus('');
  setSceneTimePreset(preset.key);
}
