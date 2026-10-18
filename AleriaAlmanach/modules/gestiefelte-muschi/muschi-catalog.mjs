import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';
import { MUSCHI_ART, MUSCHI_SIGN } from './muschi-people.mjs';
import { MUSCHI_RARITIES, MUSCHI_SMOKING_GOODS, MUSCHI_PERFUMES } from './muschi-goods.mjs';
const copper = value => fixedTradePrice(`${value.toLocaleString('de-DE')} Kupfertaler`);
const defaults = { status: 'available', imageFit: 'contain', imagePosition: 'center', imageHeight: 300, imageFormat: 'square',
  descriptionTitle: 'Das Angebot', featuresTitle: 'Auf einen Blick', features: [], originTitle: 'Herkunft', usageTitle: 'Im Haus',
  priceTitle: 'Preis', priceFill: 35, priceOptions: [], conditionsTitle: 'Verfügbarkeit', attributes: [] };
const guildSelection = [ ['teyrngarch-brauerzunft', 'bier-hellwacht', 'Krug'], ['teyrngarch-brauerzunft', 'bier-hopfgold', 'Krug'],
  ['penderyn-brauer-destillierzunft', 'bier-goldschuppen', 'Krug'], ['penderyn-brauer-destillierzunft', 'whisky-rhagorol', 'Glas'], ['penderyn-brauer-destillierzunft', 'whisky-penderyn', 'Glas'] ];

export function buildMuschiCatalog(drinkCatalogs) {
  const ordinary = ['duennes-bier', 'klosterbier', 'wasser', 'branntwein'].map(slug => {
    const source = STANDARD_ITEMS.find(item => item.id === `standard:taverne:${slug}`);
    if (!source) throw new Error(`Standardgetränk fehlt: ${slug}`);
    return { ...defaults, ...copper(source.priceRange.minCopper), id: `muschi-${slug}`, canonicalKey: source.canonicalKey,
      category: 'ausschank', title: source.title, subtitle: 'Gewöhnlicher Ausschank', unit: source.hiddenMeta.unit,
      image: source.image, attributes: structuredClone(source.attributes), description: `<p>${source.description}</p>`, features: source.tags, origin: 'Gwynthor · gewöhnlicher Fass- und Flaschenbezug', usageTags: ['Standardsortiment'], priceNote: 'Hauspreis für die genannte Einheit.', conditions: 'Nach Tagesvorrat.' };
  });
  const guilds = guildSelection.map(([moduleId, itemId, serving]) => {
    const source = drinkCatalogs.find(entry => entry.id === moduleId);
    const item = source?.pages.flatMap(page => page.tradeCatalog?.items || []).find(item => item.id === itemId);
    const option = item?.priceOptions?.find(option => option.label === serving);
    if (!item?.image || !option?.price) throw new Error(`Zunftgetränk fehlt: ${moduleId}/${itemId}`);
    return { ...structuredClone(item), id: `muschi-${itemId}`, category: 'ausschank', priceMin: '', priceMax: '', priceOptions: [structuredClone(option)],
      subtitle: 'Cenyr · namentlich geführte Zunftabfüllung', priceTitle: 'Ausschank im Haus', priceNote: `Portion und Preis aus dem Sortiment: ${source.title}.`, conditions: 'Nach Fass- und Flaschenvorrat.' };
  });
  const wines = [
    { id: 'weinlaub-1734', name: 'Weinlaub · Jahrgang 1734', glass: 8, bottle: 40, description: 'Trockener Rotwein aus Weisenfluh mit roter Frucht, etwas Holz und weichen Gerbstoffen.' },
    { id: 'weissmann-weisswein', name: 'Weissmann · Weißwein', glass: 6, bottle: 30, description: 'Heller Weisenfluher Weißwein mit gelber Frucht und frischer Säure, kühl ins Glas gereicht.' },
    { id: 'rosenstolz', name: 'Rosenstolz · Rotwein', glass: 7, bottle: 35, description: 'Weisenfluher Rotwein mit dunkler Beere, einem floralen Duft und zurückhaltender Süße im Nachklang.' }
  ].map(w => ({ ...defaults, ...copper(w.glass), id: `muschi-${w.id}`, category: 'ausschank', title: w.name, subtitle: 'Weisenfluher Wein', unit: 'Glas · 0,15 l',
    image: w.id === 'rosenstolz' ? `${MUSCHI_ART}/goods/rosenstolz.png` : `./assets/lachende-nixe/drinks/${w.id}.png`, description: `<p>${w.description}</p>`, features: ['Glas oder ganze Flasche'], origin: 'Weisenfluh · über den Weinhandel nach Gwynthor', usageTags: ['Wein'],
    priceOptions: [{ label: 'Glas', unit: '0,15 l', price: String(w.glass) }, { label: 'Flasche', unit: '0,75 l', price: String(w.bottle) }], conditions: 'Nach Lieferung; laufender Bezug möglich.' }));
  const rarities = MUSCHI_RARITIES.map(r => ({ ...defaults, ...copper(r.base * r.multiple), id: r.id, category: 'brevanor', title: r.name, subtitle: r.kind, unit: 'Ganze Flasche · 0,75 l',
    image: `${MUSCHI_ART}/goods/${r.id}.png`, badge: `Nur ${r.stock} Flaschen`, description: `<p>${r.description}</p>`,
    features: [`Geretteter Restbestand: ${r.stock} Flaschen`, `Früherer Flaschenpreis: ${r.base} Kupfertaler`, `Heute: ${r.multiple}facher Preis · ${r.base * r.multiple} Kupfertaler`], origin: `Brevanor · geretteter Familienkeller ${r.id.startsWith('bielle') ? 'Bielle' : 'Desele'}`,
    usageTags: ['Seltene Flasche', 'Keine Nachlieferung'], priceNote: 'Preis für eine ganze Flasche. Kein regulärer glasweiser Ausschank.', conditions: 'Nur der aufgeführte Restbestand ist vorhanden. Freigabe durch Helviane, Ausgabe durch Gaston; wegen der Triarchie keine Nachbeschaffung.' }));
  const merchandise = (items, category, origin) => items.map(g => ({ ...defaults, ...copper(g.price), id: g.id, category, title: g.name, subtitle: category === 'tabak' ? 'Rauchwaren und Zubehör' : 'Duftkomposition des Hauses', unit: g.unit,
    image: `${MUSCHI_ART}/goods/${g.id}.png`, description: `<p>${g.description}</p>`, features: [g.unit], origin, usageTags: [category === 'tabak' ? 'Rauchen im Salon' : 'Parfüm'], priceNote: 'Preis für die genannte Verkaufseinheit.', conditions: 'Nach Handelslieferung beziehungsweise kleiner neuer Abfüllung.' }));
  return { headerIcon: MUSCHI_SIGN, title: 'Güterregister', subtitle: 'Ausschank · Brevanors letzte Flaschen · Tabak · Parfüme',
    categories: [{ id: 'ausschank', label: 'Ausschank & Importweine' }, { id: 'brevanor', label: 'Gerettete Brevanorer Raritäten' }, { id: 'tabak', label: 'Tirnaras Tabak & Pfeifen' }, { id: 'parfuem', label: 'Desele · Parfüme' }],
    allLabel: 'Alle Angebote', searchPlaceholder: 'Getränk, Jahrgang, Tabak oder Duft suchen …', filterLabel: 'Die Angebote des Hauses',
    noteIcon: '♧', noteTitle: 'Ein Glas, ein Spiel, ein langer Abend', noteText: 'Einfache Getränke und gute Importe werden laufend ausgeschenkt. Die fünf geretteten Abfüllungen sind endlich und kosten heute das Vier- bis Zehnfache ihres früheren Preises. Speisen werden nicht angeboten.',
    items: [...ordinary, ...guilds, ...wines, ...rarities, ...merchandise(MUSCHI_SMOKING_GOODS, 'tabak', 'Tabak: Tirnara · Import über die Klingende Münze. Pfeife: örtlicher Handwerksbezug.'), ...merchandise(MUSCHI_PERFUMES, 'parfuem', 'Desele-Rezepturen aus Brevanor · neue kleine Abfüllungen in Gwynthor')],
    footerCards: [{ icon: '◈', title: 'Gaston führt den Keller', text: 'Die fünf geretteten Abfüllungen zählen zusammen nur 22 Flaschen. Der heutige Preis und der ursprüngliche Vergleichspreis stehen beim jeweiligen Angebot.' }, { icon: '♧', title: 'Keine Küche', text: 'Wer essen möchte, besucht die Lachende Nixe. Getränke, Zimmer und Gesellschaft werden getrennt berechnet.' }] };
}
