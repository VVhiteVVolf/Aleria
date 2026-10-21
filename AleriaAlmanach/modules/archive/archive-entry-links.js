(function () {
  'use strict';

  // Registered before app.js: the entry store must be ready before opening it.
  window.addEventListener('almanach:app-ready', () => {
    const parameters = new URLSearchParams(window.location.search);
    const id = String(parameters.get('entry') || '').trim();
    if (!id || id.length > 160) return;
    openArchiveEntryById(id);
  }, { once: true });
})();
