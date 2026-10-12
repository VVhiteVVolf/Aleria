import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { GWYVERN_RHYFEL_COMPANIONS } from '../modules/creatures/catalog/gwyvern-rhyfel-companions.js';
import { IDWAL_SHIP_CATS, TREVOR_CHARACTER_ID } from '../modules/creatures/catalog/idwal-ship-cats.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { sanitizeCreature, normalizeCreatureImportPayload } from '../modules/creatures/creature-model.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { mergeCharacterDatabases } from '../../CharakterDatenbank/assets/js/character-database-client.mjs';
const folder = new URL('../../Charakter Archiv Exporte/gefaehrten/gwyvern-rhyfel-2026-10-12/', import.meta.url);
const read = async url => JSON.parse(await readFile(url, 'utf8'));

test('selected stallions and mare retain exact approved art, distinct identities and horse level cap', async () => {
  const manifest = await read(new URL('vorbereitung.json', folder));
  const catalog = getBuiltinCreatureTemplates();
  assert.deepEqual(GWYVERN_RHYFEL_COMPANIONS.map(c => [c.name, c.species, c.level]), [
    ['Struppi', 'Rhyfel-Hengst', 3], ['Dyreth', 'Rhyfel-Hengst', 3], ['Uffyrae', 'Rhyfel-Stute', 2]
  ]);
  for (const spec of GWYVERN_RHYFEL_COMPANIONS) {
    const [creature] = normalizeCreatureImportPayload(await read(new URL(`${spec.id}.json`, folder)));
    assert.equal(catalog.filter(c => c.id === spec.id).length, 1);
    assert.equal(creature.bestiaryReference.id, 'tiere/pferde/rhyfel');
    assert.equal(creature.combatProfile.progression.level, creature.level);
    const art = manifest.assets.find(a => a.name === spec.name);
    const bytes = await readFile(new URL('../..' + spec.portrait, import.meta.url));
    assert.deepEqual(bytes, await readFile(new URL('../../' + art.selectedOriginal, import.meta.url)));
    assert.equal(bytes.readUInt32BE(16), 1024);
    assert.equal(bytes.readUInt32BE(20), 1536);
  }
  const names = vm.createContext({});
  vm.runInContext(await readFile(new URL('../modules/name-list/name-list-data.js', import.meta.url), 'utf8') + '\nglobalThis.names=createRheunwaithNameListData();', names);
  assert.ok(names.names.groups[0].names.includes('Dyreth'));
  assert.ok(names.names.groups[1].names.includes('Uffyrae'));
});

test('genealogy imports identify both siblings separately from the existing Bronhir errand boy', async () => {
  for (const [person, birth, sex, horse] of [['huw', '1722', 'male', 'Dyreth'], ['tegwen', '1720', 'female', 'Uffyrae']]) {
    const payload = await read(new URL(`charaktere/person--haus-gwyvern--${person}-gwyvern.json`, folder));
    const character = payload.character;
    assert.equal(character.id, character.identity.worldPersonId);
    assert.equal(character.genealogy.birth, birth);
    assert.equal(character.genealogy.sex, sex);
    assert.deepEqual(character.genealogy.relationships.parents.map(p => p.name), ['Mervyn Gwyvern', 'Jeannae Aderyn']);
    assert.match(character.portrait, /Stammbäume\/assets\/images\/portraits\/haus-gwyvern\//);
    await readFile(new URL('../' + character.portrait, import.meta.url));
    assert.deepEqual(character.inventory.companions.map(c => c.name), [horse]);
    assert.equal(character.combatProfile, undefined);
  }
});

test('all three owners have unique bidirectional links and Trevor retains both ship cats', async () => {
  const creatures = [...IDWAL_SHIP_CATS, ...GWYVERN_RHYFEL_COMPANIONS].map(sanitizeCreature);
  for (const ownerId of [...new Set(creatures.map(c => c.itemOrigin.ownerCharacterId))]) {
    const character = (await read(new URL(`charaktere/${ownerId}.json`, folder))).character;
    const views = inventoryCompanionViews(character.inventory, creatures);
    for (const creature of creatures.filter(c => c.itemOrigin.ownerCharacterId === ownerId)) {
      const card = views.filter(c => c.creatureId === creature.id);
      assert.equal(card.length, 1);
      const item = character.inventory.items.find(i => i.id === creature.itemOrigin.inventoryItemId);
      assert.equal(item.creatureId, creature.id);
      assert.equal(item.ownerCharacterId, character.id);
      assert.deepEqual(attachCreatureToInventory(character, creature), character.inventory);
    }
    if (ownerId === TREVOR_CHARACTER_ID) assert.deepEqual(views.filter(c => c.creatureId).map(c => c.name), ['Bwmbo', 'Uffel', 'Struppi']);
  }
  const backfill = await read(new URL('bestiarium-nachpflege.json', folder));
  assert.equal(backfill.updates.length, 25);
  for (const patch of backfill.updates) {
    assert.deepEqual(patch.updateMask, ['bestiaryReference']);
    assert.deepEqual(Object.keys(patch.fields), ['bestiaryReference']);
    assert.ok(patch.expectedUpdateTime);
  }
});

test('local character database exposes the new siblings while online inventories retain precedence', async () => {
  const snapshot = await read(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url));
  const registry = await read(new URL('../../CharakterDatenbank/registry.json', import.meta.url));
  assert.equal(registry.count, snapshot.characters.length);
  for (const [id, horse] of [['person--haus-gwyvern--huw-gwyvern', 'Dyreth'], ['person--haus-gwyvern--tegwen-gwyvern', 'Uffyrae']]) {
    const character = snapshot.characters.find(c => c.id === id);
    assert.ok(character);
    assert.deepEqual(character.inventory.companions.map(c => c.name), [horse]);
    const entry = registry.records.find(r => r.firestoreDocumentId === id);
    const record = await read(new URL('../../CharakterDatenbank/' + entry.path, import.meta.url));
    assert.equal(record.identity.worldPersonId, id);
    assert.equal(entry.contentHash, record.sync.contentHash);
  }
  const trevor = snapshot.characters.find(c => c.id === TREVOR_CHARACTER_ID);
  assert.deepEqual(trevor.inventory.companions.filter(c => c.creatureId).map(c => c.name), ['Bwmbo', 'Uffel', 'Struppi']);
  const online = { id: TREVOR_CHARACTER_ID, name: 'Trevor Gwyvern', inventory: { items: [{ id: 'newer-possession' }] } };
  const merged = mergeCharacterDatabases([online], snapshot.characters);
  assert.deepEqual(merged.find(c => c.id === online.id).inventory, online.inventory);
  assert.ok(merged.some(c => c.id === 'person--haus-gwyvern--huw-gwyvern'));
  assert.ok(merged.some(c => c.id === 'person--haus-gwyvern--tegwen-gwyvern'));
});
