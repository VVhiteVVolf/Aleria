import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildRegistryFolderTree } from '../../Stammbäume/assets/js/modules/family-registry/registry-folder-tree.js';
import { regionalTerritory, regionalChildren, regionalHouses, regionalQuery, regionalHomeForHouse } from '../modules/regional-equipment/regional-equipment-model.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { queryRegister, REGISTER_CATEGORIES } from '../modules/item-register/item-register-model.js';
import { createRegisterStore } from '../modules/item-register/item-register-store.js';
import { overview, navigation, detail } from '../modules/item-register/item-register-view.js';
import { regionalEquipmentView } from '../modules/regional-equipment/regional-equipment-view.js';
const snapshot=createRegisterStore().snapshot();
const initial={section:'regional',territoryId:'',houseId:'',category:'',search:'',limit:48};
test('Country and county cards match the canonical family tree, including the original heraldry',()=>{
  const tree=buildRegistryFolderTree(FAMILY_REGISTRY);
  assert.deepEqual(regionalChildren('').map(n=>n.name).sort(),[...tree.folders.keys()].sort());
  assert.equal(regionalChildren('').length,12);
  const counties=regionalChildren('cenyr');
  assert.equal(counties.length,9);assert.ok(counties.every(n=>n.image.startsWith('/Stammb')));
  assert.deepEqual(counties.map(n=>n.name).sort(),[...tree.folders.get('Cenyr').folders.keys()].sort());
  assert.ok(regionalTerritory('cenyr/celtigerns-wacht').image.endsWith('/celtigerns-wacht.png'));
  assert.equal(regionalHouses('').length,436);
});
test('Regional armor never appears in standard goods, their category totals or search',()=>{
  const standard=queryRegister(STANDARD_ITEMS,{section:'standard',category:'ruestungen'});
  assert.equal(standard.length,19);assert.ok(standard.every(i=>!i.houseArmor));
  assert.equal(queryRegister(STANDARD_ITEMS,{section:'standard',search:'Haus Wyrm'}).length,0);
  assert.equal(STANDARD_ITEMS.filter(i=>i.section==='regional').length,186);
  assert.ok(!REGISTER_CATEGORIES.some(c=>c.id==='cenyr-ruestungen'));
  const html=overview(snapshot,{section:'standard'},{});
  assert.match(html,/213 Vorlagen/);assert.doesNotMatch(html,/Cenyr – Rüstungen|399 Vorlagen/);
  assert.match(navigation(snapshot,initial),/data-id="regional"/);
});
test('Country, county and house drill-down constrain search; empty countries stay browsable',()=>{
  const cenyr={...initial,territoryId:'cenyr',search:'Seniorritter'};
  assert.equal(queryRegister(STANDARD_ITEMS,regionalQuery(cenyr)).length,62);
  assert.equal(queryRegister(STANDARD_ITEMS,regionalQuery({...cenyr,territoryId:'aldrimar'})).length,0);
  const wyrm={...initial,territoryId:regionalHomeForHouse('haus-wyrm'),houseId:'haus-wyrm'};
  const items=queryRegister(STANDARD_ITEMS,regionalQuery(wyrm));
  assert.equal(items.length,3);assert.ok(items.every(i=>i.section==='regional'));
  assert.match(regionalEquipmentView(snapshot,{...initial,territoryId:'cenyr'},[]),/re-emblem-banner/);
  assert.match(regionalEquipmentView(snapshot,{...initial,territoryId:'cenyr/celtigerns-wacht',houseId:'haus-aelmor'},[]),/noch keine Rüstungs-/);
  assert.doesNotMatch(detail(items[0],snapshot,{}),/>Standardgüter</);
});
test('Live template refresh accepts both template sections and retains the separate category',()=>{
  const store=createRegisterStore();store.replaceStandards(STANDARD_ITEMS,'regional-test');
  assert.equal(store.snapshot().items.filter(i=>i.section==='regional').length,186);
  assert.throws(()=>store.replaceStandards([{id:'standard:bad',section:'owned'}],'bad'),/ungültig/);
});
