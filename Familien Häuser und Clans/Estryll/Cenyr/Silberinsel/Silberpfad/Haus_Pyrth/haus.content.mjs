// Gemeinsame redaktionelle Quelle. Alttabelle und Stammbaumgrafik bleiben unübernommen.
import { HOUSE_PYRTH_PORTRAITS } from '../../../../../../Stammbäume/assets/js/data/house-pyrth-portraits.js';

const assetRoot = 'Estryll/Cenyr/Silberinsel/Silberpfad/Haus_Pyrth/assets';
const portrait = id => HOUSE_PYRTH_PORTRAITS[id] ? `../Stammbäume/${HOUSE_PYRTH_PORTRAITS[id]}` : '';
const member = (id, name, role, detail = '') => ({ id, familyId: 'haus-pyrth', name, role, detail, image: portrait(id) });
const officeRoles = [
  ['Vogt', 'male'], ['Schatzmeister', 'female'], ['Kommandant der Garde', 'male'], ['Zeremonienmeister', 'female'], ['Mundschenk', 'male'],
  ['Waffenmeister', 'male'], ['Stallmeister', 'female'], ['Kerkermeister', 'male'], ['Jagdmeister', 'female'], ['Hafenmeister', 'male'],
  ['Küchenmeister', 'male'], ['Brotmeister', 'female'], ['Handwerksmeister', 'male'], ['Gartenmeister', 'female'], ['Hofkaplan', 'male'],
  ['Hofmeister', 'male'], ['Hofdame', 'female'], ['Archivar', 'male'], ['Hoffalkner', 'female'], ['Zwingermeister', 'male']
];

export const HOUSE_CONTENT = {
  id: 'haus-pyrth', name: "Haus Pyrth O'Caer Clwyd", type: 'Ritterfürstenhaus', page: 'haus.html',
  county: 'Silberinsel', liege: "Haus Neidr O'Llanvane", territoryId: 'silberpfad', territoryName: 'Silberpfad',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/Herrschaft Silberpfad/Herrschaft Silberpfad.html',
  parentHouseId: 'haus-neidr', extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261103-silberinsel-v1', biographySourceRevision: 3, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Geschichte des Hauses',
  biographySummary: {
    overview: 'Haus Pyrth O’Caer Clwyd ist das Ritterfürstenhaus des Silberpfades auf der Silberinsel. Von seiner Gebirgsburg aus sichert es den Handelsweg zwischen Llanvane und Eiddon. Die Pyrth stehen unter Haus Neidr und sind mit dem Grafengeschlecht auch familiär verbunden. Bergbau, Schmiedekunst und das raue Leben im Gebirge prägen ihr Haus.',
    history: 'Als Gründer ist Roderic Pyrth überliefert, ein Jäger und Bogenschütze, der die Bedeutung des Gebirgspfades für Händler und Reisende erkannte. Zunächst errichtete er eine einfache Holzhütte als Unterschlupf. Aus dem Rastplatz entwickelte sich ein wichtiger Zwischenstopp; später begann der Ausbau zu einer steinernen Festung zum Schutz der Route. Die Erhebung durch die Neidr und die Verbindung mit Llynn Neidr begründeten die Stellung des Hauses. Ein genaues Gründungsjahr ist nicht gesichert.',
    character: 'Die Pyrth gelten als fähige Trolljäger. Ihre harte Mutprobe verlangt von einem Mann, dem Vater den Schädel eines Gebirgstrolls vorzulegen, um dessen Respekt zu gewinnen. Diese Überlieferung hat bereits Angehörige das Leben gekostet. Ein eigener verbindlicher Hausleitspruch ist nicht bekannt.',
    customs: 'Die Hausüberlieferung verbindet einen Teil ihrer Namensformen mit Weisenfluh: Namen werden in cenyrischer Schreibweise und Aussprache weitergeführt. Die Ritter bevorzugen Purpur, Rot und Weiß. Fell und Pelz schützen gegen das Gebirgsklima und gehören neben dem Metallharnisch zum beschriebenen Erscheinungsbild.',
    holdings: 'Die wirtschaftliche Grundlage ist der Bergbau. Die Pyrth verfügen zudem über Schmiedekenntnisse und können ihre Krieger mit guter Ausrüstung versehen. Viele andere benötigte Güter müssen sie erwerben. Caer Clwyd bleibt dabei sowohl Stammsitz als auch Mittelpunkt der Sicherung des Handelsweges.',
    culture: 'Das Haus wird den Cenyri und Silbercenyri zugerechnet und gehört der Alerischen Kirche an, gilt jedoch nicht als besonders religiös. Die überlieferte Ritterweihe folgt dem cenyrischen Brauch mit Salbung am Gewässer, den Eiden auf die Neun Göttlichen und dem zusätzlichen Eid auf die Dame der See.',
    relations: 'Yspaddaden Pyrth führt das Haus seit 1723. Als Erben sind Yorath und Wynford verzeichnet. Die Neidr bleiben der unmittelbare Lehnsherr; ihre enge Verbindung mit den Pyrth gehört zur Gründungsgeschichte. Eigene förmliche Bündnisse und Fehden sind in der Hausüberlieferung nicht näher beschrieben.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Silberinsel', slug: 'silberinsel' },
    { type: 'Herrschaft', name: 'Silberpfad', slug: 'silberpfad' },
    { type: 'Sitz', name: 'Caer Clwyd', slug: 'caer-clwyd' },
    { type: 'Haus', name: "Haus Pyrth O'Caer Clwyd", slug: 'haus-pyrth' }
  ],
  profile: {
    highestTitle: 'Ritterfürst', rank: 'Ritterfürst', houseType: 'Ritterfürstenhaus', motto: '', quoteAuthor: '',
    seat: 'Caer Clwyd', affiliation: 'Silberpfad · Silberinsel', liege: "Haus Neidr O'Llanvane",
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '',
    patron: '', knightingPatron: '', people: 'Cenyri, Silbercenyri', wealth: 'Mittelmäßig bis hoch', religion: 'Alerische Kirche',
    patronDeities: '', origin: 'Roderic Pyrth und Llynn Neidr', cadetBranches: '', allies: '', enemies: ''
  },
  omitMilitaryProfile: true,
  sections: {
    overview: [
      'Die Pyrth sind die Herren der Gebirgsburg Caer Clwyd und der ritterfürstlichen Herrschaft Silberpfad. Sie sichern den Gebirgspfad, der als Handelsweg die Silberinsel zwischen Llanvane und Eiddon durchzieht. Der Stammsitz liegt in einer von steilen Hängen, felsigen Wegen und hartem Wetter geprägten Landschaft.',
      'Das Haus steht unmittelbar unter den Neidr. Bergbau und Schmiedekunst bilden seine wirtschaftliche Grundlage, während die Sicherung der Reisenden und Händler seine überlieferte Aufgabe ist.'
    ],
    history: [
      'Der Jäger und Bogenschütze Roderic Pyrth erkannte die Bedeutung des Gebirgspfades als Handelsroute. Er errichtete zunächst eine einfache Holzhütte, die Reisenden als Unterschlupf diente. Mit zunehmendem Verkehr entwickelte sich der Ort zu einem wichtigen Zwischenstopp.',
      'Roderic begann daraufhin, eine Festung aus Stein zu bauen, um den Handelsweg zu schützen. Die Neidr erhoben die Pyrth in den Ritterfürstenstand. Die Verbindung Roderics mit Llynn Neidr begründete zugleich die enge verwandtschaftliche Bindung an das Grafengeschlecht.',
      'Der genaue Zeitpunkt der Gründung und Erhebung ist nicht überliefert. Auf die frühe Roderic-Überlieferung folgt in der gesicherten Oberhauptfolge Dyngannon; seit 1723 führt Yspaddaden das Haus.'
    ],
    traditions: [
      'Die Pyrth genießen den Ruf fähiger Trolljäger. Die Hausüberlieferung beschreibt eine gefährliche Mutprobe: Ein Mann gewinnt den Respekt seines Vaters, indem er ihm den Schädel eines Gebirgstrolls vorlegt. Angehörige des Hauses haben diese Jagd bereits mit dem Leben bezahlt.',
      'Eine weitere Überlieferung erklärt an Weisenfluh erinnernde Namensformen innerhalb des Hauses. Diese Namen erscheinen in cenyrischer Schreibweise und Aussprache. Eine gesicherte zusätzliche Herkunftslinie ist damit nicht festgelegt.'
    ],
    knighthood: [
      'Das cenyrische Rittertum hat seine Wurzeln in Avallorn. Der Knappe empfängt an einem See oder einem anderen Gewässer den Ritterschlag und die Salbung. Er schwört auf die Neun Göttlichen und ihre Tugenden; ein zusätzlicher Eid gilt der Dame der See, der Schutzgöttin Cenyrs.',
      'Die Pyrth bevorzugen Purpur, Rot oder Weiß. Zum Schutz gegen das Gebirgsklima tragen sie viel Fell und Pelz. Ihre leichter ausgerüsteten Hauskrieger orientieren sich an den Rittern, verwenden vor allem Leder und Pelz und schützen wichtige Körperpartien mit Eisen oder Stahl.',
      'Bergbau und eigene Schmiedekenntnisse ermöglichen eine gute Ausrüstung. Die überlieferte Hausdarstellung zeigt einen Ritter im geschlossenen Harnisch mit purpurfarbenem Stoff und Helmbusch.'
    ],
    holdings: 'Der Bergbau ist die wesentliche Einnahmequelle des Hauses. Die Pyrth sind zudem fähige Schmiede und versorgen ihre Krieger mit Ausrüstung. Viele andere benötigte Güter müssen sie erwerben. Caer Clwyd ist ihr Stammsitz und der strategische Mittelpunkt des Silberpfades.',
    cultureReligion: 'Die Pyrth zählen zu den Cenyri und Silbercenyri. Sie gehören der Alerischen Kirche an, gelten in der Hausüberlieferung aber als nicht besonders religiös. Eigene Schutzpatrone und besondere Hauskulte sind nicht benannt.',
    conflictsAlliances: 'Haus Neidr ist der unmittelbare Lehnsherr und durch die Gründerfamilie eng mit den Pyrth verbunden. Förmliche zusätzliche Allianzen und Fehden sind bisher nicht näher ausgearbeitet.',
    values: 'Die Sicherung des Gebirgspfades und die gefährliche Trolljagd bestimmen den überlieferten Ruf des Hauses. Ein eigener Hausleitspruch und ein darüber hinaus ausgearbeiteter Wertekanon sind nicht überliefert.',
    succession: 'Die gesicherte Erbfolge nennt Yorath und danach Wynford. Die Oberhauptfolge unterscheidet ausdrücklich Amtszeiten von Lebensdaten.',
    court: 'Yspaddaden steht seit 1723 an der Spitze des Hauses. Die alte Hofübersicht nennt zwanzig Ämter, deren Inhaber nicht namentlich überliefert sind.',
    familyTree: 'Hier ist der bereits ausgearbeitete Stammbaum des Hauses Pyrth eingebettet. Das Hauswappen öffnet dort die Hausbiografie.',
    historicalFigures: 'Roderic ist als Gründer, Jäger und Bogenschütze überliefert. Eine darüber hinaus ausgearbeitete historische Figurengalerie ist nicht vorhanden.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Silberinsel/Silberpfad/haus-pyrth.png',
    scene: `${assetRoot}/hausdarstellung-original.png`, sceneAlt: 'Originale Pyrth-Hausdarstellung: geschlossener Harnisch, purpurfarbener Stoff und Helmbusch',
    banner: `${assetRoot}/herrschaftsbanner-original.png`
  },
  illustrationCategory: 'Hausdarstellung', cadets: [],
  founder: member('roderic-pyrth', 'Roderic Pyrth', 'Gründer und erster Ritterfürst', 'Amtszeit nicht sicher datiert'),
  heads: [
    member('roderic-pyrth', 'Roderic Pyrth', 'Ritterfürst', 'Amtszeit nicht sicher datiert'),
    member('dyngannon-pyrth', 'Dyngannon Pyrth', 'Ritterfürst', 'Bis 1662'),
    member('iowaneth-pyrth', 'Jowaneth Pyrth', 'Ritterfürst', '1662–1679'),
    member('ulysses-pyrth', 'Ulysses Pyrth', 'Ritterfürst', '1679–1697'),
    member('ysgonan-pyrth', 'Ysgonan Pyrth', 'Ritterfürst', '1697–1723'),
    member('yspaddaden-pyrth', 'Yspaddaden Pyrth', 'Ritterfürst', 'Seit 1723')
  ],
  heirs: [member('yorath-pyrth', 'Yorath Pyrth', 'Erster Erbe'), member('wynford-pyrth', 'Wynford Pyrth', 'Zweiter Erbe')],
  offices: officeRoles.map(([role, silhouette]) => ({ name: '', role, silhouette })),
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [],
  trivia: ['Die Pyrth verbinden ihre Namensformen mit cenyrisch ausgesprochenen Namen aus Weisenfluh.', 'Purpur, Rot und Weiß sind bevorzugte Farben der Hausritter.'],
  currentHead: 'Yspaddaden Pyrth', firstHeir: 'Yorath Pyrth'
};
