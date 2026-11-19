import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import * as requestModule from '../modules/comments/comments-mechanical-request.js';
const source = await readFile(new URL('../modules/comments/comments-submit.js', import.meta.url), 'utf8');

function harness({ refreshFails = false, saveFails = false, published = false } = {}) {
  const calls = [], elements = new Map();
  const element = id => { if (!elements.has(id)) elements.set(id, { value: '', textContent: '', disabled: false, style: {} }); return elements.get(id); };
  const backend = { addComment: async () => { calls.push('save'); if (saveFails) throw Error('server rejected'); return { id: 'saved' }; } };
  const context = vm.createContext({
    console: { warn() {} }, document: { getElementById: element, dispatchEvent() {} }, structuredClone, fixtureRequestModule: requestModule,
    window: { AleriaCombat: { handleSubmission: async () => ({ handled: published, published }) } },
    getCommentDraftId: () => 'fixture-draft', persistCommentDraft() {},
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
  vm.runInContext(source.replace(/await import\('\.\/comments-mechanical-request\.js[^']*'\)/, 'fixtureRequestModule'), context);
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
test('an unchanged mechanical retry retains the exact request and does not prepare or roll again', async () => {
  const h = harness(); let prepared = 0; const sent = [];
  h.context.buildCommentSegmentsForSave = () => [{ clientSegmentId: 'stable-item-segment', kind: 'interact', text: 'Ich verwende den Gegenstand.' }];
  h.context.window.AleriaInventoryUse = { handleSubmission: async () => { prepared++; return { handled: true, commentMetadata: { commentSegments: [{ kind: 'interact', inventoryUse: { usageId: `attempt-${prepared}`, item: { id: 'item' } } }] } }; } };
  h.context.getCommentBackend = async () => ({ addCombatComment: async (...args) => { sent.push(structuredClone(args[7])); if (sent.length === 1) throw Error('Antwort verloren'); return { id: 'saved' }; } });
  await h.run(); await h.run();
  assert.equal(prepared, 1); assert.equal(sent.length, 2); assert.deepEqual(sent[0], sent[1]); assert.ok(sent[0].operationId);
});

test('publishing another draft in the same scene leaves the first mechanical save retry intact', async () => {
  const h = harness();
  let draftId = 'first-draft', prepared = 0;
  const sent = [];
  h.context.getCommentDraftId = () => draftId;
  h.context.buildCommentSegmentsForSave = () => [{ clientSegmentId: `client-${prepared}`, kind: 'interact', text: 'Ich verwende den Gegenstand.' }];
  h.context.window.AleriaInventoryUse = { handleSubmission: async () => ({ handled: true, commentMetadata: { commentSegments: [
    { kind: 'interact', inventoryUse: { usageId: `attempt-${++prepared}` } }
  ] } }) };
  h.context.getCommentBackend = async () => ({ addCombatComment: async (...args) => {
    sent.push(structuredClone(args[7]));
    if (sent.length === 1) throw Error('Antwort verloren');
    return { id: 'saved' };
  } });
  await h.run();
  draftId = 'second-draft'; await h.run();
  draftId = 'first-draft'; await h.run();
  assert.equal(prepared, 2);
  assert.equal(sent.length, 3);
  assert.notEqual(sent[0].operationId, sent[1].operationId);
  assert.deepEqual(sent[0], sent[2]);
});

test('a prepared mechanical save can be read again after reloading its module in the same tab', async () => {
  const storage = new Map();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key)
  } });
  try {
    const request = requestModule.mechanicalCommentRequest('restored-scene', 'same-content', 'restored-draft');
    request.metadata = { operationId: request.operationId, commentSegments: [{ skillResolution: { resolutionId: 'one-roll' } }] };
    requestModule.rememberMechanicalCommentRequest('restored-scene', 'restored-draft', request);
    const reloaded = await import('../modules/comments/comments-mechanical-request.js?reload-test');
    assert.deepEqual(reloaded.mechanicalCommentRequest('restored-scene', 'same-content', 'restored-draft'), request);
    assert.notEqual(reloaded.mechanicalCommentRequest('other-scene', 'same-content', 'restored-draft').operationId, request.operationId);
    reloaded.completeMechanicalCommentRequest('restored-scene', 'restored-draft');
    assert.equal(storage.size, 0);
  } finally {
    if (original) Object.defineProperty(globalThis, 'sessionStorage', original);
    else delete globalThis.sessionStorage;
  }
});

test('scene-item submissions carry the resolved scene date without a module save or a second comment', async () => {
  const h = harness();
  const date = { year: 1740, month: 3, day: 9 };
  const sent = [];
  h.context.globalThis.AleriaSceneDateDefaults = { ensureForCurrentThread: () => date };
  h.context.globalThis.AleriaWorldDateModel = { isValid: () => true, normalize: value => ({ ...value }) };
  h.context.saveModuleStore = () => assert.fail('Comment submission must not save modules');
  h.context.buildCommentSegmentsForSave = () => [{ kind: 'sceneitem', text: 'Ein Beutel liegt dort.', sceneItemOperationId: 'scene-item-date-001' }];
  h.context.getCommentBackend = async () => ({ placeSceneItem: async (...args) => { sent.push(args); return { id: 'placed' }; } });
  await h.run();
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], 'scene');
  assert.equal(sent[0][1].operationId, 'scene-item-date-001');
  assert.deepEqual(sent[0][1].sceneStartDateAleria, date);
  assert.equal(h.calls.includes('save'), false);
  assert.equal(h.calls.includes('local-write'), false);
  assert.ok(h.calls.includes('refresh'));
});
