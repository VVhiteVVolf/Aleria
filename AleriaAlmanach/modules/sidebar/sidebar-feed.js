// Sidebar activity feed and entry navigation.
const SIDEBAR_FEED_RENDER_LIMIT = 12;
const SIDEBAR_FEED_CANDIDATE_LIMIT = 30;

function getSidebarTimestampMs(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') {
    const ms = Number(value.toMillis());
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value.toDate === 'function') {
    const ms = Number(value.toDate()?.getTime());
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const seconds = Number(value?.seconds ?? value?._seconds);
  if (!Number.isFinite(seconds)) return null;
  const nanos = Number(value?.nanoseconds ?? value?._nanoseconds ?? 0);
  return (seconds * 1000) + (Number.isFinite(nanos) ? nanos / 1000000 : 0);
}

function getSidebarCommentActivityMs(comment, fallbackIndex = 0) {
  const candidates = [
    Number(comment?.activityAtClient),
    getSidebarTimestampMs(comment?.activityAt),
    Number(comment?.updatedAtClient),
    getSidebarTimestampMs(comment?.updatedAt),
    getSidebarTimestampMs(comment?.editedAt),
    Number(comment?.createdAtClient),
    Number(comment?.createdAtMs),
    getSidebarTimestampMs(comment?.createdAt),
    getSidebarTimestampMs(comment?.ts),
    Number(comment?.orderKey)
  ].filter(Number.isFinite);
  return candidates.length ? Math.max(...candidates) : fallbackIndex;
}

function sortSidebarFeedComments(comments) {
  return (Array.isArray(comments) ? comments : [])
    .map((comment, index) => ({ comment, index }))
    .sort((a, b) => {
      const av = getSidebarCommentActivityMs(a.comment, a.index);
      const bv = getSidebarCommentActivityMs(b.comment, b.index);
      if (av !== bv) return bv - av;
      return String(b.comment?.id || '').localeCompare(String(a.comment?.id || ''));
    })
    .map(item => item.comment);
}

function formatSidebarActivityDate(ms) {
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTimeAgo(comment) {
  const activityMs = getSidebarCommentActivityMs(comment);
  if (!Number.isFinite(activityMs)) return '';
  const diff = Math.max(0, Date.now() - activityMs);
  if (diff < 60000) return 'Gerade eben';
  if (diff < 3600000) return `vor ${Math.floor(diff / 60000)} Min.`;
  if (diff < 86400000) return `vor ${Math.floor(diff / 3600000)} Std.`;
  if (diff < 604800000) return `vor ${Math.floor(diff / 86400000)} Tagen`;
  return new Date(activityMs).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
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
  const activityMs = getSidebarCommentActivityMs(comment);
  const activityTitle = formatSidebarActivityDate(activityMs);
  const activityText = formatTimeAgo(comment);

  return `<div class="sidebar-feed-item" role="button" tabindex="0" data-action="open-sidebar-entry" data-entry-id="${safeThreadId}">
    ${portrait}
    <div class="sidebar-feed-text">
      <div class="sidebar-feed-name">${escapeHtml(displayName)}</div>
      <div class="sidebar-feed-tag" data-theme="${theme.slug}">${sectionLabel}</div>
      <div class="sidebar-feed-entry">↳ ${escapeHtml(entryTitle)}</div>
      <div class="sidebar-feed-snippet">${snippet}</div>
      <div class="sidebar-feed-time"${activityTitle ? ` title="${escapeHtml(activityTitle)}"` : ''}>${escapeHtml(activityText)}</div>
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
      const comments = sortSidebarFeedComments(await backend.loadRecentComments(SIDEBAR_FEED_CANDIDATE_LIMIT));
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
      }).filter(Boolean).slice(0, SIDEBAR_FEED_RENDER_LIMIT);

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
