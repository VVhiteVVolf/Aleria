import { GOFRANN_ART, GOFRANN_EMBLEM, TLAWD_EMBLEM, GOFRANN_MODULE_ID, GOFRANN_TITLE, GOFRANN_PEOPLE, gofrannPerson } from './gofrann-people.mjs';
import { buildGofrannHierarchy } from './gofrann-hierarchy.mjs';
import { buildGofrannCatalog } from './gofrann-catalog.mjs';
import { buildGofrannServices } from './gofrann-services.mjs';
const paragraphs = (...text) => text.map(p => `<p>${p}</p>`).join('');
const crest = path => `../Stammbäume/${path}`;
const art = name => ({ image:`${GOFRANN_ART}/scenes/${name}.png`,imageWidth:34,imageFit:'cover',imagePosition:'center',imageTall:true });
const personConnection = key => { const p = gofrannPerson(key); return {name:p.name,detail:p.role,image:p.portrait,imageFormat:'portrait'}; };
const familyDocument = {title:'Haus Gofrann',icon:crest(GOFRANN_EMBLEM),text:'Die Meisterfamilie vom unbekannten Gründerpaar bis zu den jüngsten Kindern.',link:'../Stammbäume/Stammbaum.html?family=haus-gofrann&mode=view'};
const stats = [['Name',GOFRANN_TITLE],['Art','Waffen- und Harnischschmiede'],['Standort','Gwynthor · Innenstadt'],
  ['Eigentümer','Familie Gofrann · bedeutende Beteiligung der Tlawd'],['Leitung','Gethin und Bleddyn Gofrann'],
  ['Lehnsherr und Erzlieferant','Haus Tlawd · unter Haus Gafyr'],['Kundschaft','Söldner, Ritter und Gilden']];
export function buildGofrannModule() {
  const guild = {
    crestImage:`${GOFRANN_ART}/schild.png`,portraitFormat:'portrait',sideWidth:100,
    biographyTitle:'Eine Werkstatt, die ihr Wort hält',
    biographyText:paragraphs('Die Gofrann führen eine Waffen- und Harnischschmiede, in der ganze Rüstungen ebenso ernst genommen werden wie ein gerissener Riemen. Gethin verantwortet den Harnischbau, Bleddyn die Waffen. Ihre Familie hält Werkstatt, Verkauf und Kontor zusammen.',
      'Zum Dritten Funken zählt zu Gwynthors besten Adressen für gutes Kriegshandwerk. Andere Häuser können ihr das Wasser reichen, einzelne Meister übertreffen sie auf ihrem besonderen Gebiet. Ihr eigener Ruf beruht auf verlässlicher Arbeit, brauchbaren Zusagen und einem offenen Ohr für die Menschen, die ihre Stücke tatsächlich tragen.'),
    abilitiesTitle:'Die Handschrift des Hauses',abilities:[
      {title:'Für den Gebrauch gemacht',icon:crest(GOFRANN_EMBLEM),detail:'Ein Harnisch muss Bewegung zulassen, eine Waffe zur Hand ihres Trägers passen. Zier erhält ihren Platz, nachdem diese Fragen beantwortet sind.'},
      {title:'Verlässliche Wege zum Erz',icon:crest(TLAWD_EMBLEM),detail:'Haus Tlawd hält einen bedeutenden Anteil an der Schmiede und liefert den größten Teil des Erzes. Die Verbindung sichert Material, Aufträge und gegenseitige Verpflichtungen.'},
      {title:'Ein Name auf dem fertigen Stück',icon:'../IconOrdner/Big Traits/Trait_diligent.png',detail:'Die Meister prüfen vor der Übergabe. Ein Lehrlingsfehler darf beim Lernen entstehen; aus der Werkstatt soll er nicht unbemerkt hinausgehen.'}
    ],
    historyTitle:'Ederns Amboss und Caradfans Schleifbank',
    historyText:paragraphs('Von den frühen Gründern des Hauses sind nur die Arbeit und der Name geblieben. Greifbar wird die jüngere Geschichte mit den Brüdern Edern und Caradfan. Edern formte Harnische, Caradfan arbeitete an Klingen; ihre Söhne lernten nebeneinander und führten die Werkstatt gemeinsam weiter.',
      'Gethin und Bleddyn hielten an dieser Teilung fest. Mit dem wachsenden Betrieb wurden die Verbindung zu den Tlawd und die regelmäßigen Erzlieferungen zu einem festen Teil des Geschäfts. Heute bringen die Kinder und Enkel der beiden Meister ihre eigenen Hände und Eigenheiten mit.'),
    worksTitle:'Was hier entsteht',works:['Gebrauchstüchtige Waffen und passende Harnische.','Reparaturen, Pflege und Anpassung vorhandener Stücke.','Maßaufträge und abgestimmte Lieferungen für Gefolge und Gilden.','Ausbildung an Amboss, Werkbank und Auftragsbuch.'],
    connectionsTitle:'Familie und Verpflichtung',connections:[...['gethin','bleddyn','einion','teleri','mareda','renfri'].map(personConnection),
      {name:'Haus Tlawd',detail:'Lehnsherr · bedeutender Teilhaber · wichtigster Erzlieferant',image:crest(TLAWD_EMBLEM),imageFormat:'square'},
      {name:'Haus Gafyr',detail:'Die Tlawd stehen im Gefolge der Gafyr; über sie dient auch die Schmiede diesem Haus.',image:'../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-gafyr.png',imageFormat:'square'}],
    contractsTitle:'Das Wort zwischen den Häusern',contracts:[
      {title:'Gofrann und Tlawd',icon:crest(TLAWD_EMBLEM),text:'Die Schmiede gehört der Familie Gofrann. Die Tlawd sind bedeutende Teilhaber und sichern vor allem die Erzversorgung. Dafür leisten die Gofrann ihren vereinbarten Lehnsanteil an Haus Tlawd.'},
      {title:'Tlawd und Gafyr',icon:crest(GOFRANN_EMBLEM),text:'Haus Tlawd erfüllt seine eigenen Verpflichtungen gegenüber den Gafyr. Der Dienst der Gofrann führt über diesen Lehnsherrn weiter; die Familie bleibt ein bürgerliches Handwerkerhaus.'}
    ],
    documentsTitle:'Die Häuser',documents:[familyDocument,{title:'Haus Tlawd',icon:crest(TLAWD_EMBLEM),text:'Ritterhaus im Gefolge der Gafyr und enger Partner der Schmiede.',link:'../Stammbäume/Stammbaum.html?family=haus-tlawd&mode=view'}],
    triviaTitle:'Zwischen den Werkbänken',trivia:['Gethin und Bleddyn streiten mitunter über eine Klinge, bevor sie gemeinsam feststellen, dass der andere diesmal recht hatte.','Mareda erkennt ungeduldige Besteller daran, wie oft sie zum Werkstatttor hinübersehen.','Den dritten Funken deutet die Familie als das Wort, das nach der Arbeit noch gelten muss.'],
    footer:'Zum Dritten Funken · Stahl und Wort.'
  };
  const biography = {
    biographyTitle:'Zwei Vettern, ein gemeinsamer Amboss',
    biographyText:paragraphs(`<strong>Gethin Gofrann, 71</strong>, ist der leitende Inhaber und Harnischmeister. ${gofrannPerson('gethin').bio}`,
      `<strong>Bleddyn Gofrann, 68</strong>, ist Mitinhaber und der Waffenmeister der Schmiede. ${gofrannPerson('bleddyn').bio}`,
      'Die beiden sind zusammen aufgewachsen und stehen noch immer selbst an ihren Werkbänken. Gethin hält den täglichen Betrieb auf Kurs, Bleddyn gibt den Waffen ihre letzte Prüfung. In schwierigen Fragen entscheiden sie gemeinsam.'),
    abilitiesTitle:'Am Meister erkennt man die Arbeit',abilities:[
      {title:'Gethins Geduld',icon:'../IconOrdner/Big Traits/Trait_patient.png',detail:'Eine schließende Armschiene bewegt ihn mehr als ein vollmundiges Lob. Für eine saubere Passform nimmt er sich die nötige Zeit.'},
      {title:'Ein fester Kopf',icon:'../IconOrdner/Big Traits/Trait_stubborn.png',detail:'Gethin lässt sich durch Rang und Drängen wenig beeindrucken. Einen Termin verschiebt er lieber ehrlich, als schlechte Arbeit auszugeben.'},
      {title:'Bleddyns offenes Wort',icon:'../IconOrdner/Big Traits/Trait_gregarious.png',detail:'Mit den Gesellen lacht er gern. Wenn die Schlussprüfung beginnt, hört er aufmerksam zu und benennt einen Fehler ohne Umwege.'}
    ],
    historyTitle:'Die Söhne zweier Brüder',historyText:paragraphs('Gethins Vater Edern war Harnischmeister, Bleddyns Vater Caradfan Klingenschmied. Die Vettern lernten in derselben Werkstatt, übernahmen ihre eigenen Aufgaben und wurden über die Jahre zu einem eingespielten Paar.',
      'Teleri und Mareda tragen Kasse und Verkauf. Einion, Idnerth und Madoc haben längst feste Aufgaben; die jüngeren Angehörigen lernen an ihrer Seite. Ulaena, Bleddyns Tochter, lebt durch ihre Ehe mit Lludd im Haus Tlawd.'),
    worksTitle:'Ihre Werkbänke',works:['Gethin · Harnischbau, Passform und tägliche Werkstattleitung.','Bleddyn · Waffen, Klingenkunde und Schlussprüfung.','Gemeinsam · Ausbildung, besondere Aufträge und die Zusagen des Hauses.'],
    connectionsTitle:'Vertraute Hände',connections:['teleri','mareda','einion','renfri','idnerth','madoc','ulaena'].map(personConnection),
    quotesTitle:'An der Werkbank',quotes:['„Wenn du dich darin nicht bewegen kannst, ist es noch kein fertiger Harnisch.“ — Gethin','„Ein guter Griff verzeiht dir den schlechten Tag. Eine schlechte Klinge nicht.“ — Bleddyn'],
    documentsTitle:'Die Familie',documents:[familyDocument],footer:'Gethin und Bleddyn Gofrann · Inhaber und arbeitende Meister'
  };
  const rooms = [
    ['verkaufsraum','Verkaufsraum','Hinter dem breiten Eichentresen liegt eine saubere Lederunterlage. Mareda begrüßt die Kundschaft; Renfri hat die nächsten Anproben im Blick. An den Wänden stehen wenige sorgfältig ausgewählte Waffen und Harnische, neben dem Vorhang wartet eine Bank.'],
    ['schmiedewerkstatt','Schmiedewerkstatt','Der feste Takt eines Hammers trägt durch die Werkstatt. Zwischen Esse, Amboss und Formstöcken bleiben die Wege frei. Gethin prüft eine Platte, Bleddyn sieht von seiner Schleifbank auf; aus dem Hof kommt der Geruch von Kohle und warmem Leder.'],
    ['verwaltung','Verwaltungsraum','Im ruhigeren Raum über dem Verkauf liegen Auftragsbücher und Lieferbriefe bereit. Teleri hält die Kasse, Einion den Terminplan. Ein versiegelter Zettel der Tlawd wartet neben der nächsten Materialliste.']
  ];
  const pages = [
    { pageTitle:GOFRANN_TITLE,...art('aussenansicht'),stats,
      description:paragraphs('Unter einem langen, beschlagenen Holzschild öffnen sich in <strong>Gwynthors Innenstadt</strong> die Türen der Schmiede <strong>Zum Dritten Funken</strong>. Über dem silbernen Amboss der Gofrann steht die weiße Ziege der Tlawd. Aus dem Hof klingt der Hammer, während im Verkaufsraum bereits der nächste Harnisch anprobiert wird.',
        'Hier bestellen Söldner eine verlässliche Klinge, Ritter einen passenden Harnisch und Gilden ganze Sätze brauchbarer Ausrüstung. Die Werkstatt gehört zu den besten der Stadt. Ihr Ruf trägt weit, auch wenn Gwynthor noch andere Meister von gleichem Rang und einzelne berühmtere Hände kennt.',
        'Die Familie Gofrann besitzt und führt die Schmiede. Gethin und sein Vetter Bleddyn stehen selbst am Werkstück; ihre Angehörigen halten Verkauf, Bücher und Lieferwege zusammen. Die Tlawd sind bedeutende Teilhaber und wichtigste Erzlieferanten. An sie leisten die Gofrann ihren Lehnsanteil, während die Tlawd wiederum den Gafyr verpflichtet sind.'),
      quote:'Der erste Funke gehört dem Stahl, der zweite der Hand. Der dritte gehört dem Wort.',quoteBy:'Ein Spruch der Gofrann',commentSequence:[] },
    {pageTitle:'Die Schmiede · Handwerk und Verbindungen',guildPage:true,...art('zunftbio'),stats,guild},
    {pageTitle:'Gethin und Bleddyn Gofrann',biographyPage:true,...art('meister'),imageFit:'contain',imagePosition:'center top',
      stats:[['Gethin','71 Jahre · leitender Inhaber · Harnischmeister'],['Bleddyn','68 Jahre · Mitinhaber · Waffenmeister'],['Verwandtschaft','Vettern · Söhne der Brüder Edern und Caradfan'],['Werkstatt','Zum Dritten Funken · Gwynthor']],biography},
    {pageTitle:'Die Menschen der Schmiede',hierarchyPage:true,...art('handwerk'),hierarchy:buildGofrannHierarchy()},
    {pageTitle:'Sortiment · Waffen und Rüstungen',tradeCatalogPage:true,...art('sortiment'),tradeCatalog:buildGofrannCatalog()},
    {pageTitle:'Dienstleistungen · Pflege und Maßarbeit',guildServicesPage:true,...art('dienste'),guildServices:buildGofrannServices()},
    ...rooms.map(([id,label,intro]) => ({pageTitle:label,sessionPage:true,...art(id),sessionIntro:intro,
      sessionHint:'Ein Besuch, ein Auftrag oder ein Gespräch kann hier beginnen.',sessionEmptyTitle:'Die Werkstatt geht ihrem Tag nach',
      sessionEmptyText:'Die ersten Worte warten noch auf ihren Platz.',sessionDateAleria:{year:null,month:null,day:null}}))
  ];
  return {id:GOFRANN_MODULE_ID,title:GOFRANN_TITLE,subtitle:'Waffen und Harnische · Haus Gofrann im Dienst der Tlawd',type:'Waffen- und Rüstungsschmiede',
    category:'Gwynthor · Geschäfte',image:`${GOFRANN_ART}/scenes/aussenansicht.png`,previewImage:`${GOFRANN_ART}/scenes/aussenansicht.png`,
    symbol:`${GOFRANN_ART}/schild.png`,icon:'✦',stamp:'GWYNTHOR · HAUS GOFRANN',schemaVersion:1,multipage:true,appendCommentsPage:true,enablePageComments:true,
    sessionCast:GOFRANN_PEOPLE.filter(p => p.active && p.staff).map(p => p.worldPersonId),
    pages:pages.map((page,index) => ({schemaVersion:1,commentThreadKey:`gofrann-page-${index+1}`,...page}))};
}
