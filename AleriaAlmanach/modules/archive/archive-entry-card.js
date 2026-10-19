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
        ${image ? `<img src="${image}" alt="" ${imageLoading}>` : `<span class="card-placeholder-inner" aria-hidden="true">${escapeHtml(entry.icon || '✦')}</span>`}
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

// One scoped renderer for both a full archive refresh and a folder selection.
function renderArchiveSectionCards(grid, section, entries, options = {}) {
  let usedPriorityImages = 0;
  if (!entries.length) {
    const hint = document.createElement('div');
    hint.className = 'archive-section-empty-hint';
    hint.textContent = 'Noch keine Module in diesem Reiter.';
    grid.appendChild(hint);
  }
  const visible = getArchiveSectionVisibleEntries(section, entries, { searchActive: !!options.searchActive });
  const fragment = document.createDocumentFragment();
  for (const entry of visible) {
    const image = getArchiveEntryPreviewImage(entry), card = document.createElement('article');
    card.className = 'entry-card' + (image && image === getArchiveEntryGuildEmblem(entry) ? ' entry-card-emblem' : '')
      + (entry.locked ? ' card-locked' : '');
    card.dataset.searchKind = 'entry';
    const priorityImage = !!image && usedPriorityImages < (options.priorityImageBudget ?? 10);
    card.innerHTML = renderArchiveEntryCard(entry, options.sectionByEntry?.get(entry) || section, {
      priorityImage, manageMode: !!options.manageMode
    });
    if (priorityImage) usedPriorityImages++;
    fragment.appendChild(card);
  }
  grid.appendChild(fragment);
  grid.insertAdjacentHTML('beforeend', renderArchiveSectionMoreControl(section, entries, visible, { searchActive: !!options.searchActive }));
  return usedPriorityImages;
}
