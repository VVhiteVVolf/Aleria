export const cloneRegion = value => JSON.parse(JSON.stringify(value));

export function validateRegions(regions) {
  if (!Array.isArray(regions)) throw new Error('Die Regionsdatei enthält keine gültige Liste.');
  const ids = new Set();
  for (const region of regions) {
    if (ids.has(region.id)) throw new Error('Die Regionsdatei enthält doppelte Kennungen.');
    ids.add(region.id);
    validateRegion(region, regions);
  }
  return regions;
}

export function validateRegion(region, regions = []) {
  if (!region?.id || !String(region.name || '').trim()) throw new Error('Bitte einen Regionsnamen eingeben.');
  if (!['area', 'boundary'].includes(region.kind)) throw new Error('Unbekannte Art der Gebietsgrenze.');
  const minimum = region.kind === 'boundary' ? 2 : 3;
  if (!Array.isArray(region.paths) || !region.paths.length) throw new Error('Bitte zuerst die Grenze zeichnen.');
  for (const path of region.paths) {
    if (!Array.isArray(path) || path.length < minimum) throw new Error(`Die Grenze braucht mindestens ${minimum} Punkte.`);
    if (path.some(point => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite))) {
      throw new Error('Die Grenze enthält ungültige Koordinaten.');
    }
    if (region.kind !== 'boundary' && Math.abs(signedArea(path)) < 1e-10) throw new Error('Die Fläche hat noch keine Ausdehnung.');
  }
  if (!/^#[0-9a-f]{6}$/i.test(region.color)) throw new Error('Bitte eine gültige Farbe auswählen.');
  if (region.borderColor && !/^#[0-9a-f]{6}$/i.test(region.borderColor)) throw new Error('Bitte eine gültige Linienfarbe auswählen.');
  if (!Number.isFinite(region.opacity) || region.opacity < 0 || region.opacity > 1) throw new Error('Die Deckkraft muss zwischen 0 und 100 Prozent liegen.');
  const visited = new Set([region.id]);
  let parent = region.parentId;
  while (parent) {
    if (visited.has(parent)) throw new Error('Die übergeordnete Region würde eine Kreiszuordnung erzeugen.');
    visited.add(parent);
    const record = regions.find(item => item.id === parent);
    if (!record) throw new Error('Die übergeordnete Region ist nicht mehr vorhanden.');
    parent = record.parentId;
  }
  return region;
}

export function signedArea(path) {
  return path.reduce((area, p, i) => {
    const next = path[(i + 1) % path.length];
    return area + p[0] * next[1] - next[0] * p[1];
  }, 0) / 2;
}

export function regionPath(region, width, height) {
  return (region.paths || []).map(path => path.map((p, i) => `${i ? 'L' : 'M'}${p[0] * width} ${p[1] * height}`).join('') + (region.kind === 'boundary' ? '' : 'Z')).join('');
}

export function nearestSegment(paths, point, closed) {
  let best = null;
  paths.forEach((path, pathIndex) => {
    const count = closed ? path.length : path.length - 1;
    for (let i = 0; i < count; i++) {
      const a = path[i], b = path[(i + 1) % path.length];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
      const projected = [a[0] + t * dx, a[1] + t * dy];
      const distance = Math.hypot(point[0] - projected[0], point[1] - projected[1]);
      if (!best || distance < best.distance) best = { pathIndex, after: i, point: projected, distance };
    }
  });
  return best;
}

export function orderedRegions(regions) {
  const result = [], seen = new Set();
  function visit(region, depth) {
    if (seen.has(region.id)) return;
    seen.add(region.id);
    result.push({ region, depth });
    regions.filter(item => item.parentId === region.id).forEach(child => visit(child, depth + 1));
  }
  regions.filter(region => !region.parentId || !regions.some(parent => parent.id === region.parentId)).forEach(region => visit(region, 0));
  regions.forEach(region => visit(region, 0));
  return result;
}

// Prefer an interior label point for concave coastlines, without moving vertices.
export function labelPoint(region) {
  const points = region.paths?.[0] || [];
  if (!points.length) return [0, 0];
  const center = [points.reduce((sum, p) => sum + p[0], 0) / points.length, points.reduce((sum, p) => sum + p[1], 0) / points.length];
  if (region.kind === 'boundary') return center;
  const inside = p => {
    let hit = false;
    points.forEach((a, i) => {
      const b = points[(i + 1) % points.length];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    });
    return hit;
  };
  if (inside(center)) return center;
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  let best = null;
  for (let x = 1; x < 12; x++) for (let y = 1; y < 12; y++) {
    const candidate = [Math.min(...xs) + x / 12 * (Math.max(...xs) - Math.min(...xs)), Math.min(...ys) + y / 12 * (Math.max(...ys) - Math.min(...ys))];
    if (!inside(candidate)) continue;
    const distance = nearestSegment([points], candidate, true).distance;
    if (!best || distance > best.distance) best = { point: candidate, distance };
  }
  return best?.point || center;
}
