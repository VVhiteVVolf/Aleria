import { getAttackSequenceOutcome } from '../combat-resolution-tree.js';

const list = value => Array.isArray(value) ? value : [];

export function getEvaluationScenario(resolution = {}) {
  const automatic = (resolution.attack?.resolutionMode || resolution.resolutionMode) === 'automatic';
  const self = !!resolution.actorId && resolution.actorId === resolution.targetId;
  const sequence = getAttackSequenceOutcome(resolution);
  const damage = getRecordedDamageInstances(resolution);
  const beneficial = list(resolution.effectResults).some(r => r.applied !== false && ['healing', 'buff', 'temporary-hit-points', 'restore-resource', 'remove-condition', 'summon'].includes(r.effect?.type));
  return { automatic, self, sequence, damage, multipleTargets: Number(resolution.multiTargetCount) > 1,
    state: self ? 'self' : automatic && beneficial && !damage.length ? 'support' : sequence.criticalHits ? 'critical' : sequence.hits ? 'hit' : sequence.failures ? 'failure' : 'miss' };
}

export function getRecordedDamageInstances(resolution = {}) {
  return list(resolution.effectResults).filter(r => r.effect?.type === 'damage' && r.applied && typeof r.applied === 'object').map((result, index) => ({
    index, result, recipient: result.recipient === 'actor' ? 'actor' : 'target',
    raw: result.roll?.rawTotal ?? result.roll?.total ?? result.amount ?? result.applied.rawIncoming ?? null,
    applied: result.applied.incoming ?? null, hitPointDamage: result.applied.hitPointDamage ?? null,
    notation: result.roll?.notation || result.effect?.formula || '', damageType: result.effect?.damageType || 'Schaden',
    rollId: result.roll?.rollId || result.roll?.id || '',
    followIndex: /^follow-up-damage-(\d+)$/.exec(result.effect?.id || '')?.[1] ?? null
  }));
}

export function getEvaluationAttackRows(resolution = {}) {
  if ((resolution.attack?.resolutionMode || resolution.resolutionMode) === 'automatic') return [];
  const follows = list(resolution.followUpAttacks), damages = getRecordedDamageInstances(resolution).filter(d => d.recipient === 'target');
  const assigned = new Set();
  const followRows = follows.map((follow, index) => {
    const matches = damages.filter(d => d.followIndex === String(index + 1) || d.rollId && d.rollId === follow.damage?.rollId);
    matches.forEach(d => assigned.add(d));
    return { number: index + 2, label: `Folgeangriff ${index + 1}`, weaponName: follow.weaponName || '', attack: follow.attack || {},
      damage: matches, fallbackDamage: matches.length ? null : follow.damage || null };
  });
  const primaryDamage = damages.filter(d => !assigned.has(d) && d.followIndex == null);
  const primaryFallback = !follows.length ? resolution.damage : resolution.damage?.rollSource === 'primary' && resolution.damage.primaryTotal != null
    ? { notation: resolution.damage.notation, total: resolution.damage.primaryTotal } : null;
  return [{ number: 1, label: follows.length ? 'Auftakt' : 'Angriff', weaponName: '', attack: resolution.attack || {}, damage: primaryDamage,
    fallbackDamage: primaryDamage.length ? null : primaryFallback || null }, ...followRows];
}

export function getRecordedConditionChanges(resolution = {}) {
  const changes = new Map();
  const add = (recipient, condition, operation = 'applied') => {
    if (!condition?.name) return;
    if (resolution.actorId && resolution.actorId === resolution.targetId) recipient = 'actor';
    const key = `${recipient}:${condition.id || condition.name}`;
    if (operation === 'updated' && changes.get(key)?.operation === 'applied') return;
    changes.set(key, { recipient, condition, operation });
  };
  for (const result of list(resolution.effectResults)) {
    if (result.applied === false || result.prevented) continue;
    if (result.condition || result.applied && result.effect?.condition) add(result.recipient === 'actor' ? 'actor' : 'target', result.condition || result.effect.condition);
    for (const condition of list(result.removed)) add(result.recipient === 'actor' ? 'actor' : 'target', condition, 'removed');
  }
  for (const [recipient, snapshot] of [['actor', resolution.actorConditionSnapshot], ['target', resolution.targetConditionSnapshot]]) {
    if (!snapshot) continue;
    const before = new Map(list(snapshot.before).map(c => [c.id || c.name, c]));
    const after = new Map(list(snapshot.after).map(c => [c.id || c.name, c]));
    for (const [id, condition] of after) if (!before.has(id) || JSON.stringify(condition) !== JSON.stringify(before.get(id))) add(recipient, condition, before.has(id) ? 'updated' : 'applied');
    for (const [id, condition] of before) if (!after.has(id)) add(recipient, condition, 'removed');
    add(recipient, snapshot.applied);
  }
  return [...changes.values()];
}

export function getRecordedEffectCards(resolution = {}) {
  const cards = getRecordedConditionChanges(resolution).map(change => {
    const { condition, operation } = change;
    const counter = operation === 'applied' && condition.counterAttack?.enabled;
    const role = operation === 'removed' ? 'Beendet / entfernt' : operation === 'updated' ? 'Zustand aktualisiert' : counter ? 'Konter vorbereitet' : condition.disarm ? 'Entwaffnung' : condition.blockedResource === 'action' || condition.stunned ? 'Handlungssperre' : 'Zustand angewandt';
    return { ...change, role, name: condition.name, description: condition.description || '', duration: condition.duration || condition.durationModel?.label || '', counter };
  });
  for (const result of list(resolution.effectResults)) {
    if (result.applied === false || result.prevented || result.condition || !result.effect) continue;
    const type = result.effect.type, applied = result.applied || {};
    const recipient = result.recipient === 'actor' ? 'actor' : 'target';
    const named = {
      healing: ['Heilung', `+${applied.restored ?? result.amount ?? 0} TP`],
      'temporary-hit-points': ['Temporärer Schutz', `+${applied.granted ?? result.amount ?? 0} temporäre TP`],
      summon: ['Beschwörung', `${result.effect.summon?.count || 1}× ${result.effect.summon?.name || 'Kreatur'}`],
      interrupt: ['Unterbrechung', 'Wirkung unterbrochen'],
      narrative: ['Abstimmung', 'Mit der Spielleitung auflösen']
    }[type];
    if (named) cards.push({ recipient, role: named[0], name: named[1], description: result.effect.notes || '', duration: '', operation: 'applied' });
  }
  return cards;
}

export function getEvaluationSelfLabel(resolution = {}) {
  const cards = getRecordedEffectCards(resolution).filter(c => c.operation !== 'removed');
  if (cards.some(c => c.counter)) return 'Selbstwirkung · Konter vorbereitet';
  if (cards.some(c => c.role === 'Heilung')) return 'Selbstheilung';
  if (cards.some(c => c.role === 'Temporärer Schutz')) return 'Selbstwirkung · Schutz gewährt';
  return 'Selbstwirkung';
}

export function getEvaluationFactSummary(resolution = {}) {
  const { sequence, self, automatic } = getEvaluationScenario(resolution);
  if (sequence.count > 1) return `${sequence.hits} von ${sequence.count} Angriffen ${sequence.hits === 1 ? 'trifft' : 'treffen'} ${resolution.targetName || 'das Ziel'}.${resolution.damage ? ` Insgesamt ${resolution.damage.total} Schaden nach Abwehr.` : ''}`;
  if (self && automatic) {
    const cards = getRecordedEffectCards(resolution).filter(c => c.operation !== 'removed');
    const counter = cards.find(c => c.counter);
    return counter ? `${resolution.actorName || 'Die Figur'} bereitet ${counter.name} als Gegenangriff vor.`
      : cards.length ? `${resolution.actorName || 'Die Figur'} wirkt die Fähigkeit auf sich selbst. ${cards.map(c => c.name).join(' · ')}.` : `${resolution.actorName || 'Die Figur'} wendet die Fähigkeit auf sich selbst an.`;
  }
  return '';
}
