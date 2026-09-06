// Passive creature rules are data on the sheet; only their runtime conditions
// and per-post resource are stored on a scene instance.
export function sanitizeRegeneration(value) {
  if (!value || typeof value !== 'object' || !value.resourceId) return null;
  return {
    resourceId: String(value.resourceId).slice(0, 120),
    constitutionMultiplier: Math.max(0, Math.min(4, Math.trunc(Number(value.constitutionMultiplier) || 0))),
    blockedByBurning: value.blockedByBurning === true,
    burningArmorPenalty: Math.max(0, Math.min(10, Number(value.burningArmorPenalty) || 0))
  };
}

export function getRegenerationTrait(profile = {}) {
  return (profile.abilities || []).find(ability => ability.active !== false && ability.regeneration) || null;
}

export function isBurning(conditions = []) {
  return conditions.some(condition => condition.active !== false && (
    ['burning', 'burned'].includes(condition.presetId)
    || /^(brennend|verbrannt|burning|burned)$/i.test(String(condition.name || '').trim())
  ));
}

export function getBurningArmorPenalty(profile = {}) {
  const trait = getRegenerationTrait(profile);
  return trait && isBurning([...(profile.conditions || []), ...(profile.temporaryConditions || [])])
    ? Number(trait.regeneration.burningArmorPenalty || 0) : 0;
}

export function applyRegenerationFireExposure(conditions, profile, damageType, incoming) {
  const trait = getRegenerationTrait(profile);
  if (!(incoming > 0) || !/^(feuer|fire)$/i.test(String(damageType || '').trim())
    || !trait?.regeneration.blockedByBurning) return conditions;
  const burn = {
    id: 'regeneration-fire-exposure', sourceConditionId: 'regeneration-fire-exposure',
    presetId: 'burning', name: 'Verbrannt', active: true, source: 'Feuerschaden',
    description: `Trollblut setzt aus; Rüstungsklasse −${trait.regeneration.burningArmorPenalty}. Erneutes Feuer erneuert die Dauer.`,
    duration: 'Bis zum Ende des nächsten eigenen Kampfposts',
    durationModel: { kind: 'actor-comments', remainingActorComments: 1 },
    remainingActorComments: 1, mechanics: {}
  };
  return [...conditions.filter(condition => condition.id !== burn.id), burn];
}
