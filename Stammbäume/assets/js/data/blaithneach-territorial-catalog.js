// Quellen und Gegenaktenaudit: assets/data/source-inventories/blaithneach-2026-10-07.json.
const regionEmblem = slug => `assets/images/regions/Blaithneach/${slug}.png`;
const sourceRef = (id, nameRow, seatRow, emblemRow, column = 0) => Object.freeze({
  id, nameRow, seatRow, emblemRow, column
});

export const BLAITHNEACH_EMBLEM = regionEmblem('blaithneach');
export const BLAITHNEACH_TERRITORIES = Object.freeze([
  {
    id: 'tir-na-beatha', name: 'Tir na Beatha', gloss: 'Land des Lebens', seat: 'Sioran',
    rulingFamilyId: 'haus-nessa',
    description: 'Land des Lebens · Sitz Sioran · Mor-Tiarna-Clan Ard’Nessa. An’Haeghra sitzt in Réadlann und ist durch Donnaghs Baronsamt als Dún-Tiarna-Clan belegt.'
  },
  {
    id: 'tir-na-dilse', name: 'Tir na Dílse', gloss: 'Land der Treue', seat: 'Eorach',
    rulingFamilyId: 'haus-ronain',
    description: 'Land der Treue · Sitz Eorach · Fürstenclan Mac Ard’Ronain. Die einzelne Geographieangabe „Sioran“ ist gegenüber Steckbrief, Reichsübersicht und Clan-Sitzzeile ein Vorlagenrest. Die Überlebenden von Dal’Leite siedelten nach Ceitheachs Niedergang nach Ardán über; dieselbe Familienakte ist in beiden Fürstentümern eingetragen.'
  },
  {
    id: 'tir-na-meinnear', name: 'Tir na Méinnear', gloss: 'Land der Erze', seat: 'Cairmor',
    rulingFamilyId: 'haus-magach',
    description: 'Land der Erze · Sitz Cairmor · Mor-Tiarna-Clan Sidhe’Magach. Ua’Eala ist als Laird-Clan in Cel Bearradh belegt.'
  }
].map(territory => Object.freeze({ ...territory, emblem: regionEmblem(territory.id) })));

export const BLAITHNEACH_HOUSE_DEFINITIONS = Object.freeze([
  {
    slug: 'nessa', name: 'Ard’Nessa', emblemSlug: 'ard-nessa', territoryId: 'tir-na-beatha',
    rankId: 'mor-tiarna', seat: 'Sioran', source: sourceRef('tir-na-beatha', 78, 76, 77),
    sourceNote: 'Die Region schreibt Ard Nessa, die Reichsübersicht Ard’Nessa; beide verwenden dasselbe Wappen. Rioghbhár Nessa ist Mor Tiarna. Conchobhars Barons- und Bhaltos’ Lairdamt begründen keine weiteren Familienakten.'
  },
  {
    slug: 'goidin', name: 'Ua’Goidin', emblemSlug: 'ua-goidin', territoryId: 'tir-na-beatha',
    rankId: 'laird', seat: 'Sioran', source: sourceRef('tir-na-beatha', 82, 80, 81, 0),
    sourceNote: 'Bairrfhionn Goidin ist als Laird von Sioran und Herold genannt.'
  },
  {
    slug: 'haeghra', name: 'An’Haeghra', emblemSlug: 'an-haeghra', territoryId: 'tir-na-beatha',
    rankId: 'dun-tiarna', seat: 'Réadlann', source: sourceRef('tir-na-beatha', 82, 80, 81, 1),
    sourceNote: 'Die Clanlisten schreiben Haeghra, die Amtstabellen Heaghra. Donnagh ist Dún Tiarna, Déaglán Laird von Réadlann; dies erzeugt keine zweite Familie. Die Familienquelle vom 08.10.2026 bestätigt Donnagh (*1672), Marwines Ehemann in Teyrngarch, als Haeghra: Personen- und Welt-ID bleiben erhalten, die Hauszuordnung ist abgeglichen. Déaglán (1625–1684) bleibt vom heutigen Amtsträger (*1695) getrennt.'
  },
  {
    slug: 'ronain', name: 'Mac Ard’Ronain', emblemSlug: 'mac-ard-ronain', territoryId: 'tir-na-dilse',
    rankId: 'ard-tiarna', seat: 'Eorach', source: sourceRef('tir-na-dilse', 75, 73, 74),
    administrativeRole: 'Fürstenclan von Blaithneach und Mor-Tiarna-Clan von Tir na Dílse',
    sourceNote: 'Cailte Ronain ist Fürst, Traolach Ronain Mor Tiarna von Eorach. Fionnógs Barons- und Cains Lairdamt erzeugen keine getrennten Linien. Eorach folgt Steckbrief, Reichsübersicht und Clan-Sitzzeile; Sioran im Geographieabschnitt ist ein Kopierrest.'
  },
  {
    slug: 'suiste', name: 'Ua’Suiste', emblemSlug: 'ua-suiste', territoryId: 'tir-na-dilse',
    rankId: 'laird', seat: 'Eorach', source: sourceRef('tir-na-dilse', 79, 77, 78, 0),
    sourceNote: 'Maoldònaich Suiste ist als Laird von Eorach genannt.'
  },
  {
    slug: 'gairner', name: 'Dal’Gáirnér', emblemSlug: 'dal-gairner', territoryId: 'tir-na-dilse',
    rankId: 'laird', seat: 'Eorach', source: sourceRef('tir-na-dilse', 79, 77, 78, 1),
    sourceNote: 'Goraidh Gáirnér ist Laird und Marschall. Bestehende Gegenakten schreiben teilweise Gáirner; die Ziel-ID haus-gairner bleibt erhalten.'
  },
  {
    slug: 'leite', name: 'Dal’Leite', territoryId: 'tir-na-dilse',
    rankId: 'laird', seat: 'Ardán', source: sourceRef('tir-na-dilse', 79, 77, 78, 2),
    createFamily: false, familyId: 'haus-dal-leite', houseId: 'house-dal-leite',
    emblem: 'assets/images/houses/Ceitheach/clan-dal-leite.png',
    sourceNote: 'Nutzerkorrektur vom 07.10.2026: Nach Ceitheachs Niedergang siedelten die Überlebenden nach Blaithneach über; Dal’Leite soll vorerst in beiden Fürstentümern geführt werden. Dieselbe Akte haus-dal-leite erhält einen weiteren Registereintrag als Laird in Ardán; die Mor-Tiarna-Zuordnung in Greinmhar und alle 73 Personen bleiben unverändert. Gillesbuig in der neuen Amtstabelle und Gilleasbuig Leite (1670) in Nic Blar werden ohne neue Genealogie nicht automatisch zusammengeführt.'
  },
  {
    slug: 'cleirigh', name: 'Faill’ Cléirigh', emblemSlug: 'faill-cleirigh', territoryId: 'tir-na-dilse',
    rankId: 'unknown', seat: 'Eorach', houseStatus: 'expelled', source: sourceRef('tir-na-dilse', 85, 83, 84, 0),
    preparationNote: 'Ausgestoßener Clan; Pailtéar Cléirigh ist in der Ceinselaig-Gegenakte lebend überliefert.',
    sourceNote: 'Nutzerkorrektur vom 07.10.2026: als ausgestoßen führen. Dies ersetzt die Reichsangabe „Ausgestorben“ und präzisiert die Regionalkategorie „Ausgestorben/ Ausgestoßen“. Pailtéar Cléirigh (1698) bleibt in der Ceinselaig-Akte mit identischer Welt-ID lebend. Historischer Rang bleibt offen; kein Ausgestorben-Flag und kein Endknoten.'
  },
  {
    slug: 'abhrach', name: 'Ui’Abhrach', emblemSlug: 'ui-abhrach', territoryId: 'tir-na-dilse',
    rankId: 'unknown', seat: 'Eorach', extinct: true, source: sourceRef('tir-na-dilse', 85, 83, 84, 1),
    sourceNote: 'Die Reichsübersicht bezeichnet den Clan eindeutig als ausgestorben; die Region verwendet eine gemeinsame Kategorie für ausgestorbene und ausgestoßene Clans. Historischer Rang und Erlöschenszeitpunkt bleiben offen; keine erfundene letzte Erbperson.'
  },
  {
    slug: 'magach', name: 'Sidhe’Magach', emblemSlug: 'sidhe-magach', territoryId: 'tir-na-meinnear',
    rankId: 'mor-tiarna', seat: 'Cairmor', source: sourceRef('tir-na-meinnear', 75, 73, 74),
    sourceNote: 'Finnian Magach ist Mor Tiarna von Cairmor. Maelrubhas Barons- und Ninnidhs Lairdamt begründen keine zusätzlichen Familien. Die Familienquelle vom 08.10.2026 bestätigt Vencha (*1697), Peders Ehefrau in Helgr, als Sidhe’Magach. Die Hauszuordnung ist abgeglichen; Personen- und Welt-ID bleiben erhalten.'
  },
  {
    slug: 'eala', name: 'Ua’Eala', emblemSlug: 'ua-eala', territoryId: 'tir-na-meinnear',
    rankId: 'laird', seat: 'Cel Bearradh', source: sourceRef('tir-na-meinnear', 79, 77, 78, 0),
    sourceNote: 'Gearoidas Eala ist als Laird genannt. Die Familienquelle vom 08.10.2026 bestätigt Alastar, Marsailis Ehemann in Sgwarnog, als Ua’Eala und nennt Geburt 1674. Hauszuordnung und Geburtsjahr sind abgeglichen; Personen- und Welt-ID bleiben erhalten.'
  }
].map(definition => Object.freeze({
  kind: 'clan', extinct: false, createFamily: true, ...definition,
  familyId: definition.familyId || `haus-${definition.slug}`,
  houseId: definition.houseId || `house-${definition.slug}`,
  title: `Clan ${definition.name}`,
  emblem: definition.emblem || `assets/images/houses/Blaithneach/clan-${definition.emblemSlug}.png`
})));

export const BLAITHNEACH_REGISTRY_FOLDERS = Object.freeze([
  {
    path: ['Blaithneach'], icon: BLAITHNEACH_EMBLEM,
    description: 'Fürstentum Blaithneach · Hauptstadt Eorach · Drei Oberherrschaften mit elf belegten Clans. Neun Stammbäume mit Hausbios und Kriegerbildern sind ausgearbeitet; Abhrach bleibt vorbereitet. Die bestehende Dal’Leite-Akte ist nach dem Umzug der Überlebenden aus Ceitheach zusätzlich in Ardán eingetragen.'
  },
  ...BLAITHNEACH_TERRITORIES.map(territory => ({
    path: ['Blaithneach', territory.name], icon: territory.emblem,
    description: territory.description, searchTerms: [territory.gloss]
  })),
  {
    path: ['Blaithneach', 'Tir na Dílse', 'Ardán'], searchTerms: ['Ardan', 'Dal Leite', 'Gillesbuig', 'Gilleasbuig'],
    description: 'Laird-Sitz von Dal’Leite · Nach Ceitheachs Niedergang siedelten die Überlebenden hierher über (Nutzerkorrektur vom 07.10.2026). Dieselbe Familienakte bleibt auch unter Greinmhar in Ceitheach erreichbar. Ardán und Ardan sind die beiden Quellschreibweisen.'
  },
  {
    path: ['Blaithneach', 'Tir na Beatha', 'Réadlann'], searchTerms: ['Heaghra', 'Haeghra'],
    description: 'Sitz von An’Haeghra · Donnagh Heaghra ist als Dún Tiarna genannt. Die unterschiedlichen Schreibweisen der Clan- und Amtstabellen bleiben dokumentiert.'
  }
].map(folder => Object.freeze({
  ...folder, path: Object.freeze(folder.path), searchTerms: Object.freeze(folder.searchTerms || []),
  plannedHouses: Object.freeze(folder.plannedHouses || [])
})));
