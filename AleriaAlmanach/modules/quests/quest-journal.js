import { deriveCombatEncounterState } from '../combat/combat-encounter-model.js';

export function projectQuestJournal(run, comments = [], { evidenceIds = [] } = {}) {
  const party = new Set(run.party.map(row => `${row.kind || 'character'}:${row.recordId}`));
  const partyIds = new Set(run.party.map(row => row.recordId));
  const inParty = member => {
    const { kind, recordId } = member.persistence || {};
    if (kind === 'character' || kind === 'creature') return party.has(`${kind}:${recordId}`);
    // Legacy encounters without persistence can only identify their actor.
    // An explicit scene actor/creature is a different possession of that figure.
    return !kind && partyIds.has(member.actorId);
  };
  const trusted = comments.filter(row => {
    if (row.importedHistoricalMechanics || row.mechanicalUndone || row.undoneAt
      || !(row.serverValidatedMechanics === true || row.serverCommitted === true)) return false;
    if (evidenceIds.includes(row.id)) return true;
    if (run.links?.scenes && !run.links.scenes.includes(row.entryId)) return false;
    const window = run.sceneWindows?.[row.entryId];
    return !window || Number(row.orderKey || 0) > window.after && (window.through == null || Number(row.orderKey || 0) <= window.through);
  }).sort((a, b) => Number(a.orderKey || a.createdAtClient || 0) - Number(b.orderKey || b.createdAtClient || 0));
  // Firestore scene pages arrive newest first. Replay receipts in their original
  // order so an earlier start cannot reopen a completed encounter in the archive.
  const encounters = [...deriveCombatEncounterState(trusted).values()].filter(encounter =>
    [...encounter.participants.values()].some(inParty));
  const foes = encounters.flatMap(encounter => [...encounter.participants.values()].filter(member => !inParty(member)).map(member => ({
    ...member, encounterId: encounter.encounterId, entryId: encounter.entryId, encounterTitle: encounter.title })));
  const activities = trusted.map(comment => {
    const kinds = [];
    if (comment.combatEncounter) kinds.push('Kampf');
    if (comment.sceneRest) kinds.push('Rast');
    if (comment.lootClaim) kinds.push('Beute');
    if (comment.inventoryTransaction || comment.sceneEvent?.transfer) kinds.push('Inventar / Handel');
    if (comment.sceneTimeEvent) kinds.push('Zeitfortschritt');
    if (comment.commentSegments?.some(segment => segment.combatResolution || segment.combatResolutions?.length)) kinds.push('Kampfaktion');
    if (comment.commentSegments?.some(segment => segment.inventoryUse)) kinds.push('Itemaktion');
    return { ...comment, kinds };
  }).filter(comment => comment.kinds.length).sort((a, b) => Number(a.orderKey || a.createdAtClient || 0) - Number(b.orderKey || b.createdAtClient || 0));
  return { foes, encounters, activities };
}
