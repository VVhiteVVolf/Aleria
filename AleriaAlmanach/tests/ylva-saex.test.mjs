import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planYlvaSaexGrant,YLVA_SAEX} from '../../firebase/functions/scripts/ylva-saex-release-model.mjs';
import {STANDARD_ITEMS} from '../modules/item-register/item-register-standard.js';
import {resolveCharacterCombatProfile,getWeaponDamageModifier,isTechniqueCompatibleWithWeapon} from '../modules/combat/combat-profile-model.js';
import {resolveCombatProfile} from '../modules/combat/combat-profile-resolver.js';
import {buildOwnedItems} from '../modules/item-register/item-register-model.js';
import {applyRegisterTrade} from '../modules/item-register/item-register-trade.js';
import {extractCharacterArchiveEntries} from '../modules/character-archive/character-archive-model.js';
import {resolveInventoryItem} from '../modules/character-inventory/character-inventory-identity.js';
import {applySceneInventoryTransfer} from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import {synchronizeEquipmentFromInventory} from '../modules/character-equipment/character-equipment-sync.js';
import {renderWeaponLoadout} from '../modules/combat/ui/combat-weapon-loadout-view.js';
import {renderActionTable} from '../modules/combat/ui/combat-action-table.js';

const ylva=JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/ylva-wolfshorn.json',import.meta.url),'utf8')).character;
const template=STANDARD_ITEMS.find(item=>item.id===YLVA_SAEX.templateId);
const apply=(source,patch)=>{const result=structuredClone(source);for(const [path,value] of Object.entries(patch||{})){const [section,key]=path.split('.');result[section][key]=value;}return result;};

test('Saex grant only appends linked possession and weapon, preserves live state and is idempotent',()=>{
 const source=structuredClone(ylva);
 source.inventory.items=source.inventory.items.filter(item=>item.id!==YLVA_SAEX.inventoryItemId);
 source.combatProfile.weapons=source.combatProfile.weapons.filter(item=>item.id!==YLVA_SAEX.weaponId);
 source.combatProfile.hitPoints.current=0;
 source.combatProfile.resources.forEach(resource=>resource.current=0);
 const before=structuredClone(source),patch=planYlvaSaexGrant(source,{now:'2026-09-28T21:00:00Z'}),after=apply(source,patch);
 assert.deepEqual(source,before);
 assert.deepEqual(Object.keys(patch).sort(),['inventory.items','inventory.revision','combatProfile.weapons','combatProfile.revision'].sort());
 assert.deepEqual(after.inventory.items.slice(0,-1),before.inventory.items);
 assert.deepEqual(after.combatProfile.weapons.slice(0,-1),before.combatProfile.weapons);
 assert.deepEqual(after.combatProfile.hitPoints,before.combatProfile.hitPoints);
 assert.deepEqual(after.combatProfile.resources,before.combatProfile.resources);
 assert.deepEqual(after.combatProfile.combat,before.combatProfile.combat);
 assert.equal(after.inventory.items.at(-1).purchase,undefined);
 assert.equal(planYlvaSaexGrant(after),null);
 assert.throws(()=>planYlvaSaexGrant({...source,id:'someone-else'}));
});

test('default Saex is 1d8, strictly one-handed and works with existing Skytte sidearm techniques',()=>{
 assert.equal(template.combatDefinition.damageFormula,'1d8');
 assert.equal(template.combatDefinition.versatileDamageFormula,'');
 const source=structuredClone(ylva);
 source.combatProfile.weapons.forEach(weapon=>weapon.equipped=weapon.id===YLVA_SAEX.weaponId);
 source.combatProfile.combat.offHandWeaponId='';
 const actor=resolveCombatProfile(source,{actionId:'weapon:'+YLVA_SAEX.weaponId,weaponGrip:'two-handed'});
 assert.equal(actor.weapon.damageFormula,'1d8');
 assert.equal(actor.weaponGrip,'one-handed');
 assert.equal(actor.supportsVersatileGrip,false);
 assert.equal(actor.weapon.attackAttribute,'strength');
 assert.equal(getWeaponDamageModifier(actor,actor.weapon),1);
 assert.deepEqual(actor.resourceCosts.map(cost=>[cost.resourceId,cost.amount]),[['action',1]]);
 const technique=actor.techniques.find(entry=>entry.name==='Sax im Unterholz');
 assert.ok(technique);
 assert.equal(isTechniqueCompatibleWithWeapon(technique,actor.weapon),true);
 assert.match(renderActionTable(actor,actor.profileActionId),/Wolfshorn-Saex/);
});

test('Saex shares image and identity across inventory, market, combat, archive and comment weapon switch',()=>{
 const item=ylva.inventory.items.find(item=>item.id===YLVA_SAEX.inventoryItemId);
 const profile=resolveCharacterCombatProfile(ylva),weapon=profile.weapons.find(item=>item.id===YLVA_SAEX.weaponId);
 assert.equal(item.equipmentLink.combatEntryId,weapon.id);
 assert.equal(weapon.inventoryItemId,item.id);
 assert.equal(resolveInventoryItem(item,{character:ylva}).image,template.image);
 assert.equal(buildOwnedItems([ylva],STANDARD_ITEMS).find(entry=>entry.inventoryItemId===item.id).image,template.image);
 assert.equal(extractCharacterArchiveEntries(ylva).find(entry=>entry.kind==='attack'&&entry.data.id===weapon.id).icon,template.image);
 assert.equal(weapon.image,template.image);
 assert.equal(weapon.equipped,false);
 assert.match(renderWeaponLoadout({...profile,actions:[{kind:'equipment-switch'}]}),/ylva-saex-v2\.png/);
 const synced=synchronizeEquipmentFromInventory({inventory:ylva.inventory,combatProfile:ylva.combatProfile});
 assert.equal(synced.combatProfile.weapons.find(entry=>entry.id===weapon.id).damageFormula,'1d8');
});

test('market purchases and transfers retain the same default Saex rules without granting it back',()=>{
 const buyer={id:'buyer',name:'Buyer',inventory:{items:[],moneyState:{copper:1000}},combatProfile:{weapons:[],armorItems:[]}};
 const purchase=applyRegisterTrade(buyer,template,{direction:'buy',quantity:1,unitCopper:template.priceRange.minCopper},{instanceId:'bought-saex',now:'2026-09-28T21:00:00Z'});
 assert.equal(purchase.combatProfile.weapons[0].damageFormula,'1d8');
 assert.equal(purchase.combatProfile.weapons[0].versatileDamageFormula,'');
 const transfer=applySceneInventoryTransfer(ylva,buyer,{kind:'item',itemId:YLVA_SAEX.inventoryItemId,quantity:1},{transferredAt:'2026-09-28T21:00:00Z'});
 assert.equal(transfer.receiverInventory.items[0].combatDefinition.damageFormula,'1d8');
 assert.equal(transfer.receiverInventory.items[0].image,template.image);
 assert.equal(transfer.giverInventory.items.some(item=>item.id===YLVA_SAEX.inventoryItemId),false);
 assert.equal(resolveCharacterCombatProfile({...ylva,inventory:transfer.giverInventory,combatProfile:transfer.giverCombatProfile})
   .weapons.some(weapon=>weapon.id===YLVA_SAEX.weaponId),false);
});
