const ARCHIVE_SECTION_INITIAL_LIMIT = 24;
let _expandedArchiveSections = new Set();

function getArchiveSectionKey(section) {
  return makeSectionSignature(section || {});
}

function isArchiveSectionExpanded(section) {
  return _expandedArchiveSections.has(getArchiveSectionKey(section));
}

function toggleArchiveSectionExpanded(sectionKey) {
  const key = String(sectionKey || '');
  if (!key) return;
  if (_expandedArchiveSections.has(key)) _expandedArchiveSections.delete(key);
  else _expandedArchiveSections.add(key);
  renderAll();
}

function getArchiveSectionStats(section, entries = []) {
  const moduleCount = entries.length;
  const pageCount = entries.reduce((sum, entry) => sum + getArchiveEntryPageCount(entry), 0);
  const commentEnabledCount = entries.filter(entry => entry?.appendCommentsPage !== false || hasArchiveEntryPageComments(entry)).length;
  return { moduleCount, pageCount, commentEnabledCount };
}

function renderArchiveSectionBand(section, entries = [], options = {}) {
  const stats = getArchiveSectionStats(section, entries);
  const title = section.key || section.tab || 'Archiv';
  const desc = section.desc || section.tab || '';
  const isEmpty = stats.moduleCount === 0;
  return `
    <div class="archive-section-band">
      <div class="archive-section-band-main">
        <div class="archive-section-title-row">
          <span class="archive-section-title">${escapeHtml(title)}</span>
          ${options.isCustom ? '<span class="archive-section-badge">Eigener Reiter</span>' : ''}
          ${isEmpty ? '<span class="archive-section-badge muted">Leer</span>' : ''}
        </div>
        ${desc ? `<div class="archive-section-desc">${escapeHtml(desc)}</div>` : ''}
      </div>
      <div class="archive-section-stats">
        <span><strong>${stats.moduleCount}</strong> Module</span>
        <span><strong>${stats.pageCount}</strong> Seiten</span>
        <span><strong>${stats.commentEnabledCount}</strong> Dialog</span>
      </div>
    </div>`;
}

function getArchiveSectionVisibleEntries(section, entries = [], options = {}) {
  if (options.searchActive) return entries;
  if (isArchiveSectionExpanded(section)) return entries;
  return entries.slice(0, ARCHIVE_SECTION_INITIAL_LIMIT);
}

function renderArchiveSectionMoreControl(section, entries = [], visibleEntries = [], options = {}) {
  if (options.searchActive || entries.length <= visibleEntries.length) return '';
  const hiddenCount = entries.length - visibleEntries.length;
  return `
    <div class="archive-section-more">
      <button type="button" data-archive-action="toggle-section-expanded" data-section-key="${escapeHtml(getArchiveSectionKey(section))}">
        ${hiddenCount} weitere Module anzeigen
      </button>
    </div>`;
}
