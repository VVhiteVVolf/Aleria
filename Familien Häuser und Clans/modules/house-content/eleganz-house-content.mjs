import { ELEGANZ_PEOPLE, ELEGANZ_EMBLEMS } from '../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-family-people.mjs';
export const RAVES_HOUSE_CONTENT = Object.freeze({
  contentVersion:'eleganz-20261016',
  id:'haus-raves',name:'Haus Raves',type:'Bürgerliches Haus',page:'kleinehaeuser.html',county:'Celtigerns Wacht',liege:'Haus Draig',
  territoryId:'celtigerns-wacht',territoryName:'Celtigerns Wacht',territoryHref:'../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  parentHouseId:'haus-veltrane',extinct:false,showMotto:false,prepared:false,registerPage:true,
  biographySourceRevision:1,biographyIntroTitle:'Über die Familie',biographyHistoryTitle:'Von zwei Küsten nach Gwynthor',
  biographySummary:{
    overview:'Die Raves führen mit der Göttlichen Eleganz Gwynthors wohl beste Schneiderei. Die Familie vereint die südlichen Handelsverbindungen der Veltrane mit der Schneiderkunst der Maerllys.',
    history:'Matteo Septimus Veltrane blieb bei der Schneidermeisterin Gwenora Maerllys in Gwynthor. Ihr 1662 eröffneter Krämerladen entwickelte sich unter ihrem Sohn Lorenzo zum Kleiderhaus. Seit 1734 führt Eleonora Cassia Raves das Geschäft.',
    character:'Eleonora entwirft, Tiberian hält die Warenwege offen und Orestian führt die Bücher. Rhiain gibt ihre Schnittkunde weiter; Luciano prüft die kostbaren Stoffe. Im Haus zählt eine unscheinbare saubere Naht ebenso viel wie ein glänzender Besatz.'
  },
  hierarchy:[['Sammlung','Familien Häuser und Clans','familien-hauser-und-clans'],['Kontinent','Estryll','estryll'],['Königreich','Cenyr','cenyr'],['Grafschaft','Celtigerns Wacht','celtigerns-wacht'],['Region','Llamreis Ankunft','llamreis-ankunft'],['Sitz','Gwynthor','gwynthor'],['Haus','Haus Raves','haus-raves']].map(([type,name,slug])=>({type,name,slug})),
  profile:{highestTitle:'Bürgerlich',rank:'Bürgerlich',houseType:'Bürgerliches Handelshaus',motto:'',seat:'Gwynthor · Innenstadt',affiliation:'Göttliche Eleganz',liege:'Haus Draig',
    origin:'Veltrane aus Tirnara · Maerllys aus Gwynthor',founding:'1660 · Gründerehe; Geschäft seit 1662',people:'Argentisch-cenyrische Familie',wealth:'Schneiderei, Kleidungshandel und südliche Stoffimporte',
    patron:'Stadt Gwynthor',knightingPatron:'—',milestoneOne:'1710 · Name Göttliche Eleganz',milestoneTwo:'1734 · Eleonora übernimmt',religion:'Bräuche beider Heimaten',patronDeities:'',allies:'Haus Veltrane · Haus Maerllys · Markt der Fortuna',enemies:''},
  sections:{
    overview:'Hinter dem dunkelblauen Schild der Göttlichen Eleganz steht ein altes Familiengeschäft. Die Raves sind in Gwynthor zu Hause und halten ihre Verbindung zum fernen Tirnara lebendig.',
    history:'Ein Handelskapitän und eine Schneidermeisterin legten den Grundstein. Matteo Veltrane brachte Waren aus dem Süden, Gwenora Maerllys Kundschaft und Können. Ihr Sohn Lorenzo machte Kleidung zum Mittelpunkt des Hauses. Nach seinem Tod übernahm seine älteste Tochter Eleonora die Führung.',
    traditions:'Silber, Weißgold, Purpur und dunkles Blau bestimmen viele Hausentwürfe. Cenyrische Flechtmuster treffen auf argentische Schnitte; die Güte des Stoffes soll auch ohne schweren Schmuck erkennbar bleiben.',
    knighthood:'Das Ansehen der Familie beruht auf Handel und Handwerk. Sie gehört zum wohlhabenden Bürgertum Gwynthors.',
    succession:'Eleonora führt das Geschäft. Ihr Sohn Aurelio lernt das Schneiderhandwerk; welchen Weg er später nimmt, wird sich zeigen.',
    holdings:'Verkaufs- und Anproberäume in Gwynthors Innenstadt, eigene Schneidereien und trockene Stofflager in der Stadt. Die Waren kommen über die Veltrane-Verbindung und örtliche Handwerksbetriebe.',
    cultureReligion:'Die Raves bewahren die elegante Formenwelt ihrer südlichen Herkunft und die praktische Sorgfalt ihrer cenyrischen Heimat. Am Familientisch geht es oft um Schiffe, Stoffe und Menschen.',
    conflictsAlliances:'Die Zusammenarbeit mit dem Markt der Fortuna wird durch Tiberian gepflegt. Das Stammhaus Veltrane sichert den Zugang zu südlichen Stoffen; die Verbindung zu Maerllys bleibt Teil des Familiengedächtnisses.',
    values:'Verlässliche Zusagen, gutes Material und saubere Arbeit. Ein Gewand soll seinem Träger dienen und den Namen des Hauses lange gut vertreten.',
    court:'Eleonora, Tiberian und Orestian teilen sich Entwurf, Handel und Verwaltung. Maelwen empfängt die Kundschaft, Rhiain lehrt den Nachwuchs und Luciano prüft die Waren.',
    familyTree:'Vom Veltrane-Kapitän und seiner Maerllys-Braut führt die Linie über Lorenzo bis zu Eleonora und ihren Brüdern. Livia lebt in Venalys, Flavia in Tirnara; die Namen ihrer Gemahle bleiben unbekannt.',
    historicalFigures:'Die Familie begegnet ihren Gästen im Laden, am Anprobetisch und in den Werkstätten.'
  },
  images:{crest:`../Stammbäume/${ELEGANZ_EMBLEMS.raves}`,scene:'../AleriaAlmanach/assets/goettliche-eleganz/aussenansicht.png',sceneAlt:'Die Göttliche Eleganz in Gwynthors Innenstadt',banner:'Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/gwynthor.png'},
  placeholders:{male:'../Stammbäume/assets/images/placeholders/male.png',female:'../Stammbäume/assets/images/placeholders/female.png'},
  allies:[{name:'Haus Veltrane',detail:'Stammhaus und Handelsroute aus Tirnara',image:`../Stammbäume/${ELEGANZ_EMBLEMS.veltrane}`,imageFormat:'square'},{name:'Haus Maerllys',detail:'Schneiderfamilie aus Gwynthor',image:`../Stammbäume/${ELEGANZ_EMBLEMS.maerllys}`,imageFormat:'square'}],
  founder:null,heads:[],heirs:[],offices:[],cadets:[],currentHead:'Eleonora Cassia Raves · Geschäftsinhaberin',firstHeir:'Nicht festgelegt',figuresTitle:'Familie & Geschäft',
  figures:ELEGANZ_PEOPLE.map(p=>({id:p.id,familyId:'haus-raves',name:p.name,role:p.role,description:p.bio,image:`../AleriaAlmanach/${p.portrait.slice(2)}`})),
  trivia:['Der erste Laden führte neben Stoffen auch Öl und Gewürze.','Die schillernden Haarfarben der Raves erinnern an beide Seiten ihrer Herkunft.','Lavinia hält ihre eigenen Puppenkleider für die eigentliche Hauskollektion.']
});
