// A separate read model for the register. Summary records never enter
// _characters, scene actors, editors, export or any character write path.
const AleriaCharacterDirectory = (() => {
  const summaries = new Map(), hydration = new Map(), patches = new Map(), hydratedIds = new Set(), updates = new Map();
  const canonicalTargets = new Map();
  let request = null, complete = false, error = '', fallbackCount = 0, generation = 0, openToken = 0;
  let localSource = null;
  let cached = null, cachedGeneration = -1, cachedBase = [], cachedById = new Map();

  function getRecords() {
    const base = getAllCharacterRecords();
    if (_charactersLoaded) return base;
    if (cached && cachedGeneration === generation && cachedBase.length === base.length
      && base.every((record, i) => cachedBase[i] === record)) return cached;
    const byId = new Map(base.map(record => [String(record.id), record]));
    const byName = new Map(base.filter(record => record._builtin).map(record => [normalizeSearchText(record.name), record]));
    for (const [id, summary] of summaries) {
      if (hydratedIds.has(id) || _hiddenBuiltinCharacterIds.has(id)) continue;
      const builtin = byName.get(normalizeSearchText(summary.name));
      if (builtin && !characterWorldIdentitiesConflict(builtin, summary)) byId.delete(String(builtin.id));
      const updated = { ...summary, ...updates.get(id) };
      byId.set(id, { ...updated, _directorySummary: true,
        aliases: Array.isArray(updated.aliases) ? updated.aliases : [],
        portrait: updated.portrait || builtin?.portrait || '',
        playerOwner: normalizeCharacterPlayerOwner(updated.playerOwner || updated.playedBy || updated.player) });
    }
    cachedBase = base; cachedGeneration = generation;
    cached = [...byId.values()];
    cachedById = new Map(cached.map(record => [String(record.id), record]));
    for (const record of cached) for (const alias of record.localRecord?.firestoreDocumentIds || []) {
      if (!cachedById.has(String(alias))) cachedById.set(String(alias), record);
    }
    return cached;
  }

  function getById(id) {
    const records = getRecords();
    return _charactersLoaded ? records.find(record => String(record.id) === String(id)
      || record.localRecord?.firestoreDocumentIds?.includes(String(id))) || null : cachedById.get(String(id)) || null;
  }

  function repaint() {
    if (!document.getElementById('char-grid')) return;
    const search = document.querySelector('#char-grid [data-character-register-action="search"]');
    const selection = search && document.activeElement === search ? [search.selectionStart, search.selectionEnd] : null;
    renderCharSubtabs(); renderCharGrid();
    if (selection) {
      const current = document.querySelector('#char-grid [data-character-register-action="search"]');
      current?.focus({ preventScroll: true });
      current?.setSelectionRange(...selection);
    }
  }

  function load() {
    if (complete || _charactersLoaded) { complete = true; repaint(); return Promise.resolve(); }
    if (request) return request;
    error = '';
    fallbackCount = 0;
    request = (async () => {
      if (!_fbReady) await waitForFirebaseReady();
      if (!window._fb?.loadCharacterDirectoryPage) {
        await loadCharacters(); complete = true; return;
      }
      await loadCharacterTabData();
      let pageToken = '';
      const seenTokens = new Set(), loadedIds = new Set();
      do {
        const page = await window._fb.loadCharacterDirectoryPage({ pageToken });
        for (const record of page.records) { summaries.set(String(record.id), record); loadedIds.add(String(record.id)); }
        generation++; repaint();
        pageToken = page.nextPageToken;
        if (pageToken && seenTokens.has(pageToken)) throw new Error('Das Figurenverzeichnis konnte nicht vollständig geladen werden.');
        seenTokens.add(pageToken);
        if (pageToken) await new Promise(resolve => setTimeout(resolve, 0));
      } while (pageToken);
      for (const id of summaries.keys()) if (!loadedIds.has(id)) summaries.delete(id);
      localSource ||= await loadLocalCharacterDirectoryState();
      await localSource.loadMissing([...summaries.values()], record => {
        summaries.set(String(record.id), record); generation++;
      });
      generation++;
      complete = true;
    })().catch(async failure => {
      error = failure.message;
      localSource ||= await loadLocalCharacterDirectoryState();
      const { database } = await loadLocalCharacterDatabaseState();
      const fallback = localSource.loadSnapshot(database?.characters || []);
      for (const record of fallback) {
        if (!summaries.has(String(record.id))) summaries.set(String(record.id), record);
      }
      fallbackCount = fallback.length;
      generation++;
      if (!fallbackCount) throw failure;
    })
      .finally(() => { request = null; repaint(); });
    repaint();
    return request;
  }

  function ensureRecord(id) {
    const known = getCharacterById(id);
    if (known && !needsRecord(id)) return Promise.resolve(known);
    const key = String(id || '');
    if (!key) return Promise.reject(new Error('Keine Figur ausgewählt.'));
    if (hydration.has(key)) return hydration.get(key);
    patches.set(key, {});
    const pending = (async () => {
      if (!_fbReady) await waitForFirebaseReady();
      const local = await localSource?.loadFull(key);
      if (!window._fb?.loadCharacters && !local) throw new Error('Das vollständige Charakterprofil ist derzeit nicht erreichbar.');
      const records = window._fb?.loadCharacters
        ? await window._fb.loadCharacters({ ids: [key], fromServer: true, throwOnError: true }).catch(failure => {
          if (!local) throw failure;
          return [];
        }) : [];
      const online = records.find(item => String(item.id) === key);
      const record = online && local ? await localSource.mergeRecord(online, local) : online || local;
      if (!record) throw new Error('Dieses Charakterprofil ist nicht mehr vorhanden.');
      const full = { ...record, ...patches.get(key), id: key };
      if (full.mergeIdentity?.status === 'merged') {
        const target = String(full.mergeIdentity.canonicalCharacterId || '');
        if (!target) throw new Error('Die Hauptakte dieser Figur konnte nicht eindeutig aufgelöst werden.');
        canonicalTargets.set(key, target);
        const seen = new Set([key]);
        for (let next = target; next; next = canonicalTargets.get(next)) {
          if (seen.has(next)) throw new Error('Die Hauptakte dieser Figur enthält eine kreisförmige Zuordnung.');
          seen.add(next);
        }
        const canonical = await ensureRecord(target);
        const expected = String(full.mergeIdentity.canonicalWorldPersonId || '');
        if (characterWorldIdentitiesConflict(full, canonical)
          || (expected && getCharacterWorldIdentity(canonical) && expected !== getCharacterWorldIdentity(canonical))) {
          throw new Error('Die Identität der zugeordneten Hauptakte stimmt nicht überein.');
        }
        return canonical;
      }
      hydratedIds.add(key);
      generation++;
      handleExternallySavedCharacter({ detail: { record: full } });
      return getCharacterById(key);
    })().finally(() => { hydration.delete(key); patches.delete(key); canonicalTargets.delete(key); });
    hydration.set(key, pending);
    return pending;
  }

  function needsRecord(id) {
    return !!id && !_charactersLoaded && !hydratedIds.has(String(id))
      && (summaries.has(String(id)) || !getCharacterById(id) || _characters.some(record => String(record.id) === String(id)));
  }

  function openProfile(id) {
    const token = ++openToken, source = document.getElementById('char-grid'), tab = _activeTab;
    showAppStatus('Charakterprofil wird geladen …', 'info');
    void ensureRecord(id).then(record => {
      if (token === openToken && tab === _activeTab && (!source || source.isConnected)) openCharProfile(record.id);
    }).catch(failure => { if (token === openToken) showAppStatus(failure.message, 'error'); });
  }

  function renderStatus(grid) {
    if (complete && !error) return;
    const status = document.createElement('div');
    status.className = 'char-directory-status';
    status.setAttribute('role', 'status');
    status.textContent = error
      ? fallbackCount ? 'Online-Aktualisierung fehlgeschlagen. Die Suche verwendet den mitgelieferten Figurenbestand. ' : `${error} Bereits geladene Figuren bleiben sichtbar. `
      : `Figurenverzeichnis wird geladen. ${summaries.size} Einträge verfügbar.`;
    if (error) {
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = 'Erneut laden';
      retry.addEventListener('click', () => void load().catch(() => {}), { once: true });
      status.appendChild(retry);
    }
    grid.appendChild(status);
  }

  document.addEventListener('aleria:character-saved', event => {
    const record = event.detail?.record, key = String(record?.id || '');
    if (patches.has(key)) Object.assign(patches.get(key), record);
    updates.set(key, { ...updates.get(key), ...record });
    generation++;
    queueMicrotask(repaint);
  });
  return Object.freeze({ load, getRecords, getById, ensureRecord, renderStatus, needsRecord, openProfile,
    cancelOpening: () => { openToken++; },
    remove: id => { const key = String(id); summaries.delete(key); hydratedIds.delete(key); updates.delete(key); generation++; },
    getVisible: () => getRecords().filter(record => !record.archived && record.mergeIdentity?.status !== 'merged'),
    isComplete: () => complete || _charactersLoaded,
    isLoading: () => !error && !complete && !_charactersLoaded });
})();
