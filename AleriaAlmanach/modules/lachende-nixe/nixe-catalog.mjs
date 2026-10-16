import { NIXE_ART } from './nixe-family-people.mjs';
import { NIXE_DISHES, NIXE_WINES, NIXE_GUILD_IMPORTS } from './nixe-menu.mjs';
import { fixedTradePrice, convertStandardGoods } from '../trade-catalog/standard-goods-conversion.mjs';

const paragraphs = texts => texts.map(text => `<p>${text}</p>`).join('');
const copper = value => fixedTradePrice(`${value.toLocaleString('de-DE')} Kupfertaler`);
const defaults = { status: 'available', imageFit: 'contain', imagePosition: 'center', imageHeight: 320,
  descriptionTitle: 'Zubereitung & Geschmack', featuresTitle: 'Auf dem Teller', features: [],
  originTitle: 'Herkunft', usageTitle: 'Am Tisch', priceTitle: 'Preis & Portion', priceFill: 35,
  priceOptions: [], conditionsTitle: 'Verfügbarkeit', attributes: [] };

export function buildNixeCatalog(page, catalogs) {
  const standards = convertStandardGoods(page, { defaults, origin: 'Die Lachende Nixe · Gwynthor',
    descriptionForRow: row => paragraphs([...(row.details || row.values.description).split(/\n\s*\n/),
      row.category === 'speisen'
        ? 'Auf Wunsch bereitet die Küche auch diese einfache Hausportion zu. Sie gehört zur gewöhnlichen Versorgung der Herberge; die kleine Weisenfluher Abendkarte wird gesondert geführt. Bestellte Beilagen und weitere Portionen kommen einzeln auf die Rechnung.'
        : 'Dieser Trunk gehört zum gewöhnlichen Ausschank des Hauses. Die angegebene Portion wird einzeln gereicht; besondere Herkunft, Jahrgänge und Zunftabfüllungen nennt die Weinkarte.']),
    conditionsForRow: row => /Gebackenes Huhn/.test(row.values.name)
      ? 'Saisonal und nach Lieferung; bitte beim Empfang erfragen.' : 'Nach Tagesvorrat.' });
  const dishes = NIXE_DISHES.map(dish => ({ ...defaults, ...copper(dish.copper), id: dish.id,
    category: 'hauskarte', title: dish.name, subtitle: dish.course, unit: 'Kleine Portion',
    image: `${NIXE_ART}/food/${dish.id}.png`, imageFormat: 'square', badge: dish.course,
    tags: ['Weisenfluher Küche', dish.course], description: paragraphs([dish.description, dish.detail]),
    features: dish.features, origin: 'Hausküche der Lachenden Nixe · Weisenfluher Art',
    usageTags: ['Kleine Portion', dish.course === 'Monatsgericht' ? 'Ein Abend im Monat' : 'Leichte Abendkarte'],
    priceNote: 'Die beschriebenen Zutaten und Beilagen gehören zur kleinen Hausportion.',
    conditions: dish.course === 'Monatsgericht'
      ? 'Nur an einem angekündigten Abend im Monat. Begrenzte Portionen; Vorbestellung bei Johanna.'
      : 'Frisch nach Bestellung; nach verlässlicher Tageslieferung.' }));
  const imports = NIXE_GUILD_IMPORTS.map(([moduleId, itemId, serving]) => {
    const source = catalogs.find(catalog => catalog.id === moduleId);
    const item = source?.pages.flatMap(page => page.tradeCatalog?.items || []).find(item => item.id === itemId);
    const option = item?.priceOptions?.find(option => option.label === serving);
    if (!item?.image || !option?.price) throw new Error(`Importquelle fehlt: ${moduleId}/${itemId}/${serving}`);
    return { ...structuredClone(item), id: `${moduleId}-${itemId}`, category: 'importe',
      subtitle: /whisky/.test(itemId) ? 'Cenyrischer Import · Whisky' : 'Cenyrischer Import · Bier',
      priceMin: '', priceMax: '', priceOptions: [structuredClone(option)], priceTitle: 'Ausschank im Haus',
      priceNote: `Ausschankgröße und Preis aus dem Sortiment: ${source.title}.`,
      conditionsTitle: 'Verfügbarkeit', conditions: 'Nach Fass- und Flaschenvorrat. Das Haus nennt die derzeit geöffnete Abfüllung.' };
  });
  const wines = NIXE_WINES.map(wine => ({ ...defaults, ...copper(wine.glass), id: wine.id,
    category: 'weine', title: wine.name, subtitle: wine.kind, unit: `Glas · ${wine.unit}`,
    image: `${NIXE_ART}/drinks/${wine.id}.png`, imageFormat: 'square', badge: wine.bottle ? 'Weisenfluh' : 'Tischwein',
    tags: [wine.kind], descriptionTitle: 'Im Glas', description: paragraphs([wine.description]),
    featuresTitle: 'Ausschank', features: [wine.bottle ? 'Namentlich geführte Abfüllung' : 'Schlichter Wein aus der Hauskaraffe', `Ein Glas enthält ${wine.unit}`],
    origin: wine.bottle ? 'Weisenfluh · Weinkeller der Lachenden Nixe' : 'Wechselnder Fassbezug · Hauskaraffe',
    usageTags: [wine.kind], priceOptions: wine.bottle
      ? [{ label: 'Glas', unit: wine.unit, price: wine.glass.toLocaleString('de-DE') },
        { label: 'Flasche', unit: '0,75 l', price: wine.bottle.toLocaleString('de-DE') }] : [],
    priceNote: wine.bottle ? 'Glas und ungeöffnete Flasche können getrennt bestellt werden.' : 'Preis für ein Glas aus der geöffneten Hauskaraffe.',
    conditions: wine.bottle ? 'Nach Flaschenvorrat; gereifte Jahrgänge und Champagnia auf Anfrage.' : 'Im gewöhnlichen Ausschank nach Fassvorrat.' }));
  return { headerIcon: `${NIXE_ART}/references/schild.png`, title: 'Güterregister', subtitle: 'Kleine Küche & gute Gläser · Die Lachende Nixe',
    categories: [{ id: 'hauskarte', label: 'Weisenfluher Hauskarte' }, { id: 'weine', label: 'Weine' },
      { id: 'importe', label: 'Importierte Getränke' }, { id: 'speisen', label: 'Standard Speisen' }, { id: 'getranke', label: 'Standard Getränke' }],
    allLabel: 'Alle Angebote', searchPlaceholder: 'Gericht, Wein oder Zunft suchen …', filterLabel: 'Die Hauskarte',
    noteIcon: '♧', noteTitle: 'Ein leichter Teller zum langen Abend',
    noteText: 'Drei kleine Vorspeisen und drei leichte Hauptgerichte verbinden die Sorgfalt Weisenfluher Küche mit dem Abend im Salon. Ein angekündigtes Monatsgericht ergänzt die Karte. Gute Zutaten und ruhige Zubereitung bestimmen den Preis; die Portionen bleiben klein.',
    items: [...dishes, ...wines, ...imports, ...standards],
    footerCards: [{ icon: '◈', title: 'Der besondere Abend', text: 'Wachtelbrust an dunklem Traubenjus gibt es einmal im Monat. Johanna nimmt Wünsche entgegen, solange die begrenzte Lieferung reicht.' },
      { icon: '♧', title: 'Die guten Flaschen', text: 'Weinlaub und Weissmann kommen aus Weisenfluh. Die cenyrischen Zunftbiere und Whiskys ergänzen den Keller, drei einfache Tischweine den täglichen Ausschank.' },
      { icon: '☷', title: 'Bestellung & Rechnung', text: 'Der Empfang nimmt Bestellungen auf. Angegebene Portionen, Gläser und Flaschen gelten einzeln; Übernachtung und Gesellschaft werden gesondert vereinbart.' }] };
}
