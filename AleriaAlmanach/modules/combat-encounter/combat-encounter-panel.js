import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js?v=20260906-character-vitality-v1';
import { ENCOUNTER_STATUS_LABELS } from '../combat/combat-encounter-outcome.js';
import { escapeEncounterMarkup as escape } from './combat-encounter-summary-ui.js';

export function renderEncounterActions(encounter, threadId) {
  return `<div class="combat-encounter-actions"><button type="button" data-combat-encounter-action="open" data-operation="add" data-thread-id="${escape(threadId)}" data-encounter-id="${escape(encounter.encounterId)}">Beteiligte verwalten</button><button type="button" data-combat-encounter-action="open" data-operation="end" data-thread-id="${escape(threadId)}" data-encounter-id="${escape(encounter.encounterId)}">Kampf abschließen</button></div>`;
}

// Owns only its adjacent panel. The comments renderer supplies the current host
// and complete timeline, independently of comment pagination.
export function renderActiveEncounterPanel(scroll, threadId, comments) {
  if (!scroll?.parentElement) return;
  let panel = scroll.previousElementSibling?.matches('[data-combat-encounter-panel]') ? scroll.previousElementSibling : null;
  const encounter = getActiveCombatEncounter(comments);
  if (!encounter) { panel?.remove(); return; }
  if (!panel) {
    panel = document.createElement('section');
    panel.dataset.combatEncounterPanel = '';
    panel.className = 'combat-encounter-active-panel';
    panel.setAttribute('aria-label', 'Laufender Kampf');
    scroll.before(panel);
  }
  const roster = [...encounter.participants.values()].map(participant => `${participant.name}: ${ENCOUNTER_STATUS_LABELS[participant.status] || participant.status}`).join(' · ');
  panel.innerHTML = `<div><small>Laufender Kampf</small><strong>${escape(encounter.title)}</strong><p>${escape(roster)}</p></div>${renderEncounterActions(encounter, threadId)}`;
}
