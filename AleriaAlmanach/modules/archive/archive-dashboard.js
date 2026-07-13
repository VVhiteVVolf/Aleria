function getArchiveDashboardStats(sections = []) {
  const allEntries = sections.flatMap(section => Array.isArray(section.entries) ? section.entries : []);
  const tabCount = new Set(sections.map(section => section.tab || section.key).filter(Boolean)).size;
  const moduleCount = allEntries.length;
  const pageCount = allEntries.reduce((sum, entry) => sum + getArchiveEntryPageCount(entry), 0);
  const sceneCount = allEntries.filter(entry => (entry?.pages || []).some(page => page?.sessionPage)).length;
  return {
    moduleCount,
    pageCount,
    sceneCount,
    sectionCount: tabCount
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
  return getArchiveEntryPreviewImage(entry);
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
    .slice(0, 3);

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

function getArchiveDashboardPrimaryScene(sections = []) {
  return getArchiveDashboardEntries(sections)
    .find(item => (item.entry?.pages || []).some(page => page?.sessionPage)) || null;
}

function getArchiveDashboardPrimarySection(sections = []) {
  return sections.find(section => (section.entries || []).length) || sections[0] || null;
}

function buildArchiveDashboardHeroActions(sections = []) {
  const primarySection = getArchiveDashboardPrimarySection(sections);
  const primaryScene = getArchiveDashboardPrimaryScene(sections);
  const continuation = typeof getAlmanachDashboardContinuation === 'function'
    ? getAlmanachDashboardContinuation(sections)
    : null;
  const sectionLabel = primarySection?.tab || primarySection?.key || '';
  return `
    <div class="archive-dashboard-hero-actions" role="group" aria-label="Schnelleinstiege" data-dashboard-hero-actions>
      ${continuation ? `
        <button class="archive-dashboard-primary-action" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(continuation.entry.id)}" data-page-index="${continuation.pageIndex}">
          <span>Weiterlesen</span>
          <small>${escapeHtml(continuation.entry.title || continuation.entry.id)}${continuation.pageLabel ? ` · ${escapeHtml(continuation.pageLabel)}` : ''}</small>
        </button>` : sectionLabel ? `
        <button class="archive-dashboard-primary-action" type="button" data-archive-action="switch-tab" data-tab="${escapeHtml(sectionLabel)}">
          <span>Welt erkunden</span>
          <small>Register und Weltwissen öffnen</small>
        </button>` : ''}
      ${primaryScene && primaryScene.entry.id !== continuation?.entry?.id ? `
        <button class="archive-dashboard-primary-action" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(primaryScene.entry.id)}">
          <span>Szene öffnen</span>
          <small>${escapeHtml(primaryScene.entry.title || 'Interaktive Szene')}</small>
        </button>` : ''}
      <button class="archive-dashboard-secondary-action" type="button" data-archive-action="focus-dashboard-search">
        Im Almanach suchen
      </button>
    </div>`;
}

function refreshArchiveDashboardHeroActions() {
  const current = document.querySelector('[data-dashboard-hero-actions]');
  if (!current) return;
  current.outerHTML = buildArchiveDashboardHeroActions(getValidSections());
}

document.addEventListener('almanach:dashboard-history-changed', refreshArchiveDashboardHeroActions);

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
      iconUrl: '',
      entries: []
    };
    if (!existing.iconUrl) existing.iconUrl = sanitizeImageSrc(section.iconUrl || '');
    existing.entries.push(...(Array.isArray(section.entries) ? section.entries : []));
    grouped.set(label, existing);
  });

  return Array.from(grouped.values()).map(group => {
    const section = { key: group.label, tab: group.label };
    const entries = group.entries;
    const stats = getArchiveSectionStats(section, entries);
    return `
      <button class="archive-dashboard-section" type="button" data-archive-action="switch-tab" data-tab="${escapeHtml(group.label)}" data-section-theme="${escapeHtml(group.theme.slug)}">
        ${group.iconUrl ? `<img class="archive-dashboard-section-icon" src="${escapeHtml(group.iconUrl)}" alt="" loading="lazy" decoding="async">` : '<span class="archive-dashboard-section-mark" aria-hidden="true">✦</span>'}
        <span class="archive-dashboard-section-copy">
          <span class="archive-dashboard-section-name">${escapeHtml(group.label)}</span>
          <span class="archive-dashboard-section-meta">${stats.moduleCount} Module &middot; ${stats.pageCount} Seiten</span>
        </span>
        <span class="archive-dashboard-section-arrow" aria-hidden="true">→</span>
      </button>`;
  }).join('');
}

function renderArchiveDashboard(sections = []) {
  const stats = getArchiveDashboardStats(sections);
  return `
    <section class="archive-dashboard" aria-label="Archivuebersicht">
      <div class="archive-dashboard-hero">
        <div class="archive-dashboard-hero-copy">
          <div class="archive-dashboard-kicker">Almanach-Dashboard</div>
          <h2>Willkommen im Aleria Almanach</h2>
          <p>Erkunde die Welt, kehre in eine Szene zurück oder finde gezielt den nächsten Archivpfad.</p>
          ${buildArchiveDashboardHeroActions(sections)}
        </div>
        <div class="archive-dashboard-stats">
          <span><strong>${stats.moduleCount}</strong> Module</span>
          <span><strong>${stats.pageCount}</strong> Seiten</span>
          <span><strong>${stats.sectionCount}</strong> Bereiche</span>
          <span><strong>${stats.sceneCount}</strong> Szenen</span>
        </div>
      </div>
      <div class="archive-dashboard-grid">
        <section class="archive-dashboard-panel archive-dashboard-panel-paths archive-dashboard-panel-full">
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Welt erkunden</div>
              <h3>Weltpfade</h3>
            </div>
          </div>
          <div class="archive-dashboard-sections">
            ${buildArchiveDashboardQuickCards(sections)}
          </div>
        </section>
        <section class="archive-dashboard-panel archive-dashboard-panel-wide" data-dashboard-insights-panel>
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Archivfunken</div>
              <h3>Wusstest du das?</h3>
            </div>
            <button class="archive-dashboard-ai-btn" type="button" data-archive-action="generate-dashboard-insights">Neue Entdeckungen</button>
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
      </div>
    </section>`;
}
