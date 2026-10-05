import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HOUSE_CWINGOD_FAMILY } from '../assets/js/data/house-cwingod-family.js';
import { HOUSE_CWINGOD_PORTRAITS } from '../assets/js/data/house-cwingod-portraits.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { loadFamilyById } from '../assets/js/services/family-library.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';

const family = getRegisteredFamily('haus-cwningod').family;
test('Cwingod übernimmt vollständige Quelle, Clinoch und einen seriellen Quellenzeitsprung', () => {
  assertValidFamily(family);
  assert.deepEqual([family.persons.length, family.partnerships.length, family.parentages.length, family.cadetBranches.length, family.timeJumps.length], [39,14,24,5,1]);
  const clinoch = family.persons.find(p => p.id === 'clinoch-cwingod');
  assert.equal(clinoch.birth, '1722');
  assert.deepEqual(new Set(family.parentages.find(p => p.childId === clinoch.id).parentIds), new Set(['galeshin-cwningod','tiwlip-arth']));
  assert.deepEqual(loadFamilyById('haus-cwingod', null).folderPath, ['Cenyr','Klaueninsel','Talklaue','Cra Fryn']);
  assert.equal(family.extensions.blankFamily, false);
  assert.ok(toFamilyChartData(family).diagnostics.every(item => item.severity === 'info'));
});

test('Cwingod aktualisiert die ältere Gründerakte wiederholungsfest und erhält lokale Ergänzungen', () => {
  const stale = structuredClone(HOUSE_CWINGOD_FAMILY);
  stale.document.title = 'Haus Cwningod';
  stale.document.houseProfile = { ...stale.document.houseProfile, seat: 'Morea', folderPath: ['Cenyr','Klaueninsel','Talklaue','Morea'] };
  stale.persons = stale.persons.slice(0,2);
  stale.partnerships = stale.partnerships.slice(0,1);
  stale.parentages = []; stale.cadetBranches = []; stale.timeJumps = [];
  stale.extensions = { blankFamily:true, sourceRevision:1, localNote:'Erhalten' };
  const upgraded=resolveRegisteredFamilyUpgrade(family,stale);
  assert.equal(upgraded.document.title, "Haus Cwingod O'Morea");
  assert.equal(upgraded.document.houseProfile.seat, 'Cra Fryn');
  assert.equal(upgraded.persons.length,39);
  assert.equal(upgraded.extensions.localNote,'Erhalten');
  const repeated=resolveRegisteredFamilyUpgrade(family,upgraded);
  assert.deepEqual(repeated.persons,upgraded.persons);
  assert.equal(new Set(repeated.persons.map(p=>p.worldPersonId)).size,39);
});

test('gemeinsame Cwingod-Personen behalten Weltidentitäten und Porträts in ihren Gegenakten', () => {
  for(const p of family.persons){
    for(const r of FAMILY_REGISTRY.filter(r=>r.id!==family.document.id)){
      const other=r.family.persons.find(other=>other.worldPersonId===p.worldPersonId);
      if(!other)continue;
      assert.equal(other.name,p.name,p.id+' / '+r.id);
      assert.equal(other.portrait,p.portrait,p.id+' / '+r.id);
      assert.equal(other.birth,p.birth,p.id+' / '+r.id);
      assert.equal(other.status,p.status,p.id+' / '+r.id);
    }
  }
  const sources=JSON.parse(fs.readFileSync(new URL('../assets/images/portraits/haus-cwingod/portrait-sources.json',import.meta.url),'utf8'));
  assert.deepEqual(new Set(Object.keys(sources)),new Set(Object.keys(HOUSE_CWINGOD_PORTRAITS)));
  for(const path of Object.values(HOUSE_CWINGOD_PORTRAITS)){
    const bytes=fs.readFileSync(new URL('../'+path,import.meta.url));
    assert.ok(bytes.length>2000,path);
    assert.ok(bytes[0]===255&&bytes[1]===216 || bytes[0]===137&&bytes[1]===80,path);
  }
});

test('Namenskorrektur überträgt sich ohne Identitätswechsel auf ältere Gegenakten', () => {
  for(const record of FAMILY_REGISTRY.filter(r=>r.family.houses.some(h=>h.id==='house-cwningod'))){
    const current=record.family;
    const stale=structuredClone(current);
    stale.extensions.sourceRevision=current.extensions.sourceRevision-1;
    stale.persons.forEach(p=>{p.name=p.name.replace('Cwingod','Cwningod');});
    stale.houses.forEach(h=>{h.name=h.name.replace('Cwingod','Cwningod');});
    stale.cadetBranches.forEach(h=>{h.name=h.name.replace('Cwingod','Cwningod');});
    const identities=stale.persons.map(p=>p.worldPersonId);
    const updated=resolveRegisteredFamilyUpgrade(current,stale);
    assert.deepEqual(updated.persons.map(p=>p.worldPersonId),identities,record.id);
    assert.ok(updated.persons.every(p=>!p.name.includes('Cwningod')),record.id);
    assert.ok(updated.houses.every(h=>!h.name.includes('Cwningod')),record.id);
    assert.ok(updated.cadetBranches.every(h=>!h.name.includes('Cwningod')),record.id);
    assert.equal(new Set(updated.persons.map(p=>p.id)).size,updated.persons.length,record.id);
  }
});
