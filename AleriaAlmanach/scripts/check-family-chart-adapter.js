const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const almanachRoot = path.resolve(__dirname, '..');
const context = { console };
const animationFrames = [];
context.requestAnimationFrame = callback => {
  animationFrames.push(callback);
  return animationFrames.length;
};
context.cancelAnimationFrame = () => {};
context.window = context;
context.globalThis = context;
vm.createContext(context);

[
  'vendor/d3/7.9.0/d3.min.js',
  'vendor/family-chart/0.9.0/family-chart.min.js',
  'modules/family/family-api.js',
  'modules/family/services/family-presentation-service.js',
  'modules/family/compatibility/family-legacy-bridge.js',
  'modules/family/adapters/family-chart-adapter.js',
  'modules/family/rendering/family-chart-controller.js'
].forEach(source => {
  vm.runInContext(fs.readFileSync(path.join(almanachRoot, source), 'utf8'), context, { filename: source });
});

const adapter = context.AleriaFamily.adapters.familyChart;
const compatibility = context.AleriaFamily.compatibility;
const family = {
  schema: 'aleria.family',
  schemaVersion: 2,
  genealogy: {
    persons: [
      { id: 'parent-a', recordType: 'person', identity: { displayName: 'A', givenNames: ['A'] }, profile: { tagline: 'Oberhaupt' }, sex: 'male', life: { status: 'alive', birth: '400 n. E.', death: null } },
      { id: 'parent-b', recordType: 'person', identity: { displayName: 'B', givenNames: ['B'] }, sex: 'female' },
      { id: 'child', recordType: 'person', identity: { displayName: 'Kind' }, sex: 'unknown' },
      { id: 'partner-c', recordType: 'person', identity: { displayName: '<img src=x onerror=alert(1)>' }, sex: 'female' },
      { id: 'unknown-parent', recordType: 'placeholder', identity: { displayName: 'Unbekannt' }, sex: 'male' }
    ],
    partnerships: [
      {
        id: 'marriage',
        participantIds: ['parent-a', 'parent-b'],
        kind: 'marriage',
        status: 'ended',
        endReason: 'divorce',
        assertion: { certainty: 'confirmed', visibility: 'public' }
      },
      {
        id: 'affair',
        participantIds: ['parent-a', 'partner-c'],
        kind: 'affair',
        assertion: { certainty: 'confirmed', visibility: 'secret' }
      },
      {
        id: 'broken-reference',
        participantIds: ['parent-a', 'missing'],
        kind: 'union'
      }
    ],
    parentages: [
      {
        id: 'birth',
        childId: 'child',
        parentIds: ['parent-a', 'parent-b'],
        kind: 'biological',
        partnershipId: 'marriage',
        legitimacy: { status: 'legitimized' },
        assertion: { certainty: 'confirmed', visibility: 'public' }
      },
      {
        id: 'adoption',
        childId: 'child',
        parentIds: ['partner-c'],
        kind: 'adoptive',
        assertion: { certainty: 'confirmed', visibility: 'public' }
      },
      {
        id: 'unknown-line',
        childId: 'parent-a',
        parentIds: ['unknown-parent'],
        kind: 'biological',
        assertion: { certainty: 'confirmed', visibility: 'public' }
      }
    ],
    fantasy: {
      houses: [{ id: 'house-a', name: 'Haus A' }],
      houseAffiliations: [{ id: 'affiliation-a', personId: 'parent-a', houseId: 'house-a', status: 'active' }],
      titles: [{ id: 'title-a', name: 'Herr des Nordens' }],
      titleHoldings: [{ id: 'holding-a', personId: 'parent-a', titleId: 'title-a', status: 'current' }],
      claims: [],
      successionDecisions: [{ id: 'succession-child', personId: 'child', rank: 1, status: 'heir' }],
      bloodlines: [{ id: 'bloodline-a', name: 'Silberblut' }],
      bloodlineLinks: [{ id: 'bloodline-child', personId: 'child', bloodlineId: 'bloodline-a' }]
    }
  }
};

const originalJson = JSON.stringify(family);
const converted = adapter.toFamilyChartData(family);
const byId = new Map(converted.data.map(person => [person.id, person]));

assert.strictEqual(context.AleriaFamily.schemaVersion, 2);
assert.strictEqual(Object.isFrozen(context.AleriaFamily), true);
assert.strictEqual(Object.isFrozen(adapter), true);
assert.strictEqual(adapter.libraryVersion, '0.9.0');
assert.deepStrictEqual([...byId.get('parent-a').rels.spouses], ['parent-b', 'partner-c']);
assert.deepStrictEqual([...byId.get('parent-b').rels.spouses], ['parent-a']);
assert.deepStrictEqual([...byId.get('child').rels.parents], ['parent-a', 'parent-b']);
assert.deepStrictEqual([...byId.get('parent-a').rels.parents], ['unknown-parent']);
assert.deepStrictEqual([...byId.get('parent-a').rels.children], ['child']);
assert.strictEqual(byId.get('child').data.gender, 'F');
assert.strictEqual(byId.get('partner-c').data.displayNameHtml, '&lt;img src=x onerror=alert(1)&gt;');
assert.strictEqual(byId.get('parent-a').data.contextLine, 'Herr des Nordens · Haus A');
assert.strictEqual(byId.get('parent-a').data.lifeLine, '* 400 n. E.');
assert.strictEqual(byId.get('child').data.contextLine, 'Erbfolge 1 · Silberblut');
assert.strictEqual(converted.relations.partnerships.find(item => item.partnershipIds.includes('marriage')).label, 'Ehe · geschieden');
assert.ok(converted.diagnostics.some(item => item.code === 'LAYOUT_GENDER_FALLBACK'));
assert.ok(converted.diagnostics.some(item => item.code === 'PARENTAGE_VARIANTS_NOT_RENDERED'));
assert.ok(converted.diagnostics.some(item => item.code === 'MISSING_PARTNERSHIP_PERSON'));
assert.strictEqual(JSON.stringify(family), originalJson, 'Der Adapter darf Aleria-Daten nicht verändern.');
const nativeLayout = context.f3.calculateTree(JSON.parse(JSON.stringify(converted.data)), {
  main_id: 'child',
  single_parent_empty_card: false,
  show_siblings_of_main: true
});
assert.strictEqual(nativeLayout.main_id, 'child');
assert.ok(nativeLayout.data.some(node => node.data.id === 'parent-a'));
assert.ok(nativeLayout.data.some(node => node.data.id === 'parent-b'));
assert.ok(nativeLayout.dim.width > 0 && nativeLayout.dim.height > 0);

const legacyProjection = compatibility.read({
  eyebrow: 'Familie',
  layoutMode: 'vertical',
  trees: [{
    id: 'main-line',
    label: 'Hauptlinie',
    levels: [
      { nodes: [
        { id: 'legacy-a', title: 'Legacy A', familyType: 'direct', parentIds: [] },
        { id: 'legacy-b', title: 'Legacy B', familyType: 'affair', parentIds: [] }
      ] },
      { nodes: [
        { id: 'legacy-child', title: 'Legacy Kind', familyType: 'bastard', parentIds: ['legacy-a', 'legacy-b'] }
      ] }
    ],
    connections: [
      { from: 'legacy-a', to: 'legacy-b', relationType: 'affair', label: 'Affäre' },
      { from: 'legacy-a', to: 'legacy-child', relationType: 'sibling', label: 'Veraltete Ableitung' }
    ]
  }]
});
assert.strictEqual(legacyProjection.migrated, true);
assert.strictEqual(legacyProjection.family.schemaVersion, 2);
assert.strictEqual(legacyProjection.family.genealogy.persons.length, 3);
assert.strictEqual(legacyProjection.family.genealogy.partnerships[0].kind, 'affair');
assert.strictEqual(legacyProjection.family.genealogy.parentages[0].partnershipId, legacyProjection.family.genealogy.partnerships[0].id);
assert.strictEqual(legacyProjection.family.genealogy.parentages[0].legitimacy.status, 'illegitimate');
assert.strictEqual(legacyProjection.family.genealogy.associations.length, 0);
assert.strictEqual(compatibility.read(family).family, family);

const adoptiveView = adapter.toFamilyChartData(family, { parentageKinds: ['adoptive', 'biological'] });
const adoptiveChild = adoptiveView.data.find(person => person.id === 'child');
assert.deepStrictEqual([...adoptiveChild.rels.parents], ['partner-c']);

const restricted = adapter.toFamilyChartData(family, { visibleVisibilities: ['public'] });
const restrictedParent = restricted.data.find(person => person.id === 'parent-a');
assert.deepStrictEqual([...restrictedParent.rels.spouses], ['parent-b']);

const edgeCases = adapter.toFamilyChartData({
  persons: [
    { id: 'a', identity: { displayName: 'A' }, sex: 'male' },
    { id: 'b', identity: { displayName: 'B' }, sex: 'female' },
    { id: 'c', identity: { displayName: 'C' }, sex: 'unknown' },
    { id: 'd', identity: { displayName: 'D' }, sex: 'female' }
  ],
  partnerships: [
    { id: 'group-union', participantIds: ['a', 'b', 'c'], kind: 'union' },
    { id: 'later-marriage', participantIds: ['a', 'b'], kind: 'marriage' }
  ],
  parentages: [
    { id: 'three-parents', childId: 'd', parentIds: ['a', 'b', 'c'], kind: 'biological' },
    { id: 'cycle', childId: 'a', parentIds: ['d'], kind: 'biological' }
  ]
});
const edgeCasePeople = new Map(edgeCases.data.map(person => [person.id, person]));
assert.deepStrictEqual([...edgeCasePeople.get('d').rels.parents], ['a', 'b']);
assert.deepStrictEqual([...edgeCasePeople.get('a').rels.parents], []);
assert.ok(edgeCases.diagnostics.some(item => item.code === 'MULTI_PARTICIPANT_PARTNERSHIP_EXPANDED'));
assert.ok(edgeCases.diagnostics.some(item => item.code === 'MULTIPLE_PARTNERSHIPS_COLLAPSED'));
assert.ok(edgeCases.diagnostics.some(item => item.code === 'TOO_MANY_LAYOUT_PARENTS'));
assert.ok(edgeCases.diagnostics.some(item => item.code === 'ANCESTRY_CYCLE_SKIPPED'));

function createFakeLibrary(calls) {
  return {
    createChart(container, data) {
      calls.push(['createChart', data.length]);
      const card = {
        setCardDisplay(value) { calls.push(['setCardDisplay', value.length]); return this; },
        setOnCardClick(value) { this.onClick = value; calls.push(['setOnCardClick']); return this; }
      };
      return {
        personSearch: null,
        setTransitionTime(value) { calls.push(['setTransitionTime', value]); return this; },
        setShowSiblingsOfMain(value) { calls.push(['setShowSiblingsOfMain', value]); return this; },
        setAncestryDepth(value) { calls.push(['setAncestryDepth', value]); return this; },
        setProgenyDepth(value) { calls.push(['setProgenyDepth', value]); return this; },
        setSingleParentEmptyCard(value) { calls.push(['setSingleParentEmptyCard', value]); return this; },
        setOrientationVertical() { calls.push(['setOrientationVertical']); return this; },
        setOrientationHorizontal() { calls.push(['setOrientationHorizontal']); return this; },
        setLinkSpouseText(value) { this.getSpouseText = value; calls.push(['setLinkSpouseText']); return this; },
        setCardHtml() { calls.push(['setCardHtml']); return card; },
        setPersonDropdown(getLabel, options) {
          this.personSearch = { destroy() { calls.push(['destroyPersonSearch']); } };
          this.personSearchConfig = { getLabel, options };
          calls.push(['setPersonDropdown', options.placeholder, options.cont, getLabel, options.onSelect]);
          return this;
        },
        unSetPersonSearch() {
          this.personSearch?.destroy();
          this.personSearch = null;
          calls.push(['unSetPersonSearch']);
          return this;
        },
        setAfterUpdate(value) { this.afterUpdate = value; calls.push(['setAfterUpdate']); return this; },
        updateMainId(value) { calls.push(['updateMainId', value]); return this; },
        updateTree(value) { calls.push(['updateTree', value.tree_position]); return this; },
        updateData(value) { calls.push(['updateData', value.length]); return this; }
      };
    }
  };
}

const calls = [];
let cleared = false;
const libraryClasses = new Set();
const sessionSearchHost = {};
const session = adapter.createSession({
  container: {
    classList: {
      add(...names) { names.forEach(name => libraryClasses.add(name)); },
      remove(...names) { names.forEach(name => libraryClasses.delete(name)); }
    },
    replaceChildren() { cleared = true; }
  },
  searchContainer: sessionSearchHost,
  searchPlaceholder: 'Person finden',
  family,
  library: createFakeLibrary(calls),
  view: {
    initialFocusPersonId: 'child',
    orientation: 'vertical',
    ancestorDepth: 2,
    descendantDepth: 3,
    showSiblings: true,
    fitOnOpen: true
  }
});

assert.strictEqual(session.getState().focusPersonId, 'child');
assert.deepStrictEqual([...libraryClasses].sort(), ['f3', 'f3-cont']);
const personDropdownCall = calls.find(call => call[0] === 'setPersonDropdown');
assert.strictEqual(personDropdownCall[3]({ data: { displayName: 'Testperson' } }), 'Testperson');
personDropdownCall[4]('parent-b');
assert.strictEqual(session.getState().focusPersonId, 'parent-b');
assert.strictEqual(session.focus('parent-a'), true);
assert.strictEqual(session.focus('missing'), false);
session.setOrientation('horizontal');
session.fit();
assert.strictEqual(session.update(family, { initialFocusPersonId: 'parent-b', orientation: 'vertical' }), true);
assert.ok(calls.some(call => call[0] === 'createChart'));
assert.ok(calls.some(call => call[0] === 'setCardHtml'));
assert.ok(calls.some(call => call[0] === 'setCardDisplay' && call[1] === 4));
assert.ok(calls.some(call => call[0] === 'setPersonDropdown'
  && call[1] === 'Person finden'
  && call[2] === sessionSearchHost));
assert.ok(calls.some(call => call[0] === 'updateTree' && call[1] === 'fit'));
assert.ok(calls.some(call => call[0] === 'updateTree' && call[1] === 'main_to_middle'));
assert.ok(calls.some(call => call[0] === 'updateData'));
session.destroy();
assert.strictEqual(session.isDestroyed(), true);
assert.strictEqual(cleared, true);
assert.deepStrictEqual([...libraryClasses], []);
assert.throws(() => session.fit(), error => error.code === 'FAMILY_CHART_SESSION_DESTROYED');

const controllerCalls = [];
context.f3 = createFakeLibrary(controllerCalls);
context.d3 = {};
const optionDocument = {
  createElement() {
    return { value: '', textContent: '' };
  }
};
const statusElement = { textContent: '', dataset: {} };
const searchInput = {
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; }
};
const searchHost = {
  querySelector(selector) { return selector === 'input' ? searchInput : null; }
};
const orientationSelect = { value: '' };
let controllerHostClears = 0;
const controllerHost = {
  ownerDocument: optionDocument,
  dataset: {},
  clientWidth: 900,
  clientHeight: 600,
  replaceChildren() { controllerHostClears += 1; },
  appendChild() {}
};
const controllerElements = new Map([
  ['[data-family-chart-host]', controllerHost],
  ['[data-family-chart-status]', statusElement],
  ['[data-family-search-host]', searchHost],
  ['[data-family-orientation-select]', orientationSelect]
]);
const controllerListeners = new Map();
const controllerPage = {
  dataset: { familyOrientation: 'vertical' },
  isConnected: true,
  matches(selector) { return selector === '.family-page'; },
  querySelector(selector) { return controllerElements.get(selector) || null; },
  querySelectorAll() { return []; },
  closest() { return null; },
  contains() { return true; },
  addEventListener(type, listener) { controllerListeners.set(type, listener); },
  removeEventListener(type) { controllerListeners.delete(type); }
};
context.AleriaFamily.page.mount({
  root: controllerPage,
  page: {
    family: {
      trees: [{
        id: 'controller-tree',
        label: 'Controller-Test',
        levels: [{ nodes: [{ id: 'controller-person', title: 'Controller Person', parentIds: [] }] }],
        connections: []
      }]
    }
  },
  preview: true
});
while (animationFrames.length) animationFrames.shift()();
assert.strictEqual(controllerHost.dataset.familyChartMounted, 'true');
assert.ok(controllerCalls.some(call => call[0] === 'setPersonDropdown'
  && call[1] === 'Person suchen'
  && call[2] === searchHost));
assert.strictEqual(searchInput.attributes['aria-label'], 'Person im Stammbaum suchen');
assert.strictEqual(context.AleriaFamily.page.getState(controllerPage).focusPersonId, 'controller-person');
assert.ok(statusElement.textContent.includes('1 Personen'));
assert.ok(controllerListeners.has('click'));
assert.ok(controllerListeners.has('change'));
context.AleriaFamily.page.unmount({ root: controllerPage });
assert.strictEqual(controllerHostClears, 1);
assert.strictEqual(controllerListeners.size, 0);

console.log(`Family-Chart-Adapter OK: ${converted.data.length} Personen, ${converted.relations.partnerships.length} Partnerkanten, ${converted.relations.parentages.length} Elternkanten, ${converted.diagnostics.length} Diagnosehinweise.`);
