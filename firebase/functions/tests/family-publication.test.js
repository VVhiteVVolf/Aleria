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
      document: {
        id: 'haus-test',
        title: 'Haus Test',
        emblem: 'https://i.imgur.com/test.png',
        houseProfile: {
          rankId: 'barony',
          seat: 'Rhosmere',
          barony: 'Artus Streben',
          county: 'Celtigerns Wacht',
          kingdom: 'Cenyr'
        }
      },
      lineage: {},
      presentation: {},
      view: {},
      extensions: { private: true }
    },
    collections: {
      persons: [
        {
          id: 'a',
          name: 'A',
          portrait: 'https://i.imgur.com/a.png',
          notes: 'privat',
          extensions: {
            secret: true,
            biographyModule: {
              schema: 'aleria.biography-module',
              schemaVersion: 1,
              stats: [['Haus', 'Haus Test']],
              quote: 'Öffentliches Zitat',
              biography: {
                portraitStages: [
                  'https://i.imgur.com/a-young.png',
                  'http://unsicher.test/a-middle.png',
                  '',
                  'https://i.imgur.com/a-old.png'
                ],
                biographyText: 'Öffentliche Lebensgeschichte',
                connections: [{ name: 'B', detail: 'Schwester', image: 'http://unsicher.test/b.png' }]
              }
            }
          }
        },
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

test('akzeptiert einen Zeitsprung direkt nach einer einzelnen Person', () => {
  const draft = workspace();
  draft.collections.timeJumps = [{
    id: 'gap-after-a',
    parentPartnershipId: '',
    parentPersonId: 'a',
    childIds: ['c']
  }];
  assert.equal(validateWorkspaceForPublishing(draft).valid, true);

  draft.collections.timeJumps[0].parentPersonId = '';
  assert.equal(validateWorkspaceForPublishing(draft).valid, false);
});

test('entfernt private Daten, veröffentlicht aber das Biographie-Modul', () => {
  const published = createPublicFamily(workspace());
  assert.equal(published.collections.partnerships.length, 1);
  assert.equal(Object.hasOwn(published.collections.persons[0], 'notes'), false);
  assert.deepEqual(published.root.extensions, {});
  assert.equal(published.root.document.houseProfile.seat, 'Rhosmere');
  assert.equal(Object.hasOwn(published.collections.persons[0].extensions, 'secret'), false);
  assert.equal(
    published.collections.persons[0].extensions.biographyModule.biography.biographyText,
    'Öffentliche Lebensgeschichte'
  );
  assert.deepEqual(published.collections.persons[0].extensions.biographyModule.stats, [['Haus', 'Haus Test']]);
  assert.deepEqual(
    published.collections.persons[0].extensions.biographyModule.biography.portraitStages,
    ['https://i.imgur.com/a-young.png', '', '', 'https://i.imgur.com/a-old.png']
  );
  assert.equal(published.collections.persons[0].extensions.biographyModule.biography.connections[0].image, '');
});
