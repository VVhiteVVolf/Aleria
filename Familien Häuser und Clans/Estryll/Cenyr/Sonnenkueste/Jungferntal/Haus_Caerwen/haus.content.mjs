// Neues Haus gemäß ausdrücklichem Autorenauftrag vom 3. November 2026.
const assetRoot = 'Estryll/Cenyr/Sonnenkueste/Jungferntal/Haus_Caerwen/assets';
const member = (id, name, role, detail = '', silhouette = 'male') => ({ id, familyId: 'haus-caerwen', name, role, detail, silhouette });

export const HOUSE_CONTENT = {
  id: 'haus-caerwen', name: "Haus Caerwen O'Carngol", type: 'Ritterhaus', page: 'kleinehaeuser.html',
  county: 'Sonnenküste', liege: "Haus Morforwyn O'Carngol", territoryId: 'baronie-jungferntal', territoryName: 'Jungferntal',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/Baronie Jungferntal/Baronie Jungferntal.html',
  parentHouseId: 'haus-morforwyn', extinct: false, showMotto: true, registerPage: true, prepared: false,
  contentVersion: '20261103-sonnenkueste-v1', biographySourceRevision: 2, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Caerwen O’Carngol ist ein kleines Ritterherrenhaus im Jungferntal. Es sitzt in Carngol und dient unmittelbar den Morforwyn. Sein Wappen verbindet einen silbernen Dreizack mit einem Erlenblatt auf dunklem Waldgrün. Der Leitspruch „Fest verwurzelt, wach am Wasser“ bezeichnet die Verbindung von verlässlichem Hausdienst, Wald und Gewässern.',
    history: 'Geraint Caerwen begründete den Ritterhaushalt 1698. Zuvor hatte er lange an der Sicherung und Instandhaltung der Wege und Holzstege des Jungferntals mitgewirkt. Das kleine Lehen band diesen Dienst an einen dauerhaften Haushalt. Seine Frau Hedwen ordnete Vorräte und Abrechnungen. Nach Geraints Tod 1716 übernahm sein Sohn Rhydian die Führung.',
    character: 'Die Caerwen halten große Worte für weniger verlässlich als einen erfüllten Auftrag. Ihr Ansehen beruht auf pünktlichen Weggängen, erreichbaren Verbindungen und einem Haushalt, der sich auch auf schlechtes Wetter vorbereitet. Die Erle steht in ihrer Heraldik für festen Halt an feuchten Ufern; der Dreizack verbindet dieses Zeichen mit dem Gewässerbezug des Jungferntals.',
    customs: 'Nach stärkeren Regenfällen prüfen die Angehörigen mit den örtlichen Arbeitsleuten die anvertrauten Wege und Stege. Im Haushalt wird dabei nicht nur über Schäden, sondern auch über notwendige Vorräte Buch geführt. Der jährliche gemeinsame Durchgang vor der nassen Jahreszeit verbindet praktischen Dienst und Familientreffen.',
    holdings: 'Das Haus besitzt einen kleinen Ritterhaushalt in Carngol und ein bescheidenes Lehen im Jungferntal. Die Pflege von Wegen und Holzstegen gehört zu seinen Verpflichtungen. Waldwirtschaft und die Versorgung von Arbeitsleuten und Fuhrleuten prägen seinen Alltag; eine eigene große Burg oder weitere benannte Ortschaften gehören nicht zu seinem Besitz.',
    culture: 'Die Caerwen gehören zur cenyrischen Kultur und zur Alerischen Kirche. Sie verehren die Dame der See und achten die besondere Überlieferung ihrer Morforwyn-Lehnsherrinnen. Im eigenen Haus steht jedoch vor allem die Erfüllung des geschuldeten Dienstes im Mittelpunkt.',
    relations: 'Rhydian führt das Haus gemeinsam mit seiner Frau Mair. Die Kinder Celyn, Meriel und Gwern übernehmen nach und nach Aufgaben; Celyn steht an erster, Gwern an zweiter Stelle der Erbfolge. Rhydians Schwester Eluned lebt mit Cormac und ihrer Tochter Catrin im erweiterten Haushalt. Die Bindung an Morforwyn bleibt die maßgebliche Lehensverbindung.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' }, { type: 'Grafschaft', name: 'Sonnenküste', slug: 'sonnenkueste' },
    { type: 'Baronie', name: 'Jungferntal', slug: 'jungferntal' }, { type: 'Sitz', name: 'Carngol', slug: 'carngol' },
    { type: 'Haus', name: "Haus Caerwen O'Carngol", slug: 'haus-caerwen' }
  ],
  profile: {
    highestTitle: 'Ritterherr', rank: 'Ritterherr', houseType: 'Ritterherrenhaus', motto: 'Fest verwurzelt, wach am Wasser.', quoteAuthor: '',
    seat: 'Carngol', affiliation: 'Jungferntal · Sonnenküste', liege: "Haus Morforwyn O'Carngol",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '1698', milestoneOne: '1716 · Rhydian übernimmt das Haus', milestoneTwo: '', patron: '', knightingPatron: '',
    people: 'Cenyri', wealth: 'Bescheiden', religion: 'Alerische Kirche', patronDeities: 'Die Dame der See', origin: 'Ritterdienst Geraint Caerwens im Jungferntal', cadetBranches: '', allies: '', enemies: ''
  }, omitMilitaryProfile: true,
  sections: {
    overview: 'Die Caerwen sind ein kleines Ritterherrenhaus aus Carngol. Ihr unmittelbarer Dienst gilt den Morforwyn. Mit dem Wald und den Gewässern des Jungferntals verbinden sie ihr silbernes Dreizack- und Erlenblattwappen auf dunklem Grün.',
    history: ['Geraint Caerwen begründete das Haus 1698 nach langjährigem Dienst an den Wegen und Holzstegen des Jungferntals. Mit einem kleinen Lehen erhielt die Aufgabe einen dauerhaften Ritterhaushalt in Carngol. Hedwen führte dessen Vorräte und Abrechnungen.', 'Nach Geraints Tod 1716 trat Rhydian an die Spitze. Er setzte den praktischen Dienst fort und bezog nach und nach seine Kinder und den Haushalt seiner Schwester Eluned ein.'],
    traditions: 'Vor der nassen Jahreszeit geht die Familie die anvertrauten Verbindungen gemeinsam durch. Nach stärkeren Regenfällen folgen weitere Kontrollen. Schäden, notwendige Arbeiten und fehlende Vorräte werden schriftlich festgehalten. Der gemeinsame Durchgang ist zugleich ein fester Anlass, an dem der erweiterte Haushalt zusammenkommt.',
    knighthood: 'Die Caerwen folgen dem cenyrischen Rittertum mit Salbung am Gewässer und den Eiden auf die Neun Göttlichen und die Dame der See. Ihr Ritterdienst ist auf den Schutz örtlicher Verbindungen und die verlässliche Begleitung notwendiger Arbeiten ausgerichtet. Der kleine Haushalt bewertet Wachsamkeit und Ausdauer höher als prunkvolles Auftreten.',
    holdings: 'Der Sitz des Hauses liegt in Carngol. Ein kleines Lehen im Jungferntal trägt den Ritterhaushalt; Waldwirtschaft und die Versorgung der für Wege und Stege eingesetzten Leute gehören zum Alltag. Das Haus besitzt keine zusätzlich benannte Burg oder eigenständige Ortschaft.',
    cultureReligion: 'Die Caerwen gehören zur cenyrischen Kultur und zur Alerischen Kirche. Der Dame der See gelten Gebete vor schwierigen Weggängen bei Hochwasser. Die besondere Überlieferung der Morforwyn wird respektiert, ohne eine neue gemeinsame Abstammung zu behaupten.',
    conflictsAlliances: 'Haus Morforwyn ist der unmittelbare Lehnsherr. Die Caerwen stimmen ihren Dienst mit den örtlichen Fuhrleuten und Arbeitsleuten ab. Eine besondere Fehde oder ein förmliches zusätzliches Bündnis ist nicht festgelegt.',
    values: 'Der Leitspruch „Fest verwurzelt, wach am Wasser“ verbindet Beständigkeit mit Aufmerksamkeit. Ein versprochener Dienst soll erfüllt werden; notwendige Arbeiten und Vorräte werden nicht bis zum ersten Unwetter aufgeschoben.',
    succession: 'Celyn ist der erste Erbe Rhydians; Gwern folgt an zweiter Stelle. Meriel arbeitet bereits in der Haushaltsverwaltung mit.',
    court: 'Rhydian führt den Ritterdienst. Mair verwaltet den Haushalt, Eluned betreut Versorgung und Lieferabsprachen, Meriel unterstützt den Schriftverkehr. Es handelt sich um Aufgaben eines kleinen Ritterhaushalts, nicht um einen vollständigen Grafenhof.',
    familyTree: 'Der Stammbaum des Hauses Caerwen mit drei ausgearbeiteten Generationen ist hier eingebettet.',
    historicalFigures: 'Geraint und Hedwen begründeten den Ritterhaushalt. Ihre Familie wird in der bestehenden Hausakte geführt.'
  },
  images: { crest: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/haus-caerwen.png', scene: `${assetRoot}/hausdarstellung-2026-11-03.png`, sceneAlt: 'Caerwen-Hausritter mit silbernem Dreizack und Erlenblatt auf Waldgrün', banner: '../Stammbäume/assets/images/regions/Cenyr/Sonnenküste/Jungferntal.png' },
  illustrationCategory: 'Hausdarstellung', cadets: [], founder: member('geraint-caerwen', 'Geraint Caerwen', 'Gründer und erster Ritterherr', '1698–1716'),
  heads: [member('geraint-caerwen', 'Geraint Caerwen', 'Ritterherr', '1698–1716'), member('rhydian-caerwen', 'Rhydian Caerwen', 'Ritterherr', 'Seit 1716')],
  heirs: [member('celyn-caerwen', 'Celyn Caerwen', 'Erster Erbe'), member('gwern-caerwen', 'Gwern Caerwen', 'Zweiter Erbe')],
  offices: [member('mair-caerwen-spouse', 'Mair', 'Hausverwaltung', '', 'female'), member('eluned-caerwen', 'Eluned Caerwen', 'Versorgung und Lieferabsprachen', '', 'female'), member('meriel-caerwen', 'Meriel Caerwen', 'Schriftverkehr', '', 'female')],
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: ['Die Erle steht im Hauswappen für Halt an feuchten Ufern.'], currentHead: 'Rhydian Caerwen', firstHeir: 'Celyn Caerwen'
};
