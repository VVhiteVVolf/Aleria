import { getAuraTargetMechanics, parseAuraRadiusMeters } from './combat-profile-model.js?v=20260928-equipment-art-v4';
import { sanitizeCombatRuleEffects } from './combat-trigger-rules.js?v=20261113-scene-elements-v1';
import { getCombatRuleDistance } from './combat-rule-distance.js';

export function buildSupportAuraApplications(sources, actionKind, actor, target, { preview = false } = {}) {
  const applications = [];
  sources.filter(source => source.sourceRole === 'support').forEach(source => {
    const selected = new Set(Array.isArray(source.selectedRuleIds) ? source.selectedRuleIds : []);
    [['@aura:actor', 'actor'], ['@aura:target', 'target']].forEach(([selectionId, recipient]) => {
      if (!preview && !selected.has(selectionId)) return;
      const relation = recipient === 'actor' ? source.relationToActor : source.relationToTarget;
      const distanceMeters = getCombatRuleDistance(source, selectionId, recipient);
      const mechanics = getAuraTargetMechanics(source.profile, {
        relation, distanceMeters, ignoreRange: preview, sourceActorId: source.actorId, recipientProfile: recipient === 'actor' ? actor : target
      });
      const effects = sanitizeCombatRuleEffects(recipient === 'actor' ? {
        attackModifier: Number(mechanics.attack || 0) + (['spell', 'prayer', 'song'].includes(actionKind) ? Number(mechanics.spellAttack || 0) : 0),
        spellSaveDcModifier: mechanics.spellSaveDc,
        damageModifier: mechanics.damage,
        rollMode: mechanics.attackRollMode
      } : {
        defenseModifier: mechanics.armorClass,
        savingThrowModifier: mechanics.savingThrow,
        rollMode: mechanics.attackRollMode
      });
      const hasEffect = Object.entries(effects).some(([key, value]) => key === 'rollMode'
        ? value !== 'normal'
        : (key === 'outcome' ? value !== 'none' : Number(value) !== 0));
      if (!hasEffect) return;
      applications.push({
        applicationKey: `${source.actorId}:aura:${recipient}`,
        usedKey: '',
        sourceActorId: String(source.actorId || ''),
        sourceActorName: String(source.actorName || ''),
        sourceRole: 'support',
        relationToActor: source.relationToActor,
        relationToTarget: source.relationToTarget,
        entryKind: 'aura',
        entryId: 'aura',
        entryName: source.profile?.aura?.name || 'Aura & Pr\u00e4senz',
        ruleId: selectionId,
        ruleName: `${source.profile?.aura?.name || 'Aura'} auf ${recipient === 'actor' ? 'handelnde Figur' : 'Ziel'}`,
        phase: 'pre-roll', activation: 'passive', frequency: 'always', condition: 'always',
        recipient, priority: -10, effects, costs: [], consumesAbilityUse: false
      });
    });
  });
  return applications;
}

export function getCombatSupportAuraOptions(source, actionKind, actor, target) {
  const aura = source.profile?.aura;
  if (!aura?.enabled || source.actorId === actor.characterId || source.actorId === target?.characterId) return [];
  const hasRadius = [aura.latentPresence, aura.activeForm].some(component =>
    component?.active && component.enabled && parseAuraRadiusMeters(component.radius) != null);
  return buildSupportAuraApplications([source], actionKind, actor, target, { preview: true }).map(application => ({
    ...application, persistence: source.profile.persistence,
    selected: source.ruleSelections.some(selection => selection.ruleId === application.ruleId),
    phaseLabel: 'vor Wurf', supportDistance: hasRadius,
    distanceMeters: getCombatRuleDistance(source, application.ruleId, application.recipient)
  }));
}
