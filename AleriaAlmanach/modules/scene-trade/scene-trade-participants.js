import { normalizeSceneTradeSearch } from './scene-trade-catalog.js';

const indexes = new WeakMap();
const clean = value => String(value || '').trim();
export function sceneTradePersonAliases(record) {
  return (Array.isArray(record?.aliases) ? record.aliases : String(record?.aliases || '').split(/[,;\n]+/))
    .filter(value => typeof value === 'string').map(clean).filter(Boolean);
}
function indexCharacters(characters) {
  if (indexes.has(characters)) return indexes.get(characters);
  const ids = new Map(), names = new Map();
  const add = (map, key, record) => {
    if (!key) return;
    if (!map.has(key)) map.set(key, record);
    else if (map.get(key)?.id !== record.id) map.set(key, null);
  };
  for (const record of characters) {
    if (!record?.id || record.archived) continue;
    for (const value of [record.id, record.identity?.worldPersonId, record.genealogy?.worldPersonId, record.worldPersonId]) add(ids, clean(value), record);
    for (const value of [record.name, ...sceneTradePersonAliases(record)]) add(names, normalizeSceneTradeSearch(value), record);
  }
  const result = { ids, names }; indexes.set(characters, result); return result;
}

export function sceneTradeCommentParticipants(comments = []) {
  const refs = new Map();
  const add = (id, name, narrator) => {
    if (narrator) return;
    const ref = { id: clean(id), name: clean(name) };
    if (ref.id || ref.name) refs.set(ref.id ? `id:${ref.id}` : `name:${normalizeSceneTradeSearch(ref.name)}`, ref);
  };
  for (const comment of comments) {
    if (!comment || comment.deleted || comment.archived) continue;
    add(comment.characterId, comment.charName, comment.narrator || comment.commentMode === 'narrator' || comment.actorType === 'creature');
    for (const segment of comment.commentSegments || []) {
      add(segment.characterId || segment.sceneActorSourceId, segment.charName || segment.name,
        segment.narrator || segment.kind === 'narrator' || segment.actorType === 'creature');
    }
    // Stored receipts identify actual participants without parsing narrative text.
    add(comment.sceneTrade?.actorCharacterId || comment.sceneTrade?.actor?.id, '', false);
    add(comment.sceneInventoryTransfer?.giver?.id || comment.sceneInventoryTransfer?.giverId, '', false);
    add(comment.sceneInventoryTransfer?.receiver?.id || comment.sceneInventoryTransfer?.receiverId, '', false);
    for (const participant of comment.sceneTrade?.participants || []) {
      if (participant.kind !== 'group') add(participant.characterId || participant.id, participant.name, false);
    }
  }
  return [...refs.values()];
}

function hierarchyReferences(hierarchy, add) {
  if (!hierarchy || typeof hierarchy !== 'object') return;
  const visited = new Set();
  function node(record) {
    if (!record || typeof record !== 'object' || visited.has(record)) return;
    visited.add(record);
    const explicit = record.characterId || record.worldPersonId || record.identity?.worldPersonId || record.personId;
    add({ id: explicit || record.id, name: record.title || record.name, allowName: !explicit });
    for (const child of record.children || []) node(child);
  }
  for (const source of [hierarchy, ...(hierarchy.trees || [])]) {
    for (const level of source.levels || []) for (const record of level.nodes || []) node(record);
    for (const record of source.nodes || []) node(record);
  }
}

/** Context membership controls suggestions only. Inventory permissions stay authoritative. */
export function resolveSceneTradeParticipants({ characters = [], entries = [], references = [], includeIds = [], excludeIds = [], preferredActorId = '' } = {}) {
  const { ids, names } = indexCharacters(characters), selected = new Map();
  function add(ref, reason) {
    if (typeof ref === 'string') ref = { id: ref };
    const id = clean(ref?.id), name = normalizeSceneTradeSearch(ref?.name);
    const record = ids.get(id) || ((!id || ref?.allowName) && name ? names.get(name) : null);
    if (!record) return;
    const reasons = selected.get(record.id) || new Set(); reasons.add(reason); selected.set(record.id, reasons);
  }
  for (const entry of entries.filter(Boolean)) {
    for (const source of [entry, ...(entry.pages || [])]) {
      for (const id of source.sessionCast || []) add(id, 'Modulbesetzung');
      for (const detail of source.sessionCastDetails || []) add(detail.id, 'Modulbesetzung');
      hierarchyReferences(source.hierarchy, ref => add(ref, 'Modulhierarchie'));
    }
  }
  for (const ref of references) add(ref, 'Bereits im Modul aufgetreten');
  if (preferredActorId) add(preferredActorId, 'Im Inventar gewählt');
  for (const id of includeIds) add(id, 'Manuell ergänzt');
  for (const id of excludeIds) {
    const record = ids.get(clean(id)); if (record) selected.delete(record.id);
  }
  return { ids: new Set(selected.keys()), reasons: selected,
    characters: characters.filter(record => selected.has(record.id) && !record.archived) };
}

export function sceneTradeSelectableAccounts(accounts, participants) {
  if (!participants?.ids) return accounts;
  return accounts.filter(account => account.kind === 'group' || participants.ids.has(account.id));
}
