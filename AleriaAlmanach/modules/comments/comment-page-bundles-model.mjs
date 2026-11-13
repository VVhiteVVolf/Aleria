// Shared, presentation-only page boundaries. No comment content or game state lives here.
export const BUNDLE_SCHEMA = 'aleria.comment-page-bundles';

export class CommentPageBundleError extends Error {
  constructor(code, message) { super(message); this.name = 'CommentPageBundleError'; this.code = code; }
}
const fail = (code, message) => { throw new CommentPageBundleError(code, message); };
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function identifier(value, label = 'Kennung') {
  if (typeof value !== 'string' || !value.trim() || value.length > 700 || /[\/\u0000-\u001f]/.test(value)) fail('invalid-argument', `${label} ist ungültig.`);
  return value.trim();
}
export function validateBundleThreadId(value) {
  const id = identifier(value, 'Szenenkennung');
  if (!/^.+::session:.+$/.test(id) || new TextEncoder().encode(id).length > 1400) fail('invalid-argument', 'Wähle eine interaktive Szene.');
  return id;
}
export function normalizeBundleTitle(value) {
  if (typeof value !== 'string') fail('invalid-argument', 'Gib einen Seitentitel ein.');
  const title = value.trim().replace(/\s+/g, ' ');
  if (!title || title.length > 120) fail('invalid-argument', 'Der Seitentitel braucht 1 bis 120 Zeichen.');
  return title;
}
function anchor(value) {
  if (!object(value) || !Number.isFinite(value.order) || !Number.isFinite(value.time)) fail('invalid-argument', 'Die Kommentargrenze ist ungültig.');
  return { id: identifier(value.id, 'Kommentargrenze'), order: value.order, time: value.time, stable: value.stable === true };
}
export function normalizeBundlePage(value) {
  if (!object(value)) fail('invalid-argument', 'Die Seite ist ungültig.');
  const page = { id: identifier(value.id, 'Seitenkennung'), title: normalizeBundleTitle(value.title), start: anchor(value.start), end: anchor(value.end), before: value.before == null ? null : anchor(value.before) };
  if (compareBundlePositions(page.start, page.end) > 0) fail('invalid-argument', 'Das Seitenende liegt vor ihrem Anfang.');
  return page;
}
export function emptyBundleMetadata() {
  return { schema: BUNDLE_SCHEMA, version: 1, revision: 0, pages: [], lastMutationId: '', lastMutationHash: '', updatedBy: '' };
}
export function normalizeBundleMetadata(value) {
  if (value == null) return emptyBundleMetadata();
  if (!object(value) || value.schema !== BUNDLE_SCHEMA || value.version !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 0 || !Array.isArray(value.pages)) {
    fail('failed-precondition', 'Diese Seiteneinteilung kann noch nicht bearbeitet werden. Lade die Szene neu.');
  }
  const pages = value.pages.map(normalizeBundlePage);
  if (new Set(pages.map(page => page.id)).size !== pages.length) fail('failed-precondition', 'Die Seiteneinteilung enthält doppelte Kennungen.');
  return { schema: BUNDLE_SCHEMA, version: 1, revision: value.revision, pages,
    lastMutationId: typeof value.lastMutationId === 'string' ? value.lastMutationId : '',
    lastMutationHash: typeof value.lastMutationHash === 'string' ? value.lastMutationHash : '',
    updatedBy: typeof value.updatedBy === 'string' ? value.updatedBy : '' };
}
export function compareBundlePositions(left, right) { return left.order - right.order || left.time - right.time; }

export function normalizeBundleMutation(operation) {
  if (!object(operation)) fail('invalid-argument', 'Wähle eine Seitenaktion.');
  if (operation.kind === 'create') return { kind: 'create', page: normalizeBundlePage(operation.page), replaceIds: [...new Set((Array.isArray(operation.replaceIds) ? operation.replaceIds : []).map(id => identifier(id)))].sort() };
  if (operation.kind === 'rename') return { kind: 'rename', pageId: identifier(operation.pageId, 'Seitenkennung'), title: normalizeBundleTitle(operation.title) };
  if (operation.kind === 'remove') return { kind: 'remove', pageId: identifier(operation.pageId, 'Seitenkennung') };
  fail('invalid-argument', 'Unbekannte Seitenaktion.');
}

export function applyBundleMutation(value, operation, actorUid, mutationId) {
  const metadata = normalizeBundleMetadata(value);
  const actor = identifier(actorUid, 'Anmeldung'), mutation = identifier(mutationId, 'Auftragskennung');
  if (!object(operation)) fail('invalid-argument', 'Wähle eine Seitenaktion.');
  let pages = metadata.pages.slice();
  if (operation.kind === 'create') {
    const page = normalizeBundlePage(operation.page);
    if (pages.some(existing => existing.id === page.id)) fail('already-exists', 'Diese Seite wurde bereits angelegt.');
    const replacements = Array.isArray(operation.replaceIds) ? operation.replaceIds : [];
    if (replacements.length > pages.length) fail('invalid-argument', 'Die gewählten Bündel sind nicht mehr vorhanden.');
    const ids = new Set(replacements.map(id => identifier(id)));
    for (const id of ids) {
      const old = pages.find(existing => existing.id === id);
      if (!old || compareBundlePositions(page.start, old.start) > 0 || compareBundlePositions(page.end, old.end) < 0) {
        fail('failed-precondition', 'Eine benannte Seite kann nur vollständig mit eingebunden werden.');
      }
    }
    pages = pages.filter(existing => !ids.has(existing.id));
    if (pages.some(existing => compareBundlePositions(page.start, existing.end) <= 0 && compareBundlePositions(page.end, existing.start) >= 0)) {
      fail('failed-precondition', 'Dieser Bereich ist bereits gebündelt. Beziehe die vorhandenen Seiten mit ein oder bearbeite sie einzeln.');
    }
    pages.push(page);
    pages.sort((left, right) => compareBundlePositions(left.start, right.start));
  } else if (operation.kind === 'rename' || operation.kind === 'remove') {
    const id = identifier(operation.pageId, 'Seitenkennung');
    const index = pages.findIndex(page => page.id === id);
    if (index < 0) fail('not-found', 'Diese benannte Seite ist nicht mehr vorhanden.');
    if (operation.kind === 'rename') pages[index] = { ...pages[index], title: normalizeBundleTitle(operation.title) };
    else pages.splice(index, 1);
  } else fail('invalid-argument', 'Unbekannte Seitenaktion.');
  return { ...metadata, revision: metadata.revision + 1, pages, updatedBy: actor, lastMutationId: mutation };
}

function lowerBound(items, position, after = false) {
  let low = 0, high = items.length;
  while (low < high) {
    const middle = (low + high) >>> 1, comparison = compareBundlePositions(items[middle], position);
    if (comparison < 0 || (after && comparison === 0)) low = middle + 1;
    else high = middle;
  }
  return low;
}
export function resolveBundleRanges(items, pages) {
  const byId = new Map(items.map((item, index) => [item.id, index]));
  const ranges = [], unresolved = [];
  for (const page of pages) {
    const start = byId.has(page.start.id) ? byId.get(page.start.id) : page.start.stable ? lowerBound(items, page.start) : null;
    let end;
    if (page.before && byId.has(page.before.id)) end = byId.get(page.before.id) - 1;
    else if (page.before?.stable) end = lowerBound(items, page.before) - 1;
    else if (byId.has(page.end.id)) end = byId.get(page.end.id);
    else end = page.end.stable ? lowerBound(items, page.end, true) - 1 : null;
    if (start == null || end == null || start < 0 || end < start || start >= items.length) { unresolved.push(page.id); continue; }
    ranges.push({ page, start, end: Math.min(items.length - 1, end) });
  }
  ranges.sort((left, right) => left.start - right.start);
  const accepted = [];
  for (const range of ranges) {
    if (accepted.length && range.start <= accepted[accepted.length - 1].end) unresolved.push(range.page.id);
    else accepted.push(range);
  }
  return { ranges: accepted, unresolved };
}
export function partitionBundleItems(items, pages) {
  const resolved = resolveBundleRanges(items, pages), groups = [], owners = new Map();
  let cursor = 0;
  for (const range of resolved.ranges) {
    if (range.start > cursor) groups.push({ type: 'comments', items: items.slice(cursor, range.start) });
    const members = items.slice(range.start, range.end + 1);
    groups.push({ type: 'bundle', id: range.page.id, label: range.page.title, items: members });
    members.forEach(item => owners.set(item.id, range.page));
    cursor = range.end + 1;
  }
  if (cursor < items.length) groups.push({ type: 'comments', items: items.slice(cursor) });
  return { groups, owners, ...resolved };
}
function itemAnchor(item) { return { id: item.id, order: item.order, time: item.time, stable: item.stable === true }; }
export function planBundleBefore(items, pages, commentId, { includeComment = false, includeBundles = false } = {}) {
  const selected = items.findIndex(item => item.id === commentId);
  if (selected < 0) fail('not-found', 'Der gewählte Kommentar ist nicht mehr vorhanden.');
  const end = selected - (includeComment ? 0 : 1), resolved = resolveBundleRanges(items, pages);
  const containing = resolved.ranges.find(range => range.start <= selected && range.end >= selected);
  if (containing) return { existingPage: containing.page, count: 0 };
  const previous = resolved.ranges.filter(range => range.end <= end);
  const start = includeBundles ? 0 : previous.length ? previous[previous.length - 1].end + 1 : 0;
  if (end < start) return { count: 0, replaceIds: [], start: null, end: null, before: null };
  return { count: end - start + 1, start: itemAnchor(items[start]), end: itemAnchor(items[end]),
    before: includeComment ? null : itemAnchor(items[selected]),
    replaceIds: includeBundles ? previous.map(range => range.page.id) : [] };
}
