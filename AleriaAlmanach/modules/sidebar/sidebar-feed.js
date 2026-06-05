// Sidebar activity feed and entry navigation.
function formatTimeAgo(ts) {
  if (!ts || !ts.seconds) return '';
  const now = Date.now() / 1000;
  const diff = now - ts.seconds;
  if (diff < 60) return 'Gerade eben';
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  if (diff < 604800) return `vor ${Math.floor(diff / 86400)} Tagen`;
  return new Date(ts.seconds * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

function stripCommentMarkupForSidebar(value) {
  return String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\|\|(.*?)\|\|/g, '[Spoiler]')
    .replace(/\[.*?\](.*?)\[\/.*?\]/g, '$1')
    .replace(/\{tip:.*?\}(.*?)\{\/tip\}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function buildSidebarFeedItem(comment, sections) {
  const threadId = String(comment?.entryId || '');
  const location = parseCommentThreadLocation(threadId);
  let entryTitle = threadId || 'Unbekannter Eintrag';
  let entryObj = null;
  let entrySection = null;

  for (const section of sections) {
    const found = section.entries.find(entry => entry.id === location.baseEntryId);
    if (found) {
      entryTitle = found.title;
      entryObj = found;
      entrySection = section;
      break;
    }
  }

  if (entryObj && location.pageIndex !== null) {
    const page = getPages(entryObj)[location.pageIndex];
    if (page?.pageTitle) entryTitle = `${entryTitle} · ${page.pageTitle}`;
  }

  const displayName = comment?.narrator ? 'Erzähler' : (comment?.charName || 'Unbekannt');
  const portraitSrc = sanitizeImageSrc(comment?.portrait);
  const portrait = portraitSrc
    ? `<img class="sidebar-feed-portrait" src="${portraitSrc}" alt="${escapeHtml(displayName)}" loading="lazy" decoding="async">`
    : `<div class="sidebar-feed-portrait-placeholder">${comment?.narrator ? 'E' : displayName[0].toUpperCase()}</div>`;
  const theme = entrySection ? getSectionThemeMeta(entrySection.key) : SECTION_THEME_META.Archive;
  const sectionLabel = escapeHtml(entrySection?.tab || entrySection?.key || 'Archiv');
  const safeThreadId = escapeHtml(threadId);
  const snippet = escapeHtml(stripCommentMarkupForSidebar(comment?.text));

  return `<div class="sidebar-feed-item" role="button" tabindex="0" data-action="open-sidebar-entry" data-entry-id="${safeThreadId}">
    ${portrait}
    <div class="sidebar-feed-text">
      <div class="sidebar-feed-name">${escapeHtml(displayName)}</div>
      <div class="sidebar-feed-tag" data-theme="${theme.slug}">${sectionLabel}</div>
      <div class="sidebar-feed-entry">↳ ${escapeHtml(entryTitle)}</div>
      <div class="sidebar-feed-snippet">${snippet}</div>
      <div class="sidebar-feed-time">${escapeHtml(formatTimeAgo(comment?.ts))}</div>
    </div>
  </div>`;
}

function loadSidebarFeed() {
  const run = async () => {
    const feed = document.getElementById('sidebar-feed');
    if (!feed) return;

    try {
      const backend = typeof getCommentBackend === 'function'
        ? await getCommentBackend({ timeoutMs: 1200 })
        : (await waitForFirebaseReady(1200), window._fb);
      if (!backend?.loadRecentComments) return;
      const comments = await backend.loadRecentComments(12);
      const sections = getValidSections();

      if (!comments || comments.length === 0) {
        feed.innerHTML = '<div class="sidebar-feed-empty">Noch keine Aktivitäten</div>';
        return;
      }

      const items = comments.map(comment => {
        try {
          return buildSidebarFeedItem(comment, sections);
        } catch (itemError) {
          console.warn('Sidebar feed item skipped:', itemError, comment);
          return '';
        }
      }).filter(Boolean);

      feed.innerHTML = items.length
        ? items.join('')
        : '<div class="sidebar-feed-empty">Noch keine Aktivitäten</div>';
    } catch (error) {
      console.error('Sidebar feed error:', error);
      showFriendlyAppError(error, 'Letzte Aktivitäten konnten nicht geladen werden.');
      feed.innerHTML = '<div class="sidebar-feed-empty">Konnte nicht laden.</div>';
    }
  };

  return run();
}

function openEntryById(entryId) {
  const location = parseCommentThreadLocation(entryId);
  for (const section of getValidSections()) {
    const found = section.entries.find(entry => entry.id === location.baseEntryId);
    if (found) {
      const tab = section.tab || section.key;
      switchTab(tab);
      currentEntry = found;
      const totalPages = getPages(found).length;
      currentPage = location.pageIndex !== null
        ? Math.max(0, Math.min(location.pageIndex, totalPages - 1))
        : totalPages - 1;
      renderPage(currentPage, 0);
      activateDialog('modal-overlay', { initialFocus: '.modal-close' });
      document.body.style.overflow = 'hidden';
      return;
    }
  }
}

function openRandomEntry() {
  const allEntries = getValidSections()
    .flatMap(section => section.entries)
    .filter(entry => entry && !entry.locked && entry.id && !entry.id.startsWith('ph_'));
  if (!allEntries.length) return;

  const entry = allEntries[randomInt(allEntries.length)];
  const btn = document.querySelector('.sidebar-random-btn[data-action="open-random-entry"]');
  if (btn) {
    btn.style.transform = 'scale(0.93)';
    setTimeout(() => { btn.style.transform = ''; }, 180);
  }

  for (const section of getValidSections()) {
    if (section.entries.includes(entry)) {
      switchTab(section.tab || section.key);
      break;
    }
  }

  openModal(entry);
}

function handleSidebarActionClick(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger) return;

  if (trigger.dataset.action === 'open-random-entry') {
    event.preventDefault();
    openRandomEntry();
    return;
  }
  if (trigger.dataset.action === 'open-sidebar-entry') {
    event.preventDefault();
    openEntryById(trigger.dataset.entryId || '');
  }
}

function handleSidebarActionKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const trigger = event.target?.closest?.('[data-action="open-sidebar-entry"]');
  if (!trigger) return;
  event.preventDefault();
  openEntryById(trigger.dataset.entryId || '');
}

document.addEventListener('click', handleSidebarActionClick);
document.addEventListener('keydown', handleSidebarActionKeydown);
