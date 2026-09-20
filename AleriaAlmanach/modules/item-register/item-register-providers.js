// Provider artwork is presentation metadata. It must not change offer IDs,
// prices or the revisions used to validate a purchase.
export function moduleProviders(entries = []) {
  return entries.filter(entry => entry?.id).map(entry => ({
    id: `module:${entry.id}`,
    // Page images depict scenes or buildings; only explicit emblems belong here.
    images: [...new Set([
      ...(entry.pages || []).flatMap(page => [page.goodsTable?.headerIcon, page.tradeCatalog?.headerIcon]),
      entry.symbol,
      ...(entry.pages || []).flatMap(page => [page.hierarchy?.emblem, page.house?.crestImage, page.guild?.crestImage])
    ].filter(image => typeof image === 'string' && image.trim()).map(image => image.trim()))]
  }));
}

export function registerLists(items, providers = []) {
  const artwork = new Map(providers.map(provider => [provider.id, provider.images]));
  const lists = new Map();
  for (const item of items) {
    if (item.archived) continue;
    const list = lists.get(item.listId) || { id: item.listId, title: item.listName, count: 0, images: artwork.get(item.listId) || [] };
    list.count += 1;
    lists.set(list.id, list);
  }
  return [...lists.values()].sort((a, b) => a.title.localeCompare(b.title, 'de'));
}
