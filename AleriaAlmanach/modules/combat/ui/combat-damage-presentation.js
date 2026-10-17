// Describe committed roll receipts. Older receipts retain their original formula.
export function describeRecordedDamageRoll(roll = {}, fallback = '') {
  roll ??= {};
  const dice = roll.diceResults || roll.keptDice || [];
  const critical = roll.criticalDamage;
  if (roll.damageMultiplier === 2) return `2 × (${roll.notation || fallback}${dice.length ? ` · Würfel [${dice.join(', ')}]` : ''}) · vor Schutz`;
  if (critical?.version === 1 && critical.rule === 'maximum-plus-roll') {
    const bonus = Number(critical.fixedBonus) || 0;
    return `${critical.maximum} gesetzt + ${String(critical.rolledFormula).replace(/d/gi, 'W')}${dice.length ? ` [${dice.join(', ')}]` : ''}${bonus ? ` ${bonus > 0 ? '+' : '−'} ${Math.abs(bonus)}` : ''}`;
  }
  return `${roll.notation || fallback}${dice.length ? ` · Würfel [${dice.join(', ')}]` : ''}`;
}
