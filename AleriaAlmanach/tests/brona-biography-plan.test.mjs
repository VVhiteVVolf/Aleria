import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { planBronaBiography } from '../modules/brona-biography/brona-biography-plan.mjs';
import { BRONA_CHARACTER_ID } from '../modules/brona-biography/brona-biography-icons.mjs';

const source = JSON.parse(await readFile(new URL('../modules/brona-biography/source/brona-eisenherz-biographie-20261108.json', import.meta.url), 'utf8'));
const now = '2026-11-08T18:10:00.000Z';
function fixture() {
  return { id: BRONA_CHARACTER_ID, name: 'Brona Eisenherz', portrait: source.biographyModule.biography.portrait,
    biography: source.biographyModule, inventory: { revision: 1900000000000, money: '7 Silber', moneyState: { totalCopper: 700 },
      status: 'Gesund', equipmentQuiz: { answers: ['geschützt'] }, items: [{ id: 'old-item', name: 'Persönlicher Besitz' }],
      companions: [{ id: 'starter', name: 'Reittier / Gefährte', image: '', description: '', species: 'Tier oder Begleiter' },
        { id: 'real-other-pet', name: 'Bestehender fremder Begleiter', creatureId: 'other-creature', status: 'Verletzt' }] },
    combatProfile: { hitPoints: { current: 9 }, resources: [{ current: 2 }] }, playerOwner: 'patrick' };
}
test('Brona plan links both animals without replacing possessions, money, live state or an existing companion', () => {
  const current = fixture(), original = structuredClone(current), plan = planBronaBiography(current, source, now);
  assert.deepEqual(current, original);
  assert.deepEqual(Object.keys(plan.patch).sort(), ['biography', 'inventory', 'updatedAt']);
  assert.deepEqual(plan.patch.inventory.items[0], original.inventory.items[0]);
  for (const key of ['money', 'moneyState', 'status', 'equipmentQuiz']) assert.deepEqual(plan.patch.inventory[key], original.inventory[key]);
  assert.deepEqual(plan.patch.inventory.companions.find(c => c.id === 'real-other-pet'), original.inventory.companions[1]);
  assert.equal(plan.patch.inventory.items.length, 3);
  assert.equal(plan.patch.inventory.companions.length, 3);
  assert.equal(plan.patch.inventory.revision, 1900000000001);
  assert.equal(plan.patch.biography.revision, plan.patch.inventory.revision);
  for (const creature of plan.creatures) {
    const card = plan.patch.inventory.companions.find(c => c.creatureId === creature.id);
    const item = plan.patch.inventory.items.find(i => i.creatureId === creature.id);
    assert.equal(card.inventoryItemId, item.id);
    assert.equal(item.id, creature.itemOrigin.inventoryItemId);
    assert.equal(item.instanceId, creature.itemOrigin.instanceId);
    assert.equal(item.ownerCharacterId, current.id);
    assert.equal(creature.itemOrigin.ownerCharacterId, current.id);
    assert.equal(card.role, 'Reittier');
    assert.equal(item.quantity, '1');
    assert.deepEqual(item.attributes, []);
  }
  assert.deepEqual(plan.patch.biography.biography.connections, original.biography.biography.connections);
  assert.deepEqual(plan.patch.biography.biography.extraSections, original.biography.biography.extraSections);
});
test('a repeated Brona plan keeps exactly one linked possession per animal', () => {
  const current = fixture(), first = planBronaBiography(current, source, now);
  const second = planBronaBiography({ ...current, ...first.patch }, source, now);
  assert.deepEqual(second.patch.inventory.items, first.patch.inventory.items);
  assert.deepEqual(second.patch.inventory.companions, first.patch.inventory.companions);
});
test('Brona plan refuses ambiguous ownership instead of duplicating an animal', () => {
  const current = fixture();
  current.inventory.companions.push({ id: 'one', name: 'Brocken' }, { id: 'two', name: 'Brocken' });
  assert.throws(() => planBronaBiography(current, source, now), /Mehrdeutige/);
});
