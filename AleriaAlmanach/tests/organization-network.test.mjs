import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = file => readFileSync(new URL(`../modules/${file}.js`, import.meta.url), 'utf8');
function loadNetwork() {
  const listeners = {};
  const draft = { organizationNetworkPage: true, organizationNetwork: { title: 'Original', sites: [{ name: 'Zentrale', kind: 'headquarters' }] } };
  let refreshes = 0;
  const context = vm.createContext({
    document: { addEventListener: (type, fn) => { listeners[type] = fn; } },
    registerRowSchema() {}, getRomanPageLabel: () => 'I.',
    getInlineDraftPageForSource: field => field.owner,
    scheduleInlineModuleLivePreviewRefresh: () => refreshes++
  });
  vm.runInContext(source('organization-network/organization-network-data'), context);
  vm.runInContext(source('organization-network/organization-network-editor'), context);
  return { context, draft, listeners, refreshes: () => refreshes };
}

test('network imports normalize malformed lists and unknown kinds and preserve intentional empty fields', () => {
  const { context } = loadNetwork();
  const sanitize = context.sanitizeOrganizationNetworkData;
  assert.equal(sanitize(null).sites.length, 0);
  assert.equal(sanitize({ sites: 'invalid' }).sites.length, 0);
  const normalized = sanitize({ title: '  Wege  ', sites: [null, {}, { name: '  Werkstatt ', kind: 'unknown' }, { description: 'Belegt' }] });
  assert.equal(normalized.title, 'Wege');
  assert.equal(normalized.sites.length, 2);
  assert.equal(normalized.sites[0].name, 'Werkstatt');
  assert.equal(normalized.sites[0].kind, 'branch');
  assert.deepEqual(sanitize(JSON.parse(JSON.stringify(normalized))), normalized);
  assert.equal(sanitize({ ...normalized, sites: [] }).sites.length, 0);
  assert.equal(sanitize({ ...normalized, title: '' }).title, '');
});

test('inline scalar edits use the owning network page and cannot write arbitrary fields', () => {
  const { draft, listeners, refreshes } = loadNetwork();
  const field = { owner: draft, dataset: { networkField: 'title' }, value: '<strong>Neue Wege</strong>', closest: () => ({}) };
  listeners.input({ target: field });
  assert.equal(draft.organizationNetwork.title, '<strong>Neue Wege</strong>');
  assert.equal(draft.organizationNetwork.sites[0].name, 'Zentrale');
  field.value = '';
  listeners.input({ target: field });
  assert.equal(draft.organizationNetwork.title, '');
  field.dataset.networkField = 'unownedField';
  listeners.input({ target: field });
  assert.equal(draft.organizationNetwork.unownedField, undefined);
  assert.equal(refreshes(), 2);
});

test('the shared icon picker updates its own field in arbitrary schema rows and ignores detached targets', () => {
  let opened = 0, closed = 0;
  const events = [];
  const context = vm.createContext({
    document: { addEventListener() {} }, Event: class { constructor(type) { this.type = type; } },
    openIconDirectory: () => opened++, closeIconDirectory: () => closed++
  });
  vm.runInContext(source('module-editor/module-editor-icon-field'), context);
  const target = { isConnected: true, value: 'old', dispatchEvent: event => events.push(event.type), focus() {} };
  const field = { querySelector: () => target };
  const button = { dataset: { schemaKey: 'organizationNetwork.sites', schemaField: 'image' }, closest: selector => selector === '[data-role="schema-icon-field"]' ? field : null };
  context.openSchemaIconPicker(button);
  context.handleSchemaIconSelected({ detail: { src: '../IconOrdner/Brief.PNG' } });
  assert.equal(target.value, '../IconOrdner/Brief.PNG');
  assert.deepEqual(events, ['input', 'change']);
  assert.equal(opened, 1);
  assert.equal(closed, 1);
  context.openSchemaIconPicker(button);
  target.isConnected = false;
  context.handleSchemaIconSelected({ detail: { src: '../different.png' } });
  assert.equal(target.value, '../IconOrdner/Brief.PNG');
});
