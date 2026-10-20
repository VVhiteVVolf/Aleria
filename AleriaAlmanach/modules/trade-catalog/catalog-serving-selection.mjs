/** Select one existing sale unit without copying a venue's prices or packaging. */
export function selectCatalogServing(catalogs, moduleId, itemId, label) {
  const source = catalogs.find(entry => entry.id === moduleId);
  const item = source?.pages.flatMap(page => page.tradeCatalog?.items || []).find(item => item.id === itemId);
  const option = item?.priceOptions?.find(option => option.label === label);
  if (!item?.image || item.status !== 'available' || !option?.price) throw Error(`Katalog-Ausschank fehlt: ${moduleId}/${itemId}/${label}`);
  return { source, item: structuredClone(item), option: structuredClone(option) };
}
