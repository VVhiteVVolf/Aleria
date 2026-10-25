import {houses,settlements} from './realm-data.mjs';

export function createPlacementState() {
 const initial=Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]));
 const houseIds=new Set(houses.map(h=>h.id)),seatIds=new Set(settlements.map(s=>s.id));
 let placements={...initial};
 const history=[];
 function validate(id,seat){if(!houseIds.has(id)||!(seat===null||seatIds.has(seat)))throw Error('Unbekanntes Haus oder unbekannter Ort.');}
 return {
  current:()=>({...placements}),
  canUndo:()=>history.length>0,
  move(id,seat){validate(id,seat);if(placements[id]===seat)return false;history.push({...placements});placements={...placements,[id]:seat};return true;},
  undo(){if(!history.length)return false;placements=history.pop();return true;},
  reset(){if(houses.every(h=>placements[h.id]===initial[h.id]))return false;history.push({...placements});placements={...initial};return true;},
  serialize(){return JSON.stringify({schemaVersion:1,realm:'weisenfluh',placements},null,2);},
  restore(value){
   if(value?.schemaVersion!==1||value.realm!=='weisenfluh'||!value.placements||typeof value.placements!=='object')throw Error('Diese Datei ist kein Weisenfluh-Entwurf.');
   const entries=Object.entries(value.placements);
   if(entries.length!==houses.length)throw Error('Die Hausliste des Entwurfs ist unvollständig.');
   for(const [id,seat]of entries)validate(id,seat);
   history.push({...placements});placements={...value.placements};
  }
 };
}
