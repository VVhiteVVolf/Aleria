export function createProposalState(sources) {
 const originals=Array.isArray(sources)?sources:[sources];
 if(!originals.length||new Set(originals.map(source=>source.id)).size!==originals.length)throw Error('Ungültige Varianten');
 const proposals=new Map(originals.map(source=>[source.id,structuredClone(source)]));
 let activeId=originals[0].id;
 let editing=false;
 return {
  current:()=>proposals.get(activeId),
  select(id){
   if(!proposals.has(id))throw Error('Unbekannte Variante');
   activeId=id;
  },
  isEditing:()=>editing,
  toggleEditing(){editing=!editing;return editing;},
  update(clanId,{seat,note}){
   const proposal=proposals.get(activeId);
   const clan=proposal.clans.find(value=>value.id===clanId);
   if(!clan||!proposal.settlements.some(value=>value.id===seat))throw Error('Unbekannter Clan oder Sitz');
   if(typeof note!=='string'||note.length>1200)throw Error('Ungültige Entwurfsnotiz');
   clan.seat=seat;
   proposal.notes[clanId]=note.trim();
  },
  reset(){proposals.set(activeId,structuredClone(originals.find(source=>source.id===activeId)));}
 };
}
