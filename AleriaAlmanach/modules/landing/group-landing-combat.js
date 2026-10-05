import { hasActionBlockingCondition } from '../combat/combat-wait-action.js';

const labels = { ready: 'Bereit', injured: 'Verletzt', exhausted: 'Erschöpft', unavailable: 'Nicht einsatzfähig', unknown: 'Bogen fehlt' };
const severity = { ready: 0, injured: 1, exhausted: 2, unavailable: 3 };

// The overview only projects shared combat profiles; it never changes resources.
export function projectGroupReadiness(member, profile) {
  if (!profile || !Number.isFinite(Number(profile.maximumHitPoints)) || !Number.isFinite(Number(profile.currentHitPoints))) return { key: 'unknown', label: labels[member.status] ? labels[member.status] + ' · Bogen fehlt' : labels.unknown, known: false, conditions: [], resources: [] };
  const current = Number(profile.currentHitPoints), maximum = Number(profile.maximumHitPoints);
  const conditions = (profile.conditions || []).filter(condition => condition.active !== false);
  let key = hasActionBlockingCondition(profile) || (current <= 0 && !profile.combat?.canActAtZeroHitPoints) ? 'unavailable'
    : conditions.some(condition => /erschöpf|exhaust|ermüd/i.test(condition.name || condition.id)) ? 'exhausted'
      : current < maximum ? 'injured' : 'ready';
  const manual = member.status === 'fit' ? 'ready' : member.status;
  if (severity[manual] > severity[key]) key = manual;
  return { key, label: labels[key], known: true, current, maximum,
    temporary: Number(profile.temporaryHitPoints) || 0, defense: profile.totalDefense,
    conditions: conditions.map(condition => condition.name || condition.label || condition.id),
    resources: (profile.resources || []).filter(resource => !['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'].includes(resource.id))
      .map(resource => ({ name: resource.name, current: resource.current, maximum: resource.maximum })) };
}

export function summarizeGroupReadiness(members) {
  const active = members.filter(member => member.assignment === 'active');
  return { total: members.length, active: active.length, ready: active.filter(member => member.readiness.key === 'ready').length,
    limited: active.filter(member => ['injured', 'exhausted'].includes(member.readiness.key)).length,
    unavailable: active.filter(member => member.readiness.key === 'unavailable').length,
    unknown: active.filter(member => !member.readiness.known).length };
}
