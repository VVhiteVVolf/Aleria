import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssignmentState, DRAFT_SCHEMA } from '../Venalys/assignment-state.mjs';
import { renderTargets, renderTargetOptions } from '../Venalys/assignment-view.mjs';
import { commitDistrictName } from '../Venalys/assignment-controls.mjs';
import { districts,pointsOfInterest,legacyPointIds,mapGeometry } from '../Venalys/territory-data.mjs';
import { createVenalysMap } from '../Venalys/map-view.mjs';

const config = {
  houseIds: ['vinicius', 'avenicci', 'magnarier'],
  districts: [{ id: 'district-01', name: 'Bezirk 01' }, { id: 'district-02', name: 'Bezirk 02' }],
  pointIds: ['dorf-01', 'burg-01'],
};
const create = () => createAssignmentState(config);

test('the complete older Venalys draft upgrades additively without changing district names or losing old tower assignments',() => {
  const previous = createAssignmentState({ houseIds:config.houseIds,districts,pointIds:legacyPointIds });
  previous.renameDistrict('district-04','Mein Hafenviertel');
  previous.assign('avenicci','district-04');previous.assign('avenicci','poi-r01');previous.assign('vinicius','poi-d02');
  const payload = JSON.parse(previous.serialize());
  const revised = createAssignmentState({ houseIds:config.houseIds,districts,pointIds:pointsOfInterest.map(point => point.id),legacyPointIds });
  revised.restore(payload,{recordHistory:false});
  assert.deepEqual(revised.current().districtNames,previous.current().districtNames);
  for (const [id,entries] of Object.entries(previous.current().assignments)) assert.deepEqual(revised.current().assignments[id],entries,id);
  for (const point of pointsOfInterest.filter(point => !legacyPointIds.includes(point.id))) assert.deepEqual(revised.current().assignments[point.id],[]);
  assert.equal(revised.canUndo(),false);
  assert.equal(Object.keys(JSON.parse(revised.serialize()).assignments).length,115);
  revised.assign('avenicci','poi-d16');revised.undo();
  assert.deepEqual(revised.current().assignments['poi-r01'],['avenicci']);
  const before = revised.current();
  for (const corrupt of [value => {delete value.assignments['poi-r01'];},value => {value.assignments.foreign=[];},value => {value.assignments['poi-r01']=['unknown'];}]) {
    const invalid = structuredClone(payload);corrupt(invalid);assert.throws(() => revised.restore(invalid));assert.deepEqual(revised.current(),before);
  }
});

test('unmapped old places appear separately only when occupied and never offer a phantom map target',() => {
  const state = createAssignmentState({ houseIds:config.houseIds,districts,pointIds:pointsOfInterest.map(point => point.id),legacyPointIds });
  const houses = config.houseIds.map(id => ({id,name:id,crest:`${id}.webp`}));
  assert(!renderTargets(pointsOfInterest,state.current(),houses,null).includes('Noch nicht verortete Orte'));
  assert(!renderTargetOptions(pointsOfInterest,state.current()).includes('value="poi-r01"'));
  state.assign('avenicci','poi-r01');
  const html = renderTargets(pointsOfInterest,state.current(),houses,'avenicci');
  assert(html.includes('Noch nicht verortete Orte'));
  assert(html.includes('Torre Levante'));
  assert(html.includes('data-action="remove-assignment" data-house="avenicci" data-target="poi-r01"'));
  assert(!html.includes('data-drop-seat="poi-r01"'));
  assert(!html.includes('data-action="locate-target" data-target="poi-r01"'));
  assert(renderTargetOptions(pointsOfInterest,state.current()).includes('Torre Levante · Nicht verortet'));
});

test('both revised map variants render only measured targets even if an old tower still holds a house assignment',() => {
  const previousWindow = globalThis.window;
  globalThis.window = {innerWidth:1200,innerHeight:900,addEventListener() {}};
  try {
    const surface = {innerHTML:'',style:{},closest:() => null,addEventListener() {}};
    const full = {innerHTML:'',style:{},closest:() => dialog,addEventListener() {}};
    const zoom = {textContent:''},caption = {textContent:''};
    const dialog = {querySelector:selector => selector.includes('zoom-label') ? zoom : full,addEventListener() {}};
    const root = {querySelector:selector => selector === '#map-dialog' ? dialog : caption,querySelectorAll:() => [surface,full]};
    const state = createAssignmentState({ houseIds:config.houseIds,districts,pointIds:pointsOfInterest.map(point => point.id),legacyPointIds });
    state.assign('avenicci','poi-r01');state.assign('avenicci','poi-d16');
    const map = createVenalysMap({root,targets:[...districts,...pointsOfInterest],districts,
      houses:[{id:'avenicci',name:'Avenicci',crest:'avenicci.webp'}],geometry:mapGeometry,getDraft:state.current,onTarget() {}});
    map.render();
    for (const content of [surface.innerHTML,full.innerHTML]) {
      assert(!content.includes('data-target="poi-r01"'));
      assert(content.includes('data-target="poi-d16"'));
      assert(content.includes('data-house="avenicci"'));
      assert(!content.includes('NaN'));assert(!content.includes('null%'));
    }
    assert.match(caption.textContent,/13 Stadtbezirke · 98 Außenorte/);
    assert(surface.innerHTML.includes('assets/map-districts.webp'));
    map.toggleMode({setAttribute() {},textContent:''});
    assert(surface.innerHTML.includes('assets/map.webp'));
    assert(full.innerHTML.includes('assets/map-full.webp'));
  } finally {globalThis.window = previousWindow;}
});

test('one house can occupy several districts and outside places, and a district can contain several houses', () => {
  const state = create();
  assert.equal(state.assign('avenicci', 'district-01'), true);
  state.assign('avenicci', 'district-02');
  state.assign('avenicci', 'burg-01');
  state.assign('vinicius', 'district-01');
  state.assign('magnarier', 'dorf-01');
  assert.deepEqual(state.current().assignments, {
    'district-01': ['vinicius', 'avenicci'], 'district-02': ['avenicci'],
    'dorf-01': ['magnarier'], 'burg-01': ['avenicci'],
  });
  assert.equal(state.assign('avenicci', 'district-01'), false);
  assert.equal(state.remove('avenicci', 'district-01'), true);
  assert.deepEqual(state.current().assignments['district-01'], ['vinicius']);
  assert.deepEqual(state.current().assignments['district-02'], ['avenicci']);
  assert.deepEqual(state.current().assignments['burg-01'], ['avenicci']);
});

test('district names and links round-trip together with safe copied state and undo', () => {
  const state = create();
  state.renameDistrict('district-01', '  Hafen der Fünf  ');
  state.assign('vinicius', 'district-01');
  const exported = JSON.parse(state.serialize());
  assert.equal(exported.schema, DRAFT_SCHEMA);
  assert.equal(exported.districtNames['district-01'], 'Hafen der Fünf');
  const imported = create(); imported.restore(exported);
  assert.deepEqual(imported.current(), state.current());
  exported.assignments['district-01'].push('avenicci');
  const external = imported.current(); external.districtNames['district-01'] = 'Andere Stadt';
  assert.equal(imported.current().districtNames['district-01'], 'Hafen der Fünf');
  assert.deepEqual(imported.current().assignments['district-01'], ['vinicius']);
  assert.equal(imported.undo(), true);
  assert.deepEqual(imported.current(), create().current());
  assert.equal(state.undo(), true);
  assert.deepEqual(state.current().assignments['district-01'], []);
  assert.equal(state.current().districtNames['district-01'], 'Hafen der Fünf');
});

test('invalid imports are atomic and cannot inject houses, districts or single-seat foreign drafts', () => {
  const state = create(); state.assign('vinicius', 'district-01');
  const before = state.current();
  const valid = JSON.parse(state.serialize());
  const corruptions = [
    value => { value.realm = 'aeldrunmar'; },
    value => { value.schemaVersion = 2; },
    value => { delete value.assignments['dorf-01']; },
    value => { value.assignments.unknown = []; },
    value => { value.assignments['district-01'].push('unknown-house'); },
    value => { value.assignments['district-01'].push('vinicius'); },
    value => { value.assignments['district-01'] = 'vinicius'; },
    value => { delete value.districtNames['district-01']; },
    value => { value.districtNames['district-01'] = ''; },
    value => { value.districtNames['district-01'] = 'A'.repeat(81); },
    value => { value.districtNames['district-01'] = 'A\nB'; },
  ];
  for (const corrupt of corruptions) {
    const payload = structuredClone(valid); corrupt(payload);
    assert.throws(() => state.restore(payload));
    assert.deepEqual(state.current(), before);
  }
  assert.throws(() => state.restore({ schemaVersion: 1, realm: 'venalys', placements: { vinicius: 'district-01' } }));
  assert.deepEqual(state.current(), before);
  state.undo();
  assert.deepEqual(state.current(), create().current());
});

test('reset is reversible and browser hydration does not manufacture an undo step', () => {
  const state = create(); state.renameDistrict('district-01', 'Marktbezirk'); state.assign('avenicci', 'burg-01');
  const before = state.current();
  assert.equal(state.reset(), true);
  assert.deepEqual(state.current(), create().current());
  state.undo(); assert.deepEqual(state.current(), before);
  const reopened = create(); reopened.restore(JSON.parse(state.serialize()), { recordHistory: false });
  assert.deepEqual(reopened.current(), state.current());
  assert.equal(reopened.canUndo(), false);
  reopened.assign('avenicci', 'district-02'); reopened.undo();
  assert.deepEqual(reopened.current(), before);
});

test('names retain authored text and invalid configuration or direct unknown writes fail', () => {
  const state = create();
  state.renameDistrict('district-01', '<Handel & Meer>');
  assert.equal(state.current().districtNames['district-01'], '<Handel & Meer>');
  for (const action of [
    () => state.assign('fremd', 'district-01'), () => state.assign('vinicius', 'fremd'),
    () => state.remove('vinicius', 'fremd'), () => state.renameDistrict('dorf-01', 'Dorf'),
  ]) assert.throws(action);
  assert.throws(() => createAssignmentState({ ...config, houseIds: ['vinicius', 'vinicius'] }));
  assert.throws(() => createAssignmentState({ ...config, pointIds: ['district-01'] }));
});

test('imported district names are rendered as text in headings, fields and map selectors', () => {
  const state = create();
  const name = '<img src=x onerror="alert(1)"> & Hafen';
  state.renameDistrict('district-01', name);
  const html = renderTargets(config.districts, state.current(), [], null, { districts: true });
  const options = renderTargetOptions(config.districts, state.current());
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; Hafen'));
  assert.ok(!options.includes('<img src=x'));
  assert.ok(options.includes('&lt;img src=x'));
  assert.equal(state.current().districtNames['district-01'], name);
});

test('unnamed taverns remain unnamed while duplicate target names can be distinguished in the selector', () => {
  const targets = [{ id: 'poi-t01', name: 'Taverne, Herberge oder Bordell' }, { id: 'poi-t02', name: 'Taverne, Herberge oder Bordell' }];
  const options = renderTargetOptions(targets, { districtNames: {} });
  assert.ok(options.includes('Taverne, Herberge oder Bordell · T01'));
  assert.ok(options.includes('Taverne, Herberge oder Bordell · T02'));
  assert.ok(targets.every(t => t.name === 'Taverne, Herberge oder Bordell'));
});

test('explicit, Enter and native name submissions share one commit and create only one undo step', () => {
  const state = create(), errors = [];
  let updates = 0, selection;
  const field = { dataset: { district: 'district-01' }, value: '  Hafen der Fünf  ', selectionStart: 4, selectionEnd: 8,
    blur() { throw Error('Committing must not blur the active name field.'); },
    setSelectionRange(...value) { selection = value; } };
  const handlers = { state, onChange() { updates++; }, onError(error) { errors.push(error); } };
  assert.equal(commitDistrictName(field, handlers), true);
  assert.equal(field.value, 'Hafen der Fünf');
  assert.equal(state.current().districtNames['district-01'], field.value);
  assert.deepEqual(selection, [4, 8]);
  assert.equal(commitDistrictName(field, handlers), false);
  assert.equal(updates, 1); assert.deepEqual(errors, []);
  assert.equal(state.undo(), true); assert.equal(state.canUndo(), false);
  assert.equal(state.current().districtNames['district-01'], 'Bezirk 01');
});

test('an invalid field commit restores its previous name and reports validation without adding history', () => {
  const state = create(); state.renameDistrict('district-01', 'Alter Hafen');
  let error;
  const field = { dataset: { district: 'district-01' }, value: '' };
  assert.equal(commitDistrictName(field, { state, onChange() { throw Error('Invalid commit must not render or save.'); }, onError(value) { error = value; } }), false);
  assert.equal(field.value, 'Alter Hafen');
  assert.match(error.message, /Bezirksnamen/);
  assert.equal(state.current().districtNames['district-01'], 'Alter Hafen');
  assert.equal(state.undo(), true); assert.equal(state.canUndo(), false);
});
