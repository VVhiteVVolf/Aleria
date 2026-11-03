// Bestehende vorbereitete Hausakte; keine neue Gründerchronik oder Genealogie.
export const HOUSE_CONTENT = {
  id: 'haus-rhelian', name: 'Haus Rhelian', type: 'Ritterhaus', page: 'kleinehaeuser.html',
  county: 'Sonnenküste', liege: "Haus Morforwyn O'Carngol", territoryId: 'baronie-jungferntal', territoryName: 'Jungferntal',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/Baronie Jungferntal/Baronie Jungferntal.html',
  parentHouseId: 'haus-morforwyn', extinct: false, showMotto: false, registerPage: true, prepared: true,
  contentVersion: '20261103-sonnenkueste-v1', biographySourceRevision: 1, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Rhelian ist ein Ritterherrenhaus aus Carngol im Jungferntal an der Sonnenküste. Es gehört zu den örtlichen Ritterhäusern unter den Morforwyn und führt ein schieferblaues Dreizackwappen.',
    history: 'Die Familienakte ist vorbereitet, besitzt aber noch keine namentlich ausgearbeitete Gründerfamilie und keine datierte Hauschronik. Der Zeitpunkt der Gründung und einzelne historische Ereignisse bleiben offen.',
    character: 'Das runde Wappen zeigt einen Dreizack und Wellen auf schieferblauem Grund. Das Motiv passt zum Gewässerbezug des Jungferntals und zum Umfeld der Morforwyn. Eine besondere Abstammung oder ein eigener Hausleitspruch sind daraus nicht abzuleiten.',
    culture: 'Die örtliche Einordnung liegt im cenyrischen Jungferntal. Eigene religiöse Bräuche und Hauspatrone sind bisher nicht ausgearbeitet; die besondere Abstammungssage der Morforwyn wird nicht automatisch auf Rhelian übertragen.',
    relations: 'Unmittelbarer Lehnsherr ist nach der aktuellen Festlegung Haus Morforwyn. Der tatsächliche Wohnort bleibt Carngol. Namentliche Oberhäupter, Erben, weitere familiäre Verbindungen und konkrete Fehden sind bislang nicht benannt.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' }, { type: 'Grafschaft', name: 'Sonnenküste', slug: 'sonnenkueste' },
    { type: 'Baronie', name: 'Jungferntal', slug: 'jungferntal' }, { type: 'Sitz', name: 'Carngol', slug: 'carngol' },
    { type: 'Haus', name: 'Haus Rhelian', slug: 'haus-rhelian' }
  ],
  profile: {
    highestTitle: 'Ritterherr', rank: 'Ritterherr', houseType: 'Ritterherrenhaus', motto: '', quoteAuthor: '',
    seat: 'Carngol', affiliation: 'Jungferntal · Sonnenküste', liege: "Haus Morforwyn O'Carngol",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '',
    people: '', wealth: '', religion: '', patronDeities: '', origin: '', cadetBranches: '', allies: '', enemies: ''
  }, omitMilitaryProfile: true,
  sections: {
    overview: 'Haus Rhelian ist ein Ritterherrenhaus aus Carngol im Jungferntal. Es führt ein schieferblaues Dreizackwappen und dient unmittelbar den Morforwyn.',
    history: 'Eine datierte Hausgründung und eine namentlich ausgearbeitete Chronik sind bisher nicht vorhanden.',
    traditions: 'Eigene Feste, Rituale und Hausbräuche sind bisher nicht überliefert.',
    knighthood: 'Das Haus ist als cenyrisches Ritterherrenhaus eingeordnet. Eine besondere eigene Ausbildung oder Ausrüstungstradition ist bisher nicht beschrieben.',
    holdings: 'Der belegte Wohn- und Stammsitz ist Carngol. Eigene Burgen, Außenorte und Betriebe sind nicht benannt.',
    cultureReligion: 'Die örtliche Einordnung liegt im cenyrischen Jungferntal. Eine eigene religiöse Ausrichtung oder besondere Schutzpatrone sind bisher nicht ausgearbeitet.',
    conflictsAlliances: 'Unmittelbarer Lehnsherr ist Haus Morforwyn. Weitere förmliche Bündnisse und Fehden sind nicht bekannt.',
    values: 'Das Wappen zeigt einen Dreizack über Wellen. Ein gesicherter Hausleitspruch und ein eigener ausgearbeiteter Wertekanon fehlen bisher.',
    succession: 'Namentliche Erben sind noch nicht ausgearbeitet.', court: 'Namentliche Oberhäupter und Hofangehörige sind bisher nicht benannt.',
    familyTree: 'Die bestehende vorbereitete Rhelian-Akte ist eingebettet. Ihr vorhandenes Gründerpaar bleibt unverändert.',
    historicalFigures: 'Historische Persönlichkeiten sind bisher nicht ausgearbeitet.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/haus-rhelian.png',
    scene: 'Estryll/Cenyr/Sonnenkueste/Jungferntal/Haus_Rhelian/assets/hausdarstellung-2026-11-03.png', sceneAlt: 'Ritterliche Hausdarstellung der Rhelian mit schieferblauem Dreizackwappen',
    banner: '../Stammbäume/assets/images/regions/Cenyr/Sonnenküste/Jungferntal.png'
  }, illustrationCategory: 'Hausdarstellung', cadets: [], founder: null, heads: [], heirs: [], offices: [],
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: [], currentHead: 'Nicht benannt', firstHeir: ''
};
