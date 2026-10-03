// Newly applied main-action locks grant one complete owner contribution of protection on expiry.
export function getActionLockPrevention(conditions = [], incoming = {}) {
  if (incoming.blockedResource !== 'action') return '';
  if (conditions.some(c => c.active !== false && c.actionLockRecovery)) return 'Handlungssicherheit verhindert eine erneute Sperre der Hauptaktion.';
  if (conditions.some(c => c.active !== false && c.blockedResource === 'action')) return 'Die bestehende Hauptaktionssperre wird nicht verlängert.';
  return '';
}
export function createActionLockRecovery(condition) {
  if (condition.blockedResource !== 'action' || !condition.grantsActionRecovery) return null;
  return { id: `recovery:${condition.id}`, name: 'Handlungssicherheit', active: true, actionLockRecovery: true,
    description: 'Bis zum Ende des nächsten eigenen Beitrags kann die Hauptaktion nicht erneut gesperrt werden.',
    durationModel: { kind: 'actor-comments', remainingActorComments: 1, encounterId: condition.durationModel?.encounterId || '' },
    mechanics: {} };
}
