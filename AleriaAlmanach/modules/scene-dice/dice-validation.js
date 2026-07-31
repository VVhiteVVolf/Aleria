export const DICE_LIMITS = Object.freeze({
  maxInputLength: 100,
  maxDicePerRoll: 100,
  maxDicePerGroup: 50,
  maxAdditionalDice: 100,
  maxRerollRounds: 20,
  maxModifier: 9999
});

export const SUPPORTED_DICE_SIDES = Object.freeze([4, 6, 8, 10, 12, 20, 100]);

const SIDES_PATTERN = '(?:100|20|12|10|8|6|4)';
const DICE_MODIFIER_PATTERN = '(?:(?:kh|kl|dh|dl)\\d{1,3}|(?:r|ro)(?:[<>=])?\\d{1,3}|!{1,2}(?:[<>=]\\d{1,3})?)*';
const DICE_TERM_PATTERN = `\\d{0,3}d${SIDES_PATTERN}${DICE_MODIFIER_PATTERN}`;
const NUMBER_TERM_PATTERN = '\\d{1,4}';
const FULL_NOTATION_PATTERN = new RegExp(`^[+-]?(?:${DICE_TERM_PATTERN}|${NUMBER_TERM_PATTERN})(?:[+-](?:${DICE_TERM_PATTERN}|${NUMBER_TERM_PATTERN}))*$`, 'i');
const DICE_PATTERN = new RegExp(`(\\d*)d(${SIDES_PATTERN})`, 'gi');
const ANY_DICE_PATTERN = /(\d*)d(\d+|%)/gi;
const SIGNED_NUMBER_PATTERN = /[+-]\d+/g;

export class DiceNotationError extends Error {
  constructor(message, code = 'invalid-notation') {
    super(message);
    this.name = 'DiceNotationError';
    this.code = code;
  }
}

export function normalizeDiceNotation(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '')
    .replace(/d%/g, 'd100')
    .replace(/d00/g, 'd100');
}

function assertSupportedSides(notation) {
  const allDice = Array.from(notation.matchAll(ANY_DICE_PATTERN));
  if (!allDice.length) {
    throw new DiceNotationError('Die Formel muss mindestens einen Würfel enthalten.', 'missing-die');
  }
  for (const match of allDice) {
    const sides = match[2] === '%' ? 100 : Number(match[2]);
    if (!SUPPORTED_DICE_SIDES.includes(sides)) {
      throw new DiceNotationError(`W${sides} wird nicht unterstützt. Erlaubt sind W4, W6, W8, W10, W12, W20 und W100.`, 'unsupported-die');
    }
  }
}

function countDice(notation) {
  let total = 0;
  for (const match of notation.matchAll(DICE_PATTERN)) {
    const count = Number(match[1] || 1);
    if (!Number.isInteger(count) || count < 1 || count > DICE_LIMITS.maxDicePerGroup) {
      throw new DiceNotationError(`Pro Würfelgruppe sind 1 bis ${DICE_LIMITS.maxDicePerGroup} Würfel erlaubt.`, 'group-limit');
    }
    total += count;
  }
  if (total > DICE_LIMITS.maxDicePerRoll) {
    throw new DiceNotationError(`Ein Wurf darf höchstens ${DICE_LIMITS.maxDicePerRoll} Würfel enthalten.`, 'roll-limit');
  }
  return total;
}

function assertModifierLimit(notation) {
  const withoutDice = notation.replace(new RegExp(DICE_TERM_PATTERN, 'gi'), '');
  const modifiers = withoutDice.match(SIGNED_NUMBER_PATTERN) || [];
  for (const token of modifiers) {
    if (Math.abs(Number(token)) > DICE_LIMITS.maxModifier) {
      throw new DiceNotationError(`Ein Modifikator darf höchstens ${DICE_LIMITS.maxModifier} betragen.`, 'modifier-limit');
    }
  }
}

/**
 * Validates the deliberately supported additive Roll20 subset before it reaches
 * the parser. Runtime caps in the adapter additionally stop reroll/explosion chains.
 */
export function validateDiceNotation(value = '') {
  const notation = normalizeDiceNotation(value);
  if (!notation) throw new DiceNotationError('Bitte eine Würfelformel eingeben.', 'empty');
  if (notation.length > DICE_LIMITS.maxInputLength) {
    throw new DiceNotationError(`Die Würfelformel darf höchstens ${DICE_LIMITS.maxInputLength} Zeichen lang sein.`, 'input-limit');
  }
  assertSupportedSides(notation);
  if (!FULL_NOTATION_PATTERN.test(notation)) {
    throw new DiceNotationError('Diese Würfelnotation wird nicht unterstützt.', 'invalid-notation');
  }
  const diceCount = countDice(notation);
  assertModifierLimit(notation);
  return Object.freeze({ notation, diceCount });
}

export function getNotationGroupSigns(notation) {
  const signs = [];
  const pattern = new RegExp(`(^|[+-])${DICE_TERM_PATTERN}`, 'gi');
  for (const match of normalizeDiceNotation(notation).matchAll(pattern)) {
    signs.push(match[1] === '-' ? -1 : 1);
  }
  return signs;
}

export function getNotationModifier(notation) {
  const remainder = normalizeDiceNotation(notation).replace(new RegExp(DICE_TERM_PATTERN, 'gi'), '');
  return (remainder.match(/[+-]?\d+/g) || []).reduce((sum, token) => sum + Number(token), 0);
}
