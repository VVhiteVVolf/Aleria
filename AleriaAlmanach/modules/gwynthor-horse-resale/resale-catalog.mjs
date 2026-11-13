import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { standardItemToTradeItem, fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';
import { HORSE_CATALOG_DEFAULTS, createHorseExemplar } from '../trade-catalog/horse-catalog-items.mjs';
export const RESALE_ART = './assets/gwynthor-horse-resale';
export const RESALE_HORSES = Object.freeze([
  { id: 'ruebenkopp', name: 'Rübenkopp', age: 11, sex: 'Wallach', price: 140, category: 'mischling',
    appearance: 'Dunkelbrauner, gedrungener Arbeitspferdetyp mit sehr breiter unregelmäßiger Blesse, schwarzer Mähne, kräftiger Brust und dunklen Beinen.',
    character: 'Geduldig beim Anspannen und kaum aus der Ruhe zu bringen. Steht nach getaner Arbeit gern mit leicht hängender Unterlippe da; bleibt vor einem gefüllten Futtereimer ausgesprochen hartnäckig.',
    history: 'Von einer Bauernfamilie angekauft, die nach der Abgabe eines entfernten Ackers ein Zugtier weniger brauchte. Kennt Wagen und einfache Feldarbeit. Elternrassen und frühere Paarungen sind nicht belegt; sein kräftiger Körper ersetzt keinen Abstammungsnachweis.' },
  { id: 'torfstiefel', name: 'Torfstiefel', age: 13, sex: 'Stute', price: 120, category: 'mischling',
    appearance: 'Breite blaugraue Schimmelstute mit dunkler Mähne, üppigem Kötenbehang und heller linker Hinterfessel. Ruhiger, schwerer Gebrauchspferdetyp.',
    character: 'Geht langsam und überlegt. Bleibt vor unbekannten Pfützen stehen, lässt sich nach kurzer Prüfung aber weiterführen. Hat sich bei gleichmäßiger leichter Wagenarbeit bewährt; für schnelle Reisen wenig geeignet.',
    history: 'Einem älteren Torffuhrmann abgekauft, der seine langen Fahrten aufgegeben hat. Das Alter und ihr gemächliches Arbeitstempo drücken den Preis; eine besondere Zuchtlinie ist nicht nachgewiesen. Die Familie bietet sie für überschaubare Aufgaben und passende Haltung an.' },
  { id: 'blechpflaume', name: 'Blechpflaume', age: 8, sex: 'Wallach', price: 210, category: 'mischling',
    appearance: 'Kräftiger Braun-Weiß-Schecke mit kleinem schiefem Stern, dunkler Mähne mit weißer Strähne, breiten Schultern und befiederten Fesseln.',
    character: 'Aufmerksam und beim ersten Kontakt vorsichtig. Klappernde lose Metallteile an einem Wagen machen ihn unruhig; bei fest verschnürter Ladung und ruhiger Führung arbeitet er verlässlich.',
    history: 'Von einem Söldner angekauft, der nach dem Ende eines Dienstes seinen Gepäckwagen auflöste. Blechpflaume trug Vorräte und zog Lasten; er wird ausdrücklich nicht als ausgebildetes Streitross angeboten. Seine Eltern sind unbekannt, und vom Vorbesitzer wurde kein Zuchtbuch übergeben.' },
  { id: 'karrenschnute', name: 'Karrenschnute', age: 10, sex: 'Stute', price: 180, category: 'mischling',
    appearance: 'Stämmige Fuchsstute mit grober heller Mähne, kleiner weißer Schnippe, auffallend breitem langem Maul und kurzen kräftigen Beinen.',
    character: 'Neugierig und menschenbezogen; untersucht unbeaufsichtigte Schürzentaschen gern mit der Nase. Kennt belebte Gassen, wartet bei klarem Haltzeichen und drängelt bei der Fütterung.',
    history: 'Von einer reisenden Händlerfamilie gekauft, die nach der Aufgabe ihrer Wagenroute ein Pferd abgab. Gewöhnt an Stadtverkehr und leichte bis mittlere Wagenlast. Mehrere Hände haben ihre Geschichte weitergegeben, doch die genaue Abstammung bleibt unbewiesen.' }
]);
export function buildResaleCatalog() {
  const standard = STANDARD_ITEMS.find(i => i.id === 'standard:viehmarkt:arbeitsgaul');
  if (!standard || standard.priceRange.minCopper !== 100) throw Error('Arbeitsgaul-Preisgrundlage prüfen.');
  const bulk = { ...standardItemToTradeItem(standard, { defaults: HORSE_CATALOG_DEFAULTS, idPrefix: 'ruddgraen' }),
    ...fixedTradePrice('180 Kupfertaler'), title: 'Mischling · einfacher Arbeitsgaul', category: 'angebot', definitionCategory: 'pferde',
    definitionRef: structuredClone(standard.definitionRef), definitionKind: 'shared', unit: '1 Pferd',
    subtitle: 'Wechselnder Ankauf · kräftiger Gebrauchsmischling', badge: 'Nachlieferbares Angebot',
    description: '<p>Solide, kaltblüterartige Gebrauchsmischlinge aus wechselnden Ankäufen. Kräftige Körper, genügsame Haltung und Eignung für einfache Wagen- oder Hofarbeit stehen im Vordergrund. Die genaue Abstammung ist nicht belegt.</p>',
    features: [{ icon: '*', text: 'Mischling ohne gesichertes Zuchtbuch' }, { icon: '*', text: 'Auswahl aus angekauften Gebrauchspferden' }],
    origin: 'Von Bauern, Fuhrleuten, Söldnern und Reisenden angekauft. Keine eigene Zucht.',
    priceNote: 'Örtlicher Richtpreis innerhalb des Handelsregisterrahmens „Schlichter Arbeitsgaul“ von 100–600 KT.',
    conditions: 'Ein passendes einzelnes Pferd wird vor der Übergabe ausgewählt und besichtigt. Bekannte Eigenheiten und offene Herkunftsfragen werden genannt.' };
  return { title: 'Zum Schiefen Nagel · Mischlinge', subtitle: 'Günstiger Pferdeankauf und Weiterverkauf', headerIcon: `${RESALE_ART}/signs/schiefer-nagel-schild-v1.png`,
    categories: [{ id: 'angebot', label: 'Mischlinge · laufendes Angebot' }, { id: 'mischling', label: 'Mischlings-Exemplare' }],
    allLabel: 'Alle Mischlinge', searchPlaceholder: 'Name, Wesen oder Erfahrung suchen …', noteTitle: 'Gebrauch statt Zuchtbuch',
    noteText: 'Hier werden ausschließlich angekaufte Mischlinge verkauft. Das laufende Angebot ist nachlieferbar; jedes benannte Pferd existiert nur einmal. Statur und Fellfarbe erlauben keine verlässliche Angabe der Elternrassen.',
    items: [bulk, ...RESALE_HORSES.map(h => createHorseExemplar(h, { artRoot: RESALE_ART, namespace: 'gwynthor-horse-resale',
      price: { amount: h.price, source: 'Handelsregister · Arbeitsgaul 100–600 KT; ältere oder einfach ausgebildete angekaufte Mischlinge' } }))], footerCards: [] };
}
