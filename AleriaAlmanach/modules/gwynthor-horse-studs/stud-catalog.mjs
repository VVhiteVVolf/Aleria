import { HORSE_CATALOG_DEFAULTS as defaults, createHorseExemplar } from '../trade-catalog/horse-catalog-items.mjs';
import { standardItemToTradeItem, fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';
import { STUD_BREEDS, exemplarPrice, breedSalePrice } from './stud-pricing.mjs';
import { STUD_HORSES } from './stud-horses.mjs';
export const STUD_ART = './assets/gwynthor-horse-studs';
export const STUD_CATEGORIES = Object.freeze([{ id: 'rassen', label: 'Rassen zum Verkauf' }, { id: 'zucht', label: 'Zuchtpferde – Exemplare' },
  { id: 'mischling', label: 'Mischlings – Exemplare' }, { id: 'reinrassig', label: 'Rassen – Exemplare' }]);
export function buildStudHorseCatalog(venue) {
  const premium = venue.key === 'rhosmere';
  const breeds = STUD_BREEDS.map(breed => ({ ...standardItemToTradeItem(breed.standard, { defaults, idPrefix: `${venue.key}-rasse` }),
    ...fixedTradePrice(`${breedSalePrice(breed.id, premium)} Kupfertaler`), category: 'rassen', unit: '1 Pferd',
    definitionRef: structuredClone(breed.standard.definitionRef), definitionKind: 'shared', definitionCategory: 'pferde',
    badge: 'Rasseangebot', subtitle: 'Nachlieferbares Angebot · konkretes Tier nach Auswahl',
    description: `<p>${breed.summary}</p>`, features: breed.facts.map(f => ({ icon: '*', text: `${f.label}: ${f.value}` })),
    origin: `${breed.region}. ${premium ? 'Ausgewählte Gildenlinien und sorgfältige Bereitung.' : 'Solide Familienzucht und geprüfter Ankauf.'}`,
    priceNote: 'Richtpreis für ein passendes durchschnittliches Verkaufstier dieser örtlichen Qualitätsstufe. Individuelle Pferde stehen in den Exemplarkategorien.',
    conditions: breed.id === 'ceffyl' ? 'Seltenes Angebot nach Absprache. Feste Bezugspersonen und behutsame Reiterwahl sind erforderlich; kein bereits gebundener Ceffyl wird als beliebig austauschbares Reittier behandelt.' : 'Eignung, Gesundheitszustand, Herkunft und vereinbarte Übergabe werden am konkreten Tier geprüft.' }));
  const individuals = STUD_HORSES.filter(h => h.venue === venue.key).map(h => {
    return createHorseExemplar(h, { price: exemplarPrice(h), artRoot: STUD_ART, namespace: 'gwynthor-horse-studs', version: h.id === 'morgenknopf' ? 2 : 1 });
  });
  return { title: `${venue.title} · Pferde`, subtitle: 'Rasseangebote, gezielte Veredelungen und Pferde mit eigener Vorgeschichte', headerIcon: venue.sign,
    categories: structuredClone(STUD_CATEGORIES), allLabel: 'Alle Pferdeangebote', searchPlaceholder: 'Name, Rasse oder Eigenschaft suchen …',
    noteTitle: 'Rasse und einzelnes Pferd', noteText: 'Rasseangebote beschreiben nachlieferbare Auswahl. Jedes benannte Exemplar ist ein einzelnes Pferd. Gezielte Veredelungen besitzen belegte Elternrassen; Mischlinge bleiben ohne gesicherten Abstammungsnachweis.',
    items: [...breeds, ...individuals], footerCards: [] };
}
export const SADDLERY_GOODS = Object.freeze([
  ['reitsattel', 'Reitsattel', 480, '1 Sattel', 'Hölzerner Sattelbaum, lederner Sitz und wollene Polsterung; für alltägliche Reisen.'],
  ['packsattel', 'Packsattel', 420, '1 Sattel', 'Holzgestell mit gepolsterten Auflagen und Befestigungsriemen für gleichmäßig verteilte Lasten.'],
  ['zaumzeug', 'Zaumzeug mit Zügeln', 145, '1 Satz', 'Genähtes Lederzaumzeug mit einfachem eisernem Gebiss und einem Paar Zügel.'],
  ['halfter', 'Lederhalfter mit Führstrick', 65, '1 Satz', 'Verstellbares Lederhalfter und geflochtener Hanfstrick für das sichere Führen.'],
  ['sattelgurt', 'Sattelgurt', 55, '1 Stück', 'Breites festes Gurtband mit Lederenden und geschmiedeten Schnallen.'],
  ['steigbuegel', 'Eiserne Steigbügel mit Riemen', 140, '1 Paar', 'Geschmiedete Steigbügel mit vernähten Lederriemen, paarweise angepasst.'],
  ['satteltaschen', 'Satteltaschen', 190, '1 Paar', 'Zwei zusammengehörige wettergeschützte Ledertaschen mit Riemenverschlüssen.'],
  ['satteldecke', 'Wollene Satteldecke', 95, '1 Stück', 'Dicht gewebte Wolldecke als passende Unterlage zwischen Pferd und Sattel.'],
  ['putzzeug', 'Striegel und Rosshaarbürste', 38, '1 Satz', 'Ein einfacher eiserner Striegel und eine Bürste mit Holzrücken zur täglichen Fellpflege.'],
  ['hufkratzer', 'Hufkratzer', 18, '1 Stück', 'Kleines geschmiedetes Pflegewerkzeug mit abgerundetem Griff und stumpfer Arbeitskante.']
]);
export function buildStudSaddleryCatalog(venue) {
  return { title: `${venue.title} · Sattlerei`, subtitle: 'Zehn mittelalterliche Waren für Reiten, Lasten und Pflege', headerIcon: venue.sign,
    categories: [{ id: 'sattlerei', label: 'Pferdezubehör' }], allLabel: 'Das ganze Zubehör', searchPlaceholder: 'Sattel, Riemen oder Pflegezeug suchen …',
    noteTitle: 'Passform und Handarbeit', noteText: 'Sattelbaum, Gurt und Zaumzeug werden am Pferd angepasst. Reparaturen werden nach Aufwand vereinbart. Preise gelten für die beschriebene Verkaufseinheit.',
    items: SADDLERY_GOODS.map(([id, title, base, unit, text]) => ({ ...defaults, ...fixedTradePrice(`${Math.round(base * (venue.key === 'rhosmere' ? 1.5 : 1))} Kupfertaler`),
      id: `${venue.key}-zubehoer-${id}`, title, category: 'sattlerei', definitionCategory: 'werkzeuge', definitionKind: 'shared', unit,
      image: `${STUD_ART}/saddlery/sattlerei-${id}-v1.png`, imageFormat: 'square', imageHeight: 280, badge: 'Sattlerarbeit', subtitle: 'Leder, Holz, Wolle und geschmiedetes Eisen',
      descriptionTitle: 'Die Ware', description: `<p>${text}</p>`, features: [{ icon: '*', text: unit }], origin: 'Sattlerei des Gestüts; mittelalterliche Handarbeit und gebrauchsfähige Materialien.',
      tags: ['Pferdezubehör', 'Sattlerei'], usageTags: ['Reiten', 'Pflege und Transport'], priceNote: 'Nachlieferbare Ware; keine Unikatbindung.', conditions: 'Größe und Passform vor der Übergabe prüfen. Keine magische Wirkung und kein automatischer Kampfbonus.' })), footerCards: [] };
}
