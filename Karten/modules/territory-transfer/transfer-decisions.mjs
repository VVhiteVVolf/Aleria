// Regional decisions are applied to copies; the captured sources stay immutable.
export function applyTransferDecisions(source, target, decisions = {}) {
  const sources = new Map(source.markers.map(marker => [marker.id, marker]));
  const targets = new Map(target.pins.map(pin => [pin.id, pin]));
  const rules = new Map();
  for (const rule of decisions.sourceRules || []) {
    if (!['excluded', 'embedded', 'route'].includes(rule.disposition)) throw new Error('Unbekannte Quellenentscheidung');
    for (const id of rule.sourceIds) {
      if (!sources.has(id) || rules.has(id)) throw new Error('Unbekannte oder doppelte Quellenentscheidung: ' + id);
      rules.set(id, { disposition: rule.disposition, reason: rule.reason });
    }
  }
  const placements = new Map();
  const assignedSources = new Set();
  for (const placement of decisions.placements || []) {
    if (!targets.has(placement.targetId) || placements.has(placement.targetId)) throw new Error('Unbekanntes oder doppelt belegtes Ziel: ' + placement.targetId);
    if (placement.sourceId) {
      if (!sources.has(placement.sourceId) || sources.get(placement.sourceId).kind !== 'place' || rules.has(placement.sourceId) || assignedSources.has(placement.sourceId)) {
        throw new Error('Ungültige oder doppelte Ortsquelle: ' + placement.sourceId);
      }
      assignedSources.add(placement.sourceId);
    }
    placements.set(placement.targetId, placement);
  }
  const excludedTargets = new Set(decisions.excludedTargetIds || []);
  for (const id of excludedTargets) {
    if (!targets.has(id) || placements.has(id)) throw new Error('Ungültiger ausgeschlossener Kartenplatz: ' + id);
  }
  return {
    source: { ...source, markers: source.markers.map(marker => ({ ...marker, transferDecision: rules.get(marker.id) || null })) },
    target: { ...target, pins: target.pins.filter(pin => !excludedTargets.has(pin.id)).map(pin => {
      const decision = placements.get(pin.id);
      return decision ? { ...pin, icon: decision.icon || pin.icon, decision, preferredSourceId: decision.sourceId || '', reservedUnassigned: !decision.sourceId } : { ...pin };
    }) },
    excludedTargetIds: [...excludedTargets],
  };
}
