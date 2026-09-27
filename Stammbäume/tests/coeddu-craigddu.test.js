import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';

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
  assert.equal(craigddu.persons.length, before.persons.length);
  assert.equal(craigddu.parentages.filter(link => link.parentIds.includes('person-28b0e0a3')).length, 7);
});

test('Beide Bürgerhäuser, ihre Portraits und CK2-Eigenschaften besitzen erreichbare Projektdateien', async () => {
  for (const record of records) {
    assert.deepEqual(record.folderPath, ['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor']);
    assert.equal(record.family.document.houseProfile.rankId, 'commoner');
    assert.equal(record.family.lineage.crestFrame, 'iron');
    await access(new URL('../' + record.family.document.emblem, import.meta.url));
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
