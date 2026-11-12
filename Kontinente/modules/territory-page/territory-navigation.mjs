import { territoryNavigationMarkup } from './territory-navigation-template.mjs?v=20261112a';

// Only immediate children are linked here; their registers belong to their own page.
export function renderTerritoryNavigation(links) {
  const template = document.createElement('template');
  template.innerHTML = territoryNavigationMarkup(links);
  return template.content.firstElementChild;
}
