import { escapeEncounterMarkup as escape } from './combat-encounter-summary-ui.js';

export function renderCombatEncounterStartApplications(event = {}) {
  if (!['start', 'add'].includes(event.operation) || !event.startApplications?.length) return '';
  const participants = new Map((event.participants || []).map(participant => [participant.actorId, participant.name]));
  return `<ul class="combat-encounter-start-effects" aria-label="Verbuchte Wirkungen zu Kampfbeginn">${event.startApplications.map(application => `<li><strong>${escape(participants.get(application.actorId) || 'Figur')}</strong>: Temporäre TP zu Kampfbeginn: ${Number(application.temporaryHitPoints) || 0} (höchster Vorrat, wird nicht addiert)</li>`).join('')}</ul>`;
}
