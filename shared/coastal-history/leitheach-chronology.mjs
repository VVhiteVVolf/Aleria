import chronology from './leitheach-chronology.json' with { type: 'json' };

export const LEITHEACH_CHRONOLOGY = chronology;
const milestones = new Map(chronology.milestones.map(item => [item.id, item]));
export function raidPoint(id) {
  const point = milestones.get(id);
  if (!point) throw new Error(`Unbekannter Zeitpunkt des Raubzugs: ${id}`);
  return point;
}
export function raidHours(point) {
  const [day, time] = Array.isArray(point) ? point : [point.day, point.time];
  const [hours, minutes] = time.split(':').map(Number);
  return (day - 1) * 24 + hours + minutes / 60;
}
export function raidTime(id) {
  const point = typeof id === 'string' ? raidPoint(id) : id;
  return `Raubzugstag ${point.day} · ${point.time} Uhr`;
}
export function raidWindow(startId, endId) {
  const start = raidPoint(startId), end = raidPoint(endId);
  return start.day === end.day ? `Raubzugstag ${start.day} · ${start.time}–${end.time} Uhr` : `${raidTime(start)} bis ${raidTime(end)}`;
}
export function raidIncidentLabel(id) {
  const slots = chronology.incidents[id];
  if (!slots) throw new Error(`Unbekanntes Raubzugsereignis: ${id}`);
  return slots.map(slot => `${slots.length > 1 ? `${slot.place}: ` : ''}${raidWindow(slot.start, slot.end)}`).join('; ');
}
export const LEITHEACH_DURATION = 'Sieben Raubzugstage';
export const LEITHEACH_ELAPSED_HOURS = raidHours(raidPoint('end')) - raidHours(raidPoint('feints'));
export function raidIncidentDuration(id) {
  const slots = chronology.incidents[id];
  const firstDay = Math.min(...slots.map(slot => raidPoint(slot.start).day));
  const lastDay = Math.max(...slots.map(slot => raidPoint(slot.end).day));
  return slots.length > 1 ? `${slots.length} Überfälle an ${lastDay - firstDay + 1} Raubzugstagen` : `${(raidHours(raidPoint(slots[0].end)) - raidHours(raidPoint(slots[0].start))).toLocaleString('de-DE')} Stunden`;
}

// Distances deliberately use transferred anchors, never offshore direction arrows.
export function raidVoyageBudget(voyage, route, referenceKm = chronology.assumptions.referenceKm) {
  const markers = voyage.markers.map(id => {
    const marker = route.markers.find(item => item.id === id);
    if (!marker || marker.locationNote) throw new Error(`Ungeeigneter Entfernungsanker: ${id}`);
    return marker.targetPixels;
  });
  const pixels = markers.slice(1).reduce((sum, marker, index) => sum + Math.hypot(marker.x - markers[index].x, marker.y - markers[index].y), 0);
  const distanceKm = pixels / route.distanceReference.mainMapDistancePx * referenceKm * chronology.assumptions.routeFactor;
  const restHours = voyage.rests.reduce((sum, [start, end]) => sum + raidHours(end) - raidHours(start), 0);
  const travelHours = raidHours(voyage.end) - raidHours(voyage.start) - restHours;
  const speedLimitKmH = chronology.assumptions.speedsKmH[voyage.mode];
  return { distanceKm, restHours, travelHours, speedLimitKmH, requiredSpeedKmH: distanceKm / travelHours, feasible: travelHours > 0 && distanceKm <= travelHours * speedLimitKmH };
}
