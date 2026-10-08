import { fingerprintBeforeBrann, isBrannAffected } from './brann-invariants.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { DAMH_SOURCE_FAMILIES as sources } from '../assets/js/data/damh-source-families.js';
import { DAMH_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/damh-source-counter-patches.js';
import { DAMH_SOURCE_CATALOG as catalog } from '../assets/js/data/damh-source-catalog.js';
import { withDamhSourceCounterUpgrade } from '../assets/js/data/damh-source-counter-upgrade.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { damhFamilyFingerprint, damhCounterpartFingerprint } from './damh-invariants.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const beforeBrann = read('scripts/brann-source-import/baseline-fingerprints.json');
const audit = read('assets/data/source-inventories/damh-families-audit-2026-10-08.json');
const baseline = read('scripts/damh-source-import/baseline-fingerprints.json');
const family = slug => getRegisteredFamily('haus-'+slug).family;
const pid = ref => audit.sourceToPerson[ref];
const person = ref => family(ref.split(':')[0]).persons.find(p=>p.id===pid(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(p=>p.childId===pid(ref));

test('all 406 graphic cards form seven connected valid trees and 346 distinct identities',()=>{
  assert.equal(audit.sourceCards.length,406);assert.equal(Object.keys(catalog.persons).length,346);
  for(const [slug,count] of Object.entries({eoghainn:93,agnew:47,dianaomh:43,dobhar:49,forsyth:65,elid:47,oglivy:62})) {
    const f=normalizeFamily(family(slug));assertValidFamily(f);assert.equal(f.persons.length,count);
    assert.equal(f.extensions.blankFamily,false);assert.equal(new Set(f.persons.map(p=>p.worldPersonId)).size,count);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues,[],slug);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d=>d.severity!=='info'),[],slug);
    const connected=new Set([...f.partnerships.flatMap(p=>p.participantIds),...f.parentages.flatMap(p=>[p.childId,...p.parentIds])]);
    for(const p of f.persons)assert.ok(connected.has(p.id),p.id);
    for(const c of audit.sourceCards.filter(c=>c.slug===slug))assert.ok(f.persons.some(p=>p.id===pid(c.ref)),c.ref);
    const {persons,houses,partnerships,parentages,cadetBranches,timeJumps,...root}=f;
    const valid=validateWorkspaceForPublishing({root:{...root,familyId:f.document.id},collections:{persons,houses,partnerships,parentages,cadetBranches,timeJumps}});
    assert.equal(valid.valid,true,JSON.stringify(valid));
  }
  assert.equal(family('duff').extensions.blankFamily,true);
});

test('confirmed chronology and the actual diagram branches replace ambiguous automatic matches',()=>{
  for(const [ref,birth] of Object.entries({'agnew:70:2':'1723','agnew:70:3':'1728','agnew:70:4':'1730','agnew:41:0':'1653','forsyth:50:1':'1665','elid:70:0':'1716','elid:70:1':'1717'}))assert.equal(person(ref).birth,birth,ref);
  assert.equal(person('agnew:10:0').birth,'1580');
  assert.deepEqual(sources.map(f=>f.timeJumps.length),[4,1,1,1,1,1,2]);
  assert.notEqual(pid('agnew:0:1'),pid('agnew:70:1'));
  assert.equal(person('agnew:0:1').birth,'????');
  assert.equal(pid('agnew:0:0'),pid('eoghainn:20:0'));
  assert.equal(pid('elid:0:0'),pid('eoghainn:30:1'));
  assert.deepEqual(new Set(parentage('agnew:30:0').parentIds),new Set([pid('agnew:20:1'),pid('agnew:21:1')]));
  assert.deepEqual(new Set(parentage('elid:70:4').parentIds),new Set([pid('elid:60:3'),pid('elid:61:2')]));
  // These two young parent ages are explicitly present in the diagrams; the
  // user's confirmed Eanbharr year and forced Vadria relationship are retained.
  const young=new Set([pid('agnew:50:0')+'/'+pid('agnew:41:0'),pid('forsyth:70:7')+'/'+pid('forsyth:60:6')]);
  for(const f of sources)for(const link of f.parentages.filter(p=>p.type==='biological')) {
    const child=f.persons.find(p=>p.id===link.childId);
    for(const id of link.parentIds) {
      const p=f.persons.find(p=>p.id===id);
      if(/^\d+$/.test(p.birth)&&/^\d+$/.test(child.birth))assert.ok(Number(child.birth)-Number(p.birth)>=(young.has(child.id+'/'+id)?14:16),child.id+'/'+id);
      if(/^\d+$/.test(p.death)&&/^\d+$/.test(child.birth))assert.ok(Number(child.birth)<=Number(p.death)+1,child.id+'/'+id);
    }
  }
});

test('three confirmed forced relationships and four affairs retain their own partners and children',()=>{
  const forced=[['eoghainn:90:2','eoghainn:91:2'],['forsyth:60:6','forsyth:61:4'],['oglivy:80:2','oglivy:81:2']];
  for(const [a,b] of forced){const f=family(a.split(':')[0]);assert.equal(f.partnerships.find(p=>p.participantIds.includes(pid(a))&&p.participantIds.includes(pid(b))).type,'forced');}
  for(const [ref,type] of [['agnew:70:0','affair'],['dobhar:30:3','affair'],['elid:40:3','affair'],['oglivy:90:4','affair'],['forsyth:70:7','forced'],['oglivy:90:2','forced']]) {
    const f=family(ref.split(':')[0]),link=parentage(ref);
    assert.equal(f.partnerships.find(p=>p.id===link.partnershipId).type,type);assert.equal(link.legitimacy,'illegitimate');assert.equal(person(ref).familyRole,'bastard');
  }
  assert.equal(parentage('agnew:70:1').legitimacy,'legitimate');
  assert.equal(parentage('oglivy:90:3').legitimacy,'legitimate');
  const later=parentage('elid:70:4');assert.equal(later.legitimacy,'legitimate');assert.equal(person('elid:70:4').familyRole,'bastard');
});

test('eleven outgoing wards and the incoming Avernax ward preserve biological and foster relationships separately',()=>{
  assert.equal(sources.flatMap(f=>f.cadetBranches).filter(b=>b.linkType==='ward-away').length,11);
  for(const f of sources)for(const b of f.cadetBranches.filter(b=>b.linkType==='ward-away')) {
    assert.equal(f.persons.find(p=>p.id===b.parentPersonId).familyRole,'ward-away');
    assert.equal(f.parentages.find(p=>p.childId===b.parentPersonId).type,'biological');
    assert.ok(f.houses.some(h=>h.id===b.houseId),b.houseId);
    if(!getRegisteredFamily(b.targetFamilyId))assert.ok(['haus-laga','haus-kerlaouen','haus-marcaigh'].includes(b.targetFamilyId),b.targetFamilyId);
  }
  const f=family('elid'),links=f.parentages.filter(p=>p.childId===pid('elid:70:1'));
  assert.equal(links.length,1);assert.equal(links[0].type,'foster');
  assert.deepEqual(new Set(links[0].parentIds),new Set([pid('elid:60:0'),pid('elid:61:0')]));
  assert.equal(person('elid:70:1').houseId,'house-avernax');assert.equal(person('elid:70:1').familyRole,'ward');
  for(const target of ['haus-agnew','haus-elid'])assert.ok(family('eoghainn').cadetBranches.some(b=>b.linkType==='cadet-house'&&b.targetFamilyId===target));
});

test('existing portraits, factual biographies and historical territories are retained without invented illustrations',()=>{
  assert.equal(audit.portraitAssets.length,0);assert.equal(audit.referenceAssets.length,0);
  assert.equal(Object.keys(audit.reusedPortraits).length,25);
  for(const [id,binding] of Object.entries(audit.reusedPortraits)){assert.equal(catalog.portraits[id],binding.path,id);assert.ok(fs.existsSync(new URL('../'+binding.path,import.meta.url)));}
  for(const f of sources){
    assert.ok(f.document.description.length>200);assert.equal(f.extensions.warriorReference,'');
    assert.match(f.document.houseProfile.county,/Damh/);
    assert.equal(f.extensions.houseBiographyModule.image,f.document.emblem);
    for(const p of f.persons)if(catalog.portraits[p.id])assert.equal(p.portrait,catalog.portraits[p.id]);
  }
  assert.ok(family('eoghainn').extensions.registryAdditionalPlacements.some(p=>p.role==='asylum'));
  assert.ok(family('forsyth').extensions.registryAdditionalPlacements.length);
  assert.equal(person('eoghainn:90:5').name,'Unbenanntes Kind');assert.equal(person('eoghainn:90:5').birth,'1702');
  assert.equal(person('eoghainn:90:7').name,'Unbenanntes Kind');assert.equal(person('eoghainn:90:7').birth,'1704');
});

test('83 reused IDs share canonical dates, world identities and portraits; sourced dates supersede reconstructed Banlaoch dates',()=>{
  assert.equal(Object.keys(audit.decisions.existing).length,83);
  for(const f of sources)for(const p of family(f.document.id.slice(5)).persons)for(const r of FAMILY_REGISTRY){
    const other=r.family.persons.find(x=>x.id===p.id);if(!other)continue;
    for(const field of ['worldPersonId','name','birth','death','status','houseId','portrait'])assert.equal(other[field],p[field],r.id+'/'+p.id+'/'+field);
  }
  for(const f of sources)for(const pair of f.partnerships)for(const r of FAMILY_REGISTRY){
    const other=r.family.partnerships.find(p=>p.id===pair.id);if(!other)continue;
    for(const field of ['participantIds','type','status'])assert.deepEqual(other[field],pair[field],r.id+'/'+pair.id+'/'+field);
  }
  for(const [id,year] of Object.entries({'hearn-1630-banlaoch':'1627','glaodhaich-1631-agnew':'1627','meara-1705-banlaoch':'1704','bairrfhionn-1701-agnew':'1700'}))assert.equal(family('banlaoch').persons.find(p=>p.id===id).birth,year);
});

test('blank and counterpart upgrades are idempotent and preserve local research, portraits and ancestry',()=>{
  for(const source of sources){
    const registered=normalizeFamily(source),local=structuredClone(registered);
    local.extensions.sourceRevision=1;local.extensions.blankFamily=true;local.extensions.researchNote='Eigene Recherche';
    for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps'])local[key]=[];
    local.view.orientation='horizontal';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,source.persons.length);assert.equal(upgraded.extensions.researchNote,'Eigene Recherche');
    assert.equal(upgraded.view.orientation,'horizontal');assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  }
  for(const [id,patch] of Object.entries(patches)){
    const registered=normalizeFamily(getRegisteredFamily(id).family),local=structuredClone(registered);
    local.extensions.sourceRevision=patch.revision-1;local.view.orientation='horizontal';
    local.persons.forEach(p=>{p.notes='Notizen';p.title='Eigener Titel';p.portrait='assets/images/own-research.png';});
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.deepEqual(upgraded.parentages,local.parentages);assert.equal(upgraded.view.orientation,'horizontal');
    assert.ok(upgraded.persons.every(p=>p.notes==='Notizen'&&p.title==='Eigener Titel'&&p.portrait==='assets/images/own-research.png'));
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    assert.equal(withDamhSourceCounterUpgrade(getRegisteredFamily(id).family),getRegisteredFamily(id).family);
  }
});

test('509 unrelated records and every unmodified counterpart field retain the immutable pre-Damh state',()=>{
  const own=new Set(sources.map(f=>f.document.id));let untouched=0;
  assert.equal(FAMILY_REGISTRY.length,518);
  for(const {id,family} of FAMILY_REGISTRY){
    if(own.has(id))continue;
    if(patches[id])assert.equal((isBrannAffected(id) ? beforeBrann.beforeBrannDamhCounterparts[id] : damhCounterpartFingerprint(family,patches[id])),baseline.counterparts[id],id);
    else {assert.equal(fingerprintBeforeBrann(family),baseline.families[id],id);untouched++;}
  }
  assert.equal(untouched,509);
});
