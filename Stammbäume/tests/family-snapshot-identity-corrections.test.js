import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HOUSE_GWNIWR_FAMILY } from '../assets/js/data/house-gwniwr-family.js';
import { HOUSE_CRAIGDDU_FAMILY } from '../assets/js/data/house-craigddu-family.js';
import { assertSnapshotPersonIdentity } from '../tools/publish-family-snapshots.mjs';
import { verifyIdentityCorrectionSources } from '../tools/family-snapshot-identity-corrections.mjs';

const sourceRoot=new URL('../../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('../assets/data/source-inventories/gwniwr-maerllys-20261108/identity-corrections.json',import.meta.url),'utf8'));
const original=JSON.parse(await readFile(new URL('../assets/data/source-inventories/gwniwr-maerllys-20261108/gwniwr-original.json',import.meta.url),'utf8'));
const corrections=manifest.fieldCorrections.map(row=>({...row,sourcePath:manifest.sourcePath,marriageLinkId:manifest.marriageLinkId}));
const verifiedSourceHashes=await verifyIdentityCorrectionSources(corrections,file=>readFile(new URL(file,sourceRoot)));
const records=[{family:HOUSE_GWNIWR_FAMILY},{family:HOUSE_CRAIGDDU_FAMILY}];
const review=()=>({corrections:structuredClone(corrections),records:structuredClone(records),verifiedSourceHashes:new Map(verifiedSourceHashes)});
const before=()=>structuredClone(original.persons.find(p=>p.id==='person-e847aa96'));
const current=()=>structuredClone(HOUSE_GWNIWR_FAMILY.persons.find(p=>p.id==='person-e847aa96'));

test('documented Hywel reconciliation keeps card and life data and accepts exactly the two reviewed fields',()=>{
 const applied=assertSnapshotPersonIdentity('gwniwr',before(),current(),[],review());
 assert.deepEqual(applied.map(row=>row.field),['worldPersonId','houseId']);
});
test('ordinary date exceptions cannot authorize identity changes',()=>{
 assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',before(),current(),corrections));
});
test('a changed previous identity cannot borrow the reviewed exception',()=>{
 const previous=before();previous.worldPersonId='another-person';
 assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',previous,current(),[],review()));
});
test('counterpart, canonical identity, spouse and legacy alias are independently required',()=>{
 for(const alter of [
  r=>r.records.splice(1,1),
  r=>{r.records[1].family.persons.find(p=>p.id==='person-28b0e0a3').worldPersonId='wrong-world';},
  r=>{r.records[1].family.persons.find(p=>p.id==='person-0774c56b').worldPersonId='wrong-spouse';},
  r=>{r.records[1].family.partnerships.find(m=>m.extensions?.crossFamilyRelationship?.linkId===manifest.marriageLinkId).extensions.crossFamilyRelationship.linkId='wrong-link';}
 ]){const r=review();alter(r);assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',before(),current(),[],r));}
 const changed=current();changed.extensions.legacyWorldPersonIds=[];
 assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',before(),changed,[],review()));
});
test('card, birth, death and sex cannot be folded into an identity correction',()=>{
 for(const key of ['id','birth','death','sex']){const changed=current();changed[key]='changed';assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',before(),changed,[],review()));}
});
test('a house change must match the canonical counterpart house',()=>{
 const changed=current(),r=review();changed.houseId='house-unrelated';r.corrections.find(row=>row.field==='houseId').to=changed.houseId;
 assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',before(),changed,[],r));
});
test('evidence is content bound and cannot read arbitrary local paths',async()=>{
 await assert.rejects(verifyIdentityCorrectionSources(corrections,()=>Buffer.from('modified source')));
 let reads=0;await assert.rejects(verifyIdentityCorrectionSources([{...corrections[0],sourcePath:'../../outside.json'}],()=>{reads++;return Buffer.from('');}));assert.equal(reads,0);
 const missing=review();missing.verifiedSourceHashes.clear();assert.throws(()=>assertSnapshotPersonIdentity('gwniwr',before(),current(),[],missing));
});
