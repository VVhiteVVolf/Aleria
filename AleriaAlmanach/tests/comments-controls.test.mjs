import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = name => fs.readFileSync(new URL(`../modules/comments/${name}.js`, import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function createContext(initial = {}, extra = {}) {
  const storage = new Map(Object.entries(initial));
  const context = vm.createContext({
    console, escapeHtml, sanitizeImageSrc: value => value, sanitizeContentHtml: value => value,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    document: { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null, dispatchEvent() {} },
    CustomEvent: class { constructor(type, options) { Object.assign(this, { type }, options); } },
    ...extra,
  });
  context.window = context;
  vm.runInContext(source('comments-toolbar'), context);
  return { context, storage };
}

test('visibility controls sit below scene clock actions and remain outside both hidden footer toolbars', () => {
  const { context } = createContext({ 'aleria-comment-quick-tools-visible-v1': '0' }, {
    buildNav: () => '', isSessionFocusModeEnabled: () => false,
    getSessionThreadId: () => 'scene::session:0', getPageCommentThreadKey: () => '0',
    buildSceneClockControl: () => '<span data-test-clock>Uhr</span>',
    buildSceneInventoryControl: () => '', buildSceneDiceControl: () => '', buildSessionStatusControl: () => '',
  });
  vm.runInContext(source('comments-page'), context);
  const markup = context.buildSessionPage({ sessionIntro: 'Einleitung' }, { id: 'scene', title: 'Szene' }, 0, 1);
  const view = markup.indexOf('class="comment-view-controls"');
  assert(view > markup.indexOf('data-test-clock'));
  assert(view < markup.indexOf('class="session-intro"'));
  assert(view < markup.indexOf('class="comments-scroll"'));
  const footer = markup.slice(markup.indexOf('class="session-footer"'));
  assert(!footer.includes('data-comment-quick-tools-toggle'));
  assert(!footer.includes('data-comment-tools-toggle'));
  assert.match(footer, /data-comment-quick-tools hidden/);
  assert.match(markup, /data-comment-quick-tools-toggle aria-pressed="false">Leiste anzeigen/);
  assert.equal((markup.match(/data-comment-tools-toggle/g) || []).length, 1);
});

test('persisted visibility states render accurately and toggles remain usable with both rows hidden', () => {
  const buttons = { quick: {}, editing: {} };
  const makeButton = key => ({
    classList: { toggle: (_name, value) => { buttons[key].active = value; } },
    setAttribute: (name, value) => { buttons[key][name] = value; },
    set textContent(value) { buttons[key].label = value; },
  });
  const bar = { hidden: false, style: {}, classList: { toggle() {} } };
  const { context, storage } = createContext({
    'aleria-comment-quick-tools-visible-v1': '0',
    'aleria-comment-tools-visible-v1': '0',
  }, { document: {
    querySelectorAll(selector) {
      if (selector === '[data-comment-quick-tools]') return [bar];
      if (selector === '[data-comment-quick-tools-toggle]') return [makeButton('quick')];
      if (selector === '[data-comment-tools-toggle]') return [makeButton('editing')];
      return [];
    }, dispatchEvent() {},
  } });
  context.applyCommentToolsVisibility();
  assert.equal(bar.hidden, true);
  assert.equal(buttons.quick.label, 'Leiste anzeigen');
  assert.equal(buttons.editing.label, 'Bearbeitung anzeigen');
  context.toggleCommentQuickToolsVisibility();
  context.toggleCommentToolsVisibility();
  assert.equal(bar.hidden, false);
  assert.equal(buttons.quick['aria-pressed'], 'true');
  assert.equal(buttons.editing['aria-pressed'], 'true');
  assert.equal(storage.get('aleria-comment-tools-visible-v1'), '1');
  assert.match(context.buildCommentViewControls(), /Bearbeitung ausblenden/);
  assert.match(context.buildCommentQuickTools('scene::session:0'), /list="comment-author-jump-list-scene--session-0"/);
  assert.notEqual(context.buildCommentQuickTools('first'), context.buildCommentQuickTools('second'));
});

function createSearchContext() {
  const status = { textContent: '' };
  const attributes = new Map();
  const input = { value: '', focus() {}, removeAttribute: key => attributes.delete(key), setAttribute: (key, value) => attributes.set(key, value) };
  const options = { innerHTML: '' };
  const tools = { dataset: {}, querySelector: selector => ({
    '[data-comment-jump-input]': input,
    '[data-comment-jump-status]': status,
    '[data-comment-author-options]': options,
  })[selector] || null };
  const scroll = { dataset: { commentThreadId: 'current' }, parentElement: { querySelector: () => tools }, querySelectorAll: () => [] };
  const scope = { querySelector: () => scroll };
  input.closest = selector => selector === '[data-comment-quick-tools]' ? tools : scope;
  const comments = [
    { id: 'one', charName: 'Éowyn Weiß', orderKey: 1 },
    { id: 'partial', charName: 'Éowyn Weißberg', orderKey: 2 },
    { id: 'two', charName: 'Éowyn Weiß', orderKey: 3 },
    { id: 'hidden', charName: 'Éowyn Weiß', orderKey: 4, hidden: true },
  ];
  const { context } = createContext({}, {
    _commentCache: { current: comments, other: [{ id: 'foreign', charName: 'Éowyn Weiß', orderKey: 10 }] },
    sortCommentsByTimeline: entries => [...entries].sort((a, b) => a.orderKey - b.orderKey),
    getCommentShowcaseItem: () => null, getCommentModuleInsertItem: () => null, getCommentAttachmentItem: () => null,
    document: { querySelector: () => tools, getElementById: () => scroll, querySelectorAll: () => [] },
    setTimeout() {},
    AleriaSceneRegenerationPolicy: { filterVisible: entries => entries.filter(comment => !comment.hidden) },
  });
  vm.runInContext(source('comments-jump'), context);
  return { context, input, status, tools, scroll, options, comments, attributes };
}

test('author search handles diacritics, ß, reordered name tokens and exact names before similar names', () => {
  const { context, comments } = createSearchContext();
  assert.equal(context.normalizeCommentJumpText(' ÉOWYN WEIẞ '), 'eowyn weiss');
  assert.deepEqual(plain(context.findCommentAuthorMatches(comments, 'weiss eowyn')).map(item => item.id), ['one', 'partial', 'two', 'hidden']);
  assert.deepEqual(plain(context.findCommentAuthorMatches(comments, 'Eowyn Weiss')).map(item => item.id), ['one', 'two', 'hidden']);
  assert.deepEqual(plain(context.findCommentAuthorMatches(comments, 'unbekannt')), []);
});

test('live search reports visible matches and Escape clears errors and restores the author summary', () => {
  const { context, input, status, tools, scroll, options, comments, attributes } = createSearchContext();
  context.syncCommentJumpTools(scroll, comments.filter(comment => !comment.hidden));
  assert.equal(tools.dataset.commentAuthorCount, '2');
  assert.match(options.innerHTML, /Éowyn Weiß/);
  input.value = 'Eowyn Weiss';
  context.updateCommentJumpSearchStatus(input);
  assert.match(status.textContent, /^2 passende Beiträge/);
  assert(!status.textContent.includes('foreign'));
  input.value = 'niemand';
  context.updateCommentJumpSearchStatus(input);
  assert.match(status.textContent, /Kein passender Kommentator/);
  attributes.set('aria-invalid', 'true');
  let prevented = false;
  context.handleCommentJumpSearchKey({ target: input, key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(input.value, '');
  assert.equal(prevented, true);
  assert.equal(attributes.has('aria-invalid'), false);
  assert.match(status.textContent, /2 Kommentatoren im Verlauf/);
});

test('jump targets the latest exact visible author in the active thread and resolves its actual page', () => {
  const { context, input, status, scroll } = createSearchContext();
  input.value = 'Eowyn Weiss';
  let pagination, scrolled = null;
  const target = { classList: { add() {}, remove() {} }, scrollIntoView: value => { scrolled = value; } };
  context.matchMedia = () => ({ matches: true });
  context.setCommentPageForCommentId = (threadId, commentId) => {
    pagination = { threadId, commentId };
    scroll.querySelectorAll = selector => selector.includes('two') ? [target] : [];
    return true;
  };
  context.jumpToLatestCommentByAuthor(input);
  assert.deepEqual(pagination, { threadId: 'current', commentId: 'two' });
  assert.equal(scrolled.behavior, 'auto');
  assert.equal(scrolled.block, 'center');
  assert.match(status.textContent, /Jüngster Treffer: Éowyn Weiß · 2 Beiträge/);
});

test('turn controls expose selected state without changing their existing action semantics', () => {
  const { context } = createContext();
  const markup = context.buildCommentTurnBar('thread');
  assert.match(markup, /role="group" aria-label="Redestab übergeben"/);
  assert.equal((markup.match(/aria-pressed="false"/g) || []).length, 3);
  vm.runInContext(source('comments-pagination'), context);
  const pagination = context.renderCommentPaginationControls('thread', {
    currentPage: 1, pageCount: 2, startIndex: 0, endIndex: 75, totalCount: 80,
  });
  assert.match(pagination, /disabled>Zurück/);
  assert.match(pagination, /aria-current="page">1/);
  assert.match(pagination, />Weiter<\/button>/);
});
