// The backend owns recovery and its replay boundary. This service deliberately
// does not publish a narrative contribution, notification or feed refresh.
export async function regenerateSceneParticipants(threadId, candidates, comments = []) {
  if (!candidates.length) throw new Error('Wähle mindestens eine Figur aus.');
  const participants = candidates.map(candidate => {
    const persistence = candidate.profile.persistence || {};
    const instance = persistence.kind === 'scene-creature';
    const kind = instance ? 'creature' : persistence.kind;
    const recordId = instance ? persistence.sourceCreatureId : persistence.recordId;
    if (!['character', 'creature'].includes(kind) || !recordId) {
      throw new Error(`${candidate.name} besitzt keine gespeicherte Profilquelle.`);
    }
    return { actorId: candidate.actorId, kind, recordId };
  });
  const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
  if (!backend?.regenerateSceneParticipants) {
    throw new Error('Die Regeneration benötigt eine Online-Verbindung mit dem aktuellen Szenenserver.');
  }
  const result = await backend.regenerateSceneParticipants({
    entryId: threadId,
    participants,
    expectedLastCommentId: String(comments.at(-1)?.id || '')
  });
  if (result?.profileUpdates?.length) {
    document.dispatchEvent(new CustomEvent('aleria:combat-profile-committed', { detail: { updates: result.profileUpdates } }));
  }
  return result;
}
