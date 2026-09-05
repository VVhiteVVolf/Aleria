import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../modules/comments/comments-form.js', import.meta.url);

function createHarness() {
  const calls = [];
  const frames = [];
  const timers = [];
  const elements = new Map();
  let open = false;
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      id,
      value: '',
      textContent: '',
      placeholder: '',
      disabled: false,
      style: {},
      dataset: {},
      removeAttribute() {},
      replaceChildren() { calls.push(`clear:${id}`); }
    });
    return elements.get(id);
  };
  const context = vm.createContext({
    console,
    CHARACTER_IMAGE_SET_DEFAULT_ID: 'default',
    getCurrentCommentThread: () => null,
    setCommentPreviewPanelState() {},
    makeCommentSegment: kind => ({ id: 'segment-1', kind, text: '' }),
    setRichEditorContent() {},
    setCommentPlayerFilter(_value, options) { calls.push(['player', options]); },
    showCommentDraftNote() {},
    resetCommentAssistant() {},
    setCommentMode(_value, options) { calls.push(['mode', options]); },
    setCommentKind(_value, options) { calls.push(['kind', options]); },
    refreshCurrentModuleCommenterHighlights() {},
    restoreCommentDraft(options) { calls.push(['draft', options]); },
    renderCharPickerInForm() { calls.push('picker'); },
    renderCommentSegmentList() { calls.push('segments'); },
    setCommentFormCounter() { calls.push('counter'); },
    updateCommentFormPreview() { calls.push('preview'); },
    activateDialog() { calls.push('activate'); open = true; },
    deactivateDialog() { calls.push('deactivate'); open = false; },
    isCommentFormOpen: () => open,
    initCommentPreviewSplitter() {},
    applyCommentPreviewLayout() {},
    requestAnimationFrame(callback) { frames.push(callback); },
    setTimeout(callback) { timers.push(callback); return timers.length; },
    document: {
      getElementById: element,
      querySelector() { return { focus() { calls.push('focus'); } }; }
    },
    window: { AleriaCommentSceneCast: { resetCreate() {} } }
  });
  return { context, calls, frames, timers };
}

test('das Kommentarfenster öffnet vor dem einmaligen schweren Erst-Render', async () => {
  const harness = createHarness();
  vm.runInContext(await readFile(sourceUrl, 'utf8'), harness.context, { filename: sourceUrl.pathname });
  vm.runInContext('openCommentForm()', harness.context);

  assert.ok(harness.calls.includes('activate'));
  assert.equal(harness.calls.includes('picker'), false);
  assert.equal(harness.calls.includes('segments'), false);
  assert.equal(harness.calls.includes('preview'), false);
  for (const name of ['player', 'mode', 'kind', 'draft']) {
    const call = harness.calls.find(item => Array.isArray(item) && item[0] === name);
    assert.equal(call?.[1]?.render, false);
  }

  harness.frames.shift()?.();
  harness.timers.shift()?.();
  assert.equal(harness.calls.filter(call => call === 'picker').length, 1);
  assert.equal(harness.calls.filter(call => call === 'segments').length, 1);
  assert.equal(harness.calls.filter(call => call === 'preview').length, 1);
  assert.ok(harness.calls.indexOf('activate') < harness.calls.indexOf('picker'));
});

test('ein bereits geschlossenes Kommentarfenster führt keinen verzögerten Render mehr aus', async () => {
  const harness = createHarness();
  vm.runInContext(await readFile(sourceUrl, 'utf8'), harness.context, { filename: sourceUrl.pathname });
  vm.runInContext('openCommentForm(); closeCommentForm();', harness.context);
  harness.frames.shift()?.();
  harness.timers.shift()?.();

  assert.equal(harness.calls.includes('picker'), false);
  assert.equal(harness.calls.includes('segments'), false);
  assert.equal(harness.calls.includes('preview'), false);
});
