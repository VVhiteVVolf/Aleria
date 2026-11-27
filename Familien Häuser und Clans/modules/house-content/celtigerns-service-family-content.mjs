import { getCeltigernsWachtFamilySource } from '../../../Stammbäume/assets/js/data/celtigerns-wacht-families/family-sources.js';

const placeRoot = '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht';
const localImage = path => `../Stammbäume/${path}`;
const patronBanner = name => `Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_${name}/assets/herrschaftsbanner.png`;

export function celtigernsFamilyMember(slug, id) {
  const source = getCeltigernsWachtFamilySource(slug);
  const person = source?.people.find(member => member.id === id);
  if (!person) throw new Error(`Unbekanntes Familienmitglied: ${slug}/${id}`);
  return {
    id: person.id,
    familyId: source.id,
    name: person.name,
    image: localImage(source.portraits[person.id]),
    role: person.title || 'Familienmitglied',
    detail: person.age ? `${person.age} Jahre` : person.ageEstimate || '',
    description: person.bio,
  };
}

export function createCeltigernsServiceFamilyContent(slug, { affiliation, sections, biographySummary, relatedRecords = [] }) {
  const source = getCeltigernsWachtFamilySource(slug);
  const commoner = source.rank === 'commoner';
  const rank = commoner ? 'Bürgerliche Familie' : 'Einfache Ritterfamilie';
  const type = commoner ? 'Bürgerliches Haus' : 'Ritterhaus';
  const territoryName = `Herrschaft der ${source.patron}`;
  const patronId = source.patron.toLowerCase();
  const figures = source.people.map(person => celtigernsFamilyMember(slug, person.id));
  const head = figures.find(person => person.id === source.head);

  return {
    id: source.id,
    name: source.title,
    type,
    page: 'kleinehaeuser.html',
    county: 'Celtigerns Wacht',
    territoryId: `herrschaft-${patronId}`,
    territoryName,
    territoryHref: `${placeRoot}/${territoryName}/${territoryName}.html`,
    showMotto: false,
    registerPage: true,
    omitMilitaryProfile: true,
    contentVersion: '20261127',
    biographySourceRevision: 1,
    biographyIntroTitle: commoner ? 'Über die Familie' : 'Über das Haus',
    biographyHistoryTitle: 'Geschichte',
    biographySummary: { overview: source.summary, ...biographySummary },
    hierarchy: [
      { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
      { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
      { type: 'Grafschaft', name: 'Celtigerns Wacht', slug: 'celtigerns-wacht' },
      { type: 'Herrschaft', name: territoryName, slug: `herrschaft-${patronId}` },
      { type: commoner ? 'Familie' : 'Haus', name: source.title, slug: source.id },
    ],
    profile: { highestTitle: rank, rank, houseType: type, seat: source.seat || 'Offen', affiliation },
    sections: {
      overview: source.summary,
      traditions: 'Besondere Bräuche sind offen.',
      holdings: 'Genauer Familiensitz und Besitz sind offen.',
      conflictsAlliances: affiliation + '.',
      values: biographySummary.character,
      historicalFigures: 'Die Porträts führen zu den Personenakten im Stammbaum.',
      ...sections,
      familyTree: 'Der Stammbaum zeigt die bekannten Angehörigen und die belegten Familienverbindungen. Ältere Generationen bleiben offen.',
    },
    sectionTitles: { historicalFigures: 'Bekannte Angehörige' },
    images: {
      crest: localImage(source.emblem),
      scene: localImage(source.figure),
      sceneAlt: source.figureLabel,
      banner: patronBanner(source.patron),
    },
    illustrationCategory: commoner && slug !== 'mur' ? 'Bürgerliche Hausdarstellung' : 'Kriegerdarstellung',
    founder: null,
    heads: head ? [head] : [],
    headsTitle: 'Familienoberhaupt',
    headsNote: 'Gegenwärtig belegtes Oberhaupt.',
    currentHead: head?.name || 'Offen',
    heirs: [],
    offices: [],
    figuresTitle: 'Überlieferte Familienmitglieder',
    figuresMobileLayout: 'stacked',
    figures,
    allies: [],
    cadets: [],
    trivia: [],
    familyTreeCompact: true,
    relatedRecords: [
      {
        icon: localImage(`assets/images/houses/Llamreis Ankunft/haus-${patronId}.png`),
        title: `Haus ${source.patron}`,
        text: affiliation,
        link: `../Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-${patronId}`,
      },
      ...relatedRecords,
    ],
  };
}
