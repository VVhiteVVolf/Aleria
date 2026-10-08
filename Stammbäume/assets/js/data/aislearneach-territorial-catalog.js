// Quellen und Entscheidungen: assets/data/source-inventories/aislearneach-2026-10-07.json.
const regionEmblem = slug => `assets/images/regions/Aislearneach/${slug}.png`;
const houseEmblem = slug => `assets/images/houses/Aislearneach/${slug}.png`;
const sourceRef = (id, nameRow, seatRow, emblemRow, column = 0) => Object.freeze({
  id, nameRow, seatRow, emblemRow, column
});

// Fürstentum und Ui’Morna verwenden in der Quelle dasselbe Wappen.
export const AISLEARNEACH_EMBLEM = houseEmblem('clan-ui-morna');
export const AISLEARNEACH_TERRITORIES = Object.freeze([
  {
    id: 'tir-na-geach', name: 'Tir na Geach', gloss: 'Land der Rösser', seat: 'Gaelan',
    rulingFamilyId: 'haus-morna',
    description: 'Land der Rösser · Sitz Gaelan · Fürstenclan Ui’Morna. Die Regionalvorlage schreibt auch „Tir na Gaech“; für den Registerpfad gilt die Reichsübersicht.',
    searchTerms: ['Tir na Gaech', 'Tir na Rösser']
  },
  {
    id: 'tir-na-tirth', name: 'Tir na Tirth', gloss: 'Land der Bor', seat: 'Lorai',
    rulingFamilyId: 'haus-durthacht',
    description: 'Land der Bor · Sitz Lorai · Mor-Tiarna-Clan Mac’Durthacht. Weitere belegte Sitze sind Athan und Cliath.'
  },
  {
    id: 'tir-na-faela', name: 'Tir na Faela', gloss: 'Land der Weiden', seat: 'Croga',
    rulingFamilyId: 'haus-fintain',
    description: 'Land der Weiden · Sitz Croga · Mor-Tiarna-Clan Mac’Fintain. Die kopierten Angaben „Tir An’Ceallaigh“, „Gaelan“ und „Koldair“ werden anhand von Reichsübersicht, Fintain-Wappen und Eachans Amt berichtigt. An’Feannags Sitz heißt in der Clanliste Caetharlach, in der Amtstabelle Cethearlach.'
  },
  {
    id: 'tir-na-adharcach', name: 'Tir na Adharcach', gloss: 'Land der Geweihten', seat: 'Foraoise',
    rulingFamilyId: '', administration: 'ecclesiastical',
    description: 'Kirchliche Oberherrschaft · Sitz Foraoise · Sagarth Derbforgaill. Uilebheist und Cnogan sind Laird-Clans, Techtmar eine bürgerliche Sept. Das geistliche Amt begründet keine Herrscherfamilie.'
  },
  {
    id: 'tir-na-iomaire', name: 'Tir na Iomaire', gloss: 'Land der Furchen', seat: 'Koldair',
    rulingFamilyId: 'haus-ceallaigh',
    description: 'Land der Furchen · Sitz Koldair · Mor-Tiarna-Clan Tir An’Ceallaigh. Nach Nutzerkorrektur vom 07.10.2026 gilt die Laird-Tabelle: An’Gaisgh sitzt im Broch an Traigh, Na’Luchdon im Broch an Creig.'
  }
].map(territory => Object.freeze({
  ...territory, emblem: regionEmblem(territory.id),
  searchTerms: Object.freeze([territory.gloss, ...(territory.searchTerms || [])])
})));

export const AISLEARNEACH_HOUSE_DEFINITIONS = Object.freeze([
  {
    slug: 'morna', name: 'Ui’Morna', emblemSlug: 'ui-morna', territoryId: 'tir-na-geach',
    rankId: 'ard-tiarna', seat: 'Gaelan', source: sourceRef('tir-na-geach', 72, 70, 71),
    administrativeRole: 'Fürstenclan von Aislearneach und Mor-Tiarna-Clan von Tir na Geach',
    sourceNote: 'Goll Morna ist Fürst, Garbhán Morna Mor Tiarna von Gaelan. Leogáns Baronsamt begründet ohne Genealogie keine eigene Kadettenakte.'
  },
  {
    slug: 'coronach', name: 'Ua’Coronach', emblemSlug: 'ua-coronach', territoryId: 'tir-na-geach',
    rankId: 'laird', seat: 'Gaelan', source: sourceRef('tir-na-geach', 76, 74, 75, 0),
    sourceNote: 'Colmach Ua’Corónach ist als Laird genannt. Die Akzentvariante Corónach bleibt über dieselbe bestehende Haus-ID anschlussfähig.'
  },
  {
    slug: 'morgacht', name: 'Na’Morgacht', emblemSlug: 'na-morgacht', territoryId: 'tir-na-geach',
    rankId: 'laird', seat: 'Gaelan', source: sourceRef('tir-na-geach', 76, 74, 75, 1),
    sourceNote: 'Brianach Na’Mórgacht ist als Laird genannt. Morgacht/Mórgacht sind in den Originalzeilen erhalten.'
  },
  {
    slug: 'rioga', name: 'An’Rioga', emblemSlug: 'an-rioga', territoryId: 'tir-na-geach',
    rankId: 'laird', seat: 'Gaelan', source: sourceRef('tir-na-geach', 76, 74, 75, 2),
    sourceNote: 'Macthar An’Ríoga ist als Laird genannt. Die bestehende Ziel-ID haus-rioga bleibt erhalten.'
  },
  {
    slug: 'durthacht', name: 'Mac’Durthacht', emblemSlug: 'mac-durthacht', territoryId: 'tir-na-tirth',
    rankId: 'mor-tiarna', seat: 'Lorai', source: sourceRef('tir-na-tirth', 72, 70, 71),
    sourceNote: 'Die Regionalvorlage nennt nur Durthacht; Mac’Durthacht folgt aus der Reichsübersicht mit identischem Wappen. Eagon ist Mor Tiarna; Eochaids Barons- und Kealtáns Lairdamt erzeugen keine weiteren Familien.'
  },
  {
    slug: 'fiantorc', name: 'Ua’Fiáintorc', emblemSlug: 'ua-fiaintorc', territoryId: 'tir-na-tirth',
    rankId: 'laird', seat: 'Lorai', source: sourceRef('tir-na-tirth', 76, 74, 75, 0),
    sourceNote: 'Cael Fiantorc ist als Laird und Patriarch genannt. Die etablierte Haus-ID house-fiantorc wird trotz der Quellschreibweise Fiáintorc beibehalten.'
  },
  {
    slug: 'treada', name: 'Ua’Tréada', emblemSlug: 'ua-treada', territoryId: 'tir-na-tirth',
    rankId: 'laird', seat: 'Lorai', source: sourceRef('tir-na-tirth', 76, 74, 75, 1),
    sourceNote: 'Kealtán Tréada ist als Laird genannt; er wird nicht mit dem ebenfalls genannten Kealtán Durthacht gleichgesetzt.'
  },
  {
    slug: 'muileach', name: 'Ua’Muileach', emblemSlug: 'ua-muileach', territoryId: 'tir-na-tirth',
    rankId: 'dun-tiarna', seat: 'Athan', source: sourceRef('tir-na-tirth', 76, 74, 75, 2),
    sourceNote: 'Aonghas Muileach ist ausdrücklich Dún Tiarna von Athan. Leere „Herrschaft der“-Vorlagen begründen keinen weiteren Gebietsordner.'
  },
  {
    slug: 'ui-faill-duibhne', name: 'Ui Faill Duibhne', emblemSlug: 'ui-faill-duibhne', territoryId: 'tir-na-tirth',
    rankId: 'unknown', seat: 'Cliath', houseStatus: 'expelled',
    preparationNote: 'Ausgestoßener Clan; ein überlebender, begnadigter Clanteil ist für die spätere Ausarbeitung vorgemerkt.',
    source: sourceRef('tir-na-tirth', 82, 80, 81),
    sourceNote: 'Nutzerkorrektur vom 07.10.2026: vorerst als ausgestoßen führen; weitgehend ausgestorben, aber ein lebender Clanteil wurde begnadigt. Die ursprüngliche Kategorie „Ausgestorben/ Ausgestoßen“ bleibt archiviert. Cliaths Lairdstelle ist vakant; historischer Clanrang und Personen bleiben offen. Kein genealogischer Endknoten.'
  },
  {
    slug: 'fintain', name: 'Mac’Fintain', emblemSlug: 'mac-fintain', territoryId: 'tir-na-faela',
    rankId: 'mor-tiarna', seat: 'Croga', source: sourceRef('tir-na-faela', 72, 70, 71),
    sourceNote: 'Die Clanbeschriftung „Tir An’Ceallaigh“ widerspricht dem identischen Mac’Fintain-Wappen der Reichsübersicht und Eachan Fintains Amt. Reichsübersicht und Sitzzeile nennen Croga; „Mor Tiarna von Gaelan“ und „Koldair“ im Geographieabschnitt sind kopierte Vorlagenreste. Cethern und Fingín begründen keine Zusatzfamilien.'
  },
  {
    slug: 'feannag', name: 'An’Feannag', emblemSlug: 'an-feannag', territoryId: 'tir-na-faela',
    rankId: 'dun-tiarna', seat: 'Caetharlach', source: sourceRef('tir-na-faela', 76, 74, 75, 0),
    sourceNote: 'Dànaidh Feannag ist Dún Tiarna. Die Clanliste schreibt Caetharlach, die Amtstabelle Cethearlach; vorläufig folgt der Registerpfad der Clanliste. Die Variante bezeichnet keinen zusätzlich belegten Sitz.'
  },
  {
    slug: 'uilebheist', name: 'An’Uilebheist', emblemSlug: 'an-uilebheist', territoryId: 'tir-na-adharcach',
    rankId: 'laird', seat: 'Foraoise', source: sourceRef('tir-na-adharcach', 76, 74, 75, 0),
    sourceNote: 'Proinnsias Uilebheist ist als Laird genannt. Die Oberherrschaft ist kirchlich; kein weltlicher Herrscherclan wird ergänzt.'
  },
  {
    slug: 'cnogan', name: 'Nic’Cnogan', emblemSlug: 'nic-cnogan', territoryId: 'tir-na-adharcach',
    rankId: 'laird', seat: 'Foraoise', source: sourceRef('tir-na-adharcach', 76, 74, 75, 1),
    sourceNote: 'Tormoid Cnogan ist als Laird genannt. Bestehende Cnogan-Gegenbeziehungen bleiben unverändert.'
  },
  {
    slug: 'techtmar', name: 'Techtmar', emblemSlug: 'techtmar', territoryId: 'tir-na-adharcach',
    rankId: 'sept-head', seat: 'Foraoise', kind: 'sept', source: sourceRef('tir-na-adharcach', 82, 80, 81),
    sourceNote: 'Ausdrücklich bürgerliche Sept. Téite Techtmars Ratsamt belegt keine Abstammung und keinen adligen Rang; ein unmittelbarer Lehnsherr bleibt offen.'
  },
  {
    slug: 'ceallaigh', name: 'Tir An’Ceallaigh', emblemSlug: 'tir-an-ceallaigh', territoryId: 'tir-na-iomaire',
    rankId: 'mor-tiarna', seat: 'Koldair', source: sourceRef('tir-na-iomaire', 72, 70, 71),
    sourceNote: 'Ruarias Ceallaigh ist Mor Tiarna von Koldair. Réaltíns Baronsamt wird nicht zu einer unbelegten separaten Linie. Die Reichsübersicht schreibt Tir an’Ceallaigh.'
  },
  {
    slug: 'fiachiontach', name: 'Na’Fiachiontach', emblemSlug: 'na-fiachiontach', territoryId: 'tir-na-iomaire',
    rankId: 'laird', seat: 'Koldair', source: sourceRef('tir-na-iomaire', 76, 74, 75, 0),
    sourceNote: 'Colmach Fiachiontach ist Laird. Die Gegenakte Ciaróg nennt Ultán Tir Fiachiontach und house-tir-fiachiontach; mangels genealogischer Quelle ist die Identität mit Na’Fiachiontach ungeklärt. Bestehende Welt- und Haus-IDs bleiben unverändert.'
  },
  {
    slug: 'tartarfhuil', name: 'Dal’Tartarfhuil', emblemSlug: 'dal-tartarfhuil', territoryId: 'tir-na-iomaire',
    rankId: 'laird', seat: 'Koldair', source: sourceRef('tir-na-iomaire', 76, 74, 75, 1),
    sourceNote: 'Macmhar Tartarfhuil ist als Laird genannt.'
  },
  {
    slug: 'gaisgh', name: 'An’Gaisgh', emblemSlug: 'an-gaisgh', territoryId: 'tir-na-iomaire',
    rankId: 'laird', seat: 'Broch an Traigh', source: sourceRef('tir-na-iomaire', 76, 74, 75, 2),
    sourceNote: 'Nutzerkorrektur vom 07.10.2026 bestätigt die Laird-Tabelle: Seumas Gaisgh sitzt im Broch an Traigh (Zeilen 56/58, Spalte 4). Die Clanliste weist stattdessen Broch an Creig zu (Zeilen 74–76, Spalte 2); diese vertauschte Angabe ist überholt.'
  },
  {
    slug: 'luchdon', name: 'Na’Luchdon', emblemSlug: 'na-luchdon', territoryId: 'tir-na-iomaire',
    rankId: 'laird', seat: 'Broch an Creig', source: sourceRef('tir-na-iomaire', 76, 74, 75, 3),
    sourceNote: 'Nutzerkorrektur vom 07.10.2026 bestätigt die Laird-Tabelle: Liamach Luchdon sitzt im Broch an Creig (Zeilen 56/58, Spalte 3). Die Clanliste weist stattdessen Broch an Traigh zu (Zeilen 74–76, Spalte 3); diese vertauschte Angabe ist überholt.'
  }
].map(definition => Object.freeze({
  kind: 'clan', ...definition,
  familyId: `${definition.kind === 'sept' ? 'sept' : 'haus'}-${definition.slug}`,
  houseId: `${definition.kind === 'sept' ? 'house-sept' : 'house'}-${definition.slug}`,
  title: `${definition.kind === 'sept' ? 'Sept' : 'Clan'} ${definition.name}`,
  emblem: houseEmblem(`${definition.kind === 'sept' ? 'sept' : 'clan'}-${definition.emblemSlug}`)
})));

export const AISLEARNEACH_REGISTRY_FOLDERS = Object.freeze([
  {
    path: ['Aislearneach'], icon: AISLEARNEACH_EMBLEM,
    searchTerms: ['Aislaerneach'],
    description: 'Fürstentum Aislearneach · Hauptstadt Gaelan · Fünf Oberherrschaften mit 18 Clanakten und der bürgerlichen Sept Techtmar. Schreibvariante der Regionalvorlagen: Aislaerneach. Die kopierte Bezeichnung „Ceitheach“ begründet kein zweites Fürstentum.'
  },
  ...AISLEARNEACH_TERRITORIES.map(territory => ({
    path: ['Aislearneach', territory.name], icon: territory.emblem,
    description: territory.description, searchTerms: territory.searchTerms
  })),
  {
    path: ['Aislearneach', 'Tir na Faela', 'Caetharlach'], searchTerms: ['Cethearlach'],
    description: 'Sitz von An’Feannag. Clanliste: Caetharlach; Amtstabelle: Cethearlach. Vorläufig ein gemeinsamer Ort unter der Clanlistenschreibweise.'
  },
  ...[['Broch an Creig', 'Na’Luchdon'], ['Broch an Traigh', 'An’Gaisgh']].map(([seat, clan]) => ({
    path: ['Aislearneach', 'Tir na Iomaire', seat],
    description: `Sitz von ${clan} nach Nutzerkorrektur vom 07.10.2026 und Laird-Tabelle; die Clanübersicht vertauscht die beiden Broch-Sitze.`
  }))
].map(folder => Object.freeze({
  ...folder, path: Object.freeze(folder.path), searchTerms: Object.freeze(folder.searchTerms || [])
})));
