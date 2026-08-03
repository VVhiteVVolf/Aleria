import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCombatProfile, validateCombatActorProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../src/generated/combat/combat-resolution-service.js';

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
