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

function getArchiveSectionIconSrc(section) {
  return sanitizeImageSrc(section?.iconUrl || '');
}

function renderArchiveSectionIcon(section, className = 'archive-section-icon') {
  const iconSrc = getArchiveSectionIconSrc(section);
  if (!iconSrc) return '';
  return `
    <span class="${className}" aria-hidden="true">
      <img src="${iconSrc}" alt="" loading="lazy" decoding="async">
    </span>`;
}

function renderArchiveSectionBand(section, entries = [], options = {}) {
  const stats = getArchiveSectionStats(section, entries);
  const title = getSectionLeafLabel(section);
  const desc = section.desc || section.tab || '';
  const isEmpty = stats.moduleCount === 0;
  const path = getSectionPathParts(section);
  const breadcrumbs = path.length > 1 ? path.slice(0, -1) : [];
  const hasIcon = !!getArchiveSectionIconSrc(section);
  return `
    <div class="archive-section-band${hasIcon ? ' has-icon' : ''}">
      ${renderArchiveSectionIcon(section)}
      <div class="archive-section-band-main">
        ${breadcrumbs.length ? `<div class="archive-section-breadcrumbs">${breadcrumbs.map(part => `<span>${escapeHtml(part)}</span>`).join('<span class="archive-section-breadcrumb-separator">&rsaquo;</span>')}</div>` : ''}
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
