import { escapeCombatHtml as escape } from './combat-presentation-markup.js';
import { renderEvaluationAttackRows, renderEvaluationDamageInstances, renderEvaluationSaveRecords } from './combat-evaluation-rolls.js';
import { getRecordedConditionChanges, getEvaluationScenario } from './combat-evaluation-model.js';

const section = (title, body) => body ? `<section class="combat-evaluation-record-section"><h4>${escape(title)}</h4>${body}</section>` : '';
const records = (entries, className = '') => entries.length ? `<ul class="combat-evaluation-record-list${className ? ` ${className}` : ''}">${entries.map(entry=>`<li>${entry}</li>`).join('')}</ul>` : '';

function renderResourceRecords(resolution) {
  const entries = [
    ...(resolution.actorResourceSnapshot?.changes || []).map(change => ({ change, owner: resolution.actorName })),
    ...(resolution.targetResourceSnapshot?.changes || []).map(change => ({ change, owner: resolution.targetName })),
    ...(resolution.ruleResourceSnapshots || []).flatMap(snapshot => (snapshot.changes || []).map(change => ({ change, owner: snapshot.sourceActorName || 'Regelquelle' })))
  ];
  const ammunition = resolution.actorInventorySnapshot?.ammunitionUse;
  return records([...entries.map(({change,owner})=>`<b>${escape(owner || 'Figur')} · ${escape(change.name || change.resourceId || 'Ressource')}</b><span>${escape(change.before)} → ${escape(change.after)}</span>`), ...(ammunition ? [`<b>Munition · ${escape(ammunition.name)}</b><span>${escape(ammunition.before)} → ${escape(ammunition.after)}</span>`] : [])], 'combat-evaluation-record-list--resources');
}

function renderStateRecords(resolution) {
  const changes = getRecordedConditionChanges(resolution);
  return records(changes.map(({condition,recipient,operation})=>`<b>${escape(recipient === 'actor' || resolution.actorId === resolution.targetId ? resolution.actorName || 'Selbst' : resolution.targetName || 'Ziel')} · ${escape(condition.name)}</b><span>${operation === 'removed' ? 'entfernt / abgelaufen' : operation === 'updated' ? 'aktualisiert' : 'angewandt'}${condition.duration ? ` · ${escape(condition.duration)}` : ''}</span>${condition.description ? `<small>${escape(condition.description)}</small>` : ''}`));
}

export function renderEvaluationLedger(resolution = {}, { renderEffectResult = () => '', summarizeRuleEffects = () => '' } = {}) {
  const effects = (resolution.effectResults || []).map(renderEffectResult).filter(Boolean);
  const rules = (resolution.ruleApplications || []).map(rule=>`<b>${escape(rule.sourceActorName || 'Regelquelle')} · ${escape(rule.ruleName)}</b><span>${escape(summarizeRuleEffects(rule.effects))}</span>`);
  const conflicts = (resolution.ruleConflicts || []).map(conflict=>`<b>Regelkonflikt</b><span>${escape((conflict.applications || []).map(a=>a.ruleName).join(' ↔ ') || conflict.message || 'Entscheidung durch Beteiligte oder Erzähler')}</span>`);
  const notes = (resolution.mechanicNotes || []).map(note=>`<b>Waffenregel</b><span>${escape(note)}</span>`);
  if (resolution.turnStart) notes.push(`<b>${escape(resolution.turnStart.name)} · Zugbeginn</b><span>${resolution.turnStart.suppressed ? 'durch Feuer unterdrückt' : `+${Number(resolution.turnStart.restored)||0} LP${resolution.turnStart.roll?.notation ? ` (${escape(resolution.turnStart.roll.notation)})` : ''}`}</span>`);
  if (resolution.defeat?.occurred) notes.push(`<b>Kampfunfähig${resolution.defeat.nonlethal ? ' · nichttödlich' : ''}</b><span>Kein automatischer Tod; die weitere Darstellung entscheiden die Beteiligten.</span>`);
  const scenario = getEvaluationScenario(resolution);
  return `<div class="combat-evaluation-records">${section('Treffer & Abwehr',scenario.sequence.count > 1 ? '' : renderEvaluationAttackRows(resolution))}${section('Rettungswürfe',renderEvaluationSaveRecords(resolution))}${section('Schaden & Schutz',scenario.damage.length > 1 && scenario.sequence.count < 2 ? '' : renderEvaluationDamageInstances(resolution))}${section('Wirkungen',records(effects))}${section('Zustandsänderungen',renderStateRecords(resolution))}${section('Ressourcen & Munition',renderResourceRecords(resolution))}${section('Regelanwendungen',records(rules))}${section('Hinweise & Konflikte',records([...notes,...conflicts]))}</div>`;
}
