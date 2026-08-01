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
  const narrationModeLabel = window.AleriaSceneDiceNarration?.getMode?.(roll.narrationMode)?.label
    || (roll.narrationMode === 'standard' ? 'Standard' : roll.narrationMode === 'character' ? 'Charakterfokus' : roll.narrationMode === 'dramatic' ? 'Dramatisch' : 'Immersiv');
  const actor = roll.roller || 'Die Szene';
  const natural = Number(roll.natural);
  const rolledValue = Number.isFinite(natural) && natural > 0 ? natural : Number(roll.total) || 0;
  const primarySides = Number(roll.terms?.find(term => term.kind === 'dice')?.sides) || 20;
  const resultLabel = Number.isFinite(natural) && natural > 0 ? `W${primarySides} · ${rolledValue}` : `Gesamt · ${rolledValue}`;
  const icon = getSceneDiceIcon(primarySides);
  return `${divider}
    <article class="scene-dice-event${roll.critical ? ` is-${escapeHtml(roll.critical)}` : ''}" data-comment-id="${commentId}" data-narration-mode="${escapeHtml(roll.narrationMode || 'immersive')}">
      <div class="scene-dice-event-copy">
        <div class="scene-dice-event-kicker">
          <span class="scene-dice-event-narrator"><img src="${escapeHtml(icon)}" alt=""><b>Erzähler</b></span>
          <span class="scene-dice-event-result-badge"><strong>${escapeHtml(resultLabel)}</strong><small>${escapeHtml(narrationModeLabel)} · ${escapeHtml(modeLabel)}</small></span>
        </div>
        <div class="scene-dice-event-head"><mark class="scene-dice-event-actor">${escapeHtml(actor)}</mark><span>würfelt${roll.purpose ? ` auf <strong>${escapeHtml(roll.purpose)}</strong>` : ''}.</span></div>
        ${roll.narration ? `<p class="scene-dice-event-narration">${escapeHtml(roll.narration)}</p>` : ''}
        ${roll.situation ? `<div class="scene-dice-event-context">${escapeHtml(roll.situation)}</div>` : ''}
        <div class="scene-dice-event-breakdown">${renderSceneDiceStoredTerms(roll)}</div>
        <div class="scene-dice-event-formula">${escapeHtml(roll.formula || '')}</div>
      </div>
      ${roll.special ? `<div class="scene-dice-event-special">${escapeHtml(roll.special)}</div>` : ''}
      <button type="button" class="scene-dice-event-delete" data-action="open-delete-confirm" data-comment-id="${commentId}" title="Wurf löschen" aria-label="Wurf löschen">×</button>
    </article>`;
}
