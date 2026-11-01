import { mergeQuestSources, questsFromBoard, questsFromModules } from './quest-sources.js';
import { questAvailabilityAt, questWorldDate } from './quest-board-availability.js';

export function createQuestStore(catalog, { mergeBoard = (board, state) => questsFromBoard(board, state, catalog.maps), worldDate } = {}) {
  const listeners = new Set(), extras = new Map(), failures = new Map(), ready = new Set(), pagedViews = new Set();
  let repository, stop, state = { catalog, quests: catalog.quests, worldDate: questWorldDate(worldDate), runs: [], access: null, online: false, error: '', cursor: null, activeCursor: null, archiveCursor: null };
  let sourceQuests = catalog.quests, saved = [], boardQuests = new Map(), moduleQuests = [], generation = 0, activeRuns = [], archivedRuns = [];
  let liveModuleIds = new Set(), boardUpdate = 0;
  const snapshot = () => {
    const quests = mergeQuestSources(sourceQuests, saved);
    return { ...state, runs: [...new Map([...extras.values(), ...state.runs].map(row => [row.id, row])).values()], quests,
      availableQuests: quests.filter(quest => questAvailabilityAt(quest, state.worldDate) === 'available') };
  };
  const publish = () => {
    state.error = [...new Set(failures.values())].join(' · ');
    state.online = !failures.size && (ready.has('legacy') || ['quests','active','archive'].every(source => ready.has(source)));
    listeners.forEach(listener => listener(snapshot()));
  };
  return {
    snapshot,
    setWorldDate(value) { state.worldDate = questWorldDate(value, state.worldDate); publish(); },
    subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); },
    connect(adapter) {
      stop?.(); repository = adapter; failures.clear(); ready.clear(); pagedViews.clear();
      const current = ++generation;
      const stopRecords = repository.subscribe(async update => {
        try {
          if (current !== generation) return;
          if (update.quests) saved = update.quests;
          if (update.runs) state.runs = update.runs;
          if (update.activeRuns) activeRuns = update.activeRuns;
          if (update.archivedRuns) archivedRuns = update.archivedRuns;
          if (update.activeRuns || update.archivedRuns) state.runs = [...activeRuns, ...archivedRuns];
          if ('cursor' in update) state.cursor = update.cursor;
          if ('activeCursor' in update && !pagedViews.has('active')) state.activeCursor = update.activeCursor;
          if ('archiveCursor' in update && !pagedViews.has('archive')) state.archiveCursor = update.archiveCursor;
          if (update.boards) {
            const sequence = ++boardUpdate, values = [];
            for (const board of catalog.boards) {
              const online = update.boards.find(row => row.id === (board.firebase?.docId || board.id));
              if (online) values.push([board.id, await mergeBoard(board, online.state || online)]);
            }
            if (current !== generation || sequence !== boardUpdate) return;
            for (const [id, quests] of values) boardQuests.set(id, quests);
          }
          if (update.modules) {
            const publicModules = update.modules.filter(row => !row.hidden && !row.isTemplate && !row.archived && row.title !== '[PLATZHALTER]');
            moduleQuests = questsFromModules(publicModules);
            const liveIds = new Set(update.modules.map(row => row.id));
            liveModuleIds = liveIds;
            const modules = [...catalog.modules.filter(row => !liveIds.has(row.id)), ...publicModules.map(row => ({ id: row.id, title: row.title }))];
            state.catalog = { ...catalog, modules, groups: publicModules.filter(row => row.pages?.some(page => page.landing?.group)).map(row => ({ id: row.id, title: row.title })), scenes: [...new Map([...(catalog.scenes || []), ...publicModules.map(row => ({ id: row.id, title: row.title, moduleId: row.id }))].map(row => [row.id, row])).values()] };
          }
          if (current !== generation) return;
          sourceQuests = [...catalog.quests.filter(quest => !quest.links.boards.some(id => boardQuests.has(id)) && !(quest.id.startsWith('module:') && quest.links.modules.some(id => liveModuleIds.has(id)))), ...[...boardQuests.values()].flat(), ...moduleQuests];
          failures.delete(update.source || 'legacy'); ready.add(update.source || 'legacy'); publish();
        } catch (error) { failures.set(update.source || 'legacy', error.message); publish(); }
      }, error => { failures.set(error.source || 'legacy', error.message); publish(); }, catalog.boards);
      const stopAuth = repository.watchAccess(access => { state.access = access; publish(); });
      stop = () => { stopRecords(); stopAuth(); };
    },
    async more(view = 'active') {
      const key = view === 'archive' ? 'archiveCursor' : 'activeCursor', cursor = state[key] || state.cursor;
      if (!cursor) return;
      const page = await repository.more(cursor, view); for (const run of page.records) extras.set(run.id, run);
      state[key] = page.cursor; state.cursor = null; pagedViews.add(view); publish();
    },
    async loadRun(id) { const run = await repository.run(id); if (run) { extras.set(run.id, run); publish(); } return run; },
    async commit(input) {
      const result = await repository.commit(input);
      if (result.quest) saved = mergeQuestSources(saved, [result.quest]);
      if (result.run) extras.set(result.run.id, result.run);
      publish(); return result;
    },
    fail(error) { failures.set('connection', error.message); publish(); },
    destroy() { generation++; stop?.(); listeners.clear(); }
  };
}
