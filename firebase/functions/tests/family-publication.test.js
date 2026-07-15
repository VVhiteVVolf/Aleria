import assert from 'node:assert/strict';
import test from 'node:test';
import { createPublicFamily } from '../src/families/family-publication.js';
import { validateWorkspaceForPublishing } from '../src/families/family-validation.js';

function workspace() {
  return {
    root: {
      schema: 'aleria.family-tree',
      schemaVersion: 1,
      familyId: 'haus-test',
      document: { id: 'haus-test', title: 'Haus Test', emblem: 'https://i.imgur.com/test.png' },
      lineage: {},
      presentation: {},
      view: {},
      extensions: { private: true }
    },
    collections: {
      persons: [
        { id: 'a', name: 'A', portrait: 'https://i.imgur.com/a.png', notes: 'privat', extensions: { secret: true } },
        { id: 'b', name: 'B', portrait: '', notes: '', extensions: {} },
        { id: 'c', name: 'C', portrait: '', notes: '', extensions: {} }
      ],
      partnerships: [
        { id: 'p', participantIds: ['a', 'b'], visibility: 'public', notes: 'privat', extensions: {} },
        { id: 'secret', participantIds: ['a', 'c'], visibility: 'secret', notes: '', extensions: {} }
      ],
      parentages: [
        { id: 'r', childId: 'c', parentIds: ['a', 'b'], partnershipId: 'p', visibility: 'public', notes: '', extensions: {} }
      ],
      houses: [{ id: 'h', name: 'Haus Test', emblem: '' }],
      cadetBranches: [],
      timeJumps: []
    }
  };
}

test('validiert eine konsistente Familienakte', () => {
  assert.equal(validateWorkspaceForPublishing(workspace()).valid, true);
});

test('entfernt private Notizen, Extensions und geheime Beziehungen', () => {
  const published = createPublicFamily(workspace());
  assert.equal(published.collections.partnerships.length, 1);
  assert.equal(Object.hasOwn(published.collections.persons[0], 'notes'), false);
  assert.deepEqual(published.root.extensions, {});
});
