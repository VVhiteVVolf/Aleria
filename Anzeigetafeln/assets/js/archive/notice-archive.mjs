import { emptyArchive, normalizeArchive, visibleArchiveEntries, archiveFloorObjects, archiveNotices,
  restoreArchiveEntry, moveArchiveObject, mergeArchiveObjects, mergeAuthoredArchiveState } from './notice-archive-model.mjs';
import { mountArchiveFloor } from './notice-archive-floor.mjs';
import { mountArchiveDialog } from './notice-archive-dialog.mjs';

export function initializeNoticeArchive() {
  const rt = () => window.TafelRuntime;
  const state = () => window.TafelState.get();
  const date = () => window.TafelNoticeTimeline.current();
  const canEdit = () => rt().canEditZettel();
  const data = () => state().noticeArchive || emptyArchive();
  const objects = () => archiveFloorObjects(data(), state().zettel, date(), { includeSecret: canEdit() });

  function changed(next) {
    state().noticeArchive = normalizeArchive(next, state().zettel);
    rt().renderZettel(); rt().save();
    window.TafelNoticeReader?.refresh();
    window.TafelNoticeRegister?.render();
  }
  function guarded(action) {
    if (!canEdit()) return;
    try { action(); } catch (error) { rt().toast(error.message); }
  }
  function merge(source, target) {
    guarded(() => changed(mergeArchiveObjects(data(), objects(), source, target, `pile-${rt().uid()}`)));
  }
  function move(id, position) { guarded(() => changed(moveArchiveObject(data(), id, position))); }
  function restore(id) {
    guarded(() => { changed(restoreArchiveEntry(data(), id, date())); rt().toast('Der Aushang hängt wieder an der Tafel.'); });
  }
  function gather() {
    guarded(() => {
      let next = data(), items = objects();
      if (items.reduce((sum, item) => sum + item.entries.length, 0) < 3) throw Error('Ab drei abgelegten Aushängen könnt Ihr einen Haufen bilden.');
      while (items.length > 1) {
        next = mergeArchiveObjects(next, items, items[1].id, items[0].id, `pile-${rt().uid()}`);
        items = archiveFloorObjects(next, state().zettel, date(), { includeSecret: true });
      }
      changed(next);
    });
  }
  function rows() {
    return visibleArchiveEntries(data(), state().zettel, date(), { includeSecret: canEdit(), activeOnly: false }).flatMap(entry => {
      const notices = state().zettel.filter(notice => entry.visibleNoticeIds.includes(notice.id));
      return window.TafelNoticeStacks.publications(notices, { includeSecret: canEdit() }).map(publication => ({ entry, publication }));
    });
  }
  const dialog = mountArchiveDialog({ getRows: rows, getDate: date, canEdit,
    onRead: (id, entryId) => window.TafelNoticeReader.open(id, { archiveEntryId: entryId }), onRestore: restore, onGather: gather });
  const floor = mountArchiveFloor({ getObjects: objects, canEdit, onMove: move, onMerge: merge,
    onOpen: id => { const object = objects().find(object => object.id === id); if (object) dialog.open(object.entries.map(entry => entry.id)); } });

  function crumble(id, scope = 'publication') {
    guarded(() => {
      const selected = scope === 'poster' ? window.TafelNoticeStacks.members(state().zettel, id, { includeSecret: true })
        : window.TafelNoticeStacks.publication(state().zettel, id, { includeSecret: true })?.notices || [];
      const visible = new Set(window.TafelNoticeTimeline.visibleNotices().map(notice => notice.id));
      const ids = selected.filter(notice => visible.has(notice.id)).map(notice => notice.id);
      if (!ids.length) throw Error('Dieser Aushang ist an diesem Tag nicht an der Tafel.');
      const poster = state().boardLayout?.posters.find(poster => selected.some(notice => notice.id === poster.noticeId));
      const element = poster && [...document.querySelectorAll('[data-poster-id]')].find(node => node.dataset.posterId === poster.id);
      const origin = poster || selected[0];
      const entryId = `archive-${rt().uid()}`;
      const index = data().entries.length;
      const position = { x: .22 + (index % 9) * .07, y: .93 + (index % 3) * .012 };
      const next = archiveNotices(data(), state().zettel, ids, { id: entryId, date: date(), position, posterId: poster?.id });
      floor.animate(entryId, origin, position, element);
      window.TafelNoticeReader.close(); rt().closeSidebar();
      changed(next);
      rt().toast('Abgehakt und zusammengeknüllt · im Papierarchiv bleibt alles erhalten.');
    });
  }
  function render() {
    floor.render(); dialog.render();
    window.TafelNoticeTimeline.setArchiveCount(new Set(rows().map(row => row.entry.id)).size);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action="archive-publication"], [data-action="archive-poster"]');
    if (!button) return;
    crumble(button.dataset.noticeId, button.dataset.action === 'archive-poster' ? 'poster' : 'publication');
  });
  for (const event of ['aleria:tafel:state-applied', 'aleria:tafel:edit-mode', 'aleria:tafel:date-changed']) window.addEventListener(event, render);
  window.TafelArchive = Object.freeze({ render, open: () => dialog.open(), crumble, mergeAuthoredState: mergeAuthoredArchiveState });
  return window.TafelArchive;
}
