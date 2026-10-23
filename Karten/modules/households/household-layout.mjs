const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width + 6, b.x + b.width + 6) - Math.max(a.x, b.x))
  * Math.max(0, Math.min(a.y + a.height + 6, b.y + b.height + 6) - Math.max(a.y, b.y));

// Work in viewport pixels so crests keep a readable size at every zoom level.
export function layoutHouseholds(groups, { image, transform, viewport }) {
  const placed = [];
  for (const group of groups) {
    const anchor = { x: group.pin.x * image.width * transform.z + transform.x, y: group.pin.y * image.height * transform.z + transform.y };
    if (anchor.x < 0 || anchor.y < 0 || anchor.x > viewport.width || anchor.y > viewport.height) continue;
    const width = Math.min(viewport.width, Math.min(group.families.length, 5) * 32 + (group.families.length > 5 ? 32 : 0) + (group.region ? 64 : 0) + 12);
    const height = 43;
    const candidates = [[18, -70], [-width - 18, -70], [18, 24], [-width - 18, 24], [-width / 2, -105], [-width / 2, 60]]
      .map(([dx, dy]) => ({ x: clamp(anchor.x + dx, 4, viewport.width - width - 4), y: clamp(anchor.y + dy, 4, viewport.height - height - 4), width, height }));
    const box = candidates.reduce((best, candidate) => placed.reduce((sum, other) => sum + overlap(candidate, other), 0)
      < placed.reduce((sum, other) => sum + overlap(best, other), 0) ? candidate : best);
    placed.push({ ...group, ...box, anchor });
  }
  return placed;
}
