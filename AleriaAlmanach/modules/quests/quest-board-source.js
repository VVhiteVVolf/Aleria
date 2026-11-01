// Boards publish their canonical state as JSON through world-content-publisher.
// Firebase is a read-only legacy fallback, as in the board's own storage adapter.
export async function readQuestBoardSource(board, { readPublished, readLegacy }) {
  let published = null;
  try { published = await readPublished(board); } catch { /* Try the supported legacy fallback. */ }
  if (published?.state && typeof published.state === 'object') return { id: board.id, state: published.state };
  if (Array.isArray(published?.zettel)) return { id: board.id, state: published };
  const legacy = await readLegacy(board), value = legacy?.data;
  const state = typeof value === 'string' ? JSON.parse(value) : value;
  if (state && typeof state === 'object') return { id: board.id, state };
  throw Error(`Die veröffentlichte Fassung von ${board.title || board.id} ist derzeit nicht erreichbar.`);
}
