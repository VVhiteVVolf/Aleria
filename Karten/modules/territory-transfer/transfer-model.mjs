import { applyTransferDecisions } from './transfer-decisions.mjs';

// Candidate matching never changes source data or performs an import.
export function projectSourcePosition(marker, targetSize) {
  if (!marker.coordinates) return null;
  const { x, y, origin } = marker.coordinates;
  if (origin !== 'bottom-left') throw new Error('Unbekannter Quellenursprung');
  return { x, y: targetSize[1] - y };
}

function iconName(icon) { return icon.split('/').at(-1).replace('schiffswrackpin.png','schiffswrack.png'); }

export function buildTransferReview(sourceInput, targetInput, territorySource, decisions = {}) {
  const { source, target, excludedTargetIds } = applyTransferDecisions(sourceInput, targetInput, decisions);
  const territories = new Map(territorySource.territories.map(t => [t.id, t]));
  const edges = [];
  const sources = source.markers.map(marker => {
    const position = projectSourcePosition(marker, target.imageSize);
    const candidates = marker.kind === 'place' && !marker.transferDecision && position ? target.pins.filter(pin => !pin.reservedUnassigned && (!pin.preferredSourceId || pin.preferredSourceId === marker.id)).map(pin => {
      const distance = Math.hypot(pin.position.x - position.x, pin.position.y - position.y);
      const compatible = !marker.oldIconHint || iconName(pin.icon) === marker.oldIconHint;
      return { targetId: pin.id, distance: Math.round(distance), compatible, userPlacement: !!pin.userPlacement, decided: !!pin.decision,
        score: pin.preferredSourceId === marker.id ? -1000 : Math.round(distance + (compatible ? 0 : 65)) };
    }).filter(c => (c.distance <= 180 || c.userPlacement || c.decided) && (marker.oldIconHint !== 'schiffswrack.png' || c.compatible))
      .sort((a, b) => a.score - b.score).slice(0, 3) : [];
    for (const candidate of candidates) edges.push({ sourceId: marker.id, ...candidate });
    return { ...marker, projectedPosition: position, candidates };
  });
  const usedSources = new Set();
  const usedTargets = new Set();
  const proposals = new Map();
  for (const edge of edges.sort((a, b) => a.score - b.score || a.sourceId.localeCompare(b.sourceId))) {
    if (usedSources.has(edge.sourceId) || usedTargets.has(edge.targetId)) continue;
    usedSources.add(edge.sourceId); usedTargets.add(edge.targetId);
    proposals.set(edge.sourceId, edge);
  }
  const bySource = new Map(sources.map(s => [s.id, s]));
  const pins = target.pins.map(pin => {
    const proposal = [...proposals.values()].find(p => p.targetId === pin.id);
    const marker = proposal ? bySource.get(proposal.sourceId) : null;
    const issues = [];
    if (!marker && !pin.decision) issues.push('Kein alter Ort sicher zugeordnet; Name und Beschreibung bleiben offen.');
    if (proposal && !proposal.compatible) issues.push('Das Symbol der neuen Karte weicht vom Ortsart-Hinweis des Alttextes ab.');
    if (proposal?.distance > 80 && !pin.userPlacement) issues.push(`Die vorgeschlagene Position liegt ${proposal.distance} Pixel vom alten Koordinatenansatz entfernt.`);
    if (marker?.oldTerritoryIds.length && !marker.oldTerritoryIds.includes(pin.territoryId)) issues.push('Neue Gebietszuteilung weicht vom alten Ortsverzeichnis ab; Alttext prüfen.');
    if (marker && !marker.hasNarrative) issues.push('Keine ausgearbeitete Ortsbeschreibung im Altbestand; gegebenenfalls nur eine Überschrift.');
    const first = marker?.candidates[0];
    const margin = marker && marker.candidates.length > 1 ? marker.candidates[1].score - first.score : Infinity;
    const strong = marker?.oldIconHint && proposal?.compatible && proposal.distance <= 80 && first.targetId === pin.id && margin >= 15;
    return { ...pin, category: pin.decision?.category || pin.category,
      territoryEvidence: pin.decision?.territoryEvidence || pin.territoryEvidence,
      territory: territories.get(pin.territoryId), sourceId: marker?.id || '',
      proposedName: pin.decision?.name || marker?.name || '',
      description: pin.decision?.description || '',
      status: pin.userPlacement || pin.decision ? 'placed' : !marker ? 'unassigned' : strong ? 'candidate' : 'review',
      confirmed: !!(pin.userPlacement || pin.decision), proposal: proposal || null, issues };
  });
  for (const marker of sources) {
    marker.proposal = proposals.get(marker.id) || null;
    marker.status = marker.transferDecision?.disposition || (marker.kind !== 'place' ? 'context' : marker.proposal ? pins.find(p => p.id === marker.proposal.targetId).status : 'unassigned');
  }
  return { schemaVersion: 1, title: 'Roriksheim · Übertragungsabgleich',
    sourceImageSize: source.imageSize, imageSize: target.imageSize,
    policy: 'Die neue Karte hat Vorrang. Nutzervorgaben sind getrennt von offenen Vorschlägen dokumentiert; kein Produktionsimport.',
    excludedTargetIds,
    territories: territorySource.territories, sources, pins,
    counts: { sourceEntries: sources.length, descriptions: sources.filter(s => s.descriptionBBCode).length,
      places: sources.filter(s => s.kind === 'place').length, targetPositions: pins.length,
      activePlaces: sources.filter(s => s.kind === 'place' && s.status !== 'excluded').length,
      contextEntries: sources.filter(s => ['context','route'].includes(s.status)).length,
      excludedSources: sources.filter(s => s.status === 'excluded').length,
      embeddedSources: sources.filter(s => s.status === 'embedded').length,
      placed: pins.filter(p => p.status === 'placed').length,
      candidates: pins.filter(p => p.status === 'candidate').length,
      review: pins.filter(p => p.status === 'review').length,
      newPositions: pins.filter(p => !p.sourceId && !p.proposedName).length,
      oldPlacesWithoutTarget: sources.filter(s => s.kind === 'place' && s.status !== 'excluded' && !s.proposal).length } };
}
