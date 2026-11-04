import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const readModule = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const escapeHtml = value => String(value ?? '').replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const transition = {
  transitionId: 'from-hall-to-room',
  source: { threadId: 'castell::session:hall', entryId: 'castell', entryTitle: 'Castell Draig', pageTitle: 'Thronsaal' },
  target: { threadId: 'castell::session:room', entryId: 'castell', entryTitle: 'Castell Draig', pageTitle: 'Gawains Gemach' },
  flavourText: 'Die beiden verlassen den Thronsaal.',
  characters: [{ id: 'gawain', name: 'Gawain', portrait: './gawain.png' }]
};

function createContext(extra = {}) {
  const context = vm.createContext({
    console, escapeHtml, sanitizeImageSrc: value => value,
    parseCommentMarkup: escapeHtml, getInitialChar: value => value[0],
    getCurrentCommentThreadId: () => transition.source.threadId,
    ...extra
  });
  context.window = context;
  vm.runInContext(readModule('modules/scene-transition/scene-transition-state.js'), context);
  return context;
}

test('the saved transition renders its narration, source, destination and character in both scenes', () => {
  const context = createContext();
  vm.runInContext(readModule('modules/scene-transition/scene-transition-ui.js'), context);
  vm.runInContext(readModule('modules/comments/comments-render.js'), context);
  for (const [entryId, direction, destination] of [
    [transition.source.threadId, 'departure', transition.target],
    [transition.target.threadId, 'arrival', transition.source]
  ]) {
    const html = context.renderCommentBubble({ id: 'saved-transition', entryId, narrator: true,
      commentKind: 'scene-transition-event', text: transition.flavourText, sceneTransition: transition }, 43);
    assert.match(html, new RegExp(`data-transition-direction="${direction}"`));
    assert.ok(html.includes(transition.flavourText));
    assert.ok(html.includes(transition.source.pageTitle));
    assert.ok(html.includes(transition.target.pageTitle));
    assert.ok(html.includes(`data-transition-thread-id="${destination.threadId}"`));
    assert.ok(html.includes('Gawain'));
  }
});

test('dialog preview keeps navigation passive so the source scene cannot change beneath the editor', () => {
  const context = createContext();
  vm.runInContext(readModule('modules/scene-transition/scene-transition-ui.js'), context);
  const html = context.renderSceneTransitionBlock(transition, { hideActions: true, hideNavigation: true });
  assert.ok(html.includes(transition.target.pageTitle));
  assert.doesNotMatch(html, /data-scene-transition-action="open-target"|<button/);
  assert.match(context.renderSceneTransitionBlock(transition), /data-scene-transition-action="open-target"/);
});

test('local storage preserves two complete linked scene copies without altering earlier comments', async () => {
  const previous = { id: 'earlier', text: 'Vorher.' };
  const values = new Map([['aleria-local-comments-v1', JSON.stringify({ [transition.source.threadId]: [previous] })]]);
  const context = createContext({
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    sortCommentsByTimeline: comments => comments
  });
  vm.runInContext(readModule('modules/comments/comments-backend.js'), context);
  const backend = context.getLocalCommentBackend();
  await backend.addSceneTransition(transition.source.threadId, transition.target.threadId,
    transition.flavourText, 'code', { sceneTransition: transition });
  const store = JSON.parse(values.get('aleria-local-comments-v1'));
  assert.deepEqual(store[transition.source.threadId][0], previous);
  for (const threadId of [transition.source.threadId, transition.target.threadId]) {
    const saved = store[threadId].at(-1);
    assert.deepEqual(saved.sceneTransition, transition);
    assert.equal(saved.entryId, threadId);
    assert.equal(saved.text, transition.flavourText);
    assert.equal(saved.commentKind, 'scene-transition-event');
  }
});

test('the Firebase facade submits both scene copies with complete transition metadata in one call', async () => {
  const source = readModule('firebase.js');
  const start = source.indexOf('      async addSceneTransition(');
  const end = source.indexOf('      async deleteSceneTransition(', start);
  let payload;
  const backend = vm.runInNewContext(`({${source.slice(start, end)}})`, {
    requireFirebaseUser: async () => {}, hashDeleteCode: async () => 'hash',
    cloneSerializableValue: value => value,
    commitNarrativeCommentCallable: async value => { payload = value; return { data: { ids: ['source-copy', 'target-copy'] } }; }
  });
  const saved = await backend.addSceneTransition(transition.source.threadId, transition.target.threadId,
    transition.flavourText, 'code', { sceneTransition: transition });
  assert.deepEqual(Array.from(saved.ids), ['source-copy', 'target-copy']);
  assert.deepEqual(Array.from(payload.entryIds), [transition.source.threadId, transition.target.threadId]);
  assert.equal(payload.text, transition.flavourText);
  assert.equal(payload.metadata.sceneTransition, transition);
  assert.equal(payload.metadata.commentKind, 'scene-transition-event');
});
