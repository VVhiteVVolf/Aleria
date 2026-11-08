import {gwniwrShopPeople} from './gwniwr-personnel.mjs';
import {GWNIWR_ART} from './gwniwr-catalog.mjs';
const p=text=>`<p>${text}</p>`;
export const GWNIWR_VACANCIES=Object.freeze([
  ['auftragsgehilfe','Auftragsgehilfe · Listen & Abholungen','Hält Bestellungen, Abholungen und vereinbarte Änderungen im Auftragsbuch fest.'],
  ['lagergehilfe','Lagergehilfe · Tuch & Vorräte','Prüft mit einer erfahrenen Hand die angelieferten Ballen und hält das Tuch trocken und geordnet.'],
  ['lieferbursche','Hausbursche · Lieferungen','Bringt fertige Kleidung nach Vereinbarung zur Kundschaft und nimmt abgegebene Änderungsstücke an.'],
  ['verkauf-2','Weitere Verkaufskraft · Alltag','Erklärt die schlichten Hausmodelle, zeigt verfügbare Tuche und begleitet die erste Auswahl.'],
  ['hausdienst','Hausdienst · Laden & Probiertücher','Pflegt den Verkaufsraum, Vorhänge und Probiertücher und richtet die Anprobe her.'],
  ['gesellin-damen','Weitere Schneidergesellin · Damen','Näht zugeschnittene Ober- und Unterkleider und übernimmt Anpassungen nach der Anprobe.'],
  ['geselle-herren','Weiterer Schneidergeselle · Herren','Arbeitet an Wämsern, Tuniken und Hosen und prüft die beanspruchten Verbindungen.'],
  ['geselle-ausbesserung','Ausbesserungen · Nähte & Flicken','Begutachtet mit der Werkstatt getragene Kleidung und setzt die vereinbarten Ausbesserungen um.'],
  ['bortenarbeit','Bortenarbeit · Garn & Flechtmuster','Fertigt schmale gewebte Besätze und einfache Knotenornamente für die guten Modelle.'],
  ['lehrling-2','Weiterer Schneiderlehrling · Grundarbeiten','Lernt Werkzeugpflege, Heften und Säumen unter Anleitung.'],
  ['lehrling-3','Weitere Schneiderlehrstelle · Grundarbeiten','Ein weiterer Ausbildungsplatz für Heften, Säumen und den sorgfältigen Umgang mit Stoff und Werkzeug.']
]);
export function buildGwniwrHierarchy(){
  const people=new Map(gwniwrShopPeople().map(person=>[person.key,person]));
  const vacancies=new Map(GWNIWR_VACANCIES.map(([key,title,text])=>[key,{title,text}]));
  const node=key=>{
    const vacancy=vacancies.get(key);
    if(vacancy)return{id:`gwniwr-post-${key}`,title:vacancy.title,subtitle:'Unbesetzter Posten',portrait:'',text:p(vacancy.text)};
    const person=people.get(key);if(!person)throw new Error(`Gwniwr-Hierarchieperson fehlt: ${key}`);
    return{id:`gwniwr-person-${key}`,title:person.name,subtitle:`${person.role} · ${person.age} Jahre`,portrait:person.portrait,text:p(person.bio)};
  };
  const tree=(id,label,levels)=>({id,label,parentTreeId:id==='fuehrung'?'':'fuehrung',levels:levels.map(([label,...keys])=>({label,nodes:keys.map(node)}))});
  const trees=[
    tree('fuehrung','Familie & Aufträge',[
      ['Gemeinsame Leitung','emyr','gwenllian'],['Werkstattverantwortung','tudur'],['Aufträge & Vorräte','auftragsgehilfe','lagergehilfe'],['Warenwege','lieferbursche']
    ]),
    tree('verkauf','Laden & Anprobe',[
      ['Beratung & Termine','gwenllian'],['Verkauf und Mithilfe','nesta-ferchwyn','eleri','verkauf-2'],['Pflege des Hauses','hausdienst']
    ]),
    tree('handwerk','Werkstatt & Lehre',[
      ['Schnitt & letzte Prüfung','tudur'],['Erfahrene Hände','meirion-wym','iwan-trevor','briallen-wym'],['Zusätzliche Werkstattplätze','gesellin-damen','geselle-herren','geselle-ausbesserung','bortenarbeit'],['Schneiderlehre','osian','lehrling-2','lehrling-3']
    ])
  ];
  return{eyebrow:'Die Familie & ihr Handwerk',organizationTitle:'Nadel & Faden',centerLabel:'Nadel & Faden',motto:'Gute Kleidung ist kein Vorrecht des Adels.',subtitle:'Familienführung, Laden und Werkstatt',emblem:`${GWNIWR_ART}/schild.png`,sideImage:`${GWNIWR_ART}/personal.png`,description:p('Emyr und Gwenllian führen den Betrieb gemeinsam. Tudur arbeitet als Schneidermeister; Eleri hilft im Laden. Neben den vertrauten Händen sind Plätze für weitere Gesellen, Verkaufskräfte und Lehrlinge frei.'),chartTitle:'Vom Tuch bis zur passenden Kleidung',chartIntro:'Familienführung, Verkauf und Werkstatt arbeiten eng zusammen. Weitere Gesellen und Lehrlinge finden hier ihren Platz, wenn der Betrieb neue Hände aufnimmt.',layoutMode:'vertical',treeDisplayMode:'tabs',portraitScale:130,cardFontScale:95,details:[{icon:'✦',label:'Leitung',value:'Emyr & Gwenllian'},{icon:'✦',label:'Werkstatt',value:'Tudur · Schneidermeister'},{icon:'✦',label:'Standort',value:'Gwynthor'},{icon:'✦',label:'Lehre',value:'Männer und Frauen werden ausgebildet'}],trees,levels:structuredClone(trees[0].levels)};
}
