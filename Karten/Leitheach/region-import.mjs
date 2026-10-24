import { convertRenderedRegion, worldAnvilMarkerId } from '../modules/regions/world-anvil-geometry.mjs';
import { validateRegions, labelPoint } from '../modules/regions/region-model.mjs';

const familyPatterns = [
  [/cel leagan/, 'haus-airgid'], [/amrhan|amhran/, 'haus-amrhan'],
  [/lasbun/, 'haus-frisealach'], [/sidhe somhairle/, 'haus-somhairle'],
  [/ard trodach/, 'haus-ard-trodach'], [/nic caoimhe/, 'haus-nic-caoimhe'],
  [/choinnich/, 'haus-choinnich'], [/nic blar/, 'haus-nic-blar-leitheach'],
  [/claisean/, 'haus-laidir'], [/coimhth/, 'haus-gallchobhair'],
  [/ghaisc/, 'haus-ghaiscioch'], [/cleir/, 'haus-cleir'],
  [/cearda/, 'haus-dal-ceardaiocht'], [/fancha/, 'haus-na-mhuir'],
  [/ruitheach/, 'haus-ruitheach'], [/gortach/, 'haus-gortach'],
  [/fiachrach/, 'haus-fiachrach'], [/eirce/, 'haus-ua-eirce'],
  [/broch an abhainn/, 'haus-ruin-ua-laoch'],
];
export const folded = value => String(value).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const shortName = value => value.replace(/^(Fürstliche Herrschaft|Oberherrschaft|Lehnsherrschaft|Lehensherrschaft|Herrschaft)\s*(-|von|der)?\s*/i, '').trim();

// Bounds from the same rendered SVG catch an import taken midway through a
// Leaflet zoom animation, before it can displace an entire set of borders.
export function assertRenderedRegionAlignment(shape) {
  if (shape.class.includes('marker-circle')) return;
  const coordinates = [...shape.d.matchAll(/[ML](-?[\d.]+)[ ,]+(-?[\d.]+)/g)].map(m => m.slice(1).map(Number));
  const [vx, vy, vw, vh] = shape.svg.viewBox.split(/\s+/).map(Number);
  const box = shape.svg.rect;
  const xs = coordinates.map(([x]) => box.left + (x - vx) * box.width / vw);
  const ys = coordinates.map(([,y]) => box.top + (y - vy) * box.height / vh);
  const rendered = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const observed = [shape.rect.left, shape.rect.right, shape.rect.top, shape.rect.bottom];
  if (rendered.some((value, i) => !Number.isFinite(value) || Math.abs(value - observed[i]) > 2)) {
    throw new Error(`SVG und Kartenstand passen nicht zusammen: ${worldAnvilMarkerId(shape)}`);
  }
}

export function importLeitheachRegions(capture, definition, definitions, territories, family) {
  const main = definition.slug === 'leitheach';
  const regions = capture.polygons.map(shape => {
    assertRenderedRegionAlignment(shape);
    const markerId = worldAnvilMarkerId(shape);
    const row = capture.rows.find(row => row.edit.endsWith('/' + markerId + '/edit'));
    const name = markerId === '397f74eb-6a69-4e7a-9ef3-0b435b2ede97'
      ? 'Herrschaft Tir na Fancha' : row?.title || 'Unbenannte Fläche';
    const normalizedName = folded(name);
    const outer = !main && /^(oberherrschaft|furstliches herrschaftsgebiet)/.test(normalizedName);
    const root = main ? definitions.find(d => folded(d.title).replace(' an ', ' na ') === folded(shortName(name)).replace(' an ', ' na ')) : definition;
    const familyId = main ? root?.familyId || '' : outer || /eigenverwaltung/.test(normalizedName)
      ? definition.familyId : familyPatterns.find(([pattern]) => pattern.test(normalizedName))?.[1] || '';
    const contextArea = shape.class.includes('marker-circle') || normalizedName === 'grenzgebiet';
    const territory = main ? territories.find(t => t.id === root?.territoryId)
      : territories.find(t => t.familyId === familyId && t.mapId === 'leitheach-' + definition.slug);
    const displayName = territory?.territorialReview ? territory.name : name;
    const geometry = convertRenderedRegion(shape, capture.image, { independentAxes: true });
    const ruler = familyId ? family(familyId) : null;
    if (familyId && !ruler) throw new Error('Unbekannte Familie: ' + familyId);
    if (familyId && !contextArea && !territory) throw new Error('Unbekannte Herrschaft: ' + name);
    const color = String(shape.fill || '').trim();
    const stroke = String(shape.stroke || '#a74732').trim();
    return {
      id: 'wa-' + markerId, name: displayName, shortName: territory?.territorialReview ? displayName : outer ? definition.title : /eigenverwaltung/.test(normalizedName)
        ? 'Eigenverwaltung · ' + (definition.familyId === 'haus-mac-airt' ? 'Mac Airt' : 'Cumhaill') : shortName(name), ...geometry,
      color: /^#[a-f0-9]{6}$/i.test(color) ? color : stroke,
      borderColor: stroke, opacity: geometry.kind === 'boundary' ? 0 : shape.opacity,
      parentId: '', dominionId: contextArea ? '' : territory?.id || '', familyId,
      targetMapId: main && root ? 'leitheach-' + root.slug : '',
      showLabel: !contextArea,
      ...(geometry.kind === 'boundary' ? { labelPosition: labelPoint(geometry) } : {}),
      note: contextArea ? normalizedName === 'grenzgebiet' ? 'Grenzgebiet · Zugehörigkeit offen' : 'Örtlicher Bereich' : '',
      source: { type: 'world-anvil', mapId: capture.mapId, markerId, coordinateSystem: 'normalized-top-left',
        ...(geometry.kind === 'boundary' ? { role: 'settlement-connections' } : {}),
        geometryMethod: 'visible-svg-verified', url: row?.edit || '',
        ...(markerId === '397f74eb-6a69-4e7a-9ef3-0b435b2ede97' ? { userCorrection: 'Tir na Fancha; veralteter Buarstrath-Text verworfen' } : {}) },
      ...(ruler ? { familyName: ruler.document.title } : {}),
    };
  });
  for (const region of regions) {
    if (main) continue;
    const territory = territories.find(t => t.id === region.dominionId);
    const parent = regions.find(candidate => candidate !== region && candidate.dominionId === territory?.parentId);
    region.parentId = parent?.id || '';
    if (!region.dominionId) region.parentId = regions.find(r => r.dominionId === definition.territoryId)?.id || '';
  }
  return validateRegions(regions);
}

export function pointInOutline(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function territoryAtPoint(point, regions, fallback) {
  const area = path => Math.abs(path.reduce((sum, [x,y], i) => {
    const [nx,ny] = path[(i + 1) % path.length]; return sum + x * ny - nx * y;
  }, 0));
  return regions.filter(region => region.kind === 'area' && region.dominionId && region.paths.some(path => path.length >= 3 && pointInOutline(point, path)))
    .sort((a,b) => Math.min(...a.paths.map(area)) - Math.min(...b.paths.map(area)))[0]?.dominionId || fallback;
}

// Old clan polylines run through their settlements and can cross themselves.
// Their vertices prove a connection; closing them would invent a territory.
export function connectedTerritory(point, regions, imageSize, tolerance) {
  const candidates = regions.filter(region => region.kind === 'boundary' && region.dominionId)
    .map(region => ({ region, distance: Math.min(...region.paths.flatMap(path => path.map(vertex =>
      Math.hypot((vertex[0] - point[0]) * imageSize[0], (vertex[1] - point[1]) * imageSize[1])))) }))
    .filter(candidate => candidate.distance <= tolerance).sort((a,b) => a.distance - b.distance);
  if (candidates[1] && candidates[1].region.dominionId !== candidates[0].region.dominionId
      && candidates[1].distance - candidates[0].distance < 8) throw new Error('Mehrdeutiger Ortsanschluss an Clanlinien');
  return candidates[0]?.region;
}
