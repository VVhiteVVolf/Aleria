import { normalizeHerausforderungEvent } from './herausforderung-model.js?v=20260805-herausforderung-v2';
import { SKILL_DEFINITIONS } from '../skill-checks/skill-check-model.js?v=20260905-party-combat-v1';

export const HERAUSFORDERUNG_ICON_URL = '../IconOrdner/Buttom Icons/Herausforderung.png';

function escapeMarkup(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ensureHerausforderungDialog() {
  let overlay = document.getElementById('herausforderung-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'herausforderung-overlay';
  overlay.className = 'scene-time-event-overlay herausforderung-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'herausforderung-dialog-title');
  overlay.innerHTML = `
    <div class="scene-time-event-card herausforderung-card">
      <header class="herausforderung-head">
        <span><img src="${HERAUSFORDERUNG_ICON_URL}" alt=""></span>
        <div><small>Herausforderung</small><h2 id="herausforderung-dialog-title">Herausforderung anlegen</h2></div>
        <button type="button" data-herausforderung-action="close" aria-label="Schließen">×</button>
      </header>
      <div class="herausforderung-body">
        <div class="herausforderung-fields">
          <label><span>Titel</span><input data-herausforderung-field="title" maxlength="180" value="Herausforderung"></label>
          <label class="wide"><span>Öffentliche Beschreibung</span><textarea data-herausforderung-field="publicDescription" rows="6" placeholder="Was alle Beteiligten sehen: Atmosphäre und offensichtliche Hinweise, keine verborgene Lösung."></textarea></label>
        </div>
        <div class="herausforderung-approaches" data-herausforderung-approaches></div>
        <button type="button" class="herausforderung-add-approach" data-herausforderung-action="add-approach">+ Ansatz hinzufügen</button>
        <p class="herausforderung-status" data-herausforderung-status></p>
      </div>
      <footer><button type="button" data-herausforderung-action="close">Abbrechen</button><button type="button" class="primary" data-herausforderung-action="submit">Eintragen</button></footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function renderSkillCheckboxes(approach, approachIndex) {
  const preferred = new Set(Array.isArray(approach.preferredSkills) ? approach.preferredSkills : []);
  return SKILL_DEFINITIONS.map(skill => `
    <label class="herausforderung-skill-check">
      <input type="checkbox" data-herausforderung-approach-index="${approachIndex}" data-herausforderung-field="preferredSkill" data-skill-id="${skill.id}"${preferred.has(skill.id) ? ' checked' : ''}>
      ${escapeMarkup(skill.label)}
    </label>`).join('');
}

export function renderApproachRows(approaches = []) {
  const host = document.querySelector('[data-herausforderung-approaches]');
  if (!host) return;
  if (!approaches.length) {
    host.innerHTML = '<p class="herausforderung-empty">Noch kein Ansatz angelegt.</p>';
    return;
  }
  host.innerHTML = approaches.map((approach, index) => `
    <fieldset class="herausforderung-approach" data-herausforderung-approach-row data-approach-index="${index}">
      <legend>Ansatz ${index + 1}</legend>
      <button type="button" class="herausforderung-remove-approach" data-herausforderung-action="remove-approach" data-approach-index="${index}" aria-label="Ansatz entfernen">×</button>
      <label><span>Interne Bezeichnung</span><input data-herausforderung-approach-index="${index}" data-herausforderung-field="label" value="${escapeMarkup(approach.label)}" placeholder="z.B. Spuren untersuchen"></label>
      <label><span>Schwierigkeit</span><input type="number" min="1" max="40" data-herausforderung-approach-index="${index}" data-herausforderung-field="difficulty" value="${Number(approach.difficulty) || 10}"></label>
      <div class="herausforderung-skills wide"><span>Passende Fertigkeiten</span><div class="herausforderung-skills-list">${renderSkillCheckboxes(approach, index)}</div></div>
      <label class="wide"><span>Verdeckte Erkenntnis (wird erst bei Erfolg gezeigt)</span><textarea data-herausforderung-approach-index="${index}" data-herausforderung-field="insight" rows="4" placeholder="Was aufgedeckt wird, wenn dieser Ansatz gelingt.">${escapeMarkup(approach.insight)}</textarea></label>
      <label class="wide"><span>Teilhinweis bei knappem Scheitern (optional)</span><textarea data-herausforderung-approach-index="${index}" data-herausforderung-field="partialHint" rows="3" placeholder="Ein unvollständiger oder mehrdeutiger Hinweis. Der Ansatz bleibt danach für andere offen.">${escapeMarkup(approach.partialHint)}</textarea></label>
      <label class="wide"><span>Konsequenz bei deutlichem Scheitern (optional)</span><textarea data-herausforderung-approach-index="${index}" data-herausforderung-field="failureConsequence" rows="3" placeholder="Eine erzählerische Komplikation ohne belastbare Erkenntnis.">${escapeMarkup(approach.failureConsequence)}</textarea></label>
    </fieldset>`).join('');
}

export function setHerausforderungStatus(message = '', type = 'info') {
  const output = document.querySelector('[data-herausforderung-status]');
  if (!output) return;
  output.dataset.status = type;
  output.textContent = message;
}

export function setHerausforderungSubmitting(submitting) {
  const button = document.querySelector('[data-herausforderung-action="submit"]');
  if (!button) return;
  button.disabled = !!submitting;
  button.textContent = submitting ? 'Wird gespeichert …' : 'Eintragen';
}

export function renderHerausforderungComment(comment = {}, index = 0) {
  const event = normalizeHerausforderungEvent(comment.herausforderung || comment);
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  const approaches = event.approaches.map(approach => `
    <li>
      <span>${escapeMarkup(approach.label)}</span>
      <button type="button" class="herausforderung-attempt-btn" data-herausforderung-action="attempt" data-comment-id="${escapeMarkup(String(comment.id || ''))}" data-approach-id="${escapeMarkup(approach.approachId)}" data-approach-label="${escapeMarkup(approach.label)}" data-herausforderung-title="${escapeMarkup(event.title)}">Diesen Ansatz versuchen</button>
    </li>`).join('');
  return `${divider}<section class="herausforderung-event">
    <header><img src="${HERAUSFORDERUNG_ICON_URL}" alt=""><span>Herausforderung</span><strong>${escapeMarkup(event.title)}</strong></header>
    ${event.publicDescription ? `<p>${escapeMarkup(event.publicDescription)}</p>` : ''}
    ${approaches ? `<ul class="herausforderung-approach-list">${approaches}</ul>` : ''}
  </section>`;
}

export const herausforderungUiInternals = Object.freeze({ escapeMarkup });
