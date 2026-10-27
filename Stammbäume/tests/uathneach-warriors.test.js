import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {UATHNEACH_WARRIORS} from '../assets/js/data/uathneach-warriors.js';
import {UATHNEACH_HOUSE_FAMILIES} from '../assets/js/data/uathneach-house-families.js';
import {FAMILY_REGISTRY} from '../assets/js/data/families.registry.js';
import {HOUSE_BIOGRAPHY_DEFAULTS} from '../assets/js/data/house-biographies.registry.js';
import {resolveRegisteredFamilyUpgrade} from '../assets/js/services/family-registry-upgrade.js';
import {createUathneachHouseContent} from '../../Familien Häuser und Clans/modules/uathneach/uathneach-house-content.mjs';
import {pages as territoryPages} from '../../Kontinente/modules/uathneach/page-source.mjs';
import {markers,describePlace} from '../../Karten/Uathneach/places.mjs';

const root=new URL('../../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const json=path=>JSON.parse(read(path));
const digest=value=>createHash('sha256').update(value).digest('hex');
const selection=json('Stammbäume/assets/data/family-sources/uathneach-warriors.source.json');
const inventory=json('Stammbäume/assets/data/source-inventories/uathneach-warriors-2026-10-27.json');

test('23 supplied Uathneach originals take priority; exactly the three missing-clan proposals remain active',()=>{
 assert.equal(UATHNEACH_WARRIORS.length,26);
 assert.equal(UATHNEACH_WARRIORS.filter(w=>w.sourceKind==='supplied').length,23);
 assert.deepEqual(UATHNEACH_WARRIORS.filter(w=>w.sourceKind==='generated').map(w=>w.id),['fiodhran','creagan','einsiedlerkrebs']);
 for(const image of inventory.images){
  const bytes=read('Stammbäume/'+image.path);
  assert.equal(digest(bytes),image.sha256,image.id);
  assert.equal(image.sha256,image.sourceSha256,'Original PNG copied without pixel, alpha or size changes');
  assert.equal(digest(read(image.preview)),image.previewSha256);
 }
 assert.equal(selection.entries.length,26);
});

test('house pages, biographies and preview catalog share the selected image without changing clan genealogy',()=>{
 const context={window:{}};vm.createContext(context);
 vm.runInContext(read('Familien Häuser und Clans/haeuser.registry.js').toString(),context);
 for(const warrior of UATHNEACH_WARRIORS){
  const content=createUathneachHouseContent(warrior.id),record=context.window.HaeuserRegistry.byId(warrior.familyId);
  assert.ok(record,warrior.familyId);
  const page={window:{}};vm.runInNewContext(read('Familien Häuser und Clans/'+record.data.split('?')[0]).toString(),page);
  assert.equal(page.window.HAEUSER_DATA.images['haus-hauptbild'].src,'..'+warrior.fullsize);
  assert.equal(page.window.HAEUSER_DATA.warriorGallery.entries[0].image,'..'+warrior.fullsize);
  const family=FAMILY_REGISTRY.find(f=>f.id===warrior.familyId).family;
  const original=UATHNEACH_HOUSE_FAMILIES.find(f=>f.document.id===warrior.familyId);
  assert.equal(family.extensions.houseBiographyModule.image,'..'+warrior.fullsize);
  assert.equal(HOUSE_BIOGRAPHY_DEFAULTS[warrior.familyId].sourceRevision,5);
  assert.equal(family.extensions.registryManagedEntitySourceRevision,original.extensions.sourceRevision);
  for(const collection of ['persons','partnerships','parentages','timeJumps'])assert.deepEqual(family[collection].map(e=>e.id),original[collection].map(e=>e.id));
  assert.ok(existsSync(new URL(warrior.fullsize.slice(1),root)));
  assert.equal(content.profile.seat,original.document.houseProfile.seat);
 }
});

test('the main gallery reunites archive variants with their canonical clans and preserves previous gallery IDs',()=>{
 const catalog=json('Gallerien/krieger/data/catalog.json');
 const editorial=json('Gallerien/krieger/data/selection.json');
 for(const warrior of UATHNEACH_WARRIORS){
  const images=catalog.illustrations.filter(i=>i.houseIds.includes(warrior.familyId));
  assert.equal(images.length,1,warrior.familyId);
  assert.equal(images[0].image,warrior.fullsize.slice(1));
  const override=editorial.localGroupPrimaries.find(p=>p.file===warrior.fullsize.slice(1));
  if(override){assert.equal(images[0].id,override.legacyId);assert.ok(images[0].variants.length>=2);}
 }
 assert.equal(new Set(catalog.illustrations.map(i=>i.id)).size,catalog.illustrations.length);
});

test('territory clan registers now link directly to their available house pages',()=>{
 const seen=new Set();
 for(const page of territoryPages){
  assert.ok(page.families.length>0);
  for(const group of page.families)for(const house of group.houses){
   assert.ok(house.href.includes('/Familien Häuser und Clans/kleinehaeuser.html?haus='));
   assert.ok(UATHNEACH_WARRIORS.some(w=>w.familyId===house.familyId));
   seen.add(house.familyId);
  }
 }
 assert.equal(seen.size,26);
 for(const marker of markers)assert.ok(describePlace(marker).houseHref.includes('/Familien Häuser und Clans/kleinehaeuser.html?haus='));
});

test('existing clan files gain the image biography while custom biographies and explicit removals remain intact',()=>{
 for(const id of ['haus-laga','haus-gealan']){
  const original=UATHNEACH_HOUSE_FAMILIES.find(f=>f.document.id===id);
  const registered=FAMILY_REGISTRY.find(f=>f.id===id).family;
  const upgraded=resolveRegisteredFamilyUpgrade(registered,structuredClone(original));
  assert.equal(upgraded.extensions.houseBiographyModule.image,registered.extensions.houseBiographyModule.image);
  for(const collection of ['persons','partnerships','parentages'])assert.deepEqual(upgraded[collection].map(e=>e.id),original[collection].map(e=>e.id));
  const custom=structuredClone(original);custom.extensions.houseBiographyModule={...structuredClone(registered.extensions.houseBiographyModule),description:'Eigene Clanbiografie erhalten'};
  assert.equal(resolveRegisteredFamilyUpgrade(registered,custom).extensions.houseBiographyModule.description,'Eigene Clanbiografie erhalten');
  const removed=structuredClone(original);removed.extensions.houseBiographyModule=null;
  assert.equal(resolveRegisteredFamilyUpgrade(registered,removed).extensions.houseBiographyModule,null);
 }
});
