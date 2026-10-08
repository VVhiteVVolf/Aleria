import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from '../assets/js/data/alben-source-portraits.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY,getRegisteredFamily} from '../assets/js/data/families.registry.js';
import {CEITHEACH_ADDITIONAL_SOURCE_CATALOG as catalog} from '../assets/js/data/ceitheach-additional-source-catalog.js';
import {assertValidFamily} from '../assets/js/domain/family-schema.js';
import {resolveRegisteredFamilyUpgrade} from '../assets/js/services/family-registry-upgrade.js';
import {toFamilyChartData} from '../assets/js/adapters/family-chart-adapter.js';
import {auditFamilyChartLayoutPolicy} from '../assets/js/adapters/family-chart-layout-policy.js';
import {resolvePortraitSource,PORTRAIT_PLACEHOLDERS} from '../assets/js/config/portrait-placeholders.js';

const counts={'seaghda':54,'mac-tuirseach':49,'dal-leite':73,'nic-holloran':75,'an-morchoe':71,'ua-nic-ceinselaig':51,'tir-an-tordarroch':48,'an-bhaird':38};
const records=Object.keys(counts).map(slug=>getRegisteredFamily('haus-'+slug));
const audit=JSON.parse(fs.readFileSync(new URL('../'+catalog.inventory,import.meta.url),'utf8'));
const cardId=ref=>audit.sourceCards.find(c=>c.sourceRef===ref).personId;
const parents=ref=>getRegisteredFamily('haus-'+ref.split(':')[0]).family.parentages.find(p=>p.childId===cardId(ref)).parentIds;

test('acht Ceitheach-Akten übernehmen alle 459 beschrifteten Personenfelder ohne neue territoriale Doppelakten',()=>{
  assert.equal(audit.sourceCards.length,459);
  assert.equal(Object.keys(catalog.persons).length,390);
  for(const record of records){
    const family=record.family,slug=record.id.slice(5);
    assertValidFamily(family);
    assert.equal(family.persons.length,counts[slug]);
    assert.equal(family.extensions.blankFamily,false);
    assert.equal(family.extensions.preparedMainLine,false);
    assert.equal(family.document.houseProfile.kingdom,'Ceitheach');
    assert.equal(FAMILY_REGISTRY.filter(r=>r.id===record.id).length,1);
    assert.equal(new Set(family.persons.map(p=>p.worldPersonId)).size,family.persons.length);
    assert.equal(family.timeJumps.length,1);
    assert.ok(toFamilyChartData(family).diagnostics.every(d=>d.severity!=='error'));
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues,[]);
    const gap=family.timeJumps[0];
    assert.equal(gap.parentPartnershipId,family.lineage.founderPartnershipId);
    assert.ok(family.parentages.filter(p=>p.extensions.timeJumpId).every(p=>p.type==='claimed'&&p.certainty==='probable'));
    assert.ok(!family.persons.some(p=>/^\?+$/.test(p.name)));
  }
});

test('beschriftete Kindergruppen folgen den wirklichen Eltern statt der Spaltennähe',()=>{
  for(const [child,pair] of [
    ['dal-leite:118:3',['dal-leite:108:2','dal-leite:113:2']],
    ['dal-leite:118:4',['dal-leite:108:2','dal-leite:113:2']],
    ['nic-holloran:115:3',['nic-holloran:105:2','nic-holloran:110:2']],
    ['nic-holloran:133:1',['nic-holloran:115:4','nic-holloran:124:2']],
    ['an-morchoe:158:2',['an-morchoe:140:0','an-morchoe:149:0']],
    ['an-morchoe:176:1',['an-morchoe:162:0','an-morchoe:171:0']],
    ['an-morchoe:176:2',['an-morchoe:162:1','an-morchoe:171:1']],
    ['an-morchoe:176:4',['an-morchoe:162:1','an-morchoe:171:2']],
    ['an-bhaird:124:2',['an-bhaird:114:2','an-bhaird:119:2']]
  ]) assert.deepEqual(new Set(parents(child)),new Set(pair.map(cardId)),child);
  const leite=records[2].family,marsail=leite.parentages.find(p=>p.childId===cardId('dal-leite:174:0'));
  assert.equal(marsail.legitimacy,'bastard');
  assert.equal(leite.partnerships.find(p=>p.id===marsail.partnershipId).type,'forced');
  assert.equal(records[1].family.partnerships.find(p=>p.participantIds.includes(cardId('mac-tuirseach:149:3'))).type,'forced');
});

test('geteilte Weltpersonen und Beziehungen sind in allen Gegenakten identisch; gleiche Vornamen bleiben nach Generation getrennt',()=>{
  const fields=['id','worldPersonId','name','sex','birth','death','status','houseId','portrait','portraitPlaceholder'];
  for(const record of records)for(const p of record.family.persons)for(const otherRecord of FAMILY_REGISTRY){
    const other=otherRecord.family.persons.find(o=>o.worldPersonId===p.worldPersonId);
    if(other)for(const field of fields)assert.equal(other[field],p[field],`${p.id}/${otherRecord.id}/${field}`);
  }
  for(const record of records)for(const pair of record.family.partnerships)for(const otherRecord of FAMILY_REGISTRY){
    const other=otherRecord.family.partnerships.find(p=>p.id===pair.id);
    if(other){assert.deepEqual(other.participantIds,pair.participantIds);assert.equal(other.type,pair.type);}
  }
  assert.equal(cardId('ua-nic-ceinselaig:82:0'),'sorcha-founder-rochraide');
  assert.equal(cardId('dal-leite:118:4'),'peadarog-leite');
  assert.equal(catalog.persons['peadarog-leite'].birth,'1630');
  assert.equal(cardId('dal-leite:165:2'),cardId('mac-tuirseach:149:4'));
  assert.notEqual(cardId('dal-leite:86:0'),cardId('dal-leite:118:0'));
  assert.notEqual(cardId('an-bhaird:82:0'),cardId('an-bhaird:104:0'));
  assert.notEqual(cardId('an-morchoe:130:0'),cardId('an-morchoe:130:4'));
  assert.equal(catalog.persons['zeargan-seaghdha'].birth,'1675');
  assert.equal(catalog.persons['deirdre-ceinselaig'].birth,'1675');
});

test('korrigierte Herkunftshäuser stehen samt Wappen auch in den Gegenakten; deren Abstammung bleibt erhalten',()=>{
  for(const id of ['haus-feuerherz','haus-kaltherz','haus-kampfgeborene','haus-nic-blar','haus-nic-blar-leitheach','haus-somhairle']){
    const family=getRegisteredFamily(id).family;
    assert.ok(!assertValidFamily(family).diagnostics.some(d=>d.code==='MISSING_HOUSE'),id);
    for(const p of family.persons.filter(p=>['house-dal-leite','house-seaghda','house-tir-an-tordarroch'].includes(p.houseId))){
      const house=family.houses.find(h=>h.id===p.houseId);assert.ok(house.emblem,p.id);
    }
  }
});

test('unter 16 zählt das tatsächliche Alter bei Tod oder im Weltjahr 1740 und verwendet das belegte Porträt oder die Kindersilhouette als Ersatz',()=>{
  const children=Object.values(catalog.persons).filter(p=>p.portraitPlaceholder==='child');
  assert.ok(children.length>=12);
  for(const record of records)for(const p of record.family.persons){
    if(!/^\d{4}$/.test(p.birth))continue;
    const end=p.status==='dead'?Number(/^\d{4}$/.test(p.death)?p.death:NaN):1740;
    const age=end-Number(p.birth);if(!Number.isFinite(age)||age<0)continue;
    assert.equal(p.portraitPlaceholder==='child',age<16,p.id);
    if(age<16){assert.equal(p.portrait,ALBEN_SOURCE_PORTRAITS[p.id] || '');assert.equal(resolvePortraitSource(p),ALBEN_SOURCE_PORTRAITS[p.id] || PORTRAIT_PLACEHOLDERS.child);}
  }
});

test('ersetzte Leerakten aktualisieren sich wiederholungsfest und bewahren lokale Ergänzungen',()=>{
  for(const {family:registered} of records){
    const stale=structuredClone(registered);
    for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps'])stale[key]=[];
    stale.extensions.sourceRevision=1;stale.extensions.blankFamily=true;
    stale.extensions.localNote='Eigene Ergänzung';stale.view.orientation='horizontal';
    stale.persons.push({id:'local-extra',worldPersonId:'person--local--extra',name:'Lokale Ergänzung',sex:'unknown',houseId:registered.lineage.houseId,notes:'Eigene Notiz'});
    for(const id of registered.extensions.registryTombstones.persons||[])stale.persons.push({id,name:'???',sex:'unknown',houseId:registered.lineage.houseId});
    const upgraded=resolveRegisteredFamilyUpgrade(registered,stale);
    assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,registered.persons.length+1);
    assert.equal(upgraded.persons.find(p=>p.id==='local-extra').notes,'Eigene Notiz');
    assert.equal(upgraded.extensions.localNote,'Eigene Ergänzung');assert.equal(upgraded.view.orientation,'horizontal');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  }
});

test('acht Kriegerbilder, Stammbaumgrafiken und sämtliche neuen Porträts sind mit Herkunft und Prüfsumme gesichert',()=>{
  assert.equal(audit.sources.length,8);assert.equal(audit.references.length,16);
  for(const asset of [...audit.references,...audit.portraitAssets]){
    const bytes=fs.readFileSync(new URL('../'+asset.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
  }
  for(const path of Object.values(catalog.portraits))assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)),path);
});
