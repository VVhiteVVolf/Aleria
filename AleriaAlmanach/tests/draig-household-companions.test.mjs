import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DRAIG_HOUSEHOLD_COMPANIONS } from '../modules/creatures/catalog/draig-household-companions.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { sanitizeCreature } from '../modules/creatures/creature-model.js';
import { attachCreatureToInventory, isUnassignedCompanionCard } from '../modules/creatures/creature-companion-link.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { inferCreatureGenus } from '../modules/creatures/creature-classification.js';
import { getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';

test('all 22 supplied animals use existing genealogy identities, portraits and species-appropriate levels', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
  assert.equal(DRAIG_HOUSEHOLD_COMPANIONS.length, 22);
  assert.equal(new Set(DRAIG_HOUSEHOLD_COMPANIONS.map(c => c.id)).size, 22);
  for (const source of DRAIG_HOUSEHOLD_COMPANIONS) {
    const c = sanitizeCreature(source);
    const owner = snapshot.characters.find(owner => owner.id === c.itemOrigin.ownerCharacterId);
    assert.ok(owner?.identity?.worldPersonId, c.name);
    assert.equal(c.combatProfile.progression.level, c.level);
    assert.equal(c.combatProfile.hitPoints.current, getMaximumHitPoints(c.combatProfile));
    assert.equal(c.combatProfile.weapons[0].activationType, 'action');
    assert.equal(c.combatProfile.magic.enabled, false);
    assert.ok(c.portrait.startsWith('https://'));
    assert.ok(c.level <= ({ Pferde: 3, Hunde: 4 }[inferCreatureGenus(c)] || 2));
  }
  for (const c of getBuiltinCreatureTemplates().filter(c => inferCreatureGenus(c) === 'Pferde')) assert.ok(c.level <= 3, c.name);
  assert.match(DRAIG_HOUSEHOLD_COMPANIONS.find(c => c.name === 'Mabli').itemOrigin.ownerCharacterName, /Heledd/);
  assert.equal(DRAIG_HOUSEHOLD_COMPANIONS.find(c => c.name === 'Tiwlip').itemOrigin.ownerCharacterName, 'Mair Draig');
  assert.match(DRAIG_HOUSEHOLD_COMPANIONS.find(c => c.name === 'Sturmwind').portrait, /sturmwind-galahad\.png$/);
});

test('attaching three animals replaces only empty starter cards and is idempotent without touching money or combat', () => {
  const animals = DRAIG_HOUSEHOLD_COMPANIONS.filter(c => c.itemOrigin.ownerCharacterName === 'Gwendolyn Draig').map(sanitizeCreature);
  const original = { id: animals[0].itemOrigin.ownerCharacterId, name: 'Gwendolyn Draig', combatProfile: { hitPoints: { current: 7 } }, inventory: {
    money: '27', items: [{ id: 'kept', name: 'Besitz' }], companions: [
      { id: 'starter', name: 'Reittier / Gefährte', species: 'Tier oder Begleiter', image: '', description: '' },
      { id: 'kept-card', name: 'Weiterer Begleiter', species: 'Tier', description: 'Bleibt erhalten.' }
    ]
  } };
  let current = structuredClone(original);
  for (const c of animals) current.inventory = attachCreatureToInventory(current, c);
  assert.deepEqual(current.combatProfile, original.combatProfile);
  assert.equal(current.inventory.money, original.inventory.money);
  assert.deepEqual(current.inventory.items[0], original.inventory.items[0]);
  assert.deepEqual(current.inventory.companions.find(c => c.id === 'kept-card'), original.inventory.companions[1]);
  assert.equal(current.inventory.companions[0].id, 'starter');
  assert.equal(inventoryCompanionViews(current.inventory, animals).length, 4);
  for (const c of animals) assert.deepEqual(attachCreatureToInventory(current, c), current.inventory);
  assert.throws(() => attachCreatureToInventory({ ...current, id: 'other-owner' }, animals[0]), /Besitzer/);
  assert.ok(!isUnassignedCompanionCard({ ...original.inventory.companions[0], image: 'https://example.com/real.png' }));
});
