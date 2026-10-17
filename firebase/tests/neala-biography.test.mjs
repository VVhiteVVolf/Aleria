import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planNealaBiography, NEALA_CHARACTER_ID} from '../scripts/content/neala-biography-plan.mjs';
const prepared=JSON.parse(await readFile(new URL('../../AleriaAlmanach/assets/biographies/neala-wylan/2026-10-17/prepared.json',import.meta.url),'utf8'));
const {assets}=JSON.parse(await readFile(new URL('../../AleriaAlmanach/assets/biographies/neala-wylan/2026-10-17/asset-publication.json',import.meta.url),'utf8'));
const source=()=>({id:NEALA_CHARACTER_ID,name:'Neala Wylan',portrait:prepared.patch.biography.biography.portrait,...structuredClone(prepared.source)});

test('Neala keeps her narrative and identity while six icons and all five captioned portraits are complete',()=>{
  const before=source(), snapshot=structuredClone(before);
  const {patch}=planNealaBiography(before,assets,'2026-10-17T14:00:00.000Z');
  assert.deepEqual(before,snapshot);
  assert.deepEqual(Object.keys(patch).sort(),['biography','inventory','updatedAt']);
  const bio=patch.biography.biography;
  assert.equal(bio.portrait,before.portrait);
  assert.equal(bio.portraitStages.length,4);
  assert.equal(new Set(bio.portraitStages).size,4);
  assert.equal(bio.portraitCaptions.length,5);
  assert.ok(bio.portraitCaptions[1].includes('Speer und Flöckchen'));
  assert.ok(bio.abilities.every(ability=>ability.icon.startsWith('https://firebasestorage.googleapis.com/')));
  assert.equal(bio.abilities.length,6);
  assert.ok(!bio.connections.some(connection=>connection.title==='Neue Gruppe'));
  assert.equal(bio.connections.filter(connection=>connection.image?.startsWith('/Stammbäume/assets/images/portraits/')).length,7);
  assert.ok(bio.extraSections.some(section=>section.text.includes('Großvater')));
  assert.ok(bio.extraSections.some(section=>section.text.includes('zwanzigjährigen Ritter Gavin')));
});

test('Flöckchen is a Ceffyl with a real bestiary reference and consistent companion/item identity',()=>{
  const plan=planNealaBiography(source(),assets);
  const creature=plan.creatures[0], card=plan.patch.inventory.companions[0], item=plan.patch.inventory.items[0];
  assert.equal(creature.name,'Flöckchen');
  assert.equal(creature.bestiaryReference.id,'tiere/pferde/ceffyl');
  assert.equal(creature.level,3);
  assert.equal(card.creatureId,creature.id);
  assert.equal(item.creatureId,creature.id);
  assert.equal(item.ownerCharacterId,NEALA_CHARACTER_ID);
  assert.equal(item.id,creature.itemOrigin.inventoryItemId);
  assert.match(creature.notes,/Alter und Geschlecht sind noch nicht festgelegt/);
});

test('adding Flöckchen preserves other possessions and a repeated plan never duplicates his inventory cards',()=>{
  const before=source();before.inventory={money:{gold:19},items:[{id:'ring',name:'Ring'}],companions:[]};
  before.combatProfile={hitPoints:{current:13},conditions:['erschöpft']};
  const original=structuredClone(before);
  const first=planNealaBiography(before,assets);
  assert.deepEqual(before,original);
  assert.deepEqual(first.patch.inventory.money,{gold:19});
  assert.deepEqual(first.patch.inventory.items[0],before.inventory.items[0]);
  const second=planNealaBiography({...before,...first.patch},assets);
  assert.equal(second.patch.inventory.companions.length,1);
  assert.equal(second.patch.inventory.items.length,2);
  assert.deepEqual(second.patch.inventory.items,first.patch.inventory.items);
});
