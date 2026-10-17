import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { selectChangedSections } from '../modules/characters/character-save-guard.js';

function loadFeature(file, binding, globals = {}) {
  const context = vm.createContext({ console, ...globals });
  const source = readFileSync(new URL(`../modules/characters/${file}`, import.meta.url), 'utf8');
  vm.runInContext(`${source}\nglobalThis.feature = ${binding};`, context);
  return context;
}

test('unopened editors preserve original values and initialize once with a clean baseline', () => {
  const { feature } = loadFeature('character-profile-sections.js', 'AleriaCharacterProfileSections');
  const original = { inventory: { revision: 7 }, combatProfile: { revision: 9, hitPoints: { current: 1 } } };
  let baseline = original;
  let draft;
  let initializations = 0;
  const session = feature.create({
    equipment: {
      initialValue: original,
      initialize() { initializations++; draft = structuredClone(original); draft.combatProfile.schemaVersion = 1; },
      collect() { return structuredClone(draft); }
    }
  }, (_name, value) => { baseline = value; });
  assert.equal(session.collect('equipment'), original);
  assert.equal(initializations, 0);
  assert.deepEqual(selectChangedSections(session.collect('equipment'), baseline, ['inventory', 'combatProfile']), []);
  assert.equal(session.ensure('equipment'), true);
  assert.equal(session.ensure('equipment'), false);
  assert.equal(initializations, 1);
  assert.deepEqual(selectChangedSections(session.collect('equipment'), baseline, ['inventory', 'combatProfile']), []);
  draft.inventory.note = 'User edit';
  assert.deepEqual(selectChangedSections(session.collect('equipment'), baseline, ['inventory', 'combatProfile']), ['inventory']);
  assert.deepEqual(original.combatProfile, { revision: 9, hitPoints: { current: 1 } });
});

test('a failed editor initialization can be retried and keeps the original baseline', () => {
  const { feature } = loadFeature('character-profile-sections.js', 'AleriaCharacterProfileSections');
  let attempts = 0;
  const session = feature.create({ biography: {
    initialValue: { text: 'Original' },
    initialize() { if (++attempts === 1) throw Error('Not ready'); },
    collect() { return { text: 'Normalized original' }; }
  } }, () => {});
  assert.throws(() => session.ensure('biography'), /Not ready/);
  assert.equal(session.isInitialized('biography'), false);
  assert.equal(session.collect('biography').text, 'Original');
  assert.equal(session.ensure('biography'), true);
  assert.equal(session.collect('biography').text, 'Normalized original');
});

test('large results are bounded; navigation, changed searches and deleted last pages remain valid', () => {
  let click;
  let entries = Array.from({ length: 1100 }, (_, id) => ({ id: String(id) }));
  let result;
  const grid = { contains: () => true, querySelector: () => null };
  const { feature } = loadFeature('character-result-pages.js', 'AleriaCharacterResultPages', {
    document: { addEventListener(_type, listener) { click = listener; }, getElementById: () => grid },
    renderCharGrid() { result = feature.select(entries, 'group'); }
  });
  result = feature.select(entries, 'group');
  assert.equal(result.entries.length, 36);
  assert.equal(result.pageCount, 31);
  const navigate = page => click({ target: { closest: () => ({ dataset: { characterPage: String(page) } }) }, preventDefault() {} });
  navigate(30);
  assert.equal(result.entries.length, 20);
  assert.equal(result.entries[0].id, '1080');
  assert.equal(result.end, 1100);
  navigate(999);
  assert.equal(result.pageIndex, 30);
  result = feature.select(entries.filter(entry => entry.id === '1099'), 'search:1099');
  assert.equal(result.pageIndex, 0);
  assert.equal(result.entries[0].id, '1099');
  entries = entries.slice(0, 10);
  result = feature.select(entries, 'group');
  assert.equal(result.pageCount, 1);
  assert.equal(result.entries.length, 10);
  assert.equal(feature.select([], 'empty').start, 0);
});

test('overlapping character loads share one read and failed reads can be retried', async () => {
  const context = loadFeature('character-tabs.js', 'loadCharacters', {
    Set, window: {}, document: { addEventListener() {} }
  });
  vm.runInContext(`
    globalThis.reads = 0;
    loadCharacterRegisterData = () => {
      reads++;
      return new Promise((resolve, reject) => { globalThis.finish = resolve; globalThis.fail = reject; });
    };
  `, context);
  const first = context.feature();
  const second = context.feature();
  assert.equal(first, second);
  assert.equal(context.reads, 1);
  context.fail(Error('Connection lost'));
  await assert.rejects(first, /Connection lost/);
  const retry = context.feature();
  assert.equal(context.reads, 2);
  context.finish();
  await retry;
});
