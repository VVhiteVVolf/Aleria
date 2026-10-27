// Physical paper and its fastener belong together; notice text remains in zettel.
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value))
  ? Math.max(min, Math.min(max, Number(value))) : fallback;
const angle = value => clamp(value, -180, 180, 0);
const id = value => typeof value === 'string' ? value.trim().slice(0, 200) : '';
export const NAILS = Object.freeze([
  { id: 'straight', name: 'Gerader Eisennagel', src: 'assets/images/notice-pins/nail-straight.png' },
  { id: 'left', name: 'Schräger Nagel · links', src: 'assets/images/notice-pins/nail-left.png' },
  { id: 'right', name: 'Schräger Nagel · rechts', src: 'assets/images/notice-pins/nail-right.png' },
]);

export function normalizePoster(source, assetIds) {
  if (!source || !id(source.id) || !assetIds.has(source.assetId)) return null;
  const pin = source.pin || {};
  return {
    id: id(source.id), assetId: source.assetId,
    x: clamp(source.x, 0, 1, .5), y: clamp(source.y, 0, 1, .5),
    width: clamp(source.width, .015, .8, .1), rotation: angle(source.rotation),
    layer: Math.round(clamp(source.layer, -10000, 10000, 0)),
    ...(id(source.noticeId) ? { noticeId: id(source.noticeId) } : {}),
    pin: {
      assetId: NAILS.some(nail => nail.id === pin.assetId) ? pin.assetId : 'straight',
      x: clamp(pin.x, 0, 1, .5), y: clamp(pin.y, 0, 1, .08),
      size: clamp(pin.size, .04, .65, .16), rotation: angle(pin.rotation),
      enabled: pin.enabled !== false,
    },
  };
}

export function normalizeLayout(source, assets) {
  if (!source || source.version !== 1 || !Array.isArray(source.posters) || source.posters.length > 500) return null;
  const assetIds = new Set(assets.map(asset => asset.id));
  const seen = new Set();
  const posters = source.posters.map(poster => normalizePoster(poster, assetIds));
  for (const poster of posters) {
    if (!poster || seen.has(poster.id)) return null;
    seen.add(poster.id);
  }
  return { version: 1, ...(source.useBoardImageOverride === true ? { useBoardImageOverride: true } : {}), posters };
}

export function dimensions(poster, asset, board) {
  const width = poster.width * board.w;
  return { w: width, h: width / asset.aspect };
}

export function pinPosition(poster, asset, board) {
  const size = dimensions(poster, asset, board);
  const radians = poster.rotation * Math.PI / 180;
  const x = (poster.pin.x - .5) * size.w;
  const y = (poster.pin.y - .5) * size.h;
  return {
    x: poster.x + (x * Math.cos(radians) - y * Math.sin(radians)) / board.w,
    y: poster.y + (x * Math.sin(radians) + y * Math.cos(radians)) / board.h,
  };
}

// A hidden root can still have visible supplementary sheets. Resolve against
// all members, then expose only the already filtered public group.
export function groupForPoster(poster, notices, stacks, includeSecret = false) {
  if (!poster.noticeId) return null;
  const members = stacks.members(notices, poster.noticeId, { includeSecret: true });
  if (!members.length) return null;
  const ids = new Set(members.map(notice => notice.id));
  return stacks.groups(notices, { includeSecret }).find(group => group.notices.some(notice => ids.has(notice.id))) || null;
}

export function moveLayer(layout, posterId, direction, extreme = false) {
  const ordered = [...layout.posters].sort((a, b) => a.layer - b.layer);
  const index = ordered.findIndex(poster => poster.id === posterId);
  if (index < 0) return;
  const [poster] = ordered.splice(index, 1);
  const next = extreme ? (direction > 0 ? ordered.length : 0)
    : Math.max(0, Math.min(ordered.length, index + Math.sign(direction)));
  ordered.splice(next, 0, poster);
  ordered.forEach((item, layer) => { item.layer = layer; });
}

export function unlinkDeletedNotice(layout, notices, stacks, deletedId) {
  const remaining = stacks.members(notices, deletedId, { includeSecret: true }).filter(notice => notice.id !== deletedId);
  for (const poster of layout?.posters || []) {
    if (poster.noticeId !== deletedId) continue;
    if (remaining.length) poster.noticeId = remaining[0].id;
    else delete poster.noticeId;
  }
}
