import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../modules/comments/comments-submit.js', import.meta.url), 'utf8');

function harness({ refreshFails = false, saveFails = false, published = false } = {}) {
  const calls = [], elements = new Map();
  const element = id => { if (!elements.has(id)) elements.set(id, { value: '', textContent: '', disabled: false, style: {} }); return elements.get(id); };
  const backend = { addComment: async () => { calls.push('save'); if (saveFails) throw Error('server rejected'); return { id: 'saved' }; } };
  const context = vm.createContext({
    console: { warn() {} }, document: { getElementById: element, dispatchEvent() {} },
    window: { AleriaCombat: { handleSubmission: async () => ({ handled: published, published }) } },
    _commentMode: 'narrator', _commentKind: 'speech', _selectedCharId: '', _manualMode: false,
    _commentInsertAfterId: null, _commentSubmitInFlight: false, COMMENT_MAX_LENGTH: 20000, COMMENT_DELETE_CODE: 'test',
    syncCommentSegmentsToLegacyText() {}, buildCommentSegmentsForSave: () => [{ text: 'Beitrag', kind: 'speech' }],
    getCurrentCommentThreadId: () => 'scene', normalizeCommentKind: kind => kind, getNextCommentOrderKey: () => 1,
    getCommentBackend: async () => backend, clearCommentDraft() { calls.push('clear-draft'); }, closeCommentForm() { calls.push('close'); },
    loadCommentsIntoPage: async () => { calls.push('refresh'); if (refreshFails) throw Error('render failed'); },
    loadSidebarFeed() { calls.push('feed'); }, getFriendlyErrorMessage: error => error.message,
    getLocalCommentBackend() { calls.push('local-fallback'); return { addComment: async () => calls.push('local-write') }; },
    showCommentFallbackNotice() {}, showAppStatus(message) { calls.push(['status', message]); }, requestCommentAutoScroll() {},
    globalThis: {}
  });
  vm.runInContext(source, context);
  return { context, calls, elements, run: () => vm.runInContext('submitComment()', context) };
}

for (const published of [false, true]) test(`an acknowledged ${published ? 'mechanical' : 'narrative'} save cannot become another write when scene refresh fails`, async () => {
  const h = harness({ refreshFails: true, published }); await h.run();
  assert.equal(h.calls.filter(call => call === 'save').length, published ? 0 : 1);
  assert.equal(h.calls.includes('local-fallback'), false);
  assert.equal(h.calls.includes('local-write'), false);
  assert.ok(h.calls.includes('clear-draft'));
  assert.match(h.calls.find(call => Array.isArray(call) && call[0] === 'status')[1], /Beitrag gespeichert/);
  assert.equal(h.context._commentSubmitInFlight, false);
});

test('normal completion still writes once and refreshes; validation failure never claims a successful save', async () => {
  const h = harness(); await h.run();
  assert.deepEqual(h.calls, ['save', 'clear-draft', 'close', 'refresh', 'feed']);
  assert.equal(h.context._commentSubmitInFlight, false);
  const failed = harness(); failed.context.buildCommentSegmentsForSave = () => [{ text: '' }]; await failed.run();
  assert.equal(failed.calls.includes('save'), false);
  assert.equal(failed.calls.some(call => Array.isArray(call) && /Beitrag gespeichert/.test(call[1])), false);
});
