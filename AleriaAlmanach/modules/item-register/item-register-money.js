// Money is calculated in integer Pfennige (1/100 Kupfertaler). Public inventory
// records keep totalCopper for compatibility with existing character sheets.
const UNITS = Object.freeze({ g: 1000, gt: 1000, gold: 1000, goldtaler: 1000, goldstück: 1000,
  s: 100, st: 100, silber: 100, silbertaler: 100, silberstück: 100, k: 1, kt: 1, ks: 1,
  kupfer: 1, kupfertaler: 1, kupferstück: 1, taler: 1, p: 0.01, pf: 0.01, pfennig: 0.01 });

export function localizedNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  let input = String(value ?? '').trim().replace(/\s/g, '');
  if (!input) return null;
  if (input.includes(',')) input = input.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(input)) input = input.replace(/\./g, '');
  if (!/^\d+(?:\.\d+)?$/.test(input)) return null;
  return Number(input);
}

export function toMinor(copper) {
  const amount = Number(copper);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error('Der Geldbetrag ist ungültig.');
  }
  return Math.round(amount * 100);
}

export function moneyState(copper = 0) {
  const minor = toMinor(copper);
  const gold = Math.floor(minor / 100000);
  const silver = Math.floor((minor % 100000) / 10000);
  return { gold, silver, copper: (minor % 10000) / 100, totalCopper: minor / 100 };
}

export function moneyTotal(value = {}) {
  if (typeof value === 'string') {
    const parts = [...value.matchAll(/(\d[\d.,]*)\s*(Gold(?:taler)?|Silber(?:taler)?|Kupfer(?:taler)?|Pfennig)/gi)];
    return parts.reduce((sum, part) => sum + (localizedNumber(part[1]) || 0) * UNITS[part[2].toLowerCase()], 0);
  }
  if (value?.totalCopper != null) return toMinor(value.totalCopper) / 100;
  return toMinor((Number(value?.gold) || 0) * 1000 + (Number(value?.silver) || 0) * 100 + (Number(value?.copper) || 0)) / 100;
}

export function formatCopper(value) {
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Number(value) || 0)} KT`;
}

export function parsePrice(price, currency = '') {
  const source = String(price ?? '').trim();
  if (!source || /unbekannt|unbezahlbar|ausgestorben|nicht.*(?:handel|käuflich)/i.test(source)) return null;
  const match = source.match(/^(\d[\d.,]*)(?:\s*[-–—]\s*(\d[\d.,]*))?\s*([a-zäöü]+)?$/i);
  if (!match) return null;
  const unit = String(match[3] || currency || 'K').trim().toLowerCase();
  if (!Object.hasOwn(UNITS, unit)) return null;
  const first = localizedNumber(match[1]);
  const second = localizedNumber(match[2] || match[1]);
  if (first == null || second == null || first > second) return null;
  return { minCopper: toMinor(first * UNITS[unit]) / 100, maxCopper: toMinor(second * UNITS[unit]) / 100 };
}

export function formatPrice(price) {
  if (!price) return 'Preis offen';
  return price.minCopper === price.maxCopper ? formatCopper(price.minCopper)
    : `${formatCopper(price.minCopper)} – ${formatCopper(price.maxCopper)}`;
}
