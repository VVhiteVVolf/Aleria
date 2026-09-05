import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadBuiltinCharacterArchiveEntries } from '../modules/character-archive/character-archive-catalog.js';
import { getCharacterArchiveAttackGroups, matchesCharacterArchiveKind, isCharacterArchiveCombatAbility } from '../modules/character-archive/character-archive-attack-groups.js';
import { getCharacterArchiveWeaponGroups } from '../modules/character-archive/character-archive-weapon-groups.js';
import { classifyCharacterArchiveEntries, getCharacterArchiveClassGroups } from '../modules/character-archive/character-archive-classification.js';
import { normalizeCharacterArchiveEntry, mergeCharacterArchiveEntries, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { getCharacterArchiveEntryIconPresentation, getCharacterSheetEntryIconPresentation } from '../modules/character-archive/character-archive-icons.js';
import { archiveTraitIconFiles, getArchiveTraitIconSource } from '../modules/character-archive/character-archive-trait-icons.js';
import { readArchivePlacement, getArchivePlacementChoices } from '../modules/character-archive/character-archive-placement.js';

const originalFetch = globalThis.fetch;
globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(url, 'utf8')) });
const catalog = await loadBuiltinCharacterArchiveEntries();
globalThis.fetch = originalFetch;
const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const live = snapshot.characters.flatMap(record => extractCharacterArchiveEntries(record));
const entries = mergeCharacterArchiveEntries(classifyCharacterArchiveEntries([...catalog, ...live]));
const groupNames = groups => groups.flatMap(group => [group.name, ...groupNames(group.children)]);
const groupEntries = group => [
  ...(group?.entries || []),
  ...(group?.children || []).flatMap(groupEntries)
];

test('canonical Drachentanz keeps every Cenyr attack under class, style and form', () => {
  const groups = getCharacterArchiveAttackGroups(entries.filter(entry => matchesCharacterArchiveKind(entry, 'technique')), entries);
  const teulu = groups.find(group => group.name === 'Teulu');
  assert(teulu);
  const style = teulu.children.find(group => group.name === 'Drachentanz');
  assert.equal(style.children.length, 10);
  assert.deepEqual(style.children.map(group => group.parentEntry.data.number), [1, 2, 3, 4, 5, 6, 7, null, null, null]);
  assert.equal(style.children[0].entries.length, 6);
  assert.equal(style.children[9].entries.length, 0, 'Empty canonical paths remain visible');
  const people = groups.find(group => group.name === 'Personen');
  const gawain = people?.children.find(group => group.name === 'Gawain Draig');
  assert.equal(groupEntries(gawain).some(entry => String(entry.data?.id || '').startsWith('gawain-dragon-')), false);
  assert.equal(style.children[0].entries.some(entry => entry.name === 'Biss des Jungdrachens'), true);
  assert(!groupNames(groups).includes('Drachentanz · Ausbildungsform'));
});

test('filtered attack retains its canonical parents even when those are not visible search results', () => {
  const attack = catalog.find(entry => entry.kind === 'technique' && entry.data.combatStyleFormId
    && entry.data.cenyrTraining?.allowedClassIds?.length > 1);
  const groups = getCharacterArchiveAttackGroups([attack], catalog);
  const expectedOwners = attack.data.cenyrTraining.allowedClassIds
    .map(classId => catalog.find(entry => entry.kind === 'class' && entry.data?.cultureClassProfiles?.some(profile => profile.classId === classId))?.name)
    .filter(Boolean)
    .sort();
  assert.deepEqual(groups.map(group => group.name).sort(), expectedOwners);
  for (const group of groups) {
    assert.equal(group.children[0].name, 'Drachentanz');
    assert.equal(group.children[0].children[0].entries[0].name, attack.name);
    assert.equal(group.children[0].children[0].entries[0].id, attack.id, 'Shared attacks keep one canonical ID');
  }
});

test('new archive styles and forms can be selected and resolve through the same hierarchy', () => {
  const style = normalizeCharacterArchiveEntry({ kind: 'combat-style', name: 'Speerschule', data: { id: 'custom-style', archivePlacement: { className: 'Cantref' } } });
  const form = normalizeCharacterArchiveEntry({ kind: 'combat-style', name: 'Grundform', data: { id: 'custom-form', archivePlacement: { styleId: 'custom-style' } } });
  const attack = normalizeCharacterArchiveEntry({ kind: 'technique', name: 'Testtechnik', data: { archivePlacement: { formId: 'custom-form' } } });
  const all = [...catalog, style, form, attack];
  assert(getArchivePlacementChoices({ kind: 'combat-style', form: true }, all).includes(form));
  assert(!getArchivePlacementChoices({ kind: 'combat-style', style: true }, all).includes(form));
  const groups = getCharacterArchiveAttackGroups([style, form, attack], all);
  assert.equal(groups[0].name, 'Cantref');
  assert.equal(groups[0].children[0].name, 'Speerschule');
  assert.equal(groups[0].children[0].children[0].name, 'Grundform');
  assert.equal(groups[0].children[0].children[0].entries[0].name, 'Testtechnik');
});

test('weapons group by actual weapon, and explicit weapon attacks are children of that weapon', () => {
  const spear = { kind: 'attack', name: 'Speer', data: { weaponType: 'spear' }, sources: [{ kind: 'class', name: 'Cantref' }] };
  const thrust = { kind: 'technique', name: 'Speerstoß', data: { archivePlacement: { weaponName: 'Speer' } } };
  const natural = { kind: 'attack', name: 'Huftritt', data: { weaponType: 'natural' } };
  const list = [spear, thrust, natural];
  const groups = getCharacterArchiveWeaponGroups(list.filter(entry => matchesCharacterArchiveKind(entry, 'attack')), list);
  assert.deepEqual(groups.map(group => group.name), ['Speer']);
  assert.equal(groups[0].children.find(group => group.name === 'Waffeneigene Attacken').entries[0].name, thrust.name);
  assert(!matchesCharacterArchiveKind(natural, 'attack'));
  assert(matchesCharacterArchiveKind(natural, 'technique'));
  assert(!matchesCharacterArchiveKind({ ...natural, name: 'Biss (Gift)' }, 'attack'));
  assert(!matchesCharacterArchiveKind(thrust, 'technique'));
  const variants = getCharacterArchiveWeaponGroups([
    { kind: 'attack', name: 'Langbogen', data: { weaponType: 'bow' } },
    { kind: 'attack', name: 'Langbogen (Feuerpfeil)', data: { weaponType: 'bow' } },
    { kind: 'attack', name: 'Schildstoß', data: { weaponType: 'shield' } }
  ]);
  assert.deepEqual(variants.map(group => group.name), ['Langbogen', 'Schild']);
  assert.equal(variants[0].children.find(group => group.name === 'Waffeneigene Attacken').entries[0].archiveDisplayName, 'Feuerpfeil');
});

test('combat abilities remain with their owners; explicit personal placement overrides previous form', () => {
  const ability = { kind: 'ability', name: 'Arkaner Schrei', data: { combatUsable: true, sourceCharacter: 'Freya' } };
  assert(isCharacterArchiveCombatAbility(ability));
  const canonical = catalog.find(entry => entry.kind === 'technique' && entry.data.combatStyleFormId);
  const moved = { ...canonical, data: { ...canonical.data, archivePlacement: { personName: 'Gawain' } } };
  const groups = getCharacterArchiveAttackGroups([ability, moved], catalog);
  assert.deepEqual(groups.map(group => group.name), ['Personen']);
  assert.deepEqual(groups[0].children.map(group => group.name), ['Freya', 'Gawain']);
});

test('all base classes precede cultural classes; aliases merge and shared Milwr belongs to both cultures', () => {
  const classes = entries.filter(entry => entry.kind === 'class');
  const groups = getCharacterArchiveClassGroups(classes);
  assert.equal(groups[0].name, 'Standardklassen');
  assert.equal(groups[0].entries.length, 15);
  assert(groups[0].entries.some(entry => entry.name === 'Asket'));
  assert(groups[0].entries.some(entry => entry.name === 'Paktträger'));
  assert(groups[0].entries.some(entry => entry.name === 'Eidgeschworener'));
  assert.equal(classes.filter(entry => ['Mönch', 'Hexer', 'Hexenmeister', 'Paladin'].includes(entry.name)).length, 0);
  for (const culture of ['Cenyr', 'Vennyr']) assert(groups.find(group => group.name === culture).entries.some(entry => entry.name === 'Milwr'));
  assert(groups.find(group => group.name === 'Aldrimar').entries.some(entry => entry.name === 'Skjaldr'));
});

test('horse breeds never become peoples; current Rossmarkt prices, images and origins replace old context tables', () => {
  const projected = classifyCharacterArchiveEntries([
    ...catalog,
    { kind: 'ancestry', name: 'Rhyfel', sources: [{ kind: 'creature', name: 'Tanor' }] },
    { kind: 'ancestry', name: 'Hest-Mischling', sources: [{ kind: 'creature', name: 'Eldfaxi' }] },
    { kind: 'ancestry', name: 'Mensch' },
    { kind: 'class', name: 'Reittier', sources: [{ kind: 'creature', name: 'Tanor' }] },
    { kind: 'ancestry', name: 'Wolf', sources: [{ kind: 'creature', name: 'Wolf' }] },
    { kind: 'register-pferde', name: 'Rhyfel', builtin: true, data: { price: '999', currency: 'Taler' } },
    { kind: 'register-pferde', name: 'Kamel', builtin: true },
    { kind: 'register-pferde', name: 'Fellfarbe', builtin: true }
  ]);
  assert(!projected.some(entry => entry.kind === 'ancestry' && ['Rhyfel', 'Mensch', 'Wolf', 'Hest-Mischling'].includes(entry.name)));
  assert(!projected.some(entry => entry.kind === 'class' && entry.name === 'Reittier'));
  assert(!projected.some(entry => entry.kind === 'register-pferde' && ['Kamel', 'Fellfarbe'].includes(entry.name)));
  assert(projected.some(entry => entry.kind === 'register-vieh' && entry.name === 'Kamel'));
  const horses = mergeCharacterArchiveEntries(projected).filter(entry => entry.kind === 'register-pferde');
  assert.equal(horses.length, 28, '24 breeds, three ponies and one known crossbreed');
  const rhyfel = horses.find(entry => entry.name === 'Rhyfel');
  assert.equal(rhyfel.data.price, '800 – 4.000');
  assert.equal(rhyfel.data.currency, 'Kupferstück');
  assert.match(rhyfel.data.origin, /Cenyr|Estryll/i);
  assert(rhyfel.icon);
});

test('legacy spell icons reset once; future manual assignments and explicit clearing survive merge and reload', () => {
  const legacy = { kind: 'spell', name: 'Licht', icon: 'old.png', iconOverride: 'old-override.png', data: { icon: 'old-data.png' }, updatedAt: '2026-08-09' };
  const reset = normalizeCharacterArchiveEntry(legacy);
  assert.equal(reset.icon, '');
  assert.equal(reset.iconOverride, '');
  assert(!reset.data.icon);
  assert.equal(getCharacterArchiveEntryIconPresentation(legacy).source, '');
  assert.equal(getCharacterSheetEntryIconPresentation('spell', { name: 'Licht', icon: 'old.png' }, []).source, '');
  const manual = { ...reset, iconAssignmentVersion: 1, icon: 'chosen.png', iconOverride: 'chosen.png', data: { icon: 'chosen.png' }, updatedAt: '2026-09-05T10:00:00Z' };
  const merged = mergeCharacterArchiveEntries(manual, legacy)[0];
  assert.equal(merged.icon, 'chosen.png');
  assert.equal(getCharacterSheetEntryIconPresentation('spell', { name: 'Licht' }, [merged]).source, 'chosen.png');
  const cleared = { ...manual, icon: '', iconOverride: '', data: {}, updatedAt: '2026-09-05T11:00:00Z' };
  const afterReload = mergeCharacterArchiveEntries(JSON.parse(JSON.stringify(cleared)), manual, legacy)[0];
  assert.equal(afterReload.icon, '');
  assert(!afterReload.data.icon);
});

test('CK2 suggestions cover actual archived traits and reference existing local files', async () => {
  const traitNames = new Set(entries.filter(entry => entry.kind === 'trait').map(entry => entry.name));
  for (const name of traitNames) assert(getArchiveTraitIconSource({ name }), `Missing suggestion: ${name}`);
  for (const file of archiveTraitIconFiles) await readFile(fileURLToPath(new URL(`../../IconOrdner/Traits Icon/${file}`, import.meta.url)));
  assert.equal(getCharacterArchiveEntryIconPresentation({ kind: 'trait', name: 'Tapfer', iconOverride: 'manual.png' }).source, 'manual.png');
});

test('editor rejects ambiguous placement and a form from a different style', () => {
  const data = new FormData();
  data.set('placement-personName', 'Gawain');
  data.set('placement-weaponName', 'Speer');
  assert.throws(() => readArchivePlacement(data), /entweder/);
  data.delete('placement-personName');
  assert.deepEqual(readArchivePlacement(data), { weaponName: 'Speer' });
  const form = catalog.find(entry => entry.kind === 'combat-style' && entry.data.parentStyleId);
  data.delete('placement-weaponName');
  data.set('placement-formId', form.data.id);
  data.set('placement-styleId', 'other-style');
  assert.throws(() => readArchivePlacement(data, catalog), /anderen Kampftechnik/);
  data.delete('placement-formId');
  assert.throws(() => readArchivePlacement(data, catalog, { kind: 'combat-style', data: { id: 'other-style' } }), /eigene/);
});
