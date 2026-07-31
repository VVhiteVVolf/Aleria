import DiceParser from '../../vendor/scene-dice/dice-parser-interface.esm.js';
import {
  DICE_LIMITS,
  getNotationGroupSigns,
  getNotationModifier,
  validateDiceNotation
} from './dice-validation.js';

function collectFinalDiceGroups(node, groups = [], seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return groups;
  seen.add(node);
  if (node.type === 'die' && Array.isArray(node.rolls)) {
    groups.push(node);
    return groups;
  }
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectFinalDiceGroups(value, groups, seen);
  }
  return groups;
}

function getNumericSides(value) {
  const sides = Number(String(value || '').replace(/^d/i, ''));
  return Number.isFinite(sides) ? sides : 0;
}

function getMode(notation) {
  if (/2d20kh1/i.test(notation)) return 'advantage';
  if (/2d20kl1/i.test(notation)) return 'disadvantage';
  return 'normal';
}

function normalizeRollResult({ notation, initialGroups, rollResults, finalResults }) {
  const finalGroups = collectFinalDiceGroups(finalResults);
  const signs = getNotationGroupSigns(notation);
  const modifier = getNotationModifier(notation);
  const terms = rollResults.map((group, groupIndex) => {
    const finalGroup = finalGroups[groupIndex];
    const finalRolls = Array.isArray(finalGroup?.rolls) ? finalGroup.rolls : [];
    const rolls = (group.rolls || []).map((roll, rollIndex) => {
      const parsedRoll = finalRolls[rollIndex];
      return {
        value: Number(roll.value),
        sides: getNumericSides(roll.sides || group.sides),
        rollId: roll.rollId,
        kept: parsedRoll ? parsedRoll.valid !== false : true,
        reason: parsedRoll?.drop ? 'drop' : parsedRoll?.reroll ? 'reroll' : ''
      };
    });
    const keptIndexes = rolls.reduce((indexes, roll, index) => {
      if (roll.kept) indexes.push(index);
      return indexes;
    }, []);
    const sign = signs[groupIndex] || 1;
    return {
      kind: 'dice',
      sign,
      count: Number(initialGroups[groupIndex]?.qty || rolls.length),
      sides: getNumericSides(initialGroups[groupIndex]?.sides || group.sides),
      mods: Array.isArray(initialGroups[groupIndex]?.mods) ? initialGroups[groupIndex].mods : [],
      rolls,
      keptIndexes,
      subtotal: sign * keptIndexes.reduce((sum, index) => sum + rolls[index].value, 0)
    };
  });

  if (modifier !== 0) terms.push({ kind: 'modifier', value: modifier });
  const computedTotal = terms.reduce((sum, term) => sum + (term.kind === 'modifier' ? term.value : term.subtotal), 0);
  const parserTotal = Number(finalResults?.value);
  const aggregationCorrected = Number.isFinite(parserTotal) && parserTotal !== computedTotal;

  // dice-parser-interface 0.2.1 occasionally mis-aggregates additive expressions
  // with several physical result groups. We only correct that final aggregation;
  // every die value still comes from the engine's single physical roll.
  const total = aggregationCorrected ? computedTotal : parserTotal;
  if (!Number.isFinite(total)) throw new Error('Das Gesamtergebnis konnte nicht berechnet werden.');

  const dice = terms.flatMap(term => term.kind === 'dice' ? term.rolls.map(roll => roll.value) : []);
  const keptDice = terms.flatMap(term => term.kind === 'dice' ? term.rolls.filter(roll => roll.kept).map(roll => roll.value) : []);
  const droppedDice = terms.flatMap(term => term.kind === 'dice' ? term.rolls.filter(roll => !roll.kept).map(roll => roll.value) : []);
  const d20Terms = terms.filter(term => term.kind === 'dice' && term.sides === 20);
  const keptD20 = d20Terms.flatMap(term => term.rolls.filter(roll => roll.kept).map(roll => roll.value));
  const onlyD20Dice = terms.filter(term => term.kind === 'dice').every(term => term.sides === 20);
  const natural = onlyD20Dice && keptD20.length === 1 ? keptD20[0] : null;
  const critical = natural === 20 ? 'success' : natural === 1 ? 'failure' : '';

  return {
    kind: 'scene-dice-event',
    formula: notation,
    notation,
    mode: getMode(notation),
    total,
    modifier,
    natural,
    critical,
    special: critical === 'success'
      ? 'Natürliche 20 · Kritischer Erfolg'
      : critical === 'failure'
        ? 'Natürliche 1 · Kritischer Fehlschlag'
        : '',
    dice,
    keptDice,
    droppedDice,
    terms,
    rolledAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    schemaVersion: 2,
    aggregationCorrected
  };
}

export class DiceParserAdapter {
  constructor(limits = DICE_LIMITS) {
    this.limits = limits;
  }

  /** Executes parsing, physical rolls, all follow-up rolls and final parsing. */
  async execute(notationInput, engine) {
    const { notation } = validateDiceNotation(notationInput);
    const parser = new DiceParser();
    let initialGroups;
    try {
      initialGroups = parser.parseNotation(notation);
    } catch (error) {
      throw new Error('Diese Würfelnotation wird nicht unterstützt.', { cause: error });
    }
    if (!Array.isArray(initialGroups) || !initialGroups.length) {
      throw new Error('Die Würfelformel enthält keine ausführbare Würfelgruppe.');
    }

    await engine.roll(initialGroups);
    let rollResults = engine.getRollResults();
    let additionalDice = 0;
    let rerollRounds = 0;

    while (true) {
      const rerolls = parser.handleRerolls(rollResults);
      if (!rerolls.length) break;
      rerollRounds += 1;
      additionalDice += rerolls.reduce((sum, item) => sum + Number(item.qty || 1), 0);
      if (rerollRounds > this.limits.maxRerollRounds || additionalDice > this.limits.maxAdditionalDice) {
        engine.clear();
        throw new Error('Der Wurf wurde beendet, weil zu viele Folge-Würfe entstanden sind.');
      }
      await engine.add(rerolls);
      rollResults = engine.getRollResults();
    }

    let finalResults;
    try {
      finalResults = parser.parseFinalResults(rollResults);
    } catch (error) {
      throw new Error('Das Würfelergebnis konnte nicht vollständig ausgewertet werden.', { cause: error });
    }
    return normalizeRollResult({ notation, initialGroups, rollResults, finalResults });
  }
}

export const diceParserAdapterInternals = Object.freeze({
  collectFinalDiceGroups,
  normalizeRollResult
});
