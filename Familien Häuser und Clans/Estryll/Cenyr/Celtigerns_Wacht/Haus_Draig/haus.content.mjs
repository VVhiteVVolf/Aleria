import { HOUSE_DRAIG_PORTRAITS } from '../../../../../Stammbäume/assets/js/data/house-draig-portraits.js';
import { HOUSE_BALCHDER_PORTRAITS } from '../../../../../Stammbäume/assets/js/data/house-balchder-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from '../../../../../Stammbäume/assets/js/data/house-gafyr-portraits.js';
import { PORTRAIT_PLACEHOLDERS } from '../../../../../Stammbäume/assets/js/config/portrait-placeholders.js';

// Redaktionelle Quelle für beide Ansichten. Ausgabe mit scripts/build-house-content.mjs.
const houseAssets = 'Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets';
const treeAssets = '../Stammbäume/';
const portrait = (id, portraits = HOUSE_DRAIG_PORTRAITS) => {
  if (!portraits[id]) throw new Error(`Draig: Portrait fehlt für ${id}`);
  return treeAssets + portraits[id];
};
const member = (id, name, detail = '') => ({
  id, name, detail, familyId: 'haus-draig', image: portrait(id),
});

export const HOUSE_CONTENT = {
  id: 'haus-draig',
  name: "Haus Draig O'Gwynthor",
  type: 'Grafenhaus',
  county: 'Celtigerns Wacht',
  liege: 'König Tristan Pendrag',
  territoryId: 'celtigerns-wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  showMotto: false,
  biographyIntroTitle: 'Schild und Schwert Cenyrs',
  biographyHistoryTitle: 'Von Avallorn nach Gwynthor',
  biographySummary: {
    overview: 'Haus Draig ist das Grafenhaus von Celtigerns Wacht mit Sitz in Gwynthor. Als Bruderhaus der königlichen Pendrag gilt es als Schild und Schwert Cenyrs. Ritterlichkeit, Treue zur Krone und der Zusammenhalt der Familie prägen sein Selbstverständnis.',
    history: 'Celtigern aus der Dynastie Dreigiau gründete das Haus nach der Flucht aus Avallorn an Cenyrs Südküste. Während sein Bruder Vortigern Haus Pendrag und die Königslinie begründete, verband Celtigerns Ehe mit einer Albin die Draigs mit der einheimischen Kultur.',
    character: 'Ritterdienst, Ehre und familiäre Pflichten stehen im Mittelpunkt. Die Draigs folgen der Alerischen Kirche und verehren besonders die Dame der See. Bergwerke, Seehandel und eine starke Flotte sichern ihren Wohlstand und Einfluss.',
  },
  placeholders: {
    male: treeAssets + PORTRAIT_PLACEHOLDERS.male,
    female: treeAssets + PORTRAIT_PLACEHOLDERS.female,
  },
  influences: [
    { icon: '../IconOrdner/Organisationsicons/Militär.png', title: 'Ritteraufgebot und Küstenschutz', detail: 'Cantref, Teulu und Uchelwyr bilden das Ritteraufgebot. Zahlreiche Infanteristen und Seekrieger sowie 30–50 Kriegsschiffe sichern die Lande und Küsten.' },
    { icon: '../IconOrdner/Organisationsicons/Diplomatie.png', title: 'Bruderhaus der Pendrag', detail: 'Gemeinsame Herkunft aus der Dynastie Dreigiau; enge Bindung an die Krone Cenyrs.' },
    { icon: '../IconOrdner/Organisationsicons/Magie.png', title: 'Myrddins Erbe', detail: 'Der Hofzauberer nimmt nur alle 100 bis 200 Jahre einen neuen Lehrling an.' },
  ],
  allies: [
    { name: 'Haus Pendrag', detail: 'Bruderhaus und königlicher Lehnsherr', image: '../Stammbäume/assets/images/houses/Vortigerns Ruh/haus-pendrag.png', imageFormat: 'square' },
  ],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-haeuser-und-clans' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Celtigerns Wacht', slug: 'celtigerns-wacht' },
    { type: 'Sitz', name: 'Gwynthor', slug: 'gwynthor' },
    { type: 'Haus', name: 'Haus Draig', slug: 'haus-draig' },
  ],
  profile: {
    highestTitle: 'Graf', houseType: 'Grafschaft', motto: 'Nicht überliefert', quoteAuthor: '',
    seat: 'Gwynthor', affiliation: 'Königreich Cenyr · König Tristan Pendrag',
    troopStrength: 'Sehr stark', tiarna: 'Vor allem Uchelwyr und Teulu; außerdem Cantref',
    kerns: 'Zahlreiche Infanteristen und Seekrieger', fleet: '30–50 Kriegsschiffe',
    founding: 'Nach dem Untergang Avallorns; Jahr unbekannt',
    milestoneOne: 'Celtigern gründet Haus Draig und lässt sich an der Südküste Cenyrs nieder.',
    milestoneTwo: 'Galahad übernimmt 1720 die Führung des Hauses.',
    people: 'Cenyri', wealth: 'Sehr hoch', religion: 'Alerische Kirche',
    patronDeities: 'Die Dame der See', origin: 'Avallorn · Dynastie Dreigiau',
    cadetBranches: 'Saethwyr, Wyrm und Gwyvern', allies: 'Haus Pendrag',
    enemies: 'Keine gegenwärtige Hausfehde benannt',
  },
  sections: {
    overview: [
      'Haus Draig zählt zu den einflussreichsten Adelsfamilien Cenyrs. Als Bruderhaus der königlichen Pendrag entstammt es derselben avallornischen Dynastie. Die Draigs gelten als Verfechter der Ritterlichkeit und als Schild und Schwert Cenyrs.',
      'Von Gwynthor aus regiert das Grafenhaus die Grafschaft Celtigerns Wacht. Seine Macht beruht auf reichen Bergwerken, regem Seehandel und einem starken Ritteraufgebot. Die Verbundenheit mit dem Königshaus prägt seinen politischen Rang ebenso wie das Erbe der Alben.',
    ],
    history: [
      'Die Wurzeln der Draigs liegen in Avallorn. Nach dessen Untergang erreichte Celtigern, ein Prinz des letzten Königs und Angehöriger der Dynastie Dreigiau, gemeinsam mit seinen Geschwistern, ihrer Garde und Tausenden Überlebenden Estryll. Dort unterstützten die Ankömmlinge die Alben im Kampf gegen die Nordmänner.',
      'Die Dreigiau gründeten Mathragon. Aus ihrer Familie gingen zwei Häuser hervor: Vortigern begründete Haus Pendrag und wurde König von Cenyr; sein Bruder Celtigern gründete Haus Draig und ließ sich an der südlichen Küste nieder. Gwynthor entwickelte sich zum Stammsitz seines Hauses.',
      'Celtigerns Ehe mit einer Albin verband die avallornischen Flüchtlinge mit den Alben Cenyrs. Diese Verbindung prägt bis heute die Geschichte und Kultur der Draigs. Durch ihre Abstammung gehören sie zur königlichen Blutlinie, auch wenn die Krone Cenyrs dem Bruderhaus Pendrag zufiel.',
      'Die Grafschaft der Draigs gehört nicht zu den größten des Reiches. Mit Gwynthor besitzt sie jedoch eine bedeutende Handelsstadt, deren Bergbau, Häfen und kultureller Austausch großen Wohlstand schaffen. Cantref, Teulu und berittene Uchelwyr bilden den Kern der ritterlichen Streitmacht; Seekrieger und Flotte sichern den Einfluss des Hauses auf dem Meer.',
    ],
    traditions: [
      'Die ritterlichen Tugenden werden von Generation zu Generation weitergegeben. Die Draigs wollen anderen Häusern und Rittern ein Vorbild sein. Dass nicht jedes Familienmitglied diesem Anspruch gerecht wird, ändert wenig an der Bedeutung des Ideals.',
      'Seit dem Zauberer Myrddin hat auch die Magie ihren festen Platz im Haus. Einzelne Angehörige werden in den magischen Künsten unterwiesen. Der Hofzauberer nimmt allerdings nur alle 100 bis 200 Jahre einen neuen Lehrling auf; die Ausbildung soll mit den ritterlichen Tugenden im Einklang stehen.',
      'Von den Angehörigen des Hauses wird erwartet, den Weg des Ritters zu wählen, zu heiraten und der Familie zu dienen. Sie sollen Cenyr und seine Lande schützen. Wer seine Pflichten zurücklässt, um auf eigene Faust Abenteuer zu suchen oder „sich selbst zu finden“, begegnet im Haus meist Skepsis.',
    ],
    knighthood: [
      'Die Schwertleite findet traditionell an einem See, am Trident oder an der Küste statt. Manche Knappen reisen dafür nach Llanforwyn. Der Ritterschlag verbindet den Dienst am Haus mit dem Glauben und der Verpflichtung, die Schutzbedürftigen zu verteidigen.',
      'Cantref führen vor allem die Lanze, Teulu das Schwert; die Uchelwyr stehen für den berittenen Kampf. Gemeinsam verleihen sie dem Haus seine besondere militärische Schlagkraft.',
      'Die charakteristische Drachenschuppen-Rüstung ahmt den Schuppenpanzer eines Drachen nach. Dazu gehört ein roter Helm in Form eines Drachenkopfes: Sein Oberkiefer bildet das hochklappbare Visier. Ein Kamm aus gefärbtem Rosshaar oder Federn sowie die Hausfarben machen die Ritter der Draigs weithin erkennbar.',
      'Auch die Milwr, die Miliz und Waffenknechte des Hauses, tragen seine Zeichen auf ihren Wappenröcken. Die Stadtwache führt dagegen das Wappen Gwynthors. So bleiben das Gefolge der Draigs und die städtischen Wächter voneinander zu unterscheiden.',
    ],
    succession: [
      'Galahad Draig führt das Haus seit 1720. Die überlieferte Erbfolge nennt Anaraut, Idwal, Tudwal, Neithon und Gawain in dieser Reihenfolge. Weitergehende Regeln für Sonderfälle der Nachfolge sind nicht überliefert.',
      'Die Oberhauptfolge am Hof führt die namentlich bekannten Grafen auf. Ihre Jahresangaben bezeichnen die überlieferten Amtszeiten; Lücken in der älteren Überlieferung bleiben offen.',
    ],
    holdings: [
      'Gwynthor und die zugehörige Baronie bilden das Herz des Besitzes der Draigs. Von ihrem Stammsitz aus üben sie ihre gräfliche Herrschaft über Celtigerns Wacht aus.',
      'Mehrere sorgfältig verwaltete Bergwerke und Minen sichern einen wesentlichen Teil des Reichtums. Befestigte Häfen schützen die Küstenlinie, dienen der Flotte als Stützpunkte und ermöglichen den Seehandel.',
      'Die Abgaben von Vasallen und Bürgern finanzieren das Heer und die Infrastruktur. Im Gegenzug schuldet das Haus Schutz und die Sicherung seiner Lande.',
      'Neben dem traditionellen Handel mit dem Markt der Fortuna bestehen Beziehungen zur Klingenden Münze. Über diese Verbindungen beziehen die Draigs exotische Waren und exportieren eigene Erzeugnisse. Hinzu kommen Handelskontakte mit anderen Städten, darunter Nas.',
      'Bergbau, Abgaben und Handel ermöglichen ein großes, gut ausgerüstetes Heer und eine Flotte von 30 bis 50 Kriegsschiffen. Wirtschaftlicher Wohlstand und militärische Stärke stützen einander.',
    ],
    cultureReligion: [
      'Die Draigs bekennen sich zur Alerischen Kirche, zu den Neun Göttlichen und zur Dame der See. Ihre Rittereide gelten als ernsthafte religiöse Verpflichtung. Eine eigene Ausbildung von Klerikern oder Paladinen unterhält das Haus nicht.',
      'Kulturelle Feste, die Pflege der eigenen Sprache und die Bewahrung albischer Überlieferungen gehören zum Hausleben. Die Draigs sind stolz auf ihre Herkunft und verteidigen ihre kulturelle Identität. Zugleich zeigen sie sich anderen Kulturen und Religionen gegenüber offen.',
    ],
    conflictsAlliances: [
      'Die engste Verbindung besteht zum Bruderhaus Pendrag. Darüber hinaus pflegen die Draigs Bündnisse mit bedeutenden Adelshäusern Cenyrs. Ehen mit Alben bleiben geschätzt, kommen jedoch seltener vor als Verbindungen innerhalb des eigenen Volkes.',
      'Von See drohen Überfälle der Schwarzblut-Marodeure, die gelegentlich in den Süden Cenyrs vordringen. Die Sicherung der Küsten ist deshalb ein dauerhafter Auftrag des Hauses.',
      'Frühere Konflikte entstanden durch aufständische Vasallen, darunter das vermeintliche Königshaus von Caisil und die Illysywen. Gegenwärtig stehen diese Auseinandersetzungen nicht im Vordergrund; eine aktive Hausfehde ist nicht benannt.',
    ],
    values: [
      'Tugend, Ehre und Loyalität bilden den Kern des Selbstverständnisses der Draigs. Das Haus beansprucht, besonders fromme und pflichtbewusste Ritter hervorzubringen. Dieser Anspruch ist ein Maßstab für seine Angehörigen, keine Garantie für ihr Handeln.',
      'Familie, kulturelle Zugehörigkeit und Verantwortung für Cenyr stehen im Mittelpunkt. Ritterdienst und Heirat sollen den Zusammenhalt und die Stellung des Hauses festigen. Persönliche Abenteuerlust wird daran gemessen, ob sie sich mit diesen Verpflichtungen vereinbaren lässt.',
    ],
    court: ['Der Hof vereint die gräfliche Hausführung, die Erbfolge und die Ämter zur Verwaltung von Haushalt, Besitz und Gefolge. Galahad ist das gegenwärtige Oberhaupt.'],
    familyTree: ['Der Stammbaum zeigt die Familie von Celtigern bis zu den jüngeren Generationen sowie ihre Heiratsverbindungen. Die Portraits am Hof führen zu den jeweiligen Personen. Über das Hauswappen im Stammbaum öffnet sich die Hausbiografie.'],
    historicalFigures: ['Celtigern und sein Bruder Vortigern stehen am Anfang der eng verbundenen Häuser Draig und Pendrag. Ihr gemeinsames Erbe erklärt die besondere Nähe der Draigs zur Krone Cenyrs.'],
  },
  images: {
    crest: treeAssets + 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
    scene: houseAssets + '/draig-ritter.png',
    banner: houseAssets + '/gwynthor.png',
  },
  cadets: [
    { id: 'haus-saethwyr', name: 'Haus Saethwyr', image: treeAssets + 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png' },
    { id: 'haus-wyrm', name: 'Haus Wyrm', image: treeAssets + 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png' },
    { id: 'haus-gwyvern', name: 'Haus Gwyvern', image: treeAssets + 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png' },
  ],
  heads: [
    member('celtigern-draig', 'Celtigern Draig', 'Amtszeit unbekannt'),
    member('artus-draig', 'Artus Draig', 'Amtszeit unbekannt'),
    member('godwyn-draig', 'Godwyn Draig', 'Amtszeit unbekannt'),
    member('morholt-draig', 'Morholt Draig', 'Amtszeit unbekannt'),
    member('marared-draig', 'Marared Draig', 'Beginn unbekannt – 1169'),
    member('gruffyd-draig', 'Gruffyd Draig', '1169–1172'),
    member('neithon-1136-draig', 'Neithon Draig', '1172–1184'),
    member('iorwerth-draig', 'Iorwerth Draig', '1184–1271'),
    member('kenehyr-draig', 'Kenehyr Draig', 'Beginn unbekannt – 1295'),
    member('cynan-draig', 'Cynan Draig', 'Amtszeit unbekannt'),
    member('cunedda-draig', 'Cunedda Draig', 'Beginn unbekannt – 1617'),
    member('cadwalladar-draig', 'Cadwalladar Draig', '1617–1654'),
    member('howell-draig', 'Howell Draig', '1654–1669'),
    member('merfyn-draig', 'Merfyn Draig', '1669–1685'),
    member('cahir-draig', 'Cahir Draig', '1685–1702'),
    member('rhodri-draig', 'Rhodri Draig', '1702–1720'),
    member('galahad-draig', 'Galahad Draig', 'Seit 1720 · gegenwärtiger Graf'),
  ],
  heirs: [
    member('anaraut-draig', 'Anaraut Draig', '1. in der Erbfolge'),
    member('idwal-draig', 'Idwal Draig', '2. in der Erbfolge'),
    member('tudwal-draig', 'Tudwal Draig', '3. in der Erbfolge'),
    member('neithon-1718-draig', 'Neithon Draig', '4. in der Erbfolge'),
    member('gawain-draig', 'Gawain Draig', '5. in der Erbfolge'),
  ],
  offices: [
    { role: 'Vogt', id: 'dalvin-balchder', name: 'Dalvin Balchder', familyId: 'haus-balchder', image: portrait('dalvin-balchder', HOUSE_BALCHDER_PORTRAITS) },
    { role: 'Schatzmeister', ...member('odyar-draig', 'Odyar Draig') },
    { role: 'Kommandant der Garde', ...member('steffan-draig', 'Steffan Draig') },
    { role: 'Zeremonienmeister', silhouette: 'male' },
    { role: 'Mundschenk', ...member('gawain-draig', 'Gawain Draig') },
    { role: 'Waffenmeister', id: 'duncan-gafyr', name: 'Duncan Gafyr', familyId: 'haus-gafyr', image: portrait('duncan-gafyr', HOUSE_GAFYR_PORTRAITS) },
    { role: 'Stallmeister', ...member('mailgwin-wyrm', 'Mailgwin Wyrm') },
    { role: 'Kerkermeister', silhouette: 'male' }, { role: 'Jagdmeister', silhouette: 'male' }, { role: 'Hafenmeister', silhouette: 'male' },
    { role: 'Küchenmeister', silhouette: 'male' }, { role: 'Brotmeister', silhouette: 'female' },
    { role: 'Handwerksmeister', name: 'Ruarc Balguen', image: houseAssets + '/ruarc-balguen.png' },
    { role: 'Gartenmeister', silhouette: 'female' }, { role: 'Hofkaplan', silhouette: 'male' }, { role: 'Hofmeister', silhouette: 'male' },
    { role: 'Hofdame', ...member('heledd-gwyvern', 'Heledd Draig') },
    { role: 'Archivar', ...member('trahern-draig', 'Trahaern Draig') },
    { role: 'Hoffalkner', silhouette: 'female' }, { role: 'Zwingermeister', silhouette: 'male' },
  ],
  figuresTitle: 'Begründer der Bruderhäuser',
  figures: [
    { ...member('celtigern-draig', 'Celtigern Draig'), role: 'Gründer des Hauses', description: 'Prinz der Dynastie Dreigiau und Bruder Vortigerns. Nach der Flucht aus Avallorn gründete er Haus Draig an der Südküste Cenyrs. Seine Ehe mit einer Albin verband das Haus mit der einheimischen Kultur.' },
    { ...member('vortigern-pendrag', 'Vortigern Pendrag'), role: 'Bruder des Gründers · König von Cenyr', description: 'Vortigern begründete Haus Pendrag und wurde König von Cenyr. Die gemeinsame Herkunft mit Celtigern bildet die Grundlage des bis heute engen Verhältnisses zwischen den beiden Bruderhäusern.' },
  ],
  trivia: [
    'Der Hofzauberer nimmt nur alle 100 bis 200 Jahre einen neuen Lehrling an.',
    'Das hochklappbare Visier der Drachenhelme bildet den Oberkiefer eines Drachen nach.',
    'Hausgefolge und Stadtwache unterscheiden sich durch die Wappen auf ihren Wappenröcken.',
  ],
};
