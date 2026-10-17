import { DURST_ART } from './durst-people.mjs';
import { fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';

export const DURST_DISHES = Object.freeze([
  { id: 'matrosenhappen', name: 'Matrosenhappen', course: 'Vorspeise', price: '40 Pfennig',
    description: 'Eine dicke Scheibe dunkles Brot mit etwas eingelegtem Hering und rohen Zwiebelringen. Salzig, schlicht und schnell auf dem Tisch.',
    visual: 'Eine einzige dicke grobe dunkle Brotscheibe mit drei kleinen Stücken eingelegtem Hering und ein paar rohen Zwiebelringen auf einem abgenutzten Holzteller. Kleine billige Vorspeise, keine elegante Garnitur.' },
  { id: 'fischgerstentopf', name: 'Fisch-Gerstentopf', course: 'Hauptspeise', price: '90 Pfennig',
    description: 'Ein dicker Eintopf aus günstigen Abschnitten vom Tagesfisch, Gerste, Kohl und Wurzelgemüse. Mehr Gerste als Fisch, aber eine warme volle Schüssel.',
    visual: 'Eine volle grobe braune Tonschüssel mit dickem Eintopf: viel Gerste, heller Kohl, kleine Wurzelstücke und wenige deutlich erkennbare gekochte weiße Fischstücke. Sämig und sättigend, keine Luxusauslage.' },
  { id: 'hafensuppe', name: 'Klare Hafensuppe', course: 'Hauptspeise', price: '60 Pfennig',
    description: 'Ein einfacher Fischsud mit Lauch, Rübenstücken und wenigen ausgelösten Fischflocken. Eine kleine Scheibe Brot gehört dazu.',
    visual: 'Eine schlichte irdene Suppenschüssel mit dünner klarer bernsteinfarbener Fischbrühe, wenig Lauch, Rübenstückchen und einzelnen weißen Fischflocken. Eine kleine grobe Brotscheibe liegt daneben. Deutlich dünner als ein Eintopf.' },
  { id: 'ganzer-hering', name: 'Ganzer Hering mit Wurzeln', course: 'Hauptspeise', price: '1,2 Kupfertaler',
    description: 'Ein kleiner ganzer Hering aus dem Tagesfang, einfach gegart, mit etwas Kohl und gekochten Wurzeln. Kopf und Gräten bleiben dran; ein bescheidenes Hafenessen.',
    visual: 'Ein kleiner ganzer gegarter Hering mit Kopf und Schwanz, matter silbergrauer Haut, auf einem einfachen abgenutzten ovalen Holzteller, daneben nur wenig gekochter Kohl und zwei kleine Rübenstücke. Kein riesiger Edelfisch, kein Filet, kein reiches Mahl.' },
  { id: 'monatsfang', name: 'Der gute Fang des Monats', course: 'Monatsspezial', price: '2,5 Kupfertaler',
    description: 'Ein gutes Stück frischer Scholle, in der Pfanne gebraten, mit etwas Zwiebel und Wurzelgemüse. Höchstens einmal im Monat und nur, wenn Nia einen guten Fisch bezahlbar bekommt. Wenige Portionen; kein tägliches Angebot.',
    visual: 'Ein bescheidenes aber appetitliches goldbraun in der Pfanne gebratenes Schollenfilet, kleine angebratene Zwiebelstücke und wenig Wurzelgemüse auf einem schlichten braunen Keramikteller. Für diese Kneipe ein seltener besonderer Fisch, trotzdem keine feine Restaurantgarnitur.' }
]);

// A deliberately selected subset, not a copy of either full standard assortment.
export const DURST_DRINKS = Object.freeze([
  { id: 'duennbier', name: 'Dünnbier', price: '30 Pfennig', unit: 'Ein Krug', image: 'https://i.imgur.com/mGrMfTt.png', description: 'Einfaches dünnes Hausbier. Der billigste Krug am Tresen.' },
  { id: 'klosterbier', name: 'Klosterbier', price: '1 Kupfertaler', unit: 'Ein Krug', image: 'https://i.imgur.com/ZIRrEhf.png', description: 'Gewöhnliches regionales Klosterbier vom Fass. Ohne besondere Jahrgänge oder Auswahl.' },
  { id: 'wasser', name: 'Wasser', price: '3 Pfennig', unit: 'Ein Becher', image: 'https://i.imgur.com/AaDqMUO.png', description: 'Ein Becher schlichtes Trinkwasser.' },
  { id: 'branntwein', name: 'Einfacher Branntwein', price: '1 Kupfertaler', unit: 'Ein kleines Glas', image: 'https://i.imgur.com/e1Qv6Ct.png', description: 'Schlichter Branntwein aus dem gewöhnlichen Ausschank. Eine Sorte, solange die Flasche reicht.' }
]);
const defaults = { status: 'available', imageFit: 'contain', imagePosition: 'center', imageHeight: 300,
  descriptionTitle: 'Auf dem Tisch', featuresTitle: 'Portion', originTitle: 'Aus dem Haus', usageTitle: 'Bestellung',
  priceTitle: 'Preis', priceFill: 35, priceOptions: [], conditionsTitle: 'Verfügbarkeit', attributes: [] };

export function buildDurstMenu() {
  return { headerIcon: `${DURST_ART}/schild.png`, title: 'Güterregister', subtitle: 'Die kleine Karte · Zum Kleinen Durst',
    categories: [{ id: 'vorspeise', label: 'Ein Happen' }, { id: 'hauptspeisen', label: 'Aus Nias Topf' }, { id: 'monat', label: 'Seltener Monatsfang' }, { id: 'getraenke', label: 'Am Tresen' }],
    allLabel: 'Die ganze kleine Karte',
    noteIcon: '♧', noteTitle: 'Fünf Gerichte, wenig Auswahl',
    noteText: 'Vier einfache Fischgerichte bilden die gewöhnliche Karte. Der fünfte Platz ist dem seltenen guten Monatsfang vorbehalten. Nia kocht, was der Tagesfang und die wenigen Vorräte hergeben; wenn der Topf leer ist, ist er leer.',
    items: [
      ...DURST_DISHES.map(d => ({ ...defaults, ...fixedTradePrice(d.price), id: d.id, title: d.name,
        category: d.course === 'Vorspeise' ? 'vorspeise' : d.course === 'Monatsspezial' ? 'monat' : 'hauptspeisen',
        subtitle: d.course, unit: 'Eine Portion', image: `${DURST_ART}/food/${d.id}.png`, imageFormat: 'portrait',
        badge: d.course, description: `<p>${d.description}</p>`, features: ['Eine Portion', 'Schlichte Hausküche'],
        origin: 'Nias Küche · Fisch vom Gwynthorer Hafen', usageTags: ['Am Tisch oder Tresen'], priceNote: 'Die beschriebenen Beilagen sind enthalten.',
        conditions: d.course === 'Monatsspezial' ? 'Höchstens einmal im Monat, nur bei günstigem gutem Fang; wenige Portionen. Die Eintragung ist keine Zusage täglicher Verfügbarkeit.' : 'Nach Tagesfang und Topfvorrat.' })),
      ...DURST_DRINKS.map(d => ({ ...defaults, ...fixedTradePrice(d.price), id: d.id, title: d.name, category: 'getraenke',
        subtitle: 'Einfacher Ausschank', unit: d.unit, image: d.image, imageFormat: 'square', badge: 'Am Tresen',
        description: `<p>${d.description}</p>`, features: [d.unit], origin: 'Gewöhnlicher Ausschank · Gwynthor', usageTags: [d.unit], priceNote: '', conditions: 'Nach Fass- und Flaschenvorrat.' }))
    ], footerCards: [{ icon: '♧', title: 'Kein Zimmer frei', text: 'Hier werden grundsätzlich keine Zimmer vermietet. Die wenigen Räume gehören dem Betrieb und der Familie.' },
      { icon: '◈', title: 'Der Monatsfang', text: 'Ein guter Fisch kommt nur selten auf die Karte. Nia sagt an, wann er zu haben ist; danach bleibt der Platz bis zum nächsten Mal leer.' }]
  };
}
