import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { buildAuthoredCharacterImport } from '../../../CharakterDatenbank/lib/authored-character-import.mjs';
import { confirmCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { mergeOnlineAndLocalCharacter } from '../../../CharakterDatenbank/assets/js/character-database-client.mjs';
import { markCharacterCompanionOverlay, applyCharacterCompanionOverlays } from '../../../CharakterDatenbank/lib/character-companion-overlays.mjs';
import { patrickBiographyCharacterIds, GWEN_CHARACTER_ID } from './biography-identities.mjs';
import { getPatrickBiographySource } from './biography-source.mjs';
import { getPatrickBiographyPetSpecs } from './biography-companions.mjs';
import { resolveCreatureBestiaryReference } from '../creatures/creature-bestiary-reference.js';

export const PATRICK_BIOGRAPHY_EXPORT_DIRECTORY='Charakter Archiv Exporte/Patrick Biografien 2026-11-03';
const publicFields=['id','name','title','aliases','identity','genealogy','biography','portrait','currentLocation','updatedAt'];
const pick=(value,keys)=>Object.fromEntries(keys.filter(key=>Object.hasOwn(value,key)).map(key=>[key,structuredClone(value[key])]));

function publicBinding(creature){
  return {...pick(creature,['id','name','species','portrait','notes','bestiaryReference']),
    classification:{genus:creature.classification?.genus||''},
    biography:{summary:creature.biography?.summary||creature.notes||''},
    itemOrigin:pick(creature.itemOrigin,['ownerCharacterId','ownerCharacterName','inventoryItemId','instanceId','templateId','disposition'])};
}

export function createPatrickBiographyExports(confirmation){
  assert.equal(confirmation?.schema,'aleria.patrick-biography-publication-confirmation');
  assert.equal(confirmation.schemaVersion,1);assert.equal(confirmation.verified,true);
  assert(Number.isFinite(Date.parse(confirmation.committedAt))&&/^[a-f0-9]{64}$/.test(confirmation.planId||''),'Gültiger bestätigter Planhash erforderlich.');
  const ids=patrickBiographyCharacterIds();
  assert.equal(confirmation.characters?.length,ids.length);assert.equal(new Set(confirmation.characters.map(c=>c.id)).size,ids.length);
  assert(confirmation.characters.every(c=>ids.includes(c.id)),'Bestätigung enthält fremde Personen.');
  const specs=ids.flatMap(id=>getPatrickBiographyPetSpecs(id,GWEN_CHARACTER_ID));
  assert.equal(confirmation.creatures?.length,specs.length);assert.equal(new Set(confirmation.creatures.map(c=>c.id)).size,specs.length);
  for(const spec of specs){
    const creature=confirmation.creatures.find(c=>c.id===`companion-${spec.ownerSlug}-${spec.slug}`);
    assert(creature&&creature.itemOrigin?.ownerCharacterId===spec.ownerId,'Bestätigte Tieridentität oder Besitzerbindung fehlt.');
    assert.equal(creature.name,spec.name,'Bestätigter Tiername widerspricht der geprüften Identität.');
    assert.equal(resolveCreatureBestiaryReference(creature)?.id,spec.bestiaryId);
  }
  return ids.map(id=>{
    const character=confirmation.characters.find(c=>c.id===id),source=getPatrickBiographySource(id);
    assert.equal(character.identity?.worldPersonId||character.genealogy?.worldPersonId,source.worldPersonId);
    assert(character.biography?.biography,'Bestätigte Biografie fehlt.');
    return {type:'aleria-character',version:1,exportedAt:confirmation.committedAt,mergeStrategy:'replace-reviewed-metadata-fields',
      sourcePath:`${PATRICK_BIOGRAPHY_EXPORT_DIRECTORY}/${id}.json`,assignedTab:id===GWEN_CHARACTER_ID?'Gwynthor':'',
      ...(id===GWEN_CHARACTER_ID?{residencePlacement:{kind:'place',id:'gwynthor',label:'Gwynthor',source:'confirmed-residence'}}:{}),
      character:pick(character,publicFields),companionBindings:confirmation.creatures.filter(c=>c.itemOrigin.ownerCharacterId===id).map(publicBinding),
      confirmedPublication:{schema:confirmation.schema,schemaVersion:1,verified:true,committedAt:confirmation.committedAt,planId:confirmation.planId}};
  });
}

export function confirmationFromPatrickBiographyExports(exports){
  assert.equal(exports.length,patrickBiographyCharacterIds().length);
  const proof=exports[0].confirmedPublication;
  assert(exports.every(entry=>isDeepStrictEqual(entry.confirmedPublication,proof)),'Öffentliche Bestätigungsbelege widersprechen sich.');
  return {...proof,characters:exports.map(entry=>entry.character),creatures:exports.flatMap(entry=>entry.companionBindings||[])};
}

function applyToLocal(local,exported){
  const merged=mergeOnlineAndLocalCharacter(exported.character,local);
  if(!Object.hasOwn(local,'localRecord'))delete merged.localRecord;
  const overlay=markCharacterCompanionOverlay(structuredClone(exported.character),exported.companionBindings,exported.exportedAt);
  return applyCharacterCompanionOverlays(merged,[overlay]);
}

export function projectPatrickBiographyDatabase({registry,snapshot,report,existingRecords,exports,familyCandidates=[]}){
  // Revalidate public replay sources against the same exact identity contract.
  const checked=createPatrickBiographyExports(confirmationFromPatrickBiographyExports(exports));
  assert.deepEqual(exports,checked,'Öffentliche Quellen sind nicht auf den geprüften Umfang begrenzt.');
  const now=exports[0].exportedAt,ids=new Set(patrickBiographyCharacterIds());
  let basis={registry,snapshot,report},newRecords=[];
  const gwenExport=exports.find(entry=>entry.character.id===GWEN_CHARACTER_ID);
  if(!snapshot.characters.some(c=>c.id===GWEN_CHARACTER_ID)){
    const imported=buildAuthoredCharacterImport({...basis,existingRecords:[]},[gwenExport],'patrick-biographies',familyCandidates);
    const [gwen]=imported.records;
    assert(gwen?.record.identity.worldPersonId===GWEN_CHARACTER_ID);
    const primary={kind:'place',id:'gwynthor',label:'Gwynthor',source:'confirmed-residence'};
    gwen.record.classification={...gwen.record.classification,primary};
    gwen.path=`records/orte/gwynthor/gwen-hamnett--${GWEN_CHARACTER_ID}/character.json`;
    gwen.snapshotCharacter.localRecord={...gwen.snapshotCharacter.localRecord,path:gwen.path,classification:structuredClone(gwen.record.classification)};
    newRecords=[gwen];
    basis=mergeCharacterRecordProjections(basis,[gwen],[gwenExport],imported.snapshot.charTabs);
  }
  const allRecords=[...existingRecords,...newRecords.map(row=>row.record)],projections=[],exportSources=[];
  for(const exported of exports){
    const id=exported.character.id,record=allRecords.find(record=>record.character.id===id);
    const index=basis.registry.records.filter(row=>row.firestoreDocumentId===id),people=basis.snapshot.characters.filter(row=>row.id===id);
    assert(record&&index.length===1&&people.length===1,'Die geprüfte lokale Personenakte muss eindeutig vorhanden sein.');
    assert.equal(record.identity.worldPersonId,getPatrickBiographySource(id).worldPersonId);
    if(Date.parse(record.character.updatedAt||'')>Date.parse(now)||Date.parse(record.sync.sourceExportedAt||'')>Date.parse(now))continue;
    const character=applyToLocal(record.character,exported),person=applyToLocal(people[0],exported);
    const corrected=structuredClone(record);
    corrected.identity={...corrected.identity,name:character.name,aliases:[...new Set([...(corrected.identity.aliases||[]),...(character.aliases||[])])].filter(name=>name!==character.name)};
    const result=confirmCharacterRecordProjection({record:corrected,snapshotCharacter:people[0],path:index[0].path,character,person,
      exportedCharacter:exported.character,sourcePath:exported.sourcePath,now});
    projections.push(result.projection);exportSources.push(exported);
  }
  const preservedSources=[...new Set([...(registry.sourceOverlays||[]),...(snapshot.sourceOverlays||[])])];
  const result=mergeCharacterRecordProjections({...basis,registry:{...basis.registry,sourceOverlays:preservedSources}},projections,exportSources,basis.snapshot.charTabs);
  assert.deepEqual(result.snapshot.characters.filter(c=>!ids.has(c.id)),snapshot.characters.filter(c=>!ids.has(c.id)),'Fremde Snapshotfiguren wurden verändert.');
  assert.deepEqual(result.registry.records.filter(row=>!ids.has(row.firestoreDocumentId)),registry.records.filter(row=>!ids.has(row.firestoreDocumentId)),'Fremde Datenbankeinträge wurden verändert.');
  return {...result,exports,verification:{selectedCharacters:ids.size,newCharacters:newRecords.length,projectedCharacters:projections.length,
    unrelatedCharactersPreserved:snapshot.characters.filter(c=>!ids.has(c.id)).length,canonicalCombatWrites:0,fullInventoryImports:0}};
}
