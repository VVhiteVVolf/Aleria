import { createQuestStore } from './quest-store.js';
import { questAvailabilityAt, questWorldDate } from './quest-board-availability.js';
import { questMatches, questStampKey } from './quest-model.js';
import { e, questCard, renderQuestDetail, stampLabel } from './quest-view.js';
import { mountQuestForm } from './quest-forms.js';

export function mountQuestPage(root, { catalog, calendar, repository = null, mergeBoard, templates = async () => [] }) {
  const store = createQuestStore(catalog, { mergeBoard, worldDate: calendar.current() });
  const $ = selector => root.querySelector(selector), detail = $('[data-quest-detail]'), form = $('[data-quest-form]');
  const params = new URL(location.href).searchParams;
  let tab = ['active','available','archive','sources'].includes(params.get('view')) ? params.get('view') : params.has('board') || params.has('notice') || params.has('map') || params.has('module') ? 'available' : 'active', search = '', sort = 'newest';
  let context = Object.fromEntries(['board','notice','map','module'].filter(key => params.has(key)).map(key => [key, params.get(key)]));
  let selected = null, events = [], comments = new Map(), sceneCursors = {}, stops = [], toastTimer, selection = 0, date = calendar.current();
  const scenePages = new Map(), explicitEvidence = new Map();
  let stopDate = () => {}, connection = 0, destroyed = false;
  let state = store.snapshot(), pendingClaim;
  function toast(message) { clearTimeout(toastTimer); $('[data-quest-toast]').hidden = false; $('[data-quest-toast]').textContent = message; toastTimer = setTimeout(() => { $('[data-quest-toast]').hidden = true; }, 6000); }
  function compare(a, b) { return sort === 'title' ? a.title.localeCompare(b.title, 'de') : (sort === 'oldest' ? 1 : -1) * (a.started && b.started ? questStampKey(a.ended || a.started).localeCompare(questStampKey(b.ended || b.started)) : String(a.updatedAt || '').localeCompare(String(b.updatedAt || ''))); }
  function render() {
    for (const button of root.querySelectorAll('[data-action="create"]')) button.hidden = !['admin','moderator','editor'].includes(state.access?.role);
    const active = state.runs.filter(run => run.status === 'active'), archived = state.runs.filter(run => run.status !== 'active');
    $('[data-quest-stats]').innerHTML = [[active.length, 'Aktive Abenteuer'], [new Set(active.map(run => run.groupModuleId || `${run.groupName}|${run.party.map(member => `${member.kind}:${member.recordId}`).sort().join(',')}`)).size, 'Gruppen unterwegs'], [state.quests.length, 'Aufträge im Register'], [archived.length, 'Archivierte Abenteuer']].map(([count, label]) => `<div class="quest-stat"><strong>${count}</strong><span>${label}</span></div>`).join('');
    for (const button of root.querySelectorAll('[data-tab]')) button.setAttribute('aria-pressed', String(button.dataset.tab === tab));
    $('[data-quest-heading]').textContent = { active: 'Aktive Abenteuer', available: 'Der nächste Aufbruch', archive: 'Vergangene Abenteuer', sources: 'Die Welt hinter den Aufträgen' }[tab];
    $('[data-quest-kicker]').textContent = { active: 'AUF GEMEINSAMEN PFADEN', available: 'NEUE WEGE WARTEN', archive: 'BEWAHRTE GESCHICHTEN', sources: 'VERBUNDEN MIT ALERIA' }[tab];
    $('[data-quest-context]').hidden = !Object.keys(context).length;
    $('[data-quest-context]').innerHTML = `${e(Object.entries(context).map(([key, id]) => `${{ board: 'Tafel', map: 'Karte', notice: 'Aushang', module: 'Modul' }[key]}: ${[...catalog.boards,...catalog.maps,...catalog.modules].find(row => row.id === id)?.title || id}`).join(' · '))}<button type="button" data-action="clear-context">Alle Quests anzeigen</button>`;
    $('[data-quest-status]').textContent = state.error ? `Verbindung: ${state.error} · Öffentliche Quellen bleiben lesbar.` : state.online ? `Gemeinsames Journal verbunden${state.access ? '' : ' · Zum Mitspielen im Almanach anmelden'}.` : 'Öffentliche Quellen · Gemeinsames Journal wird verbunden …';
    $('[data-action="more"]').hidden = !(tab === 'archive' ? state.archiveCursor || state.cursor : state.activeCursor || state.cursor) || !['active','archive'].includes(tab);
    if (tab === 'sources') {
      $('[data-quest-results]').innerHTML = `<div class="quest-source-grid">${[['boards','board','Anzeigetafeln'],['maps','map','Karten'],['modules','module','Module']].map(([key, kind, title]) => `<section class="quest-source-panel"><h3>${title} <small>· ${catalog[key].length}</small></h3><ul>${catalog[key].filter(row => row.title?.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de'))).map(row => `<li><a href="${e(kind === 'board' ? `/Anzeigetafeln/${row.link}` : kind === 'map' ? `/Karten/${row.link}` : `/AleriaAlmanach/AleriaAlmanach.html?entry=${encodeURIComponent(row.id)}`)}" target="_blank" rel="noopener">${e(row.title)} ↗</a><button type="button" data-action="context" data-context="${kind}" data-id="${e(row.id)}">Quests →</button></li>`).join('')}</ul></section>`).join('')}</div>`;
    } else {
      const run = tab !== 'available', rows = (tab === 'active' ? active : tab === 'archive' ? archived : state.availableQuests).filter(row => questMatches(row, search, context)).sort(compare);
      if (!rows.length) $('[data-quest-results]').innerHTML = `<div class="quest-empty"><span aria-hidden="true">⌖</span><h3>${tab === 'active' ? 'Jede Reise beginnt mit einem Auftrag.' : 'Hier wartet die nächste Geschichte.'}</h3><p>${tab === 'active' ? 'Sobald eine Gruppe aufbricht, stehen hier ihre Quests, Gefährten und nächsten Ziele.' : tab === 'archive' ? 'Abgeschlossene und abgebrochene Abenteuer werden mit Datum und Uhrzeit bewahrt.' : 'Für diese Suche wurde kein passender Auftrag gefunden.'}</p><button class="quest-primary" type="button" data-action="browse">Offene Aufträge ansehen →</button></div>`;
      else if (tab === 'archive') {
        const groups = new Map(); for (const row of rows) { const label = calendar.format(row.ended.date, { withWeekday: false, withPlayDay: true }); if (!groups.has(label)) groups.set(label, []); groups.get(label).push(row); }
        $('[data-quest-results]').innerHTML = [...groups].map(([label, rows]) => `<h3 class="quest-archive-date">${e(label)}</h3><div class="quest-grid">${rows.map(row => questCard(row, { run, catalog, calendar })).join('')}</div>`).join('');
      } else $('[data-quest-results]').innerHTML = `<div class="quest-grid">${rows.map(row => questCard(row, { run, catalog, calendar })).join('')}</div>`;
    }
    if (selected && detail.open) renderDetail();
  }
  function current() { return selected?.kind === 'run' ? state.runs.find(row => row.id === selected.id) : state.quests.find(row => row.id === selected?.id); }
  function renderDetail() {
    const quest = current(); if (!quest) return;
    const scroll = detail.scrollTop, focused = detail.contains(document.activeElement) ? document.activeElement?.dataset?.action : '';
    detail.innerHTML = renderQuestDetail(quest, { run: selected.kind === 'run', events, comments: [...comments.values()], calendar, catalog, access: state.access, cursors: sceneCursors, availability: questAvailabilityAt(quest, date) });
    if (focused) detail.querySelector(`[data-action="${CSS.escape(focused)}"]`)?.focus({ preventScroll: true });
    detail.scrollTop = scroll;
  }
  function rebuildComments() { comments.clear(); for (const page of scenePages.values()) for (const row of [...page.older.values(), ...page.head.values()]) comments.set(row.id, row); for (const row of explicitEvidence.values()) comments.set(row.id, row); }
  function releaseDetail() { selection++; stops.forEach(stop => stop()); stops = []; events = []; comments.clear(); scenePages.clear(); explicitEvidence.clear(); sceneCursors = {}; }
  async function open(id, kind) {
    releaseDetail(); selected = { id, kind }; const token = selection;
    if (kind === 'run' && !state.runs.some(row => row.id === id) && repository) await store.loadRun(id);
    if (token !== selection) return;
    const quest = current(); if (!quest) throw Error('Diese Quest wurde nicht gefunden.');
    renderDetail(); if (!detail.open) detail.showModal();
    const url = new URL(location.href); url.searchParams.delete('quest'); url.searchParams.delete('run'); url.searchParams.set(kind, id); history.replaceState(null, '', url);
    if (kind === 'run' && repository) {
      stops.push(repository.events(id, async rows => {
        if (token !== selection) return; events = rows; renderDetail();
        try {
          const ids = [...new Set(rows.map(row => row.evidence?.commentId).filter(Boolean))];
          const loaded = await Promise.all(ids.map(id => repository.evidence(id)));
          if (token !== selection) return;
          explicitEvidence.clear(); for (const row of loaded.filter(Boolean)) explicitEvidence.set(row.id, row);
          rebuildComments(); renderDetail();
        } catch (error) { if (token === selection) toast(error.message); }
      }, error => toast(error.message)));
      for (const sceneId of quest.links.scenes) {
        scenePages.set(sceneId, { head: new Map(), older: new Map() });
        stops.push(repository.scene(sceneId, (rows, cursor) => {
          if (token !== selection) return;
          scenePages.get(sceneId).head = new Map(rows.map(row => [row.id, row]));
          rebuildComments(); sceneCursors[sceneId] = cursor; renderDetail();
        }, error => toast(`Szenenbelege: ${error.message}`), quest.sceneWindows?.[sceneId]));
      }
    }
  }
  async function edit(mode) {
    if (!repository) throw Error('Die Online-Anbindung ist noch nicht verfügbar.');
    const access = await repository.access(), moderator = ['admin','moderator'].includes(access.role), quest = current();
    if (mode === 'start' && questAvailabilityAt(quest, date) !== 'available') throw Error('Dieser Aushang hängt heute nicht an der Tafel. Seine Geschichte bleibt lesbar.');
    if (['create','edit'].includes(mode) && !moderator && access.role !== 'editor') throw Error('Questakten bearbeitet die Redaktion oder Spielleitung. Du kannst eigene Figuren zu vorhandenen Quests anmelden.');
    const party = mode === 'start' ? (await repository.party()).filter(row => moderator || row.ownerUid === access.uid) : quest?.party || [];
    const source = mode === 'create' ? { links: { maps: context.map ? [context.map] : [], boards: context.board ? [context.board] : [], modules: context.module ? [context.module] : [], scenes: params.get('scene') ? [params.get('scene')] : [], notices: [] } } : mode === 'start' ? { ...quest, groupModuleId: params.get('group') || '', links: { ...quest.links, scenes: [...new Set([...quest.links.scenes, ...(params.get('scene') ? [params.get('scene')] : [])])] } } : quest;
    let pending;
    mountQuestForm(form, { mode, quest: source, catalog, calendar, party, templates: ['create','edit','finish','rewards'].includes(mode) ? await templates() : [], date,
      async onSubmit(value) {
        const base = ['create','edit'].includes(mode) ? { action: 'save', id: value.quest.id, quest: value.quest, expectedRevision: mode === 'edit' ? quest.revision : 0 }
          : mode === 'start' ? { action: 'start', id: pending?.input.id || crypto.randomUUID(), questId: quest.id, quest, ...(params.get('group') ? { groupModuleId: params.get('group') } : {}), ...value }
          : { action: mode, id: quest.id, expectedRevision: quest.revision, ...value };
        const fingerprint = JSON.stringify(base);
        if (!pending || pending.fingerprint !== fingerprint) pending = { fingerprint, input: { ...base, operationId: crypto.randomUUID() } };
        const result = await store.commit(pending.input);
        if (result.quest) await open(result.quest.id, 'quest');
        if (result.run) { await store.loadRun(result.run.id); await open(result.run.id, 'run'); }
        if (['log','finish','rewards'].includes(mode)) { await store.loadRun(quest.id); await open(quest.id, 'run'); }
        toast(mode === 'finish' ? 'Abschluss archiviert. Die bestätigte Belohnung ist vorgemerkt.' : 'Im gemeinsamen Journal gespeichert.');
      }
    });
  }
  const abort = new AbortController();
  root.addEventListener('quest-template-warning', event => toast(event.detail), { signal: abort.signal });
  root.addEventListener('click', async event => {
    const button = event.target.closest('[data-action],[data-tab]'); if (!button) return;
    try {
      if (button.dataset.tab) { tab = button.dataset.tab; render(); return; }
      const action = button.dataset.action;
      if (action === 'open') await open(button.dataset.id, button.dataset.kind);
      if (action === 'close-detail') detail.close();
      if (action === 'browse') { tab = 'available'; render(); }
      if (action === 'clear-context') { context = {}; const url = new URL(location.href); for (const key of ['board','notice','map','module']) url.searchParams.delete(key); history.replaceState(null, '', url); render(); }
      if (action === 'context') { context = { [button.dataset.context]: button.dataset.id }; tab = 'available'; render(); }
      if (['create','edit','start','log','finish','rewards'].includes(action)) await edit(action);
      if (action === 'more') await store.more(tab);
      if (action === 'claim') {
        button.disabled = true; const run = current();
        if (!pendingClaim || pendingClaim.id !== run.id) pendingClaim = { action: 'claim', id: run.id, expectedRevision: run.revision, operationId: crypto.randomUUID() };
        await store.commit(pendingClaim); pendingClaim = null; await store.loadRun(run.id); toast('Belohnungen wurden einmalig an die bestätigten Empfänger übergeben.');
      }
      if (action === 'more-scene') { const id = button.dataset.id, token = selection; const page = await repository.moreScene(id, sceneCursors[id], current().sceneWindows?.[id]); if (token !== selection) return; for (const row of page.records) scenePages.get(id).older.set(row.id, row); rebuildComments(); sceneCursors[id] = page.cursor; renderDetail(); }
    } catch (error) { toast(error.message); if (button.isConnected) button.disabled = false; }
  }, { signal: abort.signal });
  $('[data-quest-search]').addEventListener('input', event => { search = event.target.value; render(); }, { signal: abort.signal });
  $('[data-quest-sort]').addEventListener('change', event => { sort = event.target.value; render(); }, { signal: abort.signal });
  detail.addEventListener('close', () => { releaseDetail(); selected = null; const url = new URL(location.href); url.searchParams.delete('run'); url.searchParams.delete('quest'); history.replaceState(null, '', url); }, { signal: abort.signal });
  const stopStore = store.subscribe(value => { state = value; catalog = value.catalog; render(); });
  function connect(adapter) {
    repository = adapter; store.connect(adapter); stopDate(); const token = ++connection;
    const receiveDate = value => { if (destroyed || token !== connection) return; date = questWorldDate(value, date); store.setWorldDate(date); };
    const dateError = error => { if (!destroyed && token === connection) store.fail(error); };
    if (adapter.watchWorldDate) stopDate = adapter.watchWorldDate(receiveDate, dateError);
    else if (adapter.worldDate) adapter.worldDate().then(receiveDate).catch(dateError);
    if (selected?.kind === 'run') open(selected.id, selected.kind).catch(error => toast(error.message));
  }
  if (repository) connect(repository);
  const initialKind = params.has('run') ? 'run' : params.has('quest') ? 'quest' : null;
  if (initialKind) open(params.get(initialKind), initialKind).catch(error => { if (repository || initialKind === 'quest') toast(error.message); else selected = { id: params.get(initialKind), kind: initialKind }; });
  return { connect, fail: store.fail, destroy() { destroyed = true; connection++; stopDate(); releaseDetail(); stopStore(); store.destroy(); abort.abort(); clearTimeout(toastTimer); }, store };
}
