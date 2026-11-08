import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { buildAuthoredCharacterImport } from '../../../CharakterDatenbank/lib/authored-character-import.mjs';
import { buildCharacterDatabase } from '../../../CharakterDatenbank/lib/character-database-model.mjs';
import { confirmCharacterRecordProjection, hasNewerCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { buildTailoringCharacterExports, tailoringDatabaseCandidates, TAILORING_CHARACTER_FEATURE } from './characters.mjs';
import { REVIEWED_EXISTING_CHARACTERS } from './reviewed-existing-characters.mjs';

function mergeFamilyProjections(existing=[],reviewed=[]){
 const key=link=>`${link.familyId}:${link.personId}`;
 const merged=new Map(existing.map(link=>[key(link),structuredClone(link)]));
 for(const link of reviewed)merged.set(key(link),{...merged.get(key(link)),...structuredClone(link)});
 return [...merged.values()];
}

/** Apply only reviewed family metadata on the caller's own database basis. */
export function projectTailoringCharacterDatabase(basis, families){
 const prior=[...REVIEWED_EXISTING_CHARACTERS,...basis.snapshot.characters.filter(c=>!REVIEWED_EXISTING_CHARACTERS.some(p=>p.id===c.id))];
 const exports=buildTailoringCharacterExports(families,prior),candidates=tailoringDatabaseCandidates(families);
 const ids=new Set(exports.map(e=>e.character.id));
 for(const entry of exports){
  const world=entry.character.identity?.worldPersonId;
  const matches=basis.snapshot.characters.filter(c=>[c.identity?.worldPersonId,c.genealogy?.worldPersonId].includes(world));
  assert.ok(matches.every(c=>c.id===entry.character.id),`Abweichende bestehende Weltidentität ${entry.character.name}`);
 }
 const existingIds=new Set(basis.snapshot.characters.map(c=>c.id));
 const newExports=exports.filter(e=>!existingIds.has(e.character.id));
 const seededNewExports=newExports.map(entry=>{
  const reviewed=REVIEWED_EXISTING_CHARACTERS.find(c=>c.id===entry.character.id);
  return reviewed?{...entry,character:{...structuredClone(reviewed),...entry.character}}:entry;
 });
 const initial=buildAuthoredCharacterImport(basis,seededNewExports,TAILORING_CHARACTER_FEATURE,candidates);
 initial.records=initial.records.map(item=>{
  if(!REVIEWED_EXISTING_CHARACTERS.some(c=>c.id===item.record.character.id))return item;
  const entry=exports.find(e=>e.character.id===item.record.character.id);
  const confirmed=confirmCharacterRecordProjection({record:item.record,snapshotCharacter:item.snapshotCharacter,path:item.path,
   character:item.record.character,person:item.snapshotCharacter,exportedCharacter:entry.character,sourcePath:entry.sourcePath,now:entry.exportedAt}).projection;
  const row=initial.registry.records.find(r=>r.recordId===item.record.recordId);
  if(row){row.contentHash=confirmed.record.sync.contentHash;row.firestoreDocumentIds=confirmed.record.sync.sourceDocumentIds;}
  const index=initial.snapshot.characters.findIndex(c=>c.id===item.record.character.id);
  initial.snapshot.characters[index]=confirmed.snapshotCharacter;
  return confirmed;
 });
 const updates=exports.filter(e=>existingIds.has(e.character.id)).map(entry=>{
  const existing=basis.existingRecords.find(r=>r.character.id===entry.character.id);
  const previous=basis.snapshot.characters.find(c=>c.id===entry.character.id);
  const row=basis.registry.records.find(r=>r.firestoreDocumentId===entry.character.id);
  assert.ok(existing&&previous&&row,'Bestehende Akte unvollständig '+entry.character.id);
  if(hasNewerCharacterRecordProjection({...basis,record:existing,sourcePath:entry.sourcePath,exportedAt:entry.exportedAt}))return{record:existing,path:row.path,snapshotCharacter:previous};
  const next=structuredClone(existing),person=structuredClone(previous),character=structuredClone(existing.character);
  const own=existing.local?.authoredFeature===TAILORING_CHARACTER_FEATURE;
  const fields=own?Object.keys(entry.character).filter(k=>!['id','name'].includes(k))
   : ['identity','genealogy','updatedAt',...(['qN5et9e7KaWlIPTSrsXt','XVeiNvgFfsmtomLuIjcA'].includes(entry.character.id)?['bio','biography']:[])];
  for(const field of fields){
   const value=field==='identity'?{...character.identity,...entry.character.identity}
    :field==='updatedAt'?[character.updatedAt,entry.character.updatedAt].filter(Boolean).sort().at(-1):entry.character[field];
   if(value!==undefined){character[field]=structuredClone(value);person[field]=structuredClone(value);}
  }
  const [linked]=buildCharacterDatabase({characters:[character],charTabs:basis.snapshot.charTabs,exportedAt:entry.exportedAt},candidates,{sourcePath:entry.sourcePath}).records;
  next.identity.worldPersonId=character.identity.worldPersonId;
  next.classification.families=mergeFamilyProjections(existing.classification.families,linked.record.classification.families);
  next.classification.familyAlternatives=mergeFamilyProjections(existing.classification.familyAlternatives,linked.record.classification.familyAlternatives);
  next.classification.familyStatus=linked.record.classification.familyStatus==='linked'||!next.classification.families.length
   ?linked.record.classification.familyStatus:existing.classification.familyStatus;
  person.localRecord.classification.families=mergeFamilyProjections(previous.localRecord.classification.families,linked.snapshotCharacter.localRecord.classification.families);
  person.localRecord.classification.familyStatus=next.classification.familyStatus;
  next.links.familyTree=mergeFamilyProjections(existing.links.familyTree,linked.record.links.familyTree);
  // A historical receipt may serialize these same fields in an older order.
  // Reuse that exact receipt when its values match; do not append a new source
  // or duplicate document ID solely because object keys were reordered.
  const authoredExport=Object.fromEntries(Object.keys(entry.character).filter(k=>['id','name',...fields].includes(k)).map(k=>[k,entry.character[k]]));
  const existingReceipt=existing.sources.firestoreExports.find(source=>isDeepStrictEqual(source,authoredExport));
  return confirmCharacterRecordProjection({record:next,snapshotCharacter:previous,path:row.path,character,person,
   exportedCharacter:existingReceipt||authoredExport,sourcePath:entry.sourcePath,now:entry.exportedAt}).projection;
 });
 const result=mergeCharacterRecordProjections(initial,updates,exports,initial.snapshot.charTabs);
 result.records=[...initial.records,...updates];
 assert.deepEqual(result.snapshot.characters.filter(c=>!ids.has(c.id)),basis.snapshot.characters.filter(c=>!ids.has(c.id)),'Fremde Figuren verändert');
 assert.deepEqual(result.registry.records.filter(r=>!ids.has(r.firestoreDocumentId)),basis.registry.records.filter(r=>!ids.has(r.firestoreDocumentId)),'Fremde Registerzeilen verändert');
 return {...result,exports,candidates,newCount:newExports.length,updatedCount:updates.length};
}
