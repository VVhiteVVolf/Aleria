import assert from 'node:assert/strict';
import test from 'node:test';
import { createArchiveRenderHarness } from './fixtures/archive-render-harness.mjs';

test('the real overview renders no hidden module cards or character/creature registers for a large archive', async () => {
  const app = await createArchiveRenderHarness();
  app.render();
  assert.equal(app.calls.cards, 0);
  assert.equal(app.calls.characters, 0);
  assert.equal(app.calls.creatures, 0);
  assert.equal(app.calls.dashboard, 1);
  assert.equal(app.calls.sceneActivity, 1);
  assert.equal(app.document.querySelectorAll('.entry-card').length, 0);
  assert.equal(app.document.getElementById('char-grid'), null);
  assert.equal(app.document.getElementById('creature-library-root'), null);
  assert.equal(app.counts().entries, 3600);
  assert.equal(app.document.querySelectorAll('.gallery-tab-btn').length, 120);
});

test('programmatic navigation lazily mounts the requested register and preserves an unrelated open draft', async () => {
  const app = await createArchiveRenderHarness();
  app.render();
  const draft = app.document.getElementById('draft-input'); draft.value = 'Unsaved scene text';
  app.activate('Charaktere');
  assert.equal(app.calls.characters, 1);
  assert.ok(app.document.getElementById('char-grid'));
  assert.equal(app.document.getElementById('creature-library-root'), null);
  app.activate('Kreaturen');
  assert.equal(app.calls.creatures, 1);
  assert.equal(app.document.getElementById('char-grid'), null);
  assert.ok(app.document.getElementById('creature-library-root'));
  app.activate('Alle');
  assert.equal(app.calls.characters, 1);
  assert.equal(app.calls.creatures, 1);
  assert.equal(app.calls.dashboard, 2);
  assert.equal(app.document.getElementById('draft-input'), draft);
  assert.equal(draft.value, 'Unsaved scene text');
});

test('a first programmatic section switch builds only that section and keeps all navigation entries', async () => {
  const app = await createArchiveRenderHarness();
  app.render(); app.activate('Tab73');
  assert.equal(app.calls.cards, 24);
  assert.deepEqual(app.calls.cardSections, ['Tab73']);
  assert.equal(app.calls.characters, 0); assert.equal(app.calls.creatures, 0);
  assert.equal(app.calls.dashboard, 1);
  assert.equal(app.document.querySelectorAll('.gallery-tab-btn').length, 120);
  assert.equal(app.document.querySelectorAll('.section-block.visible').length, 1);
});

test('explicit global search still finds modules across all tabs and activates searchable registers', async () => {
  const app = await createArchiveRenderHarness();
  app.records[5].entries[0].title = 'Rare matching token';
  app.records[108].entries[0].title = 'Rare matching token';
  app.render(); app.search('rare matching'); app.render();
  assert.equal(app.calls.cards, 2);
  assert.equal(app.calls.characters, 1); assert.equal(app.calls.creatures, 1);
  assert.equal(app.counts().entries, 2);
  assert.equal(app.document.querySelectorAll('.entry-card').length, 2);
  assert.ok(app.document.getElementById('char-grid')); assert.ok(app.document.getElementById('creature-library-root'));
  app.search(''); app.render();
  assert.equal(app.document.querySelectorAll('.entry-card').length, 0);
  assert.equal(app.calls.dashboard, 2);
});
