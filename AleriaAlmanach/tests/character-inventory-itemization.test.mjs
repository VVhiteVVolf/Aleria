import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import { indexInventoryTemplates, resolveInventoryItem, inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { inventoryCardModel } from '../modules/character-inventory/character-inventory-card-model.js';
import { buildOwnedItems } from '../modules/item-register/item-register-model.js';
import { moneyState, moneyTotal, formatMoney } from '../modules/item-register/item-register-money.js';
import { synchronizeEquipmentFromCombat, synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { classifyCharacterArchiveEntries, createArchiveMountEntry } from '../modules/character-archive/character-archive-classification.js';
import { mergeCharacterArchiveEntries, normalizeCharacterArchiveEntry } from '../modules/character-archive/character-archive-model.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { inventoryValuation, formatInventoryPrice } from '../modules/character-inventory/character-inventory-valuation.js';

test('trade values follow explicit estimates, legacy values and register ranges without inventing a purchase receipt', () => {
  const template = { priceRange: { minCopper: 2000, maxCopper: 5000 } };
  const item = { purchase: { unitCopper: 900 }, valuation: { minCopper: 5500, maxCopper: 5500 } };
  assert.equal(formatInventoryPrice(inventoryValuation(item, template)), '5 GT 5 ST');
  assert.equal(inventoryValuation({ value: { copper: 27, pfennig: 50 } }, template).minCopper, 27.5);
  assert.deepEqual(inventoryValuation({ infoRows: [{ label: 'Wert', value: '2 GT' }] }, template), { minCopper: 2000, maxCopper: 2000 });
  assert.deepEqual(inventoryValuation({ purchase: { unitCopper: 900 } }, template), template.priceRange);
  assert.equal(inventoryValuation({ purchase: { unitCopper: 900 } }), null);
  assert.equal(formatInventoryPrice(null), 'Preis offen');
  assert.equal(inventoryCardModel(item).rows.find(row => row.label === 'Gezahlter Kaufpreis').value, '9 ST');
  assert.equal(item.purchase.unitCopper, 900);
});

test('inventory and register resolve the same image by equipment or template identity, without changing the stored instance', () => {
  const template={id:'sword',section:'standard',title:'Sword',image:'https://example.com/template.png',aliases:['old-sword']};
  const item={id:'one',name:'Personal sword',icon:'*',templateId:'old-sword',quantity:'0',equipmentLink:{combatEntryId:'blade'}};
  const character={id:'owner',inventory:{items:[item]},combatProfile:{weapons:[{id:'blade',image:'https://example.com/sheet.png',equipped:true}]}};
  const before=structuredClone(character);
  const result=resolveInventoryItem(item,{character,templates:indexInventoryTemplates([template])});
  assert.equal(result.image,character.combatProfile.weapons[0].image);
  assert.equal(result.name,'Personal sword');
  assert.equal(result.quantity,'0');
  assert.equal(buildOwnedItems([character],[template])[0].image,result.image);
  assert.deepEqual(character,before);
  assert.equal(resolveInventoryItem(item,{templates:indexInventoryTemplates([template])}).image,template.image);
  assert.equal(resolveInventoryItem({...item,image:'https://example.com/custom.png'},{character}).image,'https://example.com/custom.png');
});

test('four coin denominations round-trip legacy fractional copper and exact penny transfers', () => {
  assert.deepEqual(moneyState(1203.09),{gold:1,silver:2,copper:3,pfennig:9,totalCopper:1203.09});
  assert.equal(moneyTotal({gold:1,silver:2,copper:3,pfennig:9}),1203.09);
  assert.equal(moneyTotal(formatMoney({copper:.03})),.03);
  const result=applySceneInventoryTransfer({id:'a',inventory:{moneyState:{copper:.03}}},{id:'b',inventory:{}},{kind:'money',currency:'pfennig',quantity:2});
  assert.equal(result.giverInventory.moneyState.totalCopper,.01);
  assert.equal(result.receiverInventory.moneyState.pfennig,2);
});

test('classic editor preserves pennies, card copy, equipment and companion links through a double save', async () => {
  const source=await readFile(new URL('../modules/module-editor/module-editor-character-inventory.js',import.meta.url),'utf8');
  for(const bridge of [undefined,{moneyState,moneyTotal}]) {
    const context=vm.createContext({window:{AleriaItemRegister:bridge},document:{addEventListener(){}}});
    vm.runInContext(source,context);
    context.input={moneyState:{copper:.09},items:[{id:'i',name:'Test',quantity:0,flavorText:'A story',inventoryUseMode:'consume',equipmentLink:{kind:'weapon',combatEntryId:'blade'},combatDefinition:{kind:'weapon',damageFormula:'1d8',damageBonus:1}}],companions:[{id:'c',creatureId:'horse',personality:'Geduldig und wachsam.'}]};
    const actual=JSON.parse(JSON.stringify(vm.runInContext('sanitizeCharacterInventoryData(sanitizeCharacterInventoryData(input))',context)));
    assert.equal(actual.moneyState.pfennig,9);
    assert.equal(actual.items[0].quantity,'0');
    assert.equal(actual.items[0].flavorText,'A story');
    assert.equal(actual.items[0].combatDefinition.damageBonus,1);
    assert.equal(actual.companions[0].creatureId,'horse');
    assert.equal(actual.companions[0].personality,'Geduldig und wachsam.');
    assert.equal(vm.runInContext("parseCharacterInventoryMoneyText('0,09 Kupfer').pfennig", context), 9);
  }
});

test('linked companions have one card and use current creature sheet data', () => {
  const data={companions:[{id:'comp',name:'Old name',creatureId:'horse',personality:'Vertraut seinem Reiter.'}],items:[{id:'item',creatureId:'horse',registerCategory:'pferde'}]};
  const creature={id:'horse',name:'Morgenwind',portrait:'https://example.com/horse.png',species:'Afol',notes:'Nervös vor Brücken.',combatProfile:{hitPoints:{current:7,maximumOverride:12},armorClass:{override:11},combat:{movement:18}}};
  const cards=inventoryCompanionViews(data,[creature]);
  assert.equal(cards.length,1);
  assert.equal(cards[0].name,'Morgenwind');
  assert.equal(cards[0].image,creature.portrait);
  assert.equal(cards[0].infoRows.find(row=>row.label==='Lebenspunkte').value,'7 / 12');
  assert.equal(cards[0].personality,'Vertraut seinem Reiter.');
});

test('saved Rossmarkt breed duplicates merge into the standard entry and preserve provenance; variants stay distinct', () => {
  const horse=STANDARD_ITEMS.find(item=>item.title==='Afol');
  const legacy={...createArchiveMountEntry({id:horse.mountId,name:'Afol',uses:[],section:'roesser'}),builtin:false,updatedAt:'2026-09-21',description:'Gespeicherte Rassenbeschreibung'};
  const entry=data=>normalizeCharacterArchiveEntry({kind:'register-pferde',name:data.title,data,builtin:true});
  const actual=mergeCharacterArchiveEntries(classifyCharacterArchiveEntries([entry(horse),legacy,entry({...horse,id:'offer:custom',section:'offer'}),entry({...horse,id:'owned:a:horse',section:'owned'})]));
  assert.equal(actual.length,3);
  const standard=actual.find(item=>item.data.section==='standard');
  assert.equal(standard.description,legacy.description);
  assert.ok(standard.sources.some(source=>source.id===`rossmarkt:${horse.mountId}`));
});

test('Gawains modest quality bonuses and descriptions survive both equipment directions and match his cards', async () => {
  const c=JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json',import.meta.url),'utf8')).character;
  const linked=synchronizeEquipmentFromCombat({inventory:c.inventory,combatProfile:c.combatProfile,characterId:c.id});
  const reverse=synchronizeEquipmentFromInventory({inventory:linked.inventory,combatProfile:linked.combatProfile,characterId:c.id});
  const sword=reverse.inventory.items.find(item=>item.equipmentLink?.combatEntryId==='gawain-draig-knightly-sword');
  assert.equal(sword.description,c.inventory.items.find(item=>item.id===sword.id).description);
  assert.equal(inventoryCardModel(sword).rows.find(row=>row.label==='Schaden').value,'1W8+1 Hieb');
  const resolved=resolveCombatProfile({...c,...reverse},{actionId:'weapon:gawain-draig-knightly-sword',segmentKind:'combataction'});
  assert.equal(resolved.weapon.damageBonus,1);
  assert.equal(resolved.totalDefense,16);
  assert.equal(reverse.combatProfile.armorItems.find(item=>item.id==='gawain-draig-armor').damageProtection.amount,2);
  assert.equal(reverse.combatProfile.weapons.find(item=>item.id==='gawain-draig-knightly-sword').damageBonus,1);
  assert.equal(inventoryCardModel({category:'potions'}).kind,'consumable');
  assert.equal(inventoryCardModel({registerCategory:'arkanes'}).kind,'artifact');
});
