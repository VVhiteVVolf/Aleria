function getArchiveDashboardStats(sections = []) {
  const allEntries = sections.flatMap(section => Array.isArray(section.entries) ? section.entries : []);
  const tabCount = new Set(sections.map(section => section.tab || section.key).filter(Boolean)).size;
  const moduleCount = allEntries.length;
  const pageCount = allEntries.reduce((sum, entry) => sum + getArchiveEntryPageCount(entry), 0);
  const commentReadyCount = allEntries.filter(entry => entry?.appendCommentsPage !== false || hasArchiveEntryPageComments(entry)).length;
  const customSectionCount = _customSections.length;
  return {
    moduleCount,
    pageCount,
    commentReadyCount,
    sectionCount: tabCount,
    customSectionCount
  };
}

function buildArchiveDashboardSectionCards(sections = []) {
  const grouped = new Map();
  sections.forEach(section => {
    const label = section.tab || section.key || 'Archiv';
    const existing = grouped.get(label) || {
      label,
      theme: getSectionThemeMeta(section.key),
      entries: []
    };
    existing.entries.push(...(Array.isArray(section.entries) ? section.entries : []));
    grouped.set(label, existing);
  });

  return Array.from(grouped.values()).map(group => {
    const section = { key: group.label, tab: group.label };
    const entries = group.entries;
    const stats = getArchiveSectionStats(section, entries);
    return `
      <button class="archive-dashboard-section" type="button" data-archive-action="switch-tab" data-tab="${escapeHtml(group.label)}" data-section-theme="${escapeHtml(group.theme.slug)}">
        <span class="archive-dashboard-section-name">${escapeHtml(group.label)}</span>
        <span class="archive-dashboard-section-meta">${stats.moduleCount} Module &middot; ${stats.pageCount} Seiten</span>
      </button>`;
  }).join('');
}

function renderArchiveDashboard(sections = []) {
  const stats = getArchiveDashboardStats(sections);
  return `
    <section class="archive-dashboard" aria-label="Archivuebersicht">
      <div class="archive-dashboard-head">
        <div>
          <div class="archive-dashboard-kicker">Archivuebersicht</div>
          <h2>Alle Register auf einen Blick</h2>
        </div>
        <div class="archive-dashboard-stats">
          <span><strong>${stats.moduleCount}</strong> Module</span>
          <span><strong>${stats.pageCount}</strong> Seiten</span>
          <span><strong>${stats.commentReadyCount}</strong> Dialogbereit</span>
          <span><strong>${stats.customSectionCount}</strong> Eigene Reiter</span>
        </div>
      </div>
      <div class="archive-dashboard-sections">
        ${buildArchiveDashboardSectionCards(sections)}
      </div>
    </section>`;
}
