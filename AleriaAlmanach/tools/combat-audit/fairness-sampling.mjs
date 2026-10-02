import { offensiveCandidates, chooseOffensivePlan } from './post-planner.mjs';
import { simulatePost, summarizeSamples } from './post-simulation.mjs';

export function auditSeed(name,index) {
  let seed=2166136261;
  for(const c of name)seed=Math.imul(seed^c.charCodeAt(0),16777619);
  return (seed+Math.imul(index+1,2654435761))>>>0;
}

export async function samplePlan(attacker,defender,plan,{samples=512,label=attacker.character.name,seedOffset=10000,targetState=null}={}) {
  const results=[];
  for(let i=0;i<samples;i++)results.push(await simulatePost({attacker,defender,plan,seed:auditSeed(label,i+seedOffset),targetState}));
  return summarizeSamples(results,defender.profile().maximumHitPoints);
}

export async function evaluateOffensivePlan(fighter,target,burst=false) {
  const pool=offensiveCandidates(fighter,target.profile(),{burst}), errors=[];
  for(const c of pool.candidates) {
    try { c.score=(await samplePlan(fighter,target,[c],{samples:48,seedOffset:0})).mean; }
    catch(error){errors.push({name:fighter.character.name,action:c.name,error:error.message});c.score=0;}
  }
  const chosen=chooseOffensivePlan(pool.candidates.filter(c=>c.score>0),pool.budget);
  return {budget:pool.budget,plan:chosen.plan,errors,reference:await samplePlan(fighter,target,chosen.plan)};
}
