import { mountQuestPage } from './quest-controller.js';
import { getQuestClient, getQuestCatalog } from './quest-client.js';
import { questsFromBoard } from './quest-sources.js';
import { mergeAuthoredArchiveState } from '../../../Anzeigetafeln/assets/js/archive/notice-archive-model.mjs';

const root = document.querySelector('[data-quest-page]');
if (root) {
  try {
    const catalog = await getQuestCatalog();
    const page = mountQuestPage(root, { catalog, calendar: globalThis.AleriaCalendar,
      async mergeBoard(board, state) {
        const row = catalog.boardStates.find(row => row.boardId === board.id);
        if (!row?.authoredPath) return questsFromBoard(board, state, catalog.maps);
        const response = await fetch(`/Anzeigetafeln/${row.authoredPath}`, { cache: 'no-cache' });
        if (!response.ok) throw Error(`Zusätzliche Aushänge von ${board.title} fehlen.`);
        const authored = await response.json();
        return questsFromBoard(board, mergeAuthoredArchiveState(globalThis.TafelAuthoredNotices.merge(state, authored), authored.archiveEntries), catalog.maps);
      },
      async templates() {
        const [{ STANDARD_ITEMS }, { itemDefinitionStore }, { connectItemDefinitionClient }, { loadItemRewardCatalog }] = await Promise.all([
          import('../item-register/item-register-standard.js'), import('../item-definitions/item-definition-store.js'), import('../item-definitions/item-definition-client.js'), import('../item-definitions/item-reward-catalog.js')]);
        await connectItemDefinitionClient();
        let goods = [];
        try { goods = await loadItemRewardCatalog(); }
        catch { root.dispatchEvent(new CustomEvent('quest-template-warning', { detail: 'Das Güterverzeichnis konnte nicht vollständig geladen werden. Standarditems bleiben auswählbar.' })); }
        return [...new Map([...STANDARD_ITEMS, ...goods, ...itemDefinitionStore.snapshot().templates].filter(item => !['pferde','vieh'].includes(item.category)).map(item => [`${item.definitionRef?.id || item.id}@${item.definitionRef?.revision || ''}`, item])).values()];
      }
    });
    getQuestClient().then(repository => page.connect(repository)).catch(error => page.fail(error));
    window.addEventListener('pagehide', () => page.destroy(), { once: true });
  } catch (error) { root.querySelector('[data-quest-status]').textContent = error.message; }
}
