import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const moduleSource = relative => fs.readFileSync(new URL(`../modules/${relative}`, import.meta.url), 'utf8');
const policy = moduleSource('scene-regeneration/scene-regeneration-policy.js');
const regeneration = { id: 'reset', entryId: 'scene', orderKey: 200,
  commentKind: 'scene-regeneration-event', serverValidatedMechanics: true,
  sceneRegeneration: { participants: [{ actorId: 'gawain', after: { current: 50 } }] } };

function createContext(extra = {}) {
  const context = vm.createContext({ console, ...extra });
  context.window = context;
  vm.runInContext(policy, context);
  return context;
}

test('regeneration leaves unread counts and browser read markers at the latest visible contribution', () => {
  const writes = [];
  const context = createContext({
    localStorage: { getItem: () => '50', setItem: (...args) => writes.push(args) },
    setTimeout: callback => { callback(); return 1; }, clearTimeout() {},
    getCommentActivityMs: comment => comment.orderKey
  });
  vm.runInContext(moduleSource('session/scene-read-state.js'), context);
  const visible = { id: 'speech', orderKey: 100 };
  const comments = [visible, regeneration];
  assert.equal(context.getSceneFirstUnreadCommentId('scene', [regeneration]), '');
  assert.match(context.renderSceneUnreadDivider('scene', visible, comments), /1 neuer Beitrag/);
  context.scheduleSceneReadStateUpdate('scene', comments);
  assert.deepEqual(writes, [['aleria-scene-read-v1:scene', '100']]);
  context.scheduleSceneReadStateUpdate('empty', [regeneration]);
  assert.equal(writes.length, 1);
});

test('regeneration cannot add a comment page or displace a visible page boundary', () => {
  const context = createContext();
  vm.runInContext(moduleSource('comments/comments-pagination.js'), context);
  const comments = Array.from({ length: 75 }, (_, index) => ({ id: `speech-${index}` }));
  const source = [regeneration, ...comments];
  const page = context.getCommentPaginationWindow(source, 'scene');
  assert.equal(page.totalCount, 75);
  assert.equal(page.pageCount, 1);
  assert.deepEqual(Array.from(page.comments, comment => comment.id), comments.map(comment => comment.id));
  assert.equal(source.length, 76);
});

test('sidebar and dashboard ignore regeneration while retaining visible activity', () => {
  const context = createContext({ document: { addEventListener() {}, querySelector: () => null } });
  vm.runInContext(moduleSource('sidebar/sidebar-feed.js'), context);
  vm.runInContext(moduleSource('dashboard/dashboard-scene-activity.js'), context);
  const visible = { id: 'speech', entryId: 'scene::session:0', orderKey: 100, activityAtClient: 100, charName: 'Gawain', text: 'Weiter.' };
  const hidden = { ...regeneration, entryId: visible.entryId, activityAtClient: 200 };
  assert.deepEqual(Array.from(context.sortSidebarFeedComments([visible, hidden]), comment => comment.id), ['speech']);
  const sections = [{ entries: [{ id: 'scene', pages: [{ sessionPage: true }] }] }];
  const activity = context.buildAlmanachDashboardSceneActivity(sections, [visible, hidden]);
  assert.equal(activity.get('scene').commentCount, 1);
  assert.equal(activity.get('scene').activityAt, 100);
  assert.equal(activity.get('scene').authorName, 'Gawain');
});

test('thread rendering retains the complete mechanical history while displaying visible contributions only', () => {
  const captured = {};
  const noop = () => {};
  const context = createContext({
    document: { querySelector: () => null, addEventListener: (name, listener) => { (captured.events ||= {})[name] = listener; } },
    AleriaSkillChecks: { setRenderContext: comments => { captured.skills = comments; } },
    AleriaHerausforderung: { setRenderContext: comments => { captured.challenge = comments; } },
    AleriaCombatEncounter: { renderActivePanel: (_scroll, _threadId, comments) => { captured.encounter = comments; } },
    renderCommentBubble: comment => `<p>${comment.id}</p>`,
    updateSceneClockTimeline: noop, applyCommentToolsVisibility: noop, refreshSessionStatusFromComments: noop
  });
  vm.runInContext(moduleSource('comments/comments-pagination.js'), context);
  vm.runInContext(moduleSource('comments/comments-thread.js'), context);
  assert.equal(typeof captured.events['aleria:comment-backend-reconnect'], 'function');
  context.patchCommentScroll = (_scroll, _top, units) => { captured.units = units; };
  context.renderCommentInsertControl = () => '';
  context.syncCommentJumpTools = (_scroll, comments) => { captured.jump = comments; };
  context.observeCommentEntriesForAnimation = noop;
  const comments = [{ id: 'speech', orderKey: 100 }, regeneration];
  context.renderCommentsToScroll({ dataset: { commentThreadId: 'scene' } }, comments);
  assert.deepEqual(Array.from(captured.units, unit => unit.key), ['speech']);
  assert.deepEqual(Array.from(captured.jump, comment => comment.id), ['speech']);
  for (const key of ['skills', 'challenge', 'encounter']) {
    assert.deepEqual(Array.from(captured[key], comment => comment.id), ['speech', 'reset']);
  }
});
