import { CWINGOD_SOURCE_PORTRAITS, CWINGOD_PORTRAIT_REVISIONS } from '../assets/js/data/cwingod-source-portraits.js';
import { withCwingodSourcePortraitUpgrade } from '../assets/js/data/cwingod-source-portrait-upgrade.js';
import { withParzifalCrewPortraitUpgrade } from '../assets/js/data/parzifal-crew-families/portrait-upgrade.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { HOUSE_CWINGOD_FAMILY } from '../assets/js/data/house-cwingod-family.js';
import { HOUSE_ARTH_FAMILY } from '../assets/js/data/house-arth-family.js';
import { HOUSE_CWINGOD_PORTRAITS } from '../assets/js/data/house-cwingod-portraits.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { loadFamilyById } from '../assets/js/services/family-library.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';

const family = getRegisteredFamily('haus-cwningod').family;

test('spätere Gegenaktenrevisionen öffnen Cwingods bereits übernommene Ehen und Häuser nicht erneut', () => {
  const stale = structuredClone(family);
  stale.extensions.sourceRevision = 3;
  const pairId = 'marriage-galeshin-arianhrod';
  stale.partnerships.find(pair => pair.id === pairId).notes = 'Lokale Eheergänzung';
  stale.houses.find(house => house.id === 'house-arth').emblem = 'assets/local-arth.png';
  const upgraded = resolveRegisteredFamilyUpgrade(family, stale);
  assert.equal(upgraded.partnerships.find(pair => pair.id === pairId).notes, 'Lokale Eheergänzung');
  assert.equal(upgraded.houses.find(house => house.id === 'house-arth').emblem, 'assets/local-arth.png');
  for (const record of [...family.houses, ...family.partnerships]) {
    assert.ok(record.extensions.registryManagedSourceRevision <= 3, record.id);
  }
});
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
    stale.extensions.sourceRevision=(current.extensions.cwingodHouseNameRevision ?? current.extensions.sourceRevision)-1;
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

const portraitInventory = JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/cwingod-portraits-2026-10-08.json', import.meta.url), 'utf8'));

test('Cwingod übernimmt exakt die 19 neuen Originalbilder und schützt Tegid, Angehörige und Platzhalter', () => {
  assert.equal(portraitInventory.portraits.length, 19);
  assert.deepEqual(new Set(Object.keys(CWINGOD_SOURCE_PORTRAITS)), new Set(portraitInventory.portraits.map(p => p.personId)));
  const digest = path => createHash('sha256').update(fs.readFileSync(new URL('../' + path, import.meta.url))).digest('hex');
  for (const asset of portraitInventory.portraits) {
    assert.equal(family.persons.find(p => p.id === asset.personId).portrait, asset.path);
    assert.equal(digest(asset.path), asset.sha256, asset.personId);
  }
  for (const protectedPortrait of portraitInventory.preservedPortraits) {
    const previous = withParzifalCrewPortraitUpgrade(HOUSE_CWINGOD_FAMILY).persons.find(p => p.id === protectedPortrait.personId);
    assert.equal(family.persons.find(p => p.id === protectedPortrait.personId).portrait, previous.portrait, protectedPortrait.personId);
  }
});

test('die Porträtkorrektur aktualisiert vorhandene Gegenakten feldgenau und wiederholungsfest', () => {
  const withoutExtensions = ({ extensions, ...record }) => record;
  for (const [familyId, revision] of Object.entries(CWINGOD_PORTRAIT_REVISIONS)) {
    // Exercise this portrait release before the later Mathgham field correction.
    const current = familyId === 'haus-arth'
      ? withCwingodSourcePortraitUpgrade(HOUSE_ARTH_FAMILY)
      : getRegisteredFamily(familyId)?.family;
    // The Rioga source may be published separately; it receives the same portrait
    // correction as soon as its full family record is available.
    if (!current?.persons.some(person => Object.hasOwn(CWINGOD_SOURCE_PORTRAITS, person.id))) continue;
    const stale = normalizeFamily(current);
    stale.extensions.sourceRevision = revision - 1;
    delete stale.extensions.cwingodSourcePortraitInventory;
    for (const person of stale.persons) {
      const asset = portraitInventory.portraits.find(p => p.personId === person.id);
      if (asset) person.portrait = asset.previousPath;
      person.notes = 'Lokale Notiz ' + person.id;
      person.title = 'Lokaler Titel ' + person.id;
      person.name = 'Lokaler Name ' + person.id;
    }
    for (const key of ['partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps']) {
      stale[key].forEach(record => {
        const field = key === 'houses' ? 'name' : 'notes';
        record[field] = 'Lokale Ergänzung ' + record.id;
      });
    }
    const upgraded = resolveRegisteredFamilyUpgrade(current, stale);
    assert.equal(upgraded.extensions.sourceRevision, revision, familyId);
    for (const person of upgraded.persons) {
      const expected = { ...stale.persons.find(p => p.id === person.id) };
      if (Object.hasOwn(CWINGOD_SOURCE_PORTRAITS, person.id)) expected.portrait = CWINGOD_SOURCE_PORTRAITS[person.id];
      assert.deepEqual(withoutExtensions(person), withoutExtensions(expected), familyId + '/' + person.id);
    }
    for (const key of ['partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps']) {
      assert.deepEqual(upgraded[key].map(withoutExtensions), stale[key].map(withoutExtensions), familyId + '/' + key);
    }
    assert.deepEqual(resolveRegisteredFamilyUpgrade(current, upgraded), upgraded, familyId);
    assert.equal(withCwingodSourcePortraitUpgrade(current), current, familyId);
  }
});
