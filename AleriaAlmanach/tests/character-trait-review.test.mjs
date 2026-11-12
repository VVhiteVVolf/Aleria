import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { access, readFile } from 'node:fs/promises';
import { buildCharacterDatabase, markCharacterDatabaseOverlay } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { REVIEWED_CHARACTER_TRAITS } from '../modules/character-trait-review/reviewed-character-traits.js';
import { hasExactReviewedTraitCopies, hasExactReviewedBiographyTraitCards, reviewedCharacterTraits, reviewedBiographyTraitCards, hasAuthoredCombatProfile, projectReviewedCharacterTraits } from '../modules/character-trait-review/character-trait-review-model.js';
import { createTraitReviewExport, projectTraitReviewRecord } from '../modules/character-trait-review/character-trait-review-database.mjs';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { sanitizeCharacterCombatProfile, getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';
import { reconcileClassDamageRevisions } from '../modules/classes/class-damage-revisions.js';
import { correctExistingSignetAbility } from '../modules/character-trait-review/character-trait-publication-plan.mjs';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../modules/character-development/development-trait-revision-source.js';
import { isExactDevelopmentTraitCatalogCopy } from '../modules/character-development/development-trait-revisions.js';
import { reviseDevelopmentTraitBiography, reviseDevelopmentTraitBiographyCards } from '../modules/character-development/development-trait-biography-revisions.js';

const root = new URL('../../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const baseline = await json('diagnostics/character-trait-review-20261102/local-before.json');
const beforeSnapshot = await json('diagnostics/character-trait-review-20261102/snapshot-before.json');
const snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json');
const confirmed = await json('diagnostics/combat-sheets-20261102/traits-online-after.json').catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
const assignment = name => REVIEWED_CHARACTER_TRAITS.find(row => row.name === name);
const before = id => baseline.profiles.find(row => row.id === id).character;
const after = id => snapshot.characters.find(row => row.id === id);
const previousTraits = new Map(PREVIOUS_DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));

function projectExactReviewedTraitCopies(copies, expected, name) {
  assert.equal(copies.length, expected.length, `${name}: trait count`);
  return copies.map((copy, index) => {
    const current = expected[index];
    assert.equal(copy.id, current.id, `${name}: trait identity/order`);
    assert.ok(isExactDevelopmentTraitCatalogCopy(copy, current.id),
      `${name}: ${copy.id} must exactly match the current or fully preserved historical catalog definition`);
    return isDeepStrictEqual(copy, current) ? copy : structuredClone(current);
  });
}

function projectExactBiographyTraitLeaves(value) {
  if (!value.biography?.biography) return value;
  const biography = reviseDevelopmentTraitBiography(value.biography.biography);
  return biography === value.biography.biography ? value : { ...value, biography: { ...value.biography, biography } };
}

test('explicit review stays sparse, uses existing catalog icons and never infers clinical labels', async () => {
  assert.equal(REVIEWED_CHARACTER_TRAITS.length, 14);
  assert.equal(REVIEWED_CHARACTER_TRAITS.reduce((sum, row) => sum + row.traits.length, 0), 18);
  assert.equal(REVIEWED_CHARACTER_TRAITS.filter(row => !row.traits.length).length, 3);
  for (const row of REVIEWED_CHARACTER_TRAITS) {
    assert.ok(row.traits.length <= 3 && row.reason && row.evidence.length);
    for (const trait of reviewedCharacterTraits(row)) {
      assert.ok(!trait.tags.includes('Psychologische Prägung'));
      await access(new URL(trait.icon.replace(/^\//, ''), root));
    }
  }
});

test('all 14 frozen review sources retain exact historical or current catalog copies while runtime exposes current rules and preserves all other fields', async () => {
  for (const row of REVIEWED_CHARACTER_TRAITS) {
    const original = structuredClone(before(row.id)), current = structuredClone(after(row.id));
    const currentTraits = reviewedCharacterTraits(row);
    const currentQuirks = projectExactReviewedTraitCopies(current.combatProfile.quirks, currentTraits, row.name);
    let expected = projectReviewedCharacterTraits(original, row);
    if (confirmed) {
      const remote = confirmed.characters.find(character => character.id === row.onlineId); assert(remote);
      expected = correctExistingSignetAbility({ ...expected, inventory: current.inventory });
      expected.combatProfile = reconcileClassDamageRevisions(expected.combatProfile);
      expected.combatProfile.revision = Math.max(expected.combatProfile.revision || 0, remote.combatProfile.revision);
    }
    // Projection metadata is not gameplay; every other field must remain exact.
    for (const value of [expected, current]) { delete value.updatedAt; delete value.localRecord; delete value.inventory; }
    const projectedCurrent = projectExactBiographyTraitLeaves({ ...current, combatProfile: { ...current.combatProfile, quirks: currentQuirks } });
    assert.deepEqual(projectedCurrent, expected, row.name);
    const record = await json(`CharakterDatenbank/${baseline.profiles.find(source => source.id === row.id).path}`);
    assert.deepEqual(record.character.combatProfile, after(row.id).combatProfile, row.name);
    const normalized = sanitizeCharacterCombatProfile(current.combatProfile);
    assert.deepEqual(normalized.quirks.map(trait => trait.id), current.combatProfile.quirks.map(trait => trait.id), row.name);
    assert.deepEqual(normalized.quirks, sanitizeCharacterCombatProfile({ quirks: currentTraits }).quirks, `${row.name}: effective current catalog rules`);
    for (let iteration = 0; iteration < 3; iteration++) assert.deepEqual(sanitizeCharacterCombatProfile(normalized).quirks, normalized.quirks);
  }
});

test('historical review source allowances reject partial text, icon, price or mechanic edits', () => {
  const row = assignment('Freya Skald'), expected = reviewedCharacterTraits(row);
  const originals = expected.map(trait => structuredClone(previousTraits.get(trait.id) || trait));
  assert.deepEqual(projectExactReviewedTraitCopies(originals, expected, row.name), expected);
  for (const mutate of [trait => { trait.description += ' Individuelle Änderung.'; }, trait => { trait.icon = '/anderes-bild.png'; },
    trait => { trait.cost += 1; }, trait => { trait.mechanics.skill = 99; }]) {
    const changed = structuredClone(originals); mutate(changed[0]);
    assert.throws(() => projectExactReviewedTraitCopies(changed, expected, row.name), /must exactly match/);
  }
});

test('bounded projection preserves every unselected figure, inventory, tab and classification', async () => {
  // Replay against a captured input instead of requiring unrelated current work
  // in the shared workspace to remain frozen after this editorial review.
  const registry = await json('diagnostics/character-trait-review-20261102/registry-before.json');
  const report = await json('diagnostics/character-trait-review-20261102/sync-report-before.json');
  const records = await Promise.all(REVIEWED_CHARACTER_TRAITS.map(async row => {
    const path = baseline.profiles.find(source => source.id === row.id).path;
    const record = await json(`CharakterDatenbank/${path}`);
    const person = beforeSnapshot.characters.find(person => person.id === row.id);
    // Apply the trait operation to its own captured input. Later companion
    // ownership repairs are a separately authorized inventory operation.
    const projectedPerson = projectReviewedCharacterTraits(person, row);
    return { path, record: { ...record, character: projectedPerson }, snapshotCharacter: projectedPerson };
  }));
  const projected = mergeCharacterRecordProjections({ registry, snapshot: beforeSnapshot, report }, records, [], beforeSnapshot.charTabs).snapshot;
  const selected = new Set(REVIEWED_CHARACTER_TRAITS.map(row => row.id));
  assert.equal(projected.characters.length, beforeSnapshot.characters.length);
  assert.deepEqual(projected.charTabs, beforeSnapshot.charTabs);
  for (const person of beforeSnapshot.characters) {
    const current = projected.characters.find(row => row.id === person.id);
    if (!selected.has(person.id)) assert.deepEqual(current, person, person.name);
    else {
      assert.deepEqual(current.inventory, person.inventory, person.name);
      assert.deepEqual(current.localRecord.classification, person.localRecord.classification, person.name);
      assert.deepEqual(current.combatProfile.hitPoints, person.combatProfile.hitPoints, person.name);
      assert.deepEqual(current.combatProfile.resources, person.combatProfile.resources, person.name);
    }
  }
});

test('generic migration sheets are excluded; a missing biography does not exclude an authored sheet', async () => {
  const online = await json('diagnostics/character-trait-review-20261102/online-before.json');
  assert.equal(online.publicCharacters, 389);
  assert.equal(online.profiles.length, 25);
  assert.equal(online.profiles.filter(row => !hasAuthoredCombatProfile(row.character)).length, 11);
  for (const name of ['Kane Draig', 'Gethin', 'Gethin Draig']) {
    const row = assignment(name);
    assert.ok(hasAuthoredCombatProfile(before(row.id)));
    assert.deepEqual(after(row.id).combatProfile.quirks, []);
  }
  const newFigures = ['Briallen Awenor', 'Caralyn Chwedonol', 'Rianna Wyrm', 'Evie Rhyddid', 'Lefraye Gafyr'];
  for (const name of newFigures) {
    const person = snapshot.characters.find(row => row.name === name);
    assert.ok(person && hasAuthoredCombatProfile(person), name);
    assert.deepEqual(person.combatProfile.quirks, [], name);
  }
  assert.throws(() => projectReviewedCharacterTraits({ id: assignment('Kane Draig').id, name: 'Kane Draig', combatProfile: {} }, assignment('Kane Draig')), /Kein ausgearbeiteter/);
  assert.throws(() => projectReviewedCharacterTraits({ ...before(assignment('Kane Draig').id), id: 'other' }, assignment('Kane Draig')), /Figurenidentität/);
});

test('only the obsolete Gawain personality ability is removed; personal training and uses remain intact', () => {
  for (const name of ['Gawain Draig', 'Ylva Wolfshorn', 'Asgeir Wolfshorn', 'Rhiannon Draig']) {
    const row = assignment(name), oldProfile = before(row.id).combatProfile, newProfile = after(row.id).combatProfile;
    const expected = oldProfile.abilities.filter(ability => !(row.removeAbilityIds || []).includes(ability.id));
    assert.deepEqual(newProfile.abilities, expected, name);
    for (const key of ['weapons', 'armorItems', 'techniques', 'magic', 'progression', 'attributes']) {
      const expected = confirmed && name === 'Rhiannon Draig' && key === 'magic' ? reconcileClassDamageRevisions(oldProfile).magic : oldProfile[key];
      assert.deepEqual(newProfile[key], expected, `${name}: ${key}`);
    }
  }
  const asgeir = assignment('Asgeir Wolfshorn');
  assert.equal(getMaximumHitPoints(sanitizeCharacterCombatProfile(after(asgeir.id).combatProfile)), getMaximumHitPoints(sanitizeCharacterCombatProfile(before(asgeir.id).combatProfile)) + 2);
});

test('frozen biography sources preserve prose, relations, mentors, history and statistics while exact catalog cards project current rules', async () => {
  const original = await json('diagnostics/character-trait-review-20261102/public-biographies-before.json');
  const current = await json('js/biography/sources/public-biographies.json');
  let replaced = 0;
  for (const oldEntry of original.entries) {
    const entry = current.entries.find(row => row.key === oldEntry.key);
    if (entry.source?.includes('source/caralyn-biography-20261102.json')) {
      const imported = await json('AleriaAlmanach/modules/gwynthor-seven/source/caralyn-biography-20261102.json');
      assert.deepEqual(entry.characterIds, oldEntry.characterIds);
      assert.equal(entry.biography.biography.biographyText, imported.biography.biography.biographyText);
      assert.equal(entry.biography.biography.abilities.length, 10);
      continue; // A separately authorized later biography import has its own preservation test.
    }
    const row = REVIEWED_CHARACTER_TRAITS.find(row => entry.characterIds.includes(row.id) || entry.characterIds.includes(row.onlineId));
    const expected = structuredClone(oldEntry);
    if (row) { replaced++; expected.biography.biography.abilities = reviewedBiographyTraitCards(row.id); expected.biography.biography.abilitiesTitle = 'Eigenschaften'; }
    assert.deepEqual(projectExactBiographyTraitLeaves(entry), expected, oldEntry.name);
  }
  assert.equal(replaced, 5);
  // Four independently published biographies already exist in public commit ae12a14.
  // Preserve their exact payload while retaining every original review assertion above.
  const originalKeys = new Set(original.entries.map(entry => entry.key));
  const laterPublished = current.entries.filter(entry => !originalKeys.has(entry.key));
  assert.equal(laterPublished.length, 4);
  assert.equal(createHash('sha256').update(JSON.stringify(laterPublished)).digest('hex'), '5713bd94f6daa9ab95cc84db11a4b1b67685b5d9321f67f6a5d664167241abb3');
  assert.equal(current.entries.length, original.entries.length + laterPublished.length);
  const { GAIS_WYRM_BIOGRAPHY } = await import('../../Stammbäume/assets/js/data/person-biographies/gais-wyrm.js');
  const { GAWAIN_PUBLIC_BIOGRAPHY } = await import('../modules/gawain-duncan/gawain-public-biography.mjs');
  assert.deepEqual(reviseDevelopmentTraitBiographyCards(GAIS_WYRM_BIOGRAPHY.biography.abilities), reviewedBiographyTraitCards(assignment('Gais Wyrm').id));
  assert.deepEqual(reviseDevelopmentTraitBiographyCards(GAWAIN_PUBLIC_BIOGRAPHY.biography.abilities), reviewedBiographyTraitCards(assignment('Gawain Draig').id));
});

const merge = characters => buildCharacterDatabase({ characters }, []).records[0].record.character;
const full = () => ({ id: 'one', name: 'Test Figur', updatedAt: '2026-11-01T00:00:00Z',
  inventory: { items: [{ id: 'keep' }] }, combatProfile: { quirks: [{ id: 'old' }], hitPoints: { current: 7 }, resources: [{ current: 0 }],
    abilities: [{ id: 'remove' }, { id: 'personal', uses: { current: 0 } }], techniques: [{ id: 'keep-technique' }] },
  biography: { biography: { biographyText: 'Alle Prosa bleibt.', abilities: [{ title: 'Alt' }], knightMentors: [{ name: 'Lehrer' }] } } });
const overlay = () => markCharacterDatabaseOverlay({ id: 'one', name: 'Test Figur', updatedAt: '2026-11-02T00:00:00Z',
  combatProfile: { quirks: [{ id: 'new' }] }, biography: { biography: { abilitiesTitle: 'Eigenschaften', abilities: [{ title: 'Neu' }] } }
}, { replaceCombatTraits: true, removeTraitAbilityIds: ['remove'], removeTraitConditionIds: ['old-personality-condition'] });

test('archive replay replaces only owned leaves and cannot restore old traits or overwrite resources', () => {
  for (const order of [[full(), overlay()], [overlay(), full()]]) {
    const original = full(), result = merge(order);
    assert.deepEqual(result.combatProfile.quirks, [{ id: 'new' }]);
    assert.deepEqual(result.combatProfile.abilities, [original.combatProfile.abilities[1]]);
    for (const key of ['hitPoints', 'resources', 'techniques']) assert.deepEqual(result.combatProfile[key], original.combatProfile[key]);
    assert.deepEqual(result.inventory, original.inventory);
    assert.equal(result.biography.biography.biographyText, original.biography.biography.biographyText);
    assert.deepEqual(result.biography.biography.knightMentors, original.biography.biography.knightMentors);
    assert.deepEqual(result.biography.biography.abilities, [{ title: 'Neu' }]);
  }
  const original = full();
  original.combatProfile.conditions = [{ id: 'old-personality-condition' }, { id: 'ongoing-combat-condition', duration: 5 }];
  assert.deepEqual(merge([original, overlay()]).combatProfile.conditions, [original.combatProfile.conditions[1]]);
});

test('later explicit full sheets win over an older review; absent and disabled biographies stay absent or disabled', () => {
  const later = markCharacterDatabaseOverlay({ ...full(), updatedAt: '2026-11-03T00:00:00Z' }, { replaceExportedFields: true });
  const result = merge([full(), overlay(), later]);
  assert.deepEqual(result.combatProfile, later.combatProfile);
  assert.deepEqual(result.biography, later.biography);
  for (const biography of [undefined, null, { disabled: true, biography: { abilities: [] } }]) {
    const original = { ...full(), biography, combatProfile: null };
    const actual = merge([original, overlay()]);
    assert.deepEqual(actual.biography, biography);
    assert.equal(actual.combatProfile, null);
  }
  assert.throws(() => merge([overlay()]), /bereits vorhandene Figurenquelle/);
});

test('scoped technique and trait exports coexist without swapping a whole combat profile', () => {
  const technique = markCharacterDatabaseOverlay({ id: 'one', name: 'Test Figur', updatedAt: '2026-11-02T01:00:00Z', combatProfile: { techniques: [{ id: 'new-technique' }] } }, { mergeCombatTechniques: true });
  const result = merge([overlay(), technique, full()]);
  assert.deepEqual(result.combatProfile.quirks, [{ id: 'new' }]);
  assert.deepEqual(result.combatProfile.techniques.map(row => row.id), ['keep-technique', 'new-technique']);
  assert.equal(result.combatProfile.hitPoints.current, 7);
});

test('a concurrent trait edit aborts the bounded data projector; exports contain no inventory or combat resources', async () => {
  const row = assignment('Freya Skald'), person = structuredClone(before(row.id));
  person.combatProfile.quirks.push({ id: 'new-user-choice' });
  const record = { character: person };
  assert.throws(() => projectTraitReviewRecord({ record, snapshotCharacter: person, baseline: before(row.id), assignment: row, reviewedAt: '2026-11-02T00:00:00Z' }), /inzwischen geändert/);
  for (const selected of REVIEWED_CHARACTER_TRAITS) {
    const exported = createTraitReviewExport(selected, '2026-11-02T00:00:00Z');
    assert.deepEqual(Object.keys(exported.character.combatProfile), ['quirks']);
    assert.ok(!('inventory' in exported.character));
    const replay = markCharacterDatabaseOverlay(structuredClone(exported.character), { replaceCombatTraits: true, removeTraitAbilityIds: selected.removeAbilityIds, removeTraitConditionIds: selected.removeConditionIds });
    const result = merge([structuredClone(before(selected.id)), replay]);
    assert.deepEqual(result.combatProfile.quirks, reviewedCharacterTraits(selected));
    assert.deepEqual(result.combatProfile.conditions, projectReviewedCharacterTraits(before(selected.id), selected).combatProfile.conditions);
  }
});

test('already applied current, historical and mixed complete trait copies keep every stored field and export receipt', async () => {
  const row = assignment('Freya Skald'), current = reviewedCharacterTraits(row);
  const variants = [current, current.map(trait => structuredClone(previousTraits.get(trait.id) || trait)),
    current.map((trait, index) => structuredClone(index === 0 ? previousTraits.get(trait.id) || trait : trait))];
  const source = baseline.profiles.find(profile => profile.id === row.id);
  for (const copies of variants) {
    const record = await json(`CharakterDatenbank/${source.path}`);
    record.character.combatProfile.quirks = structuredClone(copies);
    record.character.biography = { biography: { biographyText: 'Persönliche Prosa bleibt erhalten.',
      abilitiesTitle: 'Eigenschaften', abilities: reviewedBiographyTraitCards(row.id, copies) } };
    const original = structuredClone(record), person = structuredClone(record.character);
    assert.equal(hasExactReviewedTraitCopies(copies, row), true);
    assert.equal(hasExactReviewedBiographyTraitCards(person.biography.biography.abilities, row.id), true);
    const next = projectTraitReviewRecord({ record, snapshotCharacter: person, baseline: before(row.id), assignment: row,
      reviewedAt: '2026-11-02T00:00:00Z', sourcePath: 'review-source.json', path: source.path });
    assert.equal(next.changed, false);
    assert.equal(next.record, record);
    assert.equal(next.snapshotCharacter, person);
    assert.deepEqual(record, original);
    assert.deepEqual(next.exported.character.combatProfile.quirks, copies);
    assert.deepEqual(next.exported.character.biography.biography.abilities, reviewedBiographyTraitCards(row.id, copies));
  }
});

test('all fourteen stored reviews, including Gildas mixed catalog generations, replay without any data write', async () => {
  const { reviewedAt } = await json('diagnostics/character-trait-review-20261102/review-meta.json');
  for (const row of REVIEWED_CHARACTER_TRAITS) {
    const source = baseline.profiles.find(profile => profile.id === row.id);
    const record = await json(`CharakterDatenbank/${source.path}`), person = after(row.id);
    const original = structuredClone(record), originalPerson = structuredClone(person);
    const sourcePath = `Charakter Archiv Exporte/Traitabgleich 2026-11-02/${row.id}.json`;
    const next = projectTraitReviewRecord({ record, snapshotCharacter: person, baseline: before(row.id), assignment: row,
      reviewedAt, sourcePath, path: source.path });
    assert.equal(next.changed, false, row.name);
    assert.deepEqual(next.record, original, row.name);
    assert.deepEqual(next.snapshotCharacter, originalPerson, row.name);
    assert.deepEqual(next.exported, await json(sourcePath), row.name);
  }
});

test('complete-copy replay rejects changed modifiers, text, icons, costs and partial historical mixtures', async () => {
  const row = assignment('Freya Skald'), source = baseline.profiles.find(profile => profile.id === row.id);
  const current = reviewedCharacterTraits(row), historical = current.map(trait => structuredClone(previousTraits.get(trait.id) || trait));
  for (const mutate of [trait => { trait.description += ' Persönlich bearbeitet.'; }, trait => { trait.icon = '/personal.png'; },
    trait => { trait.cost += 1; }, trait => { trait.mechanics.skillModifiers = { ...trait.mechanics.skillModifiers, performance: 99 }; },
    trait => { trait.description = current[0].description; }]) {
    const record = await json(`CharakterDatenbank/${source.path}`);
    record.character.combatProfile.quirks = structuredClone(historical);
    mutate(record.character.combatProfile.quirks[0]);
    const original = structuredClone(record);
    assert.equal(hasExactReviewedTraitCopies(record.character.combatProfile.quirks, row), false);
    assert.throws(() => projectTraitReviewRecord({ record, snapshotCharacter: record.character, baseline: before(row.id), assignment: row,
      reviewedAt: '2026-11-02T00:00:00Z' }), /inzwischen geändert/);
    assert.deepEqual(record, original);
  }
});

test('manual biography card edits are never accepted as historical generated cards', async () => {
  const row = assignment('Freya Skald'), source = baseline.profiles.find(profile => profile.id === row.id);
  for (const mutate of [card => { card.detail += ' Persönlicher Text.'; }, card => { card.icon = '/personal.png'; },
    card => { card.personal = true; }]) {
    const record = await json(`CharakterDatenbank/${source.path}`);
    record.character.biography = { biography: { biographyText: 'Persönlicher Text bleibt erhalten.',
      abilitiesTitle: 'Eigenschaften', abilities: reviewedBiographyTraitCards(row.id, record.character.combatProfile.quirks) } };
    mutate(record.character.biography.biography.abilities[0]);
    const original = structuredClone(record);
    assert.equal(hasExactReviewedBiographyTraitCards(record.character.biography.biography.abilities, row.id), false);
    assert.throws(() => projectTraitReviewRecord({ record, snapshotCharacter: record.character, baseline: before(row.id), assignment: row,
      reviewedAt: '2026-11-02T00:00:00Z' }), /Persönlichkeitstext.*geändert/);
    assert.deepEqual(record, original);
  }
});
