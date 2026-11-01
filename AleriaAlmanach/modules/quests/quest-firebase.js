import { readFirebaseModuleEntry } from '../module-store/module-entry-serialization.js';
import { readQuestBoardSource } from './quest-board-source.js';
// Owns every Firebase read/write for the quest feature. UI receives this contract.
export function createQuestRepository({ db, sdk, functions, httpsCallable, requireUser, auth, authSdk }) {
  const commit = httpsCallable(functions, 'commitQuest', { timeout: 60000 });
  const inventory = httpsCallable(functions, 'commitGroupInventory', { timeout: 60000 });
  const records = snapshot => snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  const list = name => sdk.collection(db, name);
  const sourceError = (source, error) => Object.assign(new Error(String(error.code || '').includes('permission-denied')
    ? 'Das gemeinsame Journal ist für diese Sitzung noch nicht freigegeben. Bitte die Almanach-Anmeldung und Online-Anbindung prüfen.'
    : error.message), { source });
  const runQuery = view => sdk.query(list('quest_runs'), sdk.where('status', view === 'archive' ? 'in' : '==', view === 'archive' ? ['completed','abandoned'] : 'active'));
  const sceneQuery = (id, window = {}) => {
    const filters = [sdk.where('entryId', '==', id)];
    if (window.after != null) filters.push(sdk.where('orderKey', '>', window.after));
    if (window.through != null) filters.push(sdk.where('orderKey', '<=', window.through));
    return sdk.query(list('comments'), ...filters, sdk.orderBy('orderKey', 'desc'));
  };
  const paged = async (query, cursor, count = 100, field = 'updatedAt') => {
    const constraints = [sdk.orderBy(field, 'desc'), sdk.limit(count)];
    if (cursor) constraints.push(sdk.startAfter(cursor));
    const snapshot = await sdk.getDocs(sdk.query(query, ...constraints));
    return { records: records(snapshot), cursor: snapshot.size === count ? snapshot.docs.at(-1) : null };
  };
  return Object.freeze({
    subscribe(onNext, onError, boards = []) {
      let stopped = false, refreshing = null, refreshedAt = 0;
      const watch = (source, query, project) => sdk.onSnapshot(query, snapshot => {
        try { onNext({ ...project(snapshot), source }); }
        catch (error) { onError(sourceError(source, error)); }
      }, error => onError(sourceError(source, error)));
      const stops = [watch('quests', list('quests'), snapshot => ({ quests: records(snapshot) })),
        watch('active', sdk.query(runQuery('active'), sdk.orderBy('updatedAt', 'desc'), sdk.limit(100)), snapshot => ({ activeRuns: records(snapshot), activeCursor: snapshot.size === 100 ? snapshot.docs.at(-1) : null })),
        watch('archive', sdk.query(runQuery('archive'), sdk.orderBy('endedKey', 'desc'), sdk.limit(100)), snapshot => ({ archivedRuns: records(snapshot), archiveCursor: snapshot.size === 100 ? snapshot.docs.at(-1) : null })),
        watch('modules', list('module_store_entries'), snapshot => ({ modules: records(snapshot).map(readFirebaseModuleEntry).filter(Boolean) }))];
      const refreshBoards = () => refreshing ||= Promise.all(boards.map(board => readQuestBoardSource(board, {
        async readPublished(board) { const response = await fetch(`/Anzeigetafeln/${board.dataPath}`, { cache: 'no-cache' }); return response.ok ? response.json() : null; },
        async readLegacy(board) {
          const snapshot = await sdk.getDoc(sdk.doc(db, board.firebase?.collection || 'anzeigetafeln', board.firebase?.docId || board.id));
          return snapshot.exists() ? snapshot.data() : null;
        }
      }))).then(rows => { refreshedAt = Date.now(); if (!stopped) onNext({ boards: rows, source: 'boards' }); })
        .catch(error => { if (!stopped) onError(sourceError('boards', error)); })
        .finally(() => { refreshing = null; });
      const focus = () => { if (Date.now() - refreshedAt > 2000) void refreshBoards(); };
      if (boards.length) { void refreshBoards(); globalThis.addEventListener?.('focus', focus); }
      return () => { stopped = true; stops.forEach(stop => stop()); globalThis.removeEventListener?.('focus', focus); };
    },
    context({ moduleId, threadIds = [], memberKeys = [], questIds = [], runIds = [] }, next, error) {
      const results = new Map(), stops = [];
      const watch = (key, type, query, single = false) => stops.push(sdk.onSnapshot(query, snapshot => {
        results.set(key, { type, rows: single ? snapshot.exists() ? [{ ...snapshot.data(), id: snapshot.id }] : [] : records(snapshot) });
        const rows = type => [...new Map([...results.values()].filter(row => row.type === type).flatMap(row => row.rows).map(row => [row.id, row])).values()];
        next({ quests: rows('quests'), runs: rows('runs') });
      }, cause => error(sourceError(key, cause))));
      const watchRuns = (key, constraint) => {
        // Independent windows keep old completions from displacing active play.
        // The full journal owns pagination beyond these contextual previews.
        for (const view of ['active', 'archive']) watch(`${key}:${view}`, 'runs', sdk.query(runQuery(view), constraint,
          sdk.orderBy(view === 'archive' ? 'endedKey' : 'updatedAt', 'desc'), sdk.limit(50)));
      };
      watch('quests:module', 'quests', sdk.query(list('quests'), sdk.where('links.modules', 'array-contains', moduleId), sdk.limit(50)));
      watchRuns('module', sdk.where('links.modules', 'array-contains', moduleId));
      for (const threadId of [...new Set(threadIds)].slice(0, 12)) watchRuns(`scene:${threadId}`, sdk.where('links.scenes', 'array-contains', threadId));
      const keys = [...new Set(memberKeys)];
      // Two archived statuses × fifteen party keys = thirty Firestore disjunctions.
      for (let offset = 0; offset < Math.min(keys.length, 180); offset += 15) watchRuns(`party:${offset}`, sdk.where('partyKeys', 'array-contains-any', keys.slice(offset, offset + 15)));
      for (const id of questIds) watch(`quest:${id}`, 'quests', sdk.doc(db, 'quests', id), true);
      for (const id of runIds) watch(`run:${id}`, 'runs', sdk.doc(db, 'quest_runs', id), true);
      return () => stops.forEach(stop => stop());
    },
    async access() { const user = await requireUser(); return { uid: user.uid, role: (await user.getIdTokenResult()).claims.aleriaRole || 'player' }; },
    watchAccess(next) { return authSdk.onIdTokenChanged(auth, async user => next(user ? { uid: user.uid, role: (await user.getIdTokenResult()).claims.aleriaRole || 'player' } : null)); },
    async commit(input) { await requireUser(); return (await commit(input)).data; },
    async inventory(input) { await requireUser(); return (await inventory(input)).data; },
    groupAccount(id, next, error) { return sdk.onSnapshot(sdk.doc(db, 'group_quest_accounts', id), snapshot => next(snapshot.exists() ? { ...snapshot.data(), id } : null), error); },
    async more(cursor, view = 'active') { return paged(runQuery(view), cursor, 100, view === 'archive' ? 'endedKey' : 'updatedAt'); },
    async run(id) { const snapshot = await sdk.getDoc(sdk.doc(db, 'quest_runs', id)); return snapshot.exists() ? { ...snapshot.data(), id } : null; },
    events(id, next, error) { return sdk.onSnapshot(sdk.query(list('quest_events'), sdk.where('runId', '==', id), sdk.orderBy('sequence', 'asc')), snapshot => next(records(snapshot)), error); },
    scene(id, next, error, window) { return sdk.onSnapshot(sdk.query(sceneQuery(id, window), sdk.limit(200)), snapshot => next(records(snapshot), snapshot.size === 200 ? snapshot.docs.at(-1) : null), error); },
    async moreScene(id, cursor, window) { const snapshot = await sdk.getDocs(sdk.query(sceneQuery(id, window), sdk.startAfter(cursor), sdk.limit(200)));
      return { records: records(snapshot), cursor: snapshot.size === 200 ? snapshot.docs.at(-1) : null }; },
    async party() { return (await Promise.all(['characters', 'creatures'].map(async (name, index) => records(await sdk.getDocs(list(name))).map(row => ({ kind: index ? 'creature' : 'character', recordId: row.id, name: row.name, ownerUid: row.ownerUid })) ))).flat(); },
    async evidence(id) { const snapshot = await sdk.getDoc(sdk.doc(db, 'comments', id)); return snapshot.exists() ? { ...snapshot.data(), id } : null; },
    watchWorldDate(next, error) { return sdk.onSnapshot(sdk.doc(db, 'almanach_settings', 'current-date'), snapshot => next(snapshot.exists() ? snapshot.data() : null), error); },
    async worldDate() { const snapshot = await sdk.getDoc(sdk.doc(db, 'almanach_settings', 'current-date')); return snapshot.exists() ? snapshot.data() : null; }
  });
}
