import { escapeCombatMarkup as e, renderCombatCondition } from '../combat-status/combat-status-view.js?v=20260906-effect-rolls-v1';
import { getCombatConditionGroups } from '../combat-status/combat-status-model.js?v=20260906-effect-rolls-v1';
import { openCombatStatusDialog } from '../combat-status/combat-status-controller.js?v=20260928-equipment-art-v4';
import { ESCAPE_METHODS, getHeldCondition } from '../combat/combat-creature-actions.js';

// One local instance per composer; closed drawers never resolve character profiles.
const instances = new Map();
let refreshQueued = false;

export function getCommentConditionActorIds({ segments = [], selectedCharacterId = '' } = {}) {
  return [...new Set(segments.map(segment => String(segment.sceneActorId || segment.actorId || segment.characterId || selectedCharacterId || '')).filter(Boolean))];
}

function renderEscapeControls(condition, preview) {
  const roll = preview?.result;
  const choices = Object.entries(ESCAPE_METHODS).map(([method, label]) =>
    `<button type="button" data-action="roll-creature-escape" data-escape-method="${e(method)}"${preview?.pending || roll ? ' disabled' : ''}>${e(label)}</button>`).join('');
  const result = roll ? `${ESCAPE_METHODS[roll.method]} ${roll.roll.total} gegen SG ${roll.dc} · ${roll.succeeded ? 'gelungen' : 'misslungen'}. Der Versuch wird mit dem Beitrag gespeichert.`
    : preview?.error || (preview?.pending ? 'Würfelt …' : `SG ${condition.restraint.dc}${condition.restraint.attempted ? '' : ' · erster Versuch mit Nachteil'}. Beim Eintragen wird automatisch GES gewürfelt.`);
  return `<details class="comment-condition-escape" data-condition-escape><summary>Festgehalten · Befreiung</summary><div>${choices}</div><small role="status">${e(result)}</small></details>`;
}

export function renderCommentActorConditions(profile, { actorId, threadId, canManage = true, escape = null } = {}) {
  const groups = getCombatConditionGroups(profile);
  const conditions = [...groups.temporary.map(condition => renderCombatCondition(condition, { temporary: true,
    removable: canManage && !condition.encounterAura && !condition.restraint,
    controls: canManage && condition.restraint?.dc > 0 ? renderEscapeControls(condition, escape?.conditionId === condition.id ? escape : null) : '' })),
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
    .map(details => `${details.closest('[data-condition-actor]').dataset.conditionActor}:${details.closest('li').dataset.conditionId}:${details.hasAttribute('data-condition-escape')}`));
  content.innerHTML = getCommentConditionActorIds(context).map(actorId => {
    const profile = resolveProfile(actorId);
    return profile ? renderCommentActorConditions(profile, { actorId, threadId: context.threadId, canManage: !context.edit, escape: instance.escape.get(actorId) })
      : `<p>Kampfprofil für ${e(actorId)} noch nicht verfügbar.</p>`;
  }).join('') || '<p>Wähle eine Figur für deinen Beitrag.</p>';
  content.querySelectorAll('[data-condition-actor] .comment-combat-condition details').forEach(details => {
    details.open = openSources.has(`${details.closest('[data-condition-actor]').dataset.conditionActor}:${details.closest('li').dataset.conditionId}:${details.hasAttribute('data-condition-escape')}`);
  });
}

function previewEscape(instance, actorId, conditionId, method) {
  if (instance.context.edit || !instance.rollEscape) return;
  const profile = instance.resolveProfile(actorId);
  if (getHeldCondition(profile || {})?.id !== conditionId) return;
  const previous = instance.escape.get(actorId);
  if (previous?.conditionId === conditionId && (previous.pending || previous.result)) return;
  const preview = { conditionId, pending: true };
  instance.escape.set(actorId, preview);
  render(instance);
  preview.promise = Promise.resolve().then(() => instance.rollEscape(profile, method)).then(result => {
    preview.result = result;
  }).catch(error => {
    preview.error = error.message || 'Die Probe konnte nicht gewürfelt werden.';
  }).finally(() => { preview.pending = false; render(instance); });
}

export async function getCommentCreatureEscapePreviews(list) {
  const values = [...(instances.get(list)?.escape || [])];
  await Promise.all(values.map(([, entry]) => entry.promise));
  return new Map(values.filter(([, entry]) => entry.result).map(([actorId, entry]) => [actorId, entry.result]));
}

export function mountCommentConditionTracker(context, resolveProfile, rollEscape) {
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
    instance = { root, context, resolveProfile, escape: new Map() };
    instances.set(list, instance);
    root.addEventListener('toggle', () => render(instance));
    root.addEventListener('click', event => {
      const trigger = event.target.closest?.('[data-action]');
      const actor = trigger?.closest('[data-condition-actor]');
      if (actor && trigger.dataset.action === 'roll-creature-escape') {
        previewEscape(instance, actor.dataset.conditionActor, trigger.closest('[data-condition-id]')?.dataset.conditionId, trigger.dataset.escapeMethod);
        return;
      }
      const operation = { 'add-comment-combat-condition': 'add', 'remove-comment-combat-condition': 'remove' }[trigger?.dataset.action];
      if (!actor || !operation) return;
      openCombatStatusDialog({ actorId: actor.dataset.conditionActor, characterId: actor.dataset.conditionRecord, threadId: actor.dataset.conditionThread },
        { operation, conditionId: trigger.dataset.conditionId, trigger });
    });
  }
  if (instance.context.threadId !== context.threadId) { instance.root.open = false; instance.escape.clear(); }
  instance.context = { ...context, edit: context.edit || list.id === 'ec-segment-list' };
  instance.resolveProfile = resolveProfile;
  instance.rollEscape = rollEscape;
  instance.root.hidden = !context.threadId || (globalThis.getCurrentCommentThread?.()?.kind || 'session') !== 'session';
  const actorIds = getCommentConditionActorIds(context);
  const held = !instance.root.hidden && !instance.context.edit && actorIds.some(actorId => getHeldCondition(resolveProfile(actorId) || {}));
  if (held && !instance.held) instance.root.open = true;
  instance.held = held;
  instance.root.querySelector('[data-condition-tracker-count]').textContent = `· ${actorIds.length} ${actorIds.length === 1 ? 'Figur' : 'Figuren'}${held ? ' · Festgehalten' : ''}`;
  render(instance);
}

export function releaseCommentConditionTracker(list) {
  instances.get(list)?.root.remove();
  instances.delete(list);
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
