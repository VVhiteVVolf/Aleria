import test from 'node:test';
import assert from 'node:assert/strict';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, normalizeItemDefinition } from '../modules/item-definitions/item-definition-model.js';
import { materializeInventoryItem, storeInventoryItem } from '../modules/item-definitions/item-definition-resolver.js';
import { createGrantedItem } from '../modules/item-register/item-register-model.js';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile, resolveCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { planHouseEquipmentAmendment } from '../modules/house-knight-rings/house-ring-grant-plan.mjs';
import { hasWorkedInventory, resolveHouseSignetMembership } from '../modules/house-knight-rings/house-ring-membership.mjs';
import { HOUSE_RANKS } from '../../Stammbäume/assets/js/domain/house-profile.js';
const now = '2026-11-02T22:00:00.000Z';
const template = id => AUTHORED_ITEMS.find(item => item.id === id);
const membership = (house, person) => ({familyId:`haus-${house}`,worldPersonId:`person--haus-${house}--${person}`});
const hp = {maximum:20,current:20,temporary:0};

test('Silberhirsch retains its immutable carried passive and reduces only magical damage by one',()=>{
 const coin=template('gwynthor-seven:rianna-silberhirsch');
 assert.equal(coin.mechanicsStatus,'defined');
 assert.match(coin.description,/Tenebrit/);assert.match(coin.description,/knistert/);
 const owned=createGrantedItem(coin,{id:'coin',quantity:1});
 assert.equal('passiveEffects' in owned,false,'mutable possessions do not own definition rules');
 const inventory={items:[owned]};
 const profile=synchronizeEquipmentFromInventory({inventory,combatProfile:{}}).combatProfile;
 assert.equal(profile.equipmentPassiveEffects.length,1);
 const sanitized=sanitizeCharacterCombatProfile(profile);
 for(const damageType of ['Feuer','Kälte','Stich']){
  assert.equal(applyTypedCombatDamage(hp,6,sanitized,{damageType,magical:true}).after.current,15);
  assert.equal(applyTypedCombatDamage(hp,6,sanitized,{damageType,magical:false}).after.current,14);
 }
 assert.equal(applyTypedCombatDamage(hp,1,sanitized,{magical:true}).after.current,20);
 assert.equal(applyTypedCombatDamage(hp,0,sanitized,{magical:true}).after.current,20);
 assert.equal(applyTypedCombatDamage(hp,6,sanitized,{magical:true,reductionBypass:1}).after.current,14);
 assert.deepEqual(inventory.items,[owned]);
});

test('duplicated charms do not stack; dropping or consuming the coin removes its derived protection',()=>{
 const owned=createGrantedItem(template('gwynthor-seven:rianna-silberhirsch'),{id:'coin',quantity:1});
 const profile=synchronizeEquipmentFromInventory({inventory:{items:[owned,{...owned,id:'duplicate'}]},combatProfile:{}}).combatProfile;
 assert.equal(applyTypedCombatDamage(hp,6,profile,{magical:true}).after.current,15);
 const removed=synchronizeEquipmentFromInventory({inventory:{items:[]},combatProfile:profile}).combatProfile;
 assert.equal(removed.equipmentPassiveEffects,undefined);
 assert.equal(applyTypedCombatDamage(hp,6,removed,{magical:true}).after.current,14);
 const empty=synchronizeEquipmentFromInventory({inventory:{items:[{...owned,quantity:'0'}]},combatProfile:profile}).combatProfile;
 assert.equal(empty.equipmentPassiveEffects,undefined);
 const resolved=resolveCharacterCombatProfile({id:'rianna',inventory:{items:[]},combatProfile:profile});
 assert.equal(resolved.equipmentPassiveEffects,undefined);
});

test('a carried charm stacks with actual armor protection without changing armor class or old definitions',()=>{
 const owned=createGrantedItem(template('gwynthor-seven:rianna-silberhirsch'),{id:'coin'});
 const armor={id:'armor',name:'Plate',equipped:true,damageProtection:{amount:1,damageTypes:['stich']}};
 const profile=synchronizeEquipmentFromInventory({inventory:{items:[owned]},combatProfile:{armorItems:[armor]}}).combatProfile;
 assert.equal(applyTypedCombatDamage(hp,6,profile,{damageType:'stich',magical:true}).after.current,16);
 assert.equal(applyTypedCombatDamage(hp,6,profile,{damageType:'stich',magical:false}).after.current,15);
 const ordinary=normalizeItemDefinition({id:'ordinary',title:'Ordinary ring',category:'sonstiges'});
 assert.equal('passiveEffects' in ordinary,false,'existing definitions retain their previous serialized shape');
 const definitions=new Map([[itemDefinitionKey(ordinary),ordinary]]);
 const forged={id:'fake',definitionRef:{id:'ordinary',revision:'draft'},passiveEffects:[{type:'damage-reduction',magicScope:'magical',amount:99}]};
 assert.deepEqual(materializeInventoryItem(forged,definitions).passiveEffects,[]);
 assert.equal(synchronizeEquipmentFromInventory({inventory:{items:[forged]},definitions}).combatProfile.equipmentPassiveEffects,undefined);
 assert.equal('passiveEffects' in storeInventoryItem(forged),false);
});

test('own-house rank and real inventory decide eligibility; a service house and untouched examples do not',()=>{
 const families=[{id:'haus-wyrm',title:'Haus Wyrm',houseProfile:{rankId:'knight-prince'}},{id:'haus-gwyllach',title:'Haus Gwyllach',houseProfile:{rankId:'commoner'}}];
 assert.equal(hasWorkedInventory({inventory:{items:[]}}),false);
 assert.equal(hasWorkedInventory({inventory:{items:[{id:'own',name:'My spear'}]}}),true);
 const person={genealogy:{houseId:'house-gwyllach'},identity:{worldPersonId:'person--haus-gwyllach--person'},liegeHouseId:'haus-wyrm'};
 assert.equal(resolveHouseSignetMembership(person,{families,ranks:HOUSE_RANKS}),null);
 const known={genealogy:{houseId:'house-wyrm'},identity:{worldPersonId:'person--haus-wyrm--gais-wyrm'}};
 assert.equal(resolveHouseSignetMembership({id:'gais'},{families,ranks:HOUSE_RANKS,knownCharacter:known}).familyId,'haus-wyrm');
 assert.throws(()=>resolveHouseSignetMembership({identity:{worldPersonId:'different'}},{families,ranks:HOUSE_RANKS,knownCharacter:known}),/anderen Weltperson/);
});

test('Gais gets a personally named Wyrm seal and grants are idempotent with and without a claim',()=>{
 const character={id:'gais',name:'Gais Wyrm',inventory:{money:'77 Kupfer',items:[{id:'keep',name:'Keep',quantity:'1'}]},combatProfile:{hitPoints:{current:3},resources:[{id:'mana',current:2}]}};
 const args={character,membership:membership('wyrm','gais-wyrm'),templates:AUTHORED_ITEMS,now};
 const plan=planHouseEquipmentAmendment(args);
 const ring=plan.character.inventory.items.at(-1);
 assert.equal(ring.name,'Gais Siegelring');assert.equal(ring.definitionRef.id,'house-signet:haus-wyrm');
 assert.deepEqual(plan.character.inventory.items[0],character.inventory.items[0]);
 assert.deepEqual(plan.character.combatProfile,character.combatProfile);assert.equal(plan.character.inventory.money,'77 Kupfer');
 assert.equal(planHouseEquipmentAmendment({...args,character:plan.character}).changed,false);
 assert.equal(planHouseEquipmentAmendment({...args,character:plan.character,claim:plan.grant}).changed,false);
 assert.throws(()=>planHouseEquipmentAmendment({...args,claim:{sourceKey:'wrong'}}),/anderen Figur/);
 assert.equal(character.inventory.items.length,1);
});

test('Gildas keeps his instance identity and existing personal effect while his Draig seal becomes Gafyr',()=>{
 const item={id:'gildas-gafyr-draig-knight-signet-item',name:'Draig-Rittersiegelring',image:'old',icon:'old-icon',description:'Siegelring eines Draig-Ritters. Offen getragen +1 auf Überzeugen.',tags:'Draig, Ring',equipped:true,infoRows:[{label:'Effekt',value:'+1 auf Überzeugen'}]};
 const plan=planHouseEquipmentAmendment({character:{id:'gildas',name:'Gildas Gafyr',inventory:{items:[item]}},membership:membership('gafyr','gildas-gafyr'),templates:AUTHORED_ITEMS,now});
 const ring=plan.character.inventory.items[0];
 assert.equal(plan.character.inventory.items.length,1);assert.equal(ring.id,item.id);
 assert.equal(ring.name,'Gildas Siegelring');assert.equal(ring.definitionRef.id,'house-signet:haus-gafyr');
 assert.equal(ring.icon,ring.image);
 assert.doesNotMatch(ring.description,/Draig/);assert.match(ring.description,/Gafyr/);assert.deepEqual(ring.infoRows,item.infoRows);
 assert.equal(ring.equipped,true);assert.equal(plan.added.length,0);assert.equal(plan.corrected.length,1);
});

test('Owetas spear is appended unequipped while all previous weapons, armor, money and resources survive',()=>{
 const character={id:'oweta',name:'Oweta Draig',inventory:{money:'100 Kupfer',items:[]},combatProfile:{weapons:[{id:'sword',equipped:true}],armorItems:[{id:'armor',equipped:true}],hitPoints:{current:2},resources:[{id:'action',current:0}]}};
 const args={character,membership:membership('draig','oweta-draig'),templates:AUTHORED_ITEMS,now};
 const plan=planHouseEquipmentAmendment(args);
 const spear=plan.character.combatProfile.weapons.at(-1);
 assert.equal(spear.name,'Draig Speer');assert.equal(spear.damageFormula,'1d6');assert.equal(spear.versatileDamageFormula,'1d8');assert.equal(spear.equipped,false);
 assert.deepEqual(plan.character.combatProfile.weapons[0],character.combatProfile.weapons[0]);
 assert.deepEqual(plan.character.combatProfile.armorItems,character.combatProfile.armorItems);
 assert.deepEqual(plan.character.combatProfile.hitPoints,character.combatProfile.hitPoints);
 assert.deepEqual(plan.character.combatProfile.resources,character.combatProfile.resources);
 assert.equal(plan.character.inventory.money,character.inventory.money);
 assert.equal(planHouseEquipmentAmendment({...args,character:plan.character}).changed,false);
});
