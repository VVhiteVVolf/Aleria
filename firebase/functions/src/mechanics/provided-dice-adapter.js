import { HttpsError } from 'firebase-functions/v2/https';
import { buildDamageRollPlan } from '../generated/combat/rules/combat-mvp-rules.js';

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

// Validate final dice and each single-use replacement, then reconstruct originals
// for the shared resolver. Submitted policy flags never grant a reroll.
function providedD20(source, { modifier = 0, rollMode = 'normal', naturalRollPolicy = {} }, label, naturalField = 'naturalRoll') {
  const count = rollMode === 'normal' ? 1 : 2;
  const finalDice = validateDieResults(source.diceResults, count, 20, label);
  const choose = dice => rollMode === 'advantage' ? Math.max(...dice) : rollMode === 'disadvantage' ? Math.min(...dice) : dice[0];
  if (Number(source[naturalField]) !== choose(finalDice)) invalid(`${label}: Der ausgewählte W20 stimmt nicht mit dem Würfelbeleg überein.`);
  const replacements = source.rerolls == null ? [] : source.rerolls;
  if (!Array.isArray(replacements) || replacements.length > count || (replacements.length && !naturalRollPolicy.naturalOneReroll)) invalid(`${label}: Unzulässiger Glückswiederholungswurf.`);
  const originals = finalDice.slice();
  const seen = new Set();
  const validatedNaturalOneReplacements = replacements.map(entry => {
    const index = entry?.dieIndex;
    if (!Number.isInteger(index) || index < 0 || index >= count || seen.has(index)
      || entry.original !== 1 || !Number.isInteger(entry.replacement) || entry.replacement < 1 || entry.replacement > 20
      || finalDice[index] !== entry.replacement) invalid(`${label}: Ungültiger Beleg für den einmaligen Glückswiederholungswurf.`);
    seen.add(index);
    originals[index] = 1;
    return { dieIndex: index, replacement: entry.replacement, rollId: String(entry.rollId || '').slice(0, 160) };
  });
  if (naturalRollPolicy.naturalOneReroll && originals.some((face, index) => face === 1 && !seen.has(index))) invalid(`${label}: Der verpflichtende Glückswiederholungswurf fehlt.`);
  const natural = choose(originals);
  return { id: String(source.rollId || ''), natural, dice: originals, keptDice: [natural],
    total: natural + Number(modifier || 0), visualMode: 'server-validated', validatedNaturalOneReplacements };
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
      // Fixed effects have a damage summary but never request a dice roll.
      // They must not displace the next real effect's receipt in the queue.
      if (!Array.isArray(dice) || !dice.length) return;
      const key = String(source.rollId || source.id || `${source.notation || ''}:${dice.join(',')}:${damageSources.length}`);
      if (seenRolls.has(key)) return;
      seenRolls.add(key);
      damageSources.push(source);
    };
    rememberDamage(submittedResolution.turnStart?.roll);
    if (submittedResolution.damage?.rollSource !== 'effect') rememberDamage(submittedResolution.damage);
    (Array.isArray(submittedResolution.followUpAttacks) ? submittedResolution.followUpAttacks : []).forEach(followUp => rememberDamage(followUp?.damage));
    (Array.isArray(submittedResolution.effectResults) ? submittedResolution.effectResults : []).forEach(result => rememberDamage(result?.roll));
    this.damageSources = damageSources;
  }

  async rollAttack(options = {}) {
    const source = this.attackIndex++ === 0
      ? (this.submitted.attack || {})
      : (this.submitted.followUpAttacks?.[this.attackIndex - 2]?.attack || {});
    return providedD20(source, options, 'Angriffswurf');
  }

  forCounter(index = 0) {
    const receipt = this.submitted.counterAttacks?.[index]?.resolution;
    if (!receipt) invalid('Der Würfelbeleg des vorbereiteten Gegenangriffs fehlt.');
    return new ProvidedDiceAdapter(receipt);
  }

  async rollSkill(options = {}) {
    return providedD20(this.submitted, options, 'Fertigkeitswurf', 'natural');
  }

  async rollDamage({ damageFormula, bonus = 0, critical = false } = {}) {
    const plan = buildDamageRollPlan(damageFormula, bonus, critical);
    const source = this.damageSources[this.damageIndex++] || {};
    const expectedTerms = plan.terms;
    const submittedDice = Array.isArray(source.diceResults)
      ? source.diceResults
      : (Array.isArray(source.keptDice) ? source.keptDice : []);
    const expectedCount = expectedTerms.reduce((sum, term) => sum + term.diceCount, 0);
    if (submittedDice.length !== expectedCount) invalid(`Schadenswurf: Es wurden ${expectedCount} gültige Würfelergebnisse erwartet.${critical ? ' Beim Krit wird nur der zusätzliche Pool gewürfelt; der Grundpool zählt maximal. Bitte die Seite aktualisieren.' : ''}`);
    let offset = 0;
    const dice = expectedTerms.flatMap(term => {
      const values = submittedDice.slice(offset, offset + term.diceCount);
      offset += term.diceCount;
      return validateDieResults(values, term.diceCount, term.sides, 'Schadenswurf');
    });
    const modifier = plan.modifier;
    return {
      id: String(source.rollId || source.id || ''),
      notation: plan.notation,
      ...(plan.criticalDamage ? { criticalDamage: plan.criticalDamage } : {}),
      keptDice: dice,
      modifier,
      total: Math.max(0, dice.reduce((sum, value) => sum + value, 0) + modifier),
      visualMode: 'server-validated'
    };
  }

  async rollSavingThrow(options = {}) {
    const source = this.submitted.secondarySaves?.[this.savingThrowIndex++] || {};
    return providedD20(source, options, 'Sekund?rer Rettungswurf');
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
