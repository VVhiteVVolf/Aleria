export const ENCOUNTER_TYPE_LABELS = Object.freeze({ combat: 'Regulärer Kampf', duel: 'Duell', training: 'Übungskampf' });
export const ENCOUNTER_OUTCOME_LABELS = Object.freeze({ victory: 'Sieg', draw: 'Unentschieden', aborted: 'Abgebrochen' });
export const ENCOUNTER_REASON_LABELS = Object.freeze({ incapacitation: 'Kampfunfähigkeit', surrender: 'Aufgabe', retreat: 'Rückzug', objective: 'Szenenziel erreicht', agreement: 'Einvernehmliches Ende', interruption: 'Unterbrechung' });
export const ENCOUNTER_STATUS_LABELS = Object.freeze({ active: 'kampffähig', defeated: 'besiegt', surrendered: 'aufgegeben', fled: 'geflohen', left: 'ausgeschieden' });

export function suggestEncounterOutcome(participants = []) {
  const sides = new Map();
  for (const participant of participants) {
    if (!participant.partyId || participant.partyId === 'neutral') continue;
    const side = sides.get(participant.partyId) || { active: 0, count: 0 };
    side.count++;
    if (participant.status === 'active') side.active++;
    sides.set(participant.partyId, side);
  }
  const active = [...sides].filter(([, side]) => side.active > 0);
  if (sides.size < 2 || active.length !== 1) return null;
  const winner = active[0][0];
  const opponents = participants.filter(participant => participant.partyId !== winner);
  // Mere removal from the roster is not evidence of a victory.
  if (opponents.some(participant => !['defeated', 'surrendered', 'fled'].includes(participant.status))) return null;
  return { outcome: 'victory', winningPartyId: winner,
    endReason: opponents.every(participant => participant.status === 'surrendered') ? 'surrender'
      : opponents.every(participant => participant.status === 'fled') ? 'retreat' : 'incapacitation' };
}

export function describeEncounterOutcome(event = {}) {
  if (event.outcome !== 'victory') return ENCOUNTER_OUTCOME_LABELS[event.outcome] || 'Kampf beendet';
  const winner = (event.participants || []).find(participant => participant.partyId === event.winningPartyId);
  return winner ? `${winner.partyName || winner.partyId} gewinnt` : 'Sieg';
}
