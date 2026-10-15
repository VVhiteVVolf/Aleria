import { normalizeHerausforderungBenefits, validateHerausforderungBenefits } from './herausforderung-rewards.js?v=20261015-graded-challenges-v1';

const clean = (value, max) => String(value || '').trim().slice(0, max);
export const MAX_CHALLENGE_OUTCOMES = 10;

export function normalizeChallengeOutcomes(value) {
  return (Array.isArray(value) ? value : []).slice(0, MAX_CHALLENGE_OUTCOMES).map(row => ({
    id: clean(row.id, 40), label: clean(row.label, 160),
    natural: [1, 20].includes(row.natural) ? row.natural : 0,
    minimumTotal: row.minimumTotal == null ? null : Number(row.minimumTotal),
    text: clean(row.text, 2000), success: row.success === true,
    benefits: normalizeHerausforderungBenefits(row.benefits)
  }));
}

export function validateChallengeOutcomes(value) {
  if (value == null || (Array.isArray(value) && !value.length)) return null;
  if (!Array.isArray(value) || value.length < 3 || value.length > MAX_CHALLENGE_OUTCOMES) return 'Die Ergebnisstaffel benötigt drei bis zehn Stufen.';
  const ids = new Set(), selectors = new Set();
  for (const row of value) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return 'Jede Ergebnisstufe muss ein Objekt sein.';
    if (!/^[a-zA-Z0-9-]{1,40}$/.test(row.id || '') || ids.has(row.id)) return 'Jede Ergebnisstufe benötigt eine eindeutige ID.';
    ids.add(row.id);
    if (typeof row.label !== 'string' || !row.label.trim() || row.label.length > 160) return 'Jede Ergebnisstufe benötigt eine Bezeichnung.';
    if (typeof row.text !== 'string' || !row.text.trim() || row.text.length > 2000) return 'Jede Ergebnisstufe benötigt einen Ergebnistext (höchstens 2.000 Zeichen).';
    if (![0, 1, 20].includes(row.natural ?? 0)) return 'Kritische Stufen verwenden natural: 1 oder 20, sonst 0.';
    if (typeof row.success !== 'boolean') return 'success muss true oder false sein.';
    if ((row.natural === 20 && !row.success) || (row.natural === 1 && row.success)) return 'Natürliche 20 ist ein kritischer Erfolg; natürliche 1 ein kritischer Fehlschlag.';
    if (row.natural && row.minimumTotal != null) return 'Kritische Stufen haben keinen Gesamtwert-Schwellenwert.';
    if (row.minimumTotal != null && (!Number.isInteger(row.minimumTotal) || Math.abs(row.minimumTotal) > 100)) return 'Gesamtwert-Schwellen müssen ganze Zahlen zwischen −100 und 100 sein.';
    if (row.success && !row.natural && (row.minimumTotal == null || row.minimumTotal < 1 || row.minimumTotal > 40)) return 'Eine reguläre Erfolgsstufe benötigt einen Schwellenwert von 1 bis 40.';
    const selector = row.natural ? `natural:${row.natural}` : `total:${row.minimumTotal ?? 'fallback'}`;
    if (selectors.has(selector)) return 'Eine Ergebnisschwelle darf nur einmal vorkommen.';
    selectors.add(selector);
    const error = validateHerausforderungBenefits(row.benefits, { effectsOnly: !row.success });
    if (error) return error;
  }
  if (![...['natural:1', 'natural:20', 'total:fallback']].every(key => selectors.has(key))) return 'Die Staffel benötigt natürliche 1, natürliche 20 und eine Auffangstufe mit minimumTotal: null.';
  return null;
}

export function getOutcomeSuccessDifficulty(rows = [], fallback = 10) {
  const thresholds = (Array.isArray(rows) ? rows : []).filter(row => row.success && !row.natural && Number.isFinite(row.minimumTotal) && row.minimumTotal != null).map(row => row.minimumTotal);
  return thresholds.length ? Math.min(...thresholds) : fallback;
}

export function selectChallengeOutcome(challenge, resolution) {
  const rows = challenge?.outcomeTable || [];
  if (!rows.length) return null;
  const natural = Number(resolution.natural);
  if (natural === 1 || natural === 20) return rows.find(row => row.natural === natural) || null;
  return rows.filter(row => !row.natural && row.minimumTotal != null && Number(resolution.total) >= row.minimumTotal)
    .sort((a, b) => b.minimumTotal - a.minimumTotal)[0] || rows.find(row => !row.natural && row.minimumTotal == null) || null;
}

export function applyChallengeOutcome(challenge, resolution) {
  const row = selectChallengeOutcome(challenge, resolution);
  if (!row) return false;
  Object.assign(resolution, { herausforderungTier: row.id, herausforderungLabel: row.label,
    herausforderungSolved: row.success, revealedText: row.text,
    outcome: row.natural === 20 ? 'critical-success' : row.natural === 1 ? 'critical-failure' : row.success ? 'success' : 'failure' });
  return true;
}

export function challengeBenefitBundles(approach = {}) {
  return ['rewards', 'partialEffects', 'failureEffects'].map(key => approach[key]).concat((approach.outcomeTable || []).map(row => row.benefits)).filter(Boolean);
}
