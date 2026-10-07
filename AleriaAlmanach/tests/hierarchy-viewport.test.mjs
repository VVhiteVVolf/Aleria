import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function fixture(mode = 'groups') {
  const frames = [];
  const context = vm.createContext({ document: { addEventListener() {} }, requestAnimationFrame: fn => frames.push(fn) });
  for (const file of ['hierarchy/hierarchy-renderer', 'inline-editor/inline-editor-state']) {
    vm.runInContext(readFileSync(new URL(`../modules/${file}.js`, import.meta.url), 'utf8'), context);
  }
  const panels = Array.from({ length: 3 }, (_, index) => ({
    dataset: { hierarchyTreePanel: String(index) },
    active: true,
    classList: { toggle(_name, value) { panels[index].active = value; } }
  }));
  const viewport = {
    dataset: {}, clientWidth: 500, clientLeft: 1, scrollLeft: 0, scrollTop: 0,
    getBoundingClientRect: () => ({ left: 100 }),
    querySelector: () => mode === 'groups' ? { getBoundingClientRect: () => ({ left: 1400 - viewport.scrollLeft, width: 300 }) } : null
  };
  const page = {
    isConnected: true, classList: { toggle() {} },
    querySelector: selector => selector === '.hierarchy-chart-viewport' ? viewport : selector === '.hierarchy-tree-mode-tabs' && mode === 'tabs' ? {} : null,
    querySelectorAll: selector => selector === '[data-hierarchy-tree-panel]' ? panels : []
  };
  const root = { querySelectorAll: selector => selector === '.hierarchy-page' ? [page] : [] };
  return { context, root, page, viewport, panels, frames };
}

test('wide connected hierarchies open on the root, while tabbed trees keep their origin', () => {
  const grouped = fixture();
  grouped.context.mountHierarchyPage({ root: grouped.root });
  assert.equal(grouped.viewport.scrollLeft, 1199);
  const tabbed = fixture('tabs');
  tabbed.context.mountHierarchyPage({ root: tabbed.root });
  assert.equal(tabbed.viewport.scrollLeft, 0);
});

test('a hidden modal centers after opening, but saved positions and detached pages take precedence', () => {
  for (const action of ['open', 'restore', 'detach']) {
    const f = fixture();
    f.viewport.clientWidth = 0;
    f.context.mountHierarchyPage({ root: f.root });
    assert.equal(f.frames.length, 1);
    f.viewport.clientWidth = 500;
    if (action === 'restore') f.context.restoreInlinePreviewRuntimeState({ hierarchies: [{ index: 0, chartLeft: 210, chartTop: 75 }] }, f.root);
    if (action === 'detach') f.page.isConnected = false;
    f.frames[0]();
    assert.equal(f.viewport.scrollLeft, action === 'restore' ? 210 : action === 'detach' ? 0 : 1199);
  }
});

test('editor restoration keeps every connected or parallel branch, and only the chosen tab', () => {
  for (const mode of ['groups', 'parallel', 'tabs']) {
    const f = fixture(mode);
    f.context.restoreInlinePreviewRuntimeState({ hierarchies: [{ index: 0, tree: '1', chartTop: 80, chartLeft: 240 }] }, f.root);
    assert.deepEqual(f.panels.map(panel => panel.active), mode === 'tabs' ? [false, true, false] : [true, true, true]);
    assert.equal(f.viewport.scrollTop, 80);
    assert.equal(f.viewport.scrollLeft, 240);
  }
});
