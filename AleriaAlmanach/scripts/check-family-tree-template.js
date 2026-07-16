#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const projectRoot = path.resolve(root, '..');
const html = fs.readFileSync(path.join(root, 'AleriaAlmanach.html'), 'utf8');
const catalogSource = fs.readFileSync(path.join(root, 'modules/family-tree-embed/family-tree-embed-catalog.js'), 'utf8');
const templatesSource = fs.readFileSync(path.join(root, 'modules/module-editor/module-editor-templates.js'), 'utf8');
const transferSource = fs.readFileSync(path.join(root, 'modules/module-editor/module-editor-template-transfer.js'), 'utf8');

const context = vm.createContext({
  console,
  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  getRomanPageLabel: () => 'I.',
  inferModulePageType: page => page?.familyTreePage ? 'family-tree' : 'standard',
  getTrimmedFormValue: () => '',
  getFormValue: () => '',
  getInlineDraftPageForSource: () => null,
  scheduleInlineModuleLivePreviewRefresh() {},
  buildNav: () => '<nav>Navigation</nav>',
  queueMicrotask() {},
  CustomEvent: class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  },
  document: {
    addEventListener() {},
    dispatchEvent() {},
    querySelectorAll: () => []
  }
});

[
  'modules/family-tree-embed/family-tree-embed-data.js',
  'modules/family-tree-embed/family-tree-embed-editor.js',
  'modules/family-tree-embed/family-tree-embed-renderer.js'
].forEach(relativePath => {
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, { filename: relativePath });
});
vm.runInContext(catalogSource, context, { filename: 'modules/family-tree-embed/family-tree-embed-catalog.js' });

const checks = vm.runInContext(`(() => {
  const defaults = createDefaultFamilyTreeEmbedPage(0);
  const safe = sanitizeFamilyTreeEmbedData({ source: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-arwydd&mode=edit', height: 880 });
  const explicit = sanitizeFamilyTreeEmbedData({ familyId: 'haus-wyrm' });
  const migratedEncoded = sanitizeFamilyTreeEmbedData({ source: '../Stammb%C3%A4ume/index.html?family=haus-arwydd&mode=edit' });
  const migratedUnicode = sanitizeFamilyTreeEmbedData({ source: '../Stammbäume/index.html?family=haus-draig#linie' });
  const rejected = sanitizeFamilyTreeEmbedData({ source: 'https://example.com/tree', height: 9999 });
  return {
    defaults,
    safe,
    explicit,
    migratedEncoded,
    migratedUnicode,
    rejected,
    catalogRecords: mergeFamilyTreeEmbedCatalogRecords(
      [{ id: 'haus-wyrm', title: 'Haus Wyrm', folderPath: ['Gwynthor'], source: 'project' }],
      [{ id: 'haus-wyrm', title: 'Haus Wyrm', folderPath: [], source: 'firebase' }, { id: 'haus-arwydd', title: 'Haus Arwydd', folderPath: ['Castellbryn'] }]
    ),
    moduleEditor: buildFamilyTreeEmbedModuleEditorFields(safe),
    inlineEditor: buildInlineFamilyTreeEmbedEditor(safe),
    rendered: buildFamilyTreeEmbedPage({ familyTreePage: true, familyTree: safe }, {}, 0, 1),
    emptyRendered: buildFamilyTreeEmbedPage(defaults, {}, 0, 1)
  };
})()`, context);

assert.equal(checks.defaults.familyTreePage, true);
assert.equal(checks.defaults.familyTree.familyId, '');
assert.equal(checks.safe.familyId, 'haus-arwydd');
assert.equal(checks.safe.source, '../Stammb%C3%A4ume/Stammbaum.html?family=haus-arwydd&mode=view');
assert.equal(checks.safe.height, 880);
assert.equal(checks.explicit.source, '../Stammb%C3%A4ume/Stammbaum.html?family=haus-wyrm&mode=view');
assert.equal(checks.migratedEncoded.source, '../Stammb%C3%A4ume/Stammbaum.html?family=haus-arwydd&mode=view');
assert.equal(checks.migratedUnicode.source, '../Stammb%C3%A4ume/Stammbaum.html?family=haus-draig&mode=view');
assert.equal(checks.rejected.source, '../Stammb%C3%A4ume/Stammbaum.html?mode=view', 'Externe Frame-Ziele dürfen nicht übernommen werden.');
assert.equal(checks.rejected.height, 1200);
assert.deepEqual(JSON.parse(JSON.stringify(checks.catalogRecords)), [
  { id: 'haus-arwydd', title: 'Haus Arwydd', folderPath: ['Castellbryn'], source: 'project' },
  { id: 'haus-wyrm', title: 'Haus Wyrm', folderPath: ['Gwynthor'], source: 'firebase' }
]);
assert.match(checks.moduleEditor, /data-family-tree-catalog-select/);
assert.match(checks.moduleEditor, /me-family-tree-family-id/);
assert.doesNotMatch(checks.moduleEditor, /me-family-tree-source/);
assert.match(checks.inlineEditor, /data-family-tree-field="familyId"/);
assert.match(checks.rendered, /<iframe/);
assert.match(checks.rendered, /sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"/);
assert.match(checks.rendered, /src="\.\.\/Stammb%C3%A4ume\/Stammbaum\.html\?family=haus-arwydd&amp;mode=view"/);
assert.doesNotMatch(checks.emptyRendered, /<iframe/);
assert.match(checks.emptyRendered, /Noch kein Stammbaum ausgewählt/);

assert.match(catalogSource, /listFamilyRecords/);
assert.match(catalogSource, /listGenealogyFamilies/);
assert.match(catalogSource, /AleriaFamilyTreeEmbedCatalog/);
assert.match(templatesSource, /'family-tree':\s*\{/);
assert.match(templatesSource, /family:\s*\{[\s\S]*?listed:\s*false,/);
assert.match(templatesSource, /MODULE_TEMPLATE_OPTIONS[\s\S]*?filter\(template => template\.listed !== false\)/);
assert.match(transferSource, /family:\s*\{[\s\S]*?listed:\s*false,/);
assert.doesNotMatch(html, /<option value="family">/);
assert.equal((html.match(/<option value="family-tree">Stammbaum<\/option>/g) || []).length, 2);
assert.match(html, /family-tree-embed-catalog\.js/);
assert.ok(fs.existsSync(path.join(projectRoot, 'Stammbäume', 'Stammbaum.html')), 'Die eingebettete Stammbäume-Anwendung fehlt.');

console.log('Stammbaum-Template OK: Registry-Auswahl, stabile Familien-ID, View-URL, leerer Zustand und sichere Einbettung geprüft.');
