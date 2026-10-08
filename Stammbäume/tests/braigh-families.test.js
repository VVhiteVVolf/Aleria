import { fingerprintBeforeBrann, isBrannAffected } from './brann-invariants.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { BRAIGH_SOURCE_FAMILIES as sources } from '../assets/js/data/braigh-source-families.js';
import { BRAIGH_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/braigh-source-counter-patches.js';
import { withBraighSourceCounterUpgrade } from '../assets/js/data/braigh-source-counter-upgrade.js';
import { BRAIGH_SOURCE_CATALOG as catalog } from '../assets/js/data/braigh-source-catalog.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { braighFamilyFingerprint, braighCounterpartFingerprint } from './braigh-invariants.js';
import { withSourceFamilyFieldUpgrade } from '../assets/js/data/source-family-field-upgrade.js';
import { fingerprintBeforeFaerna, isFaernaAffected } from './faerna-invariants.js';
import { isDamhAffected } from './damh-invariants.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const beforeBrann = read('scripts/brann-source-import/baseline-fingerprints.json');
const audit = read('assets/data/source-inventories/braigh-families-audit-2026-10-08.json');
const baseline = read('scripts/braigh-source-import/baseline-fingerprints.json');
const beforeFaerna = read('scripts/faerna-source-import/baseline-fingerprints.json');
const beforeDamh = read('scripts/damh-source-import/baseline-fingerprints.json');
const family = slug => getRegisteredFamily('haus-'+slug).family;
const pid = ref => audit.sourceToPerson[ref];
const person = ref => family(ref.split(':')[0]).persons.find(p=>p.id===pid(ref));

test('261 supplied cards form four connected valid trees and 233 distinct identities',()=>{
  assert.equal(audit.sourceCards.length,261);assert.equal(Object.keys(catalog.persons).length,233);
  for(const [slug,count] of Object.entries({culloch:91,borthwick:57,erskine:59,grannd:54})) {
    const f=normalizeFamily(family(slug));assertValidFamily(f);assert.equal(f.persons.length,count);
    assert.equal(f.extensions.blankFamily,false);assert.equal(new Set(f.persons.map(p=>p.worldPersonId)).size,count);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues,[]);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d=>d.severity!=='info'),[]);
    const connected=new Set([...f.partnerships.flatMap(p=>p.participantIds),...f.parentages.flatMap(p=>[p.childId,...p.parentIds])]);
    for(const p of f.persons) assert.ok(connected.has(p.id),p.id);
    for(const c of audit.sourceCards.filter(c=>c.slug===slug)) assert.ok(f.persons.some(p=>p.id===pid(c.ref)),c.ref);
    const {persons,houses,partnerships,parentages,cadetBranches,timeJumps,...root}=f;
    const valid=validateWorkspaceForPublishing({root:{...root,familyId:f.document.id},collections:{persons,houses,partnerships,parentages,cadetBranches,timeJumps}});
    assert.equal(valid.valid,true,JSON.stringify(valid));
  }
});

test('user confirmations and origin dates take precedence over copied counterpart errors',()=>{
  assert.equal(person('culloch:204:1').id,'ruairc-1704-diuid');assert.equal(person('culloch:204:1').birth,'1704');
  assert.ok(!family('culloch').persons.some(p=>p.id==='ronan-1699-diuid'));
  assert.equal(person('borthwick:166:2').birth,'1727');assert.equal(person('borthwick:166:2').status,'alive');
  assert.equal(person('culloch:209:2').birth,'1723');assert.equal(person('culloch:213:2').birth,'1722');
  assert.equal(person('borthwick:133:3').death,'1720');assert.equal(person('borthwick:128:3').death,'1735');
  assert.equal(person('erskine:125:2').death,'1724');assert.equal(person('erskine:130:2').death,'1734');
  assert.equal(person('culloch:159:1').id,'morag-culloch');
  for(const f of sources) for(const link of f.parentages.filter(p=>p.type==='biological')) {
    const child=f.persons.find(p=>p.id===link.childId);
    for(const id of link.parentIds) {
      const p=f.persons.find(p=>p.id===id);
      if(/^\d+$/.test(p.birth)&&/^\d+$/.test(child.birth)) assert.ok(Number(child.birth)-Number(p.birth)>=16,child.id+'/'+id);
      if(/^\d+$/.test(p.death)&&/^\d+$/.test(child.birth)) assert.ok(Number(child.birth)<=Number(p.death)+1,child.id+'/'+id);
    }
  }
});

test('mündel have foster parents and reciprocal departure links without changing biological parents',()=>{
  for(const [child,guardian] of [['culloch:209:2','culloch:191:0'],['culloch:213:2','culloch:195:0'],['borthwick:166:2','borthwick:148:0'],['erskine:163:2','erskine:145:0']]) {
    const f=family(child.split(':')[0]),p=person(child);
    assert.equal(p.familyRole,'ward');
    const links=f.parentages.filter(l=>l.childId===p.id);assert.equal(links.length,1);
    assert.equal(links[0].type,'foster');assert.deepEqual(links[0].parentIds,[pid(guardian)]);
  }
  for(const [origin,child,target] of [['lockart','ronnat-1723-lockart','culloch'],['haig','gobaith-1722-haig','culloch'],['haig','fiadh-1727-haig','borthwick']]) {
    const f=family(origin);assert.equal(f.persons.find(p=>p.id===child).familyRole,'ward-away');
    assert.equal(f.cadetBranches.find(b=>b.parentPersonId===child).targetFamilyId,'haus-'+target);
    assert.ok(f.parentages.some(p=>p.childId===child&&p.type==='biological'));
  }
});

test('sept founders, affair children and engagement keep their explicit meanings',()=>{
  const culloch=family('culloch');
  assert.deepEqual(new Set(culloch.cadetBranches.filter(b=>b.linkType==='cadet-house').map(b=>b.targetFamilyId)),new Set(['sept-dubhair','sept-grein','sept-gaesa','sept-malairt']));
  for(const b of culloch.cadetBranches.filter(b=>b.linkType==='cadet-house')) {
    assert.equal(b.houseId,'house-'+b.targetFamilyId);assert.ok(b.emblem);assert.equal(getRegisteredFamily(b.targetFamilyId).family.extensions.blankFamily,true);
  }
  for(const [slug,count] of [['culloch',2],['borthwick',2],['grannd',5]]) {
    const f=family(slug),affair=f.partnerships.find(p=>p.type==='affair');
    const children=f.parentages.filter(p=>p.partnershipId===affair.id);assert.equal(children.length,count);
    assert.ok(children.every(p=>p.legitimacy==='illegitimate'));
  }
  const grannd=family('grannd');
  const marriage=grannd.partnerships.find(p=>p.participantIds.includes(pid('grannd:153:2')));
  assert.equal(marriage.type,'marriage');assert.ok(grannd.parentages.filter(p=>p.partnershipId===marriage.id).every(p=>p.legitimacy==='legitimate'));
  assert.ok(culloch.partnerships.some(p=>p.type==='engagement'&&p.participantIds.includes(pid('culloch:209:3'))));
});

test('original portraits, young descendants and four warrior illustrations are locally available',()=>{
  assert.equal(audit.portraitAssets.length,131);assert.equal(Object.keys(audit.reusedPortraits).length,26);assert.equal(audit.referenceAssets.length,4);
  for(const a of [...audit.portraitAssets,...audit.referenceAssets]) {
    const bytes=fs.readFileSync(new URL('../'+a.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,a.path);
  }
  for(const f of sources) {
    assert.ok(f.document.description.length>180);assert.ok(fs.existsSync(new URL('../'+f.extensions.warriorReference,import.meta.url)));
    for(const p of f.persons) if(catalog.portraits[p.id]) assert.equal(p.portrait,catalog.portraits[p.id]);
  }
  for(const ref of ['culloch:217:1','borthwick:170:1','grannd:162:4','erskine:167:2']) assert.ok(person(ref).portrait,ref);
});

test('existing person and couple identities, dates and portraits agree across counterpart trees',()=>{
  for(const f of sources) for(const p of getRegisteredFamily(f.document.id).family.persons) for(const r of FAMILY_REGISTRY) {
    const other=r.family.persons.find(x=>x.id===p.id);if(!other)continue;
    for(const field of ['worldPersonId','name','birth','death','status','houseId','portrait']) assert.equal(other[field],p[field],r.id+'/'+p.id+'/'+field);
  }
  assert.equal(person('borthwick:138:1').id,'ciara-macborthwick');assert.equal(person('borthwick:138:1').houseId,'house-borthwick');
  assert.equal(person('grannd:148:1').houseId,'house-grannd');
});

test('source upgrades add ward links once and preserve local notes, portraits, titles and biological ancestry',()=>{
  for(const source of sources) {
    const registered=normalizeFamily(source),local=structuredClone(registered);
    local.extensions.sourceRevision=1;local.extensions.blankFamily=true;local.extensions.researchNote='Meine Recherche';
    for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps'])local[key]=[];
    local.view.orientation='horizontal';
    if(source.document.id==='haus-grannd') {
      local.document.houseProfile.liegeHouseId='haus-culloch';
      local.document.houseProfile.liegeHouseName='Clan Mac Culloch';
    }
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,source.persons.length);assert.equal(upgraded.extensions.researchNote,'Meine Recherche');
    assert.equal(upgraded.view.orientation,'horizontal');assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    if(source.document.id==='haus-grannd')assert.equal(upgraded.document.houseProfile.liegeHouseId,'haus-erskine');
  }
  for(const [fid,patch] of Object.entries(patches)) {
    const registered=normalizeFamily(getRegisteredFamily(fid).family),local=structuredClone(registered);
    local.extensions.sourceRevision=patch.revision-1;local.view.orientation='horizontal';
    local.persons.forEach(p=>{p.notes='Notizen';p.title='Eigener Titel';});
    for(const [id,fields] of Object.entries(patch.collections.persons||{})) if(fields.portrait)local.persons.find(p=>p.id===id).portrait='assets/images/own-research.png';
    local.cadetBranches=local.cadetBranches.filter(b=>!(patch.wardLinks||[]).some(w=>b.id==='ward-away-'+w.personId));
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.deepEqual(upgraded.parentages,local.parentages);assert.equal(upgraded.view.orientation,'horizontal');
    assert.ok(upgraded.persons.every(p=>p.notes==='Notizen'&&p.title==='Eigener Titel'));
    for(const [id,fields] of Object.entries(patch.collections.persons||{})) if(fields.portrait)assert.equal(upgraded.persons.find(p=>p.id===id).portrait,'assets/images/own-research.png');
    for(const w of patch.wardLinks||[])assert.equal(upgraded.cadetBranches.filter(b=>b.id==='ward-away-'+w.personId).length,1);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    assert.equal(withBraighSourceCounterUpgrade(getRegisteredFamily(fid).family),getRegisteredFamily(fid).family);
  }
  const f=family('haig'),branch={...f.cadetBranches[0],id:'source-addition'};
  const patch={revision:f.extensions.sourceRevision+1,collections:{},additionalCadetBranches:[branch,branch]};
  const options={inventory:'test-additive-branch',marker:'testAdditiveBranch'};
  const upgraded=withSourceFamilyFieldUpgrade(f,patch,options);
  assert.equal(upgraded.cadetBranches.filter(b=>b.id===branch.id).length,1);assert.deepEqual(upgraded.parentages,f.parentages);
  assert.equal(withSourceFamilyFieldUpgrade(upgraded,patch,options),upgraded);
});

test('all 499 unrelated records and all unmodified counterpart fields retain the pre-import state',()=>{
  const own=new Set(sources.map(f=>f.document.id));let untouched=0;
  assert.equal(FAMILY_REGISTRY.length,518);
  for(const {id,family} of FAMILY_REGISTRY) {
    if(own.has(id))continue;
    if(patches[id])assert.equal(isFaernaAffected(id) ? beforeFaerna.beforeFaernaBraighCounterparts[id] : isDamhAffected(id) ? beforeDamh.beforeDamhBraighCounterparts[id] : isBrannAffected(id) ? beforeBrann.beforeBrannBraighCounterparts[id] : braighCounterpartFingerprint(family,patches[id]),baseline.counterparts[id],id);
    else {assert.equal(fingerprintBeforeFaerna(family),baseline.families[id],id);untouched++;}
  }
  assert.equal(untouched,499);
});
