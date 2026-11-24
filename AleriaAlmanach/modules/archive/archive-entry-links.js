(function () {
  'use strict';

  // Registered before app.js: the entry store must be ready before opening it.
  window.addEventListener('almanach:app-ready', async () => {
    const parameters = new URLSearchParams(window.location.search);
    const id = String(parameters.get('entry') || '').trim();
    if (id && id.length <= 160) {
      const threadId = parameters.get('thread');
      const destination = threadId && parseCommentThreadLocation(threadId).baseEntryId === id
        ? findCommentThreadDestination(threadId, getValidSections()) : null;
      if (destination) {
        openArchiveEntryById(destination.entry.id, { pageIndex: destination.pageIndex });
        return;
      }
      const found = threadId ? findCurrentSectionByEntryId(id) : null;
      const pageIndex = threadId && found?.entry ? getPages(found.entry).findIndex((page, index) =>
        (getCommentThreadForPage(page, found.entry, index) || getInlineCommentThreadForPage(page, found.entry, index))?.threadId === threadId) : -1;
      openArchiveEntryById(id, pageIndex >= 0 ? { pageIndex } : {});
      return;
    }
    const characterId = parameters.get('character'), creatureId = parameters.get('creature');
    const group = parameters.get('characterGroup')?.trim();
    const subgroup = parameters.get('characterSubgroup')?.trim();
    try {
      if (group && group.length <= 80) {
        switchTab('Charaktere');
        await AleriaCharacterDirectory.load();
        if (_activeTab !== 'Charaktere') return;
        if (!_charTabs.includes(group)) {
          showAppStatus('Diese Figurengruppe wurde nicht gefunden.', 'info');
          return;
        }
        selectCharacterTab(group);
        if (subgroup && getCharacterSubtabs(group).includes(subgroup)) selectCharacterSubtab(subgroup);
        return;
      }
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
