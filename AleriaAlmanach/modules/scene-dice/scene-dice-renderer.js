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
  const actor = roll.roller || 'Die Szene';
  const natural = Number(roll.natural);
  const rolledValue = Number.isFinite(natural) && natural > 0 ? natural : Number(roll.total) || 0;
  const totalDiffers = rolledValue !== Number(roll.total);
  return `${divider}
    <article class="scene-dice-event${roll.critical ? ` is-${escapeHtml(roll.critical)}` : ''}" data-comment-id="${commentId}">
      <div class="scene-dice-event-mark"><img src="${escapeHtml(getSceneDiceIcon(roll.natural ? 20 : (roll.terms?.find(term => term.kind === 'dice')?.sides || 20)))}" alt=""></div>
      <div class="scene-dice-event-copy">
        <div class="scene-dice-event-kicker">Erzählerischer Szenenwurf · ${escapeHtml(modeLabel)}</div>
        <div class="scene-dice-event-head"><mark class="scene-dice-event-actor">${escapeHtml(actor)}</mark><span>würfelt${roll.purpose ? ` auf <strong>${escapeHtml(roll.purpose)}</strong>` : ''}.</span></div>
        <div class="scene-dice-event-outcome">Würfelt eine <strong>${escapeHtml(rolledValue)}</strong>${totalDiffers ? ` <small>Gesamt ${escapeHtml(roll.total)}</small>` : ''}.</div>
        ${roll.situation ? `<div class="scene-dice-event-context">${escapeHtml(roll.situation)}</div>` : ''}
        ${roll.narration ? `<p class="scene-dice-event-narration">${escapeHtml(roll.narration)}</p>` : ''}
        <div class="scene-dice-event-breakdown">${renderSceneDiceStoredTerms(roll)}</div>
        <div class="scene-dice-event-formula">${escapeHtml(roll.formula || '')}</div>
      </div>
      <div class="scene-dice-event-total"><span>Ergebnis</span><strong>${escapeHtml(roll.total)}</strong>${roll.special ? `<small>${escapeHtml(roll.special)}</small>` : ''}</div>
      <button type="button" class="scene-dice-event-delete" data-action="open-delete-confirm" data-comment-id="${commentId}" title="Wurf löschen" aria-label="Wurf löschen">×</button>
    </article>`;
}
