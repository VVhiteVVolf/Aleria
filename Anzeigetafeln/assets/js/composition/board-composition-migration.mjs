import { normalizeLayout, normalizePoster, pinPosition } from './board-composition-model.mjs?v=20261029-performance-v1';
import { DEFAULT_BOARD_SIZE } from './board-composition-config.mjs?v=20261029-performance-v1';

const TYPE_ART = Object.freeze({
  quest: 'hilfe', steckbrief: 'gesucht-leer', zeitung: 'zeitung', vermisst: 'vermisst',
  ankuendigung: 'ankuendigung', notiz: 'pamphlet', handel: 'angebot-haendler', erlass: 'erlass',
  einladung: 'ankuendigung-quer', warnung: 'vorsicht', reise: 'geleit', gilde: 'arbeit',
  fund: 'gefunden', hilfsgesuch: 'hilfe', turnier: 'kampf', auktion: 'angebot-haendler',
});
const clamp = value => Math.max(0, Math.min(1, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function mappedPoint(notice, preset) {
  const map = preset.normalizedAffine || {};
  return {
    x: clamp(finite(notice.x, .5) * (map.scaleX ?? 1) + (map.offsetX ?? 0)),
    y: clamp(finite(notice.y, .5) * (map.scaleY ?? 1) + (map.offsetY ?? 0)),
  };
}

function moveAnchor(poster, asset, board, point) {
  const current = pinPosition(poster, asset, board);
  poster.x = clamp(poster.x + point.x - current.x);
  poster.y = clamp(poster.y + point.y - current.y);
}

function spatialMatch(notice, preset, available) {
  const x = Number(notice.x), y = Number(notice.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  // Only an actual old paper region can acquire an unknown legacy notice.
  // Choose the visible front sheet when several papers overlap.
  return (preset.pieces || []).filter(piece => {
    const rect = piece.legacyBounds;
    return available.has(piece.id) && rect && x >= rect.x - .01 && x <= rect.x + rect.w + .01
      && y >= rect.y - .01 && y <= rect.y + rect.h + .01;
  }).sort((a, b) => b.layer - a.layer)[0]?.id || null;
}

// This is a one-time projection of old content onto physical paper. Explicit
// layouts, including deliberately empty ones, always take precedence. Never
// mutate notices, comments, stack membership, IDs or their legacy coordinates.
export function prepareBoardState(incoming, { assets, preset = {}, stacks }) {
  if (!Array.isArray(incoming.zettel)) return incoming;
  if (Object.hasOwn(incoming, 'boardLayout')) {
    const layout = normalizeLayout(incoming.boardLayout, assets);
    if (!layout) throw new Error('Die Datei enthält eine ungültige Plakatanordnung.');
    return { ...incoming, boardLayout: layout };
  }
  const layout = normalizeLayout(preset.layout || { version: 1, posters: [] }, assets);
  if (!layout) throw new Error('Die Tafelvorlage enthält eine ungültige Plakatanordnung.');
  const byAsset = new Map(assets.map(asset => [asset.id, asset]));
  const byPoster = new Map(layout.posters.map(poster => [poster.id, poster]));
  const board = preset.targetSize ? { w: preset.targetSize.width, h: preset.targetSize.height } : DEFAULT_BOARD_SIZE;
  for (const binding of preset.bindings || []) {
    const poster = byPoster.get(binding.posterId);
    const notice = incoming.zettel.find(item => item.id === binding.noticeId);
    if (!poster || !notice || !binding.legacyPin) continue;
    poster.x = clamp(poster.x + (finite(notice.x, binding.legacyPin.x) - binding.legacyPin.x) * (preset.legacyScale?.x ?? 1));
    poster.y = clamp(poster.y + (finite(notice.y, binding.legacyPin.y) - binding.legacyPin.y) * (preset.legacyScale?.y ?? 1));
  }
  const available = new Set(layout.posters.filter(poster => !poster.noticeId).map(poster => poster.id));
  for (const group of stacks.groups(incoming.zettel, { includeSecret: true })) {
    if (layout.posters.some(poster => group.notices.some(notice => notice.id === poster.noticeId))) continue;
    const notice = group.notices[0];
    const matched = spatialMatch(notice, preset, available);
    let poster = matched && byPoster.get(matched);
    if (poster) available.delete(poster.id);
    else {
      if (layout.posters.length >= 500) throw new Error('Die Tafel enthält zu viele Plakate für eine vollständige Übernahme.');
      const baseId = `legacy-${notice.id}`.slice(0, 180);
      let posterId = baseId, suffix = 1;
      while (byPoster.has(posterId)) posterId = `${baseId}-${suffix++}`;
      const assetId = byAsset.has(TYPE_ART[notice.typ]) ? TYPE_ART[notice.typ] : assets[0]?.id;
      poster = normalizePoster({ id: posterId, assetId, x: .5, y: .5, width: .095,
        layer: Math.max(0, ...layout.posters.map(item => item.layer)) + 1 }, new Set(byAsset.keys()));
      if (!poster) throw new Error('Für die Inhaltsübernahme fehlt ein Plakatmotiv.');
      layout.posters.push(poster);
      byPoster.set(poster.id, poster);
    }
    poster.noticeId = notice.id;
    poster.pin.enabled = true;
    moveAnchor(poster, byAsset.get(poster.assetId), board, mappedPoint(notice, preset));
  }
  return { ...incoming, boardLayout: layout };
}
