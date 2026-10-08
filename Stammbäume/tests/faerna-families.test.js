import { fingerprintBeforeBrann, isBrannAffected } from './brann-invariants.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAERNA_SOURCE_FAMILIES as sources } from '../assets/js/data/faerna-source-families.js';
import { FAERNA_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/faerna-source-counter-patches.js';
import { withFaernaSourceCounterUpgrade } from '../assets/js/data/faerna-source-counter-upgrade.js';
import { FAERNA_SOURCE_CATALOG as catalog } from '../assets/js/data/faerna-source-catalog.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { faernaFamilyFingerprint, faernaCounterpartFingerprint } from './faerna-invariants.js';
import { fingerprintBeforeDamh, isDamhAffected } from './damh-invariants.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const beforeBrann = read('scripts/brann-source-import/baseline-fingerprints.json');
const audit = read('assets/data/source-inventories/faerna-families-audit-2026-10-08.json');
const baseline = read('scripts/faerna-source-import/baseline-fingerprints.json');
const beforeDamh = read('scripts/damh-source-import/baseline-fingerprints.json');
const family = slug => getRegisteredFamily('haus-'+slug).family;
const pid = ref => audit.sourceToPerson[ref];
const person = ref => family(ref.split(':')[0]).persons.find(p=>p.id===pid(ref));

test('216 supplied cards form four connected valid trees and 192 distinct identities',()=>{
  assert.equal(audit.sourceCards.length,216);assert.equal(Object.keys(catalog.persons).length,192);
  for(const [slug,count] of Object.entries({buadhtreun:54,durachd:66,muirgheal:43,boyd:53})) {
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

test('source gaps, corrected identity variants and supplemented dates remain consistent',()=>{
  assert.deepEqual(sources.map(f=>f.timeJumps.length),[2,3,1,1]);
  assert.equal(person('boyd:98:0').birth,'1560');assert.equal(person('boyd:103:0').birth,'1562');
  assert.equal(family('drewi').persons.find(p=>p.id==='dubhan-boyd').birth,'1560');
  assert.equal(family('drewi').persons.find(p=>p.id==='olwyna-drewi').birth,'1562');
  for(const ref of ['durachd:113:1','durachd:135:1']) assert.equal(person(ref).houseId,'house-durachd');
  assert.equal(person('durachd:179:1').id,'blathnat-founder-durachd');assert.equal(person('durachd:179:1').birth,'1698');assert.equal(person('durachd:179:1').status,'alive');
  assert.equal(person('durachd:150:1').id,'diarmaid-1633-diuid');assert.equal(person('durachd:150:1').death,'1704');
  assert.equal(person('durachd:193:0').birth,'1714');assert.equal(person('boyd:153:3').death,'1732');
  assert.equal(person('muirgheal:145:3').death,'1720');assert.equal(person('muirgheal:150:2').death,'1720');
  for(const f of sources) for(const link of f.parentages.filter(p=>p.type==='biological')) {
    const child=f.persons.find(p=>p.id===link.childId);
    for(const id of link.parentIds) {
      const p=f.persons.find(p=>p.id===id);
      if(/^\d+$/.test(p.birth)&&/^\d+$/.test(child.birth)) assert.ok(Number(child.birth)-Number(p.birth)>=16,child.id+'/'+id);
      if(/^\d+$/.test(p.death)&&/^\d+$/.test(child.birth)) assert.ok(Number(child.birth)<=Number(p.death)+1,child.id+'/'+id);
    }
  }
});

test('Boyd retains separate marriage and affair children, survivors and historical lordship',()=>{
  const f=family('boyd'),affair=f.partnerships.find(p=>p.type==='affair');
  assert.ok(affair.participantIds.includes(pid('boyd:163:1')));
  const child=f.parentages.find(p=>p.childId===pid('boyd:168:1'));
  assert.equal(child.partnershipId,affair.id);assert.equal(child.legitimacy,'illegitimate');
  assert.equal(person('boyd:168:1').familyRole,'bastard');
  const legitimate=f.parentages.find(p=>p.childId===pid('boyd:168:0'));
  assert.equal(legitimate.legitimacy,'legitimate');assert.notEqual(legitimate.partnershipId,affair.id);
  assert.equal(f.document.houseProfile.liegeHouseId,'haus-muirgheal');
  assert.equal(family('muirgheal').document.houseProfile.liegeHouseId,'haus-buadhtreun');
  assert.equal(family('durachd').document.houseProfile.seat,'Culrain');
  assert.ok(family('durachd').extensions.registryAdditionalPlacements.some(p=>p.role==='asylum'));
  for(const ref of ['buadhtreun:168:1','buadhtreun:168:4','buadhtreun:172:1','boyd:158:4','boyd:158:1'])assert.equal(person(ref).status,'alive');
  assert.ok(!f.persons.some(p=>p.name==='???'));
});

test('79 original portraits, young descendants and four warriors are locally verified',()=>{
  assert.equal(audit.portraitAssets.length,79);assert.equal(Object.keys(audit.reusedPortraits).length,36);assert.equal(audit.referenceAssets.length,4);
  for(const [id,binding] of Object.entries(audit.reusedPortraits))assert.equal(catalog.portraits[id],binding.path,id);
  for(const a of [...audit.portraitAssets,...audit.referenceAssets]) {
    const bytes=fs.readFileSync(new URL('../'+a.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,a.path);
  }
  for(const f of sources) {
    assert.ok(f.document.description.length>180);assert.ok(fs.existsSync(new URL('../'+f.extensions.warriorReference,import.meta.url)));
    for(const p of f.persons) if(catalog.portraits[p.id])assert.equal(p.portrait,catalog.portraits[p.id]);
  }
  for(const ref of ['durachd:193:0','durachd:193:1','durachd:193:2','durachd:193:3','boyd:168:1'])assert.ok(person(ref).portrait,ref);
});

test('72 reused person IDs keep shared world identities and consistent dates and portraits',()=>{
  assert.equal(Object.keys(audit.decisions.existing).length,72);
  for(const f of sources) for(const p of f.persons) for(const r of FAMILY_REGISTRY) {
    const other=r.family.persons.find(x=>x.id===p.id);if(!other)continue;
    for(const field of ['worldPersonId','name','birth','death','status','houseId','portrait'])assert.equal(other[field],p[field],r.id+'/'+p.id+'/'+field);
  }
});

test('blank and counterpart upgrades are idempotent and preserve custom notes, portraits and ancestry',()=>{
  for(const source of sources) {
    const registered=normalizeFamily(source),local=structuredClone(registered);
    local.extensions.sourceRevision=1;local.extensions.blankFamily=true;local.extensions.researchNote='Meine Recherche';
    for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps'])local[key]=[];
    local.view.orientation='horizontal';
    if(source.document.id==='haus-boyd')local.document.houseProfile.liegeHouseId='haus-buadhtreun';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,source.persons.length);assert.equal(upgraded.extensions.researchNote,'Meine Recherche');
    assert.equal(upgraded.view.orientation,'horizontal');assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    if(source.document.id==='haus-boyd')assert.equal(upgraded.document.houseProfile.liegeHouseId,'haus-muirgheal');
  }
  for(const [fid,patch] of Object.entries(patches)) {
    const registered=normalizeFamily(getRegisteredFamily(fid).family),local=structuredClone(registered);
    local.extensions.sourceRevision=patch.revision-1;local.view.orientation='horizontal';
    local.persons.forEach(p=>{p.notes='Notizen';p.title='Eigener Titel';});
    for(const [id,fields] of Object.entries(patch.collections.persons||{}))if(fields.portrait)local.persons.find(p=>p.id===id).portrait='assets/images/own-research.png';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.deepEqual(upgraded.parentages,local.parentages);assert.equal(upgraded.view.orientation,'horizontal');
    assert.ok(upgraded.persons.every(p=>p.notes==='Notizen'&&p.title==='Eigener Titel'));
    for(const [id,fields] of Object.entries(patch.collections.persons||{}))if(fields.portrait)assert.equal(upgraded.persons.find(p=>p.id===id).portrait,'assets/images/own-research.png');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    assert.equal(withFaernaSourceCounterUpgrade(getRegisteredFamily(fid).family),getRegisteredFamily(fid).family);
  }
});

test('all unrelated records and every unmodified counterpart field retain the immutable pre-import state',()=>{
  const own=new Set(sources.map(f=>f.document.id));let untouched=0;
  assert.equal(FAMILY_REGISTRY.length,518);
  for(const {id,family} of FAMILY_REGISTRY) {
    if(own.has(id))continue;
    if(patches[id])assert.equal(isDamhAffected(id) ? beforeDamh.beforeDamhFaernaCounterparts[id] : isBrannAffected(id) ? beforeBrann.beforeBrannFaernaCounterparts[id] : faernaCounterpartFingerprint(family,patches[id]),baseline.counterparts[id],id);
    else {assert.equal(fingerprintBeforeDamh(family),baseline.families[id],id);untouched++;}
  }
  assert.equal(untouched,518-own.size-Object.keys(patches).length);
});
