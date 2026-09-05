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
    this.attackIndex = 0;
    this.damageIndex = 0;
    this.savingThrowIndex = 0;
    const damageSources = [];
    const seenRolls = new Set();
    const rememberDamage = source => {
      if (!source || typeof source !== 'object') return;
      const dice = source.diceResults || source.keptDice;
      if (!Array.isArray(dice)) return;
      const key = String(source.rollId || source.id || `${source.notation || ''}:${dice.join(',')}:${damageSources.length}`);
      if (seenRolls.has(key)) return;
      seenRolls.add(key);
      damageSources.push(source);
    };
    rememberDamage(submittedResolution.damage);
    (Array.isArray(submittedResolution.followUpAttacks) ? submittedResolution.followUpAttacks : []).forEach(followUp => rememberDamage(followUp?.damage));
    (Array.isArray(submittedResolution.effectResults) ? submittedResolution.effectResults : []).forEach(result => rememberDamage(result?.roll));
    this.damageSources = damageSources;
  }

  async rollAttack({ modifier = 0, rollMode = 'normal' } = {}) {
    const source = this.attackIndex++ === 0
      ? (this.submitted.attack || {})
      : (this.submitted.followUpAttacks?.[this.attackIndex - 2]?.attack || {});
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
    const source = this.damageSources[this.damageIndex++] || {};
    const terms = base.terms || [{ diceCount: base.diceCount, sides: base.sides }];
    const expectedTerms = terms.map(term => ({ ...term, diceCount: critical ? term.diceCount * 2 : term.diceCount }));
    const submittedDice = Array.isArray(source.diceResults)
      ? source.diceResults
      : (Array.isArray(source.keptDice) ? source.keptDice : []);
    const expectedCount = expectedTerms.reduce((sum, term) => sum + term.diceCount, 0);
    if (submittedDice.length !== expectedCount) invalid(`Schadenswurf: Es wurden ${expectedCount} gültige Würfelergebnisse erwartet.`);
    let offset = 0;
    const dice = expectedTerms.flatMap(term => {
      const values = submittedDice.slice(offset, offset + term.diceCount);
      offset += term.diceCount;
      return validateDieResults(values, term.diceCount, term.sides, 'Schadenswurf');
    });
    const modifier = base.fixedModifier + Number(bonus || 0);
    return {
      id: String(source.rollId || source.id || ''),
      notation: `${expectedTerms.map(term => `${term.diceCount}d${term.sides}`).join('+')}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}`,
      keptDice: dice,
      modifier,
      total: Math.max(0, dice.reduce((sum, value) => sum + value, 0) + modifier),
      visualMode: 'server-validated'
    };
  }

  async rollSavingThrow({ modifier = 0, rollMode = 'normal' } = {}) {
    const source = this.submitted.secondarySaves?.[this.savingThrowIndex++] || {};
    const expectedCount = rollMode === 'normal' ? 1 : 2;
    const dice = validateDieResults(source.diceResults, expectedCount, 20, 'Sekundärer Rettungswurf');
    const natural = rollMode === 'advantage'
      ? Math.max(...dice)
      : (rollMode === 'disadvantage' ? Math.min(...dice) : dice[0]);
    if (Number(source.naturalRoll) !== natural) invalid('Der ausgewählte W20 des sekundären Rettungswurfs stimmt nicht mit dem Würfelbeleg überein.');
    return {
      id: String(source.rollId || ''),
      natural,
      dice,
      keptDice: [natural],
      total: natural + Number(modifier || 0),
      visualMode: 'server-validated'
    };
  }

  // Eigener Kanal für Abwehrladungen-Ablenkungswürfe (Spiegelbilder u. Ä.) - bewusst getrennt
  // von rollDamage() (nur W4-W12, Formelvalidierung) und von den anderen W20-Kanälen (die
  // jeweils an eine eigene Spielmechanik mit eigenem Index gebunden sind).
  async rollWardDeflection() {
    // Bind the ward to the hit being resolved. Skipped wards must not shift
    // another attack's die into this position or fill in a missing receipt.
    const hit = this.attackIndex > 1
      ? this.submitted.followUpAttacks?.[this.attackIndex - 2]
      : this.submitted;
    const source = hit?.wardResolution?.roll || {};
    const dice = validateDieResults([source.natural], 1, 20, 'Ablenkungswurf');
    return {
      id: String(source.rollId || ''),
      natural: dice[0],
      dice,
      keptDice: dice,
      total: dice[0],
      visualMode: 'server-validated'
    };
  }
}
