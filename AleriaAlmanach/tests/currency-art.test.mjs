import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { ALERIA_CURRENCY_DISPLAY, currencyArt } from '../modules/currency/currency-art.js';
import { groupAccountCurrencies } from '../modules/landing/group-account-view.js';
import { NOTICE_COINS, legacyNoticeRewards } from '../../Anzeigetafeln/assets/js/rewards/notice-rewards-model.mjs';
import { renderTradeMoney } from '../modules/trade-catalog/trade-catalog-money.js';

const expected = {
  gold:'/AleriaAlmanach/assets/currency/aleria-goldtaler-v1.webp',
  silver:'/AleriaAlmanach/assets/currency/aleria-silbertaler-v1.webp',
  copper:'/AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png',
  pfennig:'/AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png'
};
const plain = value => JSON.parse(JSON.stringify(value));
const source = async path => readFile(new URL(path,import.meta.url),'utf8');

test('the shared ESM source names four existing Aleria originals and preserves the gold/silver PNG masters',async()=>{
  assert.deepEqual(Object.fromEntries(ALERIA_CURRENCY_DISPLAY.map(row=>[row.id,row.icon])),expected);
  for(const [id,path] of Object.entries(expected)) {
    assert.equal(currencyArt(id),path);await access(new URL(`../../${path.slice(1)}`,import.meta.url));
  }
  assert.equal(currencyArt('unknown'),'');assert.ok(Object.isFrozen(ALERIA_CURRENCY_DISPLAY));
  assert.ok(ALERIA_CURRENCY_DISPLAY.every(Object.isFrozen));
  const manifest=JSON.parse(await source('../assets/currency/image-prompts.json'));
  assert.equal(manifest.tool,'built-in image_gen');assert.equal(manifest.validation.inspected,true);
  for(const [id,name] of [['gold','goldtaler'],['silver','silbertaler']]) {
    const asset=manifest.assets.find(row=>row.id===id);
    assert.equal(asset.original,`aleria-${name}-v1.png`);assert.equal(asset.display,`aleria-${name}-v1.webp`);
    await access(new URL(`../assets/currency/${asset.original}`,import.meta.url));
  }
});

test('the generated Classic facade matches the ESM source and late loading updates existing inventory image getters',async()=>{
  const context=vm.createContext({window:{location:{href:'https://aleria.example/'}},document:{addEventListener(){}},URL});
  for(const path of ['core/content-safety.js','module-editor/module-editor-character-inventory.js','character-inventory/character-inventory-renderer.js']) {
    vm.runInContext(await source(`../modules/${path}`),context);
  }
  const before=plain(vm.runInContext('CHARACTER_INVENTORY_CURRENCIES.map(({id,label,short,value})=>({id,label,short,value}))',context));
  assert.deepEqual(before,[{id:'gold',label:'Goldtaler',short:'GT',value:1000},{id:'silver',label:'Silbertaler',short:'ST',value:100},
    {id:'copper',label:'Kupfertaler',short:'KT',value:1},{id:'pfennig',label:'Eisenpfennig',short:'Pf',value:.01}]);
  const fallback=vm.runInContext('buildCharacterInventoryMoneyPanel({}, {readOnly:true})',context);
  assert.match(fallback,/ci-money-coin-text/);assert.doesNotMatch(fallback,/src=""|coins\/(?:gold|silber|kupfer)taler/);
  vm.runInContext(await source('../modules/currency/currency-art.global.js'),context);
  assert.deepEqual(plain(context.AleriaCurrencyArt.currencies),plain(ALERIA_CURRENCY_DISPLAY));
  assert.deepEqual(plain(vm.runInContext('Object.fromEntries(CHARACTER_INVENTORY_CURRENCIES.map(row=>[row.id,row.icon]))',context)),expected);
  const money=plain(vm.runInContext('sanitizeCharacterInventoryMoney({gold:1,silver:2,copper:3,pfennig:4})',context));
  assert.equal(money.totalCopper,1203.04);assert.equal(money.pfennig,4);
  for(const readOnly of [true,false]) {
    context.readOnly=readOnly;
    const markup=vm.runInContext('buildCharacterInventoryMoneyPanel({moneyState:{gold:1,silver:2,copper:3,pfennig:4}},{readOnly})',context);
    for(const path of Object.values(expected))assert.ok(markup.includes(`src="${path}"`));
    assert.doesNotMatch(markup,/src=""|coins\/(?:gold|silber|kupfer)taler/);
  }
  assert.deepEqual(plain(vm.runInContext('CHARACTER_INVENTORY_CURRENCIES.map(({id,label,short,value})=>({id,label,short,value}))',context)),before);
});

test('groups, notices and trade prices consume the same artwork without changing denomination amounts',()=>{
  assert.equal(groupAccountCurrencies(),ALERIA_CURRENCY_DISPLAY);
  assert.deepEqual(Object.fromEntries(NOTICE_COINS.map(row=>[row.id,row.icon])),expected);
  assert.deepEqual(NOTICE_COINS.map(row=>row.code),['GT','ST','KT','Pf']);
  for(const [label,id] of [['Goldtaler','gold'],['Silbertaler','silver'],['Kupfertaler','copper'],['Eisenpfennig','pfennig']]) {
    assert.deepEqual(legacyNoticeRewards(`2 ${label}`),[{kind:'money',currency:id,amount:2}]);
  }
  assert.ok(renderTradeMoney('1 KT 50 Pfennig').includes(expected.copper));
  assert.ok(renderTradeMoney('1 KT 50 Pfennig').includes(expected.pfennig));
  assert.equal(renderTradeMoney('1 KT 50 Pfennig'),renderTradeMoney('1,5'));
});

test('the main Almanach loads the synchronous Classic facade before its inventory consumers',async()=>{
  const html=await source('../AleriaAlmanach.html');
  const bridge=html.indexOf('./modules/currency/currency-art.global.js');
  assert.ok(bridge>=0);assert.ok(bridge<html.indexOf('./modules/module-editor/module-editor-character-inventory.js'));
  assert.ok(bridge<html.indexOf('./modules/character-inventory/character-inventory-renderer.js'));
  assert.match(html,/<script src="\.\/modules\/currency\/currency-art\.global\.js[^"\s]*" defer><\/script>/);
});
