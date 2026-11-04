import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,writeFile,mkdir,unlink,rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildCharacterDatabase,markCharacterDatabaseOverlay } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { readCharacterExportOverlays } from '../../CharakterDatenbank/lib/character-export-sources.mjs';
import { markCharacterCompanionOverlay } from '../../CharakterDatenbank/lib/character-companion-overlays.mjs';
import { markCharacterResidenceOverlay } from '../../CharakterDatenbank/lib/character-residence-overlays.mjs';
import { markReviewedCharacterMetadata } from '../../CharakterDatenbank/lib/character-reviewed-metadata-overlays.mjs';
import { PATRICK_BIOGRAPHY_ENTRIES,preparePatrickBiographyCharacters,buildPatrickBiographyModule,getPatrickBiographyCharacterMetadata } from '../modules/patrick-biographies/biography-source.mjs';
import { planPatrickBiographies } from '../modules/patrick-biographies/biography-plan.mjs';
import { CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID,GWEN_CHARACTER_ID } from '../modules/patrick-biographies/biography-identities.mjs';
import { createPatrickBiographyExports,confirmationFromPatrickBiographyExports,projectPatrickBiographyDatabase } from '../modules/patrick-biographies/biography-database-projection.mjs';

const now='2026-11-03T18:00:00.000Z',previous='2026-11-02T12:00:00.000Z';
const candidates=PATRICK_BIOGRAPHY_ENTRIES.map(row=>row.genealogyCandidate);
function fixture(){
  const people=[CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID].map(id=>({id,name:PATRICK_BIOGRAPHY_ENTRIES.find(row=>row.key===id).name,identity:{worldPersonId:id},updatedAt:previous,
    biography:buildPatrickBiographyModule(id),inventory:{items:[{id:'local-kept-'+id,name:'Local possession',custom:'keep'}],coins:{copper:19},notes:'local inventory note',revision:3},
    combatProfile:{hitPoints:{current:0},resources:[{current:0,maximum:5}]},ownerUid:'local-owner-retain'}));
  const foreign={id:'unrelated',name:'Unrelated Person',inventory:{items:[{id:'unrelated-item'}],notes:'unchanged'}};
  const built=buildCharacterDatabase({characters:[...people,foreign],exportedAt:previous,charTabs:{tabs:['Alle','Gwynthor'],map:{Gwynthor:[people[0].id,people[1].id]},subtabs:{},subtabMap:{}}},candidates,{sourcePath:'Charakter Archiv Exporte/base.json'});
  const empty={registry:{schema:'aleria.character-registry',records:[],sourceOverlays:[],sourceExportedAt:previous},
    snapshot:{schema:'aleria.character-snapshot',characters:[],sourceOverlays:[],sourceExportedAt:previous},report:built.report};
  const base=mergeCharacterRecordProjections(empty,built.records,[],{tabs:['Alle','Gwynthor'],map:{Gwynthor:[people[0].id,people[1].id]},subtabs:{},subtabMap:{}});
  const online=preparePatrickBiographyCharacters(people,{now});
  for(const character of online){character.ownerUid='online-owner-secret';character.createdBy='online-creator-secret';character.updatedAt=now;character.inventory={items:[{id:'foreign-online-item',name:'Never import full inventory'}],coins:{gold:999}};}
  const pets=planPatrickBiographies({characters:online,now});
  const confirmation={schema:'aleria.patrick-biography-publication-confirmation',schemaVersion:1,verified:true,committedAt:now,planId:'a'.repeat(64),
    characters:online.map(character=>({...character,...pets.characters.find(row=>row.id===character.id).patch})),creatures:pets.creatures};
  return {...base,existingRecords:built.records.map(row=>row.record),confirmation,familyCandidates:candidates};
}

test('only a verified exact three-person/four-pet receipt creates public metadata sources without inventories, combat or credentials',()=>{
  const input=fixture(),exports=createPatrickBiographyExports(input.confirmation);
  for(const entry of exports){
    assert(!Object.hasOwn(entry.character,'inventory'));assert(!Object.hasOwn(entry.character,'combatProfile'));
    assert(!Object.hasOwn(entry.character,'ownerUid'));assert(!Object.hasOwn(entry.character,'createdBy'));
    assert(!JSON.stringify(entry).includes('online-owner-secret'));assert(!JSON.stringify(entry).includes('foreign-online-item'));
  }
  assert.equal(exports.flatMap(entry=>entry.companionBindings).length,4);
  assert.deepEqual(createPatrickBiographyExports(confirmationFromPatrickBiographyExports(exports)),exports);
  assert.throws(()=>createPatrickBiographyExports({...input.confirmation,verified:false}));
  assert.throws(()=>createPatrickBiographyExports({...input.confirmation,characters:input.confirmation.characters.slice(1)}));
  assert.throws(()=>createPatrickBiographyExports({...input.confirmation,planId:'unverified-label'}),/Planhash/);
  const renamed=structuredClone(input.confirmation);renamed.creatures[0].name='Different animal';
  assert.throws(()=>createPatrickBiographyExports(renamed),/Tiername/);
});

test('scoped projection retains every local possession, currency, local owner and depleted combat resource, creating only Gwen',()=>{
  const input=fixture(),before=structuredClone(input),exports=createPatrickBiographyExports(input.confirmation);
  const result=projectPatrickBiographyDatabase({...input,exports});
  assert.deepEqual(input,before);
  assert.equal(result.verification.newCharacters,1);
  for(const id of [CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID]){
    const old=input.snapshot.characters.find(c=>c.id===id),current=result.snapshot.characters.find(c=>c.id===id);
    assert.deepEqual(current.combatProfile,old.combatProfile);assert.deepEqual(current.inventory.coins,old.inventory.coins);assert.equal(current.ownerUid,old.ownerUid);
    assert.deepEqual(current.inventory.items.find(item=>item.id===old.inventory.items[0].id),old.inventory.items[0]);
    assert.equal(current.inventory.notes,old.inventory.notes);assert(!current.inventory.items.some(item=>item.id==='foreign-online-item'));
  }
  assert.deepEqual(result.snapshot.characters.find(c=>c.id==='unrelated'),input.snapshot.characters.find(c=>c.id==='unrelated'));
  const gwen=result.registry.records.find(row=>row.firestoreDocumentId===GWEN_CHARACTER_ID);
  assert.equal(gwen.primary.id,'gwynthor');assert.match(gwen.path,/records\/orte\/gwynthor/);
  assert.equal(result.snapshot.characters.find(c=>c.id===GWEN_CHARACTER_ID).inventory.companions.length,2);
  assert(result.snapshot.charTabs.map.Gwynthor.includes(GWEN_CHARACTER_ID));
});

test('replaying registered public sources is fully idempotent and keeps local record bookkeeping',()=>{
  const input=fixture(),exports=createPatrickBiographyExports(input.confirmation),first=projectPatrickBiographyDatabase({...input,exports});
  const second=projectPatrickBiographyDatabase({...first,existingRecords:first.records.map(row=>row.record),exports,familyCandidates:candidates});
  assert.deepEqual(second.registry,first.registry);assert.deepEqual(second.snapshot,first.snapshot);assert.deepEqual(second.report,first.report);
  assert.deepEqual(second.records,first.records);assert.equal(second.verification.newCharacters,0);
});

test('only Rhiannons confirmed flat role and summary replace stale local metadata',()=>{
  const input=fixture();
  for(const id of [CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID]){
    for(const character of [input.snapshot.characters.find(row=>row.id===id),input.existingRecords.find(row=>row.character.id===id).character]){
      character.role='Local previous role';character.bio='Local previous short summary';
    }
  }
  const cadogan=input.confirmation.characters.find(row=>row.id===CADOGAN_CHARACTER_ID);
  cadogan.role='Different unrelated online role';cadogan.bio='Different unrelated online summary';
  const result=projectPatrickBiographyDatabase({...input,exports:createPatrickBiographyExports(input.confirmation)});
  const rhiannon=result.snapshot.characters.find(row=>row.id===RHIANNON_CHARACTER_ID);
  const metadata=getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID);
  assert.equal(rhiannon.role,metadata.role);assert.equal(rhiannon.bio,metadata.bio);
  const kept=result.snapshot.characters.find(row=>row.id===CADOGAN_CHARACTER_ID);
  assert.equal(kept.role,'Local previous role');assert.equal(kept.bio,'Local previous short summary');
  assert.deepEqual(rhiannon.biography,input.confirmation.characters.find(row=>row.id===RHIANNON_CHARACTER_ID).biography);
});

test('general archive overlays add exact pet bindings through shared identity helpers and preserve later full inventory snapshots',()=>{
  const input=fixture(),exports=createPatrickBiographyExports(input.confirmation),cad=exports.find(row=>row.character.id===CADOGAN_CHARACTER_ID);
  const old=input.snapshot.characters.find(row=>row.id===CADOGAN_CHARACTER_ID);
  const overlay=markCharacterCompanionOverlay(markCharacterDatabaseOverlay(structuredClone(cad.character),{replaceExportedFields:true}),cad.companionBindings,cad.exportedAt);
  const first=buildCharacterDatabase({characters:[old,overlay]},candidates).records[0].record.character;
  assert(first.inventory.items.some(item=>item.id===old.inventory.items[0].id));assert.equal(first.inventory.coins.copper,19);
  assert.equal(first.inventory.items.filter(item=>item.creatureId).length,1);assert.deepEqual(first.combatProfile,old.combatProfile);
  const later=markCharacterDatabaseOverlay({...structuredClone(old),updatedAt:'2026-11-04T18:00:00.000Z',inventory:{items:[{id:'later-kept'}],coins:{copper:2}}},{replaceExportedFields:true});
  const second=buildCharacterDatabase({characters:[old,overlay,later]},candidates).records[0].record.character;
  assert.deepEqual(second.inventory,later.inventory);
});

test('the existing registered export reader carries limited pet receipts without exposing a second full inventory',async()=>{
  const input=fixture(),entry=createPatrickBiographyExports(input.confirmation)[0],workspace=await mkdtemp(join(tmpdir(),'aleria-patrick-source-'));
  const archive=join(workspace,'Charakter Archiv Exporte'),file=join(archive,'source.json');await mkdir(archive);await writeFile(file,JSON.stringify(entry));
  try{
    const overlays=await readCharacterExportOverlays({workspaceRoot:workspace,archiveRoot:archive,sourcePath:join(archive,'base.json'),registeredSources:['Charakter Archiv Exporte/source.json']});
    assert.equal(overlays.length,1);
    const local=input.snapshot.characters.find(c=>c.id===entry.character.id);
    const result=buildCharacterDatabase({characters:[local,overlays[0].character]},candidates).records[0].record.character;
    assert.equal(result.inventory.companions.length,1);assert.equal(result.inventory.items[0].id,local.inventory.items[0].id);
  }finally{await unlink(file);await rmdir(archive);await rmdir(workspace);}
});

test('the public Gwen residence receipt also keeps a future full archive replay in Gwynthor',()=>{
  const input=fixture(),entry=createPatrickBiographyExports(input.confirmation).find(row=>row.character.id===GWEN_CHARACTER_ID);
  const overlay=markCharacterResidenceOverlay(markCharacterDatabaseOverlay(structuredClone(entry.character),{replaceExportedFields:true}),entry.residencePlacement,entry.exportedAt);
  const hamnett={...candidates.find(row=>row.worldPersonId===GWEN_CHARACTER_ID),familyId:'haus-hamnett',familyTitle:'Haus Hamnett',familyRole:'core',folderPath:['Cenyr','Silberinsel']};
  const result=buildCharacterDatabase({characters:[overlay]},[hamnett,...candidates]).records[0];
  assert.equal(result.record.classification.primary.id,'gwynthor');assert.match(result.path,/records\/orte\/gwynthor/);
  assert.equal(result.record.character.genealogy.houseId,'house-hamnett');
});

test('a later complete profile supersedes an old reviewed metadata receipt without restoring prose, names or genealogy',()=>{
  const input=fixture(),entry=createPatrickBiographyExports(input.confirmation)[0];
  const overlay=markReviewedCharacterMetadata(markCharacterDatabaseOverlay(structuredClone(entry.character),{replaceExportedFields:true}),entry.exportedAt);
  const later={...structuredClone(entry.character),name:'Later approved name',updatedAt:'2026-11-04T18:00:00.000Z',biography:null,
    genealogy:{...entry.character.genealogy,relationships:{parents:[{personId:'new-parent',name:'New confirmed parent'}],partners:[],children:[]}},
    inventory:{items:[{id:'newest-only'}],coins:{copper:2}}};
  const result=buildCharacterDatabase({characters:[later,overlay]},candidates);
  assert.equal(result.records.length,1);
  assert.equal(result.records[0].record.character.name,later.name);
  assert.equal(result.records[0].record.character.biography,null);
  assert.deepEqual(result.records[0].record.character.genealogy.relationships.parents,later.genealogy.relationships.parents);
  assert.deepEqual(result.records[0].record.character.inventory,later.inventory);
});
