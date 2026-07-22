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

test('weist parallele Zeitsprünge am selben Ausgangspunkt zurück', () => {
  const draft = workspace();
  draft.collections.timeJumps = ['first', 'second'].map(id => ({
    id,
    parentPartnershipId: 'p',
    parentPersonId: '',
    childIds: []
  }));

  const result = validateWorkspaceForPublishing(draft);
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.some(message => message.includes('parallel')));
});

test('weist überlappende Paar-/Einzelanker sowie einen Gründeranker neben dem Haus-Zeitsprung zurück', () => {
  const overlapping = workspace();
  overlapping.collections.timeJumps = [
    { id: 'pair-gap', parentPartnershipId: 'p', parentPersonId: '', childIds: [] },
    { id: 'person-gap', parentPartnershipId: '', parentPersonId: 'a', childIds: [] }
  ];
  let result = validateWorkspaceForPublishing(overlapping);
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.some(message => message.includes('überlappt')));

  const besideLineageGap = workspace();
  besideLineageGap.root.lineage = {
    founderPartnershipId: 'p',
    timeGap: { enabled: true }
  };
  besideLineageGap.collections.timeJumps = [
    { id: 'founder-person-gap', parentPartnershipId: '', parentPersonId: 'a', childIds: [] }
  ];
  result = validateWorkspaceForPublishing(besideLineageGap);
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.some(message => message.includes('bestehende Trenner')));
});

test('weist disjunkte Zeitsprünge derselben Generation zurück', () => {
  const draft = workspace();
  draft.collections.persons.push(
    { id: 'd', name: 'D', portrait: '', notes: '', extensions: {} },
    { id: 'e', name: 'E', portrait: '', notes: '', extensions: {} }
  );
  draft.collections.partnerships.push({
    id: 'q', participantIds: ['d', 'e'], visibility: 'public', notes: '', extensions: {}
  });
  draft.collections.timeJumps = [
    { id: 'gap-p', parentPartnershipId: 'p', parentPersonId: '', childIds: [] },
    { id: 'gap-q', parentPartnershipId: 'q', parentPersonId: '', childIds: [] }
  ];

  let result = validateWorkspaceForPublishing(draft);
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.some(message => message.includes('Pro Generation')));

  draft.collections.timeJumps.reverse();
  result = validateWorkspaceForPublishing(draft);
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.some(message => message.includes('Pro Generation')));
});

test('behandelt den Haus-Zeitsprung auch gegenüber einer disjunkten Wurzel als globalen Trenner', () => {
  const draft = workspace();
  draft.root.lineage = { founderPartnershipId: 'p', timeGap: { enabled: true } };
  draft.collections.persons.push({ id: 'd', name: 'D', portrait: '', notes: '', extensions: {} });
  draft.collections.timeJumps = [
    { id: 'gap-root', parentPartnershipId: '', parentPersonId: 'd', childIds: [] }
  ];

  const result = validateWorkspaceForPublishing(draft);
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.some(message => message.includes('Pro Generation')));
});

test('erlaubt Zeitsprünge an unterschiedlichen Generationen', () => {
  const draft = workspace();
  draft.collections.partnerships = draft.collections.partnerships.filter(partnership => partnership.id !== 'secret');
  draft.collections.timeJumps = [
    { id: 'gap-root', parentPartnershipId: 'p', parentPersonId: '', childIds: [] },
    { id: 'gap-child', parentPartnershipId: '', parentPersonId: 'c', childIds: [] }
  ];

  assert.equal(validateWorkspaceForPublishing(draft).valid, true);
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
