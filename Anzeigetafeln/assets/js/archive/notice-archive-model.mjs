import { noticeDate, isNoticeDate, compareDates, hasAppeared, publicationDate } from '../timeline/notice-dates.mjs';

export const ARCHIVE_FLOOR = Object.freeze({ left: .08, right: .94, top: .87, bottom: .97 });
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const identifier = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export const emptyArchive = () => ({ version: 1, entries: [], piles: [] });
export const activeAt = (entry, date) => compareDates(entry.archivedOn, date) <= 0
  && (!entry.restoredOn || compareDates(date, entry.restoredOn) < 0);
export const isArchivedAt = (archive, id, date) => (archive?.entries || []).some(entry => entry.noticeIds.includes(id) && activeAt(entry, date));

export function floorPosition(value = {}) {
  return { x: clamp(value.x, ARCHIVE_FLOOR.left, ARCHIVE_FLOOR.right, .54),
    y: clamp(value.y, ARCHIVE_FLOOR.top, ARCHIVE_FLOOR.bottom, .94) };
}

export function normalizeArchive(value, notices = []) {
  if (!value || value.version !== 1) return emptyArchive();
  const known = new Set(notices.map(notice => notice.id));
  const seen = new Set();
  const entries = (Array.isArray(value.entries) ? value.entries : []).slice(0, 5000).flatMap(entry => {
    if (!identifier(entry?.id) || seen.has(entry.id) || !isNoticeDate(entry.archivedOn)) return [];
    const noticeIds = [...new Set((Array.isArray(entry.noticeIds) ? entry.noticeIds : []).filter(id => identifier(id) && known.has(id)))];
    if (!noticeIds.length || (entry.restoredOn && (!isNoticeDate(entry.restoredOn) || compareDates(entry.restoredOn, entry.archivedOn) < 0))) return [];
    seen.add(entry.id);
    return [{ id: entry.id, noticeIds, archivedOn: noticeDate(entry.archivedOn),
      ...(entry.restoredOn ? { restoredOn: noticeDate(entry.restoredOn) } : {}),
      ...floorPosition(entry), variant: Math.round(clamp(entry.variant, 0, 2, 0)),
      ...(identifier(entry.pileId) ? { pileId: entry.pileId } : {}),
      ...(identifier(entry.posterId) ? { posterId: entry.posterId } : {}) }];
  });
  const pileIds = new Set();
  const piles = (Array.isArray(value.piles) ? value.piles : []).slice(0, 1000).flatMap(pile => {
    if (!identifier(pile?.id) || pileIds.has(pile.id) || !entries.some(entry => entry.pileId === pile.id)) return [];
    pileIds.add(pile.id);
    return [{ id: pile.id, ...floorPosition(pile) }];
  });
  entries.forEach(entry => { if (entry.pileId && !pileIds.has(entry.pileId)) delete entry.pileId; });
  return { version: 1, entries, piles };
}

export function visibleArchiveEntries(archive, notices, date, { includeSecret = false, activeOnly = true } = {}) {
  const known = new Map(notices.map(notice => [notice.id, notice]));
  return (archive?.entries || []).filter(entry => activeOnly ? activeAt(entry, date) : compareDates(entry.archivedOn, date) <= 0)
    .flatMap(entry => {
      const visibleNoticeIds = entry.noticeIds.filter(id => known.has(id) && hasAppeared(known.get(id), date)
        && (includeSecret || !known.get(id).secret));
      return visibleNoticeIds.length ? [{ ...entry, visibleNoticeIds }] : [];
    });
}

export function archiveFloorObjects(archive, notices, date, options) {
  const entries = visibleArchiveEntries(archive, notices, date, options);
  const grouped = new Map();
  for (const entry of entries) {
    const key = entry.pileId || entry.id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(entry);
  }
  return [...grouped].map(([id, members]) => {
    const pile = archive.piles.find(pile => pile.id === id);
    return { id, kind: pile ? 'pile' : 'single', entries: members,
      x: pile?.x ?? members[0].x, y: pile?.y ?? members[0].y,
      variant: members[0].variant, size: members.length < 5 ? 'small' : members.length < 10 ? 'medium' : 'large' };
  });
}

export function archiveNotices(archive, notices, ids, { id, date, position, posterId = '' }) {
  const selected = notices.filter(notice => ids.includes(notice.id));
  if (!identifier(id) || archive.entries.some(entry => entry.id === id) || !selected.length || !isNoticeDate(date)) throw Error('Der Aushang kann nicht abgelegt werden.');
  if (selected.some(notice => !hasAppeared(notice, date) || isArchivedAt(archive, notice.id, date))) {
    throw Error('Der Aushang ist an diesem Tag nicht an der Tafel.');
  }
  const variant = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 3;
  const entry = { id, noticeIds: selected.map(notice => notice.id), archivedOn: noticeDate(date),
    ...floorPosition(position), variant, ...(posterId ? { posterId } : {}) };
  const next = { ...archive, entries: [...archive.entries, entry] };
  assertArchiveState(next, notices);
  return next;
}

export function restoreArchiveEntry(archive, id, date) {
  const entry = archive.entries.find(entry => entry.id === id);
  if (!entry || !activeAt(entry, date)) throw Error('Dieser Aushang ist an diesem Tag nicht abgelegt.');
  return { ...archive, entries: archive.entries.map(item => item.id === id ? { ...item, restoredOn: noticeDate(date) } : item) };
}

export function moveArchiveObject(archive, id, position) {
  const fields = floorPosition(position);
  return { ...archive, entries: archive.entries.map(entry => entry.id === id ? { ...entry, ...fields } : entry),
    piles: archive.piles.map(pile => pile.id === id ? { ...pile, ...fields } : pile) };
}

export function mergeArchiveObjects(archive, objects, sourceId, targetId, pileId) {
  if (objects.reduce((sum, object) => sum + object.entries.length, 0) < 3) throw Error('Ab drei abgelegten Aushängen könnt Ihr Haufen bilden.');
  const source = objects.find(item => item.id === sourceId), target = objects.find(item => item.id === targetId);
  if (!source || !target || source === target) return archive;
  const id = target.kind === 'pile' ? target.id : pileId;
  if (!identifier(id)) throw Error('Der Papierhaufen benötigt eine Kennung.');
  const members = new Set([...source.entries, ...target.entries].map(entry => entry.id));
  const entries = archive.entries.map(entry => members.has(entry.id) ? { ...entry, pileId: id } : entry);
  const piles = archive.piles.filter(pile => pile.id !== id && entries.some(entry => entry.pileId === pile.id));
  piles.push({ id, x: target.x, y: target.y });
  return { version: 1, entries, piles };
}

export function assertArchiveState(archive, notices) {
  if (!archive || archive.version !== 1 || !Array.isArray(archive.entries) || !Array.isArray(archive.piles)
    || archive.entries.length > 5000 || archive.piles.length > 1000) throw Error('Ungültiges Aushangarchiv.');
  const normalized = normalizeArchive(archive, notices);
  if (JSON.stringify(canonical(normalized)) !== JSON.stringify(canonical(archive))) throw Error('Das Aushangarchiv enthält ungültige Daten oder Verweise.');
  const occupied = new Map();
  for (const entry of archive.entries) for (const id of entry.noticeIds) {
    const notice = notices.find(notice => notice.id === id);
    if (compareDates(entry.archivedOn, publicationDate(notice)) < 0) throw Error('Ein Aushang wurde vor seinem Erscheinen abgelegt.');
    const intervals = occupied.get(id) || [];
    const end = entry.restoredOn ? compareDates(entry.restoredOn, { year: 1, month: 1, day: 1 }) : Infinity;
    const start = compareDates(entry.archivedOn, { year: 1, month: 1, day: 1 });
    if (intervals.some(interval => start < interval.end && end > interval.start)) throw Error('Ein Aushang besitzt überlappende Archivzeiten.');
    intervals.push({ start, end }); occupied.set(id, intervals);
  }
}

// Repository-authored completed examples are seeded once, through the same
// acknowledgement ledger as content updates. Restores and local edits prevail.
export function mergeAuthoredArchiveState(state, seeds = []) {
  if (!seeds.length) return state;
  const applied = new Set(state.appliedAuthoredUpdateIds || []);
  let archive = normalizeArchive(state.noticeArchive, state.zettel);
  for (const seed of seeds) {
    const marker = `${seed.id}:initial-archive-v1`;
    if (applied.has(marker)) continue;
    const selected = state.zettel.filter(notice => seed.noticeIds.includes(notice.id));
    if (selected.length === seed.noticeIds.length && !archive.entries.some(entry =>
      entry.id === seed.id || entry.noticeIds.some(id => seed.noticeIds.includes(id)))
      && selected.every(notice => hasAppeared(notice, seed.archivedOn))) {
      archive = archiveNotices(archive, state.zettel, seed.noticeIds, {
        id: seed.id, date: seed.archivedOn, position: seed, posterId: seed.posterId,
      });
    }
    applied.add(marker);
  }
  return { ...state, ...(archive.entries.length ? { noticeArchive: archive } : {}), appliedAuthoredUpdateIds: [...applied] };
}
