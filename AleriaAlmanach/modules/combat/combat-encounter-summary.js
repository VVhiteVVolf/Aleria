// Persisted, bounded factual summaries. No DOM, profile writes or inferred story.
const number = value => value != null && value !== '' && Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : null;
const text = (value, max = 180) => String(value || '').trim().slice(0, max);

export function normalizeEncounterSnapshot(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    current: number(value.current), maximum: number(value.maximum), temporary: number(value.temporary),
    resources: (Array.isArray(value.resources) ? value.resources : []).slice(0, 100).map(resource => ({
      id: text(resource.id), name: text(resource.name), current: number(resource.current), maximum: number(resource.maximum),
      scope: resource.scope === 'comment' ? 'comment' : 'persistent',
      recovery: text(resource.recovery, 30), recoveryDayKey: text(resource.recoveryDayKey, 160)
    })),
    conditions: (Array.isArray(value.conditions) ? value.conditions : []).slice(0, 100).map(condition => ({
      name: text(condition.name), kind: text(condition.kind, 40), encounterId: text(condition.encounterId)
    })),
    concentration: text(value.concentration), channeling: text(value.channeling)
  };
}

export function captureEncounterSnapshot(profile = {}, runtime = {}) {
  const conditions = Array.isArray(runtime.temporaryConditions) ? runtime.temporaryConditions : (profile.temporaryConditions || []);
  return normalizeEncounterSnapshot({
    current: runtime.current ?? profile.currentHitPoints, maximum: runtime.maximum ?? profile.maximumHitPoints,
    temporary: runtime.temporary ?? profile.temporaryHitPoints,
    resources: runtime.resources || profile.resources || [],
    conditions: conditions.filter(condition => condition.active !== false).map(condition => ({
      name: condition.name, kind: condition.durationModel?.kind || '', encounterId: condition.durationModel?.encounterId || ''
    })),
    concentration: (Object.hasOwn(runtime, 'concentration') ? runtime.concentration : profile.concentration)?.actionName,
    channeling: (Object.hasOwn(runtime, 'channeling') ? runtime.channeling : profile.channeling)?.actionName
  });
}

export function getEncounterResolutionGroups(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const groups = segments.map(segment => (segment.combatResolutions?.length ? segment.combatResolutions : [segment.combatResolution]).filter(Boolean));
  if (groups.some(group => group.length)) return groups.filter(group => group.length);
  return comment.combatResolution ? [[comment.combatResolution]] : [];
}

function addCost(metric, id, name, amount) {
  if (!metric || !(amount > 0)) return;
  const key = text(id);
  const previous = metric.costs.get(key) || { id: key, name: text(name), amount: 0 };
  previous.amount += amount;
  metric.costs.set(key, previous);
}

function addReactionCosts(metrics, resolution, participatingIds) {
  for (const snapshot of resolution.ruleResourceSnapshots || []) {
    if (!participatingIds.has(snapshot.sourceActorId)) continue;
    for (const before of snapshot.before || []) {
      if (before.scope === 'comment') continue;
      const after = snapshot.after?.find(resource => resource.id === before.id);
      if (after) addCost(metrics.get(snapshot.sourceActorId), before.id, before.name,
        Math.max(0, (number(before.current) || 0) - (number(after.current) || 0)));
    }
  }
}

export function buildCombatEncounterSummary({ encounterId, participants = [], comments = [], states = new Map(), profiles = new Map() }) {
  const ids = new Set();
  const metrics = new Map(participants.map(participant => [participant.actorId, { actions: 0, damage: 0, costs: new Map() }]));
  let inEncounter = false;
  let actionCount = 0;
  const highlights = [];
  for (const comment of comments) {
    const event = comment.combatEncounter;
    if (event?.encounterId === encounterId) {
      if (event.operation === 'start') inEncounter = true;
      if (['start', 'add'].includes(event.operation)) (event.participants || []).forEach(participant => ids.add(participant.actorId));
      if (event.operation === 'remove') (event.participants || []).forEach(participant => ids.delete(participant.actorId));
    }
    if (!inEncounter) continue;
    if (event?.encounterId === encounterId && event.operation === 'end') break;
    for (const group of getEncounterResolutionGroups(comment)) {
      const relevant = group.filter(resolution => ids.has(resolution.actorId) || ids.has(resolution.targetId));
      if (!relevant.length) continue;
      actionCount++;
      const actors = new Set();
      for (const resolution of relevant) {
        const actor = ids.has(resolution.actorId) ? metrics.get(resolution.actorId) : null;
        if (actor) {
          if (!actors.has(resolution.actorId)) { actor.actions++; actors.add(resolution.actorId); }
          actor.damage += number(resolution.damage?.total) || 0;
          for (const cost of resolution.resourceCosts || []) {
            if (cost.scope === 'comment') continue;
            addCost(actor, cost.resourceId, cost.name, number(cost.amount) || 0);
          }
        }
        addReactionCosts(metrics, resolution, ids);
        if (resolution.defeat?.occurred || resolution.attack?.criticalSuccess) {
          highlights.push({ commentId: text(comment.id), actionName: text(resolution.actionName),
            actorName: text(resolution.actorName), targetName: text(resolution.targetName),
            type: resolution.defeat?.occurred ? 'defeat' : 'critical' });
        }
      }
    }
  }
  return normalizeCombatEncounterSummary({ actionCount, highlights: highlights.slice(-8), participants: participants.map(participant => ({
    actorId: participant.actorId, name: participant.name, before: participant.entrySnapshot,
    after: captureEncounterSnapshot(profiles.get(participant.actorId), states.get(participant.actorId)),
    actions: metrics.get(participant.actorId).actions, damage: metrics.get(participant.actorId).damage,
    costs: [...metrics.get(participant.actorId).costs.values()]
  })) });
}

export function normalizeCombatEncounterSummary(value) {
  if (!value || typeof value !== 'object') return null;
  return { actionCount: number(value.actionCount) || 0,
    highlights: (Array.isArray(value.highlights) ? value.highlights : []).slice(-8).map(item => ({
      commentId: text(item.commentId), actionName: text(item.actionName), actorName: text(item.actorName), targetName: text(item.targetName),
      type: item.type === 'defeat' ? 'defeat' : 'critical'
    })),
    participants: (Array.isArray(value.participants) ? value.participants : []).slice(0, 100).map(item => ({
      actorId: text(item.actorId), name: text(item.name), before: normalizeEncounterSnapshot(item.before), after: normalizeEncounterSnapshot(item.after),
      actions: number(item.actions) || 0, damage: number(item.damage) || 0,
      costs: (Array.isArray(item.costs) ? item.costs : []).slice(0, 100).map(cost => ({ id: text(cost.id), name: text(cost.name), amount: number(cost.amount) || 0 }))
    }))
  };
}
