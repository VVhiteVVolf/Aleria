// Loaded by the shared board/map bootstraps, including their legacy entry pages.
import { mountPreparedQuestRoute } from './quest-route-map.js';
const params = new URL(location.href).searchParams;
let routed = false, navigating = false;
let routePreviewed = false;
function mount() {
  const boardId = globalThis.TAFEL_CONFIG?.boardId, mapId = globalThis.KARTO_CONFIG?.mapId;
  const topbar = document.querySelector('#topbar');
  if (!topbar || (!boardId && !mapId)) return;
  if (mapId && params.get('questRoute') && !routePreviewed) routePreviewed = mountPreparedQuestRoute(params.get('questRoute'));
  if (!topbar.querySelector('[data-quest-context-link]')) {
    const link = document.createElement('a'); link.className = 'tbtn'; link.dataset.questContextLink = '';
    link.textContent = 'Quests & Abenteuer ↗'; link.href = `/AleriaAlmanach/quests.html?${boardId ? 'board' : 'map'}=${encodeURIComponent(boardId || mapId)}`;
    link.target = '_blank'; link.rel = 'noopener'; topbar.append(link);
  }
  if (routed || navigating) return;
  if (boardId && params.get('notice') && globalThis.TafelNoticeReader && globalThis.TafelRuntime?.state()?.zettel?.some(row => row.id === params.get('notice'))) {
    globalThis.TafelNoticeReader.open(params.get('notice')); routed = true;
  }
  if (mapId && params.get('pin') && globalThis.KartoRuntime?.mapImageSize()?.width) {
    navigating = true;
    try { routed = globalThis.KartoPinNavigation?.focus(params.get('pin')) === true; }
    finally { navigating = false; }
  }
}
window.addEventListener('aleria:tafel:state-applied', mount);
window.addEventListener('aleria:tafel:state-saved', mount);
window.addEventListener('aleria:karto:state-changed', mount);
window.addEventListener('aleria:karto:pins-rendered', mount);
window.addEventListener('aleria:karto:map-render', mount);
window.addEventListener('load', mount, { once: true });
if (document.readyState !== 'loading') mount();
else document.addEventListener('DOMContentLoaded', mount, { once: true });
