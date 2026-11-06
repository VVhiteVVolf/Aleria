import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitItemRecordOperation } from '../src/items/commit-item-record.js';
import { STANDARD_ITEMS } from '../src/generated/item-register/item-register-standard.js';
import { sanitizeCharacterCombatProfile, resolveCharacterCombatProfile } from '../src/generated/combat/combat-profile-model.js';

test('a free weapon attribute choice survives canonical save, item hydration and changing back', async () => {
  const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const profile = sanitizeCharacterCombatProfile({
    attributes: [{ key: 'strength', score: 8 }, { key: 'dexterity', score: 16 }],
    weapons: [{ id: 'sword', inventoryItemId: 'sword', name: sword.name, weaponType: 'sword',
      attackAttribute: 'strength', damageFormula: '1d8', equipped: true }]
  });
  const original = { name: 'Lokale Prüffigur', ownerUid: 'owner', combatProfile: profile,
    inventory: { definitionSchemaVersion: 1, revision: 1,
      items: [{ id: 'sword', instanceId: 'sword', definitionRef: sword.definitionRef, quantity: 1, equipped: true }] } };
  const db = database({ 'characters/choice': original });
  const auth = { uid: 'owner', token: {} };
  for (const [attribute, attack, damage] of [['dexterity', 5, 3], ['strength', 1, -1]]) {
    const current = structuredClone(db.data.get('characters/choice'));
    current.combatProfile.combat.weaponAttributeOverride = attribute;
    await commitItemRecordOperation(db, auth, { id: 'choice', operationId: attribute,
      data: { combatProfile: current.combatProfile } });
    const saved = db.data.get('characters/choice');
    assert.equal(saved.combatProfile.combat.weaponAttributeOverride, attribute);
    assert.deepEqual(saved.inventory.items[0].definitionRef, sword.definitionRef);
    assert.equal(saved.combatProfile.weapons.find(weapon => weapon.inventoryItemId === 'sword').attackAttribute, 'strength');
    const resolved = resolveCharacterCombatProfile({ ...saved, id: 'choice' });
    assert.equal(resolved.weapon.attackAttribute, attribute);
    assert.equal(resolved.attackModifier, attack);
    assert.equal(resolved.damageModifier, damage);
  }
});
