import {houses} from './house-data.mjs';
import {classDesigns,warriorDirections} from './warrior-art-direction.mjs';
export const warriors=Object.freeze(houses.map(h=>{
 const d=warriorDirections.find(d=>d.id===h.id),c=classDesigns[d.classId];
 return Object.freeze({id:h.id,name:h.name,historical:h.extinct,representationLabel:h.extinct?'Historische Kriegerdarstellung · Entwurf':undefined,roleLabel:h.extinct?'Historischer Klassenvorschlag':undefined,classId:d.classId,className:c.name,classHref:`../../Klassenordner/Klassenseite.html#klasse-aeldrunmar-${d.classId}`,palette:h.palette,equipment:c.equipment,reason:h.extinct?`Historischer Darstellungsentwurf für das ausgestorbene Haus. ${d.reason}`:d.reason,withHorse:c.withHorse,horseName:c.withHorse?'Brycing':null,bestiaryHref:c.withHorse?'../../Bestiarium/tiere/pferde/brycing/index.html':null,image:`assets/warriors/previews/${h.id}.webp`,fullsize:`assets/warriors/production/${h.id}.png`});
}));
