import { fixedTradePrice } from './standard-goods-conversion.mjs';
export const HORSE_CATALOG_DEFAULTS = Object.freeze({ status: 'available', unit: '1 Pferd', imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center', imageHeight: 380,
  definitionCategory: 'pferde', descriptionTitle: 'Wesen und Erscheinung', featuresTitle: 'Pferdeakte', originTitle: 'Herkunft und Aufzucht', usageTitle: 'Eignung',
  priceTitle: 'Kaufpreis', priceFill: 35, priceOptions: [], conditionsTitle: 'Vor der Übergabe', attributes: [] });
export function createHorseExemplar(h, { price, artRoot, namespace, version = 1 }) {
  return { ...HORSE_CATALOG_DEFAULTS, ...fixedTradePrice(`${price.amount} Kupfertaler`), id: `horse-${h.id}`, category: h.category,
    title: h.name, subtitle: `${h.age} Jahre · ${h.sex} · ${h.parents ? h.parents.join(' × ') : h.breed || 'Abstammung nicht belegt'}`,
    definitionKind: 'unique', canonicalKey: `${namespace}:${h.id}`, badge: 'Einmaliges Pferd', image: `${artRoot}/horses/${h.id}-v${version}.png`,
    description: `<p>${h.appearance}</p><p>${h.character}</p>`, features: [`${h.age} Jahre`, h.sex, h.parents ? `Belegte Elternrassen: ${h.parents.join(' × ')}` : h.breed ? `Reinrassig: ${h.breed}` : 'Keine belastbaren Elternrassen', 'Ein einzelnes, namentlich geführtes Pferd'].map(text => ({ icon: '*', text })),
    tags: ['Pferd', 'Unikat', h.category, ...(h.parents || [h.breed || 'unbekannt'])], origin: h.history,
    usageTags: h.category === 'mischling' ? ['Geprüftes Gebrauchs- und Reisepferd'] : ['Eignung nach Ausbildung und Reiterkenntnis'],
    priceNote: `Preisgrundlage: ${price.source}. Pflege, Ausbildung und örtliche Auswahl sind berücksichtigt.`,
    conditions: 'Genau dieses Pferd ist einmalig erhältlich. Nach abgeschlossenem Kauf ist das Exemplar verkauft und nicht erneut verfügbar. Pferdezubehör ist nicht im Kaufpreis enthalten.' };
}
