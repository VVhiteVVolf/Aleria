import { KANNE_DISHES, KANNE_IMPORTS } from './krumme-kanne-menu.mjs';
import { KANNE_DISH_NOTES } from './krumme-kanne-dish-notes.mjs';
import { fixedTradePrice as fixedPrice, convertStandardGoods } from '../trade-catalog/standard-goods-conversion.mjs';

const asset = (folder, id) => `./assets/krumme-kanne/${folder}/${id}.png`;
const paragraphs = texts => texts.map(text => `<p>${text}</p>`).join('');
const defaults = { status: 'available', imageFit: 'contain', imagePosition: 'center', imageHeight: 320, descriptionTitle: 'Zubereitung & Geschmack', featuresTitle: 'Auf dem Teller', features: [], originTitle: 'Herkunft', usageTitle: 'Am Tisch', priceTitle: 'Preis & Portion', priceFill: 35, priceOptions: [], conditionsTitle: 'Verfügbarkeit', attributes: [] };

function standardItems(page) {
  return convertStandardGoods(page, { defaults, origin: 'Die Krumme Kanne · Gwynthor',
    descriptionForRow: row => paragraphs([...(row.details || row.values.description).split(/\n\s*\n/), row.category === 'speisen'
      ? 'In der Krummen Kanne gehört dieses Gericht zur einfachen Karte für den täglichen Hunger. Die Küche bereitet es portionsweise aus dem jeweiligen Tagesvorrat zu; die Schankmägde nennen auf Nachfrage die heutige Ausführung. Die angegebenen Beilagen gehören zur Portion, zusätzliche Bestellungen werden gesondert berechnet.'
      : 'Elidyr führt diesen Trunk im gewöhnlichen Ausschank der Kanne. Die angegebene Portion wird einzeln am Tisch oder direkt am Tresen gereicht. Wer eine bestimmte Herkunft oder Zunftabfüllung sucht, findet die namentlich geführten Biere und Whiskys unter „Importierte Getränke“.']),
    conditionsForRow: row => /Gebackenes Huhn/.test(row.values.name)
      ? 'Saisonal und nur bei entsprechender Lieferung erhältlich.' : 'Nach Tagesvorrat; die Schankmägde geben Auskunft.' });
}

export function buildKanneTradeCatalog(page, catalogs) {
  const dishes = KANNE_DISHES.map(d => {
    const unit = d.course === 'Vorspeise' ? 'Kleine Portion' : 'Pro Teller';
    return { ...defaults, ...fixedPrice(d.price), id: d.id, category: 'besonderes-menu', title: d.name,
      subtitle: `${d.course}${d.course === 'Hauptspeise' ? (d.meat ? ' · Fleisch' : ' · Fleischlos') : ''}`, unit,
      image: asset('food', d.id), imageFormat: 'square', badge: d.course,
      tags: [d.course, ...(d.meat ? [] : ['Fleischlos'])],
      description: paragraphs([d.description, ...KANNE_DISH_NOTES[d.id]]),
      origin: 'Tadhgs Hausküche · Die Krumme Kanne · Gwynthor', usageTags: [unit, d.course === 'Wochenspezialität' ? 'Angekündigter Wildtag' : 'Tägliche Hauskarte'],
      priceNote: '', conditions: d.availability };
  });
  const imports = KANNE_IMPORTS.map(([moduleId, itemId, serving]) => {
    const source = catalogs.find(c => c.id === moduleId);
    const item = source?.pages.flatMap(p => p.tradeCatalog?.items || []).find(i => i.id === itemId);
    const option = item?.priceOptions?.find(o => o.label === serving);
    if (!item?.image || !option?.price) throw new Error(`Importquelle fehlt: ${moduleId}/${itemId}`);
    return { ...structuredClone(item), id: `${moduleId}-${itemId}`, category: 'importierte-getraenke',
      subtitle: /whisky/.test(itemId) ? 'Import · Whisky' : 'Import · Bier', priceMin: '', priceMax: '',
      priceOptions: [structuredClone(option)], priceTitle: 'Ausschank in der Kanne',
      priceNote: `Ausschankpreis und Größe aus dem Sortiment: ${source.title}.`,
      conditionsTitle: 'Verfügbarkeit', conditions: 'Reguläres Importsortiment. Ausschank nach Fass- und Flaschenvorrat; Elidyr nennt die aktuell geöffneten Abfüllungen.' };
  });
  return {
    headerIcon: asset('references', 'kanne-schild'), title: 'Güterregister', subtitle: 'Speis & Trunk · Die Krumme Kanne',
    categories: [{ id: 'speisen', label: 'Standard Speisen' }, { id: 'getranke', label: 'Standard Getränke' }, { id: 'besonderes-menu', label: 'Hauseigene Speisen' }, { id: 'importierte-getraenke', label: 'Importierte Getränke' }],
    allLabel: 'Alle Angebote', searchPlaceholder: 'Gericht, Getränk oder Zutat suchen …', filterLabel: 'Die Hauskarte',
    noteIcon: '♧', noteTitle: 'Drei Küchen · Ein Herd',
    noteText: 'Cenyrische Schüsseln, nordischer Rauch und albische Kräuter: Vier Vorspeisen und acht Hauptgerichte ergänzen die tägliche Karte. Drei besondere Wildgerichte gibt es jeweils nur an einem angekündigten Wochentag.',
    items: [...standardItems(page), ...dishes, ...imports],
    footerCards: [{ icon: '◈', title: 'Die drei Wildtage', text: 'Feuerhirsch, Hirschbraten und Wildschweinkeule werden jeweils einmal wöchentlich angekündigt. Jagd- und Lieferglück bestimmen die Zahl der Portionen.' }, { icon: '♧', title: 'Östliches Hafenviertel', text: 'Merrik Trevoryn, Hrolf Svathamar und Aedan Dubhdarach · Gwynthor, an der Gasse Richtung Osttor.' }, { icon: '☷', title: 'Bestellung & Rechnung', text: 'Elidyr und die Schankmägde nehmen Bestellungen auf. Angegebene Portionen und Ausschankgrößen gelten pro Bestellung; zusätzliche Beilagen werden einzeln berechnet.' }]
  };
}
