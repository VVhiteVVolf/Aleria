import test from 'node:test';
import assert from 'node:assert/strict';
import { createSceneTradeModuleSource, resolveSceneTradeContext } from '../modules/scene-trade/scene-trade-context.js';

const shop = id => ({ id, title: id, pages: [{ tradeCatalogPage: true }] });
const provider = id => ({ id: `module:${id}` });
test('the active exact-thread module selects its own Eleganz assortment ahead of all ancestors', () => {
  const eleganz = shop('goettliche-eleganz'), parent = shop('parent');
  const result = resolveSceneTradeContext({ threadId: 'goettliche-eleganz::session:verkauf', moduleId: 'stale-module',
    entry: eleganz, entries: [eleganz, parent], providers: [provider(parent.id), provider(eleganz.id)], ancestorModuleIds: [parent.id] });
  assert.equal(result.moduleId, eleganz.id); assert.equal(result.merchantId, provider(eleganz.id).id);
  assert.deepEqual(result.ancestry, [eleganz]); assert.equal(result.reason, 'current-module');
});
test('explicit nearest-first lineage is deterministic and ignores repeated, missing or hidden ancestors', () => {
  const scene = shop('scene'), near = shop('near'), far = shop('far');
  const result = resolveSceneTradeContext({ threadId: 'scene::session:a', entries: [scene, near, far, { id: 'hidden', hidden: true }],
    providers: [provider('far'), provider('near'), provider('hidden')], ancestorModuleIds: ['missing', 'hidden', 'scene', 'near', 'near', 'far'] });
  assert.equal(result.merchantId, 'module:near'); assert.deepEqual(result.ancestry.map(entry => entry.id), ['scene', 'near']);
});
test('nearest actual section scope wins over a broader region and unrelated tabs', () => {
  const scene = shop('scene'), near = shop('near'), far = shop('far'), other = shop('other');
  const sections = [{ tab: 'Cenyr', path: ['Gwynthor', 'Laden'], entries: [scene] },
    { tab: 'Cenyr', path: ['Gwynthor'], entries: [near] }, { tab: 'Cenyr', path: [], entries: [far] },
    { tab: 'Elsewhere', path: ['Gwynthor', 'Laden'], entries: [other] }];
  const result = resolveSceneTradeContext({ threadId: 'scene::session:a', entries: [scene, near, far, other], sections,
    providers: [provider('far'), provider('near'), provider('other')] });
  assert.equal(result.merchantId, 'module:near'); assert.equal(result.reason, 'nearest-section');
});
test('an ambiguous nearest section never guesses an alphabetical merchant or skips to a farther one', () => {
  const scene = shop('scene'), first = shop('first'), second = shop('second'), far = shop('far');
  const result = resolveSceneTradeContext({ threadId: 'scene::session:a', entries: [scene, first, second, far],
    sections: [{ tab: 'Cenyr', path: ['Town'], entries: [scene, first, second] }, { tab: 'Cenyr', path: [], entries: [far] }],
    providers: [provider('second'), provider('first'), provider('far')] });
  assert.equal(result.merchantId, ''); assert.equal(result.reason, 'ambiguous-nearest-section');
  assert.deepEqual(result.candidates, ['module:first', 'module:second']);
});
test('module snapshots are demand-read once and invalidated by their owner event only', () => {
  let reads = 0;
  const events = new EventTarget(), source = createSceneTradeModuleSource({ events, readSections: () => {
    reads++; return [{ tab: 'Cenyr', entries: [shop('here')] }];
  } });
  assert.equal(reads, 0); const first = source.load();
  assert.equal(source.load(), first); assert.equal(reads, 1);
  events.dispatchEvent(new Event('almanach:modules-changed'));
  assert.notEqual(source.load(), first); assert.equal(reads, 2); source.dispose();
});
test('empty or restricted effective sections cannot fall back to hidden global entries', () => {
  const source = createSceneTradeModuleSource({ readSections: () => [{ tab: 'Test', entries: [shop('secret')] }],
    readEntries: () => { throw Error('A visibility-filtered graph must not fall back.'); } });
  assert.deepEqual(source.load().entries, []); source.dispose();
});
