import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HOUSE_BRADRHITH_FAMILY as family } from '../assets/js/data/house-bradrhith-family.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';

test('Bradrhith has a valid serial founder, crest and time-jump structure', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 16);
  const marriage = family.partnerships.find(item => item.id === family.lineage.founderPartnershipId);
  assert.equal(marriage.participantIds.length, 2);
  assert.deepEqual(family.persons.filter(person => marriage.participantIds.includes(person.id)).map(person => person.name), ['???', '???']);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].parentPartnershipId, marriage.id);
  assert.deepEqual(family.timeJumps[0].childIds, ['ceredig-bradrhith']);
  const origin = family.parentages.find(item => item.childId === 'ceredig-bradrhith');
  assert.equal(origin.type, 'claimed');
  assert.equal(origin.extensions.timeJumpId, family.timeJumps[0].id);
  assert.equal(family.lineage.crestFrame, 'iron');
});

test('Bradrhith dates agree with the requested ages, adulthood and living survivors', () => {
  const byId = new Map(family.persons.map(person => [person.id, person]));
  assert.equal(1740 - Number(byId.get('arianwen-bradrhith').birth), 40);
  assert.deepEqual(['arianwen-sohn-1', 'arianwen-sohn-2', 'arianwen-tochter'].map(id => 1740 - Number(byId.get(id).birth)), [19, 16, 14]);
  for (const relation of family.parentages.filter(item => item.type === 'biological')) {
    const child = byId.get(relation.childId);
    for (const parentId of relation.parentIds) {
      const parent = byId.get(parentId);
      assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${parent.name} at ${child.name}'s birth`);
      assert.ok(!parent.death || Number(parent.death) >= Number(child.birth));
    }
  }
  for (const id of ['llyr-dewrdd', 'gruffudd-gwregysdu', 'arianwen-bradrhith']) {
    assert.equal(byId.get(id).status, 'alive');
    assert.equal(byId.get(id).death, '');
  }
  assert.ok(byId.get('llyr-dewrdd').portrait.endsWith('llyr-dewrdd-corrected.png'));
  assert.ok(family.persons.filter(person => !person.id.includes('gruender')).every(person => person.birth && !person.name.startsWith('Unbenannt')));
});

test('nine new names exclude all first 400 candidates', async () => {
  const selection = JSON.parse(await readFile(new URL('../assets/data/family-sources/bradrhith-name-selection.json', import.meta.url), 'utf8'));
  assert.equal(new Set(selection.excludedNames).size, 400);
  assert.equal(selection.selectedNames.length, 9);
  for (const name of selection.selectedNames) {
    assert.ok(!selection.excludedNames.includes(name));
    assert.ok(family.persons.some(person => person.name.startsWith(`${name} `)));
  }
});

test('revision 1 upgrades names, dates, portrait and founder links while preserving identity and unrelated edits', async () => {
  const old = JSON.parse(await readFile(new URL('fixtures/bradrhith-revision-1.json', import.meta.url), 'utf8'));
  old.document.motto = 'Eine eigene Randnotiz';
  old.persons.find(person => person.id === 'arianwen-bradrhith').extensions.personalNote = 'Behalten';
  const upgraded = resolveRegisteredFamilyUpgrade(family, old);
  assert.equal(upgraded.extensions.sourceRevision, 2);
  assert.equal(upgraded.persons.length, 16);
  assert.equal(upgraded.document.motto, old.document.motto);
  for (const prior of old.persons) {
    const person = upgraded.persons.find(item => item.id === prior.id);
    const expected = family.persons.find(item => item.id === prior.id);
    assert.equal(person.worldPersonId, prior.worldPersonId);
    for (const field of ['name', 'birth', 'death', 'portrait']) assert.equal(person[field], expected[field]);
  }
  assert.equal(upgraded.persons.find(person => person.id === 'arianwen-bradrhith').extensions.personalNote, 'Behalten');
  assert.equal(upgraded.lineage.founderPartnershipId, family.lineage.founderPartnershipId);
  assert.equal(upgraded.view.focusPersonId, family.view.focusPersonId);
  assert.ok(upgraded.extensions.houseBiographyModule.house.extraSections.some(section => section.text.includes('Eiludd')));
  assert.deepEqual(assertValidFamily(upgraded).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(upgraded).issues, []);
});
