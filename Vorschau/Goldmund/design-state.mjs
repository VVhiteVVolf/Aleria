import {createPlacementState} from '../shared/placement-state.mjs?v=20261026-1';
import {houses,settlements,counties,regions,collectiveName,realmDesigns} from './realm-data.mjs?v=20261026-8';

const initialDesign = ()=>({collectiveName,countyNames:Object.fromEntries(counties.map(item=>[item.id,item.name])),regionNames:Object.fromEntries(regions.map(item=>[item.id,item.name])),realmCrest:realmDesigns[0].id});
const copy = value=>JSON.parse(JSON.stringify(value));
const isObject = value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const addedHouseIds=Object.freeze(['eitelborn','herzau','silberhorst','samtborn','weisshorn']);
const retiredHouseIds=Object.freeze(['adrard','rielle','vandergard','waalen','witten']);
const currentHouseIds=houses.map(house=>house.id);
const preAlbicHouseIds=houses.filter(house=>!house.clan).map(house=>house.id);
const priorHouseIds=[...preAlbicHouseIds,...retiredHouseIds];
const initialHouseIds=priorHouseIds.filter(id=>!addedHouseIds.includes(id));
const hasExactly=(value,ids)=>Object.keys(value).length===ids.length&&ids.every(id=>Object.hasOwn(value,id));

// Accept only complete historical rosters; retain surviving assignments and design.
function migratePriorDraft(snapshot) {
 const existing=snapshot?.placements;
 if(!isObject(existing)||![preAlbicHouseIds,priorHouseIds,initialHouseIds].some(ids=>hasExactly(existing,ids)))return snapshot;
 const validSeats=new Set(settlements.map(seat=>seat.id));
 if(Object.values(existing).some(seat=>seat!==null&&!validSeats.has(seat)))throw Error('Der ältere Entwurf enthält einen unbekannten Ort.');
 return {...snapshot,placements:Object.fromEntries(currentHouseIds.map(id=>[id,Object.hasOwn(existing,id)?existing[id]:null]))};
}

function validName(value) {
 if(typeof value!=='string'||value.trim().length<2||value.trim().length>80||/[\u0000-\u001f\u007f]/u.test(value))throw Error('Namen müssen 2 bis 80 Zeichen lang sein und dürfen keine Steuerzeichen enthalten.');
 return value.trim();
}
function namedItems(value,items) {
 if(!isObject(value)||Object.keys(value).length!==items.length||items.some(item=>!Object.hasOwn(value,item.id)))throw Error('Die Gebietsnamen in der Entwurfsdatei sind unvollständig oder unbekannt.');
 return Object.fromEntries(items.map(item=>[item.id,validName(value[item.id])]));
}
function validateDesign(value) {
 if(!isObject(value)||Object.keys(value).length!==4||!['collectiveName','countyNames','regionNames','realmCrest'].every(key=>Object.hasOwn(value,key)))throw Error('Die Entwurfsdatei enthält keinen vollständigen Goldmund-Gestaltungsstand.');
 if(!realmDesigns.some(design=>design.id===value.realmCrest))throw Error('Dieser Fürstentumswappenentwurf ist unbekannt.');
 return {collectiveName:validName(value.collectiveName),countyNames:namedItems(value.countyNames,counties),regionNames:namedItems(value.regionNames,regions),realmCrest:value.realmCrest};
}

/** Owns the local design and composes the shared placement engine into one undoable draft. */
export function createDesignState() {
 const placements=createPlacementState({realm:'goldmund',realmLabel:'Goldmund',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat])),lockedPlacements:{goldveld:'thronholt',roden:'thronholt'},trackHistory:false});
 let design=initialDesign();
 const history=[];
 const current=()=>({...JSON.parse(placements.serialize()),design:copy(design)});
 function remember(before){history.push(before);if(history.length>100)history.shift();}
 function replace(snapshot){const next=validateDesign(snapshot?.design);placements.restore(migratePriorDraft(snapshot));design=next;}
 function changeDesign(next){if(JSON.stringify(design)===JSON.stringify(next))return false;const before=current();design=next;remember(before);return true;}
 return {
  current,
  currentPlacements:()=>placements.current(),
  currentDesign:()=>copy(design),
  canMove:id=>placements.canMove(id),
  canUndo:()=>history.length>0,
  move(id,seat){const before=current();if(!placements.move(id,seat))return false;remember(before);return true;},
  rename(scope,id,value){const name=validName(value),next=copy(design);if(scope==='collective')next.collectiveName=name;else{const key=scope==='county'?'countyNames':scope==='region'?'regionNames':null;if(!key||!Object.hasOwn(next[key],id))throw Error('Dieses Gebiet ist unbekannt.');next[key][id]=name;}return changeDesign(next);},
  chooseCrest(id){if(!realmDesigns.some(item=>item.id===id))throw Error('Dieser Wappenentwurf ist unbekannt.');return changeDesign({...copy(design),realmCrest:id});},
  undo(){if(!history.length)return false;replace(history.pop());return true;},
  reset(){const before=current();placements.reset();design=initialDesign();if(JSON.stringify(before)===JSON.stringify(current()))return false;remember(before);return true;},
  serialize:()=>JSON.stringify(current(),null,2),
  restore(snapshot){const before=current();replace(snapshot);if(JSON.stringify(before)===JSON.stringify(current()))return false;remember(before);return true;}
 };
}
