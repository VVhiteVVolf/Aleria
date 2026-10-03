// Martial movement effects for play without measured movement. No spell or historical-state migration.
export const POSITION_GUARD_TEXT = 'Der nächste gegnerische Waffen-/Technikangriff gegen die Figur erhält −1 Angriff; auch ein Fehlschlag verbraucht den Schutz. Verfällt spätestens am Ende des nächsten eigenen Beitrags.';
export const POSITION_PENALTY_TEXT = 'Der nächste eigene Waffen-/Technikangriff erhält −1 Angriff; auch ein Fehlschlag verbraucht den Malus. Verfällt spätestens am Ende des nächsten eigenen Beitrags.';

export function createPositionCondition(guard, source = {}) {
  const id = guard ? 'martial-position-guard' : 'martial-position-penalty';
  return { ...source, id, name: source.name || (guard ? 'Gedeckter Stellungswechsel' : 'Unsicherer Stand'),
    description: guard ? POSITION_GUARD_TEXT : POSITION_PENALTY_TEXT,
    stanceGroup: id, active: true, duration: 'Bis zum Ende des nächsten eigenen Beitrags',
    durationModel: { kind: 'actor-comments', remainingActorComments: 1 }, mechanics: { ...source.mechanics, movement: 0 },
    triggerRules: [...(source.triggerRules || []), { id: `${id}-once`, name: 'Stellungseffekt', phase: 'pre-roll',
      recipient: 'actor', sourceRelation: guard ? 'enemy' : 'self', activation: 'passive', frequency: 'comment',
      actionKinds: ['weapon', 'technique'], weaponAttackOnly: true, condition: 'always', effects: { attackModifier: -1 },
      resultEffects: [{ id: `${id}-consume`, type: 'remove-condition', target: guard ? 'target' : 'self', conditionId: id, on: 'always' }] }] };
}

export function reviseMartialPositionEntry(entry = {}) {
  const descriptions = new Set();
  function condition(value) {
    if (!Number(value?.mechanics?.movement)) return value;
    const revised = createPositionCondition(Number(value.mechanics.movement) > 0, value);
    descriptions.add(revised.description);
    return revised;
  }
  function effect(value) {
    if (value.type === 'move' && Number(value.movementMeters)) {
      const guard = value.target === 'self' && value.movementKind === 'move';
      const revised = createPositionCondition(guard);
      descriptions.add(revised.description);
      return { ...value, type: guard ? 'buff' : 'debuff', movementMeters: 0, condition: revised, notes: revised.description };
    }
    const revised = condition(value.condition);
    return revised === value.condition ? value : { ...value, condition: revised, notes: revised.description };
  }
  const effects = entry.effects?.map(effect);
  const failureCondition = condition(entry.secondarySave?.failureCondition);
  const triggerRules = entry.triggerRules?.map(rule => {
    const resultEffects = rule.resultEffects?.map(effect);
    const revised = resultEffects?.filter((value,index)=>value !== rule.resultEffects[index]);
    return revised?.length ? { ...rule, resultEffects,
      description: revised.map(value=>value.condition?.description || value.notes).filter(Boolean).join(' ') } : rule;
  });
  if (!descriptions.size) return entry;
  // Keep non-movement rules in the description; replace only clauses that advertise meter-based mechanics.
  const clean = value => String(value || '').replace(/[^.;!?]*(?:\d+\s*(?:m\b|Meter)|Bewegungsbudget|freie Eigenbewegung)[^.;!?]*[.;!?]?/gi, '').trim();
  const summary = [...descriptions].join(' ');
  return { ...entry, ...(effects ? { effects } : {}), ...(triggerRules ? { triggerRules } : {}),
    ...(failureCondition !== entry.secondarySave?.failureCondition ? { secondarySave: { ...entry.secondarySave, failureCondition } } : {}),
    effect: [clean(entry.effect), summary].filter(Boolean).join(' '),
    description: [clean(entry.description), summary].filter(Boolean).join(' '),
    ...(entry.notes != null ? { notes: [clean(entry.notes), summary].filter(Boolean).join(' ') } : {}),
    ...(entry.aiInstructions != null ? { aiInstructions: [clean(entry.aiInstructions), summary].filter(Boolean).join(' ') } : {}) };
}

export function reconcileMartialPositionEffects(profile = {}) {
  return { ...profile, techniques: profile.techniques?.map(reviseMartialPositionEntry),
    abilities: profile.abilities?.map(reviseMartialPositionEntry), weapons: profile.weapons?.map(reviseMartialPositionEntry) };
}
