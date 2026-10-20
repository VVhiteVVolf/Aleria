import { createPage, sanitizeScenario, calendarFactors } from '../economy-calculator/economy-model.mjs';
import { readVenueOffers, readVenueServices } from '../economy-calculator/economy-venue-offers.mjs';
import { buildVenueWorkforce } from '../economy-calculator/economy-venue-workforce.mjs';
import { getVenueProfile } from '../economy-calculator/economy-venue-profiles.mjs';
import { TOR_CAPACITY } from './tor-rooms.mjs';
import { TOR_SERVICES } from './tor-services.mjs';
import { TOR_WORKING_PEOPLE, penruddPerson } from './tor-people.mjs';

// More choice redistributes the same .84 food portions per visit. It does not
// create additional customers or a full serving of every new dish per guest.
const mealShares = Object.freeze({ hofbrot: .09, lauchgerstensuppe: .04, 'roter-tortopf': .12,
  'huhn-wurzelsud': .06, kohlpfanne: .06, rinderbraten: .025, 'apfel-haferauflauf': .055, fuhrmannsbeutel: .05,
  'apfel-haferbrei': .07, 'hofeier-speck': .07, 'dickmilch-beeren': .04,
  'bohnen-speckpfanne': .08, schweineschulter: .04, 'flussfisch-wurzeln': .04 });

function torGoodsChannels(entry) {
  const offers = readVenueOffers(entry), ordinary = offers.filter(offer => offer.category === 'getraenke'), imports = offers.filter(offer => offer.category === 'importbiere');
  return offers.map(offer => {
    const foodShare = mealShares[offer.itemId], imported = offer.category === 'importbiere';
    if (foodShare == null && !imported && offer.category !== 'getraenke') throw Error(`Absatzansatz fehlt für ${offer.title}`);
    const quantity = foodShare ?? (imported ? 1.7 * .2 / imports.length : 1.7 * .8 / ordinary.length);
    return { id: `tor-gut-${offer.itemId}`, label: offer.title, unit: offer.unit, unitCopper: offer.unitCopper,
    basis: 'visits', quantity,
    materialRatio: foodShare != null ? .52 : imported ? .62 : .48, lossRate: .05,
    maxWeekly: offer.itemId === 'rinderbraten' ? 18 : null, source: offer.source,
    note: offer.itemId === 'rinderbraten' ? 'Höchstens 18 Portionen an einem angekündigten Bratentag je Neuntagewoche. Ohne Lieferung ist der Absatz auf null zu setzen.'
      : imported ? 'Ein Fünftel des unveränderten Getränkemengenansatzes entfällt auf Zunftbier. Einkauf und Lieferung sind im höheren Materialanteil enthalten.'
        : 'Änderbarer Anteil je Schankbesuch; Hoflieferungen und weitere Einkäufe sind im Wareneinsatz enthalten.' };
  });
}

function torServiceChannels(entry, days) {
  const offers = readVenueServices(entry);
  const plans = [
    ['einzelkammer', TOR_CAPACITY.singleRooms, .65, .18], ['doppelkammer', TOR_CAPACITY.doubleRooms, .65, .18],
    ['gastpferd', TOR_CAPACITY.horseStalls, .55, .62], ['wagenplatz', TOR_CAPACITY.wagonSpaces, .45, .10],
    ['gepaeck', 8, null, .05], ['waesche', 8, null, .12]
  ];
  return plans.map(([id, quantity, occupancy, materialRatio]) => {
    const definition = TOR_SERVICES.find(service => service.id === id), offer = offers.find(offer => offer.title === definition.title);
    if (!offer) throw Error(`Bepreiste Leistung fehlt: ${id}`);
    return { id: `tor-dienst-${id}`, label: offer.title, unit: offer.unit, unitCopper: offer.unitCopper,
      basis: occupancy == null ? 'fixed' : 'capacity', quantity, occupancy: occupancy ?? 1, days,
      maxWeekly: occupancy == null ? null : quantity * days, materialRatio, lossRate: 0, source: offer.source,
      note: id === 'gastpferd' ? 'Futter und Einstreu sind enthalten und werden nicht nochmals als eigenes Futterpaket verkauft.'
        : /kammer/.test(id) ? 'Belegte Kammern, nicht einzelne Betten. Frühstück ist nicht enthalten; keine doppelte Zimmer- oder Frühstückseinnahme.'
          : 'Annahme für tatsächlich getrennt gebuchte Leistungen; keine automatische Buchung für jeden Übernachtungsgast.' };
  });
}

function torWorkforce(entry, profile) {
  const names = new Set(TOR_WORKING_PEOPLE.map(person => person.name));
  return buildVenueWorkforce(entry, profile).map(worker => {
    if (!names.has(worker.name) || worker.kind === 'owner') return worker;
    return { ...worker, kind: 'family', days: worker.name === penruddPerson('cerys').name ? 3 : 6,
      note: worker.name === penruddPerson('cerys').name ? 'Drei angenommene Teilzeit-Diensttage; Betreuung von Rhys wird abgestimmt.' : 'Vergütete Familienarbeit; gewöhnliche persönliche Kost und Logis zusätzlich angesetzt.' };
  });
}

export function buildTorEconomyPage(entry, calendar) {
  const factors = calendarFactors(calendar), profile = getVenueProfile(entry);
  const scenario = sanitizeScenario({ id: entry.id, title: entry.title, tier: 'Bodenständiger Landgasthof und Herberge', contextId: '',
    introduction: 'Modellrechnung für den Gasthof vor Gwynthors Nordtor. Acht erwachsene Familienmitglieder arbeiten hier; der Lieferhof bleibt ein eigener Betrieb. Nachfrage, Verträge und Besitzwerte sind noch keine erhobenen Geschäftszahlen.',
    seats: TOR_CAPACITY.seats, turns: profile.turns, occupancy: profile.occupancy, openDays: factors.daysPerWeek,
    workers: torWorkforce(entry, profile), channels: [...torGoodsChannels(entry), ...torServiceChannels(entry, factors.daysPerWeek)],
    overheads: [
      { id: 'feuer-wasser', label: 'Brennholz, Wasser und Beleuchtung', weeklyCopper: 18 },
      { id: 'hausunterhalt', label: 'Reinigung, kleine Reparaturen und Lieferfahrten', weeklyCopper: 18 }
    ], rentWeekly: profile.rent, replacementWeekly: profile.reserve, householdWeekly: profile.household,
    levyRate: .02, badDebtRate: .005, churchEnabled: false, churchRate: .1, debt: 0, principalWeekly: 0, assetValuesKnown: false,
    assumptions: [
      'Neun Tage je Woche, 36 Tage je Monat, 13 Monate und 52 Wochen je Jahr stammen aus dem gemeinsamen Weltkalender. Die Herberge öffnet täglich; reguläre Diensttage werden in der Familie versetzt frei genommen.',
      '36 Schankplätze mit 1,65 Belegungen und 75 % Auslastung, 65 % Zimmerbelegung und 55 % Stallbelegung sind veränderbare Annahmen für einen gut besuchten Gasthof. Stadtnachfrage und Gwynthorer Lebenshaltung werden dem Umland nicht automatisch gleichgesetzt.',
      'Acht aktive Erwachsene werden je einmal erfasst, auch wenn sie in mehreren Personalreiter erscheinen. Cerys arbeitet modellhaft drei Tage. Drei freie Stellen kosten keinen Lohn und schaffen keine zusätzliche Arbeitsleistung.',
      'Carwyn und Olwen erhalten keine zusätzliche feste Lohnzeile: ihre gemeinsame Haushaltsentnahme beträgt modellhaft 54 KT pro Woche. Sie umfasst ihren Unterhalt sowie den Anteil der Kinder und des Altenteils. Die sechs übrigen mitarbeitenden Erwachsenen erhalten die ausgewiesene Familienvergütung und persönliche Kost/Logis.',
      'Gwilym, Enid und die vier Kinder sind keine regulären Arbeitskräfte. Tudur, Bethan, Meurig, Nia, Gethin, Eluned und die Hofkinder gehören nicht zur Herbergsbelegschaft. Ihre Lieferungen werden über die Materialkosten bezahlt, nicht über zusätzliche Lohnzeilen.',
      'Die Einkaufsanteile enthalten Lebensmittel und Futter bis zum Haus einschließlich bezahlter Hoflieferungen. Gewöhnlicher Schwund wird beim Ausschank und bei Speisen berücksichtigt; es gibt keinen Magiebonus und keine kostenlose Vollversorgung vom Hof.',
      'Die größere Karte verteilt weiterhin 0,84 Speisenportionen und 1,7 Getränke je Besuch auf mehr Auswahl. 20 % der Getränkemenge sind günstige Zunftbiere mit höherem Einkaufsanteil. Neue Gerichte und Importe erzeugen weder zusätzliche Gäste noch zusätzliche Dienststellen.',
      'Zwei Einzel- und vier Doppelkammern ergeben sechs vermietbare Kammern beziehungsweise zehn Betten. Frühstück ist ein eigener Speisenkauf. Stalltarif und Wareneinsatz enthalten Heu, gewöhnlichen Hafer, Wasser und Einstreu; kein zweites Futterangebot für dieselbe Nacht.',
      'Der Bratenabsatz ist auf 18 Portionen pro Neuntagewoche begrenzt. Erhält das Haus kein Rind, muss diese Menge auf null gesetzt werden. Die Jahresprojektion kennt noch keine Ernte-, Wetter- oder Festtagssaison.',
      '12 KT Wochenpacht, 36 KT laufende Sachkosten, 10 KT Erneuerungsrücklage und 2 % Betriebsabgabe sind offene Ansätze. Ein Grundstückseigentümer, bestätigter Pachtvertrag, Schuldstand oder vorhandenes Vermögen wird daraus nicht behauptet. Die Kirchenabgabe bleibt optional.',
      'Das Szenario verändert weder Karten, Spielerkassen, Warenpreise noch Online-Bestände. Überschuss ist Betriebsergebnis vor späteren Verwendungen und keine festgestellte private Vermögenssumme.'
    ] });
  return createPage(scenario);
}
