import { getSceneRestType, normalizeSceneRest } from './scene-rest-model.js?v=20260906-character-vitality-v1';

export const SCENE_REST_ICON_URL = '../IconOrdner/Buttom Icons/Rasten.png';

function escapeMarkup(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(seconds) {
  const totalMinutes = Math.max(1, Math.round(Number(seconds || 0) / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} Minuten`;
  return minutes ? `${hours} Std. ${minutes} Min.` : `${hours} Stunde${hours === 1 ? '' : 'n'}`;
}

function getResourceSummary(participant = {}) {
  const changed = [
    ...(participant.changes?.resources || []),
    ...(participant.changes?.abilities || [])
  ];
  if (!changed.length) return 'Keine Rastressource verändert';
  return changed.slice(0, 3).map(change => `${change.name} ${change.before}→${change.after}`).join(' · ')
    + (changed.length > 3 ? ` · +${changed.length - 3}` : '');
}

export function renderSceneRestParticipantOption(candidate = {}) {
  const hp = candidate.profile || {};
  const participantClass = candidate.sceneParticipant ? ' scene-rest-participant-current' : '';
  return `
    <label class="scene-rest-participant${participantClass}" data-scene-rest-participant data-rest-actor-id="${escapeMarkup(candidate.actorId)}" data-rest-search="${escapeMarkup(candidate.searchText || '')}">
      <input type="checkbox" data-scene-rest-field="participant" value="${escapeMarkup(candidate.actorId)}"${candidate.selected ? ' checked' : ''}>
      <span class="scene-rest-participant-portrait">
        ${candidate.portrait ? `<img src="${escapeMarkup(candidate.portrait)}" alt="" loading="lazy" decoding="async">` : `<b>${escapeMarkup((candidate.name || '?').slice(0, 1))}</b>`}
      </span>
      <span class="scene-rest-participant-copy">
        <strong>${escapeMarkup(candidate.name || 'Unbekannte Figur')}</strong>
        <small>${candidate.sceneParticipant ? 'Hat in dieser Szene kommentiert' : 'Weitere verfügbare Figur'}</small>
      </span>
      <span class="scene-rest-participant-hp"><b>${escapeMarkup(hp.currentHitPoints ?? 0)}</b> / ${escapeMarkup(hp.maximumHitPoints ?? 0)} TP</span>
    </label>`;
}

export function ensureSceneRestDialog() {
  let overlay = document.getElementById('scene-rest-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'scene-rest-overlay';
  overlay.className = 'scene-time-event-overlay scene-rest-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'scene-rest-dialog-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="scene-time-event-card scene-rest-card">
      <div class="scene-time-event-card-head">
        <div class="scene-rest-heading">
          <span class="scene-rest-heading-icon"><img src="${SCENE_REST_ICON_URL}" alt=""></span>
          <div><div class="scene-time-event-dialog-kicker">Szenenerholung</div><h2 id="scene-rest-dialog-title">Rast einlegen</h2></div>
        </div>
        <button class="scene-time-event-close" type="button" data-scene-rest-action="close" aria-label="Rastdialog schließen">×</button>
      </div>
      <div class="scene-time-event-card-body scene-rest-card-body">
        <section class="scene-time-dialog-panel">
          <label>Art der Rast</label>
          <div class="scene-rest-type-grid">
            <button type="button" class="scene-rest-type active" data-scene-rest-action="select-type" data-rest-type="short" aria-pressed="true">
              <img src="${SCENE_REST_ICON_URL}" alt=""><span><strong>Kurze Rast</strong><small>Standard: 1 Stunde · TP und Kurzrast-Ressourcen</small></span>
            </button>
            <button type="button" class="scene-rest-type" data-scene-rest-action="select-type" data-rest-type="long" aria-pressed="false">
              <img src="${SCENE_REST_ICON_URL}" alt=""><span><strong>Lange Rast</strong><small>Standard: 8 Stunden · TP, Langrast- und Tagesressourcen</small></span>
            </button>
          </div>
          <input type="hidden" id="scene-rest-type" value="short">
        </section>

        <section class="scene-time-dialog-panel">
          <div class="scene-rest-panel-head"><label>Betroffene Figuren</label><span data-scene-rest-selected-count>0 ausgewählt</span></div>
          <p class="scene-time-dialog-hint scene-rest-visible-hint">Standardmäßig sind alle Figuren markiert, die in der aktuellen Szene bereits kommentiert haben. Weitere Figuren können gezielt ergänzt werden.</p>
          <div class="scene-rest-participant-tools">
            <input id="scene-rest-participant-search" type="search" placeholder="Figur suchen …" data-scene-rest-field="search">
            <button type="button" data-scene-rest-action="select-scene">Szenenfiguren wählen</button>
            <button type="button" data-scene-rest-action="clear-participants">Auswahl leeren</button>
          </div>
          <div class="scene-rest-participant-list" data-scene-rest-participants></div>
          <div class="scene-rest-participant-empty" data-scene-rest-participant-empty hidden>Keine passende Figur gefunden.</div>
        </section>

        <section class="scene-time-dialog-panel">
          <label>Zeitlicher Ablauf</label>
          <div class="scene-time-dialog-grid scene-rest-time-grid">
            <label><span>Beginn · Tag</span><input id="scene-rest-start-day" type="number" min="1" step="1" value="1" data-scene-rest-field="time"></label>
            <label><span>Beginn · Uhrzeit</span><input id="scene-rest-start-time" type="text" inputmode="numeric" value="18:30:00" placeholder="HH:MM:SS" maxlength="8" data-scene-rest-field="time"></label>
            <label><span>Dauer in Stunden</span><input id="scene-rest-duration-hours" type="number" min="0.25" max="168" step="0.25" value="1" data-scene-rest-field="time"></label>
            <label><span>Ende</span><output id="scene-rest-end-time">Tag 1 · 19:30:00</output></label>
            <label class="wide"><span>Erzählerischer Text</span><textarea id="scene-rest-body" rows="3" maxlength="4000" data-scene-rest-field="body"></textarea></label>
          </div>
        </section>

        <section class="scene-time-dialog-panel">
          <label>Vorschau</label>
          <div class="scene-time-preview scene-rest-preview" data-scene-rest-preview></div>
        </section>
      </div>
      <div class="scene-time-event-card-foot">
        <div class="scene-time-event-status" data-scene-rest-status role="status"></div>
        <div class="scene-time-event-buttons">
          <button type="button" data-scene-rest-action="close">Abbrechen</button>
          <button class="primary" type="button" data-scene-rest-action="submit">Rast eintragen</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export function renderSceneRestCandidates(candidates = []) {
  const root = document.querySelector('[data-scene-rest-participants]');
  if (!root) return;
  root.innerHTML = candidates.map(renderSceneRestParticipantOption).join('');
  updateSceneRestSelectionCount();
}

export function setSceneRestType(type = 'short') {
  const definition = getSceneRestType(type);
  const input = document.getElementById('scene-rest-type');
  const duration = document.getElementById('scene-rest-duration-hours');
  const body = document.getElementById('scene-rest-body');
  if (input) input.value = definition.id;
  if (duration) {
    duration.min = String(definition.durationSeconds / 3600);
    duration.value = String(definition.durationSeconds / 3600);
  }
  if (body) body.value = definition.description;
  document.querySelectorAll('[data-scene-rest-action="select-type"]').forEach(button => {
    const active = button.dataset.restType === definition.id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function updateSceneRestSelectionCount() {
  const selected = document.querySelectorAll('[data-scene-rest-field="participant"]:checked').length;
  const output = document.querySelector('[data-scene-rest-selected-count]');
  if (output) output.textContent = `${selected} ausgewählt`;
  return selected;
}

export function filterSceneRestCandidates(query = '') {
  const needle = String(query || '').trim().toLocaleLowerCase('de');
  let visible = 0;
  document.querySelectorAll('[data-scene-rest-participant]').forEach(row => {
    const show = !needle || String(row.dataset.restSearch || '').includes(needle);
    row.hidden = !show;
    if (show) visible += 1;
  });
  const empty = document.querySelector('[data-scene-rest-participant-empty]');
  if (empty) empty.hidden = visible > 0;
}

export function setSceneRestStatus(message = '', type = 'info') {
  const status = document.querySelector('[data-scene-rest-status]');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = message;
}

export function setSceneRestSubmitting(submitting) {
  const button = document.querySelector('[data-scene-rest-action="submit"]');
  if (!button) return;
  button.disabled = !!submitting;
  button.textContent = submitting ? 'Rast wird gespeichert …' : 'Rast eintragen';
}

export function renderSceneRestPreview(sceneRest, sceneTimeEvent) {
  const preview = document.querySelector('[data-scene-rest-preview]');
  if (!preview) return;
  const rest = normalizeSceneRest(sceneRest);
  const timeMarkup = typeof globalThis.renderSceneTimeEventBlock === 'function'
    ? globalThis.renderSceneTimeEventBlock(sceneTimeEvent, { hideActions: true })
    : `<strong>${escapeMarkup(rest.title)}</strong>`;
  const recovered = rest.participants.reduce((sum, participant) => (
    sum + participant.changes.resources.length + participant.changes.abilities.length
  ), 0);
  preview.innerHTML = `${timeMarkup}<div class="scene-rest-preview-summary"><strong>${rest.participants.length} Figur${rest.participants.length === 1 ? '' : 'en'}</strong><span>${formatDuration(rest.durationSeconds)}</span><span>${recovered} Ressourcen aufgefüllt</span></div>`;
}

export function renderSceneRestComment(comment = {}, index = 0) {
  const rest = normalizeSceneRest(comment.sceneRest || comment);
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  const timeMarkup = typeof globalThis.renderSceneTimeEventBlock === 'function'
    ? globalThis.renderSceneTimeEventBlock(comment.sceneTimeEvent || {}, { hideActions: true })
    : '';
  const participants = rest.participants.map(participant => {
    const hp = participant.after.hitPoints;
    return `<article class="scene-rest-result-person">
      ${participant.portrait ? `<img src="${escapeMarkup(participant.portrait)}" alt="" loading="lazy" decoding="async">` : `<span>${escapeMarkup(participant.name.slice(0, 1))}</span>`}
      <div><strong>${escapeMarkup(participant.name)}</strong><small>TP ${participant.before.hitPoints.current}→${hp.current} / ${hp.maximum}</small><em>${escapeMarkup(getResourceSummary(participant))}</em></div>
    </article>`;
  }).join('');
  return `${divider}<section class="scene-rest-event" data-scene-rest-type="${escapeMarkup(rest.type)}">${timeMarkup}<div class="scene-rest-result"><div class="scene-rest-result-head"><span>${escapeMarkup(getSceneRestType(rest.type).label)}</span><strong>${formatDuration(rest.durationSeconds)}</strong>${comment.id ? `<button type="button" class="scene-rest-event-delete" data-action="undo-mechanical-comment" data-comment-id="${escapeMarkup(comment.id)}" title="Löschen und zurücksetzen" aria-label="Löschen und zurücksetzen">×</button>` : ''}</div><div class="scene-rest-result-grid">${participants}</div></div></section>`;
}

export const sceneRestUiInternals = Object.freeze({ escapeMarkup, formatDuration });
