import { buildModuleOffers } from '../../src/generated/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../../src/generated/item-register/item-register-standard.js';

export function catalogEntry(extra = {}) {
  return { id: 'catalog', title: 'Öffentlicher Warenladen', pages: [{ tradeCatalogPage: true, tradeCatalog: { items: [{
    id: 'chalk', title: 'Arkane Kreide', priceMin: '1.01', priceMax: '1.01', currencyCode: 'KT', unit: 'Stück', ...extra,
  }] } }] };
}

export function catalogRequest(entry = catalogEntry(), extra = {}) {
  const product = buildModuleOffers([entry], STANDARD_ITEMS)[0];
  return { action: 'catalog-checkout', operationId: 'catalog-order', entryId: entry.id, merchantId: `module:${entry.id}`, actorCharacterId: 'gawain',
    expectedRevisions: { 'character:gawain': 1, 'character:ylva': 1 },
    lines: [{ id: 'purchase', direction: 'buy', productId: product.id, moduleId: entry.id, sourceRevision: product.sourceRevision,
      quantity: 1, payerKey: 'character:gawain', recipientKey: 'character:ylva', priceMode: 'standard', expectedTotalMinor: Math.round(product.priceRange.minCopper * 100) }], ...extra };
}

export function catalogGroup() {
  return { id: 'crew', title: 'Reisegruppe', pages: [
    { hierarchyPage: true, hierarchy: { trees: [{ label: 'Aktive', levels: [{ nodes: [{ title: 'Ritter', subtitle: 'gawain' }] }] }] } },
    { landingPage: true, landing: { group: { members: [{ id: 'hierarchy:gawain', characterId: 'gawain' }], guests: [], sceneThreads: [] } } },
  ] };
}
