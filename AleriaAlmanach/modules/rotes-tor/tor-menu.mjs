import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { fixedTradePrice, standardItemToTradeItem } from '../trade-catalog/standard-goods-conversion.mjs';
import { PENRUDD_EMBLEM } from './penrudd-household.mjs';

export const TOR_ART = './assets/rotes-tor';
const dish = (id, name, category, price, portion, description, supply, visual, availability = 'Täglich nach Vorrat') =>
  Object.freeze({ id, name, category, price, portion, description, supply, visual, availability });

export const TOR_DISHES = Object.freeze([
  dish('hofbrot', 'Hofbrot mit Butter und Käse', 'brotzeit', '70 Pfennig', 'Zwei dicke Brotscheiben mit Belag',
    'Zwei Scheiben kräftiges Bauernbrot mit Butter, einfachem Hofkäse und etwas eingelegter Rübe. Eine ordentliche kleine Mahlzeit für die Bank vor dem Haus.',
    'Butter und Käse vom Penrudd-Hof; Brot vom örtlichen Bäcker.',
    'Two thick slices of coarse brown bread on a simple worn wooden trencher, one with pale butter and the other with two slices of plain pale farmhouse cheese, three small pickled beet pieces at the side. Modest rustic medieval roadside inn food, no elaborate garnishes.'),
  dish('lauchgerstensuppe', 'Lauch- und Gerstensuppe', 'topf', '60 Pfennig', 'Eine Schale mit einer kleinen Scheibe Brot',
    'Eine warme Gemüsebrühe mit Gerste, Lauch und Wurzeln. Leicht genug als Auftakt und mit Brot eine günstige kleine Mahlzeit; ohne Fleisch gekocht.',
    'Lauch und Wurzeln saisonal vom Penrudd-Hof; Gerste und Brot werden zugekauft.',
    'One plain brown earthenware bowl of light golden vegetable broth with visible barley grains, leek rings and a few parsnip pieces, a small dark bread slice beside it. Thin soup, not a thick stew, no meat.'),
  dish('roter-tortopf', 'Roter Tortopf', 'topf', '1,4 Kupfertaler', 'Eine große Schüssel mit Brot',
    'Der Haustopf: rote Rüben, Gerste, Kohl und eine kleine Einlage langsam geschmorten Rindfleischs. Die Rüben geben Farbe, die Gerste macht satt. Dazu kommt eine dicke Scheibe Brot.',
    'Gemüse und gelegentlich Rind vom Penrudd-Hof; das Fleisch verarbeitet ein örtlicher Fleischer. Gerste und Brot werden zugekauft.',
    'A generous rustic dark ceramic bowl of thick reddish-brown beet and barley stew with cabbage ribbons and a SMALL amount of browned braised beef pieces, one thick dark bread slice beside it. Recognizable red beet chunks, clearly more grain and vegetables than meat.'),
  dish('huhn-wurzelsud', 'Olwens Huhn im Wurzelsud', 'hofgerichte', '2,4 Kupfertaler', 'Ein Hühnerschenkel mit Gemüse und Gerste',
    'Ein Hühnerschenkel, langsam mit Lauch und Wurzelgemüse gegart, mit einem Löffel Bratensud und Gerste. Eine sättigende Portion aus Olwens Küche.',
    'Geflügel und saisonales Gemüse vom Penrudd-Hof; nach tatsächlicher Lieferung und nicht unbegrenzt verfügbar.',
    'One whole cooked chicken LEG AND THIGH portion, not a whole bird, on a plain cream earthenware plate with pale barley, braised carrots and parsnips, green leek and a little light golden cooking juice. Homely practical medieval cooking.'),
  dish('kohlpfanne', 'Kohlpfanne mit Ei', 'hofgerichte', '1,1 Kupfertaler', 'Ein Teller mit Brot',
    'Gebratener Kohl mit Zwiebeln und einem Ei, dazu Bauernbrot. Mit Butter zubereitet, ohne Fleisch und Speck; ein einfaches warmes Hofgericht.',
    'Ei, Butter und Kohl nach Saison vom Penrudd-Hof; Zwiebeln und Brot auch aus örtlichem Zukauf.',
    'A simple rustic wooden plate of pan-fried pale cabbage and onions topped with ONE ordinary fried egg, two small bread wedges at the side. No bacon, no meat, no extravagant garnish.'),
  dish('rinderbraten', 'Braten vom Hofrind', 'bratentag', '4 Kupfertaler', 'Ein Teller mit Beilagen',
    'Zwei Scheiben langsam geschmorten Rinderbratens mit dunklem Bratensaft, Rübenstampf und Kohl. Ein ordentliches Festtagsessen nach Art des Hauses, am angekündigten Bratentag der Neuntagewoche.',
    'Rind nur nach Schlachttermin und Lieferung; Zerlegung beim örtlichen Fleischer. Kein täglicher Braten und kein Wildgericht.',
    'Two thick slices of well-cooked braised beef roast with dark gravy, pale golden mashed swede and a small serving of braised cabbage on a simple oval cream ceramic plate. Generous but ordinary inn serving, no luxury restaurant plating.',
    'Ein angekündigter Bratentag je Neuntagewoche, nur bei passender Lieferung; begrenzte Portionen'),
  dish('apfel-haferauflauf', 'Warmer Apfel-Haferauflauf', 'suesses', '65 Pfennig', 'Eine kleine Schale',
    'Warme Apfelstücke unter einer Haferkruste, mit einem Löffel Dickmilch. Äpfel werden saisonal zugekauft oder aus dem eigenen Vorrat verwendet; nur leicht gesüßt.',
    'Milchprodukte vom Penrudd-Hof; Äpfel, Hafer und etwas Honig aus örtlichem Zukauf.',
    'One small brown earthenware bowl of baked apple pieces beneath a coarse golden oat crust, a modest spoonful of thick white cultured milk on the side. Rustic medieval dessert, no icing sugar, no cinnamon sticks, no silver cutlery.'),
  dish('fuhrmannsbeutel', 'Fuhrmannsbeutel', 'reise', '1,2 Kupfertaler', 'Eine Wegzehrung für unterwegs',
    'Drei dicke Scheiben Brot, ein Stück fester Hofkäse, ein gekochtes Ei und ein Apfel. Im einfachen Tuch zum Mitnehmen; das Ei wird für die nächste Reiseetappe ausgegeben, nicht als tagelang haltbarer Vorrat.',
    'Käse und Ei vom Penrudd-Hof; Brot und Apfel werden zugekauft. Einfaches Packtuch im Preis enthalten.',
    'An isolated open plain beige linen travel cloth bundle containing three thick dark bread slices, a small wedge of firm pale farmhouse cheese, ONE unpeeled boiled egg and ONE small red apple. Compact medieval traveler meal, no modern packaging, no elaborate feast, no table or background.')
]);

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

export function buildTorMenu() {
  return {
    headerIcon: `../Stammbäume/${PENRUDD_EMBLEM}`, title: 'Güterregister', subtitle: 'Speis und Trank · Zum Roten Tor',
    categories: [
      { id: 'brotzeit', label: 'Brotzeit' }, { id: 'topf', label: 'Aus dem Topf' },
      { id: 'hofgerichte', label: 'Vom Hof' }, { id: 'bratentag', label: 'Am Bratentag' },
      { id: 'suesses', label: 'Etwas Süßes' }, { id: 'reise', label: 'Für den Weg' },
      { id: 'getraenke', label: 'Am Tresen' }
    ],
    allLabel: 'Die ganze Hauskarte', searchPlaceholder: 'Gericht, Getränk oder Zutat suchen …',
    noteIcon: '♧', noteTitle: 'Eine warme Schüssel vor dem Tor',
    noteText: 'Olwen kocht eine überschaubare Hauskarte für Fuhrleute und Reisende. Ein Teil der Lebensmittel kommt vom Hof der Verwandten; Brot, Getränke und weitere Zutaten werden zugekauft. Wenn der Tagesvorrat erschöpft ist, nennt das Haus eine verfügbare Alternative.',
    items: [
      ...TOR_DISHES.map(item => ({ ...defaults, ...fixedTradePrice(item.price), id: item.id,
        title: item.name, category: item.category, subtitle: item.category === 'reise' ? 'Wegzehrung' : 'Olwens Hausküche',
        unit: item.portion, badge: item.category === 'bratentag' ? 'Bratentag' : item.category === 'reise' ? 'Zum Mitnehmen' : 'Hausgericht',
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
