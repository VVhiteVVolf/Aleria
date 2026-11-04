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
  vm.runInNewContext(`${source.slice(start,end)}\nresult=getCharacterById('old');`,context);
  assert.equal(context.result,current);
  context._characters=[old];
  vm.runInNewContext("result=getCharacterById('old');",context);
  assert.equal(context.result,old);
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
