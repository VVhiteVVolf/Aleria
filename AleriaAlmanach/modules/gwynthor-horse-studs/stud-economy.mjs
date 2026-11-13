import { createPage, sanitizeScenario } from '../economy-calculator/economy-model.mjs';
import { rolePay } from '../economy-calculator/economy-venue-workforce.mjs';
import { readVenueOffers } from '../economy-calculator/economy-venue-offers.mjs';
import { studDepartments } from './stud-hierarchy.mjs';
export function buildStudEconomy(entry, venue, people) {
  const premium = venue.key === 'rhosmere';
  const workers = studDepartments(venue).flatMap(group => group.roles.filter(r => !r.contract).map(r => {
    const person = r.principal ? people.find(p => p.id === (r.principal === 'owner' ? venue.ownerId : venue.wifeId)) : null;
    const owner = !premium && r.principal === 'owner', pay = rolePay(r.title, group.label);
    return { id: `${venue.key}-${r.id}`, name: person?.name || 'Geplante Modellbesetzung', role: r.title, areas: [group.label], count: r.count,
      kind: owner ? 'owner' : pay.kind || 'employee', days: pay.days || 6, dailyCash: owner ? 0 : pay.dailyCash, fairDaily: pay.dailyCash,
      ownerShare: owner ? 1 : 0, boardDays: 9, boardDaily: .5, lodgingWeekly: 1, anonymous: !person,
      source: `Vorgesehene Rolle · ${group.label}`, note: person ? 'Modellansatz für die benannte Aufgabe.' : 'Rechnerisch besetzter Personalbedarf; die Silhouettenrolle ist weiterhin ohne benannte Figur und ohne tatsächlichen Arbeitsvertrag.' };
  }));
  if (premium) workers.push({ id: 'gildenbetrieb', name: 'Rhosmeres Rösser', role: 'Gildenbetrieb · keine zusätzliche Arbeitskraft', areas: ['Betrieb'], kind: 'owner', count: 0, days: 0, dailyCash: 0, fairDaily: 0, ownerShare: 1 });
  const offers = readVenueOffers(entry);
  const channels = offers.map(offer => { const unique = /horse-/.test(offer.itemId), accessory = offer.category === 'sattlerei';
    const quantity = unique ? 0 : accessory ? 4 : /ceffyl/.test(offer.itemId) ? .05 : /rhyfel/.test(offer.itemId) ? 2 : 1.5;
    return { id: `absatz-${offer.itemId}`, label: offer.title, unit: offer.unit || '1 Stück', basis: 'fixed', quantity, unitCopper: offer.unitCopper,
      materialRatio: accessory ? .55 : premium ? .7 : .6, lossRate: .01, source: offer.source,
      note: unique ? 'Einmaliges Exemplar: kein wiederkehrender Wochenabsatz. Bei Bedarf einmalig separat modellieren.' : 'Veränderbare Absatzannahme pro Neuntagewoche; keine gebuchte Bestellung.' };
  });
  return createPage(sanitizeScenario({ id: entry.id, title: `${venue.title} · Betriebsrechnung`, contextId: 'gwynthor', openDays: 6,
    tier: premium ? 'Ausgewählte Gildenqualität' : 'Familienbetrieb mit eigener Aufzucht', assetValuesKnown: false, workers, channels,
    introduction: 'Offene Modellrechnung für Personal, Pferdehandel und Sattlerei. Die vorgesehenen Rollen werden für den Personalbedarf rechnerisch besetzt; daraus entstehen keine Figuren oder Verträge.',
    overheads: [{ id: 'rossarzt', label: 'Vertragliche Rossarztbesuche · Modellbudget', weeklyCopper: premium ? 90 : 60 },
      { id: 'betrieb', label: 'Einstreu, Wasser, Brennstoff, Werkzeug und Verwaltung', weeklyCopper: premium ? 220 : 160 }],
    rentWeekly: premium ? 150 : 0, replacementWeekly: premium ? 150 : 100, householdWeekly: premium ? 0 : 90,
    levyRate: 0, churchEnabled: false, debt: 0, principalWeekly: 0,
    assumptions: ['Alle Preise werden aus den Angeboten dieses Moduls gelesen. Die Pferdepreise beruhen auf dem Handelsregister beziehungsweise dem bestehenden Nachzuchtrechner.',
      'Benannte Einzelpferde sind endliche Angebote und haben deshalb keinen automatisch wiederkehrenden Wochenabsatz. Rasseangebote und Zubehör bleiben nachlieferbar.',
      'Die Modellbesetzung der vorgesehenen Stellen macht den Personalbedarf sichtbar; Silhouetten bleiben unbesetzte Figurenplätze. Löhne, Kost und Logis sind veränderbare Rechenansätze.',
      'Material- und Beschaffungsanteile enthalten die angesetzte Aufzucht beziehungsweise den Einkauf der verkauften Pferde. Interne Futterlieferungen und Partnerhofleistungen erzeugen keinen zweiten Verkaufsumsatz.',
      'Die tatsächlichen Pacht-, Abgaben- und Gewinnbeteiligungen von Haus Wyrm, anderen Lehnsherren und Partnerhöfen sind noch nicht beziffert. Der Überschuss gilt vor diesen offenen Ansprüchen. Null im Eingabefeld hebt keine Verpflichtung auf.',
      premium ? 'Der Betrieb und sein Ergebnis gehören zur Gilde. Maelrig ist angestellter Standortleiter; Kyria ist die Finanzverwalterin. Ihre Ehe macht sie nicht zu Eigentümern der Niederlassung.' : 'Gorweth führt den Familienbetrieb. Die Modellinhaberzuordnung legt keine neuen Eigentumsquoten innerhalb der Familie fest.',
      'Pacht, Erneuerungsrücklage, Entnahmen und Rossarztbudget sind Modellwerte; keine bestätigten Schulden oder Immobilienwerte werden daraus abgeleitet.',
      'Neun Tage je Woche. Keine automatische Veränderung von Pferden, Spielkassen oder Inventaren.'] }));
}
