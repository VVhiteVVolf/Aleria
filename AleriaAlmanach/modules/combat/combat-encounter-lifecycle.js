import { mergeEncounterParticipantUpdates } from './combat-encounter-model.js';
import { captureEncounterSnapshot } from './combat-encounter-summary.js';
import { getDefeatExperienceReward } from './combat-progression.js';

export function getEncounterActionValidationError(action = {}, current = null) {
  if (Object.hasOwn(action, 'encounterId') && String(action.encounterId || '') !== String(current?.encounterId || '')) {
    return 'Der Kampf wurde inzwischen beendet oder verändert. Lade die Szene neu und bereite die Handlung erneut vor.';
  }
  if (current && Object.hasOwn(action, 'encounterId')) {
    const participant = current.participants.get(String(action.actorId || ''));
    if (!participant || participant.status !== 'active') return 'Die handelnde Figur ist im laufenden Kampf nicht aktiv. Prüfe zuerst die Kampfliste.';
  }
  return '';
}

export function getEncounterValidationError(event, current = null) {
  const participants = event.participants || [];
  if (new Set(participants.map(participant => participant.actorId)).size !== participants.length) return 'Eine Figur darf nur einmal in der Kampfliste stehen.';
  if (['start', 'add'].includes(event.operation)) {
    const merged = mergeEncounterParticipantUpdates([...(current?.participants?.values() || [])], event);
    const records = [...merged.values()].filter(participant => ['character', 'creature'].includes(participant.persistence?.kind) && participant.persistence.recordId)
      .map(participant => `${participant.persistence.kind}:${participant.persistence.recordId}`);
    if (new Set(records).size !== records.length) return 'Dasselbe gespeicherte Profil darf nicht mehrfach an diesem Kampf teilnehmen. Verwende für Kreaturengruppen einzelne Szeneninstanzen.';
    if (participants.some(participant => ['character', 'creature'].includes(participant.persistence?.kind)
      && participant.persistence.recordId && participant.actorId !== participant.persistence.recordId)) return 'Figurenkennung und gespeicherte Profilquelle stimmen nicht überein.';
  }
  if (event.operation === 'start') {
    if (current) return 'Diese Kampfkennung wurde bereits verwendet. Eröffne einen neuen Kampf.';
    if (participants.length < 2) return 'Wähle mindestens zwei Kämpfer aus.';
    if (event.combatType === 'duel' && participants.length !== 2) return 'Ein Duell beginnt mit genau zwei Kämpfern.';
    const sides = new Set(participants.filter(participant => participant.partyId && participant.partyId !== 'neutral').map(participant => participant.partyId));
    if (sides.size < 2 || participants.some(participant => !participant.partyId || participant.partyId === 'neutral')) return 'Ordne die Kämpfer mindestens zwei unterschiedlichen Seiten zu.';
    return '';
  }
  if (!current?.active) return 'Dieser Kampf ist nicht mehr aktiv. Lade den aktuellen Stand.';
  if (event.expectedRevision && current.revision !== event.expectedRevision) return 'Seit dem Öffnen wurde der Kampf verändert. Lade den aktuellen Stand und prüfe das Fazit erneut.';
  if (['add', 'remove'].includes(event.operation) && !participants.length) return 'Wähle mindestens eine Figur aus.';
  if (event.operation === 'add' && participants.some(participant => !participant.partyId || participant.partyId === 'neutral')) return 'Ordne jeden neuen Kämpfer einer Seite zu.';
  if (['remove', 'end'].includes(event.operation) && participants.some(participant => !current.participants.has(participant.actorId))) return 'Diese Figur gehört nicht zum laufenden Kampf.';
  if (event.operation === 'end') {
    if (!['victory', 'draw', 'aborted'].includes(event.outcome)) return 'Wähle ein Ergebnis: Sieg, Unentschieden oder Abbruch.';
    if (event.outcome === 'victory' && ![...current.participants.values()].some(participant => participant.partyId === event.winningPartyId && participant.partyId !== 'neutral')) return 'Wähle eine beteiligte Seite als Sieger.';
  }
  return '';
}

// The server passes profiles resolved from authoritative records. Status updates
// cannot replace stored profile references, rewards, names or entry snapshots.
export function prepareEncounterParticipants(event, current, profiles = new Map(), states = new Map()) {
  const previous = current?.participants instanceof Map ? [...current.participants.values()] : [];
  const merged = mergeEncounterParticipantUpdates(previous, event);
  if (['start', 'add'].includes(event.operation)) {
    for (const incoming of event.participants) {
      const participant = merged.get(incoming.actorId);
      const profile = profiles.get(incoming.actorId) || {};
      const existing = current?.participants?.get(incoming.actorId);
      merged.set(incoming.actorId, { ...participant,
        level: profile.progression?.level ?? participant.level,
        experienceValue: existing?.experienceValue ?? getDefeatExperienceReward(profile.progression?.level, profile.progression?.experienceReward),
        entrySnapshot: existing?.entrySnapshot || captureEncounterSnapshot(profile, states.get(incoming.actorId)),
        eligibleForExperience: participant.persistence?.kind === 'character' && participant.eligibleForExperience !== false
      });
    }
  }
  return merged;
}
