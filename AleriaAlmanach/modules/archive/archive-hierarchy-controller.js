// A mounted directory owns its snapshot until a data change or full rerender.
// Pure navigation never rebuilds the dashboard, store, character or creature UI.
const AleriaArchiveHierarchyController = (() => {
  let views = new WeakMap();
  function mount(root, { model, sectionByEntry, manageMode }) {
    views.set(root, { model, sectionByEntry, manageMode });
  }
  function update(root, path, { toggleOnly = false } = {}) {
    const state = root && views.get(root);
    if (!state || !root.isConnected) return false;
    const tree = root.querySelector('.archive-hierarchy-tree');
    const scroll = tree.querySelector('.archive-hierarchy-tree-scroll').scrollTop;
    const selected = toggleOnly ? getActiveArchivePath(state.model.tab) : path;
    tree.outerHTML = renderArchiveHierarchyBrowser(state.model, selected, { navigationOpen: tree.open });
    root.querySelector('.archive-hierarchy-tree-scroll').scrollTop = scroll;
    if (!toggleOnly) {
      const node = findArchiveHierarchyNode(state.model.root, path) || state.model.root;
      const content = root.querySelector('.archive-browser-content');
      content.innerHTML = renderArchiveHierarchyContentHeading(node, state.model) + '<div class="card-grid"></div>';
      renderArchiveSectionCards(content.querySelector('.card-grid'), getArchiveHierarchySection(node, state.model.tab), node.entries, state);
    }
    return true;
  }
  function invalidate() { views = new WeakMap(); }
  window.addEventListener('almanach:modules-changed', invalidate);
  return Object.freeze({ mount, update, invalidate });
})();
