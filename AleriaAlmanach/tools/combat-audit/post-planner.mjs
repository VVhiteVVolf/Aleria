import { getActionPaymentCosts, canUseAuraPayment } from '../../modules/combat/combat-action-economy.js';
import { getCombatDamagePreview, estimateCombatHitChance } from '../../modules/combat/combat-action-estimates.js';

const ordinary = new Set(['action', 'bonus-action', 'reaction']);

export function offensiveCandidates(fighter, target, { burst = false } = {}) {
  const base = fighter.profile();
  const budget = Object.fromEntries(base.resources.map(r => [r.id, burst || ordinary.has(r.id) ? r.maximum : 0]));
  // Mana is a continuing casting cost, shown separately from daily burst points.
  for (const r of base.resources) if (/mana/.test(r.id)) budget[r.id] = r.maximum;
  const candidates = [];
  for (const action of base.actions) {
    if (action.compatible === false || action.kind === 'equipment-switch' || action.channelComments > 0) continue;
    for (const paymentMode of burst && canUseAuraPayment(action,base) ? ['standard','aura'] : ['standard']) {
      const p = fighter.profile(action.id,paymentMode), preview = getCombatDamagePreview(p);
      if (!preview?.average) continue;
      const costs = Object.fromEntries(getActionPaymentCosts(p.selectedAction,paymentMode,p).map(c=>[c.resourceId,c.amount]));
      const ability = p.abilities.find(a=>`ability:${a.id}`===action.id);
      if(ability?.usesMaximum>0){ costs[`uses:${ability.id}`]=1;budget[`uses:${ability.id}`]=burst?ability.usesMaximum:0; }
      if(!Object.keys(costs).length || Object.entries(costs).some(([id,n])=>n>(budget[id]||0)))continue;
      const chance = estimateCombatHitChance(p,target)?.probability ?? 0;
      const follow = action.followUpAttack;
      const multiplier = follow?.enabled ? 1 + (follow.repeatCount||1) * (follow.afterMiss ? 1 : chance) : 1;
      // Candidate ranking only; report damage always comes from full sampled resolution.
      const score = preview.average * chance * multiplier;
      candidates.push({ id:action.id,name:action.name,paymentMode,costs,score,formula:preview.notation });
    }
  }
  return { budget, candidates };
}

export function chooseOffensivePlan(candidates, budget) {
  const ids=Object.keys(budget).sort(), memo=new Map();
  function choose(remaining) {
    const key=ids.map(id=>remaining[id]||0).join(',');
    if(memo.has(key))return memo.get(key);
    let best={score:0,plan:[]};
    for(const c of candidates){
      if(Object.entries(c.costs).some(([id,n])=>n>(remaining[id]||0)))continue;
      const next={...remaining};for(const [id,n] of Object.entries(c.costs))next[id]-=n;
      const tail=choose(next),score=c.score+tail.score;
      if(score>best.score+1e-9)best={score,plan:[c,...tail.plan]};
    }
    memo.set(key,best);return best;
  }
  return choose(budget);
}
