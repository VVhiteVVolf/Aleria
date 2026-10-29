import { realmsById, houseTitle } from './catalog.mjs';
import { housePlacement, houseTerritory } from './house-placement.mjs';

const relative = value => value?.startsWith('/') ? `..${value}` : value || '';
const join = paragraphs => paragraphs.filter(Boolean).join('\n\n');

// Facts are shared with territorial and genealogical adapters; prose stays here.
export function createAcceptedHouseContent(realm, house) {
  const origin = realmsById.get(house.originRealm) || realm;
  const seat = realm.settlementsById.get(house.seatId);
  const territory = houseTerritory(realm, house);
  const placement = housePlacement(realm, house);
  const liege = realm.housesById.get(house.liegeId);
  const old = realm.historical;
  const name = houseTitle(house);
  const rank = house.culturalTitle ? `${house.rank} · ${house.culturalTitle}` : house.rank;
  const overview = [
    `${name} ${old ? 'hatte' : 'hat'} seinen ${old ? 'früheren ' : ''}Sitz in ${seat.name} ${old ? 'gehabt' : ''} und ${old ? 'hatte' : 'führt'} den Rang ${rank}${old ? ' geführt' : ''}. ${house.clan ? 'Der Clan gehört' : 'Das Haus gehört'} zur überlieferten Hauslandschaft ${origin.name === 'Weisenfluh' ? 'Weisenfluhs' : `von ${origin.name}`}.`,
    house.knownDescription || '',
    liege ? `${old ? 'Unmittelbarer Lehnsherr war' : 'Unmittelbarer Lehnsherr ist'} ${houseTitle(liege)}.` : house.id === realm.ruler ? `${name} ${old ? 'hatte die oberste weltliche Führung des Landes getragen' : 'trägt die oberste weltliche Führung des Landes'}.` : 'Die örtliche Stellung ist zugeordnet; eine noch nicht benannte Zwischeninstanz der Oberherrschaft bleibt offen.',
    house.cadetOf ? `Der Clan ist ein Kadettenclan der ${houseTitle(realm.housesById.get(house.cadetOf))}. Eine konkrete genealogische Verbindung wird ergänzt, sobald sie überliefert ist.` : '',
  ];
  const history = [house.knownHistory || '',
    house.formerSeat ? `${name} stammt aus ${house.formerSeat}, wo der Clan zuvor den Rang ${house.formerRank} geführt hatte. Heute sitzt er in ${seat.name} im freien Iathneach.` : '',
    old ? 'Deitheach war vor zwanzig Jahren von der Triarchie erobert worden. Die hier beschriebene Rang- und Sitzordnung hatte vor der Eroberung bestanden. Ob Angehörige Widerstand leisten, vertrieben wurden oder sich gefügt haben, bleibt offen.'
      : realm.occupied ? `Die Heimat dieses ${house.clan ? 'Clans' : 'Hauses'} war aus ${origin.name} herausgelöst und von der Triarchie besetzt worden. Die Herkunftszuordnung bleibt erhalten. Der überlieferte Rang macht das Haus nicht zu einem freiwilligen Vasallen der Besatzer.`
      : `Die Einordnung des Hauses folgt dem bestätigten Sitz ${seat.name} und der dortigen Herrschaftsordnung. Gründungsjahr und frühe Oberhauptfolge sind noch nicht überliefert.`,
    house.knownDescription ? 'Die bereits angelegte Familienakte bewahrt ihre Angehörigen, Beziehungen, Lebensdaten und Verbindungen zu anderen Häusern.' : 'Die Familienakte ist für die spätere Genealogie vorbereitet. Namentlich unbekannte Vorfahren, Eheverbindungen und Nachkommen sind noch nicht eingetragen.',
  ];
  const holdings = [
    `${seat.name} ${old ? 'hatte den örtlichen Mittelpunkt gebildet' : 'bildet den örtlichen Mittelpunkt'}. ${seat.geography || ''}`,
    territory.extent === 'urban' ? 'Der Hausbereich liegt innerhalb der vorhandenen Stadt. Seine örtlichen Rechte und Dienste begründen kein zusätzliches flächiges Lehen.' : house.rankId === 'ministerial' ? 'Das Haus versieht Ministerialendienst in der übergeordneten Herrschaft. Konkrete Güter, Abgaben und Dienstpflichten sind noch einzeln festzulegen.' : 'Einzelne Dörfer, Höfe, Zölle und Einkünfte sind noch nicht benannt. Die zugeordnete Herrschaftsseite hält den räumlichen Zusammenhang fest.',
    seat.provisionalCoordinates ? 'Die eingezeichnete Burgposition ist eine vorläufige Verortung innerhalb der bestätigten Provinz.' : '',
  ];
  const heraldry = [house.motif || house.warrior?.motif ? `Das Wappen zeigt: ${house.motif || house.warrior.motif}` : 'Das übernommene Wappen bleibt das verbindliche Hauszeichen. Eine ausgeschriebene Blasonierung ist noch zu ergänzen.',
    house.palette?.length ? `Die Farbgebung verwendet ${house.palette.join(', ')}.` : '', house.ornament ? `Die Fassung wird durch ${house.ornament} geprägt.` : ''];
  const military = [
    house.warrior?.className ? `Die zugeordnete Hausdarstellung zeigt einen ${house.warrior.className}. Sie veranschaulicht das Haus und seine Ausrüstung; sie ist keine namentlich belegte Person und legt keine Stärke des Aufgebots fest.` : '',
    house.warrior?.equipment || '', house.warrior?.reason || '',
    realm.id === 'moinneach' && ['cethrenn', 'barrex', 'rowak'].includes(house.id) ? '' : house.warrior?.resourceBasis || '',
    'Truppenstärken, Besoldung und die persönlichen Ausbildungen einzelner Angehöriger bleiben gesondert zu erfassen.',
  ];
  const relations = [liege ? `${name} ${old ? 'war' : 'ist'} ${houseTitle(liege)} unmittelbar zugeordnet.` : `Die übergeordnete Landeszugehörigkeit ist ${origin.title}.`,
    house.cadetOf ? 'Das Verhältnis zum Fürstenclan ist als Kadettenbeziehung vermerkt; eine erfundene Abstammungsfolge wird daraus nicht abgeleitet.' : '',
    house.identityReferences?.length ? 'Angehörige oder gleichnamige Hausbezüge sind bereits in anderen öffentlichen Familienakten überliefert. Diese Gegenstellen bleiben an ihren bestehenden Personenkennungen erhalten.' : '',
    realm.occupied ? 'Die gegenwärtige Besatzungsmacht wird getrennt von den früheren Lehnsbindungen geführt.' : 'Justiz, Abgaben, Aufgebot und Gesandtschaften verbinden das örtliche Haus mit den jeweiligen übergeordneten Ämtern.',
    realm.id === 'goldmund' && house.id === 'roden' ? 'Haus von Hochreuth dient den Roden als Ministerialenhaus und ist ihrem Lehnsverband in Thronholt zugeordnet.' : ''];
  const summary = { overview: join(overview), history: join(history), character: join(heraldry), holdings: join(holdings),
    culture: `${house.clan ? 'Die albische Clanzugehörigkeit' : 'Die regionale Hauszugehörigkeit'} bleibt in Namen und Hauszeichen erkennbar. Eigene Bräuche, Schutzgottheiten und Glaubensämter sind noch nicht gesondert belegt.`, relations: join(relations), influence: [rank, `${old ? 'Früherer Sitz' : 'Sitz'}: ${seat.name}`, ...(liege ? [`Lehnsbindung: ${houseTitle(liege)}`] : [])] };
  const heads = (house.knownHeads || []).map(h => ({ ...h, image: relative(h.image), role: h.status === 'alive' ? 'Amtierendes Hausoberhaupt' : 'Früheres Hausoberhaupt' }));
  const currentHead = heads.find(h => house.knownHeads.find(k => k.id === h.id)?.status === 'alive')?.name || 'Noch nicht benannt';
  return { id: house.familyId, name, type: house.clan ? 'Clan' : house.rankId === 'knightly-order' ? 'Ritterorden' : 'Adelshaus', page: 'kleinehaeuser.html', registerPage: true,
    prepared: true, contentVersion: 'accepted-realms-20261029a', biographySourceRevision: house.knownHeads ? 2 : 1,
    county: placement.county || origin.name, countyLabel: 'Region', liege: liege ? houseTitle(liege) : house.id === realm.ruler ? 'Landesherrliches Haus' : 'Zwischeninstanz offen', parentHouseId: liege?.familyId || '',
    territoryId: territory.id, territoryName: territory.name, territoryHref: territory.href, extinct: false, showMotto: false, omitMilitaryProfile: true,
    currentHead, firstHeir: house.firstHeir || 'Noch nicht benannt', biographyIntroTitle: `${name} · Stellung und Sitz`, biographyHistoryTitle: old ? 'Die frühere Hausgeschichte' : 'Hausgeschichte und Überlieferung', biographySummary: summary,
    hierarchy: [{ type: 'Kontinent', name: origin.continent, slug: origin.continent.toLowerCase() }, { type: 'Land', name: origin.name, slug: origin.id },
      ...(placement.county ? [{ type: 'Region', name: placement.county, slug: house.regionId }] : []), { type: 'Sitz', name: seat.name, slug: seat.id }, { type: 'Haus', name, slug: house.familyId }],
    profile: { highestTitle: rank, rank, houseType: house.rankId === 'ministerial' ? 'Ministerialenhaus' : house.clan ? 'Adliger Clan' : 'Adelshaus', motto: '', seat: seat.name,
      affiliation: origin.title, liege: liege ? houseTitle(liege) : house.id === realm.ruler ? 'Landesherrliches Haus' : 'Zwischeninstanz offen', people: house.clan ? 'Alben' : origin.id === 'goldmund' ? 'Alwener' : origin.id === 'aldingen' ? 'Aldinger' : 'Weisenfluher', origin: origin.name, patronDeities: 'Noch nicht überliefert',
      patron: 'Nicht belegt', knightingPatron: 'Nicht überliefert', founding: 'Nicht überliefert',
      milestoneOne: old || realm.occupied ? 'Eroberung durch die Triarchie vor zwanzig Jahren' : house.formerSeat ? 'Verlust von ' + house.formerSeat : 'Noch nicht überliefert',
      milestoneTwo: 'Noch nicht überliefert', wealth: 'Eigene Einkünfte noch nicht erfasst', religion: 'Hausglaube noch nicht ausgearbeitet',
      allies: 'Keine eigenen Bündnisse belegt', enemies: 'Keine persönliche Fehde belegt' },
    sections: { overview, history, traditions: heraldry, knighthood: military, holdings,
      cultureReligion: [summary.culture], conflictsAlliances: relations, values: ['Hausmotto und ausdrücklich überlieferte Leitwerte sind noch offen.'],
      court: ['Die Hofämter werden nach der gemeinsamen Hausordnung geführt. Noch nicht benannte Amtsinhaber bleiben als unbesetzte Ämter sichtbar.'],
      familyTree: [house.knownHeads ? 'Der bestehende Stammbaum bleibt mit allen überlieferten Angehörigen erhalten.' : 'Die Familienakte ist angelegt. Namen, Lebensdaten, Elternschaften und Ehen werden erst nach belegter Ausarbeitung ergänzt.'],
      historicalFigures: ['Weitere namentlich belegte Hausangehörige werden mit der Familienakte verknüpft.'] },
    images: { crest: relative(house.crest), scene: relative(house.warrior?.image), sceneAlt: `Hausdarstellung · ${name}`, banner: relative(territory.banner || house.crest) },
    illustrationCategory: 'Hausdarstellung', warriorGallery: { title: `Kriegerdarstellung · ${name}`, introduction: join(military), entries: [{ id: `${house.familyId}-krieger`, name: house.warrior?.className || 'Hausritter', image: relative(house.warrior?.image), fullsize: relative(house.warrior?.fullsize), description: house.warrior?.equipment || '', links: [
      ...(house.warrior?.classHref ? [{ label: 'Klassenprofil ' + house.warrior.className + ' ↗', href: '/' + house.warrior.classHref.replace(/^(?:\.\.\/|\/)+/, '') }] : []),
      ...(house.warrior?.bestiary ? [{ label: 'Pferderasse im Bestiarium ↗', href: '/' + house.warrior.bestiary.replace(/^(?:\.\.\/|\/)+/, '') }] : []),
    ] }] },
    relatedRecords: (house.identityReferences || []).map(ref => ({ title: ref.familyTitle || ref.familyId, text: 'Öffentliche Gegenstelle eines überlieferten Hausbezugs; keine zusätzlich erfundene Verwandtschaft.', link: '/Stammbäume/Stammbaum.html?family=' + encodeURIComponent(ref.familyId) + '&mode=view', icon: '' })),
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png' }, allies: [],
    cadets: realm.houses.filter(h => h.cadetOf === house.id).map(h => ({ id: h.familyId, name: houseTitle(h), image: relative(h.crest) })),
    founder: null, heads, heirs: house.knownHeirs || [], offices: [], figures: [], figuresTitle: 'Überlieferte Angehörige',
    trivia: [house.culturalTitle ? `Kulturelle Eigenbezeichnung: ${house.culturalTitle}.` : '', old ? 'Der Verlust des Landes bedeutet nicht, dass der Clan ausgestorben ist.' : '', house.id === 'sonnenfels' ? 'Die Verbindung zur Lachenden Nixe in Gwynthor bleibt im Stammbaum erhalten.' : ''].filter(Boolean),
  };
}
