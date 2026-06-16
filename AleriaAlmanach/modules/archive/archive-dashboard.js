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

function getArchiveDashboardEntries(sections = []) {
  const seen = new Set();
  const entries = [];
  sections.forEach(section => {
    (section.entries || []).forEach(entry => {
      const id = String(entry?.id || '').trim();
      if (!id || seen.has(id)) return;
      seen.add(id);
      entries.push({ entry, section });
    });
  });
  return entries;
}

function getArchiveDashboardEntryImage(entry) {
  const direct = sanitizeImageSrc(entry?.image || '');
  if (direct) return direct;
  const pageImage = (entry?.pages || []).map(page => sanitizeImageSrc(page?.image || '')).find(Boolean);
  return pageImage || '';
}

function getArchiveDashboardCommentator(entry) {
  const commentator = entry?.commentator && typeof entry.commentator === 'object' ? entry.commentator : null;
  const name = String(commentator?.name || '').trim() || String(entry?.title || 'Archiv').trim();
  const mood = String(entry?.commentatorMood || '').trim();
  const avatar = sanitizeImageSrc(
    (mood && commentator?.avatars?.[mood]) ||
    Object.values(commentator?.avatars || {}).find(Boolean) ||
    getArchiveDashboardEntryImage(entry)
  );
  return { name, avatar };
}

function stripArchiveDashboardText(value) {
  return String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\|\|(.*?)\|\|/g, '$1')
    .replace(/\[.*?\](.*?)\[\/.*?\]/g, '$1')
    .replace(/\{tip:.*?\}(.*?)\{\/tip\}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getArchiveDashboardTriviaText(entry) {
  const candidates = [];
  if (entry?.subtitle) candidates.push(entry.subtitle);
  (entry?.pages || []).forEach(page => {
    if (page?.quote) candidates.push(page.quote);
    if (page?.description) candidates.push(page.description);
    if (page?.commentText) candidates.push(page.commentText);
    (page?.sceneBlocks || []).forEach(block => {
      if (block?.text) candidates.push(block.text);
    });
  });
  return stripArchiveDashboardText(candidates.find(text => stripArchiveDashboardText(text).length >= 80) || candidates[0] || '');
}

function buildArchiveDashboardTriviaCards(sections = []) {
  const items = getArchiveDashboardEntries(sections)
    .map(item => ({
      ...item,
      text: getArchiveDashboardTriviaText(item.entry),
      image: getArchiveDashboardEntryImage(item.entry),
      commentator: getArchiveDashboardCommentator(item.entry)
    }))
    .filter(item => item.text && item.entry?.id)
    .slice(0, 5);

  if (!items.length) {
    return '<div class="archive-dashboard-empty">Noch keine verwertbaren Fakten gefunden.</div>';
  }

  return items.map(item => {
    const text = item.text.length > 190 ? `${item.text.slice(0, 187).trim()}...` : item.text;
    const avatar = item.commentator.avatar
      ? `<img src="${escapeHtml(item.commentator.avatar)}" alt="${escapeHtml(item.commentator.name)}" loading="lazy" decoding="async">`
      : `<span>${escapeHtml(getInitialChar(item.commentator.name))}</span>`;
    return `
      <article class="archive-dashboard-trivia-card">
        <div class="archive-dashboard-trivia-avatar">${avatar}</div>
        <div>
          <div class="archive-dashboard-card-kicker">Wusstest du das?</div>
          <p>${escapeHtml(text)}</p>
          <button type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(item.entry.id)}">
            ${escapeHtml(item.entry.title || item.entry.id)}
          </button>
          <small>${escapeHtml(getSectionOptionLabel(item.section))}</small>
        </div>
      </article>`;
  }).join('');
}

function buildArchiveDashboardSceneCards(sections = []) {
  const scenes = getArchiveDashboardEntries(sections)
    .filter(item => (item.entry?.pages || []).some(page => page?.sessionPage))
    .slice(0, 4);
  if (!scenes.length) return '<div class="archive-dashboard-empty">Keine interaktiven Szenen gefunden.</div>';
  return scenes.map(item => {
    const image = getArchiveDashboardEntryImage(item.entry);
    return `
      <button class="archive-dashboard-scene-card" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(item.entry.id)}">
        ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : '<span></span>'}
        <strong>${escapeHtml(item.entry.title || item.entry.id)}</strong>
        <small>${escapeHtml(getSectionOptionLabel(item.section))}</small>
      </button>`;
  }).join('');
}

function buildArchiveDashboardQuickCards(sections = []) {
  return buildArchiveDashboardSectionCards(sections);
}

function buildArchiveDashboardSectionCards(sections = []) {
  const grouped = new Map();
  sections.forEach(section => {
    const label = section.tab || section.key || 'Archiv';
    const existing = grouped.get(label) || {
      label,
      theme: getThemeMetaForSection(section),
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
      <div class="archive-dashboard-hero">
        <div>
          <div class="archive-dashboard-kicker">Almanach-Dashboard</div>
          <h2>Startpunkt fuer Szenen, Weltwissen und offene Register</h2>
          <p>Hier liegen die wichtigsten Einstiegspunkte, lebendige Archivfunde und aktuelle Aktivitaeten zusammen.</p>
        </div>
        <div class="archive-dashboard-stats">
          <span><strong>${stats.moduleCount}</strong> Module</span>
          <span><strong>${stats.pageCount}</strong> Seiten</span>
          <span><strong>${stats.commentReadyCount}</strong> Dialogbereit</span>
          <span><strong>${stats.customSectionCount}</strong> Eigene Reiter</span>
        </div>
      </div>
      <div class="archive-dashboard-grid">
        <section class="archive-dashboard-panel archive-dashboard-panel-wide" data-dashboard-insights-panel>
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Archivfunken</div>
              <h3>Wusstest du das?</h3>
            </div>
            <button class="archive-dashboard-ai-btn" type="button" data-archive-action="generate-dashboard-insights">Neue Archivfunken finden</button>
          </div>
          <div class="archive-dashboard-insight-status" data-dashboard-insights-status>
            ${typeof getArchiveDashboardInsights === 'function' && getArchiveDashboardInsights().length
              ? `${getArchiveDashboardInsights().length} gespeicherte Archivfunken.`
              : 'Noch keine KI-Funken gespeichert.'}
          </div>
          <div class="archive-dashboard-trivia-grid" data-dashboard-insights-grid>
            ${typeof renderArchiveDashboardInsightCards === 'function'
              ? renderArchiveDashboardInsightCards(undefined, sections)
              : buildArchiveDashboardTriviaCards(sections)}
          </div>
        </section>
        <section class="archive-dashboard-panel">
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Szenen</div>
              <h3>Interaktive Einstiege</h3>
            </div>
          </div>
          <div class="archive-dashboard-scene-list">
            ${buildArchiveDashboardSceneCards(sections)}
          </div>
        </section>
        <section class="archive-dashboard-panel">
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Aktivitaet</div>
              <h3>Letzte Stimmen</h3>
            </div>
          </div>
          <div class="archive-dashboard-activity" data-dashboard-activity>
            <div class="archive-dashboard-empty">Aktivitaeten werden geladen...</div>
          </div>
        </section>
        <section class="archive-dashboard-panel archive-dashboard-panel-wide">
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Schnellzugriff</div>
              <h3>Weltpfade</h3>
            </div>
          </div>
          <div class="archive-dashboard-sections">
            ${buildArchiveDashboardQuickCards(sections)}
          </div>
        </section>
      </div>
    </section>`;
}

async function hydrateArchiveDashboardActivity() {
  const target = document.querySelector('[data-dashboard-activity]');
  if (!target) return;
  try {
    const backend = typeof getCommentBackend === 'function'
      ? await getCommentBackend({ timeoutMs: 1200 })
      : (await waitForFirebaseReady(1200), window._fb);
    if (!backend?.loadRecentComments) return;
    const rawComments = await backend.loadRecentComments(8);
    const comments = (typeof sortSidebarFeedComments === 'function'
      ? sortSidebarFeedComments(rawComments)
      : (Array.isArray(rawComments) ? rawComments : [])
    ).slice(0, 4);
    const sections = getValidSections();
    const items = comments.map(comment => {
      const threadId = String(comment?.entryId || '');
      const location = typeof parseCommentThreadLocation === 'function'
        ? parseCommentThreadLocation(threadId)
        : { baseEntryId: threadId };
      let entry = null;
      let section = null;
      for (const candidate of sections) {
        const found = (candidate.entries || []).find(item => item.id === location.baseEntryId);
        if (found) {
          entry = found;
          section = candidate;
          break;
        }
      }
      if (!entry) return '';
      const name = comment?.narrator ? 'Erzaehler' : (comment?.charName || 'Unbekannt');
      const portrait = sanitizeImageSrc(comment?.portrait || '');
      const avatar = portrait
        ? `<img src="${escapeHtml(portrait)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`
        : `<span>${escapeHtml(getInitialChar(name))}</span>`;
      return `
        <button class="archive-dashboard-activity-item" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(entry.id)}">
          <span class="archive-dashboard-activity-avatar">${avatar}</span>
          <span>
            <strong>${escapeHtml(name)}</strong>
            <small>${escapeHtml(entry.title || entry.id)} / ${escapeHtml(typeof formatTimeAgo === 'function' ? formatTimeAgo(comment) : '')}</small>
          </span>
        </button>`;
    }).filter(Boolean);
    target.innerHTML = items.length ? items.join('') : '<div class="archive-dashboard-empty">Noch keine Aktivitaeten.</div>';
  } catch (error) {
    console.warn('dashboard activity failed:', error);
    target.innerHTML = '<div class="archive-dashboard-empty">Aktivitaeten konnten nicht geladen werden.</div>';
  }
}
