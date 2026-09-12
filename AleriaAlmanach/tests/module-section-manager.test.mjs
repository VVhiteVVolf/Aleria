import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function manager() {
  const elements = new Map();
  const getElement = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', dataset: {}, checked: false, hidden: false, innerHTML: '', textContent: '',
      setAttribute() {}, querySelectorAll: () => [], querySelector: () => null, focus() {}
    });
    return elements.get(id);
  };
  const context = vm.createContext({
    document: { getElementById: getElement, addEventListener() {}, querySelector: () => null },
    window: { addEventListener() {} },
    normalizeSearchText: value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
    escapeHtml: value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]),
    sanitizeImageSrc: value => value,
    saveModuleStore() {}, renderAll() {}, showAppStatus() {},
    _activeTab: 'Alle',
    SECTIONS: [
      { key: 'Magie', tab: 'Magie', entries: [{ id: 'zauber-10', title: 'Zauber 10', type: 'Zauber' }] },
      { key: 'Akademie', tab: 'Magie', path: ['Akademie'], entries: [{ id: 'zauber-2', title: 'Zauber 2', type: 'Zauber' }, { id: 'gelehrte', title: 'Älteste Gelehrte', type: 'Person' }] },
      { key: 'Gruppen', tab: 'Gruppen', entries: [{ id: 'chronik', title: 'Chronik', type: 'Chronik' }] }
    ]
  });
  for (const file of [
    'core/app-core.js', 'module-store/module-store-tree.js', 'module-store/module-store-sections.js',
    'module-section-manager/module-section-manager-view.js', 'module-store/module-section-management.js'
  ]) vm.runInContext(readFileSync(new URL(`../modules/${file}`, import.meta.url), 'utf8'), context);
  vm.runInContext('sanitizeModuleEntry = entry => JSON.parse(JSON.stringify(entry));', context);
  const run = source => vm.runInContext(source, context);
  run('moduleSectionManagerView.refresh(getUniqueModuleSections(), getModuleSectionManagerEntries());');
  const view = run('moduleSectionManagerView');
  const items = () => run('getModuleSectionManagerEntries()');
  const ids = search => Array.from(view.visibleEntries(items(), search), item => item.entry.id);
  const action = (name, dataset = {}) => view.handleClick(name, { dataset });
  const change = (name, value) => view.handleChange({ dataset: { sectionManagerView: name }, type: typeof value === 'boolean' ? 'checkbox' : 'select-one', checked: value, value });
  return { context, run, view, ids, action, change, elements, getElement };
}

test('title sorting is German, numeric, reversible and leaves stored module order intact', () => {
  const { ids, change, run } = manager();
  assert.deepEqual(ids(), ['gelehrte', 'chronik', 'zauber-2', 'zauber-10']);
  change('sort', 'title-desc');
  assert.deepEqual(ids(), ['zauber-10', 'zauber-2', 'chronik', 'gelehrte']);
  assert.equal(run('SECTIONS[1].entries[0].id'), 'zauber-2');
});

test('section scoping includes descendants optionally and combines type, words and ID search', () => {
  const { ids, action, change } = manager();
  action('select-section', { sectionSignature: 'node::root:magie' });
  assert.deepEqual(ids(), ['gelehrte', 'zauber-2', 'zauber-10']);
  change('descendants', false);
  assert.deepEqual(ids(), ['zauber-10']);
  change('descendants', true);
  change('type', 'Person');
  assert.deepEqual(ids('alteste magie'), ['gelehrte']);
  assert.deepEqual(ids('zauber'), []);
  change('type', '');
  assert.deepEqual(ids('zauber-2'), ['zauber-2']);
});

test('hidden selection persists across areas and is explicitly counted in the bulk bar', () => {
  const { run, action, change, ids, getElement } = manager();
  run("_selectedModuleSectionManagerIds.add('zauber-2'); _selectedModuleSectionManagerIds.add('chronik');");
  action('select-section', { sectionSignature: 'node::root:magie' });
  assert.match(getElement('msm-module-bulk-count').textContent, /2 ausgewählt · 1 außerhalb/);
  assert.equal(getElement('msm-module-select-all').indeterminate, true);
  change('selectedOnly', true);
  assert.deepEqual(ids(), ['zauber-2']);
  action('select-section', { sectionSignature: '' });
  assert.deepEqual(ids(), ['chronik', 'zauber-2']);
});

test('bulk move requires an explicit destination and reuses persistent section assignment', () => {
  const { context, run, getElement } = manager();
  run("_selectedModuleSectionManagerIds.add('zauber-2');");
  context.bulkMoveModuleSectionManagerSelection();
  assert.equal(run("findCurrentSectionByEntryId('zauber-2').section.tab"), 'Magie');
  assert.match(getElement('module-section-manager-status').textContent, /Zielbereich/);
  assert.equal(context.moveModuleToSection('zauber-2', 'node::root:gruppen', { silent: true }), true);
  assert.equal(run("_moduleNodeAssignments['zauber-2']"), 'root:gruppen');
  assert.equal(run("findCurrentSectionByEntryId('zauber-2').section.tab"), 'Gruppen');
});

test('tree search reveals matching descendants with ancestors despite collapsed branches', () => {
  const { context, getElement, run } = manager();
  run("_collapsedModuleSectionNodeIds.add('root:magie');");
  getElement('msm-section-filter').value = 'Akademie';
  context.renderModuleSectionManagerSections(context.getUniqueModuleSections());
  const html = getElement('msm-section-list').innerHTML;
  assert.match(html, /node::root:magie/);
  assert.match(html, /node::node:magie:akademie/);
  assert.doesNotMatch(html, /node::root:gruppen/);
});

test('section move refuses cycles and other main tabs', () => {
  const { context } = manager();
  assert.equal(context.moveModuleSectionToParent('node::node:magie:akademie', 'node::node:magie:akademie'), false);
  assert.equal(context.moveModuleSectionToParent('node::node:magie:akademie', 'node::root:gruppen'), false);
});

test('nested area creation preserves the chosen icon on the leaf only', () => {
  const { context } = manager();
  context.ensureModuleSectionPath({ tab: 'Magie', key: 'Nordturm', path: ['Akademie', 'Nordturm'], desc: 'Archiv der Akademie', iconUrl: '../IconOrdner/nordturm.png' });
  const leaf = context.findSectionBySignature('node::node:magie:akademie/nordturm');
  assert.equal(leaf.iconUrl, '../IconOrdner/nordturm.png');
  assert.equal(leaf.desc, 'Archiv der Akademie');
  assert.equal(context.findSectionBySignature('node::node:magie:akademie').iconUrl, undefined);
});

test('module titles, IDs and locations are escaped before insertion into the DOM', () => {
  const { context, getElement, run } = manager();
  run(`SECTIONS[0].entries.push({ id: 'unsafe', title: '<img src=x onerror=alert(1)>', type: '<b>Type</b>' });`);
  context.renderModuleSectionManagerModules(context.getModuleSectionManagerEntries());
  const html = getElement('msm-module-list').innerHTML;
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img src=x|<b>Type/);
});
