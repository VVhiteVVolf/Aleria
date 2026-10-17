import { rewardReceiptSummary } from './herausforderung-rewards-ui.js?v=20261015-check-options-v1';
import { HERAUSFORDERUNG_TIER_LABELS } from './herausforderung-progress.js?v=20261015-graded-challenges-v1';
import { getChallengeNarration } from './herausforderung-narration.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderChallengeProgressResult(state = {}, { closed = false } = {}) {
  if (!state.attempts) return '';
  const receipt = rewardReceiptSummary(state.reward);
  const narrative = state.narrativeText || getChallengeNarration(state);
  return `<div class="herausforderung-result" data-tier="${escape(state.tier)}">
    <small>${escape(state.actorName)} · ${escape(state.label || HERAUSFORDERUNG_TIER_LABELS[state.tier] || 'Versuch')}</small>
    <p>${escape(narrative)}</p>
    ${receipt ? `<details class="herausforderung-result-mechanics"><summary>Auswirkungen ansehen</summary><p class="herausforderung-reward-receipt">${escape(receipt)}</p></details>` : ''}
    ${!state.solved && !closed ? '<small>Dieser Ansatz bleibt offen.</small>' : ''}
  </div>`;
}
