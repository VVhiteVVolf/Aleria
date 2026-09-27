import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';

const records = ['haus-coeddu', 'craigddu'].map(id => FAMILY_REGISTRY.find(record => record.id === id));
const [coeddu, craigddu] = records.map(record => assertValidFamily(record.family).family);

test('Coeddu bleibt klein: unbekannter Ursprung, Zeitsprung, drei Geschwister und ein Sohn', () => {
  assert.equal(coeddu.persons.length, 10);
  const jump = coeddu.timeJumps[0];
  assert.deepEqual(jump.childIds, ['brenric-coeddu']);
  const ancestry = coeddu.parentages.find(link => link.childId === 'brenric-coeddu');
  assert.equal(ancestry.type, 'claimed');
  assert.equal(ancestry.extensions.timeJumpId, jump.id);
  assert.equal(coeddu.persons.find(person => person.id === 'llywelyn-coeddu').birth, '1710');
  assert.equal(coeddu.parentages.filter(link => link.parentIds.includes('brenric-coeddu')).length, 4);
  const children = coeddu.parentages.filter(link => link.parentIds.includes('llywelyn-coeddu'));
  assert.equal(children.length, 1);
  assert.equal(children[0].childId, 'ellian-coeddu');
  assert.ok(children[0].parentIds.includes('catrin-craigddu'));
  assert.ok(coeddu.persons.every(person => !person.name.includes('??')));
});

test('Die Ehe verbindet beide Akten mit denselben Weltpersonen; Craigddu behält seine IDs', async () => {
  assertMirroredCrossFamilyBatch(records);
  const candidates = records.flatMap(createFamilyCandidates);
  for (const [name,id] of [['Llywelyn Coeddu','person--craigddu--person-d189ca4a'],['Catrin Craigddu','person--craigddu--person-bc7dd4e8']]) {
    const matches = candidates.filter(person => person.displayName === name);
    assert.equal(matches.length, 2);
    assert.deepEqual([...new Set(matches.map(person => person.worldPersonId))], [id]);
  }
  const before = JSON.parse(await readFile(new URL('../assets/data/published-families/backups/craigddu/r00000001-20260927T160517713Z.json',import.meta.url),'utf8')).family;
  for (const old of before.persons) {
    const current = craigddu.persons.find(person => person.id === old.id);
    assert.equal(current.worldPersonId, old.worldPersonId);
    if (old.birth !== '??') assert.equal(current.birth, old.birth);
    assert.equal(current.death, old.death);
  }
  assert.deepEqual(craigddu.extensions.registryTombstones, before.extensions.registryTombstones);
  for (const collection of ['partnerships', 'parentages']) {
    const identityFields = collection === 'partnerships' ? ['participantIds', 'type'] : ['childId', 'parentIds', 'partnershipId', 'type'];
    for (const old of before[collection]) {
      const current = craigddu[collection].find(entry => entry.id === old.id);
      assert.ok(current, old.id);
      for (const field of identityFields) assert.deepEqual(current[field], old[field]);
    }
  }
  assert.equal(craigddu.parentages.filter(link => link.parentIds.includes('person-28b0e0a3')).length, 7);
});

test('Craigddu beginnt mit unbekannten Gründern, Wappen und Zeitsprung zu drei Brüdern mit drei Vetternzweigen', () => {
  assert.deepEqual(auditFamilyChartLayoutPolicy(craigddu).issues, []);
  assert.equal(craigddu.persons.length, 29);
  const founders = craigddu.partnerships.find(entry => entry.id === craigddu.lineage.founderPartnershipId);
  assert.deepEqual(founders.participantIds.map(id => craigddu.persons.find(person => person.id === id).name), ['Unbekannter Gründer', 'Unbekannte Gründerin']);
  assert.ok(founders.participantIds.includes(craigddu.view.focusPersonId));
  assert.equal(craigddu.timeJumps.length, 1);
  const jump = craigddu.timeJumps[0];
  assert.equal(jump.parentPartnershipId, founders.id);
  assert.equal(jump.childIds.length, 3);
  assert.ok(jump.childIds.includes('craigddu-gruender'));
  for (const id of jump.childIds) {
    const ancestry = craigddu.parentages.find(link => link.childId === id);
    assert.equal(ancestry.type, 'claimed');
    assert.equal(ancestry.extensions.timeJumpId, jump.id);
  }
  const uncles = jump.childIds.filter(id => id !== 'craigddu-gruender');
  const cousins = craigddu.parentages.filter(link => link.parentIds.some(id => uncles.includes(id)));
  assert.equal(cousins.length, 3);
  assert.ok(uncles.every(id => cousins.some(link => link.parentIds.includes(id))));
  const children = cousins.flatMap(cousin => {
    assert.equal(craigddu.persons.find(person => person.id === cousin.childId).sex, 'male');
    const descendants = craigddu.parentages.filter(link => link.parentIds.includes(cousin.childId));
    assert.ok(descendants.length > 0);
    return descendants;
  });
  assert.equal(children.length, 4);
  for (const link of [...cousins, ...children]) {
    const child = craigddu.persons.find(person => person.id === link.childId);
    assert.equal(link.parentIds.length, 2);
    for (const id of link.parentIds) {
      const parent = craigddu.persons.find(person => person.id === id);
      assert.ok(Number(child.birth) - Number(parent.birth) >= 18);
    }
  }
});

test('Bestehende Familienakten erhalten neue Zweige und Hausbios, behalten aber Identitäten und eigene Texte', async () => {
  for (const [family, backup] of [
    [coeddu, 'haus-coeddu/r00000002-20260927T205700056Z.json'],
    [craigddu, 'craigddu/r00000003-20260927T205700056Z.json']
  ]) {
    const old = JSON.parse(await readFile(new URL('../assets/data/published-families/backups/' + backup, import.meta.url), 'utf8')).family;
    old.document.motto = 'Eigene Randnotiz';
    const upgraded = resolveRegisteredFamilyUpgrade(family, old);
    assert.deepEqual(assertValidFamily(upgraded).diagnostics, []);
    assert.equal(upgraded.persons.length, family.persons.length);
    assert.equal(upgraded.document.motto, 'Eigene Randnotiz');
    assert.equal(upgraded.lineage.founderPartnershipId, family.lineage.founderPartnershipId);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, family.extensions.houseBiographyModule);
    for (const prior of old.persons) {
      assert.equal(upgraded.persons.find(person => person.id === prior.id).worldPersonId, prior.worldPersonId);
    }
    if (family.document.id === 'craigddu') {
      assert.equal(upgraded.persons.find(person => person.id === 'craigddu-gruender').title, 'Vater von Hywel und Catrin');
      assert.equal(upgraded.view.focusPersonId, family.view.focusPersonId);
      assert.deepEqual(auditFamilyChartLayoutPolicy(upgraded).issues, []);
    }
    old.extensions.houseBiographyModule.description = 'Eigene Hausgeschichte';
    assert.equal(resolveRegisteredFamilyUpgrade(family, old).extensions.houseBiographyModule.description, 'Eigene Hausgeschichte');
    old.extensions.houseBiographyModule = null;
    assert.equal(resolveRegisteredFamilyUpgrade(family, old).extensions.houseBiographyModule, null);
  }
});

test('Beide Bürgerhäuser, ihre Portraits und CK2-Eigenschaften besitzen erreichbare Projektdateien', async () => {
  for (const record of records) {
    assert.deepEqual(record.folderPath, ['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor']);
    assert.equal(record.family.document.houseProfile.rankId, 'commoner');
    assert.equal(record.family.lineage.crestFrame, 'iron');
    await access(new URL('../' + record.family.document.emblem, import.meta.url));
    await access(new URL(record.family.extensions.houseBiographyModule.image, new URL('../', import.meta.url)));
    assert.match(record.family.extensions.houseBiographyModule.house.biographyText, /Haus Draig seit Generationen/);
    for (const person of record.family.persons.filter(person => person.portrait)) {
      await access(new URL('../' + person.portrait, import.meta.url));
    }
  }
  const bio = coeddu.persons.find(person => person.id === 'llywelyn-coeddu').extensions.biographyModule;
  for (const trait of bio.biography.abilities) {
    assert.match(trait.icon, /IconOrdner\/Traits%20Icon\//);
    await access(new URL(trait.icon, new URL('../../AleriaAlmanach/',import.meta.url)));
  }
  assert.match(bio.biography.historyText, /Brenric.*Großen Krieg.*Sir Maredudd/s);
  assert.match(bio.biography.biographyText, /pflichtbewusst, aber gemütlich/);
});
