// Public geographic context, independent of travel plans and live party locations.
const text = (value, max = 300) => String(value ?? '').trim().slice(0, max);
const asset = value => /^\/(?!\/)[^\x00-\x1f]*$/.test(String(value || '')) ? text(value, 2000) : '';
export function normalizeQuestArea(input) {
  if (!input || typeof input !== 'object') return null;
  const width = Number(input.width), height = Number(input.height);
  const x = Number(input.center?.x), y = Number(input.center?.y), radius = Number(input.radius);
  if (![width, height, radius].every(value => Number.isFinite(value) && value > 0)
      || ![x, y].every(Number.isFinite) || x - radius < 0 || y - radius < 0 || x + radius > width || y + radius > height) return null;
  return { mapId: text(input.mapId), title: text(input.title), image: asset(input.image), width, height,
    center: { x, y }, radius, note: text(input.note, 2000),
    locations: (Array.isArray(input.locations) ? input.locations : []).slice(0, 20)
      .filter(row => [row.x, row.y].every(value => Number.isFinite(value) && value >= 0 && value <= 1))
      .map(row => ({ name: text(row.name), pinId: text(row.pinId), x: row.x, y: row.y })) };
}
