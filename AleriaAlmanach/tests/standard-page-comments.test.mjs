import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function createRenderer({ editing = false } = {}) {
  const context = vm.createContext({
    document: { addEventListener() {} },
    getRenderableEntry: entry => entry,
    isInlineEditingEntry: () => editing,
    getModuleTemplateForPage: () => null,
    escapeHtml: value => String(value || ''),
    sanitizeContentHtml: value => value,
    sanitizeImageSrc: value => value,
    renderStaticCommentSequence: sequence => sequence.map(item => `<aside>${item.text}</aside>`).join(''),
    buildCommentQuickTools: () => '',
    buildCommentTurnBar: () => '',
    buildCommentQuickToolsToggle: () => '',
    buildCommentToolsToggle: () => '',
    buildInlineImagePanel: () => '',
    buildInlineStandardEditor: () => '<div>Editor</div>'
  });
  for (const relative of [
    '../modules/comments/comments-routing.js',
    '../modules/comments/comments-page.js',
    '../modules/rendering/module-renderer.js'
  ]) {
    vm.runInContext(readFileSync(new URL(relative, import.meta.url), 'utf8'), context, { filename: relative });
  }
  // Navigation is independent of the standard page's content and comment composition.
  context.buildNav = () => '';
  context.buildInlineModuleWorkspace = html => html;
  return context;
}

function render(context, page = {}, entry = {}) {
  return context.buildPage({ description: 'Page text', ...page }, {
    id: 'test-module', title: 'Test module', appendCommentsPage: false, ...entry
  }, 0, 1);
}

test('enabled module comments appear after text even without authored commentary', () => {
  const html = render(createRenderer(), {}, { enablePageComments: true });
  assert.match(html, /module-embedded-comments/);
  assert.equal((html.match(/data-action="open-comment-form"/g) || []).length, 1);
  assert(html.indexOf('Page text') < html.indexOf('module-embedded-comments'));
  assert.doesNotMatch(html, /class="entry-quote"|commentator-block|module-organic-comments/);
});

test('comments can be enabled for an individual standard page', () => {
  const html = render(createRenderer(), { enableComments: true });
  assert.match(html, /data-action="open-comment-form"/);
  assert.match(html, /Kommentare beziehen sich nur auf diese Seite/);
});

test('a page without commentary or comment permissions stays without a comment form', () => {
  const html = render(createRenderer());
  assert.doesNotMatch(html, /data-action="open-comment-form"|module-embedded-comments|module-organic-comments/);
});

test('authored commentary keeps its existing organic continuation without a duplicate form', () => {
  const html = render(createRenderer(), { commentSequence: [{ text: 'Existing commentary' }] }, { enablePageComments: true });
  assert.match(html, /module-organic-comments/);
  assert.doesNotMatch(html, /module-embedded-comments/);
  assert.equal((html.match(/data-action="open-comment-form"/g) || []).length, 1);
  assert(html.indexOf('Existing commentary') < html.indexOf('module-organic-comments'));
});

test('inline editing keeps comment submission controls out of the editing workspace', () => {
  const html = render(createRenderer({ editing: true }), {}, { enablePageComments: true });
  assert.match(html, /Editor/);
  assert.doesNotMatch(html, /data-action="open-comment-form"/);
});
