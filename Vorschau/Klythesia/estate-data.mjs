/** Singular display names; supplied collective names remain explicit. */
const estate=(id,name,commonTitle,description,collective)=>Object.freeze({
  id,name,commonTitle,description,collective,present:true,
  image:`assets/estates/previews/${id}.webp`,fullsize:`assets/estates/production/${id}.png`
});
export const ESTATES=Object.freeze([
  Object.freeze({...estate('theios','Theíos','Kyreon · Gottkönig','Kyreon persönlich steht als Theíos über der Frauenordnung. Seine besondere Gestalt verbindet Elfenohren und ein prächtiges Geweih mit einer zweifarbigen Silber-Gold-Maske, einem mächtigen Speer und einem Satyrunterleib. Diese Erscheinung gehört allein zu Kyreon und beschreibt weder eine neue Dynastie noch die allgemeine Anatomie der Aechanath.',''),unique:true,person:'Kyreon'}),
  estate('anassa','Anássa','Herrscherfamilie · Anássai','Die matriarchale Herrscherfamilie lebt in der Hauptstadt und dient Kyreon. Ihre oberste Matriarchin ist die Gemahlin des Gottkönigs und zugleich seine Hohepriesterin.','Anássai'),
  estate('polemistria','Polemístria','Städtischer Frauenadel · Polemístriai','Ein adliger Frauenclan führt die jeweilige Stadt und ihren Herrschaftsraum. Die Matriarchin verbindet die örtliche Führung mit dem Dienst an Kyreon.','Polemístriai'),
  estate('hiereia','Hiéreia','Kleines Matronenhaus · Hiéreiai','Die niedrigste Stufe des klythesischen Adels entspricht ungefähr dem Ritterherrn. Diese Matronenhäuser dürfen kleinere Städte, Siedlungen oder Festungen halten und einen eigenen adligen Clan führen.','Hiéreiai'),
  estate('ergatide','Ergatíde','Freie Bürgerin · Ergatídes','Eine freie Bürgerin gestaltet ihr Leben und ihre Arbeit selbst. Sie darf handeln, kaufen, erwerben und wirtschaften; sie gehört weder zum Adel noch zu den versklavten Ständen.','Ergatídes'),
  estate('synoikos','Synoikos','Freier Mann · neue Standesbezeichnung','Söhne, Brüder und Ehemänner der freien Frauen leben als freie Männer innerhalb der jeweiligen Familienordnung. Sie unterstützen die Frauen in deren Aufgaben und Lebensbereichen.',''),
  estate('doulos','Doulos','Versklavter Mann · neue Standesbezeichnung','Versklavte Männer arbeiten auf Feldern, in Minen und an Häfen. Ausgewählte kräftige Männer können Ehemänner werden; daraus wird hier noch keine automatische Freilassung abgeleitet.',''),
  estate('doule','Doule','Versklavte Frau · neue Standesbezeichnung','Frauen geraten seltener in die Sklaverei. Sie kann ihnen als Strafe auferlegt werden; ein weiter ausgearbeitetes Straf- oder Freilassungsrecht ist noch nicht festgelegt.','')
]);
export const ESTATE_CONTEXT=Object.freeze({
  eyebrow:'Theíos und sieben gesellschaftliche Stände',title:'Frauenherrschaft unter dem Gottkönig.',
  introduction:'Acht Darstellungen zeigen Kyreon als einzigartigen Theíos und die sieben Stände unter ihm. Die Anzeigen verwenden die Einzahl; die vorgegebenen Sammelbezeichnungen bleiben daneben erhalten. Synoikos, Doulos und Doule sind die neu vorgeschlagenen Namen für die bislang unbenannten Stände.',
  addresses:[
    {title:'Freier Mann und versklavter Mann',text:'Geschlecht allein entscheidet nicht über Freiheit. Männer aus den freien Familien sind von den versklavten Arbeitern und Sklavenkriegern zu unterscheiden.'},
    {title:'Weltlicher Stand und Tempelamt',text:'Die Hiéreia ist hier ein kleiner weltlicher Matronenstand. Der vorhandene Tempelkatalog bleibt eine eigene religiöse Hierarchie; ein ähnlicher Name ersetzt keine dieser Rollen.'}
  ]
});
