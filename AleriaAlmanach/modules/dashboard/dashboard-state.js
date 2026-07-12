const ALMANACH_DASHBOARD_HISTORY_KEY = 'aleria-dashboard-history-v1';
const ALMANACH_DASHBOARD_HISTORY_LIMIT = 8;

let _almanachDashboardHistory = readAlmanachDashboardHistory();

function normalizeAlmanachDashboardVisit(value) {
  const entryId = String(value?.entryId || '').trim();
  if (!entryId) return null;
  const pageIndex = Math.max(0, Math.trunc(Number(value?.pageIndex) || 0));
  const visitedAt = Number(value?.visitedAt) || 0;
  return { entryId, pageIndex, visitedAt };
}

function readAlmanachDashboardHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALMANACH_DASHBOARD_HISTORY_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeAlmanachDashboardVisit)
      .filter(Boolean)
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, ALMANACH_DASHBOARD_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function persistAlmanachDashboardHistory() {
  try {
    localStorage.setItem(ALMANACH_DASHBOARD_HISTORY_KEY, JSON.stringify(_almanachDashboardHistory));
  } catch {
    // Die Navigation funktioniert auch ohne verfuegbaren lokalen Speicher.
  }
}

function recordAlmanachDashboardVisit(entry, pageIndex = 0) {
  const entryId = String(entry?.id || '').trim();
  if (!entryId) return;

  const normalizedPageIndex = Math.max(0, Math.trunc(Number(pageIndex) || 0));
  const current = _almanachDashboardHistory[0];
  if (current?.entryId === entryId && current.pageIndex === normalizedPageIndex) return;

  _almanachDashboardHistory = [
    { entryId, pageIndex: normalizedPageIndex, visitedAt: Date.now() },
    ..._almanachDashboardHistory.filter(item => item.entryId !== entryId)
  ].slice(0, ALMANACH_DASHBOARD_HISTORY_LIMIT);
  persistAlmanachDashboardHistory();
  if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
    document.dispatchEvent(new CustomEvent('almanach:dashboard-history-changed'));
  }
}

function getAlmanachDashboardHistory() {
  return _almanachDashboardHistory.map(item => ({ ...item }));
}

function getAlmanachDashboardPageLabel(entry, pageIndex) {
  const pages = Array.isArray(entry?.pages) ? entry.pages.filter(Boolean) : [];
  if (pageIndex >= pages.length && entry?.appendCommentsPage !== false) return 'Kommentare';
  return String(pages[pageIndex]?.pageTitle || '').trim();
}

function getAlmanachDashboardRecentEntries(sections = [], limit = 4) {
  const entriesById = new Map();
  sections.forEach(section => {
    (section?.entries || []).forEach(entry => {
      const entryId = String(entry?.id || '').trim();
      if (entryId && !entriesById.has(entryId)) entriesById.set(entryId, { entry, section });
    });
  });

  return getAlmanachDashboardHistory()
    .map(visit => {
      const match = entriesById.get(visit.entryId);
      if (!match) return null;
      return {
        ...match,
        pageIndex: visit.pageIndex,
        pageLabel: getAlmanachDashboardPageLabel(match.entry, visit.pageIndex),
        visitedAt: visit.visitedAt
      };
    })
    .filter(Boolean)
    .slice(0, Math.max(0, Number(limit) || 0));
}

function getAlmanachDashboardContinuation(sections = []) {
  return getAlmanachDashboardRecentEntries(sections, 1)[0] || null;
}
