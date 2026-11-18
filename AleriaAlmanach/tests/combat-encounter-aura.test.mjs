import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyCombatEncounterAuraApplicationsToStateMap,
  buildCombatEncounterAuraApplications
} from '../modules/combat/combat-encounter-aura.js';
import { applyCombatEncounterCommentToStateMap } from '../modules/combat/combat-encounter-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getSkillRollContext } from '../modules/skill-checks/skill-resolution-service.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';

function participant(actorId, partyId, profile = {}) {
  return { actorId, name: actorId, partyId, status: 'active', profile };
}

test('Szenenpräsenz wirkt einmal, die zweite Aura mit Radius bleibt separat in Kampf und Probe wirksam', async () => {
  const fighter = id => ({ id, name: id, combatProfile: { hitPoints: { current: 40, maximumOverride: 40 },
    weapons: [{ id: 'blade', name: 'Klinge', damageFormula: '1d6', equipped: true }] } });
  const caster = fighter('aura-source');
  const aura = (radius, amount) => ({ enabled: true, active: true, target: 'Gegner', radius,
    enemyMechanics: { attack: -amount, damage: -amount, skill: -amount } });
  caster.combatProfile.aura = { enabled: true, latentPresence: aura('Kampfszene', 2), activeForm: aura('3 m', 1) };
  const target = resolveCombatProfile(caster);
  const base = resolveCombatProfile(fighter('striker'));
  const applications = buildCombatEncounterAuraApplications([
    participant(target.characterId, 'left', target), participant(base.characterId, 'right', base)
  ], { encounterId: 'aura-fight' });
  const states = applyCombatEncounterAuraApplicationsToStateMap(new Map(), { encounterId: 'aura-fight', auraApplications: applications });
  const actor = overlayCombatHitPointState(base, states.get(base.characterId));
  const service = new CombatResolutionService(new SeededCombatDice(1, 15));
  for (const [distanceMeters, extra] of [[3, 1], [4, 0], [null, 0]]) {
    const result = await service.resolveAttack({ actor, target }, { relationship: 'enemy', distanceMeters });
    assert.equal(result.attack.modifier, base.attackModifier - 2 - extra, 'Angriff unter beiden Auren');
    assert.equal(result.damage.modifier, base.damageModifier - 2 - extra, 'Schaden unter beiden Auren');
    const source = { sourceRole: 'support', actorId: target.characterId, profile: target,
      relationToActor: 'enemy', distanceToActor: distanceMeters, selectedRuleIds: ['@aura:actor'] };
    const skill = getSkillRollContext({ actor, settings: { skillId: 'investigation' } }, { actorProfile: actor, ruleSources: [source] });
    assert.equal(skill.preEffects.skillModifier, extra ? -extra : 0, 'Nur der Radiusanteil kommt zur Szenenpräsenz hinzu');
  }
});

test('ausgewählte Unterstützungsaura verstärkt Erst- und Folgeangriffe nur im gemessenen Radius', async () => {
  const actor = resolveCombatProfile({ id: 'fighter', combatProfile: {
    weapons: [{ id: 'klinge', equipped: true, damageFormula: '1d8' }],
    techniques: [{ id: 'folge', name: 'Folge', damageFormula: '1d8', activationType: 'action',
      followUpAttack: { enabled: true, afterMiss: true, inheritWeapon: true, repeatCount: 2 } }]
  } }, { actionId: 'technique:folge' });
  const target = resolveCombatProfile({ id: 'ziel', combatProfile: { hitPoints: { maximumOverride: 100, current: 100 }, armorClass: { override: 3 } } });
  const helper = resolveCombatProfile({ id: 'hilfe', combatProfile: { aura: { enabled: true, name: 'Rückenwind',
    latentPresence: { enabled: true, active: true, target: 'Verbündete', radius: '4 m', allyMechanics: { damage: 2 } } } } });
  const strike = distanceMeters => new CombatResolutionService(new SeededCombatDice(12, 15)).resolveAttack({ actor, target }, {
    ruleSources: [{ sourceRole: 'support', profile: helper, actorId: helper.characterId, relationToActor: 'ally', relationToTarget: 'enemy',
      selectedRuleIds: ['@aura:actor'], ruleSelections: [{ ruleId: '@aura:actor', distanceMeters }] }]
  });
  const baseline = await strike(null);
  const assisted = await strike(4);
  assert.equal(baseline.followUpAttacks.length, 2);
  assert.equal(assisted.damage.modifier, baseline.damage.modifier + 2);
  for (const [index, extra] of assisted.followUpAttacks.entries()) {
    assert.equal(extra.damage.total, baseline.followUpAttacks[index].damage.total + 2);
  }
});

test('latente Kampfpräsenz erzeugt beim Kampfbeginn Verbündetenbuff, Gegnerdebuff und temporäre TP', () => {
  const duncan = participant('duncan', 'draig', {
    aura: {
      enabled: true,
      name: 'Lehrmeisterliche Drachenpräsenz',
      latentPresence: {
        enabled: true,
        active: true,
        target: 'Verbündete und Gegner',
        radius: 'Kampfszene',
        allyMechanics: { attack: 2, damage: 2, combatStartTemporaryHitPoints: 12 },
        enemyMechanics: { attack: -2, damage: -2 }
      }
    }
  });
  const applications = buildCombatEncounterAuraApplications([
    duncan,
    participant('gawain', 'draig'),
    participant('raubritter', 'aal')
  ], { encounterId: 'kampf-1', grantAllTemporaryHitPoints: true });
  const states = new Map();

  applyCombatEncounterAuraApplicationsToStateMap(states, {
    encounterId: 'kampf-1',
    auraApplications: applications
  });

  assert.equal(states.get('gawain').temporary, 12);
  assert.equal(states.get('gawain').temporaryConditions[0].mechanics.attack, 2);
  assert.equal(states.get('gawain').temporaryConditions[0].mechanics.damage, 2);
  assert.equal(states.get('raubritter').temporaryConditions[0].mechanics.attack, -2);
  assert.equal(states.get('raubritter').temporaryConditions[0].mechanics.damage, -2);
});

test('Kampfende entfernt nur kampfgebundene Aura-TP und bewahrt fremde temporäre TP', () => {
  const states = new Map([
    ['gawain', { temporary: 5, temporaryConditions: [] }],
    ['unbeteiligter', { temporary: 7, temporaryConditions: [] }]
  ]);
  applyCombatEncounterAuraApplicationsToStateMap(states, {
    encounterId: 'kampf-1',
    auraApplications: [{
      id: 'kampf-1:aura:duncan:gawain',
      encounterId: 'kampf-1',
      sourceActorId: 'duncan',
      sourceActorName: 'Duncan',
      targetActorId: 'gawain',
      relation: 'ally',
      auraName: 'Präsenz des Waffenmeisters',
      mechanics: { attack: 2, combatStartTemporaryHitPoints: 12 },
      temporaryHitPoints: 12,
      grantTemporaryHitPoints: true
    }]
  });

  assert.equal(states.get('gawain').temporary, 12);

  applyCombatEncounterCommentToStateMap(states, {
    combatEncounter: {
      encounterId: 'kampf-1', operation: 'end', winningPartyId: 'draig', participants: []
    }
  });

  assert.equal(states.get('gawain').temporary, 5);
  assert.deepEqual(states.get('gawain').temporaryConditions, []);
  assert.equal(states.get('gawain').encounterStatus, 'ended');
  assert.equal(states.get('unbeteiligter').temporary, 7);
});
