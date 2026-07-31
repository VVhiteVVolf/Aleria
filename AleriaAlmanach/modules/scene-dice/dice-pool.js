import { DICE_LIMITS, SUPPORTED_DICE_SIDES } from './dice-validation.js';

const DEFAULT_DIE_SIDES = 20;

function normalizeSides(value) {
  const sides = Number(value);
  if (!SUPPORTED_DICE_SIDES.includes(sides)) throw new Error(`W${sides || '?'} wird nicht unterstützt.`);
  return sides;
}

function normalizeCount(value) {
  return Math.max(0, Math.min(DICE_LIMITS.maxDicePerGroup, Math.trunc(Number(value) || 0)));
}

export class SceneDicePool {
  constructor(entries) {
    this.counts = new Map();
    if (entries) this.replace(entries);
    else this.reset();
  }

  replace(entries = []) {
    this.counts.clear();
    for (const entry of entries) this.set(entry.sides, entry.count);
    return this.list();
  }

  reset() {
    this.counts.clear();
    this.counts.set(DEFAULT_DIE_SIDES, 1);
    return this.list();
  }

  clear() {
    this.counts.clear();
    return [];
  }

  add(sidesValue, amount = 1) {
    const sides = normalizeSides(sidesValue);
    const count = normalizeCount((this.counts.get(sides) || 0) + amount);
    const otherDice = this.total - (this.counts.get(sides) || 0);
    const available = Math.max(0, DICE_LIMITS.maxDicePerRoll - otherDice);
    this.set(sides, Math.min(count, available));
    return this.list();
  }

  remove(sidesValue, amount = 1) {
    return this.add(sidesValue, -Math.abs(Number(amount) || 1));
  }

  set(sidesValue, countValue) {
    const sides = normalizeSides(sidesValue);
    const count = normalizeCount(countValue);
    if (count) this.counts.set(sides, count);
    else this.counts.delete(sides);
    return this.list();
  }

  get total() {
    return Array.from(this.counts.values()).reduce((sum, count) => sum + count, 0);
  }

  list() {
    return SUPPORTED_DICE_SIDES
      .filter(sides => this.counts.has(sides))
      .map(sides => ({ sides, count: this.counts.get(sides) }));
  }

  toNotation({ mode = 'normal', modifier = 0 } = {}) {
    const terms = this.list().map(entry => {
      if (entry.sides === 20 && mode === 'advantage') return '2d20kh1';
      if (entry.sides === 20 && mode === 'disadvantage') return '2d20kl1';
      return `${entry.count}d${entry.sides}`;
    });
    if (!terms.length) throw new Error('Lege zuerst mindestens einen Würfel in den Pool.');
    const safeModifier = Math.max(-DICE_LIMITS.maxModifier, Math.min(DICE_LIMITS.maxModifier, Math.trunc(Number(modifier) || 0)));
    let notation = terms.join('+');
    if (safeModifier) notation += safeModifier > 0 ? `+${safeModifier}` : String(safeModifier);
    return notation;
  }
}
