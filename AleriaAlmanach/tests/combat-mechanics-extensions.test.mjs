import assert from 'node:assert/strict';
import test from 'node:test';

import { consumeCombatAmmunition } from '../modules/combat/combat-ammunition.js';
import {
  buildEncounterExperienceAwards,
  deriveCombatEncounterState,
  getActiveCombatPartyMap,
  getEncounterRelationship
} from '../modules/combat/combat-encounter-model.js';
import { applyExperienceAward, getOrdinaryLevelForExperience } from '../modules/combat/combat-progression.js';
import { getArmorClass } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

function character(id, profile = {}) {
  return {
    id,
    name: id,
    inventory: { items: [] },
    combatProfile: {
      progression: { level: 1, experience: 0 },
      attributes: [
        { key: 'strength', score: 14 }, { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 12 }, { key: 'intelligence', score: 12 },
        { key: 'wisdom', score: 12 }, { key: 'charisma', score: 12 }
      ],
      hitPoints: { current: 10, maximumOverride: 20, hitDie: 8 },
      armorClass: { base: 10, dexterityMode: 'full' },
      weapons: [{ id: 'blade', name: 'Klinge', damageFormula: '1d6', damageType: 'Hieb', equipped: true }],
      resources: [], skills: [],
      ...profile
    }
  };
}

class Dice {
  async rollAttack({ modifier }) {
    return { id: 'attack', natural: 15, dice: [15], keptDice: [15], total: 15 + modifier, visualMode: 'test' };
  }
  async rollDamage({ damageFormula }) {
    const dice = damageFormula.includes('1d8') ? [6] : [4];
    return { id: 'damage', notation: damageFormula, keptDice: dice, modifier: 0, total: dice[0], visualMode: 'test' };
  }
  async rollSavingThrow({ modifier }) {
    return { id: 'save', natural: 12, dice: [12], keptDice: [12], total: 12 + modifier, visualMode: 'test' };
  }
}

test('inventargebundene Munition wird pro abgeschlossener Handlung exakt einmal verbraucht', () => {
  const inventory = { items: [{ id: 'arrows', name: 'Pfeile', quantity: '3' }] };
  const result = consumeCombatAmmunition(inventory, { required: true, inventoryItemId: 'arrows', amountPerUse: 1 });
  assert.equal(result.use.before, 3);
  assert.equal(result.use.after, 2);
  assert.equal(result.after.items[0].quantity, '2');
  assert.equal(inventory.items[0].quantity, '3');
});

test('Selbstheilung verändert den Akteur und nicht das ausgewählte Gegenüber', async () => {
  const base = resolveCombatProfile(character('healer'));
  const actor = {
    ...base,
    actionResolutionMode: 'automatic',
    profileActionId: 'ability:self-heal',
    profileActionKind: 'ability',
    selectedAction: {
      ...base.selectedAction,
      id: 'self-heal', name: 'Selbstheilung', effects: [{ id: 'heal', type: 'healing', target: 'self', amount: 5, on: 'always' }]
    }
  };
  const target = resolveCombatProfile(character('observer', { hitPoints: { current: 8, maximumOverride: 20, hitDie: 8 } }));
  const result = await new CombatResolutionService(new Dice()).resolveAttack({ actor, target });
  assert.equal(result.actorHitPointSnapshot.after.current, 15);
  assert.equal(result.targetSnapshot.hitPointsAfter, 8);
  assert.equal(result.effectResults[0].recipient, 'actor');
});

test('höherstufiges Wirken wählt den passenden Slot und skaliert den Schadenswurf', () => {
  const caster = character('mage', {
    resources: [
      { id: 'action', name: 'Aktion', current: 1, maximum: 1, scope: 'comment' },
      { id: 'spell-slot-1', name: 'Zauberplatz I', current: 2, maximum: 2, recovery: 'long-rest' },
      { id: 'spell-slot-2', name: 'Zauberplatz II', current: 1, maximum: 1, recovery: 'long-rest' }
    ],
    magic: {
      enabled: true, castingAttribute: 'intelligence', slotResourceIds: ['spell-slot-1', 'spell-slot-2'],
      spells: [{
        id: 'flame', name: 'Flamme', level: 1, prepared: true, rollFormula: '1d8',
        slotResourceId: 'spell-slot-1', slotCost: 1, manaCost: 0, presentationKind: 'spell',
        resolutionType: 'spell-attack', activationType: 'action',
        upcast: { enabled: true, formulaPerLevel: '1d8', maximumLevel: 10 }
      }]
    }
  });
  const resolved = resolveCombatProfile(caster, { actionId: 'spell:flame', segmentKind: 'spell', castLevel: 2 });
  assert.equal(resolved.selectedAction.castLevel, 2);
  assert.equal(resolved.weapon.damageFormula, '1d8+1d8');
  assert.ok(resolved.resourceCosts.some(cost => cost.resourceId === 'spell-slot-2' && cost.amount === 1));
  assert.ok(!resolved.resourceCosts.some(cost => cost.resourceId === 'spell-slot-1'));
});

test('Kampfankündigung ist die autoritative Quelle für Parteien und EP-Aufteilung', () => {
  const comments = [{
    id: 'start', createdBy: 'game-master', combatEncounter: {
      encounterId: 'brandhof', operation: 'start', participants: [
        { actorId: 'gawain', name: 'Gawain', partyId: 'draig', partyName: 'Draig', eligibleForExperience: true },
        { actorId: 'bandit', name: 'Bandit', partyId: 'bandits', partyName: 'Banditen', experienceValue: 200 }
      ]
    }
  }];
  const partyMap = getActiveCombatPartyMap(comments);
  assert.equal(getEncounterRelationship('gawain', 'bandit', partyMap), 'enemy');
  const encounter = [...deriveCombatEncounterState(comments).values()][0];
  assert.equal(encounter.startedBy, 'game-master');
  encounter.participants.get('bandit').status = 'defeated';
  assert.deepEqual(buildEncounterExperienceAwards(encounter, 'draig').awards, [{ actorId: 'gawain', name: 'Gawain', experience: 200 }]);
});

test('null TP markieren einen Teilnehmer automatisch als besiegt und EP-fähig', () => {
  const start = {
    id: 'start',
    combatEncounter: {
      encounterId: 'brandhof', operation: 'start',
      participants: [
        { actorId: 'gawain', name: 'Gawain', partyId: 'draig', partyName: 'Draig', status: 'active', eligibleForExperience: true },
        { actorId: 'bandit', name: 'Bandit', partyId: 'bandits', partyName: 'Banditen', status: 'active', experienceValue: 100 }
      ]
    }
  };
  const defeat = {
    id: 'defeat',
    commentSegments: [{
      combatResolution: {
        targetId: 'bandit',
        defeat: { occurred: true, status: 'incapacitated' },
        targetSnapshot: { hitPointsBefore: 4, hitPointsAfter: 0 }
      }
    }]
  };
  const encounter = deriveCombatEncounterState([start, defeat]).get('brandhof');
  assert.equal(encounter.participants.get('bandit').status, 'defeated');
  assert.deepEqual(buildEncounterExperienceAwards(encounter, 'draig'), {
    totalExperience: 100,
    awards: [{ actorId: 'gawain', name: 'Gawain', experience: 100 }]
  });
});

test('EP schalten die bestehende Level-up-Werkstatt frei, ohne Entscheidungen automatisch anzuwenden', () => {
  const award = applyExperienceAward({ level: 1, experience: 250 }, 100);
  assert.equal(award.after.level, 1);
  assert.equal(award.after.experience, 350);
  assert.equal(award.levelUpAvailable, true);
  assert.equal(getOrdinaryLevelForExperience(350), 2);
});

test('Zustandsdauer zählt auch Redeabschnitte der betroffenen Figur herunter', () => {
  const comments = [{
    id: 'apply', characterId: 'attacker', commentSegments: [{
      actorId: 'attacker',
      combatResolution: {
        actorId: 'attacker', targetId: 'target',
        targetSnapshot: { hitPointsAfter: 10, maximumHitPoints: 10, temporaryHitPointsAfter: 0 },
        targetConditionSnapshot: { after: [{ id: 'weak', name: 'Geschwächt', active: true, durationModel: { kind: 'actor-comments', remainingActorComments: 2 } }] }
      }
    }]
  }, {
    id: 'speech', characterId: 'target', commentSegments: [{ actorId: 'target', kind: 'speech', text: 'Noch stehe ich.' }]
  }];
  const state = deriveCombatStateFromComments(comments).get('target');
  assert.equal(state.temporaryConditions[0].remainingActorComments, 1);
});

test('Basis-RK-Override behält Ausrüstungs- und strukturierte Boni bei', () => {
  const profile = character('guard', {
    armorClass: { override: 14, overrideMode: 'base', shieldBonus: 2, magicModifier: 1, otherModifier: 0 },
    armorItems: [{ id: 'ward', name: 'Schutz', kind: 'shield', armorClassBonus: 1, equipped: true }],
    quirks: [{ id: 'stance', name: 'Wachsam', active: true, mechanics: { armorClass: 1 } }]
  }).combatProfile;
  assert.equal(getArmorClass(profile), 20);
});

test('null TP bleiben kampfunfähig statt tot und eine Unterbrechung beendet Kanalisierung', async () => {
  const base = resolveCombatProfile(character('warden'));
  const actor = {
    ...base,
    selectedAction: {
      ...base.selectedAction,
      effects: [
        { id: 'pommel', type: 'damage', target: 'target', formula: '1d6', damageType: 'Wucht', nonlethal: true, on: 'hit' },
        { id: 'interrupt', type: 'interrupt', target: 'target', on: 'hit' }
      ]
    }
  };
  const target = {
    ...resolveCombatProfile(character('channeler', { hitPoints: { current: 4, maximumOverride: 20, hitDie: 8 } })),
    channeling: { actionId: 'spell:ritual', actionName: 'Ritual', progress: 2, requiredComments: 3 }
  };
  const result = await new CombatResolutionService(new Dice()).resolveAttack({ actor, target });
  assert.deepEqual(result.defeat, {
    occurred: true,
    status: 'incapacitated',
    nonlethal: true,
    dead: false,
    requiresNarrativeDecision: true
  });
  assert.equal(result.targetChannelingSnapshot.after, null);
  assert.equal(result.targetChannelingSnapshot.reason, 'interrupted');
});

test('eine Mehrzielhandlung würfelt je Ziel, bezahlt Aktion und Munition aber nur einmal', async () => {
  const service = new CombatResolutionService(new Dice());
  const base = resolveCombatProfile(character('archer', {
    weapons: [{
      id: 'bow', name: 'Bogen', damageFormula: '1d6', damageType: 'Stich', equipped: true,
      effects: [{ id: 'area-damage', type: 'damage', target: 'selected', formula: '1d6', on: 'hit' }]
    }]
  }));
  const first = await service.resolveAttack({ actor: base, target: resolveCombatProfile(character('target-a')) });
  const actorAfterFirst = overlayCombatHitPointState(base, {
    resources: first.actorResourceSnapshot?.after || base.resources,
    inventory: first.actorInventorySnapshot?.after || base.inventory
  });
  const second = await service.resolveAttack({ actor: actorAfterFirst, target: resolveCombatProfile(character('target-b')) }, {
    skipResourceCosts: true,
    skipAmmunition: true,
    skipSelfEffects: true,
    skipChanneling: true
  });
  assert.equal(first.actorResourceSnapshot.changes.some(change => change.resourceId === 'action'), true);
  assert.equal(second.actorResourceSnapshot, null);
  const state = deriveCombatStateFromComments([{ commentSegments: [{ combatResolution: first, combatResolutions: [first, second] }] }]);
  assert.equal(state.get('target-a').current, 6);
  assert.equal(state.get('target-b').current, 6);
});

test('späte Auslöser wenden strukturierte Folgewirkungen genau einmal an', async () => {
  const actor = resolveCombatProfile(character('attacker'));
  const target = resolveCombatProfile(character('guardian', {
    abilities: [{
      id: 'reactive-ward', name: 'Reaktiver Schutz', active: true,
      triggerRules: [{
        id: 'ward-on-damaged', enabled: true, phase: 'on-damaged',
        recipient: 'target', sourceRelation: 'self', activation: 'passive',
        frequency: 'always', condition: 'always', actionKinds: ['weapon'],
        effects: {},
        resultEffects: [{
          id: 'ward-temporary-hit-points', type: 'temporary-hit-points',
          target: 'target', on: 'always', amount: 3
        }]
      }]
    }]
  }));

  const result = await new CombatResolutionService(new Dice()).resolveAttack({ actor, target });

  assert.equal(result.targetSnapshot.hitPointsAfter, 6);
  assert.equal(result.targetSnapshot.temporaryHitPointsAfter, 3);
  assert.equal(result.effectResults.filter(entry => entry.effect?.id === 'ward-temporary-hit-points').length, 1);
  assert.ok(result.ruleApplications.some(application => application.ruleId === 'ward-on-damaged'));
});

test('eine Konzentrationsprüfung kann strukturierte Reaktionsfolgen auslösen', async () => {
  const actor = resolveCombatProfile(character('attacker'));
  const targetBase = resolveCombatProfile(character('concentrating-target', {
    abilities: [{
      id: 'concentration-ward', name: 'Konzentrationsschutz', active: true,
      triggerRules: [{
        id: 'ward-on-concentration', enabled: true, phase: 'on-concentration-check',
        recipient: 'target', sourceRelation: 'self', activation: 'passive',
        frequency: 'always', condition: 'always', actionKinds: ['weapon'],
        effects: { savingThrowModifier: 1 },
        resultEffects: [{
          id: 'concentration-temporary-hit-points', type: 'temporary-hit-points',
          target: 'target', on: 'always', amount: 2
        }]
      }]
    }]
  }));
  const target = {
    ...targetBase,
    concentration: { actionId: 'spell:ward', actionName: 'Schutzkreis', ownerActorId: targetBase.characterId }
  };

  const result = await new CombatResolutionService(new Dice()).resolveAttack({ actor, target });

  assert.equal(result.secondarySaves[0].type, 'concentration');
  assert.equal(result.targetSnapshot.temporaryHitPointsAfter, 2);
  assert.ok(result.ruleApplications.some(application => application.ruleId === 'ward-on-concentration'));
});
