import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_RANKS } from '../../Stammbäume/assets/js/domain/house-profile.js';
import { selectHouseSignetTargets } from '../modules/house-knight-rings/house-ring-targets.mjs';
import { projectHouseSignetDatabase } from '../modules/house-knight-rings/house-ring-database.mjs';

const read = async path => JSON.parse(await readFile(new URL(`../../${path}`, import.meta.url), 'utf8'));
const audit = 'diagnostics/house-knight-rings-20261102/';
const [registry, snapshot, report, prepared, published, verification, before, local] = await Promise.all([
  'CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json',
  ...['prepared-characters.json', 'online-after.json', 'publication-verification.json', 'online-before.json', 'local-inventories.json'].map(file => audit + file)
].map(read));
const records = await Promise.all(prepared.targets.filter(target => target.localId).map(target =>
  read(`CharakterDatenbank/${registry.records.find(row => row.firestoreDocumentId === target.localId).path}`)));
const options = { registry, snapshot, report, records, prepared, published, verification };
options.corrections = [await read(audit + 'gildas-icon-correction.json')];

test('The frozen inventory audit selects all 52 reviewed identities once, including three local figures', () => {
  const targets = selectHouseSignetTargets({ online: before.characters, local, families: FAMILY_REGISTRY, ranks: HOUSE_RANKS });
  assert.equal(targets.length, 52);
  assert.equal(targets.filter(target => target.online).length, 49);
  assert.equal(new Set(targets.map(target => target.membership.worldPersonId)).size, 52);
  assert.deepEqual(targets.filter(target => !target.online).map(target => target.character.name).sort(),
    ['Briallen Awenor', 'Evie Rhyddid', 'Rhosyn Awenydd']);
  assert.equal(targets.find(target => target.character.name === 'Gildas Gafyr').membership.familyId, 'haus-gafyr');
  assert.ok(!targets.some(target => ['Saerwyn Gwyllach', 'Cynddelw Llythfor'].includes(target.character.name)));
});

test('An empty historical duplicate cannot duplicate or suppress the canonical worked inventory', () => {
  const character = { id: 'canonical', name: 'Gais Wyrm', identity: { worldPersonId: 'person--haus-wyrm--gais-wyrm' },
    genealogy: { houseId: 'house-wyrm' }, inventory: { items: [{ id: 'own', name: 'Eigener Besitz' }] } };
  const empty = { ...character, id: 'empty-duplicate', inventory: { items: [] } };
  const args = { local: [character], families: FAMILY_REGISTRY, ranks: HOUSE_RANKS };
  const targets = selectHouseSignetTargets({ ...args, online: [empty, character] });
  assert.equal(targets.length, 1); assert.equal(targets[0].character.id, 'canonical');
  const localOnly = selectHouseSignetTargets({ ...args, online: [empty] });
  assert.equal(localOnly.length, 1); assert.equal(localOnly[0].online, false);
  assert.throws(() => selectHouseSignetTargets({ ...args, online: [character, { ...character, id: 'worked-duplicate' }] }), /mehrere Online-Akten/);
});

test('The bounded database projection preserves local drafts, money and combat resources and is repeatable', () => {
  const input = structuredClone(options);
  const rianna = input.records.find(record => record.character.name === 'Rianna Wyrm');
  const extra = { id: 'local-draft', name: 'Eigener Entwurf', quantity: '1' };
  rianna.character.inventory.items.push(extra);
  rianna.character.inventory.money = 'Lokaler Geldentwurf'; rianna.local.notes = 'Eigene Notiz';
  const oweta = input.records.find(record => record.character.name === 'Oweta Draig');
  oweta.character.combatProfile.hitPoints = { current: 2, maximum: 20 };
  const beforeInput = structuredClone(input);
  const first = projectHouseSignetDatabase(input);
  assert.equal(first.verification.profiles, 51); assert.equal(first.verification.unlinked, 1); assert.equal(first.verification.localOnly, 3);
  assert.equal(first.unlinked[0].character.name, 'Sleipnir Varulv');
  const projectedRianna = first.records.find(entry => entry.record.character.id === rianna.character.id).record;
  assert.deepEqual(projectedRianna.character.inventory.items.find(item => item.id === extra.id), extra);
  assert.equal(projectedRianna.character.inventory.money, 'Lokaler Geldentwurf');
  assert.deepEqual(projectedRianna.local, rianna.local);
  assert.equal(first.records.find(entry => entry.record.character.id === oweta.character.id).record.character.combatProfile.hitPoints.current, 2);
  const second = projectHouseSignetDatabase({ ...input, registry: first.registry, snapshot: first.snapshot,
    report: first.report, records: first.records.map(entry => entry.record) });
  for (const key of ['records', 'registry', 'snapshot', 'report', 'exports']) assert.deepEqual(second[key], first[key], key);
  assert.deepEqual(input, beforeInput);
});

test('An unconfirmed or incomplete amendment cannot change the database', () => {
  assert.throws(() => projectHouseSignetDatabase({ ...options, verification: { ...verification, verified: false } }));
  assert.throws(() => projectHouseSignetDatabase({ ...options, verification: { ...verification, profiles: [] } }), /Besitzbeleg fehlt/);
  const wrongCorrection = structuredClone(options);
  wrongCorrection.corrections[0].character.name = 'Andere Figur';
  assert.throws(() => projectHouseSignetDatabase(wrongCorrection));
});
