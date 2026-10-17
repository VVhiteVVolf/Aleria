import { GOFRANN_PEOPLE, GOFRANN_EMBLEM, TLAWD_EMBLEM } from '../../../AleriaAlmanach/modules/gofrann-schmiede/gofrann-people.mjs';

export const GOFRANN_HOUSE_CONTENT = Object.freeze({
  contentVersion:'gofrann-20261016-local',id:'haus-gofrann',name:'Haus Gofrann',type:'Bürgerliches Haus',page:'kleinehaeuser.html',
  county:'Celtigerns Wacht',liege:'Haus Tlawd',territoryId:'celtigerns-wacht',territoryName:'Celtigerns Wacht',
  territoryHref:'../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  parentHouseId:'',extinct:false,showMotto:true,prepared:false,registerPage:true,biographySourceRevision:1,
  biographyIntroTitle:'Über die Familie',biographyHistoryTitle:'Zwei Werkbänke, ein Haus',
  biographySummary:{
    overview:'Die Gofrann führen die Waffen- und Harnischschmiede Zum Dritten Funken in Gwynthors Innenstadt. Gethin und sein Vetter Bleddyn stehen selbst am Werkstück; ihre Familie hält Verkauf, Bücher und Lieferwege zusammen.',
    history:'Nach den unbekannten Gründern setzt die Überlieferung bei den Brüdern Edern und Caradfan ein. Ihre Söhne Gethin und Bleddyn lernten nebeneinander und führten die Werkstatt gemeinsam weiter.',
    character:'Ein Harnisch soll Bewegung zulassen, eine Klinge zur Hand ihres Trägers passen. Die Meister versprechen keinen unmöglichen Termin und geben ein Stück erst nach ihrer Prüfung heraus.'
  },
  hierarchy:[['Sammlung','Familien Häuser und Clans','familien-hauser-und-clans'],['Kontinent','Estryll','estryll'],['Königreich','Cenyr','cenyr'],['Grafschaft','Celtigerns Wacht','celtigerns-wacht'],['Region','Llamreis Ankunft','llamreis-ankunft'],['Sitz','Gwynthor','gwynthor'],['Haus','Haus Gofrann','haus-gofrann']].map(([type,name,slug])=>({type,name,slug})),
  profile:{highestTitle:'Bürgerlich',rank:'Bürgerlich',houseType:'Bürgerliche Meisterfamilie',motto:'Stahl und Wort.',
    seat:'Gwynthor · Innenstadt',affiliation:'Zum Dritten Funken',liege:'Haus Tlawd',origin:'Gwynthor',founding:'Nicht überliefert',
    people:'Cenyri',wealth:'Waffen- und Harnischschmiede',patron:'Haus Tlawd',knightingPatron:'—',milestoneOne:'Edern und Caradfan · Ausbau der Werkstatt',milestoneTwo:'Gethin und Bleddyn · gemeinsame Meisterführung',
    religion:'Alerische Kirche',patronDeities:'Der Knecht',allies:'Haus Tlawd · mittelbar Haus Gafyr',enemies:''},
  sections:{
    overview:'Unter dem Amboss und den drei Funken entstehen Waffen und Harnische für Ritter, Söldner und Gilden. Die Gofrann gehören zu den angesehenen Handwerkerfamilien Gwynthors.',
    history:'Edern führte die Harnischbank, sein Bruder Caradfan die Klingenarbeit. Gethin und Bleddyn behielten diese Teilung bei und machten aus den vertrauten Werkbänken einen Betrieb, in dem heute mehrere Generationen zusammenarbeiten.',
    traditions:'Vor der Übergabe prüfen die Meister das fertige Stück. Am Familiennamen soll auch nach Jahren noch eine gute Nietung, ein sicherer Griff und eine eingehaltene Zusage hängen.',
    knighthood:'Die Gofrann sind ein bürgerliches Handwerkerhaus. Ihr Ansehen erwächst aus dem Handwerk und dem Dienst an den Tlawd.',
    succession:'Gethin führt das Haus, Bleddyn trägt die Meisterverantwortung für Waffen. Einion ordnet den Betrieb; Idnerth und Madoc arbeiten als Gesellen. Über eine spätere Nachfolge ist noch nicht entschieden.',
    holdings:'Die Familie besitzt und führt die Schmiede Zum Dritten Funken mit Verkaufsraum, Werkstatt und Kontor in Gwynthors Innenstadt. Haus Tlawd hält einen bedeutenden Anteil und liefert den größten Teil des Erzes.',
    cultureReligion:'Die Familie lebt nach cenyrischen Bräuchen. Der Knecht wird für redliche Arbeit und den Zusammenhalt der vielen Hände verehrt.',
    conflictsAlliances:'Die Gofrann leisten ihren Lehnsanteil an Haus Tlawd. Die Tlawd erfüllen wiederum ihre Verpflichtungen gegenüber den Gafyr; über sie steht auch die Schmiede in deren Dienst.',
    values:'Brauchbare Arbeit, ehrliche Termine und ein Wort, das nach der Bezahlung noch gilt.',
    court:'Teleri führt Kasse und Löhne, Mareda den Verkauf. Renfri betreut Anproben, Ceryth die Beratung und Aneira die Warenannahme. Die Jüngeren lernen an Werkbank und Auftragsbuch.',
    familyTree:'Von den unbekannten Gründern führt ein Zeitsprung zu Edern und Caradfan. Ihre Söhne Gethin und Bleddyn sind Vettern. Einion und Renfri führen ihren Zweig bei Gofrann fort; Ulaena lebt mit Lludd und ihren Kindern im Haus Tlawd.',
    historicalFigures:'Ederns Geduld am Harnisch und Caradfans Auge für Klingen wirken in der heutigen Werkstatt fort.'
  },
  images:{crest:`../Stammbäume/${GOFRANN_EMBLEM}`,scene:'../AleriaAlmanach/assets/gofrann-schmiede/scenes/aussenansicht.png',sceneAlt:'Zum Dritten Funken in Gwynthors Innenstadt',banner:'Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/gwynthor.png'},
  placeholders:{male:'../Stammbäume/assets/images/placeholders/male.png',female:'../Stammbäume/assets/images/placeholders/female.png'},
  allies:[{name:'Haus Tlawd',detail:'Lehnsherr, bedeutender Teilhaber und wichtigster Erzlieferant',image:`../Stammbäume/${TLAWD_EMBLEM}`,imageFormat:'square'}],
  founder:null,heads:[],heirs:[],offices:[],cadets:[],currentHead:'Gethin Gofrann · leitender Inhaber',firstHeir:'Nicht festgelegt',figuresTitle:'Familie & Werkstatt',
  figures:GOFRANN_PEOPLE.map(p=>({id:p.id,familyId:p.house==='tlawd'?'haus-tlawd':'haus-gofrann',name:p.name,role:p.role,description:p.bio,
    image:p.portrait.startsWith('../Stammbäume/')?p.portrait:`../AleriaAlmanach/${p.portrait.slice(2)}`})),
  trivia:['Gethin und Bleddyn necken einander seit ihrer Lehrzeit.','Mareda kennt die ungeduldigsten Stammkunden am Schritt vor dem Tresen.','Der dritte Funke steht für das Wort, das nach der Arbeit noch gelten muss.']
});
