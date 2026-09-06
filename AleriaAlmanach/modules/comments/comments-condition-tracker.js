import { escapeCombatMarkup as e, renderCombatCondition } from '../combat-status/combat-status-view.js?v=20260906-effect-rolls-v1';
import { getCombatConditionGroups } from '../combat-status/combat-status-model.js?v=20260906-effect-rolls-v1';
import { openCombatStatusDialog } from '../combat-status/combat-status-controller.js?v=20260906-effect-rolls-v1';

// One local instance per composer; closed drawers never resolve character profiles.
const instances = new Map();
let refreshQueued = false;

export function getCommentConditionActorIds({ segments = [], selectedCharacterId = '' } = {}) {
  return [...new Set(segments.map(segment => String(segment.sceneActorId || segment.actorId || segment.characterId || selectedCharacterId || '')).filter(Boolean))];
}

export function renderCommentActorConditions(profile, { actorId, threadId, canManage = true } = {}) {
  const groups = getCombatConditionGroups(profile);
  const conditions = [...groups.temporary.map(condition => renderCombatCondition(condition, { temporary: true, removable: canManage && !condition.encounterAura })),
    ...groups.permanent.map(condition => renderCombatCondition(condition))];
  return `<section class="comment-condition-actor" data-condition-actor="${e(actorId)}" data-condition-record="${e(profile.persistence?.sourceCreatureId || profile.persistence?.recordId || profile.characterId || actorId)}" data-condition-thread="${e(threadId)}">
    <div class="comment-condition-actor-head"><strong>${e(profile.name || 'Figur')}</strong>${canManage ? '<button type="button" data-action="add-comment-combat-condition">+ Effekt vergeben</button>' : ''}</div>
    ${profile.concentration ? `<p>Konzentration: ${e(profile.concentration.name || profile.concentration.actionName || 'Aktiv')}</p>` : ''}
    ${profile.channeling ? `<p>Kanalisierung: ${e(profile.channeling.actionName || 'Aktiv')} · ${e(profile.channeling.progress || 0)}/${e(profile.channeling.requiredComments || 0)} Beiträge</p>` : ''}
    ${conditions.length ? `<ul class="comment-combat-conditions">${conditions.join('')}</ul>` : '<p>Keine aktiven Zustände oder Buffs.</p>'}</section>`;
}

function render(instance) {
  const { root, context, resolveProfile } = instance;
  if (!root.open || root.hidden) return;
  const content = root.querySelector('[data-condition-tracker-content]');
  const openSources = new Set([...content.querySelectorAll('[data-condition-actor] .comment-combat-condition details[open]')]
    .map(details => `${details.closest('[data-condition-actor]').dataset.conditionActor}:${details.closest('li').dataset.conditionId}`));
  content.innerHTML = getCommentConditionActorIds(context).map(actorId => {
    const profile = resolveProfile(actorId);
    return profile ? renderCommentActorConditions(profile, { actorId, threadId: context.threadId, canManage: !context.edit })
      : `<p>Kampfprofil für ${e(actorId)} noch nicht verfügbar.</p>`;
  }).join('') || '<p>Wähle eine Figur für deinen Beitrag.</p>';
  content.querySelectorAll('[data-condition-actor] .comment-combat-condition details').forEach(details => {
    details.open = openSources.has(`${details.closest('[data-condition-actor]').dataset.conditionActor}:${details.closest('li').dataset.conditionId}`);
  });
}

export function mountCommentConditionTracker(context, resolveProfile) {
  const list = context.list;
  if (!list?.closest) return;
  const shell = list.closest('.comment-form-card, .comment-edit-card') || list.parentElement;
  if (!shell) return;
  let instance = instances.get(list);
  if (!instance || !instance.root.isConnected) {
    const root = document.createElement('details');
    root.className = 'comment-condition-tracker';
    root.innerHTML = '<summary>Zustände & Buffs <span data-condition-tracker-count></span></summary><p class="comment-condition-tracker-note">Aktueller Szenenstand. Angezeigte Beitragsdauern gelten ab jetzt; der nächste passende Beitrag zählt bereits mit. Mehrere Abschnitte derselben Figur zählen nur einmal. Neue Effekte aus diesem Entwurf erscheinen nach dem Eintragen.</p><div data-condition-tracker-content></div>';
    const actions = shell.querySelector('.comment-form-actions');
    if (actions) actions.before(root); else list.after(root);
    instance = { root, context, resolveProfile };
    instances.set(list, instance);
    root.addEventListener('toggle', () => render(instance));
    root.addEventListener('click', event => {
      const trigger = event.target.closest?.('[data-action]');
      const actor = trigger?.closest('[data-condition-actor]');
      const operation = { 'add-comment-combat-condition': 'add', 'remove-comment-combat-condition': 'remove' }[trigger?.dataset.action];
      if (!actor || !operation) return;
      openCombatStatusDialog({ actorId: actor.dataset.conditionActor, characterId: actor.dataset.conditionRecord, threadId: actor.dataset.conditionThread },
        { operation, conditionId: trigger.dataset.conditionId, trigger });
    });
  }
  if (instance.context.threadId !== context.threadId) instance.root.open = false;
  instance.context = { ...context, edit: context.edit || list.id === 'ec-segment-list' };
  instance.resolveProfile = resolveProfile;
  instance.root.hidden = !context.threadId || (globalThis.getCurrentCommentThread?.()?.kind || 'session') !== 'session';
  instance.root.querySelector('[data-condition-tracker-count]').textContent = `· ${getCommentConditionActorIds(context).length} Figuren`;
  render(instance);
}

function scheduleRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    for (const [list, instance] of instances) {
      if (!list.isConnected) { instances.delete(list); continue; }
      render(instance);
    }
  });
}

if (typeof document !== 'undefined') {
  for (const name of ['aleria:comments-updated', 'aleria:combat-profile-committed', 'aleria:characters-changed']) document.addEventListener(name, scheduleRefresh);
}
