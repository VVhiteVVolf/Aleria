import { getEncounterRelationship } from '../combat/combat-encounter-model.js';

export function normalizeChallengeTarget(value = {}) {
  const persistence = value?.persistence || {};
  const kind = ['character', 'creature', 'scene-creature'].includes(persistence.kind) ? persistence.kind : 'character';
  return { mode: ['auto', 'none', 'selected'].includes(value?.mode) ? value.mode : value?.actorId ? 'selected' : 'auto',
    actorId: String(value?.actorId || '').trim().slice(0, 180), name: String(value?.name || '').trim().slice(0, 180),
    persistence: kind === 'scene-creature'
      ? { kind, sourceCreatureId: String(persistence.sourceCreatureId || '').slice(0, 180) }
      : { kind, recordId: String(persistence.recordId || value?.actorId || '').slice(0, 180) } };
}

export function validateChallengeTarget(value) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) return 'Eine gültige Zielperson wählen.';
  if (value.mode != null && !['auto', 'none', 'selected'].includes(value.mode)) return 'Die Zielperson benötigt den Modus auto, none oder selected.';
  if ((value.mode === 'none' && value.actorId) || (value.mode === 'selected' && !value.actorId)) return 'Zielpersonen-Modus und Figuren-ID müssen übereinstimmen.';
  if (value.actorId != null && (typeof value.actorId !== 'string' || value.actorId.length > 180 || /[\/\u0000-\u001f]/.test(value.actorId))) return 'Die Zielpersonen-ID ist ungültig.';
  if (!value.actorId) return null;
  if (value.persistence?.kind != null && !['character', 'creature', 'scene-creature'].includes(value.persistence.kind)) return 'Die Profilart der Zielperson ist ungültig.';
  const target = normalizeChallengeTarget(value);
  if (target.persistence.kind === 'scene-creature') {
    if (!target.persistence.sourceCreatureId || /[\/\u0000-\u001f]/.test(target.persistence.sourceCreatureId)) return 'Die Kreaturenquelle der Zielperson fehlt.';
  } else if (target.persistence.recordId !== target.actorId) return 'Zielperson und Profilquelle müssen übereinstimmen.';
  return null;
}

export function withResolvedChallengeTarget(challenge, { encounter = null, actorId = '' } = {}) {
  if (!challenge || challenge.source !== 'herausforderung') return challenge;
  let target = normalizeChallengeTarget(challenge.targetActor);
  if (target.mode === 'none') return challenge;
  let inferred = false;
  if (!target.actorId && challenge.combatBound && encounter?.active && encounter.encounterId === challenge.combatContext?.encounterId) {
    const participants = [...encounter.participants.values()].filter(participant => participant.status === 'active');
    const parties = new Map(participants.map(participant => [participant.actorId, participant.partyId]));
    const opponents = participants.filter(participant => getEncounterRelationship(actorId, participant.actorId, parties) === 'enemy');
    if (opponents.length === 1) {
      const opponent = opponents[0];
      const persistence = opponent.persistence?.kind === 'creature' && opponent.persistence?.persistent === false && opponent.persistence?.recordId !== opponent.actorId
        ? { kind: 'scene-creature', sourceCreatureId: opponent.persistence.recordId }
        : opponent.persistence;
      target = normalizeChallengeTarget({ actorId: opponent.actorId, name: opponent.name, persistence });
      inferred = true;
    }
  }
  if (!target.actorId) return challenge;
  return { ...challenge, targetActor: target, targetInferred: inferred,
    authorId: target.actorId, authorName: target.name || challenge.authorName,
    authorPersistence: target.persistence };
}
