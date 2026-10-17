import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { STORE_ART, PENDRWN_EMBLEM } from './store-people.mjs';

export const STORE_STANDARD = Object.freeze(STANDARD_ITEMS.filter(item => item.canonicalKey.startsWith('standard:gemischtwarenhandler:')));
export const storeItemId = item => item.canonicalKey.split(':').at(-1);
export const STORE_SPECIAL = Object.freeze([
  { id: 'balkenwaage', title: 'Kleine Balkenwaage mit Gewichten', price: 48, category: 'werkzeug', unit: 'Ein Set',
    description: 'Eine kleine zusammenlegbare Messingwaage mit zwei Schalen und sechs abgestuften Gewichten. Zum Abwiegen kleiner Vorräte und Handelsmengen; keine amtliche Eichung.',
    visual: 'Eine kleine einfache mittelalterliche Balkenwaage aus mattem Messing mit zwei hängenden Schalen und sechs abgestuften runden Messinggewichten ordentlich daneben. Vollständig sichtbar, ohne Tisch oder Ständer außerhalb des zugehörigen kleinen Waagensockels.' },
  { id: 'oeltuch', title: 'Gewachstes Abdecktuch', price: 16, category: 'haushalt', unit: 'Ein Tuch · etwa 1,5 × 1,5 Schritt',
    description: 'Dichtes mit Wachs behandeltes Leinen schützt Körbe und Gepäck vor Spritzwasser und kurzem Regen. Nach Gebrauch trocken ausbreiten; nicht feuerfest.',
    visual: 'Ein einziges sandfarbenes gewachstes Leinentuch, halb gefaltet mit einer deutlich umgeschlagenen Ecke, leicht dunkler matter Wachsschimmer und verstärkte Säume. Keine Plane mit Gestänge, keine Verpackung.' },
  { id: 'fasshahn', title: 'Hölzerner Fasshahn', price: 9, category: 'haushalt', unit: 'Ein Stück',
    description: 'Ein passgenau gedrechselter Zapfhahn mit Holzriegel für kleine Vorratsfässer. Rhun prüft vor dem Kauf den benötigten Durchmesser; das Fass gehört nicht dazu.',
    visual: 'Ein einzelner hölzerner mittelalterlicher Fass-Zapfhahn aus hellem Hartholz, konischer Stopfen, kurzer nach unten gebogener Auslauf und kleiner querliegender Drehgriff. Kein Fass.' },
  { id: 'tuerkeil', title: 'Türkeil mit Zugschlaufe', price: 3, category: 'haushalt', unit: 'Ein Stück',
    description: 'Ein breiter Keil aus Buche hält eine leichte Innentür offen. Die feste Lederschlaufe erleichtert das Herausziehen, wenn die Tür sich gesetzt hat.',
    visual: 'Ein einzelner schlichter dreieckiger Türkeil aus warmem Buchenholz mit einer kurzen braunen Lederschlaufe durch ein Loch am dicken Ende. Kompaktes alltägliches Haushaltswerkzeug.' },
  { id: 'schnallenkaestchen', title: 'Schnallen- und Riemenbeschläge', price: 18, category: 'werkzeug', unit: 'Ein Kästchen',
    description: 'Drei schlichte Eisenschnallen, sechs Riemennieten und zwei Riemenschlaufen im kleinen Schiebekästchen. Ersatzteile für vorhandene Gurte; Leder und Nähzeug werden getrennt verkauft.',
    visual: 'Ein kleines offenes hölzernes Schiebekästchen mit genau drei schlichten dunklen Eisenschnallen, sechs kleinen Riemennieten und zwei rechteckigen Riemenschlaufen. Deckel halb zurückgeschoben, Teile übersichtlich erkennbar. Keine Waffen.' },
  { id: 'gewuerzdose', title: 'Reisegewürzdose mit drei Fächern', price: 14, category: 'unterwegs', unit: 'Eine gefüllte Dose',
    description: 'Eine kleine gut schließende Zinndose mit Kümmel, getrocknetem Thymian und Senfkörnern in drei getrennten Fächern. Für Reisekessel und kleine Küchen.',
    visual: 'Eine kleine runde offene mittelalterliche Zinndose mit drei klar getrennten Fächern: brauner Kümmel, grüne trockene Thymianblättchen und gelbe Senfkörner. Passender schlichter Deckel daneben. Keine Beschriftung.' },
  { id: 'klapphocker', title: 'Klapphocker aus Eschenholz', price: 28, category: 'unterwegs', unit: 'Ein Stück',
    description: 'Ein niedriger dreibeiniger Klapphocker mit festem Ledersitz. Passt unter den Arm und dient am Marktstand, beim Flicken oder auf einer Rast.',
    visual: 'Ein einzelner niedriger dreibeiniger faltbarer Wanderhocker aus hellen Eschenholzstangen, dreieckiger brauner Ledersitz, einfache ehrliche Konstruktion, in aufgeklapptem Zustand. Keine Person.' },
  { id: 'flaschenstopfen', title: 'Korken und Flaschenstopfen', price: 5, category: 'haushalt', unit: 'Sechs Stück',
    description: 'Sechs saubere Korkstopfen in drei gängigen Größen, mit einem schmalen Band zusammengehalten. Zum erneuten Verschließen von Vorrats- und Ölflaschen.',
    visual: 'Genau sechs schlichte konische Naturkork-Flaschenstopfen in drei Größen, lose durch ein einziges dünnes Leinenband zusammengehalten. Keine Flaschen, kein Beutel.' },
  { id: 'schriftroehre', title: 'Wetterfeste Dokumentenröhre', price: 22, category: 'unterwegs', unit: 'Ein leeres Etui',
    description: 'Eine schlanke hölzerne Dokumentenröhre mit gewachster Lederhülle und dicht schließendem Steckdeckel. Hält Briefe und Karten bei Regen trocken; für längeres Untertauchen ungeeignet.',
    visual: 'Eine einzelne schlanke geschlossene mittelalterliche Dokumentenröhre aus Holz mit honigbrauner gewachster Lederhülle, abgenommenem engem Steckdeckel neben der Öffnung und kurzem Schulterriemen. Keine Schriftrolle oder Papiere im Inneren, keine Buchstaben.' },
  { id: 'vorratsdose', title: 'Dicht schließende Vorratsdose', price: 19, category: 'haushalt', unit: 'Eine leere Dose · etwa 2 Liter',
    description: 'Eine schlichte verzinnte Dose mit übergreifendem Deckel bewahrt trockenes Mehl, Tee oder Saatgut auf. Erschwert Mäusen den Zugriff und hält den Inhalt ordentlich zusammen.',
    visual: 'Eine einzelne schlichte mittelalterliche zylindrische verzinnte Vorratsdose mit eng übergreifendem leicht angehobenem Deckel und gefalztem Rand, mattes silbergraues Metall. Leer, keine Nahrung, kein Text, keine modernen Bügelverschlüsse.' }
]);

const defaults = { status: 'available', imageFormat: 'square', imageFit: 'contain', imagePosition: 'center', imageHeight: 270,
  descriptionTitle: 'Beschreibung', featuresTitle: 'Auf einen Blick', originTitle: 'Lieferung', usageTitle: 'Verwendung',
  priceTitle: 'Preis', priceFill: 35, priceOptions: [], conditionsTitle: 'Hinweise', attributes: [],
  currencyCode: 'KT', currencyLabel: 'Kupfertaler', currencyIcon: '◈' };
const feature = text => ({ icon: '•', text });
const amount = number => number.toLocaleString('de-DE', { maximumFractionDigits: 2 });
const catalog = (subtitle, items, categories, noteText) => ({ headerIcon: PENDRWN_EMBLEM, title: 'Güterregister', subtitle,
  categories, allLabel: 'Alles zeigen', noteIcon: '◈', noteTitle: 'Vom Markt der Fortuna in den Vollen Korb', noteText, items,
  footerCards: [{ icon: '♧', title: 'Bestellen statt suchen', text: 'Was gerade fehlt, lässt Cadwgan bei der nächsten Lieferung anfragen. Preis und Ankunft werden vor einer verbindlichen Bestellung vereinbart.' },
    { icon: '◈', title: 'Verkauf am Tresen', text: 'Die angegebenen Einheiten gelten pro Stück, Set oder Bündel. Die Waren werden im Laden bezahlt und von Hand ausgegeben.' }] });

export function buildStoreStandardCatalog() {
  return catalog('Werkzeuge & Sonstiges · das Standardsortiment', STORE_STANDARD.map(item => ({ ...defaults,
    id: item.canonicalKey, category: 'standard', title: item.title, subtitle: item.type,
    unit: item.hiddenMeta.unit, badge: 'Standardsortiment', image: `${STORE_ART}/goods/${storeItemId(item)}.png`,
    description: `<p>${item.description}</p>`, features: [feature(item.hiddenMeta.unit), ...item.tags.map(feature)],
    origin: 'Regelmäßige Sammellieferungen des Marktes der Fortuna nach Gwynthor', usageTags: [...item.tags],
    priceMin: amount(item.priceRange.minCopper), priceMax: item.priceRange.maxCopper === item.priceRange.minCopper ? '' : amount(item.priceRange.maxCopper),
    priceNote: item.priceRange.minCopper !== item.priceRange.maxCopper ? 'Je nach Zusammenstellung der Tagesration.' : '',
    conditions: 'Nach Ladenbestand. Fehlende Ware kann zur nächsten Sammellieferung angefragt werden.',
    attributes: item.attributes.map(a => ({ ...a }))
  })), [{ id: 'standard', label: 'Werkzeuge & Sonstiges' }],
  '47 gewöhnliche Waren für Haus, Handwerk und Reise. Auswahl, Verkaufseinheiten und Preise folgen dem Standardsortiment. Cadwgan und Idwal beziehen den Nachschub unmittelbar über den Markt der Fortuna.');
}
export function buildStoreSpecialCatalog() {
  return catalog('Eigenes Sortiment · zehn nützliche Besonderheiten', STORE_SPECIAL.map(item => ({ ...defaults,
    id: `pendrwn:${item.id}`, title: item.title, category: item.category, subtitle: 'Cadwgans eigene Auswahl', unit: item.unit,
    image: `${STORE_ART}/goods/${item.id}.png`, badge: 'Eigene Auswahl', description: `<p>${item.description}</p>`,
    features: [feature(item.unit)], origin: 'Durch den Markt der Fortuna für den Vollen Korb beschafft',
    usageTags: [item.category === 'unterwegs' ? 'Unterwegs' : item.category === 'werkzeug' ? 'Handwerk und Handel' : 'Im Haushalt'],
    priceMin: amount(item.price), priceMax: '', priceNote: 'Preis für die beschriebene Einheit.',
    conditions: 'Kleine Stückzahlen. Maße und passende Größen vor dem Kauf prüfen.'
  })), [{ id: 'haushalt', label: 'Im Haushalt' }, { id: 'werkzeug', label: 'Handwerk und Handel' }, { id: 'unterwegs', label: 'Unterwegs' }],
  'Zehn zusätzliche Waren außerhalb des Standardsortiments: praktische Lösungen für kleine alltägliche Ärgernisse. Cadwgan wählt sie selbst aus und bestellt nur überschaubare Mengen.');
}
