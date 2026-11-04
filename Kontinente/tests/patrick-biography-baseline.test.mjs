import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { protectedAlbicFamilies, reviewHash } from './support/albic-review-baseline.mjs';

const selected=FAMILY_REGISTRY.filter(row=>['haus-sgrechiwr','haus-draenmelyn','haus-swyll'].includes(row.id));

test('the historical biography projection validates only the approved people and retains their original graph and IDs',()=>{
  const before=structuredClone(selected),projected=protectedAlbicFamilies(selected);
  assert.deepEqual(selected,before);
  const sgrechiwr=projected.find(row=>row.id==='haus-sgrechiwr');
  const gwen=sgrechiwr.family.persons.find(row=>row.id==='unknown-cadogan-spouse');
  assert.equal(gwen.name,'Unbekannte Ehefrau');assert.equal(gwen.birth,'????');assert.equal(gwen.houseId,'');
  assert.equal(gwen.worldPersonId,'person--family-tree--unknown-cadogan-spouse');
  assert(!sgrechiwr.family.houses.some(row=>row.id==='house-hamnett'));
  const original=selected.find(row=>row.id==='haus-sgrechiwr');
  assert.deepEqual(sgrechiwr.family.parentages,original.family.parentages);
  assert.deepEqual(sgrechiwr.family.partnerships,original.family.partnerships);
  assert.equal(sgrechiwr.family.persons.length,32);
});

test('an extra biography effect, unapproved Gwen life value, changed world ID or relationship cannot pass the dated proof',()=>{
  const expected=reviewHash(protectedAlbicFamilies(selected));
  for(const mutate of [
    rows=>{rows[0].family.persons.find(row=>row.id==='cadogan-sgrechiwr').extensions.biographyModule.biography.trivia.push('Unapproved extra effect');},
    rows=>{rows[0].family.persons.find(row=>row.id==='unknown-cadogan-spouse').birth='1693';},
    rows=>{rows[0].family.persons.find(row=>row.id==='unknown-cadogan-spouse').worldPersonId='another-world-person';},
    rows=>{rows[0].family.parentages.pop();},
    rows=>{rows[0].family.persons.pop();},
  ]){
    const changed=structuredClone(selected);mutate(changed);
    assert.throws(()=>assert.equal(reviewHash(protectedAlbicFamilies(changed)),expected));
  }
});

test('the exact biography ownership admission refuses any additional managed field',()=>{
  const record=FAMILY_REGISTRY.find(row=>row.id==='haus-caerdyn');
  const projected=protectedAlbicFamilies([record])[0];
  assert(projected.family.extensions.registryManagedExtensionFields.includes('houseBiographyModule'));
  const changed=structuredClone(record);
  changed.family.extensions.registryManagedExtensionFields.push('unapproved-state');
  assert.throws(()=>protectedAlbicFamilies([changed]),/approved-metadata/);
});

test('the two approved Morforwyn knight bindings admit no other allegiance change',()=>{
  for(const familyId of ['haus-rhelian','haus-aelryn']){
    const record=FAMILY_REGISTRY.find(row=>row.id===familyId);
    assert.equal(record.houseProfile.liegeHouseId,'haus-morforwyn');
    const projected=protectedAlbicFamilies([record])[0];
    assert.equal(projected.houseProfile.liegeHouseId,'haus-illewod');
    const changed=structuredClone(record);changed.houseProfile.liegeHouseId='unapproved-liege';
    assert.throws(()=>protectedAlbicFamilies([changed]),/approved-metadata/);
  }
});
