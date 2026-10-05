// Embed only a registered map in the project's own viewer. Arbitrary links
// remain explicit navigation targets, never iframe sources.
export function landingMapFrameSource(mapId, registry) {
  const map = registry?.byId?.(String(mapId || '').trim());
  return map?.id ? `../Karten/karte.html?map=${encodeURIComponent(map.id)}` : '';
}
