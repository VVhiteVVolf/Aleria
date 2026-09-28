import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {STANDARD_ITEMS as serverItems} from '../src/generated/item-register/item-register-standard.js';
import {STANDARD_ITEMS as browserItems} from '../../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import {resolveCombatProfile as serverResolve} from '../src/generated/combat/combat-profile-resolver.js';
import {resolveCombatProfile as browserResolve} from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';

test('Saex catalog, one-handed damage and action costs agree in browser and server mechanics',async()=>{
 const id='standard:waffen-rustungen:saex';
 assert.deepEqual(serverItems.find(item=>item.id===id),browserItems.find(item=>item.id===id));
 const character=JSON.parse(await readFile(new URL('../../../Charakter%20Archiv%20Exporte/ylva-wolfshorn.json',import.meta.url),'utf8')).character;
 character.combatProfile.weapons.forEach(weapon=>weapon.equipped=weapon.id==='ylva-saex');
 character.combatProfile.combat.offHandWeaponId='';
 const options={actionId:'weapon:ylva-saex',weaponGrip:'two-handed'};
 const server=serverResolve(character,options),browser=browserResolve(character,options);
 for(const key of ['weapon','weaponGrip','attackModifier','damageModifier','resourceCosts'])assert.deepEqual(server[key],browser[key],key);
 assert.equal(server.weapon.damageFormula,'1d8');
 assert.equal(server.weaponGrip,'one-handed');
 assert.deepEqual(server.resourceCosts.map(cost=>[cost.resourceId,cost.amount]),[['action',1]]);
});
