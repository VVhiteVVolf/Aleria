import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = path => readFileSync(new URL('../modules/' + path, import.meta.url), 'utf8');

function reader() {
  const context = vm.createContext({ console, localStorage: { getItem: () => '500', setItem() {} },
    document: { addEventListener() {}, querySelector: () => null }, setTimeout: () => 1, clearTimeout() {},
    escapeHtml: value => String(value), getCurrentCommentThread: () => null, getCurrentCommentThreadId: () => 'scene' });
  context.window = context;
  for (const path of ['scene-regeneration/scene-regeneration-policy.js', 'comments/comments-thread.js',
    'session/scene-read-state.js', 'comments/comments-pagination.js']) vm.runInContext(source(path), context);
  return context;
}

test('a long megapage computes unread activity in linear work while retaining every contribution', () => {
  const context = reader(), comments = Array.from({ length: 1000 }, (_, index) => ({ id: 'post-' + index, orderKey: index + 1, text: 'Post ' + index }));
  let activityReads = 0, rendered;
  const activity = context.getCommentActivityMs;
  context.getCommentActivityMs = (...args) => { activityReads++; return activity(...args); };
  context.AleriaCommentPageBundles = { count: () => 1, getBundle: () => null,
    getGroups: (_id, rows) => [{ type: 'bundle', id: 'mega', label: 'Entire scene', items: rows.map((comment, index) => ({ comment, index })) }] };
  for (const name of ['updateSceneClockTimeline', 'syncCommentJumpTools', 'applyCommentToolsVisibility', 'observeCommentEntriesForAnimation']) context[name] = () => {};
  context.renderCommentBubble = comment => comment.text;
  context.renderCommentInsertControl = () => '';
  context.patchCommentScroll = (_scroll, _top, units) => { rendered = units; };
  context.renderCommentsToScroll({ dataset: { commentThreadId: 'scene' } }, comments);
  assert.equal(rendered.length, 1000);
  assert.equal(rendered[500].key, 'post-500');
  assert.match(rendered[500].html, /500 neue Beiträge/);
  assert.equal(rendered.filter(row => row.html.includes('data-scene-unread-divider')).length, 1);
  assert(activityReads <= comments.length * 4, `Repeated history scans: ${activityReads}`);
  assert.equal(comments[500].text, 'Post 500');
});

test('unread summaries immediately reflect edits, deletion, ordering, thread changes and hidden mechanics', () => {
  const context = reader();
  const rows = [{ id: 'old', orderKey: 10 }, { id: 'new', orderKey: 600 }];
  assert.equal(context.getSceneFirstUnreadCommentId('a', rows), 'new');
  rows[0].activityAtClient = 900;
  assert.equal(context.getSceneUnreadSummary('a', rows).firstUnreadId, 'old');
  assert.equal(context.getSceneUnreadSummary('a', rows).count, 2);
  rows.splice(0, 1);
  assert.equal(context.getSceneUnreadSummary('a', rows).count, 1);
  rows.push({ id: 'reset', orderKey: 1000, commentKind: 'scene-regeneration-event', serverValidatedMechanics: true, sceneRegeneration: { participants: [] } });
  assert.equal(context.getSceneUnreadSummary('a', rows).count, 1);
  assert.equal(context.getSceneUnreadSummary('other', [{ id: 'other-post', orderKey: 700 }]).firstUnreadId, 'other-post');
  vm.runInContext("_sceneReadBaselines.set('first-visit', 0)", context);
  assert.equal(context.getSceneUnreadSummary('first-visit', rows).count, 0);
  context.getCommentActivityMs = () => NaN;
  assert.equal(context.getSceneUnreadSummary('a', rows).count, 0);
});

test('each pagination window resolves boundaries once and still responds to changed page size', () => {
  const context = reader(), comments = Array.from({ length: 160 }, (_, index) => ({ id: String(index) }));
  let partitions = 0, pageSize = 75;
  context.AleriaCommentPageBundles = { pageSize: () => pageSize, count: () => 0, getGroups: (_id, rows) => {
    partitions++; return [{ type: 'comments', items: rows.map((comment, index) => ({ comment, index })) }];
  } };
  context.setCommentCurrentPage('scene', 2);
  let info = context.getCommentPaginationWindow(comments, 'scene');
  assert.equal(partitions, 1); assert.equal(info.pageCount, 3); assert.equal(info.comments[0].id, '75');
  pageSize = 20;
  info = context.getCommentPaginationWindow(comments, 'scene');
  assert.equal(partitions, 2); assert.equal(info.pageCount, 8); assert.equal(info.comments[0].id, '20');
  context.setCommentCurrentPage('scene', 1000);
  assert.equal(context.getCommentPaginationWindow([], 'scene').currentPage, 1);
});

function actors() {
  let creatureProjections = 0;
  const context = vm.createContext({ console, structuredClone, URL,
    _characters: [{ id: 'one', name: 'First', portrait: 'old' }, { id: 'two', name: 'Second' }],
    _hiddenBuiltinCharacterIds: new Set(), BUILTIN_COMMENT_CHARACTERS: {},
    normalizeSearchText: value => String(value || '').toLowerCase().trim(), getValidSections: () => [],
    getCurrentCommentCastIds: () => ['two', 'one'], getCharacterStatusValue: value => value, getCharacterRelevanceValue: value => value,
    document: { addEventListener() {} } });
  context.window = context;
  context.AleriaCreatures = { getSceneActors: () => { creatureProjections++; return [{ id: 'owl', name: 'Owl', entityType: 'creature' }, { id: 'one', name: 'Colliding creature' }]; } };
  for (const path of ['image-library/image-library-model.js', 'characters/character-image-sets.js', 'characters/character-data.js']) vm.runInContext(source(path), context);
  return { context, projections: () => creatureProjections };
}

test('human actor lookup preserves cast priority and character precedence without projecting the creature catalog', () => {
  const { context, projections } = actors();
  assert.equal(context.getAvailableCommentCharacterById('one').name, 'First');
  assert.equal(projections(), 0);
  assert.equal(context.getAvailableCommentCharacterById('two').name, 'Second');
  assert.equal(projections(), 0);
  assert.deepEqual(Array.from(context.getAvailableCommentCharacters(), actor => actor.id), ['two', 'one', 'owl']);
  assert.equal(projections(), 1);
  assert.equal(context.getAvailableCommentCharacterById('owl').entityType, 'creature');
  assert.equal(context.getAvailableCommentCharacterById('unknown'), null);
});

test('actor lookup has no stale cross-render cache after character updates or archival', () => {
  const { context } = actors();
  assert.equal(context.getAvailableCommentCharacterById('one').portrait, 'old');
  vm.runInContext("_characters[0] = { ..._characters[0], portrait: 'new' }", context);
  assert.equal(context.getAvailableCommentCharacterById('one').portrait, 'new');
  vm.runInContext("_characters[0] = { ..._characters[0], archived: true }", context);
  context.AleriaCreatures = { getSceneActors: () => [] };
  assert.equal(context.getAvailableCommentCharacterById('one'), null);
});
