// Shared usage tracking for combat-usable special abilities.
// The client uses this for sequential segment previews; Firebase repeats the
// same calculation inside the authoritative comment transaction.

function cloneAbilities(abilities = []) {
  return (Array.isArray(abilities) ? abilities : []).map(ability => ({ ...ability }));
}

function getAbilityId(profileActionId = '') {
  const actionId = String(profileActionId || '');
  return actionId.startsWith('ability:') ? actionId.slice('ability:'.length) : '';
}

export function applyCombatAbilityUse(sourceAbilities = [], profileActionId = '', recoveryDayKey = '') {
  const abilities = cloneAbilities(sourceAbilities);
  const abilityId = getAbilityId(profileActionId);
  if (!abilityId) {
    return { sufficient: true, changed: false, abilities, beforeAbilities: cloneAbilities(abilities), use: null, missing: null };
  }

  const ability = abilities.find(candidate => String(candidate?.id || '') === abilityId);
  const maximum = Math.max(0, Number(ability?.usesMaximum) || 0);
  if (!ability || maximum <= 0) {
    return { sufficient: true, changed: false, abilities, beforeAbilities: cloneAbilities(abilities), use: null, missing: null };
  }

  const dayKey = String(recoveryDayKey || '').trim().slice(0, 160);
  if (ability.recovery === 'day' && dayKey) {
    const previousDayKey = String(ability.recoveryDayKey || '');
    if (!previousDayKey || previousDayKey !== dayKey) ability.usesCurrent = maximum;
    ability.recoveryDayKey = dayKey;
  }

  const beforeAbilities = cloneAbilities(abilities);
  const before = Math.max(0, Number(ability.usesCurrent) || 0);
  if (before < 1) {
    return {
      sufficient: false,
      changed: false,
      abilities,
      beforeAbilities,
      use: null,
      missing: { abilityId, name: String(ability.name || 'Fähigkeit'), required: 1, available: before }
    };
  }

  ability.usesCurrent = before - 1;
  return {
    sufficient: true,
    changed: true,
    abilities,
    beforeAbilities,
    use: {
      abilityId,
      name: String(ability.name || 'Fähigkeit'),
      before,
      after: ability.usesCurrent,
      amount: 1
    },
    missing: null
  };
}

export const combatAbilityUseInternals = Object.freeze({ cloneAbilities, getAbilityId });
