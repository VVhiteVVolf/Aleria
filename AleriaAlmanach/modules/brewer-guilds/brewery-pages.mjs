import { reservedDrinkSlots } from '../trade-catalog/drink-catalog-model.mjs';
import { buildBreweryDrinkPricing } from './brewery-prices.mjs';

export const ASSETS = './public/assets/brewer-guilds';
export const paragraph = text => `<p>${text}</p>`;
export const sourceCopy = (source, start, end = start + 1) => source.slice(start, end).map(block => block.html).join('\n');
export const familyPortrait = (family, id) => `../Stammbäume/${family.persons.find(person => person.id === id)?.portrait || ''}`;
export const familyCrest = family => `../Stammbäume/${family.document.emblem}`;

export function storyPage(title, asset, description) {
  return { pageTitle: title, image: `${ASSETS}/${asset}.png`, imageWidth: 38,
    imageFit: 'contain', imagePosition: 'center', description, commentSequence: [] };
}

export function drinkItem(product, { mark, origin, kind = 'beer' }) {
  return {
    id: product.id, category: kind, status: 'available', title: product.name,
    subtitle: product.subtitle, image: `${ASSETS}/${product.id}.png`, imageFormat: 'portrait',
    imageFit: 'contain', imagePosition: 'center', imageHeight: 420,
    badge: product.badge || (kind === 'beer' ? 'Hausbier' : 'Whisky'), tags: product.tags,
    descriptionTitle: 'Charakter & Herkunft', description: product.description,
    featuresTitle: 'Steckbrief', features: [], originTitle: 'Herkunft', origin: product.origin || origin,
    usageTitle: 'Am Tisch', usageTags: product.occasions || product.tags,
    ...buildBreweryDrinkPricing(kind, product.servingCopper),
    conditionsTitle: 'Verfügbarkeit & Besonderheiten', conditions: product.conditions || 'Stammsortiment des Hauses.',
    attributes: [], sealImage: mark
  };
}

export function cataloguePage(title, products, options) {
  const kind = options.kind || 'beer';
  return { pageTitle: title, tradeCatalogPage: true, commentSequence: [], tradeCatalog: {
    title, subtitle: options.subtitle, headerIcon: options.mark,
    noteIcon: '◈', noteTitle: 'Glas / Krug · Flasche · Fass',
    noteText: kind === 'beer' ? 'Krug 0,5 l · Flasche 1 l · Fass 50 l. Alle Preise in Kupfertalern.' : 'Glas 4 cl · Flasche 0,7 l · Fass 50 l. Alle Preise in Kupfertalern.',
    categories: [{ id: kind, label: options.partner ? 'Partnerbiere · Getränke' : kind === 'beer' ? 'Bier · Getränke' : 'Whisky · Getränke' }],
    allLabel: options.partner ? 'Alle Partnerprodukte' : 'Gesamtes Sortiment', searchPlaceholder: 'Nach Name, Charakter oder Herkunft suchen …', filterLabel: 'Suche',
    items: [...products.map(product => drinkItem(product, options)), ...(options.partner ? [] : reservedDrinkSlots(kind))], footerCards: []
  } };
}

export function hierarchyPage({ title, family, description, levels, motto = '', footer = '' }) {
  const emblem = familyCrest(family);
  return { pageTitle: 'Ämter, Ausbildung & Verantwortung', hierarchyPage: true, hierarchy: {
    layoutMode: 'vertical', treeDisplayMode: 'tabs', cardFontScale: 100, portraitScale: 75, chartScale: 90,
    eyebrow: 'Zunftordnung', subtitle: title, centerLabel: title, emblem, sideImage: emblem,
    organizationTitle: title, motto, description, detailsTitle: 'Zuständigkeiten', details: [],
    chartTitle: 'Vom Hausoberhaupt zum Handwerk', chartIntro: 'Die Ebenen zeigen die Verantwortung innerhalb der Zunft. Familiennachfolge und handwerkliche Ausbildung bleiben unterschiedliche Aufgaben.',
    levels, footerNote: footer
  } };
}

export function finishBreweryModule({ id, title, subtitle, family, pages }) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return { id, title, subtitle, type: 'Brauerei & Brennerei', category: 'Gilden & Zünfte · Brauer & Brenner',
    image: familyCrest(family), icon: '✦', stamp: 'HANDWERK · FAMILIE · HANDEL',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: pages.map((page, index) => ({ ...page, pageTitle: `${roman[index]}. — ${page.pageTitle}` }))
  };
}
