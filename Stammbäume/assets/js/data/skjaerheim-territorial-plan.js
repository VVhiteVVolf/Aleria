// Registerstruktur aus der Reichstabelle vom 09.10.2026.
// Genealogien und die Jarltumszuordnung der niederen Clans folgen später.
const regionEmblem = slug => `assets/images/regions/Skjaerheim/${slug}.png`;
const clan = (name, slug, rankLabel, sourceNote = '', aliases = []) => Object.freeze({
  name, rankLabel, sourceNote, aliases: Object.freeze(aliases),
  emblem: `assets/images/houses/Skjaerheim/clan-${slug}.png`
});

export const SKJAERHEIM_TERRITORIES = Object.freeze([
  {
    name: 'Fürstliches Jarltum der Hrothgar', slug: 'hrothgar', seat: 'Nyfall', aliases: ['Sgurrfail'],
    description: 'Eigenes Jarltum des Königsclans Hrothgar mit Sitz Nyfall. Die Quelle bezeichnet den Herrscher als Reik und das Gebiet als fürstliches Jarltum.',
    clan: clan('Hrothgar', 'hrothgar', 'Königsclan · Reik- und Jarlclan')
  },
  {
    name: 'Jarltum der Knything', slug: 'knything', seat: 'Agnhjort', aliases: ['Carn Bruach'],
    description: 'Jarltum des Clans Knything mit Sitz Agnhjort.',
    clan: clan('Knything', 'knything', 'Jarlclan')
  },
  {
    name: 'Jarltum der Stanleagh', slug: 'stanleagh', seat: 'Blóðgalt', aliases: ['Torcbhreac'],
    description: 'Jarltum des Clans Stanleagh mit Sitz Blóðgalt. Die Jarltumsüberschrift schreibt „Stanlaegh“; die Clanliste nennt „Stanleagh“. Beide Schreibweisen führen zum selben Clan.',
    clan: clan('Stanleagh', 'stanleagh', 'Jarlclan',
      'Quellenvariante: Stanlaegh in der Jarltumsüberschrift. Registerschreibweise nach der Clanliste: Stanleagh.', ['Stanlaegh'])
  },
  {
    name: 'Jarltum der Bjerk', slug: 'bjerk', seat: 'Bjarkasteinn', aliases: ['Airdree'],
    description: 'Jarltum des Clans Bjerk mit Sitz Bjarkasteinn.',
    clan: clan('Bjerk', 'bjerk', 'Jarlclan')
  }
].map(territory => Object.freeze({
  ...territory, aliases: Object.freeze(territory.aliases), emblem: regionEmblem(territory.slug)
})));

export const SKJAERHEIM_UNASSIGNED_FOLDER = 'Niedere Clans – noch nicht zugeordnet';

export const SKJAERHEIM_LOWER_CLANS = Object.freeze([
  ['Hjarning', 'hjarning', 'Hjarngard', 'Beinnstir'],
  ['Vargul', 'vargul', 'Hildrath', 'Drumrath'],
  ['Veknar', 'veknar', 'Galtfall', 'Dalriadh'],
  ['Hjorvik', 'hjorvik', 'Hjörval', 'Ealach'],
  ['Iskarn', 'iskarn', 'Skogarn', 'Carnascal'],
  ['Hrodmar', 'hrodmar', 'Ranvik', 'Culrain'],
  ['Skath', 'skath', 'Skathgard', 'Tighlean'],
  ['Thirsk', 'thirsk', 'Thirskholm', 'Inniscaer'],
  ['Garnulf', 'garnulf', 'Lærdal', 'Glenmohr'],
  ['Draugmar', 'draugmar', 'Valnar', 'Maolnair']
].map(([name, slug, seat, formerSeat]) => Object.freeze({
  ...clan(name, slug, 'Thanenclan',
    `Sitz: ${seat} (${formerSeat}). Die Zugehörigkeit zu einem Jarltum wird später festgelegt.`),
  seat, formerSeat
})));

export const SKJAERHEIM_REGISTRY_FOLDERS = Object.freeze([
  {
    path: ['Skjaerheim'], icon: regionEmblem('skjaerheim'),
    description: 'Reiktum Skjaerheim · Königsclan Hrothgar, drei weitere Jarlclans und zehn niedere Thanenclans. Die vier Jarltümer sind vorbereitet; alle niederen Clans bleiben bis zur späteren Zuordnung gemeinsam in einem eigenen Bereich.',
    searchTerms: ['Reiktum', 'Nordmänner', 'Königsclan', 'Hrothgar']
  },
  ...SKJAERHEIM_TERRITORIES.flatMap(territory => [
    {
      path: ['Skjaerheim', territory.name], icon: territory.emblem, description: territory.description,
      searchTerms: [territory.clan.name, ...territory.clan.aliases]
    },
    {
      path: ['Skjaerheim', territory.name, territory.seat],
      description: `Weiterer überlieferter Ortsname: ${territory.aliases.join(' · ')}.`,
      plannedHouses: [territory.clan],
      searchTerms: [...territory.aliases, territory.clan.name, territory.clan.rankLabel, ...territory.clan.aliases]
    }
  ]),
  {
    path: ['Skjaerheim', SKJAERHEIM_UNASSIGNED_FOLDER],
    description: 'Zehn niedere Clans im Rang von Thanen. Ihre belegten Sitze bleiben erfasst; eine Unterstellung unter Hrothgar, Knything, Stanleagh oder Bjerk ist noch nicht festgelegt.',
    plannedHouses: SKJAERHEIM_LOWER_CLANS,
    searchTerms: ['Thane', 'Thanenclans', ...SKJAERHEIM_LOWER_CLANS.flatMap(entry => [entry.name, entry.seat, entry.formerSeat])]
  }
].map(folder => Object.freeze({
  ...folder,
  path: Object.freeze(folder.path),
  plannedHouses: Object.freeze(folder.plannedHouses || []),
  searchTerms: Object.freeze(folder.searchTerms || [])
})));
