import assert from 'node:assert/strict';
import test from 'node:test';
import {
  deduplicateGenealogyCandidates,
  filterGenealogyCandidates,
  getGenealogyCandidateKey
} from '../modules/character-genealogy/genealogy-import-catalog.js';

function candidate(overrides = {}) {
  return {
    familyId: 'haus-a',
    familyTitle: 'Haus A',
    folderPath: ['Cenyr', 'Gwynthor'],
    personId: 'person-a',
    worldPersonId: 'world-person-a',
    displayName: 'Arianwen A',
    houseName: 'Haus A',
    status: 'alive',
    familyRole: 'core',
    ...overrides
  };
}

test('global family search merges the same world person and prefers the core record', () => {
  const records = deduplicateGenealogyCandidates([
    candidate({ familyId: 'haus-b', familyTitle: 'Haus B', familyRole: 'married' }),
    candidate({ familyId: 'haus-a', familyTitle: 'Haus A', familyRole: 'core' })
  ]);

  assert.equal(records.length, 1);
  assert.equal(records[0].familyId, 'haus-a');
  assert.deepEqual(records[0].membershipTitles, ['Haus A', 'Haus B']);
  assert.equal(getGenealogyCandidateKey(records[0]), 'haus-a::person-a');
});

test('import filters combine search, life status and link state', () => {
  const records = [
    candidate(),
    candidate({ personId: 'dead', worldPersonId: 'dead', displayName: 'Bryn', status: 'dead' }),
    candidate({ personId: 'linked', worldPersonId: 'linked', displayName: 'Carys' })
  ];
  const resolveMatch = item => item.personId === 'linked' ? { kind: 'linked' } : null;

  assert.deepEqual(
    filterGenealogyCandidates(records, { matchFilter: 'available' }, resolveMatch).map(item => item.personId),
    ['person-a']
  );
  assert.deepEqual(
    filterGenealogyCandidates(records, { matchFilter: 'available', showDead: true }, resolveMatch).map(item => item.personId),
    ['person-a', 'dead']
  );
  assert.deepEqual(
    filterGenealogyCandidates(records, { matchFilter: 'linked', search: 'carys' }, resolveMatch).map(item => item.personId),
    ['linked']
  );
});
