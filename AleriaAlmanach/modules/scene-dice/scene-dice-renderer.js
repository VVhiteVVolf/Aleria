// Immersive scene-event rendering for persisted dice rolls.
function renderSceneDiceStoredTerms(roll = {}) {
  return (roll.terms || []).map(term => {
    if (term.kind === 'modifier') return `<span class="scene-dice-event-modifier">${term.value >= 0 ? '+' : ''}${escapeHtml(term.value)}</span>`;
    const values = (term.rolls || []).map((item, index) => {
      const kept = (term.keptIndexes || []).includes(index);
      return `<span class="${kept ? 'kept' : 'discarded'}">${escapeHtml(item.value)}</span>`;
    }).join('');
    return `<span class="scene-dice-event-term"><img src="${escapeHtml(getSceneDiceIcon(term.sides))}" alt=""><span>${term.sign < 0 ? '−' : ''}${escapeHtml(term.count)}W${escapeHtml(term.sides)}</span><span class="scene-dice-event-values">${values}</span></span>`;
  }).join('');
}

function renderSceneDiceEventComment(comment, idx = 0) {
  const roll = comment.sceneDiceRoll || {};
  const commentId = escapeHtml(comment.id || '');
  const divider = idx > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  const modeLabel = roll.mode === 'advantage' ? 'Vorteil' : roll.mode === 'disadvantage' ? 'Nachteil' : 'Normal';
  return `${divider}
    <article class="scene-dice-event${roll.critical ? ` is-${escapeHtml(roll.critical)}` : ''}" data-comment-id="${commentId}">
      <div class="scene-dice-event-mark"><img src="${escapeHtml(getSceneDiceIcon(roll.natural ? 20 : (roll.terms?.find(term => term.kind === 'dice')?.sides || 20)))}" alt=""></div>
      <div class="scene-dice-event-copy">
        <div class="scene-dice-event-kicker">Schicksalswurf · ${escapeHtml(modeLabel)}</div>
        <div class="scene-dice-event-head"><strong>${escapeHtml(roll.roller || comment.charName || 'Unbekannte Hand')}</strong><span>${escapeHtml(roll.formula || '')}</span></div>
        ${roll.purpose ? `<div class="scene-dice-event-purpose">${escapeHtml(roll.purpose)}</div>` : ''}
        <div class="scene-dice-event-breakdown">${renderSceneDiceStoredTerms(roll)}</div>
      </div>
      <div class="scene-dice-event-total"><span>Ergebnis</span><strong>${escapeHtml(roll.total)}</strong>${roll.special ? `<small>${escapeHtml(roll.special)}</small>` : ''}</div>
      <button type="button" class="scene-dice-event-delete" data-action="open-delete-confirm" data-comment-id="${commentId}" title="Wurf löschen" aria-label="Wurf löschen">×</button>
    </article>`;
}
