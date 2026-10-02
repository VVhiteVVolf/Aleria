import { readFile, writeFile } from 'node:fs/promises';
import { withEquippedCombatWeapon } from '../../modules/combat/combat-equipment-state.js';
import { isPairedCombatWeapon } from '../../modules/combat/combat-weapon-loadout.js';
import { createAuditFighter } from './post-simulation.mjs';
import { evaluateOffensivePlan, samplePlan } from './fairness-sampling.mjs';

const [input, output] = process.argv.slice(2);
if(!input||!output)throw Error('Usage: run-loadouts.mjs records.json report.json');
const records=JSON.parse(await readFile(input,'utf8'));
const get=name=>records.find(r=>r.name===name);
const dummy=createAuditFighter({id:'audit-dummy',name:'Referenzziel RK16',combatProfile:{hitPoints:{maximumOverride:10000,current:10000},armorClass:{override:16},weapons:[{id:'dummy',name:'Referenz',damageFormula:'1d6',equipped:true}]}});
const target=createAuditFighter(get('Gawain Draig'));
const report={date:'2026-10-03',productionWrites:false,variants:[],armor:[],errors:[]};
for(const [name,type,label] of [['Ylva Wolfshorn','spear','Speer'],['Fenrir Varulv','axe','Doppeläxte'],['Guinevere Neidr','dagger','Doppeldolche']]) {
 const record=get(name),weapons=record.combatProfile.weapons;
 const matching=weapons.filter(w=>w.weaponType===type&&(type!=='axe'||!/[gG]ro[ßs]|[zZ]weih/.test(w.name)));
 if(!matching.length)throw Error(`${name}: no existing ${type}`);
 const right=matching[0],left=type==='spear'?'':matching[1]?.id||(isPairedCombatWeapon(right)?right.id:'');
 const fighter=createAuditFighter(withEquippedCombatWeapon(record,right.id,left));
 for(const burst of [false,true]) {
   const {errors,...result}=await evaluateOffensivePlan(fighter,dummy,burst);
   report.errors.push(...errors);
   report.variants.push({name,loadout:label,weapon:fighter.profile().weapon.name,formula:fighter.profile().weapon.damageFormula,mode:burst?'burst':'regular',...result,
     versusGawain:await samplePlan(fighter,target,result.plan)});
 }
 console.log('loadout',name,label);
 await writeFile(output,JSON.stringify(report,null,2)+'\n');
}
for(const name of ['Ylva Wolfshorn','Guinevere Neidr','Asgeir Wolfshorn']) {
 const original=get(name),bare=structuredClone(original);
 bare.combatProfile.armorItems.forEach(a=>{if(a.kind==='armor')a.equipped=false;});
 report.armor.push({name,worn:createAuditFighter(original).profile().totalDefense,withoutBodyArmor:createAuditFighter(bare).profile().totalDefense,
   note:'Comparison only. Removing armor also removes its damage protection and other item effects.'});
}
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({variants:report.variants.length,armor:report.armor,errors:report.errors}));
