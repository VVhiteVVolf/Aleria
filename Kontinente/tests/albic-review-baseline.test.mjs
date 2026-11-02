import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import review from './support/gwynthor-troetzli-family-review-20261031.json' with { type: 'json' };
import { protectedAlbicFamilies, reviewHash } from './support/albic-review-baseline.mjs';
import gawainReview from './support/gawain-public-person-review-20261101.json' with { type: 'json' };

const penrudd = () => structuredClone(FAMILY_REGISTRY.find(record => record.id === 'haus-penrudd'));

test('approved Penrudd location revision metadata preserves the original historical family proof', () => {
  const current = penrudd(), before = structuredClone(current);
  assert.equal(review.families[current.id].afterSha256,
    '1beec2ef9fcc835f4e410a3c74ff1ea9ac7a0777a657e5db8301b22d6a9f2b2d');
  const projected = protectedAlbicFamilies([current]);
  assert.equal(reviewHash(projected[0]), reviewHash(review.families[current.id].before));
  assert.deepEqual(current, before, 'The audit never mutates the current source family');
});

test('the location approval rejects changed versions and unrelated managed fields', () => {
  for (const mutate of [
    record => { record.family.extensions.registryManagedHouseProfileFieldRevisions.seat += 1; },
    record => { record.family.extensions.registryManagedHouseProfileFieldRevisions.liegeHouseId = 7; },
  ]) {
    const record = penrudd();
    mutate(record);
    assert.throws(() => protectedAlbicFamilies([record]), /approved-location-revisions/);
  }
});

test('Penrudd people, portraits and family relationships remain fully protected', () => {
  for (const mutate of [
    record => { record.family.persons[0].notes += ' Unapproved biography'; },
    record => { record.family.persons[0].portrait = 'unapproved.png'; },
    record => { record.family.parentages[0].childId = 'unapproved-child'; },
    record => { record.family.partnerships[0].participantIds.reverse(); },
  ]) {
    const record = penrudd();
    mutate(record);
    assert.throws(() => protectedAlbicFamilies([record]), /approved-gwynthor-family/);
  }
});

test('the Gawain public biography approval projects only exact person metadata', () => {
  const current = structuredClone(FAMILY_REGISTRY.find(record => record.id === 'haus-draig'));
  const originalPerson = current.family.persons.find(person => person.id === 'gawain-draig');
  const projectedPerson = protectedAlbicFamilies([current])[0].family.persons.find(person => person.id === originalPerson.id);
  assert.deepEqual(projectedPerson, { ...originalPerson, ...gawainReview.families[current.id][originalPerson.id].before });
  for (const mutate of [
    person => { person.notes += ' Unapproved biography'; },
    person => { person.extensions.biographyModule.quote = 'Unapproved quote'; },
    person => { person.extensions.registryManagedFieldRevisions.title += 1; },
  ]) {
    const record = structuredClone(current);
    mutate(record.family.persons.find(person => person.id === originalPerson.id));
    assert.throws(() => protectedAlbicFamilies([record]), /haus-draig\/gawain-draig/);
  }
});

test('new age, trait-card and office proofs reject changes outside the exact reviewed leaves', () => {
  for (const [id, mutate] of [
    ['haus-gwyllach', record => { record.family.persons.find(person => person.id === 'saerwyn-gwyllach').birth = '1710'; }],
    ['haus-draig', record => { record.family.persons.find(person => person.id === 'gawain-draig').extensions.biographyModule.biography.abilities[0].title = 'Ungeprüft'; }],
    ['haus-gafyr', record => { record.family.persons.find(person => person.id === 'lefraye-gafyr').sex = 'male'; }],
    ['haus-draig', record => { record.family.persons.find(person => person.id === 'brona-eisenherz').title = 'Ungeprüftes Amt'; }]
  ]) {
    const record = structuredClone(FAMILY_REGISTRY.find(record => record.id === id));
    mutate(record); assert.throws(() => protectedAlbicFamilies([record]), /approved-age|trait-cards|approved-metadata/);
  }
});
