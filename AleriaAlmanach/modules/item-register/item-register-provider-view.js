import { registerLists, groupProviders } from './item-register-providers.js?v=20261007-provider-groups-v1';
import { escape, listEmblem } from './item-register-markup.js?v=20261007-provider-groups-v1';

const emblem = entry => listEmblem({ images: [entry.image] });
const countLabel = count => `${count} ${count === 1 ? 'Angebot' : 'Angebote'}`;

function providerCard(list, selectedId = '') {
  return `<button type="button" data-ir-action="list" data-section="offer" data-id="${escape(list.id)}" aria-pressed="${selectedId === list.id}" class="${selectedId === list.id ? 'is-active' : ''}">${listEmblem(list)}<span class="ir-provider-label"><strong>${escape(list.title)}</strong>${list.location ? `<small class="ir-provider-location">${escape(list.location)}</small>` : ''}<small>${countLabel(list.count)}</small></span><span class="ir-provider-arrow" aria-hidden="true">→</span></button>`;
}

export function providerOverview(items, providers = []) {
  const groups = groupProviders(registerLists(items, providers));
  if (!groups.length) return '<div class="ir-empty-small">Noch kein Sortiment angelegt. Besondere Waren erscheinen hier getrennt von den Standardgütern.</div>';
  return `<div class="ir-provider-directory">${groups.map(group => `<section class="ir-provider-trade" aria-label="${escape(group.label)}" data-provider-trade="${group.id}">
    <header class="ir-provider-trade-heading">${emblem(group)}<div><p class="ir-kicker">Zünfte & Gewerbe</p><h3>${escape(group.label)}</h3></div><span class="ir-provider-totals">${group.providerCount} Anbieter · ${countLabel(group.count)}</span></header>
    <div class="ir-provider-regions">${group.regions.map(region => `<section class="ir-provider-region${region.lists.length > 1 ? ' ir-provider-region-wide' : ''}" aria-label="${escape(region.label)}" data-provider-region="${region.id}"><header class="ir-provider-region-heading">${emblem(region)}<div><h4>${escape(region.label)}</h4>${region.realm ? `<p>${escape(region.realm)}</p>` : ''}</div></header><div class="ir-list-cards">${region.lists.map(list => providerCard(list)).join('')}</div></section>`).join('')}</div>
  </section>`).join('')}</div>`;
}

export function providerNavigation(lists, state) {
  const groups = groupProviders(lists);
  if (!groups.length) return '';
  return `<nav class="ir-provider-groups" aria-label="Anbieter nach Zunft und Region">${groups.map(group => `<details class="ir-provider-nav-group" data-ir-provider-group="${group.id}" ${state.expandedProviderGroups?.has(group.id) ? 'open' : ''}><summary>${emblem(group)}<span>${escape(group.label)}<small>${group.providerCount} Anbieter</small></span></summary><div class="ir-provider-tabs">${group.regions.map(region => `<section class="ir-provider-nav-region"><h4>${escape(region.label)}</h4>${region.lists.map(list => providerCard(list, state.listId)).join('')}</section>`).join('')}</div></details>`).join('')}</nav>`;
}
