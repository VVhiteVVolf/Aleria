import { toMinor } from '../item-register/item-register-money.js';
import { buildDrinkPricing } from '../trade-catalog/drink-catalog-model.mjs';

// User-requested increase, 7 October 2026. Always start from the original
// serving price in the source models; rebuilding must never compound it.
const increases = {
  beer: [[1, 20], [3, 30], [5, 50], [Infinity, 70]],
  whisky: [[8, 30], [16, 50], [Infinity, 70]]
};

export function buildBreweryDrinkPricing(kind, baseServingCopper) {
  const baseMinor = toMinor(baseServingCopper);
  const percent = increases[kind]?.find(([ceiling]) => baseServingCopper < ceiling)?.[1];
  if (percent == null) throw new Error(`Unknown brewery drink: ${kind}`);
  const servingCopper = Math.round(baseMinor * (100 + percent) / 100) / 100;
  return buildDrinkPricing(kind, servingCopper);
}
