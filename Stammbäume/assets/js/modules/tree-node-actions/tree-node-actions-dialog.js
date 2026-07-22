import { escapeHtml } from '../../ui/dom.js';
import { houseContinuationActions, primaryNodeActions } from './tree-node-actions-model.js';

function actionCard(action) {
  return `
    <button class="relation-action-card" type="button" data-action="tree-node-action" data-node-action="${escapeHtml(action.id)}">
      <span class="relation-action-glyph" aria-hidden="true">${escapeHtml(action.glyph)}</span>
      <span class="relation-action-text"><strong>${escapeHtml(action.label)}</strong><small>${escapeHtml(action.hint)}</small></span>
    </button>
  `;
}

export function createTreeNodeActionsDialog(documentRef = document) {
  const dialog = documentRef.getElementById('tree-node-actions-dialog');
  const title = documentRef.getElementById('tree-node-actions-title');
  const eyebrow = documentRef.getElementById('tree-node-actions-eyebrow');
  const menu = documentRef.getElementById('tree-node-actions-menu');
  let context = null;

  function render(actions, heading, kicker) {
    title.textContent = heading;
    eyebrow.textContent = kicker;
    menu.innerHTML = actions.map(actionCard).join('');
  }

  function open(nextContext, family) {
    context = { ...nextContext };
    const kind = context.kind;
    render(
      primaryNodeActions(kind),
      context.label || (kind === 'house-crest' ? 'Hausknoten' : 'Zeitsprung'),
      kind === 'house-crest' ? 'Was möchtest du an diesem Haus tun?' : 'Was möchtest du an diesem Zeitsprung tun?'
    );
    context.familyId = family.document.id;
    if (!dialog.open) dialog.showModal();
  }

  function showHouseContinuation(family) {
    if (context?.kind !== 'house-crest') return false;
    render(
      houseContinuationActions(family, context.partnershipId),
      context.label || 'Linie fortsetzen',
      'Wie soll die nächste Generation beginnen?'
    );
    return true;
  }

  function showPrimary() {
    if (!context) return;
    render(
      primaryNodeActions(context.kind),
      context.label || (context.kind === 'house-crest' ? 'Hausknoten' : 'Zeitsprung'),
      context.kind === 'house-crest' ? 'Was möchtest du an diesem Haus tun?' : 'Was möchtest du an diesem Zeitsprung tun?'
    );
  }

  return Object.freeze({
    dialog,
    open,
    showHouseContinuation,
    showPrimary,
    getContext: () => context ? { ...context } : null,
    close: () => {
      context = null;
      if (dialog.open) dialog.close();
    }
  });
}
