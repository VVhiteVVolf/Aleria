import { renderCombatEvaluation } from '../combat/ui/combat-ui.js';
import { renderEvaluationSaveRecords } from '../combat/ui/combat-evaluation-rolls.js';
import { renderCombatStatIcon } from '../combat/ui/combat-presentation-icons.js';
import { escapeCombatHtml as escape } from '../combat/ui/combat-presentation-markup.js';
import { getAttackSequenceOutcome } from '../combat/combat-resolution-tree.js';
import { renderSkillIcon } from '../skill-checks/skill-icon-view.js';
import { getCheckDefinition } from '../skill-checks/skill-check-model.js';
import { formatHerausforderungRewardReceipt } from './herausforderung-rewards.js?v=20261015-graded-challenges-v1';

// A maneuver has its own receipt below; retain other rewards in the general line.
export function formatChallengeStandaloneRewards(receipt, results = []) {
  if (!receipt) return '';
  const rendered = new Set(results.filter(result => result.type === 'weapon-maneuver').map(result => result.effectId));
  return formatHerausforderungRewardReceipt({ ...receipt,
    combatEffects: (receipt.combatEffects || []).filter(effect => effect.type !== 'weapon-maneuver' || !rendered.has(effect.effectId)) });
}

function step({ icon, label, values = '', state, outcome, details = '' }) {
  return `<details class="herausforderung-maneuver-step" data-state="${state}">
    <summary>${icon}<span class="herausforderung-maneuver-copy"><strong>${escape(label)}</strong><span>${escape(values)}</span></span><b class="herausforderung-maneuver-outcome">${escape(outcome)}</b></summary>
    <div class="herausforderung-maneuver-proof">${details}</div>
  </details>`;
}

function saveStep(result) {
  const save = result.save;
  if (!save) return '';
  const checkId = `save:${save.attributeKey}`;
  const label = `${save.actorName || 'Figur'} · ${getCheckDefinition(checkId)?.label || 'Rettungswurf'}`;
  return step({ icon: renderSkillIcon(checkId), label, values: `${save.total} gegen SG ${save.dc}`,
    state: save.succeeded ? 'success' : 'failure', outcome: save.succeeded ? 'Gelungen' : 'Misslungen',
    details: renderEvaluationSaveRecords({ secondarySaves: [{ ...save, timing: 'before-maneuver' }] }) });
}

function attackStep(result) {
  const resolution = result.resolution;
  if (!resolution?.attack) return '';
  const attack = resolution.attack, sequence = getAttackSequenceOutcome(resolution);
  const outcome = sequence.count > 1 ? `${sequence.hits}/${sequence.count} Treffer`
    : attack.criticalFailure ? 'Kritischer Fehlschlag' : attack.criticalSuccess ? 'Kritischer Treffer' : attack.hit ? 'Treffer' : 'Verfehlt';
  const label = `${resolution.actorName || result.actorName || 'Angriff'} → ${resolution.targetName || 'Ziel'}`;
  const damage = Number(resolution.damage?.total);
  const values = `${attack.total} gegen RK ${attack.targetDefense}${damage > 0 ? ` · ${damage} Schaden` : ''}`;
  return step({ icon: renderCombatStatIcon('attack'), label, values, outcome,
    state: sequence.hits > 0 ? 'success' : 'failure', details: renderCombatEvaluation({ resolution }, { open: true }) });
}

export function renderChallengeManeuverReceipts(results = []) {
  return results.filter(result => result.type === 'weapon-maneuver').map(result => {
    const pickup = result.pickup ? `<div class="herausforderung-maneuver-pickup">${renderCombatStatIcon('effect')}<span>${escape(result.pickup.sceneItemEvent?.text || 'Die eigene Waffe wurde aufgehoben.')}</span>${result.cost ? `<b>1 ${escape(result.cost.name)}</b>` : ''}</div>` : '';
    const skipped = result.skipped && !result.save ? `<p>${escape(result.skipped)}</p>` : '';
    return `<section class="herausforderung-maneuver-receipt" aria-label="Ausgelöste Kampfschritte">${pickup}${saveStep(result)}${attackStep(result)}${skipped}</section>`;
  }).join('');
}
