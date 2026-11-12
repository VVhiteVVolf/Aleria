// Lightweight DOM identity bridge shared by lazy entry and active dialog.
export function catalogPurchaseSourceFromElement(element) {
  const scope = element?.closest?.('[data-catalog-purchase-module]');
  const row = element?.closest?.('[data-catalog-source-kind]');
  if (!scope || !row) return null;
  const source = { kind: row.dataset.catalogSourceKind, moduleId: scope.dataset.catalogPurchaseModule,
    pageIndex: Number(scope.dataset.catalogPageIndex) };
  for (const [field, data] of [['itemId', 'catalogItemId'], ['itemIndex', 'catalogItemIndex'], ['tableId', 'catalogTableId'],
    ['rowId', 'catalogRowId'], ['rowIndex', 'catalogRowIndex']]) if (row.dataset[data] != null && row.dataset[data] !== '') source[field] = row.dataset[data];
  return source;
}
