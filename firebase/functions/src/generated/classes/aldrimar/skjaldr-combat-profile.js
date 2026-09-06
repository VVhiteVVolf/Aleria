import { getSkjaldrBerserkProgression, SKJALDR_BERSERK_RULES } from './skjaldr-berserk-progression.js';

export function isSkjaldrBerserkAbility(id) {
  return ['fenrir-berserkergang', SKJALDR_BERSERK_RULES.id].includes(String(id || '').replace(/^ability:/, ''));
}

export function reconcileSkjaldrCombatProfile(profile = {}) {
  const className = String(profile.templateSelections?.classId || profile.identity?.className || '').toLowerCase();
  if (!/skjaldr|schildbei[ßs]s?er/.test(className)) return profile;
  const tier = getSkjaldrBerserkProgression(profile.progression?.level || 1);
  const previous = (profile.abilities || []).find(ability => isSkjaldrBerserkAbility(ability.id));
  const abilities = (profile.abilities || []).filter(ability => !isSkjaldrBerserkAbility(ability.id));
  if (!tier) return { ...profile, abilities };
  const ability = {
    id: previous?.id || SKJALDR_BERSERK_RULES.id, name: `Berserkergang · ${tier.name}`,
    description: tier.description, active: true, combatUsable: true, delivery: 'ability', resolutionType: 'automatic',
    activationType: 'bonus-action', costs: tier.activationCosts, auraBypass: tier.auraBypass,
    usesMaximum: tier.uses,
    usesCurrent: previous ? Math.max(0, tier.uses - Math.max(0, Number(previous.usesMaximum || 0) - Number(previous.usesCurrent || 0))) : tier.uses,
    recovery: tier.recovery, recoveryDayKey: previous?.recoveryDayKey || '',
    target: 'Selbst', range: 'Selbst', duration: 'Bis Kampfende oder einem ruhigen eigenen Gesamtbeitrag',
    requirements: 'Ab Stufe 6. Keine erneute Aktivierung während des Berserkergangs.',
    tags: 'Skjaldr, Berserkergang',
    effects: [
      { id: 'skjaldr-berserk-vitality', type: 'temporary-hit-points', target: 'self', on: 'always', formula: `${tier.hitDice}d12`, bonusAttribute: 'constitution' },
      { id: 'skjaldr-berserk-mode', type: 'apply-condition', target: 'self', on: 'always', condition: {
        id: 'skjaldr-berserk-state', name: 'Berserkergang', active: true,
        icon: '../IconOrdner/Traits Icon/Berserker.png', description: tier.description,
        durationModel: { kind: 'combat' }, duration: 'Bis Kampfende oder einem ruhigen eigenen Gesamtbeitrag',
        mechanics: { strength: tier.strength, weaponBonusDamageFormula: tier.weaponDamage, armorClass: tier.armorClass },
        berserk: { survivalCharges: 1, activity: false }
      } }
    ]
  };
  return { ...profile, abilities: [...abilities, ability] };
}
