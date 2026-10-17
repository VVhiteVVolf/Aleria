import { THEATER_ID,THEATER_ART,THEATER_SIGN,AWENFRYN_EMBLEM,THEATER_PATRON,THEATER_DIRECTOR,THEATER_PEOPLE } from './theater-people.mjs';
import { buildTheaterHierarchy } from './theater-hierarchy.mjs';
import { buildTheaterProgram } from './theater-program.mjs';
import { THEATER_ROOMS } from './theater-rooms.mjs';
const p=(...texts)=>texts.map(text=>`<p>${text}</p>`).join('');
const scene=id=>({image:`${THEATER_ART}/scenes/${id}.png`,imageWidth:34,imageTall:true,imageFit:'cover',imagePosition:'center'});
const institution='../Fraktionen/index.html#fraktion-bewahrer-von-avallorn';
const instituteEmblem='../Fraktionen/assets/emblems/organisationen/bewahrer-von-avallorn.webp';
const draigEmblem='../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png';
const stats=[['Name','Gwynthorer Theater'],['Ort','Gwynthor · Innenstadt'],['Schirmherrschaft','Lady Rhianna Draig, geb. Ceirwyn'],['Inhaberin und Intendantin','Elenid Awenfryn'],['Haus','Großer Saal · mehrere Ränge · Seitenlogen'],['Lehre','Schauspiel und Dramatik']];
const connection=person=>({name:person.name,detail:person.role,image:person.portrait,imageFormat:'portrait'});

function buildTheaterBiography() {
  return {crestImage:THEATER_SIGN,portraitFormat:'portrait',
    biographyTitle:'Aus einer Spielstube wurde ein Theater',biographyText:p('Als Lady Rhianna und Elenid sich des Hauses annahmen, war es eine heruntergekommene kleine Theaterstube. Die Bühne war eng, die Ausstattung dürftig und der gute Wille der wenigen Beteiligten größer als ihre Möglichkeiten.',
      'Rhianna stellte Mittel und Rückhalt bereit; Elenid brachte ihre Bühnenerfahrung, ihre Stimme und die Menschen zusammen. Innerhalb weniger Jahre wuchs aus dem kleinen Spielort ein bedeutendes Haus. Weitere Erweiterungen gaben dem Theater die Größe, mit der es heute weit über Gwynthor hinaus in Celtigerns Wacht wirkt.'),
    abilitiesTitle:'Was das Haus trägt',abilities:[{title:'Beständige Förderung',icon:draigEmblem,detail:'Lady Rhianna ermöglicht Ausbau, Ausstattung und die langfristige Arbeit des Hauses.'},{title:'Erfahrung auf und hinter der Bühne',icon:AWENFRYN_EMBLEM,detail:'Elenid verbindet ihre Laufbahn als Bardin und Schauspielerin mit Regie und Unterricht.'},{title:'Viele Stimmen im Ensemble',icon:THEATER_SIGN,detail:'Cenyri, Alben und Gäste aus anderen Ländern spielen gemeinsam ein breites Repertoire.'}],
    historyTitle:'Mit jedem Ausbau wuchs der Anspruch',historyText:p('Zuerst wurde die alte Spielstube wieder bespielbar gemacht. Ein größerer Zuschauerraum, bessere Garderoben und feste Arbeitsräume folgten. Die Bühne erhielt Platz für bewegliche Kulissen und für Aufführungen, die das frühere Haus nie hätte tragen können.',
      'Heute öffnen sich vor dem großen Saal ein weites Foyer und die Wege zu den Rängen und Logen. Hinter dem Vorhang liegen Garderoben, Werkstatt und Probenräume. Elenids Unterricht gehört zum Alltag des Hauses: Eine Rolle beginnt für sie lange vor dem ersten Kostüm.'),
    worksTitle:'Aufgaben des Theaters',works:['Schauspiel, Komödie, historisches Drama und musikalische Bühnenarbeit.','Regelmäßige Proben sowie Unterricht in Schauspiel und Dramatik.','Pflege von Kostümen, Rollenheften, Requisiten und Kulissen.','Gastauftritte und die Aufnahme weiterer Stücke ins Repertoire.'],
    triviaTitle:'Hinter dem Vorhang',trivia:['Die alte Spielstube lebt in wenigen aufgehobenen Requisiten weiter.','Elenid lässt eine große Szene gelegentlich mit einem einzigen Stuhl proben.','Nicht jeder Darsteller spielt in jeder Aufführung dieselbe Art von Rolle.'],
    connectionsTitle:'Menschen und Herkunft',connections:[connection(THEATER_PATRON),connection(THEATER_DIRECTOR),{name:'Bewahrer Avallorns',detail:'Bardeninstitut in Lynthor · Elenids Ausbildung',image:instituteEmblem,imageFormat:'square'}],
    contractsTitle:'Förderung und künstlerische Arbeit',contracts:[{title:'Schirmherrschaft',icon:draigEmblem,text:'Rhianna unterstützt das Haus, seine Ausstattung und die Entwicklung seiner Bühne.'},{title:'Intendanz',icon:AWENFRYN_EMBLEM,text:'Elenid führt den künstlerischen Betrieb, besetzt Rollen und unterrichtet das Ensemble.'}],
    documentsTitle:'Verbindungen',documents:[{title:'Haus Draig',icon:draigEmblem,text:'Die Familie der Schirmherrin.',link:'../Stammbäume/Stammbaum.html?family=haus-draig&mode=view&person=rihanna-ceirwynn'},{title:'Bewahrer Avallorns',icon:instituteEmblem,text:'Elenids Ausbildungsinstitut, im Fraktionsregister als Bewahrer von Avallorn geführt.',link:institution}],
    footer:'Eine Bühne für viele Stimmen.'};
}

function buildLeadershipBiography() {
  return {biographyTitle:'Zwei Freundinnen, ein gemeinsames Haus',biographyText:p('Lady Rhianna Draig, geborene Ceirwyn, und Elenid Awenfryn verbinden eine langjährige Freundschaft und die Liebe zur darstellenden Kunst. Ihre Rollen ergänzen einander: Rhianna fördert und öffnet Türen, Elenid führt, lehrt und bringt das Haus auf die Bühne.',
    'Elenid stammt aus Lynthor. Sie absolvierte ihre Ausbildung am Bardeninstitut der Bewahrer Avallorns und wurde als Bardin, Künstlerin und Schauspielikone bekannt. Mit fünfundsechzig Jahren steht ihre Erfahrung nun vor allem dem Ensemble und den Lernenden zur Verfügung.'),
    abilitiesTitle:'Ihre Aufgaben',abilities:[{title:'Rhianna · Schirmherrschaft',icon:draigEmblem,detail:'Sie schuf die finanziellen Möglichkeiten für den Ausbau und steht weiterhin hinter dem Theater.'},{title:'Elenid · Regie und Lehre',icon:AWENFRYN_EMBLEM,detail:'Sie betreut Schauspiel und Dramatik, führt Proben und trägt die künstlerische Verantwortung.'}],
    historyTitle:'Vom eigenen Auftritt zur Arbeit mit dem Ensemble',historyText:p('Elenid kennt den Weg einer Szene aus eigener Bühnenerfahrung. Heute hört sie bei den Proben besonders auf die Absicht hinter einem Satz: Wer nur die Worte beherrscht, hat für sie die Rolle noch nicht gefunden.',
      'Mit üppigem silbergrauem Haar, gewagten Gewändern und geöffnetem Fächer macht Elenid selbst aus einem Auftritt am Probenrand eine kleine Inszenierung. Sie ist arrogant, exzentrisch und ihrer Wirkung sehr sicher. Ihr Können macht es dem Ensemble schwer, die hochgezogene Braue einfach abzutun.',
      'Elenid entstammt der cenyrischen Familie Awenfryn aus Lynthor. Ihr Wappen zeigt eine goldene Harfe und eine silberne Feder auf Nachtblau.'),
    worksTitle:'Im Haus begegnet man ihnen',works:['Bei Gesprächen über den weiteren Ausbau und die Arbeit des Hauses.','Bei Lesungen und ersten Proben eines neuen Stücks.','Bei besonderen Aufführungen und der Betreuung des Nachwuchses.'],
    triviaTitle:'Zwischen den Proben',trivia:['Elenids heutiger Schwerpunkt liegt auf Führung, Unterricht und Regie.','Rhiannas Förderung begleitet die Entwicklung des ganzen Hauses.'],
    quotesTitle:'Elenid am Probenrand',quotes:['„Wer auf meiner Bühne steht, hat etwas zu sagen. Andernfalls gehört der Platz mir.“'],
    connectionsTitle:'Vertraute Gesichter',connections:[connection(THEATER_PATRON),connection(THEATER_DIRECTOR),...THEATER_PEOPLE.filter(p=>['geraint','rhoswen'].includes(p.key)).map(connection)],
    documentsTitle:'Herkunft und Ausbildung',documents:[{title:'Familie Awenfryn',icon:AWENFRYN_EMBLEM,text:'Elenids cenyrische Herkunftsfamilie aus Lynthor.'},{title:'Bewahrer Avallorns',icon:instituteEmblem,text:'Elenids Ausbildung als Bardin.',link:institution}],footer:'Lady Rhianna Draig & Elenid Awenfryn'};
}

export function buildGwynthorTheater() {
  const pages=[
    {pageTitle:'Das Gwynthorer Theater',...scene('aussenansicht'),stats,description:p('Wo einst ein heruntergekommenes Theaterstübchen um sein Publikum rang, steht heute eines der großen Häuser für Kunst und Kultur in <strong>Celtigerns Wacht</strong>. Lady Rhianna Draig und ihre Freundin Elenid Awenfryn gaben dem Ort eine neue Zukunft: erst eine spielbare Bühne, dann Raum für ein festes Ensemble und schließlich einen Saal, dessen Ruf weit über Gwynthor hinausreicht.',
      'Rhiannas Förderung machte die Erweiterungen möglich. Elenid brachte die Erfahrung einer gefeierten Bardin und Schauspielerin ein. Binnen weniger Jahre verwandelten sie die kleine Spielstube in ein kulturelles Bollwerk; über die folgenden Jahre wuchs das Haus weiter.',
      'Heute warten Parkett, mehrere Ränge und seitliche Logen auf ihr Publikum. Hinter dem Vorhang wird gebaut, genäht, gelesen und geprobt. Stimmen aus Cenyr, Mathringen, Istharan, Weisenfluh und Aldrimar stehen neben albischen Darstellern auf derselben Bühne.'),quote:'Eine Bühne für viele Stimmen.',quoteBy:'Gwynthorer Theater',commentSequence:[]},
    {pageTitle:'Das Theater · Geschichte und Auftrag',guildPage:true,...scene('hausgeschichte'),stats,guild:buildTheaterBiography()},
    {pageTitle:'Rhianna Draig & Elenid Awenfryn',biographyPage:true,...scene('rhianna-elenid'),imageWidth:40,imageFit:'contain',stats:[['Rhianna','Lady Rhianna Draig, geb. Ceirwyn · Schirmherrin'],['Elenid','65 Jahre · gebürtig aus Lynthor · Intendantin'],['Ausbildung Elenids','Bewahrer Avallorns'],['Gemeinsames Werk','Aufbau und Erweiterung des Gwynthorer Theaters']],biography:buildLeadershipBiography()},
    {pageTitle:'Die Menschen des Theaters',hierarchyPage:true,hierarchy:buildTheaterHierarchy()},
    {pageTitle:'Auf der Bühne · Das Repertoire',theatreProgramPage:true,theatreProgram:buildTheaterProgram()},
    ...THEATER_ROOMS.map(room=>({pageTitle:room.title,...scene(room.id),sessionPage:true,sessionIntro:room.intro,sessionHint:'Ein Besuch, eine Probe oder eine Begegnung beginnt hier.',sessionEmptyTitle:'Das Haus wartet auf seine Stimmen',sessionEmptyText:'Die nächste Szene kann beginnen.',sessionDateAleria:{year:null,month:null,day:null}}))
  ];
  return {id:THEATER_ID,title:'Gwynthorer Theater',subtitle:'Eine Bühne für Celtigerns Wacht · Gefördert von Lady Rhianna Draig',type:'Theater & Schauspielschule',category:'Gwynthor · Kunst und Kultur',
    image:`${THEATER_ART}/scenes/aussenansicht.png`,previewImage:`${THEATER_ART}/scenes/aussenansicht.png`,symbol:THEATER_SIGN,icon:'✦',stamp:'KUNST · GWYNTHOR · CELTIGERNS WACHT',schemaVersion:1,multipage:true,appendCommentsPage:true,enablePageComments:true,
    sessionCast:THEATER_PEOPLE.map(p=>p.worldPersonId),pages:pages.map((page,index)=>({schemaVersion:1,commentThreadKey:`gwynthor-theater-${index+1}`,...page}))};
}
