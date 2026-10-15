import { renderChallengeOutcomesEditor } from './herausforderung-outcomes-ui.js?v=20261015-graded-challenges-v1';
import { normalizeHerausforderungEvent, MAX_HERAUSFORDERUNG_APPROACHES, getHerausforderungValidationIssues, HERAUSFORDERUNG_PREFERRED_MODIFIER, HERAUSFORDERUNG_ALTERNATIVE_MODIFIER } from './herausforderung-model.js?v=20261015-graded-challenges-v1';
import { getApproachProgress, HERAUSFORDERUNG_TIER_LABELS } from './herausforderung-progress.js?v=20261015-graded-challenges-v1';
import { getChallengeCombatBindingError } from './herausforderung-combat-context.js?v=20261015-graded-challenges-v1';
import { SKILL_DEFINITIONS } from '../skill-checks/skill-check-model.js?v=20261015-graded-challenges-v1';
import { renderSkillIcon, renderSkillHint, skillTooltipAttributes, describeSkillChoice, bindSkillIconTooltips } from '../skill-checks/skill-icon-view.js';
import { renderHerausforderungRewardEditor, rewardSummary, rewardReceiptSummary } from './herausforderung-rewards-ui.js?v=20261015-graded-challenges-v1';
import { renderChallengeSceneImageEditor, renderChallengeSceneImage, refreshChallengeSceneImageEditor } from './herausforderung-scene-image-ui.js';

const ASSET_ROOT = './public/assets/herausforderung/';
export const HERAUSFORDERUNG_ICON_URL = '../IconOrdner/Buttom Icons/Herausforderung.png';
const ICONS = { challenge: HERAUSFORDERUNG_ICON_URL, approach: `${ASSET_ROOT}challenge-v1.png`, insight: `${ASSET_ROOT}insight-v1.png`, attempt: `${ASSET_ROOT}attempt-v1.png` };
const DIFFICULTIES = [{ value: 5, label: 'Leicht' }, { value: 10, label: 'Normal' }, { value: 15, label: 'Anspruchsvoll' }, { value: 20, label: 'Schwer' }, { value: 25, label: 'Sehr schwer' }];
const SKILL_GROUPS = [{ label: 'Gesellschaft', ids: ['persuasion', 'intimidation', 'deception', 'performance', 'insight', 'seduction'] }, { label: 'Wissen & Wildnis', ids: ['perception', 'investigation', 'religion', 'arcane-kunde', 'history', 'nature', 'survival', 'animal-handling', 'medicine'] }, { label: 'Geschick & Körper', ids: ['sleight-of-hand', 'acrobatics', 'athletics', 'body-control'] }];

function escapeMarkup(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function icon(name, className = '') { return `<img class="herausforderung-icon ${className}" src="${ICONS[name]}" alt="" decoding="async">`; }
function dialogRoot() { return document.getElementById('herausforderung-overlay'); }

export function ensureHerausforderungDialog() {
  let overlay = dialogRoot();
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
        ${icon('challenge', 'herausforderung-hero-icon')}
        <div><small>Erzählerwerkstatt</small><h2 id="herausforderung-dialog-title">Eine Herausforderung gestalten</h2><p>Eine Situation. Mehrere Wege. Verborgene Erkenntnisse.</p></div>
        <button class="herausforderung-close" type="button" data-herausforderung-action="close" aria-label="Schließen">×</button>
      </header>
      <nav class="herausforderung-exchange" aria-label="Herausforderung importieren und exportieren"><button type="button" data-herausforderung-exchange="ai-template">↓ KI-Vorlage + Anleitung</button><button type="button" data-herausforderung-exchange="draft">↓ Entwurf exportieren</button><button type="button" data-herausforderung-exchange="import">↑ JSON importieren</button><input type="file" accept=".json,application/json" data-herausforderung-import-file hidden></nav>
      <div class="herausforderung-body">
        <div class="herausforderung-editor">
          <section class="herausforderung-public herausforderung-fields" aria-labelledby="herausforderung-public-title">
            <h3 id="herausforderung-public-title">01 <span>Die sichtbare Situation</span><small>Für alle sichtbar</small></h3>
            <label><span>Titel</span><input data-herausforderung-field="title" maxlength="180" value="Herausforderung"></label>
            <label><span>Öffentliche Beschreibung</span><textarea data-herausforderung-field="publicDescription" maxlength="4000" rows="3" placeholder="Was sehen, hören oder bemerken die Beteiligten?"></textarea></label>
            ${renderChallengeSceneImageEditor()}
          </section>
          <section class="herausforderung-fields herausforderung-audience" data-herausforderung-audience></section>
          <div class="herausforderung-section-title"><h3>02 <span>Wege zur Erkenntnis</span></h3><span data-herausforderung-count></span></div>
          <div class="herausforderung-approaches" data-herausforderung-approaches></div>
          <button type="button" class="herausforderung-button herausforderung-add-approach" data-herausforderung-action="add-approach"><span aria-hidden="true">＋</span> Weiteren Ansatz hinzufügen</button>
        </div>
        <aside class="herausforderung-sidebar">
          <section class="herausforderung-rules"><h3>${icon('attempt')} So wird geprüft</h3><p><strong>W20 + Fertigkeit + Ansatzbonus</strong> gegen die Schwierigkeit.</p><div class="herausforderung-bonus"><span>Passende Fertigkeit <b>+2</b></span><span>Andere Fertigkeit <b>−2</b></span></div><ul><li><b>Erfolg:</b> Erkenntnis aufdecken, Ansatz abschließen.</li><li><b>1–3 Punkte darunter:</b> Teilhinweis, Ansatz bleibt offen.</li><li><b>Mehr als 3 darunter:</b> Konsequenz, Ansatz bleibt offen.</li><li><b>Natürliche 20 / 1:</b> kritischer Erfolg / deutlicher Fehlschlag.</li></ul><p>Figurenboni und aktive Regeln werden beim Eintragen berücksichtigt.</p></section>
          <section class="herausforderung-preview"><h3>${icon('insight')} Öffentliche Vorschau</h3><p class="herausforderung-note">Verdeckte Texte erscheinen hier erst nach einem gewürfelten Ergebnis.</p><div data-herausforderung-preview></div></section>
        </aside>
      </div>
      <footer class="herausforderung-footer"><p class="herausforderung-status" data-herausforderung-status role="status" aria-live="polite"></p><div><button type="button" class="herausforderung-button" data-herausforderung-action="close">Abbrechen</button><button type="button" class="herausforderung-button primary" data-herausforderung-action="submit">${icon('challenge')}<span data-herausforderung-submit-label>Veröffentlichen</span></button></div></footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function renderSkillCheckboxes(approach, index) {
  const preferred = new Set(approach.preferredSkills || []);
  return SKILL_GROUPS.map(group => `<div class="herausforderung-skill-group"><span>${group.label}</span><div>${group.ids.map(id => {
    const skill = SKILL_DEFINITIONS.find(entry => entry.id === id);
    return `<label class="herausforderung-skill-check" ${skillTooltipAttributes(`${skill.label} als passende Fertigkeit festlegen: +${HERAUSFORDERUNG_PREFERRED_MODIFIER} auf diesen Ansatz.`)}><input type="checkbox" data-herausforderung-approach-index="${index}" data-herausforderung-field="preferredSkill" data-skill-id="${id}"${preferred.has(id) ? ' checked' : ''}><span>${renderSkillIcon(skill)}${escapeMarkup(skill.label)}</span></label>`;
  }).join('')}</div></div>`).join('');
}

export function renderApproachRows(approaches = [], activeIndex = 0) {
  const root = dialogRoot();
  const host = root?.querySelector('[data-herausforderung-approaches]');
  if (!host) return;
  host.innerHTML = approaches.map((approach, index) => `
    <details class="herausforderung-approach" data-herausforderung-approach-row data-approach-index="${index}"${index === activeIndex ? ' open' : ''}>
      <summary>${icon('approach')}<span class="herausforderung-approach-number">${String(index + 1).padStart(2, '0')}</span><span class="herausforderung-summary-text"><strong data-approach-summary-label>${escapeMarkup(approach.label)}</strong><small data-approach-summary-skills>${skillSummary(approach)}</small></span><span class="herausforderung-difficulty-badge" data-approach-summary-difficulty>SG ${escapeMarkup(approach.difficulty)}</span><span class="herausforderung-chevron" aria-hidden="true">⌄</span></summary>
      <div class="herausforderung-approach-content herausforderung-fields">
        <div class="herausforderung-approach-toolbar"><span>${icon('insight')} Verdeckte Ergebnisse vorbereiten</span><button type="button" class="herausforderung-remove-approach" data-herausforderung-action="remove-approach" data-approach-index="${index}" aria-label="Ansatz ${index + 1} entfernen"${approaches.length === 1 ? ' disabled' : ''}>Entfernen ×</button></div>
        <div class="herausforderung-approach-basics"><label><span>Bezeichnung des Ansatzes · öffentlich</span><input maxlength="160" data-herausforderung-approach-index="${index}" data-herausforderung-field="label" value="${escapeMarkup(approach.label)}" placeholder="z. B. Spuren untersuchen"></label><label><span>Schwierigkeit (SG)</span><input type="number" min="1" max="40" step="1" data-herausforderung-approach-index="${index}" data-herausforderung-field="difficulty" value="${escapeMarkup(approach.difficulty)}"></label></div>
        <div class="herausforderung-difficulty-presets" role="group" aria-label="Schwierigkeitsstufen">${DIFFICULTIES.map(preset => `<button type="button" data-herausforderung-action="set-difficulty" data-approach-index="${index}" data-value="${preset.value}" aria-pressed="${Number(approach.difficulty) === preset.value}">${preset.label} <b>${preset.value}</b></button>`).join('')}</div>
        <fieldset class="herausforderung-skills"><legend>Passende Fertigkeiten <span>+2 auf diesen Ansatz</span></legend>${renderSkillCheckboxes(approach, index)}</fieldset>
        <label class="herausforderung-insight"><span>${icon('insight')} Erkenntnis bei Erfolg · verdeckt</span><textarea maxlength="2000" data-herausforderung-approach-index="${index}" data-herausforderung-field="insight" rows="3" placeholder="Welche Wahrheit wird bei Erfolg aufgedeckt?">${escapeMarkup(approach.insight)}</textarea></label>
        <details class="herausforderung-consequences"${approach.partialHint || approach.failureConsequence ? ' open' : ''}><summary>Teilhinweis & Konsequenz <small>Optional</small></summary><div><label><span>Knapp gescheitert · 1–3 Punkte fehlen</span><textarea maxlength="2000" data-herausforderung-approach-index="${index}" data-herausforderung-field="partialHint" rows="2" placeholder="Ein unvollständiger oder mehrdeutiger Hinweis.">${escapeMarkup(approach.partialHint)}</textarea></label><label><span>Deutlich gescheitert · mehr als 3 Punkte fehlen</span><textarea maxlength="2000" data-herausforderung-approach-index="${index}" data-herausforderung-field="failureConsequence" rows="2" placeholder="Eine erzählerische Komplikation ohne Erkenntnis.">${escapeMarkup(approach.failureConsequence)}</textarea></label></div></details>
        ${approach.outcomeTable?.length ? renderChallengeOutcomesEditor(approach, index) : renderHerausforderungRewardEditor(approach, index)}
      </div>
    </details>`).join('');
  root.querySelector('[data-herausforderung-count]').textContent = `${approaches.length} / ${MAX_HERAUSFORDERUNG_APPROACHES} Ansätze`;
  root.querySelector('[data-herausforderung-action="add-approach"]').disabled = approaches.length >= MAX_HERAUSFORDERUNG_APPROACHES;
}

function skillSummary(approach) {
  return (approach.preferredSkills || []).map(id => SKILL_DEFINITIONS.find(skill => skill.id === id)).filter(Boolean).map(skill => `<span class="skill-summary-item">${renderSkillIcon(skill)}${escapeMarkup(skill.label)}</span>`).join('') || 'Fertigkeiten wählen';
}

function preferredSkillHints(approach) {
  const skills = (approach.preferredSkills || []).map(id => SKILL_DEFINITIONS.find(skill => skill.id === id)).filter(Boolean);
  return skills.length ? `<span class="skill-icon-list" aria-label="Passende Fertigkeiten">${skills.map(skill => renderSkillHint(skill, `${describeSkillChoice(skill, { preferred: true, modifier: HERAUSFORDERUNG_PREFERRED_MODIFIER })} Andere Fertigkeiten bleiben mit ${HERAUSFORDERUNG_ALTERNATIVE_MODIFIER} möglich.`)).join('')}</span>` : '<small>Fertigkeiten wählen</small>';
}

export function updateHerausforderungDraft(event, { actors = [] } = {}) {
  const root = dialogRoot();
  if (!root) return;
  refreshChallengeSceneImageEditor(root);
  bindSkillIconTooltips(root.ownerDocument).hide();
  event.approaches.forEach((approach, index) => {
    const row = root.querySelector(`[data-herausforderung-approach-row][data-approach-index="${index}"]`);
    if (!row) return;
    row.querySelector('[data-approach-summary-label]').textContent = approach.label || `Ansatz ${index + 1}`;
    row.querySelector('[data-approach-summary-skills]').innerHTML = skillSummary(approach);
    row.querySelector('[data-approach-summary-difficulty]').textContent = `SG ${approach.difficulty || '…'}`;
    row.querySelectorAll('[data-herausforderung-action="set-difficulty"]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.value) === Number(approach.difficulty))));
  });
  root.querySelector('[data-herausforderung-preview]').innerHTML = renderHerausforderungComment({ herausforderung: event }, 0, { preview: true, actors });
  const issues = getHerausforderungValidationIssues(event);
  if (!issues.some(issue => issue.field === 'audience')) root.querySelector('[data-ha-field="mode"]')?.removeAttribute('aria-invalid');
  if (!issues.length) root.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  setHerausforderungStatus(issues.length ? 'Situation, passende Fertigkeiten und Erkenntnisse vorbereiten.' : 'Bereit zur Veröffentlichung. Verdeckte Ergebnisse werden erst nach der Probe angezeigt.');
}

export function showHerausforderungValidation(issues) {
  const root = dialogRoot();
  root?.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  issues.forEach(issue => {
    const index = issue.index === undefined ? '' : `[data-herausforderung-approach-index="${issue.index}"]`;
    const field = (issue.field === 'audience' ? root?.querySelector('[data-ha-field="mode"]') : null) || root?.querySelector(`[data-herausforderung-field="${issue.field}"]${index}`) || root?.querySelector(`[data-hr-approach-index="${issue.index}"] [data-hr-section="${issue.field}"]`);
    field?.setAttribute('aria-invalid', 'true');
    field?.closest('[data-herausforderung-approach-row]')?.setAttribute('open', '');
    if (field?.matches('[data-hr-section]')) { field.open = true; field.closest('[data-hr-editor]').open = true; }
  });
  const first = issues[0];
  if (first) {
    const index = first.index === undefined ? '' : `[data-herausforderung-approach-index="${first.index}"]`;
    const target = (first.field === 'audience' ? root?.querySelector('[data-ha-field="mode"]') : null) || root?.querySelector(`[data-herausforderung-field="${first.field}"]${index}`) || root?.querySelector(`[data-hr-approach-index="${first.index}"] [data-hr-section="${first.field}"] input`);
    target?.focus();
  }
}

export function setHerausforderungStatus(message = '', type = 'info') {
  const output = dialogRoot()?.querySelector('[data-herausforderung-status]');
  if (output) { output.dataset.status = type; output.textContent = message; }
}

export function setHerausforderungSubmitting(submitting) {
  const root = dialogRoot();
  if (!root) return;
  root.setAttribute('aria-busy', String(!!submitting));
  root.querySelectorAll('button, input, textarea, select').forEach(element => {
    if (submitting) { element.dataset.previousDisabled = String(!!element.disabled); element.disabled = true; }
    else if (element.dataset.previousDisabled !== undefined) { element.disabled = element.dataset.previousDisabled === 'true'; delete element.dataset.previousDisabled; }
  });
  root.querySelector('[data-herausforderung-submit-label]').textContent = submitting ? 'Wird veröffentlicht …' : 'Veröffentlichen';
}

export function renderHerausforderungComment(comment = {}, index = 0, { preview = false, progress = new Map(), encounter = null, actors = [] } = {}) {
  const event = normalizeHerausforderungEvent(comment.herausforderung || comment);
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  let solvedCount = 0;
  const unavailable = !preview && getChallengeCombatBindingError(event, encounter);
  const audienceLabel = event.audience.mode === 'all' ? 'Alle Szenenteilnehmer' : event.audience.mode === 'combatants' ? 'Nur aktive Kampfteilnehmer' : `Für: ${event.audience.actorIds.map(id => actors.find(actor => actor.id === id)?.name || id).join(', ')}`;
  const approaches = event.approaches.map((approach, approachIndex) => {
    const state = getApproachProgress(progress, comment.id, approach.approachId);
    const closed = approach.attemptLimit && state.attempts >= approach.attemptLimit;
    if (state.solved) solvedCount++;
    return `<li class="${state.solved ? 'is-solved' : ''}"><div class="herausforderung-path"><span class="herausforderung-path-number">${approachIndex + 1}</span><div><strong>${escapeMarkup(approach.label)}</strong><div class="herausforderung-path-skills">${preferredSkillHints(approach)}${state.attempts ? `<small>${state.attempts} ${state.attempts === 1 ? 'Versuch' : 'Versuche'}</small>` : ''}</div></div></div>${preview ? '<span class="herausforderung-preview-badge">Offen</span>' : closed && !state.solved ? '<span class="herausforderung-solved">Versuch abgeschlossen</span>' : state.solved ? `<span class="herausforderung-solved">${icon('insight')}Aufgedeckt</span>` : unavailable ? `<span class="herausforderung-solved">${escapeMarkup(unavailable)}</span>` : `<button type="button" class="herausforderung-button herausforderung-attempt-btn" data-herausforderung-action="attempt" data-comment-id="${escapeMarkup(comment.id || '')}" data-approach-id="${escapeMarkup(approach.approachId)}" aria-label="${escapeMarkup(approach.label)} versuchen">${icon('attempt')}<span>Versuchen</span></button>`}${rewardSummary(approach.rewards) ? `<div class="herausforderung-reward-teaser">Belohnung: ${escapeMarkup(rewardSummary(approach.rewards))}</div>` : ''}${!preview && state.attempts ? `<div class="herausforderung-result" data-tier="${escapeMarkup(state.tier)}"><small>${escapeMarkup(state.actorName)} · ${escapeMarkup(state.label || HERAUSFORDERUNG_TIER_LABELS[state.tier] || 'Versuch')}</small>${state.revealedText ? `<p>${escapeMarkup(state.revealedText)}</p>` : ''}${rewardReceiptSummary(state.reward) ? `<p class="herausforderung-reward-receipt">${escapeMarkup(rewardReceiptSummary(state.reward))}</p>` : ''}${!state.solved && !closed ? '<small>Dieser Ansatz bleibt offen.</small>' : ''}</div>` : ''}</li>`;
  }).join('');
  return `${divider}<section class="herausforderung-event"><header>${icon('challenge')}<div><small>Herausforderung</small><strong>${escapeMarkup(event.title)}</strong></div><span class="herausforderung-event-progress">${solvedCount}/${event.approaches.length} aufgedeckt</span></header><p class="herausforderung-scope">${escapeMarkup(audienceLabel)}${event.combatBound ? " · An diesen Kampf gebunden" : ""}</p>${renderChallengeSceneImage(event.sceneImage, event.title)}${event.publicDescription ? `<p class="herausforderung-description">${escapeMarkup(event.publicDescription)}</p>` : ''}${event.approaches.some(approach => approach.outcomeTable?.length) ? '<p class="herausforderung-outcome-note">Eine Probe, eine Ergebnisstufe. Wähle eine der passenden Fertigkeiten.</p>' : ''}${approaches ? `<ul class="herausforderung-approach-list">${approaches}</ul>` : ''}</section>`;
}

export const herausforderungUiInternals = Object.freeze({ escapeMarkup });
