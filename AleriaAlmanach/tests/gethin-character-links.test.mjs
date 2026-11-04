import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {DRAIG_RIDING_HORSES} from '../modules/creatures/catalog/draig-riding-horses.js';
import {inventoryCompanionViews} from '../modules/character-inventory/character-inventory-identity.js';
import {buildOwnedItems} from '../modules/item-register/item-register-model.js';
import {STANDARD_ITEMS} from '../modules/item-register/item-register-standard.js';
import {resolveCombatProfile} from '../modules/combat/combat-profile-resolver.js';
import {getArmorClass} from '../modules/combat/combat-profile-model.js';
import {mergeCharacterDatabases} from '../../CharakterDatenbank/assets/js/character-database-client.mjs';
import {getConfirmedCharacterRetirement} from '../../CharakterDatenbank/assets/js/character-identity-retirements.mjs';
import {synchronizeEquipmentFromInventory as serverEquipmentFromInventory} from '../../firebase/functions/src/generated/character-equipment/character-equipment-sync.js';

const load = async name => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${name}`,import.meta.url),'utf8'));
const active=(await load('gethin-draig-zuordnung-2026-10-14.json')).character;
const legacy=(await load('gethin-altbestand-2026-10-14.json')).character;
const horse=DRAIG_RIDING_HORSES.find(c=>c.name==='Vivian');

test('Vivian ist einmal im aktuellen Gethin-Inventar und dessen individueller Registerliste verknüpft',()=>{
  assert.equal(horse.itemOrigin.ownerCharacterId,active.id);
  const cards=inventoryCompanionViews(active.inventory,[horse]);
  assert.equal(cards.filter(c=>c.creatureId===horse.id).length,1);
  const owned=buildOwnedItems([active,legacy],STANDARD_ITEMS,[horse]);
  assert.equal(owned.filter(item=>item.creatureId===horse.id).length,1);
  assert.equal(owned.find(item=>item.creatureId===horse.id).ownerCharacterId,active.id);
  assert.ok(owned.every(item=>item.ownerCharacterId!==legacy.id));
  assert.equal(active.inventory.characterId,active.id);
});

test('Stufe-5-Bogen verwendet die verknüpften Waffen- und Rüstungsdaten in beiden Laufzeiten',()=>{
  assert.equal(active.combatProfile.progression.level,5);
  assert.equal(getArmorClass(active.combatProfile),15);
  const weapon=active.combatProfile.weapons.find(w=>w.weaponType==='sword');
  const item=active.inventory.items.find(i=>i.id===weapon.inventoryItemId);
  assert.equal(item.equipmentLink.combatEntryId,weapon.id);
  assert.equal(item.combatDefinition.weaponProfileId,'sword');
  assert.equal(item.image,weapon.image);
  const server=serverEquipmentFromInventory({inventory:active.inventory,combatProfile:{weapons:[],armorItems:[]},addMissingEquipment:true});
  assert.equal(server.combatProfile.weapons[0].weaponProfileId,'sword');
  assert.equal(server.combatProfile.weapons[0].versatileDamageFormula,'1d10');
  const one=resolveCombatProfile(active,{actionId:`weapon:${weapon.id}`,weaponGrip:'one-handed'});
  const two=resolveCombatProfile(active,{actionId:`weapon:${weapon.id}`,weaponGrip:'two-handed'});
  assert.equal(one.weapon.damageFormula,'1d8');assert.equal(two.weapon.damageFormula,'1d10');
  assert.equal(active.combatProfile.hitPoints.current,62);
  assert.equal(active.combatProfile.techniques.length,22);
});

test('Listen zeigen einen aktiven Gethin; alte ID und Medien bleiben erhalten',async()=>{
  const snapshot=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
  const records=mergeCharacterDatabases([active,legacy],snapshot.characters).filter(c=>[active.id,legacy.id].includes(c.id));
  assert.equal(records.filter(c=>!c.archived).length,1);
  assert.equal(records.find(c=>!c.archived).id,active.id);
  assert.equal(legacy.id,'6atOllMA637Z2VNAZAxf');assert.equal(legacy.archived,true);
  assert.equal(active.emotes.length,11);
  assert.ok(snapshot.charTabs.map.Gwynthor.includes(active.id));
  assert.ok(!snapshot.charTabs.map.Gwynthor.includes(legacy.id));
  assert.equal(active.identity.worldPersonId,active.id);
});

test('Ein neueres Online-archived:false reaktiviert die bestätigte Gethin-Altakte nicht',async()=>{
  const snapshot=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
  const onlineActive=structuredClone(snapshot.characters.find(c=>c.id===active.id));
  const onlineLegacy={...structuredClone(snapshot.characters.find(c=>c.id===legacy.id)),archived:false,updatedAt:'2026-11-03T18:00:00.000Z'};
  onlineActive.inventory={characterId:active.id,items:[{id:'new-online-item',name:'Neue Online-Beute'}],coins:{copper:17}};
  onlineActive.combatProfile.hitPoints.current=7;
  onlineActive.combatProfile.resources=[{id:'live-resource',current:1,max:8}];
  onlineActive.combatProfile.conditions=[{id:'live-condition',name:'Bestehende Wunde'}];
  onlineLegacy.combatProfile.hitPoints.current=2;
  const before=structuredClone([onlineActive,onlineLegacy,snapshot]);
  const records=mergeCharacterDatabases([onlineLegacy,onlineActive],snapshot.characters);
  const current=records.find(c=>c.id===active.id), retired=records.find(c=>c.id===legacy.id);
  assert.equal(records.filter(c=>[active.id,legacy.id].includes(c.id)&&!c.archived).length,1);
  assert.equal(retired.archived,true);
  assert.equal(retired.mergeIdentity.canonicalCharacterId,active.id);
  assert.equal(retired.mergeIdentity.status,'merged');
  assert.equal(retired.combatProfile.hitPoints.current,2);
  assert.deepEqual(retired.imageSets,onlineLegacy.imageSets);
  assert.deepEqual(current.inventory,onlineActive.inventory);
  assert.equal(current.combatProfile.hitPoints.current,7);
  assert.deepEqual(current.combatProfile.resources,onlineActive.combatProfile.resources);
  assert.deepEqual(current.combatProfile.conditions,onlineActive.combatProfile.conditions);
  assert.deepEqual([onlineActive,onlineLegacy,snapshot],before);
  assert.equal(getConfirmedCharacterRetirement('person--haus-draenmelyn--gethin-draenmelyn'),null);
});
