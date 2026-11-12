import collection from '../../assets/loer-hofjuwelier/items.catalog.json' with { type: 'json' };
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { fixedTradePrice, standardItemToTradeItem } from '../trade-catalog/standard-goods-conversion.mjs';
import { AURDDEN_ART } from './aurdden-people.mjs';

const defaults = Object.freeze({ status: 'available', imageFit: 'contain', imagePosition: 'center', imageFormat: 'square', imageHeight: 280,
  descriptionTitle: 'Das Schmuckstück', featuresTitle: 'Lieferumfang', originTitle: 'Material und Arbeit', usageTitle: 'Anlass',
  priceTitle: 'Preis', priceFill: 35, priceOptions: [], conditionsTitle: 'Vor der Übergabe' });
export const AURDDEN_RAW_STONES = Object.freeze(STANDARD_ITEMS.filter(item => item.id.startsWith('standard:arkanist:') && item.tags.includes('Edel- & Schmucksteine')));
// Venue prices only. Canonical stones, definitions and quantities stay intact.
export const AURDDEN_RAW_PRICES_KT = Object.freeze({
  amethyst: 75, rubin: 450, saphir: 400, smaragd: 425, diamant: 900,
  opal: 250, topas: 100, granat: 85, aquamarin: 150, turmalin: 125,
  jade: 60, bergkristall: 20, onyx: 50, mondstein: 100, tuerkis: 50,
  bernstein: 40, perle: 120, lapislazuli: 60, malachit: 35, zirkon: 120
});
export function aurddenRawPrice(stone) {
  const price = AURDDEN_RAW_PRICES_KT[stone.id.split(':').at(-1)];
  if (!Number.isFinite(price) || price <= 0) throw Error(`Fehlender Sternenfang-Steinpreis: ${stone.id}`);
  return price;
}
const departments = Object.freeze({ ringe: ['Ringe', 'Zehn Ringe · vom feinen Silberreif bis zum großen Prunkring'],
  amulette: ['Amulette', 'Zehn Amulette · Schmuck und Medaillons ohne Verzauberung'],
  schmuck: ['Schmuckstücke', 'Zehn weitere Arbeiten · Ketten, Broschen und festlicher Schmuck'] });

function ownItem(item, category) {
  return { ...defaults, ...fixedTradePrice(`${item.priceKt} Kupfertaler`), id: item.id, category, title: item.name,
    subtitle: 'Aurdden · feine Goldschmiede und Juwelierarbeit', badge: 'Unverzaubert', image: `./${item.image}`, unit: item.unit,
    description: `<p>${item.description}</p>`, features: [item.unit], attributes: [], tags: [item.category, 'Unverzaubert'],
    origin: 'Ausgewählte Materialien, feine Handarbeit und sorgfältig geprüfte Fassungen aus dem Sternenfang.',
    usageTags: ['Persönlicher Schmuck', 'Geschenk und festlicher Anlass'], priceNote: 'Preis für die beschriebene Ausführung und Verkaufseinheit.',
    conditions: 'Material, Besatz, Ringweite beziehungsweise Verschluss werden bei der Übergabe geprüft. Sondergrößen, Gravuren und zusätzliche Arbeiten werden vorab vereinbart. Keine magische Wirkung; reguläre nachlieferbare Ware.' };
}

export function buildAurddenCatalog(department) {
  const raw = department === 'rohstoffe';
  const definition = departments[department];
  if (!raw && !definition) throw Error(`Unbekanntes Sternenfang-Sortiment: ${department}`);
  const items = raw ? AURDDEN_RAW_STONES.map(item => ({ ...standardItemToTradeItem(item, { defaults, idPrefix: 'sternenfang-rohstoff' }),
    ...fixedTradePrice(`${aurddenRawPrice(item)} Kupfertaler`), definitionRef: structuredClone(item.definitionRef), definitionKind: item.definitionKind, category: 'rohstoffe',
    priceNote: 'Ladenpreis für die angegebene kleine Verkaufseinheit. Fassung und weitere Handwerksarbeiten werden gesondert vereinbart.' })) :
    collection.items.filter(item => item.category === definition[0]).map(item => ownItem(item, department));
  return { title: raw ? 'Rohmaterialien · Edel- und Schmucksteine' : `Der Sternenfang · ${definition[0]}`,
    subtitle: raw ? 'Zwanzig bestehende Handelssteine in ihren üblichen Verkaufseinheiten' : definition[1],
    headerIcon: `${AURDDEN_ART}/schild.png`, categories: [{ id: department, label: raw ? 'Edel- und Schmucksteine' : definition[0] }],
    allLabel: 'Das ganze Angebot', searchPlaceholder: 'Material, Stein oder Schmuckstück suchen …',
    noteIcon: '✦', noteTitle: raw ? 'Stein und fertige Arbeit' : 'Gwynthors vornehmste Goldschmiede',
    noteText: raw ? 'Lose kleine Handelssteine in der jeweils angegebenen Größe und Qualität zu den Ladenpreisen des Sternenfangs. Die Verkaufseinheit ist unmontiert; Fassung, Gravur und weitere Arbeiten werden gesondert vereinbart.' :
      'Feine Metallarbeit, ausgesuchter Besatz und aufwendige Fassungen bestimmen den Preis. Die Auswahl reicht von zurückhaltenden Einzelstücken bis zum Schmuck für große gesellschaftliche Anlässe.',
    items, footerCards: [] };
}
