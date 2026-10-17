import { renderCombatEvaluation } from '../combat/ui/combat-ui.js';
import { renderEvaluationSaveRecords } from '../combat/ui/combat-evaluation-rolls.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderChallengeManeuverReceipts(results = []) {
  return results.filter(result => result.type === 'weapon-maneuver').map(result => `<section class="herausforderung-maneuver-receipt">
    <h4>Waffenmanöver · ${escape(result.actorName || 'Serverauswertung')}</h4>
    ${result.save ? `<p>${escape(result.save.actorName)} · Rettung vor dem Gegenangriff</p>${renderEvaluationSaveRecords({ secondarySaves: [{ ...result.save, timing: 'before-maneuver' }] })}` : ''}
    ${result.pickup ? `<p>${escape(result.pickup.sceneItemEvent?.text || 'Die eigene Waffe wurde aufgehoben.')} ${result.cost ? `Kosten: 1 ${escape(result.cost.name)} für Aufnahme und Angriff zusammen.` : ''}</p>` : ''}
    ${result.skipped ? `<p>${escape(result.skipped)}</p>` : ''}
    ${result.resolution ? renderCombatEvaluation({ resolution: result.resolution }) : ''}
  </section>`).join('');
}
