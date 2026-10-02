import { readFile, writeFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../../modules/combat/combat-profile-resolver.js';
import { createAuditFighter } from './post-simulation.mjs';
import { evaluateOffensivePlan, samplePlan } from './fairness-sampling.mjs';

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node tools/combat-audit/run-fairness.mjs records.json report.json');
const records = JSON.parse(await readFile(input,'utf8'));
const names = ['Gawain Draig','Gildas Gafyr','Asgeir Wolfshorn','Ylva Wolfshorn','Nudd Saethwyr','Gais Wyrm','Fenrir Varulv','Guinevere Neidr','Freya Skald','Rhiannon Draig'];
const fighters = records.filter(r=>names.includes(r.name)).map(createAuditFighter);
const dummy = createAuditFighter({id:'audit-dummy',name:'Referenzziel RK16',combatProfile:{hitPoints:{maximumOverride:10000,current:10000},armorClass:{override:16},weapons:[{id:'dummy',name:'Referenz',damageFormula:'1d6',equipped:true}]}});
const report={date:'2026-10-03',source:'read-only online records',productionWrites:false,
  method:{unit:'one complete contribution (all segments)',candidateSamples:48,postSamples:512,
    ranking:'Best summed sampled direct damage within the actual resource budget; then full sequential resolution.',
    assumptions:['Rested figures, actual selected equipment and ammunition. No invented item ownership.',
      'Regular: no special actions, aura or limited-use abilities; casting still spends mana.',
      'Burst: all currently available maxima including limited uses; not renewable each contribution.',
      'No free pre-buffs, no automatic tactical healing, no move-distance value.',
      'Critical damage, equipment, saves and follow-ups included; random encounter-critical side effects excluded.',
      'HP/mean is a pressure indicator, not expected duel duration or victory probability.']},
  profiles:records.map(record=>{const p=resolveCombatProfile(record,{includeAiSnapshot:false});return {name:record.name,level:p.effectiveLevel,hp:p.maximumHitPoints,defense:p.totalDefense,actions:p.actions.length,weapon:p.weapon?.name};}),
  plans:[],matchups:[],errors:[]};
const plans=new Map();
for(const f of fighters){
 for(const burst of [false,true]){
  const mode=burst?'burst':'regular';
  const evaluation=await evaluateOffensivePlan(f,dummy,burst);
  report.errors.push(...evaluation.errors);
  plans.set(`${f.character.name}:${mode}`,evaluation.plan);
  const {errors,...row}=evaluation;
  report.plans.push({name:f.character.name,mode,...row});
 }
 console.log('planned',f.character.name);
 await writeFile(output,JSON.stringify(report,null,2)+'\n');
}
const pairs=[['Gawain Draig','Gildas Gafyr'],['Asgeir Wolfshorn','Gawain Draig'],['Asgeir Wolfshorn','Gildas Gafyr'],['Ylva Wolfshorn','Gawain Draig'],['Ylva Wolfshorn','Asgeir Wolfshorn'],['Nudd Saethwyr','Gildas Gafyr'],['Gais Wyrm','Gawain Draig'],['Fenrir Varulv','Gildas Gafyr'],['Guinevere Neidr','Gawain Draig'],['Rhiannon Draig','Gawain Draig'],['Freya Skald','Gildas Gafyr']];
for(const pair of pairs)for(const [a,b] of [pair,[...pair].reverse()]){
 const attacker=fighters.find(f=>f.character.name===a),defender=fighters.find(f=>f.character.name===b);
 for(const mode of ['regular','burst']){
  const plan=plans.get(`${a}:${mode}`);
  report.matchups.push({attacker:a,defender:b,mode,...await samplePlan(attacker,defender,plan,{label:a+b,seedOffset:0})});
 }
 console.log('matched',a,'->',b);
 await writeFile(output,JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({plans:report.plans.length,matchups:report.matchups.length,errors:report.errors}));
