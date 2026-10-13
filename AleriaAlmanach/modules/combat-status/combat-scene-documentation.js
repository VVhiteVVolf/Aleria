import { getEncounterResolutionGroups } from '../combat/combat-encounter-summary.js';
import { getCombatResolutionTree, getStoredCriticalConsequences } from '../combat/combat-resolution-tree.js';
import { collectCombatTriggerRules, deriveCombatRuleFrequencyKeys, getCombatRuleApplicationKey } from '../combat/combat-trigger-rules.js';
import { getSceneRecoveryDayKey } from '../scene-time/scene-recovery-day.js';

export function getSceneCombatDocumentation(profile, comments = [], threadId = '') {
  const actorId = profile.characterId;
  const activity = [];
  for (const comment of comments) {
    for (const group of getEncounterResolutionGroups(comment)) for (const root of group) {
      for (const { resolution: r, path } of getCombatResolutionTree(root)) {
        if (![r.actorId, r.targetId].includes(actorId)) continue;
        const details = [];
        if (r.targetId === actorId && r.targetSnapshot?.hitPointsBefore !== r.targetSnapshot?.hitPointsAfter) {
          details.push(`TP ${r.targetSnapshot.hitPointsBefore} → ${r.targetSnapshot.hitPointsAfter}`);
        }
        if (r.actorId === actorId) for (const cost of r.resourceCosts || []) details.push(`${cost.name || cost.resourceId} −${cost.amount}`);
        for (const consequence of getStoredCriticalConsequences({ ...r, counterAttacks: [] })) {
          details.push(`W${consequence.dieSides || (consequence.version >= 2 ? 20 : 10)} ${consequence.roll}: ${consequence.name}`);
        }
        activity.push({ commentId: comment.id, name: `${path.length ? 'Konter · ' : ''}${r.weapon?.name || r.actionName || 'Kampfhandlung'}`,
          actorName: r.actorName, details });
      }
    }
    if (comment.combatStatus?.actorId === actorId) activity.push({ commentId: comment.id, name: 'Zustandsverwaltung',
      details: [comment.text || ({ add: 'Effekt hinzugefügt', remove: 'Effekt entfernt', reset: 'Profil zurückgesetzt' })[comment.combatStatus.operation] || 'Zustand aktualisiert'] });
    for (const event of comment.criticalLifecycle || []) if (event.actorId === actorId) activity.push({
      commentId: comment.id, name: (event.names || []).join(' · '),
      details: [event.before?.current != null && event.after?.current != null ? `TP ${event.before.current} → ${event.after.current}` : '',
        ...(event.expiredTemporary ? ['Temporäre TP abgelaufen'] : [])].filter(Boolean)
    });
    for (const segment of comment.commentSegments || []) {
      const use = segment.inventoryUse;
      if (use?.actorId === actorId) activity.push({ commentId: comment.id, name: use.item?.name || 'Gegenstand',
        details: [use.operation === 'pickup' ? 'Aufgehoben' : 'Verwendet', ...(use.resourceSnapshot?.changes || []).map(change =>
          `${change.name || change.resourceId}: ${change.before} → ${change.after}`)] });
    }
    if (comment.sceneRest?.participants?.some(participant => participant.actorId === actorId)) activity.push({
      commentId: comment.id, name: comment.sceneRest.type === 'long' ? 'Lange Rast' : 'Kurze Rast', details: ['Erholung abgeschlossen']
    });
  }
  const used = deriveCombatRuleFrequencyKeys(comments);
  const periods = { scene: threadId, day: getSceneRecoveryDayKey(threadId, comments) };
  const limitedRules = collectCombatTriggerRules(profile).filter(rule => ['scene', 'day'].includes(rule.frequency)).map(rule => ({
    name: rule.name, source: rule.entryName, effects: rule.effects,
    period: rule.frequency === 'scene' ? 'Szene' : 'Tag',
    spent: used.has(`${getCombatRuleApplicationKey({ actorId }, rule)}@${rule.frequency}:${periods[rule.frequency]}`)
  }));
  return { activity: activity.slice(-3).reverse(), limitedRules };
}
