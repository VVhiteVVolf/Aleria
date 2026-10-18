const rowSelector = '.kingdom-frame > tbody > tr, .grossstadt-template-frame > tbody > tr';
const referenceSelector = '.haeuser-info-table, .haeuser-landscape-slot, .kingdom-infobox, .orte-introduction-map, .pt-s-0024';

// A reading column follows its own illustration/fact sheet. Nothing is moved out
// of the source document; editors, chapter anchors and exports retain their nodes.
export function mountReadingPanels(page) {
  const records = new Map();
  let frame = 0;
  let disposed = false;
  let revealedTarget = null;
  const resize = new ResizeObserver(schedule);
  const mutations = new MutationObserver(schedule);
  const print = matchMedia('print');

  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(refresh);
  }

  function refresh() {
    frame = 0;
    const rows = new Set(page.querySelectorAll(rowSelector));
    for (const [row, record] of records) {
      if (!rows.has(row) || !row.isConnected || row.children.length !== 2 || record.left.parentElement !== row || record.right.parentElement !== row || record.left.matches('.orte-paired-copy')) {
        reset(record);
        resize.unobserve(record.left);
        resize.unobserve(record.reference);
        records.delete(row);
      }
    }
    for (const row of rows) {
      const cells = [...row.children].filter(cell => cell.matches('td, th'));
      if (cells.length !== 2) continue;
      const [left, right] = cells;
      if (left.matches('.orte-paired-copy')) continue; // Existing city containment owns these panels.
      const prose = left.matches('.haeuser-main-cell, .kingdom-content-column')
        || left.querySelector('.orte-balanced-text-panel, .orte-introduction-panel');
      if (!prose) continue;
      if (!left.querySelector('p') || !right.querySelector('img, table, .orte-image-slot')) continue;
      const reference = right.querySelector(referenceSelector) || right.firstElementChild || right;
      let record = records.get(row);
      if (!record || record.reference !== reference) {
        if (record) { reset(record); resize.unobserve(record.reference); }
        record = { left, right, reference, active: false, attributes: null };
        records.set(row, record);
        resize.observe(left);
        resize.observe(reference);
      }
      update(record);
    }
    revealChapter();
  }

  function update(record) {
    const { left, right, reference } = record;
    const column = left.getBoundingClientRect();
    const side = right.getBoundingClientRect();
    const height = Math.floor(reference.getBoundingClientRect().bottom - column.top);
    const beside = side.left >= column.right - 2 && side.width > 0;
    if (print.matches || !beside || !reference.checkVisibility() || height < 80 || left.scrollHeight <= height + 2) {
      reset(record);
      return;
    }
    if (!record.active) {
      record.attributes = Object.fromEntries(['tabindex', 'role', 'aria-label'].map(name => [name, left.getAttribute(name)]));
      left.tabIndex = 0;
      left.setAttribute('role', 'region');
      left.setAttribute('aria-label', `Lesebereich: ${left.querySelector('h2, h3, .kingdom-section-heading')?.textContent.trim() || 'Beschreibung'}`);
      record.active = true;
    }
    left.style.setProperty('--codex-reading-height', `${height}px`);
    left.classList.add('codex-reading-column');
  }

  function reset(record) {
    if (!record.active) return;
    record.left.classList.remove('codex-reading-column');
    record.left.style.removeProperty('--codex-reading-height');
    for (const [name, value] of Object.entries(record.attributes)) {
      if (value === null) record.left.removeAttribute(name);
      else record.left.setAttribute(name, value);
    }
    record.active = false;
  }

  function revealChapter() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = id ? document.getElementById(id) : null;
    if (!target || target === revealedTarget) return;
    const column = target.closest('.codex-reading-column');
    if (column) column.scrollTop += target.getBoundingClientRect().top - column.getBoundingClientRect().top;
    revealedTarget = target;
  }
  function hashChanged() { revealedTarget = null; schedule(); }

  mutations.observe(page, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src', 'hidden'] });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', hashChanged);
  page.addEventListener('toggle', schedule, true);
  print.addEventListener('change', schedule);
  document.fonts?.addEventListener('loadingdone', schedule);
  document.fonts?.ready.then(schedule);
  refresh();
  return () => {
    disposed = true;
    mutations.disconnect();
    resize.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('hashchange', hashChanged);
    page.removeEventListener('toggle', schedule, true);
    print.removeEventListener('change', schedule);
    document.fonts?.removeEventListener('loadingdone', schedule);
    records.forEach(reset);
  };
}
