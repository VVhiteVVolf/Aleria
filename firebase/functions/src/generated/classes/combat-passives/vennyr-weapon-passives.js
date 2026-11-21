import { SIRENENTANZ_FORM_IDS as F } from '../../combat-styles/sirenentanz/sirenentanz-forms.js';
import { getCombatMounts } from '../../combat/combat-support-equipment.js';
import { activeCondition, actionPreparesAttack, actionProvidesGuard, positionPenalty, removeTrainingCondition, trainingCondition } from './class-passive-conditions.js';
import { hasStructuredTag, isBow, isEnemy, leadingWeapon, passiveRule, weaponProfile } from './class-passive-action.js';

const MORWYR_STANCE = 'cp-morwyr-stance';
const MORWYR_BINDING = 'cp-morwyr-binding';
const RHYFELWYR_STANCE = 'cp-rhyfelwyr-stance';
const CEIDWYN_GUARD = 'cp-ceidwyn-guard';
const CEIDWYN_TRANSITION = 'cp-ceidwyn-transition';
const RHIDDWYR_GUARD = 'cp-rhiddwyr-guard';
const RHIDDWYR_ON_FOOT = 'cp-rhiddwyr-on-foot';
const RHIDDWYR_MOUNT = 'cp-rhiddwyr-mount';
export const RHIDDWYR_MOUNT_RULE = 'class-passive-mount-position';

const deckTags = ['schwankendes-deck', 'bewegtes-deck', 'unstable-deck'];
const heavyWyrmWeapons = ['greataxe', 'axe', 'battleaxe', 'warhammer', 'hammer', 'morningstar', 'flail', 'mace', 'club', 'raven-beak'];
const guards = (context, level, id, name, data, lifetime = 'next-start') => [
  passiveRule(context, 'preparation', level, { once: false, resultEffects: [trainingCondition(id, name, 'self', data, lifetime)] })
];
const wyrm = context => context.role === 'actor' && context.primary && context.paid && context.style === 'sirenentanz';
const softSave = context => (context.save.grip || context.save.position) && !context.save.disarm && !context.save.prone
  && !context.state.saveContext?.failureCondition?.blockedResource;

function hasClosePosition(context) {
  return context.state.distanceMeters != null && Number(context.state.distanceMeters) <= 2;
}

export function morwyrPassives(context) {
  const { phase, role, level, self, state, action, weapon } = context;
  const stance = activeCondition(self, MORWYR_STANCE);
  if (role === 'actor' && phase === 'pre-roll' && state.skillId === 'acrobatics'
    && hasStructuredTag(self, deckTags)) {
    return [passiveRule(context, 'deck-balance', 5, { effects: { skillModifier: 2 } })];
  }
  if (role === 'target' && phase === 'pre-secondary-save' && stance && context.save.movement) {
    return [passiveRule(context, 'deck-stand', level >= 18 ? 18 : 14, { effects: { savingThrowModifier: level >= 18 ? 2 : 1 } })];
  }
  if (!wyrm(context)) return [];
  const profile = weaponProfile(weapon);
  const deckWeapon = ['partisan', 'axe', 'battleaxe', 'boarding-axe', 'polearm'].includes(profile);
  const control = softSave(context);
  if (phase === 'pre-damage' && deckWeapon && actionProvidesGuard(action, state.hit)) {
    return guards(context, action.nonDamaging ? 7 : 8, MORWYR_STANCE, 'Gesetzter Deckstand', {},
      'next-end');
  }
  if (phase === 'pre-secondary-save' && deckWeapon && control && stance && hasClosePosition(context) && isEnemy(context)) {
    return [passiveRule(context, 'close-grip', 10, { effects: { spellSaveDcModifier: 1 } })];
  }
  if (phase === 'post-secondary-save' && state.saveSucceeded === false && control && isEnemy(context)) {
    const rules = [];
    if (deckWeapon && hasClosePosition(context)) {
      rules.push(passiveRule(context, 'bound-enemy', 20, { resultEffects: [
        trainingCondition(MORWYR_BINDING, 'Geöffnete Waffenlinie', 'self', {
          trainingOpponentId: context.target.characterId
        })
      ] }));
    }
    if (profile === 'harpoon' && String(action.sourceId).endsWith('-leinenwurf')) {
      // Line and free space are checked by the scene for this existing manual
      // movement. The paid throw and its save are still recorded here.
      rules.push(passiveRule(context, 'line-length', 16, { resultEffects: [{
        id: 'cp-morwyr-line-length', type: 'narrative', on: 'always',
        notes: 'Leinenmeister: Bei intakter, befestigter Leine und freiem Zugweg bis zu 3 m Heranziehen.'
      }] }));
    }
    return rules;
  }
  const binding = activeCondition(self, MORWYR_BINDING);
  if (phase === 'pre-hit-damage' && state.hit && deckWeapon && isEnemy(context) && binding?.trainingOpponentId === context.target.characterId) {
    return [passiveRule(context, 'deck-master', 20, { effects: { damageModifier: 1 }, resultEffects: [removeTrainingCondition(binding)] })];
  }
  return [];
}

export function rhyfelwyrPassives(context) {
  const { phase, role, level, self, state, action, weapon, form, target } = context;
  const beforeSave = phase === 'pre-secondary-save' || (phase === 'pre-roll' && state.saveAttribute);
  if (role === 'target' && beforeSave && (context.save.fear || context.save.prone)) {
    return [passiveRule(context, 'steadfast', level >= 14 ? 14 : 5, { effects: { savingThrowModifier: level >= 14 ? 2 : 1 } })];
  }
  if (!wyrm(context)) return [];
  const heavy = heavyWyrmWeapons.includes(weaponProfile(weapon));
  const guarded = actionProvidesGuard(action, state.hit);
  if (phase === 'pre-damage') {
    const rules = [];
    if (heavy && (guarded || actionPreparesAttack(action) || (level >= 16 && form === F.breaker && state.hit))) {
      const minimum = guarded ? 7 : actionPreparesAttack(action) ? 8 : 16;
      rules.push(...guards(context, minimum, RHYFELWYR_STANCE, 'Gesetzte schwere Antwort'));
    }
    if (form === F.depths && action.nonDamaging && guarded) {
      rules.push(passiveRule(context, 'depths', level >= 20 ? 20 : 18, { resultEffects: [{
        id: 'cp-rhyfelwyr-depths', type: 'temporary-hit-points', amount: level >= 20 ? 3 : 2, target: 'self', on: 'always',
        temporaryUntilOwnContribution: true
      }] }));
    }
    return rules;
  }
  if (phase === 'pre-secondary-save' && heavy && softSave(context) && isEnemy(context)
    && activeCondition(self, RHYFELWYR_STANCE)
    && (positionPenalty(target) || hasStructuredTag(target, ['offene-deckung', 'berserk', 'berserkergang'])
      || (target.temporaryConditions || []).some(condition => condition.active !== false && Number(condition.mechanics?.armorClass) < 0))) {
    return [passiveRule(context, 'counter-save', 10, { effects: { spellSaveDcModifier: 1 } })];
  }
  return [];
}

function isCeidwynRanged(weapon) {
  return ['shortbow', 'crossbow'].includes(weaponProfile(weapon)) || (isBow(weapon) && weaponProfile(weapon) === 'bow');
}

function isCeidwynMelee(weapon) {
  return ['sabre', 'trident'].includes(weaponProfile(weapon));
}

export function isCeidwynWeaponTransition(weapons, beforeId, afterId) {
  const before = weapons?.find(weapon => weapon.id === beforeId);
  const after = weapons?.find(weapon => weapon.id === afterId);
  return (isCeidwynMelee(before) && isCeidwynRanged(after)) || (isCeidwynRanged(before) && isCeidwynMelee(after));
}

export function ceidwynPassives(context) {
  const { phase, role, self, state, action, form, level, weapon, actor } = context;
  const guarded = activeCondition(self, CEIDWYN_GUARD);
  if (role === 'target' && phase === 'pre-hit-damage' && guarded && context.melee && state.hit && isEnemy(context)) {
    return [passiveRule(context, 'side-protection', guarded.guardAmount === 2 ? 16 : 7, {
      effects: { damageReduction: guarded.guardAmount }
    })];
  }
  if (!wyrm(context)) return [];
  const position = activeCondition(self, CEIDWYN_TRANSITION);
  const preparation = actor.equipmentPreparation;
  const paidSwitch = preparation && !preparation.free && preparation.costs?.length
    && isCeidwynWeaponTransition(actor.weapons, preparation.before.rightWeaponId, preparation.after.rightWeaponId);
  const transitioned = paidSwitch || position;
  const ranged = isCeidwynRanged(weapon), melee = isCeidwynMelee(weapon);
  if (phase === 'pre-roll' && isEnemy(context)) {
    if (transitioned && !action.lightAttack && (ranged || melee) && level >= 20) {
      return [passiveRule(context, 'transition-roll', 20, { effects: { attackModifier: 1 } })];
    }
    if (transitioned && ranged && positionPenalty(self)) {
      return [passiveRule(context, 'transition-roll', 8, { effects: { attackModifier: 1 } })];
    }
    if (ranged && hasStructuredTag(self, deckTags)) {
      return [passiveRule(context, 'sea-shot', 5, { effects: { attackModifier: 1 } })];
    }
  }
  if (phase === 'pre-secondary-save' && transitioned && weaponProfile(weapon) === 'trident' && softSave(context)) {
    return [passiveRule(context, 'trident-save', 14, { effects: { spellSaveDcModifier: 1 } })];
  }
  if (phase === 'pre-damage' && actionProvidesGuard(action, state.hit)) {
    if (transitioned && melee && state.hit) {
      const strengthened = level >= 16 && [F.current, F.depths].includes(form);
      return guards(context, strengthened ? 16 : 7, CEIDWYN_GUARD, 'Gedeckter Waffenwechsel', { guardAmount: strengthened ? 2 : 1 });
    }
    if (level >= 10 && !transitioned && action.nonDamaging) {
      return guards(context, form === F.current && level >= 18 ? 18 : 10,
        'cp-ceidwyn-ready', 'Vorbereitete Übergabe', {}, form === F.current && level >= 18 ? 'next-end' : 'next-start');
    }
  }
  return [];
}

export function rhiddwyrPassives(context) {
  const { phase, role, self, state, form, level, action } = context;
  if (role === 'target' && phase === 'pre-secondary-save' && state.saveContext?.mountLanding) {
    return [passiveRule(context, 'landing', level >= 14 ? 14 : 5, { effects: { savingThrowModifier: level >= 14 ? 2 : 1 } })];
  }
  if (role === 'target' && phase === 'mount-landed') {
    return [passiveRule(context, 'landed', 7, { resultEffects: [
      trainingCondition(RHIDDWYR_ON_FOOT, 'Stand nach der Landung', 'target')
    ] })];
  }
  const guard = activeCondition(self, RHIDDWYR_GUARD);
  if (role === 'support' && phase === 'pre-hit-damage' && state.hit && context.melee && isEnemy(context)
    && context.source.ruleSelections?.some(selection => selection.ruleId === RHIDDWYR_MOUNT_RULE)
    && guardsOwnMount(self, context.target)) {
    return [passiveRule(context, 'mount-cover', 16, { support: true, effects: { damageReduction: 1 } })];
  }
  if (role === 'target' && phase === 'pre-hit-damage' && guard && context.melee && state.hit && isEnemy(context)) {
    return [passiveRule(context, 'saddle-guard', guard.guardAmount === 2 ? 18 : 10, { effects: { damageReduction: guard.guardAmount } })];
  }
  if (!wyrm(context)) return [];
  const voluntary = context.actor.equipmentPreparation?.before?.mountId && !context.actor.equipmentPreparation.after?.mountId;
  if (phase === 'pre-roll' && !self.combat?.mounted && positionPenalty(self)
    && (activeCondition(self, RHIDDWYR_ON_FOOT) || (level >= 20 && voluntary))) {
    return [passiveRule(context, 'foot-position', voluntary ? 20 : 8, { effects: { attackModifier: 1 } })];
  }
  if (phase === 'pre-damage' && self.combat?.mounted && actionProvidesGuard(action, state.hit)) {
    const rules = [];
    const strengthened = level >= 18 && form === F.current;
    if (state.hit && !action.nonDamaging) {
      rules.push(...guards(context, strengthened ? 18 : 10, RHIDDWYR_GUARD, 'Geschlossene Sattelwende', { guardAmount: strengthened ? 2 : 1 }));
    }
    if (level >= 16 && action.sourceId?.endsWith('-sattelwacht')) {
      rules.push(...guards(context, 16, RHIDDWYR_MOUNT, 'Gedecktes eigenes Ross', { trainingMountId: self.combat.mountId }));
    }
    return rules;
  }
  return [];
}

export function guardsOwnMount(profile, target) {
  const guard = activeCondition(profile, RHIDDWYR_MOUNT);
  if (!target || !profile.combat?.mounted || !profile.combat.mountId || guard?.trainingMountId !== profile.combat.mountId) return false;
  const mount = getCombatMounts(profile).find(entry => entry.id === guard.trainingMountId);
  const targetIds = [target.characterId, target.persistence?.recordId, target.id];
  return Boolean(mount && (targetIds.includes(mount.id) || (mount.creatureId && targetIds.includes(mount.creatureId))));
}

export function classEquipmentTransitionEffects(actor, afterId) {
  if (actor.equipmentPreparation?.free || !isCeidwynWeaponTransition(actor.weapons, actor.activeWeaponId, afterId)) return [];
  return [trainingCondition(CEIDWYN_TRANSITION, 'Bezahlter Wechsel der Distanz', 'self', {},
    activeCondition(actor, 'cp-ceidwyn-ready') ? 'next-end' : 'next-start')];
}
