import { fingerprintBeforeBrann, isBrannAffected } from './brann-invariants.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { FAMILY_REGISTRY_FOLDERS } from '../assets/js/data/family-registry-folders.js';
import { MATHGHAM_SOURCE_FAMILIES as families } from '../assets/js/data/mathgham-source-families.js';
import { MATHGHAM_SOURCE_CATALOG as catalog } from '../assets/js/data/mathgham-source-catalog.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/mathgham-source-counter-patches.js';
import { withMathghamSourceCounterUpgrade } from '../assets/js/data/mathgham-source-counter-upgrade.js';
import { FAELAORN_CAPITAL } from '../assets/js/data/faelaorn-territorial-catalog.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { unmodifiedCounterpartFingerprint } from './mathgham-invariants.js';
import { resolveCanonicalFamilyId } from '../assets/js/modules/family-registry/family-id-aliases.js';
import { fingerprintBeforeBraigh, isBraighAffected } from './braigh-invariants.js';
import { isFaernaAffected } from './faerna-invariants.js';
import { isDamhAffected } from './damh-invariants.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const beforeBrann = read('scripts/brann-source-import/baseline-fingerprints.json');
const audit = read('assets/data/source-inventories/mathgham-families-audit-2026-10-08.json');
const chronology = read('scripts/mathgham-source-import/chronology.json');
const snapshots = read('scripts/mathgham-source-import/baseline-fingerprints.json');
const beforeBraigh = read('scripts/braigh-source-import/baseline-fingerprints.json');
const beforeFaerna = read('scripts/faerna-source-import/baseline-fingerprints.json');
const beforeDamh = read('scripts/damh-source-import/baseline-fingerprints.json');
const counts = {diuid:89,lockart:78,fiorghra:52,ness:60,haig:59,banlaoch:47};
const family = slug => getRegisteredFamily('haus-' + slug).family;
const id = ref => audit.sourceToPerson[ref];
const person = ref => family(ref.split(':')[0]).persons.find(p => p.id === id(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(p => p.childId === id(ref));

test('385 supplied appearances resolve to six connected trees and 336 identities', () => {
  assert.equal(audit.sourceCards.length,385);
  assert.equal(Object.keys(catalog.persons).length,336);
  for (const [slug,count] of Object.entries(counts)) {
    const f=normalizeFamily(family(slug)); assertValidFamily(f);
    assert.equal(f.extensions.blankFamily,false);
    assert.equal(f.persons.length,count);
    assert.equal(new Set(f.persons.map(p=>p.worldPersonId)).size,count);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues,[],slug);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d=>d.severity!=='info'),[],slug);
    const connected=new Set([...f.partnerships.flatMap(p=>p.participantIds),...f.parentages.flatMap(p=>[p.childId,...p.parentIds])]);
    for(const p of f.persons) assert.ok(connected.has(p.id),p.id);
    for(const c of audit.sourceCards.filter(c=>c.slug===slug)) assert.ok(f.persons.some(p=>p.id===id(c.ref)),c.ref);
    const {persons,houses,partnerships,parentages,cadetBranches,timeJumps,...root}=f;
    const validation=validateWorkspaceForPublishing({root:{...root,familyId:f.document.id},collections:{persons,houses,partnerships,parentages,cadetBranches,timeJumps}});
    assert.equal(validation.valid,true,JSON.stringify(validation));
  }
});

test('user decisions correct dates and preserve Rúaircs parenthood without assigning Ronan a wife',()=>{
  assert.equal(person('ness:98:1').death,'1681');
  assert.equal(person('diuid:149:2').death,'1681');
  assert.equal(person('ness:143:2').birth,'1676');
  for(const child of ['diuid:228:3','diuid:228:4']) assert.deepEqual(new Set(parentage(child).parentIds),new Set([id('diuid:206:2'),id('diuid:219:2')]));
  assert.ok(!family('diuid').partnerships.some(p=>p.participantIds.includes(id('diuid:206:3'))));
});

test('Banlaoch reconstruction is explicit, anchored to existing people and chronologically plausible',()=>{
  for(const c of audit.sourceCards.filter(c=>c.slug==='banlaoch')) assert.equal(c.birth,'????');
  for(const coordinate of ['0:0','0:1']) {
    const p=person('banlaoch:'+coordinate);assert.equal(p.birth,'????');assert.equal(p.death,'????');
    assert.equal(p.extensions.sourceChronology,undefined);
  }
  for(const [coordinate,entry] of Object.entries(chronology.assignments)) {
    // Check the archived reconstruction; Damh later supplies a few actual dates.
    const p=families.find(f=>f.document.id==='haus-banlaoch').persons.find(p=>p.id===id('banlaoch:'+coordinate.replace('.',':')));
    for(const [field,value] of Object.entries(entry.values)) assert.equal(p[field],value,p.id+'/'+field);
    if(entry.kind==='authorized-reconstruction') assert.equal(p.extensions.sourceChronology?.referenceYear,1740,p.id);
  }
  for(const c of ['60:4',...Array.from({length:8},(_,i)=>'70:'+i)]) {
    const age=1740-Number(person('banlaoch:'+c).birth); assert.ok(age>=6&&age<=25,c);
  }
  for(const f of families) for(const relation of f.parentages.filter(p=>p.type==='biological')) {
    const child=f.persons.find(p=>p.id===relation.childId);
    for(const pid of relation.parentIds) {
      const parent=f.persons.find(p=>p.id===pid);
      if(/^\d+$/.test(child.birth)&&/^\d+$/.test(parent.birth)) assert.ok(Number(child.birth)-Number(parent.birth)>=16,child.id+'/'+pid);
      if(/^\d+$/.test(child.birth)&&/^\d+$/.test(parent.death)) assert.ok(Number(child.birth)<=Number(parent.death)+1,child.id+'/'+pid);
    }
  }
  assert.equal(person('banlaoch:10:0').birth,'1588');
  assert.equal(person('banlaoch:40:0').birth,'1651');
  assert.equal(person('banlaoch:50:3').birth,'1677');
});

test('wards, forced relationships, affairs and direct cadet houses remain distinct',()=>{
  for(const [child,guardian] of [['diuid:224:3','diuid:202:0'],['ness:158:4','ness:148:0']]) {
    assert.equal(parentage(child).type,'foster');assert.equal(person(child).familyRole,'ward');
    assert.deepEqual(parentage(child).parentIds,[id(guardian)]);
  }
  for(const ref of ['lockart:198:2','lockart:198:4','haig:178:2','haig:178:4','banlaoch:70:3']) {
    assert.equal(person(ref).familyRole,'ward-away');assert.equal(parentage(ref).type,'biological');
    assert.ok(family(ref.split(':')[0]).cadetBranches.some(b=>b.parentPersonId===id(ref)&&b.linkType==='ward-away'));
  }
  for(const [child,kind] of [['diuid:210:0','affair'],['ness:162:4','affair'],['fiorghra:115:3','forced'],['haig:182:3','forced']]) {
    const f=family(child.split(':')[0]),r=parentage(child);assert.equal(r.legitimacy,'illegitimate');
    assert.equal(f.partnerships.find(p=>p.id===r.partnershipId).type,kind);
  }
  for(const target of ['haus-lockart','haus-haig']) assert.ok(family('diuid').cadetBranches.some(b=>b.linkType==='cadet-house'&&b.targetFamilyId===target));
  assert.equal(id('lockart:86:0'),id('diuid:98:2'));
  assert.equal(id('haig:86:0'),id('diuid:122:1'));
});

test('all supplied individual portraits and five warrior illustrations are local and valid',()=>{
  assert.equal(audit.portraitAssets.length,164);assert.equal(Object.keys(audit.reusedPortraits).length,30);
  assert.equal(audit.referenceAssets.length,5);
  for(const asset of [...audit.portraitAssets,...audit.referenceAssets]) {
    const bytes=fs.readFileSync(new URL('../'+asset.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
    assert.ok(!/7yB9PR6|51CghpL|tumblr_otwjgn7mfU1wwqdobo1_1280/.test(asset.url));
  }
  for(const f of families) {
    assert.ok(f.document.description.length>150);
    const expected=f.document.id==='haus-banlaoch'?'':`assets/images/references/${f.document.id}/krieger.png`;
    assert.equal(f.extensions.warriorReference,expected);
    for(const p of f.persons) if(catalog.portraits[p.id]) assert.equal(p.portrait,catalog.portraits[p.id]);
  }
});

test('shared people retain their canonical identity, portrait and dates in counterpart records',()=>{
  const fields=['worldPersonId','name','birth','death','status','houseId','portrait'];
  for(const f of families) for(const p of getRegisteredFamily(f.document.id).family.persons) for(const r of FAMILY_REGISTRY) {
    const other=r.family.persons.find(x=>x.id===p.id);if(!other) continue;
    for(const field of fields) assert.equal(other[field],p[field],`${r.id}/${p.id}/${field}`);
  }
});

test('blank upgrades and source field upgrades preserve local research, portraits and views',()=>{
  for(const source of families) {
    const registered=normalizeFamily(source),local=structuredClone(registered);
    local.extensions.sourceRevision=1;local.extensions.blankFamily=true;local.extensions.researchNote='Meine Recherche';
    for(const key of ['persons','partnerships','parentages','cadetBranches','timeJumps']) local[key]=[];
    local.view.orientation='horizontal';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length,source.persons.length);assert.equal(upgraded.extensions.researchNote,'Meine Recherche');
    assert.equal(upgraded.view.orientation,'horizontal');assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  }
  for(const [fid,patch] of Object.entries(patches)) {
    const registered=normalizeFamily(getRegisteredFamily(fid).family),local=structuredClone(registered);
    local.extensions.sourceRevision=patch.revision-1; local.view.orientation='horizontal';
    local.persons.forEach(p=>{p.notes='Meine Recherche';p.title='Mein Titel';});
    for(const [pid,fields] of Object.entries(patch.collections.persons||{})) if(fields.portrait) local.persons.find(p=>p.id===pid).portrait='assets/images/own-research.png';
    const upgraded=resolveRegisteredFamilyUpgrade(registered,local);assertValidFamily(upgraded);
    assert.deepEqual(upgraded.parentages,local.parentages);assert.equal(upgraded.view.orientation,'horizontal');
    assert.ok(upgraded.persons.every(p=>p.notes==='Meine Recherche'&&p.title==='Mein Titel'));
    for(const [pid,fields] of Object.entries(patch.collections.persons||{})) if(fields.portrait) assert.equal(upgraded.persons.find(p=>p.id===pid).portrait,'assets/images/own-research.png');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
    assert.equal(withMathghamSourceCounterUpgrade(getRegisteredFamily(fid).family),getRegisteredFamily(fid).family);
  }
});

test('Piobarach remains the only capital folder and Diuid aliases remain canonical',()=>{
  assert.equal(FAELAORN_CAPITAL,'Piobarach');
  assert.equal(FAMILY_REGISTRY_FOLDERS.filter(f=>f.path.join('/')==='Faelaorn/Tir na Rann/Piobarach').length,1);
  assert.ok(!FAMILY_REGISTRY_FOLDERS.some(f=>/tirnanog/i.test(JSON.stringify(f))));
  assert.equal(resolveCanonicalFamilyId('haus-diud'),'haus-diuid');
  const branch=family('frostauge').cadetBranches.find(b=>b.id==='married-away-ragnfrid-frostauge-diud');
  assert.equal(branch.targetFamilyId,'haus-diuid');
  assert.equal(branch.emblem,family('diuid').document.emblem);
});

test('all 494 untouched families and unrelated fields in 18 counterpart families retain their fingerprints',()=>{
  const own=new Set(families.map(f=>f.document.id));let untouched=0;
  assert.equal(FAMILY_REGISTRY.length,518);
  for(const r of FAMILY_REGISTRY) {
    if(own.has(r.id)) continue;
    if(patches[r.id]) assert.equal(isBraighAffected(r.id) ? beforeBraigh.beforeBraighMathghamCounterparts[r.id] : isFaernaAffected(r.id) ? beforeFaerna.beforeFaernaMathghamCounterparts[r.id] : isDamhAffected(r.id) ? beforeDamh.beforeDamhMathghamCounterparts[r.id] : isBrannAffected(r.id) ? beforeBrann.beforeBrannMathghamCounterparts[r.id] : unmodifiedCounterpartFingerprint(r.family,patches[r.id]),snapshots.counterparts[r.id],r.id);
    else {assert.equal(fingerprintBeforeBraigh(r.family),snapshots.families[r.id],r.id);untouched++;}
  }
  assert.equal(untouched,494);
});
