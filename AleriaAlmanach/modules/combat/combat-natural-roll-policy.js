import { getNaturalRollPolicy } from './combat-profile-model.js';

const keptNatural = (dice, mode) => mode === 'advantage' ? Math.max(...dice)
  : mode === 'disadvantage' ? Math.min(...dice) : dice[0];

// One replacement per original die; never recurse on a replacement of 1.
// The server adapter reconstructs and validates originals from the submitted receipt.
export async function rollProfileD20(diceAdapter, method, request, profile) {
  const naturalRollPolicy = getNaturalRollPolicy(profile);
  const roll = await diceAdapter[method]({ ...request, naturalRollPolicy });
  const dice = Array.isArray(roll.dice) && roll.dice.length ? roll.dice.slice() : [Number(roll.natural)];
  const rerolls = [];
  if (naturalRollPolicy.naturalOneReroll) {
    for (let dieIndex = 0; dieIndex < dice.length; dieIndex++) {
      if (dice[dieIndex] !== 1) continue;
      const provided = roll.validatedNaturalOneReplacements?.find(entry => entry.dieIndex === dieIndex);
      const replacementRoll = provided ? { natural: provided.replacement, id: provided.rollId }
        : await diceAdapter[method]({ ...request, modifier: 0, notation: '1d20', rollMode: 'normal', naturalOneReplacement: true,
          skillName: `${request.skillName || 'W20'} · Glückswiederholung`, naturalRollPolicy: { naturalOneReroll: false, criticalFailureMaximum: naturalRollPolicy.criticalFailureMaximum } });
      const replacement = Number(replacementRoll.natural);
      if (!Number.isInteger(replacement) || replacement < 1 || replacement > 20) throw Error('Der Glückswiederholungswurf benötigt einen gültigen W20.');
      dice[dieIndex] = replacement;
      rerolls.push({ dieIndex, original: 1, replacement, rollId: String(replacementRoll.id || '') });
    }
  }
  const { validatedNaturalOneReplacements, ...publicRoll } = roll;
  if (!rerolls.length) return { ...publicRoll, naturalRollPolicy };
  const natural = keptNatural(dice, request.rollMode);
  return { ...publicRoll, dice, keptDice: [natural], natural, total: natural + Number(request.modifier || 0), naturalRollPolicy, rerolls };
}

export function naturalRollReceipt(roll = {}) {
  return {
    ...(roll.naturalRollPolicy ? { naturalRollPolicy: { ...roll.naturalRollPolicy } } : {}),
    ...(roll.rerolls?.length ? { rerolls: roll.rerolls.map(entry => ({ ...entry })) } : {})
  };
}

// Ordinary combat saves keep their existing total-versus-DC rule. Bad luck
// explicitly adds the 1–3 failure range without creating critical spell damage.
export function succeedsProfileSavingThrow(roll, dc) {
  const maximum = Number(roll.naturalRollPolicy?.criticalFailureMaximum) || 1;
  return !(maximum > 1 && Number(roll.natural) <= maximum) && Number(roll.total) >= dc;
}

export function getNaturalRollDistribution(profile, rollMode = 'normal') {
  const lucky = getNaturalRollPolicy(profile).naturalOneReroll;
  const weights = Array.from({ length: 20 }, (_, i) => lucky ? (i === 0 ? 1 / 400 : 21 / 400) : 1 / 20);
  let cumulative = 0;
  return weights.map((weight, index) => {
    const before = cumulative;
    cumulative += weight;
    return { natural: index + 1, weight: rollMode === 'advantage' ? cumulative ** 2 - before ** 2
      : rollMode === 'disadvantage' ? (1 - before) ** 2 - (1 - cumulative) ** 2 : weight };
  });
}
