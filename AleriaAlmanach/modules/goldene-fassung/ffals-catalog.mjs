import collection from '../../assets/goldene-fassung/items.catalog.json' with { type: 'json' };
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { standardItemToTradeItem, fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';
import { FFALS_ART } from './ffals-people.mjs';

export const FFALS_BLACKMARKET_IDS = Object.freeze(['standard:schwarzmarkt:blutstaub', 'standard:schwarzmarkt:kriss', 'standard:schwarzmarkt:traumkorn']);
const defaults = Object.freeze({ status: 'available', imageFit: 'contain', imagePosition: 'center', imageFormat: 'square', imageHeight: 280,
  descriptionTitle: 'Die Ware', featuresTitle: 'Lieferumfang', originTitle: 'Material & Herkunft', usageTitle: 'Verwendung',
  priceTitle: 'Preis', priceFill: 35, priceOptions: [], conditionsTitle: 'Vor der Übergabe' });

function ownItem(item) {
  return { ...defaults, ...fixedTradePrice(`${item.priceKt} Kupfertaler`), id: item.id,
    category: item.category === 'Juwelier' ? 'schmuck' : 'wechselware', title: item.name,
    subtitle: item.category === 'Juwelier' ? 'Bürgerlicher Schmuck · unverzaubert' : 'Wechselnde Gebrauchtware',
    badge: item.category === 'Juwelier' ? 'Schlicht bis gut' : 'Einzelne Fund- und Gebrauchtstücke',
    image: item.image.startsWith('assets/') ? `./${item.image}` : item.image, unit: item.unit,
    description: `<p>${item.description}</p>`, features: [item.unit], attributes: [],
    tags: [item.category === 'Juwelier' ? 'Schmuck' : 'Gebrauchtware', 'Unverzaubert'],
    origin: item.category === 'Juwelier' ? 'Gewöhnliche Handels- und Werkstattware. Material und Besatz entsprechen der beschriebenen Ausführung.' : 'Wechselnde Ankäufe; genauer Vorbesitz und Zustand werden für das vorgelegte Stück geklärt.',
    usageTags: [item.category === 'Juwelier' ? 'Schmuck und kleine Geschenke' : 'Gebrauchsgegenstand'],
    priceNote: 'Preis für den ausdrücklich beschriebenen Lieferumfang.',
    conditions: item.category === 'Juwelier' ? 'Ohne Verzauberung. Ringweite, Verschluss und Material werden vor der Übergabe geprüft. Nicht genannte Anpassungen werden gesondert vereinbart.' : 'Nach tatsächlichem Bestand und Zustand. Kein Anspruch auf ein bestimmtes früheres Eigentumsstück; die Katalogware ist kein kanonisches Unikat.' };
}

function blackmarketItem(id) {
  const source = STANDARD_ITEMS.find(item => item.id === id);
  if (!source) throw Error(`Schwarzmarktware fehlt: ${id}`);
  return { ...standardItemToTradeItem(source, { defaults, idPrefix: 'goldene-fassung-schwarzmarkt' }), category: 'schwarzmarkt',
    image: `${FFALS_ART}/blackmarket/${id.split(':').at(-1)}.png`,
    subtitle: 'Aus dem bestehenden Schwarzmarktsortiment', badge: 'Nur auf gesonderte Nachfrage',
    origin: 'Bestehender Schwarzmarktkatalog; Preis, Menge und Eigenschaften folgen der kanonischen Ware.',
    usageTags: source.tags, priceNote: 'Unveränderter Standardpreis für die angegebene Menge.',
    conditions: id.endsWith(':traumkorn') ? 'Streng reguliertes Rohmaterial. Die vorhandenen Beschaffungs- und Verwendungsbedingungen gelten unverändert.' : 'Rauschmittel mit den im Standardgut beschriebenen Risiken und Folgen. Keine gewöhnliche Juwelierware; nur bei tatsächlicher Beschaffung.' };
}

export function buildFfalsCatalog(department) {
  const jewellery = department === 'juwelier';
  const items = collection.items.filter(item => item.category === (jewellery ? 'Juwelier' : 'Hehler')).map(ownItem);
  if (!jewellery) items.push(...FFALS_BLACKMARKET_IDS.map(blackmarketItem));
  return { title: jewellery ? 'Sortiment · Die goldene Fassung' : 'Hehler · Hinter dem Ladentisch',
    subtitle: jewellery ? 'Zwanzig klassische Schmuckstücke · schlicht bis gut' : 'Zehn wechselnde Gebrauchtwaren und eine kleine Schwarzmarktauswahl',
    headerIcon: `${FFALS_ART}/schild.png`, categories: jewellery ? [{ id: 'schmuck', label: 'Ringe, Ketten & Zierstücke' }] :
      [{ id: 'wechselware', label: 'Wechselnde Gebrauchtware' }, { id: 'schwarzmarkt', label: 'Aus dem Schwarzmarkt' }],
    allLabel: 'Das ganze Sortiment', searchPlaceholder: 'Stück, Material oder Verwendung suchen …',
    noteIcon: '◈', noteTitle: jewellery ? 'Ein gutes Stück ohne höfischen Prunk' : 'Keine gewöhnliche Auslage',
    noteText: jewellery ? 'Kleine Edelsteine, Silber, Bronze und wenige schmale Goldarbeiten bestimmen das Angebot. Es ist ein gut gehendes Bürgergeschäft mit begrenztem Preisrahmen.' :
      'Diese Auswahl gehört zu gesonderten Geschäften. Gebrauchtstücke wechseln, besondere Ware wird erst nach bestätigter Beschaffung zugesagt. Mächtige Artefakte und legendäre Raritäten gehören nicht zu diesem Angebot.',
    items, footerCards: [] };
}
