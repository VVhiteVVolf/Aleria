import { readFile, writeFile } from 'node:fs/promises';
import { createAuditFighter, simulatePost } from './post-simulation.mjs';
import { samplePlan } from './fairness-sampling.mjs';
import { setCharacterHitPointMaximum } from '../../modules/combat/combat-profile-model.js';

const [input, fairnessFile, output] = process.argv.slice(2);
if(!input||!fairnessFile||!output)throw Error('Usage: run-survival.mjs records.json fairness.json survival.json');
const records=JSON.parse(await readFile(input,'utf8')),fairness=JSON.parse(await readFile(fairnessFile,'utf8'));
const gawain=createAuditFighter(records.find(r=>r.name==='Gawain Draig'));
const rhiannon=records.find(r=>r.name==='Rhiannon Draig');
const plan=fairness.plans.find(p=>p.name==='Gawain Draig'&&p.mode==='burst').plan;
const report={date:'2026-10-03',productionWrites:false,attacker:'Gawain Draig',mode:'burst',samplesPerCase:512,hitPoints:[],defenses:[]};
for(const maximum of [25,30,35,40,45]) {
 const hypothetical=structuredClone(rhiannon);
 setCharacterHitPointMaximum(hypothetical.combatProfile,maximum);
 const target=createAuditFighter(hypothetical);
 report.hitPoints.push({maximumHp:target.profile().maximumHitPoints,...await samplePlan(gawain,target,plan,{label:'Gawain DraigRhiannon Draig',seedOffset:0})});
}
const target=createAuditFighter(rhiannon);
for(const id of ['rhiannon-schild','rhiannon-spiegelbilder','rhiannon-magierruestung']) {
 const actionId=`spell:${id}`,profile=target.profile(actionId);
 if(profile.profileActionId!==actionId){report.defenses.push({id,unavailable:true});continue;}
 const prepared=await simulatePost({attacker:target,defender:gawain,plan:[{id:actionId}],seed:294});
 const state=prepared.states.get(target.character.id);
 report.defenses.push({name:profile.selectedAction.name,costs:profile.resourceCosts,temporaryHitPoints:state.temporary||0,
   conditions:(state.temporaryConditions||[]).map(c=>({name:c.name,ward:c.ward,mechanics:c.mechanics})),
   ...await samplePlan(gawain,target,plan,{label:'Gawain DraigRhiannon Draig',seedOffset:0,targetState:state})});
}
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
