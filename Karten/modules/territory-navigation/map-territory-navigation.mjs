/** Explicit registry links keep map navigation independent of map editor state. */
export function mountMapTerritoryNavigation(selectedMap, root = document) {
  const topbar = root.getElementById('topbar');
  if (!topbar || !selectedMap?.territoryHref) return;
  const link = root.createElement('a');
  link.className = 'tbtn';
  link.dataset.role = 'map-territory-link';
  link.href = selectedMap.territoryHref;
  link.textContent = 'Herrschaft';
  link.setAttribute('aria-label', `${selectedMap.title}: Herrschaftsseite öffnen`);
  root.getElementById('title-input')?.after(link);
  return () => link.remove();
}

if (typeof document !== 'undefined') {
  mountMapTerritoryNavigation(window.KARTO_SELECTED_MAP);
}
