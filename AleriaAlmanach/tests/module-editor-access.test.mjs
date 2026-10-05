import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

function accessContext(role = false) {
  const values = new Map(), events = [], dialogs = [], elements = new Map();
  for (const id of ['module-editor-overlay', 'module-editor-title', 'module-editor-gate', 'module-editor-body', 'me-code', 'me-code-error']) {
    elements.set(id, { value: '', style: {}, dataset: {}, classList: { toggle() {} } });
  }
  const context = vm.createContext({ _moduleEditorAuthorized: false, crypto: webcrypto, TextEncoder, Event,
    localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) },
    document: { getElementById: id => elements.get(id) || null },
    _fbAuth: { getAccess: () => ({ canEditSharedContent: role }) },
    _fb: { setCommentAdminCode() { throw new Error('A local editing unlock must not change moderation.'); } },
    activateDialog: id => dialogs.push(['open', id]), deactivateDialog: id => dialogs.push(['close', id]),
    setModuleEditorStatus() {}, dispatchEvent: event => events.push(event.type) });
  context.window = context;
  for (const name of ['module-editor-auth', 'module-editor-controller']) {
    vm.runInContext(readFileSync(new URL(`../modules/module-editor/${name}.js`, import.meta.url), 'utf8'), context);
  }
  return { context, elements, dialogs, events };
}

test('A group edit request uses the existing code gate and resumes only after correct unlock', async () => {
  const { context, elements, dialogs, events } = accessContext();
  let opened = 0;
  context.setStoredModuleEditorCodeHash(await context.hashModuleEditorCode('test-editor-code'));
  context.requestModuleEditorAccess(() => opened++);
  assert.equal(context.canEditModuleContent(), false);
  assert.equal(opened, 0);
  assert.equal(elements.get('module-editor-title').textContent, 'Bearbeitung freischalten');
  assert.deepEqual(dialogs, [['open', 'module-editor-overlay']]);
  elements.get('me-code').value = 'wrong-code';
  await context.unlockModuleEditor();
  assert.equal(elements.get('me-code-error').textContent, 'Falscher Code.');
  assert.equal(context.canEditModuleContent(), false);
  assert.equal(opened, 0);
  elements.get('me-code').value = 'test-editor-code';
  await context.unlockModuleEditor();
  assert.equal(context.canEditModuleContent(), true);
  assert.equal(opened, 1);
  assert.deepEqual(events, ['aleria:module-editor-access-changed']);
  assert.equal(context._fbAuth.getAccess().canEditSharedContent, false);
  assert.deepEqual(dialogs.at(-1), ['close', 'module-editor-overlay']);
});

test('Cancelling the code gate discards the pending group edit', async () => {
  const { context, elements } = accessContext();
  let opened = 0;
  context.requestModuleEditorAccess(() => opened++);
  context.closeModuleEditor();
  assert.equal(opened, 0);
  assert.equal(context.canEditModuleContent(), false);
  // A later, independent request must not revive the cancelled callback.
  context.requestModuleEditorAccess(() => opened += 10);
  elements.get('me-code').value = 'test-editor-code';
  await context.unlockModuleEditor();
  assert.equal(opened, 10);
});

test('Existing editor roles open editing directly without changing the local code or role', () => {
  const { context, dialogs, events } = accessContext(true);
  let opened = 0;
  context.requestModuleEditorAccess(() => opened++);
  assert.equal(opened, 1);
  assert.equal(context.getStoredModuleEditorCodeHash(), '');
  assert.equal(context._moduleEditorAuthorized, false);
  assert.deepEqual(dialogs, []);
  assert.deepEqual(events, []);
});
