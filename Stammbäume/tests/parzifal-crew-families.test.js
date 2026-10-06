import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { PARZIFAL_FAMILY_EXPANSIONS, PARZIFAL_NEW_HOUSES } from '../assets/js/data/parzifal-crew-families/catalog.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import { createFamilyChartOverview } from '../assets/js/adapters/family-chart-overview-policy.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { PARZIFAL_CORRECTED_PORTRAITS } from '../assets/js/data/parzifal-crew-families/portrait-upgrade.js';

const family = surname => FAMILY_REGISTRY.find(record => record.id === `haus-${surname.toLowerCase()}`).family;
const person = (surname, id) => family(surname).persons.find(person => person.id === id);

test('Korrigierte Porträts erreichen bestehende Akten ohne Änderungen an Notizen oder Genealogie', async () => {
  for (const [familyId, personId, previousRevision] of [
    ['haus-ddraenen', 'iestyn-ddraenen', 6],
    ['haus-cwningod', 'tegid-cwningod', 4],
    ['haus-pawen', 'tegid-cwningod', 3]
  ]) {
    const registered = FAMILY_REGISTRY.find(record => record.id === familyId).family;
    const local = structuredClone(registered);
    local.extensions.sourceRevision = previousRevision;
    const existing = local.persons.find(person => person.id === personId);
    existing.portrait = 'old-portrait.jpg';
    existing.notes = 'Eigene Reisenotiz';
    existing.title = 'Eigener Amtstitel';
    const previousRelations = { partnerships: local.partnerships, parentages: local.parentages };
    const updated = resolveRegisteredFamilyUpgrade(registered, local);
    const corrected = updated.persons.find(person => person.id === personId);
    assert.equal(corrected.portrait, PARZIFAL_CORRECTED_PORTRAITS[personId]);
    assert.equal(corrected.notes, existing.notes);
    assert.equal(corrected.title, existing.title);
    assert.equal(corrected.worldPersonId, existing.worldPersonId);
    assert.deepEqual(updated.partnerships, previousRelations.partnerships);
    assert.deepEqual(updated.parentages, previousRelations.parentages);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, updated), updated);
    await access(new URL('../'+corrected.portrait, import.meta.url));
  }
});

test('Alle elf ausgearbeiteten Gerüste sind verbunden, chronologisch plausibel und besitzen Kinderplatzhalter', () => {
  for (const definition of PARZIFAL_FAMILY_EXPANSIONS) {
    const current = assertValidFamily(family(definition.surname)).family;
    assert.ok(current.persons.length >= 28 && current.persons.length <= 36, definition.surname);
    assert.equal(current.view.focusPersonId,'');
    const rootId = createFamilyChartOverview(current,toFamilyChartData(current).data).rootId;
    assert.ok(Number(current.persons.find(p => p.id === rootId).birth) <= 1630);
    const connections = new Map(current.persons.map(person => [person.id, new Set()]));
    const connect = (a,b) => { connections.get(a).add(b); connections.get(b).add(a); };
    current.partnerships.forEach(edge => connect(...edge.participantIds));
    current.parentages.forEach(edge => edge.parentIds.forEach(parent => connect(edge.childId,parent)));
    const reachable = new Set([rootId]);
    for (const id of reachable) connections.get(id).forEach(other => reachable.add(other));
    for (const edge of current.parentages) {
      const child = current.persons.find(p => p.id === edge.childId);
      for (const parentId of edge.parentIds) {
        const parent = current.persons.find(p => p.id === parentId);
        assert.ok(parent, `${child.id}: ${parentId}`);
        if (child.birth && parent.birth) {
          assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${child.id}: ${parent.id}`);
          if (parent.sex === 'female') assert.ok(Number(child.birth) - Number(parent.birth) <= 45, `${child.id}: ${parent.id}`);
        }
        if (child.birth && parent.death) assert.ok(Number(child.birth) <= Number(parent.death) + 1);
      }
    }
    for (const p of current.persons) {
      assert.ok(reachable.has(p.id), p.id);
      if (p.birth && !p.death && 1740 - Number(p.birth) < 16 && !p.portrait) assert.equal(p.portraitPlaceholder, 'child');
    }
  }
});

test('Alle betroffenen Angehörigen aus Lynnes und Rhydians Crew stehen in ihren Familien', async () => {
  const source = JSON.parse(await readFile(new URL('../../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json', import.meta.url), 'utf8'));
  for (const name of ['Uwchric','Helban','Oenric','Iwrban','Maelban','Saithar','Gwaeden']) {
    const member = source.candidates.find(member => member.givenName === name);
    const matches = family(member.surname).persons.filter(person => person.name === member.displayName);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].birth, String(1740-member.age));
    assert.equal(matches[0].portrait, '..'+member.portrait);
    await access(new URL('../'+matches[0].portrait, import.meta.url));
  }
});

test('Bethan Prys bezeichnet zwei unterschiedliche Weltpersonen; Morlan bleibt ein eigenes Haus', () => {
  const bethans = family('Prys').persons.filter(person => person.name === 'Bethan Prys');
  assert.deepEqual(bethans.map(p => [p.sex,p.birth]).sort(), [['female','1701'],['male','1682']]);
  assert.equal(new Set(bethans.map(p => p.worldPersonId)).size, 2);
  assert.equal(person('Prys','bethan-prys').worldPersonId, 'person--haus-prys--bethan-prys');
  assert.notEqual(family('Morlan').document.id, family('Morglan').document.id);
  for (const surname of ['Darach','Gerwig','Cassiana']) assert.equal(FAMILY_REGISTRY.some(record => record.id === `haus-${surname.toLowerCase()}`), false);
});

test('Die neuen Häuser liegen in Talgarth, sind Bürgerfamilien und haben erreichbare Wappen', async () => {
  for (const definition of PARZIFAL_NEW_HOUSES) {
    const record = FAMILY_REGISTRY.find(record => record.id === `haus-${definition.surname.toLowerCase()}`);
    assert.deepEqual(record.folderPath, ['Cenyr','Klaueninsel','Sturmklaue','Talgarth']);
    assert.equal(record.houseProfile.rankId,'commoner');
    await access(new URL('../'+record.family.document.emblem,import.meta.url));
  }
});

test('Die vorgegebenen Eltern und Großonkelverbindungen sind ausdrücklich umgesetzt', () => {
  const parents = (surname,id) => family(surname).parentages.find(edge => edge.childId === id).parentIds;
  assert.deepEqual(parents('Beryn','gwaeden-beryn'), ['brychan-beryn','seren-brychan-spouse']);
  assert.deepEqual(parents('Beryn','ifor-beryn'), ['rhodri-beryn','angharad-rhodri-spouse']);
  assert.deepEqual(parents('Beryn','eirlys-beryn'), ['owain-beryn','mared-owain-spouse']);
  assert.deepEqual(parents('Morgwynt','mabli-morgwynt'),parents('Morgwynt','cadyn-morgwynt'));
  assert.ok(parents('Morgwynt','mabli-morgwynt').includes('cadell-morgwynt'));
  assert.ok(parents('Hirschhorn','sigrid-hirschhorn').includes('halvard-hirschhorn'));
  assert.deepEqual(parents('Mathgraig','nest-mathgraig'), parents('Mathgraig','gereint-mathgraig'));
  assert.deepEqual(parents('Penry','rhun-penry'),parents('Penry','iorwerth-penry'));
  assert.ok(parents('Penry',parents('Penry','meleri-penry')[0]).includes('rhun-penry'));
});

test('Alte Morgwynt- und Dyger-Akten werden ohne Phantomeltern oder neue Identität genau einmal ergänzt', () => {
  const registered = family('Morgwynt');
  const old = structuredClone(registered);
  old.extensions = {sourceRevision:4};
  old.persons = old.persons.filter(p=>['mabli-morgwynt','cadyn-morgwynt'].includes(p.id));
  old.persons.push({ id:'unknown-parent-mabli-cadyn-morgwynt', name:'Unbekanntes Elternteil', extensions:{structuralPlaceholder:true} });
  old.parentages = old.parentages.filter(edge=>['mabli-morgwynt','cadyn-morgwynt'].includes(edge.childId));
  old.parentages.forEach(edge=>{edge.parentIds=['unknown-parent-mabli-cadyn-morgwynt'];edge.partnershipId='';});
  old.partnerships=[];
  old.persons[0].notes='Eigene Reisenotiz';
  const upgraded=resolveRegisteredFamilyUpgrade(registered,old);
  assert.equal(upgraded.persons.some(p=>p.id==='unknown-parent-mabli-cadyn-morgwynt'),false);
  assert.equal(upgraded.persons[0].notes,'Eigene Reisenotiz');
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,upgraded),upgraded);
  const dyger=family('Dyger');
  const stale=structuredClone(dyger);
  stale.extensions={sourceRevision:2};
  const father=stale.persons.find(p=>p.id==='tudur-dyger');father.name='Tudur Dyger';father.birth='';
  const updated=resolveRegisteredFamilyUpgrade(dyger,stale);
  assert.equal(updated.persons.find(p=>p.id===father.id).name,'Caedmon Dyger');
  assert.equal(updated.persons.find(p=>p.id===father.id).worldPersonId,father.worldPersonId);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(dyger,updated),updated);
});

test('Die drei neuen älteren Offiziere besitzen die bestätigten Verwandten und Porträts', async () => {
  for (const [surname,id,age,child] of [['Morgwynt','edern-morgwynt',57,'helban-morgwynt'],['Mathgraig','seithen-mathgraig',48,'uwchric-mathgraig'],['Morglan','huw-morglan',50,'saithar-morglan']]) {
    const p=person(surname,id);
    assert.equal(1740-Number(p.birth),age);
    assert.ok(age>=45);
    assert.ok(createFamilyGraph(family(surname)).describeConnection(id,child));
    await access(new URL('../'+p.portrait,import.meta.url));
  }
});
