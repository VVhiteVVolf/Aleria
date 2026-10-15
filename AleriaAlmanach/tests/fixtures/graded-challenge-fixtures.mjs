export const actorId = 'reader', opponentId = 'opponent';
const empty = () => ({ copper: 0, items: [], effects: [], combatEffects: [] });
const effect = (id, mechanics, { scope, targetActorId, amount = 1, combat = false } = {}) => ({
  effectId: id, name: id, kind: 'buff', durationKind: combat ? 'combat' : 'actor-comments', durationAmount: amount, mechanics,
  ...(targetActorId ? { targetActorId } : {}), ...(scope ? { usage: { scope, actorId } } : {})
});
export function gradedEvent() {
  const labels = { 'critical-success': 'Kritischer Erfolg', success: 'Erfolg', partial: 'Teilerfolg', neutral: 'Keine Erkenntnis', failure: 'Fehlschlag', 'major-failure': 'Großer Fehlschlag', 'critical-failure': 'Kritischer Fehlschlag' };
  const row = (id, minimumTotal, effects = [], natural = 0) => ({ id, label: labels[id], natural, minimumTotal, text: `Verdecktes Ergebnis: ${labels[id]}`, success: ['critical-success', 'success'].includes(id), benefits: { ...empty(), effects } });
  return { title: 'Seinen nächsten Zug lesen', publicDescription: 'Gais verändert seinen Stand und fasst am Lanzenschaft nach. Ylvas Augen verengen sich. Verraten sein Griff, sein Blick oder die Verteilung seines Gewichts, wie er als Nächstes vorgehen will?', audience: { mode: 'selected', actorIds: [actorId] }, combatBound: true,
    approaches: [{ approachId: 'read-move', label: 'Gais’ Vorbereitung deuten', preferredSkills: ['perception', 'investigation', 'insight'], difficulty: 18, insight: 'Seine Vorbereitung wird erkennbar.', attemptLimit: 1,
      outcomeTable: [row('critical-success', null, [effect('foresight', { attackRollMode: 'advantage' }, { amount: 2 })], 20),
        row('success', 18, [effect('opening', { attackRollMode: 'advantage' }, { scope: 'action' })]),
        row('partial', 15, [effect('hint', { attack: 1 }, { scope: 'attack' })]), row('neutral', 12),
        row('failure', 5, [effect('warned', { armorClass: 1 }, { scope: 'action', targetActorId: opponentId, combat: true })]),
        row('major-failure', null, [{ ...effect('mistake', { attackRollMode: 'disadvantage' }, { scope: 'attack' }), kind: 'debuff' }]),
        row('critical-failure', null, [effect('exposed', { armorClass: 1 }, { targetActorId: opponentId, combat: true })], 1)] } ] };
}
export const person = id => ({ id, name: id === actorId ? 'Ylva Wolfshorn' : id === opponentId ? 'Gais Wyrm' : id, inventory: { items: [] }, combatProfile: { progression: { level: 3 }, hitPoints: { current: 40, maximumOverride: 40 }, armorClass: { override: 12 },
  attributes: [{ key: 'wisdom', score: 10 }, { key: 'intelligence', score: 10 }],
  weapons: [{ id: 'sword', name: 'Sword', weaponType: 'sword', damageFormula: '1d6', equipped: true }], resources: [] } });
export const encounterComment = () => ({ entryId: 'scene', serverValidatedMechanics: true, orderKey: 1, combatEncounter: { operation: 'start', encounterId: 'duel',
  participants: [{ actorId, name: actorId, partyId: 'a', persistence: { kind: 'character', recordId: actorId, persistent: true } }, { actorId: opponentId, name: opponentId, partyId: 'b', persistence: { kind: 'character', recordId: opponentId, persistent: true } }] } });
