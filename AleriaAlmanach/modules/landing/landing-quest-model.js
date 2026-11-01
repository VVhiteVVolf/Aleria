const ids = input => [...new Set((Array.isArray(input) ? input : String(input || '').split(/[\n,]/)).map(value => String(value).trim()).filter(value => /^[\w:.-]{1,300}$/.test(value)))].slice(0, 40);
export function normalizeLandingQuestJournal(input = {}) {
  input = input && typeof input === 'object' ? input : {};
  return { enabled: input.enabled !== false, questIds: ids(input.questIds), runIds: ids(input.runIds), includeMembers: input.includeMembers !== false };
}
export function landingQuestJournalHref(entryId, view = '') {
  const params = new URLSearchParams({ module: entryId });
  if (view) params.set('view', view);
  return `./quests.html?${params}`;
}
export function landingQuestJournalShell(entryId) {
  const safeHref = landingQuestJournalHref(entryId).replace(/&/g, '&amp;');
  return `<section class="landing-panel landing-quest-journal" data-landing-quest-journal data-landing-quest-module="${encodeURIComponent(entryId)}" aria-label="Quests und Abenteuer"><header class="landing-panel-head"><h3><img src="../IconOrdner/ReiterIcons/Quests.svg" alt="">Quests &amp; Abenteuer</h3><a href="${safeHref}" target="_blank" rel="noopener">Abenteuerjournal ↗</a></header><div data-landing-quest-content><p class="group-empty">Verknüpfte Aufträge und Gruppen werden geladen …</p></div></section>`;
}
