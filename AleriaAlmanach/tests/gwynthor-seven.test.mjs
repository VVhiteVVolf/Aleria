import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildGwynthorSevenItems, GWYNTHOR_SEVEN_LOADOUTS } from '../modules/gwynthor-seven/equipment.mjs';
import { createGrantedItem } from '../modules/item-register/item-register-model.js';
import { GWYNTHOR_EQUIPMENT_ARTWORK } from '../modules/gwynthor-seven/equipment-artwork.mjs';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile, getArmorClass } from '../modules/combat/combat-profile-model.js';
import { HOUSE_GWYLLACH_FAMILY } from '../../Stammbäume/assets/js/data/house-gwyllach-family.js';
import { getCombatWeaponLoadout, validateCombatLoadout } from '../modules/combat/combat-weapon-loadout.js';
import { itemBuilderDraft } from '../modules/item-builder/item-builder-model.js';
import { itemBuilderMarkup } from '../modules/item-builder/item-builder-view.js';
const root=new URL('../../',import.meta.url);
const {characters}=JSON.parse(await readFile(new URL('../modules/gwynthor-seven/source/character-plan.json',import.meta.url),'utf8'));

async function assertOriginalArtwork(item){
 assert.ok(item.image);
 if(item.image.startsWith('/'))return access(new URL(item.image.slice(1),root));
 const published=Object.entries(GWYNTHOR_EQUIPMENT_ARTWORK).find(([,entry])=>entry.url===item.image);
 assert.ok(published,`${item.name}: veröffentlichte Bildquelle fehlt.`);
 const [source,entry]=published;
 assert.ok(entry.sourceItems.includes(item.templateId));
 assert.equal(new URL(item.image).hostname,'firebasestorage.googleapis.com');
 if(source.startsWith('/')){
  const original=await readFile(new URL(source.slice(1),root));
  assert.equal(createHash('sha256').update(original).digest('hex'),entry.sha256);
  assert.equal(original.length,entry.size);
 }else{
  assert.equal(new URL(source).hostname,'i.imgur.com');
  assert.match(entry.sha256,/^[a-f0-9]{64}$/);assert.ok(entry.size>0);
 }
}
test('seven unique level-one characters keep canonical identity, portraits and factual biographies',()=>{
 assert.equal(characters.length,7);assert.equal(new Set(characters.map(c=>c.id)).size,7);
 assert.equal(characters.find(c=>c.name==='Caralyn Chwedonol').id,'Eka4z7TWpzEgx8KjhIzy');
 for(const c of characters){assert.equal(c.combatProfile.progression.level,1);assert.equal(c.combatProfile.techniques.length,0);assert.ok(c.identity.worldPersonId);assert.ok(c.portrait);assert.ok(c.biography.biography.biographyText.includes(c.name));assert.ok(c.biography.biography.connections.some(x=>x.image));}
});
test('requested gear has real pinned definitions, synchronized combat links and usable original images',async()=>{
 for(const c of characters){
  const owned=c.inventory.items.filter(i=>i.templateId?.startsWith('gwynthor-seven:'));
  for(const i of owned){assert.ok(i.definitionRef);const template=AUTHORED_ITEMS.find(t=>t.id===i.definitionRef.id);assert.ok(template);assert.ok(itemDefinitionRegistry.get(i.definitionRef),'Gebundene frühere Versionen bleiben verfügbar.');await assertOriginalArtwork(i);}
  const sync=synchronizeEquipmentFromInventory({inventory:c.inventory,combatProfile:c.combatProfile,addMissingEquipment:true});
  assert.deepEqual(sync.combatProfile.weapons.map(w=>w.id),c.combatProfile.weapons.map(w=>w.id));
  for(const w of c.combatProfile.weapons.filter(w=>w.weaponType!=='unarmed'))assert.ok(owned.some(i=>i.id===w.inventoryItemId));
 }
 const rianna=characters.find(c=>c.name==='Rianna Wyrm');assert.equal(rianna.combatProfile.weapons.find(w=>w.name==='Wyrm Ritterschwert').damageFormula,'1d8');
 assert.equal(getCombatWeaponLoadout(rianna.combatProfile).right.name,'Wyrm Ritterschwert');
 const lefraye=characters.find(c=>c.name==='Lefraye Gafyr');assert.equal(lefraye.combatProfile.weapons.filter(w=>w.name==='Helwyr Kampfdolch').length,2);
 for(const [key,count]of [['signalpfeil',3],['feuerpfeil',2],['standardpfeil',30]])assert.equal(Number(lefraye.inventory.items.find(i=>i.templateId===`gwynthor-seven:${key}`).quantity),count);
 assert.ok(lefraye.combatProfile.weapons.filter(w=>w.weaponType==='bow').every(w=>w.ammunition.required));
 const reload=synchronizeEquipmentFromInventory({inventory:lefraye.inventory,combatProfile:lefraye.combatProfile,addMissingEquipment:true});
 assert.ok(reload.combatProfile.weapons.filter(w=>w.weaponType==='bow').every(w=>w.ammunition.required&&w.ammunition.inventoryItemId===lefraye.inventory.items.find(i=>i.templateId==='gwynthor-seven:standardpfeil').id));
 assert.equal(getCombatWeaponLoadout(lefraye.combatProfile).right.name,'Helwyr Langbogen');
 const daggers=lefraye.combatProfile.weapons.filter(w=>w.name==='Helwyr Kampfdolch');assert.equal(validateCombatLoadout(lefraye.combatProfile,{rightWeaponId:daggers[0].id,leftWeaponId:daggers[1].id}),'');
 const caralyn=characters.find(c=>c.name==='Caralyn Chwedonol');assert.equal(caralyn.inventory.items.filter(i=>i.templateId==='gwynthor-seven:chwedonol-harpune').length,3);
});
test('three sets of nine avatars per person have real files and original portraits',async()=>{
 for(const name of ['Caralyn Chwedonol','Rianna Wyrm','Lefraye Gafyr']){
  const c=characters.find(c=>c.name===name),sets=c.imageSets.filter(s=>s.id.startsWith('gwynthor-20261102'));
  assert.equal(sets.length,3);for(const s of sets){assert.equal(s.emotes.length,9);assert.equal(s.portrait,c.portrait);for(const e of s.emotes)await access(new URL(e.img.slice(1),root));}
 }
});

test('Owetas beauftragtes Draig-Set verbindet Besitz, Waffen und schwere Grundrüstung ohne persönliche Boni',async()=>{
 const templates=buildGwynthorSevenItems();
 const inventory={items:GWYNTHOR_SEVEN_LOADOUTS['oweta-draig'].map(([key,quantity,equipped],index)=>{
  const template=templates.find(item=>item.id===`gwynthor-seven:${key}`);
  assert.ok(template);
  return {...createGrantedItem(template,{id:`oweta-test-${index}`,characterId:'oweta-draig',characterName:'Oweta Draig',quantity}),equipped};
 })};
 assert.equal(inventory.items.length,3);
 for(const item of inventory.items)await assertOriginalArtwork(item);
 const profile=sanitizeCharacterCombatProfile({attributes:[{key:'dexterity',score:20}]});
 const synced=synchronizeEquipmentFromInventory({inventory,combatProfile:profile,addMissingEquipment:true});
 const sword=synced.combatProfile.weapons.find(item=>item.name==='Draig Ritterschwert');
 const dagger=synced.combatProfile.weapons.find(item=>item.name==='Draig Dolch');
 assert.equal(sword.damageFormula,'1d8');assert.equal(sword.versatileDamageFormula,'1d10');
 assert.equal(sword.equipped,true);assert.equal(sword.attackBonus,0);assert.equal(sword.damageBonus,0);
 assert.equal(dagger.damageFormula,'1d4');assert.equal(dagger.equipped,false);
 assert.equal(dagger.attackBonus,0);assert.equal(dagger.damageBonus,0);
 const armor=synced.combatProfile.armorItems.find(item=>item.name==='Draig - Jungritter Plattenrüstung');
 assert.equal(armor.equipped,true);assert.equal(armor.baseArmorClass,15);assert.equal(armor.dexterityMode,'none');
 assert.equal(armor.damageProtection.amount,1);assert.deepEqual(armor.damageProtection.damageTypes,['hieb','stich','wucht']);
 assert.equal(getArmorClass(synced.combatProfile),15,'Die schwere Jungritterrüstung addiert trotz GES 20 keinen GES-Bonus.');
 for(const item of [sword,dagger,armor])assert.ok(synced.inventory.items.some(owned=>owned.id===item.inventoryItemId));
 const reloaded=synchronizeEquipmentFromInventory({...synced,addMissingEquipment:true});
 assert.equal(reloaded.inventory.items.length,3);assert.equal(reloaded.combatProfile.weapons.length,synced.combatProfile.weapons.length);
});
test('authored catalogue definitions use the existing variant flow rather than editing a nonexistent remote head',()=>{
 const source=AUTHORED_ITEMS[0];
 const markup=itemBuilderMarkup(itemBuilderDraft(source),AUTHORED_ITEMS);
 assert.ok(markup.includes('Gemeinsame Serienvariante anlegen'));assert.equal(markup.includes('value="edit"'),false);
});
test('Gwyllach age revision preserves family structure, twins, head and adult parental gaps',()=>{
 const f=HOUSE_GWYLLACH_FAMILY;const byId=new Map(f.persons.map(p=>[p.id,p]));
 assert.equal(byId.get('rhovan-gwyllach').birth,'1659');assert.equal(byId.get('saerwyn-gwyllach').birth,'1721');
 assert.equal(byId.get('meirawen-gwyllach').birth,byId.get('morwella-gwyllach').birth);
 for(const p of f.parentages)for(const parentId of p.parentIds){const parent=byId.get(parentId),child=byId.get(p.childId);if(/^\d{4}$/.test(parent?.birth)&&/^\d{4}$/.test(child?.birth))assert.ok(Number(child.birth)-Number(parent.birth)>=18,`${parent.name} -> ${child.name}`);}
});
