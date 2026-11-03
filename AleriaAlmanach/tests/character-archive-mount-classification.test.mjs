import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCharacterArchiveEntries as classify, createArchiveMountEntry } from '../modules/character-archive/character-archive-classification.js';
import { ARCHIVE_PAGE_MOUNTS } from '../modules/character-archive/character-archive-page-data.js';
import { normalizeCharacterArchiveEntry as normalize, mergeCharacterArchiveEntries as merge,
  extractCharacterArchiveEntries, projectItemRegisterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { getCharacterArchiveEntrySignature } from '../modules/character-archive/character-archive-entry-equivalence.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const mount = ARCHIVE_PAGE_MOUNTS.find(value => value.id === 'afol');
const standard = STANDARD_ITEMS.find(value => value.mountId === mount.id);
const registerEntry = projectItemRegisterArchiveEntries([standard])[0];

test('old Rossmarkt breed and current standard normalize to the same complete semantic projection', () => {
  const old = createArchiveMountEntry(mount);
  const before = structuredClone([old, registerEntry]);
  const result = classify([old, registerEntry]);
  assert.equal(getCharacterArchiveEntrySignature(result[0]), getCharacterArchiveEntrySignature(result[1]));
  assert.equal(merge(result).length, 1);
  assert.deepEqual([old, registerEntry], before);
});

test('offers and owned horses retain instance IDs, provider art, owner links and individual statistics', () => {
  for (const section of ['offer', 'owned']) {
    const value = normalize({ kind: 'register-pferde', name: mount.name, builtin: true,
      icon: '/individual-horse.png', data: { ...standard, id: `${section}:public-horse`, section,
        ownerCharacterId: 'public-owner', creatureId: 'public-creature', speed: 13, temperament: 'Ruhig' } });
    const before = structuredClone(value);
    assert.deepEqual(classify([value, registerEntry])[0], value);
    assert.deepEqual(value, before);
  }
});

test('a matching breed name never overwrites custom or individual records without a register section', () => {
  const values = [
    normalize({ kind: 'register-pferde', name: mount.name, data: { id: 'individual-afol', speed: 15, hitPoints: 42 }, icon: '/individual.png' }),
    normalize({ kind: 'register-pferde', name: mount.name, builtin: true, archivedFromProfile: true,
      data: { entityType: 'creature', id: 'named-afol', ownerCharacterId: 'public-owner', combatProfile: { resources: [{ id: 'stamina', current: 3 }] } } }),
    normalize({ kind: 'ancestry', name: mount.name, archivedFromProfile: true,
      sources: [{ kind: 'creature', id: 'individual', name: 'Individuelles Pferd' }], data: { name: mount.name, speed: 17 } }),
    normalize({ kind: 'register-pferde', name: mount.name, iconOverride: '/custom-breed.png', updatedAt: '2026-11-03',
      data: { ...mount, description: 'Eigene Zuchtbeschreibung.' } }),
    normalize({ kind: 'ancestry', name: 'Hest-Mischling', description: 'Individuelle Zuchtlinie.',
      sources: [{ kind: 'creature', id: 'individual-mixed' }], data: { speed: 18 } })
  ];
  for (const value of values) assert.deepEqual(classify([value, registerEntry])[0], value, value.id);
});

test('minimal species identities from actual creature projections become breed references without modifying the creature', () => {
  const creature = { id: 'public-horse-fixture', name: 'Individuelles Pferd', entityType: 'creature', species: mount.name,
    combatProfile: { identity: { ancestry: mount.name }, hitPoints: { current: 7, maximumOverride: 21 }, resources: [] } };
  const before = structuredClone(creature);
  const ancestry = extractCharacterArchiveEntries(creature, 'creature').find(value => value.kind === 'ancestry');
  const result = classify([ancestry, registerEntry]);
  assert.equal(merge(result).length, 1);
  assert.equal(result[0].kind, 'register-pferde');
  assert.equal(result[0].data.section, 'standard');
  assert.ok(result[0].sources.some(source => source.id === creature.id));
  assert.deepEqual(creature, before);
});

test('known legacy breed prices refresh while non-breed prose and individual unknown entries remain distinct', () => {
  const legacy = { kind: 'register-pferde', name: mount.name, builtin: true, data: { price: '999', currency: 'Taler' } };
  assert.equal(classify([legacy, registerEntry])[0].data.priceRange.maxCopper, standard.priceRange.maxCopper);
  const note = { kind: 'register-pferde', name: 'Fellfarbe', builtin: true };
  assert.deepEqual(classify([note]), []);
  const individual = normalize({ kind: 'register-pferde', name: 'Fellfarbe', builtin: true, data: { id: 'individual-pie-bald', speed: 16 } });
  assert.deepEqual(classify([individual]), [individual]);
});

test('only evidenced automatic saved breed descriptions refresh; authored or custom-icon copies stay intact', () => {
  const automatic = { ...createArchiveMountEntry(mount), builtin: false, archivedFromProfile: true,
    updatedAt: '2026-09-21', description: 'Veraltete automatische Rassenbeschreibung' };
  const result = merge(classify([automatic, registerEntry]));
  assert.equal(result.length, 1);
  assert.equal(result[0].description, standard.description);
  assert.ok(result[0].sources.some(source => source.id === `rossmarkt:${mount.id}`));
  for (const changed of [
    { ...automatic, data: { ...automatic.data, userAuthored: true } },
    { ...automatic, iconOverride: '/custom-horse-icon.png' },
    { ...automatic, archivedFromProfile: false }
  ]) assert.deepEqual(classify([changed, registerEntry])[0], changed);
});
