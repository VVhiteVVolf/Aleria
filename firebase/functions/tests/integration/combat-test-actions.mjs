import { prepareCombatEquipment, reserveCombatEquipment } from '../../../../AleriaAlmanach/modules/combat/combat-equipment-preparation.js';
import { getActorsWithCombatPosts } from '../../../../AleriaAlmanach/modules/combat/combat-weapon-loadout.js';
import { randomUUID } from 'node:crypto';
import { combatCommentInternals } from '../../src/mechanics/commit-combat-comment.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { withEquippedCombatWeapon } from '../../../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { getActiveCombatEncounter } from '../../../../AleriaAlmanach/modules/combat/combat-encounter-model.js';
import { deriveCombatRuleFrequencyKeys } from '../../../../AleriaAlmanach/modules/combat/combat-trigger-rules.js';
import { buildDamageNotation, parseDamageFormula } from '../../../../AleriaAlmanach/modules/combat/rules/combat-mvp-rules.js';

// Fixed receipts make regressions exact; a seeded PRNG makes complete fights
// reproducible while exercising misses, criticals and mixed damage dice.
export class CheckupDice {
  constructor(natural = 15, seed = 1) { this.natural = natural; this.seed = seed >>> 0 || 1; }
  die(sides) {
    this.seed ^= this.seed << 13; this.seed ^= this.seed >>> 17; this.seed ^= this.seed << 5;
    return (this.seed >>> 0) % sides + 1;
  }
  rollD20(modifier, rollMode, fixed) {
    const dice = Array.from({ length: rollMode === 'normal' ? 1 : 2 }, () => this.natural == null ? this.die(20) : fixed);
    const natural = rollMode === 'advantage' ? Math.max(...dice) : rollMode === 'disadvantage' ? Math.min(...dice) : dice[0];
    return { id: randomUUID(), natural, dice, keptDice: [natural], total: natural + Number(modifier) };
  }
  async rollAttack({ modifier = 0, rollMode = 'normal' }) { return this.rollD20(modifier, rollMode, this.natural); }
  async rollSavingThrow({ modifier = 0, rollMode = 'normal' }) { return this.rollD20(modifier, rollMode, 12); }
  async rollWardDeflection() { return this.rollD20(0, 'normal', this.natural); }
  async rollDamage({ damageFormula, bonus = 0, critical = false }) {
    const parsed = parseDamageFormula(damageFormula);
    const dice = (parsed.terms || [parsed]).flatMap(term => Array.from({ length: term.diceCount * (critical ? 2 : 1) }, () => this.natural == null ? this.die(term.sides) : Math.ceil(term.sides / 2)));
    const modifier = parsed.fixedModifier + Number(bonus);
    return { id: randomUUID(), notation: buildDamageNotation(damageFormula, bonus, critical), dice, keptDice: dice, modifier, total: Math.max(0, dice.reduce((a, b) => a + b, 0) + modifier) };
  }
}

export async function prepareTestAction({ entryId, actorRecord, targetRecords, comments, actionId = '', kind = 'speech', natural = 15,
  dice = new CheckupDice(natural), priorSegments = [], orderKey, paymentMode = 'standard', weaponGrip = 'one-handed', castLevel = 0,
  distanceMeters = 1, loadout = null, text = 'Prüfangriff' }) {
  const selected = resolveCombatProfile(actorRecord, { actionId }).selectedAction;
  const segmentKind = selected?.segmentKinds?.[0] || 'combataction';
  const magic = ['spell', 'prayer', 'song'].includes(segmentKind);
  const bubbleKind = ['song', 'prayer'].includes(segmentKind) ? segmentKind : kind;
  const segment = { kind: bubbleKind, commentKind: bubbleKind, mechanicMode: magic ? 'magic' : 'combat', actorId: actorRecord.id, characterId: actorRecord.id,
    charName: actorRecord.name, sceneActorSourceId: actorRecord.sourceCreatureId || '', text, combatDistanceMeters: distanceMeters,
    combatAction: { encounterId: getActiveCombatEncounter(comments)?.encounterId || '', profileActionId: actionId, rollMode: 'normal', paymentMode, weaponGrip, castLevel, loadout } };
  const resolutions = [];
  const rulePeriods = { comment: 'pending', scene: entryId, day: `scene:${entryId}:day-1` };
  let usedRuleFrequencyKeys = deriveCombatRuleFrequencyKeys([...comments, { commentSegments: priorSegments }]);
  for (const [index, targetRecord] of targetRecords.entries()) {
    const partial = { ...segment, combatResolution: resolutions[0], combatResolutions: resolutions };
    const draft = { id: 'pending', commentSegments: [...priorSegments, partial] };
    const states = deriveCombatStateFromComments([...comments, draft], { commentId: 'pending', segmentIndex: priorSegments.length + 1 });
    const actorState = states.get(actorRecord.id);
    const prepared = prepareCombatEquipment(withEquippedCombatWeapon(actorRecord, actorState?.equippedWeaponId, actorState?.offHandWeaponId), index === 0 ? loadout : null, { free: !getActorsWithCombatPosts(comments).has(String(actorRecord.id)) });
    const actorBase = resolveCombatProfile(prepared.character, { actionId, segmentKind, paymentMode, weaponGrip, castLevel });
    if (actionId && actorBase.profileActionId !== actionId) throw Error(`Die Testattacke ${actionId} ist nicht im Bogen von ${actorRecord.name} vorhanden.`);
    let actor = overlayCombatHitPointState(actorBase, actorState);
    actor.resources = combatCommentInternals.getEffectiveCommentResources(actorBase.resources, actorState?.resources, `scene:${entryId}:day-1`);
    actor = reserveCombatEquipment(actor, prepared.preparation);
    const targetState = states.get(targetRecord.id);
    const target = overlayCombatHitPointState(resolveCombatProfile(withEquippedCombatWeapon(targetRecord, targetState?.equippedWeaponId, targetState?.offHandWeaponId)), targetState);
    const resolution = await new CombatResolutionService(dice).resolveAttack({ actor, target, description: text, rollMode: 'normal' }, {
      relationship: actorRecord.id === targetRecord.id ? 'self' : actorRecord.combatTeam && actorRecord.combatTeam === targetRecord.combatTeam ? 'ally' : 'enemy',
      distanceMeters, rulePeriods, usedRuleFrequencyKeys, startedAction: resolutions[0],
      skipResourceCosts: index > 0, skipAmmunition: index > 0, skipSelfEffects: index > 0, skipChanneling: index > 0
    });
    resolution.multiTargetIndex = index;
    usedRuleFrequencyKeys = new Set(resolution.usedRuleFrequencyKeys || []);
    resolution.multiTargetCount = targetRecords.length;
    resolutions.push(resolution);
    segment.combatAction.profileActionId = actor.profileActionId;
  }
  segment.combatResolution = resolutions[0];
  if (resolutions.length > 1) segment.combatResolutions = resolutions;
  return { segment, payload: { entryId, charName: actorRecord.name, text, metadata: {
    characterId: actorRecord.id, commentSegments: [...priorSegments, segment], ...(orderKey == null ? {} : { orderKey })
  } } };
}
