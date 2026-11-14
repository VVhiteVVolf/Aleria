import { RAT_PEOPLE, RAT_SIGN, UNDERWORLD_ART } from './underworld-people.mjs';
const node = person => ({ id:`reine-ratte-${person.id}`, title:person.name, subtitle:`${person.role} · ${person.age} Jahre`, portrait:person.portrait,
  text:`${person.origin}. ${person.bio}` });
const tree = (id,label,people,description,parentTreeId='fuehrung') => ({ id,label,parentTreeId,levels:[{label:description,nodes:people.map(node)}] });
export function buildRatHierarchy() {
  return { organizationTitle:'Dreizehn Leute unter einem schiefen Schild', eyebrow:'Die Reine Ratte', subtitle:'Inhaber · sechs Zuberdirnen · zwei Mägde · ein Laufbursche · drei Aufpasser',
    centerLabel:'Cadwren Brithogs Zuberhaus', emblem:RAT_SIGN,sideImage:`${UNDERWORLD_ART}/scenes/aussenansicht-v1.png`,motto:'Salz runter. Laune rauf.',
    description:'<p>Der Betrieb ist klein und billig, doch seine Aufgaben sind verteilt. Cadwren führt das Haus und die Kasse. Der Badedienst betreut Gäste und Stuben, die Mägde halten Wasser, Wärme und Wäsche bereit, und drei grobe Männer sorgen für Ruhe.</p>',
    detailsTitle:'Hausstand und Dienst',details:[{label:'Leitung',value:'1 Inhaber'},{label:'Bad und Begleitung',value:'6 Frauen · 23–30 Jahre'},{label:'Hauswirtschaft',value:'2 Mägde und 1 Laufbursche'},{label:'Aufsicht',value:'3 Aufpasser aus drei Herkunftsländern'},{label:'Gesamt',value:'13 Erwachsene'}],
    chartTitle:'Kasse, Zuber und Tür',chartIntro:'Wassertragen, Heizen, Reinigung und Wäsche liegen bei den beiden Mägden mit Hilfe des Laufburschen; die sechs Zuberdirnen übernehmen den eigentlichen Gästedienst. Die Aufpasser teilen sich Eingang, Stuben, Hinterhof und den späten Dienst am Keller.',
    treeDisplayMode:'tabs',portraitScale:80,cardFontScale:90,
    trees:[tree('fuehrung','Inhaber',RAT_PEOPLE.slice(0,1),'Kasse, Preise, Vorräte und Absprachen',''),
      tree('badedienst','Bad und Begleitung',RAT_PEOPLE.slice(1,7),'Sechs Zuberdirnen · Waschplätze, drei Stuben und persönliche Vereinbarungen'),
      tree('hauswirtschaft','Hauswirtschaft',RAT_PEOPLE.slice(7,10),'Zwei Mägde und ein Laufbursche · Leinen, Feuer, Wasser und Botengänge'),
      tree('aufpasser','Aufpasser',RAT_PEOPLE.slice(10,13),'Drei Haudegen · Eingang, Hinterhof und Keller')],levels:[],
    footerNote:'Dreizehn Leute halten den Betrieb am Laufen. Über die bewachte Kellertür spricht niemand am offenen Waschplatz.' };
}
