import { HOUSE_RUDDGRAEN_FAMILY as family, RESALE_PEOPLE } from '../../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
import { RESALE_MODULE_ID, RESALE_SIGN } from './resale-module.mjs';
const overview = 'Die Ruddgraen führen Zum Schiefen Nagel, einen kleinen und günstigen Pferdehandel in Gwynthor-Stadt. Der mürrische Brannoc und seine nörgelnde Frau Edryssa arbeiten mit drei erwachsenen Töchtern und ihrem jüngsten Sohn zusammen. Sie kaufen Gebrauchsmischlinge an und verkaufen sie weiter.';
const history = 'Der ausgearbeitete Familienbaum beginnt mit Brannoc und Edryssa sowie ihren vier Kindern. Weitere Vorfahren sind vorerst nicht benannt. Unterschiedliche Pferde aus Bauernhöfen, Gepäckzügen und Reisewagen gelangen über ihren kleinen Hof erneut in den Verkauf; eine eigene Zucht betreibt die Familie nicht.';
const holdings = 'Zum Betrieb gehören ein kleiner Verkaufsraum, ein Stadtstall und der Ankaufshof. Eigentum oder Pacht des Gebäudes sind noch nicht abschließend geklärt. Ein Landgestüt, eigener Futterhof und eine Sattlerei gehören nicht dazu. Die Pferde stammen aus wechselnden Ankäufen.';
const card = p => ({ id: p.id, familyId: family.document.id, name: p.name, role: p.title, image: p.portrait,
  silhouette: p.sex === 'female' ? 'female' : 'male', detail: `${1740 - Number(p.birth)} Jahre`, description: p.notes });
export const RESALE_HOUSE_CONTENT = Object.freeze({ id: family.document.id, name: family.document.title, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html', county: 'Celtigerns Wacht', liege: '',
  territoryId: 'celtigerns-wacht', territoryName: 'Celtigerns Wacht', territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  parentHouseId: '', extinct: false, prepared: false, registerPage: true, showMotto: false, biographySourceRevision: 1, contentVersion: '20261113-ruddgraen-v1',
  biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Der kleine Pferdehandel', biographySummary: { overview, history, holdings, character: 'Brummige Verhandlungen, ein scharf geführtes Haushaltsbuch und viel gemeinsame Arbeit.' },
  profile: { highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliches Haus', seat: 'Gwynthor', affiliation: 'Zum Schiefen Nagel · Pferdeankauf und Weiterverkauf', liege: '', origin: 'Gwynthor', people: 'Cenyri', wealth: '', religion: '', motto: '' },
  omitMilitaryProfile: true, familyTreeCompact: true,
  sections: { overview, history, holdings, traditions: 'Besichtigung vor der Zusage; einzelne Pferde und ihre bekannten Eigenheiten werden auf Kaufzetteln festgehalten.',
    knighthood: 'Bürgerlicher Pferdehandel ohne eigenen Ritterrang.', succession: 'Eine verbindliche Nachfolge ist nicht festgelegt.', values: 'Bezahlbare Gebrauchspferde, klare Übergaben und keine erfundenen Abstammungsnachweise.',
    cultureReligion: 'Cenyrischer Familienhaushalt; besondere religiöse Bräuche sind nicht festgelegt.', conflictsAlliances: 'Ankäufe von Bauern, Fuhrleuten, Söldnern und Reisenden; keine besondere Gildenpartnerschaft zugesagt.',
    court: 'Brannoc führt den Ankauf, Edryssa Kasse und Haushalt. Die vier Kinder übernehmen Prüfung, Verkauf, Vorstellung und betreute Stallarbeit.',
    familyTree: 'Brannoc und Edryssa, drei Töchter im Alter von 23, 21 und 19 Jahren sowie der jüngste Sohn mit 17 Jahren.', historicalFigures: 'Die sechs benannten Angehörigen des heutigen Familienhaushalts.' },
  images: { crest: family.document.emblem, scene: RESALE_PEOPLE[0].portrait, sceneAlt: 'Brannoc Ruddgraen · Inhaber', banner: '../Stammbäume/assets/images/regions/gwynthor.png' },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, founder: null,
  headsTitle: 'Familienoberhaupt', heads: [card(RESALE_PEOPLE[0])], heirs: [], officesTitle: 'Gemeinsame Arbeit im Betrieb', offices: RESALE_PEOPLE.slice(1).map(card),
  currentHead: RESALE_PEOPLE[0].name, firstHeir: '', cadets: [], allies: [], figuresTitle: 'Die Familie Ruddgraen', figuresMobileLayout: 'stacked', figures: RESALE_PEOPLE.map(card),
  relatedRecords: [{ title: 'Zum Schiefen Nagel', text: 'Günstiger Pferdeankauf und Weiterverkauf', link: `../AleriaAlmanach/AleriaAlmanach.html?entry=${RESALE_MODULE_ID}`, icon: `../AleriaAlmanach/${RESALE_SIGN.replace(/^\.\//, '')}` }], trivia: [] });
