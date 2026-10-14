import { KANNE_HOUSE_FAMILIES } from '../../../Stammbäume/assets/js/data/krumme-kanne-families.js';
import { kanneFamilyPerson } from '../../../Stammbäume/assets/js/data/krumme-kanne-family-people.js';

const lore = {
  trevoryn: {
    origin: 'Gwynthor · Cenyr', owner: 'merrik', name: 'Merrik Trevoryn',
    overview: 'Die Trevoryn sind im Hafenviertel Gwynthors verwurzelt. In der Krummen Kanne kennt man Merriks offenen Empfang, Eirians klirrenden Schlüsselbund und Elidyrs trockene Antworten am Tresen.',
    history: 'Die alten Gründer sind längst vergessen. Was die Familie heute zusammenhält, begann mit Merriks Heimkehr aus dem Großen Krieg. 1722 eröffnete er mit seinen Feldkameraden Hrolf und Aedan die Krumme Kanne; ein Jahr später heiratete Hrolf seine Schwester Eirian.',
    character: 'Celyn hält Vorratskammer und Wäschetruhe gefüllt, während Nestwen am Fenster flickt und Geschichten erzählt. Bei ihr finden Cadri und Enlli stets einen Platz. Im Zweifel stellen die Trevoryn erst einen Teller hin und fragen dann, was geschehen ist.',
    heraldry: 'Ein goldener aufrechter Fuchs auf dunkelgrün bemalten Holzbrettern, eingefasst von einem geschlossenen Eisenrahmen mit goldenem keltischem Knotenband.',
    members: ['merrik', 'celyn', 'eirian', 'elidyr', 'nestwen', 'cadri', 'enlli']
  },
  svathamar: {
    origin: 'Rorikshall · Aldrimar', owner: 'hrolf', name: 'Hrolf Svathamar',
    overview: 'Die Svathamar sind eine bürgerliche Familie aus Rorikshall in Aldrimar. Hrolf fand nach dem Großen Krieg in Gwynthor ein neues Zuhause. Seine Geschwister Ketil und Runa folgten ihm; mit Eirian Trevoryn und den Kindern Styr und Heledd gehört er heute zur Hausgemeinschaft der Krummen Kanne.',
    history: 'Von den frühen Svathamar erzählen nur noch wenige Geschichten. Hrolfs Weg führte aus Rorikshall in den Großen Krieg und mit seinen Kameraden weiter nach Gwynthor. Nach der Gründung der Kanne heiratete er Eirian Trevoryn; seine jüngeren Geschwister Ketil und Runa folgten ihm in die Stadt.',
    character: 'Hrolf hält den Hausfrieden, Ketil wacht an der Tür und Runa über saubere Kammern. Eirian hält sie alle auf Trab. Styr übt sich am Tresen in der Gelassenheit seines Vaters; Heledd lauscht lieber dessen Heldengeschichten.',
    heraldry: 'Ein schwarzer Berg mit einem zerfallenen schwarzen Turm auf eisblauem Holz. Ein geschlossener Eisenrahmen mit sparsamen nordischen Runen umgibt das Motiv.',
    members: ['hrolf', 'eirian', 'ketil', 'runa', 'styr', 'heledd']
  },
  dubhdarach: {
    origin: 'Leitheach · Albische Herkunft', owner: 'aedan', name: 'Aedan Dubhdarach',
    overview: 'Mit Aedan Dubhdarach kam ein Stück Leitheach in die Krumme Kanne. Der höfliche Albe kümmert sich um Lieferanten und vertrauliche Gäste, während Mair über Kasse und Gästebuch wacht.',
    history: 'Die Wurzeln der Dubhdarach liegen in Leitheach; die Namen ihrer frühen Gründer gingen verloren. Aedan lernte Merrik und Hrolf im Großen Krieg kennen und blieb nach dem Frieden bei ihnen. In Gwynthor fand er mit Mair auch eine Familie. Die beiden heirateten 1724.',
    character: 'Neifion lernt bei Mair das Schreiben und Rechnen; Eirlys fragt den Gästen lieber Löcher in den Bauch. Liegt die Tiefenwyrm im Hafen, schaut auch Mairs ältester Sohn Caradog vorbei. Der Schreiber bringt Nachrichten mit, für die Aedan gern einen Becher bereitstellt.',
    heraldry: 'Ein schwarzer kahler Baum auf silbergrau bemalten Holzbrettern; unter seinen Ästen kniet die schwarze Silhouette eines betenden Mannes. Geschlossener Eisenrahmen mit keltischem Knotenband.',
    members: ['aedan', 'mair', 'neifion', 'eirlys', 'caradog']
  }
};

export function createKanneHouseContent(slug) {
  const text = lore[slug];
  const family = KANNE_HOUSE_FAMILIES.find(f => f.document.id === `haus-${slug}`);
  if (!text || !family) throw new Error(`Unbekanntes Haus: ${slug}`);
  const title = family.document.title;
  const name = title.replace('Haus ', '');
  const portrait = id => kanneFamilyPerson(id).portrait;
  return {
    id: family.document.id, name: title, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html', county: 'Celtigerns Wacht', liege: 'Haus Draig',
    territoryId: 'celtigerns-wacht', territoryName: 'Celtigerns Wacht', territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html', parentHouseId: '', extinct: false, showMotto: false, prepared: false, registerPage: true,
    biographySourceRevision: 2,
    biographyPreviousDefaultFingerprints: [({ trevoryn: '3349:24aa78ef:90ea7865', svathamar: '3335:d9a453de:2720dcec', dubhdarach: '3457:806feb89:812fc2eb' })[slug]],
    biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Herkunft & Hausgeschichte',
    biographySummary: { overview: text.overview, history: text.history, character: text.character },
    hierarchy: [ ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'], ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'], ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'], ['Region', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Sitz', 'Gwynthor', 'gwynthor'], ['Haus', title, family.document.id] ].map(([type, name, slug]) => ({ type, name, slug })),
    profile: { highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliches Haus', motto: '', seat: 'Gwynthor · Östliches Hafenviertel', affiliation: 'Hausgemeinschaft der Krummen Kanne', liege: 'Haus Draig', origin: text.origin, founding: 'Unbekannt · Schenke gegründet 1722', people: ({ trevoryn: 'Cenyri', svathamar: 'Aldrimarisch-cenyrischer Haushalt', dubhdarach: 'Albisch-cenyrischer Haushalt' })[slug], wealth: 'Gemeinsamer Schank- und Herbergsbetrieb', patron: 'Stadt Gwynthor', knightingPatron: '—', milestoneOne: '1722 · Eröffnung der Krummen Kanne', milestoneTwo: '—', religion: 'Bräuche der Heimat', patronDeities: '', allies: 'Trevoryn · Svathamar · Dubhdarach', enemies: '' },
    sections: {
      overview: text.overview, history: text.history,
      traditions: `${text.character}\n\nDas Familienwappen: ${text.heraldry}`,
      knighthood: 'Die Familie besitzt bürgerlichen Rang. Der Kriegsdienst der Inhaber begründet keinen Adelstitel; ihr heutiges Ansehen beruht auf der Schenke und ihren Beziehungen in Gwynthor.',
      succession: 'Noch führen die drei alten Kameraden die Kanne gemeinsam. Wer eines Tages ihre Plätze einnimmt, wird am Familientisch selten besprochen.',
      holdings: 'Anteil am gemeinsamen Schank- und Herbergsbetrieb der Krummen Kanne im Osten des Hafenviertels, an der Gasse Richtung Osttor. Die drei Inhaber gründeten das Haus 1722. Weiterer Grundbesitz ist nicht benannt.',
      cultureReligion: `${text.origin}. Die Hausgemeinschaft verbindet cenyrische, aldrimarische und albische Gewohnheiten, besonders am gemeinsamen Herd. Ein bestimmter Schutzpatron der Familie ist nicht überliefert.`,
      conflictsAlliances: 'Die Freundschaft der drei Wirte überstand den Krieg. Eirians Ehe mit Hrolf und das gemeinsame Leben in der Kanne haben aus den Kameraden längst eine große Hausgemeinschaft gemacht.',
      values: 'Gastlichkeit, verlässliche Arbeit und Kameradschaft bestimmen den Alltag. Alte Frontzugehörigkeiten entscheiden nicht über den Empfang eines Gastes. Elidyr hört Beschwerden an; Ketil und die Wache sichern den Hausfrieden.',
      court: 'Eirian teilt die Schichten ein, Mair führt die Bücher und Celyn hütet die Vorräte. Gorwyst sorgt im Hof dafür, dass Fässer, Brennholz und Handwerker zur rechten Zeit ankommen.',
      familyTree: 'Zwischen den vergessenen Gründern und der heutigen Familie liegen viele namenlose Generationen. Erst die Bewohner der Krummen Kanne geben der Überlieferung wieder Gesichter.',
      historicalFigures: 'Diese Gesichter begegnen Gästen am Tresen, im Hof und am gemeinsamen Tisch.'
    },
    images: { crest: `../Stammbäume/${family.document.emblem}`, scene: portrait(text.owner), sceneAlt: `Porträt von ${text.name}`, banner: 'Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/gwynthor.png' },
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: KANNE_HOUSE_FAMILIES.filter(f => f !== family).map(f => ({ name: f.document.title, detail: 'Hausgemeinschaft der Krummen Kanne', image: `../Stammbäume/${f.document.emblem}`, imageFormat: 'square' })),
    cadets: [], founder: null, heads: [], heirs: [], offices: [], currentHead: `${text.name} · Hausvertreter`, firstHeir: 'Nicht festgelegt',
    figuresTitle: 'Familie & Hausgemeinschaft', figures: text.members.map(key => { const p = family.persons.find(p => p.id === kanneFamilyPerson(key).id); return { id: p.id, familyId: family.document.id, name: p.name, role: p.title, description: p.notes, image: p.portrait }; }),
    trivia: ['Die drei Wirte fanden im Großen Krieg zueinander; die Schenke wurde erst nach dem Frieden gegründet.', text.heraldry, 'Die jüngsten Kinder haben keine regulären Dienstschichten.']
  };
}
