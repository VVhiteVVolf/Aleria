import { parsePrice } from '../item-register/item-register-money.js';
import { STANDARD_PRICE_REFERENCE } from './price-reference.generated.mjs';
import { MARKET_PRICE_REVIEW, VENUE_PRICE_REVIEW, PRICE_REVIEW_VERSION } from './price-review-rules.mjs';

export const normalizePriceName = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f\u200b]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const names = new Map(STANDARD_PRICE_REFERENCE.map(item => [normalizePriceName(item.title), item]));
const ids = new Map(STANDARD_PRICE_REFERENCE.map(item => [item.id, item]));
const same = (range, pair) => range && Math.abs(range.minCopper - pair[0]) < .00001 && Math.abs(range.maxCopper - pair[1]) < .00001;
const format = value => value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
const fixed = pair => ({ priceMin: format(pair[0]), priceMax: pair[0] === pair[1] ? '' : format(pair[1]), currencyCode: 'KT', currencyLabel: 'Kupfertaler' });

export function findStandardPrice(item) {
  return ids.get(item.canonicalKey || item.id) || names.get(normalizePriceName(item.title || item.name));
}

function oldStandardPrices(standard) {
  const original = MARKET_PRICE_REVIEW[standard.market]?.find(rule => standard.id.endsWith(`:${rule.id}`));
  const pairs = [standard.range, ...(original ? [original.before] : [])];
  if (standard.id === 'standard:taverne:eintopf-des-tages') pairs.push([.5, .5]);
  if (standard.id === 'standard:taverne:bauernbrot') pairs.push([.15, .15]);
  if (['standard:taverne:kraeuterschnaps', 'standard:taverne:kloster-spiritus'].includes(standard.id)) pairs.push([1, 1]);
  return pairs;
}

export function reviewTradePrice(item, moduleId = '') {
  if (['planned', 'unavailable'].includes(item.status) || item.priceOptions?.length) return item;
  const actual = parsePrice(item.priceMax ? `${item.priceMin} - ${item.priceMax}` : item.priceMin, item.currencyCode || item.currencyLabel);
  if (!actual) return item;
  const ownRule = VENUE_PRICE_REVIEW[moduleId]?.find(rule => rule.id === item.id);
  if (ownRule && same(actual, ownRule.before)) return { ...item, ...fixed(ownRule.after) };
  const standard = findStandardPrice(item);
  const markedStandard = /^(?:standard[-:]|heller-|krone-standard-)/.test(item.id || '') || !!item.canonicalKey;
  if (!standard || !markedStandard || !oldStandardPrices(standard).some(pair => same(actual, pair))) return item;
  // The historical cup of water is not silently changed to the full jug tariff.
  if (standard.id === 'standard:taverne:wasser' && /becher/i.test(item.unit || '')) return item;
  if (same(actual, standard.range) && item.currencyCode === 'KT') return item;
  return { ...item, ...fixed(standard.range) };
}

export function reviewGoodsPrice(value, moduleId = '') {
  const legacy = moduleId === 'zum-roten-drachen-taverne' ? { 'Penderyn Whiskey': [8, 12], 'Rhagorol Whiskey': [5, 6.5] }[value.name] : null;
  if (legacy && same(parsePrice(value.price), [legacy[0], legacy[0]])) return { ...value, price: `${format(legacy[1])} Kupfertaler`, portion: 'Pro Glas · 4 cl' };
  const standard = findStandardPrice({ title: value.name });
  const actual = parsePrice(value.price);
  if (!standard || !actual || !oldStandardPrices(standard).some(pair => same(actual, pair))) return value;
  if (standard.id === 'standard:taverne:wasser' && /becher/i.test(value.portion || '')) return value;
  const pair = standard.range;
  if (same(actual, pair)) return value;
  return { ...value, price: `${format(pair[0])}${pair[0] !== pair[1] ? `–${format(pair[1])}` : ''} Kupfertaler` };
}

export function applyVenuePriceReview(entry) {
  if (!entry?.pages?.some(page => page.tradeCatalogPage || page.goodsTablePage) || entry.economyPriceReview === PRICE_REVIEW_VERSION) return entry;
  const pages = entry.pages.map(page => {
    if (page.tradeCatalogPage) return { ...page, tradeCatalog: { ...page.tradeCatalog,
      items: (page.tradeCatalog?.items || []).map(item => reviewTradePrice(item, entry.id)) } };
    if (page.goodsTablePage) return { ...page, goodsTable: { ...page.goodsTable, tables: (page.goodsTable?.tables || []).map(table => ({ ...table,
      rows: (table.rows || []).map(row => row.values ? { ...row, values: reviewGoodsPrice(row.values, entry.id) } : reviewGoodsPrice(row, entry.id)) })) } };
    return page;
  });
  return { ...entry, economyPriceReview: PRICE_REVIEW_VERSION, pages };
}
