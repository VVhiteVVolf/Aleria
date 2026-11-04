import test from 'node:test';
import assert from 'node:assert/strict';
import { createGalleryCsv, mergeScopedCatalog, parseHouseScope, updateScopedGalleryCsv, validateHouseScope } from '../scripts/scoped-catalog.mjs';

const house = (id, illustrationIds = [], extra = {}) => ({ id, name: id, kind: 'registered', region: 'Cenyr', location: 'Cenyr · Tal der Milane', rank: 'Ritterherr', tree: `Stammbäume/Stammbaum.html?family=${id}&mode=view`, sources: [id], illustrationIds, missingNote: '', ...extra });
const image = (id, sha256, houseIds, extra = {}) => ({ id, sha256, houseIds, name: id, category: 'Hausdarstellung', affiliation: '', image: `${id}.png`, copies: [`${id}.png`], sources: [{ path: `${id}.mjs` }], note: '', ...extra });
const catalog = (houses, illustrations) => ({ schema: 'aleria.warrior-gallery', version: 1, reviewedAt: 'old-review', scope: 'Existing release', extraReleaseMetadata: { retain: true }, houses, illustrations });

test('scope parsing keeps the full build default and rejects ambiguous or empty scopes', () => {
  assert.equal(parseHouseScope(['--check']), null);
  assert.deepEqual(parseHouseScope(['--check', '--houses=haus-a, haus-b,haus-a']), ['haus-a', 'haus-b']);
  for (const args of [['--houses'], ['--houses='], ['--houses=haus-a,'], ['--houses=haus-a', '--houses=haus-b']]) assert.throws(() => parseHouseScope(args));
});

test('only an explicit existing registered-house allowlist can be updated', () => {
  const previous = catalog([house('haus-a'), house('mentioned', [], { kind: 'mentioned' })], []);
  assert.throws(() => validateHouseScope(previous, []), /Haus-IDs/);
  assert.throws(() => validateHouseScope(previous, ['secret-or-unknown']), /Unbekanntes Haus/);
  assert.throws(() => validateHouseScope(previous, ['mentioned']), /Registerquelle/);
  assert.throws(() => mergeScopedCatalog(previous, { houses: [house('haus-a'), house('haus-b')], illustrations: [] }, ['haus-a']), /stimmen nicht/);
});

test('refreshing one house preserves unrelated catalog objects and unassigned artwork', () => {
  const foreign = house('haus-foreign', ['foreign-image'], { custom: { manual: true } });
  const unrelated = image('foreign-image', 'foreign-hash', ['haus-foreign'], { custom: ['keep'] });
  const unassigned = image('unassigned', 'unassigned-hash', [], { affiliation: 'Klerus' });
  const previous = catalog([house('haus-a', ['old-image']), foreign], [image('old-image', 'old-hash', ['haus-a']), unrelated, unassigned]);
  const before = JSON.stringify(previous);
  const updated = mergeScopedCatalog(previous, { houses: [house('haus-a', [], { rank: 'Ritterfürst' })], illustrations: [image('new-image', 'new-hash', ['haus-a'])] }, ['haus-a']);
  assert.equal(JSON.stringify(previous), before);
  assert.equal(updated.houses[1], foreign);
  assert.equal(updated.illustrations[0], unrelated);
  assert.equal(updated.illustrations[1], unassigned);
  assert.equal(updated.extraReleaseMetadata, previous.extraReleaseMetadata);
  assert.equal(updated.reviewedAt, 'old-review');
  assert.equal(updated.houses[0].rank, 'Ritterfürst');
  assert.deepEqual(updated.houses[0].illustrationIds, ['new-image']);
  assert.ok(!updated.illustrations.some(entry => entry.id === 'old-image'));
});

test('hash deduplication reuses existing shared IDs without replacing foreign display or assignments', () => {
  const shared = image('saved-shared-id', 'same-bytes', ['haus-foreign'], { name: 'Foreign display', thumbnail: 'foreign-thumb.webp', variants: [{ image: 'old-variant.png', label: 'Reviewed' }] });
  const foreign = house('haus-foreign', ['saved-shared-id']);
  const previous = catalog([house('haus-a'), foreign], [shared]);
  const incoming = image('new-hash-id', 'same-bytes', ['haus-a'], { image: 'new-copy.png', copies: ['new-copy.png'], name: 'Selected display', sources: [{ path: 'selected/haus.content.mjs' }] });
  const updated = mergeScopedCatalog(previous, { houses: [house('haus-a')], illustrations: [incoming] }, ['haus-a']);
  assert.equal(updated.illustrations.length, 1);
  const [result] = updated.illustrations;
  assert.equal(result.id, 'saved-shared-id');
  assert.equal(result.name, shared.name);
  assert.equal(result.image, shared.image);
  assert.equal(result.thumbnail, shared.thumbnail);
  assert.deepEqual(result.variants, shared.variants);
  assert.deepEqual(result.houseIds, ['haus-foreign', 'haus-a']);
  assert.deepEqual(result.copies, ['saved-shared-id.png', 'new-copy.png']);
  assert.deepEqual(updated.houses[0].illustrationIds, ['saved-shared-id']);
  assert.equal(updated.houses[1], foreign);
});

test('reassigning a selected house never removes an old shared picture from another house', () => {
  const previous = catalog([house('haus-a', ['shared']), house('haus-b', ['shared'])], [image('shared', 'shared-hash', ['haus-a', 'haus-b'])]);
  const updated = mergeScopedCatalog(previous, { houses: [house('haus-a')], illustrations: [] }, ['haus-a']);
  assert.deepEqual(updated.illustrations[0].houseIds, ['haus-b']);
  assert.deepEqual(updated.houses[0].illustrationIds, []);
  assert.equal(updated.houses[1], previous.houses[1]);
});

test('exclusive artwork retains its stable ID and the merge is idempotent', () => {
  const previous = catalog([house('haus-a', ['legacy-id'])], [image('legacy-id', 'same-hash', ['haus-a'], { thumbnail: 'reviewed.webp', variants: [{ image: 'reviewed-variant.png' }] })]);
  const updates = { houses: [house('haus-a')], illustrations: [image('fresh-id', 'same-hash', ['haus-a'], { name: 'Current name' })] };
  const once = mergeScopedCatalog(previous, updates, ['haus-a']);
  assert.equal(once.illustrations[0].id, 'legacy-id');
  assert.equal(once.illustrations[0].name, 'Current name');
  assert.equal(once.illustrations[0].thumbnail, 'reviewed.webp');
  assert.deepEqual(once.illustrations[0].variants, [{ image: 'reviewed-variant.png' }]);
  assert.deepEqual(mergeScopedCatalog(once, updates, ['haus-a']), once);
});

test('foreign output memberships and ambiguous image identities are rejected before writing', () => {
  const previous = catalog([house('haus-a')], [image('known', 'existing-hash', [])]);
  const rebuilt = illustrations => ({ houses: [house('haus-a')], illustrations });
  assert.throws(() => mergeScopedCatalog(previous, rebuilt([image('new', 'new-hash', ['private-house'])]), ['haus-a']), /außerhalb/);
  assert.throws(() => mergeScopedCatalog(previous, rebuilt([image('known', 'changed-hash', ['haus-a'])]), ['haus-a']), /abweichendem Dateihash/);
  assert.throws(() => mergeScopedCatalog(previous, rebuilt([image('a', 'duplicate', ['haus-a']), image('b', 'duplicate', ['haus-a'])]), ['haus-a']), /doppelte/);
});

test('CSV refresh preserves every unrelated byte, quoted newline and line ending', () => {
  const houses = [house('haus-a'), house('haus-b', ['b'], { name: 'B; "quoted"\nsecond line', missingNote: 'Keep; this note' })];
  const previousCsv = createGalleryCsv(houses).replaceAll('\r\n', '\n');
  const nextHouses = [house('haus-a', ['new']), houses[1]];
  const updated = updateScopedGalleryCsv(previousCsv, houses, nextHouses, ['haus-a']);
  const unchangedTail = previousCsv.slice(previousCsv.indexOf('"B;'));
  assert.equal(updated.slice(updated.indexOf('"B;')), unchangedTail);
  assert.ok(updated.startsWith('\ufeff'));
  assert.ok(!updated.includes('\r\n'));
  assert.ok(updated.includes('"1";"Vorhanden";"Stammbäume/Stammbaum.html?family=haus-a&mode=view"'));
});

test('CSV drift is rejected instead of guessing row ownership', () => {
  const houses = [house('haus-a'), house('haus-b')];
  const previousCsv = createGalleryCsv(houses);
  assert.throws(() => updateScopedGalleryCsv(previousCsv.replaceAll('family=haus-a', 'family=wrong'), houses, houses, ['haus-a']), /CSV-Reihenfolge/);
  assert.throws(() => updateScopedGalleryCsv(previousCsv, houses.slice(0, 1), houses, ['haus-a']), /passt nicht/);
});

test('new canonical registered houses are admitted only within the explicit allowlist', () => {
  const foreign = house('haus-existing', ['shared']);
  const previous = catalog([foreign], [image('shared', 'shared-bytes', ['haus-existing'])]);
  const newcomer = house('haus-new');
  assert.throws(() => validateHouseScope(previous, ['haus-new']), /Unbekanntes Haus/);
  assert.doesNotThrow(() => validateHouseScope(previous, ['haus-new'], { registeredHouses: [newcomer] }));
  const rebuilt = { houses: [newcomer], illustrations: [image('fresh-id', 'shared-bytes', ['haus-new'])] };
  const next = mergeScopedCatalog(previous, rebuilt, ['haus-new']);
  assert.equal(next.houses[0], foreign);
  assert.deepEqual(next.houses.map(h => h.id), ['haus-existing', 'haus-new']);
  assert.deepEqual(next.houses[1].illustrationIds, ['shared']);
  assert.deepEqual(next.illustrations[0].houseIds, ['haus-existing', 'haus-new']);
  assert.equal(next.illustrations[0].id, 'shared');
  assert.deepEqual(mergeScopedCatalog(next, rebuilt, ['haus-new']), next);
});

test('admission rejects missing canonical evidence, mentioned sources and unrequested additions', () => {
  const previous = catalog([house('haus-existing')], []);
  assert.throws(() => validateHouseScope(previous, ['unknown'], { registeredHouses: [house('different')] }), /Unbekanntes Haus/);
  assert.throws(() => mergeScopedCatalog(previous, { houses: [house('unknown', [], { kind: 'mentioned' })], illustrations: [] }, ['unknown']), /Unbekanntes Haus/);
  assert.throws(() => mergeScopedCatalog(previous, { houses: [house('haus-new'), house('unrequested')] , illustrations: [] }, ['haus-new']), /stimmen nicht/);
  assert.throws(() => updateScopedGalleryCsv(createGalleryCsv(previous.houses), previous.houses, [...previous.houses, house('unrequested')], ['haus-existing']), /außerhalb/);
});

test('new-house CSV records append without altering old bytes and remain idempotent', () => {
  const previousHouses = [house('haus-existing', [], { name: 'Existing; "quoted"\nname' })];
  const additions = [house('haus-new-a', ['a']), house('haus-new-b')];
  const nextHouses = [...previousHouses, ...additions];
  const scope = additions.map(h => h.id);
  for (const lineEnding of ['\r\n', '\n']) {
    for (const trailingNewline of [true, false]) {
      let before = createGalleryCsv(previousHouses).replaceAll('\r\n', lineEnding);
      if (!trailingNewline) before = before.slice(0, -lineEnding.length);
      const after = updateScopedGalleryCsv(before, previousHouses, nextHouses, scope);
      assert.equal(after.slice(0, before.length), before);
      assert.ok(after.startsWith('\ufeff'));
      assert.equal(after.split('family=haus-new-a').length - 1, 1);
      assert.equal(after.split('family=haus-new-b').length - 1, 1);
      if (lineEnding === '\n') assert.ok(!after.includes('\r\n'));
      assert.equal(updateScopedGalleryCsv(after, nextHouses, nextHouses, scope), after);
    }
  }
});
