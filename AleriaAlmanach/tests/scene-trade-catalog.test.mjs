import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const entry = item => ({ id: 'merchant', title: 'Arkanist', pages: [{ tradeCatalogPage: true,
  tradeCatalog: { items: [{ id: 'named-object', title: 'Benannte Klinge', priceMin: '100', currencyCode: 'KT', ...item }] } }] });

test('explicit unique metadata survives projection with identity independent of name and price', () => {
  const first = buildModuleOffers([entry({ definitionKind: 'unique' })], STANDARD_ITEMS)[0];
  const second = buildModuleOffers([entry({ definitionKind: 'unique', title: 'Umbenannte Klinge', priceMin: '200' })], STANDARD_ITEMS)[0];
  assert.equal(first.definitionKind, 'unique');
  assert.equal(first.id, second.id);
  assert.equal(first.definitionRef.id, second.definitionRef.id);
  assert.notEqual(first.definitionRef.revision, second.definitionRef.revision);
  assert.notEqual(first.sourceRevision, second.sourceRevision);
});

test('a name alone never turns catalogue goods into a unique possession', () => {
  const product = buildModuleOffers([entry({})], STANDARD_ITEMS)[0];
  assert.equal(product.definitionKind, 'shared');
});

test('same-name distinct unique sources stay separate and missing stable unique keys are rejected', () => {
  const module = entry({ definitionKind: 'unique' });
  module.pages[0].tradeCatalog.items.push({ ...module.pages[0].tradeCatalog.items[0], id: 'other-object' });
  const products = buildModuleOffers([module], STANDARD_ITEMS);
  assert.equal(products.length, 2);
  assert.notEqual(products[0].definitionRef.id, products[1].definitionRef.id);
  assert.throws(() => buildModuleOffers([entry({ id: '', definitionKind: 'unique' })], STANDARD_ITEMS), /dauerhafte Quellkennung/);
});

test('explicit unique variant of a standard item does not inherit the shared standard definition', () => {
  const standard = STANDARD_ITEMS.find(item => item.category === 'waffen');
  const product = buildModuleOffers([entry({ canonicalKey: standard.id, definitionKind: 'unique' })], STANDARD_ITEMS)[0];
  assert.equal(product.definitionKind, 'unique');
  assert.notEqual(product.definitionRef.id, standard.definitionRef.id);
  assert.equal(product.templateId, standard.id);
  assert.throws(() => buildModuleOffers([entry({ definitionKind: 'unique', definitionRef: standard.definitionRef })], STANDARD_ITEMS), /Seriendefinition/);
});
