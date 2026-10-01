import assert from 'node:assert/strict';
import test from 'node:test';
import '../assets/js/pins/category-catalog.js';
import '../assets/js/pins/pin-template-catalog.js';
import '../assets/js/pins/pin-table-presets.js';
const presets=globalThis.KartoPinTablePresets;

test('all location categories have useful blank information tables',()=>{
  for(const category of KartoCategoryCatalog.definitions){
    const preset=presets.forCategory(category);
    assert.ok(preset,category.label);
    assert.ok(KartoPinTemplateCatalog.get(preset.templateId),category.label);
    const rows=presets.createTable(preset.templateId,category);
    assert.ok(rows.length>=7,category.label);
    assert.equal(new Set(rows.map(row=>row.k)).size,rows.length,category.label);
    assert.ok(rows.every(row=>row.k && row.v===''));
    rows[0].v='Edited';
    assert.equal(presets.createTable(preset.templateId,category)[0].v,'');
  }
});

test('location fields follow compatible templates and preserve explicit unrelated choices',()=>{
  for(const label of ['Mine','Salzmine']){
    const table=presets.createTable('handwerk',{label});
    assert.ok(table.some(row=>row.k==='Abbauweise'));
    assert.ok(table.some(row=>row.k==='Tiefe / Stollen'));
    assert.deepEqual(presets.createTable('siedlung',{label}),table);
  }
  assert.ok(presets.createTable('natur',{label:'Quelle'}).some(row=>row.k==='Wasserqualität'));
  assert.deepEqual(presets.createTable('militaer',{label:'Mine'}),KartoPinTemplateCatalog.createTable('militaer'));
  assert.deepEqual(presets.createTable('dungeon',{label:'Unknown'}),KartoPinTemplateCatalog.createTable('dungeon'));
});

test('category changes only replace unedited default tables',()=>{
  const category={label:'Mine'};
  const pin={templateId:'handwerk',table:presets.createTable('handwerk',category)};
  assert.equal(presets.isDefaultTable(pin,category),true);
  pin.table[0].v='My mine';
  assert.equal(presets.isDefaultTable(pin,category),false);
  pin.table=[{k:'Personal field',v:''}];
  assert.equal(presets.isDefaultTable(pin,category),false);
  pin.table=[];
  assert.equal(presets.isDefaultTable(pin,category),false);
  pin.templateId='custom';
  assert.equal(presets.isDefaultTable(pin,category),false);
});
