// Operating assumptions, not additions to the fictional employee registry.
// All volumes are per 9-day week. Long-lived luxury stock sells infrequently.
export const VENUE_PROFILES = {
  'zum-roten-tor': { kind: 'inn', tier: 'Bodenständiger Landgasthof und Herberge', owners: ['Carwyn Penrudd', 'Olwen'], household: 54, rent: 12, overhead: 36, reserve: 10,
    seats: 36, turns: 1.65, occupancy: .75, materialRatio: .52,
    note: 'Der Gasthof besitzt eine eigene ausgearbeitete Kalkulationsseite mit sechs Kammern, zehn Gastpferdeplätzen, bezahlten Hoflieferungen und Teilzeit-Familienarbeit. Der Lieferhof ist kein Teil seiner Belegschaft.' },
  'goettliche-eleganz': { kind: 'tailor', tier: 'Schneiderei und Maßarbeit', owners: ['Eleonora Cassia Raves'], household: 27, rent: 18, overhead: 26, reserve: 12,
    salesPerWeek: 6, materialRatio: .55, luxuryAnnualSales: .25,
    note: 'Sechs gewöhnliche Garnituren pro Woche plus seltene Einzelaufträge sind ein offener Ansatz für die wenigen besetzten Werkstattposten; freie Schneiderstellen werden nicht als kostenlose Produktionskapazität verwendet.' },
  'gwynthor-zum-vollen-korb': { kind: 'retail', tier: 'Gemischtwarenhandel', owners: ['Cadwgan Pendrwn', 'Idwal Pendrwn'], household: 54, rent: 12, overhead: 20, reserve: 6,
    seats: 70, turns: 1, occupancy: .8, conversion: .55, materialRatio: .64 },
  'gwynthor-badehaus-fontani': { kind: 'bath', tier: 'Badehaus mit Heiz- und Wasserwerk', owners: ['Cassiano Lucius Fontani'], household: 27, rent: 14, overhead: 40, reserve: 12,
    seats: 28, turns: 1, occupancy: .8, materialRatio: .22 },
  'gwynthor-gestiefelte-muschi': { kind: 'entertainment', tier: 'Unterhaltung, Gesellschaft und Ausschank', owners: ['Helviane Desele'], household: 50, rent: 24, overhead: 55, reserve: 18,
    seats: 48, turns: 1.8, occupancy: .8, materialRatio: .48, privateHours: 24, companionshipHours: 36, roomNights: 15, commission: .45 },
  'gwynthor-zum-letzten-heller': { kind: 'brothel', tier: 'Einfache Kammern und kleine Schankwirtschaft', owners: ['Alasdair Cneacail'], household: 27, rent: 8, overhead: 18, reserve: 5,
    seats: 24, turns: 1.5, occupancy: .8, materialRatio: .45, privateHours: 38, shortVisits: 48, commission: .5 },
  'zum-dritten-funken': { kind: 'smith', tier: 'Werkstatt, Aufträge und Verkauf', owners: ['Gethin Gofrann', 'Bleddyn Gofrann'], household: 54, rent: 20, overhead: 95, reserve: 35,
    salesPerWeek: 7, materialRatio: .4, luxuryAnnualSales: .2 },
  'gwynthor-zur-klingenden-krone': { kind: 'brewery', tier: 'Gildenbetrieb mit Brauerei und Destillerie', owners: [], corporateOwner: 'Betriebskasse · Klingende Krone', household: 0, rent: 32, overhead: 110, reserve: 45,
    seats: 64, turns: 2, occupancy: .8, materialRatio: .48, beerWholesaleLitres: 1200, whiskyWholesaleLitres: 4,
    note: 'Finlay ist bezahlte Leitung. Eigentums- und Gewinnquoten zwischen ihm und der Gilde sind nicht festgelegt; der Überschuss bleibt zunächst als unverteilte Betriebskasse ausgewiesen.' },
  'die-lachende-nixe': { kind: 'entertainment', tier: 'Gehobene Gesellschaft, Herberge und kleine Küche', owners: ['Albrecht Sonnenfels'], household: 45, rent: 28, overhead: 65, reserve: 22,
    seats: 40, turns: 1.8, occupancy: .8, materialRatio: .48, privateHours: 24, companionshipHours: 32, roomNights: 18, commission: .5 },
  'herberge-bei-owains-anwesen': { kind: 'inn', tier: 'Herberge im Bannkreis', owners: [], corporateOwner: 'Owains Anwesen · Besitzkonto', household: 0, rent: 8, overhead: 16, reserve: 5,
    seats: 24, turns: 2, occupancy: .75, materialRatio: .43, modelStaff: [['Herbergsleitung', 1, 6], ['Küche', 1, 7], ['Ausschank und Empfang', 1, 4.5], ['Kammern und Reinigung', 1, 3]],
    note: 'Die vorhandenen Hierarchieknoten sind unbenannte Vorlagen. Vier anonyme Modellstellen dienen der Rechnung und legen keine neuen Figuren oder tatsächlich besetzten Ämter fest. Zimmerpreise fehlen; Übernachtungen bringen hier noch keinen angesetzten Umsatz.' },
  'modul-1781813764249': { kind: 'stud', tier: 'Gestüt und mehrjährige Pferdezucht', owners: [], corporateOwner: 'Owains Anwesen · Besitzkonto', household: 0, rent: 18, overhead: 55, reserve: 20,
    materialRatio: .55, annualMixedSales: 4, annualBreedSales: 2, breedingStockCount: 12,
    modelStaff: [['Gestütsverwaltung', 1, 7], ['Gestütsmeister', 1, 9], ['Pferdepflege und Ausbildung', 2, 5.5], ['Stall- und Futterdienst', 2, 4.5]],
    note: 'Die Hierarchie enthält noch allgemeine Gilden- und Gerichtsvorlagen, keine belegte Gestütsbelegschaft. Sechs anonyme Modellstellen, zwölf Zuchttiere und die jährlichen Verkäufe sind ausdrückliche Annahmen. Die weite Preisspanne ist keine Zusage, regelmäßig Spitzenpferde zu verkaufen.' },
  'zum-roten-drachen-taverne': { kind: 'brewery-inn', tier: 'Taverne, Herberge und Hausbrauerei', owners: ['Egan Gochwyr', 'Mairead Gochwyr'], household: 54, rent: 18, overhead: 45, reserve: 15,
    seats: 48, turns: 2.5, occupancy: .8, materialRatio: .45, beerWholesaleLitres: 180,
    personAliases: { 'Tavernen Köchin': { name: 'Catrin Gochwyr', role: 'Tavernen-Köchin' } },
    note: 'Die angebotenen Zimmer besitzen noch keinen eindeutigen Preis in der Güterliste. Dafür wird kein erfundener Zimmerumsatz eingesetzt. Die Brauerei liefert zusätzlich eine offen angenommene Menge im regionalen Vertrieb.' }
};

export const COMPARISON_IDS = ['gwynthor-zum-kleinen-durst', 'modul-1781474092957', 'celtigerns-letzte-rast'];
export const getVenueProfile = entry => VENUE_PROFILES[entry.id] || { kind: 'retail', tier: 'Örtlicher Verkaufsbetrieb · erste Annahmen', owners: [], household: 0,
  rent: 10, overhead: 15, reserve: 5, seats: 30, turns: 1, occupancy: .7, conversion: .5, materialRatio: .6,
  note: 'Neuer Verkaufsort: Absatz, Personalverträge und Kosten müssen an diesen Betrieb angepasst werden.' };
