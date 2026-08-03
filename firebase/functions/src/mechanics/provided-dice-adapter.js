import { HttpsError } from 'firebase-functions/v2/https';
import { parseDamageFormula } from '../generated/combat/rules/combat-mvp-rules.js';

function invalid(message) {
  throw new HttpsError('invalid-argument', message);
}

function validateDieResults(values, expectedCount, sides, label) {
  if (!Array.isArray(values) || values.length !== expectedCount) {
    invalid(`${label}: Es wurden ${expectedCount} gültige W${sides}-Ergebnisse erwartet.`);
  }
  return values.map(value => {
    const result = Number(value);
    if (!Number.isInteger(result) || result < 1 || result > sides) {
      invalid(`${label}: Ein Würfelergebnis liegt außerhalb von 1 bis ${sides}.`);
    }
    return result;
  });
}

export class ProvidedDiceAdapter {
  constructor(submittedResolution = {}) {
    this.submitted = submittedResolution;
  }

  async rollAttack({ modifier = 0, rollMode = 'normal' } = {}) {
    const source = this.submitted.attack || {};
    const expectedCount = rollMode === 'normal' ? 1 : 2;
    const dice = validateDieResults(source.diceResults, expectedCount, 20, 'Angriffswurf');
    const natural = rollMode === 'advantage'
      ? Math.max(...dice)
      : (rollMode === 'disadvantage' ? Math.min(...dice) : dice[0]);
    if (Number(source.naturalRoll) !== natural) invalid('Der ausgewählte W20 stimmt nicht mit dem Würfelbeleg überein.');
    return {
      id: String(source.rollId || ''),
      natural,
      dice,
      keptDice: [natural],
      total: natural + Number(modifier || 0),
      visualMode: 'server-validated'
    };
  }

  async rollSkill({ modifier = 0, rollMode = 'normal' } = {}) {
    const source = this.submitted;
    const expectedCount = rollMode === 'normal' ? 1 : 2;
    const dice = validateDieResults(source.diceResults, expectedCount, 20, 'Fertigkeitswurf');
    const natural = rollMode === 'advantage'
      ? Math.max(...dice)
      : (rollMode === 'disadvantage' ? Math.min(...dice) : dice[0]);
    if (Number(source.natural) !== natural) invalid('Der ausgew\u00e4hlte W20 des Fertigkeitswurfs stimmt nicht mit dem W\u00fcrfelbeleg \u00fcberein.');
    return {
      id: String(source.rollId || ''),
      natural,
      dice,
      keptDice: [natural],
      total: natural + Number(modifier || 0),
      visualMode: 'server-validated'
    };
  }

  async rollDamage({ damageFormula, bonus = 0, critical = false } = {}) {
    const base = parseDamageFormula(damageFormula);
    const diceCount = critical ? base.diceCount * 2 : base.diceCount;
    const dice = validateDieResults(this.submitted.damage?.diceResults, diceCount, base.sides, 'Schadenswurf');
    const modifier = base.fixedModifier + Number(bonus || 0);
    return {
      id: String(this.submitted.damage?.rollId || ''),
      notation: `${diceCount}d${base.sides}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}`,
      keptDice: dice,
      modifier,
      total: Math.max(0, dice.reduce((sum, value) => sum + value, 0) + modifier),
      visualMode: 'server-validated'
    };
  }
}
