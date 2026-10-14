import test from 'node:test';
import assert from 'node:assert/strict';
import { indexRegisterTemplates, searchRegisterTemplates, registerTemplateFacets } from '../modules/item-register/item-register-template-search.js';
import { collectRegisterTemplates } from '../modules/item-register/item-register-templates.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const goods = [
  { id: 'standard:sword', title: 'Schwert', category: 'waffen', description: 'Gehärteter Stahl.', tags: ['Klinge'], aliases: ['Langklinge'], priceRange: { minCopper: 20, maxCopper: 20 } },
  { id: 'offer:sword', title: 'Schwert', category: 'waffen', listId: 'draig', listName: 'Draigs Schmiede', description: 'Ein rötliches Familienschwert.', details: 'Mit Ledergriff.', priceRange: { minCopper: 50, maxCopper: 50 } },
  { id: 'offer:armor', title: 'Rüstung aus Weißstahl', category: 'ruestungen', listId: 'neidr', listName: 'Neidrs Handel', description: 'Für eine kühlere Reise.', priceRange: { minCopper: 70, maxCopper: 70 } },
  { id: 'offer:potion', title: 'Heiltrank', category: 'alchemie', listId: 'neidr', listName: 'Neidrs Handel', tags: ['Heilung'], priceRange: null },
  { id: 'offer:stone', title: 'Stein', category: 'sonstiges', description: 'Schwertförmig.' }
];
const index = indexRegisterTemplates(goods);
const ids = options => searchRegisterTemplates(index, options).items.map(item => item.id);

test('multiword search matches all terms across fields regardless of order', () => {
  assert.deepEqual(ids({ search: 'Draig Schwert Leder' }), ['offer:sword']);
  assert.deepEqual(ids({ search: 'Leder Schwert Draig' }), ['offer:sword']);
  assert.deepEqual(ids({ search: 'Schwert Heilung' }), []);
  assert.deepEqual(ids({ search: 'Langklinge' }), ['standard:sword']);
});
test('German transliterations, accents and whitespace find the same register goods', () => {
  assert.deepEqual(ids({ search: '  RUESTUNG   weissstahl  ' }), ['offer:armor']);
  assert.deepEqual(ids({ search: 'Rüstung Weißstahl' }), ['offer:armor']);
  assert.deepEqual(ids({ search: 'kuehlere' }), ['offer:armor']);
});
test('exact names precede description matches and equal names retain provider identity', () => {
  const found = ids({ search: 'Schwert' });
  assert.equal(found.at(-1), 'offer:stone');
  assert.equal(found.length, 3);
  assert.ok(found.includes('offer:sword') && found.includes('standard:sword'));
});
test('category and provider filters intersect the query without mutating the catalog', () => {
  const before = JSON.stringify(goods);
  assert.deepEqual(ids({ search: 'Schwert', provider: 'draig', category: 'waffen' }), ['offer:sword']);
  assert.deepEqual(ids({ search: 'Schwert', provider: 'neidr' }), []);
  assert.deepEqual(ids({ category: 'alchemie' }), ['offer:potion']);
  assert.equal(JSON.stringify(goods), before);
});
test('price ordering uses Kupfertaler and keeps missing prices last; pagination preserves total', () => {
  assert.deepEqual(ids({ sort: 'price' }), ['standard:sword', 'offer:sword', 'offer:armor', 'offer:potion', 'offer:stone']);
  const result = searchRegisterTemplates(index, { limit: 2 });
  assert.equal(result.total, 5);
  assert.equal(result.items.length, 2);
  assert.equal(registerTemplateFacets(index).providers.find(provider => provider.id === 'neidr').count, 2);
});
test('the picker uses real register references and omits archived goods, animals and inventory instances', () => {
  const templates = collectRegisterTemplates({ standards: STANDARD_ITEMS, offers: [...goods.slice(1), { id: 'offer:old', archived: true }, { id: 'offer:horse', category: 'pferde' }, { id: 'owned:x', category: 'waffen' }] });
  assert.ok(templates.some(item => item.id === 'offer:sword'));
  assert.ok(!templates.some(item => ['offer:old', 'offer:horse', 'owned:x'].includes(item.id)));
  const result = searchRegisterTemplates(indexRegisterTemplates(templates), { search: 'Saex' });
  assert.ok(result.items.some(item => item.id === 'standard:waffen-rustungen:saex'));
});
