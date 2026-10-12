import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CARREG_CREATURE_SOURCE, DUNCAN_CHARACTER_ID } from '../modules/creatures/catalog/duncan-carreg.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { sanitizeCreature, makeCreatureExportPayload, normalizeCreatureImportPayload } from '../modules/creatures/creature-model.js';
import { getCreatureClassification } from '../modules/creatures/creature-classification.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
const folder = new URL('../../Charakter Archiv Exporte/gefaehrten/carreg-ritterschimmer-2026-10-12/', import.meta.url);
const read = async path => JSON.parse(await readFile(path, 'utf8'));

test('Carreg is a level-three Ritterschimmer with the exact selected image and durable breed reference', async () => {
  const [creature] = normalizeCreatureImportPayload(makeCreatureExportPayload(CARREG_CREATURE_SOURCE));
  assert.equal(creature.id, 'companion-duncan-carreg');
  assert.equal(creature.level, 3);
  assert.equal(creature.combatProfile.progression.level, 3);
  assert.equal(creature.species, 'Ritterschimmer');
  assert.equal(creature.bestiaryReference.url, '/Bestiarium/tiere/pferde/zuchtbuch/index.html#kreuzung-ceffyl-mit-herzogsschimmer');
  assert.match(creature.biography.history, /Herzogsschimmer und Ceffyl/);
  assert.equal(getCreatureClassification({ species: 'Ritterschimmer' }).genus, 'Pferde');
  assert.equal(getBuiltinCreatureTemplates().filter(c => c.id === creature.id).length, 1);
  const manifest = await read(new URL('vorbereitung.json', folder));
  const image = await readFile(new URL('../..' + creature.portrait, import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'), manifest.asset.sha256);
  assert.equal(image.readUInt32BE(16), 1024);
  assert.equal(image.readUInt32BE(20), 1536);
});

test('Carreg reuses an empty mount card and links exactly once without changing existing possessions or combat', () => {
  const creature = sanitizeCreature(CARREG_CREATURE_SOURCE);
  const character = { id: DUNCAN_CHARACTER_ID, name: 'Duncan Gafyr', combatProfile: { hitPoints: { current: 7 }, resources: [{ id: 'used', current: 0 }], conditions: [{ id: 'kept' }] }, inventory: {
    money: '321 Kupfer', items: [{ id: 'kept', name: 'Duncans Schwert' }], companions: [
      { id: 'blank-mount', name: 'Reittier / Gefährte', species: 'Tier oder Begleiter', status: 'Noch festlegen' },
      { id: 'kept-companion', name: 'Weiterer Begleiter', species: 'Hund', description: 'Unverändert erhalten' }
    ]
  } };
  const before = structuredClone(character);
  const inventory = attachCreatureToInventory(character, creature, '2026-10-12T23:00:00Z');
  assert.deepEqual(character, before);
  assert.deepEqual(inventory.items[0], before.inventory.items[0]);
  assert.deepEqual(inventory.companions[1], before.inventory.companions[1]);
  assert.equal(inventory.money, before.inventory.money);
  assert.equal(inventory.companions[0].id, 'blank-mount');
  assert.equal(inventory.companions[0].role, 'Reittier');
  assert.equal(inventory.companions[0].status, 'Gesund');
  assert.equal(inventory.items[1].registerCategory, 'pferde');
  assert.equal(inventory.items[1].ownerCharacterId, DUNCAN_CHARACTER_ID);
  assert.equal(inventoryCompanionViews(inventory, [creature]).filter(c => c.creatureId === creature.id).length, 1);
  assert.deepEqual(attachCreatureToInventory({ ...character, inventory }, creature), inventory);
});

test('Duncans local database record and prepared online inventory use the same Carreg identity', async () => {
  const owner = (await read(new URL('duncan-gafyr-vollstaendiger-entwurf.json', folder))).character;
  const registry = await read(new URL('../../CharakterDatenbank/registry.json', import.meta.url));
  const entry = registry.records.find(r => r.firestoreDocumentId === DUNCAN_CHARACTER_ID);
  assert.ok(entry);
  const record = await read(new URL('../../CharakterDatenbank/' + entry.path, import.meta.url));
  assert.equal(record.identity.worldPersonId, 'person--haus-gafyr--duncan-gafyr');
  assert.equal(registry.count, 238);
  for (const character of [owner, record.character]) {
    const cards = character.inventory.companions.filter(c => c.creatureId === CARREG_CREATURE_SOURCE.id);
    assert.equal(cards.length, 1);
    const item = character.inventory.items.find(i => i.id === cards[0].inventoryItemId);
    assert.equal(item.creatureId, CARREG_CREATURE_SOURCE.id);
    assert.equal(item.ownerCharacterId, DUNCAN_CHARACTER_ID);
  }
});
