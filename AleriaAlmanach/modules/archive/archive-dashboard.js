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
  const image = getArchiveEntryPreviewImage(entry);
  return /(?:platzhalter|placeholder)/i.test(String(image || '')) ? '' : image;
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

function isArchiveDashboardPlaceholderText(value) {
  return /(?:lorem ipsum|platzhalter|placeholder|todo\b|noch ausf[üu]llen|coming soon)/i.test(String(value || ''));
}

function getArchiveDashboardEntryExcerpt(entry) {
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
  return candidates
    .map(stripArchiveDashboardText)
    .find(text => text.length >= 55 && !isArchiveDashboardPlaceholderText(text)) || '';
}

function getArchiveDashboardDailyDiscovery(sections = [], date = new Date()) {
  const candidates = getArchiveDashboardEntries(sections)
    .map(item => ({ ...item, excerpt: getArchiveDashboardEntryExcerpt(item.entry) }))
    .filter(item => item.entry?.id && item.entry?.title && item.excerpt)
    .sort((left, right) => String(left.entry.id).localeCompare(String(right.entry.id), 'de'));
  if (!candidates.length) return null;

  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const seed = [...dateKey].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 7);
  return candidates[seed % candidates.length];
}

function buildArchiveDashboardDiscoveryPanel(sections = []) {
  const item = getArchiveDashboardDailyDiscovery(sections);
  if (!item) return '';
  const image = getArchiveDashboardEntryImage(item.entry);
  const excerpt = item.excerpt.length > 220 ? `${item.excerpt.slice(0, 217).trim()}…` : item.excerpt;
  return `
    <section class="archive-dashboard-panel archive-dashboard-discovery-panel" data-dashboard-discovery-panel>
      <div class="archive-dashboard-panel-head">
        <div>
          <div class="archive-dashboard-kicker">Aus dem Archiv</div>
          <h3>Fundstück des Tages</h3>
        </div>
        <span class="archive-dashboard-panel-mark" aria-hidden="true">✦</span>
      </div>
      <button class="archive-dashboard-discovery-card" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(item.entry.id)}">
        ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : ''}
        <span class="archive-dashboard-discovery-copy">
          <strong>${escapeHtml(item.entry.title)}</strong>
          <span>${escapeHtml(excerpt)}</span>
          <small>${escapeHtml(getSectionOptionLabel(item.section))} <b aria-hidden="true">→</b></small>
        </span>
      </button>
    </section>`;
}

function formatArchiveDashboardRelativeTime(timestamp) {
  const elapsed = Math.max(0, Date.now() - Number(timestamp || 0));
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(new Date(timestamp));
}

function getArchiveDashboardPrimaryScenePageIndex(entry) {
  const pageIndex = (Array.isArray(entry?.pages) ? entry.pages : []).findIndex(page => page?.sessionPage);
  return Math.max(0, pageIndex);
}

function getArchiveDashboardScenes(sections = [], options = {}) {
  let scenes = getArchiveDashboardEntries(sections)
    .filter(item => (item.entry?.pages || []).some(page => page?.sessionPage));
  if (typeof sortAlmanachDashboardScenesByActivity === 'function') {
    scenes = sortAlmanachDashboardScenesByActivity(scenes);
  }
  if (options.activityOnly && typeof getAlmanachDashboardSceneActivity === 'function') {
    scenes = scenes.filter(item => getAlmanachDashboardSceneActivity(item.entry.id));
  }
  return scenes;
}

function buildArchiveDashboardSceneCards(sections = [], options = {}) {
  const scenes = getArchiveDashboardScenes(sections, options).slice(0, 4);
  return scenes.map(item => {
    const image = getArchiveDashboardEntryImage(item.entry);
    const activity = typeof getAlmanachDashboardSceneActivity === 'function'
      ? getAlmanachDashboardSceneActivity(item.entry.id)
      : null;
    const portrait = sanitizeImageSrc(activity?.authorPortrait || '');
    const pageIndex = activity?.pageIndex ?? getArchiveDashboardPrimaryScenePageIndex(item.entry);
    const excerpt = activity?.excerpt
      ? (activity.excerpt.length > 110 ? `${activity.excerpt.slice(0, 107).trim()}…` : activity.excerpt)
      : '';
    return `
      <button class="archive-dashboard-scene-card" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(item.entry.id)}" data-page-index="${pageIndex}">
        ${image ? `<img class="archive-dashboard-scene-cover" src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : '<span class="archive-dashboard-scene-cover"></span>'}
        <span class="archive-dashboard-scene-copy">
          <span class="archive-dashboard-scene-heading">
            <strong>${escapeHtml(item.entry.title || item.entry.id)}</strong>
            ${activity ? `<em>${activity.commentCount} Beitr${activity.commentCount === 1 ? 'ag' : 'äge'}</em>` : ''}
          </span>
          ${activity ? `
            <span class="archive-dashboard-scene-activity">
              ${portrait ? `<img src="${escapeHtml(portrait)}" alt="" loading="lazy" decoding="async">` : '<i aria-hidden="true">✦</i>'}
              <span>Zuletzt ${escapeHtml(activity.authorName)} · ${escapeHtml(formatArchiveDashboardRelativeTime(activity.activityAt))}</span>
            </span>
            ${excerpt ? `<span class="archive-dashboard-scene-excerpt">${escapeHtml(excerpt)}</span>` : ''}` : `
            <small>${escapeHtml(getSectionOptionLabel(item.section))}</small>`}
        </span>
      </button>`;
  }).join('');
}

function getArchiveDashboardPrimaryScene(sections = []) {
  return getArchiveDashboardScenes(sections)[0] || null;
}

function getArchiveDashboardPrimarySection(sections = []) {
  return sections.find(section => (section.entries || []).length) || sections[0] || null;
}

function buildArchiveDashboardHeroActions(sections = []) {
  const primarySection = getArchiveDashboardPrimarySection(sections);
  const primaryScene = getArchiveDashboardPrimaryScene(sections);
  const primarySceneActivity = primaryScene && typeof getAlmanachDashboardSceneActivity === 'function'
    ? getAlmanachDashboardSceneActivity(primaryScene.entry.id)
    : null;
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
        <button class="archive-dashboard-primary-action" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(primaryScene.entry.id)}" data-page-index="${primarySceneActivity?.pageIndex ?? getArchiveDashboardPrimaryScenePageIndex(primaryScene.entry)}">
          <span>Szene öffnen</span>
          <small>${escapeHtml(primaryScene.entry.title || 'Interaktive Szene')}</small>
        </button>` : ''}
      <button class="archive-dashboard-secondary-action" type="button" data-archive-action="focus-dashboard-search">
        Im Almanach suchen
      </button>
    </div>`;
}

function buildArchiveDashboardRecentTrail(sections = []) {
  const recent = typeof getAlmanachDashboardRecentEntries === 'function'
    ? getAlmanachDashboardRecentEntries(sections, 4)
    : [];
  if (!recent.length) return '';
  return `
    <div class="archive-dashboard-recent-head">
      <span>Deine letzten Spuren</span>
      <small>Lokal auf diesem Gerät</small>
    </div>
    <div class="archive-dashboard-recent-list">
      ${recent.map(item => `
        <button type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(item.entry.id)}" data-page-index="${item.pageIndex}">
          <span>${escapeHtml(item.entry.title || item.entry.id)}</span>
          <small>${escapeHtml(item.pageLabel || getSectionOptionLabel(item.section))}</small>
        </button>`).join('')}
    </div>`;
}

function refreshArchiveDashboardHeroActions() {
  const current = document.querySelector('[data-dashboard-hero-actions]');
  const recent = document.querySelector('[data-dashboard-recent]');
  if (!current && !recent) return;
  const sections = getValidSections();
  if (current) current.outerHTML = buildArchiveDashboardHeroActions(sections);
  if (recent) recent.innerHTML = buildArchiveDashboardRecentTrail(sections);
}

document.addEventListener('almanach:dashboard-history-changed', refreshArchiveDashboardHeroActions);

function buildArchiveDashboardQuickCards(sections = []) {
  return buildArchiveDashboardSectionCards(sections);
}

const ARCHIVE_DASHBOARD_TAB_ICONS = Object.freeze({
  'Völker & Kulturen': '../IconOrdner/ReiterIcons/Weltpfade/voelker-kulturen.png',
  Magie: '../IconOrdner/ReiterIcons/Weltpfade/magie.png',
  Infernales: '../IconOrdner/ReiterIcons/Weltpfade/infernales.png',
  Celestiales: '../IconOrdner/ReiterIcons/Weltpfade/celestiales.png',
  Schiffe: '../IconOrdner/ReiterIcons/Weltpfade/schiffe.png',
  Werke: '../IconOrdner/ReiterIcons/Weltpfade/werke.png',
  Kriminalität: '../IconOrdner/ReiterIcons/Weltpfade/kriminalitaet.png',
  Forschung: '../IconOrdner/ReiterIcons/Weltpfade/forschung.png',
  Religion: '../IconOrdner/ReiterIcons/Weltpfade/religion.png',
  Söldner: '../IconOrdner/ReiterIcons/Weltpfade/soeldner.png',
  Sport: '../IconOrdner/ReiterIcons/Weltpfade/sport.png',
  Sprachen: '../IconOrdner/ReiterIcons/Weltpfade/sprachen.png',
  Chroniken: '../IconOrdner/ReiterIcons/Weltpfade/chroniken.png',
  Void: '../IconOrdner/ReiterIcons/Weltpfade/void.png',
  Events: '../IconOrdner/ReiterIcons/Weltpfade/events.png',
  Gruppen: '../IconOrdner/ReiterIcons/Weltpfade/gruppen.png',
  Techniken: '../IconOrdner/ReiterIcons/Weltpfade/techniken.png'
});

function getArchiveDashboardTabIcon(label, sectionIconUrl = '') {
  return sanitizeImageSrc(sectionIconUrl || ARCHIVE_DASHBOARD_TAB_ICONS[label] || '');
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
    if (!existing.iconUrl) existing.iconUrl = getArchiveDashboardTabIcon(label, section.iconUrl);
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

function buildArchiveDashboardInsightsPanel() {
  const insights = typeof getArchiveDashboardInsights === 'function'
    ? getArchiveDashboardInsights()
    : [];
  const cards = typeof renderArchiveDashboardInsightCards === 'function'
    ? renderArchiveDashboardInsightCards(insights)
    : '';
  return `
    <section class="archive-dashboard-panel archive-dashboard-panel-full archive-dashboard-insights-panel${cards ? '' : ' is-empty'}" data-dashboard-insights-panel>
      <div class="archive-dashboard-panel-head">
        <div>
          <div class="archive-dashboard-kicker">Archivfunken</div>
          <h3>Wusstest du schon?</h3>
        </div>
        <button class="archive-dashboard-ai-btn" type="button" data-archive-action="generate-dashboard-insights">
          ${cards ? 'Neue Entdeckungen' : 'Archivfunken entdecken'}
        </button>
      </div>
      <div class="archive-dashboard-insight-status" data-dashboard-insights-status role="status" aria-live="polite" hidden></div>
      <div class="archive-dashboard-trivia-grid" data-dashboard-insights-grid>${cards}</div>
    </section>`;
}

function renderArchiveDashboard(sections = []) {
  const stats = getArchiveDashboardStats(sections);
  const discoveryPanel = buildArchiveDashboardDiscoveryPanel(sections);
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
      <div class="archive-dashboard-recent" data-dashboard-recent>
        ${buildArchiveDashboardRecentTrail(sections)}
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
        <section class="archive-dashboard-panel archive-dashboard-panel-scenes archive-dashboard-panel-wide" data-dashboard-scenes-panel>
          <div class="archive-dashboard-panel-head">
            <div>
              <div class="archive-dashboard-kicker">Szenenchronik</div>
              <h3>Zuletzt kommentiert</h3>
            </div>
            <span class="archive-dashboard-panel-count" data-dashboard-scene-count hidden></span>
          </div>
          <div class="archive-dashboard-scene-list" data-dashboard-scene-list>
            ${buildArchiveDashboardSceneCards(sections)}
          </div>
        </section>
        ${discoveryPanel}
        ${buildArchiveDashboardInsightsPanel()}
      </div>
    </section>`;
}
