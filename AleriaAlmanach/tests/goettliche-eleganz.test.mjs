import test from 'node:test';
import assert from 'node:assert/strict';
import { access,readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildGoettlicheEleganz } from '../modules/goettliche-eleganz/eleganz-module.mjs';
import { ELEGANZ_PEOPLE,ELEGANZ_MARRIAGES } from '../modules/goettliche-eleganz/eleganz-family-people.mjs';
import { ELEGANZ_COLLECTION } from '../modules/goettliche-eleganz/eleganz-collection.mjs';
import { planEleganzCharacters } from '../modules/goettliche-eleganz/eleganz-characters.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../../Stammbäume/assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { encodeFirestoreFields,decodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
const entry=buildGoettlicheEleganz();
const registered=id=>FAMILY_REGISTRY.find(record=>record.id===`haus-${id}`);

test('shop uses the existing six page templates, one room and stable family cast',()=>{
  assert.equal(entry.id,'goettliche-eleganz');
  assert.equal(entry.pages.length,6);
  assert(entry.pages[1].guildPage && entry.pages[2].biographyPage && entry.pages[3].hierarchyPage && entry.pages[4].tradeCatalogPage);
  assert.equal(entry.pages.filter(page=>page.sessionPage).length,1);
  assert.equal(new Set(entry.pages.map(page=>page.commentThreadKey)).size,6);
  assert.equal(entry.sessionCast.length,7);
  assert.equal(entry.pages[2].stats.find(row=>row[0]==='Alter')[1],'39 Jahre');
});
test('department tabs reserve fifteen individual jobs and assign only working family members',()=>{
  const hierarchy=entry.pages[3].hierarchy;
  assert.equal(hierarchy.treeDisplayMode,'tabs');
  assert.equal(hierarchy.trees.length,3);
  const nodes=hierarchy.trees.flatMap(tree=>tree.levels.flatMap(level=>level.nodes));
  const vacant=nodes.filter(node=>!node.portrait);
  assert.equal(vacant.length,15);
  assert.equal(new Set(vacant.map(node=>node.id)).size,15);
  const working=new Set(ELEGANZ_PEOPLE.filter(person=>person.resident!==false).map(person=>person.name));
  assert.deepEqual(new Set(nodes.filter(node=>node.portrait).map(node=>node.title)),working);
  assert.equal(working.size,7);
  for(const person of ELEGANZ_PEOPLE.filter(person=>person.death || person.age<14 || person.destination)) assert(!nodes.some(node=>node.title===person.name));
});
test('three generations, reciprocal marriages and existing identities survive the new branches',async()=>{
  const ids=['raves','veltrane','maerllys','coeddu'];
  const records=[];
  for(const id of ids) {
    const family=assertValidFamily(registered(id).family).family;
    const baseFamily=await readFile(new URL(`../../Stammbäume/assets/data/published-families/haus-${id}.json`,import.meta.url),'utf8').then(JSON.parse).then(envelope=>envelope.family).catch(error=>{if(error.code!=='ENOENT') throw error;});
    records.push({family,baseFamily});
    if(baseFamily && ['maerllys','coeddu'].includes(id)) for(const old of baseFamily.persons) {
      const current=family.persons.find(person=>person.id===old.id)
        || registered('raves').family.persons.find(person=>person.worldPersonId===old.worldPersonId);
      for(const field of ['id','worldPersonId','birth','death','houseId']) assert.equal(current[field],old[field]);
    }
  }
  assertMirroredCrossFamilyBatch(records);
  const raves=registered('raves').family;
  assert.deepEqual(['eleonora','tiberian','orestian'].map(key=>ELEGANZ_PEOPLE.find(person=>person.key===key).age),[39,37,36]);
  assert.equal(ELEGANZ_PEOPLE.filter(person=>person.destination).length,2);
  assert.equal(ELEGANZ_PEOPLE.filter(person=>person.child).length,2);
  assert.equal(ELEGANZ_PEOPLE.filter(person=>person.age<18).length,3);
  assert(raves.lineage.originHouse);
  const maelwen=registered('coeddu').family.persons.find(person=>person.id==='maelwen-coeddu');
  assert.equal(maelwen.worldPersonId,'person--haus-coeddu--maelwen-coeddu');
  const marriage=raves.partnerships.find(partnership=>partnership.id===ELEGANZ_MARRIAGES.tiberian.id);
  assert(marriage.participantIds.includes(maelwen.id));
  assert(!JSON.stringify(raves).includes('gwyllach'));
  assert.equal(registered('maerllys').family.timeJumps.length,2);
  assert.deepEqual(registered('veltrane').folderPath,['Kaiserreich Argentum','Unsortiert']);
});
test('twenty-six distinct garments keep their real currency values and individual artwork',()=>{
  const catalog=entry.pages[4].tradeCatalog;
  assert.equal(catalog.items.length,26);
  const offers=buildModuleOffers([entry]);
  assert.equal(offers.length,26);
  assert.equal(new Set(offers.map(offer=>offer.id)).size,26);
  for(const category of Object.keys(ELEGANZ_COLLECTION)) {
    assert.equal(catalog.items.filter(item=>item.category===category).length,category.endsWith('hochzeit')?3:10);
    for(const source of ELEGANZ_COLLECTION[category]) {
      const item=catalog.items.find(item=>item.id===source.id);
      const offer=offers.find(offer=>offer.title===source.name);
      assert.equal(offer.priceRange.minCopper,source.copper,source.name);
      assert.equal(item.image,`./assets/goettliche-eleganz/kleidung/${source.id}.png`);
      assert.equal((item.description.match(/<p>/g)||[]).length,2);
      assert(source.materials && source.description && source.details,source.name);
      assert.equal(source.features.length,3);
    }
  }
});
test('editor round trip retains garment details, categories, currency and features',async()=>{
  const context=vm.createContext({console,window:{},URL});
  const core=await readFile(new URL('../modules/core/app-core.js',import.meta.url),'utf8');
  vm.runInContext(core.slice(core.indexOf('function slugify('),core.indexOf('\nfunction ',core.indexOf('function slugify(')+1)),context);
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-data.js',import.meta.url),'utf8'),context);
  context.catalog=structuredClone(entry.pages[4].tradeCatalog);
  const normalized=vm.runInContext('sanitizeTradeCatalogData(catalog)',context);
  assert.equal(normalized.items.length,26);
  assert.equal(normalized.items.at(-1).currencyCode,'GT');
  assert.equal(normalized.items[0].features.length,3);
  assert.equal(normalized.items[0].description,context.catalog.items[0].description);
});
test('wedding extension preserves the original twenty product identities and prices',async()=>{
  const previous=JSON.parse(await readFile(new URL('../modules/goettliche-eleganz/sources/module-before-clothing.json',import.meta.url),'utf8')).module.entry;
  const before=buildModuleOffers([previous]),after=buildModuleOffers([entry]);
  assert.equal(before.length,20);
  for(const old of before) {
    const current=after.find(offer=>offer.id===old.id);
    assert(current,old.title);
    assert.equal(current.title,old.title);
    assert.deepEqual(current.priceRange,old.priceRange);
    assert.equal(current.hiddenMeta.unit,old.hiddenMeta.unit);
  }
  const wedding=entry.pages[4].tradeCatalog.items.filter(item=>item.category.endsWith('hochzeit'));
  assert.equal(wedding.length,6);
  assert(wedding.every(item=>item.badge==='Hochzeitsmode' && item.conditions.includes('Hochzeit')));
});
test('character publication preserves a pre-existing profile and every other collection',()=>{
  const id='person--haus-coeddu--maelwen-coeddu';
  const prior={id,name:'Maelwen Coeddu',identity:{worldPersonId:id},portrait:'existing.png',inventory:{live:true},biography:{custom:true},genealogy:{worldPersonId:id,sources:[],relationships:{preserved:true}}};
  const config={tabs:['Andere'],map:{Andere:['original']},subtabs:{},subtabMap:{},moduleStoreManifest:{preserved:true}};
  const before=structuredClone({prior,config});
  const plan=planEleganzCharacters([prior],config,'2026-10-16T12:00:00Z');
  assert.equal(plan.entries.filter(item=>item.create).length,13);
  assert.equal(plan.entries.length,14);
  assert.deepEqual(Object.keys(plan.entries.find(item=>item.key==='maelwen').patch),['genealogy','updatedAt']);
  assert.deepEqual(plan.config.map.Andere,['original']);
  assert.equal(plan.config.map['Göttliche Eleganz'].length,14);
  const saved=plan.entries.map(item=>item.create?{id:item.id,...item.data}:{...prior,genealogy:{...prior.genealogy,...item.patch.genealogy}});
  const again=planEleganzCharacters(saved,{...config,...plan.config},'2026-10-17T00:00:00Z');
  assert(again.entries.every(item=>!item.create && !item.patch));
  assert.deepEqual(again.config,plan.config);
  assert.deepEqual({prior,config},before);
  assert.throws(()=>planEleganzCharacters([prior,{...prior,id:'duplicate'}],config),/Doppelte/);
  const json={greeting:'Grüße',nested:{number:3.5,flag:true,empty:null},array:[1,'zwei']};
  assert.deepEqual(decodeFirestoreFields(encodeFirestoreFields(json)),json);
});
test('all family portraits and module artwork resolve to local files',async()=>{
  for(const person of ELEGANZ_PEOPLE) await access(new URL(`../${person.portrait}`,import.meta.url));
  const paths=new Set();
  const walk=value=>{
    if(typeof value==='string' && /^(\.\/assets\/goettliche-eleganz\/|\.\.\/Stammbäume\/assets\/images\/houses\/|\.\.\/IconOrdner\/)/.test(value)) paths.add(value);
    else if(Array.isArray(value)) value.forEach(walk);
    else if(value && typeof value==='object') Object.values(value).forEach(walk);
  };
  walk(entry);
  for(const path of paths) await access(new URL(`../${path}`,import.meta.url));
});
