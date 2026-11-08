import { HOUSE_MAERLLYS_FAMILY } from '../../../Stammbäume/assets/js/data/house-maerllys-family.js';
import { buildMaerllysCatalog, MAERLLYS_ART } from './maerllys-catalog.mjs';
import { buildMaerllysHierarchy, MAERLLYS_STAFF } from './maerllys-hierarchy.mjs';
export const MAERLLYS_MODULE_ID='naht-und-siegel';
const p=(...texts)=>texts.map(text=>`<p>${text}</p>`).join('');
const crest='../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png';
const art=name=>({image:`${MAERLLYS_ART}/szenen/${name}.png`,imageWidth:32,imageFit:'cover',imagePosition:'center',imageTall:true});
const people=id=>HOUSE_MAERLLYS_FAMILY.persons.find(person=>person.id===id);
const connection=(id,detail)=>{const person=people(id);if(!person)throw new Error(`Fehlende Maerllys-Verbindung: ${id}`);return{name:person.name,detail,image:person.portrait?`../Stammbäume/${person.portrait}`:'',imageFormat:'portrait'};};
const stats=[['Name','Naht & Siegel'],['Art','Schneiderei · Dienstkleidung & Hauslivreen'],['Familie','Haus Maerllys'],['Standort','Gwynthor'],['Kundschaft','Adelshaushalte, Verwalter & Arbeitgeber'],['Handwerk','Cenyrische Schnitte · Einzelanprobe · zusammengehörige Serien'],['Kooperation','Göttliche Eleganz']];
const documents=[
 {title:'Haus Maerllys',icon:crest,text:'Die Familie, ihre Geschichte und ihr Gwynthorer Schneiderhandwerk.',link:'../Familien Häuser und Clans/kleinehaeuser.html?haus=maerllys'},
 {title:'Stammbaum Maerllys',icon:crest,text:'Die überlieferte Linie und ihre verwandtschaftlichen Verbindungen.',link:'../Stammbäume/Stammbaum.html?family=haus-maerllys&mode=view'},
 {title:'Göttliche Eleganz',icon:'./assets/goettliche-eleganz/schild.png',text:'Die kooperierende Schneiderei für persönliche Garderobe und besondere Festentwürfe.',link:'?module=goettliche-eleganz'}
];
function buildHistory() {
 return {crestImage:`${MAERLLYS_ART}/schild.png`,portraitFormat:'portrait',sideWidth:100,
  biographyTitle:'Ein eigenes Hausbild für den Dienst',biographyText:p('Eine Zofe muss sich beim Ankleiden ihrer Herrin frei bewegen können. Ein Hausbursche trägt Bündel, ein Vogt sitzt über Listen, und ein Oberdiener soll beim Empfang ruhig und ordentlich erscheinen. Die Maerllys beginnen bei diesen Unterschieden. Erst danach wählen sie die Farbe, die einen Haushalt zusammenhält.',
   '<strong>Naht & Siegel</strong> ist eine kleinere professionelle Schneiderei. Das Haus nimmt Einzelgarnituren ebenso wie eine abgestimmte Ausstattung für mehrere Bedienstete an. Die Person, die bestellt, und die Menschen, die die Kleidung tragen, werden bei der Anprobe zusammen gedacht.'),
  abilitiesTitle:'Worauf die Maerllys achten',abilities:[
   {title:'Bewegung vor Zier',icon:'✂',detail:'Schulter, Ärmel und Rücken werden passend zum Dienst geschnitten. Was beim Sitzen, Tragen oder Gehen stört, gehört in die Anprobe.'},
   {title:'Gleichartig und passend',icon:'☷',detail:'Farbe, Verschlüsse und Borten verbinden die Garnituren. Länge, Weite und Proportionen richten sich nach dem einzelnen Menschen.'},
   {title:'Teile, die sich erneuern lassen',icon:'✦',detail:'Wechselmanschetten, Schürzen und zugängliche Nähte erleichtern Pflege und spätere Ausbesserungen. Der Stoff muss die gewählte Aufgabe vertragen.'}
  ],
  historyTitle:'Verwandtschaft und eigenständiges Handwerk',historyText:p('Die Maerllys gingen bereits vor der heute belegten Generationenfolge als eigener Familienzweig aus den Gwniwr hervor. Die damaligen Zwischengenerationen und der genaue Zeitpunkt der Abspaltung sind nicht einzeln überliefert. Aus der gemeinsamen Herkunft wurde kein gemeinsamer heutiger Laden: Beide Häuser pflegen ihre eigenen Schnitte und ihre eigene Kundschaft.',
   'Im überlieferten älteren Maerllys-Zweig steht auch Gwenora, deren Schneiderarbeit Teil der Geschichte der Göttlichen Eleganz wurde. Die heutige Zusammenarbeit knüpft an diese handwerkliche Nähe an. Naht & Siegel konzentriert sich auf Dienstkleidung und zusammengehörige Hausausstattungen; die Eleganz auf persönliche Garderobe und aufwendigere Festentwürfe.',
   'Iorwerth ordnet die Aufträge, Bronwen verantwortet Anprobe und Qualitätskontrolle. Geraint leitet den Zuschnitt der Herrenlivreen, und Llio hält die Nähfolge zusammengehöriger Garnituren zusammen. Die älteren Angehörigen können mit ihrer Erfahrung beraten, ohne dass jeder von ihnen eine heutige Werkstattstelle besetzt.'),
  worksTitle:'Was hier entsteht',works:['Arbeitskleider und Zofengarnituren für den täglichen Hausdienst.','Wämser, Dienst- und Amtsröcke für Diener, Vögte und Verwaltungsleute.','Abgestimmte Livreen für Gefolge, Empfang und den förmlichen Dienst.','Wärmere Ausführungen für Wege über Hof, Feld und zwischen den Gebäuden.','Änderungen, Reparaturen und ergänzende Garnituren nach vorheriger Sichtung.'],
  connectionsTitle:'Familie und verwandtes Handwerk',connections:[
   connection('iorwerth-maerllys','Leitung · Aufträge und Dienstschnitte'),connection('bronwen-swyll','Anprobe · Passform und Prüfung'),connection('geraint-maerllys','Werkstattleitung · Herrenlivreen'),connection('llio-falchdyn','Nähstube · zusammengehörige Garnituren'),
   connection('nia-maerllys','Angehörige im persönlichen Dienst bei Prinzessin Isobel Draig'),connection('rhys-maerllys','Angehöriger im Alltagsverkauf der Göttlichen Eleganz')],
  contractsTitle:'Ein klar vereinbarter Auftrag',contracts:[
   {title:'Beschreibung vor Zuschnitt',icon:'☷',text:'Stückzahl, Träger, Materialien, Farbe, enthaltene Teile und Fertigstellung werden gemeinsam festgehalten. Eine Musterfreigabe geht der Arbeit an einer größeren Serie voraus.'},
   {title:'Anprobe vor Übergabe',icon:'✂',text:'Auch eine einheitliche Hauslivree wird je Person geprüft. Das fertige Gewand soll den Dienst erleichtern und kann bei der Übergabe noch die vereinbarten kleinen Änderungen erhalten.'}],
  documentsTitle:'Häuser und Verbindungen',documents,
  triviaTitle:'In der Werkstatt',trivia:['Ein loses Probierstück verrät mehr über Bewegungsraum als ein besonders straffer erster Sitz.','Die hellen Teile einer Dienstgarnitur werden bewusst so gewählt, dass sie einzeln gepflegt werden können.','Ein sauber zugeordnetes Stoffmuster erspart später langes Rätseln über beinahe gleiche Blautöne.'],footer:'Ein gemeinsamer Auftritt. Ein passender Schnitt.'};
}
function buildServices() {
 return {crestImage:`${MAERLLYS_ART}/schild.png`,portraitFormat:'portrait',sideWidth:100,
  biographyTitle:'Ein Haushalt wird eingekleidet',biographyText:p('Wer mehrere Bedienstete ausstatten möchte, bringt zuerst die Aufgaben zusammen: Wer arbeitet am Feuer, wer trägt, wer empfängt, wer schreibt und wer begleitet die Herrschaft außer Haus? Iorwerth und Bronwen stellen daraus mit der bestellenden Person eine verständliche Auswahl zusammen. Der gleiche Farbton verlangt nicht überall den gleichen Stoff oder Ärmel.',
   'Ein Auftrag kann mit einer einzelnen Musterlivree beginnen. Erst nach der Besprechung von Schnitt, Tragegefühl und Ausführung wird die größere Folge zugeschnitten. Für die Anproben sollen die tatsächlichen Träger kommen; eine Liste von Namen ersetzt keine passenden Maße.'),
  abilitiesTitle:'Dienstleistungen nach Absprache',abilities:[
   {title:'Hausausstattung & Serien',icon:'☷',detail:'Eine abgestimmte Auswahl für Küche, Kammer, Tor, Kontor und Empfang. Farbe und Einfassungen halten das Hausbild zusammen, die Schnitte folgen dem jeweiligen Dienst.'},
   {title:'Einzelanprobe & Maßarbeit',icon:'✂',detail:'Anpassung von Weite, Ärmellänge, Schulter und Saum. Bei Arbeiten mit viel Bewegung wird die passende Haltung in der Anprobe mitgeprüft.'},
   {title:'Hausfarben & bestätigte Zeichen',icon:'⚑',detail:'Eine vorhandene Hausfarbe, Borte oder ein ausdrücklich bestätigtes Zeichen kann in einen Sonderentwurf aufgenommen werden. Muster, Größe und Ausführung werden vor Beginn vorgelegt.'},
   {title:'Ersatz & Ergänzung',icon:'↻',detail:'Schürzen, Manschetten, Ärmel und weitere Garnituren können nachbestellt werden. Vorher wird geprüft, ob Stoffpartie und Muster noch passend verfügbar sind.'},
   {title:'Änderung & Ausbesserung',icon:'✦',detail:'Vorhandene Stücke werden angesehen, bevor ein Reparaturpreis genannt wird. Ersatzfutter, neue Verschlüsse und geänderte Weite werden nach Zustand vereinbart.'},
   {title:'Festdienst & Hochzeitspersonal',icon:'❖',detail:'Für eine Hochzeit oder einen Empfang kann das bedienende Personal zusammengehörig eingekleidet werden. Brautpaar und persönliche Festgarderobe können bei der kooperierenden Eleganz gesondert besprochen werden.'}
  ],
  historyTitle:'Vom Bedarf zur vereinbarten Ausführung',historyText:p('<strong>1 · Bedarf und Budget.</strong> Die bestellende Person benennt Aufgaben, Zahl der Garnituren, gewünschte Bestandteile und Anlass. Gemeinsam wird festgelegt, wo robustes Tuch sinnvoller ist und wo eine feinere Ausführung den Dienst begleitet.',
   '<strong>2 · Stoff und Muster.</strong> Die Werkstatt zeigt passende Tuche und Leinen. Bei größeren Reihen werden eine Farbzusammenstellung und eine Musterform besprochen, ehe die ganze Stoffmenge zugeschnitten wird.',
   '<strong>3 · Maße und Anproben.</strong> Jede Person bekommt eine eigene Maßzuordnung. Aufwärtsreichen, Sitzen und die nötige Armbewegung können in der Anprobe geprüft werden. Die vereinbarten Änderungen werden für die weitere Arbeit festgehalten.',
   '<strong>4 · Übergabe und Pflege.</strong> Die fertigen Teile werden je Träger zusammengelegt. Pflegehinweise und vereinbarte Wechselstücke werden erklärt; offene Änderungen erhalten einen abgesprochenen Termin.'),
  worksTitle:'Was für das erste Gespräch hilft',works:['Eine Liste der einzukleidenden Personen mit ihren jeweiligen Aufgaben.','Vorhandene Hausfarben oder ein erlaubtes Wappenmuster, wenn sie verwendet werden sollen.','Ein gewünschter Termin mit genügend Zeit für Stoffauswahl und Anproben.','Die Entscheidung, ob je Person eine Garnitur oder auch Wechselstücke benötigt werden.','Vorhandene gut sitzende Kleidung als Anhaltspunkt; die eigene Anprobe bleibt nötig.'],
  connectionsTitle:'Die zuständigen Hände',connections:[connection('iorwerth-maerllys','Auftrag, Material und gemeinsame Ausführung'),connection('bronwen-swyll','Maße, Einzelanprobe und Schlussprüfung'),connection('geraint-maerllys','Zuschnitt von Livreen, Wämsern und Dienströcken'),connection('llio-falchdyn','Zusammengehörige Teile und Nähfolge')],
  contractsTitle:'Preis, Zeit und Ergänzungen',contracts:[
   {title:'Klarer Preisumfang',icon:'◈',text:'Die Kollektion nennt einen Preis je beschriebener Garnitur mit den aufgeführten Teilen und üblicher Anpassung. Ein größerer Auftrag wird mit seinen tatsächlichen Mengen und Sonderwünschen einzeln angeboten. Ein Mengenrabatt ist keine feste Zusage.'},
   {title:'Fertigung mit Vorlauf',icon:'◷',text:'Es gibt keine pauschale Sofortzusage für eine ganze Dienerschaft. Stoffvorrat, Zahl der Träger, notwendige Anproben und gewünschte Besätze bestimmen den vereinbarten Termin.'},
   {title:'Nachbestellung nach Prüfung',icon:'↻',text:'Aufbewahrte Muster und vereinbarte Schnittunterlagen helfen bei späteren Ergänzungen. Stoffwechsel, veränderte Maße und ein neuer Preis werden vor der Folgearbeit besprochen.'}],
  documentsTitle:'Zur Vorbereitung',documents,
  triviaTitle:'Eine gut geplante Ausstattung',trivia:['Bei gleichem Dienst können Wechselstücke wichtiger sein als zusätzliche Zier.','Ein langes Ärmelende sieht im Stand ordentlich aus und kann bei der Arbeit trotzdem im Weg sein.','Ein gemeinsamer Farbton darf auf einem Arbeitskleid anders eingesetzt werden als auf dem Dienstrock des Vogts.'],footer:'Aufgabe, Stoff und Mensch sollen zusammenpassen.'};
}
export function buildMaerllysModule() {
 const pages=[
  {pageTitle:'Naht & Siegel',...art('aussenansicht'),stats,
   description:p('Hinter dem hölzernen Schild mit Nadel und Siegel liegen keine verschwenderisch vollen Schaufenster. Ein ordentliches Dienstwams steht neben einem Zofenkleid mit heller Schürze; daneben liegen Tuche, deren Farbe auch nach einer größeren Bestellung noch zusammenpassen soll. <strong>Naht & Siegel</strong> ist die Maerllys-Schneiderei für Menschen, die ihre Dienerschaft zuverlässig und passend einkleiden möchten.',
    'Die Werkstatt fertigt vom einfachen Arbeitsgewand bis zur förmlichen Hauslivree. Ihr Schwerpunkt sind Bedienstetenkleider, Uniformen des Hauses und die Ausstattung von Kammer, Kontor, Tor und Empfang. Ein Vogt braucht einen anderen Schnitt als eine Zofe; beide können trotzdem als Angehörige desselben Haushalts erkennbar sein.',
    'Preislich liegt das Haus zwischen der schlichten Gwniwr-Kleidung und den aufwendigen Entwürfen der Göttlichen Eleganz. Die Zusammenarbeit mit der Eleganz lässt beiden Schneidereien ihre eigene Handschrift: persönliche Festgarderobe dort, abgestimmte Dienstkleidung und praktische Folgeaufträge hier.'),
   quote:'Gleiches Tuch allein macht noch keinen guten Dienstrock.',quoteBy:'Aus der Maerllys-Werkstatt',commentSequence:[]},
  {pageTitle:'Das Haus · Herkunft & Handwerk',guildPage:true,...art('werkstatt'),stats,guild:buildHistory()},
  {pageTitle:'Dienstleistungen · Ein Haushalt nach Maß',guildPage:true,...art('auftragsstube'),stats:[['Angebot','Hausausstattung · Anprobe · Ergänzung'],['Auftrag','Einzelgarnitur oder abgestimmte Reihe'],['Planung','Aufgabe, Maß, Stoff und Termin'],['Ansprechpersonen','Iorwerth und Bronwen']],guild:buildServices()},
  {pageTitle:'Die Menschen · Werkstatt & offene Stellen',hierarchyPage:true,...art('naehstube'),hierarchy:buildMaerllysHierarchy()},
  {pageTitle:'Angebot · Die Dienstkollektion',tradeCatalogPage:true,...art('kollektion'),tradeCatalog:buildMaerllysCatalog()},
  {pageTitle:'Der Verkaufsraum · Beratung & Anprobe',sessionPage:true,...art('verkaufsraum'),sessionIntro:'Das Licht aus dem Ladenfenster fällt auf gefaltetes Leinen und mehrere sauber getrennte Stoffpartien. An der Seite wartet ein Dienstrock auf seine Schlussanprobe; hinter dem Vorhang ist Platz, den Arm zu heben und den Sitz der Schulter wirklich zu prüfen. Eine Bank bietet Raum für den Besteller und die Menschen, die später in der Kleidung arbeiten werden.',sessionHint:'Hier können Bedarf, Muster und Anproben gemeinsam besprochen werden.',sessionEmptyTitle:'Ein Muster liegt bereit',sessionEmptyText:'Ein klarer Auftrag beginnt mit den Menschen, die das Gewand tragen sollen.',sessionDateAleria:{year:null,month:null,day:null}}
 ];
 return {id:MAERLLYS_MODULE_ID,title:'Naht & Siegel',subtitle:'Die Maerllys-Schneiderei · Dienstkleidung für den ganzen Haushalt',type:'Schneiderei & Dienstkleidung',category:'Gwynthor · Geschäfte',image:`${MAERLLYS_ART}/szenen/aussenansicht.png`,previewImage:`${MAERLLYS_ART}/szenen/aussenansicht.png`,symbol:`${MAERLLYS_ART}/schild.png`,icon:'✂',stamp:'CENYRISCH · DIENSTKLEIDUNG',schemaVersion:1,multipage:true,appendCommentsPage:true,enablePageComments:true,
  sessionCast:MAERLLYS_STAFF.map(({id})=>people(id).worldPersonId),pages:pages.map((page,index)=>({schemaVersion:1,commentThreadKey:`maerllys-page-${index+1}`,...page}))};
}
