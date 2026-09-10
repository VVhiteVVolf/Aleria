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

function getArchiveEntryGuildEmblem(entry) {
  const pages = Array.isArray(entry?.pages) ? entry.pages : [];
  for (const page of pages) {
    if (!page?.guildPage || page._commentsPage) continue;
    const emblem = sanitizeImageSrc(page.guild?.crestImage || '') || sanitizeImageSrc(page.image || '');
    if (emblem) return emblem;
  }
  return '';
}

function getArchiveEntryPreviewImage(entry) {
  const guildEmblem = getArchiveEntryGuildEmblem(entry);
  if (guildEmblem) return guildEmblem;

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

function buildArchiveEntryMetaItems(entry) {
  const pageCount = getArchiveEntryPageCount(entry);
  const items = [{ kind: 'pages', value: `${pageCount} ${pageCount === 1 ? 'Seite' : 'Seiten'}` }];
  if (entry && (entry.appendCommentsPage !== false || hasArchiveEntryPageComments(entry))) {
    items.push({ kind: 'comments', value: 'Kommentare möglich', description: getArchiveEntryCommentLabel(entry) });
  }
  return items;
}

function renderArchiveEntryMeta(entry) {
  const items = buildArchiveEntryMetaItems(entry);
  return `
    <span class="entry-card-meta">
      ${items.map(item => `<span class="entry-card-meta-item" data-card-meta="${item.kind}"${item.description ? ` title="${escapeHtml(item.description)}"` : ''}>${escapeHtml(item.value)}</span>`).join('')}
      <span class="entry-card-open-mark" aria-hidden="true">↗</span>
    </span>`;
}
