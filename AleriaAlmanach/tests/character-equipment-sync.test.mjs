import assert from 'node:assert/strict';
import test from 'node:test';

import {
  synchronizeEquipmentFromCombat,
  synchronizeEquipmentFromInventory
} from '../modules/character-equipment/character-equipment-sync.js';
import {
  getArmorClass,
  sanitizeCharacterCombatProfile
} from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

function baseProfile(overrides = {}) {
  return { weapons: [], armorItems: [], ...overrides };
}

test('direkt im Kampfbogen angelegte Waffen erzeugen genau einen stabil verknuepften Inventargegenstand', () => {
  const first = synchronizeEquipmentFromCombat({
    inventory: { items: [] },
    combatProfile: baseProfile({
      weapons: [{
        id: 'draig-sword', name: 'Draig Ritterschwert', damageFormula: '1d8',
        versatileDamageFormula: '1d10', weaponType: 'sword', training: 'martial', equipped: true
      }]
    }),
    characterId: 'gawain-draig',
    characterName: 'Gawain Draig',
    now: '2026-08-03T12:00:00.000Z'
  });
  assert.equal(first.inventory.items.length, 1);
  assert.equal(first.combatProfile.weapons[0].inventoryItemId, first.inventory.items[0].id);
  assert.equal(first.inventory.items[0].equipmentLink.combatEntryId, 'draig-sword');
  assert.equal(first.inventory.items[0].combatDefinition.versatileDamageFormula, '1d10');

  const second = synchronizeEquipmentFromCombat({
    inventory: first.inventory,
    combatProfile: first.combatProfile,
    characterId: 'gawain-draig',
    characterName: 'Gawain Draig'
  });
  assert.equal(second.inventory.items.length, 1);
  assert.equal(second.inventory.items[0].id, first.inventory.items[0].id);
});

test('Inventar- und Kampfbogenaenderungen werden in beide Richtungen uebernommen', () => {
  const linked = synchronizeEquipmentFromCombat({
    inventory: { items: [] },
    combatProfile: baseProfile({
      weapons: [{ id: 'dagger', name: 'Draig Dolch', damageFormula: '1d4', weaponType: 'dagger' }]
    })
  });
  linked.combatProfile.weapons[0].damageFormula = '1d6';
  const fromCombat = synchronizeEquipmentFromCombat(linked);
  assert.equal(fromCombat.inventory.items[0].combatDefinition.damageFormula, '1d6');

  fromCombat.inventory.items[0].name = 'Draig Parierdolch';
  fromCombat.inventory.items[0].combatDefinition.damageFormula = '1d4+1';
  const fromInventory = synchronizeEquipmentFromInventory(fromCombat);
  assert.equal(fromInventory.combatProfile.weapons[0].name, 'Draig Parierdolch');
  assert.equal(fromInventory.combatProfile.weapons[0].damageFormula, '1d4+1');

  const removedFromInventory = synchronizeEquipmentFromInventory({
    inventory: { ...fromInventory.inventory, items: [] },
    combatProfile: fromInventory.combatProfile
  });
  assert.equal(removedFromInventory.combatProfile.weapons.length, 0);
});

test('ein Import verknuepft mehrere bislang unverknuepfte Waffen vor dem Inventar-Rueckweg verlustfrei', () => {
  const imported = synchronizeEquipmentFromCombat({
    inventory: {
      items: [{ id: 'placeholder', category: 'weapon', name: 'Hauptwaffe' }]
    },
    combatProfile: baseProfile({
      weapons: [
        { id: 'default-unarmed-melee', name: 'Nahkampf', weaponType: 'unarmed' },
        { id: 'fenrir-greataxe', name: 'GroÃŸaxt', weaponType: 'axe', damageFormula: '1d12' },
        { id: 'fenrir-handaxe-pair', name: 'EinhandÃ¤xte (Paar)', weaponType: 'axe', damageFormula: '1d6' },
        { id: 'fenrir-throwing-axe', name: 'Wurfaxt', weaponType: 'axe', damageFormula: '1d6' },
        { id: 'fenrir-roundshield-bash', name: 'Huskarl-Rundschild', weaponType: 'shield', damageFormula: '1d4' }
      ]
    }),
    characterId: 'fenrir',
    characterName: 'Fenrir Varulv',
    now: '2026-08-08T16:00:00.000Z'
  });

  assert.equal(imported.combatProfile.weapons.length, 5);
  assert.equal(imported.inventory.items.length, 5, 'vier echte Waffen werden zum bestehenden Platzhalter ergänzt');
  imported.combatProfile.weapons.slice(1).forEach(weapon => {
    assert.ok(weapon.inventoryItemId, `${weapon.name} muss vor dem Speichern verknüpft sein`);
    assert.ok(imported.inventory.items.some(item => item.id === weapon.inventoryItemId));
  });

  const collected = synchronizeEquipmentFromInventory(imported);
  assert.deepEqual(
    collected.combatProfile.weapons.map(weapon => weapon.id),
    imported.combatProfile.weapons.map(weapon => weapon.id),
    'der anschließende Inventar-Rückweg darf keine importierte Waffe entfernen'
  );
});

test('Draig-Ruestung schaltet den Geschicklichkeitsmodifikator erst ab Stufe sechs frei', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 1 },
    attributes: [{ key: 'dexterity', score: 15 }],
    armorClass: { base: 10, dexterityMode: 'none' },
    armorItems: [{
      id: 'draig-armor', name: 'Draig Ruestung', kind: 'heavy', equipped: true,
      baseArmorClass: 16, dexterityMode: 'full', dexterityUnlockLevel: 6
    }]
  });
  assert.equal(getArmorClass(profile), 16);
  assert.equal(getArmorClass({ ...profile, progression: { ...profile.progression, level: 6 } }), 18);
});

test('vielseitige Waffen nutzen nur bei ausdruecklich zweihandiger Fuehrung den groesseren Schadenswuerfel', () => {
  const character = {
    id: 'gawain-draig',
    name: 'Gawain Draig',
    combatProfile: {
      weapons: [{
        id: 'draig-sword', name: 'Draig Ritterschwert', damageFormula: '1d8',
        versatileDamageFormula: '1d10', weaponType: 'sword', proficient: true, equipped: true
      }]
    }
  };
  const oneHanded = resolveCombatProfile(character, { actionId: 'weapon:draig-sword', weaponGrip: 'one-handed' });
  const twoHanded = resolveCombatProfile(character, { actionId: 'weapon:draig-sword', weaponGrip: 'two-handed' });
  assert.equal(oneHanded.weapon.damageFormula, '1d8');
  assert.equal(twoHanded.weapon.damageFormula, '1d10');
  assert.equal(twoHanded.weaponGrip, 'two-handed');
});
