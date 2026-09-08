import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function preview({ width = 800, height = 600 } = {}) {
  const nodes = {
    'me-preview-stage': { clientWidth: width, clientHeight: height, scrollTop: 25, scrollLeft: 4 },
    'me-preview-frame': { innerHTML: '' },
    'me-preview-empty': {},
    'me-preview-meta': {}
  };
  const context = vm.createContext({
    document: { getElementById: id => nodes[id] },
    _moduleEditorPreviewPageIndex: 0,
    sanitizeModuleEntry: entry => entry,
    getPageNavLabel: page => page.title,
    getModuleDisplaySize: entry => entry.displaySize || { width: 100, height: 100 },
    buildPage: page => `<article>${page.description}</article>`,
    requestAnimationFrame: callback => callback()
  });
  vm.runInContext(readFileSync(new URL('../modules/module-editor/module-editor-preview.js', import.meta.url), 'utf8'), context);
  return { context, nodes };
}

test('long previews keep the available reading dimensions instead of shrinking the text', () => {
  const { context, nodes } = preview();
  for (const description of ['Kurz', '<p>Ein langer Absatz.</p>'.repeat(300)]) {
    context.renderModuleEditorPreview({ entry: { pages: [{ title: 'Seite', description }] } });
    const html = nodes['me-preview-frame'].innerHTML;
    assert.match(html, /width:768px;height:568px/);
    assert.doesNotMatch(html, /scale\(/);
    assert(html.includes(description));
    assert.equal(nodes['me-preview-stage'].scrollTop, 25);
    assert.equal(nodes['me-preview-empty'].hidden, true);
  }
});

test('custom module dimensions use the available editor frame', () => {
  const { context, nodes } = preview({ width: 432, height: 532 });
  context.renderModuleEditorPreview({ entry: { displaySize: { width: 80, height: 60 }, pages: [{}] } });
  assert.match(nodes['me-preview-frame'].innerHTML, /width:320px;height:300px/);
});

test('preview context is restored when a template renderer fails', () => {
  const { context } = preview();
  const previous = { entry: { id: 'outer-preview' } };
  context._moduleRenderPreviewContext = previous;
  context.buildPage = () => { throw new Error('Renderer failed'); };
  assert.throws(() => context.buildModuleEditorPreviewHtml({}, { id: 'inner-preview' }), /Renderer failed/);
  assert.equal(context._moduleRenderPreviewContext, previous);
});

test('an empty module clears an earlier preview and displays its validation message', () => {
  const { context, nodes } = preview();
  context.renderModuleEditorPreview({ entry: { pages: [{ description: 'Alt' }] } });
  context.renderModuleEditorPreview(null, 'Seite fehlt');
  assert.equal(nodes['me-preview-frame'].innerHTML, '');
  assert.equal(nodes['me-preview-stage'].hidden, true);
  assert.equal(nodes['me-preview-empty'].textContent, 'Seite fehlt');
});
