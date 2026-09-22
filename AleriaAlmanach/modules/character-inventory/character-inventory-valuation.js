import { moneyState, moneyTotal, parsePrice } from '../item-register/item-register-money.js';

function validPrice(value) {
  return value && Number.isFinite(value.minCopper) && Number.isFinite(value.maxCopper)
    && value.minCopper >= 0 && value.maxCopper >= value.minCopper;
}

// Estimated market value and an actual purchase receipt are different facts.
// Never manufacture a paid price: selling continues to use the real receipt.
export function inventoryValuation(item = {}, template = null) {
  if (validPrice(item.valuation)) return { ...item.valuation };
  const ownValue = item.value && moneyTotal(item.value);
  if (ownValue > 0) return { minCopper: ownValue, maxCopper: ownValue };
  const row = (item.infoRows || []).find(row => /^(?:handels(?:preis|wert)|wert|preis)$/i.test(row.label));
  const legacyPrice = row && parsePrice(row.value);
  if (legacyPrice) return legacyPrice;
  return validPrice(template?.priceRange) ? { ...template.priceRange } : null;
}

export function formatInventoryPrice(price) {
  if (!validPrice(price)) return 'Preis offen';
  const coins = copper => {
    const money = moneyState(copper);
    return [['gold','GT'],['silver','ST'],['copper','KT'],['pfennig','Pf']]
      .filter(([key]) => money[key] > 0).map(([key, label]) => `${money[key]} ${label}`).join(' ') || '0 KT';
  };
  return price.minCopper === price.maxCopper ? coins(price.minCopper) : `${coins(price.minCopper)} – ${coins(price.maxCopper)}`;
}
