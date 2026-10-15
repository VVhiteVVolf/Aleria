import { escapeActionHtml as escape } from './combat-action-choice.js?v=20261015-scenarios-v2';
import { describeStanceConsequences } from '../combat-stance-presentation.js';
import { renderEvaluationStats } from './combat-evaluation-stats.js?v=20261015-scenarios-v2';
import { renderEvaluationEffectCards } from './combat-evaluation-effects.js';
import { renderEvaluationLedger } from './combat-evaluation-ledger.js';

export function renderCounterConsequences(resolution, { renderEffectResult = () => '', summarizeRuleEffects = () => '' } = {}) {
  const narrative = describeStanceConsequences(resolution);
  return `${narrative ? `<p class="combat-counter-consequence">${escape(narrative)}</p>` : ''}${(resolution.counterAttacks || []).filter(c => c.resolution).map(counter => {
    const result = counter.resolution;
    return `<section class="combat-evaluation-counter"><h4>Konter · ${escape(counter.stance)} · ${escape(counter.actorName)} → ${escape(counter.targetName)}</h4>${renderEvaluationStats(result)}${renderEvaluationEffectCards(result)}<details class="combat-evaluation-ledger"><summary>Konter-Belege</summary>${renderEvaluationLedger(result, { renderEffectResult, summarizeRuleEffects })}</details></section>`;
  }).join('')}`;
}
