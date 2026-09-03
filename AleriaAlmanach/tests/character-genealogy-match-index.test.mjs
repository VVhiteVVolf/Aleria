import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCharacterMatchResolver,
  findBestCharacterMatch
} from '../modules/character-genealogy/person-identity.js';

const characters = [
  {
    id: 'rhiannon',
    name: 'Rhiannon Draenmelyn',
    aliases: ['Rhiannon Swyll'],
    identity: { worldPersonId: 'person--draenmelyn--rhiannon' },
    genealogy: {
      worldPersonId: 'person--draenmelyn--rhiannon',
      birth: '1702',
      sources: [{ familyId: 'haus-draenmelyn', personId: 'rhiannon-draenmelyn' }]
    }
  },
  {
    id: 'iestyn',
    name: 'Iestyn Swyll',
    genealogy: { birth: '1699', sources: [] }
  }
];

test('indexed character matcher preserves the established match decisions', () => {
  const resolveMatch = createCharacterMatchResolver(characters);
  const candidates = [
    {
      displayName: 'Rhiannon Draenmelyn',
      worldPersonId: 'person--draenmelyn--rhiannon',
      familyId: 'haus-swyll',
      personId: 'rhiannon-draenmelyn',
      birth: '1702'
    },
    {
      displayName: 'Rhiannon Draenmelyn',
      worldPersonId: 'legacy-id',
      familyId: 'haus-draenmelyn',
      personId: 'rhiannon-draenmelyn',
      birth: '1702'
    },
    {
      displayName: 'Iestyn Swyll',
      worldPersonId: 'person--swyll--iestyn',
      familyId: 'haus-swyll',
      personId: 'iestyn-swyll',
      birth: '1699'
    },
    {
      displayName: 'Iestyn Swyll',
      worldPersonId: 'person--swyll--other-iestyn',
      familyId: 'haus-swyll',
      personId: 'other-iestyn',
      birth: '1701'
    }
  ];

  candidates.forEach(candidate => {
    const indexed = resolveMatch(candidate);
    const scanned = findBestCharacterMatch(candidate, characters);
    assert.equal(indexed?.kind, scanned?.kind);
    assert.equal(indexed?.characterId, scanned?.characterId);
  });
});

test('indexed matcher resolves aliases without scanning unrelated characters', () => {
  const resolveMatch = createCharacterMatchResolver(characters);
  const match = resolveMatch({
    displayName: 'Rhiannon Swyll',
    worldPersonId: 'legacy-swyll-id',
    familyId: 'haus-swyll',
    personId: 'rhiannon-swyll',
    birth: '1702'
  });

  assert.equal(match?.kind, 'conflict');
  assert.equal(match?.characterId, 'rhiannon');
});
