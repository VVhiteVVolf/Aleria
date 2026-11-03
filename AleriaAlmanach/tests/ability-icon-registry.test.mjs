import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  ABILITY_ICON_ASSETS,
  getArchiveAbilityIconSource,
  getCharacterAbilityIconSource
} from '../modules/character-archive/character-archive-ability-icons.js';
import { getCombatEntryIconPresentation } from '../modules/combat/combat-entry-icons.js';
import { getCharacterSheetEntryIconPresentation } from '../modules/character-archive/character-archive-icons.js';
import { getCharacterArchiveEntrySignature } from '../modules/character-archive/character-archive-entry-equivalence.js';

const root = '/AleriaAlmanach/public/assets/ability-icons/';
const freya = { id: 'ksJQe8Ai4KbRE9jOAvb7', name: 'Freya Skald' };
const gawain = { id: 'q1QtSIug74FzzwUAqWrs', name: 'Gawain Draig' };
const freyaAbility = { id: 'freya-arkaner-schrei', name: 'Arkaner Schrei' };

test('personal ability artwork requires the stable ability ID and its documented owner', () => {
  assert.equal(getCharacterAbilityIconSource(freyaAbility, freya), `${root}freya-arkaner-schrei.png`);
  assert.equal(getCharacterAbilityIconSource(freyaAbility, gawain), '');
  assert.equal(getCharacterAbilityIconSource(freyaAbility), '');
  assert.equal(getCharacterAbilityIconSource({ name: 'Arkaner Schrei' }, freya), '');
  assert.equal(getCharacterAbilityIconSource({ id: 'other', name: 'Arkaner Schrei' }, freya), '');
  assert.equal(getCharacterAbilityIconSource(freyaAbility, { id: gawain.id, name: freya.name }), '');
  assert.equal(getCharacterAbilityIconSource({ ...freyaAbility, sourceCharacter: gawain.name }, freya), '');
  assert.equal(getCharacterAbilityIconSource({ ...freyaAbility, sourceCharacter: freya.name }, { id: 'other-person', name: 'Andere Figur' }), '');
});

test('Gawain ring artwork does not become a generic ring-bearer picture', () => {
  const ring = { id: 'gawain-draig-draig-knight-signet', name: 'Draig-Rittersiegelring' };
  assert.equal(getCharacterAbilityIconSource(ring, gawain), `${root}gawain-draig-rittersiegelring.png`);
  assert.equal(getCharacterAbilityIconSource(ring, { name: 'Gethin Draig' }), '');
  assert.equal(getCharacterAbilityIconSource({ name: ring.name }, gawain), '');
  assert.equal(getCharacterAbilityIconSource({ id: 'other-ring', name: ring.name }, gawain), '');
});

test('shared recovery, rage and companions use shared motifs across characters', () => {
  assert.equal(getCharacterAbilityIconSource({ id: 'martial-durchschnaufen' }, gawain), `${root}durchschnaufen.png`);
  assert.equal(getCharacterAbilityIconSource({ name: 'Durchschnaufen' }, freya), `${root}durchschnaufen.png`);
  assert.equal(getCharacterAbilityIconSource({ id: 'fenrir-berserkergang' }), `${root}berserkergang.png`);
  assert.equal(getCharacterAbilityIconSource({ name: 'Berserkergang · Alter Zorn' }), `${root}berserkergang.png`);
  assert.equal(getCharacterAbilityIconSource({ id: 'starter-skytte-animal-companion' }), `${root}tierbegleiter.png`);
  assert.equal(getCharacterAbilityIconSource({ id: 'starter-ceidwynr-bird-companion' }), `${root}vogelbegleiter.png`);
  assert.equal(getCharacterAbilityIconSource({ name: 'Muttersoehnchen' }), '');
});

test('archive owner sources resolve personal icons without changing source records', () => {
  const entry = { kind: 'ability', name: freyaAbility.name, data: { ...freyaAbility }, sources: [{ kind: 'character', ...freya }] };
  const before = structuredClone(entry);
  assert.equal(getArchiveAbilityIconSource(entry), `${root}freya-arkaner-schrei.png`);
  assert.deepEqual(entry, before);
  assert.equal(getArchiveAbilityIconSource({ ...entry, sources: [{ kind: 'character', ...gawain }] }), '');
  assert.equal(getArchiveAbilityIconSource({ ...entry, sources: [{ kind: 'character', ...freya }, { kind: 'character', ...gawain }] }), '');
  assert.equal(getArchiveAbilityIconSource({ ...entry, sources: [{ kind: 'character', ...freya }, { kind: 'character', id: 'other-person', name: 'Andere Figur' }] }), '');
  assert.equal(getArchiveAbilityIconSource({ ...entry, sources: [{ kind: 'character-library', id: 'vennyr-teulu', name: freya.name }] }), `${root}freya-arkaner-schrei.png`);
});

test('explicit individual icons retain priority in character and archive presentations', () => {
  assert.equal(getCharacterAbilityIconSource({ ...freyaAbility, icon: '/custom.png' }, gawain), '/custom.png');
  assert.equal(getArchiveAbilityIconSource({ iconOverride: '/override.png', icon: '/custom.png', data: freyaAbility }), '/override.png');
  assert.equal(getCombatEntryIconPresentation('ability', freyaAbility, freya).source, `${root}freya-arkaner-schrei.png`);
  assert.equal(getCombatEntryIconPresentation('ability', { ...freyaAbility, icon: '/custom.png' }, freya).source, '/custom.png');
  assert.equal(getCharacterSheetEntryIconPresentation('ability', freyaAbility, [], freya).source, `${root}freya-arkaner-schrei.png`);
  const foreignArchive = [{ kind: 'ability', name: freyaAbility.name, data: { ...freyaAbility, icon: '/foreign.png' }, sources: [{ kind: 'character', ...gawain }] }];
  assert.equal(getCharacterSheetEntryIconPresentation('ability', freyaAbility, foreignArchive, freya).source, `${root}freya-arkaner-schrei.png`);
});

test('all eleven ability assets have preserved prompts, original PNGs and active 256px PNGs', () => {
  const art = new URL('../docs/art/ability-icons/', import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', art), 'utf8'));
  assert.equal(new Set(ABILITY_ICON_ASSETS).size, 11);
  assert.deepEqual(new Set(manifest.jobs.map(job => job.asset)), new Set(ABILITY_ICON_ASSETS));
  for (const job of manifest.jobs) {
    assert.ok(job.prompt.length > 300, job.asset);
    assert.ok(job.refs.length >= (job.owner ? 2 : 1), job.asset);
    assert.ok(fs.existsSync(new URL(`sources/${job.asset}.png`, art)), `original ${job.asset}`);
    const bytes = fs.readFileSync(new URL(`../public/assets/ability-icons/${job.asset}.png`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', job.asset);
    assert.equal(bytes.readUInt32BE(16), 256, job.asset);
    assert.equal(bytes.readUInt32BE(20), 256, job.asset);
    assert.equal(bytes[25], 6, `RGBA ${job.asset}`);
  }
});

test('all seven public personal abilities recognize old unlinked UUID copies only with one confirmed matching owner', () => {
  const library = JSON.parse(fs.readFileSync(new URL('../data/spell-attack-library.json', import.meta.url), 'utf8'));
  const personalIds = ['freya-arkaner-schrei', 'gildas-gewissenhafte-vorbereitung', 'gildas-schutzpflicht',
    'gawain-liebt-duefte', 'gawain-draig-draig-knight-signet', 'wolfshorn-asgeir-border-veteran', 'wolfshorn-ylva-border-veteran'];
  personalIds.forEach((id, index) => {
    const current = library.allTechniques.find(item => item.id === id);
    assert.ok(current, id);
    const owner = { id: current.sourceCharacterId, name: current.sourceCharacter };
    const foreign = owner.id === freya.id ? gawain : freya;
    const old = { ...structuredClone(current), id: `570ef618-981d-4f69-8a38-${String(index + 1).padStart(12, '0')}` };
    for (const key of ['catalogAbilityId', 'sourceAbilityId', 'icon', 'iconOverride', 'sourceCharacterId', 'sourceCharacter',
      'ownerCharacterId', 'ownerCharacterName', 'characterId', 'characterName']) delete old[key];
    const expected = getCharacterAbilityIconSource({ id }, owner);
    assert.ok(expected, id);
    assert.equal(getCharacterAbilityIconSource(old, owner), expected, id);
    assert.equal(getCharacterAbilityIconSource({ ...old, sourceCharacterId: owner.id, sourceCharacter: owner.name }), expected, id);
    assert.equal(getArchiveAbilityIconSource({ kind: 'ability', name: old.name, data: old, sources: [{ kind: 'character', ...owner }] }), expected, id);
    assert.equal(getCharacterAbilityIconSource(old, foreign), '', `foreign owner: ${id}`);
    assert.equal(getCharacterAbilityIconSource(old), '', `missing owner: ${id}`);
    assert.equal(getCharacterAbilityIconSource({ name: old.name }, owner), '', `missing UUID: ${id}`);
    assert.equal(getCharacterAbilityIconSource({ ...old, id: 'other-custom-ability' }, owner), '', `non-UUID identity: ${id}`);
    assert.equal(getCharacterAbilityIconSource({ ...old, catalogAbilityId: 'another-explicit-template' }, owner), '', `different reference: ${id}`);
    assert.equal(getCharacterAbilityIconSource({ ...old, name: `${old.name} Variante` }, owner), '', `different exact name: ${id}`);
    assert.equal(getArchiveAbilityIconSource({ kind: 'ability', name: old.name, data: old,
      sources: [{ kind: 'character', ...owner }, { kind: 'character', ...foreign }] }), '', `ambiguous owners: ${id}`);
    const currentEntry = { kind: 'ability', name: current.name, data: current, builtin: true,
      sources: [{ kind: 'character', ...owner }] };
    const oldEntry = { kind: 'ability', name: old.name, data: old, archivedFromProfile: true,
      sources: [{ kind: 'character', ...owner }] };
    assert.equal(getCharacterArchiveEntrySignature(oldEntry), getCharacterArchiveEntrySignature(currentEntry), `same personal binding: ${id}`);
  });
});
