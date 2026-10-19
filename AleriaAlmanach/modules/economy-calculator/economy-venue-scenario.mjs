import { sanitizeScenario, calendarFactors } from './economy-model.mjs';
import { getVenueProfile } from './economy-venue-profiles.mjs';
import { readVenueOffers, readVenueServices } from './economy-venue-offers.mjs';
import { buildVenueChannels } from './economy-venue-channels.mjs';
import { buildVenueWorkforce } from './economy-venue-workforce.mjs';
import { common } from './economy-examples.mjs';

export function buildVenueScenario(entry, section, calendar) {
  const factors = calendarFactors(calendar), profile = { ...getVenueProfile(entry), weeksPerYear: factors.weeksPerYear };
  const offers = readVenueOffers(entry), services = readVenueServices(entry), workers = buildVenueWorkforce(entry, profile);
  const pets = workers.filter(worker => worker.kind === 'animal').reduce((sum, worker) => sum + worker.count, 0);
  const place = [...(section?.path || [])].includes('Gwynthor') ? 'gwynthor' : '';
  const assumptions = [...common,
    'Dieses Szenario wird aus der aktuellen Güterliste und Hierarchie dieses Orts aufgebaut. Freie Posten kosten keinen Lohn, unbenannte tatsächliche Rollen hingegen schon. Mehrfach genannte Personen werden einmal vergütet.',
    'Gelernte Rollen erhalten höhere Modelllöhne. Sie sind keine bestätigten Verträge. Sechs Diensttage und die betriebliche Öffnung werden getrennt gerechnet; Kost und Logis versorgen jeweils die einzelne Person.',
    'Preisspannen verwenden als offenen Ansatz die geometrische Mitte, niemals automatisch den Höchstpreis. Stückzahlen sind Absatzannahmen und keine behaupteten Verkäufe.',
    'Die Sachkosten, Pacht, Gebühren und Erneuerung sind offene Wochenansätze. Eine feste Kreditaufnahme oder ein Immobilienvermögen wird ohne belegte Beträge nicht erfunden.',
    ...(profile.commission ? [`Zusätzlich zum festen Geldlohn gehen angenommen ${profile.commission * 100} % der erfassten Gesellschaftsleistungen an die entsprechenden Beschäftigten. Dieser Anteil wird als Lohn abgezogen, nicht zusätzlich als Materialkosten.`] : []),
    ...(profile.corporateOwner ? ['Der Überschuss bleibt auf dem Besitz- beziehungsweise Betriebskonto ausgewiesen. Bezahlte Leitung ist bereits Personalaufwand; private Ausschüttungen und Eigentumsquoten werden damit nicht automatisch festgelegt.'] : []),
    ...(profile.note ? [profile.note] : [])
  ];
  return sanitizeScenario({ id: entry.id, title: entry.title, contextId: place, tier: profile.tier,
    introduction: `Betriebskalkulation für ${entry.title}. Angebot und Rollen stammen aus diesem Modul; Absatz, Lohnverträge und Kosten sind einzeln ausgewiesene Modellannahmen. ${profile.note || ''}`,
    seats: profile.seats || 0, turns: profile.turns || 1, occupancy: profile.occupancy || 0, openDays: factors.daysPerWeek,
    workers, channels: buildVenueChannels(offers, services, profile),
    overheads: [
      { id: 'operations', label: 'Brennstoff, Wasser, Reinigung, Kontor und laufende Reparaturen', weeklyCopper: profile.overhead },
      ...(pets ? [{ id: 'pets', label: `${pets} Haustiere · Futter und Pflege`, weeklyCopper: pets * .8 }] : []),
      ...(profile.breedingStockCount ? [{ id: 'horse-feed', label: `${profile.breedingStockCount} angenommene Zuchttiere · Futter`, weeklyCopper: profile.breedingStockCount * 4,
        note: 'Orientierung am Futteranteil des Viehmarkts. Stallarbeit wird nicht ein zweites Mal als fremde Lohnarbeit bezahlt.' }] : [])
    ], rentWeekly: profile.rent, replacementWeekly: profile.reserve, householdWeekly: profile.household,
    levyRate: .02, churchEnabled: false, churchRate: .1, debt: 0, principalWeekly: 0, assetValuesKnown: false, assumptions });
}
