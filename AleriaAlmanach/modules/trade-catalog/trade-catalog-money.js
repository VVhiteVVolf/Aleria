import { parsePrice, toMinor } from '../item-register/item-register-money.js?v=20260919-shop-v1';

const coins = {
  copper: { label: 'Kupfertaler', image: './public/assets/inventory/coins/kupfertaler.png' },
  pfennig: { label: 'Eisenpfennig', image: './public/assets/inventory/coins/eisenpfennig.png' }
};

function renderAmount(copper) {
  const minor = toMinor(copper);
  const parts = [['copper', Math.floor(minor / 100)], ['pfennig', minor % 100]]
    .filter(([, amount]) => amount > 0);
  if (!parts.length) parts.push(['copper', 0]);
  return `<span class="trade-money">${parts.map(([id, amount]) => {
    const coin = coins[id], value = amount.toLocaleString('de-DE');
    return `<span class="trade-money-part">${value}<img src="${coin.image}" alt="${coin.label}" title="${coin.label}" width="22" height="22"></span>`;
  }).join('')}</span>`;
}

// The existing register parser owns denomination conversion and rounding.
// Keep large values in copper; only the fraction becomes Eisenpfennige.
export function renderTradeMoney(value, currency = 'KT') {
  let price;
  try { price = parsePrice(value, currency.replace(/kupferstueck/i, 'Kupferstück')); }
  catch { return null; }
  if (!price) return null;
  const first = renderAmount(price.minCopper);
  return price.minCopper === price.maxCopper ? first
    : `${first}<span class="trade-money-separator">–</span>${renderAmount(price.maxCopper)}`;
}
