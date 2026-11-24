// Passive creature rules are data on the sheet; only their runtime conditions
// and per-post resource are stored on a scene instance.
export function sanitizeRegeneration(value) {
  if (!value || typeof value !== 'object' || !value.resourceId) return null;
  return {
    resourceId: String(value.resourceId).slice(0, 120),
    constitutionMultiplier: Math.max(0, Math.min(4, Math.trunc(Number(value.constitutionMultiplier) || 0))),
    blockedByBurning: value.blockedByBurning === true,
    burningArmorPenalty: Math.max(0, Math.min(10, Number(value.burningArmorPenalty) || 0)),
    ...(value.timing === 'end' ? { timing: 'end' } : {}),
    ...(value.burningDamage === '1d4' ? { burningDamage: '1d4' } : {}),
    ...(value.incomingBurningBonus === '1d4' ? { incomingBurningBonus: '1d4' } : {})
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

export function isActivelyBurning(conditions = []) {
  return conditions.some(condition => condition.active !== false && condition.id !== 'regeneration-fire-exposure'
    && (condition.presetId === 'burning' || /^(brennend|burning)$/i.test(String(condition.name || ''))));
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
    presetId: 'burned', name: 'Verbrannt', active: true, source: 'Feuerschaden',
    description: `Trollblut setzt aus.${trait.regeneration.burningArmorPenalty ? ` Rüstungsklasse −${trait.regeneration.burningArmorPenalty}.` : ''} Erneutes Feuer erneuert die Dauer.`,
    duration: 'Bis zum Ende des nächsten eigenen Kampfposts',
    durationModel: { kind: 'actor-comments', remainingActorComments: 1 },
    remainingActorComments: 1, mechanics: {}
  };
  return [...conditions.filter(condition => condition.id !== burn.id), burn];
}

export function applyTenebriumExposure(conditions, profile, damageKinds, incoming) {
  if (incoming <= 0 || !damageKinds.includes('tenebrium') || !profile.encounterTags?.includes('tenebrium-empfindlich')) return conditions;
  const id = 'tenebrium-gehemmt';
  return [...conditions.filter(condition => condition.id !== id), { id, name: 'Durch Tenebrium gehemmt', active: true,
    source: 'Tenebrium', description: '−3 m Bewegung. Magische Kampfhandlungen sind gesperrt.', blocksMagic: true,
    durationModel: { kind: 'actor-comments', remainingActorComments: 1 }, mechanics: { movement: -3 } }];
}
