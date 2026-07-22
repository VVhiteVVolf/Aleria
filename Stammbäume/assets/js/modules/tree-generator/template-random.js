function hashSeed(seed) {
  const input = String(seed || 'aleria-stammbaum');
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function templateSeedToken(seed) {
  return hashSeed(seed).toString(36);
}

// Mulberry32 liefert aus demselben Seed in jedem unterstützten Browser dieselbe
// Folge. Das macht eine Vorschau wiederholbar und die Fachlogik ohne globales
// Math.random testbar.
export function createTemplateRandom(seed) {
  let state = hashSeed(seed);
  return function nextRandom() {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInteger(randomFn, minimum, maximum) {
  const lower = Math.ceil(Math.min(minimum, maximum));
  const upper = Math.floor(Math.max(minimum, maximum));
  const sample = Math.min(0.999999999999, Math.max(0, Number(randomFn()) || 0));
  return lower + Math.floor(sample * (upper - lower + 1));
}

export function randomChance(randomFn, probability) {
  return randomFn() < Math.max(0, Math.min(1, Number(probability) || 0));
}

export function randomItem(randomFn, values) {
  return values[randomInteger(randomFn, 0, Math.max(0, values.length - 1))];
}

export function shuffled(randomFn, values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(randomFn, 0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
