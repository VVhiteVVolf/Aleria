// Editorial projection for the five newly recorded guard families.
// The named people and all genealogy remain owned by the family data source.
import { DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS, DRAIG_GARDE_COMMONER_HOUSE_FAMILIES } from '../../../Stammbäume/assets/js/data/draig-garde-house-families.js';
import { DRAIG_GARDE_BRANDYDDYN_RELATIONS, DRAIG_GARDE_PEOPLE_BY_ID } from '../../../Stammbäume/assets/js/data/draig-garde-people.js';

export function createDraigGardeHouseContent(slug) {
  const definition = DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS.find(record => record.slug === slug);
  const family = DRAIG_GARDE_COMMONER_HOUSE_FAMILIES.find(record => record.document.id === `haus-${slug}`);
  if (!definition || !family) throw new Error(`Unbekanntes Haus der Draig-Garde: ${slug}`);
  const guard = family.persons.filter(person => definition.members.includes(person.id));
  const head = family.persons.find(person => person.lineageRole === 'head');
  const heir = family.persons.find(person => person.title === 'Erbe');
  const people = family.persons.filter(person => person.portrait || person.title);
  const card = person => ({
    id: person.id, familyId: family.document.id, name: person.name, role: person.title,
    image: person.portrait ? `../Stammbäume/${person.portrait}` : '',
    silhouette: person.sex === 'female' ? 'female' : 'male',
    description: person.notes
  });
  const overview = `${family.document.title} ist eine bürgerliche Kriegerfamilie aus Gwynthor-Stadt. ${guard.map(person => person.name).join(', ')} ${guard.length === 1 ? 'dient' : 'dienen'} in der Draig-Leibgarde.`;
  const rank = definition.martial
    ? 'Das Haus wartet noch auf seine Erhebung. Einzelne Angehörige führen bereits persönliche Rittertitel.'
    : 'Das Haus gehört zu den bürgerlichen Häusern Gwynthors. Ein eigener Ritterhausrang ist nicht belegt.';
  const ancestorId = family.timeJumps[0].childIds[0];
  const ancestor = family.persons.find(person => person.id === ancestorId);
  const history = `Auf das unbekannte Gründerpaar und das Hauswappen folgt eine Überlieferungslücke. Die namentlich bekannte Linie beginnt mit ${ancestor.name} (${ancestor.birth}–${ancestor.death}).`;
  const isBrandyddyn = slug === 'brandyddyn';
  const relations = isBrandyddyn
    ? DRAIG_GARDE_BRANDYDDYN_RELATIONS
    : slug === 'curiad'
      ? 'Marared Curiad führt die Leibgarde als Hauptmann. Seine Söhne Mathon und Morcant dienen dort als Ritter und Leibgardist.'
      : `${guard[0].name} gehört zur Leibgarde des Hauses Draig.`;
  const emblem = `${definition.emblemDescription} Der geschlossene Eisenring trägt ein keltisches Knotenmuster. Die Symbolik ist ein neu gestaltetes Hauszeichen; aus ihr werden keine zusätzlichen Berufe, Besitzungen oder historischen Ereignisse abgeleitet.`;
  const primary = { ...card(guard[0]), role: DRAIG_GARDE_PEOPLE_BY_ID[guard[0].id].role };
  const succession = `${head.name} ist das Oberhaupt. ${heir.name} ist der Erbe.`;
  const guardOffices = guard.map(person => ({ ...card(person), role: DRAIG_GARDE_PEOPLE_BY_ID[person.id].role }));
  const houseOffices = isBrandyddyn ? people.filter(person => person.title.includes('der Draig')).map(card) : [];
  return {
    id: family.document.id, name: family.document.title, type: 'Bürgerliches Haus',
    page: 'kleinehaeuser.html', county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: '',
    territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
    extinct: false, showMotto: false, registerPage: true, prepared: false,
    contentVersion: '20261124-gwynthor-kriegerfamilien-v2',
    biographySourceRevision: family.extensions.sourceRevision,
    ...(isBrandyddyn ? { biographyPreviousDefaultFingerprints: ['3396:bc6d84f5:38ca1fa3'] } : {}),
    biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Herkunft der Familie',
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
      succession,
      court: [...guardOffices, ...houseOffices].map(person => `${person.name} · ${person.role}`).join('\n'),
      familyTree: family.document.description,
      historicalFigures: 'Die Karten führen zu den jeweiligen Personen im Stammbaum.'
    },
    images: {
      crest: `../Stammbäume/${family.document.emblem}`,
      scene: primary.image, sceneAlt: `${primary.name} · ${primary.role}`,
      banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png'
    },
    illustrationCategory: 'Bekannter Angehöriger der Draig-Leibgarde',
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    founder: null, heads: [card(head)], heirs: [card(heir)],
    offices: [...guardOffices, ...houseOffices], officesTitle: 'Dienst bei den Draig',
    currentHead: head.name, firstHeir: heir.name, cadets: [], allies: [],
    figuresTitle: 'Namentlich bekannte Angehörige', figuresMobileLayout: 'stacked', figures: people.map(card),
    relatedRecords: [{ title: 'Draig Leibgarde', text: 'Die belegten Gardeämter der Angehörigen.',
      link: '../AleriaAlmanach/AleriaAlmanach.html?entry=draig-leibgarde', icon: '../AleriaAlmanach/public/assets/draig-leibgarde/drachengarde-wappen-elfenbein-v1.png' }],
    trivia: [definition.emblemDescription]
  };
}
