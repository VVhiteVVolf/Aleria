const channel = (offer, quantity, profile, extra = {}) => ({ id: offer.id, label: offer.title, unit: offer.unit, unitCopper: offer.unitCopper,
  quantity, basis: 'fixed', materialRatio: profile.materialRatio, lossRate: 0, source: offer.source, stockUnits: offer.stockUnits,
  note: offer.range?.minCopper !== offer.range?.maxCopper ? 'Preisannahme: geometrische Mitte der ausgewiesenen Spanne; im Modell änderbar.' : '', ...extra });
const distribute = (offers, quantity, profile, extra = {}) => offers.map(offer => channel(offer, quantity / Math.max(offers.length, 1), profile, extra));

function walkInChannels(offers, profile) {
  const common = offers.filter(offer => offer.stockUnits == null);
  const food = common.filter(offer => offer.kind === 'food'), drinks = common.filter(offer => offer.kind === 'drink');
  const foodPerVisit = profile.kind === 'brewery' ? .25 : profile.kind === 'brothel' ? .35 : .65;
  const channels = [...distribute(food, foodPerVisit, profile, { basis: 'visits', lossRate: .05 }),
    ...distribute(drinks, 1.7, profile, { basis: 'visits', lossRate: .05 })];
  channels.push(...distribute(common.filter(offer => offer.kind === 'goods'), .08, profile, { basis: 'visits' }));
  for (const offer of offers.filter(offer => offer.stockUnits != null)) channels.push(channel(offer, offer.unit.includes('4 cl') ? .4 : .02, profile,
    { materialRatio: 0, note: 'Nur geretteter Altbestand: endlicher einmaliger Abverkauf, kein laufender Nachschub oder fiktiver neuer Einkauf.' }));
  return channels;
}

function manufacturedChannels(offers, profile) {
  const basic = offers.filter(offer => offer.unitCopper < (profile.kind === 'tailor' ? 250 : 2500));
  const expensive = offers.filter(offer => !basic.includes(offer));
  return [...distribute(basic, profile.salesPerWeek, profile), ...expensive.map(offer => channel(offer,
    offer.unitCopper > 10000 ? profile.luxuryAnnualSales / profile.weeksPerYear : .5 / Math.max(expensive.length, 1), profile,
    { materialRatio: offer.unitCopper > 10000 ? .78 : profile.materialRatio, note: 'Seltene Auftragsarbeit: Jahresabsatz gemittelt, keine wöchentliche Großbestellung zugesagt.' }))];
}

function serviceChannels(services, profile) {
  const pick = (pattern, id, quantity, ratio, extra = {}) => {
    const service = services.find(service => pattern.test(service.title));
    return service ? [channel(service, quantity, profile, { id, materialRatio: ratio, ...extra })] : [];
  };
  if (profile.kind === 'bath') return services.map(service => channel(service, (/Waschgang/.test(service.title) ? 12 : /Hausbad/.test(service.title) ? 9
    : /Private Wannen/.test(service.title) ? 2 : /Kräuter/.test(service.title) ? 1 : 3) / 24, profile, {
      basis: 'visits', note: /Kräuter/.test(service.title) ? 'Vollständiger Kräuterbadpreis; kein zusätzliches Haus- oder Wannenbad für denselben Gast.' : 'Anteil am angenommenen Besuchsaufkommen; Öl und Zusatztuch sind optionale Ergänzungen.' }));
  if (['entertainment', 'brothel'].includes(profile.kind)) return [
    ...pick(/Eine Stunde (?:zu zweit|hinter der Tür)/i, 'service-private', profile.privateHours, .08),
    ...pick(/Ein kurzer Aufenthalt/i, 'service-short', profile.shortVisits || 0, .08),
    ...pick(/Gesellschaft (?:am Tisch|im Salon)/i, 'service-company', profile.companionshipHours || 0, .03),
    ...pick(/Ein Tanz für den eigenen Tisch|Ein privater Tanz/i, 'service-dance', 6, .06),
    ...pick(/Tanzfolge zu zweit|Kleine Tanzfolge/i, 'service-pair-dance', 2, .06),
    ...pick(/Spielrunde/i, 'service-games', 10, .02),
    ...pick(/Privates Hinterzimmer|Ein Salon für die eigene Runde/i, 'service-conversation-room', 4, .08,
      { note: 'Eigene Gesprächs- oder Spielrunden; kein weiterer Raumposten für bereits enthaltene private Stunden.' }),
    ...pick(/Kammer für die Nacht|Eine ruhige Kammer/i, 'service-room', profile.roomNights || 0, .18,
      { note: 'Nur Übernachtungsgäste; kein zweiter Zimmerpreis für bereits enthaltene private Stunden.' })
  ];
  if (profile.kind === 'smith') return services.filter(service => /Schärfen|Riemen|Klinge richten|ausbeulen|Griffe/.test(service.title)).map(service => channel(service,
    /Schärfen/.test(service.title) ? 10 : 2, profile, { materialRatio: .18, note: 'Reine Reparaturaufträge. Angerechnete Prüf- und Entwurfsgebühren erzeugen keinen zweiten Umsatz.' }));
  return [];
}

function wholesaleChannels(offers, profile) {
  const beer = offers.find(offer => /flusshell|Goldschuppen/i.test(offer.title));
  const whisky = offers.find(offer => /Klingende Krone.*5 Jahre/i.test(offer.title));
  return [
    ...(beer && profile.beerWholesaleLitres ? [channel(beer, profile.beerWholesaleLitres, profile, { id: 'wholesale-beer', unit: 'Ein Liter · Händlervertrag',
      unitCopper: Math.round(beer.unitCopper * 2 * .6 * 100) / 100, materialRatio: .5,
      note: 'Offene Annahme eines Händlervertrags: 60 % des literbezogenen Ausschanktarifs. Kein weiterer Tresenverkauf derselben Lieferung.' })] : []),
    ...(whisky && profile.whiskyWholesaleLitres ? [channel(whisky, profile.whiskyWholesaleLitres, profile, { id: 'wholesale-whisky', unit: 'Ein Liter aus gereiftem Bestand · Händlervertrag',
      unitCopper: Math.round(whisky.unitCopper / .04 * .6 * 100) / 100, materialRatio: .6,
      note: 'Vertrieb aus bereits gereiften Beständen. Frisch gebrannter Whisky wird nicht sofort als fünfjähriger Whisky verkauft; langfristige Nachfüllung und gebundenes Kapital müssen gesondert geprüft werden.' })] : [])
  ];
}

export function buildVenueChannels(offers, services, profile) {
  let channels;
  if (['tailor', 'smith'].includes(profile.kind)) channels = [...manufacturedChannels(offers, profile), ...serviceChannels(services, profile)];
  else if (profile.kind === 'retail') channels = distribute(offers, profile.conversion, profile, { basis: 'visits', materialRatio: .64 });
  else if (profile.kind === 'stud') channels = offers.map(offer => channel(offer, (/Mischling/i.test(offer.title) ? profile.annualMixedSales : profile.annualBreedSales) / profile.weeksPerYear, profile,
    { materialRatio: .15, note: 'Angenommener Jahresverkauf, auf Wochen gemittelt. Zuchtbestand und Pferdeunterhalt stehen getrennt; Rasse, tatsächliche Verkaufstermine und erzielbarer Preis sind noch offen.' }));
  else channels = [...walkInChannels(offers, profile), ...serviceChannels(services, profile), ...wholesaleChannels(offers, profile)];
  for (const service of services) if (!channels.some(row => row.source === service.source)) channels.push(channel(service, 0, profile,
    { note: 'Alternatives Paket, angerechnete Gebühr oder noch offener Absatz. Kein zusätzlicher Umsatz für dieselbe bereits erfasste Leistung; Personal und konkrete Buchungen zuerst zuordnen.' }));
  return channels;
}
