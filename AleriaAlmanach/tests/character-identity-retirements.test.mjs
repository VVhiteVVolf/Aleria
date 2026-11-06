import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile, mkdtemp, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CONFIRMED_CHARACTER_RETIREMENTS, applyConfirmedCharacterRetirement, getConfirmedCharacterRetirement } from '../../CharakterDatenbank/assets/js/character-identity-retirements.mjs';
import { mergeCharacterDatabases } from '../../CharakterDatenbank/assets/js/character-database-client.mjs';
import { encodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { planConfirmedCharacterRetirements, verifyCharacterRetirementPublication } from '../../firebase/scripts/content/character-retirement-plan.mjs';
import { runConfirmedCharacterRetirements } from '../../firebase/scripts/content/publish-confirmed-character-retirements.mjs';

const now='2026-11-03T18:00:00.000Z';
function documents() {
  return CONFIRMED_CHARACTER_RETIREMENTS.flatMap(row=>[
    {name:`projects/test/databases/(default)/documents/characters/${row.legacyId}`,updateTime:now,
      fields:{...encodeFirestoreFields({name:row.canonicalName,archived:false,portrait:'legacy.png',inventory:{items:[{id:'keep'}]},combatProfile:{hitPoints:{current:2}},emotes:[{img:'keep.png'}]}),
        typedOriginal:{timestampValue:'2026-01-01T00:00:00.000001Z'}}},
    {name:`projects/test/databases/(default)/documents/characters/${row.canonicalCharacterId}`,updateTime:now,
      fields:encodeFirestoreFields({name:row.canonicalName,archived:false,identity:{worldPersonId:row.canonicalWorldPersonId},inventory:{items:[{id:'new-live'}]},combatProfile:{hitPoints:{current:7}}})}
  ]);
}

test('Bestätigte Altakten bleiben getrennt archiviert und überschreiben keine neueren Hauptakten',()=>{
  assert.equal(getConfirmedCharacterRetirement('uiKiMFXC6OEWOdDenbiM')?.canonicalCharacterId,'15ml9RhSvJPXof7z4qY3');
  for(const rule of CONFIRMED_CHARACTER_RETIREMENTS){
    const canonical={id:rule.canonicalCharacterId,name:rule.canonicalName,identity:{worldPersonId:rule.canonicalWorldPersonId},inventory:{items:[{id:'new-live'}]},combatProfile:{hitPoints:{current:7}}};
    const retired={id:rule.legacyId,name:rule.legacyId==='uiKiMFXC6OEWOdDenbiM'?'Gwendolyn Draig (geb. Aderyn)':rule.canonicalName,
      archived:false,inventory:{items:[{id:'old'}]},portrait:'legacy.png',emotes:[{img:'old.png'}]};
    const local={...structuredClone(canonical),localRecord:{recordId:'canonical',firestoreDocumentIds:[canonical.id,retired.id]}};
    const rows=mergeCharacterDatabases([retired,canonical],[local]);
    assert.equal(rows.filter(c=>!c.archived).length,1);
    assert.equal(rows.find(c=>c.archived).id,retired.id);
    assert.deepEqual(rows.find(c=>c.id===canonical.id).inventory,canonical.inventory);
    assert.deepEqual(rows.find(c=>c.id===canonical.id).combatProfile,canonical.combatProfile);
    assert.deepEqual(rows.find(c=>c.archived).emotes,retired.emotes);
  }
});

test('Andere Personen mit gleichem Namen oder explizit anderer Weltidentität bleiben erhalten',()=>{
  const rule=CONFIRMED_CHARACTER_RETIREMENTS[0];
  const unrelated={id:'different-person',name:'Gethin',archived:false};
  assert.equal(applyConfirmedCharacterRetirement(unrelated),unrelated);
  const changedIdentity={id:rule.legacyId,name:'Gethin',identity:{worldPersonId:'person--another-person'},archived:false};
  assert.equal(applyConfirmedCharacterRetirement(changedIdentity),changedIdentity);
});

test('Historische Profilaufrufe öffnen die Hauptakte, Altakte bleibt als Rückfall verfügbar',async()=>{
  const source=await readFile(new URL('../modules/characters/character-data.js',import.meta.url),'utf8');
  const start=source.indexOf('function getCharacterById(id) {'),end=source.indexOf('\nfunction getAllCharacterRecords()',start);
  assert(start>=0&&end>start);
  const old={id:'old',mergeIdentity:{status:'merged',canonicalCharacterId:'current'}},current={id:'current'};
  const context={_characters:[old,current]};
  const helperStart=source.indexOf('function getCharacterWorldIdentity('),helperEnd=source.indexOf('\nfunction normalizeCharacterPlayerOwner(',helperStart);
  vm.runInNewContext(`${source.slice(helperStart,helperEnd)}\n${source.slice(start,end)}\nresult=getCharacterById('old');`,context);
  assert.equal(context.result,current);
  context._characters=[old];
  vm.runInNewContext("result=getCharacterById('old');",context);
  assert.equal(context.result,old);
});

async function loadCharacterProjection(characters, { builtins = {}, castIds = [] } = {}) {
  const source=await readFile(new URL('../modules/characters/character-data.js',import.meta.url),'utf8');
  const imageSets=await readFile(new URL('../modules/characters/character-image-sets.js',import.meta.url),'utf8');
  const imageLibrary=await readFile(new URL('../modules/image-library/image-library-model.js',import.meta.url),'utf8');
  const context=vm.createContext({
    structuredClone, console, URL, _characters:characters, _hiddenBuiltinCharacterIds:new Set(),
    BUILTIN_COMMENT_CHARACTERS:builtins, window:{}, document:{addEventListener(){}},
    normalizeSearchText:value=>String(value||'').toLocaleLowerCase('de').trim(),
    getValidSections:()=>[], getCurrentCommentCastIds:()=>castIds,
    getCharacterStatusValue:value=>value, getCharacterRelevanceValue:value=>value
  });
  vm.runInContext(`${imageLibrary}\n${imageSets}\n${source}`,context);
  return context;
}

test('Ansichtsprojektion hält bestätigte Altakten in jeder Reihenfolge von aktuellen Akten getrennt',async()=>{
  for(const rule of CONFIRMED_CHARACTER_RETIREMENTS){
    const current={id:rule.canonicalCharacterId,name:rule.canonicalName,archived:false,
      identity:{worldPersonId:rule.canonicalWorldPersonId},inventory:{items:[{id:'current'}]},
      combatProfile:{revision:7,hitPoints:{current:3}},portrait:'https://example.invalid/current.png',emotes:[{img:'https://example.invalid/current-emote.png',label:'Aktuell'}]};
    const old=applyConfirmedCharacterRetirement({id:rule.legacyId,name:rule.canonicalName,
      inventory:{items:[{id:'old'}]},combatProfile:{revision:1},portrait:'https://example.invalid/old.png',emotes:[{img:'https://example.invalid/old-emote.png',label:'Alt'}]});
    for(const rows of [[current,old],[old,current]]){
      const original=structuredClone(rows),context=await loadCharacterProjection(rows,{castIds:[old.id]});
      const all=vm.runInContext('getAllCharacterRecords()',context);
      assert.equal(all.length,2);
      const active=vm.runInContext('getVisibleCharacterRecords()',context);
      assert.equal(active.length,1);
      assert.equal(active[0].id,current.id);
      assert.equal(active[0].archived,false);
      assert.equal(active[0].mergeIdentity,undefined);
      for(const field of ['inventory','combatProfile','portrait','emotes']) assert.deepEqual(structuredClone(active[0][field]),current[field]);
      assert.equal(all.find(row=>row.id===old.id).archived,true);
      context.legacyId=old.id;
      assert.equal(vm.runInContext('getAvailableCommentCharacterById(legacyId).id',context),current.id);
      assert.equal(vm.runInContext('getAvailableCommentCharacters()[0].id',context),current.id);
      assert.deepEqual(rows,original);
    }
  }
});

test('Beide Gwendolyn-Aliasse und historische Cast-IDs zeigen genau eine aktuelle Hauptakte',async()=>{
  const rules=CONFIRMED_CHARACTER_RETIREMENTS.filter(row=>row.canonicalName==='Gwendolyn Draig');
  const current={id:rules[0].canonicalCharacterId,name:'Gwendolyn Draig',archived:false,
    identity:{worldPersonId:rules[0].canonicalWorldPersonId}};
  const old=rules.map(rule=>applyConfirmedCharacterRetirement({id:rule.legacyId,name:'Gwendolyn Draig'}));
  for(const rows of [[current,...old],[...old,current]]){
    const context=await loadCharacterProjection(rows,{castIds:old.map(row=>row.id)});
    assert.equal(vm.runInContext('getAvailableCommentCharacters().length',context),1);
    for(const record of old){
      context.legacyId=record.id;
      assert.equal(vm.runInContext('getAvailableCommentCharacterById(legacyId).id',context),current.id);
    }
  }
  const restored=await loadCharacterProjection([current,...old.map(row=>({...row,archived:false}))]);
  assert.equal(vm.runInContext('getAvailableCommentCharacters().length',restored),1);
  for(const record of old){
    restored.legacyId=record.id;
    assert.equal(vm.runInContext('getAvailableCommentCharacterById(legacyId).id',restored),current.id);
  }
});

test('Fehlende, archivierte oder widersprechende Hauptakten und Aliaszyklen werden nicht zum Posten aktiviert',async()=>{
  const old={id:'old',name:'Figur',archived:true,mergeIdentity:{status:'merged',canonicalCharacterId:'current',canonicalWorldPersonId:'person-current'}};
  for(const rows of [
    [old],
    [old,{id:'current',name:'Figur',archived:true,identity:{worldPersonId:'person-current'}}],
    [old,{id:'current',name:'Figur',archived:false,identity:{worldPersonId:'person-other'}}],
    [old,{id:'current',name:'Figur',archived:true,mergeIdentity:{status:'merged',canonicalCharacterId:'old'}}]
  ]){
    const context=await loadCharacterProjection(rows,{castIds:['old']});
    assert.equal(vm.runInContext("getAvailableCommentCharacterById('old')",context),null);
  }
});

test('Unabhängige Weltidentitäten bleiben getrennt und normale Archivierung unterdrückt die Builtin-Fassung',async()=>{
  const first={id:'first',name:'Gleichnamig',identity:{worldPersonId:'person-first'}};
  const second={id:'second',name:'Gleichnamig',identity:{worldPersonId:'person-second'}};
  const context=await loadCharacterProjection([first,second],{castIds:['first']});
  assert.equal(vm.runInContext('getVisibleCharacterRecords().length',context),2);
  assert.equal(vm.runInContext('getAvailableCommentCharacters().length',context),2);
  const archived=await loadCharacterProjection([{id:'saved',name:'Archiviert',archived:true}],{
    builtins:{template:{id:'builtin:archived',name:'Archiviert'}},castIds:['builtin:archived']
  });
  assert.equal(vm.runInContext('getAvailableCommentCharacters().length',archived),0);
  assert.equal(vm.runInContext("getAvailableCommentCharacterById('builtin:archived')",archived),null);
  assert.equal(vm.runInContext("getAvailableCommentCharacterById('saved')",archived),null);
});

test('Live-Plan schreibt nur Archivierung und Aliasbeleg mit Versionsguards und Rücknahmebeleg',()=>{
  const before=documents(),copy=structuredClone(before);
  const plan=planConfirmedCharacterRetirements({documents:before,preparedAt:now});
  assert.equal(plan.entries.length,CONFIRMED_CHARACTER_RETIREMENTS.length);
  assert.equal(plan.summary.canonicalProfileWrites,0);
  assert.equal(plan.summary.liveResourceWrites,0);
  const after=structuredClone(before);
  for(const write of plan.writes){
    assert.deepEqual(write.currentDocument,{updateTime:now});
    if(write.verify)continue;
    assert.deepEqual(write.updateMask.fieldPaths,['archived','mergeIdentity']);
    assert(Object.keys(write.update.fields).every(key=>['archived','mergeIdentity'].includes(key)));
    Object.assign(after.find(d=>d.name===write.update.name).fields,write.update.fields);
  }
  assert(plan.entries.every(row=>row.rollback.archived.restoreRestValue.booleanValue===false&&row.rollback.mergeIdentity.deleteField));
  verifyCharacterRetirementPublication(plan,before,after);
  assert.deepEqual(before,copy);
  assert.equal(planConfirmedCharacterRetirements({documents:after,preparedAt:now}).writes.length,0);
  after[0].fields.typedOriginal={stringValue:'altered'};
  assert.throws(()=>verifyCharacterRetirementPublication(plan,before,after),/Unbeteiligte/);
});

test('Abweichende Hauptidentität stoppt den Live-Plan',()=>{
  const before=documents();
  before[1].fields.identity=encodeFirestoreFields({identity:{worldPersonId:'person--different'}}).identity;
  assert.throws(()=>planConfirmedCharacterRetirements({documents:before,preparedAt:now}),/Weltperson/);
});

test('Öffentliche Vorbereitung sendet keinen Commit und ein geänderter Plan blockiert apply vor Backup',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'aleria-character-retirement-')),planPath=join(directory,'plan.json');
  const docs=documents(),calls=[];
  const client={request:async path=>{calls.push(path);return structuredClone(docs.find(d=>d.name.endsWith(path)));}};
  try{
    const result=await runConfirmedCharacterRetirements({client,planPath,now});
    assert.equal(result.dryRun,true);
    assert(calls.every(path=>path.startsWith('/characters/')));
    docs[0].updateTime='2026-11-03T18:01:00.000Z';
    await assert.rejects(runConfirmedCharacterRetirements({client,planPath,now,apply:true}),/Ausgangsstand/);
    assert(!calls.includes(':commit'));
  }finally{await unlink(planPath);await rmdir(directory);}
});
