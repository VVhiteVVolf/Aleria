import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
const record=id=>FAMILY_REGISTRY.find(r=>r.id===id);
const g=record('gwniwr').family,m=record('haus-maerllys').family,c=record('craigddu').family;
const original=JSON.parse(await readFile(new URL('../assets/data/source-inventories/gwniwr-maerllys-20261108/gwniwr-original.json',import.meta.url),'utf8'));
test('Gwniwr continues the supplied graph with all stable chart IDs and dates',()=>{
 assert.equal(g.persons.length,12);assert.equal(g.partnerships.length,4);assert.equal(g.parentages.length,7);assert.equal(g.timeJumps.length,1);
 for(const old of original.persons){const p=g.persons.find(p=>p.id===old.id);assert.ok(p);for(const key of['birth','death','sex','status'])assert.equal(p[key],old[key]);}
 for(const key of['partnerships','parentages'])assert.deepEqual(g[key].map(p=>p.id),original[key].map(p=>p.id));
});
test('both families and counterpart trees remain valid and renderable',()=>{
 for(const id of['gwniwr','haus-maerllys','craigddu','haus-swyll','haus-ysgrif','haus-falchdyn','haus-tonnarth']){
  const family=record(id).family;assert.deepEqual(assertValidFamily(family).diagnostics,[],id);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues,[],id);
  const chart=toFamilyChartData(family);assert.ok(chart.data.length>=family.persons.length,id);
 }
});
test('historical Maerllys origin uses house links without invented ancestors',()=>{
 assert.equal(g.cadetBranches.find(b=>b.targetFamilyId==='haus-maerllys').parentPartnershipId,g.lineage.founderPartnershipId);
 assert.equal(m.lineage.originHouse.targetFamilyId,'gwniwr');assert.equal(m.lineage.originHouse.enabled,true);
 assert.equal(m.persons.length,19);assert.equal(m.timeJumps.length,2);assert.equal(m.extensions.sourceRevision>=10,true);
 assert.deepEqual(g.parentages,original.parentages);
});
test('the explicit later origin-house field upgrades saved trees without reopening their genealogy',()=>{
 const saved=structuredClone(m);
 saved.extensions.sourceRevision=10;
 saved.lineage.originHouse={...saved.lineage.originHouse,enabled:false};
 const person=saved.persons.find(p=>p.id==='cadfan-maerllys');person.notes='Eigene erhaltene Familienforschung';
 const upgraded=resolveRegisteredFamilyUpgrade(m,saved);
 assert.equal(upgraded.lineage.originHouse.enabled,true);
 assert.equal(upgraded.lineage.originHouse.targetFamilyId,'gwniwr');
 assert.equal(upgraded.persons.find(p=>p.id===person.id).notes,person.notes);
 assert.ok(toFamilyChartData(upgraded).data.some(n=>n.id.includes('__origin-house-')));
 const current=structuredClone(upgraded);current.lineage.originHouse.notes='Eigene spätere Herkunftsnotiz';
 assert.equal(resolveRegisteredFamilyUpgrade(m,current).lineage.originHouse.notes,'Eigene spätere Herkunftsnotiz');
});
test('Hywel and Eleri have one world identity across both families and seven children',()=>{
 const hg=g.persons.find(p=>p.id==='person-e847aa96'),hc=c.persons.find(p=>p.id==='person-28b0e0a3');
 const eg=g.persons.find(p=>p.id==='person-cf831497'),ec=c.persons.find(p=>p.id==='person-0774c56b');
 assert.equal(hg.worldPersonId,hc.worldPersonId);assert.equal(hg.name,'Hywel Craigddu');assert.equal(eg.worldPersonId,ec.worldPersonId);assert.equal(eg.portrait,ec.portrait);
 assert.equal(c.parentages.filter(p=>p.parentIds.includes(hc.id)).length,7);
 assert.equal(g.parentages.filter(p=>p.parentIds.includes(hg.id)).length,0);
 assert.equal(g.partnerships.find(p=>p.id==='partnership-ce644db9').extensions.crossFamilyRelationship.linkId,c.partnerships.find(p=>p.id==='partnership-8ce5d0c5').extensions.crossFamilyRelationship.linkId);
});
test('all Maerllys named people have portraits and shared people reuse those portraits',async()=>{
 const named=m.persons.filter(p=>!p.name.includes('?')&&!p.name.startsWith('Unbekannt'));
 assert.equal(named.length,16);assert.ok(named.every(p=>p.portrait));
 for(const p of named){for(const r of FAMILY_REGISTRY.filter(r=>['haus-swyll','haus-ysgrif','haus-falchdyn','haus-tonnarth'].includes(r.id))){
   const other=r.family.persons.find(o=>o.worldPersonId===p.worldPersonId);if(other)assert.equal(other.portrait,p.portrait,p.id);
 }}
});
test('the biological generations retain plausible adult parents',()=>{
 for(const family of[g,m])for(const edge of family.parentages.filter(p=>p.type==='biological')){
  const child=family.persons.find(p=>p.id===edge.childId);
  for(const id of edge.parentIds){const parent=family.persons.find(p=>p.id===id);if(/^\d{4}$/.test(child.birth)&&/^\d{4}$/.test(parent.birth))assert.ok(Number(child.birth)-Number(parent.birth)>=16,`${parent.name} -> ${child.name}`);}
 }
});
