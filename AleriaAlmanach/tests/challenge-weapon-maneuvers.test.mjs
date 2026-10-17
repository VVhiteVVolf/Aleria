import assert from 'node:assert/strict';
import test from 'node:test';
import {normalizeChallengeWeaponManeuver,validateChallengeWeaponManeuver,describeChallengeWeaponManeuver} from '../modules/herausforderung/herausforderung-weapon-maneuver-model.js';
import {normalizeChallengeCombatEffects,validateChallengeCombatEffects} from '../modules/herausforderung/herausforderung-combat-effects.js';
import {createHerausforderungExport,parseHerausforderungImport} from '../modules/herausforderung/herausforderung-exchange.js';
import {renderChallengeWeaponManeuverFields} from '../modules/herausforderung/herausforderung-weapon-maneuver-ui.js';
import {describeRecordedDamageRoll} from '../modules/combat/ui/combat-damage-presentation.js';

const maneuver=()=>({actorId:'gais',weaponId:'lance',pickupWeapon:true,resourceId:'reaction',extraWeaponDice:1,rollMode:'normal',damageMultiplier:1,save:null});
const effect=()=>({effectId:'recovery',type:'weapon-maneuver',targetActorId:'ylva',amount:0,maneuver:maneuver()});
test('maneuver normalization retains all authored rules and does not create arbitrary damage',()=>{
 const value=effect(),normalized=normalizeChallengeCombatEffects([value])[0];
 assert.deepEqual(normalized.maneuver,value.maneuver);assert.equal(normalized.amount,0);assert.equal(normalized.formula,'');assert.equal(validateChallengeCombatEffects([value]),null);
 assert.match(describeChallengeWeaponManeuver(value),/1 Reaktion/);assert.match(renderChallengeWeaponManeuverFields(value),/Aufnahme.*Angriff|Waffenaufnahme/);
});
test('impossible and unknown maneuver instructions fail before normalization',()=>{
 for(const patch of [{actorId:'ylva'},{pickupWeapon:true,resourceId:''},{pickupWeapon:true,weaponId:''},{extraWeaponDice:5},{extraWeaponDice:1.5},{extraWeaponDice:'1'},
  {damageMultiplier:4},{save:{attribute:'luck',difficulty:15}},{save:{attribute:'dexterity',difficulty:15}},{guaranteedHit:true}]) {
  assert.ok(validateChallengeWeaponManeuver({...maneuver(),...patch},'ylva'),JSON.stringify(patch));
 }
 assert.equal(normalizeChallengeWeaponManeuver({actorId:'ylva'}).damageMultiplier,1);
});
test('export and import preserve the maneuver and require its actual combat participants',()=>{
 const document=createHerausforderungExport({title:'Rutscher',publicDescription:'Die Lanze liegt im Sand.',combatBound:true,approaches:[{
  approachId:'slide',label:'Rutschen',preferredSkills:['acrobatics'],difficulty:18,insight:'Die Aufnahme gelingt.',rewards:{copper:0,items:[],effects:[],combatEffects:[effect()]}
 }]});
 const context={participants:[{actorId:'gais',name:'Gais'},{actorId:'ylva',name:'Ylva'}]};
 const parsed=parseHerausforderungImport(JSON.stringify(document),{},context);assert.deepEqual(createHerausforderungExport(parsed.event),document);
 assert.throws(()=>parseHerausforderungImport(JSON.stringify(document),{},{participants:[{actorId:'ylva'}]}),/Angreifer/);
});
test('double-normal damage is visibly distinguished from the ordinary critical damage rule',()=>{
 assert.match(describeRecordedDamageRoll({notation:'1d8+5',diceResults:[4],damageMultiplier:2,unmultipliedTotal:9}),/^2 ×/);
 assert.equal(describeRecordedDamageRoll({notation:'1d8+5',diceResults:[4]}),'1d8+5 · Würfel [4]');
});
