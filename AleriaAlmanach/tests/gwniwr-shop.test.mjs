import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {buildGwniwrShop} from '../modules/gwniwr/gwniwr-module.mjs';
import {GWNIWR_GARMENTS,GWNIWR_COLLECTION} from '../modules/gwniwr/gwniwr-collection.mjs';
import {GWNIWR_VACANCIES} from '../modules/gwniwr/gwniwr-hierarchy.mjs';
import {gwniwrShopPeople} from '../modules/gwniwr/gwniwr-personnel.mjs';
import {buildModuleOffers} from '../modules/item-register/item-register-module-catalog.js';
import {ELEGANZ_COLLECTION} from '../modules/goettliche-eleganz/eleganz-collection.mjs';
const entry=buildGwniwrShop();
test('six native pages have distinct art, one actual room and stable comment keys',()=>{
  assert.equal(entry.pages.length,6);
  assert(entry.pages[1].guildPage&&entry.pages[2].biographyPage&&entry.pages[3].hierarchyPage&&entry.pages[4].tradeCatalogPage);
  assert.equal(entry.pages.filter(page=>page.sessionPage).length,1);
  assert.equal(new Set(entry.pages.map(page=>page.image)).size,6);
  assert.equal(new Set(entry.pages.map(page=>page.commentThreadKey)).size,6);
  assert.equal(entry.symbol,'./assets/gwniwr/schild.png');
});
test('fifty-one authored outfits have a limited seven-model wedding collection',()=>{
  assert.equal(GWNIWR_GARMENTS.length,51);
  assert.deepEqual(Object.values(GWNIWR_COLLECTION).map(items=>items.length),[22,22,4,3]);
  assert.equal(new Set(GWNIWR_GARMENTS.map(item=>item.id)).size,51);
  assert.equal(new Set(GWNIWR_GARMENTS.map(item=>item.appearance)).size,51);
  assert(GWNIWR_GARMENTS.every(item=>Number.isSafeInteger(item.copper)&&item.copper>0));
  assert.equal(Math.min(...GWNIWR_GARMENTS.map(item=>item.copper)),12);
  assert.equal(Math.max(...GWNIWR_GARMENTS.map(item=>item.copper)),240);
});
test('actual item-register offers preserve all 51 copper prices and unique image identities',()=>{
  const offers=buildModuleOffers([entry]);
  assert.equal(offers.length,51);
  assert.equal(new Set(offers.map(offer=>offer.image)).size,51);
  for(const item of GWNIWR_GARMENTS){
    const offer=offers.find(offer=>offer.title===item.name);assert(offer,item.name);
    assert.equal(offer.priceRange.minCopper,item.copper,item.name);
    assert.equal(offer.moduleId,entry.id);
  }
});
test('price ranges keep affordable material and wedding tiers below Eleganz comparators',()=>{
  for(const category of ['damen','herren']){
    const prices=GWNIWR_COLLECTION[category].map(item=>item.copper);
    const reference=ELEGANZ_COLLECTION[category].map(item=>item.copper);
    assert(Math.min(...prices)<Math.min(...reference));
    assert(Math.max(...prices)<Math.max(...reference));
  }
  assert(GWNIWR_COLLECTION['damen-hochzeit'].length<ELEGANZ_COLLECTION['damen-hochzeit'].length);
  assert(GWNIWR_COLLECTION['herren-hochzeit'].length<ELEGANZ_COLLECTION['herren-hochzeit'].length);
});
test('nine named workers and eleven distinct free silhouettes preserve existing people',()=>{
  const people=gwniwrShopPeople(),nodes=entry.pages[3].hierarchy.trees.flatMap(tree=>tree.levels.flatMap(level=>level.nodes));
  assert.equal(people.length,9);assert.equal(new Set(people.map(person=>person.worldPersonId)).size,9);
  assert.equal(entry.sessionCast.length,9);
  assert.equal(GWNIWR_VACANCIES.length,11);
  const vacant=nodes.filter(node=>!node.portrait);
  assert.equal(vacant.length,11);assert.equal(new Set(vacant.map(node=>node.id)).size,11);
  assert.equal(new Set(nodes.filter(node=>node.portrait).map(node=>node.title)).size,9);
  assert(people.every(person=>person.age>=16));
  assert(!nodes.some(node=>/Bleddyn|Micah|Efa/.test(node.title)));
});
test('authored service contracts explain quotations and do not promise stock or automatic discounts',()=>{
  const contracts=entry.pages[1].guild.contracts;
  assert.equal(contracts.length,4);
  assert(contracts.every(contract=>contract.icon==='./assets/gwniwr/schild.png'));
  assert(contracts.some(contract=>/Hochzeit/.test(contract.title)));
  assert(contracts.some(contract=>/Ausbesserung/.test(contract.title)));
  assert(!JSON.stringify(entry).includes('onclick='));
});
test('generated data installs the entry once and all required artwork is present',async()=>{
  const source=await readFile(new URL('../modules/gwniwr/gwniwr-data.js',import.meta.url),'utf8');
  const context={SECTIONS:[]};vm.runInNewContext(source,context);vm.runInNewContext(source,context);
  assert.equal(context.SECTIONS.flatMap(section=>section.entries).filter(item=>item.id===entry.id).length,1);
  for(const image of [entry.symbol,...entry.pages.map(page=>page.image),...entry.pages[4].tradeCatalog.items.map(item=>item.image),...gwniwrShopPeople().map(person=>person.portrait)]){
    const base=image.startsWith('../Stammbäume/')?new URL('../../',import.meta.url):new URL('../',import.meta.url);
    await access(new URL(image.startsWith('../Stammbäume/')?image.slice(3):image,base));
  }
});
