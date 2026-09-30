import { escapeActionHtml as escape } from './combat-action-choice.js';
import { describeStanceConsequences } from '../combat-stance-presentation.js';
import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../combat-profile-model.js';

export function renderCounterConsequences(resolution, { renderEffectResult = () => '', summarizeRuleEffects = () => '' } = {}) {
  const narrative = describeStanceConsequences(resolution);
  return `${narrative ? `<p class="combat-counter-consequence">${escape(narrative)}</p>` : ''}${(resolution.counterAttacks || []).filter(c => c.resolution).map(counter => {
    const result = counter.resolution, attack = result.attack;
    return `<div class="combat-evaluation-mechanics"><span><b>${escape(counter.stance)} · ${escape(counter.actorName)}</b></span>
      <span>Konter mit Vorteil: W20 [${escape(attack.diceResults.join(', '))}] ${attack.modifier >= 0 ? '+' : ''}${escape(attack.modifier)} = <b>${escape(attack.total)}</b> gegen ${escape(attack.targetDefense)} · ${attack.hit ? 'Treffer' : 'verfehlt'}</span>
      ${result.damage ? `<span>${escape(result.damage.notation)} · <b>${escape(result.damage.total)} Schaden</b></span>` : ''}
      <span>${escape(counter.targetName)}: ${escape(result.targetSnapshot.hitPointsBefore)} → ${escape(result.targetSnapshot.hitPointsAfter)} TP</span>
      ${(result.secondarySaves || []).map(save => `<span>${escape(COMBAT_ATTRIBUTE_DEFINITIONS.find(attribute => attribute.key === save.attributeKey)?.label || save.attributeKey)}-Rettung ${escape(save.total)} gegen SG ${escape(save.dc)} · ${save.succeeded ? 'gelungen' : 'misslungen'}</span>`).join('')}
      ${(result.mechanicNotes || []).map(note => `<span><b>Waffenregel:</b> ${escape(note)}</span>`).join('')}
      ${(result.effectResults || []).map(renderEffectResult).join('')}
      ${(result.ruleApplications || []).map(rule => `<span><b>${escape(rule.ruleName)}</b> · ${escape(summarizeRuleEffects(rule.effects))}</span>`).join('')}
      ${result.actorInventorySnapshot?.ammunitionUse ? `<span>Munition: ${escape(result.actorInventorySnapshot.ammunitionUse.before)} → ${escape(result.actorInventorySnapshot.ammunitionUse.after)}</span>` : ''}</div>`;
  }).join('')}`;
}
