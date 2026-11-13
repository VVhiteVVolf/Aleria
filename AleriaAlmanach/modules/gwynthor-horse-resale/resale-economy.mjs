import { createPage, sanitizeScenario } from '../economy-calculator/economy-model.mjs';
import { readVenueOffers } from '../economy-calculator/economy-venue-offers.mjs';
import { RESALE_PEOPLE } from '../../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
export function buildResaleEconomy(entry) {
  const workers = RESALE_PEOPLE.map((p, index) => ({ id: p.id, name: p.name, role: p.title, areas: ['Familienbetrieb'], count: 1,
    kind: index === 0 ? 'owner' : index === 5 ? 'apprentice' : 'family', days: 6, dailyCash: index === 0 ? 0 : index === 5 ? 1 : 2,
    fairDaily: index === 5 ? 2 : 4, boardDays: 9, boardDaily: .5, lodgingWeekly: 1, ownerShare: index === 0 ? 1 : 0,
    source: 'Familie Ruddgraen · benannte Mitarbeit', note: index === 5 ? 'Lernende Hilfe unter Aufsicht; kein zweiter voller Facharbeiterlohn.' : 'Offener Modellansatz für Familienarbeit, keine bestätigte Einkommensakte.' }));
  return createPage(sanitizeScenario({ id: entry.id, title: 'Zum Schiefen Nagel · Betriebsrechnung', contextId: 'gwynthor', tier: 'Kleiner günstiger Weiterverkauf', openDays: 6,
    workers, assetValuesKnown: false, channels: readVenueOffers(entry).map(offer => ({ id: `absatz-${offer.itemId}`, label: offer.title, unit: offer.unit,
      basis: 'fixed', quantity: offer.itemId.startsWith('horse-') ? 0 : 4, unitCopper: offer.unitCopper, materialRatio: .65, lossRate: .01, source: offer.source,
      note: offer.itemId.startsWith('horse-') ? 'Ein einzelnes Pferd: kein wiederkehrender Wochenabsatz.' : 'Veränderbare Ankauf-/Absatzannahme pro Neuntagewoche.' })),
    introduction: 'Kleine Modellrechnung für Ankäufe, Weiterverkauf und sechs mithelfende Familienangehörige. Keine eigene Zucht und kein Zubehörverkauf.',
    overheads: [{ id: 'betrieb', label: 'Einstreu, Wasser, Fachbesuche und Kleinbedarf', weeklyCopper: 18 }], rentWeekly: 25,
    replacementWeekly: 15, householdWeekly: 35, levyRate: 0, churchEnabled: false,
    assumptions: ['180 KT für das laufende Angebot liegen im Handelsregisterrahmen des schlichten Arbeitsgauls von 100–600 KT. Einzelpreise bilden Alter, begrenzte Ausbildung und unbekannte Herkunft ab.',
      'Ankaufskosten, vorübergehende Futterhaltung und Pflege sind im Beschaffungsanteil enthalten. Es gibt keine Einnahmen aus Zucht, Deckdiensten oder Sattlerei.',
      'Vier durchschnittliche Verkäufe pro Neuntagewoche sind eine veränderbare Nachfrageannahme. Benannte Einzelpferde werden nicht jede Woche erneut verkauft.',
      'Die sechs benannten Angehörigen werden je einmal gezählt. Geteilte Abendkontrollen erzeugen keinen siebten Beschäftigten; Fachbesuche stehen im Betriebsbudget.',
      'Kost, Logis, kleine Geldzahlungen, Pacht und Rücklagen sind Modellwerte. Tatsächliche Abgaben, Eigentumswerte und Schulden sind noch nicht beziffert; Null hebt keine Verpflichtung auf.',
      'Keine automatische Änderung von Pferden, Kassen, Inventaren oder Familienverhältnissen.'] }));
}
