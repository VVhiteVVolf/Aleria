import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCombatProfile, validateCombatActorProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../src/generated/combat/combat-resolution-service.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { getEffectiveCombatSegmentKind } from '../src/generated/combat/combat-segment-model.js';

function character(id, combatProfile = {}) {
  return {
    id,
    name: id,
    combatProfile: {
      progression: { level: 3 },
      attributes: [
        { key: 'strength', score: 14 }, { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 12 }, { key: 'intelligence', score: 16 },
        { key: 'wisdom', score: 10 }, { key: 'charisma', score: 10 }
      ],
      hitPoints: { current: 18, maximumOverride: 18 },
      armorClass: { base: 12 },
      weapons: [{
        id: 'sword', name: 'Schwert', weaponType: 'sword', damageFormula: '1W8',
        attackAttribute: 'strength', equipped: true
      }],
      resources: [],
      ...combatProfile
    }
  };
}

class FixedDiceAdapter {
  constructor(attack) {
    this.attack = attack;
    this.damageRequests = [];
  }

  async rollAttack() {
    return { ...this.attack, dice: [this.attack.natural], keptDice: [this.attack.natural] };
  }

  async rollDamage(request) {
    this.damageRequests.push(request);
    return { total: 7, notation: request.damageFormula, keptDice: [7], modifier: request.bonus };
  }
}

test('server mechanics reject actors at zero hit points without an explicit exception', () => {
  const actor = resolveCombatProfile(character('actor', {
    hitPoints: { current: 0, maximumOverride: 18 }
  }));
  assert.deepEqual(validateCombatActorProfile(actor), {
    ready: false,
    missingFields: ['incapacitated']
  });
});

test('combat in speech and action bubbles keeps its technique and costs on the server', () => {
  const source = character('gildas', { techniques: [{
    id: 'dragon-bite', name: 'Biss des Jungdrachens', active: true,
    weaponTypes: ['sword'], damageFormula: '1d10+1d6', activationType: 'bonus-action'
  }] });
  for (const commentKind of ['speech', 'action', 'combataction']) {
    const segment = { commentKind, mechanicMode: 'combat', combatAction: { profileActionId: 'technique:dragon-bite' } };
    const profile = resolveCombatProfile(source, {
      actionId: segment.combatAction.profileActionId,
      segmentKind: getEffectiveCombatSegmentKind(segment)
    });
    assert.equal(profile.profileActionId, 'technique:dragon-bite');
    assert.equal(profile.weapon.damageFormula, '1d10+1d6');
    assert.equal(profile.resourceCosts[0].resourceId, 'bonus-action');
  }
  assert.equal(getEffectiveCombatSegmentKind({ commentKind: 'action', combatResolution: {} }), 'combataction');
  assert.equal(getEffectiveCombatSegmentKind({ commentKind: 'prayer', mechanicMode: 'magic' }), 'prayer');
});

test('server mechanics reject spells whose configured slot resource does not exist', () => {
  const actor = resolveCombatProfile(character('actor', {
    magic: {
      enabled: true,
      spells: [{
        id: 'flame', name: 'Flamme', level: 1, rollFormula: '2W6', prepared: true,
        slotCost: 1, slotResourceId: 'missing-slot'
      }]
    }
  }), { actionId: 'spell:flame', segmentKind: 'spell' });
  assert.equal(actor.selectedAction.compatible, false);
  assert.ok(validateCombatActorProfile(actor).missingFields.includes('incompatibleAction'));
});

test('server mechanics never turn a failed saving throw into critical damage', async () => {
  const actor = resolveCombatProfile(character('actor', {
    magic: {
      enabled: true,
      castingAttribute: 'intelligence',
      spells: [{
        id: 'brand', name: 'Brandmal', rollFormula: '2W6', prepared: true,
        resolutionType: 'saving-throw', saveAttribute: 'dexterity'
      }]
    }
  }), { actionId: 'spell:brand', segmentKind: 'spell' });
  const target = resolveCombatProfile(character('target'));
  const dice = new FixedDiceAdapter({ natural: 1, total: 1 });
  const resolution = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(resolution.attack.hit, true);
  assert.equal(resolution.attack.criticalSuccess, false);
  assert.equal(dice.damageRequests[0].critical, false);
});

test('server validates separate ward rolls for the first hit and its follow-up', async () => {
  const actor = resolveCombatProfile(character('actor'));
  actor.selectedAction.followUpAttack = { enabled: true, damageFormula: '1d8', repeatCount: 1 };
  const target = { ...resolveCombatProfile(character('target')), temporaryConditions: [{
    id: 'mirror', name: 'Spiegelbilder', active: true,
    ward: { enabled: true, charges: 1, deflectChance: 50 }
  }] };
  const submitted = {
    attack: { naturalRoll: 15, diceResults: [15], rollId: 'attack-1' },
    damage: { diceResults: [5], rollId: 'damage-1' },
    wardResolution: { roll: { natural: 20, rollId: 'ward-1' } },
    followUpAttacks: [{
      attack: { naturalRoll: 15, diceResults: [15], rollId: 'attack-2' },
      wardResolution: { roll: { natural: 1, rollId: 'ward-2' } }
    }]
  };
  const result = await new CombatResolutionService(new ProvidedDiceAdapter(submitted)).resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks[0].attack.hit, false);
  assert.equal(result.followUpAttacks[0].wardResolution.roll.rollId, 'ward-2');
  assert.equal(result.targetSnapshot.hitPointsAfter, 11);
  assert.equal(result.targetConditionSnapshot.after.length, 0);
  assert.equal(target.temporaryConditions[0].ward.charges, 1);
  const missingFollowUpRoll = structuredClone(submitted);
  delete missingFollowUpRoll.followUpAttacks[0].wardResolution;
  await assert.rejects(new CombatResolutionService(new ProvidedDiceAdapter(missingFollowUpRoll))
    .resolveAttack({ actor, target }), /Ablenkungswurf/);
  const missingPrimaryRoll = structuredClone(submitted);
  delete missingPrimaryRoll.wardResolution;
  await assert.rejects(new CombatResolutionService(new ProvidedDiceAdapter(missingPrimaryRoll))
    .resolveAttack({ actor, target }), /Ablenkungswurf/);
});

test('critical follow-up shatters a ward without reusing the first deflection roll', async () => {
  const actor = resolveCombatProfile(character('actor'));
  actor.selectedAction.followUpAttack = { enabled: true, damageFormula: '1d8', repeatCount: 1 };
  const target = { ...resolveCombatProfile(character('target')), temporaryConditions: [{
    id: 'mirror', name: 'Spiegelbilder', active: true,
    ward: { enabled: true, charges: 2, deflectChance: 50, breaksOnCriticalHit: true }
  }] };
  const submitted = {
    attack: { naturalRoll: 15, diceResults: [15], rollId: 'attack-1' },
    damage: { diceResults: [2], rollId: 'damage-1' },
    wardResolution: { roll: { natural: 20, rollId: 'ward-1' } },
    followUpAttacks: [{
      attack: { naturalRoll: 20, diceResults: [20], rollId: 'attack-2' },
      damage: { diceResults: [3, 4], rollId: 'damage-2' }
    }]
  };
  const result = await new CombatResolutionService(new ProvidedDiceAdapter(submitted)).resolveAttack({ actor, target });
  assert.equal(result.followUpAttacks[0].wardResolution.shattered, true);
  assert.equal(result.followUpAttacks[0].wardResolution.roll, null);
  assert.equal(result.targetSnapshot.hitPointsAfter, 5);
  assert.equal(result.targetConditionSnapshot.after.length, 0);
});
