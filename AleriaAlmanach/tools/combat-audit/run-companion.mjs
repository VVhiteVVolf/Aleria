import {readFile,writeFile} from 'node:fs/promises';
import {createAuditFighter} from './post-simulation.mjs';
import {evaluateOffensivePlan,samplePlan} from './fairness-sampling.mjs';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw Error('Usage: run-companion.mjs records.json report.json');
const records=JSON.parse(await readFile(input,'utf8'));
const freki=createAuditFighter(records.find(r=>r.name==='Freki'));
const gawain=createAuditFighter(records.find(r=>r.name==='Gawain Draig'));
const asgeir=createAuditFighter(records.find(r=>r.name==='Asgeir Wolfshorn'));
const result=[];
for(const burst of [false,true]) {
 const plan=await evaluateOffensivePlan(freki,gawain,burst);
 result.push({name:'Freki',hp:freki.profile().maximumHitPoints,ownContribution:true,mode:burst?'burst':'regular',...plan,
   versusAsgeir:await samplePlan(freki,asgeir,plan.plan)});
}
await writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.map(r=>({name:r.name,mode:r.mode,damage:r.reference.mean,asgeir:r.versusAsgeir.mean,errors:r.errors}))));
