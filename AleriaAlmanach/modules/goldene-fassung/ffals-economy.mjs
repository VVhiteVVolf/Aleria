import { createPage, sanitizeScenario } from '../economy-calculator/economy-model.mjs';
import { buildVenueWorkforce } from '../economy-calculator/economy-venue-workforce.mjs';
import { FFALS_PEOPLE } from './ffals-people.mjs';

export function buildFfalsEconomyPage(entry) {
  const jewellery = entry.pages.find(page => page.commentThreadKey === 'goldene-fassung-juwelier').tradeCatalog.items;
  const workers = buildVenueWorkforce(entry, { owners: [FFALS_PEOPLE[0].name] });
  const scenario = sanitizeScenario({ id: entry.id, title: 'Die goldene Fassung · Juwelierbetrieb', contextId: 'gwynthor',
    tier: 'Gut gehendes bürgerliches Fachgeschäft', openDays: 6, assetValuesKnown: false,
    introduction: 'Vorläufige Modellrechnung des gewöhnlichen Juweliergeschäfts. Sechs Öffnungstage je Neuntagewoche; Absatz, Kosten und Vergütung sind veränderbare Ansätze. Unbekannte Vermögenswerte bleiben offen.',
    workers, channels: jewellery.map(item => ({ id: `absatz-${item.id}`, label: item.title, unit: item.unit, basis: 'fixed', quantity: .8,
      unitCopper: Number(item.priceMin.replace(',', '.')), materialRatio: .55, lossRate: .02,
      source: `Aktuelles Juweliersortiment · ${item.id}`, note: 'Modellansatz: durchschnittlich 0,8 beschriebene Verkaufseinheiten je Neuntagewoche. Änderungen der Auswahl erzeugen keine zusätzlichen Kunden.' })),
    overheads: [{ id: 'betrieb', label: 'Licht, Brennstoff, Reinigung und Verbrauchsmaterial', weeklyCopper: 12 }],
    rentWeekly: 12, replacementWeekly: 8, householdWeekly: 8, levyRate: .02,
    churchEnabled: false, debt: 0, principalWeekly: 0,
    assumptions: [
      'Warenpreise stammen aus den zwanzig gewöhnlichen Schmuckangeboten. Pro Stück sind durchschnittlich 0,8 Verkäufe je Neuntagewoche angesetzt; dies sind keine gebuchten Verkäufe.',
      '55 % Wareneinsatz und 2 % gewöhnlicher Schwund sind offene Ansätze. Gewöhnliche Zukäufe und eingekaufte Handwerksarbeit sind im Wareneinsatz enthalten.',
      'Die vier benannten Ladenrollen werden einmal berücksichtigt. Unbesetzte Fachstellen verursachen keinen Lohn; ihre Besetzung muss im Szenario gesondert ergänzt werden.',
      'Modelllöhne folgen den vorhandenen Rollenansätzen. Daraus entstehen keine Arbeitsverträge, Meisterqualifikationen oder privaten Eigentumsanteile.',
      'Die wechselnde Hehler- und Schwarzmarktauswahl wird ohne belegten Umsatz mit null Einnahmen angesetzt und nicht als sichere Finanzierung des Ladens verwendet.',
      'Pacht, laufende Kosten, Rücklage, Haushaltsentnahme und 2 % Betriebsabgabe sind veränderbare Modellannahmen. Eigentümer, Schulden und Immobilienwert sind nicht belegt.',
      'Die Rechnung verändert keine Spielkassen, Inventare oder Online-Bestände. Sie verwendet den gemeinsamen Kalender mit neun Tagen je Woche.'
    ] });
  return createPage(scenario);
}
