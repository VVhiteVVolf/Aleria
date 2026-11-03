// Neues Haus gemäß ausdrücklichem Autorenauftrag vom 3. November 2026.
const assetRoot = 'Estryll/Cenyr/Sonnenkueste/Jungferntal/Haus_Nerwynn/assets';
const member = (id, name, role, detail = '', silhouette = 'male') => ({ id, familyId: 'haus-nerwynn', name, role, detail, silhouette });

export const HOUSE_CONTENT = {
  id: 'haus-nerwynn', name: "Haus Nerwynn O'Carngol", type: 'Ritterhaus', page: 'kleinehaeuser.html',
  county: 'Sonnenküste', liege: "Haus Morforwyn O'Carngol", territoryId: 'baronie-jungferntal', territoryName: 'Jungferntal',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/Baronie Jungferntal/Baronie Jungferntal.html',
  parentHouseId: 'haus-morforwyn', extinct: false, showMotto: true, registerPage: true, prepared: false,
  contentVersion: '20261103-sonnenkueste-v1', biographySourceRevision: 2, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Nerwynn O’Carngol ist ein kleines Ritterherrenhaus des Jungferntals im unmittelbaren Dienst der Morforwyn. Der Haushalt sitzt in Carngol. Sein Wappen zeigt einen goldenen Dreizack über drei hellen Flusssteinen auf Indigo; der Leitspruch lautet „Wir halten den Übergang“.',
    history: 'Aneurin Nerwynn begründete den Ritterhaushalt 1706 aus dem Dienst an den kleinen Wasserübergängen im Umfeld Carngols. Die Aufgabe verband Sicherung, Wegkenntnis und die Versorgung von Reisenden. Seine Frau Efa ordnete die Vorräte des Hauses und half, aus dem Dienst einen beständigen Haushalt zu machen. Nach Aneurins Tod 1727 übernahm sein Sohn Cadell.',
    character: 'Die Nerwynn verstehen einen sicheren Übergang als Versprechen, auf das sich andere verlassen können. Sie schätzen ruhige Urteile und genaue Kenntnis von Wegen und Wasserständen. Die drei Steine im Wappen erinnern an festen Tritt über unsicherem Grund; der Dreizack stellt die Verbindung zur Gewässerwelt des Jungferntals her.',
    customs: 'Vor längeren Regenzeiten werden sichere Tritte, Ausweichwege und notwendige Vorräte geprüft. Eine kleine Schale mit drei glatten Steinen steht beim gemeinsamen Abendgebet als Hauszeichen. Sie erinnert an Wachsamkeit, verlässlichen Dienst und die Pflicht, Reisenden keinen leichtfertigen Rat zu geben.',
    holdings: 'Der Besitz besteht aus einem kleinen Ritterhaushalt in Carngol und einem bescheidenen Lehen im Jungferntal. Die Aufsicht über anvertraute örtliche Übergänge und die Unterbringung wartender Reisender gehören zum Hausleben. Weitere benannte Orte oder große befestigte Sitze sind nicht Teil seines Besitzes.',
    culture: 'Die Nerwynn gehören zur cenyrischen Kultur und zur Alerischen Kirche. Ihre Gebete gelten besonders der Dame der See. Die Überlieferung der Morforwyn-Lehnsherrinnen wird geachtet; der eigene Haushalt verbindet seinen Glauben vor allem mit Schutz und Gastlichkeit.',
    relations: 'Cadell führt das Haus, Rhoswen verwaltet Versorgung und Lieferabsprachen. Seine Schwester Gweneth betreut Briefe und die Unterbringung von Reisenden. Owein steht als erster Erbe vor Bleddyn; Iorwen unterstützt den Schriftverkehr. Die Familie bleibt unmittelbar den Morforwyn verpflichtet und besitzt keine besondere festgelegte Fehde.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' }, { type: 'Grafschaft', name: 'Sonnenküste', slug: 'sonnenkueste' },
    { type: 'Baronie', name: 'Jungferntal', slug: 'jungferntal' }, { type: 'Sitz', name: 'Carngol', slug: 'carngol' },
    { type: 'Haus', name: "Haus Nerwynn O'Carngol", slug: 'haus-nerwynn' }
  ],
  profile: {
    highestTitle: 'Ritterherr', rank: 'Ritterherr', houseType: 'Ritterherrenhaus', motto: 'Wir halten den Übergang.', quoteAuthor: '',
    seat: 'Carngol', affiliation: 'Jungferntal · Sonnenküste', liege: "Haus Morforwyn O'Carngol",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '1706', milestoneOne: '1727 · Cadell übernimmt das Haus', milestoneTwo: '', patron: '', knightingPatron: '',
    people: 'Cenyri', wealth: 'Bescheiden', religion: 'Alerische Kirche', patronDeities: 'Die Dame der See', origin: 'Aneurin Nerwynns Dienst an den örtlichen Wasserübergängen', cadetBranches: '', allies: '', enemies: ''
  }, omitMilitaryProfile: true,
  sections: {
    overview: 'Die Nerwynn sind ein Ritterherrenhaus aus Carngol im Jungferntal und dienen unmittelbar den Morforwyn. Ihr goldener Dreizack über drei hellen Flusssteinen auf Indigo steht für die Sicherung verlässlicher Übergänge.',
    history: ['Aneurin Nerwynn begründete das Haus 1706 aus dem Dienst an den kleinen Wasserübergängen im Umfeld Carngols. Mit Efa baute er einen dauerhaften Haushalt auf, der Sicherung und Versorgung verband.', 'Seit Aneurins Tod 1727 führt Cadell das Haus. Er bewahrt die örtliche Wegkenntnis seines Vaters und arbeitet dabei mit Rhoswen und seiner Schwester Gweneth zusammen.'],
    traditions: 'Drei glatte Steine in einer kleinen Schale begleiten das gemeinsame Abendgebet. Sie erinnern an festen Tritt, Wachsamkeit und Verantwortung gegenüber Reisenden. Vor längeren Regenzeiten werden Wege, Vorräte und sichere Ausweichmöglichkeiten sorgfältig geprüft.',
    knighthood: 'Der Ritterdienst folgt dem cenyrischen Brauch mit Salbung am Gewässer und Eiden auf die Neun Göttlichen und die Dame der See. Die Nerwynn verbinden ihn mit Wachsamkeit, genauer Kenntnis ihrer örtlichen Wege und der Bereitschaft, bei schwierigen Übergängen selbst Verantwortung zu übernehmen.',
    holdings: 'Der Ritterhaushalt sitzt in Carngol und wird von einem kleinen Lehen im Jungferntal getragen. Die anvertrauten örtlichen Übergänge gehören zu seinem Dienstbereich; bei schlechtem Wetter hilft der Haushalt, wartende Reisende unterzubringen. Eine zusätzliche benannte Burg oder Ortschaft wird nicht beansprucht.',
    cultureReligion: 'Die Nerwynn sind Cenyri und Angehörige der Alerischen Kirche. Die Dame der See wird besonders um Schutz an unsicheren Gewässern gebeten. Gastlichkeit und ein verlässlicher Rat gelten als alltägliche Ausdrucksformen dieser Verehrung.',
    conflictsAlliances: 'Die unmittelbare Lehensbindung gilt Haus Morforwyn. Weitere besondere Bündnisse oder Fehden sind nicht festgelegt. Die örtliche Zusammenarbeit dient vor allem der Sicherung und Versorgung der Reisenden.',
    values: '„Wir halten den Übergang“ ist ein Versprechen auf Verlässlichkeit. Wer einem Reisenden einen Weg weist, soll Wasserstand und Boden kennen. Geduld und ein ruhiges Urteil stehen über vorschnellen Zusagen.',
    succession: 'Owein ist der erste Erbe Cadells, Bleddyn der zweite. Iorwen unterstützt bereits Gweneth bei Briefen und Lieferlisten.',
    court: 'Cadell führt den Ritterdienst. Rhoswen verwaltet Versorgung und Lieferabsprachen; Gweneth betreut Schriftverkehr und Gäste. Die Familie führt einen kleinen Ritterhaushalt.',
    familyTree: 'Der Stammbaum des Hauses Nerwynn mit drei ausgearbeiteten Generationen ist hier eingebettet.',
    historicalFigures: 'Aneurin und Efa begründeten den Ritterhaushalt. Ihre Familie wird in der bestehenden Hausakte geführt.'
  },
  images: { crest: '../Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/haus-nerwynn.png', scene: `${assetRoot}/hausdarstellung-2026-11-03.png`, sceneAlt: 'Nerwynn-Hausritter mit goldenem Dreizack über drei hellen Flusssteinen auf Indigo', banner: '../Stammbäume/assets/images/regions/Cenyr/Sonnenküste/Jungferntal.png' },
  illustrationCategory: 'Hausdarstellung', cadets: [], founder: member('aneurin-nerwynn', 'Aneurin Nerwynn', 'Gründer und erster Ritterherr', '1706–1727'),
  heads: [member('aneurin-nerwynn', 'Aneurin Nerwynn', 'Ritterherr', '1706–1727'), member('cadell-nerwynn', 'Cadell Nerwynn', 'Ritterherr', 'Seit 1727')],
  heirs: [member('owein-nerwynn', 'Owein Nerwynn', 'Erster Erbe'), member('bleddyn-nerwynn', 'Bleddyn Nerwynn', 'Zweiter Erbe')],
  offices: [member('rhoswen-nerwynn-spouse', 'Rhoswen', 'Hausverwaltung', '', 'female'), member('gweneth-nerwynn', 'Gweneth Nerwynn', 'Schriftverkehr und Gäste', '', 'female')],
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: ['Drei glatte Steine begleiten das Abendgebet des Hauses.'], currentHead: 'Cadell Nerwynn', firstHeir: 'Owein Nerwynn'
};
