import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SKILL_DEFINITIONS } from '../modules/skill-checks/skill-definitions.js';
import { getActionIcon, getActionIcons, normalizeActionIconId } from '../modules/comment-actions/comment-action-icons.js';
import { renderActionIconPicker, renderActionIconBadge } from '../modules/comment-actions/comment-action-icons-ui.js';
import { normalizeHerausforderungEvent, collectHerausforderungApproaches } from '../modules/herausforderung/herausforderung-model.js';
import { collectHerausforderungProgress } from '../modules/herausforderung/herausforderung-progress.js';
import { getChallengeAttemptSettings, getChallengeReactionInsertAfterId, orderChallengeRepliesForDisplay } from '../modules/skill-checks/skill-challenge-attempt.js';

test('every existing skill and all four consumption actions have a delivered icon', () => {
  for (const id of [...SKILL_DEFINITIONS.map(skill => skill.id), 'eat', 'drink', 'take', 'use']) {
    assert.equal(normalizeActionIconId(id), id);
    assert(existsSync(new URL(`../public/assets/comment-icons/actions/${id}.png`, import.meta.url)), id);
  }
  assert.deepEqual(getActionIcons('consume').map(icon => icon.id), ['eat', 'drink', 'take', 'use']);
});

test('explicit choices override automatic check icons; untrusted image paths never become an icon', () => {
  const source = { kind: 'interact', skillId: 'animal-handling' };
  assert.equal(getActionIcon(source).id, 'animal-handling');
  assert.equal(getActionIcon({ ...source, actionIconId: 'perception' }).id, 'perception');
  assert.equal(getActionIcon({ ...source, actionIconId: 'javascript:alert(1)' }).id, 'animal-handling');
  assert.equal(getActionIcon({ kind: 'consume', actionIconId: 'investigation' }).id, 'use');
  assert.equal(getActionIcon({ kind: 'interact', skillResolution: { skillId: 'save:dexterity' } }).id, 'acrobatics');
  assert.match(renderActionIconBadge(source), /alt="Mit Tieren umgehen"/);
  assert.match(renderActionIconPicker({ kind: 'consume', actionIconId: 'drink' }), /data-comment-action-icon="drink" aria-pressed="true"/);
});

test('the authored challenge icon survives JSON round trips and reaches the attempt composer', () => {
  const event = normalizeHerausforderungEvent({ title: 'Ein ruhiges Tier', publicDescription: 'Das Tier ist nervös.',
    approaches: [{ approachId: 'calm', preferredSkills: ['animal-handling'], difficulty: 12, insight: 'Das Tier beruhigt sich.', actionIconId: 'perception' }] });
  const restored = normalizeHerausforderungEvent(JSON.parse(JSON.stringify(event)));
  const [target] = collectHerausforderungApproaches([{ id: 'challenge', herausforderung: restored }]);
  const settings = getChallengeAttemptSettings(target, 'animal-handling');
  assert.equal(settings.actionIconId, 'perception');
  assert.equal(settings.kind, 'speech');
});

test('a failed unlimited challenge stays available with its historical failure', () => {
  const event = normalizeHerausforderungEvent({ title: 'Das Tier beruhigen', publicDescription: 'Es schnaubt.',
    approaches: [{ approachId: 'calm', preferredSkills: ['animal-handling'], difficulty: 12, insight: 'Es wird ruhig.' }] });
  const history = [{ id: 'challenge', herausforderung: event }, { id: 'first', commentSegments: [{ skillResolution: {
    targetChallengeId: 'herausforderung:challenge:calm', outcome: 'failure', actorName: 'Früherer Versuch', revealedText: 'Es schnaubt weiter.' } }] }];
  assert.equal(collectHerausforderungApproaches(history).length, 1);
  const progress = collectHerausforderungProgress(history).get('herausforderung:challenge:calm');
  assert.equal(progress.attempts, 1); assert.equal(progress.solved, false);
});

test('automatic challenge replies follow the first response while ordinary comments keep their place', () => {
  const id = 'herausforderung:challenge:calm';
  const history = [{ id: 'challenge' }, { id: 'first', commentSegments: [{ skillResolution: { targetChallengeId: id } }] },
    { id: 'normal' }, { id: 'auto-1', commentSegments: [{ challengeReplyToCommentId: 'first' }] },
    { id: 'normal-response', commentSegments: [{ skillResolution: { targetChallengeId: id } }] },
    { id: 'auto-2', commentSegments: [{ challengeReplyToCommentId: 'first' }] }];
  const before = JSON.stringify(history);
  assert.equal(getChallengeReactionInsertAfterId({ id, commentId: 'challenge' }, history), 'first');
  assert.deepEqual(orderChallengeRepliesForDisplay(history).map(comment => comment.id), ['challenge', 'first', 'auto-1', 'auto-2', 'normal', 'normal-response']);
  assert.equal(JSON.stringify(history), before);
  assert.equal(getChallengeReactionInsertAfterId({ id, commentId: 'challenge' }, []), 'challenge');
  assert.equal(orderChallengeRepliesForDisplay([{ id: 'orphan', commentSegments: [{ challengeReplyToCommentId: 'missing' }] }]).length, 1);
});

test('display grouping crosses normal page breaks and preserves canonical mechanical order keys', () => {
  const context = vm.createContext({ console }); context.window = context;
  context.AleriaSkillChecks = { orderChallengeRepliesForDisplay };
  vm.runInContext(readFileSync(new URL('../modules/comments/comments-pagination.js', import.meta.url), 'utf8'), context);
  const history = Array.from({ length: 101 }, (_, index) => ({ id: `c${index}`, orderKey: index, text: String(index) }));
  history.push({ id: 'reply', orderKey: 101, commentSegments: [{ challengeReplyToCommentId: 'c1' }] });
  const pages = context.buildCommentTimelinePages(history);
  assert.deepEqual(Array.from(pages, page => page.items.length), [100, 2]);
  assert.equal(pages[0].items[2].comment.id, 'reply');
  assert.equal(pages[0].items[2].comment.orderKey, 101);
  assert.equal(history.at(-1).id, 'reply');
  assert.equal(new Set(pages.flatMap(page => page.items.map(item => item.comment.id))).size, 102);
});
