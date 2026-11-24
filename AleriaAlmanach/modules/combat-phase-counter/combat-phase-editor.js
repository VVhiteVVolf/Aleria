import { sceneElementEscape as escape } from '../scene-elements/scene-element-markup.js';
import { COMBAT_STATUS_PRESETS } from '../combat-status/combat-status-catalog.js';
import { MAX_COMBAT_PHASE, PHASE_CONDITION_DURATIONS } from './combat-phase-model.js';
import { PHASE_COUNTER_ICON, renderPhaseDiamond } from './combat-phase-view.js';

const presets = COMBAT_STATUS_PRESETS.filter(preset => !preset.sceneMinutes);
const option = (value, label, current) => `<option value="${escape(value)}"${value === current ? ' selected' : ''}>${escape(label)}</option>`;

export function createCombatPhaseDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'combat-phase-counter-overlay';
  dialog.className = 'scene-time-event-overlay combat-phase-overlay';
  dialog.setAttribute('aria-hidden', 'true');
  dialog.setAttribute('aria-labelledby', 'combat-phase-counter-title');
  dialog.innerHTML = `<section class="combat-phase-dialog">
    <header><img src="${PHASE_COUNTER_ICON}" alt=""><div><small data-combat-phase-encounter></small><h2 id="combat-phase-counter-title">Phasenzähler</h2></div>
    <button type="button" aria-label="Schließen" data-combat-phase-action="close">×</button></header>
    <div data-combat-phase-content class="combat-phase-content"></div>
    <footer class="combat-phase-footer"><p role="status" aria-live="polite" data-combat-phase-status></p><div data-combat-phase-buttons></div></footer>
  </section>`;
  document.body.append(dialog);
  return dialog;
}

export function renderCombatPhaseEditor(dialog, editor, { pending, selectedPhase, busy, stale }) {
  const closed = editor.sessionEnded || editor.stopped;
  dialog.querySelector('[data-combat-phase-encounter]').textContent = editor.sceneTitle || 'Interaktive Szene';
  dialog.querySelector('[data-combat-phase-content]').innerHTML = `
    <div class="combat-phase-current">
      ${renderPhaseDiamond(editor.phase || pending.firstPhase)}
      <div><strong>${editor.phase ? `Phase ${editor.phase} von ${editor.settings.lastPhase}` : 'Vor dem Start'}</strong>
        <p>${editor.sessionEnded ? 'Die Sitzung ist beendet.' : editor.stopped ? 'Der Zähler ist beendet.' : editor.phase === editor.settings.lastPhase ? 'Letzte Phase erreicht.'
          : editor.phase ? 'Der Zähler wechselt nur auf Knopfdruck.' : 'Der erste Eintrag erscheint beim Starten in der Szene.'}</p>
      </div>
    </div>
    ${closed ? '' : `<fieldset class="combat-phase-settings"${busy || stale ? ' disabled' : ''}>
      <legend>Phasenregeln</legend>
      <div class="combat-phase-range">
        <label><span>Erste Phase</span><input type="number" min="1" max="${MAX_COMBAT_PHASE}" step="1" data-phase-field="firstPhase" value="${escape(pending.firstPhase)}"${editor.phase ? ' readonly' : ''}></label>
        <label><span>Letzte Phase</span><input type="number" min="${Math.max(1, editor.phase)}" max="${MAX_COMBAT_PHASE}" step="1" data-phase-field="lastPhase" value="${escape(pending.lastPhase)}"></label>
      </div>
      <label class="combat-phase-setting"><input type="checkbox" data-phase-field="renewActions"${pending.renewActions ? ' checked' : ''}>
        <span><strong>Aktionsökonomie pro Phase</strong><small>Aktion, Bonusaktion und Reaktion erneuern sich beim Phasenwechsel. Bis dahin teilen sich die Beiträge jeder Figur ihren Vorrat.</small></span></label>
      <label class="combat-phase-setting"><input type="checkbox" data-phase-field="phaseConditions"${pending.phaseConditions ? ' checked' : ''}>
        <span><strong>Zustände pro Phase</strong><small>Beitragsdauern und regelmäßiger Zustandsschaden rücken beim Phasenwechsel weiter.</small></span></label>
    </fieldset>
    <fieldset class="combat-phase-preparation" data-phase-preparation${busy || stale ? ' disabled' : ''}>
      <legend>Kommende Phasen vorbereiten</legend>
      ${renderPhasePreparation(editor, pending, selectedPhase)}
    </fieldset>`}
  `;
}

function renderPhaseCondition(prepared, participants, index, phaseConditions) {
  const knownActor = participants.some(actor => actor.actorId === prepared.actorId);
  const actorOptions = participants.map(actor => option(actor.actorId, actor.name, prepared.actorId)).join('');
  const actorFallback = prepared.actorId && !knownActor ? option(prepared.actorId, 'Nicht mehr am Kampf beteiligt', prepared.actorId) : '';
  const durationLabel = phaseConditions ? 'Phasenwechsel' : 'Eigene Beiträge';
  return `<div class="combat-phase-condition" data-phase-condition>
    <label><span>Figur</span><select data-phase-condition-field="actorId"><option value="">Wählen …</option>${actorFallback}${actorOptions}</select></label>
    <label><span>Zustand</span><select data-phase-condition-field="presetId"><option value="">Wählen …</option>${presets.map(preset => option(preset.id, preset.name, prepared.presetId)).join('')}</select></label>
    <label><span>Dauer</span><select data-phase-condition-field="durationKind">${Object.entries(PHASE_CONDITION_DURATIONS).map(([id, label]) => option(id, id === 'actor-comments' ? durationLabel : label, prepared.durationKind)).join('')}</select></label>
    <label data-phase-duration-amount${prepared.durationKind === 'actor-comments' ? '' : ' hidden'}><span>Anzahl</span><input type="number" min="1" max="999" step="1" data-phase-condition-field="durationAmount" value="${escape(prepared.durationAmount || 1)}"></label>
    <button type="button" data-combat-phase-action="remove-condition" data-phase-index="${index}" aria-label="Zustand ${index + 1} entfernen">×</button>
  </div>`;
}

export function renderPhasePreparation(editor, pending, selectedPhase) {
  const number = Number(pending.lastPhase);
  const first = editor.phase ? editor.phase + 1 : Math.max(1, pending.firstPhase);
  const count = Number.isInteger(number) && Number.isInteger(first) && number <= MAX_COMBAT_PHASE ? Math.max(0, number - first + 1) : 0;
  if (!count) return '<p>Es ist keine weitere Phase eingestellt.</p>';
  const phase = selectedPhase >= first && selectedPhase <= number ? selectedPhase : first;
  const step = pending.steps.find(item => item.phase === phase);
  const options = Array.from({ length: count }, (_, index) => {
    const number = first + index;
    const prepared = pending.steps.some(item => item.phase === number) || editor.challenges.some(challenge => challenge.phase === number && challenge.state === 'armed');
    return option(number, `Phase ${number}${prepared ? ' · vorbereitet' : ''}`, phase);
  }).join('');
  const challenges = editor.challenges.filter(challenge => challenge.phase === phase && ['armed', 'disabled'].includes(challenge.state));
  return `<label><span>Eintrag für</span><select data-phase-select>${options}</select></label>
    <label><span>Text in der Szene</span><textarea rows="2" maxlength="1600" data-phase-flavor placeholder="Der Boden unter Gawains Füßen sieht matschig und rutschig aus.">${escape(step?.flavor || '')}</textarea></label>
    ${(step?.conditions || []).map((condition, index) => renderPhaseCondition(condition, editor.participants, index, pending.phaseConditions)).join('')}
    <button type="button" data-combat-phase-action="add-condition"${!editor.participants.length || (step?.conditions.length || 0) >= 8 ? ' disabled' : ''}>＋ Zustand bei dieser Phase</button>
    <div class="combat-phase-challenges">
      ${challenges.map(challenge => `<div><span>${escape(challenge.title)} · ${challenge.state === 'armed' ? 'verborgen' : 'deaktiviert'}</span>
        <button type="button" data-combat-phase-action="edit-challenge" data-phase-challenge-id="${escape(challenge.id)}">Bearbeiten</button></div>`).join('')}
      <button type="button" data-combat-phase-action="add-challenge">＋ Verborgene Herausforderung</button>
      <button type="button" data-combat-phase-action="add-trap">＋ Verborgene Falle</button>
    </div>`;
}

export function renderPhaseEditorButtons(editor, { busy, stale, pending }) {
  if (editor.sessionEnded || editor.stopped) return '<button type="button" data-combat-phase-action="close">Zur Szene</button>';
  if (stale) return '<button type="button" data-combat-phase-action="reload">Aktuellen Stand laden</button>';
  const disabled = busy ? ' disabled' : '';
  const next = editor.phase ? editor.phase + 1 : pending.firstPhase;
  return `${editor.phase ? `<button type="button" data-combat-phase-action="stop"${disabled}>Zähler beenden</button>` : ''}
    <button type="button" data-combat-phase-action="configure"${disabled}>${editor.phase ? 'Einstellungen speichern' : 'Vorbereitung speichern'}</button>
    ${next <= pending.lastPhase ? `<button type="button" class="combat-phase-primary" data-combat-phase-action="${editor.phase ? 'advance' : 'start'}"${disabled}>
      ${editor.phase ? `Auf Phase ${next} schalten` : `Mit Phase ${escape(next)} starten`}</button>` : ''}`;
}
