import { buildWorkforce } from './economy-workforce.mjs';
import { sanitizeScenario } from './economy-model.mjs';
import { readVenueOffers, readVenueServices } from './economy-venue-offers.mjs';

export const common = [
  'Testmodell, keine bereits festgelegte Steuer- oder Lohnordnung. Die örtliche Rechts-, Besitz- und Pachtordnung muss aus dem jeweiligen Weltkontext stammen.',
  'Kartenpreise stammen aus dem jeweiligen Modul und sind selbst vorläufig. Absatz, Einkaufskostensätze, Löhne, Pacht, Besitzwerte und Kreditbedingungen sind veränderbare Annahmen.',
  'Eine Woche umfasst neun Tage, ein Monat vier Wochen und ein Jahr 52 Wochen. Gesellschaftliche Orientierung: drei Tage Arbeit, ein Tag frei, drei Tage Arbeit, zwei Tage frei. Reguläre Modellstellen rechnen mit sechs Diensttagen; Teilzeit und Ausbildung gesondert. Verträge und Ablösungen sind Modellannahmen.',
  'Kopfzahlen sind keine Vollzeitstellen: Ältere Angehörige, Kinder und Lehrlinge haben eigene Diensttage. Die Rechnung ersetzt keinen überschneidungsfreien Dienstplan; Familie und Ablösungen müssen tatsächliche Ruhezeiten ermöglichen.',
  'Geldlohn wird zusätzlich zu ausgewiesener Kost und einfachem Schlafplatz gezahlt. Kostansätze sind Einkaufskosten, keine verkauften Restaurantmahlzeiten.',
  'Der Einkaufsanteil enthält Anlieferung und vorgelagerte Einfuhrkosten. Verderb, Fassreste und Bruch erhöhen den Einkauf; örtliche Botengänge stehen gesondert unter Sachkosten.',
  '2 % auf Einnahmen und 10 % optionaler Kirchenbeitrag sind reine Testansätze, keine festgelegte Steuerordnung. Pacht und persönliche Abgaben werden getrennt geprüft; eine Weiterverpflichtung des Empfängers belastet den ursprünglichen Zahler nicht automatisch erneut.',
  'Zinsen sind Aufwand, Tilgung vermindert Schulden. Die Erneuerungsrücklage wird im Gewinn als Wertverzehr und in der Kasse einmal als gebundenes Geld gezeigt.',
  'Trinkgeld ist mangels belegter Hausregel nicht eingeplant. Familienentnahmen sind private Verwendung des Überschusses, keine zweite Lohnzahlung.',
  'Schwache und gute Wochen ändern die Nachfrage auf 70 % bzw. 125 %. Das sind Szenarien, keine statistischen Vertrauensintervalle; Kalenderhochrechnungen sind Jahresdurchschnitte.'
];

function priceIndex(entry) {
  const goods = readVenueOffers(entry), services = readVenueServices(entry);
  return {
    good(id, quantity, materialRatio, lossRate = 0.05, extra = {}) {
      const item = goods.find(item => item.itemId === id);
      return { id: `goods-${id}`, label: item?.title || id, basis: 'visits', quantity, unitCopper: item?.unitCopper || 0,
        unit: item?.unit || 'Portion', materialRatio, lossRate, source: `${entry.title} · Güterregister · ${id}`, ...extra,
        ...(!item ? { quantity: 0, note: 'Im aktuellen Angebot nicht mehr bepreist oder nicht erhältlich; kein angenommener Verkauf.' } : {}) };
    },
    service(title, quantity, materialRatio, extra = {}) {
      const item = services.find(item => item.title === title);
      return { id: item?.id || `service-missing-${title}`, label: title, basis: 'fixed', quantity, unitCopper: item?.unitCopper || 0,
        unit: item?.unit || 'Buchung', materialRatio, lossRate: 0, source: `${entry.title} · Dienstleistungsseite · ${title}`, ...extra,
        ...(!item ? { quantity: 0, note: 'Leistung im aktuellen Angebot nicht mehr bepreist; kein angenommener Umsatz.' } : {}) };
    }
  };
}

const cost = (id, label, weeklyCopper, note = '') => ({ id, label, weeklyCopper, note });
function base(entry) {
  return { id: entry.id, title: entry.title, contextId: 'gwynthor', workers: buildWorkforce(entry), levyRate: 0.02, churchEnabled: false, churchRate: 0.1, churchBasis: 'surplus',
    guildWeekly: 0, badDebtRate: 0.01, annualInterestRate: 0.08, debt: 0, principalWeekly: 0, assumptions: [...common], coverage: [] };
}

function durst(entry, calendar) {
  const p = priceIndex(entry), s = base(entry);
  return sanitizeScenario({ ...s, tier: 'Knapp und verschuldet', seats: 20, turns: 1.5, occupancy: 0.8, openDays: 8,
    introduction: 'Eine einzige angestellte Magd, fünf mitarbeitende Familienangehörige, zwanzig Plätze und keine Mietzimmer. Der Betrieb kann seine Tür offen halten, ohne der Familie angemessene Löhne zu erwirtschaften.',
    channels: [p.good('matrosenhappen', 0.2, 0.48), p.good('fischgerstentopf', 0.27, 0.5), p.good('hafensuppe', 0.22, 0.4), p.good('ganzer-hering', 0.12, 0.6),
      p.good('monatsfang', 0.04, 0.65, 0.08, { maxWeekly: 16 / (calendar.daysPerMonth / calendar.daysPerWeek), note: 'Annahme: höchstens 16 Portionen im Monat, auf vier Wochen gemittelt.' }),
      p.good('duennbier', 1.4, 0.5, 0.07), p.good('klosterbier', 0.45, 0.62, 0.07), p.good('wasser', 0.15, 0.15, 0.02), p.good('branntwein', 0.08, 0.6, 0.03)],
    overheads: [cost('feuer', 'Brennholz und Talglicht', 6), cost('wasser', 'Wassertragen, Seife und Wäsche', 2.5), cost('reparatur', 'Kleine Reparaturen und zerbrochenes Geschirr', 2),
      cost('lieferung', 'Örtliche Botengänge und Hafenlasten', 1.5), cost('bram', 'Bram · Futter und Pflege', 0.8), cost('gebuehr', 'Schankrecht und kleine feste Gebühren', 1)],
    rentWeekly: 5, debt: 900, principalWeekly: 1, replacementWeekly: 2, householdWeekly: 24,
    assets: { cash: 12, receivables: 6, building: 500, equipment: 90, inventory: 22 },
    assumptions: [...s.assumptions, '192 Besuche pro gewöhnlicher Woche: 20 Plätze × 1,5 Belegungen × 80 % × 8 Öffnungstage. Besuche sind keine unterschiedlichen Personen. Gute Auslastung garantiert keine angemessene Vergütung aller Familienarbeit.',
      'Annahme: 900 KT Restschuld zu 8 % pro Jahr. Der genaue Schuldenbetrag ist nicht überliefert. Haus und Einrichtung werden als bescheidener Besitz, der Baugrund als gepachtet gerechnet.',
      'Das private Wochenbudget von 24 KT versorgt fünf Familienangehörige; Carys erhält gesonderte Kost. Geldbeträge für Nia, Meleri und Dewi sind geringe Hausvergütungen, keine marktüblichen vollen Löhne.'],
    coverage: [{ id: 'haushilfe', label: 'Reinigung und Hausarbeit', workerIds: ['person-carys'], dailyHours: 6, shiftHours: 8 }] });
}

function kanne(entry) {
  const p = priceIndex(entry), s = base(entry);
  return sanitizeScenario({ ...s, tier: 'Solider Familienbetrieb', seats: 40, turns: 3, occupancy: 0.8, openDays: 9,
    introduction: 'Drei Inhaberfamilien, Küche, Zimmerdienst und eine kleine Hauswache. Alle tatsächlich in der Hierarchie geführten Menschen und Tiere werden berücksichtigt; doppelte Aufgaben erzeugen keine doppelten Löhne.',
    channels: [p.good('standard-01', 0.22, 0.46), p.good('standard-08', 0.08, 0.45), p.good('gerstenbruehe', 0.12, 0.4), p.good('merriks-rindertopf', 0.12, 0.48),
      p.good('hrolfs-schweinebauch', 0.08, 0.52), p.good('huehnerpastete', 0.12, 0.48), p.good('hirschbraten', 0.04, 0.56, 0.08),
      p.good('standard-12', 1, 0.5, 0.07), p.good('standard-13', 0.35, 0.57, 0.07), p.good('standard-17', 0.3, 0.6, 0.06),
      p.good('teyrngarch-brauerzunft-bier-hopfgold', 0.15, 0.64, 0.06), p.good('penderyn-brauer-destillierzunft-whisky-rhagorol', 0.02, 0.67, 0.02),
      p.service('Ein Bett in der geteilten Kammer', 6, 0.18, { basis: 'capacity', occupancy: 0.6, days: 9, note: 'Annahme: sechs Betten; keine Frühstücksleistung im Nachtpreis.' }),
      p.service('Eine Kammer für sich', 2, 0.18, { basis: 'capacity', occupancy: 0.6, days: 9, note: 'Annahme: zwei Einzelkammern; kein doppelt berechnetes Monatszimmer.' }),
      p.service('Die Drei Eichen', 1, 0.18, { basis: 'capacity', occupancy: 0.55, days: 9 }),
      p.service('Das Hinterzimmer für die eigene Runde', 12, 0.05), p.service('Ein warmer Zuber', 8, 0.45), p.service('Eine kleine Wäsche', 12, 0.3)],
    overheads: [cost('feuer', 'Küchenfeuer, Raumwärme, Talg und Lampen', 20), cost('wasser', 'Allgemeine Seife, Wasser und Hausreinigung', 7),
      cost('reparatur', 'Geschirr, Fasspflege und laufende Reparaturen', 10), cost('lieferung', 'Boten, Lieferung und Marktgänge', 5),
      cost('tiere', 'Carreg und Briwsion · Futter und Pflege', 2), cost('gebuehr', 'Schankrecht und feste Gebühren', 3), cost('kleidung', 'Dienstwäsche und Arbeitskleidung', 5)],
    rentWeekly: 16, badDebtRate: 0.025, debt: 1200, principalWeekly: 4, replacementWeekly: 10, householdWeekly: 75,
    assets: { cash: 300, receivables: 60, building: 6500, equipment: 900, inventory: 220 },
    assumptions: [...s.assumptions, '864 Besuche pro gewöhnlicher Woche: 40 Plätze × 3 Belegungen × 80 % × 9 Öffnungstage. Dies verteilt sich über den Tag; tatsächliche Laufkundschaft und Sitzzeiten bleiben zu prüfen.',
      'Nur die Zwei-Bett-Kammer ist konkret beschrieben; sechs geteilte Betten und zwei weitere Einzelkammern sind offen gekennzeichnete Kapazitätsannahmen.',
      'Keine zusätzliche Monatszimmer-Nachfrage eingeplant. Die Nachtpreise werden nicht zugleich mit einer Monatsmiete für dieselben Betten angesetzt.',
      '2,5 % der Zechen werden als endgültig erlassen oder uneinbringlich angenommen. Reine Stundungen bleiben Forderungen und sind kein endgültiger Verlust; ihr Bestand ist bei den Vermögenswerten ausgewiesen.',
      'Die Löhne von Eirian, Mair, Celyn und weiteren angestellten Verwandten werden regulär bezahlt. 75 KT privates Haushaltsbudget versorgen die drei Inhaber und die sechs Kinder; die ausgewiesene Personalkost wird nicht nochmals berechnet.',
      'Caradog fährt auf der Tiefenwyrm und steht nicht in der Diensthierarchie; er erzeugt hier keinen Personalaufwand.'],
    coverage: [{ id: 'wache', label: 'Tür- und Hofwache', workerIds: ['person-ketil', 'person-gwern', 'person-rhunel'], dailyHours: 18, shiftHours: 8 }] });
}

function rast(entry, calendar) {
  const p = priceIndex(entry), s = base(entry);
  const monthlySingle = p.service('Einzelkammer für einen Hausmonat', 12, 0.22, { basis: 'capacity', occupancy: 0.7, days: 9 });
  monthlySingle.unitCopper /= calendar.daysPerMonth;
  monthlySingle.label = 'Monats-Einzelkammern · anteilig je Nacht';
  const monthlyDouble = p.service('Doppelkammer für einen Hausmonat', 4, 0.24, { basis: 'capacity', occupancy: 0.65, days: 9 });
  monthlyDouble.unitCopper /= calendar.daysPerMonth;
  monthlyDouble.label = 'Monats-Doppelkammern · anteilig je Nacht';
  return sanitizeScenario({ ...s, tier: 'Gehobene Tafel und große Herberge', seats: 80, turns: 1.5, occupancy: 0.8, openDays: 9,
    introduction: 'Ein konservativer Rechenbestand von sechzig Kammern, acht Salons und insgesamt sechzig tätigen Personen. Gute Zutaten, Importweine und aufwendiger Dienst kosten deutlich mehr als in einer gewöhnlichen Hafenkneipe.',
    channels: [p.good('haus-lauchbruehe', 0.2, 0.52, 0.08), p.good('haus-wildpastete', 0.18, 0.59, 0.08), p.good('haus-ziegenkaese', 0.12, 0.57, 0.07),
      p.good('haus-lammkeule', 0.2, 0.59, 0.1), p.good('haus-rind-ale', 0.2, 0.59, 0.1), p.good('haus-forelle', 0.18, 0.62, 0.12),
      p.good('haus-hirschruecken', 0.15, 0.64, 0.1), p.good('haus-apfeltarte', 0.3, 0.5, 0.07), p.good('weinlaub-1734', 0.75, 0.67, 0.06),
      p.good('weissmann-weisswein', 0.5, 0.67, 0.06), p.good('import-penderyn-brauer-destillierzunft-whisky-penderyn', 0.08, 0.7, 0.02),
      p.service('Einzelkammer', 24, 0.23, { basis: 'capacity', occupancy: 0.45, days: 9 }), monthlySingle,
      p.service('Doppelkammer', 16, 0.26, { basis: 'capacity', occupancy: 0.4, days: 9 }), monthlyDouble,
      p.service('Suite Abendstern', 4, 0.3, { basis: 'capacity', occupancy: 0.3, days: 9 }),
      p.service('Gastpferd im Stall', 18, 0.5, { basis: 'capacity', occupancy: 0.45, days: 9 }), p.service('Kutschenplatz im Hof', 4, 0.12, { basis: 'capacity', occupancy: 0.4, days: 9 }),
      p.service('Privatsalon Grüne Laube', 4, 0.12, { maxWeekly: 8 * 9, note: 'Vier Salonabende pro Woche, getrennt vom Bankett- und Restaurantabsatz.' }),
      p.service('Bankett des Hauses', 24, 0.6, { maxWeekly: 48, note: 'Zwei vorbestellte Gesellschaften mit zwölf Gästen; nicht zusätzlich im Restaurantkorb gezählt. 78 KT pro Person.' }),
      p.service('Weinbegleitung zur Tafel', 12, 0.68, { note: 'Für einen Teil der Bankettgäste; diese Gläser sind nicht im Restaurantkorb enthalten.' }),
      p.service('Warmes Bad', 18, 0.4), p.service('Gästewäsche', 16, 0.3)],
    overheads: [cost('feuer', 'Grundwärme, Küchenfeuer, Kerzen und Lampen', 135), cost('haus', 'Hausreinigung, Schädlingsvorsorge und Grundwäsche', 50),
      cost('reparatur', 'Laufende Gebäude-, Geschirr- und Mobiliarreparaturen', 80), cost('lieferung', 'Örtliche Lieferannahme, Kontor und Botengänge', 35),
      cost('kleidung', 'Dienstkleidung und Präsentation', 30), cost('gebuehr', 'Schank-, Herbergs- und feste Stadtgebühren', 25), cost('feste', 'Zusätzliche Aushilfen für große Gesellschaften', 70)],
    rentWeekly: 60, badDebtRate: 0.015, debt: 18000, principalWeekly: 60, replacementWeekly: 180, householdWeekly: 280,
    assets: { cash: 12500, receivables: 4200, building: 850000, equipment: 65000, inventory: 16000 },
    assumptions: [...s.assumptions, '80 Speiseplätze sind eine Annahme. Bei 80 % Auslastung und 1,5 Belegungen ergeben sich 864 Restaurantbesuche pro Woche; die Salons werden gesondert genutzt. Das setzt entsprechend zahlungskräftige Nachfrage voraus.',
      '60 tätige Personen einschließlich Inhaber und Ausbildung: alle benannten Dienstposten und ergänzende anonyme Lohngruppen. Ausdrücklich freie Einzelstellen bleiben unbesetzt.',
      'Von genau 60 angenommenen Kammern sind 36 Einzelkammern, 20 Doppelkammern und vier Suiten. 12 Einzel- und vier Doppelkammern sind ausschließlich im Monatssegment; dieselbe Kammer wird niemals zweimal vermietet.',
      'Zimmerpreise enthalten Frühstück. Dieses wird weder als zusätzlicher Umsatz noch als Restaurantgast erfasst; Frühstückszutaten, Gastwäsche und Verbrauchsmittel sind im direkten Zimmeraufwand enthalten. Reinigungslöhne stehen nur in der Lohnliste.',
      'Bei Importwaren umfasst der Einkaufsanteil Fracht, Zoll und Händlerspanne bis zur Tür. Höhere Verderb- und Schankverluste bilden frische Spitzenware und angebrochene Weine ab.',
      'Pacht meint hier den Baugrund, nicht nochmals das seit Jahrhunderten gehaltene Haus. Kredit und Besitzwerte sind offene Modellannahmen. 280 KT private Haushaltsentnahme decken den Vann-Haushalt außerhalb der separat ausgewiesenen Geldlöhne.'] });
}

export function buildEconomyExamples(entries, calendar) {
  const [small, normal, lavish] = entries;
  return [durst(small, calendar), kanne(normal), rast(lavish, calendar)];
}

export function buildExampleScenario(entry, calendar) {
  if (entry.id === 'gwynthor-zum-kleinen-durst') return durst(entry, calendar);
  if (entry.id === 'modul-1781474092957') return kanne(entry);
  if (entry.id === 'celtigerns-letzte-rast') return rast(entry, calendar);
  return null;
}
