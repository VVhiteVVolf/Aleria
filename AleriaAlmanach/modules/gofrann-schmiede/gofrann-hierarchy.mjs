import { GOFRANN_ART, GOFRANN_TITLE, gofrannPerson } from './gofrann-people.mjs';
export const GOFRANN_VACANCIES = Object.freeze([
  ['harnischgeselle-2','Zweiter Harnischgeselle','Formt Platten und setzt Gelenke nach Gethins Vorgaben; arbeitet neben Idnerth.'],
  ['klingengeselle-2','Zweiter Klingengeselle','Übernimmt einfache Klingen und Beschläge unter Bleddyns Aufsicht.'],
  ['nieter-riemer','Nieter und Riemer','Setzt Nieten, Schnallen und Lederverbindungen; prüft, dass der fertige Harnisch beweglich bleibt.'],
  ['schleifer','Schleifer und Polierer','Pflegt Schneiden und Oberflächen und richtet fertige Stücke für die Schlussprüfung her.'],
  ['schmiedelehrling-2','Zweiter Schmiedelehrling','Vorgesehener einzelner Lehrplatz für Werkzeugpflege, einfache Formen und die Arbeit am Amboss.'],
  ['schmiedelehrling-3','Dritter Schmiedelehrling','Vorgesehener einzelner Lehrplatz für Nietarbeit und einfache Beschläge; ein Meister begleitet die Ausbildung.'],
  ['verkaufsgehilfe','Verkaufsgehilfe','Berät zum gewöhnlichen Vorrat und holt für besondere Wünsche Mareda oder einen Meister hinzu.'],
  ['ausgabe-verpackung','Ausgabe und Verpackung','Prüft Abholzettel, verpackt fertige Stücke und versieht größere Lieferungen mit dem richtigen Empfängervermerk.'],
  ['hausmagd','Hausmagd','Hält Verkaufsstube, Anprobetücher und Kontor sauber und sorgt für die Wäsche der Arbeitsschürzen.'],
  ['schreiber','Schreibgehilfe','Überträgt Rechnungen, führt die Lieferlisten und unterstützt Teleri bei den laufenden Büchern.'],
  ['lagerwart','Lagerwart','Hält Stahl, Kohle, Leder und Kleinteile getrennt und meldet sinkende Vorräte an Aneira.'],
  ['fuhrknecht','Fuhrknecht','Begleitet schwere Lieferungen zwischen Tlawd-Lager, Stadttor und Werkstatt und hilft bei der sicheren Entladung.']
].map(([id,role,text]) => ({ id,role,text })));
const vacancies = new Map(GOFRANN_VACANCIES.map(v => [v.id,v]));
function node(key) {
  const vacancy = vacancies.get(key);
  if (vacancy) return { id: `gofrann-post-${key}`, title: vacancy.role, subtitle: 'Freier, einzeln vorgesehener Posten', portrait: '', text: `<p>${vacancy.text}</p>` };
  const p = gofrannPerson(key);
  if (!p.staff || !p.active || p.age < 12) throw new Error(`Kein Dienstposten für ${p.name}`);
  return { id: `gofrann-person-${key}`, title: p.name, subtitle: `${p.role} · ${p.age} Jahre`, portrait: p.portrait, text: `<p>${p.bio}</p>` };
}
const tree = (id,label,levels) => ({ id,label,parentTreeId:id === 'handwerk' ? '' : 'handwerk',
  levels: levels.map(([label,...keys]) => ({ label,nodes:keys.map(node) })) });
export function buildGofrannHierarchy() {
  const trees = [
    tree('handwerk','Handwerk',[
      ['Inhaber und Meister','gethin','bleddyn'],
      ['Harnisch- und Klingengesellen','idnerth','madoc','harnischgeselle-2','klingengeselle-2'],
      ['Junggeselle und Vollendung','cynlas','nieter-riemer','schleifer'],
      ['Drei einzelne Schmiedelehrplätze','tegwyn','schmiedelehrling-2','schmiedelehrling-3']
    ]),
    tree('verkauf','Verkauf',[
      ['Verkaufsmeisterin','mareda'],['Empfang und Beratung','renfri','ceryth','verkaufsgehilfe'],
      ['Ausgabe und Hausdienst','ausgabe-verpackung','hausmagd']
    ]),
    tree('organisation','Organisation & Logistik',[
      ['Werkstattmeier und Hauskasse','einion','teleri'],['Warenannahme und Vorräte','aneira','lagerwart'],
      ['Kontor und Ausbildung','schreiber','eluned','emrys'],['Schwere Lieferungen','fuhrknecht']
    ])
  ];
  return { eyebrow:'Haus Gofrann · Waffen und Harnische',organizationTitle:GOFRANN_TITLE,centerLabel:GOFRANN_TITLE,
    motto:'Stahl und Wort.',subtitle:'Die Hände hinter dem dritten Funken',emblem:`${GOFRANN_ART}/schild.png`,
    sideImage:`${GOFRANN_ART}/scenes/handwerk.png`,description:'<p>Gethin führt die Werkstatt, Bleddyn verantwortet die Waffen. Mareda hält den Verkauf zusammen; Einion und Teleri sorgen dafür, dass Material, Termine und Löhne stimmen.</p>',
    chartTitle:'Von der Erzlieferung bis zur Abholung',chartIntro:'Meister und Gesellen stehen an den Werkbänken, während Verkauf und Kontor den nächsten Auftrag vorbereiten. Die jüngeren Hände lernen an ihrer Seite. Freie Stellen warten auf Verstärkung.',
    layoutMode:'vertical',treeDisplayMode:'tabs',portraitScale:115,cardFontScale:95,
    details:[{icon:'✦',label:'Leitung',value:'Gethin und Bleddyn Gofrann'},{icon:'✦',label:'Ort',value:'Gwynthor · Innenstadt'},
      {icon:'✦',label:'Schmiedelehre',value:'Ein besetzter und zwei vorgesehene Lehrplätze'},{icon:'✦',label:'Lehnsherr',value:'Haus Tlawd · unter Haus Gafyr'}],
    trees,levels:structuredClone(trees[0].levels) };
}
