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

function getArchiveEntryPreviewImage(entry) {
  const pages = Array.isArray(entry?.pages) ? entry.pages.filter(page => page && !page._commentsPage) : [];
  const firstPageImage = sanitizeImageSrc(pages[0]?.image || '');
  if (firstPageImage) return firstPageImage;

  const directImage = sanitizeImageSrc(entry?.image || '');
  if (directImage) return directImage;

  for (const page of pages.slice(1)) {
    const pageImage = sanitizeImageSrc(page.image || '');
    if (pageImage) return pageImage;

    const wantedImage = Array.isArray(page.wanted)
      ? page.wanted.map(item => sanitizeImageSrc(item?.img || '')).find(Boolean)
      : '';
    if (wantedImage) return wantedImage;

    const profileImage = Array.isArray(page.profiles)
      ? page.profiles.map(item => sanitizeImageSrc(item?.img || '')).find(Boolean)
      : '';
    if (profileImage) return profileImage;

    const inventoryImage = sanitizeImageSrc(page.characterInventory?.portrait || '');
    if (inventoryImage) return inventoryImage;

    const bestiaryImage = sanitizeImageSrc(page.bestiary?.image || page.bestiary?.portrait || '');
    if (bestiaryImage) return bestiaryImage;
  }

  return '';
}

function buildArchiveEntryMetaItems(entry, section, options = {}) {
  const pageCount = getArchiveEntryPageCount(entry);
  const items = [];
  if (entry?.type) items.push({ label: 'Typ', value: entry.type });
  if (pageCount) items.push({ label: 'Seiten', value: String(pageCount) });
  items.push({ label: 'Dialog', value: getArchiveEntryCommentLabel(entry) });
  if (options.showLocation && (section?.tab || section?.key)) {
    items.push({ label: 'Ort', value: getSectionOptionLabel(section), wide: true });
  }
  return items;
}

function renderArchiveEntryMeta(entry, section, options = {}) {
  const items = buildArchiveEntryMetaItems(entry, section, options);
  if (!items.length) return '';
  return `
    <span class="entry-card-meta">
      ${items.map(item => `
        <span class="entry-card-meta-chip${item.wide ? ' wide' : ''}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </span>`).join('')}
    </span>`;
}
