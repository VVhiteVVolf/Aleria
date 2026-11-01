import { dateLabel, calendar } from '../timeline/notice-dates.mjs';
import { activeAt } from './notice-archive-model.mjs';

export function mountArchiveDialog({ getRows, getDate, canEdit, onRead, onRestore, onGather }) {
  const root = document.createElement('dialog');
  root.className = 'notice-archive-dialog';
  root.setAttribute('aria-label', 'Papierarchiv der Anzeigetafel');
  root.innerHTML = `<header><div><p>Die abgelegten Anschläge</p><h2>Papierarchiv</h2></div><button type="button" data-archive-action="close" aria-label="Archiv schließen">×</button></header>
    <div class="notice-archive-tools"><label>Suchen<input type="search" data-archive-query placeholder="Titel, Verfasser oder Wortlaut"></label>
      <label>Art<select data-archive-type><option value="">Alle Arten</option></select></label>
      <label>Ordnen nach<select data-archive-group><option value="day">Abgehakt am</option><option value="type">Art des Aushangs</option><option value="published">Ausgehängt am</option></select></label></div>
    <div class="notice-archive-summary" data-archive-summary></div><div class="notice-archive-list" data-archive-list></div>
    <footer><button type="button" data-archive-action="all">Gesamtes Archiv</button><button type="button" data-archive-action="gather">Papierhaufen bilden</button><button type="button" data-archive-action="close">Schließen</button></footer>`;
  document.body.append(root);
  let entryIds = null;
  const esc = value => window.TafelRuntime.esc(value);
  const typeLabel = type => window.TafelZettelConfig.typeById(type)?.label || type;

  function render() {
    if (!root.open) return;
    const query = root.querySelector('[data-archive-query]').value;
    const type = root.querySelector('[data-archive-type]').value;
    const group = root.querySelector('[data-archive-group]').value;
    const all = getRows().filter(row => !entryIds || entryIds.has(row.entry.id));
    const types = [...new Set(all.map(row => row.publication.primary.typ))];
    const select = root.querySelector('[data-archive-type]');
    select.innerHTML = '<option value="">Alle Arten</option>' + types.map(value => `<option value="${esc(value)}">${esc(typeLabel(value))}</option>`).join('');
    select.value = types.includes(type) ? type : '';
    const rows = all.filter(row => window.TafelNoticeSearch.select(row.publication.notices,
      { query, type: select.value, includeSecret: canEdit() }).length);
    rows.sort((a, b) => calendar.ordinal(b.entry.archivedOn) - calendar.ordinal(a.entry.archivedOn));
    const groups = new Map();
    for (const row of rows) {
      const key = group === 'type' ? typeLabel(row.publication.primary.typ) : dateLabel(group === 'published' ? row.publication.primary.publishedOn : row.entry.archivedOn);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    root.querySelector('[data-archive-summary]').textContent = `${rows.length} abgelegte Aushänge · Stand: ${dateLabel(getDate())}`;
    root.querySelector('[data-archive-list]').innerHTML = rows.length ? [...groups].map(([key, items]) => `<section class="notice-archive-group"><h3>${esc(key)}</h3>${items.map(row => {
      const notice = row.publication.primary;
      const active = activeAt(row.entry, getDate());
      return `<article class="notice-archive-row"><div><small>${esc(typeLabel(notice.typ))} · ${row.publication.notices.length} ${row.publication.notices.length === 1 ? 'Blatt' : 'Blätter'}</small><h4>${esc(notice.title || 'Ohne Titel')}</h4>
        <p>Ausgehängt: ${esc(dateLabel(notice.publishedOn))} · Abgehakt: ${esc(dateLabel(row.entry.archivedOn))}${!active ? ` · Wieder angeheftet: ${esc(dateLabel(row.entry.restoredOn))}` : ''}</p></div>
        <div class="notice-archive-row-actions"><button type="button" data-archive-action="read" data-archive-entry="${esc(row.entry.id)}" data-notice-id="${esc(notice.id)}">Lesen</button>
        ${canEdit() && active ? `<button type="button" data-archive-action="restore" data-archive-entry="${esc(row.entry.id)}">Wieder anheften</button>` : ''}</div></article>`;
    }).join('')}</section>`).join('') : '<p class="notice-archive-empty">Hier liegen für diesen Tag keine passenden Aushänge.</p>';
    root.querySelector('[data-archive-action="gather"]').hidden = !canEdit();
  }
  root.addEventListener('input', event => { if (event.target.matches('[data-archive-query]')) render(); });
  root.addEventListener('change', event => { if (event.target.matches('select')) render(); });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-archive-action]');
    if (!button) return;
    const action = button.dataset.archiveAction;
    if (action === 'close') root.close();
    if (action === 'all') { entryIds = null; render(); }
    if (action === 'read') { root.close(); onRead(button.dataset.noticeId, button.dataset.archiveEntry); }
    if (action === 'restore') onRestore(button.dataset.archiveEntry);
    if (action === 'gather') onGather();
  });
  return Object.freeze({ render, open(ids = null) { entryIds = ids ? new Set(ids) : null; root.showModal(); render(); } });
}
