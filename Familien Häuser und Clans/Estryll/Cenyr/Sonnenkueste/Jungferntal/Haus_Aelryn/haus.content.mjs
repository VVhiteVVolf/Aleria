// Bestehende vorbereitete Hausakte; keine neue Gründerchronik oder Genealogie.
export const HOUSE_CONTENT = {
  id: 'haus-aelryn', name: 'Haus Aelryn', type: 'Ritterhaus', page: 'kleinehaeuser.html',
  county: 'Sonnenküste', liege: "Haus Morforwyn O'Carngol", territoryId: 'baronie-jungferntal', territoryName: 'Jungferntal',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/Baronie Jungferntal/Baronie Jungferntal.html',
  parentHouseId: 'haus-morforwyn', extinct: false, showMotto: false, registerPage: true, prepared: true,
  contentVersion: '20261103-sonnenkueste-v1', biographySourceRevision: 1, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Aelryn ist ein Ritterherrenhaus aus Carngol in der Baronie Jungferntal. Es gehört zum örtlichen Ritterstand der Sonnenküste, dient unmittelbar Haus Morforwyn und führt ein meeresgrünes Dreizackwappen mit Muschel.',
    history: 'Die Familienakte ist vorbereitet. Das vorhandene unbekannte Gründerpaar bleibt bestehen; namentliche frühe Generationen, ein Gründungsjahr und eine gesicherte Chronik sind bisher nicht ausgearbeitet.',
    character: 'Das runde Wappen zeigt einen Dreizack, eine Muschel und Wellen auf meeresgrünem Grund. Es setzt damit einen eigenen Akzent innerhalb der gewässerbezogenen Heraldik des Jungferntals. Eine neue Verwandtschaft zu den Morforwyn oder eine eigene Meerjungfrauenabstammung ist damit nicht belegt.',
    culture: 'Eigene religiöse Hausbräuche und benannte Schutzpatrone sind bisher nicht überliefert. Die örtliche Kultur gehört zum cenyrischen Jungferntal; weitergehende Besonderheiten bleiben offen.',
    relations: 'Der unmittelbare Dienst unter Morforwyn folgt der aktuellen Festlegung. Carngol bleibt der tatsächliche Wohnort. Namentliche Oberhäupter, eine Erbfolge, weitere Verbindungen oder konkrete Fehden werden ohne Quellen nicht ergänzt.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' }, { type: 'Grafschaft', name: 'Sonnenküste', slug: 'sonnenkueste' },
    { type: 'Baronie', name: 'Jungferntal', slug: 'jungferntal' }, { type: 'Sitz', name: 'Carngol', slug: 'carngol' },
    { type: 'Haus', name: 'Haus Aelryn', slug: 'haus-aelryn' }
  ],
  profile: {
    highestTitle: 'Ritterherr', rank: 'Ritterherr', houseType: 'Ritterherrenhaus', motto: '', quoteAuthor: '',
    seat: 'Carngol', affiliation: 'Jungferntal · Sonnenküste', liege: "Haus Morforwyn O'Carngol",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '',
    people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: ''
  }, omitMilitaryProfile: true,
  sections: {
    overview: 'Haus Aelryn ist ein Ritterherrenhaus aus Carngol im Jungferntal und dient unmittelbar Haus Morforwyn. Sein bestehender Name und das meeresgrüne Dreizackwappen mit Muschel werden weitergeführt.',
    history: 'Ein Gründungsjahr, namentliche frühe Generationen und eine ausgearbeitete Hauschronik sind bisher nicht überliefert.',
    traditions: 'Eigene Feste, Rituale und Hausbräuche sind noch nicht ausgearbeitet.',
    knighthood: 'Das Haus gehört zum cenyrischen Ritterstand. Eine besondere eigene Ausbildung oder Ausrüstungstradition ist bisher nicht überliefert.',
    holdings: 'Der belegte Wohn- und Stammsitz ist Carngol. Weitere Güter und benannte Außenorte sind nicht bekannt.',
    cultureReligion: 'Die örtliche Einordnung liegt im cenyrischen Jungferntal. Eigene Schutzpatrone und religiöse Hausbräuche sind bisher nicht überliefert.',
    conflictsAlliances: 'Unmittelbarer Lehnsherr ist Haus Morforwyn. Weitere förmliche Bündnisse und Fehden sind nicht benannt.',
    values: 'Das Wappen zeigt Dreizack, Muschel und Wellen. Ein verbindlicher Hausleitspruch und eine besondere Abstammungsgeschichte sind bisher nicht ausgearbeitet.',
    succession: 'Namentliche Erben sind bisher nicht überliefert.', court: 'Namentliche Oberhäupter und Hofangehörige sind noch nicht ausgearbeitet.',
    familyTree: 'Die bestehende vorbereitete Aelryn-Akte ist eingebettet. Das vorhandene unbekannte Gründerpaar bleibt unverändert.',
    historicalFigures: 'Historische Persönlichkeiten sind bisher nicht ausgearbeitet.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/haus-aelryn.png',
    scene: 'Estryll/Cenyr/Sonnenkueste/Jungferntal/Haus_Aelryn/assets/hausdarstellung-2026-11-03.png', sceneAlt: 'Ritterliche Hausdarstellung der Aelryn mit meeresgrünem Dreizack- und Muschelwappen',
    banner: '../Stammbäume/assets/images/regions/Cenyr/Sonnenküste/Jungferntal.png'
  }, illustrationCategory: 'Hausdarstellung', cadets: [], founder: null, heads: [], heirs: [], offices: [],
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: [], currentHead: 'Nicht benannt', firstHeir: ''
};
