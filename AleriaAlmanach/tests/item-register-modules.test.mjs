import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { watchModuleCatalog } from '../modules/item-register/item-register-module-sync.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { createRegisterStore } from '../modules/item-register/item-register-store.js';
import { parsePrice } from '../modules/item-register/item-register-money.js';
import { buildOwnedItems, normalizeOffer } from '../modules/item-register/item-register-model.js';
import { applyRegisterTrade } from '../modules/item-register/item-register-trade.js';

const row = (price = '1 KT 10 Pfennig') => ({ values: { name: 'Blutwurst & Kraut\u200b', kind: 'Speise', description: 'Gebraten und deftig.', price, portion: 'Pro Teller' }, details: 'Mit heißem Sauerkraut.', image: 'https://example.com/gericht.png', category: 'speisen' });
const shop = (id = 'roter-drache', rows = [row()]) => ({ id, title: id, pages: [{ goodsTablePage: true, pageTitle: 'Angebot', goodsTable: { tables: [{ id: 'angebot', columns: ['name','kind','description','price','portion'].map(id=>({id,label:id})), categories: [{id:'speisen',label:'Speisen'}], rows }] } }] });

test('module menus keep prices, portions, long descriptions and standard references without scan copies', () => {
  const entries = [shop(), shop('zweite-taverne', [row('2 KT')])];
  const offers = buildModuleOffers(entries, STANDARD_ITEMS);
  assert.equal(offers.length, 2);
  assert.notEqual(offers[0].id, offers[1].id);
  assert.equal(offers[0].templateId, offers[1].templateId);
  assert.equal(offers[0].priceRange.minCopper, 1.1);
  assert.match(offers[0].details, /Sauerkraut/);
  assert.match(offers[0].details, /Pro Teller/);
  assert.equal(offers[0].title, 'Blutwurst & Kraut');
  assert.equal(entries[0].pages[0].goodsTable.tables[0].rows[0].values.name.endsWith('\u200b'), true);
});

test('duplicates collapse within a provider; different prices, portions and providers survive', () => {
  const otherPortion = row(); otherPortion.values.portion = 'Familienplatte';
  const offers = buildModuleOffers([shop('eins', [row(), row(), row('3 KT'), otherPortion]), shop('zwei')]);
  assert.equal(offers.length, 4);
  assert.equal(offers[0].sourceRefs.length, 2);
  const revised = shop(); revised.pages[0].goodsTable.tables[0].rows[0].details = 'Neue Kaufbedingungen';
  assert.notEqual(buildModuleOffers([shop()])[0].sourceRevision, buildModuleOffers([revised])[0].sourceRevision);
});

test('templates and unfilled editor slots do not become shops; actual trade items retain their conditions', () => {
  const trade = { id:'gestuet',title:'Gestüt',pages:[{ tradeCatalogPage:true,tradeCatalog:{ categories:[{id:'zucht',label:'Zucht'}], items:[
    {id:'horse',title:'Zuchtrasse',category:'zucht',description:'Gezielt gekreuzte Pferde.',priceMin:'1.000',priceMax:'120.000',currencyLabel:'Kupfertaler',conditions:'Nur an vertrauenswürdige Kunden.',origin:'Owains Gestüt',attributes:[{label:'Stärke',value:4}]},
    {id:'empty',title:'Neues Handelsgut',description:'Ausfuehrliche Beschreibung.'}
  ]}}] };
  const offers = buildModuleOffers([shop('vorlage-grosse-taverne'), {...shop(),hidden:true}, trade]);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].category, 'pferde');
  assert.equal(offers[0].priceRange.maxCopper, 120000);
  assert.match(offers[0].details, /vertrauenswürdige/);
  assert.deepEqual(offers[0].attributes, [{label:'Stärke',value:4}]);
});

test('mixed menu denominations are exact and unsupported or conditional prices stay open', () => {
  for (const [value,total] of [['50 Pfennig',.5],['1 Kupfertaler & 20 Pfennig',1.2],['1 KT 80 Pfennig\u200b',1.8],['1 ST und 2 KT',102]]) {
    assert.deepEqual(parsePrice(value), {minCopper:total,maxCopper:total});
  }
  for (const value of ['1 KT - 20 Pfennig','ab 1 KT','1 KT mit 20 Pfennig Rabatt','1 Unbekannt 2 KT']) assert.equal(parsePrice(value), null);
});

test('module store changes add, revise and remove providers; legacy editorial variants remain intact', () => {
  const store = createRegisterStore();
  let entries = [shop()];
  const events = new EventTarget();
  const stop = watchModuleCatalog(store, {events,read:()=>entries});
  store.setLegacy({ scanCache:[{canonicalKey:'old:wurst',title:'Blutwurst & Kraut',sourceRefs:[{kind:'goods-register',moduleId:'roter-drache'}]}] });
  assert.equal(store.snapshot().offers.length, 1);
  store.setLegacy({ customItems:[{canonicalKey:'old:custom',title:'Blutwurst & Kraut',description:'Eigene Ausführung',sourceRefs:[{kind:'goods-register',moduleId:'roter-drache'}]}] });
  assert.equal(store.snapshot().offers.length, 2);
  entries = [];
  events.dispatchEvent(new Event('almanach:modules-changed'));
  assert.equal(store.snapshot().offers.length, 1);
  stop();
});

test('merged market IDs still resolve and can be sold from released inventories', () => {
  const template = STANDARD_ITEMS.find(item=>item.id==='standard:alchemist:heiltrank');
  const oldId = 'standard:arkanist:heiltrank';
  assert.ok(template.aliases.includes(oldId));
  assert.equal(STANDARD_ITEMS.filter(item=>item.title==='Heiltrank').length, 1);
  assert.equal(template.sourceRefs.length, 2);
  const item = {id:'old',name:'Mein Heiltrank',templateId:oldId,quantity:'1',purchase:{unitCopper:20}};
  const character = {id:'owner',inventory:{items:[item],moneyState:{totalCopper:0}}};
  assert.equal(buildOwnedItems([character], STANDARD_ITEMS)[0].templateId, template.id);
  assert.equal(normalizeOffer({id:'offer:variant',templateId:oldId,title:'Starker Trank',listId:'laden',listName:'Laden'},STANDARD_ITEMS).templateId, template.id);
  assert.equal(applyRegisterTrade(character,template,{direction:'sell',inventoryItemId:'old',quantity:1,unitCopper:10},{now:'today'}).inventory.moneyState.totalCopper,10);
});
