(function () {
  'use strict';

  const config = window.TAFEL_CONFIG || {};
  const boardId = config.boardId || 'template-tafel';
  const backupKey = `aleria.tafeln.backups.${boardId}`;
  const maxBackups = 10;
  let saveTimer = null;

  const state = {
    schemaVersion: 2,
    zettel: [],
    appliedAuthoredNoticeIds: [],
    appliedAuthoredUpdateIds: [],
    regionIcon: config.regionIcon || '',
    regionTitle: config.title || 'Anzeigetafel',
    boardImages: {},
    boardLayout: null,
    cardWidth: 1100,
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeNotice(notice) {
    if (!notice || typeof notice !== 'object') return null;
    const { stackId, stackOrder, noticeGroupId, ...fields } = notice;
    return {
      ...fields,
      ...(typeof stackId === 'string' && stackId.trim() ? { stackId: stackId.trim().slice(0, 200) } : {}),
      ...(typeof noticeGroupId === 'string' && noticeGroupId.trim() ? { noticeGroupId: noticeGroupId.trim().slice(0, 200) } : {}),
      ...(Number.isFinite(Number(stackOrder)) ? { stackOrder: Math.max(0, Math.trunc(Number(stackOrder))) } : {}),
      id: String(notice.id || ''),
      typ: String(notice.typ || 'notiz'),
      x: Math.max(0, Math.min(1, Number(notice.x) || 0)),
      y: Math.max(0, Math.min(1, Number(notice.y) || 0)),
      title: String(notice.title || ''),
      table: Array.isArray(notice.table) ? notice.table : [],
      artikel: Array.isArray(notice.artikel) ? notice.artikel : [],
      personen: Array.isArray(notice.personen) ? notice.personen : [],
      comments: Array.isArray(notice.comments) ? notice.comments : [],
      secret: Boolean(notice.secret),
    };
  }

  function snapshot() {
    return clone({
      schemaVersion: 2,
      zettel: state.zettel,
      ...(state.appliedAuthoredNoticeIds.length ? { appliedAuthoredNoticeIds: state.appliedAuthoredNoticeIds } : {}),
      ...(state.appliedAuthoredUpdateIds.length ? { appliedAuthoredUpdateIds: state.appliedAuthoredUpdateIds } : {}),
      regionIcon: state.regionIcon,
      regionTitle: state.regionTitle,
      boardImages: state.boardImages,
      ...(state.boardLayout ? { boardLayout: state.boardLayout } : {}),
      cardWidth: state.cardWidth,
    });
  }

  function apply(incoming) {
    if (!incoming || typeof incoming !== 'object') return;
    incoming = window.TafelBoardComposition?.prepareState(incoming) || incoming;
    if (Array.isArray(incoming.zettel)) {
      state.zettel = incoming.zettel.map(normalizeNotice).filter(notice => notice?.id);
      state.appliedAuthoredNoticeIds = Array.isArray(incoming.appliedAuthoredNoticeIds)
        ? [...new Set(incoming.appliedAuthoredNoticeIds.filter(id => typeof id === 'string' && id))] : [];
      state.appliedAuthoredUpdateIds = Array.isArray(incoming.appliedAuthoredUpdateIds)
        ? [...new Set(incoming.appliedAuthoredUpdateIds.filter(id => typeof id === 'string' && id))] : [];
      state.boardLayout = incoming.boardLayout ? clone(incoming.boardLayout) : null;
    }
    if (incoming.regionIcon !== undefined) state.regionIcon = String(incoming.regionIcon || '');
    if (incoming.regionTitle) state.regionTitle = String(incoming.regionTitle);
    if (incoming.boardImages && typeof incoming.boardImages === 'object') {
      state.boardImages = incoming.boardImages.board ? { board: String(incoming.boardImages.board) } : {};
    }
    if (Number.isFinite(Number(incoming.cardWidth))) {
      state.cardWidth = Math.max(500, Math.min(1600, Number(incoming.cardWidth)));
    }
    window.dispatchEvent(new CustomEvent('aleria:tafel:state-applied'));
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 250);
  }

  async function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    const saved = await window._fb?.saveAll(snapshot());
    if (saved !== true) return false;
    window.dispatchEvent(new CustomEvent('aleria:tafel:state-saved'));
    return true;
  }

  function readBackups() {
    try {
      const value = JSON.parse(localStorage.getItem(backupKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function backup(label = 'Manuell') {
    const backups = readBackups();
    backups.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      savedAt: new Date().toISOString(),
      state: snapshot(),
    });
    try {
      localStorage.setItem(backupKey, JSON.stringify(backups.slice(0, maxBackups)));
    } catch {
      /* Sicherungen sind eine optionale lokale Komfortfunktion. */
    }
  }

  function restoreBackup(id) {
    const entry = readBackups().find(item => item.id === id);
    if (!entry?.state) return false;
    backup('Vor Wiederherstellung');
    apply(entry.state);
    save();
    return true;
  }

  window.TafelState = Object.freeze({
    get: () => state,
    snapshot,
    apply,
    save,
    saveNow,
    backup,
    backups: readBackups,
    restoreBackup,
    flushPending: () => saveTimer !== null ? saveNow() : Promise.resolve(true),
  });
})();
