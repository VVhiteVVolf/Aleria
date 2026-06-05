(function () {
  const searchInput = document.querySelector('[data-role="page-search"]');
  const pageItems = Array.from(document.querySelectorAll('[data-page-item]'));
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  const visibleCount = document.querySelector('[data-role="visible-count"]');
  const totalCount = document.querySelector('[data-role="total-count"]');
  const emptyState = document.querySelector('[data-role="empty-state"]');

  if (!searchInput || !pageItems.length) return;

  if (totalCount) totalCount.textContent = String(pageItems.length);

  function normalize(value) {
    return String(value || '')
      .toLocaleLowerCase('de-DE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function itemMatches(item, query) {
    if (!query) return true;
    return normalize(item.dataset.search || item.textContent).includes(query);
  }

  function syncSectionVisibility() {
    sections.forEach((section) => {
      const hasVisibleItem = Boolean(section.querySelector('[data-page-item]:not([hidden])'));
      section.hidden = !hasVisibleItem;
    });
  }

  function applyFilter() {
    const query = normalize(searchInput.value.trim());
    let shown = 0;

    pageItems.forEach((item) => {
      const matches = itemMatches(item, query);
      item.hidden = !matches;
      if (matches) shown += 1;
    });

    syncSectionVisibility();

    if (visibleCount) visibleCount.textContent = String(shown);
    if (emptyState) emptyState.hidden = shown > 0;
  }

  searchInput.addEventListener('input', applyFilter);
  applyFilter();
})();
