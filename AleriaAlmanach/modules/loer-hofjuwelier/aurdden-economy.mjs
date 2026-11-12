import { createPage, sanitizeScenario } from '../economy-calculator/economy-model.mjs';
import { buildVenueWorkforce } from '../economy-calculator/economy-venue-workforce.mjs';
import { readVenueOffers, readVenueServices } from '../economy-calculator/economy-venue-offers.mjs';
import { AURDDEN_BROTHERS, AURDDEN_WATCH } from './aurdden-people.mjs';
import { AURDDEN_RAW_STONES } from './aurdden-catalog.mjs';

export function buildAurddenEconomyPage(entry) {
  const offers = readVenueOffers(entry);
  const workers = buildVenueWorkforce(entry, { owners: AURDDEN_BROTHERS.map(person => person.name),
    personAliases: Object.fromEntries(AURDDEN_WATCH.map(person => [person.name, { name: person.name, role: 'Wächter · aldrimarischer Söldner' }])) });
  const channels = offers.map(offer => {
    const raw = offer.category === 'rohstoffe';
    const stone = raw ? AURDDEN_RAW_STONES.find(stone => offer.itemId === `sternenfang-rohstoff-${stone.id.split(':').at(-1)}`) : null;
    if (raw && !stone) throw Error(`Unbekanntes Rohsteinangebot: ${offer.itemId}`);
    const quantity = raw ? 2 : offer.category === 'ringe' ? .25 : offer.category === 'amulette' ? .2 : .15;
    return { id: `absatz-${offer.itemId}`, label: offer.title, unit: offer.unit, basis: 'fixed', quantity,
      unitCopper: offer.unitCopper, materialRatio: raw ? .8 * stone.priceRange.minCopper / offer.unitCopper : .7, lossRate: .01,
      source: offer.source, note: `Offener Modellabsatz: ${quantity} Verkaufseinheiten je Neuntagewoche. Kein gebuchter Verkauf.` };
  });
  channels.push(...readVenueServices(entry).map(service => ({ id: service.id, label: service.title, unit: service.unit, basis: 'fixed',
    quantity: .75, unitCopper: service.unitCopper, materialRatio: .1, lossRate: 0, source: service.source,
    note: 'Modellansatz für einen separat beauftragten Fremdgegenstand; keine zweite Berechnung der Herstellung bereits verkaufter Katalogware.' })));
  const scenario = sanitizeScenario({ id: entry.id, title: 'Der Sternenfang · Juwelier und Goldschmiede', contextId: 'gwynthor',
    tier: 'Gwynthors vornehmster Juwelier · Loer-Dienst', openDays: 6, assetValuesKnown: false,
    introduction: 'Veränderbare Modellrechnung für den Juwelierbetrieb vor einer noch nicht bezifferten Loer-Gewinnbeteiligung. Das eigene Bankgeschäft des Vetternzweigs ist nicht Teil dieser Rechnung.',
    workers, channels, overheads: [{ id: 'betrieb', label: 'Licht, Brennstoff, Reinigung, Verpackung und Kontorbedarf', weeklyCopper: 120 }],
    rentWeekly: 180, replacementWeekly: 100, householdWeekly: 80, levyRate: .02, churchEnabled: false, debt: 0, principalWeekly: 0,
    assumptions: [
      'Alle fünfzig Warenpreise und sechs Dienstleistungssätze stammen aus diesem Modul. Tausendertrennzeichen und Währungen werden durch die gemeinsame Preislogik ausgewertet.',
      'Offene Wochenansätze: je Ring 0,25, je Amulett 0,2, je weiterem Schmuckstück 0,15 und je Rohsteinangebot zwei Verkaufseinheiten. Besondere Prunkaufträge sind damit seltene rechnerische Anteile, keine wöchentlich garantierten Bestellungen.',
      '70 % Materialeinsatz für fertigen Schmuck und 1 % Warenschwund sind veränderbare Ansätze. Für Handelssteine bleibt der bisherige Beschaffungsansatz von 80 % des allgemeinen Standardpreises erhalten; höhere Ladenpreise erhöhen nicht still den angenommenen Einkaufspreis. Bereits eingepreiste Werkstattarbeit wird nicht zusätzlich als Dienstleistungsumsatz erfasst.',
      'Jede Dienstleistung hat 0,75 getrennte Fremdaufträge je Neuntagewoche und 10 % Verbrauchsmaterial. Zusätzlich benötigte Edelmetalle und Steine werden nicht als gesicherter Zusatzumsatz angenommen.',
      'Benannte Beschäftigte und Lehrlinge werden trotz mehrfacher Hierarchiekarten einmal berücksichtigt. Freie Stellen verursachen keinen Lohn. Die drei Brüder sind Modellinhaber; die gleichmäßige rechnerische Verteilung bestätigt keine privaten Eigentumsquoten.',
      'Lohn, Kost, Logis, Pacht, Rücklagen und Entnahmen sind Modellwerte. Weder Arbeitsverträge noch bestätigte Immobilienwerte oder Schulden werden daraus abgeleitet.',
      'Die Loer liefern Rohmaterial und sind am Ertrag beteiligt. Der unbekannte Beteiligungssatz bleibt ausdrücklich offen; der ausgewiesene Überschuss gilt vor dieser Beteiligung und ist kein frei zugesagtes Privatvermögen.',
      'Bankgeschäfte, Münzprägung und andere Häusererträge sind ausgeschlossen. Die Aurdden besitzen kein eigenes Münzprägerecht.',
      'Die Rechnung verwendet neun Tage pro Woche und verändert keine Spielkassen, Inventare oder Online-Bestände.'
    ] });
  return createPage(scenario);
}
