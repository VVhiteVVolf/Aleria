import { fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';
import { HONIGTOERTCHEN_ART, MELOG_EMBLEM } from './honigtoertchen-profile.mjs';
import { HONIGTOERTCHEN_ASSORTMENT, HONIGTOERTCHEN_CATEGORIES } from './honigtoertchen-assortment.mjs';

export function buildHonigtoertchenCatalog() {
  const highestPrice = Math.max(...HONIGTOERTCHEN_ASSORTMENT.map(item => item.copper));
  return {
    title: 'Die Auslage des Honigtörtchens', subtitle: 'Brot, feine Backwaren und Torten auf Vorbestellung',
    headerIcon: MELOG_EMBLEM, categories: structuredClone(HONIGTOERTCHEN_CATEGORIES),
    allLabel: 'Die ganze Auslage', searchPlaceholder: 'Gebäck, Zutat oder Festtorte suchen …', filterLabel: 'Aus der Backstube',
    noteIcon: '❧', noteTitle: 'Frisch gebacken, sorgfältig bestellt',
    noteText: 'Brot und kleine Backwaren nach Tagesvorrat. Ganze Kuchen und Torten bitte rechtzeitig vorbestellen. Die Preise gelten für die jeweils genannte feste Ausführung; zusätzliche Verzierungen, Sondergrößen und Lieferung werden vorab vereinbart.',
    items: HONIGTOERTCHEN_ASSORTMENT.map(product => ({
      ...fixedTradePrice(`${product.copper} Kupfertaler`), id: product.id,
      title: product.title, category: product.category, definitionCategory: 'speisen',
      subtitle: product.category === 'festtafel' ? 'Speise · Festgebäck auf Vorbestellung' : 'Speise · Backware aus Gwynthor',
      unit: product.unit, status: 'available', image: `${HONIGTOERTCHEN_ART}/food/${product.id}.png`,
      imageFit: 'contain', imagePosition: 'center', imageHeight: 320, imageFormat: 'square',
      badge: product.category === 'festtafel' ? 'Auf Vorbestellung' : 'Haus Melog',
      descriptionTitle: 'Aus der Backstube', description: `<p>${product.description}</p>`,
      featuresTitle: 'Zutaten & Ausführung', features: [{ text: product.ingredients }, { text: product.unit }],
      originTitle: 'Herkunft', origin: 'Bäckerei und Konditorei Zum Honigtörtchen · Familie Melog · Gwynthor',
      usageTitle: 'Genießen & Aufbewahren', usageTags: [product.serving],
      priceTitle: 'Preis für die genannte Einheit', priceFill: Math.round(15 + product.copper / highestPrice * 80),
      priceOptions: [], priceNote: 'Der genannte Umfang ist vollständig enthalten. Sonderwünsche und Lieferung werden zusätzlich vereinbart.',
      conditionsTitle: 'Bestellung & Vorrat', conditions: product.category === 'festtafel'
        ? product.serving : 'Nach Tagesvorrat. Größere Mengen vorbestellen; frische Rahm- und Quarkwaren am selben Tag verzehren.',
      attributes: [], tags: ['Backware', 'Melog', ...(product.category === 'festtafel' ? ['Vorbestellung'] : [])]
    })),
    footerCards: [
      { icon: '❧', title: 'Eine Tafel für jeden Tag', text: 'Brote und kleine Backwaren werden einzeln verkauft. Die Preise gelten jeweils für die angegebene Portion oder das vollständige Gebinde.' },
      { icon: '✦', title: 'Ein Fest nach Maß', text: 'Die Dienstleistungsseite beschreibt Wunschfüllungen, Festmengen, Wappen und Lieferung. Ein individueller Auftrag erhält vor der Zusage einen eigenen Preis.' },
      { icon: '☷', title: 'Zutaten rechtzeitig besprechen', text: 'Nüsse, Milch, Ei und Getreide werden in derselben Backstube verarbeitet. Weglassen einzelner Zutaten ist nach Prüfung möglich; eine vollständig getrennte Herstellung wird nicht versprochen.' }
    ]
  };
}
