import {createModule} from '../templates/catalog.mjs';
import {uid} from '../ui/html.mjs';
import {FORMAT, VERSION} from './schema.mjs';

export function createWorkspace() {
  const character=createModule('character',{x:40,y:34});
  character.title='Mara, die Kartografin'; character.subtitle='Sie zeichnet Orte, die es noch nicht gibt.'; character.tags='Protagonistin, Entdeckung'; character.status='developing';
  character.pages[0].blocks[1].value='Eine junge Kartografin entdeckt, dass ihre Karten die Welt verändern. Jeder neue Strich hat einen Preis.';
  character.pages[0].blocks[2].value='Unstillbar neugierig\nSieht Muster, wo andere Chaos sehen\nVertraut lieber Karten als Menschen';
  const story=createModule('story',{x:365,y:70});
  story.title='Die letzte Kartografin';story.subtitle='Was, wenn eine Karte kein Abbild ist, sondern ein Versprechen?';story.tags='Abenteuer, Magischer Realismus';
  story.pages[0].blocks[0].value='Eine verschwundene Stadt. Eine Karte ohne Grenzen. Und eine Frau, die lernen muss, sich zu verirren.';
  story.pages[0].blocks[2].value='Heimat & Aufbruch\nDie Macht von Erinnerungen\nMut zum Unbekannten';
  const mindmap=createModule('mindmap',{x:700,y:35});
  mindmap.title='Alles hängt zusammen';mindmap.subtitle='Erste Fäden zwischen Figur, Welt und Konflikt';
  const nodes=[['Die Karte',410,220,'lavender'],['Mara',120,100,'peach'],['Die verlorene Stadt',730,80,'sage'],['Ein Versprechen',720,400,'butter'],['Erinnerung',140,410,'rose']].map(([text,x,y,color])=>({id:uid(),text,x,y,color}));
  mindmap.mindmap={nodes,edges:nodes.slice(1).map((node,i)=>({id:uid(),from:nodes[0].id,to:node.id,label:['zeichnet','verbirgt','fordert','bewahrt'][i]}))};
  const note=createModule('note',{x:400,y:460});
  note.title='Ein Gedanke für später';note.color='butter';note.pages[0].blocks[0].value='„Vielleicht sind die Orte, die wir suchen, gar nicht die, die wir brauchen.“';note.subtitle='Dialogidee · Kapitel 1';note.collapsed=true;
  const place=createModule('place',{x:740,y:420});
  place.title='Die Stadt ohne Namen';place.subtitle='Ein Ort, der nur in Erinnerungen existiert.';place.pages[0].blocks[1].value='Salz in der Luft. Schiefe Dächer. Straßen, die im Nebel ihre Richtung ändern.';place.tags='Weltenbau';place.collapsed=true;
  return {format:FORMAT,version:VERSION,id:uid(),name:'Patricks Ideenwerk',updatedAt:new Date().toISOString(),boards:[{id:uid(),name:'Dein Ideenraum',example:true,modules:[character,story,mindmap,note,place]}]};
}
