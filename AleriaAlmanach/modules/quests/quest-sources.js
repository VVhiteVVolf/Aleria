import { moduleMentions } from '../../../Anzeigetafeln/assets/js/links/notice-module-links-model.mjs';
import { normalizeQuest } from './quest-model.js';
import { AUTHORED_QUEST_PREPARATIONS } from './quest-authored-dossiers.js';
import { questBoardAvailability } from './quest-board-availability.js';
import { normalizeArchive } from '../../../Anzeigetafeln/assets/js/archive/notice-archive-model.mjs';

export const questPlainText = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// Explicit publication identity joins multi-sheet notices; names never establish identity.
export function questsFromBoard(board, state, maps = []) {
  const groups = new Map();
  const archive = normalizeArchive(state?.noticeArchive, state?.zettel || []);
  for (const notice of state?.zettel || []) {
    if (notice.secret) continue;
    const id = notice.noticeGroupId || notice.id;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(notice);
  }
  return [...groups.entries()].filter(([, rows]) => rows.some(row => ['quest', 'steckbrief', 'vermisst', 'hilfsgesuch', 'reise'].includes(row.typ) || row.rewards?.length)).map(([id, rows]) => {
    const primary = rows.find(row => row.id === id) || rows[0], summary = questPlainText(primary.text || primary.untertitel);
    const preparation = AUTHORED_QUEST_PREPARATIONS[id];
    const location = board.hierarchy?.at(-1)?.slug;
    const linkedMaps = maps.filter(map => location && map.status === 'active' && map.hierarchy?.some(row => row.slug === location)).map(map => map.id);
    return { ...normalizeQuest({ id: `notice:${board.id}:${id}`, title: primary.title || 'Auftrag ohne Titel', summary: preparation?.summary || summary,
      ...(preparation ? { dossier: preparation.dossier, objectives: preparation.objectives } : {}),
      patron: primary.verfasserName || '', links: { boards: [board.id], notices: [{ boardId: board.id, noticeId: primary.id }],
        modules: [...new Set([...rows.flatMap(row => moduleMentions(questPlainText(row.text)).map(item => item.id)), ...(preparation?.modules || [])])], maps: [...new Set([...linkedMaps, ...(preparation?.dossier.route ? [preparation.dossier.route.mapId] : [])])] },
      rewards: rows.flatMap(row => row.rewards || []).filter((row, index, all) => all.findIndex(other => JSON.stringify(other) === JSON.stringify(row)) === index) }),
      boardAvailability: questBoardAvailability(archive, rows) };
  });
}
export function questsFromModules(modules = []) {
  return modules.filter(module => !module.hidden && !module.archived && !module.isTemplate).flatMap(module => (module.pages || []).flatMap((page, index) => {
    if (!page.questFile) return [];
    const file = page.questFile;
    return [normalizeQuest({ id: `module:${module.id}:${page.id || index}`, title: file.title || module.title, summary: questPlainText(file.sectionOneText || file.description || ''),
      patron: file.clientName, links: { modules: [module.id] }, objectives: file.sectionThreeItems })];
  }));
}
export function mergeQuestSources(catalog, overrides = []) {
  const merged = new Map(catalog.map(row => [row.id, row]));
  for (const row of overrides) {
    const source = merged.get(row.id);
    // Editorial text overrides do not silently revive an archived source paper.
    merged.set(row.id, source?.boardAvailability ? { ...row, boardAvailability: source.boardAvailability } : row);
  }
  return [...merged.values()];
}
