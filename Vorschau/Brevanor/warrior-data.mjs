import {houses} from './house-data.mjs';
import {classDesigns,warriorDirections} from './warrior-art-direction.mjs';
export const warriors=Object.freeze(houses.map(h=>{
 const d=warriorDirections.find(d=>d.id===h.id),c=classDesigns[d.classId];
 return Object.freeze({id:h.id,name:h.name,classId:d.classId,className:c.name,classHref:`../../Klassenordner/Brevanor/${d.classId}/index.html`,palette:h.palette,equipment:`${c.equipment} Helm: ${d.helmet}.`,reason:d.reason,withHorse:!!c.withHorse,horseName:c.withHorse?'Cheval':null,bestiaryHref:c.withHorse?'../../Bestiarium/tiere/pferde/cheval/index.html':null,image:`assets/warriors/previews/${h.id}.webp`,fullsize:`assets/warriors/production/${h.id}.png`});
}));
