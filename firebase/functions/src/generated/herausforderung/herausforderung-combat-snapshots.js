// A shared receipt projection for server execution, client previews and replay.
export function applyChallengeCombatSnapshots(states, snapshots = []) {
  for (const snapshot of snapshots) if (snapshot?.actorId && snapshot.after) states.set(String(snapshot.actorId), {
    ...(states.get(String(snapshot.actorId)) || {}), ...structuredClone(snapshot.after)
  });
  return states;
}
