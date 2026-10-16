import { getCheckDefinition } from '../skill-checks/skill-check-model.js?v=20261016-check-policy-v1';

export const MAX_CHALLENGE_CHECK_PENALTY = 30;

export function validateChallengeCheckPenalties(approach = {}) {
  const entries = approach.checkPenalties;
  if (entries == null) return null;
  if (!Array.isArray(entries) || entries.length > 32) return 'Höchstens 32 Proben-Mali als Liste angeben.';
  const seen = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || !getCheckDefinition(entry.checkId)) return 'Jeder Malus benötigt eine gültige Proben-ID.';
    if (!approach.preferredSkills?.includes(entry.checkId)) return 'Ein Malus darf nur einer erlaubten Probe zugeordnet werden.';
    if (seen.has(entry.checkId)) return 'Für jede Probe darf nur ein Malus festgelegt werden.';
    if (!Number.isInteger(entry.modifier) || entry.modifier > 0 || entry.modifier < -MAX_CHALLENGE_CHECK_PENALTY) return 'Proben-Mali müssen ganze Zahlen von −30 bis 0 sein.';
    if (entry.reason != null && (typeof entry.reason !== 'string' || entry.reason.length > 240)) return 'Die Begründung eines Malus darf höchstens 240 Zeichen enthalten.';
    seen.add(entry.checkId);
  }
  return null;
}

export function normalizeChallengeCheckPenalties(entries = []) {
  return (Array.isArray(entries) ? entries : []).slice(0, 32).map(entry => ({
    checkId: String(entry?.checkId || ''),
    modifier: Math.max(-MAX_CHALLENGE_CHECK_PENALTY, Math.min(0, Math.trunc(Number(entry?.modifier) || 0))),
    reason: String(entry?.reason || '').trim().slice(0, 240)
  }));
}

// The whitelist belongs to the authored approach, never to attempt settings.
// Older standalone challenges already have that list; hidden speech checks
// keep their existing alternative-check behavior.
export function getChallengeCheckRule(challenge, checkId) {
  const restricted = challenge?.source === 'herausforderung';
  const allowed = !restricted || !!challenge.preferredSkills?.includes(checkId);
  const entry = restricted && allowed ? challenge.checkPenalties?.find(entry => entry.checkId === checkId) : null;
  return { allowed, restricted, modifier: entry ? normalizeChallengeCheckPenalties([entry])[0].modifier : 0,
    reason: allowed ? String(entry?.reason || '') : 'Für diesen Lösungsweg nicht freigegeben.' };
}
