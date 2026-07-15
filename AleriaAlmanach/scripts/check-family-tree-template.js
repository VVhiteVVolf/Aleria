#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const projectRoot = path.resolve(root, '..');
const html = fs.readFileSync(path.join(root, 'AleriaAlmanach.html'), 'utf8');
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
  buildNav: () => '<nav>Navigation</nav>'
});

[
  'modules/family-tree-embed/family-tree-embed-data.js',
  'modules/family-tree-embed/family-tree-embed-editor.js',
  'modules/family-tree-embed/family-tree-embed-renderer.js'
].forEach(relativePath => {
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, { filename: relativePath });
});

const checks = vm.runInContext(`(() => {
  const defaults = createDefaultFamilyTreeEmbedPage(0);
  const safe = sanitizeFamilyTreeEmbedData({ source: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-arwydd&mode=edit', height: 880 });
  const rejected = sanitizeFamilyTreeEmbedData({ source: 'https://example.com/tree', height: 9999 });
  return {
    defaults,
    safe,
    rejected,
    moduleEditor: buildFamilyTreeEmbedModuleEditorFields(defaults),
    inlineEditor: buildInlineFamilyTreeEmbedEditor(defaults),
    rendered: buildFamilyTreeEmbedPage(defaults, {}, 0, 1)
  };
})()`, context);

assert.equal(checks.defaults.familyTreePage, true);
assert.equal(checks.safe.source, '../Stammb%C3%A4ume/Stammbaum.html?family=haus-arwydd&mode=view');
assert.equal(checks.safe.height, 880);
assert.equal(checks.rejected.source, '../Stammb%C3%A4ume/Stammbaum.html?mode=view', 'Externe Frame-Ziele dürfen nicht übernommen werden.');
assert.equal(checks.rejected.height, 1200);
assert.match(checks.moduleEditor, /data-page-type="family-tree"/);
assert.match(checks.moduleEditor, /E:\\Aleria\\Stammbäume/);
assert.match(checks.inlineEditor, /data-inline-action="update-family-tree-embed-field"/);
assert.match(checks.rendered, /<iframe/);
assert.match(checks.rendered, /sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"/);
assert.match(checks.rendered, /src="\.\.\/Stammb%C3%A4ume\/Stammbaum\.html\?mode=view"/);

assert.match(templatesSource, /'family-tree':\s*\{/);
assert.match(templatesSource, /family:\s*\{[\s\S]*?listed:\s*false,/);
assert.match(templatesSource, /MODULE_TEMPLATE_OPTIONS[\s\S]*?filter\(template => template\.listed !== false\)/);
assert.match(transferSource, /family:\s*\{[\s\S]*?listed:\s*false,/);
assert.doesNotMatch(html, /<option value="family">/);
assert.equal((html.match(/<option value="family-tree">Stammbaum<\/option>/g) || []).length, 2);
assert.ok(fs.existsSync(path.join(projectRoot, 'Stammbäume', 'Stammbaum.html')), 'Die eingebettete Stammbäume-Anwendung fehlt.');

console.log('Stammbaum-Template OK: Family ausgeklammert, neue Einbettung registriert, same-origin Quelle und getrennte Anwendung geprüft.');
