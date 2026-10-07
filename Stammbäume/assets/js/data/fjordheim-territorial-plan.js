// Reine Registerplanung aus den sechs Tabellen vom 07.10.2026.
// Keine Familien-IDs, Leerakten, Personen oder genealogischen Beziehungen.
// Quellenzeilen und unveränderte HTML-Vorlagen: assets/data/source-inventories/fjordheim-2026-10-07.json.

const sourcePath = slug => `assets/data/source-inventories/fjordheim-2026-10-07/${slug}.html`;
const regionEmblem = slug => `assets/images/regions/Fjordheim/${slug}.png`;
const clan = (name, emblemSlug, rankLabel, sourceNote = '', aliases = []) => Object.freeze({
  name, rankLabel, sourceNote, aliases: Object.freeze(aliases),
  emblem: `assets/images/houses/Fjordheim/clan-${emblemSlug}.png`
});

export const FJORDHEIM_TERRITORIES = Object.freeze([
  {
    name: 'Drachenzunge', slug: 'drachenzunge', seat: 'Drakensund',
    description: 'Jarltum des Clans Draca. Drakensund hieß zuvor Serenlyn. Die Draca führen laut Reichsgeschichte das Reiktum Fjordheim.',
    places: [
      { name: 'Drakensund', aliases: ['Serenlyn'], clans: [clan('Draca', 'draca', 'Reik- und Jarlclan')] },
      { name: 'Styrkr', aliases: ['Gwych'], clans: [clan('Vingar', 'vingar', 'Thanenclan')] },
      { name: 'Caer', clans: [clan('Fjargardr', 'fjargardr', 'Niederer Clan · Rang offen',
        'Die Jarltumsseite nennt Fjargardr mit Sitz Caer. Die Reichsübersicht nennt beim gleichen Wappen den Clan Fjandr mit Sitz Fjargardr. Name und Sitz bleiben klärungsbedürftig.', ['Fjandr'])] }
    ]
  },
  {
    name: 'Langstrand', slug: 'langstrand', seat: 'Talfjörn',
    description: 'Jarltum des Clans Hjort mit den Thanentümern Derwaskr, Eldrvik und Blomholr. Älterer Name des Hauptsitzes laut Reichsübersicht: Talforwyn; die Vennyr-Tabellen nennen Talfronwyn.',
    places: [
      { name: 'Talfjörn', aliases: ['Talforwyn', 'Talfronwyn'], clans: [clan('Hjort', 'hjort', 'Jarlclan')] },
      { name: 'Derwaskr', aliases: ['Derwaskyr'], clans: [clan('Helvandr', 'helvandr', 'Thanenclan')] },
      { name: 'Eldrvik', clans: [clan('Hronulf', 'hronulf', 'Thanenclan')] },
      { name: 'Blomholr', aliases: ['Blómholr'], clans: [clan('Vötnar', 'voetnar', 'Thanenclan')] }
    ]
  },
  {
    name: 'Kragenküste', slug: 'kragenkueste', seat: 'Bergshamn',
    description: 'Jarltum des Clans Ulfr. Bergshamn hieß zuvor Mynyddharbwr. Askarholm ist als Sitz Valdrunas belegt; die Geographie führt stattdessen ein Thanentum Llyndor ohne nordischen Clan auf. Beide Orte bleiben getrennt.',
    places: [
      { name: 'Bergshamn', aliases: ['Mynyddharbwr'], clans: [clan('Ulfr', 'ulfr', 'Jarlclan',
        'In der Reichsübersicht Ulf genannt; die Jarltumsseite verwendet Ulfr beim gleichen Wappen.', ['Ulf'])] },
      { name: 'Askarholm', aliases: ['Askerholm'], clans: [clan('Valdruna', 'valdruna', 'Niederer Clan · Rang offen')] },
      { name: 'Blotfjall', clans: [clan('Ulvar', 'ulvar', 'Thanenclan')] },
      { name: 'Bjarnaströnd', clans: [clan('Æxewindr', 'aexewindr', 'Thanenclan')] },
      { name: 'Llyndor', description: 'Als Thanentum in der Geographie aufgeführt. Ein nordischer Clan ist nicht angegeben. Die ehemalige Vennyr-Familie Blodyn wird dadurch nicht umgehängt.', clans: [] }
    ]
  },
  {
    name: 'Tiefenfjord', slug: 'tiefenfjord', seat: 'Nyfjord',
    description: 'Jarltum des Clans Geit. Nyfjord hieß zuvor Gwynlann; Strandr ist als Thanentum belegt.',
    places: [
      { name: 'Nyfjord', aliases: ['Gwynlann'], clans: [clan('Geit', 'geit', 'Jarlclan')] },
      { name: 'Strandr', clans: [clan('Arngull', 'arngull', 'Thanenclan')] }
    ]
  },
  {
    name: 'Windtal', slug: 'windtal', seat: 'Tirvindr',
    description: 'Jarltum des Clans Orn. Tirvindr hieß zuvor Tirwedd; Skerdgardr ist in der Geographie ausdrücklich als Hesirentum aufgeführt.',
    places: [
      { name: 'Tirvindr', aliases: ['Tirwedd'], clans: [clan('Orn', 'orn', 'Jarlclan')] },
      { name: 'Skerdgardr', aliases: ['Skergardr'], clans: [clan('Haming', 'haming', 'Hesirenclan')] }
    ]
  }
].map(territory => Object.freeze({
  ...territory,
  emblem: regionEmblem(territory.slug),
  sourcePath: sourcePath(territory.slug),
  places: Object.freeze(territory.places.map(place => Object.freeze({
    ...place,
    aliases: Object.freeze(place.aliases || []),
    clans: Object.freeze(place.clans)
  })))
})));

// Ordner werden unabhängig von Familienakten injiziert. Spätere Akten können
// dieselben Gebietspfade verwenden, ohne Planungseinträge importieren zu müssen.
export const FJORDHEIM_REGISTRY_FOLDERS = Object.freeze([
  {
    path: ['Fjordheim'],
    icon: regionEmblem('fjordheim'),
    description: 'Reiktum Fjordheim · Nordmänner (Norrnaigh / Fjordmenn). Vorbereitet sind fünf Jarltümer, ihre belegten Orte und die Zuordnung von fünf hohen und zehn niederen Clans. Stammbäume werden erst bei der späteren Familienausarbeitung angelegt. Die ehemaligen Vennyr-Häuser behalten ihre bisherigen Akten und Zuordnungen.',
    searchTerms: ['Nordmänner', 'Norrnaigh', 'Fjordmenn']
  },
  ...FJORDHEIM_TERRITORIES.flatMap(territory => [
    { path: ['Fjordheim', territory.name], description: territory.description, icon: territory.emblem },
    ...territory.places.map(place => ({
      path: ['Fjordheim', territory.name, place.name],
      description: place.description || (place.aliases.length ? `Weitere überlieferte Ortsnamen: ${place.aliases.join(' · ')}.` : ''),
      plannedHouses: place.clans,
      searchTerms: [...place.aliases, ...place.clans.flatMap(entry => [entry.name, entry.rankLabel, ...entry.aliases])]
    }))
  ])
].map(folder => Object.freeze({
  ...folder,
  path: Object.freeze(folder.path),
  plannedHouses: folder.plannedHouses || Object.freeze([]),
  searchTerms: Object.freeze(folder.searchTerms || [])
})));
