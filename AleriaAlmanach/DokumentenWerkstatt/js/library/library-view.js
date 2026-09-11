import { escapeHtml, documentLink } from '../document-schema.js';

export function renderLibrary(root, local, published) {
  const search = root.querySelector('[data-role="library-search"]').value.toLocaleLowerCase('de');
  const filter = root.querySelector('[data-role="library-filter"]').value;
  const matches = record => `${record.document?.title || record.title} ${record.document?.category || record.category || ''} ${record.id}`.toLocaleLowerCase('de').includes(search);
  const queued = local.filter(record => record.queued);
  root.querySelector('[data-role="queue-count"]').textContent = `${queued.length} vorgemerkt`;
  root.querySelector('[data-role="publish-batch"]').disabled = !queued.length;
  const localRows = filter === 'published' ? [] : local.filter(matches).filter(record => filter !== 'queued' || record.queued);
  root.querySelector('[data-role="local-documents"]').innerHTML = localRows.length ? localRows.map(record => `
    <article class="library-card">
      <div class="library-card-heading"><span class="library-type">${escapeHtml(record.document.template)} · ${record.document.pages.length} S.</span><span class="library-badge">${record.queued ? 'Vorgemerkt' : 'Lokal gespeichert'}</span></div>
      <h3>${escapeHtml(record.document.title)}</h3><p>${escapeHtml(record.document.category || 'Ohne Kategorie')} · ${record.revision ? `Revision ${record.revision}` : 'Unveröffentlicht'}</p>
      <div class="library-card-actions">
        <button class="btn" data-library-action="edit" data-id="${record.id}">Bearbeiten</button>
        <button class="btn" data-library-action="duplicate" data-id="${record.id}">Als Kopie</button>
        <button class="btn" data-library-action="queue" data-id="${record.id}">${record.queued ? 'Zurückstellen' : 'Vormerken'}</button>
        ${record.revision ? `<button class="btn" data-library-action="link" data-id="${record.id}">Link</button>` : ''}
        <button class="btn subtle" data-library-action="remove" data-id="${record.id}" aria-label="${escapeHtml(record.document.title)} lokal entfernen">Entfernen</button>
      </div>
    </article>`).join('') : '<p class="library-empty">Hier entsteht deine Sammlung. Speichere dein Dokument und merke fertige Stücke für den Upload vor.</p>';
  const onlineRows = ['local', 'queued'].includes(filter) ? [] : published.filter(matches);
  root.querySelector('[data-role="published-documents"]').innerHTML = onlineRows.length ? onlineRows.map(record => `
    <article class="library-card published"><span class="library-type">Veröffentlicht · Revision ${Number(record.revision) || 1}</span>
      <h3>${escapeHtml(record.title)}</h3><p>${escapeHtml(record.category || 'Dokumentenarchiv')}</p>
      <div class="library-card-actions"><a class="btn" target="_blank" rel="noopener" href="${escapeHtml(documentLink(record.id))}">Lesen ↗</a>
      <button class="btn" data-library-action="load-online" data-id="${escapeHtml(record.id)}">Laden</button>
      <button class="btn" data-library-action="link" data-id="${escapeHtml(record.id)}">Link</button></div>
    </article>`).join('') : '<p class="library-empty">Keine passenden veröffentlichten Dokumente.</p>';
}
