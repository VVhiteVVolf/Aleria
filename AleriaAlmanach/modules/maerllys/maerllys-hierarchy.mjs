import { HOUSE_MAERLLYS_FAMILY } from '../../../Stammbäume/assets/js/data/house-maerllys-family.js';
import { MAERLLYS_ART } from './maerllys-catalog.mjs';
const p=text=>`<p>${text}</p>`;
export const MAERLLYS_STAFF = Object.freeze([
  {id:'iorwerth-maerllys',role:'Leitung · Aufträge & Uniformschnitt',text:'Ordnet die Aufträge, stimmt das gemeinsame Hausbild mit der Kundschaft ab und verantwortet die Dienstschnitte.'},
  {id:'bronwen-swyll',role:'Anprobe · Passform & Qualitätskontrolle',text:'Prüft Sitz und Beweglichkeit. Sie achtet darauf, dass ein einheitliches Gewand auch zu verschiedenen Körpern und Aufgaben passt.'},
  {id:'geraint-maerllys',role:'Werkstattleitung · Herrenlivreen',text:'Teilt den Zuschnitt der Wämser, Dienst- und Amtsröcke ein und begleitet die Arbeit bis zur fertigen Garnitur.'},
  {id:'llio-falchdyn',role:'Nähstube · Zusammengehörige Garnituren',text:'Hält gleiche Stoffe, Borten und Verschlüsse innerhalb eines Auftrags zusammen und führt die Näharbeiten durch die einzelnen Arbeitsschritte.'}
]);
export const MAERLLYS_VACANCIES = Object.freeze([
  {id:'auftragsschreiber',role:'Auftragsschreiber · Maße & Mengen',text:'Führt bestätigte Maßlisten, ordnet Stoffmuster zu und hält Abholungen sowie offene Änderungen fest.'},
  {id:'lager',role:'Stofflager · Warenannahme',text:'Prüft eintreffende Tuche, trennt die Stoffpartien der einzelnen Aufträge und hält die trockenen Lagerfächer in Ordnung.'},
  {id:'lieferbursche',role:'Hausbursche · Wege & Lieferungen',text:'Überbringt vereinbarte Pakete, holt Rückmeldungen ein und trägt die fertigen Garnituren zwischen Werkstatt und Verkaufsraum.'},
  {id:'beratung',role:'Beratung · Dienstkleider & Hausbedarf',text:'Nimmt die Wünsche von Arbeitgebern und Hauspersonal auf und bereitet Stoffauswahl sowie Anprobetermine vor.'},
  {id:'aenderung',role:'Änderungsschneiderei · Sitz & Reparatur',text:'Passt Ärmel, Weite und Saum an; prüft, ob vorhandene Kleidung sinnvoll geändert oder repariert werden kann.'},
  {id:'livreegeselle',role:'Schneidergeselle · Dienstwämser & Livreen',text:'Fertigt zugeschnittene Wämser und Überröcke und achtet bei zusammengehörigen Aufträgen auf saubere Wiederholung.'},
  {id:'dienstkleider',role:'Schneiderin · Dienstkleider & Schürzen',text:'Näht Arbeits- und Zofenkleider, Wechselärmel und die abgestimmten Schürzen einer Hausausstattung.'},
  {id:'borten',role:'Borten & Abzeichen · Handstickerei',text:'Arbeitet vereinbarte Einfassungen und einfache Hauszeichen nach bestätigtem Muster; erhält keine freie Wappenzuordnung.'},
  {id:'lehrling-zuschnitt',role:'Schneiderlehrling · Heften & Muster',text:'Lernt Stoffrichtung, einfache Muster und das sorgfältige Vorbereiten zugeschnittener Teile unter Anleitung.'},
  {id:'lehrling-naht',role:'Schneiderlehrling · Säume & Handnähte',text:'Übt Säume, Knopflöcher und das gleichmäßige Heften, bevor anspruchsvollere Nähte dazukommen.'},
  {id:'hausdienst',role:'Hausdienst · Anproberaum & Wäsche',text:'Hält Probiertücher, Wechselmanschetten, Vorhänge und den Anproberaum sauber und gebrauchsfertig.'}
]);
const active=new Map(MAERLLYS_STAFF.map(x=>[x.id,x]));
const vacant=new Map(MAERLLYS_VACANCIES.map(x=>[x.id,x]));
function node(id) {
  const slot=vacant.get(id);
  if(slot)return {id:`maerllys-post-${id}`,title:slot.role,subtitle:'Unbesetzter Posten · später besetzbar',portrait:'',text:p(slot.text)};
  const staff=active.get(id);
  const person=HOUSE_MAERLLYS_FAMILY.persons.find(x=>x.id===id);
  if(!staff||!person)throw new Error(`Fehlende Maerllys-Personalquelle: ${id}`);
  return {id:`maerllys-person-${id}`,title:person.name,subtitle:staff.role,portrait:person.portrait?`../Stammbäume/${person.portrait}`:'',text:p(staff.text)};
}
const tree=(id,label,levels)=>({id,label,parentTreeId:id==='fuehrung'?'':'fuehrung',levels:levels.map(([label,...ids])=>({label,nodes:ids.map(node)}))});
export function buildMaerllysHierarchy() {
  const trees=[
    tree('fuehrung','Leitung & Aufträge',[
      ['Auftragsleitung','iorwerth-maerllys'],['Anprobe & Qualitätskontrolle','bronwen-swyll'],['Maße, Material & Wege','auftragsschreiber','lager','lieferbursche']]),
    tree('beratung','Beratung & Anpassung',[
      ['Passform & Übergabe','bronwen-swyll'],['Kundenwünsche & Änderungen','beratung','aenderung'],['Pflege der Anprobe','hausdienst']]),
    tree('werkstatt','Werkstatt & Lehre',[
      ['Zuschnitt & Arbeitsfolge','geraint-maerllys','llio-falchdyn'],['Dienstgarnituren & Besätze','livreegeselle','dienstkleider','borten'],['Ausbildungsplätze','lehrling-zuschnitt','lehrling-naht']])
  ];
  return {eyebrow:'Das Haus & sein Handwerk',organizationTitle:'Naht & Siegel',centerLabel:'Naht & Siegel',motto:'Ein gemeinsamer Auftritt. Ein passender Schnitt.',subtitle:'Die Maerllys-Werkstatt und ihre noch offenen Stellen',emblem:`${MAERLLYS_ART}/schild.png`,sideImage:`${MAERLLYS_ART}/szenen/naehstube.png`,
    description:p('Vier Angehörige tragen die heutige Kernarbeit. Neben ihnen stehen die noch offenen Stellen in Beratung, Nähstube, Lager und Lehre. Für diese Aufgaben werden später weitere Hände gesucht.'),
    chartTitle:'Vom abgestimmten Muster zur passenden Garnitur',chartIntro:'Auftrag, Anprobe und Fertigung bleiben im Gespräch. Ein Serienauftrag wird gemeinsam geplant und für jede Person einzeln angepasst.',layoutMode:'vertical',treeDisplayMode:'tabs',portraitScale:130,cardFontScale:95,
    details:[{icon:'✦',label:'Familie',value:'Haus Maerllys'},{icon:'✦',label:'Standort',value:'Gwynthor'},{icon:'✦',label:'Schwerpunkt',value:'Dienstkleidung & Hauslivreen'},{icon:'✦',label:'Kooperation',value:'Göttliche Eleganz'}],trees,levels:structuredClone(trees[0].levels)};
}
