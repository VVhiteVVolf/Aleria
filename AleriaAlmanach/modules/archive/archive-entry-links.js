(function () {
  'use strict';

  // Registered before app.js: the entry store must be ready before opening it.
  window.addEventListener('almanach:app-ready', async () => {
    const parameters = new URLSearchParams(window.location.search);
    const id = String(parameters.get('entry') || '').trim();
    if (id && id.length <= 160) {
      const threadId = parameters.get('thread'), found = threadId ? findCurrentSectionByEntryId(id) : null;
      const pageIndex = threadId && found?.entry ? getPages(found.entry).findIndex((page, index) =>
        (getCommentThreadForPage(page, found.entry, index) || getInlineCommentThreadForPage(page, found.entry, index))?.threadId === threadId) : -1;
      openArchiveEntryById(id, pageIndex >= 0 ? { pageIndex } : {});
      return;
    }
    const characterId = parameters.get('character'), creatureId = parameters.get('creature');
    try {
      if (characterId && /^[\w:.-]{1,180}$/.test(characterId)) {
        await loadCharacters();
        if (getCharacterById(characterId)) openCharProfile(characterId);
        else showAppStatus('Diese Figur wurde nicht gefunden.', 'info');
      }
      if (creatureId && /^[\w:.-]{1,180}$/.test(creatureId)) {
        await window.AleriaCreatures.reload();
        if (window.AleriaCreatures.getById(creatureId)) window.AleriaCreatures.open(creatureId);
        else showAppStatus('Diese Kreatur wurde nicht gefunden.', 'info');
      }
    } catch (error) { showAppStatus(error.message, 'error'); }
  }, { once: true });
})();
