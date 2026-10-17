import { eleganzPerson, ELEGANZ_ART } from './eleganz-family-people.mjs';
import { addRavesHouseholdStaff } from './eleganz-household-connections.mjs';
const slot = (id, role, text) => ({ id, role, text });
export const ELEGANZ_VACANCIES = Object.freeze([
  slot('schreiber-rechnungen','Schreibgehilfe · Rechnungen','Überträgt Quittungen, prüft Anzahlen und legt Orestian die offenen Rechnungen vor.'),
  slot('schreiber-fracht','Schreibgehilfe · Frachtbriefe','Führt Lieferlisten und Tiberians Korrespondenz; hält vereinbarte Mengen und Ankünfte fest.'),
  slot('bursche-lieferungen','Erster Hausbursche · Lieferungen','Bringt fertige Garnituren zur Kundschaft und nimmt versiegelte Pakete für die Werkstätten mit.'),
  slot('bursche-lager','Zweiter Hausbursche · Warenlager','Trägt Stoffballen, hält die trockenen Lagerplätze sauber und hilft bei der Warenannahme.'),
  slot('verkauf-alltag','Verkauf · Alltag & gute Tuche','Berät zu den preiswerteren Garnituren, erklärt Pflege und prüft die vorrätigen Größen.'),
  slot('verkauf-fest','Verkauf · Festkleidung','Stellt Farben und Besätze zusammen und begleitet die Auswahl der aufwendigeren Hausmodelle.'),
  slot('verkauf-mass','Verkauf · Maßaufträge','Nimmt erste Wünsche auf, führt die Kundschaft zur Anprobe und hält Änderungen für die Werkstatt fest.'),
  slot('hausmagd','Hausmagd · Verkaufsraum & Wäsche','Pflegt Vorhänge, Probiertücher und den Verkaufsraum; richtet die Anprobeecke zwischen den Terminen her.'),
  slot('meisterin-damen','Schneidermeisterin · Damenkleidung','Führt die Damenschneiderei, teilt zugeschnittene Arbeiten zu und prüft Passform und Nähte.'),
  slot('meister-herren','Schneidermeister · Herrenkleidung','Verantwortet Wämser, Schauben und Mantelgarnituren; prüft Schulter, Ärmel und den Fall des Tuches.'),
  slot('gesellin-damen-1','Erste Damenschneiderin · Obergewänder','Nähen und Füttern der aufwendigen Überkleider, mit besonderem Augenmerk auf Taille und Faltenfall.'),
  slot('gesellin-damen-2','Zweite Damenschneiderin · Ärmel & Futter','Fertigt Wechselärmel, Untergewänder und Futter; übernimmt die feineren Änderungen nach der Anprobe.'),
  slot('geselle-herren','Herrenschneidergeselle · Wämser & Mäntel','Fertigt die zugeschnittenen Wämser und Mäntel und richtet Knopfleisten und Verschlüsse ein.'),
  slot('stickerin','Stickerin · Borten & Besätze','Setzt Seiden- und Metallfäden, arbeitet die Hausornamente und näht gefasste Zierstücke auf ihre Unterlagen.'),
  slot('lehrling-2','Zweiter Schneiderlehrling · Grundarbeiten','Lernt Säumen, Heften und die sorgfältige Pflege der Nadeln und Scheren.')
]);
const vacancies = new Map(ELEGANZ_VACANCIES.map(p => [p.id,p]));
const paragraph = text => `<p>${text}</p>`;
function node(key) {
  const vacancy = vacancies.get(key);
  if (vacancy) return { id:`eleganz-post-${key}`,title: vacancy.role, subtitle: 'Unbesetzter Posten', portrait: '', text: paragraph(vacancy.text) };
  const p = eleganzPerson(key);
  if (!p.resident || p.death || p.age < 14) throw new Error(`Kein Dienstposten für ${p.name}`);
  return { id:`eleganz-person-${key}`,title:p.name,subtitle:`${p.role} · ${p.age} Jahre`,portrait:p.portrait,text:paragraph(p.bio) };
}
const tree = (id,label,levels) => ({id,label,parentTreeId:id==='fuehrung'?'':'fuehrung',levels:levels.map(([label,...keys])=>({label,nodes:keys.map(node)}))});
export function buildEleganzHierarchy() {
  const trees = [
    tree('fuehrung','Führung & Kontor',[
      ['Inhaberin','eleonora'],['Handel & Verwaltung','tiberian','orestian'],
      ['Schreibstube','schreiber-rechnungen','schreiber-fracht'],['Warenwege & Hausdienst','bursche-lieferungen','bursche-lager']
    ]),
    tree('verkauf','Verkauf & Empfang',[
      ['Empfang & Termine','maelwen'],['Beratung im Verkaufsraum','verkauf-alltag','verkauf-fest','verkauf-mass'],['Pflege des Hauses','hausmagd']
    ]),
    tree('handwerk','Schneiderei & Besätze',[
      ['Entwurf & letzte Anprobe','eleonora'],['Schnittkunde & Materialprüfung','rhiain','luciano'],
      ['Leitung der beiden Schneidereien','meisterin-damen','meister-herren'],
      ['Gesellen & Zierarbeit','gesellin-damen-1','gesellin-damen-2','geselle-herren','stickerin'],
      ['Schneiderlehre','aurelio','lehrling-2']
    ])
  ];
  return { eyebrow:'Das Haus & sein Handwerk',organizationTitle:'Göttliche Eleganz',centerLabel:'Göttliche Eleganz',motto:'Südliche Stoffe. Cenyrische Hände.',subtitle:'Das Haus Raves und sein Handwerk',emblem:`${ELEGANZ_ART}/schild.png`,sideImage:`${ELEGANZ_ART}/schild.png`,
    description:paragraph('Eleonora verantwortet den Entwurf, Tiberian die Warenwege und Orestian die Bücher. Maelwen hält den Empfang zusammen; in den Werkstätten geben erfahrene Hände ihr Wissen weiter.'),
    chartTitle:'Vom ersten Wunsch bis zum letzten Stich',chartIntro:'Beratung und Anprobe finden in der Innenstadt statt. Die eigenen Werkstätten arbeiten an getrennten Standorten in Gwynthor.',
    layoutMode:'vertical',treeDisplayMode:'tabs',portraitScale:130,cardFontScale:95,
    details:[{icon:'✦',label:'Inhaberin',value:'Eleonora Cassia Raves'},{icon:'✦',label:'Standort',value:'Gwynthor · Innenstadt'},{icon:'✦',label:'Werkstätten',value:'Eigene Schneidereien in Gwynthor'},{icon:'✦',label:'Handel',value:'Haus Veltrane · Markt der Fortuna'}],
    trees:addRavesHouseholdStaff(trees),levels:structuredClone(trees[0].levels) };
}
