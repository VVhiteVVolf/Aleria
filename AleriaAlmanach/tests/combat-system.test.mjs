import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getArmorClass,
  getAuraOpponentMechanics,
  getAuraTargetMechanics,
  getAttributeModifier,
  getCharacterCombatInventoryOptions,
  getEffectiveCombatLevel,
  getMaximumHitPoints,
  getPassivePerception,
  getProficiencyBonus,
  getSkillTotal,
  isTechniqueCompatibleWithWeapon,
  parseAuraRadiusMeters,
  resolveAttackRollMode,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from '../modules/combat/combat-profile-model.js';
import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import {
  createCharacterLevelUpPlan,
  getLevelUpAttributePointAllowance,
  getSuggestedHitPointGain,
  previewCharacterLevelUp
} from '../modules/combat/combat-level-up-model.js';
import {
  resolveCombatProfile,
  validateCombatActorProfile,
  validateCombatTargetProfile
} from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { combatNarrationInternals, narrateCombatResolution } from '../modules/combat/combat-narration-service.js';
import { combatUiInternals } from '../modules/combat/ui/combat-ui.js';
import {
  applyCombatDamage,
  applyCombatResourceCosts,
  deriveCombatStateFromComments,
  normalizeCombatHitPointState,
  patchResolutionHitPointState
} from '../modules/combat/combat-state-model.js';
import {
  canUseManaSubstitutePayment,
  COMBAT_ACTION_RESOURCE_DEFINITIONS,
  getActionPaymentCosts,
  getPersistentCombatResources,
  recoverDailyCombatResources,
  resetCommentScopedResources
} from '../modules/combat/combat-action-economy.js';
import {
  buildAttackNotation,
  buildDamageNotation,
  evaluateAttackRoll,
  parseDamageFormula
} from '../modules/combat/rules/combat-mvp-rules.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { deriveCombatRuleFrequencyKeys } from '../modules/combat/combat-trigger-rules.js';
import {
  COMBAT_SPELL_SLOT_DEFINITIONS,
  getOrderedSpellSlotResources,
  getSpellLevelLabel,
  getSpellSlotResourceId
} from '../modules/combat/combat-spell-slots.js';

test('fehlende aktuelle TP starten bei den berechneten maximalen TP', () => {
  assert.deepEqual(normalizeCombatHitPointState({ current: null, maximum: 19 }), {
    current: 19,
    maximum: 19,
    temporary: 0
  });
  const resolved = resolveCharacterCombatProfile(character('actor', {
    hitPoints: { current: null, maximumOverride: 19, hitDie: 8 }
  }));
  assert.equal(resolved.currentHitPoints, 19);
});

test('Fähigkeitsnutzungen werden aus mechanischen Kommentaren fortgeschrieben', () => {
  const state = deriveCombatStateFromComments([{
    id: 'ability-comment',
    commentSegments: [{
      combatResolution: {
        actorId: 'actor',
        targetId: 'target',
        targetSnapshot: { hitPointsAfter: 10, maximumHitPoints: 10, temporaryHitPointsAfter: 0 },
        actorAbilitySnapshot: {
          after: [{ id: 'battle-cry', name: 'Schlachtruf', usesCurrent: 1, usesMaximum: 2 }]
        }
      }
    }]
  }]);
  assert.equal(state.get('actor').abilities[0].usesCurrent, 1);
});

function character(id, combatProfile = {}) {
  return {
    id,
    name: id === 'actor' ? 'Alwyn' : 'Ziel',
    combatProfile: {
      progression: { level: 1, specialLevels: 0 },
      attributes: [
        { key: 'strength', score: 14 },
        { key: 'dexterity', score: 10 },
        { key: 'constitution', score: 12 },
        { key: 'intelligence', score: 10 },
        { key: 'wisdom', score: 10 },
        { key: 'charisma', score: 10 }
      ],
      hitPoints: { current: 18, maximumOverride: 20, hitDie: 8 },
      armorClass: { base: 12, dexterityMode: 'full' },
      combat: { attackBonus: 1, damageBonus: 2 },
      weapons: [{
        id: 'sword', name: 'Langschwert', damageFormula: '1W8', damageType: 'Hieb',
        attackAttribute: 'strength', proficient: true, attackBonus: 1, damageBonus: 1,
        range: 'Nahkampf', equipped: true
      }],
      armorItems: [{ id: 'leather', name: 'Lederrüstung', armorClassBonus: 2, equipped: true }],
      skills: [], resources: [],
      ...combatProfile
    }
  };
}

class FakeDiceAdapter {
  constructor(attackRoll, damageRoll = { total: 9, notation: '1d8+5', keptDice: [4], modifier: 5 }, savingThrowRoll = { natural: 10 }) {
    this.attackRoll = attackRoll;
    this.damageRoll = damageRoll;
    this.attackCalls = [];
    this.damageCalls = [];
    this.savingThrowRoll = savingThrowRoll;
  }

  async rollAttack(request) {
    this.attackCalls.push(request);
    return { id: 'attack-roll', dice: [this.attackRoll.natural], keptDice: [this.attackRoll.natural], visualMode: '3d', ...this.attackRoll };
  }

  async rollDamage(request) {
    this.damageCalls.push(request);
    return { id: 'damage-roll', visualMode: '3d', ...this.damageRoll };
  }

  async rollSavingThrow(request) {
    const natural = Number(this.savingThrowRoll.natural) || 1;
    return {
      id: 'saving-throw-roll', natural, dice: [natural], keptDice: [natural],
      total: natural + Number(request.modifier || 0), visualMode: '3d'
    };
  }
}

class FakeSkillDiceAdapter {
  constructor(natural) { this.natural = natural; this.calls = []; }
  async rollSkill(request) {
    this.calls.push(request);
    const dice = request.rollMode === 'normal' ? [this.natural] : [this.natural, Math.max(1, this.natural - 3)];
    return { id: 'skill-roll', natural: this.natural, dice, keptDice: [this.natural], total: this.natural + request.modifier };
  }
}

test('migriert das alte Kampfprofil verlustarm in Schema neun', () => {
  const profile = sanitizeCharacterCombatProfile({
    defense: 13,
    maximumHitPoints: 22,
    currentHitPoints: 17,
    baseAttackBonus: 4,
    baseDamageBonus: 2,
    weapon: { name: 'Speer', damageFormula: '1W6 + 1' },
    armor: { name: 'Lederrüstung', defenseBonus: 2 }
  });
  assert.equal(profile.schemaVersion, 9);
  assert.equal(profile.armorClass.base, 13);
  assert.equal(profile.hitPoints.maximumOverride, 22);
  assert.equal(profile.combat.attackBonus, 4);
  assert.equal(profile.weapons[0].damageFormula, '1d6+1');
  assert.equal(profile.weapons[0].proficient, false);
  assert.equal(profile.armorItems[0].armorClassBonus, 2);
});

test('begrenzt normale Stufen auf 20 und Sonderstufen auf insgesamt 30', () => {
  const profile = sanitizeCharacterCombatProfile({ progression: { level: 99, specialLevels: 99 } });
  assert.equal(profile.progression.level, 20);
  assert.equal(profile.progression.specialLevels, 10);
  assert.equal(getEffectiveCombatLevel(profile), 30);
  assert.equal(getProficiencyBonus(profile), 9);
});

test('führt einen normalen Stufenaufstieg mit automatischen Trefferpunkten als Vorschau aus', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 1, experience: 280, nextLevelExperience: 300 },
    attributes: [{ key: 'constitution', score: 14 }],
    hitPoints: { current: 10, hitDie: 8, maximumOverride: null },
    resources: []
  });
  const plan = createCharacterLevelUpPlan(profile);
  plan.experience = 300;
  plan.nextLevelExperience = 900;
  const preview = previewCharacterLevelUp(profile, plan);
  assert.equal(preview.ready, true);
  assert.equal(preview.profile.progression.level, 2);
  assert.equal(preview.profile.progression.specialLevels, 0);
  assert.equal(preview.profile.progression.experience, 300);
  assert.equal(preview.profile.progression.nextLevelExperience, 900);
  assert.equal(getSuggestedHitPointGain(profile), 7);
  assert.equal(getMaximumHitPoints(preview.profile), 17);
  assert.equal(preview.profile.hitPoints.current, 17);
  assert.equal(profile.progression.level, 1, 'Das Ausgangsprofil darf nicht verändert werden.');
});

test('wechselt nach Stufe 20 in Sonderstufen und respektiert das Gesamtlimit 30', () => {
  const levelTwenty = sanitizeCharacterCombatProfile({ progression: { level: 20, specialLevels: 0 } });
  const specialPlan = createCharacterLevelUpPlan(levelTwenty);
  specialPlan.attributeIncreases.strength = 4;
  const specialPreview = previewCharacterLevelUp(levelTwenty, specialPlan);
  assert.equal(specialPreview.ready, true);
  assert.equal(specialPreview.profile.progression.level, 20);
  assert.equal(specialPreview.profile.progression.specialLevels, 1);
  assert.equal(specialPreview.after.levelKind, 'special');

  const capped = sanitizeCharacterCombatProfile({ progression: { level: 20, specialLevels: 10 } });
  const cappedPreview = previewCharacterLevelUp(capped, createCharacterLevelUpPlan(capped));
  assert.equal(cappedPreview.ready, false);
  assert.match(cappedPreview.errors[0], /Gesamtstufe 30/);
});

test('wendet freie Level-up-Entscheidungen auf Attribute, Ressourcen und Freischaltungen an', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 7 },
    attributes: [{ key: 'constitution', score: 13 }, { key: 'wisdom', score: 15 }],
    hitPoints: { current: 25, maximumOverride: 25 },
    resources: [{ id: 'mana', name: 'Mana', current: 3, maximum: 5 }],
    skills: [], abilities: [], magic: { enabled: false, spells: [] }
  });
  const plan = createCharacterLevelUpPlan(profile);
  plan.attributeIncreases.constitution = 1;
  plan.attributeIncreases.wisdom = 1;
  plan.hitPointMode = 'manual';
  plan.manualHitPointGain = 9;
  plan.resourceIncreases.mana = { current: 4, maximum: 4 };
  plan.newSkill = { name: 'Fährtenlesen', attributeKey: 'wisdom', proficiency: 'expertise', bonus: 1, notes: 'Nur in Wildnis.' };
  plan.newAbility = { name: 'Waldschritt', description: 'Ignoriert Gestrüpp.', usesMaximum: 2, recovery: 'long-rest', rollFormula: '1W6' };
  plan.newSpell = { name: 'Dornenruf', level: 2, manaCost: 3, rollFormula: '2W6', description: 'Dornen brechen hervor.', prepared: true };
  const preview = previewCharacterLevelUp(profile, plan);
  assert.equal(preview.profile.attributes.find(attribute => attribute.key === 'constitution').score, 14);
  assert.equal(preview.ready, true);
  assert.equal(preview.profile.attributes.find(attribute => attribute.key === 'wisdom').score, 16);
  assert.equal(preview.profile.hitPoints.maximumOverride, 34);
  assert.equal(preview.profile.hitPoints.current, 34);
  assert.deepEqual(preview.profile.resources.find(resource => resource.id === 'mana'), {
    id: 'mana', name: 'Mana', current: 7, maximum: 9, recovery: 'manual', scope: 'persistent', category: '', icon: '', notes: ''
  });
  assert.equal(preview.profile.skills.find(skill => skill.name === 'Fährtenlesen')?.attributeKey, 'wisdom');
  assert.equal(preview.profile.abilities[0].usesCurrent, 2);
  assert.equal(preview.profile.magic.enabled, true);
  assert.equal(preview.profile.magic.spells[0].damageFormula, undefined);
  assert.equal(preview.profile.magic.spells[0].rollFormula, '2d6');
});

test('vergibt Attributspunkte nur auf 4, 8, 12, 16 und 20 sowie vier Punkte je Sonderstufe', () => {
  assert.equal(getLevelUpAttributePointAllowance({ progression: { level: 2 } }), 0);
  assert.equal(getLevelUpAttributePointAllowance({ progression: { level: 3 } }), 2);
  assert.equal(getLevelUpAttributePointAllowance({ progression: { level: 7 } }), 2);
  assert.equal(getLevelUpAttributePointAllowance({ progression: { level: 20, specialLevels: 0 } }), 4);

  const levelThree = sanitizeCharacterCombatProfile({ progression: { level: 3 } });
  const missingPoints = previewCharacterLevelUp(levelThree, createCharacterLevelUpPlan(levelThree));
  assert.equal(missingPoints.ready, false);
  assert.match(missingPoints.errors[0], /genau 2 Attributspunkte/);
  const balancedPlan = createCharacterLevelUpPlan(levelThree);
  balancedPlan.attributeIncreases.strength = 1;
  balancedPlan.attributeIncreases.dexterity = 1;
  const balanced = previewCharacterLevelUp(levelThree, balancedPlan);
  assert.equal(balanced.ready, true);
  assert.equal(balanced.profile.attributes.find(attribute => attribute.key === 'strength').score, 11);
  assert.equal(balanced.profile.attributes.find(attribute => attribute.key === 'dexterity').score, 11);
});

test('der erste Aura-Fokuspunkt wird ab normaler Stufe sechs freigeschaltet', () => {
  const before = sanitizeCharacterCombatProfile({ progression: { level: 5 } });
  assert.deepEqual(
    [before.resources.find(resource => resource.id === 'aura-focus').current, before.resources.find(resource => resource.id === 'aura-focus').maximum],
    [0, 0]
  );
  const after = sanitizeCharacterCombatProfile({ progression: { level: 6 }, resources: before.resources });
  assert.deepEqual(
    [after.resources.find(resource => resource.id === 'aura-focus').current, after.resources.find(resource => resource.id === 'aura-focus').maximum],
    [1, 1]
  );
});

test('berechnet Trefferpunkte aus Trefferwürfel, Konstitution und Stufe', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 3 },
    attributes: [{ key: 'constitution', score: 14 }],
    hitPoints: { hitDie: 8, maximumOverride: null }
  });
  assert.equal(getMaximumHitPoints(profile), 24);
  profile.hitPoints.maximumOverride = 31;
  assert.equal(getMaximumHitPoints(profile), 31);
});

test('leitet Attributsmodifikatoren ab, lässt aber bewusste Überschreibungen zu', () => {
  assert.equal(getAttributeModifier({ score: 18, modifierOverride: null }), 4);
  assert.equal(getAttributeModifier({ score: 18, modifierOverride: -2 }), -2);
});

test('berechnet Rüstungsklasse aus Rüstung, Geschick und aktiven Effekten', () => {
  const profile = sanitizeCharacterCombatProfile({
    attributes: [{ key: 'dexterity', score: 16 }],
    armorClass: { base: 10, magicModifier: 1 },
    armorItems: [
      { id: 'leather', name: 'Leder', kind: 'armor', baseArmorClass: 11, dexterityMode: 'full', equipped: true },
      { id: 'shield', name: 'Schild', kind: 'shield', armorClassBonus: 2, equipped: true }
    ],
    conditions: [{ id: 'blessing', name: 'Segen', active: true, mechanics: { armorClass: 1 } }]
  });
  assert.equal(getArmorClass(profile), 18);
});

test('berechnet frei angelegte Fertigkeiten mit Training, Expertise und Effekten', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 5 },
    attributes: [{ key: 'dexterity', score: 18 }],
    skills: [{ id: 'stealth', name: 'Heimlichkeit', attributeKey: 'dexterity', proficiency: 'expertise', bonus: 1 }],
    quirks: [{ id: 'quiet', name: 'Leise Sohlen', active: true, mechanics: { skill: 2 } }]
  });
  assert.equal(getSkillTotal(profile, 'stealth'), 13);
});

test('berechnet passive Wahrnehmung aus der vollständigen Wahrnehmungs-Fertigkeit', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 5 },
    attributes: [{ key: 'wisdom', score: 16 }],
    combat: { passivePerceptionBonus: 1 },
    skills: [{ id: 'perception', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 2 }],
    conditions: [{ id: 'alert', name: 'Wachsam', active: true, mechanics: { skill: 1 } }]
  });
  assert.equal(getSkillTotal(profile, 'perception'), 9);
  assert.equal(getPassivePerception(profile), 20);
  assert.equal(resolveCharacterCombatProfile({ combatProfile: profile }).passivePerception, 20);
});

test('übernimmt Waffen und Rüstungen aus dem Inventar als editierbare Ausgangswerte', () => {
  const source = {
    inventory: { items: [
      { id: 'sword', category: 'weapon', name: 'Silberklinge', description: 'Geweihtes Familienerbstück.', combatDefinition: { damageFormula: '1W8', attackBonus: 2 } },
      { id: 'mail', category: 'armor', name: 'Kettenhemd', description: 'Im Wasser besonders schwer.', attributes: [{ label: 'Schutz', value: 4 }] }
    ] }
  };
  const weapon = getCharacterCombatInventoryOptions(source, 'weapon')[0];
  const armor = getCharacterCombatInventoryOptions(source, 'armor')[0];
  assert.equal(weapon.inventoryItemId, 'sword');
  assert.equal(weapon.damageFormula, '1d8');
  assert.equal(weapon.attackBonus, 2);
  assert.equal(weapon.notes, 'Geweihtes Familienerbstück.');
  assert.equal(armor.inventoryItemId, 'mail');
  assert.equal(armor.armorClassBonus, 4);
  assert.equal(armor.notes, 'Im Wasser besonders schwer.');
});

test('stellt einen simplen Nahkampf bereit und verlangt keinen Kampfmodus oder Initiativewert', () => {
  const actor = resolveCombatProfile(character('actor'));
  const target = resolveCombatProfile(character('target'));
  assert.equal(validateCombatActorProfile(actor).ready, true);
  assert.equal(validateCombatTargetProfile(target).ready, true);
  const blank = resolveCombatProfile(character('blank', { weapons: [] }));
  assert.equal(validateCombatActorProfile(blank).ready, true);
  assert.equal(blank.weapon.name, 'Nahkampf');
  const armed = sanitizeCharacterCombatProfile({ weapons: [{ id: 'sword', name: 'Langschwert', damageFormula: '1W8', weaponType: 'sword', equipped: true }] });
  assert.equal(armed.weapons.some(weapon => weapon.id === 'default-unarmed-melee'), true);
  assert.equal(armed.weapons.find(weapon => weapon.id === 'sword').equipped, true);
  assert.equal(validateCombatTargetProfile(resolveCombatProfile(character('blank', { armorClass: { override: 0 } }))).ready, true);
});

test('normale Waffen dürfen ihre Aktions- und Zusatzkosten frei definieren', () => {
  const actor = resolveCombatProfile(character('actor', {
    weapons: [{
      id: 'quick-blade', name: 'Schnelle Klinge', damageFormula: '1W6', weaponType: 'sword', equipped: true,
      activationType: 'bonus-action',
      costs: [{ resourceId: 'bonus-action', amount: 1 }, { resourceId: 'mana-focus', amount: 2 }]
    }],
    resources: [{ id: 'mana-focus', name: 'Fokus', current: 4, maximum: 4 }]
  }), { actionId: 'weapon:quick-blade' });
  assert.deepEqual(actor.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['bonus-action', 1], ['mana-focus', 2]]);
});

test('wählt Waffe oder vorbereiteten Zauber ausdrücklich aus dem Profil', () => {
  const source = character('actor', {
    attributes: [{ key: 'intelligence', score: 16 }],
    weapons: [
      { id: 'sword', name: 'Langschwert', damageFormula: '1W8', attackAttribute: 'strength', proficient: true, equipped: true },
      { id: 'dagger', name: 'Dolch', damageFormula: '1W4', attackAttribute: 'dexterity', proficient: true, equipped: false }
    ],
    magic: {
      enabled: true,
      castingAttribute: 'intelligence',
      spells: [{ id: 'ember', name: 'Glutlanze', rollFormula: '2W6', level: 1, manaCost: 2, prepared: true }]
    }
  });
  const dagger = resolveCombatProfile(source, { actionId: 'weapon:dagger' });
  const spell = resolveCombatProfile(source, { actionId: 'spell:ember' });
  assert.equal(dagger.weapon.name, 'Dolch');
  assert.equal(dagger.profileActionKind, 'weapon');
  assert.equal(spell.weapon.name, 'Glutlanze');
  assert.equal(spell.weapon.damageFormula, '2d6');
  assert.equal(spell.profileActionKind, 'spell');
  assert.equal(spell.attackModifier, 5);
  assert.deepEqual(spell.actions.map(action => action.kind), [
    'weapon', 'weapon', 'weapon', 'spell',
    'equipment-switch', 'equipment-switch', 'equipment-switch'
  ]);
});

test('ordnet Gebete als eigene magische Blase und Auswertung zu', () => {
  const source = character('actor', {
    magic: {
      enabled: true,
      spells: [{ id: 'oath', name: 'Schwur des Lichts', presentationKind: 'prayer', rollFormula: '1W8', prepared: true }]
    }
  });
  const prayer = resolveCombatProfile(source, { actionId: 'spell:oath', segmentKind: 'prayer' });
  assert.equal(prayer.profileActionKind, 'prayer');
  assert.equal(prayer.selectedAction.kindLabel, 'Gebet');
  assert.deepEqual(prayer.selectedAction.segmentKinds, ['prayer']);
  assert.equal(resolveCombatProfile(source, { segmentKind: 'spell' }).actions.some(action => action.id === 'spell:oath'), false);
});

test('baut normale, Vorteil- und Nachteilwürfe', () => {
  assert.equal(buildAttackNotation(5, 'normal'), '1d20+5');
  assert.equal(buildAttackNotation(5, 'advantage'), '2d20kh1+5');
  assert.equal(buildAttackNotation(-2, 'disadvantage'), '2d20kl1-2');
});

test('aktive Zustände steuern den Angriffswurf und Vorteil und Nachteil heben sich auf', () => {
  const advantage = sanitizeCharacterCombatProfile({
    conditions: [{ id: 'blessed', active: true, mechanics: { attackRollMode: 'advantage' } }]
  });
  assert.equal(resolveAttackRollMode(advantage, 'normal'), 'advantage');
  assert.equal(resolveAttackRollMode(advantage, 'disadvantage'), 'normal');
});

test('akzeptiert W-Schreibweise und verdoppelt bei kritischem Treffer nur Schadenswürfel', () => {
  assert.deepEqual(parseDamageFormula('1W8+1'), { diceCount: 1, sides: 8, fixedModifier: 1, notation: '1d8+1' });
  assert.equal(buildDamageNotation('1W8+1', 3, true), '2d8+4');
  assert.deepEqual(parseDamageFormula('1W10+1W4'), {
    diceCount: 2,
    sides: null,
    fixedModifier: 0,
    notation: '1d10+1d4',
    terms: [{ diceCount: 1, sides: 10 }, { diceCount: 1, sides: 4 }]
  });
  assert.equal(buildDamageNotation('1W10+1W4', 0, true), '2d10+2d4');
});

test('wertet Gleichstand, natürliche Eins und natürliche Zwanzig korrekt aus', () => {
  assert.equal(evaluateAttackRoll({ natural: 10, total: 14 }, 14).hit, true);
  assert.equal(evaluateAttackRoll({ natural: 1, total: 99 }, 14).hit, false);
  assert.equal(evaluateAttackRoll({ natural: 20, total: 5 }, 99).hit, true);
});

test('erzeugt Treffer und Schaden aus den vollständig abgeleiteten Charakterprofilen', async () => {
  const dice = new FakeDiceAdapter({ natural: 13, total: 19 });
  const phases = [];
  const result = await new CombatResolutionService(dice).resolveAttack({
    actor: resolveCombatProfile(character('actor')),
    target: resolveCombatProfile(character('target')),
    description: 'Alwyn zieht die Klinge in einem flachen Bogen herum.',
    rollMode: 'normal'
  }, { onPhase: phase => phases.push(phase.phase) });
  assert.equal(result.schemaVersion, 4);
  assert.equal(result.attack.hit, true);
  assert.equal(result.attack.modifier, 6);
  assert.equal(result.attack.targetDefense, 14);
  assert.equal(result.damage.total, 9);
  assert.deepEqual(phases, ['attack', 'damage']);
  assert.equal(dice.damageCalls[0].bonus, 5);
});

test('übergibt wirklich alle Kampfbogen-Kategorien als verbindlichen KI-Snapshot', () => {
  const source = character('actor', {
    identity: { background: 'Ehemalige Tempelwache' },
    attributes: [{ key: 'strength', score: 14, shortLabel: 'STÄ' }],
    combat: { attackBonus: 1, damageBonus: 2, passivePerceptionBonus: 0 },
    resources: [{ id: 'mana', name: 'Mana', current: 4, maximum: 9 }],
    techniques: [{ id: 'riposte', name: 'Riposte', activationType: 'reaction', weaponTypes: ['sword'], aiInstructions: 'Als unmittelbare Gegenbewegung erzählen.' }],
    quirks: [{ id: 'quirk', name: 'Hitzkopf', description: 'Stürmt vor.', active: true, mechanics: { initiative: 2, savingThrow: 1, spellAttack: 1, spellSaveDc: 1 } }],
    conditions: [{ id: 'condition', name: 'Geblendet', active: true }],
    abilities: [{ id: 'ability', name: 'Falkenauge', active: true }],
    magic: { enabled: true, spells: [{ id: 'spell', name: 'Funkenlanze' }] },
    aura: { enabled: true, domain: 'Eiserner Wille', latentPresence: { enabled: true, active: true, enemyMechanics: { savingThrow: -1 } } },
    notes: 'Silber richtet keinen Schaden an.'
  });
  const snapshot = buildCombatProfileAiSnapshot(source);
  assert.equal(snapshot.character.identity.background, 'Ehemalige Tempelwache');
  assert.equal(snapshot.attributes[0].shortLabel, 'STÄ');
  assert.equal(snapshot.combatModifiers.passivePerceptionBonus, 0);
  assert.equal(snapshot.coreResources[0].name, 'Mana');
  assert.equal(snapshot.actionEconomy.some(resource => resource.id === 'action'), true);
  assert.equal(snapshot.techniquesAndForms[0].name, 'Riposte');
  assert.equal(snapshot.quirksAndTraits[0].name, 'Hitzkopf');
  assert.equal(snapshot.conditionsAndEffects[0].name, 'Geblendet');
  assert.equal(snapshot.specialAbilities[0].name, 'Falkenauge');
  assert.equal(snapshot.magic.spells[0].name, 'Funkenlanze');
  assert.equal(snapshot.auraPresenceAndDomain.domain, 'Eiserner Wille');
  assert.equal(snapshot.notesAndSpecialRules, 'Silber richtet keinen Schaden an.');
  assert.equal(snapshot.quirksAndTraits[0].mechanics.initiative, 2);
  assert.match(snapshot.instruction, /nicht doppelt addiert/);
});

test('priorisiert beide vollständigen Kampfbögen im KI-Retrieval', () => {
  const enriched = combatNarrationInternals.enrichCombatNarrationRetrieval({
    promptContext: 'Szenenkontext',
    chunks: [{ sourceType: 'character-profile', text: 'Weitere Figurendaten' }],
    stats: {}
  }, {
    actorId: 'actor', targetId: 'target', actor: 'Alwyn',
    actorCombatProfile: { conditionsAndEffects: [{ name: 'Geblendet' }] },
    targetCombatProfile: { armor: [{ name: 'Kettenhemd' }] }
  });
  assert.equal(enriched.chunks[0].sourceType, 'combat-profile-snapshots');
  assert.equal(enriched.stats.requiredCombatProfilesIncluded, true);
  assert.match(enriched.promptContext, /Geblendet/);
  assert.match(enriched.promptContext, /Kettenhemd/);
});

test('hält den Kampferzählauftrag vollständig innerhalb des Backend-Limits', () => {
  const query = combatNarrationInternals.buildCombatNarrationQuery({
    actor: 'Alwyn', target: 'Der Aschenwurm', weapon: 'Langschwert', hit: true,
    critical: false, criticalFailure: false, damage: 9,
    originalDescription: 'Sehr lange Kampfbeschreibung '.repeat(200)
  });
  assert.ok(query.length <= 1180);
  assert.match(query, /Bestätigte Fakten:/);
  assert.doesNotThrow(() => JSON.parse(query.slice(query.indexOf('{'))));
});

test('eine Auswertung verändert Trefferpunkte des Zielprofils nicht still', async () => {
  const targetCharacter = character('target');
  const before = targetCharacter.combatProfile.hitPoints.current;
  const dice = new FakeDiceAdapter({ natural: 15, total: 21 });
  const result = await new CombatResolutionService(dice).resolveAttack({
    actor: resolveCombatProfile(character('actor')),
    target: resolveCombatProfile(targetCharacter),
    description: 'Ein Treffer.',
    rollMode: 'normal'
  });
  assert.equal(targetCharacter.combatProfile.hitPoints.current, before);
  assert.equal(result.targetSnapshot.currentHitPoints, before);
  assert.equal(result.targetSnapshot.hitPointsBefore, before);
  assert.equal(result.targetSnapshot.hitPointsAfter, before - result.damage.total);
  assert.equal(result.targetSnapshot.defeated, false);
});

test('Schaden verbraucht temporaere TP vor den regulaeren Trefferpunkten', () => {
  const applied = applyCombatDamage({ current: 18, maximum: 20, temporary: 5 }, 9);
  assert.deepEqual(applied.before, { current: 18, maximum: 20, temporary: 5 });
  assert.deepEqual(applied.after, { current: 14, maximum: 20, temporary: 0 });
  assert.equal(applied.absorbedByTemporary, 5);
  assert.equal(applied.hitPointDamage, 4);
});

test('gespeicherte Kampfauswertungen bilden eine fortlaufende TP-Kette', () => {
  const first = patchResolutionHitPointState({
    targetId: 'ziel', damage: { total: 7 }, targetSnapshot: { maximumHitPoints: 20 }
  }, { current: 20, maximum: 20, temporary: 0 });
  const second = patchResolutionHitPointState({
    targetId: 'ziel', damage: { total: 6 }, targetSnapshot: { maximumHitPoints: 20 }
  }, { current: first.targetSnapshot.hitPointsAfter, maximum: 20, temporary: 0 });
  const states = deriveCombatStateFromComments([{ commentSegments: [
    { combatResolution: first }, { combatResolution: second }
  ] }]);
  assert.equal(first.targetSnapshot.hitPointsAfter, 13);
  assert.equal(second.targetSnapshot.hitPointsBefore, 13);
  assert.equal(states.get('ziel').current, 7);
});

test('Ressourcenkosten werden als nachvollziehbare Vorher-Nachher-Aenderung gebucht', () => {
  const applied = applyCombatResourceCosts([
    { id: 'mana', name: 'Mana', current: 8, maximum: 10 },
    { id: 'mut', name: 'Mut', current: 2, maximum: 3 }
  ], [{ resourceId: 'mana', name: 'Mana', amount: 3 }]);
  assert.equal(applied.sufficient, true);
  assert.equal(applied.after.find(resource => resource.id === 'mana').current, 5);
  assert.deepEqual(applied.changes[0], {
    resourceId: 'mana', name: 'Mana', amount: 3, before: 8, after: 5, maximum: 10, scope: 'persistent'
  });
  assert.equal(applyCombatResourceCosts(applied.after, [{ resourceId: 'mana', amount: 9 }]).sufficient, false);
});

test('fasst Mehrfachkosten derselben Ressource zusammen statt sie zu unterbuchen', () => {
  const applied = applyCombatResourceCosts(
    [{ id: 'mana', name: 'Mana', current: 3, maximum: 3 }],
    [{ resourceId: 'mana', amount: 2 }, { resourceId: 'mana', amount: 2 }]
  );
  assert.equal(applied.sufficient, false);
  assert.equal(applied.missing.amount, 4);
});

test('persistiert neu migrierte Tagesressourcen, ohne Kommentarressourcen dauerhaft zu verbuchen', () => {
  const persisted = getPersistentCombatResources(
    [{ id: 'mana', name: 'Mana', current: 3, maximum: 5, scope: 'persistent', recovery: 'day' }],
    [
      { id: 'mana', name: 'Mana', current: 2, maximum: 5, scope: 'persistent', recovery: 'day' },
      { id: 'special-action', name: 'Besondere Aktion', current: 1, maximum: 2, scope: 'persistent', recovery: 'day' },
      { id: 'action', name: 'Aktion', current: 0, maximum: 1, scope: 'comment' }
    ]
  );
  assert.equal(persisted.find(resource => resource.id === 'mana')?.current, 2);
  assert.equal(persisted.find(resource => resource.id === 'special-action')?.current, 1);
  assert.equal(persisted.some(resource => resource.id === 'action'), false);
});

test('füllt Aktionsressourcen für jeden neuen Gesamtkommentar wieder auf', () => {
  const depleted = [
    { id: 'action', name: 'Aktion', current: 0, maximum: 1, scope: 'comment' },
    { id: 'mana', name: 'Mana', current: 4, maximum: 8, scope: 'persistent' }
  ];
  assert.deepEqual(resetCommentScopedResources(depleted).map(resource => resource.current), [1, 4]);
  const comments = [{ id: 'c1', commentSegments: [{ combatResolution: {
    actorId: 'actor',
    targetId: 'target',
    targetSnapshot: { hitPointsAfter: 9, maximumHitPoints: 10 },
    actorResourceSnapshot: { after: depleted }
  }}] }, { id: 'c2', commentSegments: [{ kind: 'speech', text: 'Weiter.' }] }];
  assert.equal(deriveCombatStateFromComments(comments).get('actor').resources.find(resource => resource.id === 'action').current, 1);
  assert.equal(deriveCombatStateFromComments(comments).get('actor').resources.find(resource => resource.id === 'mana').current, 4);
});

test('behält besondere Aktionen zwischen Kommentaren und füllt Tagesressourcen erst am Folgetag auf', () => {
  const special = COMBAT_ACTION_RESOURCE_DEFINITIONS.find(resource => resource.id === 'special-action');
  assert.deepEqual({ current: special.current, maximum: special.maximum, scope: special.scope, recovery: special.recovery }, {
    current: 2, maximum: 2, scope: 'persistent', recovery: 'day'
  });
  const resources = [{ id: 'special-action', name: 'Besondere Aktion', current: 1, maximum: 2, scope: 'persistent', recovery: 'day', recoveryDayKey: 'aleria:1-1-1' }];
  assert.equal(resetCommentScopedResources(resources)[0].current, 1);
  assert.equal(recoverDailyCombatResources(resources, 'aleria:1-1-1')[0].current, 1);
  assert.equal(recoverDailyCombatResources(resources, 'aleria:1-1-2')[0].current, 2);
});

test('migriert Schicksalspunkte zu celestialen Punkten und ergänzt infernale Tagespunkte', () => {
  const profile = sanitizeCharacterCombatProfile({ resources: [{ id: 'fate-points', name: 'Schicksalspunkte', current: 2, maximum: 3 }] });
  const celestial = profile.resources.find(resource => resource.id === 'celestial-points');
  const infernal = profile.resources.find(resource => resource.id === 'infernal-points');
  assert.deepEqual([celestial.name, celestial.current, celestial.maximum, celestial.recovery], ['Celestiale Punkte', 2, 3, 'day']);
  assert.equal(infernal.recovery, 'day');
  assert.equal(profile.resources.some(resource => resource.id === 'fate-points'), false);
});

test('legacy daily resources without a day key initialize exactly once', () => {
  const resources = [{ id: 'mana', current: 0, maximum: 8, scope: 'persistent', recovery: 'day' }];
  const recovered = recoverDailyCombatResources(resources, 'scene:test:day-3');
  assert.equal(recovered[0].current, 8);
  assert.equal(recovered[0].recoveryDayKey, 'scene:test:day-3');
  assert.equal(recoverDailyCombatResources([{ ...recovered[0], current: 3 }], 'scene:test:day-3')[0].current, 3);
});

test('Techniken werden nur mit einer passenden aktiven Waffenart freigeschaltet', () => {
  const technique = { name: 'Mordhau', weaponTypes: ['sword'] };
  assert.equal(isTechniqueCompatibleWithWeapon(technique, { id: 'blade', weaponType: 'sword' }), true);
  assert.equal(isTechniqueCompatibleWithWeapon(technique, { id: 'bow', weaponType: 'bow' }), false);
});

test('Aura-Fokus ersetzt reguläre Aktions-, Mana- und Slotkosten vollständig', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 6 },
    resources: [{ id: 'mana', name: 'Mana', current: 9, maximum: 9 }],
    aura: { enabled: true, focusResourceId: 'aura-focus', focusBypassCost: 2 }
  });
  const action = { costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'mana', amount: 4 }], auraBypass: { allowed: true, cost: 2 } };
  assert.deepEqual(getActionPaymentCosts(action, 'aura', profile).map(cost => [cost.resourceId, cost.amount]), [['aura-focus', 2]]);
  assert.deepEqual(getActionPaymentCosts(action, 'standard', profile).map(cost => [cost.resourceId, cost.amount]), [['action', 1], ['mana', 4]]);
});

test('Aura-Fokus ersetzt die Aktion, aber nicht die begrenzte Nutzung einer Technik', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 6 },
    resources: [{
      id: 'technique-uses', name: 'Techniknutzungen', current: 2, maximum: 2,
      category: 'technique-use', scope: 'persistent', recovery: 'day'
    }],
    aura: { enabled: true, focusResourceId: 'aura-focus', focusBypassCost: 1 }
  });
  const action = {
    costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'technique-uses', amount: 1 }],
    auraBypass: { allowed: true, cost: 1 }
  };
  assert.deepEqual(
    getActionPaymentCosts(action, 'aura', profile).map(cost => [cost.resourceId, cost.amount]),
    [['aura-focus', 1], ['technique-uses', 1]]
  );
});

test('nicht freigeschaltete Aura- und Cheat-Zahlungen können keine Kosten umgehen', () => {
  const profile = sanitizeCharacterCombatProfile({
    aura: { enabled: false },
    cheats: { enabled: false }
  });
  const action = { activationType: 'action', auraBypass: { allowed: true, cost: 1 } };
  assert.equal(getActionPaymentCosts(action, 'aura', profile)[0].resourceId, '__invalid-aura-payment__');
  assert.equal(getActionPaymentCosts(action, 'cheat', profile)[0].resourceId, '__invalid-cheat-payment__');
});

test('latente Aura liefert strukturierte Debuffs für gegnerische Kampfwerte', () => {
  const mechanics = getAuraOpponentMechanics({
    aura: { enabled: true, latentPresence: { enabled: true, active: true, enemyMechanics: { attack: -2, armorClass: -1, savingThrow: -3 } } }
  });
  assert.equal(mechanics.attack, -2);
  assert.equal(mechanics.armorClass, -1);
  assert.equal(mechanics.savingThrow, -3);
});

test('Aura unterscheidet Verbündete und Gegner und respektiert ihren Radius', () => {
  const source = {
    aura: {
      enabled: true,
      latentPresence: {
        enabled: true,
        active: true,
        target: 'Verbündete und Gegner',
        radius: '9 m',
        allyMechanics: { attack: 2 },
        enemyMechanics: { attack: -2 }
      }
    }
  };
  assert.equal(parseAuraRadiusMeters('30 ft').toFixed(2), '9.14');
  assert.equal(getAuraTargetMechanics(source, { relation: 'ally', distanceMeters: 5 }).attack, 2);
  assert.equal(getAuraTargetMechanics(source, { relation: 'enemy', distanceMeters: 5 }).attack, -2);
  assert.equal(getAuraTargetMechanics(source, { relation: 'ally', distanceMeters: 12 }).attack, 0);
  assert.equal(getAuraTargetMechanics(source, { relation: 'ally' }).attack, 0);
});

test('latente Präsenz kann dem gegnerischen Angriff Nachteil geben', async () => {
  const actor = resolveCombatProfile(character('actor'));
  const target = resolveCombatProfile(character('target', {
    aura: {
      enabled: true,
      latentPresence: { enabled: true, active: true, enemyMechanics: { attackRollMode: 'disadvantage' } }
    }
  }));
  const dice = new FakeDiceAdapter({ natural: 12, total: 16 });
  const resolution = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(dice.attackCalls[0].rollMode, 'disadvantage');
  assert.equal(resolution.attack.rollMode, 'disadvantage');
});

test('Zauberformeln würfeln Rettung gegen den Zauber-SG des Akteurs', async () => {
  const actor = resolveCombatProfile(character('actor', {
    attributes: [{ key: 'intelligence', score: 18 }],
    magic: { enabled: true, castingAttribute: 'intelligence', spells: [{ id: 'brand', name: 'Brandmal', rollFormula: '2W6', resolutionType: 'saving-throw', saveAttribute: 'dexterity', prepared: true }] }
  }), { actionId: 'spell:brand', segmentKind: 'spell' });
  const target = resolveCombatProfile(character('target'));
  const resolution = await new CombatResolutionService(new FakeDiceAdapter({ natural: 15, total: 15 })).resolveAttack({ actor, target });
  assert.equal(resolution.attack.resolutionMode, 'saving-throw');
  assert.equal(resolution.attack.saveAttribute, 'dexterity');
  assert.equal(resolution.attack.saveSucceeded, true);
  assert.equal(resolution.attack.hit, false);
});

test('ein natürlicher Rettungswurf von eins erzeugt keinen kritischen Schaden', async () => {
  const actor = resolveCombatProfile(character('actor', {
    attributes: [{ key: 'intelligence', score: 18 }],
    magic: {
      enabled: true,
      castingAttribute: 'intelligence',
      spells: [{
        id: 'brand', name: 'Brandmal', rollFormula: '2W6', resolutionType: 'saving-throw',
        saveAttribute: 'dexterity', prepared: true
      }]
    }
  }), { actionId: 'spell:brand', segmentKind: 'spell' });
  const target = resolveCombatProfile(character('target'));
  const dice = new FakeDiceAdapter({ natural: 1, total: 1 });
  const resolution = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(resolution.attack.saveSucceeded, false);
  assert.equal(resolution.attack.hit, true);
  assert.equal(resolution.attack.criticalSuccess, false);
  assert.equal(resolution.attack.criticalFailure, false);
  assert.equal(dice.damageCalls[0].critical, false);
});

test('ein Zauber mit Slotkosten ist ohne konkrete Zauberplatz-Ressource gesperrt', () => {
  const magic = {
    enabled: true,
    castingAttribute: 'intelligence',
    spells: [{
      id: 'sealed', name: 'Versiegelte Flamme', rollFormula: '2W6', prepared: true,
      level: 1, slotCost: 1, slotResourceId: 'unbekannter-slot'
    }]
  };
  const actor = resolveCombatProfile(character('actor', { magic }), {
    actionId: 'spell:sealed', segmentKind: 'spell'
  });
  const validation = validateCombatActorProfile(actor);
  assert.equal(actor.selectedAction.compatible, false);
  assert.equal(validation.ready, false);
  assert.ok(validation.missingFields.includes('incompatibleAction'));
});

test('ein Zauber mit gültigem Slot zieht den Zauberplatz in seine Kosten ein', () => {
  const actor = resolveCombatProfile(character('actor', {
    resources: [{
      id: 'slot-1', name: 'Zauberplatz I', current: 1, maximum: 1,
      category: 'magic', scope: 'persistent'
    }],
    magic: {
      enabled: true,
      castingAttribute: 'intelligence',
      slotResourceIds: ['slot-1'],
      spells: [{
        id: 'flame', name: 'Flamme', rollFormula: '2W6', prepared: true,
        level: 1, slotCost: 1, slotResourceId: 'slot-1'
      }]
    }
  }), { actionId: 'spell:flame', segmentKind: 'spell' });
  assert.equal(actor.selectedAction.compatible, true);
  assert.equal(validateCombatActorProfile(actor).ready, true);
  assert.equal(actor.resourceCosts.find(cost => cost.resourceId === 'slot-1')?.amount, 1);
});

test('Zaubertricks kosten 1 Mana und Zaubergrade I bis X erhalten eigene Langrast-Plätze', () => {
  const profile = sanitizeCharacterCombatProfile({
    magic: {
      enabled: true,
      spells: [
        { id: 'spark', name: 'Funke', level: 0, rollFormula: '1W4', manaCost: 9, slotCost: 2, prepared: true },
        { id: 'gate', name: 'Weltenpforte', level: 18, rollFormula: '4W10', manaCost: 5, prepared: true }
      ]
    }
  });
  const slots = getOrderedSpellSlotResources(profile.resources, profile.magic.slotResourceIds);
  assert.equal(COMBAT_SPELL_SLOT_DEFINITIONS.length, 10);
  assert.deepEqual(slots.map(slot => [slot.spellLevel, slot.recovery]), Array.from({ length: 10 }, (_entry, index) => [index + 1, 'long-rest']));
  assert.equal(profile.magic.spells[0].manaCost, 1);
  assert.equal(profile.magic.spells[0].slotCost, 0);
  assert.equal(profile.magic.spells[0].slotResourceId, '');
  assert.equal(profile.magic.spells[1].level, 10);
  assert.equal(profile.magic.spells[1].slotResourceId, getSpellSlotResourceId(10));
  assert.equal(getSpellLevelLabel(0), 'Zaubertrick');
  assert.equal(getSpellLevelLabel(10), 'Grad X');

  const migratedPaidSpell = sanitizeCharacterCombatProfile({
    magic: { enabled: true, spells: [{ id: 'legacy', name: 'Alter Zauber', manaCost: 2, rollFormula: '1W6' }] }
  }).magic.spells[0];
  assert.equal(migratedPaidSpell.level, 1);
  assert.equal(migratedPaidSpell.slotResourceId, getSpellSlotResourceId(1));

  const cantrip = resolveCombatProfile(character('mage', { magic: profile.magic, resources: profile.resources }), {
    actionId: 'spell:spark', segmentKind: 'spell'
  });
  assert.equal(cantrip.selectedAction.isCantrip, true);
  assert.deepEqual(cantrip.resourceCosts.map(cost => cost.resourceId), ['action', 'mana-focus']);
});

test('Mana, Aura-Fokus und Zaubergrad-Freischaltung wachsen automatisch mit der Stufe', () => {
  const level1 = sanitizeCharacterCombatProfile({ progression: { level: 1 }, magic: { enabled: true, casterTier: 'full' } });
  assert.equal(level1.resources.find(resource => resource.id === 'mana-focus').maximum, 14);
  assert.equal(level1.resources.find(resource => resource.id === 'aura-focus').maximum, 0);
  assert.equal(level1.resources.find(resource => resource.id === 'spell-slot-1').maximum, 1, 'Grad I ist ab Stufe 1 freigeschaltet');
  assert.equal(level1.resources.find(resource => resource.id === 'spell-slot-2').maximum, 0, 'Grad II ist noch nicht freigeschaltet');

  const level8Half = sanitizeCharacterCombatProfile({ progression: { level: 8 }, magic: { enabled: true, casterTier: 'half' } });
  assert.equal(level8Half.resources.find(resource => resource.id === 'spell-slot-2').maximum, 1, 'Grad II ist seit Stufe 5 freigeschaltet');
  assert.equal(level8Half.resources.find(resource => resource.id === 'spell-slot-3').maximum, 0, 'Grad III schaltet sich erst bei Stufe 9 frei');

  const level9Half = sanitizeCharacterCombatProfile({ progression: { level: 9 }, magic: { enabled: true, casterTier: 'half' } });
  assert.equal(level9Half.resources.find(resource => resource.id === 'mana-focus').maximum, 31);
  assert.equal(level9Half.resources.find(resource => resource.id === 'aura-focus').maximum, 1);
  assert.equal(level9Half.resources.find(resource => resource.id === 'spell-slot-3').maximum, 1, 'Grad III ist ab Stufe 9 freigeschaltet');

  const rank30 = sanitizeCharacterCombatProfile({
    progression: { level: 20, specialLevels: 10 },
    magic: { enabled: true, casterTier: 'full' }
  });
  assert.equal(rank30.resources.find(resource => resource.id === 'aura-focus').maximum, 14);
  assert.equal(rank30.resources.find(resource => resource.id === 'mana-focus').maximum, 153 + 10 * 18);

  const noMagic = sanitizeCharacterCombatProfile({ progression: { level: 20 } });
  assert.equal(noMagic.resources.find(resource => resource.id === 'mana-focus').maximum, 0, 'ohne magic.enabled bleibt Mana bei 0');
  assert.equal(noMagic.resources.find(resource => resource.id === 'aura-focus').maximum, 4, 'Aura-Fokus wächst unabhängig von Magie');
});

test('höher gestufte Charaktere behalten manuell erhöhte Ressourcenwerte statt sie abzusenken', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 1 },
    resources: [{ id: 'aura-focus', name: 'Aura-Fokuspunkt', current: 9, maximum: 9 }]
  });
  assert.equal(profile.resources.find(resource => resource.id === 'aura-focus').maximum, 9, 'ein manuell höher gesetztes Maximum wird nie automatisch gesenkt');
});

test('Kleriker- und hexerartige Figuren dürfen Celestiale/Infernale Punkte statt Mana ausgeben', () => {
  const cleric = sanitizeCharacterCombatProfile({
    progression: { level: 10 },
    magic: { enabled: true, casterTier: 'full', bypassResourceId: 'celestial-points' }
  });
  assert.equal(cleric.resources.find(resource => resource.id === 'celestial-points').maximum, 5);
  assert.equal(cleric.resources.find(resource => resource.id === 'infernal-points').maximum, 0, 'nur die hinterlegte Ersatzressource wächst');

  const action = { costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'mana-focus', amount: 8 }] };
  assert.equal(canUseManaSubstitutePayment(action, cleric), true);
  assert.deepEqual(
    getActionPaymentCosts(action, 'mana-substitute', cleric).map(cost => [cost.resourceId, cost.amount]),
    [['action', 1], ['celestial-points', 8]]
  );

  const nonCleric = sanitizeCharacterCombatProfile({ progression: { level: 10 }, magic: { enabled: true, casterTier: 'full' } });
  assert.equal(canUseManaSubstitutePayment(action, nonCleric), false);
  assert.equal(getActionPaymentCosts(action, 'mana-substitute', nonCleric)[0].resourceId, '__invalid-mana-substitute-payment__');
});

test('AleriaGPT erhält Aura-Ersatzregel, Zaubergrade und aktuelle Zauberplätze strukturiert', () => {
  const snapshot = buildCombatProfileAiSnapshot(character('mage', {
    magic: { enabled: true, spells: [{ id: 'spark', name: 'Funke', level: 0, rollFormula: '1W4', prepared: true }] },
    aura: { enabled: true, focusResourceId: 'aura-focus', focusBypassCost: 2 }
  }));
  assert.equal(snapshot.actionEconomy.some(resource => resource.id === 'aura-focus'), true);
  assert.equal(snapshot.actionEconomyRules.auraFocusRule.replacesEntireRegularCostPackage, true);
  assert.equal(snapshot.actionEconomyRules.auraFocusRule.preservesLimitedTechniqueUses, true);
  assert.deepEqual(snapshot.character.progression.advancementRules.normalAttributeIncreaseLevels, [4, 8, 12, 16, 20]);
  assert.equal(snapshot.magic.spellLevelRules.cantrip.spellSlotCost, 0);
  assert.equal(snapshot.magic.spellLevelRules.slotLevels.length, 10);
  assert.equal(snapshot.magic.spellSlots.length, 10);
});

test('eine Figur mit null TP ist nur mit ausdrücklicher Sonderregel handlungsfähig', () => {
  const unconscious = resolveCombatProfile(character('actor', {
    hitPoints: { current: 0, maximumOverride: 20, hitDie: 8 }
  }));
  const exception = resolveCombatProfile(character('actor', {
    hitPoints: { current: 0, maximumOverride: 20, hitDie: 8 },
    combat: { canActAtZeroHitPoints: true }
  }));
  assert.deepEqual(validateCombatActorProfile(unconscious), {
    ready: false,
    missingFields: ['incapacitated']
  });
  assert.equal(validateCombatActorProfile(exception).ready, true);
});

test('Regeln einer Technik gelten automatisch nur für genau diese ausgewählte Technik', async () => {
  const actor = resolveCombatProfile(character('actor', {
    techniques: [{
      id: 'measured-strike', name: 'Abgemessener Hieb', active: true,
      compatibleWeaponIds: ['sword'], damageFormula: '1W8',
      triggerRules: [{
        id: 'measured-bonus', phase: 'pre-roll', recipient: 'actor', sourceRelation: 'self',
        activation: 'passive', frequency: 'always', condition: 'always',
        actionKinds: ['technique'], effects: { attackModifier: 2 }
      }]
    }, {
      id: 'wild-strike', name: 'Wilder Hieb', active: true,
      compatibleWeaponIds: ['sword'], damageFormula: '1W8',
      triggerRules: [{
        id: 'wild-bonus', phase: 'pre-roll', recipient: 'actor', sourceRelation: 'self',
        activation: 'passive', frequency: 'always', condition: 'always',
        actionKinds: ['technique'], effects: { attackModifier: 5 }
      }]
    }]
  }), { actionId: 'technique:measured-strike', segmentKind: 'combataction' });
  const target = resolveCombatProfile(character('target'));
  const resolution = await new CombatResolutionService(new FakeDiceAdapter({ natural: 12, total: 18 }))
    .resolveAttack({ actor, target });
  assert.deepEqual(resolution.ruleApplications.map(rule => rule.ruleId), ['measured-bonus']);
});

test('Spielleiter-Cheat entfernt Kosten und bleibt auch gegen nachträgliche Abwehrregeln erfolgreich', async () => {
  const actor = resolveCombatProfile(character('actor', { cheats: { enabled: true } }));
  const target = resolveCombatProfile(character('target', {
    quirks: [{
      id: 'absolute-dodge', name: 'Unberührbar', active: true,
      triggerRules: [{
        id: 'force-miss', phase: 'post-roll', recipient: 'target', sourceRelation: 'self',
        activation: 'passive', frequency: 'always', condition: 'would-hit',
        actionKinds: ['weapon'], effects: { defenseModifier: 99, outcome: 'force-miss' }
      }]
    }]
  }));
  const resolution = await new CombatResolutionService(new FakeDiceAdapter({ natural: 1, total: -4 })).resolveAttack({ actor, target });
  assert.equal(actor.resourceCosts.length, 0);
  assert.equal(resolution.attack.hit, true);
  assert.equal(resolution.attack.forcedSuccess, true);
  assert.equal(resolution.attack.criticalFailure, false);
});

test('zeigt auch ohne KI-Antwort eine vollstaendige Kampfauswertung', () => {
  assert.equal(combatUiInternals.getEvaluationFallback({ attack: { hit: true } }), 'Der Angriff findet sein Ziel.');
  assert.equal(combatUiInternals.getEvaluationFallback({ attack: { hit: false } }), 'Der Angriff verfehlt sein Ziel.');
  assert.equal(combatUiInternals.getEvaluationLabel({ attack: { resolutionMode: 'saving-throw', saveSucceeded: true } }), 'Rettung gelungen');
  assert.equal(combatUiInternals.getEvaluationFallback({ attack: { resolutionMode: 'saving-throw', saveSucceeded: false } }), 'Das Ziel kann der Wirkung nicht widerstehen.');
  assert.match(
    combatUiInternals.getEvaluationFallback({ attack: { hit: true, criticalSuccess: true } }),
    /voller Wucht/
  );
  assert.equal(combatUiInternals.getNarrationSourceMeta({ source: 'aleria-gpt' }).key, 'aleria-gpt');
  assert.equal(combatUiInternals.getNarrationSourceMeta({ source: 'deterministic' }).key, 'system');
});

test('ruft AleriaGPT fuer eine neue Kampfauswertung tatsaechlich auf', async () => {
  const previousClient = globalThis.AleriaGptClient;
  const previousRetrieval = globalThis.AleriaGptRetrieval;
  let requestedMode = '';
  globalThis.AleriaGptRetrieval = {
    async retrieve() {
      return { promptContext: '', chunks: [], stats: {}, detected: {}, sourceHash: '' };
    }
  };
  globalThis.AleriaGptClient = {
    isConfigured: () => true,
    async sendChat(query, retrieval, options) {
      requestedMode = options.responseMode;
      assert.match(query, /Best/);
      assert.equal(retrieval.stats.requiredCombatProfilesIncluded, true);
      return { ok: true, text: 'Die Klinge zwingt das Ziel einen Schritt zurueck.' };
    }
  };

  try {
    const result = await narrateCombatResolution({
      actorId: 'actor', targetId: 'target', actor: 'Alwyn', target: 'Der Aschenwurm',
      weapon: 'Langschwert', hit: true, critical: false, criticalFailure: false,
      damage: 8, originalDescription: 'Alwyn fuehrt einen kurzen Hieb.',
      actorCombatProfile: {}, targetCombatProfile: {}
    });
    assert.equal(result.source, 'aleria-gpt');
    assert.equal(requestedMode, 'combat-resolution-narration-v2');
  } finally {
    if (previousClient === undefined) delete globalThis.AleriaGptClient;
    else globalThis.AleriaGptClient = previousClient;
    if (previousRetrieval === undefined) delete globalThis.AleriaGptRetrieval;
    else globalThis.AleriaGptRetrieval = previousRetrieval;
  }
});

test('eine strukturierte Zielregel laesst den ersten treffenden Angriff der Szene automatisch scheitern', async () => {
  const actor = resolveCombatProfile(character('actor'));
  const target = resolveCombatProfile(character('target', {
    armorClass: { override: 20 },
    quirks: [{
      id: 'first-dodge', name: 'Erster Schritt zur Seite', active: true,
      triggerRules: [{
        id: 'dodge-first-hit', name: 'Ersten Treffer ausweichen', phase: 'post-roll',
        recipient: 'target', sourceRelation: 'self', activation: 'passive', frequency: 'scene',
        condition: 'would-hit', actionKinds: ['weapon'], effects: { outcome: 'force-miss' }
      }]
    }]
  }));
  const first = await new CombatResolutionService(new FakeDiceAdapter({ natural: 16, total: 22 })).resolveAttack({ actor, target }, {
    relationship: 'enemy', distanceMeters: 1,
    rulePeriods: { comment: 'c1', scene: 'scene-1', day: 'day-1' }
  });
  assert.equal(first.attack.total, 22);
  assert.equal(first.attack.targetDefense, 20);
  assert.equal(first.attack.hit, false);
  assert.equal(first.damage, null);
  assert.equal(first.ruleApplications[0].ruleName, 'Ersten Treffer ausweichen');

  const second = await new CombatResolutionService(new FakeDiceAdapter({ natural: 16, total: 22 })).resolveAttack({ actor, target }, {
    relationship: 'enemy', distanceMeters: 1,
    rulePeriods: { comment: 'c2', scene: 'scene-1', day: 'day-1' },
    usedRuleFrequencyKeys: first.usedRuleFrequencyKeys
  });
  assert.equal(second.attack.hit, true);
  assert.equal(second.ruleApplications.length, 0);
});

test('eine ausgewaehlte verbuendete Reaktion verbessert den Angriff und verbraucht ihre Ressource', async () => {
  const actor = resolveCombatProfile(character('actor'));
  const target = resolveCombatProfile(character('target', { armorClass: { override: 20 } }));
  const helper = resolveCombatProfile(character('guinevere', {
    abilities: [{
      id: 'guiding-call', name: 'Lenkender Ruf', active: true, activationType: 'reaction',
      triggerRules: [{
        id: 'first-attack-plus-two', name: 'Deckung oeffnen', phase: 'post-roll',
        recipient: 'actor', sourceRelation: 'ally', activation: 'reaction', frequency: 'comment',
        condition: 'always', actionKinds: ['weapon'], radiusMeters: 12,
        effects: { attackModifier: 2 }
      }]
    }]
  }));
  const result = await new CombatResolutionService(new FakeDiceAdapter({ natural: 13, total: 19 })).resolveAttack({ actor, target }, {
    relationship: 'enemy', distanceMeters: 1,
    rulePeriods: { comment: 'comment-1', scene: 'scene-1', day: 'day-1' },
    ruleSources: [{
      actorId: helper.characterId, actorName: helper.name, profile: helper, sourceRole: 'support',
      relationToActor: 'ally', relationToTarget: 'enemy', distanceToActor: 5, distanceToTarget: 6,
      selectedRuleIds: ['first-attack-plus-two']
    }]
  });
  assert.equal(result.attack.total, 21);
  assert.equal(result.attack.hit, true);
  assert.equal(result.ruleApplications[0].sourceActorId, 'guinevere');
  assert.deepEqual(result.ruleResourceSnapshots[0].changes.map(change => [change.resourceId, change.before, change.after]), [
    ['reaction', 1, 0]
  ]);
});

test('eine Regel pro Kommentar darf in einem späteren Kommentar erneut auslösen', async () => {
  const actor = resolveCombatProfile(character('actor', {
    quirks: [{
      id: 'steady-hand', name: 'Sichere Hand', active: true,
      triggerRules: [{
        id: 'comment-bonus', phase: 'pre-roll', recipient: 'actor', sourceRelation: 'self',
        activation: 'passive', frequency: 'comment', condition: 'always',
        actionKinds: ['weapon'], effects: { attackModifier: 1 }
      }]
    }]
  }));
  const target = resolveCombatProfile(character('target'));
  const first = await new CombatResolutionService(new FakeDiceAdapter({ natural: 12, total: 18 })).resolveAttack({ actor, target }, {
    rulePeriods: { comment: 'comment-1', scene: 'scene-1', day: 'day-1' }
  });
  const historicalKeys = deriveCombatRuleFrequencyKeys([{
    commentSegments: [{ combatResolution: first }]
  }], { comment: 'comment-2', scene: 'scene-1', day: 'day-1' });
  const second = await new CombatResolutionService(new FakeDiceAdapter({ natural: 12, total: 18 })).resolveAttack({ actor, target }, {
    rulePeriods: { comment: 'comment-2', scene: 'scene-1', day: 'day-1' },
    usedRuleFrequencyKeys: historicalKeys
  });
  assert.equal(first.ruleApplications.length, 1);
  assert.equal(second.ruleApplications.length, 1);
  assert.match(first.ruleApplications[0].usedKey, /comment:comment-1$/);
  assert.match(second.ruleApplications[0].usedKey, /comment:comment-2$/);
});

test('Fertigkeitsregeln veraendern den serverpruefbaren Gesamtwert statt nur den KI-Text', async () => {
  const actor = character('actor', {
    progression: { level: 1 },
    attributes: [{ key: 'charisma', score: 14 }],
    skills: [{ id: 'persuasion', name: 'ueberreden', attributeKey: 'charisma', proficiency: 'trained', bonus: 0 }],
    quirks: [{
      id: 'courtly', name: 'Hoefische Haltung', active: true,
      triggerRules: [{
        id: 'courtly-persuasion', phase: 'pre-roll', recipient: 'actor', sourceRelation: 'self',
        activation: 'passive', frequency: 'always', actionKinds: ['skill'], effects: { skillModifier: 2 }
      }]
    }]
  });
  const dice = new FakeSkillDiceAdapter(9);
  const result = await new SkillResolutionService(dice).resolve({
    actor,
    settings: { skillId: 'persuasion', customModifier: 0, difficulty: 14, rollMode: 'normal' }
  }, { rulePeriods: { comment: 'c1', scene: 's1', day: 'd1' } });
  assert.equal(result.profileModifier, 4);
  assert.equal(result.ruleModifier, 2);
  assert.equal(result.total, 15);
  assert.equal(result.outcome, 'success');
  assert.equal(result.ruleApplications[0].entryName, 'Hoefische Haltung');
});

test('der DnD-Kostenblock zeigt Aura als universelle Aktionsressource und trennt Mana sowie Zauberplätze', () => {
  const actor = {
    resources: [
      { id: 'action', name: 'Aktion', current: 1, maximum: 1 },
      { id: 'bonus-action', name: 'Bonusaktion', current: 1, maximum: 1 },
      { id: 'reaction', name: 'Reaktion', current: 0, maximum: 1 },
      { id: 'special-action', name: 'Besondere Aktion', current: 2, maximum: 2 },
      { id: 'mana-focus', name: 'Mana / Fokus', current: 3, maximum: 5, category: 'magic' },
      { id: 'slot-1', name: 'Zauberplatz I', current: 1, maximum: 2, category: 'magic' }
    ],
    magic: { slotResourceIds: ['slot-1'] },
    aura: { enabled: false },
    cheats: { enabled: false }
  };
  const costs = [
    { resourceId: 'bonus-action', name: 'Bonusaktion', amount: 1 },
    { resourceId: 'mana-focus', name: 'Mana / Fokus', amount: 2 },
    { resourceId: 'slot-1', name: 'Zauberplatz I', amount: 1 }
  ];
  const cards = combatUiInternals.buildPaymentResourceCards({
    actor,
    segmentKind: 'spell',
    paymentMode: 'standard',
    paymentOptions: [{ mode: 'standard', costs, payment: { sufficient: true } }]
  });
  assert.deepEqual(ACTION_RESOURCE_IDS_FOR_TEST(cards), [
    ['action', false], ['bonus-action', true], ['reaction', false], ['special-action', false]
  ]);
  assert.equal(cards.find(card => card.resource.id === 'mana-focus')?.cost, 2);
  assert.equal(cards.find(card => card.resource.id === 'slot-1')?.cost, 1);
  const groups = combatUiInternals.classifyPaymentResourceCards(cards, actor, true);
  assert.deepEqual(groups.actions.map(card => card.resource.id), ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']);
  assert.deepEqual(groups.mana.map(card => card.resource.id), ['mana-focus']);
  assert.deepEqual(groups.spellSlots.map(card => card.resource.id), ['slot-1']);
  assert.deepEqual(groups.otherResources.map(card => card.resource.id), []);
});

test('Kampf- und Zauberfenster verwenden getrennte Werte und Ressourcenbereiche', () => {
  assert.equal(combatUiInternals.isMagicSegmentKind('spell'), true);
  assert.equal(combatUiInternals.isMagicSegmentKind('prayer'), true);
  assert.equal(combatUiInternals.isMagicSegmentKind('combataction'), false);
  assert.deepEqual(combatUiInternals.getMagicDisplayStats({
    actionSpellSaveDc: 16,
    spellAttackModifier: 7,
    actionResolutionMode: 'saving-throw'
  }), {
    saveDc: 16,
    spellAttack: 7,
    resolutionLabel: 'Rettungswurf gegen Zauber-SG',
    spellLevelLabel: '',
    cantrip: false
  });
  assert.deepEqual(combatUiInternals.getCombatDisplayStats({
    attackModifier: 6,
    damageModifier: 3,
    weapon: { damageFormula: '1d8', damageType: 'Hieb' },
    selectedAction: { activationType: 'bonus-action' }
  }), {
    attack: '+6',
    damage: '1W8 +3',
    activation: 'Bonusaktion'
  });
  const orderedSlots = combatUiInternals.classifyPaymentResourceCards([
    { resource: { id: 'slot-3', name: 'Zauberplatz III' } },
    { resource: { id: 'slot-1', name: 'Zauberplatz I' } },
    { resource: { id: 'slot-2', name: 'Zauberplatz II' } }
  ], { magic: { slotResourceIds: ['slot-3', 'slot-1', 'slot-2'] } }, true);
  assert.deepEqual(orderedSlots.spellSlots.map(card => card.resource.id), ['slot-1', 'slot-2', 'slot-3']);

  const actor = {
    resources: [
      { id: 'action', name: 'Aktion', current: 1, maximum: 1 },
      { id: 'mana-focus', name: 'Mana / Fokus', current: 4, maximum: 4, category: 'magic' },
      { id: 'slot-1', name: 'Zauberplatz I', current: 2, maximum: 2, category: 'magic' }
    ],
    magic: { slotResourceIds: ['slot-1'] }
  };
  const cards = combatUiInternals.buildPaymentResourceCards({
    actor,
    segmentKind: 'combataction',
    paymentMode: 'standard',
    paymentOptions: [{
      mode: 'standard',
      costs: [{ resourceId: 'action', name: 'Aktion', amount: 1 }],
      payment: { sufficient: true }
    }]
  });
  assert.equal(cards.some(card => card.resource.id === 'mana-focus'), false);
  assert.equal(cards.some(card => card.resource.id === 'slot-1'), false);
});

function ACTION_RESOURCE_IDS_FOR_TEST(cards) {
  return ['action', 'bonus-action', 'reaction', 'special-action']
    .map(id => [id, cards.find(card => card.resource.id === id)?.required]);
}

test('zielgebundene Traits veraendern einen Angriff nur gegen ein passend markiertes Ziel', async () => {
  const actor = resolveCombatProfile(character('actor', {
    conditions: [{
      id: 'smell-aversion', name: 'Geruchsempfindlich', active: true,
      triggerRules: [{
        id: 'stink-penalty', enabled: true, phase: 'pre-roll', recipient: 'actor',
        sourceRelation: 'self', activation: 'passive', frequency: 'always', condition: 'always',
        actionKinds: ['weapon'], requiredTargetTags: ['stinkend'],
        effects: { attackModifier: -2 }
      }]
    }]
  }));
  const smellyTarget = resolveCombatProfile(character('target', {
    quirks: [{ id: 'stinkend', name: 'Stinkend', tags: 'Stinkend', active: true }]
  }));
  const neutralTarget = resolveCombatProfile(character('neutral'));

  const affectedDice = new FakeDiceAdapter({ natural: 14, total: 18 });
  const affected = await new CombatResolutionService(affectedDice).resolveAttack({ actor, target: smellyTarget });
  assert.equal(affectedDice.attackCalls[0].modifier, actor.attackModifier - 2);
  assert.equal(affected.ruleApplications[0].entryId, 'smell-aversion');

  const neutralDice = new FakeDiceAdapter({ natural: 14, total: 20 });
  const neutral = await new CombatResolutionService(neutralDice).resolveAttack({ actor, target: neutralTarget });
  assert.equal(neutralDice.attackCalls[0].modifier, actor.attackModifier);
  assert.equal(neutral.ruleApplications.length, 0);
});

test('fertigkeitsspezifischer Nachteil greift nur bei den hinterlegten Fertigkeiten', async () => {
  const actor = character('actor', {
    abilities: [{
      id: 'muttersoehnchen', name: 'Muttersoehnchen', active: true,
      triggerRules: [{
        id: 'social-insecurity', enabled: true, phase: 'pre-roll', recipient: 'actor',
        sourceRelation: 'self', activation: 'passive', frequency: 'always', condition: 'always',
        actionKinds: ['skill'], skillIds: ['persuasion', 'survival', 'religion'],
        effects: { rollMode: 'disadvantage' }
      }]
    }]
  });
  const persuasionDice = new FakeSkillDiceAdapter(12);
  const persuasion = await new SkillResolutionService(persuasionDice).resolve({
    actor,
    settings: { skillId: 'persuasion', difficulty: 10, rollMode: 'normal' }
  });
  assert.equal(persuasion.rollMode, 'disadvantage');
  assert.equal(persuasionDice.calls[0].rollMode, 'disadvantage');

  const athleticsDice = new FakeSkillDiceAdapter(12);
  const athletics = await new SkillResolutionService(athleticsDice).resolve({
    actor,
    settings: { skillId: 'athletics', difficulty: 10, rollMode: 'normal' }
  });
  assert.equal(athletics.rollMode, 'normal');
  assert.equal(athleticsDice.calls[0].rollMode, 'normal');
});

test('Kanalisierung speichert Fortschritt und löst Kosten sowie Wirkung erst beim Abschluss aus', async () => {
  const baseActor = resolveCombatProfile(character('actor'));
  const target = resolveCombatProfile(character('target'));
  const actor = {
    ...baseActor,
    profileActionId: 'spell:storm-call',
    profileActionKind: 'spell',
    selectedAction: {
      ...baseActor.selectedAction,
      id: 'storm-call',
      name: 'Sturmruf',
      channelComments: 3,
      effects: [{ id: 'storm-damage', type: 'damage', target: 'target', formula: '1d8', damageType: 'Blitz', on: 'hit' }]
    }
  };
  const dice = new FakeDiceAdapter({ natural: 15, total: 20 });
  const service = new CombatResolutionService(dice);
  const first = await service.resolveAttack({ actor, target });
  assert.equal(first.actionType, 'channeling');
  assert.equal(first.actorChannelingSnapshot.after.progress, 1);
  assert.equal(first.actorResourceSnapshot, null);
  assert.equal(dice.attackCalls.length, 0);

  const second = await service.resolveAttack({ actor: { ...actor, channeling: first.actorChannelingSnapshot.after }, target });
  assert.equal(second.actorChannelingSnapshot.after.progress, 2);
  assert.equal(dice.attackCalls.length, 0);

  const completed = await service.resolveAttack({ actor: { ...actor, channeling: second.actorChannelingSnapshot.after }, target });
  assert.equal(completed.actionType, 'attack');
  assert.equal(completed.actorChannelingSnapshot.after, null);
  assert.equal(dice.attackCalls.length, 1);
});

test('Schaden prüft eine laufende Konzentration und beendet sie bei misslungener Rettung', async () => {
  const actor = resolveCombatProfile(character('actor'));
  const target = {
    ...resolveCombatProfile(character('target')),
    concentration: { actionId: 'spell:fog', actionName: 'Nebelwand', ownerActorId: 'target' }
  };
  const dice = new FakeDiceAdapter(
    { natural: 18, total: 23 },
    { total: 12, notation: '1d8+5', keptDice: [7], modifier: 5 },
    { natural: 4 }
  );
  const resolution = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  const concentrationSave = resolution.secondarySaves.find(save => save.type === 'concentration');
  assert.equal(concentrationSave.succeeded, false);
  assert.equal(resolution.targetConcentrationSnapshot.after, null);
  assert.equal(resolution.targetConcentrationSnapshot.reason, 'save-failed');
});

test('Ausrüstung wechseln kostet eine Bonusaktion, würfelt nichts und markiert die neue aktive Waffe', async () => {
  const source = character('actor', {
    weapons: [
      { id: 'sword', name: 'Langschwert', damageFormula: '1W8', attackAttribute: 'strength', equipped: true },
      { id: 'lute', name: 'Laute', weaponType: 'arcane', damageFormula: '1W4', attackAttribute: 'charisma', equipped: false }
    ]
  });
  const actor = resolveCombatProfile(source, { actionId: 'equip:lute', segmentKind: 'combataction' });
  assert.equal(actor.selectedAction.kind, 'equipment-switch');
  assert.deepEqual(actor.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['bonus-action', 1]]);
  const target = resolveCombatProfile(character('target'));
  const result = await new CombatResolutionService({}).resolveAttack({ actor, target });
  assert.equal(result.actionType, 'equipment-switch');
  assert.equal(result.attack.hit, true);
  assert.deepEqual(result.actorEquippedWeaponSnapshot, { before: 'sword', after: 'lute' });
});

test('Ein Ausrüstungswechsel-Kommentar bestimmt die aktive Waffe für spätere Kommentare in der Historie', () => {
  const comments = [{
    id: 'switch-comment',
    commentSegments: [{
      actorId: 'actor',
      combatResolution: {
        actionType: 'equipment-switch',
        actorId: 'actor', targetId: 'target',
        actorEquippedWeaponSnapshot: { before: 'sword', after: 'lute' }
      }
    }]
  }];
  const states = deriveCombatStateFromComments(comments);
  assert.equal(states.get('actor').equippedWeaponId, 'lute');
});
