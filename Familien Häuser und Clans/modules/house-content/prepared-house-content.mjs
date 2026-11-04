// Authoring adapter for known register facts. It never changes a family record.
import { readPreparedHouseFacts, describePreparedHouse, preparedHouseSlug } from './prepared-house-facts.mjs';

export function createPreparedHouseContent({ record, territory, image = '', emblemDescription = '', contentVersion, biographyManagedExternally = false }) {
  const facts = readPreparedHouseFacts(record);
  const { profile, commoner, clan, type, liege, rank, extinct } = facts;
  const unknownRank = profile.rankId === 'unknown';
  const overview = [describePreparedHouse(facts), facts.description].filter(Boolean).join('\n\n');
  const history = 'Über die Anfänge und die weitere Geschichte der Familie ist bislang wenig überliefert.';
  const character = [emblemDescription, 'Besondere Hausbräuche und Wertvorstellungen sind bislang nicht näher überliefert.'].filter(Boolean).join(' ');
  const relations = liege ? `${facts.title} ${extinct ? 'war' : 'ist'} mit ${liege} verbunden. Weitere Bündnisse und Fehden sind bislang nicht näher überliefert.` : 'Einzelne Bündnisse und Fehden sind bislang nicht näher überliefert.';
  const holdings = profile.seat ? `${profile.seat} ${extinct ? 'war' : 'ist'} der überlieferte Mittelpunkt der Familie.` : 'Konkrete Besitzungen und Einnahmequellen sind bislang nicht näher überliefert.';
  return {
    id: facts.id, name: facts.title, type, page: 'kleinehaeuser.html',
    county: profile.county, liege, territoryId: territory.id, territoryName: territory.name, territoryHref: territory.href,
    parentHouseId: facts.parentHouseId, extinct, showMotto: Boolean(facts.motto), registerPage: true, prepared: true,
    contentVersion, biographyManagedExternally, biographySourceRevision: biographyManagedExternally ? 0 : facts.sourceRevision + 1, biographyPreviousDefaultFingerprints: [],
    biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Bisherige Überlieferung',
    biographySummary: { overview, history, character, relations, holdings },
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy: [{ type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
      { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      ...facts.folderPath.map((name, index, path) => ({ type: index === 0 ? 'Königreich' : index === 1 ? 'Grafschaft' : index === path.length - 1 && profile.seat ? 'Sitz' : 'Region', name, slug: preparedHouseSlug(name) })),
      { type: clan ? 'Clan' : 'Haus', name: facts.title, slug: facts.id }],
    profile: { highestTitle: rank, rank, houseType: type,
      motto: facts.motto, quoteAuthor: '', seat: profile.seat || '', affiliation: profile.county || profile.kingdom, liege,
      troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '',
      knightingPatron: '', people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true,
    sections: { overview, history, traditions: 'Besondere Hausbräuche sind bisher nicht überliefert.',
      knighthood: unknownRank ? 'Ein besonderer Stand oder eine eigene ritterliche Ausbildung ist bislang nicht überliefert.' : commoner ? 'Die Familie gehört zum bürgerlichen Stand. Arbeit und Haushalt bilden den Rahmen ihres alltäglichen Lebens.' : clan ? 'Eine besondere Ausbildung oder Ausrüstungstradition des Clans ist bislang nicht näher überliefert.' : 'Eine besondere Ausbildung oder Rüstungstradition des Hauses ist bislang nicht näher überliefert.',
      holdings,
      cultureReligion: 'Eine besondere religiöse Überlieferung ist bislang nicht näher bekannt.',
      conflictsAlliances: relations, values: character, succession: extinct ? 'Die Familie ist erloschen.' : 'Eine namentlich gesicherte Erbfolge ist bislang nicht überliefert.',
      court: 'Namentliche Oberhäupter und eigene Amtsbesetzungen sind bisher nicht belegt.',
      familyTree: 'Der Stammbaum zeigt die überlieferten Angehörigen und Verbindungen der Familie.',
      historicalFigures: 'Einzelne historische Persönlichkeiten sind bislang nicht näher überliefert.' },
    images: { crest: facts.emblem ? `../Stammbäume/${facts.emblem}` : '', scene: image,
      sceneAlt: `${unknownRank ? 'Repräsentative Familiendarstellung' : commoner ? 'Bürgerliche Hausdarstellung' : clan ? 'Clandarstellung' : 'Hausdarstellung'} · ${facts.title}`,
      banner: profile.regionEmblems?.county ? `../Stammbäume/${profile.regionEmblems.county}` : '' },
    illustrationCategory: unknownRank ? 'Familiendarstellung' : commoner ? 'Bürgerliche Hausdarstellung' : 'Hausdarstellung',
    cadets: [], founder: null, heads: [], heirs: [], offices: [], figuresTitle: 'Historische Persönlichkeiten', figures: [], trivia: [], currentHead: '', firstHeir: '',
    ...(commoner || unknownRank ? { headsTitle: 'Familie und Haushalt', officesTitle: 'Angehörige und Aufgaben' } : {})
  };
}
