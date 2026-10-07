// Territoriale Vorbereitung aus den vier Vorlagen vom 07.10.2026.
// Quellen, Tabellenzeilen und Wappenbelege: assets/data/source-inventories/dunfal-2026-10-07.json.
const regionEmblem = slug => `assets/images/regions/Dunfal/${slug}.png`;
const sourceRef = (id, nameRow, seatRow, emblemRow, column = 0) => Object.freeze({
  id, nameRow, seatRow, emblemRow, column
});

export const DUNFAL_EMBLEM = regionEmblem('dunfal');
export const DUNFAL_TERRITORIES = Object.freeze([
  Object.freeze({
    id: 'tir-na-rithe', name: 'Tir na Rithe', gloss: 'Land der Könige', seat: 'Dunfal',
    emblem: regionEmblem('tir-na-rithe'), rulingFamilyId: 'haus-chulainn',
    description: 'Land der Könige · Sitz Dunfal. Ard’Chulainn stellt den Fürsten und den Mor Tiarna der Oberherrschaft.'
  }),
  Object.freeze({
    id: 'tir-na-fathach', name: 'Tir na Fathach', gloss: 'Land der Riesen', seat: 'Cradh na Frinne',
    emblem: regionEmblem('tir-na-fathach'), rulingFamilyId: 'haus-nuadat',
    description: 'Land der Riesen · Sitz Cradh na Frinne · Mor-Tiarna-Clan Nic’Nuadat. Die kopierten Angaben „Ard’Chulainn“, „Tir na Rithe“ und „Dunfal“ in Teilen der Regionalvorlage werden anhand der Reichsübersicht, des Nuadat-Wappens und Tagd Nuadats Ratsrolle berichtigt.'
  })
]);

export const DUNFAL_HOUSE_DEFINITIONS = Object.freeze([
  {
    slug: 'chulainn', name: 'Ard’Chulainn', emblemSlug: 'ard-chulainn', territoryId: 'tir-na-rithe',
    rankId: 'ard-tiarna', seat: 'Dunfal', source: sourceRef('tir-na-rithe', 72, 70, 71),
    administrativeRole: 'Fürstenclan von Dunfal und Mor-Tiarna-Clan von Tir na Rithe',
    sourceNote: 'Cú Chulainn ist als Fürst, Connla Chulainn als Mor Tiarna von Dunfal genannt. Ruaidhrígh und Fearghas bekleiden niedrigere Ränge; daraus entstehen ohne genealogische Quelle keine zusätzlichen Clan- oder Kadettenakten. „Ard Tiarna von Leitheach“ und „Mor Tiarna von Dun Athar“ sind widersprechende Vorlagenüberschriften.'
  },
  {
    slug: 'ailella', name: 'Mac Sidhe’Ailella', emblemSlug: 'mac-sidhe-ailella', territoryId: 'tir-na-rithe',
    rankId: 'laird', seat: 'Dunfal', realm: 'Herrschaft der Mac Sidhe’Ailella',
    source: sourceRef('tir-na-rithe', 76, 74, 75, 0),
    sourceNote: 'Quinn Ailella ist als Laird genannt. Die ältere Gegenakte „Mac Ailella“ mit Finnbar in Helgr bleibt bis zur Familienquelle eine ungeklärte mögliche Namensvariante; ihre Welt- und Haus-IDs werden nicht umgeschrieben.'
  },
  {
    slug: 'cein', name: 'Mac’Céin', emblemSlug: 'mac-cein', territoryId: 'tir-na-rithe',
    rankId: 'laird', seat: 'Dunfal', realm: 'Herrschaft der Mac’Céin',
    source: sourceRef('tir-na-rithe', 76, 74, 75, 1),
    sourceNote: 'Górman Cein ist als Laird genannt. Die Quelle verwendet Céin und Cein; die bestehende Ziel-ID haus-cein bleibt erhalten.'
  },
  {
    slug: 'birn', name: 'Dál’Birn', emblemSlug: 'dal-birn', territoryId: 'tir-na-rithe',
    rankId: 'laird', seat: 'Dunfal', realm: 'Herrschaft der Dál’Birn',
    source: sourceRef('tir-na-rithe', 76, 74, 75, 2),
    sourceNote: 'Tarlachán/Tarlachan Birn ist als Laird genannt. Die Akzentschreibweisen bleiben im Quelleninventar erhalten.'
  },
  {
    slug: 'morath', name: 'Ruin’Morath', emblemSlug: 'ruin-morath', territoryId: 'tir-na-rithe',
    rankId: 'laird', seat: 'Iarthar', realm: 'Herrschaft der Ruin’Morath',
    source: sourceRef('tir-na-rithe', 76, 74, 75, 3),
    sourceNote: 'Flann Morath ist als Laird genannt; Iarthar ist in Familien- und Geographieabschnitt als Sitz belegt.'
  },
  {
    slug: 'duilb', name: 'Ui’Duilb', emblemSlug: 'ui-duilb', territoryId: 'tir-na-rithe',
    rankId: 'unknown', seat: 'Dunfal', extinct: true,
    source: sourceRef('tir-na-rithe', 82, 80, 81),
    sourceNote: 'Ausdrücklich als ausgestorben geführt. Historischer Rang, letzte Erbperson und Todesjahr bleiben offen; ohne Person wird kein genealogischer Endknoten erfunden.'
  },
  {
    slug: 'nuadat', name: 'Nic’Nuadat', emblemSlug: 'nic-nuadat', territoryId: 'tir-na-fathach',
    rankId: 'mor-tiarna', seat: 'Cradh na Frinne', source: sourceRef('tir-na-fathach', 76, 74, 75),
    administrativeRole: 'Mor-Tiarna-Clan von Tir na Fathach',
    sourceNote: 'Die Clanüberschrift „Ard’Chulainn“ widerspricht dem Nuadat-Wappen und Tagd Nuadats Ratsrolle. Die Reichsübersicht benennt dieses Wappen als Nic’Nuadat (Zeilen 88/89, Spalte 0) und ordnet Tagd Cradh na Frinne zu (Sitzzeile 56, Spalte 2; Personzeile 58, Spalte 1; Gebietszeile 79, Spalte 1). Brodie als Dún Tiarna und Artan als Laird begründen keine zusätzlichen Familienakten. „Mor Tiarna von Dun Athar“ bleibt als Vorlagenfehler dokumentiert.'
  },
  {
    slug: 'anbhair', name: 'Ua’Anbhair', emblemSlug: 'ua-anbhair', territoryId: 'tir-na-fathach',
    rankId: 'laird', seat: 'Cradh na Frinne', realm: 'Herrschaft der Ua’Anbhair',
    source: sourceRef('tir-na-fathach', 80, 78, 79, 0),
    sourceNote: 'Iagan Anbhair ist als Laird genannt.'
  },
  {
    slug: 'casur', name: 'Ua’Casur', emblemSlug: 'ua-casur', territoryId: 'tir-na-fathach',
    rankId: 'laird', seat: 'Cradh na Frinne', realm: 'Herrschaft der Ua’Casur',
    source: sourceRef('tir-na-fathach', 80, 78, 79, 1),
    sourceNote: 'Muircheartach Casur ist als Laird genannt.'
  },
  {
    slug: 'aonghusa', name: 'Dál’Aonghusa', emblemSlug: 'dal-aonghusa', territoryId: 'tir-na-fathach',
    rankId: 'laird', seat: 'Cradh na Frinne', realm: 'Herrschaft der Dál’Aonghusa',
    source: sourceRef('tir-na-fathach', 80, 78, 79, 2),
    sourceNote: 'Treasa Aonghusa ist als Laird genannt.'
  },
  {
    slug: 'riangabra', name: 'Na’Riangabra', emblemSlug: 'na-riangabra', territoryId: 'tir-na-fathach',
    rankId: 'laird', seat: 'Baile Begg', realm: 'Herrschaft der Na’Riangabra',
    source: sourceRef('tir-na-fathach', 80, 78, 79, 3),
    sourceNote: 'Glaisne Riangabra ist als Laird genannt; Baile Begg ist in Familien- und Geographieabschnitt belegt.'
  },
  {
    slug: 'eachtrai', name: 'Mac’Eachtrai', emblemSlug: 'mac-eachtrai', territoryId: 'tir-na-fathach',
    rankId: 'laird', seat: 'Athenry', realm: 'Herrschaft der Mac’Eachtrai',
    source: sourceRef('tir-na-fathach', 80, 78, 79, 4),
    sourceNote: 'Malachias Eachtrai ist als Laird genannt; Athenry ist in Familien- und Geographieabschnitt belegt.'
  },
  {
    slug: 'ferbend', name: 'Ferbend', emblemSlug: 'ferbend', territoryId: 'tir-na-fathach',
    rankId: 'sept-head', seat: 'Cradh na Frinne', kind: 'sept',
    source: sourceRef('tir-na-fathach', 86, 84, 85),
    sourceNote: 'Als Bauernsept in Cradh na Frinne überliefert. Ein unmittelbarer Lehnsherr oder adliger Rang ist nicht angegeben.'
  }
].map(definition => Object.freeze({
  kind: 'clan', realm: '', extinct: false, ...definition,
  familyId: `${definition.kind === 'sept' ? 'sept' : 'haus'}-${definition.slug}`,
  houseId: `${definition.kind === 'sept' ? 'house-sept' : 'house'}-${definition.slug}`,
  title: `${definition.kind === 'sept' ? 'Sept' : 'Clan'} ${definition.name}`,
  emblem: `assets/images/houses/Dunfal/${definition.kind === 'sept' ? 'sept' : 'clan'}-${definition.emblemSlug}.png`,
  realmEmblem: definition.realm ? regionEmblem(`herrschaft-${definition.emblemSlug}`) : ''
})));

export const DUNFAL_REGISTRY_FOLDERS = Object.freeze([
  {
    path: ['Dunfal'], icon: DUNFAL_EMBLEM,
    description: 'Fürstentum Dunfal · Zwei Oberherrschaften mit zwölf Clans und der Sept Ferbend. Die Familienakten sind für die spätere genealogische Ausarbeitung vorbereitet. Ältere Leitheach-Überschriften der Quelle werden nach deren Dunfal-Steckbrief berichtigt.'
  },
  ...DUNFAL_TERRITORIES.map(territory => ({
    path: ['Dunfal', territory.name], icon: territory.emblem, description: territory.description,
    searchTerms: [territory.gloss]
  })),
  ...DUNFAL_HOUSE_DEFINITIONS.filter(definition => definition.realm).map(definition => ({
    path: ['Dunfal', DUNFAL_TERRITORIES.find(territory => territory.id === definition.territoryId).name, definition.realm],
    icon: definition.realmEmblem,
    description: `${definition.title} · Sitz ${definition.seat}. Der Rang folgt der Laird-Tabelle; die Herrschaftsüberschrift begründet keinen zusätzlichen Baronsrang.`
  })),
  {
    path: ['Dunfal', 'Tir na Rithe', 'Ausgestorbene Clans'],
    description: 'Historische Clans · Ui’Duilb mit letztem belegtem Sitz Dunfal. Zeitpunkt und Verlauf des Erlöschens sind noch nicht überliefert.'
  },
  {
    path: ['Dunfal', 'Tir na Fathach', 'Herrschaft der Fianna'], icon: regionEmblem('herrschaft-fianna'),
    description: 'In der Geographie benannte Herrschaft der Fianna. Die Reichsübersicht führt die Fianna als Organisation. Sitz und Familienzuordnung sind nicht belegt; es wird keine Fianna-Familie angelegt.'
  }
].map(folder => Object.freeze({
  ...folder, path: Object.freeze(folder.path), searchTerms: Object.freeze(folder.searchTerms || [])
})));
