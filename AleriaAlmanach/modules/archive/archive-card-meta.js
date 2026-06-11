function getArchiveEntryPageCount(entry) {
  return Array.isArray(entry?.pages) ? entry.pages.filter(page => page && !page._commentsPage).length : 0;
}

function hasArchiveEntryPageComments(entry) {
  if (!entry) return false;
  if (entry.enablePageComments) return true;
  return Array.isArray(entry.pages) && entry.pages.some(page => page?.enableComments || page?.sessionPage);
}

function getArchiveEntryCommentLabel(entry) {
  if (!entry) return 'Keine Kommentare';
  if (entry.appendCommentsPage !== false && hasArchiveEntryPageComments(entry)) return 'Kommentare + Seiten';
  if (entry.appendCommentsPage !== false) return 'Kommentare';
  if (hasArchiveEntryPageComments(entry)) return 'Seitenkommentare';
  return 'Keine Kommentare';
}

function buildArchiveEntryMetaItems(entry, section) {
  const pageCount = getArchiveEntryPageCount(entry);
  const items = [];
  if (entry?.type) items.push({ label: 'Typ', value: entry.type });
  if (pageCount) items.push({ label: 'Seiten', value: String(pageCount) });
  items.push({ label: 'Dialog', value: getArchiveEntryCommentLabel(entry) });
  if (section?.tab || section?.key) items.push({ label: 'Reiter', value: section.tab || section.key });
  return items;
}

function renderArchiveEntryMeta(entry, section) {
  const items = buildArchiveEntryMetaItems(entry, section);
  if (!items.length) return '';
  return `
    <div class="entry-card-meta">
      ${items.map(item => `
        <span class="entry-card-meta-chip">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </span>`).join('')}
    </div>`;
}
