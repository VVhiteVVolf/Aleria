import { parsePrice } from '../item-register/item-register-money.js';

export function selectedOfferPrice(text, currency) {
  const range = parsePrice(text, currency);
  if (!range || range.minCopper <= 0) return null;
  return { range, unitCopper: Math.round(Math.sqrt(range.minCopper * range.maxCopper) * 100) / 100 };
}

export function classifyOffer(offer) {
  const text = `${offer.category} ${offer.title} ${offer.unit}`;
  if (/pferd|zuchtrasse|reittier|rossverkauf/i.test(text)) return 'animal';
  if (/getr[aä]nk|getranke|bier|whisk|wein|brannt|schnaps|spiritus|wasser|aufguss|honigmet|apfelwein/i.test(text)) return 'drink';
  if (/speis|hauskarte|men[uü]|snack|vorspeis|hauptspeis|schüssel|teller|portion|eintopf|suppe|brot|fisch/i.test(text)) return 'food';
  return 'goods';
}

function stockFor(item) {
  const text = [item.conditions, item.description, ...(item.features || []).map(row => typeof row === 'string' ? row : row.text)].join(' ');
  if (item.id === 'bun-na-h-aibhne') return 70; // Four surviving 0.7 l bottles, 4 cl per serving.
  const stock = text.match(/\b([45])\s+(?:verbliebene\s+)?Flaschen\b/i);
  if (!stock || !/brevanor|bielle|desele/i.test(`${item.id} ${text}`)) return null;
  return Number(stock[1]);
}

export function readVenueOffers(entry) {
  const offers = [];
  for (const [pi, page] of (entry.pages || []).entries()) {
    if (page.tradeCatalogPage) for (const [ii, item] of (page.tradeCatalog?.items || []).entries()) {
      if (['planned', 'unavailable'].includes(item.status) || /^(?:neues handelsgut|freier sortimentsplatz)/i.test(item.title || '')) continue;
      const option = item.priceOptions?.[0], selected = selectedOfferPrice(option?.price ?? (item.priceMax ? `${item.priceMin} - ${item.priceMax}` : item.priceMin), item.currencyCode || item.currencyLabel);
      if (!selected) continue;
      const offer = { id: `goods-${pi}-${ii}`, itemId: item.id, title: item.title, category: item.category, unit: option?.unit || item.unit || 'Eine Verkaufseinheit',
        ...selected, stockUnits: stockFor(item), source: `${entry.title} · Güterregister · ${item.id}` };
      offers.push({ ...offer, kind: classifyOffer(offer) });
    }
    if (page.goodsTablePage) for (const [ti, table] of (page.goodsTable?.tables || []).entries()) for (const [ri, row] of (table.rows || []).entries()) {
      const value = row.values || row, selected = selectedOfferPrice(value.price);
      if (!value.name || !selected) continue;
      const offer = { id: `goods-${pi}-${ti}-${ri}`, itemId: `${table.id}:${ri}`, title: value.name, category: row.category,
        unit: value.portion || value.unit || 'Eine Portion', ...selected, stockUnits: null, source: `${entry.title} · Warenregister · ${table.id} · ${value.name}` };
      offers.push({ ...offer, kind: classifyOffer(offer) });
    }
  }
  return offers;
}

export function readVenueServices(entry) {
  return entry.pages.flatMap(page => page.guildServicesPage ? page.guildServices?.services || [] : []).flatMap((service, index) => {
    const priceText = String(service.terms || '').match(/(?:ab\s+)?[\d.,]+\s+(?:Kupfertaler(?:n)?|Pfennig|Silbertaler(?:n)?|Goldtaler(?:n)?)/i)?.[0];
    const selected = priceText ? selectedOfferPrice(priceText.replace(/^ab\s+/i, '').replace(/talern/i, 'taler')) : null;
    return selected ? [{ id: `service-${index}`, title: service.title, unit: service.scope || 'Eine Leistung', ...selected,
      terms: service.terms, source: `${entry.title} · Dienstleistungsseite · ${service.title}` }] : [];
  });
}
