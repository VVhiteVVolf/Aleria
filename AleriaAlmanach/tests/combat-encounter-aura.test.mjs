import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyCombatEncounterAuraApplicationsToStateMap,
  buildCombatEncounterAuraApplications
} from '../modules/combat/combat-encounter-aura.js';
import { applyCombatEncounterCommentToStateMap } from '../modules/combat/combat-encounter-model.js';

function participant(actorId, partyId, profile = {}) {
  return { actorId, name: actorId, partyId, status: 'active', profile };
}

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
