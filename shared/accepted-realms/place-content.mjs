import { realmsById, houseTitle, houseHref, placeId } from './catalog.mjs';

export function createAcceptedPlace(realm, seat) {
  const origin = realmsById.get(seat.originRealm) || realm;
  const territory = realm.territoriesById.get(`${realm.id}-sitz-${seat.id}`);
  const residents = realm.houses.filter(h => h.seatId === seat.id);
  const ruler = residents.find(h => h.isSeatRuler);
  const region = realm.territoriesById.get(`${realm.id}-region-${seat.county || seat.province}`);
  const type = /Burg|Broch/.test(seat.kind || '') ? 'Burg' : 'Stadt';
  const old = realm.historical;
  const hierarchy = [{ type: 'Kontinent', name: origin.continent, slug: origin.continent.toLowerCase() },
    { type: 'Land', name: origin.name, slug: origin.id },
    ...(region ? [{ type: region.type, name: region.name, slug: region.id }] : []), { type: 'Siedlung', name: seat.name, slug: seat.id }];
  const introduction = [`${seat.name} ${old ? 'war ein Sitz' : 'ist ein Sitz'} in ${origin.name}. ${ruler ? `${houseTitle(ruler)} ${old ? 'hatte' : 'führt'} hier den Rang ${ruler.rank}${old ? ' geführt' : ''}.` : 'Die namentliche örtliche Führung ist noch offen.'}`];
  const history = old ? ['Der Ort hatte zum eigenständigen Fürstentum Deitheach gehört. Vor zwanzig Jahren war das Land unter die Herrschaft der Triarchie geraten. Die frühere Einwohner- und Hausordnung ist damit nicht automatisch die heutige.']
    : realm.occupied ? [`Der Ort hatte zu ${origin.name} gehört und steht heute unter der Besatzung der Triarchie. Die Zugehörigkeit der einheimischen Familien ist keine Aussage freiwilliger Gefolgschaft.`]
    : ['Gründungsjahr und eine eigene Ortschronik sind noch nicht überliefert. Die örtliche Herrschaftszuordnung ist bereits festgehalten.'];
  const crest = territory.banner || ruler?.crest || realm.crest;
  return { meta: { id: placeId(realm, seat), title: `${seat.name} – Aleria`, type, status: 'Draft', template: 'grossstadt', storage: { document: placeId(realm, seat) } },
    name: seat.name, hierarchy, canonicalPath: hierarchy.map(h => h.name).join(' > '),
    parentage: { kingdom: origin.name, county: region?.name || origin.title, domain: territory.name, region: region?.name || territory.name, settlement: seat.name,
      liege: ruler ? houseTitle(ruler) : 'Noch nicht benannt' }, navigation: { parentHref: territory.href, parentLabel: territory.name },
    features: { districts: type === 'Stadt', noticeBoard: true, militaryView: true, personalitiesCollapsed: true },
    presentation: { motto: '', mottoSource: '', images: {
      'icon-png': { src: crest, alt: `Zeichen · ${seat.name}` },
      'wappen-banner-png': { src: crest, alt: `Herrschaftszeichen · ${seat.name}`, href: territory.href },
      'karten-bild-png': { src: realm.map, alt: `Übersichtskarte ${realm.name}; keine Stadtvermessung`, href: `/Karten/karte.html?map=${realm.id}`, fit: 'contain' },
      'regionen-karte-png': { src: realm.map, alt: `Lage von ${seat.name} in ${realm.name}`, href: `/Karten/karte.html?map=${realm.id}`, fit: 'contain' },
    } },
    structure: { einwohner: 'Noch nicht erfasst', bevölkerung: 'Noch nicht erfasst', gründungsjahr: 'Nicht überliefert',
      regierung: old ? 'Historische Herrschaftsordnung' : realm.occupied ? 'Besatzung durch die Triarchie' : ruler ? houseTitle(ruler) : 'Führung offen',
      religion: 'Örtliche Ausprägung offen', wirtschaft: 'Einzelne Betriebe noch nicht erfasst', militär: 'Stärke noch nicht erfasst',
      regierungstyp: old ? 'Frühere Lehnsordnung' : realm.occupied ? 'Besatzung' : ruler?.rankId === 'ministerial' ? 'Ministerialendienst' : 'Örtliche Lehnsverwaltung',
      gewerbe: 'Noch nicht einzeln erfasst', 'bekannte familien': residents.map(houseTitle).join(', ') || 'Noch nicht bestätigt',
      stände: 'Noch nicht einzeln erfasst', einwohnerzahl: 'Noch nicht erfasst', ritter: 'Stärke offen', waffenknechte: 'Stärke offen',
      ortswache: 'Stärke offen', flotte: 'Nicht belegt', 'sonstiges aufgebot': 'Nicht erfasst',
      bedrohungen: realm.occupied || old ? 'Herrschaft der Triarchie' : 'Örtliche Gefahren noch nicht erfasst', ressourcen: 'Noch nicht ortsbezogen erfasst' },
    sections: { introduction, background: history, location: [seat.geography || `Der Sitz liegt in ${region?.name || origin.name}.`,
      ...(seat.provisionalCoordinates ? ['Die Position auf der Übersichtskarte ist vorläufig. Eine genaue Vermessung wird später ergänzt.'] : [])],
      administration: [`Die zuständige Herrschaft ist ${territory.name}. Gericht, Abgaben, Aufgebot und Gesandtschaften werden über deren Ämter mit der übergeordneten Ebene verbunden. Konkrete Amtsinhaber sind noch nicht benannt.`],
      conflicts: realm.occupied || old ? history : ['Eigene örtliche Streitfälle und Bündnisse sind noch nicht überliefert.'], history,
      houses: [residents.length ? `${old ? 'Früher zugeordnete' : 'Zugeordnete'} Häuser: ${residents.map(houseTitle).join(', ')}.` : 'Eine aktuelle ansässige Familie ist noch nicht bestätigt.'],
      population: ['Einwohnerzahl, Berufsgruppen und Haushalte werden später einzeln erfasst.'], newspaper: ['Örtliche Bekanntmachungen werden hier gesammelt.'],
      region: [region?.name || origin.title], culture: [origin.context.introduction || `Der Ort gehört zur kulturellen Überlieferung ${origin.name}.`],
      districts: ['Stadtviertel sind noch nicht einzeln benannt.'], builtEnvironment: ['Bauwerke und Einrichtungen werden innerhalb dieses Orts angelegt, sobald Namen und Funktionen feststehen.'],
      military: [ruler?.warrior?.className ? `Die Hausdarstellung der ${ruler.name} zeigt einen ${ruler.warrior.className}. Daraus wird keine Truppenstärke abgeleitet.` : 'Truppenstärken und örtliche Dienste bleiben offen.'],
      economy: ['Märkte, Güter, Zölle und Gewerbe sind noch nicht ortsbezogen erfasst.'], trivia: [seat.mapName || seat.mapLabel || seat.sourceName ? `Ältere Kartenbeschriftung: ${seat.mapName || seat.mapLabel || seat.sourceName}.` : ''] },
    houses: [{ title: old ? 'Frühere Häuser' : realm.occupied ? 'Einheimische Häuser unter Besatzung' : 'Ansässige Häuser', items: residents.map(h => ({ familyId: h.familyId, name: houseTitle(h), rank: h.rank, seat: seat.name,
      liege: realm.housesById.get(h.liegeId) ? houseTitle(realm.housesById.get(h.liegeId)) : '', emblem: h.crest, href: houseHref(h) })) }],
    merchants: [], personalities: [] };
}
