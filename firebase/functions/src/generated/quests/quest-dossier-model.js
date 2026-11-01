// Optional editorial preparation. It is independent of party assignment and live progress.
const text = (value, max = 1000) => String(value ?? '').trim().slice(0, max);
const localAsset = value => /^\/(?!\/)[^\x00-\x1f]*$/.test(String(value || '')) ? text(value, 2000) : '';
export function normalizeQuestDossier(input) {
  if (!input || typeof input !== 'object') return null;
  const rows = (key, max, project) => (Array.isArray(input[key]) ? input[key] : []).slice(0, max).map(project);
  return { tagline: text(input.tagline, 300), preparation: text(input.preparation, 3000), invitation: text(input.invitation, 2000), coverImage: localAsset(input.coverImage), cardImage: localAsset(input.cardImage), rewardPromise: text(input.rewardPromise, 1000),
    participants: rows('participants', 30, row => ({ name: text(row.name, 180), role: text(row.role, 180), description: text(row.description),
      kind: ['character','creature'].includes(row.kind) ? row.kind : '', recordId: text(row.recordId, 300), image: localAsset(row.image), profile: localAsset(row.profile) })),
    route: normalizeQuestRoute(input.route),
    pois: rows('pois', 20, row => ({ name: text(row.name, 180), description: text(row.description), mapId: text(row.mapId, 300), pinId: text(row.pinId, 300), detourKm: Number.isFinite(row.detourKm) ? Math.max(0, row.detourKm) : null })),
    encounters: rows('encounters', 20, row => ({ title: text(row.title, 180), description: text(row.description, 2000), location: text(row.location, 300), profile: localAsset(row.profile) })),
    rewardArt: rows('rewardArt', 24, row => ({ title: text(row.title, 180), image: localAsset(row.image), kind: row.kind === 'money' ? 'money' : 'item',
      ...(row.kind === 'money' ? { ...(row.amount != null ? { amount: Number(row.amount) || 0 } : {}), currency: text(row.currency, 20) } : {}) })) };
}
export function normalizeQuestRoute(route) {
  if (!route || typeof route !== 'object') return null;
  const width = Number(route.width), height = Number(route.height), widthKm = Number(route.widthKm);
  if (![width,height,widthKm].every(value => Number.isFinite(value) && value > 0)) return null;
  return { mapId: text(route.mapId, 300), image: localAsset(route.image), width, height, widthKm,
    note: text(route.note, 3000), approachMinutes: Math.max(0, Number(route.approachMinutes) || 0),
    paths: (Array.isArray(route.paths) ? route.paths : []).slice(0, 8).map(path => ({ id: text(path.id, 100), title: text(path.title, 180), description: text(path.description, 1000), travelMode: text(path.travelMode, 30),
      points: (path.points || []).slice(0, 100).filter(point => [point.x,point.y].every(value => Number.isFinite(value) && value >= 0 && value <= 1)).map(point => ({ x: point.x, y: point.y, name: text(point.name, 180), pinId: text(point.pinId, 300),
        ...(point.event ? { event: { type: 'custom', name: text(point.event.name, 180), custH: Math.max(0, Number(point.event.custH) || 0), custSp: 1 } } : {}) })),
      estimate: Object.fromEntries(['totalKm','travelH','delayH','totalH'].map(key => [key, Math.max(0, Number(path.estimate?.[key]) || 0)])) })) };
}
export function questTravelGroup(route, pathId) {
  const path = route?.paths.find(row => row.id === pathId);
  if (!path || path.points.length < 2) throw Error('Die vorbereitete Route fehlt.');
  return { id: `quest-plan-${path.id}`, name: path.title, color: '#c49a20', icon: '🐴', travelMode: path.travelMode,
    route: path.points.map(point => ({ x: point.x * route.width, y: point.y * route.height, ...(point.event ? { event: { ...point.event } } : {}) })) };
}
