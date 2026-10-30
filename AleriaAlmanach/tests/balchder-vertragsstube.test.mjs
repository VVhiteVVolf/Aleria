import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { HOUSE_BALCHDER_FAMILY } from '../../Stammbäume/assets/js/data/house-balchder-family.js';
import { HOUSE_GELYN_FAMILY } from '../../Stammbäume/assets/js/data/house-gelyn-family.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { getPersonBiographyModule } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import diplomatie from '../../Kontinente/modules/administration/data/celtigerns-diplomatie.mjs';
import { administrationRoleBrief } from '../../Kontinente/modules/administration/administration-role-briefs.mjs';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';

const person = (family, id) => family.persons.find(p => p.id === id);
const horse = getBuiltinCreatureTemplates().find(c => c.id === 'companion-kamber-silberwind');
const exportsRoot = new URL('../../Charakter Archiv Exporte/balchder-vertragsstube-2026-10-29/', import.meta.url);

test('Kamber has one shared biography and the children retain only known birth, family and assigned work', () => {
  const kamber = person(HOUSE_BALCHDER_FAMILY, 'kamber-balchder');
  assert.equal(kamber.worldPersonId, person(HOUSE_GELYN_FAMILY, 'kamber-balchder').worldPersonId);
  assert.deepEqual(getPersonBiographyModule(kamber), getPersonBiographyModule(person(HOUSE_GELYN_FAMILY, 'kamber-balchder')));
  const text = JSON.stringify(getPersonBiographyModule(kamber));
  for (const term of ['empirisch', 'pragmatisch', 'Uchelwyr', 'Silberwind', 'gutes Essen', 'sofern']) assert.ok(text.includes(term), term);
  for (const [id, birth] of [['blodwen-balchder', '1722'], ['rice-balchder', '1728']]) {
    const child = person(HOUSE_BALCHDER_FAMILY, id), bio = getPersonBiographyModule(child);
    assert.equal(child.birth, birth);
    assert.equal(bio.quote, ''); assert.equal(bio.biography.abilities.length, 0);
    assert.equal(bio.biography.historyText, '');
    assert.deepEqual(HOUSE_BALCHDER_FAMILY.parentages.filter(p => p.childId === id).flatMap(p => p.parentIds).sort(), ['kamber-balchder', 'senara-gelyn']);
  }
});

test('both children report directly to Kamber without altering the five equal core offices', () => {
  assert.equal(diplomatie.groups.find(g => g.kind === 'core').roles.length, 5);
  const group = diplomatie.groups.find(g => g.id === 'vertragsstube');
  assert.deepEqual(group.roles.map(r => r.name), ['Blodwen Balchder', 'Rice Balchder']);
  for (const role of group.roles) {
    assert.equal(role.reportsTo, 'Kamber Balchder · Vertragsmeister');
    const brief = administrationRoleBrief({ role, group, area: diplomatie });
    assert.equal(brief.duties.length, 3);
  }
});

test('biography upgrades preserve other people, custom notes, family graph and existing Armel biography', () => {
  for (const source of [HOUSE_BALCHDER_FAMILY, HOUSE_GELYN_FAMILY]) {
    const old = normalizeFamily(source);
    old.extensions.sourceRevision--;
    const updatedIds = new Set(['kamber-balchder', 'blodwen-balchder', 'rice-balchder']);
    for (const p of old.persons) {
      if (updatedIds.has(p.id)) { delete p.extensions.biographyModule; p.title = ''; }
      else { p.notes = 'Eigene unveränderte Notiz'; p.portrait = '/eigene-datei.png'; }
    }
    const result = resolveRegisteredFamilyUpgrade(source, old);
    assert.deepEqual(result.partnerships, old.partnerships);
    assert.deepEqual(result.parentages, old.parentages);
    for (const p of old.persons) {
      const next = person(result, p.id);
      if (updatedIds.has(p.id)) assert.ok(getPersonBiographyModule(next));
      else assert.deepEqual(next, p, p.id);
    }
  }
});

test('Silberwind has one identity, a real Rhyfel reference, portrait and idempotent additive ownership', async () => {
  assert.ok(horse);
  assert.equal(getBuiltinCreatureTemplates().filter(c => c.id === horse.id).length, 1);
  assert.equal(horse.species, 'Rhyfel');
  assert.equal(horse.bestiaryReference.id, 'tiere/pferde/rhyfel');
  assert.equal(horse.itemOrigin.ownerCharacterId, 'person--haus-balchder--kamber-balchder');
  await access(new URL('../..' + horse.bestiaryReference.url, import.meta.url));
  const png = await readFile(new URL('../..' + horse.portrait, import.meta.url));
  assert.equal(png.readUInt32BE(16) / png.readUInt32BE(20), 2 / 3);
  const owner = { id: horse.itemOrigin.ownerCharacterId, name: 'Kamber Balchder', combatProfile: { marker: 'Unverändert' }, inventory: { items: [{ id: 'existing', name: 'Bestehender Besitz' }] } };
  const inventory = attachCreatureToInventory(owner, horse, '2026-10-29T00:00:00.000Z');
  assert.deepEqual(inventory.items[0], owner.inventory.items[0]);
  assert.equal(inventory.items.find(item => item.creatureId === horse.id).individualizedAt, '2026-10-29T00:00:00.000Z');
  assert.deepEqual(attachCreatureToInventory({ ...owner, inventory }, horse), inventory);
  assert.equal(owner.inventory.items.length, 1);
});

test('character exports use canonical world identities and omit existing inventories and combat state', async () => {
  for (const id of ['kamber-balchder', 'blodwen-balchder', 'rice-balchder']) {
    const { character } = JSON.parse(await readFile(new URL(`${id}.json`, exportsRoot), 'utf8'));
    assert.equal(character.id, `person--haus-balchder--${id}`);
    assert.equal(character.identity.worldPersonId, character.id);
    assert.ok(character.biography);
    assert.ok(!Object.hasOwn(character, 'inventory'));
    assert.ok(!Object.hasOwn(character, 'combatProfile'));
  }
});
