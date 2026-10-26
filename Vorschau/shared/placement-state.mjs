// Browser-local draft ownership; canonical realm data is never changed here.
export function createPlacementState({realm,realmLabel=realm,houseIds,seatIds,initialPlacements,lockedPlacements={},trackHistory=true}) {
 const houses=new Set(houseIds),seats=new Set(seatIds);
 if(!realm||!houses.size||houses.size!==houseIds.length||seats.size!==seatIds.length)
  throw Error('Ungültige Entwurfskonfiguration.');

 function validate(id,seat) {
  if(!houses.has(id)||!(seat===null||seats.has(seat)))
   throw Error('Unbekanntes Haus oder unbekannter Ort.');
 }
 function validatePlacements(value) {
  if(!value||typeof value!=='object'||Array.isArray(value))
   throw Error('Die Hausliste des Entwurfs ist ungültig.');
  const entries=Object.entries(value);
  if(entries.length!==houses.size)
   throw Error('Die Hausliste des Entwurfs ist unvollständig.');
  for(const [id,seat] of entries)validate(id,seat);
 }

 validatePlacements(initialPlacements);
 const locked={...lockedPlacements};
 for(const [id,seat] of Object.entries(locked))validate(id,seat);
 const initial={...initialPlacements,...locked};
 let placements={...initial};
 const history=[];
 // A composed design state can own undo for placements and other fields together.
 const remember=()=>{if(trackHistory)history.push({...placements});};
 const canMove=id=>houses.has(id)&&!Object.hasOwn(locked,id);

 return {
  current:()=>({...placements}),
  canMove,
  canUndo:()=>history.length>0,
  move(id,seat) {
   validate(id,seat);
   if(!canMove(id)||placements[id]===seat)return false;
   remember();
   placements={...placements,[id]:seat};
   return true;
  },
  undo() {
   if(!history.length)return false;
   placements=history.pop();
   return true;
  },
  reset() {
   if([...houses].every(id=>placements[id]===initial[id]))return false;
   remember();
   placements={...initial};
   return true;
  },
  serialize() {
   return JSON.stringify({schemaVersion:1,realm,placements},null,2);
  },
  restore(value) {
   if(value?.schemaVersion!==1||value.realm!==realm)
    throw Error(`Diese Datei ist kein ${realmLabel}-Entwurf.`);
   validatePlacements(value.placements);
   for(const [id,seat] of Object.entries(locked)){
    if(value.placements[id]!==seat)
     throw Error('Eine festgelegte Hauszuordnung darf nicht verändert werden.');
   }
   remember();
   placements={...value.placements};
  }
 };
}
