const cultureTab = 'Völker & Kulturen';
const excluded = new Set(['gwynthor-kampfarena', 'gwynthorer-theater', 'gwynthor-gwregysdu-lagerhaeuser']);
const placeholder = /^(?:neues handelsgut|freier sortimentsplatz|zuchtrasse ohne angabe)$/i;

export function hasPurchasableGoods(entry) {
  return (entry.pages || []).some(page => page.tradeCatalogPage && page.tradeCatalog?.items?.some(item =>
    !['planned', 'unavailable'].includes(item.status) && !placeholder.test(String(item.title || '').trim())
    && (String(item.priceMin || '').trim() || item.priceOptions?.some(option => String(option.price || '').trim())))
    || page.goodsTablePage && page.goodsTable?.tables?.some(table => table.rows?.some(row => {
      const value = row.values || row;
      return String(value.name || '').trim() && String(value.price || '').trim();
    })));
}

export function evaluateVenueScope(entry, section) {
  if (section?.tab !== cultureTab) return { eligible: false, reason: 'Außerhalb von Völker & Kulturen.' };
  if (!entry?.multipage || !Array.isArray(entry.pages)) return { eligible: false, reason: 'Kein begehbares Ortsmodul mit mehreren Seiten.' };
  if (excluded.has(entry.id))
    return { eligible: false, reason: 'Ausgenommener Szenenort oder organisatorische Struktur.' };
  const scenes = entry.pages.some(page => page.sessionPage);
  if (!scenes) return { eligible: false, reason: 'Keine begehbare interaktive Szene vorhanden.' };
  if (hasPurchasableGoods(entry)) return { eligible: true, reason: 'Begehbarer Verkaufsort mit Güterangebot.' };
  if (/badehaus/i.test(entry.title || '') && entry.pages.some(page => page.guildServices?.services?.some(service => /\d[\d.,]*\s+(?:Kupfertaler|Pfennig|Silbertaler|Goldtaler)/i.test(service.terms || ''))))
    return { eligible: true, reason: 'Begehbares Badehaus mit konkret bepreisten Leistungen.' };
  return { eligible: false, reason: 'Kein konkret erwerbbares Güter- oder Badeangebot.' };
}
