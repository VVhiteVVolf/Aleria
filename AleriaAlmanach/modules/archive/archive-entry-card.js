/* Module preview markup. Navigation and management use the existing archive actions. */
function renderArchiveEntryCard(entry, section, { priorityImage = false, manageMode = false } = {}) {
  const image = getArchiveEntryPreviewImage(entry);
  const title = String(entry.title || 'Unbenanntes Modul');
  const category = getSectionOptionLabel(section);
  const subtitle = String(entry.subtitle || entry.type || '').trim();
  const showSubtitle = subtitle && subtitle !== title && subtitle !== category;
  const imageLoading = priorityImage
    ? 'loading="eager" decoding="async" fetchpriority="high"'
    : 'loading="lazy" decoding="async" fetchpriority="low"';
  return `
    <button class="entry-card-open" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(entry.id || '')}" aria-label="${escapeHtml(title)} öffnen">
      <span class="card-image-wrap">
        ${image ? `<img src="${escapeHtml(image)}" alt="" ${imageLoading}>` : `<span class="card-placeholder-inner" aria-hidden="true">${escapeHtml(entry.icon || '✦')}</span>`}
        ${entry.locked ? '<span class="entry-card-lock">Geschützt</span>' : ''}
      </span>
      <span class="entry-card-copy">
        <span class="entry-card-category">${escapeHtml(category)}</span>
        <span class="entry-card-title">${escapeHtml(title)}</span>
        ${showSubtitle ? `<span class="entry-card-subtitle">${escapeHtml(subtitle)}</span>` : ''}
      </span>
      ${renderArchiveEntryMeta(entry)}
    </button>
    ${manageMode ? renderArchiveEntryCardActions(entry, section) : ''}`;
}

function renderArchiveEntryCardActions(entry, section) {
  return `<div class="entry-card-admin">
    <label>Verschieben nach
      <select data-archive-action="move-entry-section" data-entry-id="${escapeHtml(entry.id || '')}" aria-label="${escapeHtml(entry.title || 'Modul')} verschieben">
        ${buildModuleSectionTargetOptions(makeSectionSignature(section))}
      </select>
    </label>
    <button type="button" data-archive-action="open-module-stamp" data-source-entry-id="${escapeHtml(entry.id || '')}">Kopieren</button>
  </div>`;
}
