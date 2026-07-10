// D&D dice notation, validation and cryptographically unbiased rolling.
const SCENE_DICE_EVENT_KIND = 'scene-dice-event';
const SCENE_DICE_ALLOWED_SIDES = new Set([3, 4, 6, 8, 10, 12, 20, 100]);
const SCENE_DICE_ICONS = {
  3: '../IconOrdner/Würfel/+1d6_Physical.png',
  4: '../IconOrdner/Würfel/D4_Physical.png',
  6: '../IconOrdner/Würfel/+1d6_Physical.png',
  8: '../IconOrdner/Würfel/+1d8_Physical.png',
  10: '../IconOrdner/Würfel/D10_Physical.png',
  12: '../IconOrdner/Würfel/D12_Physical.png',
  20: '../IconOrdner/Würfel/D20.png',
  100: '../IconOrdner/Würfel/D10_Physical.png'
};

function getSceneDiceIcon(sides) {
  return SCENE_DICE_ICONS[Number(sides)] || SCENE_DICE_ICONS[20];
}

function normalizeSceneDiceFormula(value = '') {
  return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function parseSceneDiceFormula(value = '') {
  const formula = normalizeSceneDiceFormula(value);
  if (!formula) throw new Error('Bitte eine Würfelformel eingeben.');
  const tokens = formula.match(/[+-]?[^+-]+/g) || [];
  const terms = [];
  let consumed = '';
  let diceCount = 0;
  tokens.forEach(token => {
    consumed += token;
    const sign = token.startsWith('-') ? -1 : 1;
    const body = token.replace(/^[+-]/, '');
    const dice = body.match(/^(\d*)d(3|4|6|8|10|12|20|100)$/);
    if (dice) {
      const count = Number(dice[1] || 1);
      const sides = Number(dice[2]);
      if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('Pro Würfelart sind 1 bis 100 Würfel erlaubt.');
      if (!SCENE_DICE_ALLOWED_SIDES.has(sides)) throw new Error(`W${sides} ist kein unterstützter D&D-Würfel.`);
      diceCount += count;
      terms.push({ kind: 'dice', sign, count, sides });
      return;
    }
    if (!/^\d+$/.test(body)) throw new Error(`Ungültiger Teil der Würfelformel: ${token}`);
    const valueNumber = Number(body) * sign;
    if (Math.abs(valueNumber) > 9999) throw new Error('Ein Modifikator darf höchstens 9999 betragen.');
    terms.push({ kind: 'modifier', value: valueNumber });
  });
  if (consumed !== formula || !terms.length) throw new Error('Die Würfelformel ist ungültig.');
  if (diceCount < 1 || diceCount > 100) throw new Error('Ein Wurf muss insgesamt 1 bis 100 Würfel enthalten.');
  return { formula, terms, diceCount };
}

function getSceneDiceRandomInt(maxExclusive) {
  const max = Number(maxExclusive);
  if (!Number.isInteger(max) || max < 1) throw new Error('Ungültige Würfelgröße.');
  if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * max);
  const range = 0x100000000;
  const limit = range - (range % max);
  const values = new Uint32Array(1);
  do globalThis.crypto.getRandomValues(values); while (values[0] >= limit);
  return values[0] % max;
}

function rollSceneDie(sides) {
  if (sides === 3) {
    const physical = getSceneDiceRandomInt(6) + 1;
    return { value: Math.ceil(physical / 2), physical, simulatedBy: 6 };
  }
  if (sides === 100) {
    const tens = getSceneDiceRandomInt(10);
    const ones = getSceneDiceRandomInt(10);
    return { value: tens === 0 && ones === 0 ? 100 : (tens * 10) + ones, tens, ones };
  }
  return { value: getSceneDiceRandomInt(sides) + 1 };
}

function canUseSceneDiceD20Mode(parsed) {
  const diceTerms = parsed.terms.filter(term => term.kind === 'dice');
  return diceTerms.length === 1 && diceTerms[0].sign === 1 && diceTerms[0].count === 1 && diceTerms[0].sides === 20;
}

function rollSceneDiceFormula(formula, mode = 'normal') {
  const parsed = parseSceneDiceFormula(formula);
  const normalizedMode = ['advantage', 'disadvantage'].includes(mode) && canUseSceneDiceD20Mode(parsed) ? mode : 'normal';
  const termResults = [];
  let total = 0;
  parsed.terms.forEach(term => {
    if (term.kind === 'modifier') {
      total += term.value;
      termResults.push({ ...term });
      return;
    }
    const rolls = [];
    const rollCount = normalizedMode === 'normal' ? term.count : 2;
    for (let index = 0; index < rollCount; index += 1) rolls.push(rollSceneDie(term.sides));
    let keptIndexes = rolls.map((_, index) => index);
    if (normalizedMode === 'advantage') keptIndexes = [rolls[0].value >= rolls[1].value ? 0 : 1];
    if (normalizedMode === 'disadvantage') keptIndexes = [rolls[0].value <= rolls[1].value ? 0 : 1];
    const subtotal = keptIndexes.reduce((sum, index) => sum + rolls[index].value, 0) * term.sign;
    total += subtotal;
    termResults.push({ ...term, rolls, keptIndexes, subtotal });
  });
  const d20Term = termResults.find(term => term.kind === 'dice' && term.sides === 20 && term.count === 1);
  const natural = d20Term ? d20Term.rolls[d20Term.keptIndexes[0]]?.value || null : null;
  return {
    kind: SCENE_DICE_EVENT_KIND,
    formula: parsed.formula,
    mode: normalizedMode,
    total,
    natural,
    critical: '',
    special: '',
    terms: termResults,
    rolledAt: new Date().toISOString(),
    schemaVersion: 1
  };
}

function isSceneDiceEventComment(comment = {}) {
  return !!(comment.sceneDiceRoll || comment.commentKind === SCENE_DICE_EVENT_KIND || comment.commentMode === 'scene-dice');
}
