import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function navigation({ editing = false, thread = true } = {}) {
  const listeners = {};
  const calls = { closed: 0, focus: 0, flips: [] };
  const menu = { open: false, querySelector: () => ({ focus: () => calls.focus++ }) };
  const overlay = { classList: { contains: () => true }, addEventListener() {} };
  const context = vm.createContext({
    currentEntry: { pages: [{ pageTitle: 'I. Anfang' }, { pageTitle: 'II. Ende' }] },
    requestAnimationFrame: callback => callback(),
    document: {
      getElementById: id => id === 'modal-overlay' ? overlay : null,
      querySelector: () => menu.open ? menu : null,
      addEventListener: (type, listener) => { listeners[type] = listener; }
    },
    escapeHtml: text => String(text),
    getRenderableEntry: entry => entry,
    getPages: entry => entry.pages,
    isInlineEditingEntry: () => editing,
    getCommentThreadForPage: () => null,
    getInlineCommentThreadForPage: () => thread ? { threadId: 'page-thread' } : null,
    buildModulePageTypeOptions: () => '<option value="standard">Standard</option>',
    buildModuleTemplateOptions: () => '<option value="standard">Standard</option>',
    inferModuleTemplateType: () => 'standard',
    closeModal: () => calls.closed++,
    flipPage: direction => calls.flips.push(direction)
  });
  for (const file of ['modal-navigation.js', 'modal-events.js']) {
    vm.runInContext(readFileSync(new URL(`../modules/modal/${file}`, import.meta.url), 'utf8'), context);
  }
  const key = (value, target = {}) => {
    const event = { key: value, target, prevented: false, preventDefault() { this.prevented = true; } };
    listeners.keydown(event);
    return event;
  };
  return { context, menu, calls, key, listeners };
}

test('reader and editor keep page links visible while secondary actions use a closed disclosure', () => {
  for (const editing of [false, true]) {
    const { context } = navigation({ editing });
    const html = context.buildNav(context.currentEntry.pages[0], 0, 2);
    const disclosure = html.match(/<details\b[^>]*>[\s\S]*?<\/details>/)?.[0];
    assert(disclosure);
    assert.doesNotMatch(disclosure.match(/^<details[^>]*>/)[0], /\sopen(?:\s|=|>)/);
    assert.match(disclosure, new RegExp(`data-modal-action="${editing ? 'save-inline-edit' : 'export-current-module'}"`));
    assert.doesNotMatch(disclosure, /data-modal-action="(?:jump-page|flip-page|toggle-focus-mode)"/);
    const visible = html.replace(disclosure, '');
    assert.equal((visible.match(/data-modal-action="jump-page"/g) || []).length, 2);
    assert.match(visible, /data-page-index="0" aria-current="page"/);
    assert.match(visible, /data-modal-action="toggle-focus-mode"/);
    assert.match(visible, /data-direction="-1" disabled/);
  }
});

test('comment tools remain disabled when a page has no thread', () => {
  const { context } = navigation({ thread: false });
  const html = context.buildNav(context.currentEntry.pages[0], 0, 2);
  for (const action of ['export', 'import', 'rescue']) {
    assert.match(html, new RegExp(`data-modal-action="${action}-current-comment-thread" disabled`));
  }
});

test('the embedded live preview does not duplicate module navigation', () => {
  const { context } = navigation({ editing: true });
  context._moduleRenderPreviewContext = { entry: context.currentEntry };
  assert.equal(context.buildNav(context.currentEntry.pages[0], 0, 2), '');
});

test('Escape dismisses an open action menu before closing the module and restores focus', () => {
  const { menu, calls, key } = navigation();
  menu.open = true;
  assert.equal(key('Escape').prevented, true);
  assert.equal(menu.open, false);
  assert.equal(calls.closed, 0);
  assert.equal(calls.focus, 1);
  key('Escape');
  assert.equal(calls.closed, 1);
});

test('arrow keys keep working for reading without interrupting editor controls or the action menu', () => {
  const { calls, key } = navigation();
  key('ArrowRight');
  key('ArrowLeft');
  for (const target of [
    { tagName: 'INPUT' }, { tagName: 'TEXTAREA' }, { tagName: 'SELECT' },
    { isContentEditable: true }, { closest: () => ({}) }
  ]) {
    key('ArrowRight', target);
    key('ArrowLeft', target);
  }
  assert.deepEqual(calls.flips, [1, -1]);
});

test('clicking outside the disclosure dismisses it without stealing focus', () => {
  const { menu, calls, listeners } = navigation();
  menu.open = true;
  listeners.click({ target: { closest: () => null } });
  assert.equal(menu.open, false);
  assert.equal(calls.focus, 0);
});

test('keys already handled by a template do not turn or close the module page', () => {
  const { calls, listeners } = navigation();
  for (const key of ['ArrowRight', 'ArrowLeft', 'Escape']) {
    listeners.keydown({ key, defaultPrevented: true, target: {} });
  }
  assert.deepEqual(calls.flips, []);
  assert.equal(calls.closed, 0);
});

test('page navigation reveals an active chapter outside the visible strip', () => {
  const { context } = navigation();
  const tabs = {
    scrollLeft: 0,
    isConnected: true,
    clientWidth: 300,
    querySelector: () => ({ offsetLeft: 380, offsetWidth: 200 })
  };
  context.initModalNavigation({ querySelector: () => tabs });
  assert.equal(tabs.scrollLeft, 280);
});
