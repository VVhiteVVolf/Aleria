import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCreatureBiography } from '../modules/creatures/creature-biography-model.js';
import { renderCreatureBiography } from '../modules/creatures/creature-biography-view.js';
import { createCreatureDraft, createCreatureDuplicate, makeCreatureExportPayload, normalizeCreatureImportPayload } from '../modules/creatures/creature-model.js';
import { saveLinkedCreature } from '../modules/item-register/item-register-companion-firebase.js';

test('biography survives import, duplication and explicit clearing independently of combat and loot', () => {
  const original = createCreatureDraft({ id: 'ghost', type: 'Geist', biography: {
    personality: 'Gebunden an einen Eid.', history: 'Erwacht am alten Tor.',
    facts: [{ label: 'Existenz', value: 'Ruhelos' }], sections: [{ title: 'Anker', text: 'Das Tor' }]
  } });
  const [restored] = normalizeCreatureImportPayload(makeCreatureExportPayload(original));
  assert.deepEqual(restored.biography, original.biography);
  assert.deepEqual(createCreatureDuplicate(original).biography, original.biography);
  assert.deepEqual(restored.combatProfile, original.combatProfile);
  assert.deepEqual(restored.loot, original.loot);
  assert.equal(normalizeCreatureBiography(null, { personality: 'Alt' }).personality, 'Alt');
  assert.equal(normalizeCreatureBiography({ personality: '' }, { personality: 'Alt' }).personality, '');
});

test('biography renders user text as text and supports beings without an owner or portrait', () => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const creature = createCreatureDraft({ name: 'Torwächter', biography: { personality: '<img src=x onerror=alert(1)>', facts: [{ label: 'Ursprung', value: '<script>' }] } });
  for (const editing of [false, true]) {
    const html = renderCreatureBiography(creature, escape, editing);
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
    assert.ok(!html.includes('<img src=x'));
    assert.ok(html.includes('Steckbrief'));
    assert.ok(!html.includes('Begleitet'));
  }
});

test('successive biography saves return fresh revisions, protect newer biographies and leave inventory and combat untouched', async () => {
  let current = { name: 'Rabe', itemOrigin: { ownerCharacterId: 'owner', inventoryItemId: 'bird', instanceId: 'bird' }, biography: { revision: 2, personality: 'Alt' }, combatProfile: { hitPoints: { current: 1 } }, loot: { items: [] } };
  const character = { inventory: { revision: 20, items: [{ id: 'bird', instanceId: 'bird', creatureId: 'raven' }] } };
  const initialCombat = structuredClone(current.combatProfile);
  const writes = [];
  const runTransaction = async (_, callback) => callback({
    async get(ref) { return { data: () => ref === 'creatures/raven' ? current : ref === 'characters/owner' ? character : {} }; },
    update() { assert.fail('A biography save must not update the inventory.'); },
    set(ref, data) { writes.push({ ref, data }); current = { ...current, ...data }; }
  });
  const args = { doc: (_, ...parts) => parts.join('/'), runTransaction, id: 'raven', returnRecord: true };
  const saved = await saveLinkedCreature({ ...args, data: { biography: { revision: 2, personality: 'Neu' } } });
  assert.ok(saved.biography.revision > 2);
  const second = await saveLinkedCreature({ ...args, data: { biography: { ...saved.biography, personality: 'Noch neuer' } } });
  assert.ok(second.biography.revision > saved.biography.revision);
  await assert.rejects(saveLinkedCreature({ ...args, data: { biography: { revision: 2, personality: 'Veraltet' } } }), /zwischenzeitlich/);
  assert.equal(writes.length, 2);
  assert.deepEqual(current.combatProfile, initialCombat);
  assert.deepEqual(Object.keys(writes[0].data).sort(), ['biography', 'itemOrigin']);
});
