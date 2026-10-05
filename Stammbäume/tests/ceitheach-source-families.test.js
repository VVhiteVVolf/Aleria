import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY,getRegisteredFamily} from '../assets/js/data/families.registry.js';
import {CEITHEACH_SOURCE_CATALOG} from '../assets/js/data/ceitheach-source-catalog.js';
import {CEITHEACH_SOURCE_COUNTER_PATCHES} from '../assets/js/data/ceitheach-source-counter-patches.js';
import {withCeitheachSourceCounterUpgrade} from '../assets/js/data/ceitheach-source-counter-upgrade.js';
import {assertValidFamily} from '../assets/js/domain/family-schema.js';
import {resolveRegisteredFamilyUpgrade} from '../assets/js/services/family-registry-upgrade.js';
import {toFamilyChartData} from '../assets/js/adapters/family-chart-adapter.js';
import {auditFamilyChartLayoutPolicy} from '../assets/js/adapters/family-chart-layout-policy.js';
import {resolvePortraitSource,PORTRAIT_PLACEHOLDERS} from '../assets/js/config/portrait-placeholders.js';

const ids=['haus-ui-rochraide','haus-craobhan','haus-eldath','haus-eamhra'];
const records=ids.map(getRegisteredFamily);
const audit=JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/ceitheach-families-2026-10-05.json',import.meta.url),'utf8'));
const person=(familyId,id)=>getRegisteredFamily(familyId).family.persons.find(p=>p.id===id);

test('vier vollständige Ceitheach-Quellenakten bewahren ihre Territorien und sämtliche beschrifteten Personen',()=>{
  for(const [index,record] of records.entries()){
    const family=record.family;
    assertValidFamily(family);
    assert.equal(family.persons.length,[105,49,58,54][index]);
    assert.equal(family.extensions.blankFamily,false);
    assert.ok(family.extensions.sourceRevision>=2);
    assert.equal(family.document.houseProfile.kingdom,'Ceitheach');
    assert.equal(family.document.houseProfile.county,'Tir na Cruach');
    assert.equal(family.document.houseProfile.seat,index===3?'Tineach':'Carraigreach');
    assert.equal(family.document.houseProfile.rankId,index===0?'ard-tiarna':'unknown');
    assert.equal(new Set(family.persons.map(p=>p.worldPersonId)).size,family.persons.length);
    assert.equal(family.timeJumps.length,[3,1,2,1][index]);
    assert.ok(toFamilyChartData(family).diagnostics.every(d=>d.severity!=='error'));
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues,[]);
    for(const gap of family.timeJumps){
      const edges=family.parentages.filter(p=>p.extensions.timeJumpId===gap.id);
      assert.deepEqual(new Set(edges.map(p=>p.childId)),new Set(gap.childIds));
      assert.ok(edges.every(p=>p.type==='claimed'&&p.certainty==='probable'));
    }
  }
  assert.equal(Object.keys(CEITHEACH_SOURCE_CATALOG.persons).length,250);
});

test('gleiche Namen verschiedener Generationen bleiben getrennt; bestehende Weltpersonen bleiben in allen Gegenakten identisch',()=>{
  const earlySorcha=person('haus-ui-rochraide','sorcha-founder-rochraide');
  const laterSorcha=person('haus-ui-rochraide','sorcha-rochraide');
  assert.notEqual(earlySorcha.worldPersonId,laterSorcha.worldPersonId);
  assert.equal(laterSorcha.birth,'1612');
  assert.notEqual(person('haus-eldath','eadbhard-founder-eldath').worldPersonId,person('haus-eldath','eadbhard-eldath').worldPersonId);
  assert.equal(person('haus-eldath','eadbhard-eldath').birth,'1656');
  assert.notEqual(person('haus-eamhra','maire-1637-feannag').worldPersonId,person('haus-ard-trodach','maire-feannag').worldPersonId);
  assert.equal(person('haus-ard-trodach','maire-feannag').birth,'1700');
  const fields=['id','worldPersonId','name','sex','birth','death','status','portrait','portraitPlaceholder','houseId'];
  for(const record of records)for(const p of record.family.persons)for(const otherRecord of FAMILY_REGISTRY){
    const other=otherRecord.family.persons.find(o=>o.worldPersonId===p.worldPersonId);
    if(other)for(const field of fields)assert.equal(other[field],p[field],`${p.id} / ${otherRecord.id} / ${field}`);
  }
  for(const record of records)for(const pair of record.family.partnerships)for(const otherRecord of FAMILY_REGISTRY){
    const other=otherRecord.family.partnerships.find(p=>p.id===pair.id);
    if(other){assert.deepEqual(other.participantIds,pair.participantIds);assert.equal(other.type,pair.type);}
  }
});

test('Kadettenhäuser, Mündel, Verlobungen und nicht eheliche Beziehungen behalten ihre Quellenbedeutung',()=>{
  const rochraide=records[0].family,eldath=records[2].family,eamhra=records[3].family;
  assert.deepEqual(new Set(rochraide.cadetBranches.filter(b=>b.linkType==='cadet-house').map(b=>b.targetFamilyId)),new Set(['haus-ua-nic-ceinselaig','haus-eldath']));
  for(const id of ['donnacha-rochraide','siabhan-rochraide']){
    assert.equal(rochraide.persons.find(p=>p.id===id).familyRole,'core');
    assert.ok(rochraide.extensions.historicalWards.some(ward=>ward.personId===id));
    assert.ok(!rochraide.cadetBranches.some(b=>b.linkType==='ward-away'&&b.parentPersonId===id));
  }
  assert.equal(rochraide.partnerships.find(p=>p.id==='marriage-cei-siabhan').type,'engagement');
  assert.equal(eldath.partnerships.find(p=>p.id==='affair-einion-onora').type,'affair');
  assert.equal(eldath.partnerships.filter(p=>p.type==='forced').length,1);
  assert.equal(eamhra.partnerships.filter(p=>p.type==='forced').length,2);
  assert.equal(eamhra.partnerships.filter(p=>p.type==='affair').length,1);
  assert.equal(eamhra.parentages.filter(p=>p.legitimacy==='bastard').length,5);
  assert.equal(person('haus-craobhan','faelan-1719-craobhan').status,'alive');
  assert.match(person('haus-craobhan','faelan-1719-craobhan').title,/Erbe/);
});

test('Nutzerklärungen und sechs junge Verstorbene werden ohne erfundene Todesdaten übernommen',()=>{
  for(const [id,birth] of [['kessog-luachra','1592'],['deirdre-ceinselaig','1675'],['moira-1678-rochraide','1678'],['ideog-unknown-ui-rochraide','1680'],['zeargan-seaghdha','1675']])assert.equal(CEITHEACH_SOURCE_CATALOG.persons[id].birth,birth,id);
  const siabhan=person('haus-ui-rochraide','siabhan-rochraide');
  assert.equal(siabhan.death,'');assert.equal(siabhan.status,'missing');assert.match(siabhan.notes,/unsichere Quellenangabe/);
  assert.equal(person('haus-eldath','trianne-eldath').sex,'male');
  const children=Object.values(CEITHEACH_SOURCE_CATALOG.persons).filter(p=>p.portraitPlaceholder==='child');
  assert.equal(children.length,6);
  for(const child of children){
    assert.ok(Number(child.death)-Number(child.birth)<16);
    for(const record of records){const p=record.family.persons.find(p=>p.id===child.id);if(p){assert.equal(p.portrait,'');assert.equal(resolvePortraitSource(p),PORTRAIT_PLACEHOLDERS.child);}}
  }
});

test('alte Gründerplatzhalter und Leerakten werden ergänzt, während lokale Zusatzpersonen und Notizen erhalten bleiben',()=>{
  for(const registered of records.map(r=>r.family)){
    const stale=structuredClone(registered);
    for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps'])stale[key]=[];
    stale.extensions.sourceRevision=1;stale.extensions.blankFamily=true;
    stale.extensions.localNote='Eigene Ergänzung';stale.view.orientation='horizontal';
    stale.persons.push({id:'local-extra',worldPersonId:'person--local--extra',name:'Lokale Ergänzung',sex:'unknown',houseId:registered.lineage.houseId,notes:'Eigene Notiz'});
    if(registered.document.id==='haus-ui-rochraide'){
      stale.persons.push({id:'haus-ui-rochraide-gruender',name:'???',sex:'male',houseId:'house-rochraide'},{id:'haus-ui-rochraide-gruenderin',name:'???',sex:'female',houseId:'house-rochraide'});
      stale.partnerships.push({id:'marriage-haus-ui-rochraide-founders',participantIds:['haus-ui-rochraide-gruender','haus-ui-rochraide-gruenderin'],type:'marriage'});
    }
    const upgraded=resolveRegisteredFamilyUpgrade(registered,stale);
    assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,registered.persons.length+1);
    assert.equal(upgraded.persons.find(p=>p.id==='local-extra').notes,'Eigene Notiz');
    assert.equal(upgraded.extensions.localNote,'Eigene Ergänzung');assert.equal(upgraded.view.orientation,'horizontal');
    assert.ok(!upgraded.persons.some(p=>p.id.startsWith('haus-ui-rochraide-gruender')));
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  }
});

test('spätere Feldkorrekturen bewahren ältere Genealogie und bleiben wiederholungsfest',()=>{
  for(const [id,patch] of Object.entries(CEITHEACH_SOURCE_COUNTER_PATCHES)){
    const registered=getRegisteredFamily(id).family,stale=structuredClone(registered);
    stale.extensions.sourceRevision=patch.revision-1;
    const neighbor=stale.persons.find(p=>!patch.collections.persons[p.id]);
    neighbor.notes='Nachbarnotiz';neighbor.title='Eigener Titel';
    stale.view.ancestorDepth=3;stale.lineage.crestSubtitle='Eigenes Hauswort';
    for(const [collection,entities] of Object.entries(patch.collections))for(const [entityId,fields] of Object.entries(entities)){
      const entity=stale[collection].find(e=>e.id===entityId);
      for(const field of Object.keys(fields))entity[field]=field==='portrait'?'':'Alter Wert';
    }
    const upgraded=resolveRegisteredFamilyUpgrade(registered,stale);
    assert.equal(upgraded.persons.find(p=>p.id===neighbor.id).notes,'Nachbarnotiz',id);
    assert.equal(upgraded.persons.find(p=>p.id===neighbor.id).title,'Eigener Titel',id);
    assert.equal(upgraded.view.ancestorDepth,3);assert.equal(upgraded.lineage.crestSubtitle,'Eigenes Hauswort');
    for(const [collection,entities] of Object.entries(patch.collections))for(const [entityId,fields] of Object.entries(entities))for(const [field,value] of Object.entries(fields))assert.deepEqual(upgraded[collection].find(e=>e.id===entityId)[field],value,`${id}/${entityId}/${field}`);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded,id);
    assert.equal(withCeitheachSourceCounterUpgrade(registered),registered);
  }
});

test('direkte Familienimporte und Register liefern dieselbe korrigierte Gegenakte',async()=>{
  const modules={
    'haus-illysywen':['house-illysywen-family.js','HOUSE_ILLYSYWEN_FAMILY'],
    'haus-vaeren':['house-vaeren-family.js','HOUSE_VAEREN_FAMILY'],
    'haus-varangr':['house-varangr-family.js','HOUSE_VARANGR_FAMILY'],
    'haus-kaltherz':['house-kaltherz-family.js','HOUSE_KALTHERZ_FAMILY'],
    'haus-feuerherz':['house-feuerherz-family.js','HOUSE_FEUERHERZ_FAMILY'],
    'haus-nic-blar':['house-nic-blar-family.js','HOUSE_NIC_BLAR_CEITHEACH_FAMILY'],
    'haus-mac-ard-cumhaill':['house-mac-ard-cumhaill-family.js','HOUSE_MAC_ARD_CUMHAILL_FAMILY'],
    'haus-iomrach':['house-iomrach-family.js','HOUSE_IOMRACH_FAMILY'],
    'haus-somhairle':['house-sidhe-somhairle-family.js','HOUSE_SIDHE_SOMHAIRLE_FAMILY'],
    'haus-pendrag':['house-pendrag-family.js','HOUSE_PENDRAG_FAMILY']
  };
  for(const [id,[file,exportName]] of Object.entries(modules)){
    const module=await import('../assets/js/data/'+file);
    const direct=module[exportName],registered=getRegisteredFamily(id).family;
    for(const collection of ['persons','partnerships','parentages','houses','cadetBranches','timeJumps']){
      assert.deepEqual(direct[collection],registered[collection],`${id}/${collection}`);
    }
    assert.equal(direct.extensions.sourceRevision,registered.extensions.sourceRevision,id);
  }
});

test('vier Kriegerbilder, vier Stammbaumgrafiken und sämtliche Personenbilder sind lokal mit Herkunft gesichert',()=>{
  assert.equal(audit.sources.length,4);assert.equal(audit.references.length,8);assert.equal(audit.unresolved.length,0);
  for(const asset of [...audit.references,...audit.portraitAssets]){
    const path=asset.path.startsWith('Stammbäume/')?asset.path.slice('Stammbäume/'.length):asset.path;
    const bytes=fs.readFileSync(new URL('../'+path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  }
  for(const path of Object.values(CEITHEACH_SOURCE_CATALOG.portraits))assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)),path);
});
