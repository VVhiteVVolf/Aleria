import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCharacterArchiveEntrySignature as signature, getCharacterArchiveLogicalIdentity as identity,
  isExplicitCharacterArchiveVariant as explicit } from '../modules/character-archive/character-archive-entry-equivalence.js';

const ability = (data = {}, extra = {}) => ({ kind: 'ability', name: 'Gemeinsame Fähigkeit',
  builtin: true, data: { id: 'authored-ability', description: 'Eine Aktion. +1 RK für einen Beitrag.',
    mechanics: { armorClass: 1 }, duration: '1 Beitrag', costs: [{ id: 'source-action', resourceId: 'action', amount: 1 }], ...data }, ...extra });

test('old UUID copies and modern references share their actual rules despite provenance and current use state', () => {
  const source = ability({ usesMaximum: 2, usesCurrent: 2, active: true });
  const copied = ability({ id: '550e8400-e29b-41d4-a716-446655440000', catalogAbilityId: 'authored-ability',
    usesMaximum: 2, usesCurrent: 0, usesUsed: 2, active: false, recoveryDayKey: 'old-day',
    costs: [{ id: 'random-action-id', name: 'Aktion', resourceId: 'action', amount: 1 }],
    sourceCharacter: 'Andere öffentliche Quelle', sourceCharacterId: 'public-other', sourceClassId: 'teulu' },
  { builtin: false, archivedFromProfile: true, createdAt: '2020-01-01', updatedAt: '2026-11-03',
    sources: [{ kind: 'character', id: 'public-other', name: 'Andere öffentliche Quelle' }] });
  assert.equal(identity(copied), identity(source));
  assert.equal(signature(copied), signature(source));
  assert.equal(explicit(copied), false);
  assert.notEqual(signature(source), signature(ability({ usesMaximum: 3, usesCurrent: 2 })));
});

test('the actual Fenrir and Skjaldr Berserkergang copies are equivalent', async () => {
  const library = JSON.parse(await readFile(new URL('../data/spell-attack-library.json', import.meta.url), 'utf8'));
  const source = library.allTechniques.find(item => item.id === 'fenrir-berserkergang');
  const other = library.allTechniques.find(item => item.id === 'aldrimar-skjaldr-berserkergang');
  assert.ok(source && other);
  const left = { kind: 'ability', name: source.name, data: source, builtin: true };
  const right = { kind: 'ability', name: other.name, data: other, archivedFromProfile: true, builtin: false, updatedAt: '2026-11-03' };
  assert.equal(signature(left), signature(right));
});

test('same-name spells and traits with different effects never become equivalent', () => {
  const spell = formula => ({ kind: 'spell', name: 'Eigener Zauber', data: { id: formula, damageFormula: formula, description: 'Ein Angriff.' } });
  assert.equal(identity(spell('1d6')), identity(spell('2d6')));
  assert.notEqual(signature(spell('1d6')), signature(spell('2d6')));
  const trait = bonus => ({ kind: 'trait', name: 'Eigener Schutz', data: {
    id: 'development-trait-same-source', developmentTraitId: 'development-trait-same-source', mechanics: { armorClass: bonus } } });
  assert.equal(identity(trait(1)), identity(trait(3)));
  assert.notEqual(signature(trait(1)), signature(trait(3)));
  assert.notEqual(signature(ability()), signature(ability({ description: 'Eine Aktion. +2 RK für einen Beitrag.' })));
});

test('catalog revisions stay distinct while an unchanged detached origin retains the same rules', () => {
  const spell = reference => ({ kind: 'spell', name: 'Katalogzauber', data: { damageFormula: '1d6', catalogReference: reference } });
  assert.notEqual(signature(spell({ id: 'spell-a', revision: 'v1' })), signature(spell({ id: 'spell-a', revision: 'v2' })));
  const detached = { kind: 'spell', name: 'Katalogzauber', data: { damageFormula: '1d6', catalogOrigin: { id: 'spell-a', revision: 'v1' } } };
  assert.equal(explicit(detached), true);
  assert.equal(identity(detached), identity(spell({ id: 'spell-a', revision: 'v1' })));
  assert.equal(signature(detached), signature(spell({ id: 'spell-a', revision: 'v1' })));
  assert.notEqual(signature({ ...detached, data: { ...detached.data, damageFormula: '2d6' } }), signature(detached));
});

test('Gebundene Spitze keeps its form scope even when name, description and damage match', () => {
  const technique = form => ({ kind: 'technique', name: 'Gebundene Spitze', data: {
    id: `source-${form}`, combatStyleId: 'drachentanz', combatStyleFormId: form, damageFormula: '1d8', description: 'Bindet die gegnerische Spitze.' } });
  assert.notEqual(identity(technique('form-a')), identity(technique('form-b')));
  assert.notEqual(signature(technique('form-a')), signature(technique('form-b')));
  assert.notEqual(signature(technique('form-a')), signature({ ...technique('form-a'), data: {
    ...technique('form-a').data, archivePlacement: { personName: 'Öffentliche Testfigur' } } }));
});

test('personal ability ownership is protected while a shared rage ignores source ownership', () => {
  const personal = name => ({ kind: 'ability', name: 'Arkaner Schrei', data: {
    id: 'freya-arkaner-schrei', sourceCharacter: name, damageFormula: '1d6' } });
  assert.notEqual(identity(personal('Freya Skald')), identity(personal('Gawain Draig')));
  assert.notEqual(signature(personal('Freya Skald')), signature(personal('Gawain Draig')));
  const bound = id => ability({ personal: true, sourceCharacterId: id });
  assert.notEqual(signature(bound('public-a')), signature(bound('public-b')));
  const shared = id => ability({ id: 'fenrir-berserkergang', sourceCharacterId: id });
  assert.equal(signature(shared('public-a')), signature(shared('public-b')));
});

test('explicit pictures, clearing and manual labels protect refresh ownership without duplicating equal rules', () => {
  const automatic = ability({}, { id: 'automatic', archivedFromProfile: true, builtin: false, updatedAt: '2026-11-03', icon: '/automatic.png' });
  assert.equal(explicit(automatic), false);
  assert.equal(signature(automatic), signature(ability({}, { icon: '/new-automatic.png' })));
  const first = { ...automatic, iconOverride: '/my-first.png' }, second = { ...automatic, iconOverride: '/my-second.png' };
  assert.equal(explicit(first), true);
  assert.equal(signature(first), signature(second));
  assert.equal(signature(first), signature(automatic));
  const cleared = { ...automatic, iconAssignmentVersion: 1, icon: '' };
  assert.equal(explicit(cleared), true);
  assert.equal(signature(cleared), signature(automatic));
  assert.equal(explicit({ ...automatic, id: 'custom--my-version' }), true);
  assert.equal(explicit({ ...automatic, archivedFromProfile: false }), true);
  assert.equal(signature({ ...automatic, archivedFromProfile: false }), signature(automatic));
  assert.equal(signature(ability({ explicitVariant: true, userAuthored: true })), signature(ability()));
});

test('offers, possessions and animals retain separate instance identity without source mutation', () => {
  const item = (section, id, owner = 'public-owner') => ({ kind: 'register-pferde', name: 'Afol', data: {
    section, id, ownerCharacterId: owner, instanceId: section === 'owned' ? id : undefined,
    mountId: 'afol', definitionRef: { id: 'standard:afol', revision: 'current' }, description: 'Dieselbe Rasse.' } });
  for (const section of ['owned', 'offer']) {
    const first = item(section, 'first'), second = item(section, 'second'), before = structuredClone([first, second]);
    assert.notEqual(identity(first), identity(second));
    assert.notEqual(signature(first), signature(second));
    assert.deepEqual([first, second], before);
  }
  assert.notEqual(identity(item('owned', 'first', 'public-owner-a')), identity(item('owned', 'first', 'public-owner-b')));
});

test('only known bookkeeping is ignored; unknown rule IDs, states and rule fields remain significant', () => {
  assert.notEqual(signature(ability({ mechanics: { ruleIdentity: { id: 'rule-a' } } })),
    signature(ability({ mechanics: { ruleIdentity: { id: 'rule-b' } } })));
  assert.notEqual(signature(ability({ futureRule: { resistanceBudget: 1 } })), signature(ability({ futureRule: { resistanceBudget: 2 } })));
  assert.equal(signature(ability({ state: { active: true, usesUsed: 0 } })), signature(ability({ state: { active: false, usesUsed: 2 } })));
  assert.notEqual(signature(ability({ state: { authoredMode: 'first' } })), signature(ability({ state: { authoredMode: 'second' } })));
  assert.notEqual(signature(ability({ mechanics: { state: { active: true } } })), signature(ability({ mechanics: { state: { active: false } } })));
  assert.notEqual(signature(ability({ effects: [{ active: true, type: 'armor', amount: 1 }] })),
    signature(ability({ effects: [{ active: false, type: 'armor', amount: 1 }] })));
});

test('object key order, redundant cost IDs and description whitespace are immaterial but effect ordering is retained', () => {
  const first = ability({ mechanics: { armorClass: 1, damageBonus: 2 }, description: 'Eine Aktion.\n +1 RK für einen Beitrag.',
    costs: [{ id: 'first', resourceId: 'action', amount: 1 }, { id: 'second', resourceId: 'reaction', amount: 1 }] });
  const second = ability({ mechanics: { damageBonus: 2, armorClass: 1 },
    costs: [{ id: 'fourth', resourceId: 'reaction', amount: 1 }, { id: 'third', resourceId: 'action', amount: 1 }] });
  const before = structuredClone(first);
  assert.equal(signature(first), signature(second));
  assert.deepEqual(first, before);
  const a = { type: 'prepare' }, b = { type: 'consume' };
  assert.notEqual(signature(ability({ effects: [a, b] })), signature(ability({ effects: [b, a] })));
});

test('empty default damage types and fully normalized sheet defaults describe the same effective ability', () => {
  const raw = { kind: 'ability', name: 'Defaultprüfung', data: { name: 'Defaultprüfung', damageType: '',
    effects: [{ type: 'damage', damageType: '', formula: '1d6', target: 'self', on: 'always' }] } };
  const filled = structuredClone(raw); filled.data.damageType = 'physisch'; filled.data.effects[0].damageType = 'physisch';
  assert.equal(signature(raw), signature(filled));
});
