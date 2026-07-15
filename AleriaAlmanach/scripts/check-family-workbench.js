#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const listeners = {};
const changedEvents = [];
const source = { value: '' };
const title = { textContent: '' };
const personCount = { textContent: '' };
const relationCount = { textContent: '' };
const status = { textContent: '', dataset: {} };
const inspector = { innerHTML: '' };
const personEditorTitle = { textContent: '' };
const orientation = {
  value: 'vertical',
  closest(selector) {
    return selector === '[data-family-workbench-orientation]' ? this : null;
  }
};
const searchInput = { setAttribute() {} };
const search = { querySelector: () => searchInput, replaceChildren() {} };
const host = {
  clientWidth: 900,
  clientHeight: 620,
  replaceChildren() {},
  ownerDocument: { createElement: () => ({ className: '', setAttribute() {}, textContent: '' }) },
  appendChild() {}
};
const relativeButtons = ['partner', 'child', 'parent', 'association'].map(relationType => ({
  dataset: { familyWorkbenchAction: 'start-relative', familyRelationType: relationType },
  disabled: false,
  closest(selector) {
    return selector === '[data-family-workbench-action]' ? this : null;
  }
}));

class CustomEvent {
  constructor(type, config = {}) {
    this.type = type;
    this.detail = config.detail;
    this.bubbles = config.bubbles;
  }
}

const workbench = {
  dataset: { familyWorkbenchMode: 'module' },
  isConnected: true,
  ownerDocument: { defaultView: { CustomEvent } },
  matches: selector => selector === '.family-workbench',
  contains: () => true,
  addEventListener(type, handler) { listeners[type] = handler; },
  removeEventListener(type) { delete listeners[type]; },
  dispatchEvent(event) { changedEvents.push(event); return true; },
  querySelector(selector) {
    if (selector === '.family-v2-source-data') return source;
    if (selector === '[data-family-workbench-title]') return title;
    if (selector === '[data-family-workbench-person-count]') return personCount;
    if (selector === '[data-family-workbench-relation-count]') return relationCount;
    if (selector === '[data-family-workbench-status]') return status;
    if (selector === '[data-family-workbench-inspector]') return inspector;
    if (selector === '[data-family-person-editor-title]') return personEditorTitle;
    if (selector === '[data-family-workbench-chart]') return host;
    if (selector === '[data-family-workbench-search]') return search;
    if (selector === '[data-family-workbench-orientation]') return orientation;
    return null;
  },
  querySelectorAll(selector) {
    if (selector === '[data-family-workbench-action="start-relative"]') return relativeButtons;
    return [];
  }
};

function actionButton(action, extra = {}) {
  return {
    dataset: { familyWorkbenchAction: action, ...extra },
    closest(selector) {
      return selector === '[data-family-workbench-action]' ? this : null;
    }
  };
}

let chartConfig = null;
let currentChartFamily = null;
let destroyed = false;
let fitCount = 0;
let focusPersonId = '';
let orientationValue = 'vertical';
const session = {
  update(family, view) {
    currentChartFamily = family;
    focusPersonId = view.initialFocusPersonId;
    return true;
  },
  focus(personId) { focusPersonId = personId; return true; },
  fit() { fitCount += 1; },
  setOrientation(value) { orientationValue = value; },
  destroy() { destroyed = true; },
  getState() { return { focusPersonId, orientation: orientationValue, diagnostics: [], relations: {} }; },
  getData() { return currentChartFamily?.genealogy?.persons || []; }
};

const context = vm.createContext({
  console,
  structuredClone,
  CustomEvent,
  confirm: () => true,
  requestAnimationFrame(callback) { callback(); return 1; },
  cancelAnimationFrame() {}
});

[
  'modules/family/family-api.js',
  'modules/family/editor/family-editor-model.js',
  'modules/family/workbench/family-workbench-state.js',
  'modules/family/workbench/family-workbench-ui.js'
].forEach(relativePath => {
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, { filename: relativePath });
});

const family = context.AleriaFamily.editor.model.createDefaultFamily(0);
source.value = JSON.stringify(family);
context.AleriaFamily = Object.freeze({
  ...context.AleriaFamily,
  adapters: Object.freeze({
    familyChart: Object.freeze({
      createSession(config) {
        chartConfig = config;
        currentChartFamily = config.family;
        focusPersonId = config.view.initialFocusPersonId;
        return session;
      }
    })
  })
});
vm.runInContext(
  fs.readFileSync(path.join(root, 'modules/family/workbench/family-workbench-controller.js'), 'utf8'),
  context,
  { filename: 'modules/family/workbench/family-workbench-controller.js' }
);

context.AleriaFamily.workbench.mount({ root: workbench });
assert.ok(chartConfig, 'Die Workbench muss den Stammbaum Ã¼ber den isolierten Adapter aufbauen.');
assert.equal(personCount.textContent, '3');
assert.equal(relationCount.textContent, '2');
assert.match(inspector.innerHTML, /data-family-person-id="cassian-vael"/);
assert.match(inspector.innerHTML, /data-family-person-field="identity\.displayName"/);
assert.equal(context.AleriaFamily.workbench.getState(workbench).selectedPersonId, 'cassian-vael');

const nameInput = {
  type: 'text',
  value: 'Cassian der Erneuerte',
  dataset: { familyPersonField: 'identity.displayName' }
};
listeners.input({ target: nameInput });
assert.equal(JSON.parse(source.value).genealogy.persons.find(person => person.id === 'cassian-vael').identity.displayName, 'Cassian der Erneuerte');
assert.equal(personEditorTitle.textContent, 'Cassian der Erneuerte');

const addPerson = actionButton('add-person');
listeners.click({ target: addPerson, preventDefault() {} });
assert.equal(personCount.textContent, '4');
assert.equal(JSON.parse(source.value).genealogy.persons.length, 4);
assert.equal(changedEvents.at(-1).type, 'family-workbench-change');
assert.match(inspector.innerHTML, /Neue Person/);
assert.ok(fitCount >= 1, 'Die erste Darstellung muss eingepasst werden.');

const addPartner = actionButton('start-relative', { familyRelationType: 'partner' });
listeners.click({ target: addPartner, preventDefault() {} });
assert.match(inspector.innerHTML, /data-family-relative-editor/);
assert.match(inspector.innerHTML, /Neue Person anlegen/);
assert.equal(context.AleriaFamily.workbench.getState(workbench).activePanel, 'relative');

const relativeTarget = { value: '__new__' };
const relativePersonInputs = [
  { type: 'text', value: 'Selene Vael', dataset: { familyRelativePersonField: 'identity.displayName' } },
  { type: 'text', value: 'Hofmagierin', dataset: { familyRelativePersonField: 'profile.tagline' } }
];
const relativeRelationInputs = [
  { type: 'select-one', value: 'engagement', dataset: { familyRelativeField: 'kind' } },
  { type: 'select-one', value: 'active', dataset: { familyRelativeField: 'status' } }
];
const relativeForm = {
  dataset: { familyRelationType: 'partner' },
  closest(selector) { return selector === '[data-family-relative-editor]' ? this : null; },
  querySelector(selector) {
    if (selector === '[data-family-relative-target]') return relativeTarget;
    return null;
  },
  querySelectorAll(selector) {
    if (selector === '[data-family-relative-person-field]') return relativePersonInputs;
    if (selector === '[data-family-relative-field]') return relativeRelationInputs;
    return [];
  }
};
listeners.submit({ target: relativeForm, preventDefault() {} });
const submittedFamily = JSON.parse(source.value);
assert.equal(submittedFamily.genealogy.persons.length, 5);
assert.equal(submittedFamily.genealogy.partnerships.length, 2);
assert.equal(submittedFamily.genealogy.persons.at(-1).identity.displayName, 'Selene Vael');
assert.equal(submittedFamily.genealogy.partnerships.at(-1).kind, 'engagement');

chartConfig.onPersonClick({ personId: 'aeron-vael' });
assert.equal(workbench.dataset.familyWorkbenchSelectedPerson, 'aeron-vael');
assert.match(inspector.innerHTML, /data-family-person-id="aeron-vael"/);

const openFantasy = actionButton('open-manager', { familyManager: 'fantasy' });
listeners.click({ target: openFantasy, preventDefault() {} });
assert.match(inspector.innerHTML, /data-family-manager-view="fantasy"/);
assert.match(inspector.innerHTML, /genealogy\.fantasy\.houses/);
const retained = context.AleriaFamily.workbench.getState(workbench);

listeners.click({ target: actionButton('add-manager-record', { familyCollection: 'genealogy.fantasy.houses' }), preventDefault() {} });
assert.equal(JSON.parse(source.value).genealogy.fantasy.houses.length, 2);
assert.match(inspector.innerHTML, /data-family-record-id="house-2"/);

orientation.value = 'horizontal';
listeners.change({ target: orientation });
assert.equal(orientationValue, 'horizontal');
assert.equal(JSON.parse(source.value).view.orientation, 'horizontal');
assert.ok(currentChartFamily.genealogy.persons.length === 5);

listeners.click({ target: actionButton('show-person'), preventDefault() {} });
assert.match(inspector.innerHTML, /data-family-person-id="aeron-vael"/);
context.AleriaFamily.workbench.restore(workbench, retained);
assert.equal(context.AleriaFamily.workbench.getState(workbench).activePanel, 'manager');
assert.match(inspector.innerHTML, /data-family-manager-view="fantasy"/);

context.AleriaFamily.workbench.unmount({ root: workbench });
assert.equal(destroyed, true);
assert.equal(context.AleriaFamily.workbench.getState(workbench).chart, null);

console.log('Family-Workbench OK: direkter Personeneditor, Beziehungsdialog, Fachmanager, Chart-Lifecycle und Ã„nderungsereignisse geprÃ¼ft.');
