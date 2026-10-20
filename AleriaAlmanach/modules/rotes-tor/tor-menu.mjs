import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { fixedTradePrice, standardItemToTradeItem } from '../trade-catalog/standard-goods-conversion.mjs';
import { PENRUDD_EMBLEM } from './penrudd-household.mjs';
import { TOR_DISHES } from './tor-dishes.mjs';
import { buildTorBeers } from './tor-beer.mjs';

export const TOR_ART = './assets/rotes-tor';
export { TOR_DISHES };

export const TOR_STANDARD_DRINK_IDS = Object.freeze([
  'standard:taverne:duennes-bier', 'standard:taverne:starkbier',
  'standard:taverne:klosterbier', 'standard:taverne:apfelwein',
  'standard:taverne:wasser', 'standard:taverne:kraeuteraufguss', 'standard:taverne:branntwein'
]);

export const TOR_TABLE_WINE = Object.freeze({
  id: 'tischwein-rot', name: 'Einfacher roter Tischwein', price: '80 Pfennig', unit: 'Ein Becher · 0,20 l',
  image: './assets/lachende-nixe/drinks/tischwein-rot.png',
  description: 'Ein schlichter zugekaufter roter Fasswein ohne ausgezeichnetes Gut oder beworbenen Jahrgang. Die Herkunft wechselt mit der Lieferung; ausgeschenkt wird ein gewöhnlicher Becher.',
  priceReference: 'Gleiche Portion und Preislage wie der bereits geführte einfache rote Tischwein der Lachenden Nixe; keine edle Weisenfluher Gutsabfüllung.'
});

const defaults = Object.freeze({ status: 'available', imageFit: 'contain', imagePosition: 'center', imageHeight: 300,
  descriptionTitle: 'Auf dem Tisch', featuresTitle: 'Portion', originTitle: 'Aus Küche und Hof',
  usageTitle: 'Bestellung', priceTitle: 'Preis', priceFill: 35, priceOptions: [],
  conditionsTitle: 'Verfügbarkeit', attributes: [] });

export function buildTorMenu(drinkCatalogs) {
  return {
    headerIcon: `../Stammbäume/${PENRUDD_EMBLEM}`, title: 'Güterregister', subtitle: 'Speis und Trank · Zum Roten Tor',
    categories: [
      { id: 'fruehstueck', label: 'Frühstück' }, { id: 'brotzeit', label: 'Brotzeit' }, { id: 'topf', label: 'Aus dem Topf' },
      { id: 'hofgerichte', label: 'Hauptgerichte' }, { id: 'bratentag', label: 'Am Bratentag' },
      { id: 'suesses', label: 'Etwas Süßes' }, { id: 'reise', label: 'Für den Weg' },
      { id: 'getraenke', label: 'Am Tresen' }, { id: 'importbiere', label: 'Teyrngarch & Penderyn' }
    ],
    allLabel: 'Die ganze Hauskarte', searchPlaceholder: 'Gericht, Getränk oder Zutat suchen …',
    noteIcon: '♧', noteTitle: 'Eine warme Schüssel vor dem Tor',
    noteText: 'Vom frühen Frühstück bis zur kräftigen Pfanne: Olwen kocht für Fuhrleute und Reisende. Ein Teil der Lebensmittel kommt vom Hof der Verwandten; Brot, Getränke und weitere Zutaten werden zugekauft. Sonnenglanz, Hopfgold, Dämmerkrone und Goldschuppen ergänzen den gewöhnlichen Ausschank. Ist der Tagesvorrat erschöpft, nennt das Haus eine verfügbare Alternative.',
    items: [
      ...TOR_DISHES.map(item => ({ ...defaults, ...fixedTradePrice(item.price), id: item.id,
        title: item.name, category: item.category, subtitle: item.category === 'reise' ? 'Wegzehrung' : 'Olwens Hausküche',
        unit: item.portion, badge: item.category === 'bratentag' ? 'Bratentag' : item.category === 'reise' ? 'Zum Mitnehmen' : item.category === 'fruehstueck' ? 'Frühstück' : 'Hausgericht',
        image: `${TOR_ART}/food/${item.id}.png`, imageFormat: 'square',
        description: `<p>${item.description}</p>`, features: [item.portion], origin: item.supply,
        usageTags: [item.category === 'reise' ? 'Zum Mitnehmen' : 'In der Schankstube'],
        priceNote: 'Die beschriebenen Beilagen sind enthalten.', conditions: item.availability
      })),
      ...TOR_STANDARD_DRINK_IDS.map(id => {
        const item = STANDARD_ITEMS.find(entry => entry.id === id);
        if (!item) throw new Error(`Standardausschank fehlt: ${id}`);
        return { ...standardItemToTradeItem(item, { defaults, idPrefix: 'tor-standard' }),
          category: 'getraenke', badge: 'Standardausschank', imageFormat: 'square',
          origin: 'Zugekaufter gewöhnlicher Ausschank; keine eigene Brauerei oder Brennerei.',
          usageTags: [item.hiddenMeta.unit], priceNote: 'Portion und Preis aus dem gemeinsamen Standardsortiment.',
          conditions: 'Nach Fass- und Flaschenvorrat.' };
      }),
      ...buildTorBeers(drinkCatalogs),
      { ...defaults, ...fixedTradePrice(TOR_TABLE_WINE.price), id: TOR_TABLE_WINE.id,
        title: TOR_TABLE_WINE.name, category: 'getraenke', subtitle: 'Zugekaufter Tischwein',
        unit: TOR_TABLE_WINE.unit, image: TOR_TABLE_WINE.image, imageFormat: 'square', badge: 'Hauskaraffe',
        description: `<p>${TOR_TABLE_WINE.description}</p>`, features: [TOR_TABLE_WINE.unit],
        origin: 'Gewöhnlicher zugekaufter Fasswein; keine eigene Weinbereitung.', usageTags: [TOR_TABLE_WINE.unit],
        priceNote: 'Der Preis gilt für einen Becher.', conditions: 'Nach Fassvorrat.' }
    ],
    footerCards: [
      { icon: '♧', title: 'Vom Penrudd-Hof', text: 'Milchprodukte, Eier, Geflügel, Gemüse und gelegentlich Rind ergänzen den Einkauf. Hof und Herberge rechnen ihre Lieferungen ab.' },
      { icon: '◈', title: 'Der Bratentag', text: 'Ein angekündigter Termin je Neuntagewoche. Lieferlage und Schlachttermin bestimmen, ob und wie viele Bratenportionen verfügbar sind.' },
      { icon: '☷', title: 'Unterwegs', text: 'Wegzehrung wird frisch zusammengestellt. Zimmer, Stallversorgung und Wagenplätze werden gesondert berechnet.' }
    ]
  };
}
