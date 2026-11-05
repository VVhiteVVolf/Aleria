const prototype=(id,name,description,equipment,helmet,extra={})=>Object.freeze({
  id,name,role:name,description,equipment,helmet,...extra,
  image:`assets/warriors/previews/${id}.webp`,fullsize:`assets/warriors/production/${id}.png`
});
export const CLASS_PROTOTYPES=Object.freeze([
  prototype('helot','Helot','Ein männlicher Sklavenkrieger mit sehr knapper Kleidung und geringer Rüstung. Er wird für Wachdienst, gefährliche Fronteinsätze und Arenakämpfe verwendet.','Einfache Nahkampfwaffe; sehr geringe Schutzausrüstung','Unbedeckter Kopf',{gender:'male'}),
  prototype('antrophe','Antrophe','Nur die absolute Elite darf den Bund mit Kyreon eingehen und zur Hautwechslerin werden. Der Werlöwin-Prototyp zeigt eine mögliche Tiergestalt; Werwolf und Werbär sind weitere genannte Formen.','Tiergestalt und für die Verwandlung angepasste Ausrüstung','Tiergestalt',{gender:'female',elite:true}),
  prototype('thorax','Thorax','Die schwere Speerkämpferin bildet das Gegenstück zur Hoplitin. Großer Hoplon, Brustpanzer und Helm schützen sie, während Arme und Beine beweglich bleiben.','Speer, großer Hoplon','Athenischer Helm',{gender:'female'}),
  prototype('toxare','Toxare','Eine bewegliche berittene Bogenschützin. Der Rückenköcher hält ihre Pfeile bereit; Harpune oder Peitsche kommen als gelegentliche Varianten vor.','Kurzbogen, Rückenköcher; gelegentlich Harpune oder Peitsche','Korinthischer Helm',{gender:'female',mounted:true}),
  prototype('myrmex','Myrmex','Die bedrohliche Netz- und Dreizackkämpferin trägt einen auffällig verzierten Gladiatorenhelm. Sie verbindet Reichweite und das Binden der Gegner mit beweglicher Rüstung.','Dreizack, Wurfnetz','Dekorierter Gladiatorenhelm',{gender:'female'}),
  prototype('xiphone','Xiphone','Eine wilde, agile Berserkerin mit roten griechischen Tätowierungen. Knapper Chiton, leichte Arm- und Beinschienen lassen viel Bewegungsfreiheit. Ihre Rhomphaia führt sie als Zweihandschwert mit kurzem Griff.','Zweihändig geführte Rhomphaia mit kurzem Schwertgriff','Thrakischer Helm',{gender:'female'}),
  prototype('thyrsia','Thyrsia','Die Kampfbardin verbindet Gesang und Harfenspiel mit der Schwertkunst. Ihre Kopis bleibt eine vollwertige Nahkampfwaffe.','Harfe, Kopis','Makedonischer Helm',{gender:'female'})
]);
export {HOUSE_WARRIORS} from './house-warrior-data.mjs';
