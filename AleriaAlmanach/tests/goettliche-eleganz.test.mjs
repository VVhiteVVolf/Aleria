import test from 'node:test';
import assert from 'node:assert/strict';
import { access,readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildGoettlicheEleganz } from '../modules/goettliche-eleganz/eleganz-module.mjs';
import { ELEGANZ_PEOPLE,ELEGANZ_MARRIAGES } from '../modules/goettliche-eleganz/eleganz-family-people.mjs';
import { ELEGANZ_COLLECTION } from '../modules/goettliche-eleganz/eleganz-collection.mjs';
import { ELEGANZ_SALES_STAFF } from '../modules/goettliche-eleganz/eleganz-sales-staff.mjs';
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
test('department tabs fill the accepted Rhys and Gwernant positions and retain Eirlys and eleven vacancies',()=>{
  const hierarchy=entry.pages[3].hierarchy;
  assert.equal(hierarchy.treeDisplayMode,'tabs');
  assert.equal(hierarchy.trees.length,3);
  const nodes=hierarchy.trees.flatMap(tree=>tree.levels.flatMap(level=>level.nodes));
  const vacant=nodes.filter(node=>!node.portrait);
  assert.equal(vacant.length,11);
  assert.equal(new Set(vacant.map(node=>node.id)).size,11);
  const working=new Set(ELEGANZ_PEOPLE.filter(person=>person.resident!==false).map(person=>person.name));
  working.add('Eirlys Vann');
  working.add('Rhys Maerllys');
  working.add('Catrin Gwernant');
  working.add('Efa Gwernant');
  assert.deepEqual(new Set(nodes.filter(node=>node.portrait).map(node=>node.title)),working);
  assert.equal(working.size,11);
  const sales=hierarchy.trees.find(tree=>tree.id==='verkauf');
  const advice=sales.levels.find(level=>level.label==='Beratung im Verkaufsraum').nodes;
  const rhys=advice.find(node=>node.id==='eleganz-person-rhys-maerllys');
  assert.equal(rhys.title,'Rhys Maerllys');
  assert.equal(rhys.subtitle,'Verkauf · Alltag & gute Tuche · 21 Jahre');
  assert.equal(rhys.portrait,'./assets/goettliche-eleganz/portraits/rhys-maerllys.png');
  assert(!nodes.some(node=>node.id==='eleganz-post-verkauf-alltag'));
  const source=registered('maerllys').family.persons.find(person=>person.id==='rhys-maerllys');
  assert.equal(ELEGANZ_SALES_STAFF[0].personId,source.id);
  assert.equal(ELEGANZ_SALES_STAFF[0].worldPersonId,source.worldPersonId);
  assert.equal(ELEGANZ_SALES_STAFF[0].worldPersonId,'person--haus-maerllys--rhys-maerllys');
  assert.equal(advice.find(node=>node.id==='eleganz-person-eirlys-vann').title,'Eirlys Vann');
  assert.equal(sales.levels.find(level=>level.label==='Empfang & Termine').nodes[0].title,'Maelwen Coeddu');
  for(const [id,role] of [['catrin-gwernant','Verkauf · Maßaufträge · 26 Jahre'],['efa-gwernant','Hausmagd · Verkaufsraum & Wäsche · 22 Jahre']]) {
    const person=registered('gwernant').family.persons.find(person=>person.id===id);
    const assignment=ELEGANZ_SALES_STAFF.find(staff=>staff.personId===id);
    const node=nodes.find(node=>node.id===assignment.nodeId);
    assert.equal(node.subtitle,role);
    assert.equal(node.title,person.name);
    assert.equal(node.portrait,`../Stammbäume/${person.portrait}`);
    assert.equal(assignment.worldPersonId,person.worldPersonId);
    assert(!nodes.some(node=>node.id===assignment.slotId));
  }
  assert(!nodes.some(node=>/Falchdyn/.test(node.title)));
  for(const person of ELEGANZ_PEOPLE.filter(person=>person.death || person.age<14 || person.destination)) assert(!nodes.some(node=>node.title===person.name));
});
test('three generations, reciprocal marriages and existing identities survive the new branches',async()=>{
  const ids=['raves','veltrane','maerllys','coeddu','vann','pendrwn'];
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
test('fifty-one distinct garments keep their real currency values and individual artwork',()=>{
  const catalog=entry.pages[4].tradeCatalog;
  assert.equal(catalog.items.length,51);
  const offers=buildModuleOffers([entry]);
  assert.equal(offers.length,51);
  assert.equal(new Set(offers.map(offer=>offer.id)).size,51);
  for(const category of Object.keys(ELEGANZ_COLLECTION)) {
    assert.equal(catalog.items.filter(item=>item.category===category).length,({damen:15,herren:15,'damen-hochzeit':13,'herren-hochzeit':8})[category]);
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
  assert.equal(normalized.items.length,51);
  assert.equal(normalized.items.at(-1).currencyCode,'GT');
  assert.equal(normalized.items[0].features.length,3);
  assert.equal(normalized.items[0].description,context.catalog.items[0].description);
});
test('expanded collection retains original garments with only four authorized price reductions',async()=>{
  const previous=JSON.parse(await readFile(new URL('../modules/goettliche-eleganz/sources/module-before-expansion-2026-11-04.json',import.meta.url),'utf8')).entry;
  const before=buildModuleOffers([previous]),after=buildModuleOffers([entry]);
  const reduced=new Set(['damen-goettliche-eleganz','herren-goettliche-eleganz','braut-zwei-heimaten','braeutigam-heller-bund']);
  assert.equal(before.length,26);
  for(const old of before) {
    const id=old.sourceRefs[0].itemId;
    const current=after.find(offer=>offer.sourceRefs[0].itemId===id);
    assert(current,old.title);
    assert.equal(current.title,old.title);
    assert.equal(current.image,old.image);
    assert.equal(current.description,old.description);
    assert.equal(current.definitionSourceId,old.definitionSourceId);
    assert.deepEqual(current.priceRange,reduced.has(id)?{minCopper:23000,maxCopper:23000}:old.priceRange);
    assert.equal(current.hiddenMeta.unit,old.hiddenMeta.unit);
  }
  const originalIds=new Set(before.map(offer=>offer.sourceRefs[0].itemId));
  const additions=Object.entries(ELEGANZ_COLLECTION).flatMap(([category,items])=>items.filter(item=>!originalIds.has(item.id)).map(item=>({...item,category})));
  assert.equal(additions.length,25);
  for(const item of additions) {
    assert(Number.isInteger(item.copper),item.id);
    if(!item.category.endsWith('hochzeit')) assert(item.copper>=20 && item.copper<=13000,item.id);
    if(item.category==='damen-hochzeit') assert(item.copper>=100 && item.copper<=20000,item.id);
  }
  for(const item of Object.values(ELEGANZ_COLLECTION).flat()) assert(item.copper<=23000,item.id);
  const wedding=entry.pages[4].tradeCatalog.items.filter(item=>item.category.endsWith('hochzeit'));
  assert.equal(wedding.length,21);
  assert(wedding.every(item=>item.badge==='Hochzeitsmode' && item.conditions.includes('Hochzeit')));
  assert(entry.pages[4].tradeCatalog.items.every(item=>item.priceFill>=0 && item.priceFill<=100));
  assert.equal(entry.pages[4].tradeCatalog.items.find(item=>item.id==='flachsgold').badge,'Guter Alltag');
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
