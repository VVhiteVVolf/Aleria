import { selectCatalogServing } from '../trade-catalog/catalog-serving-selection.mjs';

export const TOR_BEER_SELECTION = Object.freeze([
  ['teyrngarch-brauerzunft', 'bier-sonnenglanz', 'Krug'],
  ['teyrngarch-brauerzunft', 'bier-hopfgold', 'Krug'],
  ['teyrngarch-brauerzunft', 'bier-daemmerkrone', 'Krug'],
  ['penderyn-brauer-destillierzunft', 'bier-goldschuppen', 'Krug']
].map(row => Object.freeze(row)));

export function buildTorBeers(catalogs) {
  return TOR_BEER_SELECTION.map(([moduleId, itemId, serving]) => {
    const { item, option } = selectCatalogServing(catalogs, moduleId, itemId, serving);
    return { ...item, id: `tor-import-${itemId}`, category: 'importbiere', unit: `${option.label} · ${option.unit}`,
      subtitle: moduleId.startsWith('teyrngarch') ? 'Teyrngarch · Cenyrischer Zunftbezug' : 'Penderyn · Helles Hausbier',
      badge: 'Zugekauftes Hausbier', priceMin: '', priceMax: '', priceOptions: [option], priceTitle: 'Ein Krug am Roten Tor',
      priceNote: 'Der Preis gilt für einen Krug mit 0,5 l.',
      conditions: 'Nach Fassvorrat. Der Gasthof braut nicht selbst; die Herkunft und der Biername bleiben erhalten.' };
  });
}
