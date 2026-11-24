import { deriveCombatStateFromComments } from '../combat/combat-state-model.js';
import { escapeCombatMarkup as e, renderCombatStatusChips } from '../combat-status/combat-status-view.js';

const lastMarkup = new WeakMap();

export function renderCommentStatusStrip(actorId) {
  const id = String(actorId || '').trim();
  return id ? `<footer class="comment-combat-status-strip" data-comment-condition-strip="${e(id)}" hidden></footer>` : '';
}

export function refreshCommentStatusStrips(root, comments = []) {
  const strips = root.querySelectorAll('[data-comment-condition-strip]');
  if (!strips.length) return;
  const state = deriveCombatStateFromComments(comments);
  const byActor = new Map();
  const seenByContribution = new Map();
  for (const strip of Array.from(strips).reverse()) {
    const id = strip.dataset.commentConditionStrip;
    if (!byActor.has(id)) {
      const conditions = state.get(id)?.temporaryConditions || [];
      byActor.set(id, renderCombatStatusChips(conditions, 'Aktive Zustände im aktuellen Szenenstand'));
    }
    const contribution = strip.closest('.comment-unit') || strip;
    const seen = seenByContribution.get(contribution) || new Set();
    const markup = seen.has(id) ? '' : byActor.get(id);
    seen.add(id);
    seenByContribution.set(contribution, seen);
    if (lastMarkup.get(strip) === markup) continue;
    strip.innerHTML = markup;
    strip.hidden = !markup;
    lastMarkup.set(strip, markup);
  }
}
