import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { BRANN_SOURCE_FAMILIES as sources } from '../assets/js/data/brann-source-families.js';
import { BRANN_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/brann-source-counter-patches.js';
import { BRANN_SOURCE_CATALOG as catalog } from '../assets/js/data/brann-source-catalog.js';
import { withBrannSourceCounterUpgrade } from '../assets/js/data/brann-source-counter-upgrade.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { resolveCanonicalFamilyId } from '../assets/js/modules/family-registry/family-id-aliases.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { brannFamilyFingerprint, brannCounterpartFingerprint } from './brann-invariants.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const audit = read('assets/data/source-inventories/brann-families-audit-2026-10-08.json');
const baseline = read('scripts/brann-source-import/baseline-fingerprints.json');
const family = slug => getRegisteredFamily('haus-'+slug).family;
const pid = ref => audit.sourceToPerson[ref];
const person = ref => family(ref.split(':')[0]).persons.find(p=>p.id===pid(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(p=>p.childId===pid(ref));

test('236 graphic cards yield four complete valid trees and 204 distinct identities',()=>{
  assert.equal(audit.sourceCards.length,236);assert.equal(Object.keys(catalog.persons).length,204);
  for(const [slug,count] of Object.entries({wemyss:49,dubglais:85,airdmhor:48,cerneige:54})) {
    const f=normalizeFamily(family(slug));assertValidFamily(f);assert.equal(f.persons.length,count);
    assert.equal(f.extensions.blankFamily,false);assert.equal(new Set(f.persons.map(p=>p.worldPersonId)).size,count);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues,[],slug);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d=>d.severity!=='info'),[],slug);
    const connected=new Set([...f.partnerships.flatMap(p=>p.participantIds),...f.parentages.flatMap(p=>[p.childId,...p.parentIds])]);
    for(const p of f.persons)assert.ok(connected.has(p.id),p.id);
    for(const c of audit.sourceCards.filter(c=>c.slug===slug))assert.ok(f.persons.some(p=>p.id===pid(c.ref)),c.ref);
    const {persons,houses,partnerships,parentages,cadetBranches,timeJumps,...root}=f;
    assert.equal(validateWorkspaceForPublishing({root:{...root,familyId:f.document.id},collections:{persons,houses,partnerships,parentages,cadetBranches,timeJumps}}).valid,true);
  }
});

test('corrected and explicitly reconstructed years remain distinguishable from raw diagram dates',()=>{
  assert.equal(person('cerneige:60:2').birth,'1702');
  assert.equal(audit.sourceCards.find(c=>c.ref==='cerneige:60:2').birth,'1672');
  for(let i=5;i<=10;i++) {
    const ref='dubglais:100:'+i,p=person(ref),age=1740-Number(p.birth);
    assert.ok(age>=6&&age<=25,ref);assert.equal(p.status,'alive');assert.match(p.notes,/redaktionell ergänzt/);
    assert.equal(audit.sourceCards.find(c=>c.ref===ref).birth,'????');
  }
  assert.equal(person('dubglais:60:3').birth,'1636');assert.equal(person('dubglais:61:3').birth,'1637');
  assert.equal(person('dubglais:61:3').name,'Blodeuwedd Blodyn');
  assert.equal(person('airdmhor:60:0').birth,'1672');assert.equal(pid('airdmhor:60:0'),'etain-1677-airdmhor');
  assert.equal(person('airdmhor:11:1').status,'unknown');
  for(const f of sources)for(const link of f.parentages.filter(p=>p.type==='biological')) {
    const child=f.persons.find(p=>p.id===link.childId);
    for(const id of link.parentIds) {
      const p=f.persons.find(p=>p.id===id);
      // Cathmor 1650 / Taranach 1665 is explicitly drawn and independently dated.
      const min=child.id===pid('dubglais:80:0')&&id===pid('dubglais:70:0')?15:16;
      if(/^\d+$/.test(p.birth)&&/^\d+$/.test(child.birth))assert.ok(Number(child.birth)-Number(p.birth)>=min,child.id+'/'+id);
      if(/^\d+$/.test(p.death)&&/^\d+$/.test(child.birth))assert.ok(Number(child.birth)<=Number(p.death)+1,child.id+'/'+id);
    }
  }
});

test('transmission gaps and shared Airdmhor origins do not invent immediate parenthood',()=>{
  assert.deepEqual(sources.map(f=>f.timeJumps.length),[1,3,2,1]);
  assert.equal(pid('airdmhor:0:0'),pid('dubglais:20:1'));assert.equal(pid('airdmhor:0:1'),pid('dubglais:21:1'));
  assert.notEqual(pid('airdmhor:0:1'),pid('airdmhor:30:1'));
  assert.equal(person('airdmhor:0:1').birth,'????');
  assert.equal(parentage('airdmhor:20:0').type,'claimed');assert.ok(parentage('airdmhor:20:0').extensions.timeJumpId);
  assert.ok(family('dubglais').cadetBranches.some(b=>b.linkType==='cadet-house'&&b.targetFamilyId==='haus-airdmhor'));
  assert.deepEqual(new Set(parentage('dubglais:90:0').parentIds),new Set([pid('dubglais:80:0'),pid('dubglais:81:0')]));
  assert.deepEqual(new Set(parentage('dubglais:90:4').parentIds),new Set([pid('dubglais:80:0'),pid('dubglais:81:1')]));
});

test('Rory and Kenneth keep every explicitly confirmed affair and forced branch separate',()=>{
  for(const [ref,type] of [['dubglais:100:5','affair'],['dubglais:100:6','affair'],['dubglais:100:7','affair'],['dubglais:100:8','affair'],['dubglais:100:9','affair'],['dubglais:100:10','forced'],['wemyss:70:1','affair'],['wemyss:70:2','affair'],['wemyss:70:3','forced'],['wemyss:70:4','forced']]) {
    const f=family(ref.split(':')[0]),link=parentage(ref);
    assert.equal(f.partnerships.find(p=>p.id===link.partnershipId).type,type);assert.equal(link.legitimacy,'illegitimate');assert.equal(person(ref).familyRole,'bastard');
  }
  assert.equal(pid('airdmhor:80:1'),pid('dubglais:100:5'));assert.equal(pid('airdmhor:80:2'),pid('dubglais:100:6'));
  assert.equal(parentage('airdmhor:80:1').partnershipId,parentage('dubglais:100:5').partnershipId);
  assert.notEqual(parentage('dubglais:100:7').partnershipId,parentage('dubglais:100:8').partnershipId);
  assert.equal(pid('dubglais:91:7'),pid('wemyss:61:4'));
  assert.notEqual(pid('dubglais:81:1'),pid('dubglais:91:7'));
  assert.notEqual(pid('dubglais:100:8'),pid('dubglais:100:9'));
  assert.match(person('dubglais:11:0').name,/Unklarer Vorname/);
});

test('Carnegie spelling and Torcall evidence retain existing person and family identities',()=>{
  assert.equal(resolveCanonicalFamilyId('haus-carnegie'),'haus-cerneige');
  assert.match(family('cerneige').document.title,/Carnegie/);
  for(const r of FAMILY_REGISTRY)for(const p of r.family.persons)if(p.id.endsWith('-carnegie')||p.id==='eadaoin-carnegie')assert.equal(p.houseId,'house-cerneige',r.id+'/'+p.id);
  const torcall=family('oglivy').persons.find(p=>p.id==='torcall-unknown-oglivy-41-1');
  assert.equal(torcall.name,'Torcall Dubglais');assert.equal(torcall.birth,'1609');assert.equal(torcall.houseId,'house-dubglais');
  assert.equal(pid('dubglais:50:2'),torcall.id);
  assert.equal(brannFamilyFingerprint(family('dubhan')),baseline.families['haus-dubhan']);
});

test('explicit partner lanes have one alignment owner and missing anchors still fail the authoring guard',()=>{
  const f=structuredClone(family('dubglais'));
  const pairs=f.partnerships.filter(p=>p.participantIds.includes(pid('dubglais:90:4')));
  assert.equal(pairs.length,4);
  for(const pair of pairs) {
    assert.equal(pair.extensions.chartAlignChildGroupBelowParentPair,false);
    assert.equal(pair.extensions.chartAlignParentPairOverChildPersonId,'');
    assert.ok(pair.extensions.chartAlignPartnerOverChildrenPersonId);
  }
  assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues,[]);
  const multi=pairs.find(p=>f.parentages.filter(x=>x.partnershipId===p.id).length===2);
  delete multi.extensions.chartAlignPartnerOverChildrenPersonId;
  assert.ok(auditFamilyChartLayoutPolicy(f).issues.some(x=>x.code==='LEAF_CHILD_GROUP_WITHOUT_PARENT_PAIR_ANCHOR'&&x.partnershipId===multi.id));
});

test('canonical portraits and factual house biographies preserve historical territories',()=>{
  assert.equal(audit.portraitAssets.length,0);assert.equal(audit.referenceAssets.length,0);
  assert.equal(Object.keys(audit.reusedPortraits).length,21);
  for(const [id,binding] of Object.entries(audit.reusedPortraits)){assert.equal(catalog.portraits[id],binding.path,id);assert.ok(fs.existsSync(new URL('../'+binding.path,import.meta.url)));}
  for(const f of sources){
    assert.ok(f.document.description.length>200);assert.equal(f.extensions.warriorReference,'');
    assert.match(f.document.houseProfile.county,/Brann/);assert.equal(f.extensions.houseBiographyModule.image,f.document.emblem);
    for(const p of f.persons)if(catalog.portraits[p.id])assert.equal(p.portrait,catalog.portraits[p.id]);
  }
  assert.ok(family('airdmhor').extensions.registryAdditionalPlacements.some(p=>p.role==='asylum'));
  assert.equal(Object.keys(audit.decisions.existing).length,78);
  for(const f of sources)for(const p of f.persons)for(const r of FAMILY_REGISTRY){
    const q=r.family.persons.find(q=>q.id===p.id);if(!q)continue;
    for(const field of ['worldPersonId','name','birth','death','status','houseId','portrait'])assert.equal(q[field],p[field],r.id+'/'+p.id+'/'+field);
  }
});

test('blank and narrow counterpart upgrades preserve local research and are idempotent',()=>{
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
    assert.equal(withBrannSourceCounterUpgrade(getRegisteredFamily(id).family),getRegisteredFamily(id).family);
  }
});

test('500 unrelated records and every unmodified counterpart field match the immutable pre-Brann state',()=>{
  const own=new Set(sources.map(f=>f.document.id));let untouched=0;
  assert.equal(FAMILY_REGISTRY.length,518);
  for(const {id,family} of FAMILY_REGISTRY){
    if(own.has(id))continue;
    if(patches[id])assert.equal(brannCounterpartFingerprint(family,patches[id]),baseline.counterparts[id],id);
    else {assert.equal(brannFamilyFingerprint(family),baseline.families[id],id);untouched++;}
  }
  assert.equal(untouched,500);
});
