// Provider artwork is presentation metadata. It must not change offer IDs,
// prices or the revisions used to validate a purchase.
import { providerDirectoryEntry, providerImage, PROVIDER_TRADES } from './item-register-provider-directory.js?v=20261007-provider-groups-v1';

export function moduleProviders(entries = []) {
  return entries.filter(entry => entry?.id).map(entry => ({
    ...providerDirectoryEntry(entry.id),
    id: `module:${entry.id}`,
    // Page images depict scenes or buildings; only explicit emblems belong here.
    images: [...new Set([
      ...(entry.pages || []).flatMap(page => [page.goodsTable?.headerIcon, page.tradeCatalog?.headerIcon]),
      entry.symbol,
      ...(entry.pages || []).flatMap(page => [page.hierarchy?.emblem, page.house?.crestImage, page.guild?.crestImage]),
      ...providerDirectoryEntry(entry.id).images
    ].filter(image => typeof image === 'string' && image.trim()).map(image => providerImage(image.trim())))]
  }));
}

export function registerLists(items, providers = []) {
  const metadata = new Map(providers.map(provider => [provider.id, provider]));
  const lists = new Map();
  for (const item of items) {
    if (item.archived) continue;
    const provider = metadata.get(item.listId) || (item.section === 'owned' ? {} : providerDirectoryEntry(item.listId));
    const list = lists.get(item.listId) || { ...provider, id: item.listId, title: item.listName, count: 0, images: provider.images || [] };
    list.count += 1;
    lists.set(list.id, list);
  }
  return [...lists.values()].sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

export function groupProviders(lists = []) {
  return PROVIDER_TRADES.map(trade => {
    const regions = new Map();
    for (const list of lists.filter(list => list.trade.id === trade.id)) {
      const region = regions.get(list.region.id) || { ...list.region, lists: [], count: 0 };
      region.lists.push(list);
      region.count += list.count;
      regions.set(region.id, region);
    }
    const ordered = [...regions.values()].sort((a, b) => Number(a.id === 'unassigned') - Number(b.id === 'unassigned') || a.realm.localeCompare(b.realm, 'de') || a.label.localeCompare(b.label, 'de'));
    for (const region of ordered) region.lists.sort((a, b) => a.title.localeCompare(b.title, 'de'));
    return { ...trade, regions: ordered, providerCount: ordered.reduce((sum, region) => sum + region.lists.length, 0), count: ordered.reduce((sum, region) => sum + region.count, 0) };
  }).filter(trade => trade.regions.length);
}
