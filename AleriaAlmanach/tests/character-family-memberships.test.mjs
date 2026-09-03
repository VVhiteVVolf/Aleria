import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCharacterFamilyMembershipIndex,
  getCharacterFamilyMemberships
} from '../modules/character-genealogy/family-membership-index.js';
import { listGenealogyFamilies } from '../modules/character-genealogy/genealogy-source-repository.js';

test('married characters resolve to every family tree without duplicating their identity', () => {
  const families = listGenealogyFamilies().filter(record =>
    record.id === 'haus-draenmelyn' || record.id === 'haus-swyll'
  );
  const index = createCharacterFamilyMembershipIndex(families);

  const rhiannon = getCharacterFamilyMemberships({
    id: 'rhiannon-profile',
    identity: { worldPersonId: 'person--haus-draenmelyn--rhiannon-draenmelyn' }
  }, index);
  const iestyn = getCharacterFamilyMemberships({
    id: 'iestyn-profile',
    identity: { worldPersonId: 'person--haus-swyll--iestyn-swyll' }
  }, index);

  assert.deepEqual(rhiannon.map(item => item.familyId), ['haus-draenmelyn', 'haus-swyll']);
  assert.deepEqual(iestyn.map(item => item.familyId), ['haus-draenmelyn', 'haus-swyll']);
  assert.ok(rhiannon.every(item => item.emblem.startsWith('../Stammbäume/assets/images/houses/')));
  assert.equal(new Set(rhiannon.map(item => item.familyId)).size, 2);
});

test('stored genealogy sources remain a fallback for cloud-only family trees', () => {
  const index = createCharacterFamilyMembershipIndex([]);
  const memberships = getCharacterFamilyMemberships({
    genealogy: {
      sources: [{ familyId: 'haus-cloud', personId: 'cloud-person' }]
    }
  }, index);

  assert.deepEqual(memberships.map(item => ({ familyId: item.familyId, personId: item.personId })), [
    { familyId: 'haus-cloud', personId: 'cloud-person' }
  ]);
});
