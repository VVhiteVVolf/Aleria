import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HOUSE_PENRUDD_FAMILY as family } from '../assets/js/data/house-penrudd-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { PENRUDD_PEOPLE, PENRUDD_HOLDINGS } from '../../AleriaAlmanach/modules/rotes-tor/penrudd-household.mjs';

test('Penrudd has one serial founder → house → time jump → father → brothers lineage', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 28);
  assert.equal(new Set(family.persons.map(person => person.worldPersonId)).size, 28);
  assert.equal(family.timeJumps.length, 1);
  const [gap] = family.timeJumps;
  assert.equal(gap.parentPartnershipId, family.lineage.founderPartnershipId);
  assert.deepEqual(gap.childIds, ['madoc-penrudd']);
  const madoc = family.parentages.find(item => item.childId === 'madoc-penrudd');
  assert.equal(madoc.type, 'claimed');
  assert.equal(madoc.extensions.timeJumpId, gap.id);
  for (const id of ['gwilym-penrudd', 'tudur-penrudd']) {
    assert.deepEqual(family.parentages.find(item => item.childId === id).parentIds, ['madoc-penrudd', 'nest-penrudd']);
    assert.ok(!gap.childIds.includes(id));
  }
  assert.equal(family.lineage.crestFrame, 'iron');
});

test('married-in people have only given names and dates permit every marriage and birth', () => {
  const byId = new Map(family.persons.map(person => [person.id, person]));
  const spouses = PENRUDD_PEOPLE.filter(person => person.spouse);
  assert.equal(spouses.length, 7);
  for (const person of spouses) {
    assert.ok(!/\s/.test(person.name), person.name);
    assert.equal(byId.get(person.id).houseId, '');
    assert.equal(byId.get(person.id).familyRole, 'married');
  }
  for (const relation of family.parentages.filter(item => item.type === 'biological')) {
    const child = byId.get(relation.childId);
    for (const parentId of relation.parentIds) {
      const parent = byId.get(parentId);
      assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${parent.name} at ${child.name}'s birth`);
      assert.ok(!parent.death || Number(parent.death) >= Number(child.birth));
    }
  }
  for (const marriage of family.partnerships.filter(item => item.start)) {
    for (const id of marriage.participantIds) {
      assert.ok(Number(marriage.start) - Number(byId.get(id).birth) >= 18);
    }
  }
  assert.equal(byId.get('gwilym-penrudd').birth, '1670');
  assert.equal(byId.get('tudur-penrudd').birth, '1674');
  assert.equal(byId.get('rhys-penrudd').birth, '1738');
  assert.equal(PENRUDD_PEOPLE.filter(person => !person.death).length, 23);
});

test('the farm branch and inn are distinct households without replacing the existing Talgarth Penrys', () => {
  assert.equal(FAMILY_REGISTRY.filter(record => record.id === 'haus-penrudd').length, 1);
  assert.deepEqual(FAMILY_REGISTRY.find(record => record.id === 'haus-penrudd').folderPath,
    ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bannkreis Gwynthor']);
  const penry = FAMILY_REGISTRY.find(record => record.id === 'haus-penry');
  assert.equal(penry.family.document.houseProfile.seat, 'Talgarth');
  assert.ok(penry.family.persons.some(person => person.id === 'iorwerth-penry'));
  assert.ok(!penry.family.persons.some(person => person.name.includes('Penrudd')));
  assert.equal(PENRUDD_PEOPLE.filter(person => person.household === 'farm').length, 8);
  assert.equal(PENRUDD_PEOPLE.filter(person => person.household === 'inn').length, 14);
  assert.match(PENRUDD_HOLDINGS.farm.settlement, /getrennte Kassen/);
  assert.match(PENRUDD_HOLDINGS.farm.settlement, /echte Kosten/);
});

test('existing map pins retain their positions and link the free farm to the inn family', async () => {
  const map = JSON.parse(await readFile(new URL('../../Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json', import.meta.url), 'utf8'));
  const farm = map.state.pins.find(pin => pin.id === PENRUDD_HOLDINGS.farm.pinId);
  const inn = map.state.pins.find(pin => pin.id === PENRUDD_HOLDINGS.inn.pinId);
  assert.equal(map.state.pins.length, 170);
  assert.deepEqual([farm.x, farm.y], [0.526123046875, 0.18236190476190478]);
  assert.deepEqual([inn.x, inn.y], [0.4755859375, 0.382]);
  assert.equal(farm.title, 'Penrudd-Hof');
  assert.match(farm.text, /Tudur Penrudd/);
  assert.match(inn.text, /Carwyn Penrudd/);
  assert.ok(!/\bPenry\b/.test(inn.text));
  assert.equal(farm.crest, `/Stammbäume/${family.document.emblem}`);
  assert.ok(farm.table.every(row => row.v.trim()), 'all farm details are filled');
  assert.ok(!farm.text.includes('?'), 'authored map text retains its Unicode characters');
  assert.equal(farm.crestLink, inn.crestLink);
  assert.equal(map.state.pins.find(pin => pin.id === 'gwynthor-marking-058').house, 'Haus Gwerfil');
  assert.equal(map.state.pins.find(pin => pin.id === 'gwynthor-marking-071').house, 'Familie Afelwyn');
});

test('portrait and appearance revision preserves identities, genealogy, local dates and personal notes', () => {
  const prior = normalizeFamily(structuredClone(family));
  prior.extensions.sourceRevision = 1;
  prior.document.motto = 'Eigene Randnotiz';
  const carwyn = prior.persons.find(person => person.id === 'carwyn-penrudd');
  carwyn.birth = '1693';
  carwyn.portrait = '';
  carwyn.extensions.appearance = 'Braunes Haar und grüne Augen';
  carwyn.extensions.personalNote = 'Diese lokale Notiz erhalten';
  prior.partnerships.find(item => item.id === 'marriage-carwyn-olwen-penrudd').notes = 'Lokale Familienüberlieferung';
  const upgraded = resolveRegisteredFamilyUpgrade(family, prior);
  const current = upgraded.persons.find(person => person.id === carwyn.id);
  assert.equal(upgraded.extensions.sourceRevision, 5);
  assert.equal(upgraded.document.motto, prior.document.motto);
  assert.equal(current.worldPersonId, carwyn.worldPersonId);
  assert.equal(current.birth, '1693');
  assert.equal(current.extensions.personalNote, carwyn.extensions.personalNote);
  assert.equal(current.portrait, family.persons.find(person => person.id === carwyn.id).portrait);
  assert.match(current.extensions.appearance, /braune Augen/);
  assert.deepEqual(upgraded.parentages, prior.parentages);
  assert.deepEqual(upgraded.partnerships, prior.partnerships);
  assert.deepEqual(upgraded.timeJumps, prior.timeJumps);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(family, upgraded), upgraded);
});
