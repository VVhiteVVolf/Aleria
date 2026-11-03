import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { normalizeCharacterArchiveEntry as normalize, mergeCharacterArchiveEntries as merge,
  createCharacterArchiveProfileItem, getCharacterArchiveKind } from '../modules/character-archive/character-archive-model.js';
import { normalizeCombatAbility } from '../modules/combat/combat-profile-model.js';
import { getCharacterArchiveEntrySignature as signature, isExplicitCharacterArchiveVariant as explicit } from '../modules/character-archive/character-archive-entry-equivalence.js';
import { projectCharacterArchiveViewEntries, getCharacterArchiveViewId } from '../modules/character-archive/character-archive-view-projection.js';
import { getCharacterAbilityIconSource } from '../modules/character-archive/character-archive-ability-icons.js';
import { createSecondWind } from '../modules/classes/martial-recovery.js';
import { FIRE_SPELL_ARSENAL } from '../modules/character-archive/fire-spell-arsenal.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { getCombatStyle } from '../modules/combat-styles/combat-style-registry.js';

// Only shipped rule sources and public-library records are read. UUIDs below
// reproduce legacy archive copies; no stored/live record is changed by a test.
const freya = { kind: 'character', id: 'ksJQe8Ai4KbRE9jOAvb7', name: 'Freya Skald' };
const gawain = { kind: 'character', id: 'q1QtSIug74FzzwUAqWrs', name: 'Gawain Draig' };
const system = { kind: 'system', id: 'martial-recovery', name: 'Durchschnaufen' };
const wind = createSecondWind();
const abilityEntry = (data, extra = {}) => normalize({ kind: 'ability', name: data.name,
  description: data.description, data: structuredClone(data), ...extra });
const currentWind = () => abilityEntry(wind, { builtin: true, sources: [system] });
const legacyWind = (extraData = {}, extraEntry = {}) => abilityEntry({ ...wind,
  id: '8fba3092-778b-4334-94a3-f4e248e457aa', ...extraData },
{ archivedFromProfile: true, sources: [freya], ...extraEntry });
const hasSource = (entry, source) => entry.sources.some(value => value.kind === source.kind && value.id === source.id);

test('legacy UUID ability copies with identical published rules coalesce with the current catalog and retain all sources', () => {
  const old = legacyWind(), current = currentWind(), before = structuredClone([old, current]);
  for (const input of [[old, current], [current, old]]) {
    const result = merge(input);
    assert.equal(result.length, 1, 'UUID copies of Durchschnaufen must not duplicate its catalog template');
    assert.ok(hasSource(result[0], freya));
    assert.ok(hasSource(result[0], system));
    assert.equal(result[0].name, wind.name);
  }
  assert.deepEqual([old, current], before);
});

test('unbound spells with the same name and different actual damage rules remain two templates', () => {
  const spell = structuredClone(FIRE_SPELL_ARSENAL.find(value => value.name === 'Feuerpfeil'));
  assert.ok(spell);
  delete spell.catalogReference;
  delete spell.catalogOrigin;
  const left = normalize({ kind: 'spell', name: spell.name, data: { ...spell, id: 'unbound-fire-one', rollFormula: '2d10' } });
  const right = normalize({ kind: 'spell', name: spell.name, data: { ...spell, id: 'unbound-fire-two', rollFormula: '3d10' } });
  const result = merge(left, right);
  assert.equal(result.length, 2);
  assert.deepEqual(new Set(result.map(value => value.data.rollFormula)), new Set(['2d10', '3d10']));
});

test('a shared developmentTraitId never collapses a genuinely changed trait effect', () => {
  const published = DEVELOPMENT_TRAITS.find(value => value.id === 'development-trait-standfest' || value.id === 'standfest');
  assert.ok(published);
  const source = { ...structuredClone(published), developmentTraitId: 'development-trait-standfest' };
  const left = normalize({ kind: 'trait', name: published.name || published.label, builtin: true,
    data: { ...source, id: 'development-trait-standfest', mechanics: { armorClass: 1, movement: -1 } } });
  const right = normalize({ kind: 'trait', name: left.name,
    data: { ...source, id: 'edited-standfest', mechanics: { armorClass: 2, movement: -1 } } });
  const result = merge(left, right);
  assert.equal(result.length, 2);
  assert.deepEqual(new Set(result.map(value => value.data.mechanics.armorClass)), new Set([1, 2]));
});

test('equal technique names and rules remain separate when their actual combat-form context differs', () => {
  const style = getCombatStyle('drachentanz');
  const [first, second] = style.forms;
  const technique = structuredClone(first.techniques[0]);
  const left = normalize({ kind: 'technique', name: technique.name, data: { ...technique,
    id: 'old-form-copy-one', catalogTechniqueId: '', combatStyleId: style.id, combatStyleFormId: first.id } });
  const right = normalize({ kind: 'technique', name: technique.name, data: { ...technique,
    id: 'old-form-copy-two', catalogTechniqueId: '', combatStyleId: style.id, combatStyleFormId: second.id } });
  const result = merge(left, right);
  assert.equal(result.length, 2);
  assert.deepEqual(new Set(result.map(value => value.data.combatStyleFormId)), new Set([first.id, second.id]));
});

test('usesUsed, remaining uses and active instance state do not manufacture duplicate shared templates', () => {
  const current = currentWind();
  const spent = legacyWind({ usesUsed: 1, usesCurrent: 0, active: false });
  const fresh = legacyWind({ id: 'b537e946-bfad-4437-adcb-d1bf98a491e8', usesUsed: 0, usesCurrent: 1, active: true }, { sources: [gawain] });
  const before = structuredClone([current, spent, fresh]);
  const result = merge(current, spent, fresh);
  assert.equal(result.length, 1);
  assert.ok(hasSource(result[0], freya));
  assert.ok(hasSource(result[0], gawain));
  assert.deepEqual([current, spent, fresh], before, 'Archive projection must never refill or modify live instance states');
});

test('a manually assigned custom icon and edit metadata survive equivalent-template coalescing', () => {
  const edited = legacyWind({}, { id: 'saved-manual-wind', builtin: false, archivedFromProfile: false,
    createdAt: '2026-10-30T10:00:00.000Z', updatedAt: '2026-11-02T10:00:00.000Z',
    iconOverride: '/custom-public-icon.png' });
  const result = merge(currentWind(), edited);
  assert.equal(result.length, 1);
  assert.equal(result[0].iconOverride, '/custom-public-icon.png');
  assert.equal(result[0].icon, '/custom-public-icon.png');
  assert.equal(result[0].createdAt, edited.createdAt);
  assert.equal(result[0].updatedAt, edited.updatedAt);
  assert.ok(hasSource(result[0], freya));
});

test('an explicitly edited rule variant and custom illustration remain independent of the built-in ability', () => {
  const custom = abilityEntry({ ...wind, catalogAbilityId: wind.id, id: 'manual-wind-variant',
    description: 'Eigene Heilvariante: 2W8 statt des veröffentlichten Klassen-Trefferwürfels.',
    effects: [{ id: 'custom-heal', type: 'healing', target: 'self', on: 'always', formula: '2d8' }] },
  { id: 'manual-rule-variant', builtin: false, updatedAt: '2026-11-02T11:00:00.000Z', iconOverride: '/custom-public-icon.png' });
  const result = merge(currentWind(), custom);
  assert.equal(result.length, 2);
  const retained = result.find(value => value.id === custom.id);
  assert.ok(retained);
  assert.equal(retained.iconOverride, custom.iconOverride);
  assert.equal(retained.data.effects[0].formula, '2d8');
});

test('personal abilities with equal IDs and rules remain bound to their different public owners', async () => {
  const library = JSON.parse(await readFile(new URL('../data/spell-attack-library.json', import.meta.url), 'utf8'));
  const published = library.allTechniques.find(value => value.id === 'freya-arkaner-schrei');
  assert.ok(published);
  const owned = owner => abilityEntry({ ...published, sourceCharacterId: owner.id, sourceCharacter: owner.name },
    { sources: [owner] });
  const result = merge(owned(freya), owned(gawain));
  assert.equal(result.length, 2);
  assert.deepEqual(new Set(result.map(value => value.data.sourceCharacterId)), new Set([freya.id, gawain.id]));
});

test('updates of one archive instance replace its old rules without forking its row or swallowing another explicit instance', () => {
  const old = abilityEntry({ ...wind, id: 'saved-ability-instance' }, { id: 'saved-archive-row', builtin: false,
    createdAt: '2026-10-30T10:00:00.000Z', updatedAt: '2026-10-30T10:00:00.000Z' });
  const updated = abilityEntry({ ...wind, id: old.data.id,
    effects: [{ id: 'updated-heal', type: 'healing', target: 'self', on: 'always', formula: '2d8' }] },
  { id: old.id, builtin: false, createdAt: old.createdAt, updatedAt: '2026-11-02T10:00:00.000Z' });
  const other = abilityEntry({ ...wind, id: 'other-saved-ability-instance' },
    { id: 'other-saved-archive-row', builtin: false, createdAt: old.createdAt, updatedAt: old.updatedAt });
  const result = merge(old, updated, other);
  assert.equal(result.length, 2);
  assert.equal(result.filter(value => value.id === old.id).length, 1);
  assert.equal(result.find(value => value.id === old.id).data.effects[0].formula, '2d8');
  assert.ok(result.some(value => value.id === other.id));
});

test('equivalent template reconciliation leaves separate owned physical item instances separate', () => {
  const owned = id => normalize({ kind: 'register-waffen', name: 'Stahlschwert',
    data: { id, section: 'owned', templateId: 'standard:waffen-rustungen:stahlschwert',
      combatDefinition: { kind: 'weapon', weaponType: 'sword', damageFormula: '1d8' } } });
  const first = owned('owned-sword-one'), second = owned('owned-sword-two');
  assert.equal(merge(first, second).length, 2);
});

test('current profile-copy API keeps one canonical template identity after a new archive selection', () => {
  const current = currentWind();
  const copy = createCharacterArchiveProfileItem(current);
  const archived = abilityEntry(copy, { archivedFromProfile: true, sources: [freya] });
  assert.equal(merge(current, archived).length, 1);
});

test('filtered zero-cost entries cannot align different real resource payments into the same signature', () => {
  const costVariant = resourceId => abilityEntry({ ...wind, id: `cost-${resourceId}`, activationType: 'action',
    costs: [{ id: 'zero-cost', resourceId: 'action', amount: 0 }, { id: 'actual-cost', resourceId, amount: 1 }] });
  const reaction = costVariant('reaction'), bonus = costVariant('bonus-action');
  assert.deepEqual(normalizeCombatAbility(reaction.data).costs.map(value => value.resourceId), ['reaction']);
  assert.deepEqual(normalizeCombatAbility(bonus.data).costs.map(value => value.resourceId), ['bonus-action']);
  assert.notEqual(signature(reaction), signature(bonus));
  assert.equal(merge(reaction, bonus).length, 2);
});

test('minimal references never inherit another public person\'s ability ownership or personal illustration', async () => {
  const library = JSON.parse(await readFile(new URL('../data/spell-attack-library.json', import.meta.url), 'utf8'));
  const published = library.allTechniques.find(value => value.id === 'freya-arkaner-schrei');
  const icon = getCharacterAbilityIconSource(published, freya);
  assert.ok(icon, 'The public owner registry supplies Freya\'s personal illustration');
  const original = abilityEntry({ ...published, icon }, { builtin: true, icon, sources: [freya] });
  const minimal = abilityEntry({ id: published.id, name: published.name }, { archivedFromProfile: true, sources: [gawain] });
  const before = structuredClone([original, minimal]);
  const result = merge(original, minimal);
  assert.equal(result.length, 2);
  const otherOwner = result.find(value => hasSource(value, gawain));
  assert.ok(otherOwner);
  assert.notEqual(otherOwner.data.sourceCharacterId, freya.id);
  assert.notEqual(otherOwner.icon, original.icon);
  assert.notEqual(otherOwner.data.icon, original.data.icon);
  assert.deepEqual([original, minimal], before);
});

test('legacy manual authorship remains explicit and keeps its icon after live and catalog merges', () => {
  const manual = abilityEntry(wind, { id: 'legacy-manual-authorship', builtin: false, archivedFromProfile: false,
    createdAt: '2026-10-30', updatedAt: '2026-11-02', icon: '/manual-public-illustration.png' });
  const live = abilityEntry(wind, { archivedFromProfile: true, sources: [freya] });
  const catalog = abilityEntry(wind, { builtin: true, icon: '/automatic-public-illustration.png', sources: [system] });
  const first = merge(manual, live);
  assert.equal(first.length, 1);
  assert.equal(explicit(first[0]), true);
  const second = merge(first, catalog);
  assert.equal(second.length, 1);
  assert.equal(second[0].icon, manual.icon);
  assert.equal(explicit(second[0]), true);
  assert.deepEqual(merge(second), second, 'Repeated read-model merging must be idempotent');
});

test('the actual archive editor retains the selected view identity when two rule variants share one storage ID', async () => {
  const variants = merge(currentWind(), abilityEntry({ ...wind,
    effects: [{ id: 'other-rule', type: 'healing', target: 'self', on: 'always', formula: '2d8' }] }, { builtin: true }));
  assert.equal(variants.length, 2);
  assert.equal(variants[0].id, variants[1].id, 'Reproduce two legitimate old rows sharing a storage/catalog ID');
  const views = projectCharacterArchiveViewEntries(variants), selected = views[1];
  assert.notEqual(views[0].archiveViewId, views[1].archiveViewId);
  const source = await readFile(new URL('../modules/character-archive/character-archive-ui.js', import.meta.url), 'utf8');
  // Exercise the real private editor/lookup functions with inert DOM boundaries;
  // no browser storage, backend or production entry is touched by the harness.
  const editor = source.match(/function openEntryEditor\(entry = null\) \{[\s\S]*?\n\}/)?.[0];
  const lookup = source.match(/function findEntry\(id\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(editor && lookup);
  const context = { selected, state: { kind: 'ability', entryIndex: views.map(entry => ({ entry })) },
    document: { activeElement: null }, ensureEditorOverlay: () => ({ innerHTML: '', setAttribute() {} }),
    normalizeCharacterArchiveEntry: normalize, getCharacterArchiveViewId, getCharacterArchiveKind,
    CHARACTER_ARCHIVE_KINDS: [], escapeHtml: String, safeImageSource: String, renderPlacementFields: () => '', activateDialog() {} };
  vm.runInNewContext(`${editor}\n${lookup}\nopenEntryEditor(selected); found = findEntry(state.editingId);`, context);
  assert.equal(context.state.editingId, selected.archiveViewId);
  assert.equal(context.found, selected);
  assert.deepEqual(context.found.data.effects, selected.data.effects);
});

test('minimal canonical references never take a richer explicit custom rule variant as their source', () => {
  const catalog = currentWind();
  const manual = abilityEntry({ ...wind, id: 'custom-rule-copy', catalogAbilityId: wind.id, customRule: 'Eigene Regel',
    effects: [{ id: 'custom-heal', type: 'healing', target: 'self', on: 'always', formula: '2d8' }] },
  { id: 'custom-rule-row', builtin: false, updatedAt: '2026-11-03' });
  const minimalSource = { kind: 'character', id: 'public-minimal-reference', name: 'Öffentliche Minimalreferenz' };
  const minimal = abilityEntry({ id: 'minimal-uuid-copy', catalogAbilityId: wind.id, name: wind.name },
    { archivedFromProfile: true, sources: [minimalSource] });
  const result = merge(catalog, manual, minimal);
  assert.equal(result.length, 2);
  const referenced = result.find(value => hasSource(value, minimalSource));
  assert.ok(referenced);
  assert.equal(referenced.data.effects[0].formula, wind.effects[0].formula);
  assert.ok(!referenced.data.customRule);
  assert.ok(!hasSource(result.find(value => value.id === manual.id), minimalSource));
});

test('a minimal reference stays unresolved when full nonmanual candidates sharing its ID have different rules', () => {
  const catalog = currentWind();
  const alternate = abilityEntry({ ...wind, effects: [{ id: 'another-heal', type: 'healing', formula: '2d8' }] }, { builtin: true });
  const source = { kind: 'character', id: 'public-ambiguous-reference', name: 'Öffentliche mehrdeutige Referenz' };
  const minimal = abilityEntry({ id: 'ambiguous-uuid-copy', catalogAbilityId: wind.id, name: wind.name },
    { archivedFromProfile: true, sources: [source] });
  const before = structuredClone(minimal), result = merge(catalog, alternate, minimal);
  assert.equal(result.length, 3);
  const unresolved = result.find(value => hasSource(value, source));
  assert.ok(unresolved);
  assert.ok(!unresolved.data.effects, 'Do not invent the selected variant\'s effects for an ambiguous reference');
  assert.deepEqual(minimal, before);
});
