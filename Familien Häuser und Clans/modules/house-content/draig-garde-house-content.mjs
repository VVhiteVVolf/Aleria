// Editorial projection for the five newly recorded guard families.
// The named people and all genealogy remain owned by the family data source.
import { DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS, DRAIG_GARDE_COMMONER_HOUSE_FAMILIES } from '../../../Stammbäume/assets/js/data/draig-garde-house-families.js';

export function createDraigGardeHouseContent(slug) {
  const definition = DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS.find(record => record.slug === slug);
  const family = DRAIG_GARDE_COMMONER_HOUSE_FAMILIES.find(record => record.document.id === `haus-${slug}`);
  if (!definition || !family) throw new Error(`Unbekanntes Haus der Draig-Garde: ${slug}`);
  const people = family.persons.filter(person => definition.members.includes(person.id));
  const card = person => ({
    id: person.id, familyId: family.document.id, name: person.name, role: person.title,
    image: person.portrait ? `../Stammbäume/${person.portrait}` : '',
    silhouette: person.sex === 'female' ? 'female' : 'male',
    description: person.notes
  });
  const overview = `${family.document.title} ist ein bürgerliches Haus aus Gwynthor. Namentlich bekannt sind ${people.map(person => person.name).join(', ')}. Ihre Ämter sind in der Leibgarde des Hauses Draig verzeichnet.`;
  const rank = definition.martial
    ? 'Das Haus ist kriegerisch geprägt und wartet noch auf seine Erhebung. Persönliche Rittertitel einzelner Angehöriger ändern den bisherigen bürgerlichen Hausrang nicht.'
    : 'Das Haus gehört zu den bürgerlichen Häusern Gwynthors. Ein eigener Ritterhausrang ist nicht belegt.';
  const history = 'Die Namen des älteren Gründerpaares und die dazwischenliegenden Generationen sind nicht überliefert. Die vorbereitete Familienakte führt vom unbekannten Gründerpaar über das Hauswappen und eine Überlieferungslücke zu den ersten namentlich bekannten Angehörigen. Sie ergänzt keine unbekannten Verwandtschaftsgrade oder Lebensdaten.';
  const relations = slug === 'brandyddyn'
    ? 'Pellinard Brândyddyn und Ysabel Bronnor sind Eurgains Eltern. Ysabel bleibt als Angehörige des Ritterhauses Bronnor aus dem Tal der Milane verzeichnet. Eine Ehe oder Verlobung der Eltern ist nicht belegt.'
    : slug === 'curiad'
      ? 'Marared Curiad führt die Leibgarde als Hauptmann, Mathon Curiad dient unter den Rittern und Morcant Curiad als Leibgardist. Ihre genaueren Verwandtschaftsgrade sind nicht belegt.'
      : 'Belegt ist der Dienst des genannten Angehörigen in der Draig-Leibgarde. Weitere familiäre Verbindungen sind bislang nicht überliefert.';
  const emblem = `${definition.emblemDescription} Der geschlossene Eisenring trägt ein keltisches Knotenmuster. Die Symbolik ist ein neu gestaltetes Hauszeichen; aus ihr werden keine zusätzlichen Berufe, Besitzungen oder historischen Ereignisse abgeleitet.`;
  const primary = card(people[0]);
  return {
    id: family.document.id, name: family.document.title, type: 'Bürgerliches Haus',
    page: 'kleinehaeuser.html', county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: '',
    territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
    extinct: false, showMotto: false, registerPage: true, prepared: true,
    contentVersion: '20261112-draig-garde-v1', biographySourceRevision: 1,
    biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Vorbereitete Familienakte',
    biographySummary: { overview: `${overview} ${rank}`, history, character: emblem, relations },
    hierarchy: [
      ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'],
      ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'],
      ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'],
      ['Baronie', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Ort', 'Gwynthor', 'gwynthor'],
      ['Haus', family.document.title, family.document.id]
    ].map(([type, name, slug]) => ({ type, name, slug })),
    profile: {
      highestTitle: 'Bürgerlich', rank: 'Bürgerlich',
      houseType: definition.martial ? 'Kriegerisch geprägtes Bürgerhaus · Erhebung ausstehend' : 'Bürgerliches Haus',
      motto: '', quoteAuthor: '', seat: 'Gwynthor', affiliation: '', liege: 'Haus Draig',
      patron: '', knightingPatron: '', founding: 'Nicht bekannt', milestoneOne: '', milestoneTwo: '',
      people: '', wealth: '', religion: '', patronDeities: '', origin: 'Gwynthor',
      cadetBranches: '', allies: '', enemies: '', troopStrength: '', tiarna: '', kerns: '', fleet: ''
    },
    omitMilitaryProfile: true, familyTreeCompact: true,
    sectionTitles: { court: '8. Bekannte Angehörige', historicalFigures: '11. Figuren des Hauses' },
    sections: {
      overview: `${overview} ${rank}`, history,
      traditions: 'Eigene Hausbräuche sind noch nicht überliefert.',
      knighthood: rank, holdings: 'Eine genaue Wohnstätte, weitere Besitzungen und Einnahmequellen sind nicht belegt.',
      cultureReligion: 'Besondere religiöse Bindungen sind noch nicht überliefert.',
      conflictsAlliances: relations, values: emblem,
      succession: 'Ein Oberhaupt und eine Erbfolge sind nicht festgelegt.',
      court: people.map(person => `${person.name}: ${person.title}.`).join(' '),
      familyTree: `${history} ${relations}`,
      historicalFigures: 'Die folgenden Figuren sind namentlich bekannt. Altersangaben sind ausschließlich Schätzungen nach den aktuellen Portraits.'
    },
    images: {
      crest: `../Stammbäume/${family.document.emblem}`,
      scene: primary.image, sceneAlt: `${primary.name} · ${primary.role}`,
      banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png'
    },
    illustrationCategory: 'Bekannter Angehöriger der Draig-Leibgarde',
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    founder: null, heads: [], heirs: [], offices: [], currentHead: '', firstHeir: '', cadets: [], allies: [],
    figuresTitle: 'Namentlich bekannte Angehörige', figuresMobileLayout: 'stacked', figures: people.map(card),
    relatedRecords: [{ title: 'Draig Leibgarde', text: 'Die belegten Gardeämter der Angehörigen.',
      link: '../AleriaAlmanach/AleriaAlmanach.html?entry=draig-leibgarde', icon: '../AleriaAlmanach/public/assets/draig-leibgarde/drachengarde-wappen-elfenbein-v1.png' }],
    trivia: [definition.emblemDescription]
  };
}
