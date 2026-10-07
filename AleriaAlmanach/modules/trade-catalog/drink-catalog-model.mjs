import { toMinor } from '../item-register/item-register-money.js';

// Editorial price derivation shared by the three brewery catalogues. Values are
// calculated in integer Pfennige; the established register owns currency parsing.
export const DRINK_MEASURES = Object.freeze({
  beer: { servingMl: 500, bottleMl: 1000, caskMl: 50000, servingLabel: 'Krug', servingUnit: '0,5 l', bottleUnit: '1 l' },
  whisky: { servingMl: 40, bottleMl: 700, caskMl: 50000, servingLabel: 'Glas', servingUnit: '4 cl', bottleUnit: '0,7 l' }
});

export function buildDrinkPricing(kind, servingCopper) {
  const measure = DRINK_MEASURES[kind];
  if (!measure) throw new Error(`Unknown drink measure: ${kind}`);
  const servingMinor = toMinor(servingCopper);
  if (!servingMinor) throw new Error('An actual drink requires a positive serving price.');
  const amount = ml => (Math.round(servingMinor * ml / measure.servingMl) / 100).toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return {
    priceTitle: 'Ausschank & Gebinde', priceMin: '', priceMax: '', priceFill: 0,
    currencyCode: 'KT', currencyLabel: 'Kupfertaler', currencyIcon: '◈',
    priceOptions: [
      { label: measure.servingLabel, unit: measure.servingUnit, price: amount(measure.servingMl) },
      { label: 'Flasche', unit: measure.bottleUnit, price: amount(measure.bottleMl) },
      { label: 'Fass', unit: '50 l', price: amount(measure.caskMl) }
    ],
    priceNote: 'Gebindepreise nach Inhalt zum Ausschanktarif. Ohne Mengenrabatt, Pfand oder Fracht.'
  };
}

export function reservedDrinkSlots(category, count = 5) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${category}-reserve-${index + 1}`, category, status: 'planned',
    title: `Freier Sortimentsplatz ${index + 1}`, description: '', image: '', priceOptions: []
  }));
}
