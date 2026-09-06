import { renderMiniCombatProfile } from '../combat-status/combat-profile-summary-view.js?v=20260906-effect-rolls-v1';
import { openCombatStatusDialog } from '../combat-status/combat-status-controller.js?v=20260906-effect-rolls-v1';
import { resolveCombatProfile } from '../combat/combat-profile-resolver.js?v=20260906-effect-rolls-v1';
import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js?v=20260906-effect-rolls-v1';

let character = null;
let queued = false;

function context() {
  const thread = globalThis.getCurrentCommentThread?.();
  return { characterId: character?.id || '', actorId: character?.id || '',
    threadId: thread?.kind === 'session' ? String(thread.threadId || '') : '' };
}

function refresh() {
  const root = document.querySelector('[data-character-combat-status]');
  if (!root || !character) return;
  const options = context();
  const profile = options.threadId && globalThis.AleriaCombat?.getProfile?.(character.id, options)
    || resolveCombatProfile(character);
  const history = globalThis.getCachedCommentsForThread?.(options.threadId) || [];
  root.innerHTML = `${renderMiniCombatProfile(profile, character.name, {
    canManage: !!options.threadId && !!character.id, encounter: getActiveCombatEncounter(history),
    contextLabel: options.threadId ? 'Aktueller Szenenstand' : 'Gespeicherter Bogen · Szenenzustände erscheinen beim Öffnen einer Szene'
  })}<p class="cp-combat-status-note">Die folgenden Eingabefelder bearbeiten die Grundwerte des Bogens. Temporäre Szeneneffekte werden oben verfolgt und über „Hinzufügen“ verwaltet.</p>`;
}

export function mountCharacterCombatStatus(record) {
  character = record;
  refresh();
}

function scheduleRefresh() {
  if (queued || !document.querySelector('[data-character-combat-status]')) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    const latest = globalThis.AleriaCharacters?.getAll?.()?.find(record => record.id === character?.id);
    if (latest) character = latest;
    refresh();
  });
}

document.addEventListener('click', event => {
  const trigger = event.target.closest?.('[data-character-combat-status] [data-action]');
  if (!trigger) return;
  const operations = { 'add-comment-combat-condition': 'add', 'remove-comment-combat-condition': 'remove', 'reset-comment-combat-profile': 'reset' };
  const operation = operations[trigger.dataset.action];
  if (operation && context().threadId) openCombatStatusDialog(context(), { operation, conditionId: trigger.dataset.conditionId, trigger });
});
['aleria:comments-updated', 'aleria:combat-profile-committed', 'aleria:characters-changed'].forEach(name => document.addEventListener(name, scheduleRefresh));
