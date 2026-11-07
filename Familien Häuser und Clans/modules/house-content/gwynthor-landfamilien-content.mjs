import { LAND_FAMILIEN_ROSTER } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { LAND_FAMILIEN_PREVIOUS_DEFAULTS } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-previous-defaults.mjs';
import { fleischsammlerFamilyLocality } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs';

// Shared presentation contract for these three related rural-house revisions.
// Editorial texts stay in each house's own source; people have one roster owner.
export function createLandfamilienHouseContent(slug, text) {
  const family = LAND_FAMILIEN_ROSTER.families.find(entry => entry.slug === slug);
  const locality = fleischsammlerFamilyLocality(slug);
  const name = `Familie ${locality.surname}`;
  const card = person => ({ id: person.id, familyId: family.familyId, name: person.name,
    role: person.role, image: person.portrait, silhouette: person.sex,
    detail: `${person.birth}${person.death ? `–${person.death}` : ` · ${person.age} Jahre`}`,
    description: person.bio });
  const leaders = family.persons.filter(person => person.workGroup === 'leitung' || (slug === 'helfaen' && person.id === 'cadwgan-helfaen'));
  const living = family.persons.filter(person => person.status === 'alive');
  return {
    id: family.familyId, name, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
    county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: '',
    territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
    extinct: false, showMotto: false, registerPage: true, prepared: false,
    contentVersion: '20261107-landfamilien-v1', biographySourceRevision: 2,
    biographyPreviousDefaultFingerprints: [LAND_FAMILIEN_PREVIOUS_DEFAULTS[family.familyId].biographyFingerprint],
    biographyIntroTitle: 'Familie und Lebensgrundlage', biographyHistoryTitle: 'Überlieferung und heutige Generationen',
    biographySummary: { overview: text.overview, history: text.history, character: text.values,
      customs: text.household, holdings: text.holdings, relations: text.relations },
    hierarchy: [
      ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'],
      ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'],
      ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'],
      ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Ort', 'Gwynthor', 'gwynthor'],
      ['Familie', name, family.familyId]
    ].map(([type, name, slug]) => ({ type, name, slug })),
    profile: { highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: text.trade,
      motto: '', quoteAuthor: '', seat: family.placeName, affiliation: '', liege: 'Haus Draig',
      patron: '', knightingPatron: '', founding: 'Nicht überliefert', milestoneOne: '', milestoneTwo: '',
      people: 'Rheunwaith', wealth: text.wealth, religion: '', patronDeities: '',
      origin: 'Östlicher Bannkreis von Gwynthor', cadetBranches: '', allies: '', enemies: '',
      troopStrength: '', tiarna: '', kerns: '', fleet: '' },
    omitMilitaryProfile: true, familyTreeCompact: true,
    sectionTitles: { court: '8. Familie und Arbeit', historicalFigures: '11. Angehörige der Familie' },
    sections: { overview: text.overview, history: text.history, values: text.values,
      holdings: text.holdings, traditions: text.household,
      knighthood: text.tradeDescription, succession: text.succession,
      cultureReligion: 'Die Familie gehört zu den Rheunwaith im Gwynthorer Bannkreis. Besondere religiöse Familienbräuche sind nicht überliefert.',
      conflictsAlliances: text.relations, court: text.household,
      familyTree: text.history, historicalFigures: `${family.persons.length} Angehörige sind namentlich bekannt; davon leben ${family.livingCount}. Die Namen der älteren Gründer und der dazwischenliegenden Generationen sind nicht überliefert.` },
    images: { crest: `../Stammbäume/${locality.emblem}`, scene: `..${leaders[0].portrait}`,
      sceneAlt: `${leaders[0].name} · ${leaders[0].role}`,
      banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png' },
    illustrationCategory: `Bürgerliches Familienporträt · ${leaders[0].name}`,
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    founder: null, headsTitle: text.headsTitle, headsNote: '', heads: leaders.map(card), heirs: [],
    officesTitle: 'Arbeiten im gemeinsamen Familienbetrieb',
    offices: living.filter(person => !leaders.includes(person) && person.age >= 16).map(card),
    currentHead: leaders.map(person => person.name).join(' und '), firstHeir: '', cadets: [], allies: [],
    figuresTitle: name, figuresMobileLayout: 'stacked',
    figures: family.persons.map(person => ({ ...card(person), description: `${person.age} Jahre${person.status === 'dead' ? ' bei ihrem Tod' : ''}. ${person.bio}` })),
    relatedRecords: [{ title: family.placeName, text: locality.description,
      link: `../Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis&pin=${locality.pinId}`,
      icon: `../Stammbäume/${locality.emblem}` }, ...(text.relatedRecords || []).map(record => ({
        ...record, icon: record.icon || `../Stammbäume/${locality.emblem}`
      }))],
    trivia: text.trivia
  };
}
