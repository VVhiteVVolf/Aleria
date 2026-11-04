// Gemeinsame redaktionelle Quelle; Quellenentscheidungen stehen im Hausordner.
// Platzhalter, genealogische Tabelle und Stammbaumgrafik des Originals bleiben unübernommen.
import { HOUSE_SLIABH_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-sliabh-portraits.js';

const assetRoot = 'Estryll/Cenyr/Tal_der_Milane/Schwalbenhort/Haus_Sliabh/assets';
const portrait = id => HOUSE_SLIABH_PORTRAITS[id] ? `../Stammbäume/${HOUSE_SLIABH_PORTRAITS[id]}` : '';
const member = (id, name, role, detail = '') => ({ id, familyId: 'haus-sliabh', name, role, detail, image: portrait(id) });

export const HOUSE_CONTENT = {
  id: 'haus-sliabh', name: "Haus Sliabh O'Caer Gwennol", type: 'Ritterhaus', page: 'kleinehaeuser.html',
  county: 'Tal der Milane', liege: "Haus Ilyuncu O'Caer Gwennol", territoryId: 'schwalbenhort', territoryName: 'Schwalbenhort',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane/Herrschaft Schwalbenhort/Herrschaft Schwalbenhort.html',
  parentHouseId: 'haus-ilyuncu', extinct: false, showMotto: true, registerPage: true, prepared: false,
  contentVersion: '20261103-tal-der-milane-v1', biographySourceRevision: 2, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Sliabh O’Caer Gwennol ist ein niederes Ritterherrenhaus im Schwalbenhort der Grafschaft Tal der Milane. Die Familie stammt aus Ceitheach, wo ihre Angehörigen als einfache Bergleute lebten. Merfyn Aderyn führte sie nach Cenyr. Heute stehen die Sliabh als unmittelbare Vasallen unter Haus Ilyuncu.',
    history: 'Das Haus wurde 1720 unter Odhran begründet. Der Schritt vom Bergarbeitergeschlecht zum niederen Ritteradel ist der belegte Ausgangspunkt seiner Geschichte. Konkrete spätere Ereignisse beschreibt die überlieferte Hausquelle noch nicht.',
    character: 'Der überlieferte Leitspruch lautet „Tannau’n Clymu Popeth“ – „Fasern binden alles“. Ein weiter ausgearbeiteter eigener Wertekanon und besondere Haustraditionen sind bisher nicht beschrieben.',
    relations: 'Odhran steht an der Spitze der Familie; als Erben sind Gormán und Haodh verzeichnet. Die Bindung an Haus Ilyuncu und der Stammsitz Caer Gwennol folgen der bestehenden Hausakte. Einzelne Güter, eine besondere religiöse Ausrichtung und benannte Hofämter sind bislang nicht überliefert.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Tal der Milane', slug: 'tal-der-milane' },
    { type: 'Region', name: 'Schwalbenhort', slug: 'schwalbenhort' },
    { type: 'Sitz', name: 'Caer Gwennol', slug: 'caer-gwennol' },
    { type: 'Haus', name: "Haus Sliabh O'Caer Gwennol", slug: 'haus-sliabh' }
  ],
  profile: {
    highestTitle: 'Ritterherr', rank: 'Ritterherr', houseType: 'Niederes Ritterherrenhaus',
    motto: "Tannau'n Clymu Popeth – Fasern binden alles.", quoteAuthor: '',
    seat: 'Caer Gwennol', affiliation: 'Schwalbenhort · Tal der Milane', liege: "Haus Ilyuncu O'Caer Gwennol",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '1720', milestoneOne: '', milestoneTwo: '',
    patron: '', knightingPatron: '', people: 'Alben', wealth: '', religion: '', patronDeities: '',
    origin: 'Bergarbeitergeschlecht aus Ceitheach', cadetBranches: '', allies: '', enemies: ''
  },
  omitMilitaryProfile: true,
  sections: {
    overview: 'Die Sliabh sind eine Ritterfamilie aus Caer Gwennol. Sie stammen aus Ceitheach und lebten dort als einfache Bergleute. Merfyn Aderyn nahm die Familie mit nach Cenyr. Ihre heutige Stellung ist die eines niederen Ritterherrenhauses unter Haus Ilyuncu.',
    history: 'Odhran begründete das Haus 1720. Die bestehende Hausakte beschreibt damit den Aufstieg einer aus Ceitheach stammenden Bergarbeiterfamilie in den niederen cenyrischen Ritteradel. Weitere Epochen und Ereignisse sind in der Hausquelle noch nicht ausgearbeitet.',
    traditions: 'Eigene Haustraditionen und Feste sind bisher nicht beschrieben.',
    knighthood: 'Die bestehende Hausakte führt die Sliabh als niederes Ritterherrenhaus. Eine besondere Ritterausbildung, ein namentlicher Rittervater und die Einzelheiten der Erhebung sind in der Hausquelle nicht ausgearbeitet. Die gelieferte Darstellung zeigt einen gerüsteten Hauskrieger mit Schwert und Rundschild.',
    holdings: 'Der belegte Stammsitz ist Caer Gwennol. Einzelne Höfe, Bergwerke oder andere eigene Besitzungen sind bisher nicht benannt; die bergmännische Herkunft allein begründet keine zusätzlichen Güter.',
    cultureReligion: 'Die Quelle bezeichnet die Sliabh als Alben aus Ceitheach. Eine eigene religiöse Ausrichtung, besondere Schutzpatrone und religiöse Hausbräuche sind noch nicht überliefert.',
    conflictsAlliances: 'Haus Ilyuncu ist der unmittelbare Lehnsherr. Weitere förmliche Bündnisse und Fehden werden in der Quelle nicht benannt.',
    values: 'Der überlieferte Hausleitspruch lautet „Tannau’n Clymu Popeth“ – „Fasern binden alles“. Eine zusätzliche Deutung oder ein eigener Ehrenkodex sind bisher nicht ausgearbeitet.',
    succession: 'Gormán und Haodh sind als erster und zweiter Erbe verzeichnet. Ihre Karten führen zu den vorhandenen Angehörigen im bereits ausgearbeiteten Stammbaum.',
    court: 'Odhran ist als Gründer und Oberhaupt benannt. Die alte Hausvorlage enthält keine konkret bezeichneten Dienststellen oder benannten Bediensteten.',
    familyTree: 'Der bereits ausgearbeitete Sliabh-Stammbaum ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
    historicalFigures: 'Eine gesonderte Überlieferung historischer Persönlichkeiten ist bisher nicht ausgearbeitet.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Tal der Milane/Schwalbenhort/haus-sliabh.png',
    scene: `${assetRoot}/hausdarstellung-original.png`, sceneAlt: 'Originale Hausdarstellung der Sliabh mit dunkler Rüstung, ockerfarbenen Einfassungen, Schwert und Vogelschild',
    banner: '../Stammbäume/assets/images/regions/Cenyr/Tal der Milane/Schwalbenhort.png'
  },
  illustrationCategory: 'Hausdarstellung', cadets: [],
  founder: member('odhran-sliabh', 'Odhran Sliabh', 'Gründer', 'Gründung des Hauses 1720'),
  heads: [member('odhran-sliabh', 'Odhran Sliabh', 'Ritterherr', 'Seit 1720')],
  heirs: [member('gorman-sliabh', 'Gormán Sliabh', 'Erster Erbe'), member('haodh-sliabh', 'Haodh Sliabh', 'Zweiter Erbe')],
  offices: [], figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [],
  trivia: ['Die Familie war in Ceitheach zunächst ein einfaches Bergarbeitergeschlecht.'],
  currentHead: 'Odhran Sliabh', firstHeir: 'Gormán Sliabh'
};
