import { realmsById, houseTitle, houseHref, placeHref, placeId } from './catalog.mjs';

const p = value => Array.isArray(value) ? value : value ? [value] : [];
export const realmMap = realm => ({ title: `Karte · ${realm.name}`, imageSrc: realm.map,
  imageAlt: `Vorhandene Übersichtskarte ${realm.name}; die Detailvermessung folgt`, href: `/Karten/karte.html?map=${realm.id}` });
export function territoryHouse(realm, t) {
  const source = realmsById.get(t.sourceRealmId) || realm;
  return realm.houses.find(h => h.familyId === t.familyId) || source.houses.find(h => h.familyId === t.familyId);
}
const familyCard = (realm, house, featured = false) => ({ familyId: house.familyId, name: houseTitle(house), imageSrc: house.crest, imageAlt: `Wappen ${houseTitle(house)}`,
  housePage: 'kleinehaeuser.html', href: houseHref(house), rank: house.culturalTitle ? `${house.rank} · ${house.culturalTitle}` : house.rank,
  seat: realm.settlementsById.get(house.seatId)?.name || '', liege: realm.housesById.get(house.liegeId) ? houseTitle(realm.housesById.get(house.liegeId)) : '',
  featured, featuredLabel: featured ? house.rank : '' });

export function createTerritoryArticle(realm, t) {
  const source = realmsById.get(t.sourceRealmId) || realm;
  const house = territoryHouse(realm, t), parent = realm.territoriesById.get(t.parentId);
  const seat = source.settlementsById.get(t.sourceId || house?.seatId);
  const root = t.level === 'realm', old = !!t.historical;
  const children = realm.territories.filter(c => c.parentId === t.id);
  const localHouses = t.level === 'seat' ? source.houses.filter(h => h.seatId === t.sourceId && h.familyId !== house?.familyId)
    : children.filter(c => !c.historical || realm.historical).map(c => territoryHouse(realm, c)).filter(Boolean).filter(h => h.familyId !== house?.familyId);
  const uniqueHouses = [...new Map(localHouses.map(h => [h.familyId, h])).values()];
  const groups = [];
  if (house) groups.push({ title: old ? 'Früheres Herrscherhaus' : t.occupied ? 'Überliefertes einheimisches Haus' : 'Herrschendes Haus', houses: [familyCard(source, house, true)] });
  if (t.id === 'goldmund-hausbereich-roden') groups.push({ title: 'Unterstellte Ministerialenhäuser', houses: [{
    familyId: 'haus-von-hochreuth', name: 'Haus von Hochreuth', imageSrc: '/Stammbäume/assets/images/houses/Goldmund/haus-von-hochreuth.png',
    imageAlt: 'Wappen Haus von Hochreuth', housePage: 'kleinehaeuser.html', seat: 'Burg Hochreuth · auf der Karte noch nicht verortet', rank: 'Ministerialer', liege: 'Haus Roden',
  }] });
  if (uniqueHouses.length) groups.push({ title: t.occupied ? 'Einheimische Häuser und Clans' : old ? 'Frühere örtliche Häuser' : 'Unmittelbare Häuser und Clans', houses: uniqueHouses.map(h => familyCard(source, h)) });
  const overview = root ? p(realm.context.introduction) : [
    old ? `${t.name} hatte zu ${realm.name} gehört. ${house ? `${houseTitle(house)} hatte hier den Rang ${house.rank} geführt.` : 'Die frühere persönliche Führung ist noch nicht benannt.'}`
      : t.occupied ? `${t.name} steht unter der Kontrolle der Triarchie. Die einheimischen Häuser stammen aus ${realmsById.get(t.originRealm)?.name || 'den eroberten Ländern'}. Ihre Einordnung belegt keine freiwillige Gefolgschaft.`
      : `${t.name} gehört zu ${realm.name}. ${house ? `${houseTitle(house)} führt hier den Rang ${house.rank}${t.seat ? ` mit Sitz in ${t.seat}` : ''}.` : 'Das übergeordnete Amt ist noch keinem benannten Haus zugewiesen.'}`,
  ];
  if (house?.liegeId && source.housesById.has(house.liegeId)) overview.push(`${old ? 'Unmittelbarer Lehnsherr war' : 'Unmittelbarer Lehnsherr ist'} ${houseTitle(source.housesById.get(house.liegeId))}.`);
  if (t.extent === 'urban') overview.push('Dieser Hausbereich liegt innerhalb der bestehenden Siedlung. Er bezeichnet örtliche Rechte und Dienste; ein zusätzliches Landschaftsgebiet ist damit nicht ausgewiesen.');
  if (house?.rankId === 'ministerial') overview.push('Das Ministerialenhaus versieht den Dienst innerhalb der übergeordneten Herrschaft. Eine eigenständige Landeshoheit ist damit nicht verbunden.');
  if (root && realm.notes) overview.push(...realm.notes.filter(note => !note.includes('Variante')));
  const history = root ? (realm.context.history || []).map(s => `${s.title}: ${s.text}`) : [];
  if (old && t.occupied) history.push(realm.id === 'deitheach' ? 'Deitheach war vor zwanzig Jahren von der Triarchie erobert worden. Diese Akte beschreibt die frühere Ordnung. Das heutige Schicksal einzelner Clans bleibt offen.' : 'Dieses Gebiet war dem Herkunftsland durch die Eroberung der Triarchie verloren gegangen. Die Besatzung wird in einer eigenen gegenwärtigen Herrschaftsakte geführt.');
  if (house?.formerSeat) history.push(`${houseTitle(house)} stammt aus ${house.formerSeat} und führte dort zuvor den Rang ${house.formerRank}. Der heutige Sitz liegt in ${t.seat}.`);
  const domainSeats = t.level === 'seat' ? [seat].filter(Boolean) : [];
  const links = children.map(c => c.id);
  const infobox = [{ title: old ? 'Frühere Herrschaft' : 'Herrschaft und Zugehörigkeit', rows: [
    { label: 'Einordnung', value: t.type }, { label: 'Land', value: realm.title, href: realm.territoriesById.get(realm.rootId).href },
    ...(house ? [{ label: old ? 'Früheres Haus' : 'Haus', value: houseTitle(house), href: houseHref(house) }, { label: 'Rang', value: house.rank }] : []),
    ...(t.seat ? [{ label: 'Sitz', value: t.seat, ...(seat ? { href: placeHref(source, seat) } : {}) }] : []),
    ...(parent ? [{ label: old ? 'Frühere Oberherrschaft' : 'Oberherrschaft', value: parent.name, href: parent.href }] : []),
    ...(t.occupied || realm.historical ? [{ label: 'Gegenwärtige Kontrolle', value: 'Triarchie', href: t.controlHref || realmsById.get('triarchie').territories[0].href }] : []),
    ...(t.mapRegionId && t.parentId !== t.mapRegionId && realm.territoriesById.has(t.mapRegionId) ? [{ label: 'Geographische Kartenregion', value: realm.territoriesById.get(t.mapRegionId).name }] : []),
  ] }];
  return { id: t.id, title: t.name, shortTitle: t.name, type: t.type, kicker: `${old ? 'Historische Herrschaft' : t.type} · ${realm.name}`,
    parentHref: parent?.href || `/Kontinente/${realm.continent}/${realm.continent}.html`, parentLabel: parent?.name || realm.continent,
    hierarchy: [{ type: 'Sammlung', name: 'Kontinente', slug: 'kontinente' }, { type: 'Kontinent', name: realm.continent, slug: realm.continent.toLowerCase() }, ...realm.ancestors(t).map(a => ({ type: a.type, name: a.name, slug: a.id }))],
    aliases: root ? [realm.id, ...(realm.aliases || [])] : [], crestSrc: t.banner || t.crest, crestAlt: `Herrschaftszeichen · ${t.name}`,
    map: realmMap(source), copy: { overview, history, culture: root ? (realm.context.themes || []).map(s => `${s.title}: ${s.text}`) : [],
      economy: [], defense: [], geography: [t.geography, ...(seat?.provisionalCoordinates ? ['Die Kartenposition dieses Sitzes ist vorläufig und wird mit der nächsten Detailkarte präzisiert.'] : [])].filter(Boolean) },
    infobox, families: groups,
    councilGroups: root && realm.id === 'triarchie' ? [{ title: 'Die drei unbenannten Machthaber', members: ['Korrumpierte Druidin', 'Totgeglaubter Heermeister', 'Dunkler Zauberer'].map(office => ({ office, name: '', note: 'Eigenname noch nicht überliefert.' })) }] : [],
    vassalGroups: [], domains: domainSeats.length ? [{ territoryId: t.id, title: old ? 'Früherer Herrschaftssitz' : 'Herrschaftssitz', sections: [{ title: 'Siedlung', placeIds: domainSeats.map(s => placeId(source, s)) }] }] : [], territoryLinks: links };
}
