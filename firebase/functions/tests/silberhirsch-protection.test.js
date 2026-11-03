import test from 'node:test';
import assert from 'node:assert/strict';
import { hydrateItemRecord } from '../src/items/item-definition-repository.js';
import { itemDefinitionRegistry } from '../src/generated/item-definitions/item-definition-registry.js';
import { resolveCharacterCombatProfile } from '../src/generated/combat/combat-profile-model.js';
import { applyTypedCombatDamage } from '../src/generated/combat/combat-effect-model.js';
import { applyTypedCombatDamage as browserDamage } from '../../../AleriaAlmanach/modules/combat/combat-effect-model.js';

test('Server hydration applies the pinned Silberhirsch definition and agrees with browser damage', () => {
  const definition = itemDefinitionRegistry.current('gwynthor-seven:rianna-silberhirsch');
  assert.ok(definition?.passiveEffects?.length);
  const definitions = new Map([[`${definition.id}@${definition.revision}`, definition]]);
  const item = { id: 'coin', name: 'Silberhirsch', quantity: '1', equipped: false,
    definitionRef: { id: definition.id, revision: definition.revision },
    passiveEffects: [{ type: 'damage-reduction', magicScope: 'magical', amount: 99 }] };
  const record = { id: 'rianna', inventory: { items: [item] }, combatProfile: { hitPoints: { current: 9 } } };
  const before = structuredClone(record);
  const hydrated = hydrateItemRecord(record, definitions, { requireEquipped: true, preserveLoadout: true });
  const profile = resolveCharacterCombatProfile(hydrated);
  const hp = { maximum: 20, current: 20, temporary: 0 };
  for (const magical of [true, false]) {
    const result = applyTypedCombatDamage(hp, 6, profile, { magical, damageType: 'Feuer' });
    assert.equal(result.after.current, magical ? 15 : 14);
    assert.deepEqual(result, browserDamage(hp, 6, profile, { magical, damageType: 'Feuer' }));
  }
  const dropped = resolveCharacterCombatProfile({ ...record, inventory: { items: [] }, combatProfile: profile });
  assert.equal(applyTypedCombatDamage(hp, 6, dropped, { magical: true }).after.current, 14);
  assert.deepEqual(record, before);
});
