import test from 'node:test';
import assert from 'node:assert/strict';

import { applyCombatAbilityUse } from '../modules/combat/combat-ability-uses.js';
import { recoverDailyCombatResources } from '../modules/combat/combat-action-economy.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { recoverSceneRestResources } from '../modules/scene-rest/scene-rest-model.js';

test('feste Aktions- und Zauberplatzregeln können im Profil nicht versehentlich umdefiniert werden', () => {
  const profile = sanitizeCharacterCombatProfile({
    resources: [
      { id: 'action', name: 'Aktion', current: 0, maximum: 9, scope: 'persistent', recovery: 'day' },
      { id: 'custom-slot', name: 'Zauberplatz III', current: 1, maximum: 2, scope: 'comment', recovery: 'manual' }
    ],
    magic: { enabled: true, slotResourceIds: ['custom-slot'] }
  });

  const action = profile.resources.find(resource => resource.id === 'action');
  assert.deepEqual(
    { current: action.current, maximum: action.maximum, scope: action.scope, recovery: action.recovery },
    { current: 1, maximum: 1, scope: 'comment', recovery: 'scene' }
  );

  const slot = profile.resources.find(resource => resource.id === 'custom-slot');
  assert.deepEqual(
    { spellLevel: slot.spellLevel, scope: slot.scope, recovery: slot.recovery, category: slot.category },
    { spellLevel: 3, scope: 'persistent', recovery: 'long-rest', category: 'spell-slot' }
  );
});

test('Stufen- und Sonderstufenwerte bestimmen die festen Aktionsressourcen', () => {
  const level16 = sanitizeCharacterCombatProfile({ progression: { level: 16 } });
  const level20 = sanitizeCharacterCombatProfile({ progression: { level: 20 } });
  const rank30 = sanitizeCharacterCombatProfile({ progression: { level: 20, specialLevels: 10 } });
  const economy = profile => Object.fromEntries(
    profile.resources
      .filter(resource => ['action', 'bonus-action', 'reaction', 'special-action'].includes(resource.id))
      .map(resource => [resource.id, resource.maximum])
  );

  assert.deepEqual(economy(level16), {
    action: 2, 'bonus-action': 1, reaction: 2, 'special-action': 5
  });
  assert.deepEqual(economy(level20), {
    action: 2, 'bonus-action': 2, reaction: 2, 'special-action': 6
  });
  assert.deepEqual(economy(rank30), {
    action: 2, 'bonus-action': 2, reaction: 2, 'special-action': 6
  });
});

test('begrenzte Fähigkeiten werden innerhalb eines Kommentars fortlaufend verbraucht und erst am Folgetag erholt', () => {
  const abilities = [{
    id: 'shield-bash', name: 'Schildstoß', usesCurrent: 2, usesMaximum: 2, recovery: 'day'
  }];
  const first = applyCombatAbilityUse(abilities, 'ability:shield-bash', 'scene:test:day-1');
  const second = applyCombatAbilityUse(first.abilities, 'ability:shield-bash', 'scene:test:day-1');
  const blocked = applyCombatAbilityUse(second.abilities, 'ability:shield-bash', 'scene:test:day-1');
  const nextDay = applyCombatAbilityUse(second.abilities, 'ability:shield-bash', 'scene:test:day-2');

  assert.deepEqual([first.use.before, first.use.after], [2, 1]);
  assert.deepEqual([second.use.before, second.use.after], [1, 0]);
  assert.equal(blocked.sufficient, false);
  assert.deepEqual([nextDay.use.before, nextDay.use.after], [2, 1]);
  assert.equal(nextDay.abilities[0].recoveryDayKey, 'scene:test:day-2');
});

test('Szenenzustand bewahrt Tagesmarken von Ressourcen und Fähigkeiten für weitere Abschnitte', () => {
  const profile = {
    maximumHitPoints: 20,
    currentHitPoints: 20,
    temporaryHitPoints: 0,
    resources: [{ id: 'aura-focus', name: 'Aura', current: 2, maximum: 2, recovery: 'day', scope: 'persistent' }],
    abilities: [{ id: 'shield-bash', name: 'Schildstoß', usesCurrent: 2, usesMaximum: 2, recovery: 'day' }]
  };
  const overlaid = overlayCombatHitPointState(profile, {
    resources: [{ ...profile.resources[0], current: 1, recoveryDayKey: 'scene:test:day-4' }],
    abilities: [{ ...profile.abilities[0], usesCurrent: 1, recoveryDayKey: 'scene:test:day-4' }]
  });

  assert.equal(overlaid.resources[0].recoveryDayKey, 'scene:test:day-4');
  assert.equal(overlaid.abilities[0].recoveryDayKey, 'scene:test:day-4');
  assert.equal(recoverDailyCombatResources(overlaid.resources, 'scene:test:day-4')[0].current, 1);
});

test('kurze Rast, lange Rast und Tageswechsel erholen exakt ihre eigenen Ressourcengruppen', () => {
  const resources = [
    { id: 'action', name: 'Aktion', current: 0, maximum: 1, scope: 'comment', recovery: 'scene' },
    { id: 'stamina', name: 'Ausdauer', current: 0, maximum: 3, scope: 'persistent', recovery: 'short-rest' },
    { id: 'spell-slot-1', name: 'Zauberplatz I', current: 0, maximum: 2, scope: 'persistent', recovery: 'long-rest' },
    { id: 'mana-focus', name: 'Mana', current: 0, maximum: 5, scope: 'persistent', recovery: 'day', recoveryDayKey: 'scene:test:day-1' },
    { id: 'special-action', name: 'Besondere Aktion', current: 0, maximum: 2, scope: 'persistent', recovery: 'day', recoveryDayKey: 'scene:test:day-1' },
    { id: 'manual', name: 'Questladung', current: 0, maximum: 1, scope: 'persistent', recovery: 'manual' }
  ];
  const shortRest = recoverSceneRestResources(resources, 'short', 'scene:test:day-1');
  const longRest = recoverSceneRestResources(resources, 'long', 'scene:test:day-1');
  const nextDay = recoverSceneRestResources(resources, 'short', 'scene:test:day-2', { dayChanged: true });
  const values = result => Object.fromEntries(result.map(resource => [resource.id, resource.current]));

  assert.deepEqual(values(shortRest), {
    action: 1, stamina: 3, 'spell-slot-1': 0, 'mana-focus': 0, 'special-action': 0, manual: 0
  });
  assert.deepEqual(values(longRest), {
    action: 1, stamina: 3, 'spell-slot-1': 2, 'mana-focus': 0, 'special-action': 0, manual: 0
  });
  assert.deepEqual(values(nextDay), {
    action: 1, stamina: 3, 'spell-slot-1': 0, 'mana-focus': 5, 'special-action': 2, manual: 0
  });
});

test('AleriaGPT erhält nach Verbrauch und Rast den aktuellen Szenenzustand statt alte Bogenwerte', () => {
  const resolved = resolveCombatProfile({
    id: 'mage',
    name: 'Magierin',
    combatProfile: {
      resources: [
        { id: 'aura-focus', name: 'Aura', current: 2, maximum: 2, recovery: 'day' },
        { id: 'mana-focus', name: 'Mana', current: 5, maximum: 5, recovery: 'day' },
        { id: 'spell-slot-1', name: 'Zauberplatz I', current: 2, maximum: 2, recovery: 'long-rest', spellLevel: 1 }
      ],
      magic: { enabled: true, slotResourceIds: ['spell-slot-1'] },
      abilities: [{ id: 'ward', name: 'Schutzkreis', usesCurrent: 1, usesMaximum: 1, recovery: 'long-rest' }]
    }
  });
  const resources = resolved.resources.map(resource => ({
    ...resource,
    current: resource.id === 'mana-focus' ? 1 : (resource.id === 'aura-focus' || resource.id === 'spell-slot-1' ? 0 : resource.current)
  }));
  const current = overlayCombatHitPointState(resolved, {
    resources,
    abilities: [{ ...resolved.abilities[0], usesCurrent: 0 }]
  });

  assert.equal(current.aiSnapshot.actionEconomy.find(resource => resource.id === 'aura-focus').current, 0);
  assert.equal(current.aiSnapshot.dailyResources.find(resource => resource.id === 'mana-focus').current, 1);
  assert.equal(current.aiSnapshot.magic.spellSlots.find(resource => resource.id === 'spell-slot-1').current, 0);
  assert.equal(current.aiSnapshot.specialAbilities.find(ability => ability.id === 'ward').usesCurrent, 0);
});
