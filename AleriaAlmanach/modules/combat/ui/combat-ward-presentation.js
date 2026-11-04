import { getCombatWardDeflectionPolicy } from '../combat-ward-policy.js';

export function describeCombatWardDeflection(ward = {}) {
  const policy = getCombatWardDeflectionPolicy(ward.deflectChance);
  const method = policy.requiresRoll ? `W20 ≤ ${policy.threshold}` : policy.automaticDeflection ? 'ohne Wurf' : 'kein Ablenkungswurf';
  const configured = policy.configuredChance !== policy.effectiveChance ? `; eingetragen ${policy.configuredChance} %` : '';
  return `Ablenkung ${policy.effectiveChance} % (${method}${configured})`;
}

export const COMBAT_WARD_PERCENTAGE_HELP = 'Ablenkungen werden mit einem W20 auf den nächsten 5-%-Schritt gerundet, bei positiven Werten mindestens 5 %. 100 % wirkt ohne Wurf.';
