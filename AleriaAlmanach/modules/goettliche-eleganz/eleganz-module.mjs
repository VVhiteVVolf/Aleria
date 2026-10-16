import { ELEGANZ_ART, ELEGANZ_EMBLEMS, ELEGANZ_MODULE_ID, eleganzPerson } from './eleganz-family-people.mjs';
import { buildEleganzHierarchy } from './eleganz-hierarchy.mjs';
import { buildEleganzCatalog } from './eleganz-catalog.mjs';
const p = (...texts) => texts.map(text=>`<p>${text}</p>`).join('');
const crest = house => `../Stammbäume/${ELEGANZ_EMBLEMS[house]}`;
const portrait = key => eleganzPerson(key).portrait;
const connection = key => { const person=eleganzPerson(key);return{name:person.name,detail:person.role,image:person.portrait,imageFormat:'portrait'}; };
const storyArt = name => ({image:`${ELEGANZ_ART}/${name}.png`,imageWidth:32,imageFit:'cover',imagePosition:'center',imageTall:true});
const stats = [['Name','Göttliche Eleganz'],['Art','Schneiderei · Kleidung & Maßarbeit'],['Standort','Gwynthor · Innenstadt'],['Inhaberin','Eleonora Cassia Raves'],['Herkunft des Hauses','Veltrane aus Tirnara · Maerllys aus Gwynthor'],['Handelspartner','Markt der Fortuna'],['Mode','Argentisch-Cenyrisch']];

export function buildGoettlicheEleganz() {
  const guild = {
    crestImage:`${ELEGANZ_ART}/schild.png`,portraitFormat:'portrait',sideWidth:100,
    biographyTitle:'Zwei Küsten, ein Haus für gute Kleidung',
    biographyText:p('Als Matteo Septimus Veltrane in Gwynthor anlegte, handelte er mit Seide, Gewürzen und Olivenöl. Die Schneidermeisterin Gwenora Maerllys wurde erst seine Geschäftspartnerin, dann seine Frau. 1662 eröffneten sie einen Krämerladen; ihre Nachkommen nannten sich in Gwynthor Raves.',
      'Gwenoras Können und Matteos Warenwege blieben zusammen. Ihr Sohn Lorenzo richtete eigene Werkstätten ein, machte gute Kleidung zum Mittelpunkt des Geschäfts und gab ihm 1710 den Namen <strong>Göttliche Eleganz</strong>. Seit seinem Tod 1734 führt seine älteste Tochter Eleonora das Haus.'),
    abilitiesTitle:'Was die Eleganz auszeichnet',abilities:[
      {title:'Die Stoffe kommen über die eigene Verbindung',icon:crest('veltrane'),detail:'Das Stammhaus bringt Seide, Brokat und südliche Tuche aus Tirnara über Lothir nach Estryll. Tiberian hält Mengen, Qualität und Zusagen im Blick.'},
      {title:'Gwynthors Hände vollenden die Arbeit',icon:crest('maerllys'),detail:'Cenyrische Schnittkunde trifft auf argentische Mode. Örtliche Goldschmiede und Fassungsarbeiter liefern Edelmetallbesätze und gefasste Steine.'},
      {title:'Der letzte Maßstab ist der Sitz',icon:crest('raves'),detail:'Günstigere Warenwege sparen Umwege und Aufschläge. Die gewonnene Sorgfalt fließt in Stoffprüfung, passende Schnitte und saubere Verarbeitung.'}
    ],
    historyTitle:'Vom Krämerladen zur ersten Adresse',
    historyText:p('Matteo blieb in Gwynthor; die Veltrane-Schiffe kamen weiter. In den Regalen standen anfangs Ölkrüge und Gewürzdosen neben Stoffballen. Gwenoras Kundschaft sorgte bald dafür, dass die Tuche häufiger gefragt waren als der Rest.',
      'Lorenzo baute den Schneiderbetrieb aus, trennte Warenlager und Werkstätten vom repräsentativen Verkauf und festigte die Zusammenarbeit mit dem Markt der Fortuna. Eleonora verfeinerte die Hausmodelle und machte die persönliche Anprobe zu ihrem besonderen Markenzeichen.'),
    worksTitle:'Das tägliche Geschäft',works:['Garnituren für Alltag, Besuch und große Feste.','Persönliche Beratung, Anproben und passende Änderungen.','Eigene Damen- und Herrenschneiderei in Gwynthor.','Handstickerei und Besätze aus örtlicher Goldschmiedearbeit.'],
    connectionsTitle:'Die Menschen und Verbindungen des Hauses',connections:[connection('eleonora'),connection('tiberian'),connection('orestian'),connection('luciano'),connection('rhiain'),connection('maelwen'),
      {name:'Haus Veltrane',detail:'Stammhaus und südliche Warenwege',image:crest('veltrane'),imageFormat:'square'},
      {name:'Haus Maerllys',detail:'Gwynthorer Schneidertradition',image:crest('maerllys'),imageFormat:'square'},
      {name:'Markt der Fortuna',detail:'Handelskooperation · Ansprechpartner Tiberian Raves',image:'../Fraktionen/assets/emblems/gilden/markt-der-fortuna.webp',imageFormat:'square'}],
    contractsTitle:'Vom Wunsch zum fertigen Gewand',contracts:[{title:'Anprobe & Auftrag',icon:`${ELEGANZ_ART}/schild.png`,text:'Maelwen nimmt Wünsche und Termine auf. Stoff, Ausführung, Preis und Fertigstellung werden vor Beginn der Arbeit vereinbart.'},{title:'Entwurf & Abholung',icon:crest('raves'),text:'Die Werkstätten fertigen, Eleonora prüft die besonderen Aufträge. Die letzte Anprobe entscheidet über die Übergabe.'}],
    documentsTitle:'Die Familien',documents:[{title:'Haus Raves',text:'Die Gwynthorer Linie vom Kapitän und seiner Schneiderin bis zur heutigen Familie.',icon:crest('raves'),link:'../Stammbäume/Stammbaum.html?family=haus-raves&mode=view'},{title:'Haus Veltrane',text:'Das bürgerliche Stammhaus aus dem Tirnara-Teil des Kaiserreichs Argentum.',icon:crest('veltrane'),link:'../Stammbäume/Stammbaum.html?family=haus-veltrane&mode=view'}],
    triviaTitle:'Im Laden erzählt man',trivia:['Rhiain trennt eine schiefe Heftnaht auf, auch wenn eine sehr teure Kundin danebensteht.','Eleonora lässt ihre teuersten Stoffe zuerst bei Tageslicht ansehen.','Ein guter Brief von den Veltrane kann im Kontor mehr Freude machen als eine volle Kasse.'],
    footer:'Südliche Stoffe. Cenyrische Hände. Der richtige Schnitt.'
  };
  const eleonora = eleganzPerson('eleonora');
  const biography = {
    biographyTitle:'Ein Blick für das Wesentliche',biographyText:p(eleonora.bio,'Seit 1734 trägt sie den Namen des Hauses nach außen. Ihre Brüder halten ihr den Rücken frei: Tiberian auf den Handelswegen, Orestian im Kontor. Mit Luciano bespricht sie Stoff und Farbe oft länger, als ein fertiger Entwurf später vermuten lässt.'),
    abilitiesTitle:'Eigenheiten',abilities:[
      {title:'Sicheres Auge',icon:'../IconOrdner/Big Traits/Trait_diligent.png',detail:'Sie erkennt einen unruhigen Faltenfall, bevor ihr Gegenüber den Grund für sein Unbehagen benennen kann.'},
      {title:'Höflich und bestimmt',icon:crest('raves'),detail:'Ein schlechter Schnitt wird nicht durch den Rang seines Bestellers besser. Eleonora sagt das freundlich, aber unmissverständlich.'},
      {title:'Unaufdringlicher Stolz',icon:crest('veltrane'),detail:'Ihre südliche Herkunft zeigt sich in Stoffen und Formen. Über den Wert ihrer Arbeit soll das fertige Gewand sprechen.'}
    ],
    historyTitle:'In den Werkstätten aufgewachsen',historyText:p('Eleonora lernte im Geschäft ihres Vaters und an Rhiains Zuschneidetisch. Von den Lieferungen der Veltrane sah sie zuerst Muster, später die langen Rechnungen dahinter. Ihre Entwürfe verbinden die elegante Linie Argentums mit Kleidern, die sich auch in Gwynthor angenehm tragen lassen.',
      '1724 heiratete sie Luciano Marcellus Veltrane aus einem anderen Zweig des alten Handelshauses. Ihr Sohn Aurelio lernt inzwischen das Schneiderhandwerk; Lavinia entdeckt die Werkstätten noch mit den Augen eines Kindes.'),
    worksTitle:'Im Haus begegnet man ihr',works:['Bei der Beratung einer besonderen Festgarnitur.','Am Zuschneidetisch, wenn ein neuer Schnitt entstehen soll.','Bei der letzten Anprobe vor der Übergabe.'],
    connectionsTitle:'Familie & vertraute Hände',connections:['luciano','tiberian','orestian','rhiain','aurelio','lavinia'].map(connection),
    quotesTitle:'Eine Stimme aus dem Haus',quotes:['„Ein Gewand darf Eindruck machen. Zuerst muss es aber zu seinem Menschen passen.“'],
    triviaTitle:'Kleine Gewohnheiten',trivia:['Ein heller Stoff wird bei Tageslicht gewählt.','Sie merkt sich die Haltung ihrer Stammkundschaft besser als deren Schmuck.','Ein gut gewähltes schlichtes Gewand gewinnt bei ihr gegen unnötigen Prunk.'],
    documentsTitle:'Haus Raves',documents:[{title:'Die Familie Raves',icon:crest('raves'),text:'Der Gwynthorer Zweig der Veltrane.',link:'../Stammbäume/Stammbaum.html?family=haus-raves&mode=view&person=eleonora-raves'}],footer:''
  };
  const pages = [
    {pageTitle:'Göttliche Eleganz',...storyArt('aussenansicht'),
      description:p('Unter einem dunkelblauen, weißgoldgefassten Holzschild öffnen sich die hohen Fenster der <strong>Göttlichen Eleganz</strong>. Zwischen Gwynthors repräsentativen Innenstadtfassaden fällt das Geschäft durch helle Steinrahmen, sorgfältig gekleidete Auslagen und die Ruhe hinter seiner Tür auf.',
        'Hier findet die Bürgerin ein gutes Tagesgewand und der vermögende Gast eine Garnitur, deren Preis ihn noch einmal schweigen lässt. Für beides gilt Eleonora Cassia Raves derselbe Maßstab: guter Stoff, ein passender Schnitt und Arbeit, die auch von innen sauber aussieht.',
        'Die Verbindung nach Tirnara bringt kostbare Seiden und Brokate ins Haus. Gwynthors Handwerker liefern die feinen Beschläge und Fassungen. Aus diesen kurzen Wegen und alten Beziehungen ist die wohl beste Schneiderei der Stadt gewachsen.'),
      stats,quote:'Ein guter Schnitt wird nicht lauter, nur weil der Stoff kostbar ist.',quoteBy:'Eleonora Cassia Raves',commentSequence:[]},
    {pageTitle:'Das Geschäft · Geschichte & Handschrift',guildPage:true,...storyArt('werkstatt-stillleben'),stats,guild},
    {pageTitle:'Eleonora Cassia Raves',biographyPage:true,image:portrait('eleonora'),imageWidth:32,imageTall:true,imageFit:'cover',imagePosition:'center',
      stats:[['Name',eleonora.name],['Alter','39 Jahre'],['Herkunft','Gwynthor · Haus Raves'],['Aufgabe','Inhaberin · Entwurf & letzte Anprobe'],['Gemahl','Luciano Marcellus Veltrane'],['Kinder','Aurelio und Lavinia']],biography},
    {pageTitle:'Die Menschen des Hauses',hierarchyPage:true,hierarchy:buildEleganzHierarchy()},
    {pageTitle:'Angebot · Die Hauskollektion',tradeCatalogPage:true,tradeCatalog:buildEleganzCatalog()},
    {pageTitle:'Der Verkaufsraum · Beratung & Anprobe',sessionPage:true,...storyArt('verkaufsraum'),
      sessionIntro:'Weiches Tageslicht fällt auf dunkelblaues Holz und ordentlich gefaltete Tuche. Vor den Auslagen ist Raum zum Gehen; hinter einem schweren Vorhang wartet die Anprobeecke. Maelwens Auftragsbuch liegt bereit, und aus einer geöffneten Stoffbahn steigt der saubere Geruch neuer Seide auf.',
      sessionHint:'Ein Besuch, eine Anprobe oder ein vertrauliches Gespräch beginnt hier.',sessionEmptyTitle:'Die Tür steht offen',sessionEmptyText:'Draußen geht Gwynthor seinem Tag nach. Drinnen wartet der erste Wunsch auf ein aufmerksames Ohr.',sessionDateAleria:{year:null,month:null,day:null}}
  ];
  return {id:ELEGANZ_MODULE_ID,title:'Göttliche Eleganz',subtitle:'Gwynthors feine Schneiderei · Das Haus Raves',type:'Schneiderei & Kleidungshandel',category:'Gwynthor · Geschäfte',
    image:`${ELEGANZ_ART}/aussenansicht.png`,previewImage:`${ELEGANZ_ART}/aussenansicht.png`,symbol:`${ELEGANZ_ART}/schild.png`,icon:'✦',stamp:'ARGENTISCH · CENYRISCH',schemaVersion:1,multipage:true,appendCommentsPage:true,enablePageComments:true,
    sessionCast:['eleonora','tiberian','orestian','luciano','rhiain','maelwen','aurelio'].map(key=>eleganzPerson(key).worldPersonId),
    pages:pages.map((page,index)=>({schemaVersion:1,commentThreadKey:`eleganz-page-${index+1}`,...page}))};
}
