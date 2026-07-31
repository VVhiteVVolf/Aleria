function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) throw new Error('Ungültiger Würfeltyp.');
  if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * maxExclusive);
  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const values = new Uint32Array(1);
  do globalThis.crypto.getRandomValues(values); while (values[0] >= limit);
  return values[0] % maxExclusive;
}

export class DiceFallbackEngine {
  constructor(randomInt = secureRandomInt) {
    this.randomInt = randomInt;
    this.groups = [];
    this.isFallback = true;
  }

  async roll(notations) {
    this.groups = (Array.isArray(notations) ? notations : [notations]).map((group, groupId) => ({
      ...group,
      groupId,
      rolls: []
    }));
    for (const group of this.groups) {
      for (let index = 0; index < Number(group.qty || 1); index += 1) {
        group.rolls.push(this.#rollDie(group.sides, group.groupId, index));
      }
    }
    return this.getRollResults();
  }

  async add(notations) {
    for (const notation of (Array.isArray(notations) ? notations : [notations])) {
      const group = this.groups[Number(notation.groupId)];
      if (!group) throw new Error('Folgewurf verweist auf eine unbekannte Würfelgruppe.');
      group.rolls.push(this.#rollDie(notation.sides, group.groupId, notation.rollId));
    }
    return this.getRollResults();
  }

  getRollResults() {
    return this.groups.map(group => ({
      ...group,
      qty: group.rolls.length,
      value: group.rolls.reduce((sum, roll) => sum + roll.value, 0),
      rolls: group.rolls.map(roll => ({ ...roll }))
    }));
  }

  clear() {
    this.groups = [];
  }

  #rollDie(sidesValue, groupId, rollId) {
    const sides = Number(String(sidesValue).replace(/^d/i, ''));
    return {
      sides,
      groupId,
      rollId,
      value: this.randomInt(sides) + 1
    };
  }
}
