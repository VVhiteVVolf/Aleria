import {uid} from '../ui/html.mjs';

const page = (title, blocks) => ({id:uid(), title, blocks:blocks.map(([kind,label,value='']) => ({id:uid(),kind,label,value}))});
export const TEMPLATES = Object.freeze([
  {id:'character',name:'Charakterdesign',short:'Charakter',icon:'character',color:'peach',description:'Ein Gesicht, viele Facetten. Finde heraus, wer deine Figur wirklich ist.',hint:'Portrait · Eigenschaften · Entwicklung',pages:()=>[
    page('Die Figur', [['image','Portrait'],['text','Wer ist diese Figur?'],['bullets','Eigenschaften'],['text','Stimme & Auftreten']]),
    page('Unter der Oberfläche', [['text','Größter Wunsch'],['text','Ängste & Widersprüche'],['bullets','Stärken & Schwächen'],['text','Ein Geheimnis']]),
    page('Entwicklung', [['text','Wo beginnt die Reise?'],['text','Was verändert die Figur?'],['text','Wo könnte sie ankommen?'],['bullets','Offene Fragen']])]},
  {id:'story',name:'Storydesign',short:'Story',icon:'story',color:'sage',description:'Von der ersten Was-wäre-wenn-Frage bis zum letzten Kapitel.',hint:'Prämisse · Konflikt · Handlungsbogen',pages:()=>[
    page('Der Funke', [['text','Die Idee in einem Satz'],['text','Was wäre, wenn …'],['bullets','Themen & Motive'],['text','Die Atmosphäre']]),
    page('Der Konflikt', [['text','Was steht auf dem Spiel?'],['text','Wer will was – und warum?'],['bullets','Hindernisse'],['text','Der Wendepunkt']]),
    page('Der rote Faden', [['text','Anfang'],['text','Mitte'],['text','Ende'],['bullets','Szenen, die unbedingt vorkommen sollen']])]},
  {id:'mindmap',name:'Mindmap',short:'Mindmap',icon:'mindmap',color:'lavender',description:'Gedanken verzweigen, Verbindungen ziehen und neue Zusammenhänge finden.',hint:'Freie Knoten · Linien · Beziehungen',pages:()=>[page('Gedankennetz', []),page('Weiterdenken', [['bullets','Neue Ansätze'],['text','Was verbindet diese Ideen?']])]},
  {id:'place',name:'Welten & Orte',short:'Ort',icon:'place',color:'sand',description:'Orte mit Atmosphäre. Welten, in denen Geschichten zu Hause sind.',hint:'Atmosphäre · Details · Geschichte',pages:()=>[
    page('Ein Ort entsteht', [['image','Ansicht oder Inspiration'],['text','Der erste Eindruck'],['bullets','Sehen, hören, riechen'],['text','Was macht diesen Ort besonders?']]),
    page('Hinter den Kulissen', [['text','Geschichte & Geheimnisse'],['bullets','Menschen & Begegnungen'],['text','Regeln dieser Welt']])]},
  {id:'moodboard',name:'Moodboard',short:'Moodboard',icon:'moodboard',color:'rose',description:'Bilder, Farben und Stimmung. Ein Gefühl, das du festhalten möchtest.',hint:'Bildsammlung · Farbstimmung · Notizen',pages:()=>[
    page('Inspiration', [['image','Stimmung'],['image','Farben & Formen'],['image','Details'],['text','Das Gefühl dahinter'],['bullets','Stichworte']])]},
  {id:'note',name:'Freie Idee',short:'Notiz',icon:'note',color:'butter',description:'Ein Satz, ein Dialog, ein ziemlich verrückter Einfall. Alles darf hier rein.',hint:'Freier Text · Listen · Zusätzliche Seiten',pages:()=>[page('Gedanken', [['text','Platz für deinen Gedanken'],['bullets','Zum Weiterdenken']])]}
]);
export const COLORS = ['peach','sage','lavender','sand','rose','butter'];
export const templateFor = type => TEMPLATES.find(template => template.id === type) || TEMPLATES.at(-1);
export function createModule(type, position = {x:48,y:48}) {
  const template = templateFor(type);
  return {id:uid(),type:template.id,title:`Neue ${template.short === 'Charakter' ? 'Figur' : template.short === 'Ort' ? 'Welt' : template.short === 'Moodboard' ? 'Inspiration' : template.short === 'Mindmap' ? 'Mindmap' : template.short === 'Story' ? 'Geschichte' : 'Idee'}`,subtitle:'',color:template.color,status:'sketch',tags:'',collapsed:false,...position,pages:template.pages(),mindmap:{nodes:template.id === 'mindmap' ? [{id:uid(),text:'Meine Idee',x:420,y:230,color:'lavender'}] : [],edges:[]}};
}
